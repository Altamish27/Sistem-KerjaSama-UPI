'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Upload,
  FileText,
  Cpu,
  Save,
  Share2,
  CheckSquare,
  FilePlus,
  PenTool,
  Send,
  CheckCircle,
  Eye,
  Archive,
  Repeat,
  Clock,
  User,
  Building2,
  AlertCircle,
  Inbox,
  Calendar,
  Users,
  Sparkles,
  ThumbsUp,
  ThumbsDown,
  Paperclip,
  Scale,
  Stamp,
  UserCheck,
  Mail,
  XCircle,
  AlertTriangle
} from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';

// Komponen Monitoring Bar
function MonitoringBar({ currentStep, totalSteps, timeline }: any) {
  const progress = (currentStep / totalSteps) * 100;

  return (
    <Card className="border-2 border-blue-500 bg-gradient-to-r from-blue-50 to-indigo-50">
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-blue-900">📊 Monitoring Proses Real-Time</h3>
            <Badge className="bg-blue-600 text-white">
              Step {currentStep} dari {totalSteps}
            </Badge>
          </div>
          
          <Progress value={progress} className="h-3" />
          
          <div className="grid grid-cols-5 gap-2 text-xs">
            {timeline.map((phase: any, idx: number) => (
              <div 
                key={idx}
                className={`p-2 rounded-lg text-center transition-all ${
                  phase.status === 'completed' 
                    ? 'bg-green-500 text-white' 
                    : phase.status === 'active'
                    ? 'bg-blue-500 text-white animate-pulse'
                    : 'bg-gray-200 text-gray-500'
                }`}
              >
                <div className="font-bold">{phase.actor}</div>
                <div className="text-[10px] mt-1">{phase.label}</div>
                {phase.time && (
                  <div className="text-[9px] mt-1 opacity-80">
                    <Clock className="h-2 w-2 inline mr-1" />
                    {phase.time}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function DemoFlowPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialStep = parseInt(searchParams.get('step') || '1');
  
  const [currentStep, setCurrentStep] = useState(initialStep);
  const [timeline, setTimeline] = useState<any[]>([]);
  const [processing, setProcessing] = useState(false);
  const [decision, setDecision] = useState<'approve' | 'reject' | null>(null);

  // Definisi alur lengkap sesuai BPMN
  const flowSteps = [
    // MITRA
    { id: 1, actor: 'MITRA', label: 'Submit Proposal', icon: Upload, type: 'activity', nextStep: 2 },
    
    // DKUI
    { id: 2, actor: 'DKUI', label: 'Terima Proposal', icon: FileText, type: 'activity', nextStep: 3 },
    { id: 3, actor: 'DKUI', label: 'Ringkas Proposal (AI)', icon: Cpu, type: 'activity', nextStep: 4 },
    { id: 4, actor: 'DKUI', label: 'Simpan Database', icon: Save, type: 'activity', nextStep: 5 },
    { id: 5, actor: 'DKUI', label: 'Salurkan ke Fakultas', icon: Share2, type: 'activity', nextStep: 6 },
    
    // FAKULTAS
    { id: 6, actor: 'FAKULTAS', label: 'Verifikasi Substansi', icon: CheckSquare, type: 'activity', nextStep: 7 },
    { id: 7, actor: 'FAKULTAS', label: 'Keputusan: Disetujui?', icon: CheckCircle, type: 'gateway', 
      approveNext: 8, rejectNext: 99 },
    
    // APPROVE PATH - LEGAL (DKUI)
    { id: 8, actor: 'LEGAL', label: 'Legal Draft Dokumen', icon: FilePlus, type: 'activity', nextStep: 9 },
    { id: 9, actor: 'LEGAL', label: 'Paraf Kepala Divisi Legal', icon: PenTool, type: 'paraf', nextStep: 10 },
    { id: 10, actor: 'LEGAL', label: 'Kirim ke Biro Hukum', icon: Send, type: 'activity', nextStep: 11 },
    
    // BIRO HUKUM
    { id: 11, actor: 'BIRO_HUKUM', label: 'Validasi & Paraf Biro Hukum', icon: PenTool, type: 'paraf', nextStep: 12 },
    { id: 12, actor: 'BIRO_HUKUM', label: 'Keputusan: Valid?', icon: CheckCircle, type: 'gateway',
      approveNext: 13, rejectNext: 8 }, // reject = kembali ke draft
    { id: 13, actor: 'DKUI', label: 'Gateway Paralel', icon: Share2, type: 'activity', nextStep: 14 },
    
    // PARALEL A: MITRA
    { id: 14, actor: 'MITRA', label: 'Review Dokumen', icon: Eye, type: 'activity', nextStep: 15 },
    { id: 15, actor: 'MITRA', label: 'TTD & Materai', icon: PenTool, type: 'sign', nextStep: 16 },
    { id: 16, actor: 'MITRA', label: 'Kirim ke DKUI', icon: Send, type: 'activity', nextStep: 20 },
    
    // PARALEL B: SUPERVISI (fast forward untuk demo)
    { id: 17, actor: 'SUPERVISI', label: 'Warek Review & Sign', icon: PenTool, type: 'sign', nextStep: 18 },
    { id: 18, actor: 'SUPERVISI', label: 'Rektor Review & Sign', icon: PenTool, type: 'sign', nextStep: 19 },
    { id: 19, actor: 'SUPERVISI', label: 'Materai Rektor', icon: FileText, type: 'activity', nextStep: 20 },
    
    // GABUNG PARALEL
    { id: 20, actor: 'DKUI', label: 'Terima Dok Mitra & Rektor', icon: FileText, type: 'activity', nextStep: 21 },
    { id: 21, actor: 'DKUI', label: 'Pertukaran Dokumen Final', icon: Repeat, type: 'activity', nextStep: 22 },
    { id: 22, actor: 'DKUI', label: 'Arsipkan Dokumen', icon: Archive, type: 'activity', nextStep: 23 },
    { id: 23, actor: 'DKUI', label: '✅ Proses Selesai', icon: CheckCircle, type: 'end', nextStep: null },
    
    // REJECT PATH
    { id: 99, actor: 'DKUI', label: 'Kirim Feedback Penolakan', icon: Send, type: 'activity', nextStep: 100 },
    { id: 100, actor: 'MITRA', label: '❌ Terima Penolakan', icon: AlertCircle, type: 'end', nextStep: null },
  ];

  const currentStepData = flowSteps.find(s => s.id === currentStep);

  // Initialize timeline
  useEffect(() => {
    const initTimeline = [
      { actor: 'MITRA', label: 'Submit', status: currentStep >= 1 ? 'completed' : 'pending', time: currentStep >= 1 ? '14:30' : null },
      { actor: 'DKUI', label: 'Process', status: currentStep >= 2 && currentStep <= 5 ? 'active' : currentStep > 5 ? 'completed' : 'pending', time: currentStep >= 2 ? '15:00' : null },
      { actor: 'FAKULTAS', label: 'Review', status: currentStep >= 6 && currentStep <= 7 ? 'active' : currentStep > 7 ? 'completed' : 'pending', time: currentStep >= 6 ? '10:00+3d' : null },
      { actor: 'LEGAL + BIRO', label: 'Legal & Biro Hukum', status: currentStep >= 8 && currentStep <= 13 ? 'active' : currentStep > 13 ? 'completed' : 'pending', time: currentStep >= 8 ? '16:00+2d' : null },
      { actor: 'FINAL', label: 'Sign & Archive', status: currentStep >= 14 ? 'active' : 'pending', time: currentStep >= 14 ? '09:00+5d' : null },
    ];
    setTimeline(initTimeline);
  }, [currentStep]);

  const handleNext = (nextStepId?: number) => {
    setProcessing(true);
    setTimeout(() => {
      const next = nextStepId || currentStepData?.nextStep;
      if (next) {
        setCurrentStep(next);
        router.push(`/demo/flow?step=${next}`);
      }
      setProcessing(false);
    }, 1000);
  };

  const handleGatewayDecision = (isApprove: boolean) => {
    setDecision(isApprove ? 'approve' : 'reject');
    const next = isApprove ? currentStepData?.approveNext : currentStepData?.rejectNext;
    setTimeout(() => {
      handleNext(next);
      setDecision(null); // Reset decision untuk gateway berikutnya
    }, 1500);
  };

  // State untuk form UI yang realistis
  const [formData, setFormData] = useState({
    title: 'Program Magang Mahasiswa di Google Indonesia',
    category: 'Magang',
    faculty: 'Fakultas Ilmu Komputer',
    duration: '2',
    description: 'Google Indonesia bermaksud membuka kesempatan magang untuk 20 mahasiswa terbaik...',
    feedback: ''
  });
  const [aiProgress, setAiProgress] = useState(0);

  const renderStepContent = () => {
    const Icon = currentStepData?.icon || FileText;

    // Step 1: MITRA Submit Proposal dengan FORM LENGKAP
    if (currentStep === 1) {
      return (
        <Card className="border-2 border-orange-200">
          <CardHeader className="bg-gradient-to-r from-orange-50 to-amber-50">
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Submit Proposal Kerja Sama
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            <Alert className="bg-blue-50 border-blue-200">
              <Users className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-sm">
                <strong>Anda berperan sebagai:</strong> Google Inc. - Mitra Eksternal | 
                <strong> Tugas:</strong> Mengisi dan submit proposal kerja sama
              </AlertDescription>
            </Alert>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Judul Kerja Sama *</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="border-orange-200"
                />
              </div>

              <div className="space-y-2">
                <Label>Kategori Kerja Sama *</Label>
                <Select value={formData.category} onValueChange={(v) => setFormData({...formData, category: v})}>
                  <SelectTrigger className="border-orange-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Magang">Magang</SelectItem>
                    <SelectItem value="Penelitian">Penelitian</SelectItem>
                    <SelectItem value="Pertukaran">Pertukaran Mahasiswa</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Fakultas Tujuan *</Label>
                <Select value={formData.faculty} onValueChange={(v) => setFormData({...formData, faculty: v})}>
                  <SelectTrigger className="border-orange-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Fakultas Ilmu Komputer">Fakultas Ilmu Komputer</SelectItem>
                    <SelectItem value="Fakultas Ekonomi">Fakultas Ekonomi</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Durasi (tahun) *</Label>
                <Input
                  type="number"
                  value={formData.duration}
                  onChange={(e) => setFormData({...formData, duration: e.target.value})}
                  className="border-orange-200"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Deskripsi Proposal *</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                rows={4}
                className="border-orange-200"
              />
            </div>

            <div className="border-2 border-dashed border-orange-300 rounded-lg p-6 text-center bg-orange-50">
              <Upload className="h-12 w-12 mx-auto text-orange-400 mb-3" />
              <Badge className="bg-green-100 text-green-700">
                ✓ proposal_google_magang.pdf (2.4 MB)
              </Badge>
            </div>

            <Button onClick={() => handleNext()} className="w-full bg-orange-600 hover:bg-orange-700" size="lg">
              <Upload className="mr-2 h-5 w-5" />
              Submit Proposal ke DKUI
            </Button>
          </CardContent>
        </Card>
      );
    }

    // Step 2-5: DKUI Processing dengan UI yang berbeda
    if (currentStep === 2) {
      return (
        <Card className="border-2 border-blue-200">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
            <CardTitle className="flex items-center gap-2">
              <Inbox className="h-5 w-5" />
              DKUI - Terima Proposal Baru
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <Alert className="bg-blue-50 border-blue-200">
              <Users className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-sm">
                <strong>Anda berperan sebagai:</strong> Staff DKUI | 
                <strong> Tugas:</strong> Menerima dan memproses proposal yang masuk
              </AlertDescription>
            </Alert>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">ID Proposal:</span>
                <p className="font-semibold">PROP-2025-001</p>
              </div>
              <div>
                <span className="text-muted-foreground">Mitra:</span>
                <p className="font-semibold flex items-center gap-1">
                  <Building2 className="h-4 w-4" />
                  Google Inc.
                </p>
              </div>
              <div>
                <span className="text-muted-foreground">Kategori:</span>
                <p className="font-semibold">{formData.category}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Diterima:</span>
                <p className="font-semibold flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  21 Des 2025, 14:30
                </p>
              </div>
            </div>

            <div className="pt-4 border-t">
              <h4 className="font-semibold mb-2">Judul:</h4>
              <p className="text-sm">{formData.title}</p>
            </div>

            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
              <FileText className="h-8 w-8 text-red-500" />
              <div className="flex-1">
                <p className="text-sm font-medium">proposal_google_magang.pdf</p>
                <p className="text-xs text-muted-foreground">2.4 MB</p>
              </div>
              <Button size="sm" variant="outline">Download</Button>
            </div>

            <Button onClick={() => handleNext()} className="w-full bg-blue-600" size="lg">
              Proses ke Tahap Berikutnya
            </Button>
          </CardContent>
        </Card>
      );
    }

    if (currentStep === 3) {
      return (
        <Card className="border-2 border-purple-300">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50">
            <CardTitle className="flex items-center gap-2">
              <Cpu className="h-5 w-5 animate-pulse" />
              DKUI - Ringkas Proposal dengan AI
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <Alert className="bg-purple-50 border-purple-200">
              <Sparkles className="h-4 w-4 text-purple-600" />
              <AlertDescription className="text-sm">
                <strong>AI Processing:</strong> Sistem sedang menganalisis proposal menggunakan AI...
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress Analisis</span>
                <span className="font-semibold">{aiProgress}%</span>
              </div>
              <Progress value={aiProgress} className="h-2" />
            </div>

            {aiProgress === 100 && (
              <div className="p-4 rounded-lg text-sm bg-green-50 border border-green-200 animate-in fade-in">
                <p className="mb-2">
                  🤖 <strong>AI Summary:</strong> Google Indonesia mengajukan kerja sama magang untuk 20 mahasiswa FIlkom dengan durasi 6 bulan.
                </p>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>Training teknologi cloud computing & machine learning</li>
                  <li>Mentoring dari senior engineer Google</li>
                  <li>Sertifikasi profesional Google Cloud</li>
                </ul>
                <p className="mt-3 text-green-700 font-semibold">
                  ✅ Rekomendasi AI: DISETUJUI (skor relevansi: 9.2/10)
                </p>
              </div>
            )}

            <Button 
              onClick={() => {
                if (aiProgress < 100) {
                  const interval = setInterval(() => {
                    setAiProgress(p => {
                      if (p >= 100) {
                        clearInterval(interval);
                        return 100;
                      }
                      return p + 10;
                    });
                  }, 200);
                } else {
                  handleNext();
                }
              }}
              className="w-full bg-purple-600"
              size="lg"
            >
              {aiProgress < 100 ? 'Mulai Analisis AI' : 'Lanjut ke Step Berikutnya'}
            </Button>
          </CardContent>
        </Card>
      );
    }

    // Step 6: FAKULTAS Review dengan UI lengkap
    if (currentStep === 6) {
      return (
        <Card className="border-2 border-green-200">
          <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
            <CardTitle className="flex items-center gap-2">
              <CheckSquare className="h-5 w-5" />
              Fakultas - Verifikasi Substansi Proposal
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            <Alert className="bg-blue-50 border-blue-200">
              <Users className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-sm">
                <strong>Anda berperan sebagai:</strong> Kaprodi Fakultas Ilmu Komputer | 
                <strong> Tugas:</strong> Review dan verifikasi substansi proposal
              </AlertDescription>
            </Alert>

            {/* Proposal Details */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Mitra:</span>
                <p className="font-semibold">Google Inc.</p>
              </div>
              <div>
                <span className="text-muted-foreground">Kategori:</span>
                <p className="font-semibold">{formData.category}</p>
              </div>
            </div>

            <div className="pt-4 border-t">
              <h4 className="font-semibold mb-2">Judul:</h4>
              <p className="text-sm">{formData.title}</p>
            </div>

            <div className="p-4 rounded-lg text-sm bg-green-50 border border-green-200">
              <p className="mb-2">
                🤖 <strong>Ringkasan AI:</strong> Google Indonesia mengajukan program magang untuk 20 mahasiswa dengan durasi 6 bulan.
              </p>
              <ul className="list-disc list-inside space-y-1 text-xs">
                <li>Training teknologi cloud computing & machine learning</li>
                <li>Mentoring dari senior engineer Google</li>
                <li>Sertifikasi profesional Google Cloud</li>
              </ul>
              <p className="mt-3 text-green-700 font-semibold">
                ✅ Rekomendasi AI: DISETUJUI (skor relevansi: 9.2/10)
              </p>
            </div>

            <div className="space-y-2">
              <Label>Catatan Verifikasi</Label>
              <Textarea
                value={formData.feedback}
                onChange={(e) => setFormData({...formData, feedback: e.target.value})}
                rows={3}
                placeholder="Tambahkan catatan atau feedback..."
                className="border-green-200"
              />
            </div>

            <Alert className="bg-yellow-50 border-yellow-200">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-sm">
                Step berikutnya adalah <strong>Gateway Keputusan</strong>. Anda akan diminta untuk memutuskan: SETUJUI atau TOLAK.
              </AlertDescription>
            </Alert>

            <Button onClick={() => handleNext()} className="w-full bg-green-600" size="lg">
              Lanjut ke Keputusan
            </Button>
          </CardContent>
        </Card>
      );
    }

    // Gateway (Decision Point)
    if (currentStepData?.type === 'gateway') {
      return (
        <Card className="border-4 border-yellow-500">
          <CardHeader className="bg-gradient-to-r from-yellow-50 to-amber-50">
            <CardTitle className="flex items-center gap-2">
              <Icon className="h-6 w-6" />
              {currentStepData.label}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <Alert className="bg-yellow-50 border-yellow-300">
              <AlertCircle className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-yellow-900">
                <strong>Gateway Keputusan:</strong> Pilih salah satu untuk melanjutkan proses
              </AlertDescription>
            </Alert>

            <div className="grid grid-cols-2 gap-4">
              <Button
                onClick={() => handleGatewayDecision(true)}
                disabled={decision !== null}
                className="h-32 bg-green-600 hover:bg-green-700 flex flex-col gap-3"
                size="lg"
              >
                <ThumbsUp className="h-12 w-12" />
                <span className="text-lg font-bold">✅ SETUJUI</span>
                <span className="text-xs opacity-90">Lanjut ke proses berikutnya</span>
              </Button>

              <Button
                onClick={() => handleGatewayDecision(false)}
                disabled={decision !== null}
                className="h-32 bg-red-600 hover:bg-red-700 flex flex-col gap-3"
                size="lg"
              >
                <ThumbsDown className="h-12 w-12" />
                <span className="text-lg font-bold">❌ TOLAK</span>
                <span className="text-xs opacity-90">Kirim feedback penolakan</span>
              </Button>
            </div>

            {decision && (
              <Alert className={decision === 'approve' ? 'bg-green-50 border-green-300' : 'bg-red-50 border-red-300'}>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  Keputusan: <strong>{decision === 'approve' ? 'DISETUJUI' : 'DITOLAK'}</strong> - Memproses...
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      );
    }

    // Paraf / Digital Sign
    if (currentStepData?.type === 'paraf' || currentStepData?.type === 'sign') {
      return (
        <Card className="border-4 border-purple-500">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50">
            <CardTitle className="flex items-center gap-2">
              <PenTool className="h-6 w-6" />
              {currentStepData.label}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            {/* Document Preview */}
            <div className="border-2 border-dashed border-purple-300 rounded-lg p-6 bg-white">
              <div className="text-center mb-4">
                <h4 className="font-bold text-lg">MEMORANDUM OF UNDERSTANDING</h4>
                <p className="text-sm text-muted-foreground mt-2">Program Magang Mahasiswa Google Inc.</p>
              </div>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>Pasal 1 - Tujuan Kerja Sama</p>
                <p>Pasal 2 - Ruang Lingkup</p>
                <p>Pasal 3 - Hak dan Kewajiban</p>
                <p>...</p>
              </div>
            </div>

            {/* Signature Area */}
            <div className="border-4 border-purple-300 rounded-lg p-6 bg-purple-50">
              <div className="text-center space-y-4">
                <div className="flex items-center justify-center gap-2 text-purple-900">
                  <User className="h-5 w-5" />
                  <span className="font-semibold">{currentStepData.actor}</span>
                </div>
                
                <div className="bg-white border-2 border-purple-400 rounded-lg p-6 h-32 flex items-center justify-center">
                  <div className="text-center text-purple-400">
                    <PenTool className="h-12 w-12 mx-auto mb-2" />
                    <p className="text-sm">Area Tanda Tangan Digital</p>
                  </div>
                </div>

                <Button
                  onClick={() => handleNext()}
                  disabled={processing}
                  className="w-full bg-purple-600 hover:bg-purple-700"
                  size="lg"
                >
                  {processing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                      Memproses Paraf...
                    </>
                  ) : (
                    <>
                      <PenTool className="mr-2 h-5 w-5" />
                      Bubuhkan {currentStepData.type === 'paraf' ? 'Paraf' : 'Tanda Tangan'} Digital
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      );
    }

    // Step 8: Legal Draft dengan UI lengkap
    if (currentStep === 8) {
      return (
        <Card className="border-2 border-indigo-200">
          <CardHeader className="bg-gradient-to-r from-indigo-50 to-blue-50">
            <CardTitle className="flex items-center gap-2">
              <FilePlus className="h-5 w-5" />
              DKUI - Legal Draft Dokumen MoU
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <Alert className="bg-blue-50 border-blue-200">
              <Users className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-sm">
                <strong>Anda berperan sebagai:</strong> Legal DKUI | 
                <strong> Tugas:</strong> Menyusun draft dokumen Memorandum of Understanding
              </AlertDescription>
            </Alert>

            <div className="border-2 border-indigo-200 rounded-lg p-6 bg-white space-y-4">
              <div className="text-center">
                <h3 className="font-bold text-xl mb-2">MEMORANDUM OF UNDERSTANDING</h3>
                <p className="text-sm text-muted-foreground">Antara Universitas Indonesia dengan Google Inc.</p>
              </div>
              
              <div className="space-y-3 text-sm">
                <div>
                  <h4 className="font-semibold">PASAL 1 - TUJUAN</h4>
                  <p className="text-muted-foreground mt-1">
                    Kerja sama ini bertujuan untuk menyelenggarakan program magang mahasiswa...
                  </p>
                </div>
                
                <div>
                  <h4 className="font-semibold">PASAL 2 - RUANG LINGKUP</h4>
                  <p className="text-muted-foreground mt-1">
                    Program magang untuk 20 mahasiswa Fakultas Ilmu Komputer dengan durasi 6 bulan...
                  </p>
                </div>
                
                <div>
                  <h4 className="font-semibold">PASAL 3 - HAK DAN KEWAJIBAN</h4>
                  <p className="text-muted-foreground mt-1">
                    Pihak pertama berkewajiban menyediakan mentor, training, dan sertifikasi...
                  </p>
                </div>

                <div className="text-center text-muted-foreground">
                  <p>... (15 pasal lainnya)</p>
                </div>
              </div>
            </div>

            <Alert className="bg-green-50 border-green-200">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-sm">
                Draft dokumen telah selesai disusun berdasarkan template legal universitas
              </AlertDescription>
            </Alert>

            <Button onClick={() => handleNext()} className="w-full bg-indigo-600" size="lg">
              <FilePlus className="mr-2 h-5 w-5" />
              Simpan Draft & Lanjut ke Paraf
            </Button>
          </CardContent>
        </Card>
      );
    }

    // Step 14: Mitra Review dengan UI lengkap
    if (currentStep === 14) {
      return (
        <Card className="border-2 border-orange-200">
          <CardHeader className="bg-gradient-to-r from-orange-50 to-amber-50">
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Mitra - Review Dokumen MoU
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <Alert className="bg-blue-50 border-blue-200">
              <Users className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-sm">
                <strong>Anda berperan sebagai:</strong> Google Inc. | 
                <strong> Tugas:</strong> Review dokumen MoU yang telah di-draft oleh universitas
              </AlertDescription>
            </Alert>

            <div className="border-2 border-orange-200 rounded-lg p-4 bg-white">
              <div className="flex items-center gap-3 mb-3">
                <FileText className="h-10 w-10 text-red-500" />
                <div className="flex-1">
                  <p className="font-semibold">MoU_Google_UI_2025.pdf</p>
                  <p className="text-xs text-muted-foreground">3.2 MB • Sudah diparaf: DKUI, Biro Hukum</p>
                </div>
                <Button size="sm" variant="outline">
                  <Eye className="h-4 w-4 mr-1" />
                  Preview
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-1">
                  <Badge variant="outline" className="text-green-600">✓ DKUI Paraf</Badge>
                </div>
                <div className="flex items-center gap-1">
                  <Badge variant="outline" className="text-green-600">✓ Biro Hukum</Badge>
                </div>
              </div>
            </div>

            <Alert className="bg-green-50 border-green-200">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-sm">
                Dokumen telah direview. Semua pasal sesuai dengan kesepakatan awal. Lanjut ke tahap penandatanganan.
              </AlertDescription>
            </Alert>

            <Button onClick={() => handleNext()} className="w-full bg-orange-600" size="lg">
              <Eye className="mr-2 h-5 w-5" />
              Setuju, Lanjut ke TTD
            </Button>
          </CardContent>
        </Card>
      );
    }

    // Step 99: Reject Feedback
    if (currentStep === 99) {
      return (
        <Card className="border-2 border-red-200">
          <CardHeader className="bg-gradient-to-r from-red-50 to-orange-50">
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              DKUI - Kirim Feedback Penolakan
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <Alert className="bg-red-50 border-red-200">
              <XCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-sm">
                Proposal tidak disetujui oleh Fakultas. Feedback akan dikirim ke mitra.
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Label>Email Tujuan</Label>
              <Input value="partnership@google.com" disabled className="bg-gray-50" />
            </div>

            <div className="space-y-2">
              <Label>Subjek</Label>
              <Input value="Feedback Proposal Kerja Sama" disabled className="bg-gray-50" />
            </div>

            <div className="space-y-2">
              <Label>Isi Feedback</Label>
              <Textarea
                rows={6}
                value="Terima kasih atas proposal kerja sama yang diajukan. Setelah melalui review substansi, kami memutuskan untuk tidak melanjutkan proposal ini karena beberapa pertimbangan..."
                disabled
                className="bg-gray-50"
              />
            </div>

            <Button onClick={() => handleNext()} className="w-full bg-red-600" size="lg">
              <Mail className="mr-2 h-5 w-5" />
              Kirim Feedback Penolakan
            </Button>
          </CardContent>
        </Card>
      );
    }

    // End State
    if (currentStepData?.type === 'end') {
      const isSuccess = currentStep === 23;
      return (
        <Card className={`border-4 ${isSuccess ? 'border-green-500' : 'border-red-500'}`}>
          <CardHeader className={`bg-gradient-to-r ${isSuccess ? 'from-green-50 to-emerald-50' : 'from-red-50 to-orange-50'}`}>
            <CardTitle className="flex items-center gap-2 justify-center text-2xl">
              <Icon className="h-8 w-8" />
              {currentStepData.label}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-4 text-center">
            {isSuccess ? (
              <>
                <Alert className="bg-green-50 border-green-300">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <AlertDescription className="text-lg">
                    Selamat! Dokumen kerja sama telah diarsipkan dan resmi berlaku.
                  </AlertDescription>
                </Alert>

                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <p className="text-muted-foreground">Nomor MoU</p>
                    <p className="font-bold">001/MoU/UI/2025</p>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <p className="text-muted-foreground">Tanggal Berlaku</p>
                    <p className="font-bold">21 Des 2025</p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg">
                    <p className="text-muted-foreground">Durasi</p>
                    <p className="font-bold">2 Tahun</p>
                  </div>
                </div>
              </>
            ) : (
              <Alert className="bg-red-50 border-red-300">
                <XCircle className="h-5 w-5 text-red-600" />
                <AlertDescription className="text-lg">
                  Proposal ditolak. Feedback telah dikirim ke mitra.
                </AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-2 gap-4 pt-4">
              <Button 
                onClick={() => {
                  setCurrentStep(1);
                  setDecision(null);
                  setAiProgress(0);
                }} 
                variant="outline" 
                size="lg"
              >
                🔄 Ulangi Dari Awal
              </Button>
              <Button onClick={() => router.push('/welcome')} size="lg">
                🏠 Kembali ke Beranda
              </Button>
            </div>
          </CardContent>
        </Card>
      );
    }

    // Default Activity untuk step lainnya
    const actorColors: Record<string, string> = {
      'MITRA': 'orange',
      'DKUI': 'blue',
      'FAKULTAS': 'green',
      'LEGAL': 'indigo',
      'BIRO_HUKUM': 'violet',
      'SUPERVISI': 'purple'
    };

    const color = actorColors[currentStepData?.actor || 'DKUI'] || 'blue';

    return (
      <Card className={`border-2 border-${color}-300`}>
        <CardHeader className={`bg-gradient-to-r from-${color}-50 to-${color}-100`}>
          <CardTitle className="flex items-center gap-2">
            <Icon className="h-6 w-6" />
            {currentStepData?.label}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6 space-y-4">
          <Alert className={`bg-blue-50 border-blue-200`}>
            <Icon className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-sm">
              <strong>Peran:</strong> {currentStepData?.actor} | 
              <strong> Aktivitas:</strong> {currentStepData?.label}
            </AlertDescription>
          </Alert>

          <div className="p-8 bg-gradient-to-br from-gray-50 to-white rounded-lg border-2 border-dashed border-gray-300 text-center">
            <Icon className="h-16 w-16 mx-auto text-gray-400 mb-4" />
            <p className="text-sm text-muted-foreground mb-2">
              Proses <strong>{currentStepData?.label}</strong> sedang berjalan...
            </p>
            <div className="flex items-center justify-center gap-2 mt-4">
              <div className="h-2 w-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="h-2 w-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="h-2 w-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>

          <Alert className="bg-yellow-50 border-yellow-200">
            <Clock className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-sm">
              <strong>Info:</strong> Dalam aplikasi real, proses ini memerlukan approval dari {currentStepData?.actor}
            </AlertDescription>
          </Alert>

          <Button
            onClick={() => handleNext()}
            disabled={processing}
            className={`w-full bg-${color}-600 hover:bg-${color}-700`}
            size="lg"
          >
            {processing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                Memproses...
              </>
            ) : (
              <>
                Lanjut ke Step Berikutnya →
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Demo Dashboard - Proses Kerja Sama Universitas
          </h1>
          <p className="text-muted-foreground mt-2">
            Ikuti alur lengkap dari submit hingga arsip dengan monitoring real-time
          </p>
        </div>

        {/* Monitoring Bar */}
        <MonitoringBar 
          currentStep={currentStep}
          totalSteps={23}
          timeline={timeline}
        />

        {/* Main Content */}
        <div className="grid md:grid-cols-4 gap-6">
          {/* Left: Current Step */}
          <div className="md:col-span-3">
            {renderStepContent()}
          </div>

          {/* Right: Info Panel */}
          <div className="space-y-4">
            <Card className="border-blue-200">
              <CardHeader>
                <CardTitle className="text-sm">Current Step</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div>
                  <span className="text-muted-foreground">Step:</span>
                  <p className="font-bold">{currentStep} / 23</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Actor:</span>
                  <Badge className="ml-2">{currentStepData?.actor}</Badge>
                </div>
                <div>
                  <span className="text-muted-foreground">Type:</span>
                  <p className="font-semibold">{currentStepData?.type}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-pink-50">
              <CardHeader>
                <CardTitle className="text-sm">Navigation</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button 
                  onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
                  variant="outline"
                  size="sm"
                  className="w-full"
                  disabled={currentStep === 1}
                >
                  ← Previous
                </Button>
                <Button 
                  onClick={() => setCurrentStep(1)}
                  variant="outline"
                  size="sm"
                  className="w-full"
                >
                  🔄 Reset
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
