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
import { ArrowLeft, Save, Upload, X, FileText } from "lucide-react"
import Link from "next/link"
import type { Proposal, InitiatorType, JenisDokumen } from "@/lib/mock-data"

export default function MigrateProposalPage() {
  return (
    <ProtectedRoute>
      <MigrateContent />
    </ProtectedRoute>
  )
}

function MigrateContent() {
  const { user } = useAuth()
  const router = useRouter()
  const { addProposal } = useDataStore()

  const [formData, setFormData] = useState({
    title: "",
    mitraName: "",
    description: "",
    startDate: "",
    endDate: "",
  })
  const [jenisDokumen, setJenisDokumen] = useState("")
  const [fileNaskah, setFileNaskah] = useState<{ name: string; url: string } | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  // Only DKUI may access this page
  if (user?.role !== "dkui") {
    return (
      <DashboardLayout>
        <div className="p-8 text-center">
          <p className="text-red-600 font-semibold">Anda tidak memiliki akses ke halaman ini.</p>
        </div>
      </DashboardLayout>
    )
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    try {
      const formDataUpload = new FormData()
      formDataUpload.append("file", file)
      formDataUpload.append("category", "naskah_final")

      const res = await fetch("/api/upload", { method: "POST", body: formDataUpload })
      const data = await res.json()

      if (data.success) {
        setFileNaskah({ name: file.name, url: data.url })
      } else {
        setError("Gagal upload file: " + (data.error || "Unknown error"))
      }
    } catch {
      setError("Gagal upload file")
    } finally {
      setIsUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!formData.title || !formData.mitraName || !jenisDokumen || !formData.startDate || !formData.endDate) {
      setError("Semua field wajib (*) harus diisi")
      return
    }

    setIsSubmitting(true)

    try {
      const now = new Date().toISOString()
      const initiator: InitiatorType = "internal"

      const newProposal: Proposal = {
        id: `MIG-${Date.now()}`,
        initiator,
        title: formData.title,
        mitraName: formData.mitraName,
        jenisDokumen: jenisDokumen as JenisDokumen,
        description: formData.description || "Data migrasi historis",
        objectives: "Data migrasi",
        benefits: "Data migrasi",
        scopeOfWork: "Data migrasi",
        bentukKegiatanLapkerma: "-",
        isIncomeGenerating: false,
        duration: 0,
        startDate: formData.startDate,
        endDate: formData.endDate,
        documents: fileNaskah ? [{ id: `DOC-${Date.now()}`, name: fileNaskah.name, url: fileNaskah.url, type: "naskah_final", size: 0, uploadedAt: now }] : [],
        status: "completed",
        createdBy: user!.id,
        createdByName: user!.name,
        createdByRole: user!.role,
        unitTerkaitId: user!.unitId,
        unitName: user!.unitName || "DKUI",
        createdAt: now,
        updatedAt: now,
        completedAt: now,
        approvalHistory: [
          {
            id: `HIST-${Date.now()}`,
            proposalId: `MIG-${Date.now()}`,
            action: "complete",
            actor: user!.id,
            actorName: user!.name,
            actorRole: user!.role,
            comment: "Migrasi data historis oleh DKUI",
            timestamp: now,
          },
        ],
      }

      await addProposal(newProposal)
      setSuccess(true)
      setTimeout(() => router.push("/dashboard/proposals"), 1500)
    } catch (err) {
      console.error("Migration submit error:", err)
      setError("Terjadi kesalahan saat menyimpan data migrasi")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/dashboard/proposals">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Migrasi Data Kerja Sama</h1>
            <p className="text-slate-600 text-sm">Input data kerja sama historis yang sudah berjalan / selesai</p>
          </div>
        </div>

        {success && (
          <Alert className="border-emerald-500 bg-emerald-50">
            <AlertDescription className="text-emerald-700">
              Data migrasi berhasil disimpan! Mengalihkan ke daftar proposal...
            </AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle>Informasi Kerja Sama</CardTitle>
              <CardDescription>Masukkan data kerja sama yang sudah ada untuk dicatat di sistem</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Judul */}
              <div className="space-y-2">
                <Label htmlFor="title" className="text-slate-900 font-medium">Judul Kerja Sama *</Label>
                <Input
                  id="title"
                  placeholder="Judul kerja sama"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="bg-white border-slate-300 text-slate-900"
                />
              </div>

              {/* Nama Mitra */}
              <div className="space-y-2">
                <Label htmlFor="mitraName" className="text-slate-900 font-medium">Nama Mitra *</Label>
                <Input
                  id="mitraName"
                  placeholder="Nama institusi/organisasi mitra"
                  value={formData.mitraName}
                  onChange={(e) => setFormData({ ...formData, mitraName: e.target.value })}
                  className="bg-white border-slate-300 text-slate-900"
                />
              </div>

              {/* Jenis Dokumen */}
              <div className="space-y-2">
                <Label className="text-slate-900 font-medium">Jenis Dokumen *</Label>
                <Select value={jenisDokumen} onValueChange={setJenisDokumen}>
                  <SelectTrigger className="bg-white border-slate-300 text-slate-900">
                    <SelectValue placeholder="Pilih jenis dokumen" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MoU">MoU (Memorandum of Understanding)</SelectItem>
                    <SelectItem value="MoA/PKS">MoA/PKS (Perjanjian Kerja Sama)</SelectItem>
                    <SelectItem value="IA">IA (Implementation Arrangement)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Deskripsi */}
              <div className="space-y-2">
                <Label htmlFor="description" className="text-slate-900 font-medium">Deskripsi</Label>
                <Textarea
                  id="description"
                  placeholder="Deskripsi singkat kerja sama (opsional)"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="bg-white border-slate-300 text-slate-900"
                />
              </div>

              {/* Tanggal */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate" className="text-slate-900 font-medium">Tanggal Mulai *</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="bg-white border-slate-300 text-slate-900"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate" className="text-slate-900 font-medium">Tanggal Berakhir *</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="bg-white border-slate-300 text-slate-900"
                  />
                </div>
              </div>

              {/* Upload Naskah */}
              <div className="space-y-2">
                <Label className="text-slate-900 font-medium">File Naskah Final</Label>
                {fileNaskah ? (
                  <div className="flex items-center gap-2 p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                    <FileText className="h-5 w-5 text-emerald-600" />
                    <span className="text-sm text-emerald-700 flex-1 truncate">{fileNaskah.name}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => setFileNaskah(null)}
                      className="h-6 w-6"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="relative">
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={handleFileUpload}
                      disabled={isUploading}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <div className="flex items-center justify-center gap-2 p-4 border-2 border-dashed border-slate-300 rounded-lg hover:border-[#e10000] transition-colors">
                      <Upload className="h-5 w-5 text-slate-400" />
                      <span className="text-sm text-slate-500">
                        {isUploading ? "Mengupload..." : "Klik untuk upload file naskah (PDF, DOC)"}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Submit */}
          <div className="flex justify-end gap-3 mt-6">
            <Link href="/dashboard/proposals">
              <Button type="button" variant="outline">Batal</Button>
            </Link>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-[#e10000] hover:bg-[#c00] text-white"
            >
              <Save className="h-4 w-4 mr-2" />
              {isSubmitting ? "Menyimpan..." : "Simpan Data Migrasi"}
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  )
}
