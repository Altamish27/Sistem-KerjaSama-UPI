"use client"

import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FileText, Clock, CheckCircle2, TrendingUp } from "lucide-react"
import Link from "next/link"
import { useDataStore } from "@/lib/data-store"
import { STATUS_LABELS } from "@/lib/mock-data"
import { canUserTakeAction } from "@/lib/workflow-engine"
import { SimpleTracker } from "@/components/simple-tracker"

export function SupervisiDashboardBaru() {
  const { user } = useAuth()
  const { proposals } = useDataStore()

  const supervisiProposals = proposals.filter(
    (p) =>
      p.status.includes("warek") ||
      p.status.includes("rektor") ||
      p.status === "completed",
  )

  const actionNeeded = supervisiProposals.filter((p) => canUserTakeAction(p.status, user!.role))

  const totalProposals = supervisiProposals.length
  const pendingReview = actionNeeded.length
  const approved = supervisiProposals.filter((p) => p.status === "completed").length
  const inReview = supervisiProposals.filter(
    (p) => p.status.includes("warek") || (p.status.includes("rektor") && p.status !== "completed"),
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
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900">
          Dashboard {user?.role === "wakil_rektor" ? "Wakil Rektor" : "Rektor"}
        </h1>
        <p className="text-slate-600 mt-1 sm:mt-2 text-base lg:text-lg">Review dan persetujuan akhir kerja sama</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        <Card className="bg-white border-slate-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 sm:pb-3">
            <CardTitle className="text-sm sm:text-base font-semibold text-slate-900">Total Proposal</CardTitle>
            <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-slate-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-bold text-slate-900">{totalProposals}</div>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 sm:mt-2">Proposal di tahap supervisi</p>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 sm:pb-3">
            <CardTitle className="text-sm sm:text-base font-semibold text-slate-900">Menunggu Review</CardTitle>
            <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-bold text-slate-900">{pendingReview}</div>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 sm:mt-2">Perlu persetujuan Anda</p>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 sm:pb-3">
            <CardTitle className="text-sm sm:text-base font-semibold text-slate-900">Dalam Review</CardTitle>
            <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-bold text-slate-900">{inReview}</div>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 sm:mt-2">Proses supervisi</p>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 sm:pb-3">
            <CardTitle className="text-sm sm:text-base font-semibold text-slate-900">Disetujui</CardTitle>
            <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-bold text-slate-900">{approved}</div>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 sm:mt-2">Kerja sama selesai</p>
          </CardContent>
        </Card>
      </div>

      {/* Action Needed */}
      {actionNeeded.length > 0 && (
        <Card className="bg-amber-50/30 border-amber-200 shadow-sm">
          <CardHeader className="pb-5">
            <CardTitle className="text-xl sm:text-2xl font-bold text-slate-900">Memerlukan Persetujuan Anda</CardTitle>
            <CardDescription className="text-slate-600 text-sm sm:text-base">
              Proposal yang menunggu digital signing
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

      {/* Tracking */}
      {supervisiProposals.filter((p) => p.status !== "completed").length > 0 && (
        <div className="space-y-4 sm:space-y-6">
          <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-900">Tracking Proposal Supervisi</h2>
          {supervisiProposals
            .filter((p) => p.status !== "completed")
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

      {/* Riwayat */}
      <Card className="bg-white border-slate-200 shadow-sm">
        <CardHeader className="pb-5">
          <CardTitle className="text-xl sm:text-2xl font-bold text-slate-900">Riwayat Kerja Sama</CardTitle>
          <CardDescription className="text-slate-600 text-sm sm:text-base">
            Proposal yang sudah melalui tahap supervisi
          </CardDescription>
        </CardHeader>
        <CardContent>
          {supervisiProposals.length === 0 ? (
            <div className="text-center py-16">
              <FileText className="w-16 h-16 text-slate-400 mx-auto mb-6" />
              <p className="text-slate-600 mb-4 text-base sm:text-lg">Belum ada proposal</p>
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {supervisiProposals.slice(0, 5).map((proposal) => (
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
