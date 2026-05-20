"use client"

import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FileText, Clock, CheckCircle2, TrendingUp, ArrowRight, Crown, Award, StarIcon } from "lucide-react"
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

  const isRektor = user?.role === "rektor"

  const getStatusColor = (status: string) => {
    if (status === "draft") return "bg-slate-100 text-slate-700 border-slate-200"
    if (status === "completed") return "bg-emerald-50 text-emerald-700 border-emerald-200"
    if (status === "rejected") return "bg-red-50 text-red-700 border-red-200"
    return "bg-amber-50 text-amber-700 border-amber-200"
  }

  const statCards = [
    {
      label: "Total Proposal",
      value: totalProposals,
      desc: "Di tahap supervisi",
      icon: FileText,
      gradient: "from-slate-500 to-slate-700",
      bg: "from-slate-50 to-white",
      border: "border-slate-200",
      iconBg: "bg-slate-100",
      iconColor: "text-slate-600",
    },
    {
      label: "Menunggu Review",
      value: pendingReview,
      desc: "Perlu persetujuan Anda",
      icon: Clock,
      gradient: "from-amber-500 to-orange-600",
      bg: "from-amber-50 to-white",
      border: "border-amber-200",
      iconBg: "bg-amber-100",
      iconColor: "text-amber-600",
    },
    {
      label: "Dalam Review",
      value: inReview,
      desc: "Proses supervisi",
      icon: TrendingUp,
      gradient: "from-cyan-500 to-blue-600",
      bg: "from-cyan-50 to-white",
      border: "border-cyan-200",
      iconBg: "bg-cyan-100",
      iconColor: "text-cyan-600",
    },
    {
      label: "Disetujui",
      value: approved,
      desc: "Kerja sama selesai",
      icon: CheckCircle2,
      gradient: "from-emerald-500 to-teal-600",
      bg: "from-emerald-50 to-white",
      border: "border-emerald-200",
      iconBg: "bg-emerald-100",
      iconColor: "text-emerald-600",
    },
  ]

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Hero Header */}
      <div className={`relative overflow-hidden rounded-2xl p-6 sm:p-8 shadow-xl ${
        isRektor
          ? "bg-gradient-to-br from-[#1a0a00] via-[#7c2d12] to-[#b45309]"
          : "bg-gradient-to-br from-[#0a0a1a] via-[#1e293b] to-[#334155]"
      }`}>
        <div className={`absolute top-0 right-0 w-72 h-72 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 ${
          isRektor ? "bg-orange-400/10" : "bg-cyan-400/10"
        }`} />
        <div className={`absolute bottom-0 left-0 w-48 h-48 rounded-full blur-2xl translate-y-1/2 -translate-x-1/4 ${
          isRektor ? "bg-yellow-400/10" : "bg-blue-400/10"
        }`} />
        {/* Crown decoration */}
        <div className="absolute right-8 top-1/2 -translate-y-1/2 opacity-5">
          <Crown className="w-40 h-40 text-white" />
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <div className={`p-1.5 rounded-lg border ${
              isRektor ? "bg-orange-400/20 border-orange-400/30" : "bg-cyan-400/20 border-cyan-400/30"
            }`}>
              {isRektor ? (
                <Crown className={`w-4 h-4 text-orange-300`} />
              ) : (
                <Award className={`w-4 h-4 text-cyan-300`} />
              )}
            </div>
            <span className={`text-sm font-semibold tracking-wide uppercase ${
              isRektor ? "text-orange-300" : "text-cyan-300"
            }`}>
              {isRektor ? "Pimpinan Tertinggi" : "Portal Wakil Rektor"}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white leading-tight">
            Dashboard{" "}
            <span className={isRektor ? "text-orange-300" : "text-cyan-300"}>
              {isRektor ? "Rektor" : "Wakil Rektor"}
            </span>
          </h1>
          <p className="text-slate-300 mt-1.5 text-sm sm:text-base">Review dan persetujuan akhir kerja sama</p>
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
        <div className={`rounded-2xl border overflow-hidden shadow-sm ${
          isRektor
            ? "border-orange-200 bg-gradient-to-br from-orange-50 to-amber-50/30"
            : "border-amber-200 bg-gradient-to-br from-amber-50 to-yellow-50/30"
        }`}>
          <div className={`p-5 sm:p-6 border-b ${isRektor ? "border-orange-200/60" : "border-amber-200/60"}`}>
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-xl border ${
                isRektor ? "bg-orange-100 border-orange-200" : "bg-amber-100 border-amber-200"
              }`}>
                {isRektor ? (
                  <Crown className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600" />
                ) : (
                  <Award className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600" />
                )}
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900">Memerlukan Persetujuan Anda</h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-0.5">Proposal yang menunggu digital signing</p>
              </div>
            </div>
          </div>
          <div className="p-4 sm:p-6 space-y-3">
            {actionNeeded.map((proposal) => (
              <Link key={proposal.id} href={`/dashboard/proposals/${proposal.id}`}>
                <div className={`group p-4 sm:p-5 rounded-xl border bg-white transition-all duration-200 shadow-sm hover:shadow-md ${
                  isRektor
                    ? "border-slate-200 hover:border-orange-300 hover:bg-orange-50/30"
                    : "border-slate-200 hover:border-amber-300 hover:bg-amber-50/30"
                }`}>
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
                    <ArrowRight className={`w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-all duration-200 flex-shrink-0 mt-1 ${
                      isRektor ? "group-hover:text-orange-600" : "group-hover:text-amber-600"
                    }`} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Tracking */}
      {supervisiProposals.filter((p) => p.status !== "completed").length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl border ${isRektor ? "bg-orange-100 border-orange-200" : "bg-cyan-100 border-cyan-200"}`}>
              <TrendingUp className={`w-4 h-4 ${isRektor ? "text-orange-600" : "text-cyan-600"}`} />
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">Tracking Proposal Supervisi</h2>
          </div>
          {supervisiProposals
            .filter((p) => p.status !== "completed")
            .slice(0, 2)
            .map((proposal) => (
              <div key={proposal.id} className="space-y-3">
                <Link href={`/dashboard/proposals/${proposal.id}`}>
                  <div className={`group p-4 sm:p-5 rounded-xl border border-slate-200 bg-white transition-all duration-200 shadow-sm hover:shadow-md ${
                    isRektor ? "hover:border-orange-200 hover:bg-orange-50/20" : "hover:border-cyan-200 hover:bg-cyan-50/20"
                  }`}>
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-slate-900 text-sm sm:text-base leading-snug">{proposal.title}</h3>
                        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">{proposal.partnerName}</p>
                      </div>
                      <ArrowRight className={`w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-all duration-200 flex-shrink-0 ${
                        isRektor ? "group-hover:text-orange-500" : "group-hover:text-cyan-500"
                      }`} />
                    </div>
                  </div>
                </Link>
                <SimpleTracker proposal={proposal} />
              </div>
            ))}
        </div>
      )}

      {/* Riwayat */}
      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
        <div className="p-5 sm:p-6 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
          <h2 className="text-base sm:text-lg font-bold text-slate-900">Riwayat Kerja Sama</h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">Proposal yang sudah melalui tahap supervisi</p>
        </div>
        <div className="p-4 sm:p-6">
          {supervisiProposals.length === 0 ? (
            <div className="text-center py-14">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-slate-100 mb-4">
                <FileText className="w-8 h-8 text-slate-400" />
              </div>
              <p className="text-slate-500 text-sm sm:text-base">Belum ada proposal</p>
            </div>
          ) : (
            <div className="space-y-3">
              {supervisiProposals.slice(0, 5).map((proposal) => (
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
