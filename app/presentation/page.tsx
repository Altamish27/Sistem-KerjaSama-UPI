'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { WorkflowViewer } from '@/components/workflow-viewer';
import { workflows } from '@/lib/workflow-data';
import { ArrowRight, Building2, Users, Presentation, Info } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function WorkflowPresentationPage() {
  const [selectedWorkflow, setSelectedWorkflow] = useState<'external' | 'internal' | null>(null);

  if (selectedWorkflow) {
    const workflow = workflows[selectedWorkflow];
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="container mx-auto px-4 py-8 max-w-5xl">
          {/* Header */}
          <div className="mb-8">
            <Button 
              variant="ghost" 
              onClick={() => setSelectedWorkflow(null)}
              className="mb-4"
            >
              ← Kembali ke Pilihan
            </Button>
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2">{workflow.name}</h1>
                <p className="text-muted-foreground">{workflow.description}</p>
              </div>
              <Badge variant="outline" className="text-lg px-4 py-2">
                {selectedWorkflow === 'external' ? 'External Mitra' : 'Internal Unit'}
              </Badge>
            </div>
          </div>

          {/* Workflow Viewer */}
          <WorkflowViewer workflow={workflow} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <Presentation className="h-16 w-16 text-primary" />
          </div>
          <h1 className="text-4xl font-bold mb-4">
            Sistem Alur Kerja Sama Universitas
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Presentasi interaktif proses pengajuan dan persetujuan kerja sama
          </p>
        </div>

        {/* Info Alert */}
        <Alert className="mb-8 border-blue-200 bg-blue-50">
          <Info className="h-5 w-5 text-blue-600" />
          <AlertTitle className="text-blue-900">Cara Penggunaan</AlertTitle>
          <AlertDescription className="text-blue-800">
            Pilih salah satu alur kerja sama di bawah ini, lalu klik tombol navigasi untuk mengikuti 
            setiap langkah proses. Anda dapat melihat bagaimana proposal diproses dari awal hingga akhir.
          </AlertDescription>
        </Alert>

        {/* Workflow Selection Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {/* External Mitra Card */}
          <Card className="border-2 border-orange-200 hover:border-orange-400 hover:shadow-lg transition-all duration-300 cursor-pointer group">
            <CardHeader className="bg-gradient-to-br from-orange-50 to-orange-100">
              <div className="flex items-center justify-between mb-2">
                <Building2 className="h-10 w-10 text-orange-600" />
                <Badge className="bg-orange-600 text-white">External</Badge>
              </div>
              <CardTitle className="text-2xl">Mitra External ke Universitas</CardTitle>
              <CardDescription className="text-base">
                Alur pengajuan kerja sama dari mitra eksternal (perusahaan, institusi luar) ke universitas
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-2 text-sm">
                  <div className="h-2 w-2 rounded-full bg-orange-500"></div>
                  <span>Mitra mengajukan proposal</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                  <span>DKUI memproses & menyalurkan</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="h-2 w-2 rounded-full bg-green-500"></div>
                  <span>Fakultas verifikasi substansi</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="h-2 w-2 rounded-full bg-purple-500"></div>
                  <span>Biro Hukum validasi legal</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="h-2 w-2 rounded-full bg-teal-500"></div>
                  <span>Supervisi & Rektor approval</span>
                </div>
              </div>
              
              <Button 
                onClick={() => setSelectedWorkflow('external')}
                className="w-full bg-orange-600 hover:bg-orange-700 group-hover:scale-105 transition-transform"
                size="lg"
              >
                Mulai Presentasi
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </CardContent>
          </Card>

          {/* Internal Unit Card */}
          <Card className="border-2 border-gray-200 hover:border-gray-400 hover:shadow-lg transition-all duration-300 cursor-pointer group relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-yellow-400 text-yellow-900 px-3 py-1 text-xs font-bold transform rotate-12 translate-x-8 translate-y-4">
              COMING SOON
            </div>
            <CardHeader className="bg-gradient-to-br from-gray-50 to-gray-100">
              <div className="flex items-center justify-between mb-2">
                <Users className="h-10 w-10 text-gray-600" />
                <Badge className="bg-gray-600 text-white">Internal</Badge>
              </div>
              <CardTitle className="text-2xl">Unit Internal Universitas</CardTitle>
              <CardDescription className="text-base">
                Alur pengajuan kerja sama dari unit internal universitas (fakultas, departemen, pusat studi)
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-3 mb-6 opacity-60">
                <div className="flex items-center gap-2 text-sm">
                  <div className="h-2 w-2 rounded-full bg-green-500"></div>
                  <span>Unit internal mengajukan</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                  <span>DKUI koordinasi</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="h-2 w-2 rounded-full bg-purple-500"></div>
                  <span>Review & approval</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="h-2 w-2 rounded-full bg-teal-500"></div>
                  <span>Finalisasi dokumen</span>
                </div>
              </div>
              
              <Button 
                onClick={() => setSelectedWorkflow('internal')}
                variant="outline"
                className="w-full"
                size="lg"
                disabled
              >
                Segera Hadir
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Features Section */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-blue-600 font-bold">1</span>
                </div>
                Interaktif
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Navigasi step-by-step dengan tombol klik untuk mengikuti alur proses secara detail
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                  <span className="text-green-600 font-bold">2</span>
                </div>
                Visual Jelas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Setiap aktor dan proses ditampilkan dengan warna berbeda untuk memudahkan pemahaman
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
                  <span className="text-purple-600 font-bold">3</span>
                </div>
                Kondisi Gateway
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Simulasi keputusan approval atau rejection untuk melihat alur berbeda yang mungkin terjadi
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Footer Info */}
        <div className="mt-12 text-center text-sm text-muted-foreground">
          <p>Sistem Presentasi Alur Kerja Sama • Universitas Indonesia</p>
          <p className="mt-1">Untuk keperluan presentasi kepada stakeholder</p>
        </div>
      </div>
    </div>
  );
}
