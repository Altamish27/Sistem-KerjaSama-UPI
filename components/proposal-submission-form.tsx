"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { useDataStore } from "@/lib/data-store"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { DocumentUpload } from "@/components/document-upload"
import { FileText, AlertCircle, CheckCircle2, Building2, Mail, FileSignature } from "lucide-react"

const DOCUMENT_TYPES = [
  { value: 'MOU', label: 'MOU - Memorandum of Understanding', description: 'Nota kesepahaman kerja sama' },
  { value: 'MOA', label: 'MOA - Memorandum of Agreement', description: 'Nota kesepakatan kerja sama' },
  { value: 'IA', label: 'IA - Implementation Agreement', description: 'Perjanjian implementasi' },
  { value: 'PKS', label: 'PKS - Perjanjian Kerja Sama', description: 'Perjanjian kerja sama formal' },
] as const

const COOPERATION_TYPES = [
  'Penelitian',
  'Pendidikan',
  'Pengabdian Masyarakat',
  'Magang',
  'Joint Program',
  'Konsultasi',
  'Lainnya',
]

export function ProposalSubmissionForm() {
  const router = useRouter()
  const { user } = useAuth()
  const { createProposal } = useDataStore()

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    partner_name: '',
    partner_email: '',
    cooperation_type: '',
    document_type: '' as 'MOU' | 'MOA' | 'IA' | 'PKS' | '',
  })

  const [documentUrl, setDocumentUrl] = useState<string>('')
  const [aiSummary, setAiSummary] = useState<string>('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string>('')
  const [success, setSuccess] = useState(false)

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setError('')
  }

  const handleDocumentUpload = (url: string, summary: string) => {
    setDocumentUrl(url)
    setAiSummary(summary)
  }

  const validateForm = () => {
    if (!formData.title.trim()) {
      setError('Judul proposal harus diisi')
      return false
    }
    if (!formData.description.trim()) {
      setError('Deskripsi proposal harus diisi')
      return false
    }
    if (!formData.partner_name.trim()) {
      setError('Nama mitra harus diisi')
      return false
    }
    if (!formData.partner_email.trim()) {
      setError('Email mitra harus diisi')
      return false
    }
    if (!formData.cooperation_type) {
      setError('Jenis kerja sama harus dipilih')
      return false
    }
    if (!formData.document_type) {
      setError('Tipe dokumen harus dipilih')
      return false
    }
    if (!documentUrl) {
      setError('Dokumen proposal harus diunggah')
      return false
    }
    return true
  }

  const handleSubmit = async (status: 'draft' | 'submitted') => {
    if (!user) {
      setError('Anda harus login terlebih dahulu')
      return
    }

    if (status === 'submitted' && !validateForm()) {
      return
    }

    setIsSubmitting(true)
    setError('')

    try {
      const proposal = await createProposal({
        title: formData.title,
        description: formData.description,
        partner_name: formData.partner_name,
        partner_email: formData.partner_email,
        cooperation_type: formData.cooperation_type,
        document_type: formData.document_type as 'MOU' | 'MOA' | 'IA' | 'PKS',
        document_url: documentUrl,
        ai_summary: aiSummary || null, // AI summary akan di-generate otomatis oleh sistem
        submitted_by: user.id,
        status: status,
        current_stage: status === 'submitted' ? 'ai_summary' : 'submission',
      })

      if (proposal) {
        // Jika status submitted, trigger AI summary generation
        if (status === 'submitted' && proposal.id) {
          // AI summary akan di-generate oleh sistem secara otomatis
          // melalui workflow transition
          try {
            const { generateAISummary } = await import('@/lib/ai-utils')
            const summary = await generateAISummary(formData.description, {
              document_type: formData.document_type,
              partner_name: formData.partner_name,
              cooperation_type: formData.cooperation_type,
            })
            
            // Update proposal dengan AI summary
            await fetch(`/api/proposals/${proposal.id}`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ ai_summary: summary })
            })
          } catch (aiError) {
            console.warn('AI summary generation failed, will continue without it', aiError)
          }
        }
        
        setSuccess(true)
        setTimeout(() => {
          router.push(`/dashboard/proposals/${proposal.id}`)
        }, 2000)
      } else {
        setError('Gagal menyimpan proposal')
      }
    } catch (err: any) {
      console.error('Submit error:', err)
      setError(err.message || 'Terjadi kesalahan saat menyimpan proposal')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <FileSignature className="h-5 w-5" />
            Informasi Proposal
          </CardTitle>
          <CardDescription>
            Isi data proposal dan pilih tipe dokumen
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          {/* Judul Proposal */}
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-medium">
              Judul Proposal *
            </Label>
            <Input
              id="title"
              placeholder="Contoh: Kerja Sama Penelitian AI untuk Smart City"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              className="w-full"
            />
          </div>

          {/* Tipe Dokumen & Jenis Kerja Sama - Grid Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Tipe Dokumen */}
            <div className="space-y-2">
              <Label htmlFor="document_type" className="text-sm font-medium">
                Tipe Dokumen *
              </Label>
              <Select
                value={formData.document_type}
                onValueChange={(value) => handleInputChange('document_type', value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Pilih tipe dokumen" />
                </SelectTrigger>
                <SelectContent>
                  {DOCUMENT_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.value}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formData.document_type && (
                <div className="text-xs text-muted-foreground p-2 bg-muted/50 rounded">
                  <strong>{DOCUMENT_TYPES.find(t => t.value === formData.document_type)?.label}</strong>
                  <br />
                  {DOCUMENT_TYPES.find(t => t.value === formData.document_type)?.description}
                </div>
              )}
            </div>

            {/* Jenis Kerja Sama */}
            <div className="space-y-2">
              <Label htmlFor="cooperation_type" className="text-sm font-medium">
                Jenis Kerja Sama *
              </Label>
              <Select
                value={formData.cooperation_type}
                onValueChange={(value) => handleInputChange('cooperation_type', value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Pilih jenis kerja sama" />
                </SelectTrigger>
                <SelectContent>
                  {COOPERATION_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Deskripsi */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium">
              Deskripsi Proposal *
            </Label>
            <Textarea
              id="description"
              placeholder="Jelaskan secara detail tentang proposal kerja sama, tujuan, ruang lingkup, dan manfaat yang diharapkan..."
              rows={6}
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              className="w-full resize-none"
            />
            <p className="text-xs text-muted-foreground">
              Minimal 50 karakter untuk deskripsi yang jelas dan informatif
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Building2 className="h-5 w-5" />
            Informasi Mitra
          </CardTitle>
          <CardDescription>
            Data organisasi atau institusi mitra kerja sama
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          {/* Nama Mitra & Email - Grid Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Nama Mitra */}
            <div className="space-y-2">
              <Label htmlFor="partner_name" className="text-sm font-medium">
                Nama Organisasi/Institusi *
              </Label>
              <Input
                id="partner_name"
                placeholder="Contoh: PT. Tech Indonesia"
                value={formData.partner_name}
                onChange={(e) => handleInputChange('partner_name', e.target.value)}
                className="w-full"
              />
            </div>

            {/* Email Mitra */}
            <div className="space-y-2">
              <Label htmlFor="partner_email" className="text-sm font-medium">
                Email Kontak *
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="partner_email"
                  type="email"
                  placeholder="partnerships@example.com"
                  className="pl-9 w-full"
                  value={formData.partner_email}
                  onChange={(e) => handleInputChange('partner_email', e.target.value)}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <DocumentUpload
        proposalId="new"
        onUploadSuccess={handleDocumentUpload}
        onUploadError={(error) => setError(error)}
      />

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
            Proposal berhasil disimpan! Mengalihkan ke halaman detail...
          </AlertDescription>
        </Alert>
      )}

      <div className="flex flex-col-reverse sm:flex-row gap-3">
        <Button
          variant="outline"
          onClick={() => handleSubmit('draft')}
          disabled={isSubmitting || !formData.title}
          className="flex-1"
        >
          Simpan sebagai Draft
        </Button>
        <Button
          onClick={() => handleSubmit('submitted')}
          disabled={isSubmitting || success}
          className="flex-1"
        >
          {isSubmitting ? 'Mengirim...' : 'Kirim Proposal'}
        </Button>
      </div>

      <p className="text-xs text-muted-foreground text-center">
        Field bertanda (*) wajib diisi. Draft dapat disimpan dan dilanjutkan kemudian.
      </p>
    </div>
  )
}
