"use client"

import { useParams, useRouter } from "next/navigation"
import { ProtectedRoute } from "@/components/protected-route"
import { DashboardLayout } from "@/components/dashboard-layout"
import { useAuth } from "@/lib/auth-context"
import { useDataStore } from "@/lib/data-store"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Building2,
  Calendar,
  DollarSign,
  FileText,
  User,
  Sparkles,
} from "lucide-react"
import Link from "next/link"
import { STATUS_LABELS } from "@/lib/mock-data"
import { useState, useEffect } from "react"
import { SimpleTracker } from "@/components/simple-tracker"
import { WorkflowActions } from "@/components/workflow-actions"
import { PdfViewer } from "@/components/pdf-viewer"
import { PksDocumentViewer } from "@/components/pks-document-viewer"
import { getNextStatus, getAvailableActions, determineWorkflowPath } from "@/lib/workflow-engine"
import { getPksFileForStatus } from "@/lib/workflow-utils"
import type { ApprovalHistory } from "@/lib/mock-data"

export default function ProposalDetailPage() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <ProposalDetailContent />
      </DashboardLayout>
    </ProtectedRoute>
  )
}

function ProposalDetailContent() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const { getProposalById, addApprovalHistory, updateProposal, refreshData } = useDataStore()
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Auto-refresh data setiap 5 detik
  useEffect(() => {
    const interval = setInterval(() => {
      refreshData()
    }, 5000)
    return () => clearInterval(interval)
  }, [refreshData])

  const proposal = getProposalById(params.id as string)

  if (!proposal) {
    return (
      <div className="text-center py-12">
        <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">Proposal tidak ditemukan</p>
        <Link href="/dashboard">
          <Button className="mt-4">Kembali ke Dashboard</Button>
        </Link>
      </div>
    )
  }

  const handleWorkflowAction = async (actionLabel: string, comment?: string, extraData?: any) => {
    setIsRefreshing(true)
    try {
      const path = determineWorkflowPath(proposal.fileSuratKuasa)

      // Get next status from engine
      const nextStatus = getNextStatus(proposal.status, actionLabel, path)

      // Update proposal with new status and extra data
      const updates: any = {
        status: nextStatus,
        ...extraData,
      }

      await updateProposal(proposal.id, updates)

      // Find the matching action to get the approvalAction type
      const availableActions = getAvailableActions(proposal.status, user!.role, path)
      const matchedAction = availableActions.find((a) => a.label === actionLabel)
      const actionType: ApprovalHistory["action"] = matchedAction?.approvalAction || "submit"

      // Add to history AND send email notification
      await addApprovalHistory(proposal.id, {
        id: `HIST-${Date.now()}`,
        proposalId: proposal.id,
        action: actionType,
        actor: user!.id,
        actorName: user!.name,
        actorRole: user!.role,
        comment: comment || actionLabel,
        timestamp: new Date().toISOString(),
      }, true)

      await refreshData()
      router.refresh()
    } finally {
      setIsRefreshing(false)
    }
  }

  const getStatusColor = (status: string) => {
    if (status === "draft") return "bg-slate-100 text-slate-700 border-slate-200"
    if (status === "completed") return "bg-emerald-50 text-emerald-700 border-emerald-200"
    if (status === "rejected") return "bg-red-50 text-red-700 border-red-200"
    return "bg-amber-50 text-amber-700 border-amber-200"
  }

  return (
    <div className="space-y-6 sm:space-y-8 lg:space-y-10 max-w-7xl mx-auto">
      {/* Header Section - Executive spacing */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
        <Link href="/dashboard/proposals">
          <Button
            variant="outline"
            size="sm"
            className="border-slate-300 text-slate-700 hover:bg-slate-50 bg-white shadow-sm px-4 py-3 sm:py-5 w-full sm:w-auto"
          >
            <ArrowLeft className="w-4 h-4 sm:mr-2" />
            <span className="hidden sm:inline">Kembali</span>
          </Button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-2 sm:gap-3 mb-3 flex-wrap">
            <Badge className="text-xs sm:text-sm bg-slate-100 text-slate-700 border-slate-200 font-medium px-2 sm:px-3 py-0.5 sm:py-1">
              {proposal.initiator?.toUpperCase() || "UNKNOWN"}
            </Badge>
            <Badge className={`text-xs sm:text-sm border font-medium px-2 sm:px-3 py-0.5 sm:py-1 ${getStatusColor(proposal.status)}`}>
              {STATUS_LABELS[proposal.status]}
            </Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 leading-tight">{proposal.title}</h1>
          <p className="text-slate-600 mt-2 text-base lg:text-lg">{proposal.mitraName}</p>
        </div>
      </div>

      {/* AI Summary Card - Subtle and professional */}
      {proposal.aiSummary && (
        <Card className="bg-amber-50/30 border border-amber-200/50 shadow-sm">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-white border border-amber-200 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold text-slate-900">Ringkasan AI</CardTitle>
                <CardDescription className="text-slate-600 text-sm mt-0.5">
                  Ringkasan otomatis yang dibuat menggunakan AI
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-slate-800 leading-relaxed text-base">{proposal.aiSummary}</p>
          </CardContent>
        </Card>
      )}

      {/* Workflow Progress */}
      <SimpleTracker proposal={proposal} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
        {/* Proposal Details */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          {/* Executive Information Grid - Generous spacing */}
          <Card className="bg-white border border-slate-200 shadow-sm">
            <CardHeader className="pb-3 sm:pb-5">
              <CardTitle className="text-xl sm:text-2xl font-bold text-slate-900">Informasi Proposal</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 sm:space-y-8 pt-4 sm:pt-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
                <div className="space-y-1 sm:space-y-2">
                  <p className="text-xs sm:text-sm text-slate-500 font-medium uppercase tracking-wide">Nomor Proposal</p>
                  <p className="text-base sm:text-lg text-slate-900 font-semibold">{proposal.proposalNumber || "-"}</p>
                </div>
                <div className="space-y-1 sm:space-y-2">
                  <p className="text-xs sm:text-sm text-slate-500 font-medium uppercase tracking-wide">Pengajuan</p>
                  <p className="text-base sm:text-lg text-slate-900 font-semibold">
                    {proposal.initiator === "mitra" ? "Eksternal (MITRA)" : "Internal (Unit)"}
                  </p>
                </div>
                <div className="space-y-1 sm:space-y-2">
                  <p className="text-xs sm:text-sm text-slate-500 font-medium uppercase tracking-wide">Jenis Dokumen</p>
                  <p className="text-base sm:text-lg text-slate-900 font-semibold">
                    {proposal.jenisDokumen || "-"}
                  </p>
                </div>
                <div className="space-y-1 sm:space-y-2">
                  <p className="text-xs sm:text-sm text-slate-500 font-medium uppercase tracking-wide">Durasi</p>
                  <p className="text-base sm:text-lg text-slate-900 font-semibold">{proposal.duration} Bulan</p>
                </div>
              </div>

              <div className="space-y-3 pt-2 border-t border-slate-200">
                <p className="text-sm text-slate-500 font-medium uppercase tracking-wide">Deskripsi</p>
                <p className="text-base text-slate-800 leading-relaxed">{proposal.description}</p>
              </div>

              <div className="space-y-3 pt-2 border-t border-slate-200">
                <p className="text-sm text-slate-500 font-medium uppercase tracking-wide">Tujuan</p>
                <p className="text-base text-slate-800 leading-relaxed">{proposal.objectives}</p>
              </div>

              <div className="space-y-3 pt-2 border-t border-slate-200">
                <p className="text-sm text-slate-500 font-medium uppercase tracking-wide">Manfaat</p>
                <p className="text-base text-slate-800 leading-relaxed">{proposal.benefits}</p>
              </div>

              <div className="space-y-3 pt-2 border-t border-slate-200">
                <p className="text-sm text-slate-500 font-medium uppercase tracking-wide">Ruang Lingkup</p>
                <p className="text-base text-slate-800 leading-relaxed">{proposal.scopeOfWork}</p>
              </div>
            </CardContent>
          </Card>

          {/* PKS Document Viewer — visible from biro_hukum_reviewing onwards */}
          {getPksFileForStatus(proposal.status) && (
            <PksDocumentViewer status={proposal.status} />
          )}

          {/* Documents Section */}
          {proposal.documents && proposal.documents.length > 0 && (
            <Card className="bg-white border border-gray-200 shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-bold text-black">Dokumen Pendukung</CardTitle>
                <CardDescription className="text-gray-600">{proposal.documents.length} file terlampir</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {proposal.documents.map((doc) => (
                    <PdfViewer
                      key={doc.id}
                      url={doc.url}
                      fileName={doc.name}
                      fileSize={doc.size}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Approval History */}
          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-bold text-black">Riwayat Persetujuan</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {proposal.approvalHistory && proposal.approvalHistory.length > 0 ? (
                  proposal.approvalHistory
                    .slice()
                    .reverse()
                    .map((history) => (
                      <div key={history.id} className="flex gap-4 pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                      <div className="flex-shrink-0">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            history.action.includes("approve") || history.action.includes("sign") || history.action === "complete"
                              ? "bg-emerald-100 text-emerald-600"
                              : history.action.includes("reject") || history.action === "final_rejection"
                                ? "bg-red-100 text-[#e10000]"
                                : "bg-blue-100 text-blue-600"
                          }`}
                        >
                          {history.action.includes("approve") || history.action.includes("sign") || history.action === "complete" ? (
                            <CheckCircle2 className="w-5 h-5" />
                          ) : history.action.includes("reject") || history.action === "final_rejection" ? (
                            <XCircle className="w-5 h-5" />
                          ) : (
                            <User className="w-5 h-5" />
                          )}
                        </div>
                      </div>
                      <div className="flex-1">
                        <p className="text-base font-semibold text-black">{history.actorName}</p>
                        <p className="text-sm text-gray-600">
                          {history.action.includes("approve")
                            ? "Menyetujui"
                            : history.action.includes("reject")
                              ? "Menolak"
                              : "Mengajukan"}{" "}
                          proposal
                        </p>
                        {history.comment && (
                          <p className="text-base text-gray-700 mt-2 bg-gray-50 rounded-lg p-3 border border-gray-100">
                            {history.comment}
                          </p>
                        )}
                        <p className="text-sm text-gray-500 mt-2">
                          {new Date(history.timestamp).toLocaleString("id-ID")}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 text-center py-4">Belum ada riwayat persetujuan</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4 sm:space-y-6">
          {/* Additional Info Card */}
          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardHeader className="pb-3 sm:pb-4">
              <CardTitle className="text-xl font-bold text-black">Info Tambahan</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Unit Terkait</p>
                  <p className="text-base text-black font-medium">{proposal.unitName || "-"}</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                  <User className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Pengaju</p>
                  <p className="text-base text-black font-medium">{proposal.createdByName}</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Periode</p>
                  <p className="text-base text-black font-medium">
                    {proposal.startDate ? new Date(proposal.startDate).toLocaleDateString("id-ID") : "-"} -{" "}
                    {proposal.endDate ? new Date(proposal.endDate).toLocaleDateString("id-ID") : "-"}
                  </p>
                </div>
              </div>

              {proposal.budget && (
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-[#ffcc00]/20 flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Anggaran</p>
                    <p className="text-base text-black font-bold">Rp {proposal.budget.toLocaleString("id-ID")}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Workflow Actions Component */}
          <WorkflowActions
            proposal={proposal}
            userRole={user!.role}
            userId={user!.id}
            userName={user!.name}
            onAction={handleWorkflowAction}
          />
        </div>
      </div>
    </div>
  )
}
