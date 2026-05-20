"use client"

import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FileText, Clock, CheckCircle2, TrendingUp, Plus, ArrowRight, Building2, Sparkles } from "lucide-react"
import Link from "next/link"
import { useDataStore } from "@/lib/data-store"
import { STATUS_LABELS } from "@/lib/mock-data"
import { canUserTakeAction } from "@/lib/workflow-engine"
import { SimpleTracker } from "@/components/simple-tracker"

export function FakultasDashboardBaru() {
  const { user } = useAuth()
  const { proposals } = useDataStore()

  const fakultasProposals = proposals.filter(
    (p) => p.fakultas === user?.unit || (p.createdBy === user?.id && p.initiator === "fakultas"),
  )

  const actionNeeded = fakultasProposals.filter((p) => canUserTakeAction(p.status, user!.role))

  const totalProposals = fakultasProposals.length
  const activeProposals = fakultasProposals.filter(
    (p) => p.status !== "draft" && p.status !== "completed" && p.status !== "rejected",
  ).length
  const completedProposals = fakultasProposals.filter((p) => p.status === "completed").length

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
      desc: "Semua proposal fakultas",
      icon: FileText,
      gradient: "from-blue-500 to-indigo-600",
      bg: "from-blue-50 to-white",
      border: "border-blue-200",
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
    },
    {
      label: "Menunggu Verifikasi",
      value: actionNeeded.length,
      desc: "Perlu tindakan Anda",
      icon: Clock,
      gradient: "from-amber-500 to-orange-600",
      bg: "from-amber-50 to-white",
      border: "border-amber-200",
      iconBg: "bg-amber-100",
      iconColor: "text-amber-600",
    },
    {
      label: "Aktif",
      value: activeProposals,
      desc: "Dalam proses",
      icon: TrendingUp,
      gradient: "from-violet-500 to-purple-600",
      bg: "from-violet-50 to-white",
      border: "border-violet-200",
      iconBg: "bg-violet-100",
      iconColor: "text-violet-600",
    },
    {
      label: "Selesai",
      value: completedProposals,
      desc: "Disetujui",
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
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0f172a] via-[#1e1b4b] to-[#312e81] p-6 sm:p-8 shadow-xl">
        <div className="absolute top-0 right-0 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/4" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 rounded-lg bg-indigo-400/20 border border-indigo-400/30">
                <Building2 className="w-4 h-4 text-indigo-300" />
              </div>
              <span className="text-indigo-300 text-sm font-semibold tracking-wide uppercase">Portal Fakultas</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white leading-tight">
              Dashboard <span className="text-indigo-300">Fakultas</span>
            </h1>
            <p className="text-slate-300 mt-1.5 text-sm sm:text-base font-medium">{user?.unit}</p>
          </div>
          <Link href="/dashboard/proposals/new">
            <Button className="bg-indigo-500 text-white hover:bg-indigo-600 shadow-lg shadow-indigo-900/40 px-5 sm:px-7 py-3 sm:py-5 text-sm sm:text-base w-full sm:w-auto rounded-xl font-semibold transition-all duration-200 hover:scale-105 border border-indigo-400/40">
              <Plus className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              Ajukan Proposal Kerja Sama
            </Button>
          </Link>
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
                <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900">Memerlukan Verifikasi Anda</h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-0.5">Proposal yang menunggu verifikasi dari fakultas</p>
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
                      <p className="text-xs sm:text-sm text-slate-500 mt-1">{proposal.partnerName} • {proposal.createdByName}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-amber-600 group-hover:translate-x-0.5 transition-all duration-200 flex-shrink-0 mt-1" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Tracking Aktif */}
      {fakultasProposals.filter((p) => p.status !== "draft" && p.status !== "completed" && p.status !== "rejected").length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-violet-100 border border-violet-200">
              <TrendingUp className="w-4 h-4 text-violet-600" />
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">Tracking Proposal Aktif</h2>
          </div>
          {fakultasProposals
            .filter((p) => p.status !== "draft" && p.status !== "completed" && p.status !== "rejected")
            .slice(0, 2)
            .map((proposal) => (
              <div key={proposal.id} className="space-y-3">
                <Link href={`/dashboard/proposals/${proposal.id}`}>
                  <div className="group p-4 sm:p-5 rounded-xl border border-slate-200 bg-white hover:border-violet-200 hover:bg-violet-50/20 transition-all duration-200 shadow-sm hover:shadow-md">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-slate-900 text-sm sm:text-base leading-snug">{proposal.title}</h3>
                        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">{proposal.partnerName}</p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-violet-500 group-hover:translate-x-0.5 transition-all duration-200 flex-shrink-0" />
                    </div>
                  </div>
                </Link>
                <SimpleTracker proposal={proposal} />
              </div>
            ))}
        </div>
      )}

      {/* Semua Proposal */}
      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
        <div className="p-5 sm:p-6 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
          <h2 className="text-base sm:text-lg font-bold text-slate-900">Semua Proposal Fakultas</h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">Daftar proposal kerja sama terbaru</p>
        </div>
        <div className="p-4 sm:p-6">
          {fakultasProposals.length === 0 ? (
            <div className="text-center py-14">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-slate-100 mb-4">
                <FileText className="w-8 h-8 text-slate-400" />
              </div>
              <p className="text-slate-500 text-sm sm:text-base">Belum ada proposal dari fakultas ini</p>
            </div>
          ) : (
            <div className="space-y-3">
              {fakultasProposals.slice(0, 5).map((proposal) => (
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
                        <p className="text-xs sm:text-sm text-slate-500 mt-1">{proposal.partnerName}</p>
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
