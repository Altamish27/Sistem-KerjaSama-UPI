"use client"

import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FileText, Clock, CheckCircle2, AlertCircle } from "lucide-react"
import Link from "next/link"
import { useDataStore } from "@/lib/data-store"
import { STATUS_LABELS } from "@/lib/mock-data"
import { canUserTakeAction } from "@/lib/workflow-engine"
import { SimpleTracker } from "@/components/simple-tracker"

export function BiroHukumDashboardBaru() {
  const { user } = useAuth()
  const { proposals } = useDataStore()

  const biroProposals = proposals.filter(
    (p) =>
      p.status.includes("biro_hukum") ||
      (p.status !== "draft" && p.status !== "rejected" && p.approvalHistory.some((h) => h.actorRole === "biro_hukum")),
  )

  const actionNeeded = biroProposals.filter((p) => canUserTakeAction(p.status, user!.role))

  const totalReviewed = biroProposals.length
  const pendingReview = actionNeeded.length
  const approved = biroProposals.filter(
    (p) =>
      p.status === "biro_hukum_approved" ||
      p.approvalHistory.some((h) => h.actorRole === "biro_hukum" && h.action === "biro_approve"),
  ).length
  const rejected = biroProposals.filter(
    (p) =>
      p.status === "biro_hukum_rejected" ||
      p.approvalHistory.some((h) => h.actorRole === "biro_hukum" && h.action === "biro_reject"),
  ).length

  const getStatusColor = (status: string) => {
    if (status === "draft") return "bg-slate-100 text-slate-700 border-slate-200"
    if (status === "completed") return "bg-emerald-50 text-emerald-700 border-emerald-200"
    if (status === "rejected") return "bg-red-50 text-red-700 border-red-200"
    return "bg-amber-50 text-amber-700 border-amber-200"
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900">Dashboard Biro Hukum</h1>
        <p className="text-slate-600 mt-1 sm:mt-2 text-base lg:text-lg">Validasi dan paraf aspek hukum kerja sama</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        <Card className="bg-white border-slate-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 sm:pb-3">
            <CardTitle className="text-sm sm:text-base font-semibold text-slate-900">Total Review</CardTitle>
            <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-slate-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-bold text-slate-900">{totalReviewed}</div>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 sm:mt-2">Dokumen yang sudah direview</p>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 sm:pb-3">
            <CardTitle className="text-sm sm:text-base font-semibold text-slate-900">Menunggu Validasi</CardTitle>
            <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-bold text-slate-900">{pendingReview}</div>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 sm:mt-2">Perlu validasi hukum</p>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 sm:pb-3">
            <CardTitle className="text-sm sm:text-base font-semibold text-slate-900">Disetujui</CardTitle>
            <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-bold text-slate-900">{approved}</div>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 sm:mt-2">Dokumen sah</p>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 sm:pb-3">
            <CardTitle className="text-sm sm:text-base font-semibold text-slate-900">Ditolak</CardTitle>
            <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-[#e10000]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-bold text-slate-900">{rejected}</div>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 sm:mt-2">Perlu perbaikan</p>
          </CardContent>
        </Card>
      </div>

      {/* Action Needed */}
      {actionNeeded.length > 0 && (
        <Card className="bg-amber-50/30 border-amber-200 shadow-sm">
          <CardHeader className="pb-5">
            <CardTitle className="text-xl sm:text-2xl font-bold text-slate-900">Memerlukan Validasi Hukum</CardTitle>
            <CardDescription className="text-slate-600 text-sm sm:text-base">
              Dokumen yang menunggu review Biro Hukum
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 sm:space-y-4">
              {actionNeeded.map((proposal) => (
                <Link key={proposal.id} href={`/dashboard/proposals/${proposal.id}`}>
                  <div className="p-4 sm:p-6 rounded-lg sm:rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors bg-white shadow-sm">
                    <div className="flex items-center gap-2 sm:gap-3 mb-2">
                      <Badge className="bg-slate-100 text-slate-700 border-slate-200">
                        {proposal.initiator.toUpperCase()}
                      </Badge>
                      <Badge className={getStatusColor(proposal.status)}>{STATUS_LABELS[proposal.status]}</Badge>
                    </div>
                    <h3 className="font-semibold text-slate-900 text-base sm:text-lg">{proposal.title}</h3>
                    <p className="text-sm sm:text-base text-slate-600 mt-1 sm:mt-2">
                      {proposal.partnerName} • {proposal.fakultas}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tracking Dokumen */}
      {biroProposals.filter((p) => p.status !== "completed" && p.status !== "rejected").length > 0 && (
        <div className="space-y-4 sm:space-y-6">
          <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-900">Tracking Dokumen dalam Review</h2>
          {biroProposals
            .filter((p) => p.status !== "completed" && p.status !== "rejected")
            .slice(0, 2)
            .map((proposal) => (
              <div key={proposal.id} className="space-y-3 sm:space-y-4">
                <Link href={`/dashboard/proposals/${proposal.id}`}>
                  <div className="p-4 sm:p-6 rounded-lg sm:rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition-colors shadow-sm">
                    <h3 className="font-semibold text-slate-900 mb-2 text-base sm:text-lg">{proposal.title}</h3>
                    <p className="text-sm sm:text-base text-slate-600">{proposal.partnerName}</p>
                  </div>
                </Link>
                <SimpleTracker proposal={proposal} />
              </div>
            ))}
        </div>
      )}

      {/* Riwayat Review */}
      <Card className="bg-white border-slate-200 shadow-sm">
        <CardHeader className="pb-5">
          <CardTitle className="text-xl sm:text-2xl font-bold text-slate-900">Riwayat Review</CardTitle>
          <CardDescription className="text-slate-600 text-sm sm:text-base">
            Dokumen yang sudah direview oleh Biro Hukum
          </CardDescription>
        </CardHeader>
        <CardContent>
          {biroProposals.length === 0 ? (
            <div className="text-center py-16">
              <FileText className="w-16 h-16 text-slate-400 mx-auto mb-6" />
              <p className="text-slate-600 mb-4 text-base sm:text-lg">Belum ada dokumen yang direview</p>
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {biroProposals.slice(0, 5).map((proposal) => (
                <Link key={proposal.id} href={`/dashboard/proposals/${proposal.id}`}>
                  <div className="p-4 sm:p-6 rounded-lg sm:rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors shadow-sm">
                    <div className="flex items-center gap-2 sm:gap-3 mb-2">
                      <Badge className="bg-slate-100 text-slate-700 border-slate-200">
                        {proposal.initiator.toUpperCase()}
                      </Badge>
                      <Badge className={getStatusColor(proposal.status)}>{STATUS_LABELS[proposal.status]}</Badge>
                    </div>
                    <h3 className="font-semibold text-slate-900 text-base sm:text-lg">{proposal.title}</h3>
                    <p className="text-sm sm:text-base text-slate-600 mt-1 sm:mt-2">
                      {proposal.partnerName} • {proposal.fakultas}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
