'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { WorkflowStep } from '@/lib/workflow-data';
import { 
  ArrowRight, 
  ArrowDown,
  CheckCircle,
  XCircle,
  GitBranch
} from 'lucide-react';

interface SimplifiedBPMNProps {
  allSteps: WorkflowStep[];
  currentStepId: string;
  visitedSteps: string[];
}

export function SimplifiedBPMN({ allSteps, currentStepId, visitedSteps }: SimplifiedBPMNProps) {
  const currentStep = allSteps.find(s => s.id === currentStepId);
  
  // Definisi alur linear yang disederhanakan
  const mainFlow = [
    { id: 'ext-1', label: '1. Mitra Login', actor: 'MITRA' },
    { id: 'ext-2', label: '2. Submit Proposal', actor: 'MITRA' },
    { id: 'ext-3', label: '3. DKUI Terima', actor: 'DKUI' },
    { id: 'ext-4', label: '4. AI Ringkas', actor: 'DKUI' },
    { id: 'ext-5', label: '5. Simpan Database', actor: 'DKUI' },
    { id: 'ext-6', label: '6. Kirim ke Fakultas', actor: 'DKUI' },
    { id: 'ext-7', label: '7. Fakultas Review', actor: 'FAKULTAS' },
    { id: 'ext-8', label: '8. Keputusan Fakultas', actor: 'FAKULTAS', isGateway: true },
    // Path Approve
    { id: 'ext-11', label: '9. Fakultas Approve', actor: 'FAKULTAS', condition: 'approve' },
    { id: 'ext-12', label: '10. Legal Draft Dokumen', actor: 'DKUI' },
    { id: 'ext-13', label: '11. Paraf Kadiv', actor: 'DKUI' },
    { id: 'ext-14', label: '12. Kirim Biro Hukum', actor: 'DKUI' },
    { id: 'ext-15', label: '13. Biro Hukum Review', actor: 'BIRO_HUKUM' },
    { id: 'ext-16', label: '14. Keputusan Biro Hukum', actor: 'BIRO_HUKUM', isGateway: true },
    // Path Approve Biro Hukum - PARALEL
    { id: 'ext-20', label: '15. Gateway Paralel', actor: 'DKUI', isGateway: true },
    // Jalur A: Mitra
    { id: 'ext-21', label: '16A. Kirim ke Mitra', actor: 'DKUI', branch: 'A' },
    { id: 'ext-22', label: '17A. Mitra Review', actor: 'MITRA', branch: 'A' },
    { id: 'ext-23', label: '18A. Mitra TTD', actor: 'MITRA', branch: 'A' },
    { id: 'ext-24', label: '19A. Kirim ke DKUI', actor: 'MITRA', branch: 'A' },
    { id: 'ext-25', label: '20A. DKUI Terima', actor: 'DKUI', branch: 'A' },
    // Jalur B: Supervisi
    { id: 'ext-30', label: '16B. Kirim ke Warek', actor: 'DKUI', branch: 'B' },
    { id: 'ext-31', label: '17B. Warek Review', actor: 'SUPERVISI', branch: 'B' },
    { id: 'ext-32', label: '18B. Keputusan Warek', actor: 'SUPERVISI', branch: 'B', isGateway: true },
    { id: 'ext-35', label: '19B. Warek TTD Digital', actor: 'SUPERVISI', branch: 'B' },
    { id: 'ext-36', label: '20B. Kirim ke Rektor', actor: 'SUPERVISI', branch: 'B' },
    { id: 'ext-37', label: '21B. Rektor Review', actor: 'SUPERVISI', branch: 'B' },
    { id: 'ext-38', label: '22B. Keputusan Rektor', actor: 'SUPERVISI', branch: 'B', isGateway: true },
    { id: 'ext-40', label: '23B. Rektor TTD Digital', actor: 'SUPERVISI', branch: 'B' },
    { id: 'ext-41', label: '24B. Materai', actor: 'SUPERVISI', branch: 'B' },
    { id: 'ext-42', label: '25B. Kirim ke DKUI', actor: 'SUPERVISI', branch: 'B' },
    { id: 'ext-43', label: '26B. DKUI Terima', actor: 'DKUI', branch: 'B' },
    // Gabung
    { id: 'ext-45', label: '27. Pertukaran Dokumen', actor: 'DKUI' },
    { id: 'ext-46', label: '28. Arsipkan', actor: 'DKUI' },
    { id: 'ext-end', label: '29. SELESAI ✓', actor: 'DKUI', isEnd: true },
  ];

  const actorColors: Record<string, string> = {
    MITRA: 'bg-orange-500 text-white',
    DKUI: 'bg-blue-500 text-white',
    FAKULTAS: 'bg-green-500 text-white',
    BIRO_HUKUM: 'bg-purple-500 text-white',
    SUPERVISI: 'bg-teal-500 text-white'
  };

  const getStepStatus = (stepId: string) => {
    if (stepId === currentStepId) return 'current';
    if (visitedSteps.includes(stepId)) return 'completed';
    return 'pending';
  };

  // Group by branch
  const mainPath = mainFlow.filter(s => !s.branch);
  const branchA = mainFlow.filter(s => s.branch === 'A');
  const branchB = mainFlow.filter(s => s.branch === 'B');

  return (
    <Card className="p-6 bg-gradient-to-br from-slate-50 to-white">
      <div className="mb-4">
        <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
          <GitBranch className="h-5 w-5" />
          Peta Alur Lengkap (BPMN Simplified)
        </h3>
        <p className="text-sm text-muted-foreground">
          Ikuti garis biru untuk melihat jalur yang sedang Anda lalui
        </p>
      </div>

      <div className="space-y-6">
        {/* Main Path */}
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-slate-600 mb-3">Jalur Utama:</h4>
          <div className="flex flex-wrap gap-2">
            {mainPath.map((step, index) => {
              const status = getStepStatus(step.id);
              const isCurrent = step.id === currentStepId;
              
              return (
                <React.Fragment key={step.id}>
                  <div className={cn(
                    "relative transition-all duration-300",
                    isCurrent && "scale-110 z-10"
                  )}>
                    <div className={cn(
                      "px-3 py-2 rounded-lg border-2 text-xs font-medium transition-all min-w-[140px] text-center",
                      status === 'completed' && "bg-green-100 border-green-400 text-green-800",
                      status === 'current' && "bg-blue-100 border-blue-500 text-blue-900 shadow-lg ring-4 ring-blue-200",
                      status === 'pending' && "bg-gray-50 border-gray-300 text-gray-600",
                      step.isGateway && "border-dashed",
                      step.isEnd && "bg-gradient-to-r from-green-500 to-emerald-500 text-white border-green-600"
                    )}>
                      <div className="flex items-center justify-center gap-1 mb-1">
                        {step.isGateway ? (
                          <GitBranch className="h-3 w-3" />
                        ) : status === 'completed' ? (
                          <CheckCircle className="h-3 w-3" />
                        ) : null}
                        <Badge className={cn(
                          "text-[10px] px-1 py-0",
                          actorColors[step.actor as keyof typeof actorColors]
                        )}>
                          {step.actor === 'MITRA' ? 'MTA' : 
                           step.actor === 'DKUI' ? 'DKU' :
                           step.actor === 'FAKULTAS' ? 'FAK' :
                           step.actor === 'BIRO_HUKUM' ? 'BH' : 'SUP'}
                        </Badge>
                      </div>
                      <div className="leading-tight">{step.label}</div>
                      {isCurrent && (
                        <div className="absolute -top-2 -right-2">
                          <div className="bg-blue-600 text-white rounded-full h-5 w-5 flex items-center justify-center text-[10px] font-bold animate-pulse">
                            ●
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {index < mainPath.length - 1 && (
                    <div className="flex items-center">
                      {mainPath[index + 1].branch ? null : (
                        <ArrowRight className={cn(
                          "h-4 w-4",
                          status === 'completed' ? "text-green-500" : "text-gray-400"
                        )} />
                      )}
                    </div>
                  )}
                  
                  {/* Show branch split */}
                  {step.id === 'ext-20' && (
                    <div className="w-full flex items-center gap-2 my-2">
                      <div className="flex-1 border-t-2 border-dashed border-orange-400"></div>
                      <Badge className="bg-orange-100 text-orange-800 border border-orange-300">
                        SPLIT PARALEL
                      </Badge>
                      <div className="flex-1 border-t-2 border-dashed border-orange-400"></div>
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Parallel Branches */}
        <div className="grid md:grid-cols-2 gap-4 border-2 border-dashed border-orange-300 rounded-lg p-4 bg-orange-50/30">
          {/* Branch A: Mitra */}
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-orange-700 mb-2 flex items-center gap-2">
              <ArrowRight className="h-4 w-4" />
              Jalur A: Proses di Mitra
            </h4>
            <div className="space-y-2">
              {branchA.map((step, index) => {
                const status = getStepStatus(step.id);
                const isCurrent = step.id === currentStepId;
                
                return (
                  <React.Fragment key={step.id}>
                    <div className={cn(
                      "px-3 py-2 rounded-lg border-2 text-xs font-medium transition-all",
                      status === 'completed' && "bg-green-100 border-green-400 text-green-800",
                      status === 'current' && "bg-blue-100 border-blue-500 text-blue-900 shadow-lg",
                      status === 'pending' && "bg-gray-50 border-gray-300 text-gray-600",
                      isCurrent && "ring-2 ring-blue-300"
                    )}>
                      <div className="flex items-center justify-between">
                        <span>{step.label}</span>
                        <Badge className={cn("text-[10px]", actorColors[step.actor as keyof typeof actorColors])}>
                          {step.actor === 'MITRA' ? 'MITRA' : 'DKUI'}
                        </Badge>
                      </div>
                    </div>
                    {index < branchA.length - 1 && (
                      <div className="flex justify-center">
                        <ArrowDown className={cn(
                          "h-4 w-4",
                          status === 'completed' ? "text-green-500" : "text-gray-400"
                        )} />
                      </div>
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>

          {/* Branch B: Supervisi */}
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-teal-700 mb-2 flex items-center gap-2">
              <ArrowRight className="h-4 w-4" />
              Jalur B: Proses di Supervisi
            </h4>
            <div className="space-y-2">
              {branchB.map((step, index) => {
                const status = getStepStatus(step.id);
                const isCurrent = step.id === currentStepId;
                
                return (
                  <React.Fragment key={step.id}>
                    <div className={cn(
                      "px-3 py-2 rounded-lg border-2 text-xs font-medium transition-all",
                      status === 'completed' && "bg-green-100 border-green-400 text-green-800",
                      status === 'current' && "bg-blue-100 border-blue-500 text-blue-900 shadow-lg",
                      status === 'pending' && "bg-gray-50 border-gray-300 text-gray-600",
                      isCurrent && "ring-2 ring-blue-300",
                      step.isGateway && "border-dashed"
                    )}>
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1">
                          {step.isGateway && <GitBranch className="h-3 w-3" />}
                          {step.label}
                        </span>
                        <Badge className={cn("text-[10px]", actorColors[step.actor as keyof typeof actorColors])}>
                          {step.actor === 'SUPERVISI' ? 'SUP' : 'DKUI'}
                        </Badge>
                      </div>
                    </div>
                    {index < branchB.length - 1 && (
                      <div className="flex justify-center">
                        <ArrowDown className={cn(
                          "h-4 w-4",
                          status === 'completed' ? "text-green-500" : "text-gray-400"
                        )} />
                      </div>
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-4 pt-4 border-t text-xs">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-green-100 border-2 border-green-400"></div>
            <span>Sudah dilalui</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-blue-100 border-2 border-blue-500"></div>
            <span>Posisi saat ini</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-gray-50 border-2 border-gray-300"></div>
            <span>Belum dilalui</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded border-2 border-dashed border-gray-400"></div>
            <span>Gateway/Keputusan</span>
          </div>
        </div>
      </div>
    </Card>
  );
}
