"use client"

import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FileText, Clock, CheckCircle2, AlertCircle, ArrowRight, Scale, ShieldCheck } from "lucide-react"
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

  const statCards = [
    {
      label: "Total Review",
      value: totalReviewed,
      desc: "Dokumen yang sudah direview",
      icon: FileText,
      gradient: "from-slate-500 to-slate-700",
      bg: "from-slate-50 to-white",
      border: "border-slate-200",
      iconBg: "bg-slate-100",
      iconColor: "text-slate-600",
    },
    {
      label: "Menunggu Validasi",
      value: pendingReview,
      desc: "Perlu validasi hukum",
      icon: Clock,
      gradient: "from-amber-500 to-orange-600",
      bg: "from-amber-50 to-white",
      border: "border-amber-200",
      iconBg: "bg-amber-100",
      iconColor: "text-amber-600",
    },
    {
      label: "Disetujui",
      value: approved,
      desc: "Dokumen sah",
      icon: CheckCircle2,
      gradient: "from-emerald-500 to-teal-600",
      bg: "from-emerald-50 to-white",
      border: "border-emerald-200",
      iconBg: "bg-emerald-100",
      iconColor: "text-emerald-600",
    },
    {
      label: "Ditolak",
      value: rejected,
      desc: "Perlu perbaikan",
      icon: AlertCircle,
      gradient: "from-red-500 to-rose-600",
      bg: "from-red-50 to-white",
      border: "border-red-200",
      iconBg: "bg-red-100",
      iconColor: "text-red-600",
    },
  ]

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0c1445] via-[#1a237e] to-[#283593] p-6 sm:p-8 shadow-xl">
        <div className="absolute top-0 right-0 w-72 h-72 bg-blue-400/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-cyan-400/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/4" />
        {/* Scale icon decoration */}
        <div className="absolute right-8 top-1/2 -translate-y-1/2 opacity-5">
          <Scale className="w-40 h-40 text-white" />
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 rounded-lg bg-blue-300/20 border border-blue-300/30">
              <ShieldCheck className="w-4 h-4 text-blue-300" />
            </div>
            <span className="text-blue-300 text-sm font-semibold tracking-wide uppercase">Portal Biro Hukum</span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white leading-tight">
            Dashboard <span className="text-blue-300">Biro Hukum</span>
          </h1>
          <p className="text-slate-300 mt-1.5 text-sm sm:text-base">Validasi dan paraf aspek hukum kerja sama</p>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
        {statCards.map((card) => {
          const Icon = card.icon
          return (
            <div
              key={card.label}
              className={`relative overflow-hidden rounded-2xl border ${card.border} bg-gradient-to-br ${card.bg} p-4 sm:p-5 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5`}
            >
              <div className={`absolute top-0 right-0 w-20 h-20 rounded-full blur-2xl opacity-30 bg-gradient-to-br ${card.gradient}`} />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs sm:text-sm font-semibold text-slate-600">{card.label}</span>
                  <div className={`p-2 rounded-xl ${card.iconBg}`}>
                    <Icon className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${card.iconColor}`} />
                  </div>
                </div>
                <div className={`text-2xl sm:text-3xl font-black bg-gradient-to-br ${card.gradient} bg-clip-text text-transparent`}>
                  {card.value}
                </div>
                <p className="text-xs text-slate-500 mt-1">{card.desc}</p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Action Needed */}
      {actionNeeded.length > 0 && (
        <div className="rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50/30 overflow-hidden shadow-sm">
          <div className="p-5 sm:p-6 border-b border-amber-200/60">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-amber-100 border border-amber-200">
                <Scale className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900">Memerlukan Validasi Hukum</h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-0.5">Dokumen yang menunggu review Biro Hukum</p>
              </div>
            </div>
          </div>
          <div className="p-4 sm:p-6 space-y-3">
            {actionNeeded.map((proposal) => (
              <Link key={proposal.id} href={`/dashboard/proposals/${proposal.id}`}>
                <div className="group p-4 sm:p-5 rounded-xl border border-slate-200 hover:border-amber-300 bg-white hover:bg-amber-50/30 transition-all duration-200 shadow-sm hover:shadow-md">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                        <Badge className="bg-slate-100 text-slate-700 border-slate-200">
                          {proposal.initiator.toUpperCase()}
                        </Badge>
                        <Badge className={getStatusColor(proposal.status)}>{STATUS_LABELS[proposal.status]}</Badge>
                      </div>
                      <h3 className="font-semibold text-slate-900 text-sm sm:text-base leading-snug truncate">{proposal.title}</h3>
                      <p className="text-xs sm:text-sm text-slate-500 mt-1">{proposal.partnerName} • {proposal.fakultas}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-amber-600 group-hover:translate-x-0.5 transition-all duration-200 flex-shrink-0 mt-1" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Tracking Dokumen */}
      {biroProposals.filter((p) => p.status !== "completed" && p.status !== "rejected").length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-100 border border-blue-200">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">Tracking Dokumen dalam Review</h2>
          </div>
          {biroProposals
            .filter((p) => p.status !== "completed" && p.status !== "rejected")
            .slice(0, 2)
            .map((proposal) => (
              <div key={proposal.id} className="space-y-3">
                <Link href={`/dashboard/proposals/${proposal.id}`}>
                  <div className="group p-4 sm:p-5 rounded-xl border border-slate-200 bg-white hover:border-blue-200 hover:bg-blue-50/20 transition-all duration-200 shadow-sm hover:shadow-md">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-slate-900 text-sm sm:text-base leading-snug">{proposal.title}</h3>
                        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">{proposal.partnerName}</p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-500 group-hover:translate-x-0.5 transition-all duration-200 flex-shrink-0" />
                    </div>
                  </div>
                </Link>
                <SimpleTracker proposal={proposal} />
              </div>
            ))}
        </div>
      )}

      {/* Riwayat Review */}
      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
        <div className="p-5 sm:p-6 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
          <h2 className="text-base sm:text-lg font-bold text-slate-900">Riwayat Review</h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">Dokumen yang sudah direview oleh Biro Hukum</p>
        </div>
        <div className="p-4 sm:p-6">
          {biroProposals.length === 0 ? (
            <div className="text-center py-14">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-slate-100 mb-4">
                <FileText className="w-8 h-8 text-slate-400" />
              </div>
              <p className="text-slate-500 text-sm sm:text-base">Belum ada dokumen yang direview</p>
            </div>
          ) : (
            <div className="space-y-3">
              {biroProposals.slice(0, 5).map((proposal) => (
                <Link key={proposal.id} href={`/dashboard/proposals/${proposal.id}`}>
                  <div className="group p-4 sm:p-5 rounded-xl border border-slate-150 hover:border-slate-300 bg-slate-50/50 hover:bg-white transition-all duration-200 hover:shadow-sm">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                          <Badge className="bg-slate-100 text-slate-700 border-slate-200">
                            {proposal.initiator.toUpperCase()}
                          </Badge>
                          <Badge className={getStatusColor(proposal.status)}>{STATUS_LABELS[proposal.status]}</Badge>
                        </div>
                        <h3 className="font-semibold text-slate-900 text-sm sm:text-base leading-snug truncate">{proposal.title}</h3>
                        <p className="text-xs sm:text-sm text-slate-500 mt-1">{proposal.partnerName} • {proposal.fakultas}</p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-slate-600 group-hover:translate-x-0.5 transition-all duration-200 flex-shrink-0 mt-1" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
