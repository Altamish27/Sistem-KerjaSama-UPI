"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock } from "lucide-react";
import { useWorkflowConfig } from "@/hooks/use-workflow-config";
import {
  getStage,
  normalizeWorkflowStage,
  ROLE_LABEL,
} from "@/lib/workflow";

interface WorkflowTimelineProps {
  stageId?: string;
  createdAt?: string;
}

export default function WorkflowTimeline({ stageId, createdAt }: WorkflowTimelineProps) {
  const { config } = useWorkflowConfig();
  const currentStageId = normalizeWorkflowStage(stageId, config.stages);
  const current = getStage(currentStageId, config.stages);
  const currentIndex = config.stages.findIndex((stage) => stage.id === currentStageId);
  const before = currentIndex > 0 ? config.stages[currentIndex - 1] : null;
  const nextOne = current.nextStageId ? getStage(current.nextStageId, config.stages) : null;
  const nextTwo = nextOne?.nextStageId ? getStage(nextOne.nextStageId, config.stages) : null;
  const createdDate = createdAt
    ? new Date(createdAt).toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "-";

  return (
    <Card className="border-slate-200 bg-slate-50/80 shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-slate-500" />
          <div>
            <CardTitle className="text-sm text-slate-800">Proses Dokumen Saat Ini</CardTitle>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Tahap berjalan, tahap selanjutnya, waktu, dan peran yang bertanggung jawab.
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="text-xs text-slate-700 space-y-1">
          <p>
            <span className="font-semibold">Tahap saat ini:</span> {current.title}
          </p>
          <p>
            <span className="font-semibold">Peran saat ini:</span>{" "}
            {current.actorRole === "system" ? "System" : ROLE_LABEL[current.actorRole]}
          </p>
          <p>
            <span className="font-semibold">Waktu pengajuan:</span> {createdDate}
          </p>
        </div>

        <div className="grid gap-3 lg:grid-cols-[1.35fr_1fr]">
          <div className="rounded-md border border-blue-200 bg-blue-50 px-3 py-3 text-xs">
            <p className="text-blue-700 font-semibold mb-1">Tahap Saat Ini (Ditonjolkan)</p>
            <p className="text-slate-900 font-semibold text-sm">{current.title}</p>
            <p className="text-slate-700 mt-1">
              Pemegang tahap: {current.actorRole === "system" ? "System" : ROLE_LABEL[current.actorRole]}
            </p>
            {before && (
              <p className="text-slate-600 mt-2">
                Before state: <span className="font-medium">{before.title}</span>
              </p>
            )}
          </div>

          <div className="rounded-md border border-slate-200 bg-white px-3 py-3 text-xs">
            <p className="text-slate-700 font-semibold mb-2">2 Step ke Depan</p>
            <div className="space-y-2">
              <div className="rounded border border-slate-200 px-2 py-2 bg-slate-50">
                <p className="font-medium text-slate-800">Step +1: {nextOne?.title || "-"}</p>
                <p className="text-slate-500 mt-0.5">
                  {nextOne
                    ? `Pemegang: ${nextOne.actorRole === "system" ? "System" : ROLE_LABEL[nextOne.actorRole]}`
                    : "Tidak ada tahap lanjutan"}
                </p>
              </div>

              <div className="rounded border border-slate-200 px-2 py-2 bg-slate-50">
                <p className="font-medium text-slate-800">Step +2: {nextTwo?.title || "-"}</p>
                <p className="text-slate-500 mt-0.5">
                  {nextTwo
                    ? `Pemegang: ${nextTwo.actorRole === "system" ? "System" : ROLE_LABEL[nextTwo.actorRole]}`
                    : "Belum ada step kedua"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
