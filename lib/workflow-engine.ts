// ============================================
// WORKFLOW ENGINE — SISTEM KERJA SAMA UPI
// ============================================
// Mengikuti Peraturan Rektor No. 019 Tahun 2022
// Dua jalur sekuensial (TIDAK parallel):
//   Path A: Rektor signing (dokumen strategis)
//   Path B: Pimpinan Unit signing (via Surat Kuasa)
// Revision loop: rejection → dkui_self_revising → mitra_resubmitted → pimpinan_unit_reviewing

import type { ProposalStatus, UserRole, ApprovalActionType } from "./mock-data"

// ============================================
// WORKFLOW STEP DEFINITION
// ============================================

export interface WorkflowActionItem {
  label: string
  nextStatus: ProposalStatus
  actionType: "approve" | "reject" | "process" | "sign"
  approvalAction: ApprovalActionType // maps to approval_history.action
  requiresComment?: boolean
  requiresDocument?: boolean
}

export interface WorkflowStep {
  status: ProposalStatus
  allowedRoles: UserRole[]
  actions: WorkflowActionItem[]
}

// ============================================
// PATH DETERMINATION
// ============================================

export type WorkflowPath = "rektor" | "pimpinan_unit"

/**
 * Determine which signing path a proposal follows.
 * If file_surat_kuasa is present → Path B (Pimpinan Unit signs).
 * Otherwise → Path A (Rektor signs).
 */
export function determineWorkflowPath(fileSuratKuasa?: string | null): WorkflowPath {
  return fileSuratKuasa ? "pimpinan_unit" : "rektor"
}

// ============================================
// SHARED STEPS (both paths)
// ============================================

const SHARED_STEPS: Record<string, WorkflowStep> = {
  // ── Drafting ──
  draft: {
    status: "draft",
    allowedRoles: ["operator_unit"],
    actions: [
      {
        label: "Ajukan Proposal",
        nextStatus: "submitted",
        actionType: "process",
        approvalAction: "submit",
        requiresComment: false,
      },
    ],
  },
  submitted: {
    status: "submitted",
    allowedRoles: ["pimpinan_unit"],
    actions: [
      {
        label: "Mulai Review",
        nextStatus: "pimpinan_unit_reviewing",
        actionType: "process",
        approvalAction: "pimpinan_unit_review",
        requiresComment: false,
      },
    ],
  },

  // ── Pimpinan Unit Review ──
  pimpinan_unit_reviewing: {
    status: "pimpinan_unit_reviewing",
    allowedRoles: ["pimpinan_unit"],
    actions: [
      {
        label: "✅ Setujui",
        nextStatus: "pimpinan_unit_approved",
        actionType: "approve",
        approvalAction: "pimpinan_unit_approve",
        requiresComment: true,
      },
      {
        label: "❌ Tolak (Butuh Revisi)",
        nextStatus: "pimpinan_unit_rejected",
        actionType: "reject",
        approvalAction: "pimpinan_unit_reject",
        requiresComment: true,
      },
    ],
  },
  pimpinan_unit_approved: {
    status: "pimpinan_unit_approved",
    allowedRoles: ["dkui"],
    actions: [
      {
        label: "Mulai Review DKUI",
        nextStatus: "dkui_reviewing",
        actionType: "process",
        approvalAction: "dkui_review",
        requiresComment: false,
      },
    ],
  },
  pimpinan_unit_rejected: {
    status: "pimpinan_unit_rejected",
    allowedRoles: ["dkui"],
    actions: [
      {
        label: "Revisi Draf",
        nextStatus: "dkui_self_revising",
        actionType: "process",
        approvalAction: "dkui_self_revise",
        requiresComment: true,
      },
    ],
  },

  // ── DKUI Review ──
  dkui_reviewing: {
    status: "dkui_reviewing",
    allowedRoles: ["dkui"],
    actions: [
      {
        label: "✅ Setujui",
        nextStatus: "dkui_approved",
        actionType: "approve",
        approvalAction: "dkui_approve",
        requiresComment: true,
      },
      {
        label: "❌ Tolak (Butuh Revisi)",
        nextStatus: "dkui_rejected",
        actionType: "reject",
        approvalAction: "dkui_reject",
        requiresComment: true,
      },
    ],
  },
  dkui_approved: {
    status: "dkui_approved",
    allowedRoles: ["biro_hukum"],
    actions: [
      {
        label: "Mulai Review Legalitas",
        nextStatus: "biro_hukum_reviewing",
        actionType: "process",
        approvalAction: "biro_hukum_review",
        requiresComment: false,
      },
    ],
  },
  dkui_rejected: {
    status: "dkui_rejected",
    allowedRoles: ["dkui"],
    actions: [
      {
        label: "Revisi Draf",
        nextStatus: "dkui_self_revising",
        actionType: "process",
        approvalAction: "dkui_self_revise",
        requiresComment: true,
      },
    ],
  },

  // ── Biro Hukum Review ──
  biro_hukum_reviewing: {
    status: "biro_hukum_reviewing",
    allowedRoles: ["biro_hukum"],
    actions: [
      {
        label: "✅ Legalitas Disetujui",
        nextStatus: "biro_hukum_approved",
        actionType: "approve",
        approvalAction: "biro_hukum_approve",
        requiresComment: true,
      },
      {
        label: "❌ Legalitas Ditolak",
        nextStatus: "biro_hukum_rejected",
        actionType: "reject",
        approvalAction: "biro_hukum_reject",
        requiresComment: true,
      },
    ],
  },
  biro_hukum_rejected: {
    status: "biro_hukum_rejected",
    allowedRoles: ["dkui"],
    actions: [
      {
        label: "Revisi Draf",
        nextStatus: "dkui_self_revising",
        actionType: "process",
        approvalAction: "dkui_self_revise",
        requiresComment: true,
      },
    ],
  },

  // ── Revisi Loop ──
  dkui_self_revising: {
    status: "dkui_self_revising",
    allowedRoles: ["dkui"],
    actions: [
      {
        label: "Selesai Revisi, Minta Persetujuan Ulang Mitra",
        nextStatus: "mitra_resubmitted",
        actionType: "process",
        approvalAction: "mitra_resubmit",
        requiresComment: true,
        requiresDocument: true,
      },
      {
        label: "❌ Tolak Final",
        nextStatus: "rejected",
        actionType: "reject",
        approvalAction: "final_rejection",
        requiresComment: true,
      },
    ],
  },
  mitra_resubmitted: {
    status: "mitra_resubmitted",
    allowedRoles: ["dkui"],
    actions: [
      {
        label: "Kirim Ulang ke Pimpinan Unit",
        nextStatus: "pimpinan_unit_reviewing",
        actionType: "process",
        approvalAction: "pimpinan_unit_review",
        requiresComment: false,
      },
    ],
  },

  // ── Mitra Signing (shared final step) ──
  mitra_signing: {
    status: "mitra_signing",
    allowedRoles: ["mitra"],
    actions: [
      {
        label: "Tanda Tangan Mitra",
        nextStatus: "mitra_signed",
        actionType: "sign",
        approvalAction: "mitra_sign",
        requiresComment: false,
      },
    ],
  },
  mitra_signed: {
    status: "mitra_signed",
    allowedRoles: ["dkui"],
    actions: [
      {
        label: "Arsipkan Dokumen",
        nextStatus: "archived",
        actionType: "process",
        approvalAction: "archive",
        requiresComment: false,
      },
    ],
  },

  // ── Terminal ──
  archived: {
    status: "archived",
    allowedRoles: ["dkui"],
    actions: [
      {
        label: "Tandai Selesai",
        nextStatus: "completed",
        actionType: "process",
        approvalAction: "complete",
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

// ============================================
// PATH A ONLY STEPS — Rektor Signing
// ============================================
// After biro_hukum_approved → SU → WR → Rektor → Mitra

const PATH_A_STEPS: Record<string, WorkflowStep> = {
  biro_hukum_approved: {
    status: "biro_hukum_approved",
    allowedRoles: ["sekretaris_universitas"],
    actions: [
      {
        label: "Mulai Review SU",
        nextStatus: "su_reviewing",
        actionType: "process",
        approvalAction: "su_review",
        requiresComment: false,
      },
    ],
  },

  // ── Sekretaris Universitas ──
  su_reviewing: {
    status: "su_reviewing",
    allowedRoles: ["sekretaris_universitas"],
    actions: [
      {
        label: "✅ Paraf SU",
        nextStatus: "su_approved",
        actionType: "approve",
        approvalAction: "su_approve",
        requiresComment: true,
      },
      {
        label: "❌ Tolak (Butuh Revisi)",
        nextStatus: "su_rejected",
        actionType: "reject",
        approvalAction: "su_reject",
        requiresComment: true,
      },
    ],
  },
  su_approved: {
    status: "su_approved",
    allowedRoles: ["wakil_rektor"],
    actions: [
      {
        label: "Mulai Review Wakil Rektor",
        nextStatus: "wr_reviewing",
        actionType: "process",
        approvalAction: "wr_review",
        requiresComment: false,
      },
    ],
  },
  su_rejected: {
    status: "su_rejected",
    allowedRoles: ["dkui"],
    actions: [
      {
        label: "Revisi Draf",
        nextStatus: "dkui_self_revising",
        actionType: "process",
        approvalAction: "dkui_self_revise",
        requiresComment: true,
      },
    ],
  },

  // ── Wakil Rektor ──
  wr_reviewing: {
    status: "wr_reviewing",
    allowedRoles: ["wakil_rektor"],
    actions: [
      {
        label: "✅ Paraf Wakil Rektor",
        nextStatus: "wr_approved",
        actionType: "approve",
        approvalAction: "wr_approve",
        requiresComment: true,
      },
      {
        label: "❌ Tolak (Butuh Revisi)",
        nextStatus: "wr_rejected",
        actionType: "reject",
        approvalAction: "wr_reject",
        requiresComment: true,
      },
    ],
  },
  wr_approved: {
    status: "wr_approved",
    allowedRoles: ["rektor"],
    actions: [
      {
        label: "Tanda Tangan Rektor",
        nextStatus: "rektor_signing",
        actionType: "sign",
        approvalAction: "rektor_sign",
        requiresComment: false,
      },
    ],
  },
  wr_rejected: {
    status: "wr_rejected",
    allowedRoles: ["dkui"],
    actions: [
      {
        label: "Revisi Draf",
        nextStatus: "dkui_self_revising",
        actionType: "process",
        approvalAction: "dkui_self_revise",
        requiresComment: true,
      },
    ],
  },

  // ── Rektor Signing ──
  rektor_signing: {
    status: "rektor_signing",
    allowedRoles: ["rektor"],
    actions: [
      {
        label: "✅ Tanda Tangan Elektronik Rektor",
        nextStatus: "rektor_signed",
        actionType: "sign",
        approvalAction: "rektor_sign",
        requiresComment: false,
      },
    ],
  },
  rektor_signed: {
    status: "rektor_signed",
    allowedRoles: ["dkui"],
    actions: [
      {
        label: "Kirim ke Mitra untuk Tanda Tangan",
        nextStatus: "mitra_signing",
        actionType: "process",
        approvalAction: "mitra_sign",
        requiresComment: false,
      },
    ],
  },
}

// ============================================
// PATH B ONLY STEPS — Pimpinan Unit Signing (Surat Kuasa)
// ============================================
// After biro_hukum_approved → SKIP SU, WR, Rektor → Pimpinan Unit signs → Mitra

const PATH_B_STEPS: Record<string, WorkflowStep> = {
  biro_hukum_approved: {
    status: "biro_hukum_approved",
    allowedRoles: ["pimpinan_unit"],
    actions: [
      {
        label: "Tanda Tangan Pimpinan Unit",
        nextStatus: "pimpinan_unit_signing",
        actionType: "sign",
        approvalAction: "pimpinan_unit_sign",
        requiresComment: false,
      },
    ],
  },
  pimpinan_unit_signing: {
    status: "pimpinan_unit_signing",
    allowedRoles: ["pimpinan_unit"],
    actions: [
      {
        label: "✅ Tanda Tangan Elektronik Pimpinan Unit",
        nextStatus: "pimpinan_unit_signed",
        actionType: "sign",
        approvalAction: "pimpinan_unit_sign",
        requiresComment: false,
      },
    ],
  },
  pimpinan_unit_signed: {
    status: "pimpinan_unit_signed",
    allowedRoles: ["dkui"],
    actions: [
      {
        label: "Kirim ke Mitra untuk Tanda Tangan",
        nextStatus: "mitra_signing",
        actionType: "process",
        approvalAction: "mitra_sign",
        requiresComment: false,
      },
    ],
  },
}

// ============================================
// WORKFLOW ENGINE API
// ============================================

/**
 * Get the WorkflowStep for a given status, respecting path selection.
 */
export function getWorkflowStep(
  status: ProposalStatus,
  path: WorkflowPath = "rektor",
): WorkflowStep | null {
  // Check path-specific steps first (for statuses that differ by path)
  const pathSteps = path === "rektor" ? PATH_A_STEPS : PATH_B_STEPS
  if (status in pathSteps) return pathSteps[status]

  // Fall back to shared steps
  if (status in SHARED_STEPS) return SHARED_STEPS[status]

  return null
}

/**
 * Check if a user with the given role can take action on the current status.
 */
export function canUserTakeAction(
  status: ProposalStatus,
  userRole: UserRole,
  path: WorkflowPath = "rektor",
): boolean {
  const step = getWorkflowStep(status, path)
  if (!step) return false
  return step.allowedRoles.includes(userRole)
}

/**
 * Get available actions for a user at a given status.
 */
export function getAvailableActions(
  status: ProposalStatus,
  userRole: UserRole,
  path: WorkflowPath = "rektor",
): WorkflowActionItem[] {
  if (!canUserTakeAction(status, userRole, path)) return []
  const step = getWorkflowStep(status, path)
  return step?.actions || []
}

/**
 * Get the next status after an action by label.
 */
export function getNextStatus(
  currentStatus: ProposalStatus,
  actionLabel: string,
  path: WorkflowPath = "rektor",
): ProposalStatus {
  const step = getWorkflowStep(currentStatus, path)
  const action = step?.actions.find((a) => a.label === actionLabel)
  return action?.nextStatus || currentStatus
}

// ============================================
// WORKFLOW VISUALIZATION
// ============================================

export interface WorkflowVisualizationStep {
  status: ProposalStatus
  label: string
  role: UserRole
  description: string
}

/**
 * Get ordered workflow steps for timeline/tracker visualization.
 */
export function getWorkflowSteps(path: WorkflowPath): WorkflowVisualizationStep[] {
  const shared: WorkflowVisualizationStep[] = [
    { status: "submitted", label: "Diajukan", role: "operator_unit", description: "Proposal diajukan ke sistem" },
    {
      status: "pimpinan_unit_reviewing",
      label: "Review Pimpinan Unit",
      role: "pimpinan_unit",
      description: "Pimpinan Unit memverifikasi substansi",
    },
    {
      status: "dkui_reviewing",
      label: "Review DKUI",
      role: "dkui",
      description: "DKUI mereview kelengkapan & kualitas dokumen",
    },
    {
      status: "biro_hukum_reviewing",
      label: "Review Biro Hukum",
      role: "biro_hukum",
      description: "Biro Hukum memvalidasi aspek legalitas",
    },
  ]

  if (path === "rektor") {
    return [
      ...shared,
      {
        status: "su_reviewing",
        label: "Paraf Sekretaris Universitas",
        role: "sekretaris_universitas",
        description: "Sekretaris Universitas mereview & memberikan paraf",
      },
      {
        status: "wr_reviewing",
        label: "Paraf Wakil Rektor",
        role: "wakil_rektor",
        description: "Wakil Rektor mereview & memberikan paraf",
      },
      {
        status: "rektor_signing",
        label: "Tanda Tangan Rektor",
        role: "rektor",
        description: "Rektor menandatangani dokumen secara elektronik",
      },
      {
        status: "mitra_signing",
        label: "Tanda Tangan Mitra",
        role: "mitra",
        description: "Mitra menandatangani dokumen",
      },
      {
        status: "archived",
        label: "Arsip",
        role: "dkui",
        description: "Dokumen diarsipkan oleh DKUI",
      },
    ]
  } else {
    return [
      ...shared,
      {
        status: "pimpinan_unit_signing",
        label: "Tanda Tangan Pimpinan Unit",
        role: "pimpinan_unit",
        description: "Pimpinan Unit menandatangani (Surat Kuasa)",
      },
      {
        status: "mitra_signing",
        label: "Tanda Tangan Mitra",
        role: "mitra",
        description: "Mitra menandatangani dokumen",
      },
      {
        status: "archived",
        label: "Arsip",
        role: "dkui",
        description: "Dokumen diarsipkan oleh DKUI",
      },
    ]
  }
}

/**
 * Find the index of the current status in the visualization steps.
 * Returns -1 for revising/rejected statuses (shown as deviation).
 */
export function getCurrentStepIndex(status: ProposalStatus, path: WorkflowPath): number {
  if (
    status === "dkui_self_revising" ||
    status === "mitra_resubmitted" ||
    status === "rejected" ||
    status.endsWith("_rejected")
  ) {
    return -1
  }

  const steps = getWorkflowSteps(path)
  const index = steps.findIndex((step) => step.status === status)

  if (index < 0) {
    if (status === "draft") return -1
    if (status === "pimpinan_unit_approved") return 1
    if (status === "dkui_approved") return 2
    if (status === "biro_hukum_approved") return 3
    if (status === "su_approved" && path === "rektor") return 4
    if (status === "wr_approved" && path === "rektor") return 5
    if (status === "rektor_signed" && path === "rektor") return 6
    if (status === "pimpinan_unit_signed" && path === "pimpinan_unit") return 4
    if (status === "mitra_signed") return steps.length - 2
    if (status === "completed") return steps.length
  }

  return index >= 0 ? index : 0
}

// ============================================
// HELPERS
// ============================================

/**
 * Simulasi AI Summary Generation.
 * In production → call LLM API.
 */
export function generateAISummary(description: string, objectives: string, benefits: string): string {
  return `[AI Summary] Proposal ini mengusulkan: ${description?.substring(0, 100) || ''}... Tujuan: ${objectives?.substring(0, 80) || ''}... Manfaat: ${benefits?.substring(0, 80) || ''}...`
}

/**
 * Get CSS classes for status badge coloring.
 */
export function getStatusBadgeColor(status: ProposalStatus): string {
  if (status === "draft") return "bg-slate-100 text-slate-700 border-slate-200"
  if (status === "completed") return "bg-emerald-50 text-emerald-700 border-emerald-200"
  if (status === "rejected") return "bg-red-50 text-red-700 border-red-200"
  if (status === "archived") return "bg-purple-50 text-purple-700 border-purple-200"
  if (status.endsWith("_rejected")) return "bg-orange-50 text-orange-700 border-orange-200"
  if (status.endsWith("_approved") || status.endsWith("_signed")) return "bg-green-50 text-green-700 border-green-200"
  if (status.includes("signing")) return "bg-yellow-50 text-yellow-700 border-yellow-200"
  if (status.includes("revising") || status === "mitra_resubmitted") return "bg-amber-50 text-amber-700 border-amber-200"
  return "bg-blue-50 text-blue-700 border-blue-200"
}

/**
 * Check whether a status represents a "terminal" state.
 */
export function isTerminalStatus(status: ProposalStatus): boolean {
  return status === "completed" || status === "rejected"
}

/**
 * Get the role expected for the current reviewer of a given status.
 */
export function getCurrentReviewerRole(status: ProposalStatus): UserRole | null {
  if (status.startsWith("pimpinan_unit")) return "pimpinan_unit"
  if (status.startsWith("dkui")) return "dkui"
  if (status.startsWith("biro_hukum")) return "biro_hukum"
  if (status.startsWith("su_")) return "sekretaris_universitas"
  if (status.startsWith("wr_")) return "wakil_rektor"
  if (status.startsWith("rektor")) return "rektor"
  if (status.startsWith("mitra")) return "mitra"
  return null
}