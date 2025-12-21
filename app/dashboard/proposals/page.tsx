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
    if (status === "draft") return "bg-slate-100 text-slate-700 border-slate-200"
    if (status === "completed") return "bg-emerald-50 text-emerald-700 border-emerald-200"
    if (status === "rejected") return "bg-red-50 text-red-700 border-red-200"
    return "bg-amber-50 text-amber-700 border-amber-200"
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-slate-900">Proposal Saya</h1>
          <p className="text-slate-600 mt-2 text-lg">Kelola proposal kerja sama Anda</p>
        </div>
        {user?.role === "mitra" && (
          <Link href="/dashboard/proposals/new">
            <Button className="bg-[#e10000] text-white hover:bg-[#c10000] font-semibold px-6 py-6 text-base shadow-sm">
              <Plus className="w-5 h-5 mr-2" />
              Proposal Baru
            </Button>
          </Link>
        )}
      </div>

      <Card className="bg-white border-slate-200 shadow-sm">
        <CardHeader className="pb-5">
          <CardTitle className="text-2xl font-bold text-slate-900">Daftar Proposal</CardTitle>
          <CardDescription className="text-slate-600 text-base">Semua proposal yang telah Anda buat</CardDescription>
        </CardHeader>
        <CardContent>
          {userProposals.length === 0 ? (
            <div className="text-center py-16">
              <FileText className="w-16 h-16 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-600 mb-6 text-lg">Belum ada proposal</p>
              {user?.role === "mitra" && (
                <Link href="/dashboard/proposals/new">
                  <Button
                    variant="outline"
                    className="border-slate-300 text-slate-700 hover:bg-slate-50 bg-white px-6 py-5"
                  >
                    Buat Proposal Pertama
                  </Button>
                </Link>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {userProposals.map((proposal) => (
                <Link key={proposal.id} href={`/dashboard/proposals/${proposal.id}`}>
                  <div className="p-6 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors shadow-sm">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <Badge className="text-sm bg-slate-100 text-slate-700 border-slate-200 font-medium px-3 py-1">
                            {proposal.initiator?.toUpperCase() || "UNKNOWN"}
                          </Badge>
                          <Badge className={`text-sm border font-medium px-3 py-1 ${getStatusColor(proposal.status)}`}>
                            {STATUS_LABELS[proposal.status]}
                          </Badge>
                        </div>
                        <h3 className="font-bold text-slate-900 mb-2 text-lg">{proposal.title}</h3>
                        <p className="text-base text-slate-600">{proposal.partnerName}</p>
                        <p className="text-sm text-slate-500 mt-3">
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
