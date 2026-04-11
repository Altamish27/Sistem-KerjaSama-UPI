"use client"

import type React from "react"
import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { ProtectedRoute } from "@/components/protected-route"
import { DashboardLayout } from "@/components/dashboard-layout"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Send, Upload, X, CheckCircle2, Clock, XCircle, ArrowRight, Building2, Inbox, Eye, Handshake, Plus } from "lucide-react"
import Link from "next/link"

// ============================================
// Types
// ============================================

interface UnitKerja {
  id: string
  nama_unit: string
  jenis_unit: string
}

interface Pengajuan {
  id: string
  nama_instansi: string
  email_pic: string
  nama_pic: string | null
  telepon_pic: string | null
  judul_tawaran: string
  deskripsi_singkat: string | null
  file_legalitas: string | null
  file_profil_mitra: string | null
  status_pengajuan: 'pending' | 'ditolak' | 'diteruskan' | 'diterima_unit'
  catatan_dkui: string | null
  unit_terkait_id: string | null
  reviewed_by: string | null
  reviewed_at: string | null
  unit_reviewed_by: string | null
  unit_reviewed_at: string | null
  created_at: string
  unit_kerja: UnitKerja | null
}

// ============================================
// Main Page
// ============================================

export default function PenjajakanPage() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <PenjajakanContent />
      </DashboardLayout>
    </ProtectedRoute>
  )
}

function PenjajakanContent() {
  const { user } = useAuth()

  if (!user) return null

  switch (user.role) {
    case "mitra":
      return <MitraPenjajakanView />
    case "dkui":
      return <DKUIPenjajakanView />
    case "pimpinan_unit":
      return <PimpinanUnitPenjajakanView />
    default:
      return (
        <div className="p-8 text-center">
          <p className="text-slate-600">Halaman ini tidak tersedia untuk role Anda.</p>
        </div>
      )
  }
}

// ============================================
// STATUS helpers
// ============================================

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  pending: { label: "Menunggu Review", color: "bg-amber-50 text-amber-700 border-amber-200", icon: <Clock className="w-3 h-3" /> },
  diteruskan: { label: "Diteruskan ke Unit", color: "bg-blue-50 text-blue-700 border-blue-200", icon: <ArrowRight className="w-3 h-3" /> },
  diterima_unit: { label: "Diterima Unit", color: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: <CheckCircle2 className="w-3 h-3" /> },
  ditolak: { label: "Ditolak", color: "bg-red-50 text-red-700 border-red-200", icon: <XCircle className="w-3 h-3" /> },
}

function StatusBadge({ status }: { status: string }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.pending
  return (
    <Badge className={`${config.color} gap-1`}>
      {config.icon}
      {config.label}
    </Badge>
  )
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

// ============================================
// MITRA VIEW — Form + List penjajakan saya
// ============================================

function MitraPenjajakanView() {
  const { user } = useAuth()
  const router = useRouter()
  const [showForm, setShowForm] = useState(false)
  const [pengajuanList, setPengajuanList] = useState<Pengajuan[]>([])
  const [loading, setLoading] = useState(true)
  const [units, setUnits] = useState<UnitKerja[]>([])

  // Form state
  const [judulTawaran, setJudulTawaran] = useState("")
  const [deskripsiSingkat, setDeskripsiSingkat] = useState("")
  const [selectedUnitId, setSelectedUnitId] = useState("")
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [uploadedProfilMitra, setUploadedProfilMitra] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const fetchPengajuan = useCallback(async () => {
    if (!user) return
    try {
      const res = await fetch(`/api/public-proposal?email=${encodeURIComponent(user.email)}`)
      if (res.ok) {
        const data = await res.json()
        setPengajuanList(data)
      }
    } catch (err) {
      console.error("Error fetching pengajuan:", err)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    fetchPengajuan()
    // Fetch unit kerja for dropdown
    fetch("/api/units")
      .then(r => r.json())
      .then(data => setUnits(data))
      .catch(err => console.error("Error fetching units:", err))
  }, [fetchPengajuan])

  if (!user || user.role !== "mitra") return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!judulTawaran.trim()) {
      setError("Judul tawaran kerjasama wajib diisi")
      return
    }
    if (!selectedUnitId) {
      setError("Unit terkait wajib dipilih")
      return
    }

    setIsSubmitting(true)

    try {
      let fileLegalitasUrl: string | null = null
      let fileProfilMitraUrl: string | null = null

      if (uploadedFile) {
        const fd = new FormData()
        fd.append("file", uploadedFile)
        const res = await fetch("/api/upload", { method: "POST", body: fd })
        if (res.ok) {
          const result = await res.json()
          fileLegalitasUrl = result.file?.url || result.url || null
        }
      }

      if (uploadedProfilMitra) {
        const fd = new FormData()
        fd.append("file", uploadedProfilMitra)
        const res = await fetch("/api/upload", { method: "POST", body: fd })
        if (res.ok) {
          const result = await res.json()
          fileProfilMitraUrl = result.file?.url || result.url || null
        }
      }

      const response = await fetch("/api/public-proposal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fromLoggedInMitra: true,
          namaInstansi: user.institution || user.name,
          emailPic: user.email,
          namaPic: user.name,
          judulTawaran,
          deskripsiSingkat: deskripsiSingkat || null,
          fileLegalitas: fileLegalitasUrl,
          fileProfilMitra: fileProfilMitraUrl,
          unitTerkaitId: selectedUnitId,
        }),
      })

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}))
        throw new Error(errData.error || "Gagal mengirim pengajuan")
      }

      setSuccess(true)
      setShowForm(false)
      // Reset form
      setJudulTawaran("")
      setDeskripsiSingkat("")
      setSelectedUnitId("")
      setUploadedFile(null)
      setUploadedProfilMitra(null)
      // Refresh list
      fetchPengajuan()
      setTimeout(() => setSuccess(false), 4000)
    } catch (err: unknown) {
      console.error("Submit error:", err)
      setError(err instanceof Error ? err.message : "Terjadi kesalahan saat mengirim pengajuan.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/dashboard">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Penjajakan Kerjasama</h1>
            <p className="text-slate-600 text-sm">Ajukan dan pantau pengajuan penjajakan Anda</p>
          </div>
        </div>
        {!showForm && (
          <Button onClick={() => setShowForm(true)} className="bg-[#e10000] hover:bg-[#c00] text-white">
            <Plus className="w-4 h-4 mr-2" />
            Ajukan Penjajakan
          </Button>
        )}
      </div>

      {success && (
        <Alert className="border-emerald-200 bg-emerald-50">
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          <AlertDescription className="text-emerald-700">
            Pengajuan penjajakan berhasil dikirim! Tim DKUI akan segera mereview.
          </AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Auto-filled contact info */}
          <Card className="bg-slate-50 border-slate-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Informasi Kontak</CardTitle>
              <CardDescription>Data berikut diambil dari akun Anda</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label className="text-xs text-slate-500">Nama Instansi</Label>
                <p className="text-sm font-medium text-slate-900">{user.institution || user.name}</p>
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-slate-500">Email</Label>
                <p className="text-sm font-medium text-slate-900">{user.email}</p>
              </div>
            </CardContent>
          </Card>

          {/* Detail Pengajuan */}
          <Card>
            <CardHeader>
              <CardTitle>Detail Pengajuan</CardTitle>
              <CardDescription>Informasi tentang kerjasama yang ingin dijajaki</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="unitTerkait" className="text-slate-900 font-medium">
                  Unit Terkait <span className="text-red-500">*</span>
                </Label>
                <Select value={selectedUnitId} onValueChange={setSelectedUnitId}>
                  <SelectTrigger className="bg-white border-slate-300 text-slate-900">
                    <SelectValue placeholder="Pilih unit kerja tujuan" />
                  </SelectTrigger>
                  <SelectContent>
                    {units.map((unit) => (
                      <SelectItem key={unit.id} value={unit.id}>
                        {unit.nama_unit} ({unit.jenis_unit})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-slate-500">Pilih unit kerja UPI yang ingin Anda ajak kerjasama</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="judulTawaran" className="text-slate-900 font-medium">
                  Judul Tawaran Kerjasama <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="judulTawaran"
                  value={judulTawaran}
                  onChange={(e) => setJudulTawaran(e.target.value)}
                  placeholder="Kerjasama Penelitian Teknologi Pendidikan"
                  className="bg-white border-slate-300 text-slate-900"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="deskripsiSingkat" className="text-slate-900 font-medium">
                  Deskripsi Singkat
                </Label>
                <Textarea
                  id="deskripsiSingkat"
                  value={deskripsiSingkat}
                  onChange={(e) => setDeskripsiSingkat(e.target.value)}
                  placeholder="Jelaskan secara singkat tujuan penjajakan kerjasama ini..."
                  rows={4}
                  className="bg-white border-slate-300 text-slate-900"
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
              <FileUploadField label="Dokumen Legalitas Instansi" file={uploadedFile} onFileChange={setUploadedFile} />
              <FileUploadField label="Profil Mitra / Company Profile" file={uploadedProfilMitra} onFileChange={setUploadedProfilMitra} />
            </CardContent>
          </Card>

          <div className="flex gap-3 justify-end">
            <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Batal</Button>
            <Button type="submit" disabled={isSubmitting} className="bg-[#e10000] hover:bg-[#c00] text-white">
              {isSubmitting ? "Mengirim..." : <><Send className="w-4 h-4 mr-2" />Kirim Pengajuan</>}
            </Button>
          </div>
        </form>
      )}

      {/* Pengajuan List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Handshake className="w-5 h-5 text-[#e10000]" />
            Pengajuan Penjajakan Saya
          </CardTitle>
          <CardDescription>Riwayat dan status pengajuan penjajakan Anda</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-slate-500">Memuat data...</div>
          ) : pengajuanList.length === 0 ? (
            <div className="text-center py-12">
              <Inbox className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">Belum ada pengajuan penjajakan</p>
              {!showForm && (
                <Button onClick={() => setShowForm(true)} className="mt-4 bg-[#e10000] hover:bg-[#c00] text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  Ajukan Penjajakan
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {pengajuanList.map((p) => (
                <PengajuanCard key={p.id} pengajuan={p} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// ============================================
// DKUI VIEW — Inbox all pengajuan
// ============================================

function DKUIPenjajakanView() {
  const { user } = useAuth()
  const [pengajuanList, setPengajuanList] = useState<Pengajuan[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>("all")
  const [reviewDialog, setReviewDialog] = useState<Pengajuan | null>(null)
  const [reviewAction, setReviewAction] = useState<'diteruskan' | 'ditolak'>('diteruskan')
  const [catatan, setCatatan] = useState("")
  const [isReviewing, setIsReviewing] = useState(false)

  const fetchPengajuan = useCallback(async () => {
    try {
      const url = filter === "all" ? "/api/public-proposal" : `/api/public-proposal?status=${filter}`
      const res = await fetch(url)
      if (res.ok) {
        const data = await res.json()
        setPengajuanList(data)
      }
    } catch (err) {
      console.error("Error fetching pengajuan:", err)
    } finally {
      setLoading(false)
    }
  }, [filter])

  useEffect(() => {
    setLoading(true)
    fetchPengajuan()
  }, [fetchPengajuan])

  const handleReview = async () => {
    if (!reviewDialog || !user) return
    setIsReviewing(true)

    try {
      const res = await fetch("/api/public-proposal", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pengajuanId: reviewDialog.id,
          statusPengajuan: reviewAction,
          catatanDkui: catatan || null,
          reviewedBy: user.id,
        }),
      })

      if (!res.ok) throw new Error("Gagal mereview pengajuan")

      setReviewDialog(null)
      setCatatan("")
      fetchPengajuan()
    } catch (err) {
      console.error("Review error:", err)
    } finally {
      setIsReviewing(false)
    }
  }

  const pendingCount = pengajuanList.filter(p => p.status_pengajuan === 'pending').length

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
            <Inbox className="w-7 h-7 text-[#e10000]" />
            Inbox Penjajakan
          </h1>
          <p className="text-slate-600 text-sm mt-1">Review pengajuan penjajakan dari mitra</p>
        </div>
        {pendingCount > 0 && (
          <Badge className="bg-amber-100 text-amber-800 border-amber-300 text-sm px-3 py-1">
            {pendingCount} menunggu review
          </Badge>
        )}
      </div>

      {/* Filter */}
      <div className="flex gap-2 flex-wrap">
        {[
          { value: "all", label: "Semua" },
          { value: "pending", label: "Pending" },
          { value: "diteruskan", label: "Diteruskan" },
          { value: "diterima_unit", label: "Diterima Unit" },
          { value: "ditolak", label: "Ditolak" },
        ].map(f => (
          <Button
            key={f.value}
            variant={filter === f.value ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter(f.value)}
            className={filter === f.value ? "bg-[#e10000] hover:bg-[#c00] text-white" : ""}
          >
            {f.label}
          </Button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div className="text-center py-12 text-slate-500">Memuat data...</div>
      ) : pengajuanList.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Inbox className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500">Tidak ada pengajuan penjajakan{filter !== "all" ? ` dengan status "${filter}"` : ""}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {pengajuanList.map((p) => (
            <Card key={p.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <StatusBadge status={p.status_pengajuan} />
                      {p.unit_kerja && (
                        <Badge variant="outline" className="gap-1">
                          <Building2 className="w-3 h-3" />
                          {p.unit_kerja.nama_unit}
                        </Badge>
                      )}
                    </div>
                    <h3 className="font-semibold text-slate-900 text-lg">{p.judul_tawaran}</h3>
                    <p className="text-sm text-slate-600">
                      {p.nama_instansi} &bull; {p.email_pic}
                      {p.nama_pic && ` • PIC: ${p.nama_pic}`}
                    </p>
                    {p.deskripsi_singkat && (
                      <p className="text-sm text-slate-500 line-clamp-2">{p.deskripsi_singkat}</p>
                    )}
                    <p className="text-xs text-slate-400">Diajukan {formatDate(p.created_at)}</p>
                    {p.catatan_dkui && (
                      <p className="text-xs text-slate-500 bg-slate-50 rounded p-2 mt-1">
                        <span className="font-medium">Catatan:</span> {p.catatan_dkui}
                      </p>
                    )}
                  </div>
                  {p.status_pengajuan === 'pending' && (
                    <div className="flex gap-2 shrink-0">
                      <Button
                        size="sm"
                        onClick={() => { setReviewDialog(p); setReviewAction('diteruskan'); setCatatan("") }}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        <ArrowRight className="w-4 h-4 mr-1" />
                        Teruskan
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => { setReviewDialog(p); setReviewAction('ditolak'); setCatatan("") }}
                        className="border-red-300 text-red-600 hover:bg-red-50"
                      >
                        <XCircle className="w-4 h-4 mr-1" />
                        Tolak
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Review Dialog */}
      <Dialog open={!!reviewDialog} onOpenChange={(open) => { if (!open) setReviewDialog(null) }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {reviewAction === 'diteruskan' ? 'Teruskan ke Unit' : 'Tolak Pengajuan'}
            </DialogTitle>
            <DialogDescription>
              {reviewAction === 'diteruskan'
                ? `Pengajuan "${reviewDialog?.judul_tawaran}" akan diteruskan ke ${reviewDialog?.unit_kerja?.nama_unit || 'unit terkait'} untuk ditinjau oleh pimpinan unit.`
                : `Pengajuan "${reviewDialog?.judul_tawaran}" dari ${reviewDialog?.nama_instansi} akan ditolak.`
              }
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <Label>Catatan (opsional)</Label>
            <Textarea
              placeholder={reviewAction === 'diteruskan' ? "Catatan untuk pimpinan unit..." : "Alasan penolakan..."}
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReviewDialog(null)}>Batal</Button>
            <Button
              onClick={handleReview}
              disabled={isReviewing}
              className={reviewAction === 'diteruskan' ? "bg-blue-600 hover:bg-blue-700 text-white" : "bg-red-600 hover:bg-red-700 text-white"}
            >
              {isReviewing ? "Memproses..." : reviewAction === 'diteruskan' ? "Teruskan" : "Tolak"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// ============================================
// PIMPINAN UNIT VIEW — Review penjajakan yang diteruskan ke unit
// ============================================

function PimpinanUnitPenjajakanView() {
  const { user } = useAuth()
  const [pengajuanList, setPengajuanList] = useState<Pengajuan[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>("diteruskan")
  const [reviewDialog, setReviewDialog] = useState<Pengajuan | null>(null)
  const [reviewAction, setReviewAction] = useState<'diterima_unit' | 'ditolak'>('diterima_unit')
  const [catatan, setCatatan] = useState("")
  const [isReviewing, setIsReviewing] = useState(false)

  const fetchPengajuan = useCallback(async () => {
    if (!user?.unitId) return
    try {
      let url = `/api/public-proposal?unitId=${user.unitId}`
      if (filter !== "all") url += `&status=${filter}`
      const res = await fetch(url)
      if (res.ok) {
        const data = await res.json()
        setPengajuanList(data)
      }
    } catch (err) {
      console.error("Error fetching pengajuan:", err)
    } finally {
      setLoading(false)
    }
  }, [user?.unitId, filter])

  useEffect(() => {
    setLoading(true)
    fetchPengajuan()
  }, [fetchPengajuan])

  const handleReview = async () => {
    if (!reviewDialog || !user) return
    setIsReviewing(true)

    try {
      const res = await fetch("/api/public-proposal", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pengajuanId: reviewDialog.id,
          statusPengajuan: reviewAction,
          catatanDkui: catatan || null,
          unitReviewedBy: user.id,
        }),
      })

      if (!res.ok) throw new Error("Gagal mereview pengajuan")

      setReviewDialog(null)
      setCatatan("")
      fetchPengajuan()
    } catch (err) {
      console.error("Review error:", err)
    } finally {
      setIsReviewing(false)
    }
  }

  const actionNeededCount = pengajuanList.filter(p => p.status_pengajuan === 'diteruskan').length

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
            <Eye className="w-7 h-7 text-[#e10000]" />
            Penjajakan Unit
          </h1>
          <p className="text-slate-600 text-sm mt-1">
            Pengajuan penjajakan yang ditujukan ke {user?.unitName || 'unit Anda'}
          </p>
        </div>
        {actionNeededCount > 0 && (
          <Badge className="bg-amber-100 text-amber-800 border-amber-300 text-sm px-3 py-1">
            {actionNeededCount} perlu ditinjau
          </Badge>
        )}
      </div>

      {/* Filter */}
      <div className="flex gap-2 flex-wrap">
        {[
          { value: "diteruskan", label: "Perlu Ditinjau" },
          { value: "all", label: "Semua" },
          { value: "diterima_unit", label: "Diterima" },
          { value: "ditolak", label: "Ditolak" },
        ].map(f => (
          <Button
            key={f.value}
            variant={filter === f.value ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter(f.value)}
            className={filter === f.value ? "bg-[#e10000] hover:bg-[#c00] text-white" : ""}
          >
            {f.label}
          </Button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div className="text-center py-12 text-slate-500">Memuat data...</div>
      ) : pengajuanList.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Inbox className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500">
              {filter === "diteruskan"
                ? "Tidak ada pengajuan yang perlu ditinjau"
                : "Tidak ada pengajuan penjajakan"
              }
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {pengajuanList.map((p) => (
            <Card key={p.id} className={`transition-shadow ${p.status_pengajuan === 'diteruskan' ? 'border-amber-200 hover:shadow-md' : 'hover:shadow-sm'}`}>
              <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <StatusBadge status={p.status_pengajuan} />
                    </div>
                    <h3 className="font-semibold text-slate-900 text-lg">{p.judul_tawaran}</h3>
                    <p className="text-sm text-slate-600">
                      <Building2 className="w-3.5 h-3.5 inline mr-1" />
                      {p.nama_instansi} &bull; {p.email_pic}
                      {p.nama_pic && ` • PIC: ${p.nama_pic}`}
                    </p>
                    {p.deskripsi_singkat && (
                      <p className="text-sm text-slate-500 line-clamp-2">{p.deskripsi_singkat}</p>
                    )}
                    <p className="text-xs text-slate-400">Diajukan {formatDate(p.created_at)}</p>
                    {p.catatan_dkui && (
                      <p className="text-xs text-slate-500 bg-slate-50 rounded p-2 mt-1">
                        <span className="font-medium">Catatan DKUI:</span> {p.catatan_dkui}
                      </p>
                    )}
                    {/* Document links */}
                    <div className="flex gap-2 flex-wrap">
                      {p.file_legalitas && (
                        <a href={p.file_legalitas} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline">Dok. Legalitas</a>
                      )}
                      {p.file_profil_mitra && (
                        <a href={p.file_profil_mitra} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline">Profil Mitra</a>
                      )}
                    </div>
                  </div>
                  {p.status_pengajuan === 'diteruskan' && (
                    <div className="flex gap-2 shrink-0">
                      <Button
                        size="sm"
                        onClick={() => { setReviewDialog(p); setReviewAction('diterima_unit'); setCatatan("") }}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white"
                      >
                        <CheckCircle2 className="w-4 h-4 mr-1" />
                        Terima
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => { setReviewDialog(p); setReviewAction('ditolak'); setCatatan("") }}
                        className="border-red-300 text-red-600 hover:bg-red-50"
                      >
                        <XCircle className="w-4 h-4 mr-1" />
                        Tolak
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Review Dialog */}
      <Dialog open={!!reviewDialog} onOpenChange={(open) => { if (!open) setReviewDialog(null) }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {reviewAction === 'diterima_unit' ? 'Terima Pengajuan Penjajakan' : 'Tolak Pengajuan'}
            </DialogTitle>
            <DialogDescription>
              {reviewAction === 'diterima_unit'
                ? `Pengajuan "${reviewDialog?.judul_tawaran}" dari ${reviewDialog?.nama_instansi} akan diterima. Email berisi informasi kontak unit akan dikirim ke mitra.`
                : `Pengajuan "${reviewDialog?.judul_tawaran}" dari ${reviewDialog?.nama_instansi} akan ditolak.`
              }
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <Label>{reviewAction === 'diterima_unit' ? 'Catatan untuk mitra (opsional)' : 'Alasan penolakan'}</Label>
            <Textarea
              placeholder={reviewAction === 'diterima_unit' ? "Catatan tambahan..." : "Jelaskan alasan penolakan..."}
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReviewDialog(null)}>Batal</Button>
            <Button
              onClick={handleReview}
              disabled={isReviewing}
              className={reviewAction === 'diterima_unit' ? "bg-emerald-600 hover:bg-emerald-700 text-white" : "bg-red-600 hover:bg-red-700 text-white"}
            >
              {isReviewing ? "Memproses..." : reviewAction === 'diterima_unit' ? "Terima & Kirim Email" : "Tolak"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// ============================================
// Shared Components
// ============================================

function PengajuanCard({ pengajuan: p }: { pengajuan: Pengajuan }) {
  return (
    <div className="p-4 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors bg-white shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex-1 space-y-1.5">
          <div className="flex items-center gap-2 flex-wrap">
            <StatusBadge status={p.status_pengajuan} />
            {p.unit_kerja && (
              <Badge variant="outline" className="text-xs gap-1">
                <Building2 className="w-3 h-3" />
                {p.unit_kerja.nama_unit}
              </Badge>
            )}
          </div>
          <h4 className="font-semibold text-slate-900">{p.judul_tawaran}</h4>
          {p.deskripsi_singkat && (
            <p className="text-sm text-slate-500 line-clamp-1">{p.deskripsi_singkat}</p>
          )}
          <p className="text-xs text-slate-400">{formatDate(p.created_at)}</p>
          {p.catatan_dkui && p.status_pengajuan === 'ditolak' && (
            <p className="text-xs text-red-600 mt-1">Catatan: {p.catatan_dkui}</p>
          )}
        </div>
      </div>
    </div>
  )
}

function FileUploadField({ label, file, onFileChange }: { label: string; file: File | null; onFileChange: (f: File | null) => void }) {
  return (
    <div className="space-y-3">
      <Label className="text-slate-900 font-medium">{label}</Label>
      {file ? (
        <div className="flex items-center justify-between bg-blue-50 p-3 rounded-lg border border-blue-200">
          <span className="text-sm text-blue-700 truncate flex-1">{file.name}</span>
          <Button type="button" variant="ghost" size="sm" onClick={() => onFileChange(null)}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      ) : (
        <div className="relative">
          <input
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={(e) => {
              if (e.target.files?.[0]) onFileChange(e.target.files[0])
            }}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <div className="flex items-center justify-center gap-2 p-4 border-2 border-dashed border-slate-300 rounded-lg hover:border-[#e10000] transition-colors">
            <Upload className="h-5 w-5 text-slate-400" />
            <span className="text-sm text-slate-500">Klik untuk upload (PDF, DOC)</span>
          </div>
        </div>
      )}
    </div>
  )
}
