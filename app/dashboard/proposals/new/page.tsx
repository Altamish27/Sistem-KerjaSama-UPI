"use client"

import { ProtectedRoute } from "@/components/protected-route"
import { DashboardLayout } from "@/components/dashboard-layout"
import { ProposalSubmissionForm } from "@/components/proposal-submission-form"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function NewProposalPage() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-8 max-w-4xl mx-auto">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/dashboard/proposals">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Ajukan Proposal Baru</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Lengkapi formulir untuk mengajukan proposal kerja sama
              </p>
            </div>
          </div>

          <ProposalSubmissionForm />
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  )
}
