'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  LogIn, 
  ArrowRight, 
  Info,
  Lightbulb,
  Users,
  Building2
} from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function DemoMitraLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const scenario = searchParams.get('scenario') || 'approve';
  
  const [showTutorial, setShowTutorial] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Auto-fill untuk demo
  useEffect(() => {
    setTimeout(() => {
      setEmail('partnership@google.com');
      setPassword('demo123');
    }, 1000);
  }, []);

  const handleLogin = () => {
    // Redirect ke submit proposal
    router.push(`/demo/mitra/submit?scenario=${scenario}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Tutorial Overlay */}
        {showTutorial && (
          <Alert className="border-2 border-blue-500 bg-blue-50 shadow-lg animate-in fade-in slide-in-from-top-4">
            <Lightbulb className="h-5 w-5 text-blue-600" />
            <AlertDescription className="text-blue-900">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <strong className="block mb-2">📍 Step 1/8 - Login sebagai Mitra External</strong>
                  <p className="text-sm mb-2">
                    Anda adalah <strong>{scenario === 'approve' ? 'Google Inc.' : 'StartupXYZ'}</strong> yang ingin 
                    mengajukan kerja sama dengan universitas. Sistem sudah mengisi kredensial untuk Anda.
                  </p>
                  <p className="text-xs text-blue-700">
                    ⏱️ Estimasi: 5 menit | Selanjutnya: Submit Proposal
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

        {/* Scenario Badge */}
        <div className="flex items-center justify-between">
          <Badge className={`${
            scenario === 'approve' ? 'bg-green-600' : 'bg-red-600'
          } text-white text-sm px-4 py-2`}>
            {scenario === 'approve' ? '✅ Skenario: Disetujui' : '❌ Skenario: Ditolak'}
          </Badge>
          <Badge variant="outline" className="text-orange-700 border-orange-300">
            <Users className="h-3 w-3 mr-1" />
            Anda: Mitra External
          </Badge>
        </div>

        {/* Main Login Card */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Left: Login Form */}
          <Card className="border-2 border-orange-300">
            <CardHeader className="bg-gradient-to-r from-orange-50 to-red-50">
              <CardTitle className="flex items-center gap-2 text-orange-900">
                <LogIn className="h-6 w-6" />
                Portal Mitra External
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Organisasi</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="partnership@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="border-orange-200 focus:border-orange-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="border-orange-200 focus:border-orange-500"
                />
              </div>

              <Alert className="bg-orange-50 border-orange-200">
                <Info className="h-4 w-4 text-orange-600" />
                <AlertDescription className="text-orange-800 text-xs">
                  Demo Mode: Kredensial sudah diisi otomatis. Klik "Login" untuk lanjut.
                </AlertDescription>
              </Alert>

              <Button
                onClick={handleLogin}
                disabled={!email || !password}
                className="w-full bg-orange-600 hover:bg-orange-700"
                size="lg"
              >
                Login ke Portal
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>

              <div className="text-center text-xs text-muted-foreground pt-2">
                Belum punya akun? <a href="#" className="text-orange-600 hover:underline">Daftar di sini</a>
              </div>
            </CardContent>
          </Card>

          {/* Right: Info Panel */}
          <div className="space-y-4">
            <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
              <CardHeader>
                <CardTitle className="text-base text-blue-900">
                  <Building2 className="h-5 w-5 inline mr-2" />
                  Tentang Portal Mitra
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-blue-800 space-y-2">
                <p>
                  Portal ini memungkinkan organisasi external (perusahaan, universitas luar negeri, 
                  NGO, dll) untuk mengajukan proposal kerja sama dengan Universitas Indonesia.
                </p>
                <div className="pt-2 space-y-1 text-xs">
                  <div>✓ Submit proposal online</div>
                  <div>✓ Track status real-time</div>
                  <div>✓ Digital signature</div>
                  <div>✓ Dokumen terarsip otomatis</div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-purple-200">
              <CardHeader>
                <CardTitle className="text-base">Profil Demo Anda</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Organisasi:</span>
                  <span className="font-semibold">
                    {scenario === 'approve' ? 'Google Inc.' : 'StartupXYZ'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Jenis Kerja Sama:</span>
                  <span className="font-semibold">
                    {scenario === 'approve' ? 'Magang Mahasiswa' : 'Penelitian Bersama'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Kategori:</span>
                  <span className="font-semibold">Internasional</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Durasi:</span>
                  <span className="font-semibold">2 tahun</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Progress Indicator */}
        <Card className="bg-gray-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between text-xs">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-2 w-2 rounded-full bg-orange-500 animate-pulse"></div>
                  <span className="font-semibold">Login Portal</span>
                </div>
                <div className="h-1 bg-orange-500 rounded-full w-full"></div>
              </div>
              <div className="flex-1 ml-2">
                <div className="flex items-center gap-2 mb-2 text-muted-foreground">
                  <div className="h-2 w-2 rounded-full bg-gray-300"></div>
                  <span>Submit Proposal</span>
                </div>
                <div className="h-1 bg-gray-200 rounded-full w-full"></div>
              </div>
              <div className="flex-1 ml-2">
                <div className="flex items-center gap-2 mb-2 text-muted-foreground">
                  <div className="h-2 w-2 rounded-full bg-gray-300"></div>
                  <span>DKUI Review</span>
                </div>
                <div className="h-1 bg-gray-200 rounded-full w-full"></div>
              </div>
              <div className="flex-1 ml-2">
                <div className="flex items-center gap-2 mb-2 text-muted-foreground">
                  <div className="h-2 w-2 rounded-full bg-gray-300"></div>
                  <span>...</span>
                </div>
                <div className="h-1 bg-gray-200 rounded-full w-full"></div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Exit Demo */}
        <div className="text-center">
          <Button onClick={() => router.push('/demo')} variant="outline">
            ← Keluar dari Demo
          </Button>
        </div>
      </div>
    </div>
  );
}
