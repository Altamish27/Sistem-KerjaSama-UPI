"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ProtectedRoute } from "@/components/protected-route"
import { DashboardLayout } from "@/components/dashboard-layout"
import { useAuth } from "@/lib/auth-context"
import { useDataStore } from "@/lib/data-store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, Save, Send, Upload, X, FileText } from "lucide-react"
import Link from "next/link"
import type { Proposal, InitiatorType, ProposalDocument } from "@/lib/mock-data"

export default function NewProposalPage() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <NewProposalContent />
      </DashboardLayout>
    </ProtectedRoute>
  )
}

function NewProposalContent() {
  const { user } = useAuth()
  const router = useRouter()
  const { addProposal } = useDataStore()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [uploadedDocuments, setUploadedDocuments] = useState<ProposalDocument[]>([])
  const [agreementLevel, setAgreementLevel] = useState<"universitas" | "fakultas" | "">("")
  const [selectedFakultas, setSelectedFakultas] = useState("")
  const [documentType, setDocumentType] = useState<"MoU" | "MoA" | "PKS" | "IA" | "">("")

  const [formData, setFormData] = useState({
    title: "",
    partnerName: "",
    partnerType: "" as "dalam_negeri" | "luar_negeri" | "",
    description: "",
    objectives: "",
    benefits: "",
    scopeOfWork: "",
    startDate: "",
    endDate: "",
    budget: "",
  })

  const fakultasList = ["FPMIPA", "FPOK", "FIP", "FPSD", "FPTI"]
  const documentTypes = [
    { value: "MoU", label: "MoU (Memorandum of Understanding)" },
    { value: "MoA", label: "MoA (Memorandum of Agreement)" },
    { value: "PKS", label: "PKS (Perjanjian Kerja Sama)" },
    { value: "IA", label: "IA (Implementation Arrangement)" },
  ]

  // Calculate duration in months from start and end date
  const calculateDuration = (startDate: string, endDate: string): number => {
    if (!startDate || !endDate) return 0
    const start = new Date(startDate)
    const end = new Date(endDate)
    const months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth())
    return Math.max(0, months)
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setIsSubmitting(true)
    setError("")

    try {
      // Only allow 1 file
      const file = files[0]

      // Upload file to server
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Upload failed")
      }

      const result = await response.json()

      const newDocument: ProposalDocument = {
        id: result.file.id,
        name: result.file.name,
        type: result.file.type,
        size: result.file.size,
        uploadedAt: result.file.uploadedAt,
        url: result.file.url,
      }

      // Replace existing document with new one
      setUploadedDocuments([newDocument])
    } catch (error) {
      console.error("Upload error:", error)
      setError("Gagal mengupload file. Silakan coba lagi.")
    } finally {
      setIsSubmitting(false)
      // Reset input value to allow re-uploading the same file
      e.target.value = ""
    }
  }

  const handleRemoveDocument = (docId: string) => {
    setUploadedDocuments(uploadedDocuments.filter((doc) => doc.id !== docId))
  }

  const handleSubmit = async (status: "draft" | "submitted") => {
    setError("")

    // Validation
    if (
      !formData.title ||
      !formData.partnerName ||
      !formData.partnerType ||
      !formData.description ||
      !formData.objectives ||
      !formData.benefits ||
      !formData.scopeOfWork ||
      !formData.startDate ||
      !formData.endDate ||
      !agreementLevel ||
      !documentType
    ) {
      setError("Semua field wajib diisi")
      return
    }

    // Validate fakultas selection if agreement level is fakultas
    if (agreementLevel === "fakultas" && !selectedFakultas) {
      setError("Pilih fakultas terlebih dahulu")
      return
    }

    setIsSubmitting(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const initiator: InitiatorType = user!.role === "mitra" ? "mitra" : "fakultas"
    const duration = calculateDuration(formData.startDate, formData.endDate)

    const newProposal: Proposal = {
      id: `PROP-${Date.now()}`,
      initiator: initiator,
      title: formData.title,
      partnerName: formData.partnerName,
      partnerType: formData.partnerType as "dalam_negeri" | "luar_negeri",
      description: formData.description,
      objectives: formData.objectives,
      benefits: formData.benefits,
      scopeOfWork: formData.scopeOfWork,
      duration: duration,
      startDate: formData.startDate,
      endDate: formData.endDate,
      budget: formData.budget ? Number.parseFloat(formData.budget) : undefined,
      documents: uploadedDocuments,
      status: status,
      createdBy: user!.id,
      createdByName: user!.name,
      createdByRole: user!.role,
      fakultas: agreementLevel === "fakultas" ? selectedFakultas : user!.fakultas || "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      approvalHistory: [
        {
          id: `HIST-${Date.now()}`,
          proposalId: `PROP-${Date.now()}`,
          action: status === "draft" ? "submit" : "submit",
          actor: user!.id,
          actorName: user!.name,
          actorRole: user!.role,
          comment: status === "draft" ? "Draft disimpan" : "Proposal diajukan",
          timestamp: new Date().toISOString(),
        },
      ],
    }

    addProposal(newProposal)
    setIsSubmitting(false)
    router.push("/dashboard/proposals")
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B"
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB"
    return (bytes / (1024 * 1024)).toFixed(1) + " MB"
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <Link href="/dashboard/proposals">
          <Button
            variant="outline"
            size="sm"
            className="border-slate-300 text-slate-700 hover:bg-slate-50 bg-white w-full sm:w-auto"
          >
            <ArrowLeft className="w-4 h-4 sm:mr-2" />
            <span className="hidden sm:inline">Kembali</span>
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900">Buat Proposal Baru</h1>
          <p className="text-slate-600 mt-2 text-base lg:text-lg">Isi form di bawah untuk mengajukan proposal kerja sama</p>
        </div>
      </div>

      <Card className="bg-white border-slate-200 shadow-sm">
        <CardHeader className="pb-3 sm:pb-5">
          <CardTitle className="text-slate-900 text-xl sm:text-2xl font-bold">Informasi Proposal</CardTitle>
          <CardDescription className="text-slate-600 text-sm sm:text-base">Lengkapi data proposal kerja sama dengan mitra</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 sm:space-y-6 pt-4 sm:pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="partnerType" className="text-slate-900 font-medium">
                Jenis Mitra *
              </Label>
              <Select
                value={formData.partnerType}
                onValueChange={(value) =>
                  setFormData({ ...formData, partnerType: value as "dalam_negeri" | "luar_negeri" })
                }
              >
                <SelectTrigger className="bg-white border-slate-300 text-slate-900 focus:border-[#e10000] focus:ring-2 focus:ring-[#e10000]/10">
                  <SelectValue placeholder="Pilih jenis mitra" />
                </SelectTrigger>
                <SelectContent className="bg-white border-slate-200 shadow-lg">
                  <SelectItem value="dalam_negeri" className="text-slate-900">
                    Dalam Negeri
                  </SelectItem>
                  <SelectItem value="luar_negeri" className="text-slate-900">
                    Luar Negeri
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Agreement Level */}
            <div className="space-y-2">
              <Label htmlFor="agreementLevel" className="text-slate-900 font-medium">
                Tingkat Perjanjian *
              </Label>
              <Select
                value={agreementLevel}
                onValueChange={(value) => {
                  setAgreementLevel(value as "universitas" | "fakultas")
                  // Reset fakultas selection when changing agreement level
                  if (value === "universitas") {
                    setSelectedFakultas("")
                  }
                }}
              >
                <SelectTrigger className="bg-white border-slate-300 text-slate-900 focus:border-[#e10000] focus:ring-2 focus:ring-[#e10000]/10">
                  <SelectValue placeholder="Pilih tingkat perjanjian" />
                </SelectTrigger>
                <SelectContent className="bg-white border-slate-200 shadow-lg">
                  <SelectItem value="universitas" className="text-slate-900">
                    Universitas
                  </SelectItem>
                  <SelectItem value="fakultas" className="text-slate-900">
                    Fakultas
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Conditional Faculty Dropdown */}
            {agreementLevel === "fakultas" && (
              <div className="space-y-2">
                <Label htmlFor="fakultas" className="text-slate-900 font-medium">
                  Pilih Fakultas *
                </Label>
                <Select value={selectedFakultas} onValueChange={setSelectedFakultas}>
                  <SelectTrigger className="bg-white border-slate-300 text-slate-900 focus:border-[#e10000] focus:ring-2 focus:ring-[#e10000]/10">
                    <SelectValue placeholder="Pilih fakultas" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-slate-200 shadow-lg">
                    {fakultasList.map((fakultas) => (
                      <SelectItem key={fakultas} value={fakultas} className="text-slate-900">
                        {fakultas}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {/* Document Type Dropdown */}
          <div className="space-y-2">
            <Label htmlFor="documentType" className="text-slate-900 font-medium">
              Jenis Dokumen *
            </Label>
            <Select
              value={documentType}
              onValueChange={(value) => setDocumentType(value as "MoU" | "MoA" | "PKS" | "IA")}
            >
              <SelectTrigger className="bg-white border-slate-300 text-slate-900 focus:border-[#e10000] focus:ring-2 focus:ring-[#e10000]/10">
                <SelectValue placeholder="Pilih jenis dokumen" />
              </SelectTrigger>
              <SelectContent className="bg-white border-slate-200 shadow-lg">
                {documentTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value} className="text-slate-900">
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title" className="text-slate-900 font-medium">
              Judul Proposal *
            </Label>
            <Input
              id="title"
              placeholder="Masukkan judul proposal"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="bg-white border-slate-300 text-slate-900 placeholder:text-slate-500 focus:border-[#e10000] focus:ring-2 focus:ring-[#e10000]/10"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="partnerName" className="text-slate-900 font-medium">
              Nama Mitra *
            </Label>
            <Input
              id="partnerName"
              placeholder="Nama institusi/organisasi mitra"
              value={formData.partnerName}
              onChange={(e) => setFormData({ ...formData, partnerName: e.target.value })}
              className="bg-white border-slate-300 text-slate-900 placeholder:text-slate-500 focus:border-[#e10000] focus:ring-2 focus:ring-[#e10000]/10"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-slate-900 font-medium">
              Deskripsi *
            </Label>
            <Textarea
              id="description"
              placeholder="Jelaskan secara singkat tentang kerja sama ini"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              className="bg-white border-slate-300 text-slate-900 placeholder:text-slate-500 focus:border-[#e10000] focus:ring-2 focus:ring-[#e10000]/10"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="objectives" className="text-slate-900 font-medium">
              Tujuan Kerja Sama *
            </Label>
            <Textarea
              id="objectives"
              placeholder="Jelaskan tujuan dari kerja sama ini"
              value={formData.objectives}
              onChange={(e) => setFormData({ ...formData, objectives: e.target.value })}
              rows={4}
              className="bg-white border-slate-300 text-slate-900 placeholder:text-slate-500 focus:border-[#e10000] focus:ring-2 focus:ring-[#e10000]/10"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="benefits" className="text-slate-900 font-medium">
              Manfaat *
            </Label>
            <Textarea
              id="benefits"
              placeholder="Jelaskan manfaat yang akan diperoleh"
              value={formData.benefits}
              onChange={(e) => setFormData({ ...formData, benefits: e.target.value })}
              rows={4}
              className="bg-white border-slate-300 text-slate-900 placeholder:text-slate-500 focus:border-[#e10000] focus:ring-2 focus:ring-[#e10000]/10"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="scopeOfWork" className="text-slate-900 font-medium">
              Ruang Lingkup Pekerjaan *
            </Label>
            <Textarea
              id="scopeOfWork"
              placeholder="Jelaskan ruang lingkup pekerjaan yang akan dilakukan"
              value={formData.scopeOfWork}
              onChange={(e) => setFormData({ ...formData, scopeOfWork: e.target.value })}
              rows={4}
              className="bg-white border-slate-300 text-slate-900 placeholder:text-slate-500 focus:border-[#e10000] focus:ring-2 focus:ring-[#e10000]/10"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">

            <div className="space-y-2">
              <Label htmlFor="startDate" className="text-slate-900 font-medium">
                Tanggal Mulai *
              </Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="bg-white border-slate-300 text-slate-900 focus:border-[#e10000] focus:ring-2 focus:ring-[#e10000]/10"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate" className="text-slate-900 font-medium">
                Tanggal Selesai *
              </Label>
              <Input
                id="endDate"
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="bg-white border-slate-300 text-slate-900 focus:border-[#e10000] focus:ring-2 focus:ring-[#e10000]/10"
              />
            </div>
          </div>

          {/* Display calculated duration */}
          {formData.startDate && formData.endDate && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-900">
                <span className="font-semibold">Durasi Kerja Sama:</span>{" "}
                {calculateDuration(formData.startDate, formData.endDate)} bulan
              </p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="budget" className="text-slate-900 font-medium">
              Anggaran (Rp) - Opsional
            </Label>
            <Input
              id="budget"
              type="number"
              placeholder="50000000"
              value={formData.budget}
              onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
              className="bg-white border-slate-300 text-slate-900 placeholder:text-slate-500 focus:border-[#e10000] focus:ring-2 focus:ring-[#e10000]/10"
            />
          </div>

          {/* Document Upload Section */}
          <div className="space-y-4 pt-4 border-t border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-slate-900 font-medium">Dokumen Pendukung</Label>
                <p className="text-sm text-slate-600 mt-1">
                  Upload 1 dokumen (proposal, MOU/MOA draft, dll.)
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => document.getElementById("fileUpload")?.click()}
                className="border-slate-300 text-slate-700 hover:bg-slate-50 bg-white"
              >
                <Upload className="w-4 h-4 mr-2" />
                {uploadedDocuments.length > 0 ? "Ganti File" : "Upload File"}
              </Button>
              <input
                id="fileUpload"
                type="file"
                onChange={handleFileUpload}
                className="hidden"
                accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
              />
            </div>

            {uploadedDocuments.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-200">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <FileText className="w-5 h-5 text-blue-600 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-900 truncate font-medium">{uploadedDocuments[0].name}</p>
                      <p className="text-xs text-slate-600">{formatFileSize(uploadedDocuments[0].size)}</p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveDocument(uploadedDocuments[0].id)}
                    className="text-slate-600 hover:text-red-600 hover:bg-red-50"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}

          </div>


          {error && (
            <Alert variant="destructive" className="bg-red-50 border-red-200">
              <AlertDescription className="text-red-900">{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 pt-4">
            <Button
              onClick={() => handleSubmit("draft")}
              disabled={isSubmitting}
              variant="outline"
              className="bg-white border-slate-300 text-slate-700 hover:bg-slate-50 py-3 sm:py-5 px-4 sm:px-6 text-sm sm:text-base w-full sm:w-auto"
            >
              <Save className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              Simpan sebagai Draft
            </Button>
            <Button
              onClick={() => handleSubmit("submitted")}
              disabled={isSubmitting}
              className="bg-[#e10000] text-white hover:bg-[#c10000] py-3 sm:py-5 px-4 sm:px-6 text-sm sm:text-base font-semibold w-full sm:w-auto"
            >
              <Send className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              Ajukan Proposal
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
