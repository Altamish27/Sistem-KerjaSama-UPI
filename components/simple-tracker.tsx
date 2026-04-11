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
      // ── Drafting ──
      draft: {
        current: "Draft Proposal",
        next: "Submit proposal ke Pimpinan Unit",
        actor: "OPERATOR UNIT",
      },
      submitted: {
        current: "Proposal Diajukan",
        next: "Pimpinan Unit akan review",
        actor: "OPERATOR UNIT → PIMPINAN UNIT",
      },
      // ── Review Berjenjang ──
      pimpinan_unit_reviewing: {
        current: "Pimpinan Unit Sedang Review",
        next: "Pimpinan Unit putuskan: Setujui atau Tolak",
        actor: "PIMPINAN UNIT",
      },
      pimpinan_unit_approved: {
        current: "Pimpinan Unit Menyetujui",
        next: "DKUI akan review proposal",
        actor: "PIMPINAN UNIT → DKUI",
      },
      pimpinan_unit_rejected: {
        current: "Pimpinan Unit Menolak",
        next: "Operator Unit revisi dan ajukan ulang",
        actor: "PIMPINAN UNIT → OPERATOR UNIT",
      },
      dkui_reviewing: {
        current: "DKUI Sedang Review",
        next: "DKUI putuskan: Setujui, Tolak, atau Revisi",
        actor: "DKUI",
      },
      dkui_approved: {
        current: "DKUI Menyetujui",
        next: "Biro Hukum akan review legalitas",
        actor: "DKUI → BIRO HUKUM",
      },
      dkui_rejected: {
        current: "DKUI Menolak",
        next: "Operator Unit evaluasi feedback",
        actor: "DKUI → OPERATOR UNIT",
      },
      biro_hukum_reviewing: {
        current: "Biro Hukum Review Legalitas",
        next: "Biro Hukum putuskan: Setujui atau Tolak",
        actor: "BIRO HUKUM",
      },
      biro_hukum_approved: {
        current: "Biro Hukum Menyetujui",
        next: "Lanjut ke proses penandatanganan",
        actor: "BIRO HUKUM",
      },
      biro_hukum_rejected: {
        current: "Biro Hukum Menolak",
        next: "DKUI evaluasi feedback Biro Hukum",
        actor: "BIRO HUKUM → DKUI",
      },
      // ── Path A: SU & WR ──
      su_reviewing: {
        current: "Sekretaris Universitas Review",
        next: "SU putuskan: Setujui atau Tolak",
        actor: "SEKRETARIS UNIVERSITAS",
      },
      su_approved: {
        current: "Sekretaris Universitas Menyetujui",
        next: "Wakil Rektor akan review",
        actor: "SU → WAKIL REKTOR",
      },
      su_rejected: {
        current: "Sekretaris Universitas Menolak",
        next: "DKUI evaluasi feedback SU",
        actor: "SU → DKUI",
      },
      wr_reviewing: {
        current: "Wakil Rektor Review",
        next: "Wakil Rektor putuskan: Setujui atau Tolak",
        actor: "WAKIL REKTOR",
      },
      wr_approved: {
        current: "Wakil Rektor Menyetujui",
        next: "Rektor akan menandatangani",
        actor: "WAKIL REKTOR → REKTOR",
      },
      wr_rejected: {
        current: "Wakil Rektor Menolak",
        next: "DKUI evaluasi feedback Wakil Rektor",
        actor: "WAKIL REKTOR → DKUI",
      },
      // ── Penandatanganan ──
      rektor_signing: {
        current: "Rektor Proses Tanda Tangan",
        next: "Rektor bubuh tanda tangan",
        actor: "REKTOR",
      },
      rektor_signed: {
        current: "Rektor Sudah Tanda Tangan",
        next: "Proses arsip atau pertukaran dokumen",
        actor: "REKTOR → DKUI",
      },
      pimpinan_unit_signing: {
        current: "Pimpinan Unit Proses Tanda Tangan",
        next: "Pimpinan Unit bubuh tanda tangan",
        actor: "PIMPINAN UNIT",
      },
      pimpinan_unit_signed: {
        current: "Pimpinan Unit Sudah Tanda Tangan",
        next: "Mitra akan menandatangani",
        actor: "PIMPINAN UNIT → MITRA",
      },
      mitra_signing: {
        current: "Mitra Proses Tanda Tangan",
        next: "Mitra bubuh tanda tangan",
        actor: "MITRA",
      },
      mitra_signed: {
        current: "Mitra Sudah Tanda Tangan",
        next: "Dokumen final siap diarsipkan",
        actor: "MITRA → DKUI",
      },
      // ── Revisi Loop ──
      dkui_self_revising: {
        current: "DKUI Revisi Internal",
        next: "DKUI selesai revisi dan kirim ulang",
        actor: "DKUI",
      },
      mitra_resubmitted: {
        current: "Mitra Kirim Ulang Dokumen",
        next: "DKUI akan review ulang",
        actor: "MITRA → DKUI",
      },
      // ── Terminal ──
      archived: {
        current: "Dokumen Diarsipkan",
        next: "Kerja sama aktif",
        actor: "DKUI",
      },
      completed: {
        current: "✅ Proses Selesai",
        next: "Kerja sama aktif dan diarsipkan",
        actor: "SELESAI",
      },
      rejected: {
        current: "❌ Proposal Ditolak Final",
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
