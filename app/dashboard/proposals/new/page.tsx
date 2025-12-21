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
import { ArrowLeft, Save, Send, Upload, X, FileText, Loader2, Sparkles } from "lucide-react"
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
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false)
  const [error, setError] = useState("")
  const [uploadedDocuments, setUploadedDocuments] = useState<ProposalDocument[]>([])

  const [formData, setFormData] = useState({
    title: "",
    partnerName: "",
    partnerType: "" as "dalam_negeri" | "luar_negeri" | "",
    description: "",
    objectives: "",
    benefits: "",
    scopeOfWork: "",
    duration: "",
    startDate: "",
    endDate: "",
    budget: "",
  })

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    const newDocuments: ProposalDocument[] = Array.from(files).map((file) => ({
      id: `DOC-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: file.name,
      type: file.type,
      size: file.size,
      uploadedAt: new Date().toISOString(),
      url: URL.createObjectURL(file),
    }))

    setUploadedDocuments([...uploadedDocuments, ...newDocuments])
  }

  const handleRemoveDocument = (docId: string) => {
    setUploadedDocuments(uploadedDocuments.filter((doc) => doc.id !== docId))
  }

  const handleGenerateSummary = async () => {
    if (!formData.description || !formData.objectives || !formData.benefits || !formData.scopeOfWork) {
      setError("Lengkapi semua field terlebih dahulu untuk generate ringkasan AI")
      return
    }

    setIsGeneratingSummary(true)
    setError("")

    // Simulate LLM API call
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Mock AI-generated summary
    const aiSummary = `Proposal kerja sama dengan ${formData.partnerName} ini bertujuan untuk ${formData.objectives.slice(0, 100)}... Manfaat yang diharapkan mencakup ${formData.benefits.slice(0, 100)}... dengan ruang lingkup ${formData.scopeOfWork.slice(0, 100)}... Durasi kerja sama selama ${formData.duration} bulan.`

    // Store in sessionStorage for later use
    sessionStorage.setItem("aiSummary", aiSummary)

    setIsGeneratingSummary(false)
    alert("Ringkasan AI berhasil dibuat! Ringkasan akan disimpan bersama proposal.")
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
      !formData.duration ||
      !formData.startDate ||
      !formData.endDate
    ) {
      setError("Semua field wajib diisi")
      return
    }

    setIsSubmitting(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const aiSummary = sessionStorage.getItem("aiSummary") || undefined

    const initiator: InitiatorType = user!.role === "mitra" ? "mitra" : "fakultas"

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
      duration: Number.parseInt(formData.duration),
      startDate: formData.startDate,
      endDate: formData.endDate,
      budget: formData.budget ? Number.parseFloat(formData.budget) : undefined,
      documents: uploadedDocuments,
      status: status,
      createdBy: user!.id,
      createdByName: user!.name,
      createdByRole: user!.role,
      fakultas: user!.fakultas || "",
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
      aiSummary,
    }

    addProposal(newProposal)
    sessionStorage.removeItem("aiSummary")
    setIsSubmitting(false)
    router.push("/dashboard/proposals")
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B"
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB"
    return (bytes / (1024 * 1024)).toFixed(1) + " MB"
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/proposals">
          <Button
            variant="outline"
            size="sm"
            className="border-slate-300 text-slate-700 hover:bg-slate-50 bg-white"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Kembali
          </Button>
        </Link>
        <div>
          <h1 className="text-4xl font-bold text-slate-900">Buat Proposal Baru</h1>
          <p className="text-slate-600 mt-2 text-lg">Isi form di bawah untuk mengajukan proposal kerja sama</p>
        </div>
      </div>

      <Card className="bg-white border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-slate-900 text-2xl font-bold">Informasi Proposal</CardTitle>
          <CardDescription className="text-slate-600 text-base">Lengkapi data proposal kerja sama dengan mitra</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label htmlFor="duration" className="text-slate-900 font-medium">
                Durasi (Bulan) *
              </Label>
              <Input
                id="duration"
                type="number"
                placeholder="12"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                className="bg-white border-slate-300 text-slate-900 placeholder:text-slate-500 focus:border-[#e10000] focus:ring-2 focus:ring-[#e10000]/10"
              />
            </div>

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
                <p className="text-sm text-slate-600 mt-1">Upload dokumen seperti proposal, MOU/MOA draft, dll.</p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => document.getElementById("fileUpload")?.click()}
                className="border-slate-300 text-slate-700 hover:bg-slate-50 bg-white"
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload File
              </Button>
              <input
                id="fileUpload"
                type="file"
                multiple
                onChange={handleFileUpload}
                className="hidden"
                accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
              />
            </div>

            {uploadedDocuments.length > 0 && (
              <div className="space-y-2">
                {uploadedDocuments.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-200">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <FileText className="w-5 h-5 text-blue-600 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-slate-900 truncate font-medium">{doc.name}</p>
                        <p className="text-xs text-slate-600">{formatFileSize(doc.size)}</p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveDocument(doc.id)}
                      className="text-slate-600 hover:text-red-600 hover:bg-red-50"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

          </div>

          {/* AI Summary Generator */}
          <div className="space-y-4 pt-4 border-t border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-slate-900 font-medium">Ringkasan AI</Label>
                <p className="text-sm text-slate-600 mt-1">Generate ringkasan otomatis menggunakan AI</p>
              </div>
              <Button
                type="button"
                onClick={handleGenerateSummary}
                disabled={isGeneratingSummary}
                size="sm"
                variant="outline"
                className="bg-amber-500/10 text-amber-700 border-amber-300 hover:bg-amber-50"
              >
                {isGeneratingSummary ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate Summary
                  </>
                )}
              </Button>
            </div>
          </div>

          {error && (
            <Alert variant="destructive" className="bg-red-50 border-red-200">
              <AlertDescription className="text-red-900">{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex items-center gap-4 pt-4">
            <Button
              onClick={() => handleSubmit("draft")}
              disabled={isSubmitting}
              variant="outline"
              className="bg-white border-slate-300 text-slate-700 hover:bg-slate-50 py-6 px-8 text-base"
            >
              <Save className="w-5 h-5 mr-2" />
              Simpan sebagai Draft
            </Button>
            <Button
              onClick={() => handleSubmit("submitted")}
              disabled={isSubmitting}
              className="bg-[#e10000] text-white hover:bg-[#c10000] py-6 px-8 text-base font-semibold"
            >
              <Send className="w-5 h-5 mr-2" />
              Ajukan Proposal
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
