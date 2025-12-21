'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { WorkflowStep } from '@/lib/workflow-data';
import { 
  CheckCircle, 
  Circle, 
  ArrowRight, 
  GitBranch,
  AlertCircle 
} from 'lucide-react';

interface FlowDiagramProps {
  allSteps: WorkflowStep[];
  currentStepId: string;
  visitedSteps: string[];
}

export function WorkflowFlowDiagram({ allSteps, currentStepId, visitedSteps }: FlowDiagramProps) {
  const actorColors: Record<string, string> = {
    MITRA: 'bg-orange-500',
    DKUI: 'bg-blue-500',
    FAKULTAS: 'bg-green-500',
    BIRO_HUKUM: 'bg-purple-500',
    SUPERVISI: 'bg-teal-500'
  };

  // Group steps by major phases
  const phases = [
    {
      name: 'Pengajuan',
      actor: 'MITRA',
      steps: allSteps.filter(s => ['ext-1', 'ext-2'].includes(s.id))
    },
    {
      name: 'Penerimaan & AI Processing',
      actor: 'DKUI',
      steps: allSteps.filter(s => ['ext-3', 'ext-4', 'ext-5', 'ext-6'].includes(s.id))
    },
    {
      name: 'Verifikasi Fakultas',
      actor: 'FAKULTAS',
      steps: allSteps.filter(s => ['ext-7', 'ext-8'].includes(s.id))
    },
    {
      name: 'Penyusunan Dokumen',
      actor: 'DKUI',
      steps: allSteps.filter(s => ['ext-12', 'ext-13', 'ext-14'].includes(s.id))
    },
    {
      name: 'Validasi Hukum',
      actor: 'BIRO_HUKUM',
      steps: allSteps.filter(s => ['ext-15', 'ext-16'].includes(s.id))
    },
    {
      name: 'Approval Supervisi',
      actor: 'SUPERVISI',
      steps: allSteps.filter(s => ['ext-31', 'ext-32', 'ext-35', 'ext-36', 'ext-37', 'ext-38', 'ext-40'].includes(s.id))
    },
    {
      name: 'Penandatanganan',
      actor: 'MITRA',
      steps: allSteps.filter(s => ['ext-22', 'ext-23', 'ext-24'].includes(s.id))
    },
    {
      name: 'Finalisasi',
      actor: 'DKUI',
      steps: allSteps.filter(s => ['ext-45', 'ext-46'].includes(s.id))
    }
  ];

  const getPhaseStatus = (phase: typeof phases[0]) => {
    const phaseStepIds = phase.steps.map(s => s.id);
    const allVisited = phaseStepIds.every(id => visitedSteps.includes(id));
    const someVisited = phaseStepIds.some(id => visitedSteps.includes(id));
    const isCurrent = phaseStepIds.includes(currentStepId);

    if (allVisited && !isCurrent) return 'completed';
    if (isCurrent || someVisited) return 'active';
    return 'pending';
  };

  return (
    <Card className="p-6 bg-gradient-to-br from-gray-50 to-white">
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2">Visualisasi Alur Proses</h3>
        <p className="text-sm text-muted-foreground">
          Posisi saat ini ditandai dengan highlight. Hijau = selesai, Biru = sedang proses, Abu = belum dimulai
        </p>
      </div>

      {/* Horizontal Flow */}
      <div className="overflow-x-auto pb-4">
        <div className="flex items-start gap-2 min-w-max">
          {phases.map((phase, index) => {
            const status = getPhaseStatus(phase);
            const isCurrent = phase.steps.some(s => s.id === currentStepId);
            
            return (
              <React.Fragment key={phase.name}>
                {/* Phase Box */}
                <div className={cn(
                  "flex-shrink-0 w-40 transition-all duration-300",
                  isCurrent && "scale-105"
                )}>
                  <div className={cn(
                    "border-2 rounded-lg p-3 transition-all duration-300",
                    status === 'completed' && "border-green-500 bg-green-50",
                    status === 'active' && "border-blue-500 bg-blue-50 shadow-lg",
                    status === 'pending' && "border-gray-300 bg-gray-50"
                  )}>
                    {/* Status Icon */}
                    <div className="flex items-center justify-between mb-2">
                      {status === 'completed' ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : status === 'active' ? (
                        <div className="relative">
                          <Circle className="h-5 w-5 text-blue-600" />
                          <div className="absolute inset-0 animate-ping">
                            <Circle className="h-5 w-5 text-blue-400 opacity-75" />
                          </div>
                        </div>
                      ) : (
                        <Circle className="h-5 w-5 text-gray-400" />
                      )}
                      <Badge 
                        className={cn(
                          "text-xs px-2 py-0",
                          actorColors[phase.actor as keyof typeof actorColors]
                        )}
                      >
                        {index + 1}
                      </Badge>
                    </div>

                    {/* Phase Name */}
                    <h4 className={cn(
                      "text-sm font-semibold mb-1",
                      status === 'completed' && "text-green-900",
                      status === 'active' && "text-blue-900",
                      status === 'pending' && "text-gray-600"
                    )}>
                      {phase.name}
                    </h4>

                    {/* Actor Badge */}
                    <div className="text-xs text-muted-foreground mb-2">
                      {phase.steps[0]?.actorLabel.split(' ')[0]}
                    </div>

                    {/* Steps Count */}
                    <div className="text-xs">
                      <div className="flex items-center gap-1">
                        <div className={cn(
                          "h-1 flex-1 rounded-full",
                          status === 'completed' && "bg-green-500",
                          status === 'active' && "bg-blue-500",
                          status === 'pending' && "bg-gray-300"
                        )} />
                      </div>
                      <span className={cn(
                        "text-xs mt-1 block",
                        status === 'completed' && "text-green-700",
                        status === 'active' && "text-blue-700",
                        status === 'pending' && "text-gray-500"
                      )}>
                        {phase.steps.length} langkah
                      </span>
                    </div>
                  </div>
                </div>

                {/* Arrow Connector */}
                {index < phases.length - 1 && (
                  <div className="flex items-center justify-center flex-shrink-0 pt-8">
                    <ArrowRight className={cn(
                      "h-6 w-6",
                      status === 'completed' ? "text-green-500" : "text-gray-400"
                    )} />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-6 mt-4 pt-4 border-t text-xs">
        <div className="flex items-center gap-2">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <span className="text-muted-foreground">Selesai</span>
        </div>
        <div className="flex items-center gap-2">
          <Circle className="h-4 w-4 text-blue-600" />
          <span className="text-muted-foreground">Sedang Proses</span>
        </div>
        <div className="flex items-center gap-2">
          <Circle className="h-4 w-4 text-gray-400" />
          <span className="text-muted-foreground">Belum Dimulai</span>
        </div>
        <div className="flex items-center gap-2">
          <GitBranch className="h-4 w-4 text-orange-600" />
          <span className="text-muted-foreground">Gateway / Keputusan</span>
        </div>
      </div>
    </Card>
  );
}
