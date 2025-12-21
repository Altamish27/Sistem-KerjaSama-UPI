import type { ProposalStatus, UserRole, InitiatorType } from "./mock-data"

// Workflow untuk Kondisi 1: Pengajuan oleh MITRA (External)
export const MITRA_INITIATED_WORKFLOW: Record<ProposalStatus, { nextStatus: ProposalStatus; approver: UserRole[] }> = {
  draft: { nextStatus: "submitted", approver: ["mitra"] },
  submitted: { nextStatus: "dkui_summarized", approver: ["dkui"] }, // DKUI terima & ringkas
  dkui_summarized: { nextStatus: "verification_pending", approver: ["dkui"] }, // DKUI salurkan ke Fakultas
  verification_pending: { nextStatus: "verification_approved", approver: ["fakultas"] }, // Fakultas verifikasi
  verification_approved: { nextStatus: "legal_draft", approver: ["dkui"] }, // DKUI susun dokumen
  verification_rejected: { nextStatus: "rejected", approver: [] }, // Ditolak fakultas
  legal_draft: { nextStatus: "legal_review", approver: ["dkui"] }, // DKUI legal drafter
  legal_review: { nextStatus: "biro_hukum_review", approver: ["dkui"] }, // Paraf Kepala Divisi DKUI, kirim ke Biro Hukum
  biro_hukum_review: { nextStatus: "biro_hukum_approved", approver: ["biro_hukum"] }, // Biro Hukum validasi
  biro_hukum_approved: { nextStatus: "mitra_signing", approver: ["dkui"] }, // DKUI kirim ke MITRA dan Supervisi (paralel)
  biro_hukum_rejected: { nextStatus: "legal_draft", approver: ["dkui"] }, // Kembali ke DKUI
  mitra_signing: { nextStatus: "warek_review", approver: ["mitra"] }, // MITRA tanda tangan & materai
  warek_review: { nextStatus: "warek_approved", approver: ["wakil_rektor"] }, // Wakil Rektor review (paralel dengan MITRA)
  warek_approved: { nextStatus: "rektor_review", approver: ["wakil_rektor"] }, // Wakil Rektor digital sign, kirim ke Rektor
  warek_rejected: { nextStatus: "legal_draft", approver: [] }, // Dikembalikan ke DKUI
  rektor_review: { nextStatus: "rektor_approved", approver: ["rektor"] }, // Rektor review
  rektor_approved: { nextStatus: "document_exchange", approver: ["rektor"] }, // Rektor digital sign & materai
  rektor_rejected: { nextStatus: "legal_draft", approver: [] }, // Dikembalikan ke DKUI
  document_exchange: { nextStatus: "completed", approver: ["dkui"] }, // DKUI terima dari MITRA & Rektor, lakukan pertukaran
  completed: { nextStatus: "completed", approver: [] }, // Arsip selesai
  rejected: { nextStatus: "rejected", approver: [] },
}

// Workflow untuk Kondisi 2: Pengajuan oleh Fakultas (Internal)
export const FAKULTAS_INITIATED_WORKFLOW: Record<ProposalStatus, { nextStatus: ProposalStatus; approver: UserRole[] }> =
  {
    draft: { nextStatus: "submitted", approver: ["fakultas"] },
    submitted: { nextStatus: "dkui_summarized", approver: ["dkui"] }, // DKUI terima & ringkas
    dkui_summarized: { nextStatus: "verification_pending", approver: ["dkui"] }, // DKUI kirim ke MITRA
    verification_pending: { nextStatus: "verification_approved", approver: ["mitra"] }, // MITRA review proposal
    verification_approved: { nextStatus: "legal_draft", approver: ["dkui"] }, // DKUI susun dokumen
    verification_rejected: { nextStatus: "rejected", approver: [] }, // Ditolak MITRA
    legal_draft: { nextStatus: "legal_review", approver: ["dkui"] }, // DKUI legal drafter
    legal_review: { nextStatus: "biro_hukum_review", approver: ["dkui"] }, // Paraf Kepala Divisi DKUI, kirim ke Biro Hukum
    biro_hukum_review: { nextStatus: "biro_hukum_approved", approver: ["biro_hukum"] }, // Biro Hukum validasi
    biro_hukum_approved: { nextStatus: "mitra_signing", approver: ["dkui"] }, // DKUI kirim ke MITRA dan Supervisi (paralel)
    biro_hukum_rejected: { nextStatus: "legal_draft", approver: ["dkui"] }, // Kembali ke DKUI
    mitra_signing: { nextStatus: "warek_review", approver: ["mitra"] }, // MITRA review dokumen & tanda tangan
    warek_review: { nextStatus: "warek_approved", approver: ["wakil_rektor"] }, // Wakil Rektor review (paralel dengan MITRA)
    warek_approved: { nextStatus: "rektor_review", approver: ["wakil_rektor"] }, // Wakil Rektor digital sign, kirim ke Rektor
    warek_rejected: { nextStatus: "legal_draft", approver: [] }, // Dikembalikan ke DKUI
    rektor_review: { nextStatus: "rektor_approved", approver: ["rektor"] }, // Rektor review
    rektor_approved: { nextStatus: "document_exchange", approver: ["rektor"] }, // Rektor digital sign & materai
    rektor_rejected: { nextStatus: "legal_draft", approver: [] }, // Dikembalikan ke DKUI
    document_exchange: { nextStatus: "completed", approver: ["dkui"] }, // DKUI melakukan pertukaran dokumen final
    completed: { nextStatus: "completed", approver: [] }, // Arsip selesai
    rejected: { nextStatus: "rejected", approver: [] },
  }

export function canUserApprove(proposalStatus: ProposalStatus, userRole: UserRole, initiator: InitiatorType): boolean {
  const workflow = initiator === "mitra" ? MITRA_INITIATED_WORKFLOW : FAKULTAS_INITIATED_WORKFLOW
  return workflow[proposalStatus].approver.includes(userRole)
}

export function getNextStatus(currentStatus: ProposalStatus, initiator: InitiatorType): ProposalStatus {
  const workflow = initiator === "mitra" ? MITRA_INITIATED_WORKFLOW : FAKULTAS_INITIATED_WORKFLOW
  return workflow[currentStatus].nextStatus
}

// Workflow steps untuk visualisasi yang lebih detail sesuai BPMN
export function getWorkflowSteps(initiator: InitiatorType) {
  if (initiator === "mitra") {
    return [
      { status: "submitted", label: "Diajukan MITRA", role: "mitra", description: "MITRA mengajukan proposal" },
      { status: "dkui_summarized", label: "Diringkas DKUI", role: "dkui", description: "DKUI meringkas dengan LLM" },
      {
        status: "verification_approved",
        label: "Verifikasi Fakultas",
        role: "fakultas",
        description: "Fakultas memverifikasi substansi",
      },
      {
        status: "legal_review",
        label: "Legal Drafter DKUI",
        role: "dkui",
        description: "DKUI menyusun & paraf dokumen legal",
      },
      {
        status: "biro_hukum_approved",
        label: "Validasi Biro Hukum",
        role: "biro_hukum",
        description: "Biro Hukum validasi & paraf",
      },
      {
        status: "mitra_signing",
        label: "Penandatanganan MITRA",
        role: "mitra",
        description: "MITRA tanda tangan & materai",
      },
      {
        status: "warek_approved",
        label: "Persetujuan Wakil Rektor",
        role: "wakil_rektor",
        description: "Wakil Rektor review & digital sign",
      },
      {
        status: "rektor_approved",
        label: "Persetujuan Rektor",
        role: "rektor",
        description: "Rektor review, digital sign & materai",
      },
      {
        status: "document_exchange",
        label: "Pertukaran Dokumen",
        role: "dkui",
        description: "DKUI melakukan pertukaran dokumen final",
      },
      { status: "completed", label: "Selesai & Arsip", role: "dkui", description: "Dokumen diarsipkan" },
    ]
  } else {
    return [
      {
        status: "submitted",
        label: "Diajukan Fakultas",
        role: "fakultas",
        description: "Fakultas mengajukan proposal",
      },
      { status: "dkui_summarized", label: "Diringkas DKUI", role: "dkui", description: "DKUI meringkas dengan LLM" },
      {
        status: "verification_approved",
        label: "Verifikasi MITRA",
        role: "mitra",
        description: "MITRA memverifikasi proposal",
      },
      {
        status: "legal_review",
        label: "Legal Drafter DKUI",
        role: "dkui",
        description: "DKUI menyusun & paraf dokumen legal",
      },
      {
        status: "biro_hukum_approved",
        label: "Validasi Biro Hukum",
        role: "biro_hukum",
        description: "Biro Hukum validasi & paraf",
      },
      {
        status: "mitra_signing",
        label: "Penandatanganan MITRA",
        role: "mitra",
        description: "MITRA review dokumen & tanda tangan",
      },
      {
        status: "warek_approved",
        label: "Persetujuan Wakil Rektor",
        role: "wakil_rektor",
        description: "Wakil Rektor review & digital sign",
      },
      {
        status: "rektor_approved",
        label: "Persetujuan Rektor",
        role: "rektor",
        description: "Rektor review, digital sign & materai",
      },
      {
        status: "document_exchange",
        label: "Pertukaran Dokumen",
        role: "dkui",
        description: "DKUI melakukan pertukaran dokumen final",
      },
      { status: "completed", label: "Selesai & Arsip", role: "dkui", description: "Dokumen diarsipkan" },
    ]
  }
}

export function getCurrentStepIndex(status: ProposalStatus, initiator: InitiatorType): number {
  const steps = getWorkflowSteps(initiator)
  const index = steps.findIndex((step) => step.status === status)
  return index >= 0 ? index : 0
}
