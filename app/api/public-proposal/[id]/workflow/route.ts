import { NextResponse } from "next/server";
import {
  actionNeedsComment,
  canRolePerformAction,
  getStage,
  normalizeWorkflowStage,
  ROLE_LABEL,
  resolveTransition,
  statusFromStage,
  type AppRole,
  type WorkflowActionType,
} from "@/lib/workflow";
import { readWorkflowConfig } from "@/lib/workflow-config-server";
import {
  dbRoleToJabatan,
  findDocumentByProposalIdOrDocumentId,
  mapDbUserToSessionUser,
  readCoreDb,
  toWorkflowHistoryAction,
  writeCoreDb,
} from "@/lib/core-db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const db = await readCoreDb();
    const document = findDocumentByProposalIdOrDocumentId(db, id);
    if (!document) {
      return NextResponse.json([], { status: 200 });
    }

    const filtered = db.review_histories
      .filter((item) => item.dokumen_id === document.id)
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

    const userMap = new Map(db.users.map((u) => [u.id, mapDbUserToSessionUser(u)]));
    const mapped = filtered.map((item) => {
      const reviewer = item.reviewer_id ? userMap.get(item.reviewer_id) : null;
      return {
        id: item.id,
        proposalId: document.id,
        action: item.aksi === "approve" ? "advance" : item.aksi === "revise" ? "request_revision" : "reject",
        version: item.versi_dokumen,
        fromStage: item.from_stage,
        toStage: item.to_stage,
        actorRole: reviewer?.role || "dkui",
        actorName: reviewer?.name || "Pengguna Sistem",
        comment: item.catatan || undefined,
        at: item.created_at,
      };
    });

    return NextResponse.json(mapped, { status: 200 });
  } catch (error) {
    console.error("Failed to list workflow logs", error);
    return NextResponse.json({ message: "Gagal memuat log workflow" }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const body = (await request.json()) as {
      action?: WorkflowActionType;
      comment?: string;
      actorRole?: AppRole;
      actorName?: string;
      initiatorRole?: "mitra" | "fakultas";
      initiatorUnit?: string;
      proposerType?: "external" | "internal";
      signatoryLevel?: "rektor" | "unit";
      sendPartnerAccount?: boolean;
      draftFileUrl?: string;
      bapFileUrl?: string;
      partnerApproved?: boolean;
      signatureHash?: string;
      signatureImagePath?: string;
    };

    const action = body.action;
    const actorRole = body.actorRole;
    const actorName = (body.actorName || "Pengguna Sistem").trim();

    if (!action || !actorRole) {
      return NextResponse.json({ message: "Action dan role wajib diisi" }, { status: 400 });
    }

    const db = await readCoreDb();
    const document = findDocumentByProposalIdOrDocumentId(db, id);

    if (!document) {
      return NextResponse.json({ message: "Pengajuan tidak ditemukan" }, { status: 404 });
    }

    const proposal = document;
    const config = await readWorkflowConfig();
    const fromStage = normalizeWorkflowStage(proposal.current_stage_id, config.stages);

    if (!canRolePerformAction(actorRole, fromStage, action, config.stages, config)) {
      return NextResponse.json(
        { message: `Aksi ${action} tidak diizinkan pada tahap ${getStage(fromStage, config.stages).title}` },
        { status: 403 },
      );
    }

    if (actionNeedsComment(fromStage, action, config) && !body.comment?.trim()) {
      return NextResponse.json(
        { message: "Komentar wajib diisi untuk aksi revisi atau tolak." },
        { status: 400 },
      );
    }

    if (fromStage === "dkui_assign_initiator" && action === "advance" && !body.initiatorUnit?.trim()) {
      return NextResponse.json(
        { message: "Unit inisiator wajib diisi sebelum lanjut dari tahap penetapan inisiator." },
        { status: 400 },
      );
    }

    if (fromStage === "dkui_verification" && action === "advance" && (!body.proposerType || !body.signatoryLevel)) {
      return NextResponse.json(
        { message: "Jenis pengusul dan level penandatangan wajib dipilih pada verifikasi DKUI." },
        { status: 400 },
      );
    }

    if ((fromStage === "warek_paraf" || fromStage === "rector_tte" || fromStage === "partner_signing") && action === "advance") {
      if (!body.signatureHash?.trim()) {
        return NextResponse.json(
          { message: "Tanda tangan digital wajib diisi untuk melanjutkan tahap penandatanganan/paraf." },
          { status: 400 },
        );
      }
    }

    const workflowContext = {
      proposerType: body.proposerType ?? proposal.proposer_type,
      signatoryLevel: body.signatoryLevel ?? proposal.level_penandatangan,
    };

    const isMitraSubstanceApproval = actorRole === "mitra" && fromStage === "draft_submission" && action === "advance";

    const toStage = isMitraSubstanceApproval ? fromStage : resolveTransition(fromStage, action, config, workflowContext);
    const toStageMeta = getStage(toStage, config.stages);

    proposal.current_stage_id = toStage;
    proposal.current_stage_actor_role = toStageMeta.actorRole;
    proposal.current_stage_actor_label =
      toStageMeta.actorRole === "system" ? "System" : ROLE_LABEL[toStageMeta.actorRole];
    proposal.proposer_type = body.proposerType ?? proposal.proposer_type;
    proposal.level_penandatangan = body.signatoryLevel ?? proposal.level_penandatangan;
    proposal.partner_account_sent_at = body.sendPartnerAccount
      ? new Date().toISOString()
      : proposal.partner_account_sent_at;
    if (body.initiatorUnit) {
      proposal.unit_id = body.initiatorUnit;
    }
    if (body.draftFileUrl?.trim()) {
      proposal.file_url = body.draftFileUrl.trim();
    }
    if (body.bapFileUrl?.trim()) {
      proposal.file_bap_url = body.bapFileUrl.trim();
    }
    if (body.partnerApproved) {
      proposal.partner_account_sent_at = new Date().toISOString();
    }

    const pengajuan = db.pengajuan_kerjasama.find((p) => p.id === proposal.pengajuan_id);
    if (pengajuan) {
      pengajuan.status_pengajuan = toStage === "rejected" ? "rejected" : "approved";
    }

    const reviewer = db.users.find((u) => mapDbUserToSessionUser(u).role === actorRole);
    const version =
      db.review_histories
        .filter((h) => h.dokumen_id === proposal.id)
        .reduce((max, h) => Math.max(max, h.versi_dokumen), 0) + 1;

    const logEntry = {
      id: `wf-${Date.now()}`,
      dokumen_id: proposal.id,
      reviewer_id: reviewer?.id || null,
      from_stage: fromStage,
      to_stage: toStage,
      aksi: toWorkflowHistoryAction(action),
      catatan: body.comment?.trim() || null,
      versi_dokumen: version,
      created_at: new Date().toISOString(),
    };

    if (body.signatureHash?.trim()) {
      const profileId = `sp-${reviewer?.id || "system"}`;
      const existingProfileIndex = db.signature_profiles.findIndex((item) => item.user_id === (reviewer?.id || "system"));

      const nextProfile = {
        id: existingProfileIndex >= 0 ? db.signature_profiles[existingProfileIndex].id : profileId,
        user_id: reviewer?.id || "system",
        nama: reviewer?.nama || actorName,
        jabatan: reviewer ? dbRoleToJabatan(reviewer.role) : "Sistem",
        provider: "internal_upload" as const,
        signature_hash: body.signatureHash.trim(),
        image_path: body.signatureImagePath?.trim() || null,
        is_active: true,
        updated_at: new Date().toISOString(),
      };

      if (existingProfileIndex >= 0) {
        db.signature_profiles[existingProfileIndex] = nextProfile;
      } else {
        db.signature_profiles.push(nextProfile);
      }

      const signatureEntry = {
        id: `sl-${Date.now()}`,
        dokumen_id: proposal.id,
        user_id: reviewer?.id || "system",
        stage_id: fromStage,
        is_paraf: fromStage === "warek_paraf",
        signature_profile_id: nextProfile.id,
        signature_hash_snapshot: body.signatureHash.trim(),
        image_path_snapshot: body.signatureImagePath?.trim() || null,
        provider_snapshot: "internal_upload" as const,
        signed_at: new Date().toISOString(),
      };
      db.signature_logs.push(signatureEntry);
    }

    db.review_histories.push(logEntry);
    await writeCoreDb(db);

    return NextResponse.json(
      {
        success: true,
        proposal: {
          id: proposal.id,
          workflowStage: proposal.current_stage_id,
          status: statusFromStage(proposal.current_stage_id),
        },
        log: {
          id: logEntry.id,
          proposalId: proposal.id,
          action,
          fromStage,
          toStage,
          actorRole,
          actorName,
          comment: logEntry.catatan || undefined,
          at: logEntry.created_at,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Failed to update workflow", error);
    return NextResponse.json({ message: "Gagal memproses aksi workflow" }, { status: 500 });
  }
}
