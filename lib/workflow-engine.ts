// Workflow Engine - State Management untuk BPMN University Cooperation System

export type ProposalStatus = 
  | 'draft'
  | 'submitted'
  | 'ai_summary'
  | 'verifikasi_substansi'
  | 'review_dkui'
  | 'review_hukum'
  | 'paraf_hukum'
  | 'paraf_dkui'
  | 'paraf_fakultas'
  | 'review_warek'
  | 'materai_warek'
  | 'tte_warek'
  | 'review_rektor'
  | 'materai_rektor'
  | 'tte_rektor'
  | 'review_mitra_final'
  | 'materai_mitra'
  | 'tte_mitra'
  | 'pertukaran_dokumen'
  | 'arsip'
  | 'revision_by_mitra'
  | 'revision_by_dkui'
  | 'rejected'
  | 'completed';

export type UserRole = 'mitra' | 'fakultas' | 'dkui' | 'biro_hukum' | 'warek' | 'rektor';

export interface WorkflowTransition {
  from: ProposalStatus;
  to: ProposalStatus;
  action: string;
  allowedRoles: UserRole[];
  requiresApproval?: boolean;
  requiresMaterai?: boolean;
}

// Definisi semua transisi workflow sesuai BPMN
export const WORKFLOW_TRANSITIONS: WorkflowTransition[] = [
  // Mitra: Submit Proposal
  { from: 'draft', to: 'submitted', action: 'submit', allowedRoles: ['mitra'] },
  
  // Sistem: AI Summary (otomatis)
  { from: 'submitted', to: 'ai_summary', action: 'ai_summarize', allowedRoles: ['dkui'] },
  
  // Fakultas: Verifikasi Substansi
  { from: 'ai_summary', to: 'verifikasi_substansi', action: 'verify_substance', allowedRoles: ['fakultas'] },
  { from: 'revision_by_dkui', to: 'verifikasi_substansi', action: 'resubmit_after_dkui_revision', allowedRoles: ['dkui'] },
  
  // Gateway 1: Keputusan Awal (Substansi OK?)
  { from: 'verifikasi_substansi', to: 'review_dkui', action: 'approve_substance', allowedRoles: ['fakultas'], requiresApproval: true },
  { from: 'verifikasi_substansi', to: 'revision_by_mitra', action: 'reject_substance', allowedRoles: ['fakultas'] },
  { from: 'verifikasi_substansi', to: 'revision_by_dkui', action: 'revise_by_dkui', allowedRoles: ['fakultas'] },
  
  // Mitra: Terima Revisi & Perbaikan
  { from: 'revision_by_mitra', to: 'ai_summary', action: 'resubmit_after_revision', allowedRoles: ['mitra'] },
  
  // DKUI: Review (Legal Drafter)
  { from: 'review_dkui', to: 'review_hukum', action: 'approve_dkui', allowedRoles: ['dkui'] },
  
  // Biro Hukum: Review Legalitas
  { from: 'review_hukum', to: 'paraf_hukum', action: 'approve_legal', allowedRoles: ['biro_hukum'], requiresApproval: true },
  { from: 'review_hukum', to: 'revision_by_mitra', action: 'reject_legal', allowedRoles: ['biro_hukum'] },
  
  // Paraf Chain: Biro Hukum -> DKUI -> Fakultas
  { from: 'paraf_hukum', to: 'paraf_dkui', action: 'paraf_by_hukum', allowedRoles: ['biro_hukum'] },
  { from: 'paraf_dkui', to: 'paraf_fakultas', action: 'paraf_by_dkui', allowedRoles: ['dkui'] },
  
  // Gateway Paralel: Mulai TTE Paralel (Mitra & Warek)
  { from: 'paraf_fakultas', to: 'review_warek', action: 'forward_to_warek', allowedRoles: ['fakultas'] },
  { from: 'paraf_fakultas', to: 'review_mitra_final', action: 'forward_to_mitra', allowedRoles: ['fakultas'] },
  
  // Path Mitra (Parallel)
  { from: 'review_mitra_final', to: 'materai_mitra', action: 'approve_mitra_final', allowedRoles: ['mitra'] },
  { from: 'materai_mitra', to: 'tte_mitra', action: 'attach_materai_mitra', allowedRoles: ['mitra'], requiresMaterai: true },
  
  // Path Warek (Parallel)
  { from: 'review_warek', to: 'materai_warek', action: 'approve_warek', allowedRoles: ['warek'], requiresApproval: true },
  { from: 'review_warek', to: 'revision_by_mitra', action: 'reject_warek', allowedRoles: ['warek'] },
  { from: 'materai_warek', to: 'tte_warek', action: 'attach_materai_warek', allowedRoles: ['warek'], requiresMaterai: true },
  
  // Warek -> Rektor
  { from: 'tte_warek', to: 'review_rektor', action: 'forward_to_rektor', allowedRoles: ['warek'] },
  { from: 'review_rektor', to: 'materai_rektor', action: 'approve_rektor', allowedRoles: ['rektor'], requiresApproval: true },
  { from: 'review_rektor', to: 'revision_by_mitra', action: 'reject_rektor', allowedRoles: ['rektor'] },
  { from: 'materai_rektor', to: 'tte_rektor', action: 'attach_materai_rektor', allowedRoles: ['rektor'], requiresMaterai: true },
  
  // Pertukaran Dokumen Final (setelah kedua TTE selesai)
  { from: 'tte_mitra', to: 'pertukaran_dokumen', action: 'complete_mitra_tte', allowedRoles: ['mitra'] },
  { from: 'tte_rektor', to: 'pertukaran_dokumen', action: 'complete_rektor_tte', allowedRoles: ['rektor'] },
  
  // Arsip & Selesai
  { from: 'pertukaran_dokumen', to: 'arsip', action: 'archive_document', allowedRoles: ['dkui'] },
  { from: 'arsip', to: 'completed', action: 'complete_workflow', allowedRoles: ['dkui'] },
  
  // Penolakan final
  { from: 'verifikasi_substansi', to: 'rejected', action: 'reject_final', allowedRoles: ['fakultas'] },
];

// Helper function: Cek apakah transisi valid
export function isValidTransition(
  currentStatus: ProposalStatus,
  targetStatus: ProposalStatus,
  userRole: UserRole
): boolean {
  const transition = WORKFLOW_TRANSITIONS.find(
    t => t.from === currentStatus && t.to === targetStatus
  );
  
  if (!transition) return false;
  return transition.allowedRoles.includes(userRole);
}

// Helper function: Get available transitions untuk status tertentu
export function getAvailableTransitions(
  currentStatus: ProposalStatus,
  userRole: UserRole
): WorkflowTransition[] {
  return WORKFLOW_TRANSITIONS.filter(
    t => t.from === currentStatus && t.allowedRoles.includes(userRole)
  );
}

// Helper function: Get next status options
export function getNextStatusOptions(
  currentStatus: ProposalStatus,
  userRole: UserRole
): ProposalStatus[] {
  return getAvailableTransitions(currentStatus, userRole).map(t => t.to);
}

// Helper function: Validate parallel gateway completion
export function checkParallelGatewayCompletion(
  proposal: {
    status: ProposalStatus;
    parallel_tte_mitra_completed: boolean;
    parallel_tte_rektor_completed: boolean;
  }
): boolean {
  // Jika kedua TTE selesai, bisa lanjut ke pertukaran dokumen
  if (proposal.status === 'tte_mitra' || proposal.status === 'tte_rektor') {
    return proposal.parallel_tte_mitra_completed && proposal.parallel_tte_rektor_completed;
  }
  return true;
}

// Helper function: Get workflow stage label
export function getStageLabel(status: ProposalStatus): string {
  const labels: Record<ProposalStatus, string> = {
    draft: 'Draft',
    submitted: 'Disubmit',
    ai_summary: 'Ringkasan AI',
    verifikasi_substansi: 'Verifikasi Substansi',
    review_dkui: 'Review DKUI',
    review_hukum: 'Review Biro Hukum',
    paraf_hukum: 'Paraf Biro Hukum',
    paraf_dkui: 'Paraf DKUI',
    paraf_fakultas: 'Paraf Fakultas',
    review_warek: 'Review Wakil Rektor',
    materai_warek: 'Materai Wakil Rektor',
    tte_warek: 'TTE Wakil Rektor',
    review_rektor: 'Review Rektor',
    materai_rektor: 'Materai Rektor',
    tte_rektor: 'TTE Rektor',
    review_mitra_final: 'Review Mitra (Final)',
    materai_mitra: 'Materai Mitra',
    tte_mitra: 'TTE Mitra',
    pertukaran_dokumen: 'Pertukaran Dokumen',
    arsip: 'Arsip',
    revision_by_mitra: 'Revisi oleh Mitra',
    revision_by_dkui: 'Revisi oleh DKUI',
    rejected: 'Ditolak',
    completed: 'Selesai',
  };
  return labels[status] || status;
}

// Helper function: Get workflow progress percentage
export function getWorkflowProgress(status: ProposalStatus): number {
  const progressMap: Record<ProposalStatus, number> = {
    draft: 0,
    submitted: 5,
    ai_summary: 10,
    verifikasi_substansi: 15,
    review_dkui: 25,
    review_hukum: 35,
    paraf_hukum: 45,
    paraf_dkui: 50,
    paraf_fakultas: 55,
    review_warek: 60,
    materai_warek: 65,
    tte_warek: 70,
    review_rektor: 75,
    materai_rektor: 80,
    tte_rektor: 85,
    review_mitra_final: 60,
    materai_mitra: 70,
    tte_mitra: 80,
    pertukaran_dokumen: 90,
    arsip: 95,
    revision_by_mitra: 20,
    revision_by_dkui: 20,
    rejected: 0,
    completed: 100,
  };
  return progressMap[status] || 0;
}
