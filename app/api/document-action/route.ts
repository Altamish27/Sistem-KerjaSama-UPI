import { NextRequest, NextResponse } from "next/server";
import fs from "node:fs/promises";
import path from "node:path";

const DATA_DIR = path.join(process.cwd(), "data", "core-db");

interface ActionRequest {
  documentId: string;
  actionId: string;
  comment: string | null;
  userId: string;
  currentStageId: string;
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as ActionRequest;
    const { documentId, actionId, comment, userId, currentStageId } = body;

    if (!documentId || !actionId || !userId || !currentStageId) {
      return NextResponse.json(
        { message: "Parameter tidak lengkap" },
        { status: 400 }
      );
    }

    const dokumenPath = path.join(DATA_DIR, "dokumen_kerjasama.json");
    const reviewPath = path.join(DATA_DIR, "review_histories.json");
    const workflowPath = path.join(process.cwd(), "data", "workflow-config.json");

    const [dokumenData, reviewData, workflowData] = await Promise.all([
      fs.readFile(dokumenPath, "utf-8"),
      fs.readFile(reviewPath, "utf-8"),
      fs.readFile(workflowPath, "utf-8"),
    ]);

    const dokumenList = JSON.parse(dokumenData);
    const reviewList = JSON.parse(reviewData);
    const workflow = JSON.parse(workflowData);

    const dokumen = dokumenList.find((d: any) => d.id === documentId);
    if (!dokumen) {
      return NextResponse.json(
        { message: "Dokumen tidak ditemukan" },
        { status: 404 }
      );
    }

    const currentStage = workflow.stages.find((s: any) => s.id === currentStageId);
    if (!currentStage) {
      return NextResponse.json(
        { message: "Stage tidak ditemukan" },
        { status: 404 }
      );
    }

    let nextStageId = currentStage.nextStageId;
    let newAksi = actionId;

    if (actionId === "reject") {
      nextStageId = "rejected";
      newAksi = "reject";
    } else if (actionId === "revision") {
      nextStageId = workflow.revisionReturnStageId || currentStageId;
      newAksi = "revision";
    } else if (actionId === "approve" || actionId === "sign" || actionId === "paraf" || actionId === "proceed" || actionId === "assign" || actionId === "archive") {
      nextStageId = currentStage.nextStageId;
      newAksi = "approve";
    } else if (actionId === "comment") {
      nextStageId = currentStageId;
      newAksi = "comment";
    } else if (actionId === "submit") {
      nextStageId = currentStage.nextStageId;
      newAksi = "submit";
    }

    const nextStage = workflow.stages.find((s: any) => s.id === nextStageId);
    if (!nextStage) {
      return NextResponse.json(
        { message: "Stage berikutnya tidak ditemukan" },
        { status: 404 }
      );
    }

    const newReviewHistory = {
      id: `wf-${Date.now()}`,
      dokumen_id: documentId,
      reviewer_id: userId,
      from_stage: currentStageId,
      to_stage: nextStageId,
      aksi: newAksi,
      catatan: comment,
      versi_dokumen: dokumen.versi_dokumen || 1,
      created_at: new Date().toISOString(),
    };

    reviewList.push(newReviewHistory);

    if (actionId !== "comment") {
      dokumen.current_stage_id = nextStageId;
      dokumen.current_stage_actor_role = nextStage.actorRole;
      
      const stageActorLabels: Record<string, string> = {
        mitra: "Mitra Eksternal",
        dkui: "DKUI",
        fakultas: "Unit/Fakultas",
        biro_hukum: "Biro Hukum",
        sekretaris_univ: "Sekretaris Universitas",
        warek: "Wakil Rektor",
        rektor: "Rektor",
        admin: "Admin",
        system: "System",
      };

      dokumen.current_stage_actor_label = stageActorLabels[nextStage.actorRole] || nextStage.actorRole;
    }

    await Promise.all([
      fs.writeFile(dokumenPath, JSON.stringify(dokumenList, null, 2)),
      fs.writeFile(reviewPath, JSON.stringify(reviewList, null, 2)),
    ]);

    return NextResponse.json({
      success: true,
      message: getSuccessMessage(actionId),
      newStage: nextStageId,
    });
  } catch (error) {
    console.error("Error handling document action:", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}

function getSuccessMessage(actionId: string): string {
  const messages: Record<string, string> = {
    approve: "Dokumen berhasil disetujui dan diteruskan ke tahap berikutnya",
    reject: "Dokumen berhasil ditolak",
    revision: "Permintaan revisi berhasil dikirim",
    comment: "Komentar berhasil ditambahkan",
    submit: "Dokumen berhasil diajukan",
    sign: "Dokumen berhasil ditandatangani",
    paraf: "Dokumen berhasil diparaf",
    assign: "Penetapan berhasil dilakukan",
    proceed: "Proses berhasil dilanjutkan",
    archive: "Dokumen berhasil diarsipkan",
  };

  return messages[actionId] || "Aksi berhasil dilakukan";
}
