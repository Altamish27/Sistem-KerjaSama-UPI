'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  XCircle,
  AlertTriangle,
  FileText,
  MessageSquare,
  RotateCcw,
  Home
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function DemoRejectedResultPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4 py-8">
          <div className="flex justify-center">
            <div className="h-24 w-24 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center animate-in zoom-in">
              <XCircle className="h-14 w-14 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-red-900">
            Proposal Tidak Disetujui
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Proposal kerja sama Anda tidak dapat dilanjutkan pada tahap ini. 
            Silakan lihat feedback di bawah untuk perbaikan.
          </p>
        </div>

        {/* Rejection Details */}
        <Card className="border-4 border-red-500 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-red-50 to-orange-50">
            <CardTitle className="flex items-center gap-2 text-red-900">
              <AlertTriangle className="h-6 w-6" />
              Detail Penolakan
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <span className="text-sm text-muted-foreground">Judul Proposal:</span>
                  <p className="font-semibold text-lg">Penelitian AI untuk Kesehatan Masyarakat</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Mitra:</span>
                  <p className="font-semibold">StartupXYZ</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Kategori:</span>
                  <Badge className="ml-2 bg-purple-600">Penelitian</Badge>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <span className="text-sm text-muted-foreground">Ditolak oleh:</span>
                  <p className="font-semibold">Fakultas Ilmu Komputer</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Tanggal Keputusan:</span>
                  <p className="font-semibold">24 Desember 2025</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Status:</span>
                  <Badge className="ml-2 bg-red-600">DITOLAK</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Feedback */}
        <Card className="border-2 border-orange-200">
          <CardHeader className="bg-orange-50">
            <CardTitle className="flex items-center gap-2 text-orange-900">
              <MessageSquare className="h-5 w-5" />
              Feedback dari Fakultas
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <Alert className="bg-yellow-50 border-yellow-300">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-yellow-900">
                <strong className="block mb-2">Alasan Penolakan:</strong>
                <p className="text-sm mb-3">
                  Proposal kurang lengkap dan tidak memenuhi standar kelayakan kerja sama. 
                  Berikut poin-poin yang perlu diperbaiki:
                </p>
              </AlertDescription>
            </Alert>

            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-3 p-3 bg-red-50 rounded-lg border border-red-200">
                <XCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                <div>
                  <strong className="text-red-900">Track Record Tidak Jelas</strong>
                  <p className="text-red-700 mt-1">
                    Tidak ada bukti penelitian atau proyek serupa yang pernah dilakukan oleh StartupXYZ. 
                    Mohon lampirkan portfolio atau publikasi sebelumnya.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-red-50 rounded-lg border border-red-200">
                <XCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                <div>
                  <strong className="text-red-900">Anggaran Tidak Terinci</strong>
                  <p className="text-red-700 mt-1">
                    Proposal tidak mencantumkan detail anggaran penelitian. Kami memerlukan breakdown 
                    biaya yang jelas untuk setiap komponen penelitian.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-red-50 rounded-lg border border-red-200">
                <XCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                <div>
                  <strong className="text-red-900">Metodologi Kurang Detail</strong>
                  <p className="text-red-700 mt-1">
                    Metodologi penelitian yang diusulkan terlalu umum dan tidak mencantumkan 
                    teknik spesifik yang akan digunakan.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg border border-orange-200">
                <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5 flex-shrink-0" />
                <div>
                  <strong className="text-orange-900">Kapasitas Organisasi Diragukan</strong>
                  <p className="text-orange-700 mt-1">
                    Startup berdiri baru 6 bulan yang lalu. Perlu bukti tim yang kompeten dan 
                    pengalaman yang relevan dengan topik penelitian.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Next Steps */}
        <Card className="border-2 border-blue-200">
          <CardHeader className="bg-blue-50">
            <CardTitle>Langkah Selanjutnya</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500 text-white font-bold flex-shrink-0">
                  1
                </div>
                <div>
                  <strong>Perbaiki Proposal</strong>
                  <p className="text-muted-foreground">
                    Lengkapi semua poin yang disebutkan dalam feedback di atas
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500 text-white font-bold flex-shrink-0">
                  2
                </div>
                <div>
                  <strong>Konsultasi dengan Fakultas</strong>
                  <p className="text-muted-foreground">
                    Jika ada pertanyaan, silakan hubungi email: fasilkom@ui.ac.id
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500 text-white font-bold flex-shrink-0">
                  3
                </div>
                <div>
                  <strong>Ajukan Kembali</strong>
                  <p className="text-muted-foreground">
                    Setelah perbaikan lengkap, Anda dapat mengajukan proposal yang telah diperbaiki
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Timeline */}
        <Card className="border-2 border-gray-200">
          <CardHeader>
            <CardTitle>📍 Perjalanan Proposal Anda</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-green-500"></div>
                <div className="flex-1">
                  <strong>Step 1:</strong> Mitra (StartupXYZ) submit proposal
                </div>
                <span className="text-xs text-muted-foreground">21 Des, 14:30</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-green-500"></div>
                <div className="flex-1">
                  <strong>Step 2:</strong> DKUI terima & proses
                </div>
                <span className="text-xs text-muted-foreground">21 Des, 15:00</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-red-500"></div>
                <div className="flex-1">
                  <strong>Step 3:</strong> Fakultas review & <Badge className="bg-red-600 text-xs">TOLAK</Badge>
                </div>
                <span className="text-xs text-muted-foreground">24 Des, 10:00</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-red-500"></div>
                <div className="flex-1">
                  <strong>Step 4:</strong> DKUI kirim feedback ke Mitra
                </div>
                <span className="text-xs text-muted-foreground">24 Des, 11:00</span>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t text-center">
              <p className="text-sm text-muted-foreground mb-2">Total Durasi Proses:</p>
              <p className="text-2xl font-bold text-red-700">3 Hari Kerja</p>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-4">
          <Button
            onClick={() => router.push('/demo')}
            variant="outline"
            size="lg"
            className="flex-1"
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Coba Skenario Lain
          </Button>
          <Button
            onClick={() => router.push('/welcome')}
            className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            size="lg"
          >
            <Home className="mr-2 h-4 w-4" />
            Kembali ke Beranda
          </Button>
        </div>
      </div>
    </div>
  );
}
