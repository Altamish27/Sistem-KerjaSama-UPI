"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  actionNeedsComment,
  canRolePerformAction,
  getActionLabel,
  getAllowedActionsForStage,
  getConfiguredActionTarget,
  getStage,
  normalizeWorkflowStage,
  ROLE_LABEL,
  type AppRole,
  type WorkflowActionType,
  type WorkflowConfig,
  type WorkflowStage,
} from "@/lib/workflow";

interface WorkflowActionPanelProps {
  proposalId: string;
  actorRole: AppRole;
  actorName: string;
  stages: WorkflowStage[];
  config?: WorkflowConfig;
  stageId?: string;
  isDKUI?: boolean;
  proposerType?: "external" | "internal";
  signatoryLevel?: "rektor" | "unit";
  currentFilePath?: string;
  currentBapPath?: string;
  onSuccess?: () => void;
}

export default function WorkflowActionPanel({
  proposalId,
  actorRole,
  actorName,
  stages,
  config,
  stageId,
  isDKUI,
  proposerType,
  signatoryLevel,
  currentFilePath,
  currentBapPath,
  onSuccess,
}: WorkflowActionPanelProps) {
  const normalizedStageId = normalizeWorkflowStage(stageId, stages);
  const [comment, setComment] = useState("");
  const [initiatorRole, setInitiatorRole] = useState<"mitra" | "fakultas">("fakultas");
  const [initiatorUnit, setInitiatorUnit] = useState("");
  const [draftProposerType, setDraftProposerType] = useState<"external" | "internal">(proposerType || "external");
  const [draftSignatoryLevel, setDraftSignatoryLevel] = useState<"rektor" | "unit">(signatoryLevel || "rektor");
  const [sendPartnerAccount, setSendPartnerAccount] = useState(false);
  const [draftFileUrl, setDraftFileUrl] = useState(currentFilePath || "");
  const [bapFileUrl, setBapFileUrl] = useState(currentBapPath || "");
  const [partnerApproved, setPartnerApproved] = useState(false);
  const [signatureHash, setSignatureHash] = useState("");
  const [signatureImagePath, setSignatureImagePath] = useState("");
  const [legalChecklist, setLegalChecklist] = useState({
    suratKuasa: false,
    legalitasMitra: false,
    redaksiNaskah: false,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const effectiveConfig: WorkflowConfig =
    config || ({
      title: "Workflow",
      stages,
      revisionReturnStageId: "draft_submission",
      terminalRejectStageIds: [],
      transitionRules: [],
      stageActionConfigs: [],
    } as WorkflowConfig);

  const allowedActions = getAllowedActionsForStage(normalizedStageId, effectiveConfig).filter((action) =>
    canRolePerformAction(actorRole, normalizedStageId, action, stages, effectiveConfig),
  );

  const showInitiatorField = isDKUI && normalizedStageId === "dkui_assign_initiator";
  const showWorkflowSwitcher = isDKUI && normalizedStageId === "dkui_verification";
  const showDraftingEditor = actorRole === "fakultas" && ["negotiation", "draft_submission"].includes(normalizedStageId);
  const showRevisionRoom = actorRole === "fakultas" && ["unit_substance_review", "legal_review", "secretary_review"].includes(normalizedStageId);
  const showPartnerSync = actorRole === "fakultas" && normalizedStageId === "draft_submission";
  const showSignatureFields = ["warek_paraf", "rector_tte", "partner_signing"].includes(normalizedStageId);
  const showLegalChecklist = actorRole === "biro_hukum" && normalizedStageId === "legal_review";

  const isWriteLockedForInitiator =
    actorRole === "fakultas" && ["unit_leader_tte", "warek_paraf", "rector_tte", "partner_signing", "archiving"].includes(normalizedStageId);

  const handleAction = async (action: WorkflowActionType) => {
    if (actionNeedsComment(normalizedStageId, action, effectiveConfig) && !comment.trim()) {
      setError("Komentar wajib diisi untuk aksi revisi atau tolak.");
      return;
    }

    if (showLegalChecklist && action === "advance") {
      const checklistDone = legalChecklist.suratKuasa && legalChecklist.legalitasMitra && legalChecklist.redaksiNaskah;
      if (!checklistDone) {
        setError("Checklist legal wajib lengkap sebelum dokumen bisa di-approve.");
        return;
      }
    }

    setIsSaving(true);
    setError(null);

    try {
      const res = await fetch(`/api/public-proposal/${proposalId}/workflow`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          comment,
          actorRole,
          actorName,
          initiatorRole: showInitiatorField ? initiatorRole : undefined,
          initiatorUnit: showInitiatorField ? initiatorUnit : undefined,
          proposerType: showWorkflowSwitcher ? draftProposerType : undefined,
          signatoryLevel: showWorkflowSwitcher ? draftSignatoryLevel : undefined,
          sendPartnerAccount:
            showWorkflowSwitcher && draftProposerType === "internal" ? sendPartnerAccount : undefined,
          draftFileUrl: (showDraftingEditor || showRevisionRoom) && draftFileUrl.trim() ? draftFileUrl.trim() : undefined,
          bapFileUrl: (showDraftingEditor || showRevisionRoom) && bapFileUrl.trim() ? bapFileUrl.trim() : undefined,
          partnerApproved: showPartnerSync ? partnerApproved : undefined,
          signatureHash: showSignatureFields && signatureHash.trim() ? signatureHash.trim() : undefined,
          signatureImagePath:
            showSignatureFields && signatureImagePath.trim() ? signatureImagePath.trim() : undefined,
        }),
      });

      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as { message?: string } | null;
        throw new Error(data?.message || "Gagal menyimpan aksi workflow.");
      }

      setComment("");
      setSignatureHash("");
      setSignatureImagePath("");
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan aksi workflow.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3 space-y-3">
      <div>
        <p className="text-xs font-semibold text-slate-700">Aksi Tahap & Komentar</p>
        <p className="text-[11px] text-slate-500 mt-0.5">
          Setiap aksi akan dicatat ke log JSON workflow untuk audit trail sementara.
        </p>
      </div>

      <Textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Tulis komentar/revisi/alasan keputusan..."
        className="min-h-20 text-xs"
      />

      {isWriteLockedForInitiator && (
        <Alert className="border-amber-200 bg-amber-50">
          <AlertDescription className="text-amber-800 text-xs">
            Write lock aktif. Inisiator tidak bisa ubah draf ketika dokumen sudah ada di meja reviewer/pimpinan.
          </AlertDescription>
        </Alert>
      )}

      {showInitiatorField && (
        <div className="grid gap-2 md:grid-cols-2">
          <div>
            <p className="text-[11px] text-slate-600 mb-1">Tentukan Inisiator</p>
            <Select value={initiatorRole} onValueChange={(value) => setInitiatorRole(value as "mitra" | "fakultas")}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue placeholder="Pilih inisiator" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fakultas">Unit Internal UPI</SelectItem>
                <SelectItem value="mitra">Mitra Eksternal</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <p className="text-[11px] text-slate-600 mb-1">Unit Inisiator</p>
            <Input
              value={initiatorUnit}
              onChange={(e) => setInitiatorUnit(e.target.value)}
              placeholder="Contoh: FPMIPA / DKUI"
              className="h-8 text-xs"
            />
          </div>
        </div>
      )}

      {showWorkflowSwitcher && (
        <div className="grid gap-2 md:grid-cols-2">
          <div>
            <p className="text-[11px] text-slate-600 mb-1">Jenis Pengusul</p>
            <Select
              value={draftProposerType}
              onValueChange={(value) => setDraftProposerType(value as "external" | "internal")}
            >
              <SelectTrigger className="h-8 text-xs">
                <SelectValue placeholder="Pilih jenis pengusul" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="external">Pengusul Eksternal</SelectItem>
                <SelectItem value="internal">Pengusul Internal</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <p className="text-[11px] text-slate-600 mb-1">Level Penandatangan</p>
            <Select
              value={draftSignatoryLevel}
              onValueChange={(value) => setDraftSignatoryLevel(value as "rektor" | "unit")}
            >
              <SelectTrigger className="h-8 text-xs">
                <SelectValue placeholder="Pilih level penandatangan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rektor">Rektor</SelectItem>
                <SelectItem value="unit">Pimpinan Unit</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {draftProposerType === "internal" && (
            <label className="md:col-span-2 inline-flex items-center gap-2 text-xs text-slate-700">
              <input
                type="checkbox"
                checked={sendPartnerAccount}
                onChange={(e) => setSendPartnerAccount(e.target.checked)}
              />
              Generate & kirim akun mitra setelah validasi DKUI
            </label>
          )}
        </div>
      )}

      {(showDraftingEditor || showRevisionRoom) && !isWriteLockedForInitiator && (
        <div className="grid gap-2 md:grid-cols-2">
          <div>
            <p className="text-[11px] text-slate-600 mb-1">
              {showRevisionRoom ? "Revision Room - URL Draft Revisi" : "Drafting Editor - URL Draft"}
            </p>
            <Input
              value={draftFileUrl}
              onChange={(e) => setDraftFileUrl(e.target.value)}
              placeholder="/uploads/proposals/draft-v2.pdf"
              className="h-8 text-xs"
            />
          </div>
          <div>
            <p className="text-[11px] text-slate-600 mb-1">URL BAP / Dokumen Pendukung</p>
            <Input
              value={bapFileUrl}
              onChange={(e) => setBapFileUrl(e.target.value)}
              placeholder="/uploads/proposals/bap-v2.pdf"
              className="h-8 text-xs"
            />
          </div>
        </div>
      )}

      {showPartnerSync && !isWriteLockedForInitiator && (
        <label className="inline-flex items-center gap-2 text-xs text-slate-700">
          <input type="checkbox" checked={partnerApproved} onChange={(e) => setPartnerApproved(e.target.checked)} />
          Partner Sync: mitra sudah setuju dengan perubahan terbaru
        </label>
      )}

      {showSignatureFields && (
        <div className="grid gap-2 md:grid-cols-2">
          <div>
            <p className="text-[11px] text-slate-600 mb-1">Digital Signature Hash</p>
            <Input
              value={signatureHash}
              onChange={(e) => setSignatureHash(e.target.value)}
              placeholder="hash tanda tangan / token TTE"
              className="h-8 text-xs"
            />
          </div>
          <div>
            <p className="text-[11px] text-slate-600 mb-1">Path Berkas TTD (opsional)</p>
            <Input
              value={signatureImagePath}
              onChange={(e) => setSignatureImagePath(e.target.value)}
              placeholder="/uploads/proposals/ttd-rektor.png"
              className="h-8 text-xs"
            />
          </div>
        </div>
      )}

      {showLegalChecklist && (
        <div className="rounded-md border border-slate-200 p-2 space-y-1.5">
          <p className="text-[11px] font-semibold text-slate-700">Legal Checklist (Biro Hukum)</p>
          <label className="inline-flex items-center gap-2 text-xs text-slate-700 w-full">
            <input
              type="checkbox"
              checked={legalChecklist.suratKuasa}
              onChange={(e) => setLegalChecklist((prev) => ({ ...prev, suratKuasa: e.target.checked }))}
            />
            Surat kuasa / dokumen otorisasi terverifikasi
          </label>
          <label className="inline-flex items-center gap-2 text-xs text-slate-700 w-full">
            <input
              type="checkbox"
              checked={legalChecklist.legalitasMitra}
              onChange={(e) => setLegalChecklist((prev) => ({ ...prev, legalitasMitra: e.target.checked }))}
            />
            Legalitas mitra sesuai ketentuan
          </label>
          <label className="inline-flex items-center gap-2 text-xs text-slate-700 w-full">
            <input
              type="checkbox"
              checked={legalChecklist.redaksiNaskah}
              onChange={(e) => setLegalChecklist((prev) => ({ ...prev, redaksiNaskah: e.target.checked }))}
            />
            Redaksi naskah hukum final
          </label>
        </div>
      )}

      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertDescription className="text-red-700 text-xs">{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-2 md:grid-cols-3">
        {allowedActions.map((action) => {
          const targetId = getConfiguredActionTarget(normalizedStageId, action, effectiveConfig);
          const targetStage = targetId ? getStage(targetId, stages) : null;
          const toneClass =
            action === "advance"
              ? "border-emerald-200 bg-emerald-50"
              : action === "request_revision"
              ? "border-amber-200 bg-amber-50"
              : "border-rose-200 bg-rose-50";
          const buttonClass =
            action === "advance"
              ? "bg-emerald-600 hover:bg-emerald-700 text-white"
              : action === "request_revision"
              ? "bg-amber-500 hover:bg-amber-600 text-white"
              : "bg-rose-600 hover:bg-rose-700 text-white";

          return (
            <div key={action} className={`rounded-md border p-2 text-xs ${toneClass}`}>
              <p className="font-semibold text-slate-900">{getActionLabel(normalizedStageId, action, effectiveConfig)}</p>
              <p className="text-slate-600 mt-1">
                Ke state: <span className="font-medium">{targetStage?.title || "Tetap di state ini"}</span>
              </p>
              <p className="text-slate-600">
                Di-handle: <span className="font-medium">{targetStage ? (targetStage.actorRole === "system" ? "System" : ROLE_LABEL[targetStage.actorRole]) : "-"}</span>
              </p>

              <Button
                size="sm"
                className={`h-9 text-xs mt-2 w-full ${buttonClass}`}
                onClick={() => void handleAction(action)}
                disabled={isSaving}
              >
                {getActionLabel(normalizedStageId, action, effectiveConfig)}
              </Button>
            </div>
          );
        })}
      </div>

      {allowedActions.length === 0 && (
        <p className="text-xs text-slate-500">Tidak ada aksi yang tersedia pada tahap ini untuk role Anda.</p>
      )}
    </div>
  );
}
