"use client"

import { useState } from "react"
import { Button } from "./ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { Alert, AlertDescription } from "./ui/alert"
import { uploadDocument } from "@/lib/supabase"
import { useAuth } from "@/lib/auth-context"
import { Upload, FileText, AlertCircle, CheckCircle2, Loader2 } from "lucide-react"
import { Progress } from "./ui/progress"

interface DocumentUploadProps {
  proposalId: string
  onUploadSuccess?: (url: string, summary: string) => void
  onUploadError?: (error: string) => void
}

export function DocumentUpload({ proposalId, onUploadSuccess, onUploadError }: DocumentUploadProps) {
  const { user } = useAuth()
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string>("")
  const [success, setSuccess] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      // Validate file type
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain',
      ]
      
      if (!allowedTypes.includes(selectedFile.type)) {
        setError('Tipe file tidak didukung. Gunakan PDF, DOC, DOCX, atau TXT')
        return
      }

      // Validate file size (max 10MB)
      if (selectedFile.size > 10 * 1024 * 1024) {
        setError('Ukuran file terlalu besar. Maksimal 10MB')
        return
      }

      setFile(selectedFile)
      setError("")
      setSuccess(false)
    }
  }

  const handleUpload = async () => {
    if (!file || !user) return

    setUploading(true)
    setProgress(0)
    setError("")

    try {
      // Simulate progress
      setProgress(30)

      // Upload file ke Supabase Storage
      setProgress(60)
      const documentUrl = await uploadDocument(file, proposalId, user.id)

      setProgress(100)
      setSuccess(true)

      // Callback - tidak ada AI summary untuk mitra
      if (onUploadSuccess) {
        onUploadSuccess(documentUrl, '')
      }

      // Reset after success
      setTimeout(() => {
        setFile(null)
        setProgress(0)
        setSuccess(false)
      }, 3000)

    } catch (err: any) {
      console.error('Upload error:', err)
      const errorMessage = err.message || 'Gagal mengunggah dokumen'
      setError(errorMessage)
      
      if (onUploadError) {
        onUploadError(errorMessage)
      }
    } finally {
      setUploading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Upload className="h-5 w-5" />
          Upload Dokumen
        </CardTitle>
        <CardDescription>
          Format: PDF, DOC, DOCX (max. 10MB). Ringkasan dokumen akan dibuat oleh DKUI.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 pt-6">
        <div className="flex items-center gap-3">
          <input
            type="file"
            id="document-upload"
            className="hidden"
            accept=".pdf,.doc,.docx,.txt"
            onChange={handleFileChange}
            disabled={uploading}
          />
          <label htmlFor="document-upload">
            <Button
              variant="outline"
              disabled={uploading}
              className="cursor-pointer"
              asChild
            >
              <span>
                <FileText className="mr-2 h-4 w-4" />
                Pilih File
              </span>
            </Button>
          </label>
          
          {file && (
            <div className="flex-1 text-sm">
              <p className="font-medium">{file.name}</p>
              <p className="text-xs text-muted-foreground">
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          )}
        </div>

        {file && !success && (
          <Button
            onClick={handleUpload}
            disabled={uploading}
            className="w-full"
          >
            {uploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Mengunggah...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Upload Dokumen
              </>
            )}
          </Button>
        )}

        {uploading && (
          <div className="space-y-2">
            <Progress value={progress} className="h-2" />
            <p className="text-xs text-muted-foreground text-center">
              {progress < 60 && "Mempersiapkan upload..."}
              {progress >= 60 && progress < 100 && "Mengunggah dokumen..."}
              {progress === 100 && "Selesai!"}
            </p>
          </div>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="border-green-500 bg-green-50">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              Dokumen berhasil diunggah dan diproses!
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}
