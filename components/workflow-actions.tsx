"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import {
  CheckCircle2,
  XCircle,
  Sparkles,
  Send,
  FileEdit,
  Upload,
  Stamp,
  FileSignature,
  Archive,
  CheckCheck,
  AlertTriangle,
} from "lucide-react"
import { useState } from "react"
import type { Proposal, UserRole } from "@/lib/mock-data"
import { getAvailableActions, canUserTakeAction, generateAISummary } from "@/lib/workflow-engine"

interface WorkflowActionsProps {
  proposal: Proposal
  userRole: UserRole
  userId: string
  userName: string
  onAction: (actionLabel: string, comment?: string, extraData?: any) => Promise<void>
}

export function WorkflowActions({ proposal, userRole, userId, userName, onAction }: WorkflowActionsProps) {
  const [comment, setComment] = useState("")
  const [selectedFaculty, setSelectedFaculty] = useState(proposal.fakultas || "")
  const [isProcessing, setIsProcessing] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)

  const canTakeAction = canUserTakeAction(proposal.status, userRole)
  const availableActions = getAvailableActions(proposal.status, userRole)

  if (!canTakeAction || availableActions.length === 0) {
    if (proposal.status === "completed") {
      return (
        <Alert className="bg-emerald-50 border border-emerald-200 shadow-sm">
          <CheckCircle2 className="h-5 w-5 text-emerald-600" />
          <AlertDescription className="text-emerald-800 font-medium ml-2">
            ✅ Proposal telah selesai diproses dan diarsipkan.
          </AlertDescription>
        </Alert>
      )
    }
    if (proposal.status === "rejected") {
      return (
        <Alert className="bg-red-50 border border-red-200 shadow-sm">
          <XCircle className="h-5 w-5 text-[#e10000]" />
          <AlertDescription className="text-red-800 font-medium ml-2">
            ❌ Proposal ditolak dan tidak dapat diproses lebih lanjut.
          </AlertDescription>
        </Alert>
      )
    }
    return (
      <Alert className="bg-blue-50 border border-blue-200 shadow-sm">
        <AlertTriangle className="h-5 w-5 text-blue-600" />
        <AlertDescription className="text-blue-800 font-medium ml-2">
          ℹ️ Proposal sedang diproses oleh pihak lain. Anda akan diberitahu jika ada tindakan yang diperlukan.
        </AlertDescription>
      </Alert>
    )
  }

  const handleAction = async (actionLabel: string) => {
    const action = availableActions.find((a) => a.label === actionLabel)
    if (!action) return

    // Validasi input sesuai kebutuhan
    if (action.requiresComment && !comment.trim() && actionLabel !== "Jalankan Ringkasan AI (Manual)") {
      alert("Mohon berikan komentar atau catatan")
      return
    }

    // Validasi khusus untuk pemilihan fakultas
    if (actionLabel === "Pilih & Kirim ke Fakultas/Unit" && !selectedFaculty) {
      alert("Mohon pilih Fakultas/Unit tujuan")
      return
    }

    // Validasi upload file untuk revisi
    if (actionLabel === "Upload Dokumen Revisi" && !uploadedFile) {
      alert("Mohon upload dokumen revisi")
      return
    }

    setIsProcessing(true)
    try {
      let extraData: any = {}

      // Generate AI Summary jika action adalah trigger AI
      if (actionLabel === "Jalankan Ringkasan AI (Manual)") {
        const aiSummary = generateAISummary(proposal.description, proposal.objectives, proposal.benefits)
        extraData = { aiSummary, aiSummaryGeneratedAt: new Date().toISOString() }
      }

      // Kirim data fakultas yang dipilih
      if (actionLabel === "Pilih & Kirim ke Fakultas/Unit") {
        extraData = { fakultas: selectedFaculty, selectedFacultyBy: userId }
      }

      // Kirim data file yang diupload
      if (actionLabel === "Upload Dokumen Revisi" && uploadedFile) {
        extraData = {
          revisionDocument: {
            id: `rev-${Date.now()}`,
            name: uploadedFile.name,
            type: uploadedFile.type,
            size: uploadedFile.size,
            uploadedAt: new Date().toISOString(),
            url: "#", // Dalam production, upload ke storage dulu
          },
        }
      }

      await onAction(actionLabel, comment || undefined, extraData)
      setComment("")
      setUploadedFile(null)
    } catch (error) {
      console.error("Error processing action:", error)
      alert("Terjadi kesalahan saat memproses aksi")
    } finally {
      setIsProcessing(false)
    }
  }

  // Render input khusus untuk beberapa aksi
  const renderSpecialInputs = () => {
    // AI Summary trigger
    if (proposal.status === "dkui_need_summary") {
      return (
        <Alert className="bg-amber-50 border border-amber-200">
          <Sparkles className="h-5 w-5 text-amber-600" />
          <AlertDescription className="text-amber-800 ml-2">
            <strong>Fitur AI Summary:</strong> DKUI menjalankan fitur ringkasan AI secara manual untuk memahami isi
            proposal sebelum distribusi ke Fakultas/Unit.
          </AlertDescription>
        </Alert>
      )
    }

    // Pemilihan Fakultas
    if (proposal.status === "dkui_summarized") {
      return (
        <div className="space-y-3">
          <Label htmlFor="faculty" className="text-slate-900 font-semibold text-base">
            Pilih Fakultas/Unit Tujuan <span className="text-[#e10000]">*</span>
          </Label>
          <Select value={selectedFaculty} onValueChange={setSelectedFaculty}>
            <SelectTrigger id="faculty" className="bg-white border-slate-300">
              <SelectValue placeholder="Pilih Fakultas/Unit..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Fakultas Pendidikan Teknologi dan Kejuruan">
                Fakultas Pendidikan Teknologi dan Kejuruan
              </SelectItem>
              <SelectItem value="Fakultas Pendidikan Ilmu Pengetahuan Sosial">
                Fakultas Pendidikan Ilmu Pengetahuan Sosial
              </SelectItem>
              <SelectItem value="Fakultas Pendidikan Matematika dan Ilmu Pengetahuan Alam">
                Fakultas Pendidikan Matematika dan Ilmu Pengetahuan Alam
              </SelectItem>
              <SelectItem value="Fakultas Pendidikan Bahasa dan Sastra">
                Fakultas Pendidikan Bahasa dan Sastra
              </SelectItem>
              <SelectItem value="Fakultas Pendidikan Olahraga dan Kesehatan">
                Fakultas Pendidikan Olahraga dan Kesehatan
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      )
    }

    // Upload file untuk revisi mitra
    if (proposal.status === "dkui_requesting_mitra_revision" || proposal.status === "mitra_revising") {
      return (
        <div className="space-y-3">
          <Label htmlFor="revision-file" className="text-slate-900 font-semibold text-base">
            Upload Dokumen Revisi <span className="text-[#e10000]">*</span>
          </Label>
          <Input
            id="revision-file"
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={(e) => setUploadedFile(e.target.files?.[0] || null)}
            className="bg-white border-slate-300"
          />
          {uploadedFile && (
            <p className="text-sm text-green-600">
              ✓ File dipilih: {uploadedFile.name} ({(uploadedFile.size / 1024 / 1024).toFixed(2)} MB)
            </p>
          )}
        </div>
      )
    }

    return null
  }

  // Render tombol aksi
  const renderActionButtons = () => {
    // Jika hanya 1 aksi tersedia
    if (availableActions.length === 1) {
      const action = availableActions[0]
      return (
        <Button
          onClick={() => handleAction(action.label)}
          disabled={isProcessing}
          className={`w-full font-semibold py-5 text-base shadow-sm ${
            action.actionType === "approve"
              ? "bg-emerald-600 hover:bg-emerald-700 text-white"
              : action.actionType === "reject"
                ? "bg-[#e10000] hover:bg-[#c10000] text-white"
                : "bg-blue-600 hover:bg-blue-700 text-white"
          }`}
        >
          {getActionIcon(action.label)}
          {action.label}
        </Button>
      )
    }

    // Jika ada 2 aksi (biasanya approve & reject, atau gateway decision)
    return (
      <div className="flex flex-col sm:flex-row gap-3">
        {availableActions.map((action) => (
          <Button
            key={action.label}
            onClick={() => handleAction(action.label)}
            disabled={isProcessing}
            className={`flex-1 font-semibold py-5 text-base shadow-sm ${
              action.actionType === "approve" || action.label.includes("✅")
                ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                : action.actionType === "reject" || action.label.includes("❌")
                  ? "bg-[#e10000] hover:bg-[#c10000] text-white"
                  : "bg-blue-600 hover:bg-blue-700 text-white"
            }`}
          >
            {getActionIcon(action.label)}
            {action.label}
          </Button>
        ))}
      </div>
    )
  }

  return (
    <Card className="bg-white border border-slate-200 shadow-sm">
      <CardHeader className="pb-5 bg-slate-50/50">
        <CardTitle className="text-2xl font-bold text-slate-900">Tindakan {userRole.toUpperCase()}</CardTitle>
        <CardDescription className="text-slate-600 text-base">
          Aksi yang dapat dilakukan sesuai dengan lane dan status dokumen saat ini
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        {renderSpecialInputs()}

        {/* Komentar textarea - hanya tampil jika diperlukan */}
        {availableActions.some((a) => a.requiresComment) &&
          proposal.status !== "dkui_need_summary" &&
          proposal.status !== "dkui_received" && (
            <div className="space-y-3">
              <Label htmlFor="comment" className="text-slate-900 font-semibold text-base">
                Komentar / Catatan {availableActions[0]?.requiresComment && <span className="text-[#e10000]">*</span>}
              </Label>
              <Textarea
                id="comment"
                placeholder="Berikan komentar, catatan, atau alasan..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={5}
                className="bg-white border border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-[#e10000] focus:ring-2 focus:ring-[#e10000]/10 text-base leading-relaxed"
              />
            </div>
          )}

        {renderActionButtons()}
      </CardContent>
    </Card>
  )
}

// Helper untuk mendapatkan icon yang sesuai dengan action
function getActionIcon(label: string) {
  if (label.includes("AI")) return <Sparkles className="w-5 h-5 mr-2" />
  if (label.includes("Kirim") || label.includes("Salurkan")) return <Send className="w-5 h-5 mr-2" />
  if (label.includes("Revisi") && label.includes("DKUI")) return <FileEdit className="w-5 h-5 mr-2" />
  if (label.includes("Upload")) return <Upload className="w-5 h-5 mr-2" />
  if (label.includes("Materai")) return <Stamp className="w-5 h-5 mr-2" />
  if (label.includes("Tanda Tangan")) return <FileSignature className="w-5 h-5 mr-2" />
  if (label.includes("Arsip")) return <Archive className="w-5 h-5 mr-2" />
  if (label.includes("Paraf") || label.includes("Approval")) return <CheckCheck className="w-5 h-5 mr-2" />
  if (label.includes("✅") || label.includes("Setuju") || label.includes("Approve"))
    return <CheckCircle2 className="w-5 h-5 mr-2" />
  if (label.includes("❌") || label.includes("Tolak") || label.includes("Reject"))
    return <XCircle className="w-5 h-5 mr-2" />
  return null
}
