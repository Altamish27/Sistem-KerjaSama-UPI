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
import { DKUIStatisticsDashboard } from "@/components/dkui-statistics-dashboard"

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
    if (status === "draft") return "bg-slate-100 text-slate-700 border-slate-200"
    if (status === "completed") return "bg-emerald-50 text-emerald-700 border-emerald-200"
    if (status === "rejected") return "bg-red-50 text-red-700 border-red-200"
    return "bg-amber-50 text-amber-700 border-amber-200"
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header Section */}
      <div className="bg-gradient-to-br from-[#e10000] to-[#b30000] rounded-2xl p-6 sm:p-8 text-white shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold">Dashboard MITRA</h1>
            <p className="text-white/90 mt-2 sm:mt-3 text-lg lg:text-xl">Selamat datang, {user?.name}</p>
            <p className="text-white/80 mt-1 text-sm sm:text-base">Kelola proposal kerja sama Anda dengan universitas</p>
          </div>
          <Link href="/dashboard/proposals/new">
            <Button className="bg-white text-[#e10000] hover:bg-gray-100 shadow-md px-6 py-6 text-base font-semibold w-full sm:w-auto transition-all hover:shadow-xl">
              <Plus className="w-5 h-5 mr-2" />
              Ajukan Proposal Baru
            </Button>
          </Link>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <Card className="bg-gradient-to-br from-slate-50 to-white border-slate-200 shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm sm:text-base font-semibold text-slate-700">Draft</CardTitle>
            <div className="p-3 bg-slate-100 rounded-full">
              <FileText className="h-5 w-5 sm:h-6 sm:w-6 text-slate-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl sm:text-4xl font-bold text-slate-900">{draftCount}</div>
            <p className="text-xs sm:text-sm text-slate-600 mt-2 font-medium">Belum diajukan</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50 to-white border-amber-200 shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm sm:text-base font-semibold text-amber-700">Dalam Proses</CardTitle>
            <div className="p-3 bg-amber-100 rounded-full">
              <Clock className="h-5 w-5 sm:h-6 sm:w-6 text-amber-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl sm:text-4xl font-bold text-amber-900">{pendingCount}</div>
            <p className="text-xs sm:text-sm text-amber-700 mt-2 font-medium">Sedang direview</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-50 to-white border-emerald-200 shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm sm:text-base font-semibold text-emerald-700">Selesai</CardTitle>
            <div className="p-3 bg-emerald-100 rounded-full">
              <CheckCircle2 className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl sm:text-4xl font-bold text-emerald-900">{completedCount}</div>
            <p className="text-xs sm:text-sm text-emerald-700 mt-2 font-medium">Disetujui</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-white border-red-200 shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm sm:text-base font-semibold text-red-700">Ditolak</CardTitle>
            <div className="p-3 bg-red-100 rounded-full">
              <AlertCircle className="h-5 w-5 sm:h-6 sm:w-6 text-[#e10000]" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl sm:text-4xl font-bold text-red-900">{rejectedCount}</div>
            <p className="text-xs sm:text-sm text-red-700 mt-2 font-medium">Perlu perbaikan</p>
          </CardContent>
        </Card>
      </div>

      {actionNeeded.length > 0 && (
        <Card className="bg-gradient-to-br from-amber-50 via-amber-25 to-white border-2 border-amber-300 shadow-lg">
          <CardHeader className="pb-5 border-b border-amber-200">
            <div className="flex items-start gap-3">
              <div className="p-3 bg-amber-100 rounded-full">
                <AlertCircle className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold text-slate-900">Memerlukan Tindakan Anda</CardTitle>
                <CardDescription className="text-slate-700 text-base mt-1">
                  {actionNeeded.length} proposal menunggu tindakan dari Anda
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {actionNeeded.map((proposal) => (
                <Link key={proposal.id} href={`/dashboard/proposals/${proposal.id}`}>
                  <div className="p-6 rounded-xl border-2 border-amber-200 hover:border-amber-400 hover:bg-amber-50/50 transition-all bg-white shadow-md hover:shadow-xl">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <Badge className={`${getStatusColor(proposal.status)} font-semibold text-sm px-3 py-1`}>
                            {STATUS_LABELS[proposal.status]}
                          </Badge>
                        </div>
                        <h3 className="font-bold text-slate-900 text-xl mb-2">{proposal.title}</h3>
                        <p className="text-base text-slate-600">
                          <Building2 className="inline w-4 h-4 mr-1" />
                          UPI - {proposal.fakultas}
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

      {userProposals.filter((p) => p.status !== "draft" && p.status !== "completed" && p.status !== "rejected").length >
        0 && (
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-blue-600" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">Tracking Proposal Aktif</h2>
          </div>
          {userProposals
            .filter((p) => p.status !== "draft" && p.status !== "completed" && p.status !== "rejected")
            .slice(0, 2)
            .map((proposal) => (
              <div key={proposal.id} className="space-y-4">
                <Link href={`/dashboard/proposals/${proposal.id}`}>
                  <div className="p-6 rounded-xl border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-white hover:border-blue-400 hover:shadow-lg transition-all shadow-md">
                    <h3 className="font-bold text-slate-900 mb-2 text-xl">{proposal.title}</h3>
                    <p className="text-base text-slate-600 flex items-center gap-2">
                      <Building2 className="w-4 h-4" />
                      {proposal.partnerName}
                    </p>
                  </div>
                </Link>
                <ProposalTracker proposal={proposal} compact />
              </div>
            ))}
        </div>
      )}

      <Card className="bg-white border-slate-200 shadow-lg">
        <CardHeader className="pb-5 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white">
          <div className="flex items-start gap-3">
            <div className="p-3 bg-slate-100 rounded-full">
              <FileText className="h-6 w-6 text-slate-600" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold text-slate-900">Proposal Terbaru</CardTitle>
              <CardDescription className="text-slate-600 text-base mt-1">
                Daftar semua proposal kerja sama Anda
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          {userProposals.length === 0 ? (
            <div className="text-center py-20">
              <div className="p-6 bg-slate-100 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                <FileText className="w-12 h-12 text-slate-400" />
              </div>
              <h3 className="text-xl font-semibold text-slate-700 mb-2">Belum ada proposal</h3>
              <p className="text-slate-600 mb-6 text-base">Mulai dengan mengajukan proposal kerja sama pertama Anda</p>
              <Link href="/dashboard/proposals/new">
                <Button className="bg-[#e10000] text-white hover:bg-[#c10000] px-8 py-6 text-base font-semibold shadow-md hover:shadow-lg transition-all">
                  <Plus className="w-5 h-5 mr-2" />
                  Buat Proposal Pertama
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {userProposals.slice(0, 5).map((proposal) => (
                <Link key={proposal.id} href={`/dashboard/proposals/${proposal.id}`}>
                  <div className="p-6 rounded-xl border border-slate-200 hover:border-slate-400 hover:shadow-lg transition-all bg-white shadow-sm">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <Badge className={`${getStatusColor(proposal.status)} font-semibold px-3 py-1`}>
                            {STATUS_LABELS[proposal.status]}
                          </Badge>
                        </div>
                        <h3 className="font-bold text-slate-900 text-lg mb-2">{proposal.title}</h3>
                        <p className="text-base text-slate-600 flex items-center gap-2">
                          <Building2 className="w-4 h-4" />
                          UPI - {proposal.fakultas}
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
    if (status === "draft") return "bg-slate-100 text-slate-700 border-slate-200"
    if (status === "completed") return "bg-emerald-50 text-emerald-700 border-emerald-200"
    if (status === "rejected") return "bg-red-50 text-red-700 border-red-200"
    return "bg-amber-50 text-amber-700 border-amber-200"
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900">Dashboard Fakultas</h1>
          <p className="text-slate-600 mt-1 sm:mt-2 text-base lg:text-lg">{user?.fakultas}</p>
        </div>
        <Link href="/dashboard/proposals/new">
          <Button className="bg-[#e10000] text-white hover:bg-[#c10000] shadow-sm px-4 sm:px-6 py-3 sm:py-5 text-sm sm:text-base w-full sm:w-auto">
            <Plus className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
            Ajukan Proposal Kerja Sama
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        <Card className="bg-white border-slate-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 sm:pb-3">
            <CardTitle className="text-sm sm:text-base font-semibold text-slate-900">Total Proposal</CardTitle>
            <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-slate-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-bold text-slate-900">{totalProposals}</div>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 sm:mt-2">Semua proposal fakultas</p>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 sm:pb-3">
            <CardTitle className="text-sm sm:text-base font-semibold text-slate-900">Menunggu Verifikasi</CardTitle>
            <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-bold text-slate-900">{actionNeeded.length}</div>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 sm:mt-2">Perlu tindakan Anda</p>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 sm:pb-3">
            <CardTitle className="text-sm sm:text-base font-semibold text-slate-900">Aktif</CardTitle>
            <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-bold text-slate-900">{activeProposals}</div>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 sm:mt-2">Dalam proses</p>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 sm:pb-3">
            <CardTitle className="text-sm sm:text-base font-semibold text-slate-900">Selesai</CardTitle>
            <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-bold text-slate-900">{completedProposals}</div>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 sm:mt-2">Disetujui</p>
          </CardContent>
        </Card>
      </div>

      {actionNeeded.length > 0 && (
        <Card className="bg-amber-50/30 border-amber-200 shadow-sm">
          <CardHeader className="pb-5">
            <CardTitle className="text-xl sm:text-2xl font-bold text-slate-900">Memerlukan Verifikasi Anda</CardTitle>
            <CardDescription className="text-slate-600 text-sm sm:text-base">
              Proposal yang menunggu verifikasi dari fakultas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 sm:space-y-4">
              {actionNeeded.map((proposal) => (
                <Link key={proposal.id} href={`/dashboard/proposals/${proposal.id}`}>
                  <div className="p-4 sm:p-6 rounded-lg sm:rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors bg-white shadow-sm">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 sm:gap-3 mb-2">
                          <Badge className="bg-slate-100 text-slate-700 border-slate-200">
                            {proposal.initiator.toUpperCase()}
                          </Badge>
                          <Badge className={getStatusColor(proposal.status)}>{STATUS_LABELS[proposal.status]}</Badge>
                        </div>
                        <h3 className="font-semibold text-slate-900 text-base sm:text-lg">{proposal.title}</h3>
                        <p className="text-sm sm:text-base text-slate-600 mt-1 sm:mt-2">
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
        <div className="space-y-4 sm:space-y-6">
          <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-900">Tracking Proposal Aktif</h2>
          {fakultasProposals
            .filter((p) => p.status !== "draft" && p.status !== "completed" && p.status !== "rejected")
            .slice(0, 2)
            .map((proposal) => (
              <div key={proposal.id} className="space-y-3 sm:space-y-4">
                <Link href={`/dashboard/proposals/${proposal.id}`}>
                  <div className="p-4 sm:p-6 rounded-lg sm:rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition-colors shadow-sm">
                    <h3 className="font-semibold text-slate-900 mb-2 text-base sm:text-lg">{proposal.title}</h3>
                    <p className="text-sm sm:text-base text-slate-600">{proposal.partnerName}</p>
                  </div>
                </Link>
                <ProposalTracker proposal={proposal} compact />
              </div>
            ))}
        </div>
      )}

      <Card className="bg-white border-slate-200 shadow-sm">
        <CardHeader className="pb-5">
          <CardTitle className="text-xl sm:text-2xl font-bold text-slate-900">Semua Proposal Fakultas</CardTitle>
          <CardDescription className="text-slate-600 text-sm sm:text-base">Daftar proposal kerja sama terbaru</CardDescription>
        </CardHeader>
        <CardContent>
          {fakultasProposals.length === 0 ? (
            <div className="text-center py-16">
              <FileText className="w-16 h-16 text-slate-400 mx-auto mb-6" />
              <p className="text-slate-600 mb-4 text-base sm:text-lg">Belum ada proposal dari fakultas ini</p>
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {fakultasProposals.slice(0, 5).map((proposal) => (
                <Link key={proposal.id} href={`/dashboard/proposals/${proposal.id}`}>
                  <div className="p-4 sm:p-6 rounded-lg sm:rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors shadow-sm">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 sm:gap-3 mb-2">
                          <Badge className="bg-slate-100 text-slate-700 border-slate-200">
                            {proposal.initiator.toUpperCase()}
                          </Badge>
                          <Badge className={getStatusColor(proposal.status)}>{STATUS_LABELS[proposal.status]}</Badge>
                        </div>
                        <h3 className="font-semibold text-slate-900 text-base sm:text-lg">{proposal.title}</h3>
                        <p className="text-sm sm:text-base text-slate-600 mt-1 sm:mt-2">{proposal.partnerName}</p>
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
  return (
    <div className="space-y-6 sm:space-y-8">
      <DKUIStatisticsDashboard />
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
    if (status === "draft") return "bg-slate-100 text-slate-700 border-slate-200"
    if (status === "completed") return "bg-emerald-50 text-emerald-700 border-emerald-200"
    if (status === "rejected") return "bg-red-50 text-red-700 border-red-200"
    return "bg-amber-50 text-amber-700 border-amber-200"
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900">Dashboard Biro Hukum</h1>
        <p className="text-slate-600 mt-1 sm:mt-2 text-base lg:text-lg">Validasi dan paraf aspek hukum kerja sama</p>
      </div>

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

      {actionNeeded.length > 0 && (
        <Card className="bg-amber-50/30 border-amber-200 shadow-sm">
          <CardHeader className="pb-5">
            <CardTitle className="text-xl sm:text-2xl font-bold text-slate-900">Memerlukan Validasi Hukum</CardTitle>
            <CardDescription className="text-slate-600 text-sm sm:text-base">Dokumen yang menunggu review Biro Hukum</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 sm:space-y-4">
              {actionNeeded.map((proposal) => (
                <Link key={proposal.id} href={`/dashboard/proposals/${proposal.id}`}>
                  <div className="p-4 sm:p-6 rounded-lg sm:rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors bg-white shadow-sm">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
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
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

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
                <ProposalTracker proposal={proposal} compact />
              </div>
            ))}
        </div>
      )}

      <Card className="bg-white border-slate-200 shadow-sm">
        <CardHeader className="pb-5">
          <CardTitle className="text-xl sm:text-2xl font-bold text-slate-900">Riwayat Review</CardTitle>
          <CardDescription className="text-slate-600 text-sm sm:text-base">Dokumen yang sudah direview oleh Biro Hukum</CardDescription>
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
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
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
    if (status === "draft") return "bg-slate-100 text-slate-700 border-slate-200"
    if (status === "completed") return "bg-emerald-50 text-emerald-700 border-emerald-200"
    if (status === "rejected") return "bg-red-50 text-red-700 border-red-200"
    return "bg-amber-50 text-amber-700 border-amber-200"
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900">
          Dashboard {user?.role === "wakil_rektor" ? "Wakil Rektor" : "Rektor"}
        </h1>
        <p className="text-slate-600 mt-1 sm:mt-2 text-base lg:text-lg">Review dan persetujuan akhir kerja sama</p>
      </div>

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

      {actionNeeded.length > 0 && (
        <Card className="bg-amber-50/30 border-amber-200 shadow-sm">
          <CardHeader className="pb-5">
            <CardTitle className="text-xl sm:text-2xl font-bold text-slate-900">Memerlukan Persetujuan Anda</CardTitle>
            <CardDescription className="text-slate-600 text-sm sm:text-base">Proposal yang menunggu digital signing</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 sm:space-y-4">
              {actionNeeded.map((proposal) => (
                <Link key={proposal.id} href={`/dashboard/proposals/${proposal.id}`}>
                  <div className="p-4 sm:p-6 rounded-lg sm:rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors bg-white shadow-sm">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
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
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

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
                <ProposalTracker proposal={proposal} compact />
              </div>
            ))}
        </div>
      )}

      <Card className="bg-white border-slate-200 shadow-sm">
        <CardHeader className="pb-5">
          <CardTitle className="text-xl sm:text-2xl font-bold text-slate-900">Riwayat Kerja Sama</CardTitle>
          <CardDescription className="text-slate-600 text-sm sm:text-base">Proposal yang sudah melalui tahap supervisi</CardDescription>
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
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
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
    <div className="space-y-6 sm:space-y-8">
      <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900">Dashboard</h1>
      <Card className="bg-white border-slate-200 shadow-sm">
        <CardHeader className="pb-5">
          <CardTitle className="text-xl sm:text-2xl font-bold text-slate-900">Selamat Datang</CardTitle>
          <CardDescription className="text-slate-600 text-sm sm:text-base">Silakan login dengan role yang sesuai</CardDescription>
        </CardHeader>
      </Card>
    </div>
  )
}
