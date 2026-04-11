"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import {
  CheckCircle2,
  XCircle,
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
import { ROLE_LABELS } from "@/lib/mock-data"
import { getAvailableActions, canUserTakeAction, determineWorkflowPath } from "@/lib/workflow-engine"
import { SigningSimulator } from "@/components/signing-simulator"
import { getSigningSimulationData } from "@/lib/workflow-utils"

interface WorkflowActionsProps {
  proposal: Proposal
  userRole: UserRole
  userId: string
  userName: string
  onAction: (actionLabel: string, comment?: string, extraData?: any) => Promise<void>
}

export function WorkflowActions({ proposal, userRole, userId, userName, onAction }: WorkflowActionsProps) {
  const [comment, setComment] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)

  const path = determineWorkflowPath(proposal.fileSuratKuasa)
  const canTakeAction = canUserTakeAction(proposal.status, userRole, path)
  const availableActions = getAvailableActions(proposal.status, userRole, path)

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

  // Check if this is a signing step (uses SigningSimulator instead)
  const isSigningStep = availableActions.length > 0 &&
    availableActions.some(a => a.actionType === "sign") &&
    getSigningSimulationData(proposal.status) !== null

  const handleAction = async (actionLabel: string) => {
    const action = availableActions.find((a) => a.label === actionLabel)
    if (!action) return

    // Validate comment requirement
    if (action.requiresComment && !comment.trim()) {
      alert("Mohon berikan komentar atau catatan")
      return
    }

    // Validate document upload requirement (skip for signing steps - handled by SigningSimulator)
    if (action.requiresDocument && !uploadedFile && action.actionType !== "sign") {
      alert("Mohon upload dokumen yang diperlukan")
      return
    }

    setIsProcessing(true)
    try {
      let extraData: any = {}

      // Attach file data if uploaded
      if (uploadedFile) {
        extraData = {
          revisionDocument: {
            id: `doc-${Date.now()}`,
            name: uploadedFile.name,
            type: uploadedFile.type,
            size: uploadedFile.size,
            uploadedAt: new Date().toISOString(),
            url: "#",
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

  // If this is a signing step, render SigningSimulator instead of generic form
  if (isSigningStep) {
    const signAction = availableActions.find(a => a.actionType === "sign")
    return (
      <SigningSimulator
        status={proposal.status}
        signerName={userName}
        onSign={async () => {
          if (signAction) {
            await onAction(signAction.label, undefined, {})
          }
        }}
      />
    )
  }

  // Render file upload if any action requires a document
  const renderDocumentUpload = () => {
    const needsDoc = availableActions.some((a) => a.requiresDocument)
    if (!needsDoc) return null

    return (
      <div className="space-y-3">
        <Label htmlFor="action-file" className="text-slate-900 font-semibold text-base">
          Upload Dokumen <span className="text-[#e10000]">*</span>
        </Label>
        <Input
          id="action-file"
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
            action.actionType === "approve" || action.actionType === "sign"
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
        <CardTitle className="text-2xl font-bold text-slate-900">
          Tindakan {ROLE_LABELS[userRole] || userRole.toUpperCase()}
        </CardTitle>
        <CardDescription className="text-slate-600 text-base">
          Aksi yang dapat dilakukan sesuai dengan lane dan status dokumen saat ini
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        {renderDocumentUpload()}

        {/* Alert for final rejection */}
        {availableActions.some((a) => a.label.includes("Tolak Final")) && (
          <Alert className="bg-red-50 border border-red-200">
            <XCircle className="h-5 w-5 text-[#e10000]" />
            <AlertDescription className="text-red-800 ml-2">
              <strong>Peringatan:</strong> Menolak proposal secara final akan menghentikan seluruh proses. Proposal
              tidak dapat diproses lebih lanjut dan akan ditandai sebagai DITOLAK.
            </AlertDescription>
          </Alert>
        )}

        {/* Comment textarea */}
        {availableActions.some((a) => a.requiresComment) && (
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
  if (label.includes("Kirim") || label.includes("Salurkan") || label.includes("Mulai")) return <Send className="w-5 h-5 mr-2" />
  if (label.includes("Revisi")) return <FileEdit className="w-5 h-5 mr-2" />
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
