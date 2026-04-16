import fs from "fs/promises";
import path from "path";
import type { WorkflowConfig } from "@/lib/workflow";
import { DEFAULT_WORKFLOW_CONFIG } from "@/lib/workflow";

const WORKFLOW_CONFIG_FILE = path.join(process.cwd(), "data", "workflow-config.json");

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function validateWorkflowConfig(config: unknown): { valid: boolean; message?: string } {
  if (!isObject(config)) return { valid: false, message: "Format config tidak valid." };

  const title = config.title;
  const stages = config.stages;
  const revisionReturnStageId = config.revisionReturnStageId;
  const terminalRejectStageIds = config.terminalRejectStageIds;
  const transitionRules = config.transitionRules;
  const stageActionConfigs = config.stageActionConfigs;

  if (typeof title !== "string" || !title.trim()) {
    return { valid: false, message: "title wajib diisi." };
  }

  if (!Array.isArray(stages) || stages.length === 0) {
    return { valid: false, message: "stages wajib berupa array dan tidak boleh kosong." };
  }

  if (typeof revisionReturnStageId !== "string" || !revisionReturnStageId.trim()) {
    return { valid: false, message: "revisionReturnStageId wajib diisi." };
  }

  if (!Array.isArray(terminalRejectStageIds)) {
    return { valid: false, message: "terminalRejectStageIds wajib berupa array." };
  }

  const stageIds = new Set<string>();
  for (const stage of stages) {
    if (!isObject(stage)) {
      return { valid: false, message: "Setiap stage wajib berupa object." };
    }

    if (typeof stage.id !== "string" || !stage.id.trim()) {
      return { valid: false, message: "Setiap stage wajib punya id." };
    }

    if (stageIds.has(stage.id)) {
      return { valid: false, message: `Stage id duplikat: ${stage.id}` };
    }

    stageIds.add(stage.id);

    if (typeof stage.title !== "string" || !stage.title.trim()) {
      return { valid: false, message: `Stage ${stage.id} wajib punya title.` };
    }

    if (typeof stage.description !== "string") {
      return { valid: false, message: `Stage ${stage.id} wajib punya description.` };
    }

    if (typeof stage.actorRole !== "string") {
      return { valid: false, message: `Stage ${stage.id} wajib punya actorRole.` };
    }

    if (stage.nextStageId !== undefined && typeof stage.nextStageId !== "string") {
      return { valid: false, message: `nextStageId pada stage ${stage.id} tidak valid.` };
    }
  }

  if (!stageIds.has(revisionReturnStageId)) {
    return { valid: false, message: "revisionReturnStageId harus ada dalam stages." };
  }

  for (const id of terminalRejectStageIds) {
    if (typeof id !== "string" || !stageIds.has(id)) {
      return { valid: false, message: `terminalRejectStageIds berisi id yang tidak dikenal: ${String(id)}` };
    }
  }

  for (const stage of stages as Array<Record<string, unknown>>) {
    const next = stage.nextStageId;
    if (typeof next === "string" && !stageIds.has(next)) {
      return { valid: false, message: `Stage ${String(stage.id)} memiliki nextStageId tidak dikenal: ${next}` };
    }
  }

  if (transitionRules !== undefined) {
    if (!Array.isArray(transitionRules)) {
      return { valid: false, message: "transitionRules wajib berupa array." };
    }

    for (const [index, rule] of transitionRules.entries()) {
      if (!isObject(rule)) {
        return { valid: false, message: `transitionRules[${index}] wajib berupa object.` };
      }

      if (typeof rule.fromStageId !== "string" || !stageIds.has(rule.fromStageId)) {
        return { valid: false, message: `transitionRules[${index}].fromStageId tidak valid.` };
      }

      if (typeof rule.toStageId !== "string" || !stageIds.has(rule.toStageId)) {
        return { valid: false, message: `transitionRules[${index}].toStageId tidak valid.` };
      }

      if (typeof rule.action !== "string") {
        return { valid: false, message: `transitionRules[${index}].action wajib diisi.` };
      }
    }
  }

  if (stageActionConfigs !== undefined) {
    if (!Array.isArray(stageActionConfigs)) {
      return { valid: false, message: "stageActionConfigs wajib berupa array." };
    }

    const validActions = new Set(["advance", "request_revision", "reject"]);

    for (const [index, item] of stageActionConfigs.entries()) {
      if (!isObject(item)) {
        return { valid: false, message: `stageActionConfigs[${index}] wajib berupa object.` };
      }

      if (typeof item.stageId !== "string" || !stageIds.has(item.stageId)) {
        return { valid: false, message: `stageActionConfigs[${index}].stageId tidak valid.` };
      }

      if (!isObject(item.actions)) {
        return { valid: false, message: `stageActionConfigs[${index}].actions wajib berupa object.` };
      }

      for (const [actionKey, actionSetting] of Object.entries(item.actions)) {
        if (!validActions.has(actionKey)) {
          return { valid: false, message: `Aksi tidak dikenal pada stageActionConfigs[${index}]: ${actionKey}` };
        }

        if (!isObject(actionSetting)) {
          return { valid: false, message: `stageActionConfigs[${index}].actions.${actionKey} wajib object.` };
        }

        if (typeof actionSetting.enabled !== "boolean") {
          return { valid: false, message: `stageActionConfigs[${index}].actions.${actionKey}.enabled wajib boolean.` };
        }

        if (
          actionSetting.toStageId !== undefined &&
          (typeof actionSetting.toStageId !== "string" || !stageIds.has(actionSetting.toStageId))
        ) {
          return {
            valid: false,
            message: `stageActionConfigs[${index}].actions.${actionKey}.toStageId tidak valid.`,
          };
        }

        if (actionSetting.requireComment !== undefined && typeof actionSetting.requireComment !== "boolean") {
          return {
            valid: false,
            message: `stageActionConfigs[${index}].actions.${actionKey}.requireComment wajib boolean.`,
          };
        }

        if (actionSetting.label !== undefined && typeof actionSetting.label !== "string") {
          return {
            valid: false,
            message: `stageActionConfigs[${index}].actions.${actionKey}.label wajib string.`,
          };
        }
      }
    }
  }

  return { valid: true };
}

export async function readWorkflowConfig(): Promise<WorkflowConfig> {
  try {
    const raw = await fs.readFile(WORKFLOW_CONFIG_FILE, "utf-8");
    const parsed = JSON.parse(raw) as unknown;
    const validation = validateWorkflowConfig(parsed);
    if (!validation.valid) {
      console.warn("workflow-config.json invalid, fallback to default", validation.message);
      return DEFAULT_WORKFLOW_CONFIG;
    }
    return parsed as WorkflowConfig;
  } catch (error: unknown) {
    if (typeof error === "object" && error && "code" in error && (error as { code?: string }).code === "ENOENT") {
      return DEFAULT_WORKFLOW_CONFIG;
    }
    console.error("Failed to read workflow config", error);
    return DEFAULT_WORKFLOW_CONFIG;
  }
}

export async function writeWorkflowConfig(config: WorkflowConfig) {
  await fs.mkdir(path.dirname(WORKFLOW_CONFIG_FILE), { recursive: true });
  await fs.writeFile(WORKFLOW_CONFIG_FILE, JSON.stringify(config, null, 2), "utf-8");
}
