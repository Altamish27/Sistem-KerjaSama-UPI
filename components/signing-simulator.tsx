"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  FileSignature,
  Stamp,
  CheckCircle2,
  Loader2,
  ZoomIn,
  ZoomOut,
  Download,
  ShieldCheck,
  Eye,
} from "lucide-react"
import { getSigningSimulationData, type PksFileInfo } from "@/lib/workflow-utils"
import type { ProposalStatus } from "@/lib/mock-data"

interface SigningSimulatorProps {
  status: ProposalStatus
  onSign: () => Promise<void>
  signerName: string
}

type SimulationPhase = "preview" | "signing" | "stamping" | "done"

export function SigningSimulator({ status, onSign, signerName }: SigningSimulatorProps) {
  const simData = getSigningSimulationData(status)
  const [phase, setPhase] = useState<SimulationPhase>("preview")
  const [currentPdf, setCurrentPdf] = useState<PksFileInfo | null>(null)
  const [zoom, setZoom] = useState(100)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [signingProgress, setSigningProgress] = useState(0)
  const [isConfirming, setIsConfirming] = useState(false)

  useEffect(() => {
    if (simData) {
      setCurrentPdf(simData.before)
    }
  }, [status])

  const handleStartSigning = useCallback(async () => {
    if (!simData) return

    setPhase("signing")
    setSigningProgress(0)

    // Simulate signing process with progress
    const totalDuration = 2500
    const interval = 50
    const steps = totalDuration / interval
    let step = 0

    const progressInterval = setInterval(() => {
      step++
      setSigningProgress(Math.min((step / steps) * 100, 100))

      // At 40%, show intermediate PDF (TTD only)
      if (step === Math.floor(steps * 0.4) && simData.intermediate) {
        setCurrentPdf(simData.intermediate)
      }

      // At 70%, switch to stamping phase
      if (step === Math.floor(steps * 0.7)) {
        setPhase("stamping")
      }

      // At 90%, show final PDF
      if (step === Math.floor(steps * 0.9)) {
        setCurrentPdf(simData.after)
      }

      if (step >= steps) {
        clearInterval(progressInterval)
        setSigningProgress(100)
        setPhase("done")
      }
    }, interval)
  }, [simData])

  const handleConfirm = async () => {
    setIsConfirming(true)
    try {
      await onSign()
    } finally {
      setIsConfirming(false)
    }
  }

  if (!simData || !currentPdf) {
    return null
  }

  const phaseMessages: Record<SimulationPhase, { title: string; desc: string; color: string }> = {
    preview: {
      title: "Preview Naskah PKS",
      desc: "Silakan periksa draft naskah PKS sebelum menandatangani",
      color: "text-blue-600",
    },
    signing: {
      title: "Memproses Tanda Tangan Digital...",
      desc: `Membubuhkan tanda tangan elektronik ${simData.signerLabel}`,
      color: "text-amber-600",
    },
    stamping: {
      title: "Membubuhkan e-Materai...",
      desc: "Menambahkan e-Materai pada dokumen",
      color: "text-purple-600",
    },
    done: {
      title: "Tanda Tangan Berhasil!",
      desc: "Dokumen telah ditandatangani secara elektronik",
      color: "text-emerald-600",
    },
  }

  const msg = phaseMessages[phase]

  return (
    <Card className="bg-white border border-slate-200 shadow-sm overflow-hidden">
      <CardHeader className="pb-4 bg-gradient-to-r from-slate-50 to-blue-50/30 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center shadow-sm">
              <FileSignature className="w-5 h-5 text-slate-700" />
            </div>
            <div>
              <CardTitle className="text-lg font-bold text-slate-900">
                Penandatanganan Digital PKS
              </CardTitle>
              <p className="text-sm text-slate-500 mt-0.5">
                Simulasi e-Sign & e-Materai
              </p>
            </div>
          </div>
          <Badge variant="outline" className="bg-white text-slate-600 border-slate-300">
            {currentPdf.label}
          </Badge>
        </div>

        {/* Signing Progress Steps */}
        <div className="mt-4 flex items-center gap-1">
          {simData.steps.map((step, idx) => (
            <div key={idx} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-500 ${
                    step.completed
                      ? "bg-emerald-500 text-white shadow-sm"
                      : step.active
                        ? phase === "done"
                          ? "bg-emerald-500 text-white shadow-sm"
                          : "bg-blue-500 text-white shadow-md ring-2 ring-blue-200 animate-pulse"
                        : "bg-slate-200 text-slate-500"
                  }`}
                >
                  {step.completed || (step.active && phase === "done") ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : (
                    idx + 1
                  )}
                </div>
                <span className={`text-[10px] mt-1 text-center leading-tight ${
                  step.completed || step.active ? "text-slate-700 font-medium" : "text-slate-400"
                }`}>
                  {step.label}
                </span>
              </div>
              {idx < simData.steps.length - 1 && (
                <div className={`h-0.5 w-full mt-[-12px] transition-colors duration-500 ${
                  step.completed ? "bg-emerald-400" : "bg-slate-200"
                }`} />
              )}
            </div>
          ))}
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {/* Status Message */}
        <div className={`px-6 py-3 flex items-center gap-3 border-b ${
          phase === "done" ? "bg-emerald-50" : phase === "preview" ? "bg-blue-50/50" : "bg-amber-50/50"
        }`}>
          {phase === "signing" || phase === "stamping" ? (
            <Loader2 className={`w-5 h-5 ${msg.color} animate-spin`} />
          ) : phase === "done" ? (
            <ShieldCheck className={`w-5 h-5 ${msg.color}`} />
          ) : (
            <Eye className={`w-5 h-5 ${msg.color}`} />
          )}
          <div className="flex-1">
            <p className={`text-sm font-semibold ${msg.color}`}>{msg.title}</p>
            <p className="text-xs text-slate-500">{msg.desc}</p>
          </div>
          {(phase === "signing" || phase === "stamping") && (
            <div className="w-32">
              <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full transition-all duration-100"
                  style={{ width: `${signingProgress}%` }}
                />
              </div>
              <p className="text-[10px] text-slate-400 text-right mt-0.5">{Math.round(signingProgress)}%</p>
            </div>
          )}
        </div>

        {/* PDF Viewer */}
        <div className="relative bg-slate-100">
          {/* Zoom controls */}
          <div className="absolute top-3 right-3 z-10 flex items-center gap-1 bg-white/90 backdrop-blur rounded-lg shadow-sm border p-1">
            <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => setZoom(Math.max(50, zoom - 10))} disabled={zoom <= 50}>
              <ZoomOut className="w-3.5 h-3.5" />
            </Button>
            <span className="text-xs text-slate-600 min-w-[36px] text-center">{zoom}%</span>
            <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => setZoom(Math.min(200, zoom + 10))} disabled={zoom >= 200}>
              <ZoomIn className="w-3.5 h-3.5" />
            </Button>
            <div className="w-px h-4 bg-slate-200 mx-0.5" />
            <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => setIsFullscreen(true)}>
              <Eye className="w-3.5 h-3.5" />
            </Button>
            <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => window.open(currentPdf.url, '_blank')}>
              <Download className="w-3.5 h-3.5" />
            </Button>
          </div>

          {/* Signing overlay animation */}
          {(phase === "signing" || phase === "stamping") && (
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/60 backdrop-blur-[1px]">
              <div className="flex flex-col items-center gap-4 bg-white rounded-2xl shadow-xl p-8 border">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                  phase === "signing" ? "bg-blue-100" : "bg-purple-100"
                }`}>
                  {phase === "signing" ? (
                    <FileSignature className="w-8 h-8 text-blue-600 animate-pulse" />
                  ) : (
                    <Stamp className="w-8 h-8 text-purple-600 animate-bounce" />
                  )}
                </div>
                <div className="text-center">
                  <p className="font-semibold text-slate-900">{msg.title}</p>
                  <p className="text-sm text-slate-500 mt-1">{msg.desc}</p>
                </div>
                <div className="w-48 h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full transition-all duration-100"
                    style={{ width: `${signingProgress}%` }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Success overlay */}
          {phase === "done" && (
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-emerald-50/70 backdrop-blur-[1px] animate-in fade-in duration-500">
              <div className="flex flex-col items-center gap-4 bg-white rounded-2xl shadow-xl p-8 border border-emerald-200">
                <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center">
                  <ShieldCheck className="w-8 h-8 text-emerald-600" />
                </div>
                <div className="text-center">
                  <p className="font-bold text-lg text-emerald-800">Tanda Tangan Berhasil!</p>
                  <p className="text-sm text-slate-600 mt-1">
                    Dokumen telah ditandatangani oleh <strong>{signerName}</strong>
                  </p>
                  <p className="text-xs text-slate-400 mt-2">
                    Signed at {new Date().toLocaleString("id-ID")} • Digital Signature Verified
                  </p>
                </div>
                <Button
                  onClick={handleConfirm}
                  disabled={isConfirming}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-8 py-5 mt-2"
                >
                  {isConfirming ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Memproses...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-5 h-5 mr-2" />
                      Konfirmasi & Lanjutkan
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          <embed
            src={`${currentPdf.url}#toolbar=1&navpanes=0&view=FitH`}
            type="application/pdf"
            className="w-full"
            style={{
              height: "500px",
            }}
          />
        </div>

        {/* Action Bar */}
        {phase === "preview" && (
          <div className="p-6 border-t bg-gradient-to-r from-slate-50 to-white">
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="flex-1 text-center sm:text-left">
                <p className="text-sm text-slate-600">
                  Pastikan Anda telah memeriksa seluruh isi naskah PKS sebelum menandatangani.
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Tanda tangan digital bersifat sah secara hukum berdasarkan UU ITE.
                </p>
              </div>
              <Button
                onClick={handleStartSigning}
                className="bg-[#003d7a] hover:bg-[#002d5a] text-white font-semibold px-6 py-5 shadow-md min-w-[280px]"
              >
                {simData.buttonIcon === "pen" ? (
                  <FileSignature className="w-5 h-5 mr-2" />
                ) : (
                  <Stamp className="w-5 h-5 mr-2" />
                )}
                {simData.buttonLabel}
              </Button>
            </div>
          </div>
        )}
      </CardContent>

      {/* Fullscreen Dialog */}
      <Dialog open={isFullscreen} onOpenChange={setIsFullscreen}>
        <DialogContent className="max-w-6xl h-[90vh] p-0">
          <DialogHeader className="px-6 py-4 border-b">
            <DialogTitle className="text-lg font-semibold flex items-center justify-between">
              <span className="truncate flex-1 mr-4">{currentPdf.label} — {currentPdf.description}</span>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => setZoom(Math.max(50, zoom - 10))} disabled={zoom <= 50}>
                  <ZoomOut className="w-4 h-4" />
                </Button>
                <span className="text-sm font-normal text-slate-600 min-w-[60px] text-center">{zoom}%</span>
                <Button variant="outline" size="sm" onClick={() => setZoom(Math.min(200, zoom + 10))} disabled={zoom >= 200}>
                  <ZoomIn className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => window.open(currentPdf.url, '_blank')}>
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              </div>
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-auto bg-slate-100">
            <div className="min-h-full flex items-center justify-center p-4">
              <embed
                src={`${currentPdf.url}#toolbar=1&navpanes=0&view=FitH`}
                type="application/pdf"
                className="w-full bg-white shadow-lg rounded-lg"
                style={{
                  height: "100%",
                  minHeight: "70vh",
                }}
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
