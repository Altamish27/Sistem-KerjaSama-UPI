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
    <Card className="bg-white border border-slate-200 shadow-sm">
      <CardHeader className="pb-6">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl font-bold text-slate-900">Status Tracking</CardTitle>
            <CardDescription className="text-slate-600 text-base mt-2">
              Progress dan riwayat persetujuan proposal
            </CardDescription>
          </div>
          {nextStep && (
            <Badge className="bg-amber-50 text-amber-800 border border-amber-200 font-medium px-3 py-1.5 text-sm">
              <ArrowRight className="w-3.5 h-3.5 mr-1.5" />
              Selanjutnya: {nextStep.label}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6 pt-2">
        {/* Timeline Progress - Vertical with solid lines */}
        <div className="relative">
          <div className={`space-y-1 ${compact ? "max-h-96 overflow-y-auto pr-2" : ""}`}>
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
                <div key={step.status} className="flex gap-5 relative">
                  {/* Connector Line - Subtle and professional */}
                  {index < workflowSteps.length - 1 && (
                    <div
                      className={`absolute left-5 top-14 w-0.5 h-[calc(100%-16px)] -ml-px ${
                        isCompleted 
                          ? "bg-emerald-200" 
                          : isRejectedAtThis 
                            ? "bg-red-300" 
                            : "bg-slate-200"
                      }`}
                    />
                  )}

                  {/* Icon - Timeline Node: Completed = green subtle, Current = amber accent, Rejected = red */}
                  <div className="flex-shrink-0 z-10">
                    <div
                      className={`w-11 h-11 rounded-full flex items-center justify-center border-2 transition-all ${
                        isRejectedAtThis
                          ? "bg-red-50 border-red-500 text-red-600"
                          : isCompleted
                            ? "bg-emerald-50 border-emerald-500 text-emerald-700"
                            : isCurrent
                              ? "bg-amber-50 border-amber-400 text-amber-700 ring-4 ring-amber-100"
                              : "bg-slate-50 border-slate-300 text-slate-400"
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

                  {/* Content Card with soft shadow */}
                  <div className="flex-1 pb-6">
                    <div
                      className={`rounded-xl p-6 border transition-all ${
                        isCurrent
                          ? "bg-amber-50/30 border-amber-200 shadow-sm"
                          : isCompleted
                            ? "bg-slate-50/50 border-slate-200"
                            : isRejectedAtThis
                              ? "bg-red-50/30 border-red-200"
                              : "bg-white border-slate-150"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4 mb-4">
                        <div>
                          <h4 className="text-lg font-bold text-slate-900">{step.label}</h4>
                          <p className="text-sm text-slate-600 mt-1">
                            {isCompleted 
                              ? "Selesai" 
                              : isCurrent 
                                ? "Sedang Berlangsung" 
                                : isPending 
                                  ? "Menunggu" 
                                  : ""}
                          </p>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-xs font-medium px-2.5 py-1 ${
                            isCompleted
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : isCurrent
                                ? "bg-amber-50 text-amber-700 border-amber-200"
                                : "bg-slate-100 text-slate-500 border-slate-200"
                          }`}
                        >
                          {step.role === "system" ? "Sistem" : step.role.replace("_", " ").toUpperCase()}
                        </Badge>
                      </div>

                      {/* History Info with proper text sizing */}
                      {(isCompleted || isCurrent) && displayHistory && (
                        <div className="mt-4 pt-4 border-t border-gray-200 space-y-2.5">
                          <div className="flex items-center gap-2 text-sm">
                            <span className="text-gray-500 min-w-[50px]">Oleh:</span>
                            <span className="text-black font-medium">{displayHistory.actorName}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <span className="text-gray-500 min-w-[50px]">Waktu:</span>
                            <span className="text-gray-700">
                              {new Date(displayHistory.timestamp).toLocaleString("id-ID", {
                                dateStyle: "long",
                                timeStyle: "short",
                              })}
                            </span>
                          </div>
                          {displayHistory.comment && (
                            <div className="mt-3">
                              <p className="text-sm text-gray-500 mb-1.5">Catatan:</p>
                              <p className="text-sm text-gray-700 bg-white rounded-lg p-3 leading-relaxed border border-gray-100">
                                {displayHistory.comment}
                              </p>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Current Step - Pending Action */}
                      {isCurrent && !displayHistory && (
                        <div className="mt-4 pt-4 border-t border-blue-200">
                          <p className="text-sm text-blue-700">
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

        {/* Summary Info with emphasized progress */}
        <div className="flex items-center justify-between pt-5 border-t border-gray-200">
          <div className="text-sm">
            <span className="text-gray-500">Progress: </span>
            <span className="text-black font-bold text-base">
              {Math.round((currentStepIndex / (workflowSteps.length - 1)) * 100)}%
            </span>
          </div>
          <div className="text-sm">
            <span className="text-gray-500">Step: </span>
            <span className="text-black font-bold text-base">
              {currentStepIndex + 1} dari {workflowSteps.length}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
