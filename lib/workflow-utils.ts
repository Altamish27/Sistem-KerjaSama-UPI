// ============================================
// WORKFLOW UTILS — Legacy-compatible helpers
// ============================================
// Wraps workflow-engine.ts for backward compat with existing imports.

import type { ProposalStatus, UserRole, InitiatorType } from "./mock-data"
import {
  type WorkflowPath,
  determineWorkflowPath,
  canUserTakeAction,
  getWorkflowSteps as engineGetSteps,
  getCurrentStepIndex as engineGetIndex,
} from "./workflow-engine"

/**
 * Legacy helper: check if user can approve at current status.
 * Maps old InitiatorType-based API to new path-based API.
 */
export function canUserApprove(
  proposalStatus: ProposalStatus,
  userRole: UserRole,
  _initiator: InitiatorType,
  fileSuratKuasa?: string | null,
): boolean {
  const path = determineWorkflowPath(fileSuratKuasa)
  return canUserTakeAction(proposalStatus, userRole, path)
}

/**
 * Get visualization steps for a given workflow path.
 */
export function getWorkflowSteps(path: WorkflowPath) {
  return engineGetSteps(path)
}

/**
 * Get index of current status in the visualization steps.
 */
export function getCurrentStepIndex(status: ProposalStatus, path: WorkflowPath): number {
  return engineGetIndex(status, path)
}

export { determineWorkflowPath, type WorkflowPath }

// ============================================
// PKS FILE MAPPING — Digital Signature Simulation
// ============================================
// Maps proposal status to the correct mock PKS PDF.
// PKS_0 = Draft (belum ditandatangani)
// PKS_1 = TTD Pimpinan/Rektor
// PKS_2 = TTD Pimpinan/Rektor + e-Materai
// PKS_3 = TTD Pimpinan + Materai + Paraf Mitra
// PKS_4 = Final (semua TTD, materai, paraf — siap arsip)

export interface PksFileInfo {
  url: string
  label: string
  description: string
  stage: number // 0-4
}

const PKS_FILES: PksFileInfo[] = [
  { url: "/mock_pks/PKS_0.pdf", label: "Draft Naskah PKS", description: "Naskah PKS belum ditandatangani", stage: 0 },
  { url: "/mock_pks/PKS_1.pdf", label: "TTD Pimpinan UPI", description: "Naskah PKS telah ditandatangani oleh pimpinan UPI", stage: 1 },
  { url: "/mock_pks/PKS_2.pdf", label: "TTD + e-Materai", description: "Naskah PKS telah ditandatangani dan dibubuhkan e-Materai", stage: 2 },
  { url: "/mock_pks/PKS_3.pdf", label: "TTD + Materai + Paraf Mitra", description: "Naskah PKS telah diparaf oleh mitra", stage: 3 },
  { url: "/mock_pks/PKS_4.pdf", label: "Dokumen Final", description: "Naskah PKS final — seluruh tanda tangan dan materai lengkap", stage: 4 },
]

/**
 * Get the PKS file info for the current proposal status.
 * Returns null if the status is before the PKS review phase.
 */
export function getPksFileForStatus(status: ProposalStatus): PksFileInfo | null {
  // Stages that show PKS_0 (draft, read-only for reviewers)
  const draftStages: ProposalStatus[] = [
    "biro_hukum_reviewing", "biro_hukum_approved", "biro_hukum_rejected",
    "su_reviewing", "su_approved", "su_rejected",
    "wr_reviewing", "wr_approved", "wr_rejected",
    "pimpinan_unit_signing", "rektor_signing",
  ]

  // TTD Pimpinan + e-Materai otomatis
  const signedStages: ProposalStatus[] = [
    "rektor_signed", "pimpinan_unit_signed",
    "mitra_signing",
  ]

  // Final — semua TTD lengkap
  const finalStages: ProposalStatus[] = [
    "mitra_signed", "archived", "completed",
  ]

  if (draftStages.includes(status)) return PKS_FILES[0]
  if (signedStages.includes(status)) return PKS_FILES[2]
  if (finalStages.includes(status)) return PKS_FILES[4]

  return null
}

/**
 * Get the signing simulation data for a signing step.
 * Returns the "before" and "after" PKS files + label for the signing button.
 */
export function getSigningSimulationData(status: ProposalStatus): {
  before: PksFileInfo
  intermediate?: PksFileInfo // Shown briefly during animation
  after: PksFileInfo
  buttonLabel: string
  buttonIcon: "pen" | "stamp"
  signerLabel: string
  steps: { label: string; active: boolean; completed: boolean }[]
} | null {
  const baseSteps = [
    { label: "Draft", active: false, completed: false },
    { label: "TTD Pimpinan", active: false, completed: false },
    { label: "e-Materai", active: false, completed: false },
    { label: "TTD Mitra", active: false, completed: false },
    { label: "Final", active: false, completed: false },
  ]

  if (status === "rektor_signing" || status === "pimpinan_unit_signing") {
    const steps = baseSteps.map((s, i) => ({
      ...s,
      completed: i === 0,
      active: i === 1,
    }))
    return {
      before: PKS_FILES[0],
      intermediate: PKS_FILES[1],
      after: PKS_FILES[2],
      buttonLabel: status === "rektor_signing"
        ? "Bubuhkan Tanda Tangan Elektronik Rektor"
        : "Bubuhkan Tanda Tangan Elektronik Pimpinan Unit",
      buttonIcon: "pen",
      signerLabel: status === "rektor_signing" ? "Rektor" : "Pimpinan Unit",
      steps,
    }
  }

  if (status === "mitra_signing") {
    const steps = baseSteps.map((s, i) => ({
      ...s,
      completed: i <= 2,
      active: i === 3,
    }))
    return {
      before: PKS_FILES[2],
      intermediate: PKS_FILES[3],
      after: PKS_FILES[4],
      buttonLabel: "Bubuhkan Tanda Tangan & e-Materai Mitra",
      buttonIcon: "stamp",
      signerLabel: "Mitra",
      steps,
    }
  }

  return null
}