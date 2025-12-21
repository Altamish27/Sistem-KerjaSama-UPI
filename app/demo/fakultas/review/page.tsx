'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import { 
  CheckSquare,
  Lightbulb,
  ArrowRight,
  CheckCircle,
  XCircle,
  FileText,
  AlertTriangle,
  Users,
  ThumbsUp,
  ThumbsDown
} from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function DemoFakultasReviewPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const scenario = searchParams.get('scenario') || 'approve';
  
  const [showTutorial, setShowTutorial] = useState(true);
  const [decision, setDecision] = useState<'approve' | 'reject' | null>(null);
  const [feedback, setFeedback] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleDecision = (dec: 'approve' | 'reject') => {
    setDecision(dec);
    if (dec === 'approve') {
      setFeedback('Proposal sangat baik dan sesuai dengan visi fakultas. Kami merekomendasikan untuk melanjutkan ke tahap berikutnya.');
    } else {
      setFeedback('Proposal kurang lengkap. Tidak ada track record yang jelas dari mitra dan anggaran tidak terinci. Mohon mitra untuk memperbaiki proposal.');
    }
  };

  const handleSubmit = () => {
    setSubmitting(true);
    setTimeout(() => {
      if (decision === 'approve') {
        router.push(`/demo/legal/draft?scenario=${scenario}`);
      } else {
        router.push(`/demo/result/rejected?scenario=${scenario}`);
      }
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Tutorial */}
        {showTutorial && (
          <Alert className="border-2 border-blue-500 bg-blue-50 shadow-lg">
            <Lightbulb className="h-5 w-5 text-blue-600" />
            <AlertDescription className="text-blue-900">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <strong className="block mb-2">📍 Step 4/8 - Fakultas Verifikasi Substansi</strong>
                  <p className="text-sm mb-2">
                    Sekarang Anda adalah <strong>Staff Fakultas Ilmu Komputer</strong>. Tugas Anda adalah 
                    memverifikasi substansi proposal dan memutuskan: <strong>SETUJU atau TOLAK</strong>.
                  </p>
                  <p className="text-xs text-blue-700">
                    ⏱️ Estimasi: 3-5 hari | Selanjutnya: {scenario === 'approve' ? 'Legal Draft Dokumen' : 'Kirim Feedback Penolakan'}
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
            <h1 className="text-2xl font-bold text-green-900">Review Proposal - Fakultas Ilmu Komputer</h1>
            <p className="text-sm text-muted-foreground">Verifikasi Substansi Kerja Sama</p>
          </div>
          <Badge variant="outline" className="text-green-700 border-green-300">
            <Users className="h-3 w-3 mr-1" />
            Anda: Kaprodi FIlkom
          </Badge>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Left: Proposal Review */}
          <div className="md:col-span-2 space-y-6">
            <Card className="border-2 border-green-200">
              <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Detail Proposal
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Mitra:</span>
                    <p className="font-semibold">{scenario === 'approve' ? 'Google Inc.' : 'StartupXYZ'}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Kategori:</span>
                    <p className="font-semibold">{scenario === 'approve' ? 'Magang' : 'Penelitian'}</p>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <h4 className="font-semibold mb-2">Judul:</h4>
                  <p className="text-sm">
                    {scenario === 'approve' 
                      ? 'Program Magang Mahasiswa di Google Indonesia'
                      : 'Penelitian AI untuk Kesehatan Masyarakat'}
                  </p>
                </div>

                <div className="pt-4 border-t">
                  <h4 className="font-semibold mb-2">🤖 Ringkasan AI:</h4>
                  <div className={`p-4 rounded-lg text-sm ${
                    scenario === 'approve' 
                      ? 'bg-green-50 border border-green-200' 
                      : 'bg-yellow-50 border border-yellow-200'
                  }`}>
                    {scenario === 'approve' ? (
                      <>
                        <p className="mb-2">
                          Google Indonesia mengajukan program magang untuk <strong>20 mahasiswa</strong> dengan durasi 6 bulan.
                        </p>
                        <ul className="list-disc list-inside space-y-1 text-xs">
                          <li>Training teknologi cloud computing & machine learning</li>
                          <li>Mentoring dari senior engineer Google</li>
                          <li>Sertifikasi profesional Google Cloud</li>
                          <li>Potensi rekrutmen setelah lulus</li>
                        </ul>
                        <p className="mt-3 text-green-700 font-semibold">
                          ✅ Rekomendasi AI: DISETUJUI (skor relevansi: 9.2/10)
                        </p>
                      </>
                    ) : (
                      <>
                        <p className="mb-2">
                          StartupXYZ mengajukan penelitian AI untuk prediksi penyakit dengan durasi 2 tahun.
                        </p>
                        <ul className="list-disc list-inside space-y-1 text-xs text-yellow-800">
                          <li>❌ Tidak ada track record penelitian sebelumnya</li>
                          <li>❌ Anggaran tidak jelas dan tidak terinci</li>
                          <li>❌ Metodologi penelitian kurang detail</li>
                          <li>⚠️ Startup berdiri baru 6 bulan yang lalu</li>
                        </ul>
                        <p className="mt-3 text-yellow-700 font-semibold">
                          ⚠️ Rekomendasi AI: PERLU REVIEW MENDALAM (skor relevansi: 4.1/10)
                        </p>
                      </>
                    )}
                  </div>
                </div>

                <Alert className={`${scenario === 'approve' ? 'bg-blue-50 border-blue-200' : 'bg-red-50 border-red-200'}`}>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription className="text-sm">
                    {scenario === 'approve' ? (
                      <>
                        <strong>Catatan Skenario:</strong> Dalam skenario ini, Anda akan MENYETUJUI proposal 
                        untuk melanjutkan ke tahap berikutnya.
                      </>
                    ) : (
                      <>
                        <strong>Catatan Skenario:</strong> Dalam skenario ini, Anda akan MENOLAK proposal 
                        karena tidak memenuhi kriteria fakultas.
                      </>
                    )}
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>

            {/* Decision Form */}
            <Card className="border-2 border-green-200">
              <CardHeader className="bg-green-50">
                <CardTitle className="flex items-center gap-2">
                  <CheckSquare className="h-5 w-5" />
                  Keputusan Verifikasi
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Button
                    onClick={() => handleDecision('approve')}
                    variant={decision === 'approve' ? 'default' : 'outline'}
                    className={`h-24 ${
                      decision === 'approve' 
                        ? 'bg-green-600 hover:bg-green-700' 
                        : 'border-green-300 hover:bg-green-50'
                    }`}
                    size="lg"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <ThumbsUp className="h-8 w-8" />
                      <span>SETUJUI</span>
                    </div>
                  </Button>

                  <Button
                    onClick={() => handleDecision('reject')}
                    variant={decision === 'reject' ? 'destructive' : 'outline'}
                    className={`h-24 ${
                      decision !== 'reject' && 'border-red-300 hover:bg-red-50'
                    }`}
                    size="lg"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <ThumbsDown className="h-8 w-8" />
                      <span>TOLAK</span>
                    </div>
                  </Button>
                </div>

                {decision && (
                  <div className="space-y-2 animate-in fade-in slide-in-from-bottom-4">
                    <label className="text-sm font-medium">
                      Catatan/Feedback untuk {decision === 'approve' ? 'DKUI' : 'Mitra'}:
                    </label>
                    <Textarea
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      rows={4}
                      className="border-green-200"
                    />

                    <Button
                      onClick={handleSubmit}
                      disabled={submitting}
                      className={`w-full ${
                        decision === 'approve' 
                          ? 'bg-green-600 hover:bg-green-700' 
                          : 'bg-red-600 hover:bg-red-700'
                      }`}
                      size="lg"
                    >
                      {submitting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                          Mengirim Keputusan...
                        </>
                      ) : (
                        <>
                          {decision === 'approve' ? (
                            <CheckCircle className="mr-2 h-4 w-4" />
                          ) : (
                            <XCircle className="mr-2 h-4 w-4" />
                          )}
                          Kirim Keputusan: {decision === 'approve' ? 'SETUJU' : 'TOLAK'}
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right: Info */}
          <div className="space-y-4">
            <Card className="border-green-200">
              <CardHeader>
                <CardTitle className="text-base">Kriteria Penilaian</CardTitle>
              </CardHeader>
              <CardContent className="text-xs space-y-2">
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                  <span>Relevansi dengan visi fakultas</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                  <span>Kredibilitas mitra</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                  <span>Manfaat untuk mahasiswa/dosen</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                  <span>Kelayakan teknis & finansial</span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-yellow-50 to-amber-50 border-yellow-200">
              <CardHeader>
                <CardTitle className="text-sm">⚠️ Perhatian</CardTitle>
              </CardHeader>
              <CardContent className="text-xs">
                Keputusan Anda akan menentukan alur selanjutnya:
                <ul className="mt-2 space-y-1 list-disc list-inside">
                  <li><strong>SETUJU:</strong> Lanjut ke Legal Draft & Biro Hukum</li>
                  <li><strong>TOLAK:</strong> DKUI kirim feedback penolakan ke Mitra</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Progress */}
        <Card className="bg-gray-50">
          <CardContent className="pt-6">
            <div className="flex items-center text-xs gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-green-700">Mitra Submit</span>
              <ArrowRight className="h-3 w-3 text-gray-400" />
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-green-700">DKUI Process</span>
              <ArrowRight className="h-3 w-3 text-gray-400" />
              <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
              <span className="font-semibold">Fakultas Review</span>
              <ArrowRight className="h-3 w-3 text-gray-400" />
              <span className="text-muted-foreground">...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
