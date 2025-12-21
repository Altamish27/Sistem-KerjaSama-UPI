'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
  Inbox,
  Cpu, 
  Lightbulb,
  ArrowRight,
  FileText,
  Building2,
  Calendar,
  Users,
  CheckCircle,
  Sparkles
} from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function DemoDKUIReceivePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const scenario = searchParams.get('scenario') || 'approve';
  
  const [showTutorial, setShowTutorial] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [aiSummary, setAiSummary] = useState('');

  const proposal = {
    id: 'PROP-2025-001',
    title: scenario === 'approve' 
      ? 'Program Magang Mahasiswa di Google Indonesia'
      : 'Penelitian AI untuk Kesehatan Masyarakat',
    partner: scenario === 'approve' ? 'Google Inc.' : 'StartupXYZ',
    category: scenario === 'approve' ? 'Magang' : 'Penelitian',
    faculty: 'Fakultas Ilmu Komputer',
    receivedDate: '21 Desember 2025, 14:30 WIB',
    status: 'Baru Diterima'
  };

  const handleProcess = () => {
    setProcessing(true);
    
    // Simulate AI processing
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            router.push(`/demo/fakultas/review?scenario=${scenario}`);
          }, 1500);
          return 100;
        }
        return prev + 10;
      });
    }, 300);

    // Show AI summary after a moment
    setTimeout(() => {
      setAiSummary(scenario === 'approve' 
        ? '🤖 AI Summary: Google Indonesia mengajukan kerja sama magang untuk 20 mahasiswa FIlkom dengan durasi 6 bulan. Program mencakup training teknologi cloud, mentoring dari engineer senior, dan sertifikasi profesional. Benefit: pengalaman industri untuk mahasiswa, potensi rekrutmen talent. Rekomendasi: DISETUJUI ✓'
        : '🤖 AI Summary: StartupXYZ mengajukan penelitian AI untuk prediksi penyakit. Namun proposal tidak mencantumkan track record penelitian sebelumnya dan anggaran tidak jelas. Rekomendasi: PERLU REVIEW MENDALAM'
      );
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Tutorial */}
        {showTutorial && (
          <Alert className="border-2 border-blue-500 bg-blue-50 shadow-lg">
            <Lightbulb className="h-5 w-5 text-blue-600" />
            <AlertDescription className="text-blue-900">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <strong className="block mb-2">📍 Step 3/8 - DKUI Menerima & Memproses Proposal</strong>
                  <p className="text-sm mb-2">
                    Sekarang Anda beralih peran menjadi <strong>Staff DKUI</strong>. Proposal dari mitra sudah masuk. 
                    Sistem akan menggunakan AI untuk meringkas proposal secara otomatis.
                  </p>
                  <p className="text-xs text-blue-700">
                    ⏱️ Estimasi: 1 hari | Selanjutnya: Salurkan ke Fakultas untuk verifikasi
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
            <h1 className="text-2xl font-bold text-blue-900">Dashboard DKUI - Proposal Masuk</h1>
            <p className="text-sm text-muted-foreground">Direktorat Kerja Sama Universitas Indonesia</p>
          </div>
          <Badge variant="outline" className="text-blue-700 border-blue-300">
            <Users className="h-3 w-3 mr-1" />
            Anda: Staff DKUI
          </Badge>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Left: Proposal Details */}
          <div className="md:col-span-2 space-y-6">
            <Card className="border-2 border-blue-200">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
                <CardTitle className="flex items-center gap-2">
                  <Inbox className="h-5 w-5" />
                  Proposal Baru Masuk
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">ID Proposal:</span>
                    <p className="font-semibold">{proposal.id}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Status:</span>
                    <Badge className="ml-2 bg-yellow-100 text-yellow-800">
                      {proposal.status}
                    </Badge>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Mitra:</span>
                    <p className="font-semibold flex items-center gap-1">
                      <Building2 className="h-4 w-4" />
                      {proposal.partner}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Kategori:</span>
                    <p className="font-semibold">{proposal.category}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Fakultas Tujuan:</span>
                    <p className="font-semibold">{proposal.faculty}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Diterima:</span>
                    <p className="font-semibold flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {proposal.receivedDate}
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Judul Proposal:
                  </h4>
                  <p className="text-sm">{proposal.title}</p>
                </div>

                <div className="pt-4 border-t">
                  <h4 className="font-semibold mb-2">Dokumen:</h4>
                  <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                    <FileText className="h-8 w-8 text-red-500" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">proposal_{scenario === 'approve' ? 'google_magang' : 'research_ai'}.pdf</p>
                      <p className="text-xs text-muted-foreground">2.4 MB • Uploaded 21 Des 2025</p>
                    </div>
                    <Button size="sm" variant="outline">Download</Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* AI Processing */}
            {processing && (
              <Card className="border-2 border-purple-300 animate-in fade-in slide-in-from-bottom-4">
                <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50">
                  <CardTitle className="flex items-center gap-2 text-purple-900">
                    <Cpu className="h-5 w-5 animate-pulse" />
                    AI Sedang Meringkas Proposal...
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress Analisis</span>
                      <span className="font-semibold">{progress}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>

                  {aiSummary && (
                    <Alert className={`${
                      scenario === 'approve' 
                        ? 'bg-green-50 border-green-300' 
                        : 'bg-yellow-50 border-yellow-300'
                    } animate-in fade-in`}>
                      <Sparkles className="h-4 w-4" />
                      <AlertDescription className="text-sm">
                        {aiSummary}
                      </AlertDescription>
                    </Alert>
                  )}

                  {progress === 100 && (
                    <Alert className="bg-blue-50 border-blue-300">
                      <CheckCircle className="h-4 w-4 text-blue-600" />
                      <AlertDescription className="text-blue-900 text-sm">
                        ✓ Proposal & ringkasan telah disimpan di database. Mengarahkan ke Fakultas...
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right: Actions */}
          <div className="space-y-4">
            <Card className="border-blue-200">
              <CardHeader>
                <CardTitle className="text-base">Tindakan Selanjutnya</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  onClick={handleProcess}
                  disabled={processing}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  size="lg"
                >
                  {processing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                      Memproses...
                    </>
                  ) : (
                    <>
                      <Cpu className="mr-2 h-4 w-4" />
                      Proses dengan AI
                    </>
                  )}
                </Button>

                <p className="text-xs text-muted-foreground text-center">
                  Sistem akan otomatis meringkas proposal dan meneruskan ke fakultas terkait
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
              <CardHeader>
                <CardTitle className="text-sm">Fitur AI Assistant</CardTitle>
              </CardHeader>
              <CardContent className="text-xs space-y-2">
                <div className="flex items-start gap-2">
                  <Sparkles className="h-4 w-4 text-purple-600 mt-0.5" />
                  <span>Ekstraksi informasi penting otomatis</span>
                </div>
                <div className="flex items-start gap-2">
                  <Sparkles className="h-4 w-4 text-purple-600 mt-0.5" />
                  <span>Ringkasan eksekutif untuk reviewer</span>
                </div>
                <div className="flex items-start gap-2">
                  <Sparkles className="h-4 w-4 text-purple-600 mt-0.5" />
                  <span>Rekomendasi awal berdasarkan pola data</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Progress Indicator */}
        <Card className="bg-gray-50">
          <CardContent className="pt-6">
            <div className="flex items-center text-xs gap-2">
              <div className="flex items-center gap-1">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-green-700">Mitra Submit</span>
              </div>
              <ArrowRight className="h-3 w-3 text-gray-400" />
              <div className="flex items-center gap-1">
                <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse"></div>
                <span className="font-semibold">DKUI Process</span>
              </div>
              <ArrowRight className="h-3 w-3 text-gray-400" />
              <span className="text-muted-foreground">Fakultas Review</span>
              <ArrowRight className="h-3 w-3 text-gray-400" />
              <span className="text-muted-foreground">...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
