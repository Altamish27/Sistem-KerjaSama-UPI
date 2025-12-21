'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronRight, MapPin } from 'lucide-react';
import { WorkflowStep } from '@/lib/workflow-data';
import { cn } from '@/lib/utils';

interface BreadcrumbTrailProps {
  allSteps: WorkflowStep[];
  visitedSteps: string[];
  currentStepId: string;
}

export function BreadcrumbTrail({ allSteps, visitedSteps, currentStepId }: BreadcrumbTrailProps) {
  // Ambil 5 step terakhir yang dikunjungi + step saat ini
  const trail = visitedSteps
    .slice(-5)
    .map(id => allSteps.find(s => s.id === id))
    .filter(Boolean) as WorkflowStep[];

  const currentStep = allSteps.find(s => s.id === currentStepId);
  
  // Tambahkan current step jika belum ada di trail
  if (currentStep && !trail.find(s => s.id === currentStepId)) {
    trail.push(currentStep);
  }

  const actorColors: Record<string, string> = {
    MITRA: 'bg-orange-100 text-orange-700 border-orange-300',
    DKUI: 'bg-blue-100 text-blue-700 border-blue-300',
    FAKULTAS: 'bg-green-100 text-green-700 border-green-300',
    BIRO_HUKUM: 'bg-purple-100 text-purple-700 border-purple-300',
    SUPERVISI: 'bg-teal-100 text-teal-700 border-teal-300'
  };

  return (
    <Card className="p-4 bg-gradient-to-r from-slate-50 to-gray-50">
      <div className="flex items-center gap-2 mb-3">
        <MapPin className="h-4 w-4 text-blue-600" />
        <h3 className="text-sm font-semibold text-gray-700">Jejak Perjalanan Anda:</h3>
      </div>
      
      <div className="flex items-center gap-2 flex-wrap">
        {trail.length === 0 && (
          <p className="text-xs text-muted-foreground">Belum ada langkah yang dilalui</p>
        )}
        
        {trail.map((step, index) => {
          const isCurrent = step.id === currentStepId;
          
          return (
            <React.Fragment key={step.id}>
              <div className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all",
                isCurrent 
                  ? "bg-blue-600 text-white border-blue-700 shadow-lg scale-105" 
                  : actorColors[step.actor] || "bg-gray-100 text-gray-600"
              )}>
                <Badge 
                  variant="outline" 
                  className={cn(
                    "text-[10px] px-1.5 py-0",
                    isCurrent ? "bg-blue-500 text-white border-blue-400" : ""
                  )}
                >
                  {index + 1}
                </Badge>
                <span className="text-xs font-medium truncate max-w-[150px]">
                  {step.title}
                </span>
                {isCurrent && (
                  <Badge className="bg-white text-blue-600 text-[10px] px-1.5 py-0">
                    NOW
                  </Badge>
                )}
              </div>
              
              {index < trail.length - 1 && (
                <ChevronRight className="h-4 w-4 text-gray-400 flex-shrink-0" />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {trail.length > 0 && (
        <div className="mt-3 pt-3 border-t text-xs text-muted-foreground">
          Anda telah melewati <strong>{visitedSteps.length}</strong> dari{' '}
          <strong>{allSteps.length}</strong> tahapan total
        </div>
      )}
    </Card>
  );
}
