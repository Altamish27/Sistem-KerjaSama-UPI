"use client"

import { ProtectedRoute } from "@/components/protected-route"
import { DashboardLayout } from "@/components/dashboard-layout"
import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, FileText } from "lucide-react"
import Link from "next/link"
import { MOCK_PROPOSALS, STATUS_LABELS } from "@/lib/mock-data"

export default function ProposalsPage() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <ProposalsContent />
      </DashboardLayout>
    </ProtectedRoute>
  )
}

function ProposalsContent() {
  const { user } = useAuth()

  const userProposals = MOCK_PROPOSALS.filter((p) => p.createdBy === user?.id)

  const getStatusColor = (status: string) => {
    if (status === "draft") return "bg-slate-500/10 text-slate-400 border-slate-500/20"
    if (status === "completed") return "bg-green-500/10 text-green-400 border-green-500/20"
    if (status === "rejected") return "bg-red-500/10 text-red-400 border-red-500/20"
    return "bg-blue-500/10 text-blue-400 border-blue-500/20"
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Proposal Saya</h1>
          <p className="text-slate-400 mt-1">Kelola proposal kerja sama Anda</p>
        </div>
        {user?.role === "mitra" && (
          <Link href="/dashboard/proposals/new">
            <Button className="bg-emerald-600 text-white hover:bg-emerald-700">
              <Plus className="w-4 h-4 mr-2" />
              Proposal Baru
            </Button>
          </Link>
        )}
      </div>

      <Card className="bg-slate-900/50 border-slate-800">
        <CardHeader>
          <CardTitle className="text-white">Daftar Proposal</CardTitle>
          <CardDescription className="text-slate-400">Semua proposal yang telah Anda buat</CardDescription>
        </CardHeader>
        <CardContent>
          {userProposals.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400 mb-4">Belum ada proposal</p>
              {user?.role === "mitra" && (
                <Link href="/dashboard/proposals/new">
                  <Button
                    variant="outline"
                    className="border-slate-700 text-slate-200 hover:bg-slate-800 bg-transparent"
                  >
                    Buat Proposal Pertama
                  </Button>
                </Link>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {userProposals.map((proposal) => (
                <Link key={proposal.id} href={`/dashboard/proposals/${proposal.id}`}>
                  <div className="p-4 rounded-lg border border-slate-800 hover:bg-slate-800/50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className="text-xs bg-emerald-700/50 text-emerald-300 border-emerald-600">
                            {proposal.initiator?.toUpperCase() || "UNKNOWN"}
                          </Badge>
                          <Badge className={`text-xs ${getStatusColor(proposal.status)}`}>
                            {STATUS_LABELS[proposal.status]}
                          </Badge>
                        </div>
                        <h3 className="font-medium text-white mb-1">{proposal.title}</h3>
                        <p className="text-sm text-slate-400">{proposal.partnerName}</p>
                        <p className="text-xs text-slate-500 mt-2">
                          Dibuat: {new Date(proposal.createdAt).toLocaleDateString("id-ID")}
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
