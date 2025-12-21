'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowRight, AlertCircle, CheckCircle2, Info } from 'lucide-react';
import { WorkflowStep } from '@/lib/workflow-data';
import { cn } from '@/lib/utils';

interface NextStepPreviewProps {
  currentStep: WorkflowStep;
  allSteps: WorkflowStep[];
}

export function NextStepPreview({ currentStep, allSteps }: NextStepPreviewProps) {
  // Cari step berikutnya berdasarkan nextStepId
  const getNextSteps = () => {
    if (currentStep.type === 'end') return [];
    
    if (currentStep.type === 'gateway') {
      // Gateway punya multiple next steps
      return currentStep.conditions?.map(cond => {
        const nextStep = allSteps.find(s => s.id === cond.nextStepId);
        return {
          step: nextStep,
          condition: cond.label,
          conditionType: cond.condition
        };
      }).filter(x => x.step) || [];
    } else {
      // Activity biasa punya 1 next step
      const nextStep = allSteps.find(s => s.id === currentStep.nextStepId);
      return nextStep ? [{ step: nextStep, condition: null, conditionType: null }] : [];
    }
  };

  const nextSteps = getNextSteps();

  const actorColors: Record<string, { bg: string; text: string; label: string }> = {
    MITRA: { bg: 'bg-orange-500', text: 'text-orange-700', label: 'Mitra External' },
    DKUI: { bg: 'bg-blue-500', text: 'text-blue-700', label: 'Divisi Kerjasama' },
    FAKULTAS: { bg: 'bg-green-500', text: 'text-green-700', label: 'Fakultas/Unit' },
    BIRO_HUKUM: { bg: 'bg-purple-500', text: 'text-purple-700', label: 'Biro Hukum' },
    SUPERVISI: { bg: 'bg-teal-500', text: 'text-teal-700', label: 'Supervisi (Warek/Rektor)' }
  };

  if (currentStep.type === 'end') {
    return (
      <Card className="border-green-500 border-2 bg-gradient-to-br from-green-50 to-emerald-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-700">
            <CheckCircle2 className="h-5 w-5" />
            Proses Selesai
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-green-600">
            Anda telah menyelesaikan seluruh tahapan proses kerja sama. 
            Dokumen telah diarsipkan dan kerja sama resmi berlaku.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-blue-500 border-2 bg-gradient-to-br from-blue-50 to-indigo-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-blue-700">
          <ArrowRight className="h-5 w-5" />
          Tahap Berikutnya
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {nextSteps.length === 0 && (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Tidak ada tahap berikutnya yang terdefinisi
            </AlertDescription>
          </Alert>
        )}

        {nextSteps.length === 1 && nextSteps[0].step && (
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="mt-1">
                <div className={cn(
                  "w-3 h-3 rounded-full",
                  actorColors[nextSteps[0].step.actor]?.bg || 'bg-gray-500'
                )} />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-semibold text-sm">{nextSteps[0].step.title}</h4>
                  <Badge className={cn(
                    "text-xs",
                    actorColors[nextSteps[0].step.actor]?.bg || 'bg-gray-500',
                    "text-white"
                  )}>
                    {actorColors[nextSteps[0].step.actor]?.label || nextSteps[0].step.actor}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {nextSteps[0].step.description}
                </p>
                
                {nextSteps[0].step.duration && (
                  <div className="mt-2 text-xs text-muted-foreground flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    Estimasi waktu: {nextSteps[0].step.duration}
                  </div>
                )}
              </div>
            </div>

            <Alert className="bg-blue-50 border-blue-200">
              <Info className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800 text-xs">
                Setelah Anda klik <strong>"Next Step"</strong>, dokumen akan diteruskan ke{' '}
                <strong>{actorColors[nextSteps[0].step.actor]?.label}</strong> untuk diproses.
              </AlertDescription>
            </Alert>
          </div>
        )}

        {nextSteps.length > 1 && (
          <div className="space-y-3">
            <Alert className="bg-yellow-50 border-yellow-300">
              <AlertCircle className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-yellow-800 text-xs">
                <strong>Gateway Keputusan:</strong> Alur akan bercabang berdasarkan keputusan yang diambil.
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              {nextSteps.map((next, index) => {
                if (!next.step) return null;
                
                return (
                  <div 
                    key={next.step.id}
                    className={cn(
                      "p-3 rounded-lg border-2",
                      next.conditionType === 'approve' && "bg-green-50 border-green-300",
                      next.conditionType === 'reject' && "bg-red-50 border-red-300",
                      next.conditionType === 'revise' && "bg-yellow-50 border-yellow-300",
                      !next.conditionType && "bg-gray-50 border-gray-300"
                    )}
                  >
                    <div className="flex items-start gap-2">
                      <div className="mt-1">
                        <div className={cn(
                          "w-3 h-3 rounded-full",
                          actorColors[next.step.actor]?.bg || 'bg-gray-500'
                        )} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {next.condition && (
                            <Badge 
                              variant="outline" 
                              className={cn(
                                "text-[10px] font-bold",
                                next.conditionType === 'approve' && "border-green-500 text-green-700",
                                next.conditionType === 'reject' && "border-red-500 text-red-700",
                                next.conditionType === 'revise' && "border-yellow-500 text-yellow-700"
                              )}
                            >
                              {next.condition}
                            </Badge>
                          )}
                          <span className="text-sm font-medium">{next.step.title}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {next.step.description}
                        </p>
                        <div className="mt-1">
                          <Badge className={cn(
                            "text-[10px]",
                            actorColors[next.step.actor]?.bg || 'bg-gray-500',
                            "text-white"
                          )}>
                            → {actorColors[next.step.actor]?.label || next.step.actor}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
