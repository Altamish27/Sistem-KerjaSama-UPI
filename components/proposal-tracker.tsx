"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, Clock, XCircle, AlertCircle, ArrowRight } from "lucide-react"
import type { Proposal } from "@/lib/mock-data"
import { getWorkflowSteps, getCurrentStepIndex } from "@/lib/workflow-utils"

interface ProposalTrackerProps {
  proposal: Proposal
  compact?: boolean
}

export function ProposalTracker({ proposal, compact = false }: ProposalTrackerProps) {
  const workflowSteps = getWorkflowSteps(proposal.initiator)
  const currentStepIndex = getCurrentStepIndex(proposal.status, proposal.initiator)
  const isRejected = proposal.status === "rejected"
  const isCompleted = proposal.status === "completed"

  // Mendapatkan informasi proses selanjutnya
  const nextStep =
    !isRejected && !isCompleted && currentStepIndex < workflowSteps.length - 1
      ? workflowSteps[currentStepIndex + 1]
      : null

  return (
    <Card className="bg-slate-900/50 border-slate-800">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-white">Status Tracking</CardTitle>
            <CardDescription className="text-slate-400">Progress dan riwayat persetujuan proposal</CardDescription>
          </div>
          {nextStep && (
            <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30">
              <ArrowRight className="w-3 h-3 mr-1" />
              Selanjutnya: {nextStep.label}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Timeline Progress */}
        <div className="relative">
          <div className={`space-y-4 ${compact ? "max-h-96 overflow-y-auto pr-2" : ""}`}>
            {workflowSteps.map((step, index) => {
              const isCompleted = index < currentStepIndex
              const isCurrent = index === currentStepIndex
              const isRejectedAtThis = isRejected && isCurrent
              const isPending = index > currentStepIndex && !isRejected

              // Cari history yang sesuai dengan step ini
              const historyForStep = proposal.approvalHistory.find((h) => {
                const historyStep = workflowSteps.find((ws) => h.timestamp && ws.status === proposal.status)
                return historyStep?.status === step.status
              })

              // Untuk step yang sudah selesai, cari history terakhir sebelum index ini
              const completedHistory = isCompleted
                ? proposal.approvalHistory[Math.min(index, proposal.approvalHistory.length - 1)]
                : null

              const displayHistory = historyForStep || completedHistory

              return (
                <div key={step.status} className="flex gap-4 relative">
                  {/* Connector Line */}
                  {index < workflowSteps.length - 1 && (
                    <div
                      className={`absolute left-5 top-12 w-0.5 h-full -ml-px ${
                        isCompleted ? "bg-emerald-500" : isRejectedAtThis ? "bg-red-500" : "bg-slate-700"
                      }`}
                    />
                  )}

                  {/* Icon */}
                  <div className="flex-shrink-0 z-10">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                        isRejectedAtThis
                          ? "bg-red-500/20 border-red-500 text-red-400 shadow-lg shadow-red-500/20"
                          : isCompleted
                            ? "bg-emerald-500/20 border-emerald-500 text-emerald-400 shadow-lg shadow-emerald-500/20"
                            : isCurrent
                              ? "bg-blue-500/20 border-blue-500 text-blue-400 shadow-lg shadow-blue-500/20 animate-pulse"
                              : "bg-slate-800 border-slate-700 text-slate-500"
                      }`}
                    >
                      {isRejectedAtThis ? (
                        <XCircle className="w-5 h-5" />
                      ) : isCompleted ? (
                        <CheckCircle2 className="w-5 h-5" />
                      ) : isCurrent ? (
                        <Clock className="w-5 h-5" />
                      ) : (
                        <AlertCircle className="w-5 h-5" />
                      )}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 pb-8">
                    <div className="bg-slate-800/30 rounded-lg p-4 border border-slate-700/50">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <h4 className="text-sm font-semibold text-white">{step.label}</h4>
                          <p className="text-xs text-slate-400 mt-0.5">
                            {isCompleted ? "Selesai" : isCurrent ? "Sedang Berlangsung" : isPending ? "Menunggu" : ""}
                          </p>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-xs ${
                            isCompleted
                              ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/20"
                              : isCurrent
                                ? "bg-blue-500/10 text-blue-300 border-blue-500/20"
                                : "bg-slate-700/30 text-slate-500 border-slate-600/30"
                          }`}
                        >
                          {step.role === "system" ? "Sistem" : step.role.replace("_", " ").toUpperCase()}
                        </Badge>
                      </div>

                      {/* History Info */}
                      {(isCompleted || isCurrent) && displayHistory && (
                        <div className="mt-3 pt-3 border-t border-slate-700/50 space-y-2">
                          <div className="flex items-center gap-2 text-xs">
                            <span className="text-slate-400">Oleh:</span>
                            <span className="text-white font-medium">{displayHistory.actorName}</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs">
                            <span className="text-slate-400">Waktu:</span>
                            <span className="text-slate-300">
                              {new Date(displayHistory.timestamp).toLocaleString("id-ID", {
                                dateStyle: "long",
                                timeStyle: "short",
                              })}
                            </span>
                          </div>
                          {displayHistory.comment && (
                            <div className="mt-2">
                              <p className="text-xs text-slate-400 mb-1">Catatan:</p>
                              <p className="text-xs text-slate-300 bg-slate-900/50 rounded p-2 leading-relaxed">
                                {displayHistory.comment}
                              </p>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Current Step - Pending Action */}
                      {isCurrent && !displayHistory && (
                        <div className="mt-3 pt-3 border-t border-slate-700/50">
                          <p className="text-xs text-blue-300">
                            Menunggu tindakan dari{" "}
                            <span className="font-semibold">{step.role.replace("_", " ").toUpperCase()}</span>
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Summary Info */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-800">
          <div className="text-sm">
            <span className="text-slate-400">Progress: </span>
            <span className="text-white font-semibold">
              {Math.round((currentStepIndex / (workflowSteps.length - 1)) * 100)}%
            </span>
          </div>
          <div className="text-sm">
            <span className="text-slate-400">Step: </span>
            <span className="text-white font-semibold">
              {currentStepIndex + 1} dari {workflowSteps.length}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
