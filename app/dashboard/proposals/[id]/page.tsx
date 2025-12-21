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
        <FileText className="w-12 h-12 text-slate-600 mx-auto mb-4" />
        <p className="text-slate-400">Proposal tidak ditemukan</p>
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
    if (status === "draft") return "bg-slate-500/10 text-slate-400 border-slate-500/20"
    if (status === "completed") return "bg-green-500/10 text-green-400 border-green-500/20"
    if (status === "rejected") return "bg-red-500/10 text-red-400 border-red-500/20"
    return "bg-blue-500/10 text-blue-400 border-blue-500/20"
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B"
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB"
    return (bytes / (1024 * 1024)).toFixed(1) + " MB"
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/proposals">
          <Button
            variant="outline"
            size="sm"
            className="border-slate-700 text-slate-200 hover:bg-slate-800 bg-transparent"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Kembali
          </Button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Badge className="text-xs bg-emerald-700/50 text-emerald-300 border-emerald-600">
              {proposal.initiator?.toUpperCase() || "UNKNOWN"}
            </Badge>
            <Badge className={`text-xs ${getStatusColor(proposal.status)}`}>{STATUS_LABELS[proposal.status]}</Badge>
          </div>
          <h1 className="text-3xl font-bold text-white">{proposal.title}</h1>
          <p className="text-slate-400 mt-1">{proposal.partnerName}</p>
        </div>
      </div>

      {/* AI Summary Card */}
      {proposal.aiSummary && (
        <Card className="bg-gradient-to-br from-blue-950/50 to-purple-950/50 border-blue-900/50">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-blue-400" />
              <CardTitle className="text-white">Ringkasan AI</CardTitle>
            </div>
            <CardDescription className="text-blue-200">Ringkasan otomatis yang dibuat menggunakan AI</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-slate-200 leading-relaxed">{proposal.aiSummary}</p>
          </CardContent>
        </Card>
      )}

      {/* Workflow Progress */}
      <ProposalTracker proposal={proposal} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Proposal Details */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white">Informasi Proposal</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-xs text-slate-500">Nomor Proposal</p>
                  <p className="text-sm text-white">{proposal.proposalNumber || "-"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-slate-500">Pengajuan</p>
                  <p className="text-sm text-white">
                    {proposal.initiator === "mitra" ? "Eksternal (MITRA)" : "Internal (Fakultas)"}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-slate-500">Jenis Mitra</p>
                  <p className="text-sm text-white">
                    {proposal.partnerType === "dalam_negeri" ? "Dalam Negeri" : "Luar Negeri"}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-slate-500">Durasi</p>
                  <p className="text-sm text-white">{proposal.duration} Bulan</p>
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-xs text-slate-500">Deskripsi</p>
                <p className="text-sm text-white leading-relaxed">{proposal.description}</p>
              </div>

              <div className="space-y-1">
                <p className="text-xs text-slate-500">Tujuan</p>
                <p className="text-sm text-white leading-relaxed">{proposal.objectives}</p>
              </div>

              <div className="space-y-1">
                <p className="text-xs text-slate-500">Manfaat</p>
                <p className="text-sm text-white leading-relaxed">{proposal.benefits}</p>
              </div>

              <div className="space-y-1">
                <p className="text-xs text-slate-500">Ruang Lingkup</p>
                <p className="text-sm text-white leading-relaxed">{proposal.scopeOfWork}</p>
              </div>
            </CardContent>
          </Card>

          {/* Documents Section */}
          {proposal.documents.length > 0 && (
            <Card className="bg-slate-900/50 border-slate-800">
              <CardHeader>
                <CardTitle className="text-white">Dokumen Pendukung</CardTitle>
                <CardDescription className="text-slate-400">{proposal.documents.length} file terlampir</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {proposal.documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50 hover:bg-slate-800 transition-colors"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <FileText className="w-5 h-5 text-blue-400 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-white truncate">{doc.name}</p>
                          <p className="text-xs text-slate-500">{formatFileSize(doc.size)}</p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-slate-400 hover:text-blue-400 hover:bg-blue-950/20"
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
          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white">Riwayat Persetujuan</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {proposal.approvalHistory
                  .slice()
                  .reverse()
                  .map((history) => (
                    <div key={history.id} className="flex gap-4 pb-4 border-b border-slate-800 last:border-0">
                      <div className="flex-shrink-0">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            history.action === "approve" || history.action === "verify_approve"
                              ? "bg-green-500/20 text-green-400"
                              : history.action === "reject" || history.action === "verify_reject"
                                ? "bg-red-500/20 text-red-400"
                                : "bg-blue-500/20 text-blue-400"
                          }`}
                        >
                          {history.action === "approve" || history.action === "verify_approve" ? (
                            <CheckCircle2 className="w-4 h-4" />
                          ) : history.action === "reject" || history.action === "verify_reject" ? (
                            <XCircle className="w-4 h-4" />
                          ) : (
                            <User className="w-4 h-4" />
                          )}
                        </div>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-white">{history.actorName}</p>
                        <p className="text-xs text-slate-400">
                          {history.action.includes("approve")
                            ? "Menyetujui"
                            : history.action.includes("reject")
                              ? "Menolak"
                              : "Mengajukan"}{" "}
                          proposal
                        </p>
                        {history.comment && <p className="text-sm text-slate-300 mt-2">{history.comment}</p>}
                        <p className="text-xs text-slate-500 mt-2">
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
        <div className="space-y-6">
          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white">Info Tambahan</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Building2 className="w-5 h-5 text-slate-400" />
                <div>
                  <p className="text-xs text-slate-500">Fakultas</p>
                  <p className="text-sm text-white">{proposal.fakultas || "-"}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-slate-400" />
                <div>
                  <p className="text-xs text-slate-500">Pengaju</p>
                  <p className="text-sm text-white">{proposal.createdByName}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-slate-400" />
                <div>
                  <p className="text-xs text-slate-500">Periode</p>
                  <p className="text-sm text-white">
                    {new Date(proposal.startDate).toLocaleDateString("id-ID")} -{" "}
                    {new Date(proposal.endDate).toLocaleDateString("id-ID")}
                  </p>
                </div>
              </div>

              {proposal.budget && (
                <div className="flex items-center gap-3">
                  <DollarSign className="w-5 h-5 text-slate-400" />
                  <div>
                    <p className="text-xs text-slate-500">Anggaran</p>
                    <p className="text-sm text-white">Rp {proposal.budget.toLocaleString("id-ID")}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Approval Actions */}
          {canApprove && proposal.status !== "completed" && proposal.status !== "rejected" && (
            <Card className="bg-slate-900/50 border-slate-800">
              <CardHeader>
                <CardTitle className="text-white">Tindakan</CardTitle>
                <CardDescription className="text-slate-400">Review dan berikan keputusan</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="comment" className="text-slate-200">
                    Komentar *
                  </Label>
                  <Textarea
                    id="comment"
                    placeholder="Berikan komentar atau catatan..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows={4}
                    className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={handleApprove}
                    disabled={isProcessing || !comment.trim()}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                  >
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Setujui
                  </Button>
                  <Button
                    onClick={handleReject}
                    disabled={isProcessing || !comment.trim()}
                    variant="destructive"
                    className="flex-1"
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Tolak
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {proposal.status === "completed" && (
            <Alert className="bg-green-950/50 border-green-900">
              <CheckCircle2 className="h-4 w-4 text-green-400" />
              <AlertDescription className="text-green-200">
                Proposal telah disetujui dan selesai diproses.
              </AlertDescription>
            </Alert>
          )}

          {proposal.status === "rejected" && (
            <Alert variant="destructive" className="bg-red-950/50 border-red-900">
              <XCircle className="h-4 w-4" />
              <AlertDescription>Proposal ditolak dan tidak dapat diproses lebih lanjut.</AlertDescription>
            </Alert>
          )}
        </div>
      </div>
    </div>
  )
}
