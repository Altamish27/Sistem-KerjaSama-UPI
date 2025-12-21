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
    if (status === "draft") return "bg-slate-500/10 text-slate-400 border-slate-500/20"
    if (status === "completed") return "bg-green-500/10 text-green-400 border-green-500/20"
    if (status === "rejected") return "bg-red-500/10 text-red-400 border-red-500/20"
    return "bg-blue-500/10 text-blue-400 border-blue-500/20"
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Review Proposal</h1>
        <p className="text-slate-400 mt-1">Proposal yang menunggu persetujuan Anda</p>
      </div>

      <Card className="bg-slate-900/50 border-slate-800">
        <CardHeader>
          <CardTitle className="text-white">Menunggu Review</CardTitle>
          <CardDescription className="text-slate-400">
            {pendingReviews.length} proposal memerlukan persetujuan Anda
          </CardDescription>
        </CardHeader>
        <CardContent>
          {pendingReviews.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400">Tidak ada proposal yang perlu direview</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingReviews.map((proposal) => (
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
                        <div className="flex items-center gap-4 mt-2">
                          <p className="text-xs text-slate-500">Pengaju: {proposal.createdByName}</p>
                          <p className="text-xs text-slate-500">Fakultas: {proposal.fakultas}</p>
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
