export type AppRole =
  | "mitra"
  | "dkui"
  | "fakultas"
  | "biro_hukum"
  | "sekretaris_univ"
  | "warek"
  | "rektor"
  | "admin";

export type WorkflowActionType = "advance" | "reject" | "request_revision";

export type WorkflowStageId = string;

export type ProposalStatus =
  | "drafting"
  | "reviewing"
  | "signing"
  | "archived"
  | "rejected"
  | "completed";

export interface WorkflowStage {
  id: WorkflowStageId;
  title: string;
  description: string;
  actorRole: AppRole | "system";
  nextStageId?: WorkflowStageId;
  actions?: string[];
}

export interface WorkflowConfig {
  title: string;
  stages: WorkflowStage[];
  revisionReturnStageId: WorkflowStageId;
  terminalRejectStageIds: WorkflowStageId[];
  transitionRules?: WorkflowTransitionRule[];
  stageActionConfigs?: WorkflowStageActionConfig[];
}

export interface WorkflowActionSetting {
  enabled: boolean;
  toStageId?: WorkflowStageId;
  requireComment?: boolean;
  label?: string;
}

export interface WorkflowStageActionConfig {
  stageId: WorkflowStageId;
  actions: Partial<Record<WorkflowActionType, WorkflowActionSetting>>;
}

export interface WorkflowTransitionRule {
  fromStageId: WorkflowStageId;
  action: WorkflowActionType;
  toStageId: WorkflowStageId;
  when?: {
    proposerType?: "external" | "internal";
    signatoryLevel?: "rektor" | "unit";
  };
}

export interface WorkflowContext {
  proposerType?: "external" | "internal";
  signatoryLevel?: "rektor" | "unit";
}

export interface WorkflowLogEntry {
  id: string;
  proposalId: string;
  action: WorkflowActionType;
  fromStage: WorkflowStageId;
  toStage: WorkflowStageId;
  actorRole: AppRole;
  actorName: string;
  comment?: string;
  at: string;
}

export const DEFAULT_WORKFLOW_CONFIG: WorkflowConfig = {
  title: "Proses Persetujuan Kerja Sama - Pengusul Mitra Eksternal (Tanda Tangan Rektor)",
  revisionReturnStageId: "draft_submission",
  terminalRejectStageIds: ["dkui_form_check", "unit_initial_review"],
  transitionRules: [
    {
      fromStageId: "legal_review",
      action: "advance",
      toStageId: "unit_leader_tte",
      when: {
        signatoryLevel: "unit",
      },
    },
  ],
  stages: [
  {
    id: "guest_submitted",
    title: "Isi Form Pengajuan (Guest Mode)",
    description: "Mitra eksternal mengisi form awal dan unggah dokumen dasar.",
    actorRole: "mitra",
    nextStageId: "dkui_form_check",
  },
  {
    id: "dkui_form_check",
    title: "DKUI Cek Form Pengajuan",
    description: "DKUI memeriksa kelengkapan awal dan validitas pengajuan.",
    actorRole: "dkui",
    nextStageId: "unit_initial_review",
  },
  {
    id: "unit_initial_review",
    title: "Review Awal Kesediaan Unit",
    description: "Unit internal menilai kesediaan awal untuk menindaklanjuti.",
    actorRole: "fakultas",
    nextStageId: "dkui_assign_initiator",
  },
  {
    id: "dkui_assign_initiator",
    title: "DKUI Tetapkan Inisiator & Kirim Kontak",
    description: "DKUI menetapkan inisiator dan menghubungkan pihak internal-eksternal.",
    actorRole: "dkui",
    nextStageId: "negotiation",
  },
  {
    id: "negotiation",
    title: "Penjajakan Kerja Sama",
    description: "Mitra dan unit melakukan penjajakan substansi kerja sama.",
    actorRole: "fakultas",
    nextStageId: "draft_submission",
  },
  {
    id: "draft_submission",
    title: "Ajukan Draf & Unggah BAP",
    description: "Draf awal MOU/PKS diunggah oleh pihak inisiator (mitra/unit).",
    actorRole: "fakultas",
    nextStageId: "unit_substance_review",
  },
  {
    id: "unit_substance_review",
    title: "Review Substansi oleh Pimpinan Unit",
    description: "Pimpinan unit melakukan review substansi naskah kerja sama.",
    actorRole: "fakultas",
    nextStageId: "dkui_verification",
  },
  {
    id: "dkui_verification",
    title: "Verifikasi oleh Pimpinan DKUI",
    description: "DKUI memverifikasi draf masuk sebelum review legal.",
    actorRole: "dkui",
    nextStageId: "legal_review",
  },
  {
    id: "legal_review",
    title: "Review Legalitas",
    description: "Kantor/Biro Hukum menelaah legalitas dan redaksi hukum.",
    actorRole: "biro_hukum",
    nextStageId: "secretary_review",
  },
  {
    id: "secretary_review",
    title: "Review / Paraf Sekretaris",
    description: "Sekretaris universitas review final sebelum paraf WR.",
    actorRole: "sekretaris_univ",
    nextStageId: "warek_paraf",
  },
  {
    id: "unit_leader_tte",
    title: "TTE Pimpinan Unit",
    description: "Pengesahan oleh Dekan/Direktur/Pimpinan Unit sesuai mandat.",
    actorRole: "fakultas",
    nextStageId: "partner_signing",
  },
  {
    id: "warek_paraf",
    title: "Paraf Wakil Rektor",
    description: "Paraf Wakil Rektor sebagai tahapan sebelum TTE Rektor.",
    actorRole: "warek",
    nextStageId: "rector_tte",
  },
  {
    id: "rector_tte",
    title: "Tanda Tangan Digital Rektor",
    description: "TTE Rektor untuk pengesahan akhir dokumen.",
    actorRole: "rektor",
    nextStageId: "partner_signing",
  },
  {
    id: "partner_signing",
    title: "Tanda Tangan Naskah oleh Mitra",
    description: "Mitra eksternal menandatangani naskah yang telah disahkan.",
    actorRole: "mitra",
    nextStageId: "archiving",
  },
  {
    id: "archiving",
    title: "Pengarsipan",
    description: "DKUI melakukan pengarsipan dan finalisasi administrasi.",
    actorRole: "dkui",
    nextStageId: "completed",
  },
  {
    id: "completed",
    title: "Selesai",
    description: "Proses persetujuan dan penandatanganan telah selesai.",
    actorRole: "system",
  },
  {
    id: "rejected",
    title: "Selesai (Ditolak)",
    description: "Pengajuan ditolak pada tahap pemeriksaan/review.",
    actorRole: "system",
  },
  ],
};

export const WORKFLOW_TITLE = DEFAULT_WORKFLOW_CONFIG.title;
export const WORKFLOW_STAGES = DEFAULT_WORKFLOW_CONFIG.stages;

function buildStageMap(stages: WorkflowStage[]): Record<string, WorkflowStage> {
  return Object.fromEntries(stages.map((s) => [s.id, s]));
}

export function normalizeWorkflowStage(stageId?: string, stages: WorkflowStage[] = WORKFLOW_STAGES): WorkflowStageId {
  const stageMap = buildStageMap(stages);
  if (!stageId) return stages[0]?.id || "guest_submitted";
  if (stageId in stageMap) return stageId;
  return stages[0]?.id || "guest_submitted";
}

export function getStage(
  stageId?: WorkflowStageId,
  stages: WorkflowStage[] = WORKFLOW_STAGES,
): WorkflowStage {
  const stageMap = buildStageMap(stages);
  const normalized = normalizeWorkflowStage(stageId, stages);
  return (
    stageMap[normalized] || {
      id: normalized,
      title: normalized,
      description: "Tahap tidak dikenal",
      actorRole: "system",
    }
  );
}

export function getNextStage(
  stageId?: WorkflowStageId,
  stages: WorkflowStage[] = WORKFLOW_STAGES,
): WorkflowStage | null {
  const current = getStage(stageId, stages);
  if (!current.nextStageId) return null;
  return getStage(current.nextStageId, stages);
}

export function statusFromStage(stageId: WorkflowStageId): ProposalStatus {
  if (stageId === "rejected") return "rejected";
  if (stageId === "completed") return "completed";
  if (stageId === "archiving") return "archived";
  if (
    stageId === "warek_paraf" ||
    stageId === "rector_tte" ||
    stageId === "unit_leader_tte" ||
    stageId === "partner_signing"
  ) {
    return "signing";
  }
  if (stageId === "guest_submitted") return "drafting";
  return "reviewing";
}

export function canRoleActOnStage(
  role: AppRole,
  stageId?: WorkflowStageId,
  stages: WorkflowStage[] = WORKFLOW_STAGES,
): boolean {
  const stage = getStage(stageId, stages);
  if (stage.actorRole === "system") return false;
  if (role === "admin") return false;
  return stage.actorRole === role;
}

export function resolveTransition(
  stageId: WorkflowStageId,
  action: WorkflowActionType,
  config: WorkflowConfig = DEFAULT_WORKFLOW_CONFIG,
  context?: WorkflowContext,
): WorkflowStageId {
  const fromStage = normalizeWorkflowStage(stageId, config.stages);

  const matchedRule = (config.transitionRules || []).find((rule) => {
    if (rule.fromStageId !== fromStage || rule.action !== action) {
      return false;
    }

    if (!rule.when) {
      return true;
    }

    if (rule.when.proposerType && rule.when.proposerType !== context?.proposerType) {
      return false;
    }

    if (rule.when.signatoryLevel && rule.when.signatoryLevel !== context?.signatoryLevel) {
      return false;
    }

    return true;
  });

  if (matchedRule) {
    return matchedRule.toStageId;
  }

  const configuredTarget = getConfiguredActionTarget(stageId, action, config);
  if (configuredTarget) {
    return configuredTarget;
  }

  if (action === "reject") {
    if (config.terminalRejectStageIds.includes(fromStage)) {
      return "rejected";
    }
    return config.revisionReturnStageId;
  }

  if (action === "request_revision") {
    return config.revisionReturnStageId;
  }

  const current = getStage(fromStage, config.stages);
  return current.nextStageId ?? stageId;
}

export const ROLE_LABEL: Record<AppRole, string> = {
  mitra: "Mitra Eksternal",
  dkui: "DKUI",
  fakultas: "Unit Internal UPI",
  biro_hukum: "Biro Hukum",
  sekretaris_univ: "Sekretaris Universitas",
  warek: "Wakil Rektor",
  rektor: "Rektor",
  admin: "Admin Sistem",
};

const STAGE_ALLOWED_ACTIONS: Record<string, WorkflowActionType[]> = {
  guest_submitted: ["advance"],
  dkui_form_check: ["advance", "request_revision", "reject"],
  unit_initial_review: ["advance", "request_revision", "reject"],
  dkui_assign_initiator: ["advance", "request_revision"],
  negotiation: ["advance", "request_revision"],
  draft_submission: ["advance", "request_revision"],
  unit_substance_review: ["advance", "request_revision", "reject"],
  dkui_verification: ["advance", "request_revision", "reject"],
  legal_review: ["advance", "request_revision", "reject"],
  secretary_review: ["advance", "request_revision", "reject"],
  unit_leader_tte: ["advance", "request_revision", "reject"],
  warek_paraf: ["advance", "request_revision", "reject"],
  rector_tte: ["advance", "request_revision", "reject"],
  partner_signing: ["advance", "request_revision"],
  archiving: ["advance"],
  completed: [],
  rejected: [],
};

function getConfiguredStageAction(stageId: WorkflowStageId, config?: WorkflowConfig): WorkflowStageActionConfig | undefined {
  if (!config?.stageActionConfigs?.length) return undefined;
  return config.stageActionConfigs.find((item) => item.stageId === stageId);
}

function getLegacyActionTarget(stageId: WorkflowStageId, action: WorkflowActionType, config: WorkflowConfig): WorkflowStageId | null {
  if (action === "request_revision") {
    return config.revisionReturnStageId;
  }

  if (action === "reject") {
    return config.terminalRejectStageIds.includes(stageId) ? "rejected" : config.revisionReturnStageId;
  }

  const current = getStage(stageId, config.stages);
  return current.nextStageId ?? null;
}

export function getConfiguredActionTarget(
  stageId: WorkflowStageId,
  action: WorkflowActionType,
  config: WorkflowConfig = DEFAULT_WORKFLOW_CONFIG,
): WorkflowStageId | null {
  const stageConfig = getConfiguredStageAction(stageId, config);
  const actionSetting = stageConfig?.actions?.[action];

  if (actionSetting?.enabled === false) {
    return null;
  }

  if (actionSetting?.toStageId) {
    return actionSetting.toStageId;
  }

  return getLegacyActionTarget(stageId, action, config);
}

export function getAllowedActionsForStage(
  stageId: WorkflowStageId,
  config: WorkflowConfig = DEFAULT_WORKFLOW_CONFIG,
): WorkflowActionType[] {
  const stageConfig = getConfiguredStageAction(stageId, config);

  if (stageConfig?.actions) {
    const fromConfig = (Object.keys(stageConfig.actions) as WorkflowActionType[]).filter((action) => {
      const setting = stageConfig.actions[action];
      return !!setting?.enabled;
    });
    if (fromConfig.length > 0) {
      return fromConfig;
    }
  }

  return STAGE_ALLOWED_ACTIONS[stageId] ?? ["advance", "request_revision", "reject"];
}

export function canRolePerformAction(
  role: AppRole,
  stageId: WorkflowStageId,
  action: WorkflowActionType,
  stages: WorkflowStage[] = WORKFLOW_STAGES,
  config: WorkflowConfig = DEFAULT_WORKFLOW_CONFIG,
): boolean {
  // Special case: mitra can acknowledge final draft before leadership review.
  if (role === "mitra" && stageId === "draft_submission" && action === "advance") {
    return true;
  }

  if (!canRoleActOnStage(role, stageId, stages)) {
    return false;
  }

  return getAllowedActionsForStage(stageId, config).includes(action);
}

export function actionNeedsComment(
  stageId: WorkflowStageId,
  action: WorkflowActionType,
  config: WorkflowConfig = DEFAULT_WORKFLOW_CONFIG,
): boolean {
  const stageConfig = getConfiguredStageAction(stageId, config);
  const explicit = stageConfig?.actions?.[action]?.requireComment;
  if (typeof explicit === "boolean") {
    return explicit;
  }
  return requiresCommentForAction(action);
}

export function getActionLabel(
  stageId: WorkflowStageId,
  action: WorkflowActionType,
  config: WorkflowConfig = DEFAULT_WORKFLOW_CONFIG,
): string {
  const stageConfig = getConfiguredStageAction(stageId, config);
  const explicit = stageConfig?.actions?.[action]?.label?.trim();
  if (explicit) {
    return explicit;
  }

  if (action === "advance") return "Setuju / Lanjut";
  if (action === "request_revision") return "Minta Revisi";
  return "Tolak";
}

export function requiresCommentForAction(action: WorkflowActionType): boolean {
  return action === "reject" || action === "request_revision";
}

export function getStageFriendlyLabel(stageId: WorkflowStageId, stages: WorkflowStage[] = WORKFLOW_STAGES): string {
  return getStage(stageId, stages).title;
}
