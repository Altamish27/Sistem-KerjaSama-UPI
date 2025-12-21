'use client';

import React, { Suspense } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  CheckCircle,
  Archive,
  Download,
  Share2,
  Calendar,
  FileText,
  Building2,
  Trophy
} from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function DemoApprovedResultPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Success Header */}
        <div className="text-center space-y-4 py-8">
          <div className="flex justify-center">
            <div className="h-24 w-24 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center animate-in zoom-in">
              <CheckCircle className="h-14 w-14 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-green-900">
            🎉 Kerja Sama Berhasil Disahkan!
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Selamat! Seluruh proses kerja sama telah selesai. Dokumen telah ditandatangani 
            kedua belah pihak dan diarsipkan secara resmi.
          </p>
        </div>

        {/* Summary Card */}
        <Card className="border-4 border-green-500 shadow-2xl">
          <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
            <CardTitle className="flex items-center gap-2 text-green-900">
              <Trophy className="h-6 w-6" />
              Ringkasan Kerja Sama
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <span className="text-sm text-muted-foreground">Judul Kerja Sama:</span>
                  <p className="font-semibold text-lg">Program Magang Mahasiswa di Google Indonesia</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Mitra:</span>
                  <p className="font-semibold flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-orange-500" />
                    Google Inc.
                  </p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Kategori:</span>
                  <Badge className="ml-2 bg-blue-600">Magang Mahasiswa</Badge>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <span className="text-sm text-muted-foreground">Fakultas:</span>
                  <p className="font-semibold">Fakultas Ilmu Komputer</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Periode Berlaku:</span>
                  <p className="font-semibold flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    21 Des 2025 - 21 Des 2027 (2 tahun)
                  </p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">No. Dokumen:</span>
                  <p className="font-mono font-semibold">MoU/2025/001/DKUI</p>
                </div>
              </div>
            </div>

            <Alert className="bg-green-50 border-green-300">
              <Archive className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-900">
                <strong>Status Arsip:</strong> Dokumen telah disimpan di sistem arsip DKUI dan 
                dapat diakses kapan saja untuk keperluan administratif.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        {/* Journey Timeline */}
        <Card className="border-2 border-gray-200">
          <CardHeader>
            <CardTitle>📍 Perjalanan Proposal Anda</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <div className="flex-1">
                  <strong>Step 1:</strong> Mitra (Google) login & submit proposal
                </div>
                <span className="text-xs text-muted-foreground">21 Des, 14:30</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <div className="flex-1">
                  <strong>Step 2:</strong> DKUI terima & proses dengan AI
                </div>
                <span className="text-xs text-muted-foreground">21 Des, 15:00</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <div className="flex-1">
                  <strong>Step 3:</strong> Fakultas review & <Badge className="bg-green-600 text-xs">SETUJU</Badge>
                </div>
                <span className="text-xs text-muted-foreground">24 Des, 10:00</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <div className="flex-1">
                  <strong>Step 4:</strong> Legal draft dokumen naskah
                </div>
                <span className="text-xs text-muted-foreground">26 Des, 16:00</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <div className="flex-1">
                  <strong>Step 5:</strong> Biro Hukum validasi & paraf
                </div>
                <span className="text-xs text-muted-foreground">28 Des, 14:00</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <div className="flex-1">
                  <strong>Step 6:</strong> Warek & Rektor digital signing
                </div>
                <span className="text-xs text-muted-foreground">30 Des, 11:00</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <div className="flex-1">
                  <strong>Step 7:</strong> Mitra (Google) TTD & materai
                </div>
                <span className="text-xs text-muted-foreground">02 Jan, 09:00</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <div className="flex-1">
                  <strong>Step 8:</strong> Pertukaran dokumen & arsip
                </div>
                <span className="text-xs text-muted-foreground">05 Jan, 15:30</span>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t text-center">
              <p className="text-sm text-muted-foreground mb-2">Total Durasi Proses:</p>
              <p className="text-2xl font-bold text-green-700">15 Hari Kerja</p>
            </div>
          </CardContent>
        </Card>

        {/* Documents */}
        <Card className="border-2 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Dokumen Final
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
              <FileText className="h-10 w-10 text-red-500" />
              <div className="flex-1">
                <p className="font-medium">MoU_Google_Magang_2025_SIGNED.pdf</p>
                <p className="text-xs text-muted-foreground">Dokumen resmi bertanda tangan & materai</p>
              </div>
              <Button size="sm">
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>

            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
              <FileText className="h-10 w-10 text-blue-500" />
              <div className="flex-1">
                <p className="font-medium">Lampiran_Program_Details.pdf</p>
                <p className="text-xs text-muted-foreground">Detail program magang</p>
              </div>
              <Button size="sm">
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
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
            Coba Skenario Lain
          </Button>
          <Button
            onClick={() => router.push('/welcome')}
            className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
            size="lg"
          >
            Kembali ke Beranda
          </Button>
        </div>
      </div>
    </div>
  );
}
