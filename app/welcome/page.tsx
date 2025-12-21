import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Presentation, Building2, Users, FileText, CheckCircle, ArrowRight, Zap, BarChart3, Play } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="flex justify-center mb-6">
            <div className="h-20 w-20 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
              <Building2 className="h-10 w-10 text-white" />
            </div>
          </div>
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Sistem Kerja Sama Universitas
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Platform terintegrasi untuk mengelola proposal, tracking, dan dokumentasi kerja sama universitas
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/demo/flow?step=1">
              <Button size="lg" className="gap-2 text-lg px-8 py-6 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 shadow-xl">
                <Play className="h-5 w-5" />
                Demo Dashboard (TERBARU!)
              </Button>
            </Link>
            <Link href="/demo">
              <Button size="lg" variant="outline" className="gap-2 text-lg px-8 py-6 border-2 border-orange-300 hover:bg-orange-50">
                <Presentation className="h-5 w-5" />
                Pilih Skenario Demo
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="gap-2 text-lg px-8 py-6">
                Masuk ke Dashboard
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Features Section */}
        <div className="grid md:grid-cols-4 gap-6 mb-16">
          <Card className="border-2 hover:shadow-lg transition-shadow border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50">
            <CardHeader>
              <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center mb-4">
                <Play className="h-6 w-6 text-blue-600" />
              </div>
              <CardTitle className="flex items-center gap-2">
                Demo Dashboard
                <span className="text-xs bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-2 py-0.5 rounded-full">TERBARU</span>
              </CardTitle>
              <CardDescription>
                Dashboard interaktif LENGKAP dengan monitoring real-time, paraf digital, approve/reject gateway - PERSIS seperti aplikasi asli!
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/demo/flow?step=1">
                <Button variant="default" className="w-full justify-between group bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700">
                  Mulai Demo Dashboard
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="border-2 hover:shadow-lg transition-shadow border-orange-200 bg-gradient-to-br from-orange-50 to-white">
            <CardHeader>
              <div className="h-12 w-12 rounded-lg bg-orange-100 flex items-center justify-center mb-4">
                <Presentation className="h-6 w-6 text-orange-600" />
              </div>
              <CardTitle className="flex items-center gap-2">
                Demo Multi-Page
              </CardTitle>
              <CardDescription>
                Pilih skenario approve atau reject untuk melihat alur multi-halaman dengan tutorial per-step
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/demo">
                <Button variant="ghost" className="w-full justify-between group">
                  Pilih Skenario
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="border-2 hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="h-12 w-12 rounded-lg bg-purple-100 flex items-center justify-center mb-4">
                <FileText className="h-6 w-6 text-purple-600" />
              </div>
              <CardTitle>Workflow Presentasi</CardTitle>
              <CardDescription>
                Lihat alur kerja sama secara interaktif dengan UI mockup lengkap untuk setiap tahapan proses
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/presentation">
                <Button variant="ghost" className="w-full justify-between group">
                  Lihat Workflow
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="border-2 hover:shadow-lg transition-shadow border-green-200 bg-gradient-to-br from-green-50 to-white">
            <CardHeader>
              <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center mb-4">
                <BarChart3 className="h-6 w-6 text-blue-600" />
              </div>
              <CardTitle>Dashboard Statistik</CardTitle>
              <CardDescription>
                Statistik lengkap kerja sama: total, internasional vs nasional, per fakultas, durasi & sisa waktu
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/dashboard">
                <Button variant="ghost" className="w-full justify-between group">
                  Lihat Statistik
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="border-2 hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="h-12 w-12 rounded-lg bg-green-100 flex items-center justify-center mb-4">
                <FileText className="h-6 w-6 text-green-600" />
              </div>
              <CardTitle>Manajemen Proposal</CardTitle>
              <CardDescription>
                Upload, review, dan tracking proposal kerja sama dari berbagai mitra dengan mudah
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/dashboard/proposals">
                <Button variant="ghost" className="w-full justify-between group">
                  Lihat Proposal
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="border-2 hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="h-12 w-12 rounded-lg bg-purple-100 flex items-center justify-center mb-4">
                <Zap className="h-6 w-6 text-purple-600" />
              </div>
              <CardTitle>AI-Powered</CardTitle>
              <CardDescription>
                Ringkasan proposal otomatis menggunakan AI untuk mempercepat proses review
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/dashboard">
                <Button variant="ghost" className="w-full justify-between group">
                  Dashboard
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Process Steps */}
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Alur Kerja Sama</h2>
          <div className="grid md:grid-cols-5 gap-4">
            {[
              { icon: Users, label: 'Mitra Mengajukan', color: 'orange' },
              { icon: FileText, label: 'DKUI Review', color: 'blue' },
              { icon: CheckCircle, label: 'Fakultas Verifikasi', color: 'green' },
              { icon: CheckCircle, label: 'Approval Rektor', color: 'teal' },
              { icon: Building2, label: 'Arsip Dokumen', color: 'purple' }
            ].map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={index} className="text-center">
                  <div className={`h-16 w-16 rounded-full bg-${step.color}-100 flex items-center justify-center mx-auto mb-3`}>
                    <Icon className={`h-8 w-8 text-${step.color}-600`} />
                  </div>
                  <p className="text-sm font-medium">{step.label}</p>
                  <p className="text-xs text-muted-foreground">Step {index + 1}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-20 text-center">
          <Card className="max-w-3xl mx-auto border-2 border-primary/20">
            <CardHeader>
              <CardTitle className="text-2xl">Siap Melihat Demo?</CardTitle>
              <CardDescription className="text-base">
                Klik tombol di bawah untuk melihat presentasi interaktif lengkap dengan UI mockup untuk setiap tahapan
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/presentation">
                <Button size="lg" className="gap-2 text-lg px-12 py-6">
                  <Presentation className="h-6 w-6" />
                  Mulai Presentasi Interaktif
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="mt-16 text-center text-sm text-muted-foreground">
          <p>Sistem Kerja Sama Universitas Indonesia</p>
          <p className="mt-1">© 2025 - Direktorat Kerja Sama UI</p>
        </div>
      </div>
    </div>
  );
}
