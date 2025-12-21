'use client';

import React, { useState } from 'react';
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
  Send,
  CheckSquare,
  FilePlus,
  PenTool,
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
  AlertTriangle,
  FileEdit,
  MessageSquare
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
                className={`p-2 rounded text-center ${
                  phase.status === 'completed' 
                    ? 'bg-green-100 text-green-800' 
                    : phase.status === 'active'
                    ? 'bg-blue-100 text-blue-800 animate-pulse'
                    : 'bg-gray-100 text-gray-500'
                }`}
              >
                <div className="font-semibold">{phase.label}</div>
                <div className="text-xs mt-1">{phase.actor}</div>
                {phase.timestamp && (
                  <div className="text-xs opacity-75 mt-1">{phase.timestamp}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function DemoFlowFakultasPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialStep = parseInt(searchParams.get('step') || '1');
  
  const [currentStep, setCurrentStep] = useState(initialStep);
  const [timeline, setTimeline] = useState<any[]>([]);
  const [processing, setProcessing] = useState(false);
  const [decision, setDecision] = useState<'approve' | 'reject' | null>(null);
  const [formData, setFormData] = useState({
    title: 'Program Pertukaran Mahasiswa dengan Harvard University',
    category: 'Pertukaran',
    partner: 'Harvard University',
    duration: '3',
    description: 'Fakultas Ilmu Komputer mengajukan program pertukaran mahasiswa dengan Harvard...',
    feedback: ''
  });
  const [aiProgress, setAiProgress] = useState(0);

  // Definisi alur lengkap sesuai BPMN Fakultas → Mitra
  const flowSteps = [
    // FAKULTAS
    { id: 1, actor: 'FAKULTAS', label: 'Ajukan Proposal', icon: FilePlus, type: 'activity', nextStep: 2 },
    
    // DKUI
    { id: 2, actor: 'DKUI', label: 'Terima Proposal', icon: Inbox, type: 'activity', nextStep: 3 },
    { id: 3, actor: 'DKUI', label: 'Ringkas Proposal (AI)', icon: Cpu, type: 'activity', nextStep: 4 },
    { id: 4, actor: 'DKUI', label: 'Simpan Database', icon: Save, type: 'activity', nextStep: 5 },
    { id: 5, actor: 'DKUI', label: 'Kirim ke MITRA', icon: Send, type: 'activity', nextStep: 6 },
    
    // MITRA
    { id: 6, actor: 'MITRA', label: 'Review Proposal', icon: Eye, type: 'activity', nextStep: 7 },
    { id: 7, actor: 'MITRA', label: 'Keputusan Mitra: Disetujui?', icon: CheckCircle, type: 'gateway', 
      approveNext: 8, rejectNext: 98 },
    
    // APPROVE PATH - LEGAL (DKUI)
    { id: 8, actor: 'LEGAL', label: 'Susun & Periksa Dokumen', icon: FilePlus, type: 'activity', nextStep: 9 },
    { id: 9, actor: 'LEGAL', label: 'Paraf Kepala Divisi Legal', icon: PenTool, type: 'paraf', nextStep: 10 },
    { id: 10, actor: 'LEGAL', label: 'Kirim ke Biro Hukum', icon: Send, type: 'activity', nextStep: 11 },
    
    // BIRO HUKUM
    { id: 11, actor: 'BIRO_HUKUM', label: 'Validasi dan Paraf Biro Hukum', icon: CheckSquare, type: 'paraf', nextStep: 12 },
    { id: 12, actor: 'BIRO_HUKUM', label: 'Keputusan: Disetujui?', icon: CheckCircle, type: 'gateway',
      approveNext: 13, rejectNext: 8 }, // reject = kembali ke susun dokumen
    
    // DKUI Paralel Gateway
    { id: 13, actor: 'DKUI', label: 'Paralel Pengiriman Dokumen', icon: Repeat, type: 'activity', nextStep: 14 },
    
    // PARALEL A: MITRA
    { id: 14, actor: 'MITRA', label: 'Review Dokumen', icon: Eye, type: 'activity', nextStep: 15 },
    { id: 15, actor: 'MITRA', label: 'Keputusan Dokumen: Valid?', icon: CheckCircle, type: 'gateway',
      approveNext: 16, rejectNext: 99 }, // reject = feedback penolakan dokumen
    { id: 16, actor: 'MITRA', label: 'TTD & Materai', icon: PenTool, type: 'sign', nextStep: 17 },
    { id: 17, actor: 'MITRA', label: 'Kirim Dokumen Bermaterai ke DKUI', icon: Send, type: 'activity', nextStep: 23 },
    
    // PARALEL B: SUPERVISI
    { id: 18, actor: 'SUPERVISI', label: 'Review Wakil Rektor', icon: UserCheck, type: 'activity', nextStep: 19 },
    { id: 19, actor: 'SUPERVISI', label: 'Keputusan Warek: Disetujui?', icon: CheckCircle, type: 'gateway',
      approveNext: 20, rejectNext: 97 }, // reject = feedback ke fakultas
    { id: 20, actor: 'SUPERVISI', label: 'Digital Signing Warek', icon: PenTool, type: 'sign', nextStep: 21 },
    { id: 21, actor: 'SUPERVISI', label: 'Review Rektor', icon: UserCheck, type: 'activity', nextStep: 22 },
    { id: 22, actor: 'SUPERVISI', label: 'Keputusan Rektor: Disetujui?', icon: CheckCircle, type: 'gateway',
      approveNext: 25, rejectNext: 96 }, // reject = feedback ke fakultas
    { id: 25, actor: 'SUPERVISI', label: 'Digital Signing & Materai Rektor', icon: Stamp, type: 'sign', nextStep: 26 },
    { id: 26, actor: 'SUPERVISI', label: 'Kirim Dokumen Bermaterai ke DKUI', icon: Send, type: 'activity', nextStep: 23 },
    
    // GABUNG PARALEL
    { id: 23, actor: 'DKUI', label: 'Terima Dokumen Bermaterai (Mitra & Rektor)', icon: Inbox, type: 'activity', nextStep: 24 },
    { id: 24, actor: 'DKUI', label: 'Pertukaran Dokumen Final', icon: Repeat, type: 'activity', nextStep: 27 },
    { id: 27, actor: 'DKUI', label: 'Arsipkan Dokumen', icon: Archive, type: 'activity', nextStep: 28 },
    { id: 28, actor: 'DKUI', label: '✅ Proses Selesai', icon: CheckCircle, type: 'end', nextStep: null },
    
    // REJECT PATHS
    { id: 96, actor: 'SUPERVISI', label: 'Sampaikan Feedback Penolakan Rektor', icon: MessageSquare, type: 'activity', nextStep: 100 },
    { id: 97, actor: 'SUPERVISI', label: 'Sampaikan Feedback Penolakan Warek', icon: MessageSquare, type: 'activity', nextStep: 100 },
    { id: 98, actor: 'DKUI', label: 'Sampaikan Feedback Penolakan Mitra', icon: MessageSquare, type: 'activity', nextStep: 100 },
    { id: 99, actor: 'DKUI', label: 'Sampaikan Feedback Penolakan Dokumen', icon: MessageSquare, type: 'activity', nextStep: 100 },
    { id: 100, actor: 'FAKULTAS', label: '❌ Terima Feedback Penolakan', icon: XCircle, type: 'end', nextStep: null },
  ];

  const currentStepData = flowSteps.find(s => s.id === currentStep);

  // Initialize timeline
  React.useEffect(() => {
    setTimeline([
      { label: 'Pengajuan', actor: 'FAKULTAS', status: currentStep >= 1 ? 'completed' : 'pending', timestamp: currentStep >= 1 ? '09:00' : '' },
      { label: 'Proses DKUI', actor: 'DKUI', status: currentStep >= 2 && currentStep <= 5 ? 'active' : currentStep > 5 ? 'completed' : 'pending', timestamp: currentStep > 5 ? '10:30' : '' },
      { label: 'Review Mitra', actor: 'MITRA', status: currentStep >= 6 && currentStep <= 7 ? 'active' : currentStep > 7 ? 'completed' : 'pending', timestamp: currentStep > 7 ? '14:00' : '' },
      { label: 'Legal & Biro Hukum', actor: 'Legal + Biro', status: currentStep >= 8 && currentStep <= 12 ? 'active' : currentStep > 12 ? 'completed' : 'pending', timestamp: currentStep > 12 ? '16:00' : '' },
      { label: 'Finalisasi', actor: 'Paralel + Arsip', status: currentStep >= 13 ? 'active' : 'pending', timestamp: '' }
    ]);
  }, [currentStep]);

  const handleNext = (nextStepId?: number) => {
    setProcessing(true);
    const next = nextStepId || currentStepData?.nextStep;
    setTimeout(() => {
      setProcessing(false);
      if (next) {
        setCurrentStep(next);
        router.push(`/demo/flow-fakultas?step=${next}`);
      }
    }, 1500);
  };

  const handleGatewayDecision = (approve: boolean) => {
    setDecision(approve ? 'approve' : 'reject');
    setProcessing(true);
    const next = approve ? currentStepData?.approveNext : currentStepData?.rejectNext;
    setTimeout(() => {
      handleNext(next);
      setDecision(null); // Reset decision untuk gateway berikutnya
    }, 1500);
  };

  const renderStepContent = () => {
    const Icon = currentStepData?.icon || FileText;

    // Step 1: FAKULTAS Ajukan Proposal dengan FORM LENGKAP
    if (currentStep === 1) {
      return (
        <Card className="border-2 border-blue-200">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50">
            <CardTitle className="flex items-center gap-2">
              <FilePlus className="h-5 w-5" />
              Fakultas - Ajukan Proposal Kerja Sama
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            <Alert className="bg-blue-50 border-blue-200">
              <Users className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-sm">
                <strong>Anda berperan sebagai:</strong> Fakultas Ilmu Komputer | 
                <strong> Tugas:</strong> Mengajukan proposal kerja sama ke mitra eksternal
              </AlertDescription>
            </Alert>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Judul Kerja Sama *</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="border-blue-200"
                />
              </div>

              <div className="space-y-2">
                <Label>Kategori *</Label>
                <Select value={formData.category} onValueChange={(v) => setFormData({...formData, category: v})}>
                  <SelectTrigger className="border-blue-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pertukaran">Pertukaran Mahasiswa</SelectItem>
                    <SelectItem value="Penelitian">Penelitian</SelectItem>
                    <SelectItem value="Magang">Magang</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Mitra Tujuan *</Label>
                <Input
                  value={formData.partner}
                  onChange={(e) => setFormData({...formData, partner: e.target.value})}
                  className="border-blue-200"
                  placeholder="Nama universitas/perusahaan"
                />
              </div>

              <div className="space-y-2">
                <Label>Durasi (tahun) *</Label>
                <Input
                  type="number"
                  value={formData.duration}
                  onChange={(e) => setFormData({...formData, duration: e.target.value})}
                  className="border-blue-200"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Deskripsi Proposal *</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                rows={4}
                className="border-blue-200"
              />
            </div>

            <div className="border-2 border-dashed border-blue-300 rounded-lg p-6 text-center bg-blue-50">
              <Upload className="h-12 w-12 mx-auto text-blue-400 mb-3" />
              <Badge className="bg-green-100 text-green-700">
                ✓ proposal_harvard_exchange.pdf (2.1 MB)
              </Badge>
            </div>

            <Button onClick={() => handleNext()} className="w-full bg-blue-600 hover:bg-blue-700" size="lg">
              <FilePlus className="mr-2 h-5 w-5" />
              Ajukan Proposal ke DKUI
            </Button>
          </CardContent>
        </Card>
      );
    }

    // Step 2-5: DKUI Processing
    if (currentStep === 2) {
      return (
        <Card className="border-2 border-purple-200">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50">
            <CardTitle className="flex items-center gap-2">
              <Inbox className="h-5 w-5" />
              DKUI - Terima Proposal dari Fakultas
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <Alert className="bg-blue-50 border-blue-200">
              <Users className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-sm">
                <strong>Anda berperan sebagai:</strong> Staff DKUI | 
                <strong> Tugas:</strong> Menerima proposal dari fakultas internal
              </AlertDescription>
            </Alert>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Dari:</span>
                <p className="font-semibold">Fakultas Ilmu Komputer</p>
              </div>
              <div>
                <span className="text-muted-foreground">Mitra Tujuan:</span>
                <p className="font-semibold flex items-center gap-1">
                  <Building2 className="h-4 w-4" />
                  {formData.partner}
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
                  21 Des 2025, 09:15
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
                <p className="text-sm font-medium">proposal_harvard_exchange.pdf</p>
                <p className="text-xs text-muted-foreground">2.1 MB</p>
              </div>
              <Button size="sm" variant="outline">Download</Button>
            </div>

            <Button onClick={() => handleNext()} className="w-full bg-purple-600" size="lg">
              Proses Proposal
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
                <strong>AI Processing:</strong> Sistem sedang menganalisis proposal...
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
                  🤖 <strong>AI Summary:</strong> Fakultas Ilmu Komputer mengajukan program pertukaran mahasiswa dengan Harvard University untuk 15 mahasiswa S1.
                </p>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>Program pertukaran 1 semester (6 bulan)</li>
                  <li>Fokus: Computer Science & AI Research</li>
                  <li>Benefit: Exposure internasional, research collaboration</li>
                </ul>
                <p className="mt-3 text-green-700 font-semibold">
                  ✅ Rekomendasi AI: LAYAK (skor relevansi: 8.9/10)
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

    // Step 6: MITRA Review
    if (currentStep === 6) {
      return (
        <Card className="border-2 border-orange-200">
          <CardHeader className="bg-gradient-to-r from-orange-50 to-amber-50">
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Mitra - Review Proposal dari UI
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            <Alert className="bg-blue-50 border-blue-200">
              <Users className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-sm">
                <strong>Anda berperan sebagai:</strong> {formData.partner} | 
                <strong> Tugas:</strong> Review proposal yang diajukan oleh Universitas Indonesia
              </AlertDescription>
            </Alert>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Dari:</span>
                <p className="font-semibold">Universitas Indonesia (DKUI)</p>
              </div>
              <div>
                <span className="text-muted-foreground">Fakultas:</span>
                <p className="font-semibold">Fakultas Ilmu Komputer</p>
              </div>
            </div>

            <div className="pt-4 border-t">
              <h4 className="font-semibold mb-2">Judul:</h4>
              <p className="text-sm">{formData.title}</p>
            </div>

            <div className="p-4 rounded-lg text-sm bg-blue-50 border border-blue-200">
              <p className="mb-2">
                🤖 <strong>Ringkasan AI (dari DKUI):</strong> Program pertukaran mahasiswa untuk 15 mahasiswa S1 Ilmu Komputer selama 1 semester.
              </p>
              <ul className="list-disc list-inside space-y-1 text-xs">
                <li>Fokus: Computer Science & AI Research</li>
                <li>Benefit: Research collaboration, knowledge exchange</li>
                <li>Durasi: 6 bulan (1 semester akademik)</li>
              </ul>
            </div>

            <div className="space-y-2">
              <Label>Catatan Review</Label>
              <Textarea
                value={formData.feedback}
                onChange={(e) => setFormData({...formData, feedback: e.target.value})}
                rows={3}
                placeholder="Tambahkan catatan..."
                className="border-orange-200"
              />
            </div>

            <Alert className="bg-yellow-50 border-yellow-200">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-sm">
                Step berikutnya adalah <strong>Gateway Keputusan</strong>. Mitra akan memutuskan: SETUJUI atau TOLAK.
              </AlertDescription>
            </Alert>

            <Button onClick={() => handleNext()} className="w-full bg-orange-600" size="lg">
              Lanjut ke Keputusan
            </Button>
          </CardContent>
        </Card>
      );
    }

    // Gateway (Decision Points)
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
            <div className="border-2 border-dashed border-purple-300 rounded-lg p-6 bg-white">
              <div className="text-center mb-4">
                <h4 className="font-bold text-lg">MEMORANDUM OF UNDERSTANDING</h4>
                <p className="text-sm text-muted-foreground mt-2">{formData.title}</p>
              </div>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>Pasal 1 - Tujuan Kerja Sama</p>
                <p>Pasal 2 - Ruang Lingkup</p>
                <p>Pasal 3 - Hak dan Kewajiban</p>
                <p>...</p>
              </div>
            </div>

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
                      Memproses...
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

    // End States
    if (currentStepData?.type === 'end') {
      const isSuccess = currentStep === 28;
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
                    <p className="font-bold">002/MoU/UI/2025</p>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <p className="text-muted-foreground">Tanggal Berlaku</p>
                    <p className="font-bold">21 Des 2025</p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg">
                    <p className="text-muted-foreground">Durasi</p>
                    <p className="font-bold">3 Tahun</p>
                  </div>
                </div>
              </>
            ) : (
              <Alert className="bg-red-50 border-red-300">
                <XCircle className="h-5 w-5 text-red-600" />
                <AlertDescription className="text-lg">
                  Proposal ditolak. Feedback telah diterima oleh fakultas.
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
              <Button onClick={() => router.push('/demo')} size="lg">
                🏠 Kembali ke Pilihan Demo
              </Button>
            </div>
          </CardContent>
        </Card>
      );
    }

    // Default Activity
    const actorColors: Record<string, string> = {
      'FAKULTAS': 'blue',
      'DKUI': 'purple',
      'MITRA': 'orange',
      'LEGAL': 'indigo',
      'BIRO_HUKUM': 'violet',
      'SUPERVISI': 'teal'
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
            Demo Alur Fakultas Mengajukan Kerja Sama
          </h1>
          <p className="text-muted-foreground mt-2">
            Fakultas internal mengajukan proposal ke mitra eksternal
          </p>
        </div>

        {/* Monitoring Bar */}
        <MonitoringBar 
          currentStep={currentStep}
          totalSteps={28}
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
                <CardTitle className="text-sm">Step Info</CardTitle>
              </CardHeader>
              <CardContent className="text-xs space-y-2">
                <div>
                  <span className="text-muted-foreground">Current:</span>
                  <p className="font-semibold">Step {currentStep}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Actor:</span>
                  <p className="font-semibold">{currentStepData?.actor}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Type:</span>
                  <p className="font-semibold capitalize">{currentStepData?.type}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-purple-200 bg-purple-50">
              <CardContent className="pt-4 text-xs">
                <p className="text-purple-900">
                  <strong>💡 Catatan:</strong> Alur ini dimulai dari Fakultas yang mengajukan proposal ke mitra eksternal. Berbeda dengan alur eksternal yang dimulai dari mitra.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
