"use client";

import { useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useWorkflowConfig } from "@/hooks/use-workflow-config";
import { useSessionUser } from "@/hooks/use-session-user";
import VisualWorkflowBuilder from "@/components/workflow/visual-workflow-builder";
import type { WorkflowConfig } from "@/lib/workflow";


export default function WorkflowConfigAdminModule() {
  const user = useSessionUser();
  const { config, isLoading, error, refetch } = useWorkflowConfig();
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  const handleSave = async (draftConfig: WorkflowConfig) => {
    setSaveError(null);
    setSaveMessage(null);

    if (!draftConfig.title.trim()) {
      setSaveError("Judul workflow wajib diisi.");
      return;
    }

    if (!draftConfig.stages.length) {
      setSaveError("Workflow minimal memiliki 1 stage.");
      return;
    }

    if (!draftConfig.revisionReturnStageId) {
      setSaveError("Revision return stage wajib dipilih.");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/workflow-config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          actorRole: user?.role,
          config: draftConfig,
        }),
      });

      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as { message?: string } | null;
        throw new Error(data?.message || "Gagal menyimpan konfigurasi.");
      }

      setSaveMessage("Workflow berhasil disimpan.");
      await refetch();
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Gagal menyimpan konfigurasi.");
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-[#e10000] rounded-full animate-spin mx-auto" />
          <p className="text-sm text-gray-500">Memuat konfigurasi workflow...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert className="border-red-200 bg-red-50">
        <AlertDescription className="text-red-800">{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {saveError && (
        <Alert className="border-red-200 bg-red-50">
          <AlertDescription className="text-red-700">{saveError}</AlertDescription>
        </Alert>
      )}

      {saveMessage && (
        <Alert className="border-emerald-200 bg-emerald-50">
          <AlertDescription className="text-emerald-700">{saveMessage}</AlertDescription>
        </Alert>
      )}

      <VisualWorkflowBuilder config={config} onSave={handleSave} saving={saving} />

      {user?.role !== "admin" && (
        <Alert className="border-amber-200 bg-amber-50">
          <AlertDescription className="text-amber-800 text-sm">
            Hanya user role admin yang bisa menyimpan perubahan.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
