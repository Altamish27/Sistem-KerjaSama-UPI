'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { 
  Building2, 
  FileText, 
  Users, 
  Scale, 
  UserCheck,
  Clock,
  CheckCircle,
  Circle,
  AlertTriangle
} from 'lucide-react';

interface TrackingDashboardProps {
  currentStepId: string;
  visitedSteps: string[];
  totalSteps: number;
}

export function WorkflowTrackingDashboard({ 
  currentStepId, 
  visitedSteps,
  totalSteps 
}: TrackingDashboardProps) {
  // Calculate progress
  const progressPercentage = Math.round((visitedSteps.length / totalSteps) * 100);

  // Define actors and their progress
  const actors = [
    {
      id: 'MITRA',
      name: 'Mitra External',
      icon: Building2,
      color: 'orange',
      steps: ['ext-1', 'ext-2', 'ext-10b', 'ext-22', 'ext-23', 'ext-24', 'ext-34b']
    },
    {
      id: 'DKUI',
      name: 'DKUI',
      icon: FileText,
      color: 'blue',
      steps: ['ext-3', 'ext-4', 'ext-5', 'ext-6', 'ext-10', 'ext-12', 'ext-13', 'ext-14', 'ext-18', 'ext-20', 'ext-21', 'ext-25', 'ext-30', 'ext-34', 'ext-43', 'ext-45', 'ext-46']
    },
    {
      id: 'FAKULTAS',
      name: 'Fakultas/Unit',
      icon: Users,
      color: 'green',
      steps: ['ext-7', 'ext-8', 'ext-9', 'ext-11']
    },
    {
      id: 'BIRO_HUKUM',
      name: 'Biro Hukum',
      icon: Scale,
      color: 'purple',
      steps: ['ext-15', 'ext-16', 'ext-17', 'ext-19']
    },
    {
      id: 'SUPERVISI',
      name: 'Supervisi',
      icon: UserCheck,
      color: 'teal',
      steps: ['ext-31', 'ext-32', 'ext-33', 'ext-35', 'ext-36', 'ext-37', 'ext-38', 'ext-40', 'ext-41', 'ext-42']
    }
  ];

  const getActorStatus = (actor: typeof actors[0]) => {
    const completedSteps = actor.steps.filter(id => visitedSteps.includes(id)).length;
    const totalActorSteps = actor.steps.length;
    const isActive = actor.steps.includes(currentStepId);
    const progress = totalActorSteps > 0 ? Math.round((completedSteps / totalActorSteps) * 100) : 0;

    return {
      completed: completedSteps,
      total: totalActorSteps,
      progress,
      isActive,
      status: completedSteps === totalActorSteps ? 'completed' : 
              isActive ? 'active' : 
              completedSteps > 0 ? 'in-progress' : 'pending'
    };
  };

  // Calculate estimated time remaining (mock)
  const getEstimatedTime = () => {
    const remaining = totalSteps - visitedSteps.length;
    if (remaining === 0) return 'Selesai';
    if (remaining < 5) return '1-2 hari';
    if (remaining < 15) return '3-5 hari';
    return '1-2 minggu';
  };

  return (
    <div className="space-y-4">
      {/* Overall Progress */}
      <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-white">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Progress Keseluruhan</CardTitle>
            <Badge className="text-lg px-3 py-1">{progressPercentage}%</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <Progress value={progressPercentage} className="h-3" />
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Langkah Selesai</p>
              <p className="text-2xl font-bold text-green-600">{visitedSteps.length}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Total Langkah</p>
              <p className="text-2xl font-bold">{totalSteps}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Estimasi Waktu</p>
              <p className="text-2xl font-bold text-blue-600">{getEstimatedTime()}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actor Progress */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Status Per Aktor
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {actors.map((actor) => {
            const status = getActorStatus(actor);
            const Icon = actor.icon;
            
            return (
              <div 
                key={actor.id}
                className={cn(
                  "border rounded-lg p-3 transition-all duration-300",
                  status.isActive && "border-2 border-blue-500 bg-blue-50 shadow-md"
                )}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "h-10 w-10 rounded-full flex items-center justify-center",
                      `bg-${actor.color}-100`
                    )}>
                      <Icon className={cn("h-5 w-5", `text-${actor.color}-600`)} />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{actor.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {status.completed} dari {status.total} langkah
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {status.status === 'completed' && (
                      <Badge className="bg-green-600">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Selesai
                      </Badge>
                    )}
                    {status.status === 'active' && (
                      <Badge className="bg-blue-600 animate-pulse">
                        <Circle className="h-3 w-3 mr-1" />
                        Aktif
                      </Badge>
                    )}
                    {status.status === 'in-progress' && (
                      <Badge variant="secondary">
                        <Clock className="h-3 w-3 mr-1" />
                        Proses
                      </Badge>
                    )}
                    {status.status === 'pending' && (
                      <Badge variant="outline">
                        Menunggu
                      </Badge>
                    )}
                  </div>
                </div>
                
                <div className="space-y-1">
                  <Progress 
                    value={status.progress} 
                    className={cn(
                      "h-2",
                      status.isActive && "animate-pulse"
                    )}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{status.progress}% selesai</span>
                    {status.isActive && (
                      <span className="text-blue-600 font-medium">← Sedang di sini</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Key Milestones */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Milestone Utama</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {[
            { name: 'Proposal Diterima', stepId: 'ext-3', icon: FileText },
            { name: 'Disetujui Fakultas', stepId: 'ext-11', icon: Users },
            { name: 'Lolos Biro Hukum', stepId: 'ext-19', icon: Scale },
            { name: 'Disetujui Rektor', stepId: 'ext-40', icon: UserCheck },
            { name: 'Dokumen Diarsipkan', stepId: 'ext-46', icon: CheckCircle }
          ].map((milestone, index) => {
            const isCompleted = visitedSteps.includes(milestone.stepId);
            const isCurrent = currentStepId === milestone.stepId;
            const MilestoneIcon = milestone.icon;

            return (
              <div 
                key={index}
                className={cn(
                  "flex items-center gap-3 p-2 rounded-lg transition-colors",
                  isCurrent && "bg-blue-100",
                  isCompleted && !isCurrent && "bg-green-50"
                )}
              >
                <div className={cn(
                  "h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0",
                  isCompleted ? "bg-green-600" : isCurrent ? "bg-blue-600" : "bg-gray-300"
                )}>
                  {isCompleted ? (
                    <CheckCircle className="h-4 w-4 text-white" />
                  ) : (
                    <MilestoneIcon className={cn(
                      "h-4 w-4",
                      isCurrent ? "text-white" : "text-gray-600"
                    )} />
                  )}
                </div>
                <div className="flex-1">
                  <p className={cn(
                    "text-sm font-medium",
                    isCompleted && "text-green-900",
                    isCurrent && "text-blue-900"
                  )}>
                    {milestone.name}
                  </p>
                </div>
                {isCurrent && (
                  <Badge variant="default" className="text-xs">
                    Sekarang
                  </Badge>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
