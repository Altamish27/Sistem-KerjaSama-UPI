"use client"

import { useState, useEffect } from "react"
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

interface UnitKerja {
  id: string
  nama_unit: string
  jenis_unit: string
}

export default function SubmitProposalPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [uploadedProfilMitra, setUploadedProfilMitra] = useState<File | null>(null)
  const [units, setUnits] = useState<UnitKerja[]>([])
  const [selectedUnitId, setSelectedUnitId] = useState("")

  useEffect(() => {
    fetch("/api/units")
      .then(res => res.json())
      .then(data => setUnits(data.units || []))
      .catch(err => console.error("Failed to load units:", err))
  }, [])

  const [formData, setFormData] = useState({
    namaInstansi: "",
    emailPic: "",
    namaPic: "",
    teleponPic: "",
    judulTawaran: "",
    deskripsiSingkat: "",
  })

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsSubmitting(true)

    // Validation
    if (!formData.namaInstansi || !formData.emailPic || !formData.judulTawaran || !selectedUnitId) {
      setError("Nama instansi, email PIC, judul tawaran, dan unit tujuan wajib diisi")
      setIsSubmitting(false)
      return
    }

    try {
      // Upload files first if present
      let fileLegalitasUrl: string | null = null
      let fileProfilMitraUrl: string | null = null

      if (uploadedFile) {
        const fileFormData = new FormData()
        fileFormData.append("file", uploadedFile)
        const uploadRes = await fetch("/api/upload", { method: "POST", body: fileFormData })
        if (uploadRes.ok) {
          const uploadResult = await uploadRes.json()
          fileLegalitasUrl = uploadResult.file?.url || null
        }
      }

      if (uploadedProfilMitra) {
        const fileFormData = new FormData()
        fileFormData.append("file", uploadedProfilMitra)
        const uploadRes = await fetch("/api/upload", { method: "POST", body: fileFormData })
        if (uploadRes.ok) {
          const uploadResult = await uploadRes.json()
          fileProfilMitraUrl = uploadResult.file?.url || null
        }
      }

      // Submit pengajuan penjajakan
      const response = await fetch("/api/public-proposal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          namaInstansi: formData.namaInstansi,
          emailPic: formData.emailPic,
          namaPic: formData.namaPic,
          teleponPic: formData.teleponPic,
          judulTawaran: formData.judulTawaran,
          deskripsiSingkat: formData.deskripsiSingkat,
          unitTerkaitId: selectedUnitId,
          fileLegalitas: fileLegalitasUrl,
          fileProfilMitra: fileProfilMitraUrl,
        }),
      })

      if (!response.ok) {
        throw new Error("Gagal mengirim pengajuan")
      }

      setSuccess(true)
      
      setTimeout(() => {
        router.push("/")
      }, 3000)

    } catch (err) {
      console.error("Submit error:", err)
      setError("Terjadi kesalahan saat mengirim pengajuan. Silakan coba lagi.")
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
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Pengajuan Berhasil Dikirim!</h2>
            <p className="text-gray-600 mb-6">
              Terima kasih telah mengajukan penjajakan kerjasama. Kami telah mengirimkan konfirmasi ke email Anda.
              <br/><br/>
              Tim DKUI akan segera mereview pengajuan Anda. Jika pengajuan diterima, kami akan menghubungi Anda untuk langkah selanjutnya.
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
          <h1 className="text-3xl font-bold text-gray-900">Ajukan Penjajakan Kerjasama</h1>
          <p className="text-gray-600 mt-2">
            Isi form di bawah untuk mengajukan penjajakan kerjasama dengan Universitas Pendidikan Indonesia
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
                <Label htmlFor="namaInstansi">
                  Nama Institusi/Perusahaan <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="namaInstansi"
                  value={formData.namaInstansi}
                  onChange={(e) => handleChange("namaInstansi", e.target.value)}
                  placeholder="PT. Contoh Perusahaan"
                  required
                />
              </div>

              <div>
                <Label htmlFor="namaPic">
                  Nama Penanggung Jawab (PIC)
                </Label>
                <Input
                  id="namaPic"
                  value={formData.namaPic}
                  onChange={(e) => handleChange("namaPic", e.target.value)}
                  placeholder="Nama lengkap"
                />
              </div>

              <div>
                <Label htmlFor="emailPic">
                  Email PIC <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="emailPic"
                  type="email"
                  value={formData.emailPic}
                  onChange={(e) => handleChange("emailPic", e.target.value)}
                  placeholder="email@example.com"
                  required
                />
                <p className="text-sm text-gray-500 mt-1">
                  Email ini akan digunakan untuk mengirim konfirmasi dan komunikasi selanjutnya
                </p>
              </div>

              <div>
                <Label htmlFor="teleponPic">
                  No. Telepon PIC
                </Label>
                <Input
                  id="teleponPic"
                  type="tel"
                  value={formData.teleponPic}
                  onChange={(e) => handleChange("teleponPic", e.target.value)}
                  placeholder="08123456789"
                />
              </div>
            </CardContent>
          </Card>

          {/* Unit Tujuan */}
          <Card>
            <CardHeader>
              <CardTitle>Unit Tujuan</CardTitle>
              <CardDescription>Pilih unit di UPI yang ingin dijajaki kerjasamanya</CardDescription>
            </CardHeader>
            <CardContent>
              <div>
                <Label>Unit Kerja Tujuan <span className="text-red-500">*</span></Label>
                <Select value={selectedUnitId} onValueChange={setSelectedUnitId}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Pilih unit tujuan..." />
                  </SelectTrigger>
                  <SelectContent>
                    {units.map(unit => (
                      <SelectItem key={unit.id} value={unit.id}>
                        {unit.nama_unit} ({unit.jenis_unit})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-sm text-gray-500 mt-1">
                  Pilih satu unit di UPI yang paling relevan dengan rencana kerjasama Anda
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Detail Pengajuan */}
          <Card>
            <CardHeader>
              <CardTitle>Detail Pengajuan</CardTitle>
              <CardDescription>Informasi dasar tentang kerjasama yang ingin dijajaki</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="judulTawaran">
                  Judul Tawaran Kerjasama <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="judulTawaran"
                  value={formData.judulTawaran}
                  onChange={(e) => handleChange("judulTawaran", e.target.value)}
                  placeholder="Kerjasama Penelitian Teknologi Pendidikan"
                  required
                />
              </div>

              <div>
                <Label htmlFor="deskripsiSingkat">
                  Deskripsi Singkat
                </Label>
                <Textarea
                  id="deskripsiSingkat"
                  value={formData.deskripsiSingkat}
                  onChange={(e) => handleChange("deskripsiSingkat", e.target.value)}
                  placeholder="Jelaskan secara singkat tujuan dan hal yang ingin dicapai dari penjajakan kerjasama ini..."
                  rows={5}
                />
              </div>
            </CardContent>
          </Card>

          {/* Document Uploads */}
          <Card>
            <CardHeader>
              <CardTitle>Dokumen Pendukung</CardTitle>
              <CardDescription>Upload dokumen legalitas dan profil mitra (opsional)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* File Legalitas */}
              <div className="space-y-3">
                <Label>Dokumen Legalitas Instansi</Label>
                <Input
                  id="file-legalitas"
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) setUploadedFile(e.target.files[0])
                  }}
                  className="hidden"
                />
                <Label
                  htmlFor="file-legalitas"
                  className="flex items-center justify-center w-full h-24 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-[#003d7a] hover:bg-blue-50 transition"
                >
                  <div className="text-center">
                    <Upload className="w-6 h-6 mx-auto mb-1 text-gray-400" />
                    <p className="text-sm text-gray-600">
                      {uploadedFile ? uploadedFile.name : "Klik untuk upload dokumen legalitas"}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">PDF, DOC, DOCX (Max 10MB)</p>
                  </div>
                </Label>
                {uploadedFile && (
                  <div className="flex items-center justify-between bg-blue-50 p-3 rounded">
                    <span className="text-sm">{uploadedFile.name}</span>
                    <Button type="button" variant="ghost" size="sm" onClick={() => setUploadedFile(null)}>
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>

              {/* File Profil Mitra */}
              <div className="space-y-3">
                <Label>Profil Mitra / Company Profile</Label>
                <Input
                  id="file-profil"
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) setUploadedProfilMitra(e.target.files[0])
                  }}
                  className="hidden"
                />
                <Label
                  htmlFor="file-profil"
                  className="flex items-center justify-center w-full h-24 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-[#003d7a] hover:bg-blue-50 transition"
                >
                  <div className="text-center">
                    <Upload className="w-6 h-6 mx-auto mb-1 text-gray-400" />
                    <p className="text-sm text-gray-600">
                      {uploadedProfilMitra ? uploadedProfilMitra.name : "Klik untuk upload profil mitra"}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">PDF, DOC, DOCX (Max 10MB)</p>
                  </div>
                </Label>
                {uploadedProfilMitra && (
                  <div className="flex items-center justify-between bg-blue-50 p-3 rounded">
                    <span className="text-sm">{uploadedProfilMitra.name}</span>
                    <Button type="button" variant="ghost" size="sm" onClick={() => setUploadedProfilMitra(null)}>
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
                  Kirim Pengajuan
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
