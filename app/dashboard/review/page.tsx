"use client"

import { ProtectedRoute } from "@/components/protected-route"
import { DashboardLayout } from "@/components/dashboard-layout"
import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FileText } from "lucide-react"
import Link from "next/link"
import { MOCK_PROPOSALS, STATUS_LABELS } from "@/lib/mock-data"
import { canUserApprove } from "@/lib/workflow-utils"

export default function ReviewPage() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <ReviewContent />
      </DashboardLayout>
    </ProtectedRoute>
  )
}

function ReviewContent() {
  const { user } = useAuth()

  // Get proposals that need current user's approval
  const pendingReviews = MOCK_PROPOSALS.filter((proposal) => {
    // Skip completed and rejected proposals
    if (proposal.status === "completed" || proposal.status === "rejected") {
      return false
    }

    return canUserApprove(proposal.status, user!.role, proposal.initiator)
  })

  const getStatusColor = (status: string) => {
    if (status === "draft") return "bg-slate-100 text-slate-700 border-slate-200"
    if (status === "completed") return "bg-emerald-50 text-emerald-700 border-emerald-200"
    if (status === "rejected") return "bg-red-50 text-red-700 border-red-200"
    return "bg-amber-50 text-amber-700 border-amber-200"
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-slate-900">Review Proposal</h1>
        <p className="text-slate-600 mt-2 text-lg">Proposal yang menunggu persetujuan Anda</p>
      </div>

      <Card className="bg-white border-slate-200 shadow-sm">
        <CardHeader className="pb-5">
          <CardTitle className="text-2xl font-bold text-slate-900">Menunggu Review</CardTitle>
          <CardDescription className="text-slate-600 text-base">
            {pendingReviews.length} proposal memerlukan persetujuan Anda
          </CardDescription>
        </CardHeader>
        <CardContent>
          {pendingReviews.length === 0 ? (
            <div className="text-center py-16">
              <FileText className="w-16 h-16 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-600 text-lg">Tidak ada proposal yang perlu direview</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingReviews.map((proposal) => (
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
                        <p className="text-base text-slate-600 mb-3">{proposal.partnerName}</p>
                        <div className="flex items-center gap-6">
                          <p className="text-sm text-slate-500">Pengaju: {proposal.createdByName}</p>
                          <p className="text-sm text-slate-500">Fakultas: {proposal.fakultas}</p>
                        </div>
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
