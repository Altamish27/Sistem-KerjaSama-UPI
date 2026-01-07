"use client"

import { useState } from "react"
import { FileText, Download, X, ZoomIn, ZoomOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

interface PdfViewerProps {
  url: string
  fileName: string
  fileSize: number
}

export function PdfViewer({ url, fileName, fileSize }: PdfViewerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [zoom, setZoom] = useState(100)

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B"
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB"
    return (bytes / (1024 * 1024)).toFixed(1) + " MB"
  }

  const isPdf = fileName.toLowerCase().endsWith('.pdf')

  return (
    <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors border border-slate-200 group">
      <div className="flex items-center gap-4 flex-1 min-w-0">
        <div className="w-11 h-11 rounded-lg bg-white border border-slate-300 flex items-center justify-center">
          <FileText className="w-5 h-5 text-slate-600" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-base text-slate-900 font-medium truncate">{fileName}</p>
          <p className="text-sm text-slate-500">{formatFileSize(fileSize)}</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {isPdf && (
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="text-slate-600 hover:text-blue-600 hover:bg-blue-50"
              >
                <FileText className="w-4 h-4 mr-2" />
                Preview
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-6xl h-[90vh] p-0">
              <DialogHeader className="px-6 py-4 border-b">
                <DialogTitle className="text-lg font-semibold flex items-center justify-between">
                  <span className="truncate flex-1 mr-4">{fileName}</span>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setZoom(Math.max(50, zoom - 10))}
                      disabled={zoom <= 50}
                    >
                      <ZoomOut className="w-4 h-4" />
                    </Button>
                    <span className="text-sm font-normal text-slate-600 min-w-[60px] text-center">
                      {zoom}%
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setZoom(Math.min(200, zoom + 10))}
                      disabled={zoom >= 200}
                    >
                      <ZoomIn className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(url, '_blank')}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </DialogTitle>
              </DialogHeader>
              <div className="flex-1 overflow-auto bg-slate-100">
                <div className="min-h-full flex items-center justify-center p-4">
                  <iframe
                    src={`${url}#view=FitH`}
                    className="w-full bg-white shadow-lg rounded-lg"
                    style={{ 
                      height: '100%',
                      minHeight: '70vh',
                      transform: `scale(${zoom / 100})`,
                      transformOrigin: 'top center',
                    }}
                    title={fileName}
                  />
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
        
        <Button
          variant="ghost"
          size="sm"
          className="text-slate-600 hover:text-[#e10000] hover:bg-red-50"
          onClick={() => window.open(url, '_blank')}
        >
          <Download className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}
