"use client"

import { ProtectedRoute } from "@/components/protected-route"
import { DashboardLayout } from "@/components/dashboard-layout"
import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FileText, Clock, CheckCircle2, AlertCircle, Plus, TrendingUp, Building2 } from "lucide-react"
import Link from "next/link"
import { MOCK_PROPOSALS, STATUS_LABELS } from "@/lib/mock-data"
import { canUserApprove } from "@/lib/workflow-utils"
import { ProposalTracker } from "@/components/proposal-tracker"

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <DashboardContent />
      </DashboardLayout>
    </ProtectedRoute>
  )
}

function DashboardContent() {
  const { user } = useAuth()

  switch (user?.role) {
    case "mitra":
      return <MitraDashboard />
    case "fakultas":
      return <FakultasDashboard />
    case "dkui":
      return <DKUIDashboard />
    case "biro_hukum":
      return <BiroHukumDashboard />
    case "wakil_rektor":
    case "rektor":
      return <SupervisiDashboard />
    default:
      return <DefaultDashboard />
  }
}

function MitraDashboard() {
  const { user } = useAuth()

  const userProposals = MOCK_PROPOSALS.filter((p) => p.initiator === "mitra" && p.createdBy === user?.id)
  const draftCount = userProposals.filter((p) => p.status === "draft").length
  const pendingCount = userProposals.filter(
    (p) => p.status !== "draft" && p.status !== "completed" && p.status !== "rejected",
  ).length
  const completedCount = userProposals.filter((p) => p.status === "completed").length
  const rejectedCount = userProposals.filter((p) => p.status === "rejected").length

  // Proposals yang memerlukan tindakan dari MITRA
  const actionNeeded = userProposals.filter((p) => canUserApprove(p.status, user!.role, p.initiator))

  const getStatusColor = (status: string) => {
    if (status === "draft") return "bg-slate-500/10 text-slate-400 border-slate-500/20"
    if (status === "completed") return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
    if (status === "rejected") return "bg-red-500/10 text-red-400 border-red-500/20"
    return "bg-blue-500/10 text-blue-400 border-blue-500/20"
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Dashboard MITRA</h1>
          <p className="text-slate-400 mt-1">Selamat datang, {user?.name}</p>
        </div>
        <Link href="/dashboard/proposals/new">
          <Button className="bg-emerald-600 text-white hover:bg-emerald-700">
            <Plus className="w-4 h-4 mr-2" />
            Ajukan Proposal Kerja Sama
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-slate-900/50 border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Draft</CardTitle>
            <FileText className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{draftCount}</div>
            <p className="text-xs text-slate-500 mt-1">Proposal yang belum diajukan</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Dalam Proses</CardTitle>
            <Clock className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{pendingCount}</div>
            <p className="text-xs text-slate-500 mt-1">Sedang dalam review</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Selesai</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{completedCount}</div>
            <p className="text-xs text-slate-500 mt-1">Proposal disetujui</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Ditolak</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{rejectedCount}</div>
            <p className="text-xs text-slate-500 mt-1">Proposal tidak disetujui</p>
          </CardContent>
        </Card>
      </div>

      {actionNeeded.length > 0 && (
        <Card className="bg-slate-900/50 border-blue-900/50">
          <CardHeader>
            <CardTitle className="text-white">Memerlukan Tindakan Anda</CardTitle>
            <CardDescription className="text-slate-400">Proposal yang menunggu tindakan dari Anda</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {actionNeeded.map((proposal) => (
                <Link key={proposal.id} href={`/dashboard/proposals/${proposal.id}`}>
                  <div className="p-4 rounded-lg border border-slate-800 hover:bg-slate-800/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge className={getStatusColor(proposal.status)}>{STATUS_LABELS[proposal.status]}</Badge>
                        </div>
                        <h3 className="font-medium text-white">{proposal.title}</h3>
                        <p className="text-sm text-slate-400 mt-1">UPI - {proposal.fakultas}</p>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {userProposals.filter((p) => p.status !== "draft" && p.status !== "completed" && p.status !== "rejected").length >
        0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-white">Tracking Proposal Aktif</h2>
          {userProposals
            .filter((p) => p.status !== "draft" && p.status !== "completed" && p.status !== "rejected")
            .slice(0, 2)
            .map((proposal) => (
              <div key={proposal.id} className="space-y-3">
                <Link href={`/dashboard/proposals/${proposal.id}`}>
                  <div className="p-4 rounded-lg border border-slate-800 bg-slate-900/30 hover:bg-slate-800/50 transition-colors">
                    <h3 className="font-medium text-white mb-1">{proposal.title}</h3>
                    <p className="text-sm text-slate-400">{proposal.partnerName}</p>
                  </div>
                </Link>
                <ProposalTracker proposal={proposal} compact />
              </div>
            ))}
        </div>
      )}

      <Card className="bg-slate-900/50 border-slate-800">
        <CardHeader>
          <CardTitle className="text-white">Proposal Terbaru</CardTitle>
          <CardDescription className="text-slate-400">Daftar proposal kerja sama terbaru Anda</CardDescription>
        </CardHeader>
        <CardContent>
          {userProposals.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400 mb-4">Belum ada proposal</p>
              <Link href="/dashboard/proposals/new">
                <Button variant="outline" className="border-slate-700 text-slate-200 hover:bg-slate-800 bg-transparent">
                  Buat Proposal Pertama
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {userProposals.slice(0, 5).map((proposal) => (
                <Link key={proposal.id} href={`/dashboard/proposals/${proposal.id}`}>
                  <div className="p-4 rounded-lg border border-slate-800 hover:bg-slate-800/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge className={getStatusColor(proposal.status)}>{STATUS_LABELS[proposal.status]}</Badge>
                        </div>
                        <h3 className="font-medium text-white">{proposal.title}</h3>
                        <p className="text-sm text-slate-400 mt-1">UPI - {proposal.fakultas}</p>
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

function FakultasDashboard() {
  const { user } = useAuth()

  // Proposals dari fakultas ini (baik yang diajukan fakultas atau ditujukan ke fakultas)
  const fakultasProposals = MOCK_PROPOSALS.filter(
    (p) => p.fakultas === user?.fakultas || (p.createdBy === user?.id && p.initiator === "fakultas"),
  )

  // Proposals yang memerlukan verifikasi dari fakultas
  const actionNeeded = fakultasProposals.filter((p) => canUserApprove(p.status, user!.role, p.initiator))

  const totalProposals = fakultasProposals.length
  const activeProposals = fakultasProposals.filter(
    (p) => p.status !== "draft" && p.status !== "completed" && p.status !== "rejected",
  ).length
  const completedProposals = fakultasProposals.filter((p) => p.status === "completed").length
  const rejectedProposals = fakultasProposals.filter((p) => p.status === "rejected").length

  const getStatusColor = (status: string) => {
    if (status === "draft") return "bg-slate-500/10 text-slate-400 border-slate-500/20"
    if (status === "completed") return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
    if (status === "rejected") return "bg-red-500/10 text-red-400 border-red-500/20"
    return "bg-blue-500/10 text-blue-400 border-blue-500/20"
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Dashboard Fakultas</h1>
          <p className="text-slate-400 mt-1">{user?.fakultas}</p>
        </div>
        <Link href="/dashboard/proposals/new">
          <Button className="bg-emerald-600 text-white hover:bg-emerald-700">
            <Plus className="w-4 h-4 mr-2" />
            Ajukan Proposal Kerja Sama
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-slate-900/50 border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Total Proposal</CardTitle>
            <FileText className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{totalProposals}</div>
            <p className="text-xs text-slate-500 mt-1">Semua proposal fakultas</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Menunggu Verifikasi</CardTitle>
            <Clock className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{actionNeeded.length}</div>
            <p className="text-xs text-slate-500 mt-1">Perlu tindakan Anda</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Aktif</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{activeProposals}</div>
            <p className="text-xs text-slate-500 mt-1">Dalam proses</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Selesai</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{completedProposals}</div>
            <p className="text-xs text-slate-500 mt-1">Disetujui</p>
          </CardContent>
        </Card>
      </div>

      {actionNeeded.length > 0 && (
        <Card className="bg-slate-900/50 border-blue-900/50">
          <CardHeader>
            <CardTitle className="text-white">Memerlukan Verifikasi Anda</CardTitle>
            <CardDescription className="text-slate-400">
              Proposal yang menunggu verifikasi dari fakultas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {actionNeeded.map((proposal) => (
                <Link key={proposal.id} href={`/dashboard/proposals/${proposal.id}`}>
                  <div className="p-4 rounded-lg border border-slate-800 hover:bg-slate-800/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge className="bg-slate-700/50 text-slate-300 border-slate-600">
                            {proposal.initiator.toUpperCase()}
                          </Badge>
                          <Badge className={getStatusColor(proposal.status)}>{STATUS_LABELS[proposal.status]}</Badge>
                        </div>
                        <h3 className="font-medium text-white">{proposal.title}</h3>
                        <p className="text-sm text-slate-400 mt-1">
                          {proposal.partnerName} • {proposal.createdByName}
                        </p>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {fakultasProposals.filter((p) => p.status !== "draft" && p.status !== "completed" && p.status !== "rejected")
        .length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-white">Tracking Proposal Aktif</h2>
          {fakultasProposals
            .filter((p) => p.status !== "draft" && p.status !== "completed" && p.status !== "rejected")
            .slice(0, 2)
            .map((proposal) => (
              <div key={proposal.id} className="space-y-3">
                <Link href={`/dashboard/proposals/${proposal.id}`}>
                  <div className="p-4 rounded-lg border border-slate-800 bg-slate-900/30 hover:bg-slate-800/50 transition-colors">
                    <h3 className="font-medium text-white mb-1">{proposal.title}</h3>
                    <p className="text-sm text-slate-400">{proposal.partnerName}</p>
                  </div>
                </Link>
                <ProposalTracker proposal={proposal} compact />
              </div>
            ))}
        </div>
      )}

      <Card className="bg-slate-900/50 border-slate-800">
        <CardHeader>
          <CardTitle className="text-white">Semua Proposal Fakultas</CardTitle>
          <CardDescription className="text-slate-400">Daftar proposal kerja sama terbaru</CardDescription>
        </CardHeader>
        <CardContent>
          {fakultasProposals.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400">Belum ada proposal dari fakultas ini</p>
            </div>
          ) : (
            <div className="space-y-2">
              {fakultasProposals.slice(0, 5).map((proposal) => (
                <Link key={proposal.id} href={`/dashboard/proposals/${proposal.id}`}>
                  <div className="p-4 rounded-lg border border-slate-800 hover:bg-slate-800/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge className="bg-slate-700/50 text-slate-300 border-slate-600">
                            {proposal.initiator.toUpperCase()}
                          </Badge>
                          <Badge className={getStatusColor(proposal.status)}>{STATUS_LABELS[proposal.status]}</Badge>
                        </div>
                        <h3 className="font-medium text-white">{proposal.title}</h3>
                        <p className="text-sm text-slate-400 mt-1">{proposal.partnerName}</p>
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

function DKUIDashboard() {
  const { user } = useAuth()

  // DKUI melihat semua proposals
  const allProposals = MOCK_PROPOSALS

  // Proposals yang memerlukan tindakan dari DKUI
  const actionNeeded = allProposals.filter((p) => canUserApprove(p.status, user!.role, p.initiator))

  const totalProposals = allProposals.length
  const fromMitra = allProposals.filter((p) => p.initiator === "mitra").length
  const fromFakultas = allProposals.filter((p) => p.initiator === "fakultas").length
  const completedProposals = allProposals.filter((p) => p.status === "completed").length
  const inProcessProposals = allProposals.filter(
    (p) => p.status !== "draft" && p.status !== "completed" && p.status !== "rejected",
  ).length

  // Count by fakultas
  const fakultasStats = allProposals.reduce(
    (acc, p) => {
      const fak = p.fakultas || "Lainnya"
      if (!acc[fak]) acc[fak] = 0
      acc[fak]++
      return acc
    },
    {} as Record<string, number>,
  )

  const getStatusColor = (status: string) => {
    if (status === "draft") return "bg-slate-500/10 text-slate-400 border-slate-500/20"
    if (status === "completed") return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
    if (status === "rejected") return "bg-red-500/10 text-red-400 border-red-500/20"
    return "bg-blue-500/10 text-blue-400 border-blue-500/20"
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Dashboard DKUI</h1>
        <p className="text-slate-400 mt-1">Divisi Kerja Sama Universitas Indonesia - Pusat Kendali Sistem</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-slate-900/50 border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Total Proposal</CardTitle>
            <FileText className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{totalProposals}</div>
            <p className="text-xs text-slate-500 mt-1">
              MITRA: {fromMitra} • Fakultas: {fromFakultas}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Menunggu Tindakan</CardTitle>
            <Clock className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{actionNeeded.length}</div>
            <p className="text-xs text-slate-500 mt-1">Perlu tindakan DKUI</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Dalam Proses</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{inProcessProposals}</div>
            <p className="text-xs text-slate-500 mt-1">Sedang diproses</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Selesai</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{completedProposals}</div>
            <p className="text-xs text-slate-500 mt-1">Diarsipkan</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-slate-900/50 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white">Statistik per Fakultas</CardTitle>
            <CardDescription className="text-slate-400">Distribusi proposal per fakultas/unit</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(fakultasStats).map(([fakultas, count]) => (
                <div key={fakultas} className="flex items-center justify-between p-3 rounded-lg bg-slate-800/30">
                  <div className="flex items-center gap-3">
                    <Building2 className="w-5 h-5 text-slate-400" />
                    <span className="text-sm font-medium text-white">{fakultas}</span>
                  </div>
                  <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30">{count} proposal</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {actionNeeded.length > 0 && (
          <Card className="bg-slate-900/50 border-blue-900/50">
            <CardHeader>
              <CardTitle className="text-white">Memerlukan Tindakan DKUI</CardTitle>
              <CardDescription className="text-slate-400">Proposal yang perlu diproses</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {actionNeeded.map((proposal) => (
                  <Link key={proposal.id} href={`/dashboard/proposals/${proposal.id}`}>
                    <div className="p-4 rounded-lg border border-slate-800 hover:bg-slate-800/50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge className="bg-slate-700/50 text-slate-300 border-slate-600">
                              {proposal.initiator.toUpperCase()}
                            </Badge>
                            <Badge className={getStatusColor(proposal.status)}>{STATUS_LABELS[proposal.status]}</Badge>
                          </div>
                          <h3 className="font-medium text-white">{proposal.title}</h3>
                          <p className="text-sm text-slate-400 mt-1">
                            {proposal.partnerName} • {proposal.fakultas}
                          </p>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {allProposals.filter((p) => p.status !== "draft" && p.status !== "completed" && p.status !== "rejected").length >
        0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-white">Tracking Proposal Aktif</h2>
          {allProposals
            .filter((p) => p.status !== "draft" && p.status !== "completed" && p.status !== "rejected")
            .slice(0, 2)
            .map((proposal) => (
              <div key={proposal.id} className="space-y-3">
                <Link href={`/dashboard/proposals/${proposal.id}`}>
                  <div className="p-4 rounded-lg border border-slate-800 bg-slate-900/30 hover:bg-slate-800/50 transition-colors">
                    <h3 className="font-medium text-white mb-1">{proposal.title}</h3>
                    <p className="text-sm text-slate-400">{proposal.partnerName}</p>
                  </div>
                </Link>
                <ProposalTracker proposal={proposal} compact />
              </div>
            ))}
        </div>
      )}
    </div>
  )
}

function BiroHukumDashboard() {
  const { user } = useAuth()

  // Proposals yang di Biro Hukum
  const biroProposals = MOCK_PROPOSALS.filter(
    (p) =>
      p.status === "biro_hukum_review" ||
      p.status === "biro_hukum_approved" ||
      p.status === "biro_hukum_rejected" ||
      (p.status !== "draft" && p.status !== "rejected" && p.approvalHistory.some((h) => h.actorRole === "biro_hukum")),
  )

  // Proposals yang memerlukan validasi hukum
  const actionNeeded = biroProposals.filter((p) => canUserApprove(p.status, user!.role, p.initiator))

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
    if (status === "draft") return "bg-slate-500/10 text-slate-400 border-slate-500/20"
    if (status === "completed") return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
    if (status === "rejected") return "bg-red-500/10 text-red-400 border-red-500/20"
    return "bg-blue-500/10 text-blue-400 border-blue-500/20"
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Dashboard Biro Hukum</h1>
        <p className="text-slate-400 mt-1">Validasi dan paraf aspek hukum kerja sama</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-slate-900/50 border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Total Review</CardTitle>
            <FileText className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{totalReviewed}</div>
            <p className="text-xs text-slate-500 mt-1">Dokumen yang sudah direview</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Menunggu Validasi</CardTitle>
            <Clock className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{pendingReview}</div>
            <p className="text-xs text-slate-500 mt-1">Perlu validasi hukum</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Disetujui</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{approved}</div>
            <p className="text-xs text-slate-500 mt-1">Dokumen sah</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Ditolak</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{rejected}</div>
            <p className="text-xs text-slate-500 mt-1">Perlu perbaikan</p>
          </CardContent>
        </Card>
      </div>

      {actionNeeded.length > 0 && (
        <Card className="bg-slate-900/50 border-blue-900/50">
          <CardHeader>
            <CardTitle className="text-white">Memerlukan Validasi Hukum</CardTitle>
            <CardDescription className="text-slate-400">Dokumen yang menunggu review Biro Hukum</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {actionNeeded.map((proposal) => (
                <Link key={proposal.id} href={`/dashboard/proposals/${proposal.id}`}>
                  <div className="p-4 rounded-lg border border-slate-800 hover:bg-slate-800/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge className="bg-slate-700/50 text-slate-300 border-slate-600">
                            {proposal.initiator.toUpperCase()}
                          </Badge>
                          <Badge className={getStatusColor(proposal.status)}>{STATUS_LABELS[proposal.status]}</Badge>
                        </div>
                        <h3 className="font-medium text-white">{proposal.title}</h3>
                        <p className="text-sm text-slate-400 mt-1">
                          {proposal.partnerName} • {proposal.fakultas}
                        </p>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {biroProposals.filter((p) => p.status !== "completed" && p.status !== "rejected").length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-white">Tracking Dokumen dalam Review</h2>
          {biroProposals
            .filter((p) => p.status !== "completed" && p.status !== "rejected")
            .slice(0, 2)
            .map((proposal) => (
              <div key={proposal.id} className="space-y-3">
                <Link href={`/dashboard/proposals/${proposal.id}`}>
                  <div className="p-4 rounded-lg border border-slate-800 bg-slate-900/30 hover:bg-slate-800/50 transition-colors">
                    <h3 className="font-medium text-white mb-1">{proposal.title}</h3>
                    <p className="text-sm text-slate-400">{proposal.partnerName}</p>
                  </div>
                </Link>
                <ProposalTracker proposal={proposal} compact />
              </div>
            ))}
        </div>
      )}

      <Card className="bg-slate-900/50 border-slate-800">
        <CardHeader>
          <CardTitle className="text-white">Riwayat Review</CardTitle>
          <CardDescription className="text-slate-400">Dokumen yang sudah direview oleh Biro Hukum</CardDescription>
        </CardHeader>
        <CardContent>
          {biroProposals.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400">Belum ada dokumen yang direview</p>
            </div>
          ) : (
            <div className="space-y-2">
              {biroProposals.slice(0, 5).map((proposal) => (
                <Link key={proposal.id} href={`/dashboard/proposals/${proposal.id}`}>
                  <div className="p-4 rounded-lg border border-slate-800 hover:bg-slate-800/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge className="bg-slate-700/50 text-slate-300 border-slate-600">
                            {proposal.initiator.toUpperCase()}
                          </Badge>
                          <Badge className={getStatusColor(proposal.status)}>{STATUS_LABELS[proposal.status]}</Badge>
                        </div>
                        <h3 className="font-medium text-white">{proposal.title}</h3>
                        <p className="text-sm text-slate-400 mt-1">
                          {proposal.partnerName} • {proposal.fakultas}
                        </p>
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

function SupervisiDashboard() {
  const { user } = useAuth()

  // Proposals yang sudah sampai ke tahap supervisi
  const supervisiProposals = MOCK_PROPOSALS.filter(
    (p) =>
      p.status === "warek_review" ||
      p.status === "warek_approved" ||
      p.status === "rektor_review" ||
      p.status === "rektor_approved" ||
      p.status === "completed",
  )

  // Proposals yang memerlukan tindakan dari user
  const actionNeeded = supervisiProposals.filter((p) => canUserApprove(p.status, user!.role, p.initiator))

  const totalProposals = supervisiProposals.length
  const pendingReview = actionNeeded.length
  const approved = supervisiProposals.filter((p) => p.status === "completed").length
  const inReview = supervisiProposals.filter(
    (p) => p.status === "warek_review" || p.status === "warek_approved" || p.status === "rektor_review",
  ).length

  const getStatusColor = (status: string) => {
    if (status === "draft") return "bg-slate-500/10 text-slate-400 border-slate-500/20"
    if (status === "completed") return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
    if (status === "rejected") return "bg-red-500/10 text-red-400 border-red-500/20"
    return "bg-blue-500/10 text-blue-400 border-blue-500/20"
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">
          Dashboard {user?.role === "wakil_rektor" ? "Wakil Rektor" : "Rektor"}
        </h1>
        <p className="text-slate-400 mt-1">Review dan persetujuan akhir kerja sama</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-slate-900/50 border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Total Proposal</CardTitle>
            <FileText className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{totalProposals}</div>
            <p className="text-xs text-slate-500 mt-1">Proposal di tahap supervisi</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Menunggu Review</CardTitle>
            <Clock className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{pendingReview}</div>
            <p className="text-xs text-slate-500 mt-1">Perlu persetujuan Anda</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Dalam Review</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{inReview}</div>
            <p className="text-xs text-slate-500 mt-1">Proses supervisi</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Disetujui</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{approved}</div>
            <p className="text-xs text-slate-500 mt-1">Kerja sama selesai</p>
          </CardContent>
        </Card>
      </div>

      {actionNeeded.length > 0 && (
        <Card className="bg-slate-900/50 border-blue-900/50">
          <CardHeader>
            <CardTitle className="text-white">Memerlukan Persetujuan Anda</CardTitle>
            <CardDescription className="text-slate-400">Proposal yang menunggu digital signing</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {actionNeeded.map((proposal) => (
                <Link key={proposal.id} href={`/dashboard/proposals/${proposal.id}`}>
                  <div className="p-4 rounded-lg border border-slate-800 hover:bg-slate-800/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge className="bg-slate-700/50 text-slate-300 border-slate-600">
                            {proposal.initiator.toUpperCase()}
                          </Badge>
                          <Badge className={getStatusColor(proposal.status)}>{STATUS_LABELS[proposal.status]}</Badge>
                        </div>
                        <h3 className="font-medium text-white">{proposal.title}</h3>
                        <p className="text-sm text-slate-400 mt-1">
                          {proposal.partnerName} • {proposal.fakultas}
                        </p>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {supervisiProposals.filter((p) => p.status !== "completed").length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-white">Tracking Proposal Supervisi</h2>
          {supervisiProposals
            .filter((p) => p.status !== "completed")
            .slice(0, 2)
            .map((proposal) => (
              <div key={proposal.id} className="space-y-3">
                <Link href={`/dashboard/proposals/${proposal.id}`}>
                  <div className="p-4 rounded-lg border border-slate-800 bg-slate-900/30 hover:bg-slate-800/50 transition-colors">
                    <h3 className="font-medium text-white mb-1">{proposal.title}</h3>
                    <p className="text-sm text-slate-400">{proposal.partnerName}</p>
                  </div>
                </Link>
                <ProposalTracker proposal={proposal} compact />
              </div>
            ))}
        </div>
      )}

      <Card className="bg-slate-900/50 border-slate-800">
        <CardHeader>
          <CardTitle className="text-white">Riwayat Kerja Sama</CardTitle>
          <CardDescription className="text-slate-400">Proposal yang sudah melalui tahap supervisi</CardDescription>
        </CardHeader>
        <CardContent>
          {supervisiProposals.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400">Belum ada proposal</p>
            </div>
          ) : (
            <div className="space-y-2">
              {supervisiProposals.slice(0, 5).map((proposal) => (
                <Link key={proposal.id} href={`/dashboard/proposals/${proposal.id}`}>
                  <div className="p-4 rounded-lg border border-slate-800 hover:bg-slate-800/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge className="bg-slate-700/50 text-slate-300 border-slate-600">
                            {proposal.initiator.toUpperCase()}
                          </Badge>
                          <Badge className={getStatusColor(proposal.status)}>{STATUS_LABELS[proposal.status]}</Badge>
                        </div>
                        <h3 className="font-medium text-white">{proposal.title}</h3>
                        <p className="text-sm text-slate-400 mt-1">
                          {proposal.partnerName} • {proposal.fakultas}
                        </p>
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

function DefaultDashboard() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-white">Dashboard</h1>
      <Card className="bg-slate-900/50 border-slate-800">
        <CardHeader>
          <CardTitle className="text-white">Selamat Datang</CardTitle>
          <CardDescription className="text-slate-400">Silakan login dengan role yang sesuai</CardDescription>
        </CardHeader>
      </Card>
    </div>
  )
}
