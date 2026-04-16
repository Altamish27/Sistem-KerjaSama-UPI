"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";
import {
  FileText,
  Download,
  Eye,
  Check,
  X,
  RefreshCcw,
  MessageSquare,
  AlertCircle,
  Clock,
  Building2,
  User,
  Calendar,
  ArrowLeft,
  Send,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { usePublicProposals } from "@/hooks/use-public-proposals";
import { useWorkflowConfig } from "@/hooks/use-workflow-config";
import { useCoreDb } from "@/hooks/use-core-db";
import { useSessionUser } from "@/hooks/use-session-user";
import type { AppRole } from "@/lib/workflow";

interface DocumentReviewModuleProps {
  documentId: string;
  roleSegment?: string;
}

interface ReviewHistory {
  id: string;
  dokumen_id: string;
  reviewer_id: string | null;
  from_stage: string;
  to_stage: string;
  aksi: string;
  catatan: string | null;
  versi_dokumen: number;
  created_at: string;
}

interface StageAction {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  variant: "default" | "destructive" | "outline" | "secondary";
  color: string;
}

interface PdfAnalysisResult {
  reply: string;
  model: string;
  file_name: string;
  page_count: number;
  character_count: number;
}

interface PdfChatItem {
  id: string;
  question: string;
  answer: string;
  model: string;
  isSaved?: boolean;
}

interface SavedPdfAnalysis {
  id: string;
  documentId: string;
  type: "summary" | "chat";
  question: string | null;
  answer: string;
  model: string;
  createdAt: string;
}

const ACTION_CONFIG: Record<string, StageAction> = {
  approve: {
    id: "approve",
    label: "Setujui",
    icon: Check,
    variant: "default",
    color: "bg-[#e10000] hover:bg-[#b00000] text-white",
  },
  reject: {
    id: "reject",
    label: "Tolak",
    icon: X,
    variant: "destructive",
    color: "bg-gray-700 hover:bg-gray-800 text-white",
  },
  revision: {
    id: "revision",
    label: "Minta Revisi",
    icon: RefreshCcw,
    variant: "outline",
    color: "border-[#ffcc00] text-[#b8860b] hover:bg-yellow-50",
  },
  comment: {
    id: "comment",
    label: "Tambah Komentar",
    icon: MessageSquare,
    variant: "outline",
    color: "border-gray-400 text-gray-700 hover:bg-gray-50",
  },
  submit: {
    id: "submit",
    label: "Ajukan",
    icon: Send,
    variant: "default",
    color: "bg-[#e10000] hover:bg-[#b00000] text-white",
  },
  sign: {
    id: "sign",
    label: "Tanda Tangan",
    icon: Check,
    variant: "default",
    color: "bg-[#e10000] hover:bg-[#b00000] text-white",
  },
  paraf: {
    id: "paraf",
    label: "Paraf",
    icon: Check,
    variant: "default",
    color: "bg-[#e10000] hover:bg-[#b00000] text-white",
  },
  assign: {
    id: "assign",
    label: "Tetapkan",
    icon: User,
    variant: "default",
    color: "bg-gray-600 hover:bg-gray-700 text-white",
  },
  proceed: {
    id: "proceed",
    label: "Lanjutkan",
    icon: ChevronRight,
    variant: "default",
    color: "bg-[#e10000] hover:bg-[#b00000] text-white",
  },
  archive: {
    id: "archive",
    label: "Arsipkan",
    icon: FileText,
    variant: "default",
    color: "bg-gray-600 hover:bg-gray-700 text-white",
  },
};

export default function DocumentReviewModule({ documentId, roleSegment = "dkui" }: DocumentReviewModuleProps) {
  const router = useRouter();
  const user = useSessionUser();
  const { proposals, refetch: refetchProposals } = usePublicProposals();
  const { config } = useWorkflowConfig();
  const { data: coreDb, refetch: refetchCoreDb } = useCoreDb();

  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showPdfPreview, setShowPdfPreview] = useState(true);
  const [isAnalyzingPdf, setIsAnalyzingPdf] = useState(false);
  const [pdfSummary, setPdfSummary] = useState<PdfAnalysisResult | null>(null);
  const [pdfSummaryError, setPdfSummaryError] = useState<string | null>(null);
  const [pdfQuestion, setPdfQuestion] = useState("");
  const [pdfChatHistory, setPdfChatHistory] = useState<PdfChatItem[]>([]);
  const [savedAnalyses, setSavedAnalyses] = useState<SavedPdfAnalysis[]>([]);
  const [isLoadingSaved, setIsLoadingSaved] = useState(false);
  const [isSavingResult, setIsSavingResult] = useState(false);

  const proposal = useMemo(() => {
    return proposals.find((p) => p.id === documentId);
  }, [proposals, documentId]);

  const dokumen = useMemo(() => {
    return coreDb.dokumen_kerjasama.find((d: any) => d.id === documentId);
  }, [coreDb.dokumen_kerjasama, documentId]);

  const pengajuan = useMemo(() => {
    if (!dokumen) return null;
    return coreDb.pengajuan_kerjasama.find((p: any) => p.id === dokumen.pengajuan_id);
  }, [coreDb.pengajuan_kerjasama, dokumen]);

  const partner = useMemo(() => {
    if (!pengajuan) return null;
    return coreDb.partners.find((p: any) => p.id === pengajuan.partner_id);
  }, [coreDb.partners, pengajuan]);

  const currentStage = useMemo(() => {
    if (!dokumen) return null;
    return config.stages.find((s) => s.id === dokumen.current_stage_id);
  }, [config.stages, dokumen]);

  const reviewHistories = useMemo(() => {
    return (coreDb.review_histories as ReviewHistory[])
      .filter((h) => h.dokumen_id === documentId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [coreDb.review_histories, documentId]);

  const availableActions = useMemo(() => {
    if (!currentStage || !currentStage.actions) return [];
    return currentStage.actions
      .map((actionId) => ACTION_CONFIG[actionId])
      .filter(Boolean);
  }, [currentStage]);

  const canTakeAction = useMemo(() => {
    if (!currentStage || !user) return false;
    return currentStage.actorRole === user.role;
  }, [currentStage, user]);

  const handleAction = async (actionId: string) => {
    if (!user || !dokumen || !currentStage) return;

    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch("/api/document-action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          documentId,
          actionId,
          comment: comment.trim() || null,
          userId: user.id,
          currentStageId: currentStage.id,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Gagal melakukan aksi");
      }

      const result = await response.json();
      setSuccess(result.message || "Aksi berhasil dilakukan");
      setComment("");
      
      await Promise.all([refetchProposals(), refetchCoreDb()]);

      setTimeout(() => {
        router.push(`/dashboard/${roleSegment}?tab=review`);
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setIsSubmitting(false);
    }
  };

  const loadSavedAnalyses = async () => {
    setIsLoadingSaved(true);
    try {
      const response = await fetch(`/api/dkui/pdf-analysis/saved?documentId=${encodeURIComponent(documentId)}`, {
        cache: "no-store",
      });
      const data = (await response.json()) as SavedPdfAnalysis[] | { message?: string };
      if (!response.ok) {
        throw new Error((data as { message?: string }).message || "Gagal memuat hasil tersimpan");
      }
      setSavedAnalyses(Array.isArray(data) ? data : []);
    } catch (err) {
      setPdfSummaryError(err instanceof Error ? err.message : "Gagal memuat hasil tersimpan");
    } finally {
      setIsLoadingSaved(false);
    }
  };

  useEffect(() => {
    void loadSavedAnalyses();
  }, [documentId]);

  const requestPdfAnalysis = async (question?: string) => {
    if (!dokumen?.file_url) {
      setPdfSummaryError("File PDF tidak tersedia untuk dianalisis.");
      return null;
    }

    try {
      const response = await fetch("/api/dkui/pdf-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documentId, question }),
      });

      const data = (await response.json()) as PdfAnalysisResult | { message?: string };
      if (!response.ok) {
        throw new Error((data as { message?: string }).message || "Gagal menganalisis PDF");
      }

      return data as PdfAnalysisResult;
    } catch (err) {
      setPdfSummaryError(err instanceof Error ? err.message : "Gagal menganalisis PDF");
      return null;
    }
  };

  const handleAnalyzePdf = async () => {
    setIsAnalyzingPdf(true);
    setPdfSummaryError(null);
    const result = await requestPdfAnalysis();
    if (result) {
      setPdfSummary(result);
      setPdfChatHistory([]);
      setPdfQuestion("");
    }
    setIsAnalyzingPdf(false);
  };

  const handleSaveResult = async (payload: {
    type: "summary" | "chat";
    question?: string | null;
    answer: string;
    model: string;
    localChatId?: string;
  }) => {
    setIsSavingResult(true);
    setPdfSummaryError(null);
    try {
      const response = await fetch("/api/dkui/pdf-analysis/saved", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          documentId,
          type: payload.type,
          question: payload.question || null,
          answer: payload.answer,
          model: payload.model,
        }),
      });

      const data = (await response.json()) as SavedPdfAnalysis | { message?: string };
      if (!response.ok) {
        throw new Error((data as { message?: string }).message || "Gagal menyimpan hasil analisis");
      }

      const saved = data as SavedPdfAnalysis;
      setSavedAnalyses((prev) => {
        if (prev.some((item) => item.id === saved.id)) return prev;
        return [saved, ...prev];
      });

      if (payload.localChatId) {
        setPdfChatHistory((prev) =>
          prev.map((item) => (item.id === payload.localChatId ? { ...item, isSaved: true } : item)),
        );
      }
    } catch (err) {
      setPdfSummaryError(err instanceof Error ? err.message : "Gagal menyimpan hasil analisis");
    } finally {
      setIsSavingResult(false);
    }
  };

  const handleAskPdf = async () => {
    const question = pdfQuestion.trim();
    if (!question) return;

    setIsAnalyzingPdf(true);
    setPdfSummaryError(null);
    const result = await requestPdfAnalysis(question);
    if (result) {
      setPdfChatHistory((prev) => [
        ...prev,
        {
          id: `${Date.now()}`,
          question,
          answer: result.reply,
          model: result.model,
        },
      ]);
      setPdfQuestion("");
    }
    setIsAnalyzingPdf(false);
  };

  if (!proposal || !dokumen || !pengajuan || !partner) {
    return (
      <div className="space-y-6">
        <Alert className="border-amber-200 bg-amber-50">
          <AlertCircle className="w-4 h-4 text-amber-600" />
          <AlertDescription className="text-amber-800">
            Dokumen tidak ditemukan atau sedang dimuat...
          </AlertDescription>
        </Alert>
        <Button
          variant="outline"
          onClick={() => router.push(`/dashboard/${roleSegment}?tab=review`)}
          className="gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali ke Daftar Review
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Review Dokumen Kerja Sama</h2>
          <p className="text-gray-600 mt-1 text-sm md:text-base">
            Tinjau dan berikan keputusan untuk dokumen kerja sama
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => router.push(`/dashboard/${roleSegment}?tab=review`)}
          className="gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali
        </Button>
      </div>

      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="w-4 h-4 text-red-600" />
          <AlertDescription className="text-red-700">{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="border-[#e10000] bg-red-50">
          <Check className="w-4 h-4 text-[#e10000]" />
          <AlertDescription className="text-[#b00000]">{success}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-gray-200 shadow-sm">
            <CardHeader className="bg-gradient-to-r from-gray-50 to-white border-b border-gray-200">
              <CardTitle className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-lg font-bold">Informasi Dokumen</div>
                  <p className="text-xs text-gray-500 font-normal mt-0.5">Detail lengkap dokumen kerja sama</p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div>
                <Label className="text-sm font-semibold text-gray-700 mb-2 block">Judul Kerja Sama</Label>
                <p className="text-base text-gray-900">{proposal.title}</p>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <Building2 className="w-4 h-4" />
                    Mitra
                  </Label>
                  <p className="text-sm text-gray-900">{partner.nama_instansi}</p>
                  <p className="text-xs text-gray-600 mt-1">{partner.email_pic}</p>
                </div>

                <div>
                  <Label className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Jenis Naskah
                  </Label>
                  <span className="inline-flex px-3 py-1 text-sm font-medium bg-gray-100 text-gray-700 rounded-full">
                    {dokumen.jenis_naskah}
                  </span>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Tanggal Pengajuan
                  </Label>
                  <p className="text-sm text-gray-900">
                    {new Date(pengajuan.tanggal_pengajuan).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>

                <div>
                  <Label className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Tipe Pengusul
                  </Label>
                  <span className="inline-flex px-3 py-1 text-sm font-medium bg-gray-100 text-gray-700 rounded-full">
                    {dokumen.proposer_type === "external" ? "Eksternal" : "Internal"}
                  </span>
                </div>
              </div>

              <div>
                <Label className="text-sm font-semibold text-gray-700 mb-2 block">Latar Belakang</Label>
                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {pengajuan.latar_belakang}
                </p>
              </div>

              <div>
                <Label className="text-sm font-semibold text-gray-700 mb-2 block">Tujuan</Label>
                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {pengajuan.tujuan}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-gray-200 shadow-sm">
            <CardHeader className="bg-gradient-to-r from-gray-50 to-white border-b border-gray-200">
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#e10000] to-[#b00000] flex items-center justify-center">
                    <FileText className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="text-lg font-bold">Dokumen</div>
                    <p className="text-xs text-gray-500 font-normal mt-0.5">File dokumen kerja sama</p>
                  </div>
                </div>
                {dokumen.file_url && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-2"
                    onClick={() => setShowPdfPreview(!showPdfPreview)}
                  >
                    {showPdfPreview ? "Sembunyikan" : "Tampilkan"} Preview
                  </Button>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {dokumen.file_url ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-[#e10000] flex items-center justify-center">
                        <FileText className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">Dokumen Kerja Sama</p>
                        <p className="text-xs text-gray-600">PDF Document</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        className="gap-2 bg-[#e10000] hover:bg-[#b00000] text-white"
                        disabled={isAnalyzingPdf}
                        onClick={handleAnalyzePdf}
                      >
                        <Sparkles className="w-4 h-4" />
                        {isAnalyzingPdf ? "Menganalisis..." : "Ringkas PDF"}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-2 border-gray-300 hover:border-[#e10000] hover:bg-red-50 hover:text-[#e10000]"
                        onClick={() => window.open(dokumen.file_url || undefined, "_blank")}
                      >
                        <Eye className="w-4 h-4" />
                        Buka Tab Baru
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-2 border-gray-300 hover:border-[#e10000] hover:bg-red-50 hover:text-[#e10000]"
                        onClick={() => {
                          const link = document.createElement("a");
                          link.href = dokumen.file_url || "";
                          link.download = "dokumen-kerjasama.pdf";
                          link.click();
                        }}
                      >
                        <Download className="w-4 h-4" />
                        Unduh
                      </Button>
                    </div>
                  </div>

                  {pdfSummaryError && (
                    <Alert className="border-red-200 bg-red-50">
                      <AlertCircle className="w-4 h-4 text-red-600" />
                      <AlertDescription className="text-red-700">{pdfSummaryError}</AlertDescription>
                    </Alert>
                  )}

                  {pdfSummary && (
                    <div className="p-4 bg-white border border-[#e10000]/25 rounded-lg space-y-3">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-semibold text-gray-900">Hasil Analisis Ringkasan Dokumen</p>
                        <span className="text-xs text-gray-600">
                          {pdfSummary.page_count} halaman • {pdfSummary.character_count} karakter • {pdfSummary.model}
                        </span>
                      </div>
                      <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                        {pdfSummary.reply}
                      </div>
                      <div className="flex justify-end">
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-2 border-gray-300 hover:border-[#e10000] hover:bg-red-50 hover:text-[#e10000]"
                          onClick={() =>
                            handleSaveResult({
                              type: "summary",
                              answer: pdfSummary.reply,
                              model: pdfSummary.model,
                            })
                          }
                          disabled={isSavingResult}
                        >
                          Simpan Ringkasan
                        </Button>
                      </div>
                    </div>
                  )}

                  {pdfSummary && (
                    <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg space-y-3">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-semibold text-gray-900">Tanya Dokumen (Chatbot)</p>
                        <span className="text-xs text-gray-600">Model: {pdfSummary.model}</span>
                      </div>

                      <Textarea
                        value={pdfQuestion}
                        onChange={(e) => setPdfQuestion(e.target.value)}
                        placeholder="Contoh: Apa tujuan utama kerja sama ini?"
                        className="min-h-[90px] border-gray-300 bg-white"
                        disabled={isAnalyzingPdf}
                      />

                      <div className="flex justify-end">
                        <Button
                          size="sm"
                          className="gap-2 bg-[#e10000] hover:bg-[#b00000] text-white"
                          onClick={handleAskPdf}
                          disabled={isAnalyzingPdf || !pdfQuestion.trim()}
                        >
                          <MessageSquare className="w-4 h-4" />
                          {isAnalyzingPdf ? "Memproses..." : "Kirim Pertanyaan"}
                        </Button>
                      </div>

                      {pdfChatHistory.length > 0 && (
                        <div className="space-y-3 pt-1">
                          {pdfChatHistory.map((item) => (
                            <div key={item.id} className="p-3 rounded-lg border border-gray-200 bg-white space-y-2">
                              <p className="text-xs font-semibold text-gray-500">Pertanyaan</p>
                              <p className="text-sm text-gray-900 whitespace-pre-wrap">{item.question}</p>
                              <p className="text-xs font-semibold text-gray-500">Jawaban</p>
                              <p className="text-sm text-gray-700 whitespace-pre-wrap">{item.answer}</p>
                              <div className="flex justify-end">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="gap-2 border-gray-300 hover:border-[#e10000] hover:bg-red-50 hover:text-[#e10000]"
                                  onClick={() =>
                                    handleSaveResult({
                                      type: "chat",
                                      question: item.question,
                                      answer: item.answer,
                                      model: item.model,
                                      localChatId: item.id,
                                    })
                                  }
                                  disabled={isSavingResult || item.isSaved}
                                >
                                  {item.isSaved ? "Tersimpan" : "Simpan Jawaban"}
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="p-4 bg-white border border-gray-200 rounded-lg space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-semibold text-gray-900">Hasil Tersimpan</p>
                      {isLoadingSaved && <span className="text-xs text-gray-600">Memuat...</span>}
                    </div>
                    {savedAnalyses.length === 0 ? (
                      <p className="text-sm text-gray-600">Belum ada hasil yang disimpan.</p>
                    ) : (
                      <div className="space-y-3">
                        {savedAnalyses.map((item) => (
                          <div key={item.id} className="p-3 rounded-lg border border-gray-200 bg-gray-50 space-y-2">
                            <div className="flex items-center justify-between gap-3">
                              <span className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                                {item.type === "summary" ? "Ringkasan" : "Q&A"}
                              </span>
                              <span className="text-xs text-gray-600">
                                {new Date(item.createdAt).toLocaleString("id-ID")}
                              </span>
                            </div>
                            {item.question && (
                              <p className="text-sm text-gray-800 whitespace-pre-wrap">
                                <span className="font-semibold">Pertanyaan: </span>
                                {item.question}
                              </p>
                            )}
                            <p className="text-sm text-gray-700 whitespace-pre-wrap">{item.answer}</p>
                            <p className="text-xs text-gray-600">Model: {item.model}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {showPdfPreview && (
                    <div className="border border-gray-300 rounded-lg overflow-hidden bg-gray-100">
                      <iframe
                        src={dokumen.file_url}
                        className="w-full h-[600px]"
                        title="Preview Dokumen Kerja Sama"
                      />
                    </div>
                  )}

                  {dokumen.file_bap_url && (
                    <>
                      <div className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-gray-600 flex items-center justify-center">
                            <FileText className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 text-sm">Berita Acara Penjajakan</p>
                            <p className="text-xs text-gray-600">PDF Document</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="gap-2 border-gray-300 hover:border-[#e10000] hover:bg-red-50 hover:text-[#e10000]"
                            onClick={() => window.open(dokumen.file_bap_url || undefined, "_blank")}
                          >
                            <Eye className="w-4 h-4" />
                            Buka Tab Baru
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="gap-2 border-gray-300 hover:border-[#e10000] hover:bg-red-50 hover:text-[#e10000]"
                            onClick={() => {
                              const link = document.createElement("a");
                              link.href = dokumen.file_bap_url || "";
                              link.download = "bap-penjajakan.pdf";
                              link.click();
                            }}
                          >
                            <Download className="w-4 h-4" />
                            Unduh
                          </Button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <div className="py-8 text-center">
                  <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-sm text-gray-600">Belum ada dokumen yang diunggah</p>
                </div>
              )}
            </CardContent>
          </Card>

        </div>

        <div className="space-y-6">
          <Card className="border-gray-200 shadow-sm">
            <CardHeader className="bg-gradient-to-r from-gray-50 to-white border-b border-gray-200">
              <CardTitle className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#e10000] to-[#b00000] flex items-center justify-center">
                  <Clock className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-lg font-bold">Status Saat Ini</div>
                  <p className="text-xs text-gray-500 font-normal mt-0.5">Tahap workflow dokumen</p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              {currentStage && (
                <>
                  <div className="p-4 bg-red-50 border-l-4 border-[#e10000] rounded-r-lg">
                    <p className="font-semibold text-gray-900 text-sm mb-1">{currentStage.title}</p>
                    <p className="text-xs text-gray-700 leading-relaxed">{currentStage.description}</p>
                    <div className="mt-3 flex items-center gap-2">
                      <User className="w-4 h-4 text-[#e10000]" />
                      <span className="text-xs font-medium text-gray-900">
                        Actor: {dokumen.current_stage_actor_label}
                      </span>
                    </div>
                  </div>

                  {canTakeAction && availableActions.length > 0 && (
                    <div className="space-y-3">
                      <Label className="text-sm font-semibold text-gray-700">Catatan / Komentar</Label>
                      <Textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Tambahkan catatan atau komentar Anda (opsional)..."
                        className="min-h-[100px] border-gray-300"
                        disabled={isSubmitting}
                      />

                      <div className="space-y-2">
                        <Label className="text-sm font-semibold text-gray-700">Aksi</Label>
                        <div className="space-y-2">
                          {availableActions.map((action) => {
                            const Icon = action.icon;
                            return (
                              <Button
                                key={action.id}
                                onClick={() => handleAction(action.id)}
                                disabled={isSubmitting}
                                className={`w-full gap-2 ${action.color}`}
                              >
                                <Icon className="w-4 h-4" />
                                {action.label}
                              </Button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}

                  {!canTakeAction && (
                    <Alert className="border-amber-200 bg-amber-50">
                      <AlertCircle className="w-4 h-4 text-amber-600" />
                      <AlertDescription className="text-amber-800 text-sm">
                        Anda tidak memiliki wewenang untuk melakukan aksi di tahap ini.
                      </AlertDescription>
                    </Alert>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          <Card className="border-gray-200 shadow-sm">
            <CardHeader className="bg-gradient-to-r from-gray-50 to-white border-b border-gray-200">
              <CardTitle className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-gray-600 to-gray-800 flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-lg font-bold">Riwayat Review</div>
                  <p className="text-xs text-gray-500 font-normal mt-0.5">
                    {reviewHistories.length} aktivitas
                  </p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {reviewHistories.length === 0 ? (
                <div className="py-6 text-center">
                  <MessageSquare className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Belum ada riwayat review</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {reviewHistories.map((history) => {
                    const reviewer = coreDb.users.find((u: any) => u.id === history.reviewer_id);
                    const fromStage = config.stages.find((s) => s.id === history.from_stage);
                    const toStage = config.stages.find((s) => s.id === history.to_stage);

                    return (
                      <div key={history.id} className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
                              <User className="w-4 h-4 text-gray-700" />
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-gray-900">
                                {reviewer?.nama || "Unknown"}
                              </p>
                              <p className="text-xs text-gray-600">
                                {new Date(history.created_at).toLocaleDateString("id-ID", {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </p>
                            </div>
                          </div>
                          <span
                            className={`text-xs px-2 py-1 rounded-full font-medium ${
                              history.aksi === "approve"
                                ? "bg-red-100 text-[#e10000]"
                                : history.aksi === "reject"
                                ? "bg-gray-100 text-gray-700"
                                : history.aksi === "revision"
                                ? "bg-yellow-100 text-[#b8860b]"
                                : "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {ACTION_CONFIG[history.aksi]?.label || history.aksi}
                          </span>
                        </div>
                        <div className="text-xs text-gray-600 mb-2">
                          {fromStage?.title} → {toStage?.title}
                        </div>
                        {history.catatan && (
                          <p className="text-sm text-gray-700 bg-white p-2 rounded border border-gray-200">
                            {history.catatan}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
