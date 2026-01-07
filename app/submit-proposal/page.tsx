"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Send, CheckCircle2, Upload, X } from "lucide-react"
import Link from "next/link"

export default function SubmitProposalPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)

  const [formData, setFormData] = useState({
    // Contact Info
    contactPerson: "",
    contactEmail: "",
    contactPhone: "",
    institution: "",
    
    // Proposal Data (Simplified)
    title: "",
    cooperationType: "",
    objectives: "",
    startDate: "",
    endDate: "",
  })

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadedFile(e.target.files[0])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsSubmitting(true)

    // Validation
    if (!formData.contactEmail || !formData.contactPerson || !formData.institution || !formData.title || !formData.cooperationType) {
      setError("Mohon lengkapi semua field yang wajib diisi")
      setIsSubmitting(false)
      return
    }

    if (!uploadedFile) {
      setError("Dokumen proposal wajib diupload")
      setIsSubmitting(false)
      return
    }

    try {
      // Submit proposal DULU untuk dapat proposalId
      const response = await fetch("/api/public-proposal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error("Gagal mengirim proposal")
      }

      const { proposalId } = await response.json()

      // Upload file SETELAH proposal dibuat (jika ada)
      if (uploadedFile && proposalId) {
        const fileFormData = new FormData()
        fileFormData.append("file", uploadedFile)
        fileFormData.append("proposalId", proposalId)
        fileFormData.append("category", "proposal")

        const uploadResponse = await fetch("/api/upload", {
          method: "POST",
          body: fileFormData,
        })

        if (!uploadResponse.ok) {
          const errorData = await uploadResponse.json()
          console.error("File upload failed:", errorData)
          // Don't fail the whole submission if file upload fails
        }
      }

      setSuccess(true)
      
      // Redirect setelah 3 detik
      setTimeout(() => {
        router.push("/")
      }, 3000)

    } catch (err) {
      console.error("Submit error:", err)
      setError("Terjadi kesalahan saat mengirim proposal. Silakan coba lagi.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-12 pb-12 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Proposal Berhasil Dikirim!</h2>
            <p className="text-gray-600 mb-6">
              Terima kasih telah mengajukan proposal kerjasama. Kami telah mengirimkan konfirmasi ke email Anda.
              <br/><br/>
              Tim DKUI akan segera mereview proposal Anda. Jika proposal disetujui, Anda akan menerima email dengan kredensial login untuk mengakses dashboard.
            </p>
            <Link href="/">
              <Button>Kembali ke Beranda</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-3xl">
        {/* Header */}
        <div className="mb-8">
          <Link href="/">
            <Button variant="outline" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Kembali
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Ajukan Proposal Kerjasama</h1>
          <p className="text-gray-600 mt-2">
            Isi form di bawah untuk mengajukan kerjasama dengan Universitas Pendidikan Indonesia
          </p>
        </div>

        {error && (
          <Alert className="mb-6 bg-red-50 border-red-200">
            <AlertDescription className="text-red-800">{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle>Informasi Kontak</CardTitle>
              <CardDescription>Data institusi dan penanggung jawab proposal</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="institution">
                  Nama Institusi/Perusahaan <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="institution"
                  value={formData.institution}
                  onChange={(e) => handleChange("institution", e.target.value)}
                  placeholder="PT. Contoh Perusahaan"
                  required
                />
              </div>

              <div>
                <Label htmlFor="contactPerson">
                  Nama Penanggung Jawab <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="contactPerson"
                  value={formData.contactPerson}
                  onChange={(e) => handleChange("contactPerson", e.target.value)}
                  placeholder="Nama lengkap"
                  required
                />
              </div>

              <div>
                <Label htmlFor="contactEmail">
                  Email <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="contactEmail"
                  type="email"
                  value={formData.contactEmail}
                  onChange={(e) => handleChange("contactEmail", e.target.value)}
                  placeholder="email@example.com"
                  required
                />
                <p className="text-sm text-gray-500 mt-1">
                  Email ini akan digunakan untuk login setelah proposal disetujui
                </p>
              </div>

              <div>
                <Label htmlFor="contactPhone">
                  No. Telepon <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="contactPhone"
                  type="tel"
                  value={formData.contactPhone}
                  onChange={(e) => handleChange("contactPhone", e.target.value)}
                  placeholder="08123456789"
                  required
                />
              </div>
            </CardContent>
          </Card>

          {/* Proposal Details */}
          <Card>
            <CardHeader>
              <CardTitle>Detail Proposal</CardTitle>
              <CardDescription>Informasi dasar tentang kerjasama yang diajukan</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">
                  Judul Proposal <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleChange("title", e.target.value)}
                  placeholder="Kerjasama Penelitian Teknologi Pendidikan"
                  required
                />
              </div>

              <div>
                <Label htmlFor="cooperationType">
                  Jenis Kerjasama <span className="text-red-500">*</span>
                </Label>
                <Select value={formData.cooperationType} onValueChange={(value) => handleChange("cooperationType", value)} required>
                  <SelectTrigger id="cooperationType">
                    <SelectValue placeholder="Pilih jenis dokumen kerjasama..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MoU">MoU (Memorandum of Understanding)</SelectItem>
                    <SelectItem value="MoA">MoA (Memorandum of Agreement)</SelectItem>
                    <SelectItem value="PKS">PKS (Perjanjian Kerjasama)</SelectItem>
                    <SelectItem value="IA">IA (Implementation Agreement)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="objectives">
                  Tujuan Kerjasama <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="objectives"
                  value={formData.objectives}
                  onChange={(e) => handleChange("objectives", e.target.value)}
                  placeholder="Jelaskan tujuan dan hal yang ingin dicapai dari kerjasama ini..."
                  rows={5}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startDate">
                    Tanggal Mulai <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => handleChange("startDate", e.target.value)}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="endDate">
                    Tanggal Selesai <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => handleChange("endDate", e.target.value)}
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Document Upload */}
          <Card>
            <CardHeader>
              <CardTitle>Dokumen Proposal <span className="text-red-500">*</span></CardTitle>
              <CardDescription>Upload dokumen proposal kerjasama (WAJIB)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Input
                  id="file-upload"
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <Label
                  htmlFor="file-upload"
                  className="flex items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-[#003d7a] hover:bg-blue-50 transition"
                >
                  <div className="text-center">
                    <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm text-gray-600">
                      {uploadedFile ? uploadedFile.name : "Klik untuk upload dokumen"}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">PDF, DOC, DOCX (Max 10MB)</p>
                  </div>
                </Label>
                
                {uploadedFile && (
                  <div className="flex items-center justify-between bg-blue-50 p-3 rounded">
                    <span className="text-sm">{uploadedFile.name}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setUploadedFile(null)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex gap-4">
            <Link href="/" className="flex-1">
              <Button type="button" variant="outline" className="w-full">
                Batal
              </Button>
            </Link>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-[#003d7a] hover:bg-[#002d5a]"
            >
              {isSubmitting ? (
                <>Mengirim...</>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Kirim Proposal
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
