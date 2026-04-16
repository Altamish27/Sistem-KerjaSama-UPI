"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus, Save, Eye, Edit2, Trash2, ArrowRight, CheckCircle2, XCircle, MessageSquare, Settings2, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { ROLE_LABEL, type AppRole, type WorkflowActionType, type WorkflowConfig, type WorkflowStage, type WorkflowStageActionConfig } from "@/lib/workflow";

type RoleOption = AppRole | "system";

const ROLE_OPTIONS: { value: RoleOption; label: string; color: string }[] = [
  { value: "mitra", label: "Mitra", color: "bg-red-50 text-red-800 border-red-200" },
  { value: "dkui", label: "DKUI", color: "bg-amber-50 text-amber-800 border-amber-200" },
  { value: "fakultas", label: "Unit/Fakultas", color: "bg-gray-100 text-gray-800 border-gray-300" },
  { value: "biro_hukum", label: "Biro Hukum", color: "bg-amber-100 text-amber-900 border-amber-300" },
  { value: "sekretaris_univ", label: "Sekretaris Univ", color: "bg-red-100 text-red-900 border-red-300" },
  { value: "warek", label: "Wakil Rektor", color: "bg-red-100 text-red-900 border-red-300" },
  { value: "rektor", label: "Rektor", color: "bg-red-100 text-red-900 border-red-300" },
  { value: "admin", label: "Admin", color: "bg-gray-100 text-gray-800 border-gray-300" },
  { value: "system", label: "System", color: "bg-gray-100 text-gray-700 border-gray-300" },
];

const ACTION_OPTIONS: { value: WorkflowActionType; label: string; icon: typeof CheckCircle2; color: string }[] = [
  { value: "advance", label: "Setuju / Lanjut", icon: CheckCircle2, color: "text-amber-600" },
  { value: "request_revision", label: "Minta Revisi", icon: MessageSquare, color: "text-gray-600" },
  { value: "reject", label: "Tolak", icon: XCircle, color: "text-[#e10000]" },
];

function getRoleColor(role: RoleOption): string {
  return ROLE_OPTIONS.find((r) => r.value === role)?.color || "bg-gray-100 text-gray-800 border-gray-300";
}

function cleanId(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/[^a-z0-9_]/g, "");
}

interface VisualWorkflowBuilderProps {
  config: WorkflowConfig;
  onSave: (config: WorkflowConfig) => Promise<void>;
  saving: boolean;
}

export default function VisualWorkflowBuilder({ config, onSave, saving }: VisualWorkflowBuilderProps) {
  const [draftConfig, setDraftConfig] = useState<WorkflowConfig>(config);
  const [selectedStageId, setSelectedStageId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"flow" | "edit" | "drag">("flow");
  const [editingStageId, setEditingStageId] = useState<string | null>(null);
  const [draggingStageId, setDraggingStageId] = useState<string | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  useEffect(() => {
    setDraftConfig(config);
    if (config.stages.length > 0 && !selectedStageId) {
      setSelectedStageId(config.stages[0].id);
    }
  }, [config]);

  const selectedStage = draftConfig.stages.find((s) => s.id === selectedStageId);
  const selectedStageActions = draftConfig.stageActionConfigs?.find((c) => c.stageId === selectedStageId);

  const updateStage = (stageId: string, patch: Partial<WorkflowStage>) => {
    setDraftConfig((prev) => ({
      ...prev,
      stages: prev.stages.map((s) => (s.id === stageId ? { ...s, ...patch } : s)),
    }));
  };

  const updateStageAction = (
    stageId: string,
    action: WorkflowActionType,
    patch: Partial<NonNullable<WorkflowStageActionConfig["actions"][WorkflowActionType]>>
  ) => {
    setDraftConfig((prev) => {
      const configs = [...(prev.stageActionConfigs || [])];
      const idx = configs.findIndex((c) => c.stageId === stageId);

      if (idx === -1) {
        configs.push({
          stageId,
          actions: {
            [action]: { enabled: true, ...patch },
          },
        });
      } else {
        const current = configs[idx];
        configs[idx] = {
          ...current,
          actions: {
            ...current.actions,
            [action]: {
              enabled: true,
              ...current.actions[action],
              ...patch,
            },
          },
        };
      }

      return { ...prev, stageActionConfigs: configs };
    });
  };

  const addNewStage = () => {
    const newId = `new_stage_${Date.now()}`;
    const newStage: WorkflowStage = {
      id: newId,
      title: "State Baru",
      description: "Deskripsi state",
      actorRole: "dkui",
      nextStageId: undefined,
    };

    setDraftConfig((prev) => ({
      ...prev,
      stages: [...prev.stages, newStage],
    }));
    setSelectedStageId(newId);
    setEditingStageId(newId);
    setViewMode("edit");
  };

  const deleteStage = (stageId: string) => {
    setDraftConfig((prev) => ({
      ...prev,
      stages: prev.stages.filter((s) => s.id !== stageId),
      stageActionConfigs: prev.stageActionConfigs?.filter((c) => c.stageId !== stageId),
    }));

    if (selectedStageId === stageId) {
      setSelectedStageId(prev.stages[0]?.id || null);
    }
  };

  const getStageConnections = (stageId: string): { action: WorkflowActionType; targetId?: string; label: string }[] => {
    const stageConfig = draftConfig.stageActionConfigs?.find((c) => c.stageId === stageId);
    if (!stageConfig) return [];

    return ACTION_OPTIONS.map((opt) => {
      const actionConfig = stageConfig.actions[opt.value];
      return {
        action: opt.value,
        targetId: actionConfig?.toStageId,
        label: actionConfig?.label || opt.label,
      };
    }).filter((conn) => conn.targetId);
  };

  const handleDragStart = (stageId: string, e: React.DragEvent) => {
    setDraggingStageId(stageId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (index: number, e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverIndex(index);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (targetIndex: number, e: React.DragEvent) => {
    e.preventDefault();
    if (!draggingStageId) return;

    const dragIndex = draftConfig.stages.findIndex((s) => s.id === draggingStageId);
    if (dragIndex === -1 || dragIndex === targetIndex) {
      setDraggingStageId(null);
      setDragOverIndex(null);
      return;
    }

    const newStages = [...draftConfig.stages];
    const [draggedStage] = newStages.splice(dragIndex, 1);
    newStages.splice(targetIndex, 0, draggedStage);

    setDraftConfig((prev) => ({
      ...prev,
      stages: newStages,
    }));

    setDraggingStageId(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggingStageId(null);
    setDragOverIndex(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Visual Workflow Builder</h2>
          <p className="text-gray-600 mt-1 text-sm md:text-base">
            Kelola alur kerja dengan tampilan visual interaktif dan mudah dipahami
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant={viewMode === "flow" ? "default" : "outline"}
            onClick={() => setViewMode("flow")}
            className="gap-2"
            size="sm"
          >
            <Eye className="w-4 h-4" />
            Lihat Alur
          </Button>
          <Button
            variant={viewMode === "drag" ? "default" : "outline"}
            onClick={() => setViewMode("drag")}
            className="gap-2"
            size="sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
            </svg>
            Drag & Drop
          </Button>
          <Button
            variant={viewMode === "edit" ? "default" : "outline"}
            onClick={() => setViewMode("edit")}
            className="gap-2"
            size="sm"
          >
            <Edit2 className="w-4 h-4" />
            Edit Detail
          </Button>
          <Button onClick={() => void onSave(draftConfig)} disabled={saving} className="gap-2 bg-[#e10000] hover:bg-[#b00000]" size="sm">
            <Save className="w-4 h-4" />
            {saving ? "Menyimpan..." : "Simpan"}
          </Button>
        </div>
      </div>

      {viewMode === "drag" && (
        <Card className="border-gray-200 bg-white shadow-sm">
          <CardHeader className="bg-gradient-to-r from-red-50 to-white border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#e10000] to-[#b00000] flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                    </svg>
                  </div>
                  Mode Drag & Drop - Susun Urutan State
                </CardTitle>
                <p className="text-sm text-gray-600 mt-1">Klik dan drag state untuk mengubah urutan workflow</p>
              </div>
              <Button onClick={addNewStage} size="sm" variant="outline" className="gap-2">
                <Plus className="w-4 h-4" />
                Tambah State
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <Alert className="mb-6 bg-amber-50 border-amber-200">
              <AlertDescription className="text-gray-700 text-sm">
                💡 <strong>Petunjuk:</strong> Klik dan tahan state, lalu geser ke posisi yang diinginkan. Urutan state akan mempengaruhi alur default workflow.
              </AlertDescription>
            </Alert>

            <div className="space-y-3">
              {draftConfig.stages.map((stage, idx) => (
                <div
                  key={stage.id}
                  draggable
                  onDragStart={(e) => handleDragStart(stage.id, e)}
                  onDragOver={(e) => handleDragOver(idx, e)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(idx, e)}
                  onDragEnd={handleDragEnd}
                  className={cn(
                    "relative border-2 rounded-xl p-5 transition-all duration-200 cursor-move group",
                    draggingStageId === stage.id ? "opacity-50 scale-95" : "opacity-100 scale-100",
                    dragOverIndex === idx && draggingStageId !== stage.id
                      ? "border-[#e10000] bg-red-50 shadow-lg ring-4 ring-red-200"
                      : "border-gray-300 bg-white hover:border-[#e10000] hover:shadow-md",
                    selectedStageId === stage.id && "ring-2 ring-[#e10000] border-[#e10000]"
                  )}
                  onClick={() => setSelectedStageId(stage.id)}
                >
                  <div className="flex items-start gap-4">
                    <div className="flex flex-col items-center gap-1">
                      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#e10000] to-[#b00000] text-white flex items-center justify-center font-bold text-xl shadow-lg group-hover:scale-110 transition-transform">
                        {idx + 1}
                      </div>
                      <div className="flex flex-col gap-1 opacity-50 group-hover:opacity-100 transition-opacity">
                        <div className="w-6 h-0.5 bg-gray-400 rounded" />
                        <div className="w-6 h-0.5 bg-gray-400 rounded" />
                        <div className="w-6 h-0.5 bg-gray-400 rounded" />
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-900 text-lg mb-1">{stage.title}</h3>
                      <p className="text-sm text-gray-600 mb-3">{stage.description}</p>
                      
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={cn("px-3 py-1.5 rounded-lg text-xs font-bold border-2", getRoleColor(stage.actorRole))}>
                          {ROLE_OPTIONS.find((r) => r.value === stage.actorRole)?.label}
                        </span>
                        <span className="text-xs text-gray-500 font-mono">ID: {stage.id}</span>
                        {stage.nextStageId && (
                          <span className="text-xs text-gray-500 flex items-center gap-1">
                            <ArrowRight className="w-3 h-3" />
                            {draftConfig.stages.find((s) => s.id === stage.nextStageId)?.title}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingStageId(stage.id);
                          setSelectedStageId(stage.id);
                          setViewMode("edit");
                        }}
                        className="text-gray-600 hover:text-[#e10000] hover:bg-red-50"
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm(`Hapus state "${stage.title}"?`)) {
                            deleteStage(stage.id);
                          }
                        }}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {dragOverIndex === idx && draggingStageId !== stage.id && (
                    <div className="absolute inset-0 border-4 border-dashed border-[#e10000] rounded-xl pointer-events-none bg-red-100/20" />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {viewMode === "flow" && (
        <div className="space-y-6">
          <Card className="border-gray-200 bg-white shadow-sm">
            <CardHeader className="bg-gradient-to-r from-gray-50 to-white border-b border-gray-200">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Alur Workflow Saat Ini</CardTitle>
                <Button onClick={addNewStage} size="sm" variant="outline" className="gap-2">
                  <Plus className="w-4 h-4" />
                  Tambah State
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {draftConfig.stages.map((stage, idx) => {
                  const connections = getStageConnections(stage.id);
                  const isSelected = selectedStageId === stage.id;

                  return (
                    <div key={stage.id} className="relative">
                      <div
                        className={cn(
                          "group relative border-2 rounded-xl p-5 transition-all duration-200 cursor-pointer",
                          isSelected
                            ? "border-[#e10000] bg-red-50 shadow-md"
                            : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm"
                        )}
                        onClick={() => setSelectedStageId(stage.id)}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 space-y-3">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#e10000] to-[#b00000] text-white flex items-center justify-center font-bold text-lg shadow-md">
                                {idx + 1}
                              </div>
                              <div>
                                <h3 className="font-bold text-gray-900 text-lg">{stage.title}</h3>
                                <p className="text-sm text-gray-600">{stage.description}</p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <span className={cn("px-3 py-1.5 rounded-lg text-xs font-semibold border", getRoleColor(stage.actorRole))}>
                                {ROLE_OPTIONS.find((r) => r.value === stage.actorRole)?.label}
                              </span>
                              <span className="text-xs text-gray-500">• ID: {stage.id}</span>
                            </div>

                            {connections.length > 0 && (
                              <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-200">
                                {connections.map((conn) => {
                                  const targetStage = draftConfig.stages.find((s) => s.id === conn.targetId);
                                  const actionInfo = ACTION_OPTIONS.find((a) => a.value === conn.action);
                                  const Icon = actionInfo?.icon || ArrowRight;

                                  return (
                                    <div
                                      key={`${stage.id}-${conn.action}`}
                                      className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 rounded-lg border border-gray-300 text-xs"
                                    >
                                      <Icon className={cn("w-3.5 h-3.5", actionInfo?.color)} />
                                      <span className="font-medium text-gray-700">{conn.label}</span>
                                      <ArrowRight className="w-3 h-3 text-gray-400" />
                                      <span className="text-gray-600">{targetStage?.title || "?"}</span>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>

                          <div className="flex flex-col gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingStageId(stage.id);
                                setViewMode("edit");
                              }}
                              className="text-gray-600 hover:text-[#e10000] hover:bg-red-50"
                            >
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (confirm(`Hapus state "${stage.title}"?`)) {
                                  deleteStage(stage.id);
                                }
                              }}
                              className="text-gray-600 hover:text-red-600 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>

                      {idx < draftConfig.stages.length - 1 && (
                        <div className="flex justify-center py-2">
                          <div className="w-0.5 h-4 bg-gradient-to-b from-gray-300 to-gray-200" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <Card className="border-gray-200 bg-white shadow-sm">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-white border-b border-gray-200">
                <CardTitle className="text-base flex items-center gap-2">
                  <Settings2 className="w-5 h-5 text-blue-600" />
                  Pengaturan Global
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="wf-title" className="text-sm font-semibold text-gray-700">
                    Judul Workflow
                  </Label>
                  <Input
                    id="wf-title"
                    value={draftConfig.title}
                    onChange={(e) => setDraftConfig((prev) => ({ ...prev, title: e.target.value }))}
                    className="border-gray-300"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-700">Stage Saat Revisi</Label>
                  <Select
                    value={draftConfig.revisionReturnStageId || ""}
                    onValueChange={(value) => setDraftConfig((prev) => ({ ...prev, revisionReturnStageId: value }))}
                  >
                    <SelectTrigger className="border-gray-300">
                      <SelectValue placeholder="Pilih stage revisi" />
                    </SelectTrigger>
                    <SelectContent>
                      {draftConfig.stages.map((stage) => (
                        <SelectItem key={stage.id} value={stage.id}>
                          {stage.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card className="border-gray-200 bg-white shadow-sm">
              <CardHeader className="bg-gradient-to-r from-amber-50 to-white border-b border-gray-200">
                <CardTitle className="text-base flex items-center gap-2">
                  <Info className="w-5 h-5 text-amber-600" />
                  Informasi Workflow
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5 space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Total State:</span>
                  <span className="font-bold text-gray-900">{draftConfig.stages.length}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Stage Terpilih:</span>
                  <span className="font-semibold text-[#e10000]">{selectedStage?.title || "-"}</span>
                </div>
                <div className="pt-2 border-t border-gray-200">
                  <p className="text-xs text-gray-500">
                    Klik pada state untuk melihat detail, atau klik tombol Edit untuk mengubah konfigurasi state dan aksi.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {viewMode === "edit" && selectedStage && (
        <div className="space-y-6">
          <Card className="border-gray-200 bg-white shadow-lg">
            <CardHeader className="bg-gradient-to-r from-gray-50 to-white border-b border-gray-200">
              <CardTitle className="text-lg">Edit State: {selectedStage.title}</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="stage-id" className="text-sm font-semibold text-gray-700">
                    ID State
                  </Label>
                  <Input
                    id="stage-id"
                    value={selectedStage.id}
                    onChange={(e) => {
                      const newId = cleanId(e.target.value);
                      if (newId) updateStage(selectedStage.id, { id: newId });
                    }}
                    className="border-gray-300 font-mono text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="stage-title" className="text-sm font-semibold text-gray-700">
                    Nama State
                  </Label>
                  <Input
                    id="stage-title"
                    value={selectedStage.title}
                    onChange={(e) => updateStage(selectedStage.id, { title: e.target.value })}
                    className="border-gray-300"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="stage-desc" className="text-sm font-semibold text-gray-700">
                    Deskripsi
                  </Label>
                  <Textarea
                    id="stage-desc"
                    value={selectedStage.description}
                    onChange={(e) => updateStage(selectedStage.id, { description: e.target.value })}
                    className="border-gray-300 min-h-24"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-700">Role Pelaksana</Label>
                  <Select
                    value={selectedStage.actorRole}
                    onValueChange={(value) => updateStage(selectedStage.id, { actorRole: value as RoleOption })}
                  >
                    <SelectTrigger className="border-gray-300">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ROLE_OPTIONS.map((role) => (
                        <SelectItem key={role.value} value={role.value}>
                          {role.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-700">Default Lanjut Ke</Label>
                  <Select
                    value={selectedStage.nextStageId || "__none__"}
                    onValueChange={(value) =>
                      updateStage(selectedStage.id, {
                        nextStageId: value === "__none__" ? undefined : value,
                      })
                    }
                  >
                    <SelectTrigger className="border-gray-300">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">Tanpa next stage</SelectItem>
                      {draftConfig.stages
                        .filter((s) => s.id !== selectedStage.id)
                        .map((stage) => (
                          <SelectItem key={stage.id} value={stage.id}>
                            {stage.title}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-gray-200 bg-white shadow-lg">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-white border-b border-gray-200">
              <CardTitle className="text-lg">Konfigurasi Aksi</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid gap-4 lg:grid-cols-3">
                {ACTION_OPTIONS.map((opt) => {
                  const actionConfig = selectedStageActions?.actions[opt.value];
                  const Icon = opt.icon;
                  const enabled = actionConfig?.enabled || false;

                  return (
                    <div key={opt.value} className="border-2 border-gray-200 rounded-xl p-4 space-y-4 bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Icon className={cn("w-5 h-5", opt.color)} />
                          <span className="font-semibold text-gray-900">{opt.label}</span>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={enabled}
                            onChange={(e) =>
                              updateStageAction(selectedStage.id, opt.value, {
                                enabled: e.target.checked,
                                label: actionConfig?.label || opt.label,
                              })
                            }
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#e10000]"></div>
                        </label>
                      </div>

                      {enabled && (
                        <>
                          <div className="space-y-2">
                            <Label className="text-xs font-medium text-gray-700">Label Tombol</Label>
                            <Input
                              value={actionConfig?.label || opt.label}
                              onChange={(e) => updateStageAction(selectedStage.id, opt.value, { label: e.target.value })}
                              className="h-9 text-sm border-gray-300"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label className="text-xs font-medium text-gray-700">Pindah ke State</Label>
                            <Select
                              value={actionConfig?.toStageId || "__none__"}
                              onValueChange={(value) =>
                                updateStageAction(selectedStage.id, opt.value, {
                                  toStageId: value === "__none__" ? undefined : value,
                                })
                              }
                            >
                              <SelectTrigger className="h-9 text-sm border-gray-300">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="__none__">Tetap di state ini</SelectItem>
                                {draftConfig.stages.map((toStage) => (
                                  <SelectItem key={toStage.id} value={toStage.id}>
                                    {toStage.title}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <label className="flex items-center gap-2 text-xs text-gray-700">
                            <input
                              type="checkbox"
                              checked={actionConfig?.requireComment || false}
                              onChange={(e) => updateStageAction(selectedStage.id, opt.value, { requireComment: e.target.checked })}
                              className="w-4 h-4 text-[#e10000] border-gray-300 rounded focus:ring-[#e10000]"
                            />
                            Wajib isi komentar
                          </label>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button onClick={() => setViewMode("flow")} variant="outline" className="gap-2">
              <Eye className="w-4 h-4" />
              Kembali ke Tampilan Alur
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
