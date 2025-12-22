"use client"

import { useParams, useRouter } from "next/navigation"
import { ProtectedRoute } from "@/components/protected-route"
import { DashboardLayout } from "@/components/dashboard-layout"
import { useAuth } from "@/lib/auth-context"
import { useDataStore } from "@/lib/data-store"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
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
  Download,
  Sparkles,
} from "lucide-react"
import Link from "next/link"
import { STATUS_LABELS } from "@/lib/mock-data"
import { canUserApprove, getNextStatus, getCurrentStepIndex, getWorkflowSteps } from "@/lib/workflow-utils"
import { useState } from "react"
import { ProposalTracker } from "@/components/proposal-tracker"

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
  const { getProposalById, addApprovalHistory, updateProposalStatus, refreshData } = useDataStore()
  const [comment, setComment] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)

  const proposal = getProposalById(params.id as string)

  if (!proposal) {
    return (
      <div className="text-center py-12">
        <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">Proposal tidak ditemukan</p>
      </div>
    )
  }

  const canApprove = canUserApprove(proposal.status, user!.role, proposal.initiator)
  const workflowSteps = getWorkflowSteps(proposal.initiator)
  const currentStepIndex = getCurrentStepIndex(proposal.status, proposal.initiator)

  const handleApprove = async () => {
    if (!comment.trim()) {
      alert("Mohon berikan komentar atau catatan")
      return
    }

    setIsProcessing(true)
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const nextStatus = getNextStatus(proposal.status, proposal.initiator)
    updateProposalStatus(proposal.id, nextStatus)
    addApprovalHistory(proposal.id, {
      id: `HIST-${Date.now()}`,
      proposalId: proposal.id,
      action: "verify_approve",
      actor: user!.id,
      actorName: user!.name,
      actorRole: user!.role,
      comment,
      timestamp: new Date().toISOString(),
    })

    setIsProcessing(false)
    setComment("")
    refreshData()
    router.refresh()
  }

  const handleReject = async () => {
    if (!comment.trim()) {
      alert("Mohon berikan alasan penolakan")
      return
    }

    setIsProcessing(true)
    await new Promise((resolve) => setTimeout(resolve, 1000))

    updateProposalStatus(proposal.id, "rejected")
    addApprovalHistory(proposal.id, {
      id: `HIST-${Date.now()}`,
      proposalId: proposal.id,
      action: "verify_reject",
      actor: user!.id,
      actorName: user!.name,
      actorRole: user!.role,
      comment,
      timestamp: new Date().toISOString(),
    })

    setIsProcessing(false)
    setComment("")
    refreshData()
    router.refresh()
  }

  const getStatusColor = (status: string) => {
    if (status === "draft") return "bg-slate-100 text-slate-700 border-slate-200"
    if (status === "completed") return "bg-emerald-50 text-emerald-700 border-emerald-200"
    if (status === "rejected") return "bg-red-50 text-red-700 border-red-200"
    return "bg-amber-50 text-amber-700 border-amber-200"
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B"
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB"
    return (bytes / (1024 * 1024)).toFixed(1) + " MB"
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
          <p className="text-slate-600 mt-2 text-base lg:text-lg">{proposal.partnerName}</p>
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
      <ProposalTracker proposal={proposal} />

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
                    {proposal.initiator === "mitra" ? "Eksternal (MITRA)" : "Internal (Fakultas)"}
                  </p>
                </div>
                <div className="space-y-1 sm:space-y-2">
                  <p className="text-xs sm:text-sm text-slate-500 font-medium uppercase tracking-wide">Jenis Mitra</p>
                  <p className="text-base sm:text-lg text-slate-900 font-semibold">
                    {proposal.partnerType === "dalam_negeri" ? "Dalam Negeri" : "Luar Negeri"}
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

          {/* Documents Section */}
          {proposal.documents.length > 0 && (
            <Card className="bg-white border border-gray-200 shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-bold text-black">Dokumen Pendukung</CardTitle>
                <CardDescription className="text-gray-600">{proposal.documents.length} file terlampir</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {proposal.documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between p-4 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors border border-slate-200"
                    >
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        <div className="w-11 h-11 rounded-lg bg-white border border-slate-300 flex items-center justify-center">
                          <FileText className="w-5 h-5 text-slate-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-base text-slate-900 font-medium truncate">{doc.name}</p>
                          <p className="text-sm text-slate-500">{formatFileSize(doc.size)}</p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-slate-600 hover:text-[#e10000] hover:bg-red-50"
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
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
                {proposal.approvalHistory
                  .slice()
                  .reverse()
                  .map((history) => (
                    <div key={history.id} className="flex gap-4 pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                      <div className="flex-shrink-0">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            history.action === "approve" || history.action === "verify_approve"
                              ? "bg-emerald-100 text-emerald-600"
                              : history.action === "reject" || history.action === "verify_reject"
                                ? "bg-red-100 text-[#e10000]"
                                : "bg-blue-100 text-blue-600"
                          }`}
                        >
                          {history.action === "approve" || history.action === "verify_approve" ? (
                            <CheckCircle2 className="w-5 h-5" />
                          ) : history.action === "reject" || history.action === "verify_reject" ? (
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
                  ))}
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
                  <p className="text-sm text-gray-500">Fakultas</p>
                  <p className="text-base text-black font-medium">{proposal.fakultas || "-"}</p>
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
                    {new Date(proposal.startDate).toLocaleDateString("id-ID")} -{" "}
                    {new Date(proposal.endDate).toLocaleDateString("id-ID")}
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

          {/* Actionable Decision Card - Clean with red button only */}
          {canApprove && proposal.status !== "completed" && proposal.status !== "rejected" && (
            <Card className="bg-white border border-slate-200 shadow-sm">
              <CardHeader className="pb-3 sm:pb-5 bg-slate-50/50">
                <CardTitle className="text-xl sm:text-2xl font-bold text-slate-900">Tindakan</CardTitle>
                <CardDescription className="text-slate-600 text-sm sm:text-base">Review dan berikan keputusan</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 sm:space-y-6 pt-4 sm:pt-6">
                <div className="space-y-3">
                  <Label htmlFor="comment" className="text-slate-900 font-semibold text-base">
                    Komentar <span className="text-[#e10000]">*</span>
                  </Label>
                  <Textarea
                    id="comment"
                    placeholder="Berikan komentar atau catatan..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows={5}
                    className="bg-white border border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-[#e10000] focus:ring-2 focus:ring-[#e10000]/10 text-base leading-relaxed"
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-3">
                  <Button
                    onClick={handleApprove}
                    disabled={isProcessing || !comment.trim()}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 sm:py-5 text-sm sm:text-base shadow-sm"
                  >
                    <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                    Setujui
                  </Button>
                  <Button
                    onClick={handleReject}
                    disabled={isProcessing || !comment.trim()}
                    className="flex-1 bg-[#e10000] hover:bg-[#c10000] text-white font-semibold py-3 sm:py-5 text-sm sm:text-base shadow-sm"
                  >
                    <XCircle className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                    Tolak
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {proposal.status === "completed" && (
            <Alert className="bg-emerald-50 border border-emerald-200 shadow-sm">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              <AlertDescription className="text-emerald-800 font-medium ml-2">
                Proposal telah disetujui dan selesai diproses.
              </AlertDescription>
            </Alert>
          )}

          {proposal.status === "rejected" && (
            <Alert className="bg-red-50 border border-red-200 shadow-sm">
              <XCircle className="h-5 w-5 text-[#e10000]" />
              <AlertDescription className="text-red-800 font-medium ml-2">
                Proposal ditolak dan tidak dapat diproses lebih lanjut.
              </AlertDescription>
            </Alert>
          )}
        </div>
      </div>
    </div>
  )
}
