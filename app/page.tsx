"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2, Sparkles, FileText, Shield, ArrowRight } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function HomePage() {
  const { user } = useAuth()
  const router = useRouter()

  // Redirect jika sudah login
  useEffect(() => {
    if (user) {
      router.push("/dashboard")
    }
  }, [user, router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-amber-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#003d7a] to-[#005bb5] rounded-lg flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-[#003d7a]">DKUI UPI</h1>
              <p className="text-xs text-gray-600">Sistem Kerjasama</p>
            </div>
          </div>
          <Link href="/login">
            <Button variant="outline" className="border-[#003d7a] text-[#003d7a] hover:bg-[#003d7a] hover:text-white">
              Login
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 lg:py-24">
        <div className="text-center max-w-4xl mx-auto">
          <div className="inline-block mb-4 px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
            ✨ Sistem Terintegrasi & Otomatis
          </div>
          <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6">
            Ajukan Kerjasama dengan
            <span className="text-[#003d7a]"> Universitas Pendidikan Indonesia</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Proses pengajuan kerjasama yang mudah, cepat, dan transparan. Mulai dari submission hingga penandatanganan MoU/MoA digital.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/submit-proposal">
              <Button size="lg" className="bg-[#003d7a] hover:bg-[#002d5a] text-white px-8 py-6 text-lg">
                <FileText className="w-5 h-5 mr-2" />
                Ajukan Kerjasama Baru
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <div className="flex gap-3">
              <Link href="/login">
                <Button size="lg" variant="outline" className="border-2 border-[#003d7a] text-[#003d7a] hover:bg-[#003d7a] hover:text-white px-6 py-6 text-lg">
                  Login
                </Button>
              </Link>
              <Link href="/register">
                <Button size="lg" variant="outline" className="border-2 border-amber-600 text-amber-600 hover:bg-amber-600 hover:text-white px-6 py-6 text-lg">
                  Daftar Akun Staff
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">Keunggulan Sistem Kami</h2>
        
        <div className="grid md:grid-cols-3 gap-8">
          <Card className="border-2 hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <CardTitle>Mudah & Cepat</CardTitle>
              <CardDescription>
                Submit proposal dalam 5 menit tanpa perlu registrasi terlebih dahulu
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
              </div>
              <CardTitle>Tracking Real-time</CardTitle>
              <CardDescription>
                Pantau progress proposal Anda kapan saja melalui dashboard setelah approved
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-amber-600" />
              </div>
              <CardTitle>Aman & Transparan</CardTitle>
              <CardDescription>
                Email notification otomatis di setiap tahap review dan approval
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* How It Works */}
      <section className="container mx-auto px-4 py-16 bg-white/50 rounded-3xl mb-16">
        <h2 className="text-3xl font-bold text-center mb-12">Cara Kerja</h2>
        
        <div className="max-w-3xl mx-auto space-y-8">
          <div className="flex gap-6 items-start">
            <div className="flex-shrink-0 w-12 h-12 bg-[#003d7a] text-white rounded-full flex items-center justify-center font-bold text-xl">
              1
            </div>
            <div>
              <h3 className="text-xl font-bold mb-2">Submit Proposal</h3>
              <p className="text-gray-600">
                Isi form proposal kerjasama dengan data institusi dan email Anda. Tidak perlu membuat akun terlebih dahulu.
              </p>
            </div>
          </div>

          <div className="flex gap-6 items-start">
            <div className="flex-shrink-0 w-12 h-12 bg-[#003d7a] text-white rounded-full flex items-center justify-center font-bold text-xl">
              2
            </div>
            <div>
              <h3 className="text-xl font-bold mb-2">Review oleh DKUI & Fakultas</h3>
              <p className="text-gray-600">
                Tim DKUI akan meneruskan proposal ke fakultas terkait untuk review substansi dan kelayakan.
              </p>
            </div>
          </div>

          <div className="flex gap-6 items-start">
            <div className="flex-shrink-0 w-12 h-12 bg-[#003d7a] text-white rounded-full flex items-center justify-center font-bold text-xl">
              3
            </div>
            <div>
              <h3 className="text-xl font-bold mb-2">Terima Kredensial Login</h3>
              <p className="text-gray-600">
                Jika proposal disetujui, Anda akan menerima email dengan password untuk login ke dashboard.
              </p>
            </div>
          </div>

          <div className="flex gap-6 items-start">
            <div className="flex-shrink-0 w-12 h-12 bg-[#003d7a] text-white rounded-full flex items-center justify-center font-bold text-xl">
              4
            </div>
            <div>
              <h3 className="text-xl font-bold mb-2">Track & Finalisasi</h3>
              <p className="text-gray-600">
                Login ke dashboard untuk melihat progress, upload revisi, dan tanda tangan digital MoU/MoA.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 py-16">
        <Card className="bg-gradient-to-r from-[#003d7a] to-[#005bb5] border-0 text-white">
          <CardContent className="py-12 text-center">
            <h2 className="text-3xl font-bold mb-4">Siap Memulai Kerjasama?</h2>
            <p className="text-xl mb-8 text-blue-100">
              Ajukan proposal Anda sekarang dan kami akan segera memprosesnya
            </p>
            <Link href="/submit-proposal">
              <Button size="lg" variant="secondary" className="bg-white text-[#003d7a] hover:bg-gray-100 px-8 py-6 text-lg">
                <FileText className="w-5 h-5 mr-2" />
                Mulai Ajukan Proposal
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t bg-gray-50 py-8">
        <div className="container mx-auto px-4 text-center text-gray-600">
          <p className="mb-2">© 2026 DKUI - Universitas Pendidikan Indonesia</p>
          <p className="text-sm">Sistem Manajemen Kerjasama Terintegrasi</p>
        </div>
      </footer>
    </div>
  )
}
