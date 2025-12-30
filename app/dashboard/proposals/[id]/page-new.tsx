"use client"

import { useParams, useRouter } from "next/navigation"
import { ProtectedRoute } from "@/components/protected-route"
import { DashboardLayout } from "@/components/dashboard-layout"
import { useAuth } from "@/lib/auth-context"
import { useDataStore } from "@/lib/data-store"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  ArrowLeft,
  Building2,
  Calendar,
  FileText,
  User,
  Sparkles,
} from "lucide-react"
import Link from "next/link"
import { ProposalTrackerEnhanced } from "@/components/proposal-tracker-enhanced"
import { WorkflowActions } from "@/components/workflow-actions"
import { getStageLabel } from "@/lib/workflow-engine"

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
  const { getProposalById, refreshData } = useDataStore()

  const proposal = getProposalById(params.id as string)

  if (!proposal) {
    return (
      <div className="text-center py-12">
        <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">Proposal tidak ditemukan</p>
      </div>
    )
  }

  const getStatusColor = (status: string) => {
    if (status === "draft") return "bg-slate-100 text-slate-700 border-slate-200"
    if (status === "completed") return "bg-emerald-50 text-emerald-700 border-emerald-200"
    if (status === "rejected") return "bg-red-50 text-red-700 border-red-200"
    if (status.includes("revision")) return "bg-amber-50 text-amber-700 border-amber-200"
    return "bg-blue-50 text-blue-700 border-blue-200"
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <Link href="/dashboard/proposals">
          <Button variant="outline" size="sm" className="w-full sm:w-auto">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Kembali
          </Button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <Badge className={getStatusColor(proposal.status)}>
              {proposal.document_type}
            </Badge>
            <Badge variant="outline">
              {getStageLabel(proposal.status as any)}
            </Badge>
          </div>
          <h1 className="text-3xl font-bold text-slate-900">{proposal.title}</h1>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column - Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Proposal Details */}
          <Card>
            <CardHeader>
              <CardTitle>Detail Proposal</CardTitle>
              <CardDescription>Informasi lengkap proposal kerja sama</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-slate-500 font-medium uppercase">Deskripsi</p>
                <p className="text-base text-slate-800 mt-1">{proposal.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div>
                  <p className="text-sm text-slate-500 font-medium">Mitra</p>
                  <p className="text-base text-slate-900 font-semibold">{proposal.partner_name}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500 font-medium">Email Mitra</p>
                  <p className="text-base text-slate-900">{proposal.partner_email}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500 font-medium">Jenis Kerja Sama</p>
                  <p className="text-base text-slate-900">{proposal.cooperation_type}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500 font-medium">Diajukan</p>
                  <p className="text-base text-slate-900">
                    {new Date(proposal.created_at).toLocaleDateString("id-ID")}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* AI Summary */}
          {proposal.ai_summary && (
            <Card className="border-l-4 border-l-purple-500">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-600" />
                  Ringkasan AI
                </CardTitle>
                <CardDescription>Ringkasan otomatis dari dokumen proposal</CardDescription>
              </CardHeader>
              <CardContent>
                <pre className="whitespace-pre-wrap text-sm text-slate-700 bg-slate-50 p-4 rounded-lg">
                  {proposal.ai_summary}
                </pre>
              </CardContent>
            </Card>
          )}

          {/* Workflow Tracker */}
          <ProposalTrackerEnhanced proposal={proposal} />

          {/* Document */}
          {proposal.document_url && (
            <Card>
              <CardHeader>
                <CardTitle>Dokumen Proposal</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileText className="w-8 h-8 text-slate-600" />
                    <div>
                      <p className="font-medium">{proposal.title}.pdf</p>
                      <p className="text-sm text-slate-500">{proposal.document_url}</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    Lihat
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-6">
          {/* Additional Info */}
          <Card>
            <CardHeader>
              <CardTitle>Informasi</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-slate-500" />
                <div>
                  <p className="text-sm text-slate-500">Pengaju</p>
                  <p className="font-medium">{user?.name}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-slate-500" />
                <div>
                  <p className="text-sm text-slate-500">Tanggal Dibuat</p>
                  <p className="font-medium">
                    {new Date(proposal.created_at).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Building2 className="w-5 h-5 text-slate-500" />
                <div>
                  <p className="text-sm text-slate-500">Fakultas</p>
                  <p className="font-medium">{proposal.assigned_faculty || "Belum ditentukan"}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Workflow Actions */}
          <WorkflowActions
            proposalId={proposal.id}
            currentStatus={proposal.status}
            onActionComplete={() => {
              refreshData()
              router.refresh()
            }}
          />
        </div>
      </div>
    </div>
  )
}
