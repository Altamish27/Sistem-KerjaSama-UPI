"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { CheckCircle2, Clock, XCircle, AlertTriangle, FileText, ArrowRight, GitBranch } from "lucide-react"
import { getStageLabel, getWorkflowProgress, type ProposalStatus } from "@/lib/workflow-engine"
import type { Proposal } from "@/lib/data-store"

interface ProposalTrackerEnhancedProps {
  proposal: Proposal
  compact?: boolean
}

export function ProposalTrackerEnhanced({ proposal, compact = false }: ProposalTrackerEnhancedProps) {
  const currentStatus = proposal.status as ProposalStatus
  const progress = getWorkflowProgress(currentStatus)
  const isRevision = currentStatus.includes('revision')
  const isRejected = currentStatus === 'rejected'
  const isCompleted = currentStatus === 'completed'
  
  // Define main workflow path
  const mainPath: ProposalStatus[] = [
    'submitted',
    'ai_summary',
    'verifikasi_substansi',
    'review_dkui',
    'review_hukum',
    'paraf_hukum',
    'paraf_dkui',
    'paraf_fakultas',
    'review_warek',
    'materai_warek',
    'tte_warek',
    'review_rektor',
    'materai_rektor',
    'tte_rektor',
    'pertukaran_dokumen',
    'arsip',
    'completed'
  ]
  
  // Parallel TTE paths
  const parallelMitraPath: ProposalStatus[] = [
    'review_mitra_final',
    'materai_mitra',
    'tte_mitra'
  ]
  
  const getStatusForStep = (step: ProposalStatus): 'completed' | 'current' | 'pending' | 'skipped' => {
    const stepIndex = mainPath.indexOf(step)
    const currentIndex = mainPath.indexOf(currentStatus)
    
    if (stepIndex < currentIndex) return 'completed'
    if (stepIndex === currentIndex) return 'current'
    return 'pending'
  }
  
  const getStepIcon = (status: 'completed' | 'current' | 'pending' | 'skipped') => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-5 h-5 text-emerald-600" />
      case 'current':
        return <Clock className="w-5 h-5 text-amber-600" />
      default:
        return <Clock className="w-5 h-5 text-slate-300" />
    }
  }

  return (
    <Card className="bg-gradient-to-br from-white to-slate-50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl font-bold">Status Tracking Proposal</CardTitle>
            <CardDescription className="mt-2">
              {getStageLabel(currentStatus)}
            </CardDescription>
          </div>
          <Badge 
            variant={isCompleted ? "default" : isRejected ? "destructive" : isRevision ? "secondary" : "outline"}
            className="text-lg px-4 py-2"
          >
            {progress}%
          </Badge>
        </div>
        
        {/* Progress Bar */}
        <div className="mt-4">
          <Progress value={progress} className="h-3" />
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Revision Alert */}
        {isRevision && proposal.last_revision_feedback && (
          <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-amber-900">Revisi Diperlukan</h4>
                <p className="text-sm text-amber-800 mt-1">{proposal.last_revision_feedback}</p>
                <Badge variant="outline" className="mt-2">
                  Revisi ke-{proposal.revision_count} | Sumber: {proposal.revision_source === 'dkui' ? 'DKUI' : 'Mitra'}
                </Badge>
              </div>
            </div>
          </div>
        )}
        
        {/* Rejection Alert */}
        {isRejected && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded">
            <div className="flex items-start gap-3">
              <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-red-900">Proposal Ditolak</h4>
                <p className="text-sm text-red-800 mt-1">{proposal.last_revision_feedback || 'Proposal tidak memenuhi kriteria'}</p>
              </div>
            </div>
          </div>
        )}
        
        {/* Parallel TTE Info */}
        {(currentStatus === 'review_warek' || currentStatus === 'review_mitra_final' || 
          currentStatus === 'materai_warek' || currentStatus === 'materai_mitra' ||
          currentStatus === 'tte_warek' || currentStatus === 'tte_mitra') && (
          <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
            <div className="flex items-start gap-3">
              <GitBranch className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-blue-900">Proses Paralel TTE</h4>
                <p className="text-sm text-blue-800 mt-1">Penandatanganan digital dilakukan bersamaan oleh Mitra dan Rektor</p>
                <div className="grid grid-cols-2 gap-2 mt-3">
                  <Badge variant={proposal.parallel_tte_mitra_completed ? "default" : "outline"}>
                    TTE Mitra: {proposal.parallel_tte_mitra_completed ? '✓ Selesai' : '⏳ Proses'}
                  </Badge>
                  <Badge variant={proposal.parallel_tte_rektor_completed ? "default" : "outline"}>
                    TTE Rektor: {proposal.parallel_tte_rektor_completed ? '✓ Selesai' : '⏳ Proses'}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Main Workflow Timeline */}
        <div className="space-y-3">
          <h3 className="font-semibold text-lg flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Alur Workflow Utama
          </h3>
          
          <div className="relative space-y-2 pl-6">
            {/* Vertical line */}
            <div className="absolute left-[11px] top-0 bottom-0 w-0.5 bg-slate-200" />
            
            {mainPath.map((step, index) => {
              const stepStatus = getStatusForStep(step)
              const isCurrentStep = step === currentStatus
              
              // Skip parallel steps in main timeline
              if (['review_mitra_final', 'materai_mitra', 'tte_mitra'].includes(step)) {
                return null
              }
              
              return (
                <div key={step} className="relative flex items-start gap-4">
                  {/* Icon */}
                  <div className={`absolute -left-6 z-10 ${
                    isCurrentStep 
                      ? 'ring-4 ring-amber-100 rounded-full' 
                      : ''
                  }`}>
                    {getStepIcon(stepStatus)}
                  </div>
                  
                  {/* Content */}
                  <div className={`flex-1 pb-3 ${isCurrentStep ? 'bg-amber-50 -ml-2 pl-8 pr-4 py-2 rounded-r-lg border-l-2 border-amber-400' : 'pl-6'}`}>
                    <div className="flex items-center justify-between">
                      <span className={`font-medium ${
                        stepStatus === 'completed' 
                          ? 'text-emerald-700' 
                          : isCurrentStep 
                            ? 'text-amber-900 font-semibold' 
                            : 'text-slate-400'
                      }`}>
                        {getStageLabel(step)}
                      </span>
                      {stepStatus === 'completed' && (
                        <Badge variant="outline" className="text-xs">
                          Selesai
                        </Badge>
                      )}
                      {isCurrentStep && (
                        <Badge className="bg-amber-500 text-xs">
                          Sedang Proses
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
        
        {/* Document Info */}
        <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-lg border">
          <div>
            <p className="text-xs text-slate-500 uppercase font-semibold">Jenis Dokumen</p>
            <p className="text-sm font-medium mt-1">{proposal.document_type}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 uppercase font-semibold">Mitra</p>
            <p className="text-sm font-medium mt-1">{proposal.partner_name}</p>
          </div>
          {proposal.materai_warek_url && (
            <div>
              <p className="text-xs text-slate-500 uppercase font-semibold">Materai Warek</p>
              <Badge variant="secondary" className="mt-1">✓ Terlampir</Badge>
            </div>
          )}
          {proposal.materai_rektor_url && (
            <div>
              <p className="text-xs text-slate-500 uppercase font-semibold">Materai Rektor</p>
              <Badge variant="secondary" className="mt-1">✓ Terlampir</Badge>
            </div>
          )}
          {proposal.materai_mitra_url && (
            <div>
              <p className="text-xs text-slate-500 uppercase font-semibold">Materai Mitra</p>
              <Badge variant="secondary" className="mt-1">✓ Terlampir</Badge>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
