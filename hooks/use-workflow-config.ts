"use client";

import { useCallback, useEffect, useState } from "react";
import type { WorkflowConfig } from "@/lib/workflow";
import { DEFAULT_WORKFLOW_CONFIG } from "@/lib/workflow";

export function useWorkflowConfig() {
  const [config, setConfig] = useState<WorkflowConfig>(DEFAULT_WORKFLOW_CONFIG);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/workflow-config", { cache: "no-store" });
      if (!res.ok) {
        throw new Error("Gagal memuat konfigurasi alur.");
      }
      const json = (await res.json()) as WorkflowConfig;
      setConfig(json);
    } catch (err) {
      console.error("Failed to load workflow config", err);
      setError("Tidak dapat memuat konfigurasi alur, menggunakan default.");
      setConfig(DEFAULT_WORKFLOW_CONFIG);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return { config, isLoading, error, refetch: load };
}
