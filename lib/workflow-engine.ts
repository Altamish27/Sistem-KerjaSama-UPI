// Workflow Engine untuk e-Contract System
// Mengikuti spesifikasi BPMN dengan aturan: setiap aktivitas hanya dilakukan oleh aktor sesuai lane

import type { ProposalStatus, UserRole } from "./mock-data"

// Definisi siapa yang bisa melakukan aksi pada setiap status
export interface WorkflowAction {
  status: ProposalStatus
  allowedRoles: UserRole[]
  actions: {
    label: string
    nextStatus: ProposalStatus
    actionType: "approve" | "reject" | "process" | "gateway"
    requiresComment?: boolean
  }[]
}

// Mapping workflow actions berdasarkan status
export const WORKFLOW_ACTIONS: Record<ProposalStatus, WorkflowAction> = {
  // === MITRA ===
  draft: {
    status: "draft",
    allowedRoles: ["mitra"],
    actions: [
      {
        label: "Ajukan Proposal",
        nextStatus: "submitted",
        actionType: "process",
        requiresComment: false,
      },
    ],
  },
  submitted: {
    status: "submitted",
    allowedRoles: ["dkui"],
    actions: [
      {
        label: "Terima Proposal",
        nextStatus: "dkui_received",
        actionType: "process",
        requiresComment: false,
      },
    ],
  },

  // === DKUI FLOW ===
  dkui_received: {
    status: "dkui_received",
    allowedRoles: ["dkui"],
    actions: [
      {
        label: "Lanjut ke Ringkasan AI",
        nextStatus: "dkui_need_summary",
        actionType: "process",
        requiresComment: false,
      },
    ],
  },
  dkui_need_summary: {
    status: "dkui_need_summary",
    allowedRoles: ["dkui"],
    actions: [
      {
        label: "Jalankan Ringkasan AI (Manual)",
        nextStatus: "dkui_summarized",
        actionType: "process",
        requiresComment: false,
      },
    ],
  },
  dkui_summarized: {
    status: "dkui_summarized",
    allowedRoles: ["dkui"],
    actions: [
      {
        label: "Pilih & Kirim ke Fakultas/Unit",
        nextStatus: "dkui_sent_to_faculty",
        actionType: "process",
        requiresComment: true, // komentar = fakultas yang dipilih
      },
    ],
  },
  dkui_selecting_faculty: {
    status: "dkui_selecting_faculty",
    allowedRoles: ["dkui"],
    actions: [
      {
        label: "Kirim ke Fakultas/Unit",
        nextStatus: "dkui_sent_to_faculty",
        actionType: "process",
        requiresComment: true,
      },
    ],
  },
  dkui_sent_to_faculty: {
    status: "dkui_sent_to_faculty",
    allowedRoles: ["fakultas"],
    actions: [
      {
        label: "Mulai Verifikasi Substansi",
        nextStatus: "faculty_reviewing",
        actionType: "process",
        requiresComment: false,
      },
    ],
  },

  // === FAKULTAS/UNIT FLOW ===
  faculty_reviewing: {
    status: "faculty_reviewing",
    allowedRoles: ["fakultas"],
    actions: [
      {
        label: "✅ Substansi Disetujui",
        nextStatus: "faculty_substansi_approved",
        actionType: "gateway",
        requiresComment: true,
      },
      {
        label: "❌ Substansi Ditolak",
        nextStatus: "faculty_substansi_rejected",
        actionType: "gateway",
        requiresComment: true,
      },
    ],
  },
  faculty_substansi_approved: {
    status: "faculty_substansi_approved",
    allowedRoles: ["dkui"],
    actions: [
      {
        label: "Mulai Review Hukum Tahap 1",
        nextStatus: "dkui_legal_review_1",
        actionType: "process",
        requiresComment: false,
      },
    ],
  },
  faculty_substansi_rejected: {
    status: "faculty_substansi_rejected",
    allowedRoles: ["dkui"],
    actions: [
      {
        label: "Evaluasi Feedback Penolakan",
        nextStatus: "dkui_evaluating_feedback",
        actionType: "process",
        requiresComment: false,
      },
    ],
  },

  // === DKUI EVALUASI & REVISI ===
  dkui_evaluating_feedback: {
    status: "dkui_evaluating_feedback",
    allowedRoles: ["dkui"],
    actions: [
      {
        label: "Revisi oleh Mitra",
        nextStatus: "dkui_requesting_mitra_revision",
        actionType: "gateway",
        requiresComment: true,
      },
      {
        label: "Revisi oleh DKUI",
        nextStatus: "dkui_self_revising",
        actionType: "gateway",
        requiresComment: true,
      },
    ],
  },
  dkui_deciding_revision: {
    status: "dkui_deciding_revision",
    allowedRoles: ["dkui"],
    actions: [
      {
        label: "Revisi oleh Mitra",
        nextStatus: "dkui_requesting_mitra_revision",
        actionType: "gateway",
        requiresComment: true,
      },
      {
        label: "Revisi oleh DKUI",
        nextStatus: "dkui_self_revising",
        actionType: "gateway",
        requiresComment: true,
      },
    ],
  },
  dkui_requesting_mitra_revision: {
    status: "dkui_requesting_mitra_revision",
    allowedRoles: ["mitra"],
    actions: [
      {
        label: "Upload Dokumen Revisi",
        nextStatus: "mitra_resubmitted",
        actionType: "process",
        requiresComment: true,
      },
    ],
  },
  mitra_revising: {
    status: "mitra_revising",
    allowedRoles: ["mitra"],
    actions: [
      {
        label: "Upload Dokumen Revisi",
        nextStatus: "mitra_resubmitted",
        actionType: "process",
        requiresComment: true,
      },
    ],
  },
  mitra_resubmitted: {
    status: "mitra_resubmitted",
    allowedRoles: ["dkui"],
    actions: [
      {
        label: "Ringkas Ulang & Kirim ke Fakultas",
        nextStatus: "dkui_sent_to_faculty",
        actionType: "process",
        requiresComment: false,
      },
    ],
  },
  dkui_self_revising: {
    status: "dkui_self_revising",
    allowedRoles: ["dkui"],
    actions: [
      {
        label: "Selesai Revisi, Kirim ke Fakultas",
        nextStatus: "dkui_revision_completed",
        actionType: "process",
        requiresComment: true,
      },
    ],
  },
  dkui_revision_completed: {
    status: "dkui_revision_completed",
    allowedRoles: ["dkui"],
    actions: [
      {
        label: "Kirim Ulang ke Fakultas",
        nextStatus: "dkui_sent_to_faculty",
        actionType: "process",
        requiresComment: false,
      },
    ],
  },

  // === DKUI LEGAL REVIEW TAHAP 1 ===
  dkui_legal_review_1: {
    status: "dkui_legal_review_1",
    allowedRoles: ["dkui"],
    actions: [
      {
        label: "✅ Approve Legal Tahap 1, Kirim ke Biro Hukum",
        nextStatus: "dkui_legal_approved_1",
        actionType: "approve",
        requiresComment: true,
      },
      {
        label: "❌ Butuh Revisi",
        nextStatus: "dkui_evaluating_feedback",
        actionType: "reject",
        requiresComment: true,
      },
    ],
  },
  dkui_legal_approved_1: {
    status: "dkui_legal_approved_1",
    allowedRoles: ["biro_hukum"],
    actions: [
      {
        label: "Mulai Review Biro Hukum",
        nextStatus: "biro_hukum_reviewing",
        actionType: "process",
        requiresComment: false,
      },
    ],
  },

  // === BIRO HUKUM FLOW ===
  biro_hukum_reviewing: {
    status: "biro_hukum_reviewing",
    allowedRoles: ["biro_hukum"],
    actions: [
      {
        label: "✅ Legalitas Disetujui",
        nextStatus: "biro_hukum_legalitas_approved",
        actionType: "gateway",
        requiresComment: true,
      },
      {
        label: "❌ Legalitas Ditolak",
        nextStatus: "biro_hukum_legalitas_rejected",
        actionType: "gateway",
        requiresComment: true,
      },
    ],
  },
  biro_hukum_legalitas_approved: {
    status: "biro_hukum_legalitas_approved",
    allowedRoles: ["biro_hukum"],
    actions: [
      {
        label: "Paraf Biro Hukum",
        nextStatus: "biro_hukum_paraf",
        actionType: "process",
        requiresComment: false,
      },
    ],
  },
  biro_hukum_legalitas_rejected: {
    status: "biro_hukum_legalitas_rejected",
    allowedRoles: ["dkui"],
    actions: [
      {
        label: "Evaluasi Feedback dari Biro Hukum",
        nextStatus: "dkui_evaluating_feedback",
        actionType: "process",
        requiresComment: false,
      },
    ],
  },

  // === ALUR PARAF ===
  biro_hukum_paraf: {
    status: "biro_hukum_paraf",
    allowedRoles: ["dkui"],
    actions: [
      {
        label: "Paraf DKUI",
        nextStatus: "dkui_paraf",
        actionType: "process",
        requiresComment: false,
      },
    ],
  },
  dkui_paraf: {
    status: "dkui_paraf",
    allowedRoles: ["fakultas"],
    actions: [
      {
        label: "Approval Akhir Fakultas",
        nextStatus: "faculty_final_approval",
        actionType: "process",
        requiresComment: true,
      },
    ],
  },
  faculty_final_approval: {
    status: "faculty_final_approval",
    allowedRoles: ["dkui"],
    actions: [
      {
        label: "Mulai Proses Tanda Tangan (Parallel)",
        nextStatus: "parallel_signing_started",
        actionType: "process",
        requiresComment: false,
      },
    ],
  },

  // === PARALLEL GATEWAY: TANDA TANGAN ===
  parallel_signing_started: {
    status: "parallel_signing_started",
    allowedRoles: ["mitra", "wakil_rektor"],
    actions: [
      {
        label: "Mitra: Siap Tanda Tangan",
        nextStatus: "mitra_ready_to_sign",
        actionType: "process",
        requiresComment: false,
      },
      {
        label: "Warek: Mulai Review",
        nextStatus: "warek_reviewing",
        actionType: "process",
        requiresComment: false,
      },
    ],
  },

  // Jalur Mitra
  mitra_ready_to_sign: {
    status: "mitra_ready_to_sign",
    allowedRoles: ["mitra"],
    actions: [
      {
        label: "Bubuh Materai",
        nextStatus: "mitra_stamped",
        actionType: "process",
        requiresComment: false,
      },
    ],
  },
  mitra_stamped: {
    status: "mitra_stamped",
    allowedRoles: ["mitra"],
    actions: [
      {
        label: "Tanda Tangan Elektronik",
        nextStatus: "mitra_signed",
        actionType: "process",
        requiresComment: false,
      },
    ],
  },
  mitra_signed: {
    status: "mitra_signed",
    allowedRoles: ["dkui"],
    actions: [
      {
        label: "Tunggu Rektor Selesai",
        nextStatus: "document_exchange",
        actionType: "process",
        requiresComment: false,
      },
    ],
  },

  // Jalur Warek & Rektor
  warek_reviewing: {
    status: "warek_reviewing",
    allowedRoles: ["wakil_rektor"],
    actions: [
      {
        label: "✅ Approve & Bubuh Materai",
        nextStatus: "warek_stamped",
        actionType: "approve",
        requiresComment: true,
      },
      {
        label: "❌ Tolak",
        nextStatus: "warek_rejected",
        actionType: "reject",
        requiresComment: true,
      },
    ],
  },
  warek_stamped: {
    status: "warek_stamped",
    allowedRoles: ["wakil_rektor"],
    actions: [
      {
        label: "Tanda Tangan Elektronik",
        nextStatus: "warek_signed",
        actionType: "process",
        requiresComment: false,
      },
    ],
  },
  warek_signed: {
    status: "warek_signed",
    allowedRoles: ["rektor"],
    actions: [
      {
        label: "Rektor: Mulai Review",
        nextStatus: "rektor_reviewing",
        actionType: "process",
        requiresComment: false,
      },
    ],
  },
  warek_rejected: {
    status: "warek_rejected",
    allowedRoles: ["dkui"],
    actions: [
      {
        label: "Evaluasi Feedback dari Warek",
        nextStatus: "dkui_evaluating_feedback",
        actionType: "process",
        requiresComment: false,
      },
    ],
  },

  rektor_reviewing: {
    status: "rektor_reviewing",
    allowedRoles: ["rektor"],
    actions: [
      {
        label: "✅ Approve & Bubuh Materai",
        nextStatus: "rektor_stamped",
        actionType: "approve",
        requiresComment: true,
      },
      {
        label: "❌ Tolak",
        nextStatus: "rektor_rejected",
        actionType: "reject",
        requiresComment: true,
      },
    ],
  },
  rektor_stamped: {
    status: "rektor_stamped",
    allowedRoles: ["rektor"],
    actions: [
      {
        label: "Tanda Tangan Elektronik",
        nextStatus: "rektor_signed",
        actionType: "process",
        requiresComment: false,
      },
    ],
  },
  rektor_signed: {
    status: "rektor_signed",
    allowedRoles: ["dkui"],
    actions: [
      {
        label: "Pertukaran Dokumen Final",
        nextStatus: "document_exchange",
        actionType: "process",
        requiresComment: false,
      },
    ],
  },
  rektor_rejected: {
    status: "rektor_rejected",
    allowedRoles: ["dkui"],
    actions: [
      {
        label: "Evaluasi Feedback dari Rektor",
        nextStatus: "dkui_evaluating_feedback",
        actionType: "process",
        requiresComment: false,
      },
    ],
  },

  // === FINALISASI ===
  document_exchange: {
    status: "document_exchange",
    allowedRoles: ["dkui"],
    actions: [
      {
        label: "Arsipkan Dokumen",
        nextStatus: "archived",
        actionType: "process",
        requiresComment: false,
      },
    ],
  },
  archived: {
    status: "archived",
    allowedRoles: ["dkui"],
    actions: [
      {
        label: "Tandai Selesai",
        nextStatus: "completed",
        actionType: "process",
        requiresComment: false,
      },
    ],
  },
  completed: {
    status: "completed",
    allowedRoles: [],
    actions: [],
  },
  rejected: {
    status: "rejected",
    allowedRoles: [],
    actions: [],
  },
}

// Helper: Cek apakah user bisa melakukan aksi pada status tertentu
export function canUserTakeAction(status: ProposalStatus, userRole: UserRole): boolean {
  const workflowAction = WORKFLOW_ACTIONS[status]
  if (!workflowAction) return false
  return workflowAction.allowedRoles.includes(userRole)
}

// Helper: Get available actions untuk user pada status tertentu
export function getAvailableActions(status: ProposalStatus, userRole: UserRole) {
  if (!canUserTakeAction(status, userRole)) return []
  return WORKFLOW_ACTIONS[status]?.actions || []
}

// Helper: Get next status setelah action
export function getNextStatus(currentStatus: ProposalStatus, actionLabel: string): ProposalStatus {
  const actions = WORKFLOW_ACTIONS[currentStatus]?.actions || []
  const action = actions.find((a) => a.label === actionLabel)
  return action?.nextStatus || currentStatus
}

// Simulasi AI Summary Generation
export function generateAISummary(proposalDescription: string, objectives: string, benefits: string): string {
  // Simulasi AI - dalam production akan call ke LLM API
  return `[AI Summary] Proposal ini mengusulkan: ${proposalDescription.substring(0, 100)}... Tujuan: ${objectives.substring(0, 80)}... Manfaat: ${benefits.substring(0, 80)}...`
}

// Helper untuk mendapatkan status warna badge
export function getStatusBadgeColor(status: ProposalStatus): string {
  if (status === "draft") return "bg-slate-100 text-slate-700 border-slate-200"
  if (status === "completed") return "bg-emerald-50 text-emerald-700 border-emerald-200"
  if (status === "rejected") return "bg-red-50 text-red-700 border-red-200"
  if (status.includes("rejected")) return "bg-orange-50 text-orange-700 border-orange-200"
  if (status.includes("approved")) return "bg-green-50 text-green-700 border-green-200"
  return "bg-blue-50 text-blue-700 border-blue-200"
}
