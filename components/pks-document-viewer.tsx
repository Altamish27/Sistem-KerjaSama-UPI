"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  FileText,
  ZoomIn,
  ZoomOut,
  Download,
  Eye,
  ShieldCheck,
  FileSignature,
  CheckCircle2,
} from "lucide-react"
import { getPksFileForStatus } from "@/lib/workflow-utils"
import type { ProposalStatus } from "@/lib/mock-data"

interface PksDocumentViewerProps {
  status: ProposalStatus
}

export function PksDocumentViewer({ status }: PksDocumentViewerProps) {
  const pksFile = getPksFileForStatus(status)
  const [zoom, setZoom] = useState(100)
  const [isFullscreen, setIsFullscreen] = useState(false)

  if (!pksFile) return null

  const stageInfo = [
    { label: "Draft", icon: FileText, reached: pksFile.stage >= 0 },
    { label: "TTD Pimpinan", icon: FileSignature, reached: pksFile.stage >= 1 },
    { label: "e-Materai", icon: ShieldCheck, reached: pksFile.stage >= 2 },
    { label: "TTD Mitra", icon: FileSignature, reached: pksFile.stage >= 3 },
    { label: "Final", icon: CheckCircle2, reached: pksFile.stage >= 4 },
  ]

  return (
    <Card className="bg-white border border-slate-200 shadow-sm overflow-hidden">
      <CardHeader className="pb-3 bg-gradient-to-r from-blue-50/50 to-white border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center shadow-sm">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-lg font-bold text-slate-900">Naskah PKS</CardTitle>
              <p className="text-sm text-slate-500 mt-0.5">{pksFile.description}</p>
            </div>
          </div>
          <Badge
            className={`${
              pksFile.stage === 4
                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                : pksFile.stage >= 2
                  ? "bg-blue-50 text-blue-700 border-blue-200"
                  : "bg-slate-100 text-slate-600 border-slate-200"
            }`}
          >
            {pksFile.label}
          </Badge>
        </div>

        {/* Progress dots */}
        <div className="mt-3 flex items-center gap-1">
          {stageInfo.map((stage, idx) => (
            <div key={idx} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                    pksFile.stage === idx
                      ? "bg-blue-500 text-white shadow ring-2 ring-blue-200"
                      : stage.reached
                        ? "bg-emerald-500 text-white"
                        : "bg-slate-200 text-slate-400"
                  }`}
                >
                  {stage.reached && pksFile.stage !== idx ? (
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  ) : (
                    <stage.icon className="w-3 h-3" />
                  )}
                </div>
                <span className={`text-[10px] mt-1 text-center leading-tight ${
                  stage.reached ? "text-slate-700 font-medium" : "text-slate-400"
                }`}>
                  {stage.label}
                </span>
              </div>
              {idx < stageInfo.length - 1 && (
                <div className={`h-0.5 w-full mt-[-12px] ${
                  stage.reached && stageInfo[idx + 1].reached ? "bg-emerald-400" : "bg-slate-200"
                }`} />
              )}
            </div>
          ))}
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {/* Inline PDF Viewer */}
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
            <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => window.open(pksFile.url, '_blank')}>
              <Download className="w-3.5 h-3.5" />
            </Button>
          </div>

          <embed
            src={`${pksFile.url}#toolbar=1&navpanes=0&view=FitH`}
            type="application/pdf"
            className="w-full"
            style={{
              height: "450px",
            }}
          />
        </div>
      </CardContent>

      {/* Fullscreen Dialog */}
      <Dialog open={isFullscreen} onOpenChange={setIsFullscreen}>
        <DialogContent className="max-w-6xl h-[90vh] p-0">
          <DialogHeader className="px-6 py-4 border-b">
            <DialogTitle className="text-lg font-semibold flex items-center justify-between">
              <span className="truncate flex-1 mr-4">Naskah PKS — {pksFile.description}</span>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => setZoom(Math.max(50, zoom - 10))} disabled={zoom <= 50}>
                  <ZoomOut className="w-4 h-4" />
                </Button>
                <span className="text-sm font-normal text-slate-600 min-w-[60px] text-center">{zoom}%</span>
                <Button variant="outline" size="sm" onClick={() => setZoom(Math.min(200, zoom + 10))} disabled={zoom >= 200}>
                  <ZoomIn className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => window.open(pksFile.url, '_blank')}>
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              </div>
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-auto bg-slate-100">
            <div className="min-h-full flex items-center justify-center p-4">
              <embed
                src={`${pksFile.url}#toolbar=1&navpanes=0&view=FitH`}
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
