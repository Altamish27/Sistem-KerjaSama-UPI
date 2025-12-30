"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, Circle, Clock, ArrowRight } from "lucide-react"
import type { Proposal } from "@/lib/mock-data"
import { STATUS_LABELS } from "@/lib/mock-data"

interface SimpleTrackerProps {
  proposal: Proposal
}

export function SimpleTracker({ proposal }: SimpleTrackerProps) {
  // Mapping status ke step description
  const getStepInfo = (status: Proposal["status"]) => {
    const stepMap: Record<string, { current: string; next: string; actor: string }> = {
      draft: {
        current: "Draft Proposal",
        next: "Submit ke DKUI",
        actor: "MITRA",
      },
      submitted: {
        current: "Proposal Diajukan",
        next: "DKUI akan menerima dan review",
        actor: "MITRA → DKUI",
      },
      dkui_received: {
        current: "DKUI Menerima Proposal",
        next: "DKUI akan jalankan Ringkasan AI",
        actor: "DKUI",
      },
      dkui_need_summary: {
        current: "Menunggu Ringkasan AI",
        next: "DKUI menjalankan fitur AI Summary",
        actor: "DKUI",
      },
      dkui_summarized: {
        current: "Sudah Diringkas AI",
        next: "DKUI akan pilih dan kirim ke Fakultas/Unit",
        actor: "DKUI",
      },
      dkui_sent_to_faculty: {
        current: "Dikirim ke Fakultas/Unit",
        next: "Fakultas/Unit akan review substansi",
        actor: "DKUI → FAKULTAS",
      },
      faculty_reviewing: {
        current: "Fakultas Review Substansi",
        next: "Fakultas putuskan: Approve atau Reject",
        actor: "FAKULTAS",
      },
      faculty_substansi_approved: {
        current: "Substansi Disetujui",
        next: "DKUI akan review hukum tahap 1",
        actor: "FAKULTAS → DKUI",
      },
      faculty_substansi_rejected: {
        current: "Substansi Ditolak",
        next: "DKUI evaluasi feedback",
        actor: "FAKULTAS → DKUI",
      },
      dkui_evaluating_feedback: {
        current: "DKUI Evaluasi Feedback",
        next: "DKUI tentukan: Revisi oleh Mitra atau DKUI",
        actor: "DKUI",
      },
      dkui_requesting_mitra_revision: {
        current: "Menunggu Revisi Mitra",
        next: "Mitra upload dokumen revisi",
        actor: "DKUI → MITRA",
      },
      mitra_revising: {
        current: "Mitra Sedang Revisi",
        next: "Mitra upload dokumen perbaikan",
        actor: "MITRA",
      },
      mitra_resubmitted: {
        current: "Mitra Upload Ulang",
        next: "DKUI ringkas ulang dan kirim ke Fakultas",
        actor: "MITRA → DKUI",
      },
      dkui_self_revising: {
        current: "DKUI Revisi Sendiri",
        next: "DKUI selesai revisi dan kirim ke Fakultas",
        actor: "DKUI",
      },
      dkui_legal_review_1: {
        current: "DKUI Review Hukum Tahap 1",
        next: "DKUI putuskan approve atau perlu revisi",
        actor: "DKUI",
      },
      dkui_legal_approved_1: {
        current: "Legal Tahap 1 Approved",
        next: "Biro Hukum akan review legalitas",
        actor: "DKUI → BIRO HUKUM",
      },
      biro_hukum_reviewing: {
        current: "Biro Hukum Review Legalitas",
        next: "Biro Hukum putuskan approve atau reject",
        actor: "BIRO HUKUM",
      },
      biro_hukum_legalitas_approved: {
        current: "Legalitas Disetujui",
        next: "Biro Hukum akan paraf",
        actor: "BIRO HUKUM",
      },
      biro_hukum_legalitas_rejected: {
        current: "Legalitas Ditolak",
        next: "DKUI evaluasi feedback Biro Hukum",
        actor: "BIRO HUKUM → DKUI",
      },
      biro_hukum_paraf: {
        current: "Biro Hukum Paraf",
        next: "DKUI akan paraf",
        actor: "BIRO HUKUM → DKUI",
      },
      dkui_paraf: {
        current: "DKUI Paraf",
        next: "Fakultas/Unit approval akhir",
        actor: "DKUI → FAKULTAS",
      },
      faculty_final_approval: {
        current: "Fakultas Approval Akhir",
        next: "Mulai proses tanda tangan parallel",
        actor: "FAKULTAS → PARALLEL",
      },
      parallel_signing_started: {
        current: "Proses Tanda Tangan Dimulai",
        next: "Mitra & Warek proses parallel",
        actor: "PARALLEL",
      },
      mitra_ready_to_sign: {
        current: "Mitra Siap Tanda Tangan",
        next: "Mitra bubuh materai",
        actor: "MITRA",
      },
      mitra_stamped: {
        current: "Mitra Bubuh Materai",
        next: "Mitra tanda tangan elektronik",
        actor: "MITRA",
      },
      mitra_signed: {
        current: "Mitra Sudah Tanda Tangan",
        next: "Tunggu Rektor selesai tanda tangan",
        actor: "MITRA → MENUNGGU",
      },
      warek_reviewing: {
        current: "Wakil Rektor Review",
        next: "Warek approve atau reject",
        actor: "WAKIL REKTOR",
      },
      warek_stamped: {
        current: "Warek Bubuh Materai",
        next: "Warek tanda tangan",
        actor: "WAKIL REKTOR",
      },
      warek_signed: {
        current: "Warek Sudah Tanda Tangan",
        next: "Rektor akan review",
        actor: "WAKIL REKTOR → REKTOR",
      },
      warek_rejected: {
        current: "Warek Menolak",
        next: "DKUI evaluasi feedback Warek",
        actor: "WAKIL REKTOR → DKUI",
      },
      rektor_reviewing: {
        current: "Rektor Review",
        next: "Rektor approve atau reject",
        actor: "REKTOR",
      },
      rektor_stamped: {
        current: "Rektor Bubuh Materai",
        next: "Rektor tanda tangan",
        actor: "REKTOR",
      },
      rektor_signed: {
        current: "Rektor Sudah Tanda Tangan",
        next: "DKUI pertukaran dokumen final",
        actor: "REKTOR → DKUI",
      },
      rektor_rejected: {
        current: "Rektor Menolak",
        next: "DKUI evaluasi feedback Rektor",
        actor: "REKTOR → DKUI",
      },
      document_exchange: {
        current: "Pertukaran Dokumen Final",
        next: "DKUI arsipkan dokumen",
        actor: "DKUI",
      },
      archived: {
        current: "Dokumen Diarsipkan",
        next: "Tandai selesai",
        actor: "DKUI",
      },
      completed: {
        current: "✅ Proses Selesai",
        next: "Kerja sama aktif dan diarsipkan",
        actor: "SELESAI",
      },
      rejected: {
        current: "❌ Proposal Ditolak",
        next: "Tidak dapat dilanjutkan",
        actor: "DITOLAK",
      },
    }

    return stepMap[status] || { current: "Unknown", next: "Unknown", actor: "UNKNOWN" }
  }

  const stepInfo = getStepInfo(proposal.status)
  const isCompleted = proposal.status === "completed"
  const isRejected = proposal.status === "rejected"

  return (
    <Card className={`border-2 ${isCompleted ? "border-emerald-500 bg-emerald-50/50" : isRejected ? "border-red-500 bg-red-50/50" : "border-blue-500 bg-blue-50/50"}`}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-bold text-slate-900">Status Proses</CardTitle>
          <Badge className={`${isCompleted ? "bg-emerald-600" : isRejected ? "bg-red-600" : "bg-blue-600"} text-white`}>
            {STATUS_LABELS[proposal.status]}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Step */}
        <div className="flex items-start gap-3 p-4 rounded-lg bg-white border-2 border-blue-500">
          <div className="mt-1">
            {isCompleted ? (
              <CheckCircle2 className="w-6 h-6 text-emerald-600" />
            ) : isRejected ? (
              <Circle className="w-6 h-6 text-red-600" />
            ) : (
              <Clock className="w-6 h-6 text-blue-600 animate-pulse" />
            )}
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-blue-700 uppercase tracking-wide">Proses Saat Ini</p>
            <p className="text-lg font-bold text-slate-900 mt-1">{stepInfo.current}</p>
            <p className="text-sm text-slate-600 mt-1">
              <span className="font-semibold">Pihak:</span> {stepInfo.actor}
            </p>
          </div>
        </div>

        {/* Next Step */}
        {!isCompleted && !isRejected && (
          <>
            <div className="flex justify-center">
              <ArrowRight className="w-6 h-6 text-slate-400" />
            </div>
            <div className="flex items-start gap-3 p-4 rounded-lg bg-slate-50 border border-slate-200">
              <Circle className="w-6 h-6 text-slate-400 mt-1" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-slate-600 uppercase tracking-wide">Langkah Selanjutnya</p>
                <p className="text-base font-semibold text-slate-700 mt-1">{stepInfo.next}</p>
              </div>
            </div>
          </>
        )}

        {/* Last Update */}
        <div className="pt-2 border-t border-slate-200">
          <p className="text-xs text-slate-500">
            Terakhir diupdate: {new Date(proposal.updatedAt).toLocaleString("id-ID")}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
