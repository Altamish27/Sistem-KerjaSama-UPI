"use client";

import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertCircle, Download, FileText, Filter, ListTree } from "lucide-react";
import { usePublicProposals, type PublicProposalRecord } from "@/hooks/use-public-proposals";

const STATUS_LABEL: Record<string, string> = {
  all: "Semua Status",
  drafting: "Drafting",
  reviewing: "Reviewing",
  signing: "Signing",
  completed: "Selesai",
  archived: "Arsip",
  rejected: "Ditolak",
};

export default function PengajuanModule() {
  const { proposals } = usePublicProposals();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedLogId, setSelectedLogId] = useState<string | null>(null);

  const enriched = useMemo(() => proposals.map((p) => ({ ...p, status: p.status ?? "reviewing" })), [proposals]);

  const filtered = useMemo(() => {
    if (statusFilter === "all") return enriched;
    return enriched.filter((p) => p.status === statusFilter);
  }, [enriched, statusFilter]);

  const handleExport = () => {
    if (filtered.length === 0) return;

    const header = ["ID", "Tanggal Masuk", "Nama Mitra", "Judul", "Status", "Email", "Jenis Kerja Sama", "Lingkup"];
    const rows = filtered.map((p) => [
      p.id,
      new Date(p.createdAt).toLocaleDateString("id-ID"),
      p.partnerName,
      p.title,
      STATUS_LABEL[p.status ?? "reviewing"] ?? p.status ?? "-",
      p.companyEmail,
      p.cooperationType,
      p.scope,
    ]);

    const csv = [header, ...rows]
      .map((cols) => cols.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "data-pengajuan.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const buildTimeline = (p: PublicProposalRecord & { status: string }) => [
    { label: "Pengajuan oleh Mitra Guest", description: "Formulir diisi dan dokumen diunggah oleh mitra.", done: true },
    { label: "Verifikasi Administrasi DKUI", description: "DKUI memeriksa kelengkapan.", done: p.status !== "drafting" },
    { label: "Review Hukum", description: "Koordinasi dengan Biro Hukum.", done: ["signing", "completed", "archived"].includes(p.status) },
    { label: "Penandatanganan", description: "Paraf/tandatangan pimpinan.", done: ["completed", "archived"].includes(p.status) },
    { label: "Arsip", description: "Monitoring dan pengarsipan.", done: p.status === "archived" },
  ];

  return (
    <div className="space-y-6 md:space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h2 className="text-2xl md:text-3xl font-semibold text-slate-900">Monitoring & Database Pengajuan</h2>
          <p className="text-slate-600 mt-1 text-sm md:text-base">Riwayat lengkap perjalanan dokumen kerja sama.</p>
        </div>
        <Button variant="outline" size="sm" className="gap-2 border-slate-300" onClick={handleExport} disabled={filtered.length === 0}>
          <Download className="w-4 h-4" />
          <span className="text-xs md:text-sm">Download Report (CSV)</span>
        </Button>
      </div>

      <Card className="border-slate-200 bg-white shadow-sm">
        <CardHeader className="pb-3 md:pb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-500" />
            <div>
              <CardTitle className="text-sm font-medium text-slate-700">Filter Status</CardTitle>
              <p className="text-xs text-slate-500 mt-0.5">Pisahkan pengajuan berdasarkan tahapan proses.</p>
            </div>
          </div>
          <div className="w-full md:w-56">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Pilih status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Status</SelectItem>
                <SelectItem value="drafting">Drafting</SelectItem>
                <SelectItem value="reviewing">Reviewing</SelectItem>
                <SelectItem value="signing">Signing</SelectItem>
                <SelectItem value="completed">Selesai</SelectItem>
                <SelectItem value="archived">Arsip</SelectItem>
                <SelectItem value="rejected">Ditolak</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {filtered.length === 0 ? (
            <div className="py-10 flex flex-col items-center gap-3 text-center">
              <AlertCircle className="w-10 h-10 text-slate-300" />
              <p className="text-sm text-slate-600">Belum ada data pengajuan untuk status ini.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((p) => {
                const date = new Date(p.createdAt).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });
                const isOpen = selectedLogId === p.id;
                const timeline = buildTimeline(p as PublicProposalRecord & { status: string });

                return (
                  <div key={p.id} className="border border-slate-200 rounded-lg px-3 py-3 md:px-4 md:py-4 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.05)]">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mb-1">
                          <span className="inline-flex items-center gap-1"><FileText className="w-3.5 h-3.5" />{p.id}</span>
                          <span>·</span><span>{date}</span><span>·</span><span>{STATUS_LABEL[p.status ?? "reviewing"] ?? "Reviewing"}</span>
                        </div>
                        <div className="font-semibold text-slate-900 text-sm md:text-base line-clamp-2">{p.title}</div>
                        <div className="text-xs text-slate-600 mt-1">{p.partnerName} · {p.cooperationType} · {p.scope}</div>
                      </div>
                      <div className="flex md:flex-col items-end gap-2">
                        <Button variant="outline" size="sm" className="h-8 text-xs gap-1 border-slate-300" onClick={() => setSelectedLogId(isOpen ? null : p.id)}>
                          <ListTree className="w-3.5 h-3.5" />
                          Log Perjalanan
                        </Button>
                      </div>
                    </div>
                    {isOpen && (
                      <div className="mt-3 pt-3 border-t border-slate-100">
                        <div className="space-y-2">
                          {timeline.map((step, idx) => (
                            <div key={idx} className="flex items-start gap-2 text-xs">
                              <div className="mt-0.5">
                                <div className={`w-2 h-2 rounded-full border ${step.done ? "bg-emerald-500 border-emerald-500" : "bg-slate-100 border-slate-300"}`} />
                              </div>
                              <div>
                                <div className="font-medium text-slate-800">{step.label}</div>
                                <div className="text-slate-500 text-[11px]">{step.description}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
