"use client"

import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FileText, Clock, CheckCircle2, AlertCircle, Plus } from "lucide-react"
import Link from "next/link"
import { useDataStore } from "@/lib/data-store"
import { STATUS_LABELS } from "@/lib/mock-data"
import { canUserTakeAction } from "@/lib/workflow-engine"
import { SimpleTracker } from "@/components/simple-tracker"
import { CommentsCard } from "@/components/comments-card"

export function MitraDashboardBaru() {
  const { user } = useAuth()
  const { proposals } = useDataStore()

  const userProposals = proposals.filter((p) => p.initiator === "mitra" && p.createdBy === user?.id)
  const draftCount = userProposals.filter((p) => p.status === "draft").length
  const pendingCount = userProposals.filter(
    (p) => p.status !== "draft" && p.status !== "completed" && p.status !== "rejected",
  ).length
  const completedCount = userProposals.filter((p) => p.status === "completed").length
  const rejectedCount = userProposals.filter((p) => p.status === "rejected").length

  const actionNeeded = userProposals.filter((p) => canUserTakeAction(p.status, user!.role))

  const getStatusColor = (status: string) => {
    if (status === "draft") return "bg-slate-100 text-slate-700 border-slate-200"
    if (status === "completed") return "bg-emerald-50 text-emerald-700 border-emerald-200"
    if (status === "rejected") return "bg-red-50 text-red-700 border-red-200"
    return "bg-amber-50 text-amber-700 border-amber-200"
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900">Dashboard MITRA</h1>
          <p className="text-slate-600 mt-1 sm:mt-2 text-base lg:text-lg">Selamat datang, {user?.name}</p>
        </div>
        <Link href="/dashboard/proposals/new">
          <Button className="bg-[#e10000] text-white hover:bg-[#c10000] shadow-sm px-4 sm:px-6 py-3 sm:py-5 text-sm sm:text-base w-full sm:w-auto">
            <Plus className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
            Ajukan Proposal Kerja Sama
          </Button>
        </Link>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        <Card className="bg-white border-slate-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 sm:pb-3">
            <CardTitle className="text-sm sm:text-base font-semibold text-slate-900">Draft</CardTitle>
            <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-slate-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-bold text-slate-900">{draftCount}</div>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 sm:mt-2">Proposal belum diajukan</p>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 sm:pb-3">
            <CardTitle className="text-sm sm:text-base font-semibold text-slate-900">Dalam Proses</CardTitle>
            <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-bold text-slate-900">{pendingCount}</div>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 sm:mt-2">Sedang dalam review</p>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 sm:pb-3">
            <CardTitle className="text-sm sm:text-base font-semibold text-slate-900">Selesai</CardTitle>
            <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-bold text-slate-900">{completedCount}</div>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 sm:mt-2">Proposal disetujui</p>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 sm:pb-3">
            <CardTitle className="text-sm sm:text-base font-semibold text-slate-900">Ditolak</CardTitle>
            <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-[#e10000]" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">{rejectedCount}</div>
            <p className="text-sm text-slate-600 mt-2">Proposal tidak disetujui</p>
          </CardContent>
        </Card>
      </div>

      {/* Action Needed */}
      {actionNeeded.length > 0 && (
        <Card className="bg-amber-50/30 border-amber-200 shadow-sm">
          <CardHeader className="pb-5">
            <CardTitle className="text-2xl font-bold text-slate-900">Memerlukan Tindakan Anda</CardTitle>
            <CardDescription className="text-slate-600 text-base">
              Proposal yang menunggu tindakan dari Anda
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {actionNeeded.map((proposal) => (
                <Link key={proposal.id} href={`/dashboard/proposals/${proposal.id}`}>
                  <div className="p-6 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors bg-white shadow-sm">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Badge className={getStatusColor(proposal.status)}>{STATUS_LABELS[proposal.status]}</Badge>
                        </div>
                        <h3 className="font-semibold text-slate-900 text-lg">{proposal.title}</h3>
                        <p className="text-base text-slate-600 mt-2">UPI - {proposal.fakultas}</p>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tracking Proposal Aktif */}
      {userProposals.filter((p) => p.status !== "draft" && p.status !== "completed" && p.status !== "rejected").length > 0 && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-slate-900">Tracking Proposal Aktif</h2>
          {userProposals
            .filter((p) => p.status !== "draft" && p.status !== "completed" && p.status !== "rejected")
            .slice(0, 2)
            .map((proposal) => (
              <div key={proposal.id} className="space-y-4">
                <Link href={`/dashboard/proposals/${proposal.id}`}>
                  <div className="p-6 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition-colors shadow-sm">
                    <h3 className="font-semibold text-slate-900 mb-2 text-lg">{proposal.title}</h3>
                    <p className="text-base text-slate-600">{proposal.partnerName}</p>
                  </div>
                </Link>
                <SimpleTracker proposal={proposal} />
              </div>
            ))}
        </div>
      )}

      {/* Catatan & Komentar */}
      <CommentsCard />

      {/* Daftar Proposal */}
      <Card className="bg-white border-slate-200 shadow-sm">
        <CardHeader className="pb-5">
          <CardTitle className="text-2xl font-bold text-slate-900">Proposal Terbaru</CardTitle>
          <CardDescription className="text-slate-600 text-base">
            Daftar proposal kerja sama terbaru Anda
          </CardDescription>
        </CardHeader>
        <CardContent>
          {userProposals.length === 0 ? (
            <div className="text-center py-16">
              <FileText className="w-16 h-16 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-600 mb-6 text-lg">Belum ada proposal</p>
              <Link href="/dashboard/proposals/new">
                <Button variant="outline" className="border-slate-300 text-slate-700 hover:bg-slate-50 bg-white px-6 py-5">
                  Buat Proposal Pertama
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {userProposals.slice(0, 5).map((proposal) => (
                <Link key={proposal.id} href={`/dashboard/proposals/${proposal.id}`}>
                  <div className="p-6 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors shadow-sm">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Badge className={getStatusColor(proposal.status)}>{STATUS_LABELS[proposal.status]}</Badge>
                        </div>
                        <h3 className="font-semibold text-slate-900 text-lg">{proposal.title}</h3>
                        <p className="text-base text-slate-600 mt-2">UPI - {proposal.fakultas}</p>
                      </div>
                    </div>
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
