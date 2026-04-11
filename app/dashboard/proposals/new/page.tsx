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
import { Switch } from "@/components/ui/switch"
import { ArrowLeft, Save, Send, Upload, X, FileText, Search, CheckCircle2, Loader2 } from "lucide-react"
import Link from "next/link"
import type { Proposal, InitiatorType, ProposalDocument, JenisDokumen } from "@/lib/mock-data"

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
  const [jenisDokumen, setJenisDokumen] = useState<JenisDokumen | "">("")
  const [isIncomeGenerating, setIsIncomeGenerating] = useState(false)

  // Hanya operator_unit yang bisa membuat proposal baru
  const canCreate = user?.role === "operator_unit"

  // File uploads for specific documents
  const [fileBeritaAcara, setFileBeritaAcara] = useState<{ url: string; name: string } | null>(null)
  const [fileSuratKuasa, setFileSuratKuasa] = useState<{ url: string; name: string } | null>(null)

  // Mitra lookup state
  const [mitraEmail, setMitraEmail] = useState("")
  const [mitraId, setMitraId] = useState<string | null>(null)
  const [mitraExisting, setMitraExisting] = useState(false)
  const [mitraLookupLoading, setMitraLookupLoading] = useState(false)
  const [mitraLookupDone, setMitraLookupDone] = useState(false)
  const [mitraPicName, setMitraPicName] = useState("")
  const [mitraPhone, setMitraPhone] = useState("")

  const handleMitraLookup = async () => {
    if (!mitraEmail.trim()) return
    setMitraLookupLoading(true)
    setMitraLookupDone(false)
    try {
      const res = await fetch(`/api/mitra?email=${encodeURIComponent(mitraEmail.trim())}`)
      const data = await res.json()
      if (data.found && data.mitra) {
        setMitraId(data.mitra.id)
        setMitraExisting(true)
        setFormData((prev) => ({ ...prev, mitraName: data.mitra.namaInstansi || "" }))
        setMitraPicName(data.mitra.namaPic || "")
        setMitraPhone(data.mitra.kontakPic || "")
      } else {
        setMitraId(null)
        setMitraExisting(false)
        // Reset fields for manual input
        setFormData((prev) => ({ ...prev, mitraName: "" }))
        setMitraPicName("")
        setMitraPhone("")
      }
      setMitraLookupDone(true)
    } catch {
      setError("Gagal mencari data mitra")
    } finally {
      setMitraLookupLoading(false)
    }
  }

  const [formData, setFormData] = useState({
    title: "",
    mitraName: "",
    description: "",
    objectives: "",
    benefits: "",
    scopeOfWork: "",
    startDate: "",
    endDate: "",
    budget: "",
    bentukKegiatanLapkerma: "",
  })

  const documentTypes: { value: JenisDokumen; label: string }[] = [
    { value: "MoU", label: "MoU (Memorandum of Understanding)" },
    { value: "MoA/PKS", label: "MoA/PKS (Memorandum of Agreement / Perjanjian Kerja Sama)" },
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
      const file = files[0]
      const formDataUpload = new FormData()
      formDataUpload.append("file", file)

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formDataUpload,
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

      setUploadedDocuments([newDocument])
    } catch (error) {
      console.error("Upload error:", error)
      setError("Gagal mengupload file. Silakan coba lagi.")
    } finally {
      setIsSubmitting(false)
      e.target.value = ""
    }
  }

  const handleSpecificFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: (val: { url: string; name: string } | null) => void,
  ) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setIsSubmitting(true)
    setError("")

    try {
      const file = files[0]
      const formDataUpload = new FormData()
      formDataUpload.append("file", file)

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formDataUpload,
      })

      if (!response.ok) throw new Error("Upload failed")

      const result = await response.json()
      setter({ url: result.file.url, name: result.file.name })
    } catch (error) {
      console.error("Upload error:", error)
      setError("Gagal mengupload file. Silakan coba lagi.")
    } finally {
      setIsSubmitting(false)
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
      !formData.mitraName ||
      !formData.description ||
      !formData.objectives ||
      !formData.benefits ||
      !formData.scopeOfWork ||
      !formData.startDate ||
      !formData.endDate ||
      !jenisDokumen
    ) {
      setError("Semua field wajib diisi")
      return
    }

    if (!mitraEmail.trim()) {
      setError("Email PIC Mitra wajib diisi")
      return
    }

    if (!formData.bentukKegiatanLapkerma) {
      setError("Bentuk Kegiatan Lapkerma wajib diisi")
      return
    }

    if (status === "submitted" && !fileBeritaAcara) {
      setError("File Berita Acara Penjajakan wajib diupload sebelum mengajukan")
      return
    }

    setIsSubmitting(true)

    try {
      // If mitra is new, create mitra record first
      let resolvedMitraId = mitraId
      if (!mitraExisting) {
        const mitraRes = await fetch("/api/mitra", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            namaInstansi: formData.mitraName,
            emailPic: mitraEmail.trim(),
            namaPic: mitraPicName || null,
            kontakPic: mitraPhone || null,
          }),
        })
        const mitraData = await mitraRes.json()
        if (mitraData.success) {
          resolvedMitraId = mitraData.mitra.id
        }
      }

      const initiator: InitiatorType = "internal"
      const duration = calculateDuration(formData.startDate, formData.endDate)

      const newProposal: Proposal = {
        id: `PROP-${Date.now()}`,
        initiator: initiator,
        title: formData.title,
        mitraId: resolvedMitraId || undefined,
        mitraName: formData.mitraName,
        jenisDokumen: jenisDokumen as JenisDokumen,
        description: formData.description,
        objectives: formData.objectives,
        benefits: formData.benefits,
        scopeOfWork: formData.scopeOfWork,
        bentukKegiatanLapkerma: formData.bentukKegiatanLapkerma,
        isIncomeGenerating: isIncomeGenerating,
        fileBeritaAcaraPenjajakan: fileBeritaAcara?.url,
        fileSuratKuasa: fileSuratKuasa?.url,
        duration: duration,
        startDate: formData.startDate,
        endDate: formData.endDate,
        budget: formData.budget ? Number.parseFloat(formData.budget) : undefined,
        documents: uploadedDocuments,
        status: status,
        createdBy: user!.id,
        createdByName: user!.name,
        createdByRole: user!.role,
        unitTerkaitId: user!.unitId,
        unitName: user!.unitName || "",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        approvalHistory: [
          {
            id: `HIST-${Date.now()}`,
            proposalId: `PROP-${Date.now()}`,
            action: "submit",
            actor: user!.id,
            actorName: user!.name,
            actorRole: user!.role,
            comment: status === "draft" ? "Draft disimpan" : "Proposal diajukan",
            timestamp: new Date().toISOString(),
          },
        ],
      }

      // Save proposal to database via DataStore
      await addProposal(newProposal)

      setIsSubmitting(false)
      router.push("/dashboard/proposals")
    } catch (err) {
      console.error("Submit error:", err)
      setError("Terjadi kesalahan saat menyimpan proposal")
      setIsSubmitting(false)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B"
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB"
    return (bytes / (1024 * 1024)).toFixed(1) + " MB"
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {!canCreate ? (
        <div className="text-center py-16">
          <FileText className="w-16 h-16 text-slate-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-900 mb-2">Akses Ditolak</h2>
          <p className="text-slate-600 mb-6">Role Anda tidak memiliki akses untuk membuat proposal baru.</p>
          <Link href="/dashboard">
            <Button variant="outline" className="border-slate-300 text-slate-700 hover:bg-slate-50 bg-white">
              Kembali ke Dashboard
            </Button>
          </Link>
        </div>
      ) : (
      <>
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
          {/* Jenis Dokumen */}
          <div className="space-y-2">
            <Label htmlFor="jenisDokumen" className="text-slate-900 font-medium">
              Jenis Dokumen *
            </Label>
            <Select
              value={jenisDokumen}
              onValueChange={(value) => setJenisDokumen(value as JenisDokumen)}
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

          {/* Mitra Email Lookup */}
          <div className="space-y-2">
            <Label htmlFor="mitraEmail" className="text-slate-900 font-medium">
              Email PIC Mitra *
            </Label>
            <div className="flex gap-2">
              <Input
                id="mitraEmail"
                type="email"
                placeholder="Masukkan email PIC mitra"
                value={mitraEmail}
                onChange={(e) => {
                  setMitraEmail(e.target.value)
                  setMitraLookupDone(false)
                  setMitraExisting(false)
                  setMitraId(null)
                }}
                className="bg-white border-slate-300 text-slate-900 placeholder:text-slate-500 focus:border-[#e10000] focus:ring-2 focus:ring-[#e10000]/10"
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleMitraLookup}
                disabled={mitraLookupLoading || !mitraEmail.trim()}
                className="shrink-0"
              >
                {mitraLookupLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
                <span className="ml-1">Cari</span>
              </Button>
            </div>
            {mitraLookupDone && mitraExisting && (
              <p className="text-sm text-green-600 flex items-center gap-1">
                <CheckCircle2 className="h-4 w-4" /> Mitra ditemukan — data terisi otomatis
              </p>
            )}
            {mitraLookupDone && !mitraExisting && (
              <p className="text-sm text-amber-600">
                Mitra belum terdaftar — silakan isi data di bawah. Akun akan dibuat otomatis setelah Pimpinan Unit menyetujui.
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="mitraName" className="text-slate-900 font-medium">
              Nama Instansi Mitra *
            </Label>
            <Input
              id="mitraName"
              placeholder="Nama institusi/organisasi mitra"
              value={formData.mitraName}
              onChange={(e) => setFormData({ ...formData, mitraName: e.target.value })}
              disabled={mitraExisting}
              className="bg-white border-slate-300 text-slate-900 placeholder:text-slate-500 focus:border-[#e10000] focus:ring-2 focus:ring-[#e10000]/10 disabled:opacity-70"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="mitraPicName" className="text-slate-900 font-medium">
                Nama PIC Mitra
              </Label>
              <Input
                id="mitraPicName"
                placeholder="Nama person in charge"
                value={mitraPicName}
                onChange={(e) => setMitraPicName(e.target.value)}
                disabled={mitraExisting}
                className="bg-white border-slate-300 text-slate-900 placeholder:text-slate-500 focus:border-[#e10000] focus:ring-2 focus:ring-[#e10000]/10 disabled:opacity-70"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mitraPhone" className="text-slate-900 font-medium">
                No. Telepon PIC Mitra
              </Label>
              <Input
                id="mitraPhone"
                placeholder="08xxxxxxxxxx"
                value={mitraPhone}
                onChange={(e) => setMitraPhone(e.target.value)}
                disabled={mitraExisting}
                className="bg-white border-slate-300 text-slate-900 placeholder:text-slate-500 focus:border-[#e10000] focus:ring-2 focus:ring-[#e10000]/10 disabled:opacity-70"
              />
            </div>
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

          {/* Bentuk Kegiatan Lapkerma */}
          <div className="space-y-2">
            <Label htmlFor="bentukKegiatanLapkerma" className="text-slate-900 font-medium">
              Bentuk Kegiatan Lapkerma *
            </Label>
            <Input
              id="bentukKegiatanLapkerma"
              placeholder="Contoh: Penelitian Bersama, Pertukaran Mahasiswa, Magang, dll."
              value={formData.bentukKegiatanLapkerma}
              onChange={(e) => setFormData({ ...formData, bentukKegiatanLapkerma: e.target.value })}
              className="bg-white border-slate-300 text-slate-900 placeholder:text-slate-500 focus:border-[#e10000] focus:ring-2 focus:ring-[#e10000]/10"
            />
          </div>

          {/* Income Generating Toggle */}
          <div className="flex items-center justify-between p-4 rounded-lg border border-slate-200 bg-slate-50">
            <div className="space-y-0.5">
              <Label htmlFor="isIncomeGenerating" className="text-slate-900 font-medium">
                Income Generating?
              </Label>
              <p className="text-sm text-slate-600">
                Apakah kerja sama ini menghasilkan pendapatan bagi universitas?
              </p>
            </div>
            <Switch
              id="isIncomeGenerating"
              checked={isIncomeGenerating}
              onCheckedChange={setIsIncomeGenerating}
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

          {/* Berita Acara Penjajakan Upload (Mandatory) */}
          <div className="space-y-3 pt-4 border-t border-slate-200">
            <div>
              <Label className="text-slate-900 font-medium">Berita Acara Penjajakan *</Label>
              <p className="text-sm text-slate-600 mt-1">
                Upload dokumen berita acara hasil penjajakan kerja sama (wajib saat submit)
              </p>
            </div>
            {fileBeritaAcara ? (
              <div className="flex items-center justify-between p-3 rounded-lg bg-emerald-50 border border-emerald-200">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <FileText className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                  <p className="text-sm text-slate-900 truncate font-medium">{fileBeritaAcara.name}</p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setFileBeritaAcara(null)}
                  className="text-slate-600 hover:text-red-600 hover:bg-red-50"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => document.getElementById("fileBeritaAcara")?.click()}
                className="border-slate-300 text-slate-700 hover:bg-slate-50 bg-white"
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload Berita Acara
              </Button>
            )}
            <input
              id="fileBeritaAcara"
              type="file"
              onChange={(e) => handleSpecificFileUpload(e, setFileBeritaAcara)}
              className="hidden"
              accept=".pdf,.doc,.docx"
            />
          </div>

          {/* Surat Kuasa Rektor Upload (Optional — determines workflow path) */}
          <div className="space-y-3">
            <div>
              <Label className="text-slate-900 font-medium">Surat Kuasa Rektor (Opsional)</Label>
              <p className="text-sm text-slate-600 mt-1">
                Jika ada surat kuasa dari Rektor, penandatanganan dilakukan oleh Pimpinan Unit.
                Jika tidak ada, penandatanganan dilakukan oleh Rektor.
              </p>
            </div>
            {fileSuratKuasa ? (
              <div className="flex items-center justify-between p-3 rounded-lg bg-amber-50 border border-amber-200">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <FileText className="w-5 h-5 text-amber-600 flex-shrink-0" />
                  <p className="text-sm text-slate-900 truncate font-medium">{fileSuratKuasa.name}</p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setFileSuratKuasa(null)}
                  className="text-slate-600 hover:text-red-600 hover:bg-red-50"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => document.getElementById("fileSuratKuasa")?.click()}
                className="border-slate-300 text-slate-700 hover:bg-slate-50 bg-white"
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload Surat Kuasa
              </Button>
            )}
            <input
              id="fileSuratKuasa"
              type="file"
              onChange={(e) => handleSpecificFileUpload(e, setFileSuratKuasa)}
              className="hidden"
              accept=".pdf,.doc,.docx"
            />
          </div>

          {/* Document Upload Section (general supporting document) */}
          <div className="space-y-4 pt-4 border-t border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-slate-900 font-medium">Dokumen Pendukung</Label>
                <p className="text-sm text-slate-600 mt-1">
                  Upload 1 dokumen pendukung tambahan (opsional)
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
      </>
      )}
    </div>
  )
}
