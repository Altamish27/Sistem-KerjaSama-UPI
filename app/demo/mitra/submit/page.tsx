'use client';

import React, { useState, Suspense } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Upload, 
  FileText, 
  CheckCircle,
  Lightbulb,
  ArrowRight,
  Paperclip
} from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';

function MitraSubmitContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const scenario = searchParams.get('scenario') || 'approve';
  
  const [showTutorial, setShowTutorial] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    title: scenario === 'approve' 
      ? 'Program Magang Mahasiswa di Google Indonesia' 
      : 'Penelitian AI untuk Kesehatan Masyarakat',
    category: 'Magang',
    faculty: 'Fakultas Ilmu Komputer',
    duration: '2',
    description: scenario === 'approve'
      ? 'Google Indonesia bermaksud membuka kesempatan magang untuk 20 mahasiswa terbaik dari Fakultas Ilmu Komputer...'
      : 'Proposal penelitian kolaboratif tentang penggunaan AI dalam prediksi penyakit...',
    file: null as File | null
  });

  const handleSubmit = () => {
    setSubmitting(true);
    setTimeout(() => {
      router.push(`/demo/dkui/receive?scenario=${scenario}`);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Tutorial */}
        {showTutorial && (
          <Alert className="border-2 border-blue-500 bg-blue-50 shadow-lg">
            <Lightbulb className="h-5 w-5 text-blue-600" />
            <AlertDescription className="text-blue-900">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <strong className="block mb-2">📍 Step 2/8 - Submit Proposal Kerja Sama</strong>
                  <p className="text-sm mb-2">
                    Isi formulir proposal kerja sama. Sistem sudah mengisi data untuk Anda. 
                    Setelah submit, proposal akan masuk ke <strong>DKUI</strong> untuk diproses.
                  </p>
                  <p className="text-xs text-blue-700">
                    ⏱️ Estimasi: 30 menit | Selanjutnya: DKUI menerima & memproses dengan AI
                  </p>
                </div>
                <Button 
                  onClick={() => setShowTutorial(false)}
                  variant="ghost" 
                  size="sm"
                  className="text-blue-600"
                >
                  Tutup
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-orange-900">Ajukan Proposal Kerja Sama</h1>
            <p className="text-sm text-muted-foreground">Google Inc. Partnership Portal</p>
          </div>
          <Badge className={`${scenario === 'approve' ? 'bg-green-600' : 'bg-red-600'} text-white`}>
            {scenario === 'approve' ? '✅ Skenario: Disetujui' : '❌ Skenario: Ditolak'}
          </Badge>
        </div>

        {/* Form */}
        <Card className="border-2 border-orange-200">
          <CardHeader className="bg-gradient-to-r from-orange-50 to-amber-50">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Formulir Proposal
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Judul Kerja Sama *</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="border-orange-200"
                />
              </div>

              <div className="space-y-2">
                <Label>Kategori Kerja Sama *</Label>
                <Select value={formData.category} onValueChange={(v) => setFormData({...formData, category: v})}>
                  <SelectTrigger className="border-orange-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Magang">Magang</SelectItem>
                    <SelectItem value="Penelitian">Penelitian</SelectItem>
                    <SelectItem value="Pertukaran">Pertukaran Mahasiswa</SelectItem>
                    <SelectItem value="Pengajaran">Pengajaran</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Fakultas Terkait *</Label>
                <Select value={formData.faculty} onValueChange={(v) => setFormData({...formData, faculty: v})}>
                  <SelectTrigger className="border-orange-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Fakultas Ilmu Komputer">Fakultas Ilmu Komputer</SelectItem>
                    <SelectItem value="Fakultas Ekonomi">Fakultas Ekonomi</SelectItem>
                    <SelectItem value="Fakultas Teknik">Fakultas Teknik</SelectItem>
                    <SelectItem value="Fakultas Kedokteran">Fakultas Kedokteran</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Durasi (tahun) *</Label>
                <Input
                  type="number"
                  value={formData.duration}
                  onChange={(e) => setFormData({...formData, duration: e.target.value})}
                  className="border-orange-200"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Deskripsi Proposal *</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                rows={6}
                className="border-orange-200"
              />
              <p className="text-xs text-muted-foreground">
                Jelaskan tujuan, manfaat, dan rencana kerja sama secara detail
              </p>
            </div>

            <div className="space-y-2">
              <Label>Upload Dokumen Proposal (PDF) *</Label>
              <div className="border-2 border-dashed border-orange-300 rounded-lg p-6 text-center hover:bg-orange-50 transition-colors cursor-pointer">
                <Upload className="h-12 w-12 mx-auto text-orange-400 mb-3" />
                <p className="text-sm font-medium">Klik untuk upload atau drag & drop</p>
                <p className="text-xs text-muted-foreground mt-1">PDF, maksimal 10MB</p>
                {scenario === 'approve' && (
                  <Badge className="mt-3 bg-green-100 text-green-700">
                    ✓ proposal_google_magang.pdf (sudah ter-upload)
                  </Badge>
                )}
                {scenario === 'reject' && (
                  <Badge className="mt-3 bg-orange-100 text-orange-700">
                    ✓ proposal_research_ai.pdf (sudah ter-upload)
                  </Badge>
                )}
              </div>
            </div>

            <Alert className="bg-orange-50 border-orange-200">
              <Paperclip className="h-4 w-4 text-orange-600" />
              <AlertDescription className="text-orange-800 text-sm">
                <strong>Tips:</strong> Pastikan proposal Anda lengkap mencakup: latar belakang, tujuan, 
                metodologi, timeline, dan benefit untuk kedua pihak.
              </AlertDescription>
            </Alert>

            <div className="flex gap-3 pt-4">
              <Button
                onClick={() => router.push(`/demo/mitra/login?scenario=${scenario}`)}
                variant="outline"
                className="flex-1"
              >
                Kembali
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex-1 bg-orange-600 hover:bg-orange-700"
                size="lg"
              >
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                    Mengirim...
                  </>
                ) : (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Submit Proposal
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Success Preview */}
        {submitting && (
          <Alert className="border-green-500 bg-green-50 animate-in fade-in slide-in-from-bottom-4">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <AlertDescription className="text-green-900">
              <strong>Proposal berhasil dikirim!</strong> Sistem sedang mengarahkan Anda ke perspektif DKUI...
            </AlertDescription>
          </Alert>
        )}

        {/* Progress */}
        <Card className="bg-gray-50">
          <CardContent className="pt-6">
            <div className="flex items-center text-xs gap-2">
              <div className="flex items-center gap-1">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-green-700">Login</span>
              </div>
              <ArrowRight className="h-3 w-3 text-gray-400" />
              <div className="flex items-center gap-1">
                <div className="h-2 w-2 rounded-full bg-orange-500 animate-pulse"></div>
                <span className="font-semibold">Submit Proposal</span>
              </div>
              <ArrowRight className="h-3 w-3 text-gray-400" />
              <span className="text-muted-foreground">DKUI Review</span>
              <ArrowRight className="h-3 w-3 text-gray-400" />
              <span className="text-muted-foreground">...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function DemoMitraSubmitPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
      <MitraSubmitContent />
    </Suspense>
  );
}
