'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Play, 
  CheckCircle, 
  XCircle, 
  GitBranch,
  Info,
  ArrowRight,
  Settings,
  Building2
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function DemoLandingPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-gray-50 flex items-center justify-center p-6">
      <div className="max-w-4xl w-full space-y-8">
        <div className="text-center">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-red-600 to-gray-900 bg-clip-text text-transparent mb-4">
            Demo Dashboard Sistem Kerja Sama
          </h1>
          <p className="text-lg text-muted-foreground">
            Pilih skenario alur kerja sama
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Kondisi 1: Mitra Mengajukan */}
          <Card className="border-2 border-orange-300 hover:shadow-2xl transition-all duration-300">
            <CardHeader className="bg-gradient-to-r from-orange-50 to-amber-50">
              <CardTitle className="flex items-center gap-2 text-xl">
                <Building2 className="h-6 w-6 text-orange-600" />
                Pihak Eksternal Mengajukan
              </CardTitle>
              <CardDescription>
                Mitra eksternal mengajukan proposal kerja sama ke universitas
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-3 text-sm text-muted-foreground mb-6">
                <div className="flex items-start gap-2">
                  <span className="font-bold text-orange-600">1.</span>
                  <span>Mitra submit proposal</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-bold text-orange-600">2.</span>
                  <span>DKUI proses dengan AI</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-bold text-orange-600">3.</span>
                  <span>Fakultas verifikasi & putuskan</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-bold text-orange-600">4.</span>
                  <span>Legal draft → Paraf → TTD → Arsip</span>
                </div>
              </div>
              
              <Button
                onClick={() => router.push('/demo/flow?step=1')}
                className="w-full h-14 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white"
                size="lg"
              >
                <Play className="h-5 w-5 mr-2" />
                Mulai Demo
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </CardContent>
          </Card>

          {/* Kondisi 2: Fakultas Mengajukan */}
          <Card className="border-2 border-blue-300 hover:shadow-2xl transition-all duration-300">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50">
              <CardTitle className="flex items-center gap-2 text-xl">
                <GitBranch className="h-6 w-6 text-blue-600" />
                Fakultas/Unit Mengajukan
              </CardTitle>
              <CardDescription>
                Fakultas/unit internal mengajukan proposal kerja sama ke mitra eksternal
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-3 text-sm text-muted-foreground mb-6">
                <div className="flex items-start gap-2">
                  <span className="font-bold text-blue-600">1.</span>
                  <span>Fakultas ajukan proposal</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-bold text-blue-600">2.</span>
                  <span>DKUI proses & kirim ke Mitra</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-bold text-blue-600">3.</span>
                  <span>Mitra review & putuskan</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-bold text-blue-600">4.</span>
                  <span>Legal → Biro Hukum → Supervisi → Arsip</span>
                </div>
              </div>
              
              <Button
                onClick={() => router.push('/demo/flow-fakultas?step=1')}
                className="w-full h-14 bg-gradient-to-r from-blue-600 to-gray-900 hover:from-blue-700 hover:to-black text-white"
                size="lg"
              >
                <Play className="h-5 w-5 mr-2" />
                Mulai Demo
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
