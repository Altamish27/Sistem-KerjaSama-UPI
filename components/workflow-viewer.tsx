'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  ChevronRight, 
  ChevronLeft, 
  PlayCircle, 
  CheckCircle, 
  XCircle,
  Upload,
  Inbox,
  Cpu,
  Save,
  Share2,
  CheckSquare,
  GitBranch,
  FilePlus,
  PenTool,
  Send,
  FileText,
  MessageSquare,
  Edit,
  Eye,
  CornerUpLeft,
  Archive,
  Repeat,
  Clock
} from 'lucide-react';
import { WorkflowData, WorkflowStep } from '@/lib/workflow-data';
import { cn } from '@/lib/utils';
import {
  LoginMockup,
  UploadProposalMockup,
  ReviewDocumentMockup,
  DigitalSignatureMockup,
  DocumentTrackingMockup,
  ArchiveMockup,
  FeedbackMockup,
  SimpleActivityMockup
} from '@/components/workflow-ui-mockups';
import { WorkflowFlowDiagram } from '@/components/workflow-flow-diagram';
import { WorkflowTrackingDashboard } from '@/components/workflow-tracking-dashboard';
import { RefreshCw } from 'lucide-react';

interface WorkflowViewerProps {
  workflow: WorkflowData;
}

const iconMap: Record<string, React.ComponentType<any>> = {
  'play-circle': PlayCircle,
  'check-circle': CheckCircle,
  'x-circle': XCircle,
  'upload': Upload,
  'inbox': Inbox,
  'cpu': Cpu,
  'save': Save,
  'share-2': Share2,
  'check-square': CheckSquare,
  'git-branch': GitBranch,
  'file-plus': FilePlus,
  'pen-tool': PenTool,
  'send': Send,
  'file-text': FileText,
  'message-square': MessageSquare,
  'edit': Edit,
  'eye': Eye,
  'corner-up-left': CornerUpLeft,
  'archive': Archive,
  'repeat': Repeat,
  'clock': Clock,
  'edit-3': Edit
};

const actorColors: Record<string, { bg: string; text: string; border: string }> = {
  MITRA: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-300' },
  DKUI: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-300' },
  FAKULTAS: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-300' },
  BIRO_HUKUM: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-300' },
  SUPERVISI: { bg: 'bg-teal-50', text: 'text-teal-700', border: 'border-teal-300' }
};

export function WorkflowViewer({ workflow }: WorkflowViewerProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [visitedSteps, setVisitedSteps] = useState<string[]>([]);
  const [stepHistory, setStepHistory] = useState<string[]>([]);

  // Initialize first step
  useEffect(() => {
    const startStep = workflow.steps.find(s => s.id === workflow.startStepId);
    if (startStep) {
      setVisitedSteps([startStep.id]);
      setStepHistory([startStep.id]);
    }
  }, [workflow]);

  const currentStep = workflow.steps[currentStepIndex];
  const Icon = currentStep ? iconMap[currentStep.icon] || PlayCircle : PlayCircle;
  const actorStyle = currentStep ? actorColors[currentStep.actor] : actorColors.MITRA;

  const handleNext = (nextStepId?: string) => {
    if (!currentStep) return;

    let targetStepId: string | undefined;

    // Jika gateway dengan pilihan
    if (currentStep.conditions && !nextStepId) {
      // Jangan otomatis next jika ada pilihan
      return;
    }

    // Jika dipilih dari kondisi gateway
    if (nextStepId) {
      targetStepId = nextStepId;
    } 
    // Jika langkah biasa dengan nextSteps
    else if (currentStep.nextSteps && currentStep.nextSteps.length > 0) {
      targetStepId = currentStep.nextSteps[0];
    }

    if (targetStepId) {
      const nextIndex = workflow.steps.findIndex(s => s.id === targetStepId);
      if (nextIndex !== -1) {
        setCurrentStepIndex(nextIndex);
        setVisitedSteps(prev => [...new Set([...prev, targetStepId!])]);
        setStepHistory(prev => [...prev, targetStepId!]);
      }
    }
  };

  const handlePrevious = () => {
    if (stepHistory.length > 1) {
      const newHistory = [...stepHistory];
      newHistory.pop(); // Remove current
      const previousStepId = newHistory[newHistory.length - 1];
      const prevIndex = workflow.steps.findIndex(s => s.id === previousStepId);
      
      if (prevIndex !== -1) {
        setCurrentStepIndex(prevIndex);
        setStepHistory(newHistory);
      }
    }
  };

  const handleReset = () => {
    const startStep = workflow.steps.find(s => s.id === workflow.startStepId);
    if (startStep) {
      const startIndex = workflow.steps.findIndex(s => s.id === workflow.startStepId);
      setCurrentStepIndex(startIndex);
      setVisitedSteps([startStep.id]);
      setStepHistory([startStep.id]);
    }
  };

  const getStepNumber = () => {
    return stepHistory.length;
  };

  const isEndStep = currentStep?.type === 'end';
  const canGoNext = !isEndStep && (
    (currentStep?.nextSteps && currentStep.nextSteps.length > 0) ||
    (currentStep?.conditions && currentStep.conditions.length > 0)
  );
  const canGoPrevious = stepHistory.length > 1;
  // Render UI Mockup based on step type
  const renderUIMockup = () => {
    if (!currentStep?.uiMockup) return null;

    switch (currentStep.uiMockup) {
      case 'login':
        return <LoginMockup actor={currentStep.actor} />;
      case 'upload':
        return <UploadProposalMockup />;
      case 'review':
        return <ReviewDocumentMockup actor={currentStep.actor} />;
      case 'sign':
        return <DigitalSignatureMockup role={currentStep.actorLabel} />;
      case 'tracking':
        return <DocumentTrackingMockup />;
      case 'archive':
        return <ArchiveMockup />;
      case 'feedback':
        return <FeedbackMockup type={currentStep.id.includes('reject') ? 'rejection' : 'revision'} />;
      case 'processing':
        return (
          <SimpleActivityMockup
            title={currentStep.title}
            description={currentStep.description}
            icon={iconMap[currentStep.icon]}
            processing={true}
          />
        );
      case 'simple':
        return (
          <SimpleActivityMockup
            title={currentStep.title}
            description={currentStep.description}
            icon={iconMap[currentStep.icon]}
          />
        );
      default:
        return null;
    }
  };
  return (
    <div className="space-y-6">
      {/* Flow Diagram Visualization */}
      <WorkflowFlowDiagram 
        allSteps={workflow.steps}
        currentStepId={currentStep?.id || ''}
        visitedSteps={visitedSteps}
      />

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column: Main Workflow (2 columns) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Progress Info */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Langkah {getStepNumber()}</h3>
              <p className="text-sm text-muted-foreground">
                {visitedSteps.length} dari {workflow.steps.length} langkah telah dilalui
              </p>
            </div>
            <Button onClick={handleReset} variant="outline" size="sm">
              <RefreshCw className="mr-2 h-4 w-4" />
              Reset Alur
            </Button>
          </div>

          {/* Current Step Card */}
          <Card className={cn(
            "border-2 transition-all duration-300 animate-in fade-in slide-in-from-bottom-4",
            actorStyle.border
          )}>
        <CardHeader className={cn(actorStyle.bg, "transition-colors duration-300")}>
          <div className="flex items-start justify-between">
            <div className="flex-1 animate-in fade-in slide-in-from-left-2 duration-500">
              <Badge className={cn("mb-2", actorStyle.text, "bg-white shadow-sm")}>
                {currentStep?.actorLabel}
              </Badge>
              <CardTitle className="flex items-center gap-2">
                <Icon className="h-6 w-6 animate-in zoom-in duration-300" />
                {currentStep?.title}
              </CardTitle>
              <CardDescription className="mt-1">
                {currentStep?.description}
              </CardDescription>
            </div>
            <Badge 
              variant={currentStep?.type === 'end' ? 'default' : 'secondary'}
              className="ml-4 animate-in zoom-in duration-300"
            >
              {currentStep?.type === 'start' && 'Start'}
              {currentStep?.type === 'activity' && 'Aktivitas'}
              {currentStep?.type === 'gateway' && 'Keputusan'}
              {currentStep?.type === 'end' && 'Selesai'}
            </Badge>
          </div>
        </CardHeader>

        {/* Gateway Conditions */}
        {currentStep?.conditions && currentStep.conditions.length > 0 && (
          <CardContent className="pt-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <p className="text-sm font-medium mb-3">Pilih keputusan:</p>
            <div className="grid gap-3">
              {currentStep.conditions.map((condition, index) => (
                <Button
                  key={condition.nextStep}
                  onClick={() => handleNext(condition.nextStep)}
                  variant={condition.type === 'approve' ? 'default' : 'destructive'}
                  className="w-full justify-start animate-in slide-in-from-left-4 hover:scale-105 transition-transform"
                  style={{ animationDelay: `${index * 100}ms` }}
                  size="lg"
                >
                  {condition.type === 'approve' ? (
                    <CheckCircle className="mr-2 h-5 w-5" />
                  ) : (
                    <XCircle className="mr-2 h-5 w-5" />
                  )}
                  {condition.label}
                </Button>
              ))}
            </div>
          </CardContent>
        )}

        {/* End Step Info */}
        {isEndStep && (
          <CardContent className="pt-6 animate-in fade-in zoom-in duration-500">
            <Alert className={cn(
              currentStep.id.includes('reject') 
                ? 'border-red-200 bg-red-50' 
                : 'border-green-200 bg-green-50'
            )}>
              <AlertDescription className="flex items-center gap-2">
                {currentStep.id.includes('reject') ? (
                  <>
                    <XCircle className="h-5 w-5 text-red-600 animate-in zoom-in duration-300" />
                    <span className="font-medium text-red-900">
                      Proses berakhir dengan penolakan
                    </span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-5 w-5 text-green-600 animate-in zoom-in duration-300" />
                    <span className="font-medium text-green-900">
                      Proses berhasil diselesaikan!
                    </span>
                  </>
                )}
              </AlertDescription>
            </Alert>
          </CardContent>
        )}
      </Card>

      {/* UI Mockup Display */}
      {renderUIMockup() && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          {renderUIMockup()}
        </div>
      )}

      {/* Navigation Controls */}
      <div className="flex items-center justify-between gap-4">
        <Button
          onClick={handlePrevious}
          disabled={!canGoPrevious}
          variant="outline"
          size="lg"
          className="hover:scale-105 transition-transform disabled:scale-100"
        >
          <ChevronLeft className="mr-2 h-5 w-5" />
          Kembali
        </Button>

        <div className="text-center text-sm text-muted-foreground">
          Step {currentStepIndex + 1} dari {workflow.steps.length}
        </div>

        <Button
          onClick={() => handleNext()}
          disabled={!canGoNext || (currentStep?.conditions && currentStep.conditions.length > 0)}
          size="lg"
          className="hover:scale-105 transition-transform disabled:scale-100"
        >
          Lanjut
          <ChevronRight className="ml-2 h-5 w-5" />
        </Button>
      </div>

      {/* Step History Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Riwayat Langkah</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {stepHistory.map((stepId, index) => {
              const step = workflow.steps.find(s => s.id === stepId);
              if (!step) return null;
              
              const stepActorStyle = actorColors[step.actor];
              const isCurrent = index === stepHistory.length - 1;

              return (
                <div
                  key={`${stepId}-${index}`}
                  className={cn(
                    "flex items-center gap-3 p-2 rounded-lg transition-colors",
                    isCurrent ? stepActorStyle.bg : "bg-muted/50"
                  )}
                >
                  <div className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full text-xs font-medium",
                    isCurrent ? "bg-primary text-primary-foreground" : "bg-muted"
                  )}>
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={cn(
                      "text-sm font-medium truncate",
                      isCurrent && "font-semibold"
                    )}>
                      {step.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {step.actorLabel}
                    </p>
                  </div>
                  {isCurrent && (
                    <Badge variant="default" className="text-xs">
                      Saat ini
                    </Badge>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
        </div>

        {/* Right Column: Tracking Dashboard (1 column) */}
        <div className="lg:col-span-1">
          <div className="sticky top-6">
            <WorkflowTrackingDashboard 
              currentStepId={currentStep?.id || ''}
              visitedSteps={visitedSteps}
              totalSteps={workflow.steps.length}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
