'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  FileText,
  Lightbulb,
  CheckCircle,
  ArrowRight,
  Download,
  Send
} from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function DemoLegalDraftPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const scenario = searchParams.get('scenario') || 'approve';
  
  const [showTutorial, setShowTutorial] = useState(true);
  const [processing, setProcessing] = useState(false);

  const handleContinue = () => {
    setProcessing(true);
    setTimeout(() => {
      router.push(`/demo/result/approved?scenario=${scenario}`);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Tutorial */}
        {showTutorial && (
          <Alert className="border-2 border-blue-500 bg-blue-50 shadow-lg">
            <Lightbulb className="h-5 w-5 text-blue-600" />
            <AlertDescription className="text-blue-900">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <strong className="block mb-2">📍 Step 5-7/8 - Legal Draft → Biro Hukum → Supervisi</strong>
                  <p className="text-sm mb-2">
                    Proposal DISETUJUI! Sekarang DKUI (Legal Drafter) menyusun dokumen naskah kerja sama, 
                    lalu dikirim ke Biro Hukum untuk validasi, kemudian ke Supervisi (Warek & Rektor) untuk TTD digital.
                  </p>
                  <p className="text-xs text-blue-700">
                    ⏱️ Estimasi: 7-10 hari | Selanjutnya: Selesai & Arsip
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
        <div className="text-center space-y-3">
          <Badge className="bg-green-600 text-white px-4 py-2">
            ✅ Proposal DISETUJUI oleh Fakultas
          </Badge>
          <h1 className="text-3xl font-bold text-blue-900">
            Proses Legal & Administrasi
          </h1>
          <p className="text-muted-foreground">
            Dokumen naskah kerja sama sedang disusun dan divalidasi
          </p>
        </div>

        {/* Process Steps */}
        <Card className="border-2 border-blue-200">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50">
            <CardTitle>Timeline Proses Internal (Fast-Forward Demo)</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {/* Step 1 */}
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500 text-white font-bold flex-shrink-0">
                  ✓
                </div>
                <div className="flex-1 pt-2">
                  <h4 className="font-semibold">DKUI - Legal Drafter</h4>
                  <p className="text-sm text-muted-foreground">
                    Menyusun dan memeriksa dokumen naskah kerja sama (MoU/MoA)
                  </p>
                  <p className="text-xs text-green-700 mt-1">✓ Selesai • 2 hari</p>
                </div>
              </div>

              <div className="ml-5 border-l-2 border-gray-300 h-6"></div>

              {/* Step 2 */}
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500 text-white font-bold flex-shrink-0">
                  ✓
                </div>
                <div className="flex-1 pt-2">
                  <h4 className="font-semibold">DKUI - Kepala Divisi</h4>
                  <p className="text-sm text-muted-foreground">
                    Paraf persetujuan dari Kepala Divisi DKUI
                  </p>
                  <p className="text-xs text-green-700 mt-1">✓ Selesai • 1 hari</p>
                </div>
              </div>

              <div className="ml-5 border-l-2 border-gray-300 h-6"></div>

              {/* Step 3 */}
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500 text-white font-bold flex-shrink-0">
                  ✓
                </div>
                <div className="flex-1 pt-2">
                  <h4 className="font-semibold">Biro Hukum</h4>
                  <p className="text-sm text-muted-foreground">
                    Validasi & paraf aspek legal dokumen kerja sama
                  </p>
                  <p className="text-xs text-green-700 mt-1">✓ Selesai • 3 hari</p>
                </div>
              </div>

              <div className="ml-5 border-l-2 border-gray-300 h-6"></div>

              {/* Step 4 */}
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500 text-white font-bold flex-shrink-0 animate-pulse">
                  4
                </div>
                <div className="flex-1 pt-2">
                  <h4 className="font-semibold">Supervisi - Wakil Rektor</h4>
                  <p className="text-sm text-muted-foreground">
                    Review & digital signing oleh Wakil Rektor
                  </p>
                  <p className="text-xs text-blue-700 mt-1">⏳ Sedang proses • ~2 hari</p>
                </div>
              </div>

              <div className="ml-5 border-l-2 border-dashed border-gray-300 h-6"></div>

              {/* Step 5 */}
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-300 text-gray-600 font-bold flex-shrink-0">
                  5
                </div>
                <div className="flex-1 pt-2">
                  <h4 className="font-semibold text-muted-foreground">Supervisi - Rektor</h4>
                  <p className="text-sm text-muted-foreground">
                    Review & digital signing + materai oleh Rektor
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">Menunggu • ~2 hari</p>
                </div>
              </div>

              <div className="ml-5 border-l-2 border-dashed border-gray-300 h-6"></div>

              {/* Step 6 */}
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-300 text-gray-600 font-bold flex-shrink-0">
                  6
                </div>
                <div className="flex-1 pt-2">
                  <h4 className="font-semibold text-muted-foreground">Paralel: Mitra TTD</h4>
                  <p className="text-sm text-muted-foreground">
                    Google Inc. menandatangani & membubuhkan materai
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">Menunggu • ~3 hari</p>
                </div>
              </div>
            </div>

            <Alert className="mt-6 bg-blue-50 border-blue-200">
              <CheckCircle className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-900 text-sm">
                <strong>Demo Fast-Forward:</strong> Untuk mempercepat demo, kita skip detail proses 
                internal dan langsung menuju hasil akhir.
              </AlertDescription>
            </Alert>

            <Button
              onClick={handleContinue}
              disabled={processing}
              className="w-full mt-6 bg-blue-600 hover:bg-blue-700"
              size="lg"
            >
              {processing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                  Memproses...
                </>
              ) : (
                <>
                  Lanjut ke Hasil Akhir
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Document Preview */}
        <Card className="border-2 border-blue-200">
          <CardHeader className="bg-blue-50">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Preview Dokumen Naskah
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="bg-gray-100 border-2 border-gray-300 rounded-lg p-6 text-sm">
              <h3 className="font-bold text-center mb-4">MEMORANDUM OF UNDERSTANDING</h3>
              <p className="text-center mb-4">Antara</p>
              <p className="text-center font-semibold mb-2">UNIVERSITAS INDONESIA</p>
              <p className="text-center mb-2">dan</p>
              <p className="text-center font-semibold mb-4">GOOGLE INC.</p>
              <p className="text-center mb-6">Tentang</p>
              <p className="text-center font-semibold mb-8">PROGRAM MAGANG MAHASISWA</p>
              <div className="text-xs text-muted-foreground space-y-1">
                <p>Pasal 1 - Tujuan Kerja Sama</p>
                <p>Pasal 2 - Ruang Lingkup</p>
                <p>Pasal 3 - Hak dan Kewajiban</p>
                <p>Pasal 4 - Jangka Waktu</p>
                <p className="pt-2">...</p>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <Button variant="outline" className="flex-1" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Download Draft
              </Button>
              <Button variant="outline" className="flex-1" size="sm">
                <Send className="h-4 w-4 mr-2" />
                Kirim ke Email
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
