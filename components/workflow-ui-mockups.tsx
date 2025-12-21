'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import {
  Upload,
  FileText,
  CheckCircle,
  XCircle,
  Eye,
  Download,
  Send,
  PenTool,
  Clock,
  Building2,
  User,
  Mail,
  Phone,
  Calendar,
  Loader2,
  CheckSquare,
  AlertCircle,
  Archive,
  RefreshCw
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ===== LOGIN MOCKUP =====
export function LoginMockup({ actor }: { actor: string }) {
  const [loading, setLoading] = useState(false);

  const actorInfo = {
    MITRA: { title: 'Portal Mitra External', color: 'orange' },
    DKUI: { title: 'Portal DKUI', color: 'blue' },
    FAKULTAS: { title: 'Portal Fakultas', color: 'green' },
    BIRO_HUKUM: { title: 'Portal Biro Hukum', color: 'purple' },
    SUPERVISI: { title: 'Portal Supervisi', color: 'teal' }
  };

  const info = actorInfo[actor as keyof typeof actorInfo] || actorInfo.MITRA;

  return (
    <div className="max-w-md mx-auto">
      <Card className="border-2">
        <CardHeader className="text-center pb-4">
          <div className="flex justify-center mb-4">
            <div className={cn(
              "h-16 w-16 rounded-full flex items-center justify-center",
              `bg-${info.color}-100`
            )}>
              <Building2 className={cn("h-8 w-8", `text-${info.color}-600`)} />
            </div>
          </div>
          <CardTitle className="text-2xl">{info.title}</CardTitle>
          <CardDescription>Masuk ke sistem kerja sama universitas</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input 
                id="email" 
                type="email" 
                placeholder="nama@email.com" 
                className="pl-10"
                defaultValue={actor === 'MITRA' ? 'mitra@external.com' : 'user@ui.ac.id'}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input 
              id="password" 
              type="password" 
              placeholder="••••••••"
              defaultValue="••••••••"
            />
          </div>
          <Button 
            className="w-full" 
            size="lg"
            onClick={() => {
              setLoading(true);
              setTimeout(() => setLoading(false), 1500);
            }}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Memproses...
              </>
            ) : (
              'Masuk ke Sistem'
            )}
          </Button>
          <p className="text-xs text-center text-muted-foreground">
            Login berhasil! Dashboard akan muncul.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

// ===== UPLOAD PROPOSAL MOCKUP =====
export function UploadProposalMockup() {
  const [fileName, setFileName] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState(false);

  const handleUpload = () => {
    setUploading(true);
    setTimeout(() => {
      setFileName('Proposal_Kerja_Sama_2025.pdf');
      setUploading(false);
      setUploaded(true);
    }, 2000);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Form Pengajuan Proposal Kerja Sama
          </CardTitle>
          <CardDescription>Lengkapi informasi dan upload dokumen proposal</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="org">Nama Organisasi/Perusahaan</Label>
              <Input id="org" placeholder="PT. Contoh Indonesia" defaultValue="PT. Teknologi Maju" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pic">Nama PIC</Label>
              <Input id="pic" placeholder="Nama lengkap" defaultValue="Dr. Ahmad Rizki" />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email-org">Email</Label>
              <Input id="email-org" type="email" defaultValue="ahmad@teknologimaju.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">No. Telepon</Label>
              <Input id="phone" defaultValue="+62 812-3456-7890" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Judul Kerja Sama</Label>
            <Input id="title" defaultValue="Kerja Sama Penelitian IoT dan Smart City" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="desc">Deskripsi Singkat</Label>
            <Textarea 
              id="desc" 
              rows={4}
              defaultValue="Kerja sama dalam bidang penelitian dan pengembangan teknologi IoT untuk implementasi smart city di Indonesia. Melibatkan mahasiswa dan dosen dalam riset kolaboratif."
            />
          </div>

          <div className="space-y-2">
            <Label>Upload Dokumen Proposal (PDF)</Label>
            <div className="border-2 border-dashed rounded-lg p-6 text-center hover:bg-muted/50 transition-colors">
              {uploaded ? (
                <div className="space-y-2">
                  <CheckCircle className="h-12 w-12 text-green-600 mx-auto" />
                  <p className="font-medium text-green-700">{fileName}</p>
                  <p className="text-sm text-muted-foreground">Berhasil diupload</p>
                  <Button variant="outline" size="sm" onClick={() => setUploaded(false)}>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Upload Ulang
                  </Button>
                </div>
              ) : uploading ? (
                <div className="space-y-2">
                  <Loader2 className="h-12 w-12 text-blue-600 mx-auto animate-spin" />
                  <p className="font-medium">Mengupload...</p>
                  <Progress value={66} className="w-full" />
                </div>
              ) : (
                <div className="space-y-2">
                  <Upload className="h-12 w-12 text-muted-foreground mx-auto" />
                  <p className="font-medium">Klik untuk upload atau drag & drop</p>
                  <p className="text-sm text-muted-foreground">PDF, maksimal 10MB</p>
                  <Button onClick={handleUpload}>
                    Pilih File
                  </Button>
                </div>
              )}
            </div>
          </div>

          {uploaded && (
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                Proposal siap dikirim! Klik tombol di bawah untuk submit.
              </AlertDescription>
            </Alert>
          )}

          <Button className="w-full" size="lg" disabled={!uploaded}>
            <Send className="mr-2 h-4 w-4" />
            Kirim Proposal
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

// ===== REVIEW DOCUMENT MOCKUP =====
export function ReviewDocumentMockup({ actor }: { actor: string }) {
  const [decision, setDecision] = useState<'approve' | 'reject' | null>(null);

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Review Dokumen Proposal
          </CardTitle>
          <CardDescription>Verifikasi dan berikan keputusan</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Document Info */}
          <div className="bg-muted/50 rounded-lg p-4 space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <FileText className="h-10 w-10 text-blue-600" />
                <div>
                  <p className="font-semibold">Proposal_Kerja_Sama_2025.pdf</p>
                  <p className="text-sm text-muted-foreground">Diterima: 20 Desember 2025</p>
                </div>
              </div>
              <Button variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" />
                Download
              </Button>
            </div>
          </div>

          {/* Ringkasan AI */}
          <Card className="border-purple-200 bg-purple-50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <div className="h-6 w-6 rounded bg-purple-600 flex items-center justify-center">
                  <span className="text-white text-xs font-bold">AI</span>
                </div>
                Ringkasan Otomatis (AI-Generated)
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
              <p><strong>Mitra:</strong> PT. Teknologi Maju</p>
              <p><strong>Bidang:</strong> Penelitian IoT dan Smart City</p>
              <p><strong>Durasi:</strong> 3 tahun (2025-2028)</p>
              <p><strong>Fakultas Terkait:</strong> Teknik, Ilmu Komputer</p>
              <p><strong>Manfaat:</strong> Transfer knowledge, publikasi bersama, akses funding</p>
            </CardContent>
          </Card>

          {/* Preview Content */}
          <div className="border rounded-lg p-4 bg-white max-h-60 overflow-y-auto">
            <h3 className="font-semibold mb-2">PROPOSAL KERJA SAMA</h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p><strong>A. Latar Belakang</strong></p>
              <p>Perkembangan teknologi IoT dan Smart City di Indonesia membutuhkan kolaborasi antara industri dan akademisi...</p>
              
              <p className="pt-2"><strong>B. Tujuan Kerja Sama</strong></p>
              <p>1. Mengembangkan riset kolaboratif di bidang IoT</p>
              <p>2. Meningkatkan kompetensi mahasiswa dan dosen</p>
              <p>3. Menghasilkan publikasi ilmiah berkualitas</p>
              
              <p className="pt-2"><strong>C. Ruang Lingkup</strong></p>
              <p>Penelitian, pengembangan prototipe, publikasi, dan pelatihan...</p>
            </div>
          </div>

          {/* Verification Checklist */}
          {actor === 'FAKULTAS' && (
            <div className="space-y-2">
              <Label className="text-base font-semibold">Checklist Verifikasi Substansi:</Label>
              <div className="space-y-2">
                {[
                  'Relevansi dengan bidang keilmuan fakultas',
                  'Kelayakan pelaksanaan program',
                  'Manfaat bagi mahasiswa dan dosen',
                  'Ketersediaan sumber daya'
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <CheckSquare className="h-4 w-4 text-green-600" />
                    <span className="text-sm">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Decision Buttons */}
          <div className="pt-4 border-t">
            <Label className="text-base font-semibold mb-3 block">Keputusan:</Label>
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant={decision === 'approve' ? 'default' : 'outline'}
                size="lg"
                onClick={() => setDecision('approve')}
                className="border-green-500 hover:bg-green-50"
              >
                <CheckCircle className="mr-2 h-5 w-5" />
                Setujui
              </Button>
              <Button
                variant={decision === 'reject' ? 'destructive' : 'outline'}
                size="lg"
                onClick={() => setDecision('reject')}
                className="border-red-500 hover:bg-red-50"
              >
                <XCircle className="mr-2 h-5 w-5" />
                Tolak
              </Button>
            </div>

            {decision && (
              <div className="mt-4 space-y-3">
                <Textarea 
                  placeholder={decision === 'approve' ? 'Catatan persetujuan (opsional)' : 'Alasan penolakan (wajib)'}
                  rows={3}
                />
                <Button className="w-full" size="lg">
                  <Send className="mr-2 h-4 w-4" />
                  Kirim Keputusan
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ===== DIGITAL SIGNATURE MOCKUP =====
export function DigitalSignatureMockup({ role }: { role: string }) {
  const [signed, setSigned] = useState(false);

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PenTool className="h-5 w-5" />
            Tanda Tangan Digital - {role}
          </CardTitle>
          <CardDescription>Dokumen siap untuk ditandatangani</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Document Preview */}
          <div className="border-2 rounded-lg p-6 bg-gray-50">
            <div className="flex items-center justify-center mb-4">
              <FileText className="h-20 w-20 text-blue-600" />
            </div>
            <p className="text-center font-semibold">Naskah_Perjanjian_Kerjasama.pdf</p>
            <p className="text-center text-sm text-muted-foreground">25 halaman</p>
          </div>

          {/* Document Details */}
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Mitra:</span>
              <span className="font-medium">PT. Teknologi Maju</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Jenis Dokumen:</span>
              <span className="font-medium">Memorandum of Agreement (MoA)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Berlaku:</span>
              <span className="font-medium">3 Tahun (2025-2028)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Status Validasi:</span>
              <Badge className="bg-green-600">Lolos Biro Hukum</Badge>
            </div>
          </div>

          {/* Signature Area */}
          {!signed ? (
            <div className="border-2 border-dashed rounded-lg p-8 text-center space-y-4">
              <PenTool className="h-12 w-12 text-muted-foreground mx-auto" />
              <div>
                <p className="font-semibold">Tanda Tangan Digital</p>
                <p className="text-sm text-muted-foreground">
                  Menggunakan sertifikat digital terverifikasi
                </p>
              </div>
              <Button 
                size="lg"
                onClick={() => setSigned(true)}
              >
                <PenTool className="mr-2 h-4 w-4" />
                Tanda Tangan Sekarang
              </Button>
            </div>
          ) : (
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                <p className="font-semibold">Dokumen berhasil ditandatangani!</p>
                <p className="text-sm mt-1">
                  Ditandatangani oleh: <strong>{role}</strong><br />
                  Waktu: {new Date().toLocaleString('id-ID')}
                </p>
              </AlertDescription>
            </Alert>
          )}

          {signed && (
            <Button className="w-full" size="lg">
              <Send className="mr-2 h-4 w-4" />
              Lanjutkan Proses
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ===== DOCUMENT TRACKING MOCKUP =====
export function DocumentTrackingMockup() {
  const timeline = [
    { date: '20 Des 2025', actor: 'Mitra', status: 'Proposal Submitted', done: true },
    { date: '20 Des 2025', actor: 'DKUI', status: 'Received & Summarized', done: true },
    { date: '21 Des 2025', actor: 'Fakultas', status: 'Under Review', done: true },
    { date: '21 Des 2025', actor: 'DKUI', status: 'Document Drafting', done: true },
    { date: '21 Des 2025', actor: 'Biro Hukum', status: 'Legal Review', done: false },
    { date: 'Pending', actor: 'Wakil Rektor', status: 'Awaiting Approval', done: false },
    { date: 'Pending', actor: 'Rektor', status: 'Final Signing', done: false },
  ];

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Tracking Status Dokumen
          </CardTitle>
          <CardDescription>Proposal: Kerja Sama Penelitian IoT</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {timeline.map((item, index) => (
              <div key={index} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className={cn(
                    "h-10 w-10 rounded-full flex items-center justify-center",
                    item.done ? "bg-green-600" : "bg-gray-300"
                  )}>
                    {item.done ? (
                      <CheckCircle className="h-5 w-5 text-white" />
                    ) : (
                      <Clock className="h-5 w-5 text-gray-600" />
                    )}
                  </div>
                  {index < timeline.length - 1 && (
                    <div className={cn(
                      "w-0.5 h-12",
                      item.done ? "bg-green-600" : "bg-gray-300"
                    )} />
                  )}
                </div>
                <div className="flex-1 pb-8">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold">{item.status}</p>
                      <p className="text-sm text-muted-foreground">{item.actor}</p>
                    </div>
                    <Badge variant={item.done ? "default" : "secondary"}>
                      {item.date}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ===== ARCHIVE MOCKUP =====
export function ArchiveMockup() {
  return (
    <div className="max-w-3xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Archive className="h-5 w-5" />
            Arsip Dokumen Kerja Sama
          </CardTitle>
          <CardDescription>Dokumen final yang telah ditandatangani kedua belah pihak</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert className="bg-green-50 border-green-200">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              <strong>Status: Berhasil Diarsipkan</strong><br />
              Dokumen kerja sama telah lengkap dan diarsipkan dalam sistem.
            </AlertDescription>
          </Alert>

          <div className="grid gap-3">
            <div className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileText className="h-8 w-8 text-blue-600" />
                  <div>
                    <p className="font-semibold">MoA_PT_Teknologi_Maju_2025.pdf</p>
                    <p className="text-sm text-muted-foreground">Dokumen bermaterai dari Mitra</p>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileText className="h-8 w-8 text-purple-600" />
                  <div>
                    <p className="font-semibold">MoA_UI_Signed_Rektor_2025.pdf</p>
                    <p className="text-sm text-muted-foreground">Dokumen bermaterai dari Rektor UI</p>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-3">
                <FileText className="h-8 w-8 text-green-600" />
                <div>
                  <p className="font-semibold">Lampiran_Program_Kerja.pdf</p>
                  <p className="text-sm text-muted-foreground">Dokumen pendukung</p>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t pt-4 grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Nomor Arsip:</p>
              <p className="font-semibold">UI/DKUI/2025/001234</p>
            </div>
            <div>
              <p className="text-muted-foreground">Tanggal Arsip:</p>
              <p className="font-semibold">21 Desember 2025</p>
            </div>
            <div>
              <p className="text-muted-foreground">Masa Berlaku:</p>
              <p className="font-semibold">2025 - 2028 (3 Tahun)</p>
            </div>
            <div>
              <p className="text-muted-foreground">Status:</p>
              <Badge className="bg-green-600">Aktif</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ===== FEEDBACK/REJECTION MOCKUP =====
export function FeedbackMockup({ type }: { type: 'rejection' | 'revision' }) {
  return (
    <div className="max-w-2xl mx-auto">
      <Card className="border-red-200">
        <CardHeader className="bg-red-50">
          <CardTitle className="flex items-center gap-2 text-red-900">
            <AlertCircle className="h-5 w-5" />
            {type === 'rejection' ? 'Notifikasi Penolakan' : 'Permintaan Revisi'}
          </CardTitle>
          <CardDescription>
            {type === 'rejection' 
              ? 'Proposal tidak dapat dilanjutkan' 
              : 'Dokumen perlu diperbaiki'}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6 space-y-4">
          <Alert className="bg-red-50 border-red-200">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              {type === 'rejection' 
                ? 'Proposal Anda tidak memenuhi kriteria yang ditetapkan.'
                : 'Dokumen perlu diperbaiki sesuai catatan di bawah ini.'}
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <Label className="text-base font-semibold">
              {type === 'rejection' ? 'Alasan Penolakan:' : 'Catatan Revisi:'}
            </Label>
            <div className="border rounded-lg p-4 bg-muted/50 space-y-2 text-sm">
              <p>1. Ruang lingkup kerja sama belum jelas dan spesifik</p>
              <p>2. Belum ada keselarasan dengan roadmap penelitian fakultas</p>
              <p>3. Anggaran yang diajukan tidak mencantumkan rincian detail</p>
              {type === 'revision' && (
                <p className="pt-2 text-blue-700 font-medium">
                  Silakan perbaiki dan ajukan kembali dalam 14 hari.
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Pesan dari Reviewer:</Label>
            <Textarea 
              readOnly
              value="Terima kasih atas minat kerja sama dengan universitas. Mohon untuk melengkapi dokumen sesuai feedback di atas."
              rows={3}
              className="bg-muted/50"
            />
          </div>

          <div className="flex gap-3">
            <Button variant="outline" className="flex-1">
              <Download className="mr-2 h-4 w-4" />
              Download Feedback
            </Button>
            {type === 'revision' && (
              <Button className="flex-1">
                <Upload className="mr-2 h-4 w-4" />
                Upload Revisi
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ===== SIMPLE ACTIVITY MOCKUP =====
export function SimpleActivityMockup({ 
  title, 
  description, 
  icon: Icon = FileText,
  processing = false 
}: { 
  title: string; 
  description: string;
  icon?: React.ComponentType<any>;
  processing?: boolean;
}) {
  return (
    <div className="max-w-xl mx-auto">
      <Card>
        <CardContent className="pt-12 pb-12 text-center space-y-4">
          {processing ? (
            <Loader2 className="h-16 w-16 text-blue-600 mx-auto animate-spin" />
          ) : (
            <Icon className="h-16 w-16 text-blue-600 mx-auto" />
          )}
          <div>
            <h3 className="text-xl font-semibold mb-2">{title}</h3>
            <p className="text-muted-foreground">{description}</p>
          </div>
          {processing && (
            <div className="space-y-2">
              <Progress value={45} className="w-full max-w-xs mx-auto" />
              <p className="text-sm text-muted-foreground">Memproses...</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
