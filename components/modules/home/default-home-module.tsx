"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, CheckCircle2, Clock, FileText, PieChart, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePublicProposals } from "@/hooks/use-public-proposals";

export default function DefaultHomeModule() {
  const { proposals } = usePublicProposals();

  const stats = useMemo(() => {
    const total = proposals.length;
    const inProgress = proposals.filter((p) => !p.status || p.status === "reviewing" || p.status === "drafting").length;
    const completed = proposals.filter((p) => p.status === "completed" || p.status === "signing").length;
    const rejected = proposals.filter((p) => p.status === "rejected").length;

    return { total, inProgress, completed, rejected };
  }, [proposals]);

  const monthlyTrend = useMemo(() => {
    const months = Array.from({ length: 12 }, (_, i) => ({ month: i, count: 0 }));

    proposals.forEach((p) => {
      const d = new Date(p.createdAt);
      if (!isNaN(d.getTime())) {
        const m = d.getMonth();
        months[m].count += 1;
      }
    });

    return months;
  }, [proposals]);

  const partnerCategories = useMemo(() => {
    const base = {
      perusahaan: 0,
      universitas: 0,
      pemerintah: 0,
      ngo: 0,
    };

    for (const p of proposals) {
      const name = p.partnerName.toLowerCase();
      if (name.includes("universitas") || p.scope === "universitas") base.universitas += 1;
      else if (name.includes("kementerian") || name.includes("dinas")) base.pemerintah += 1;
      else if (name.includes("yayasan") || name.includes("foundation")) base.ngo += 1;
      else base.perusahaan += 1;
    }

    const total = Object.values(base).reduce((acc, v) => acc + v, 0) || 1;

    return {
      ...base,
      total,
      perusahaanPct: (base.perusahaan / total) * 100,
      universitasPct: (base.universitas / total) * 100,
      pemerintahPct: (base.pemerintah / total) * 100,
      ngoPct: (base.ngo / total) * 100,
    };
  }, [proposals]);

  const statusBuckets = useMemo(() => {
    return {
      reviewHukum: proposals.filter((p) => p.status === "reviewing").length,
      sekretaris: 0,
      wakilRektor: 0,
    };
  }, [proposals]);

  return (
    <div className="space-y-6 md:space-y-8">
      <div>
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Ringkasan Pengajuan</h2>
        <p className="text-gray-600 mt-1 text-sm md:text-base max-w-2xl">
          Pusat statistik kumulatif dan tren kerja sama yang diajukan oleh Mitra
        </p>
      </div>

      <div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold text-gray-700">Total Pengajuan</CardTitle>
            <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
              <FileText className="w-5 h-5 text-gray-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{stats.total}</div>
            <p className="text-xs text-gray-500 mt-1">Semua pengajuan yang pernah masuk</p>
          </CardContent>
        </Card>

        <Card className="border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold text-gray-700">Proses Berjalan</CardTitle>
            <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center border border-amber-200">
              <Clock className="w-5 h-5 text-amber-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{stats.inProgress}</div>
            <p className="text-xs text-gray-500 mt-1">Sedang dalam proses review/drafting</p>
          </CardContent>
        </Card>

        <Card className="border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold text-gray-700">Selesai (Disahkan)</CardTitle>
            <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center border border-amber-200">
              <CheckCircle2 className="w-5 h-5 text-amber-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{stats.completed}</div>
            <p className="text-xs text-gray-500 mt-1">Kerja sama yang telah ditandatangani</p>
          </CardContent>
        </Card>

        <Card className="border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold text-gray-700">Ditolak</CardTitle>
            <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center border border-red-200">
              <AlertCircle className="w-5 h-5 text-[#e10000]" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{stats.rejected}</div>
            <p className="text-xs text-gray-500 mt-1">Tidak lolos seleksi awal / review</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-gray-200 bg-white shadow-sm">
          <CardHeader className="bg-gradient-to-r from-gray-50 to-white border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold text-gray-900">Tren Pengajuan per Bulan</CardTitle>
                <p className="text-xs text-gray-600 mt-1">Jumlah pengajuan kerja sama berdasarkan bulan masuk</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center border border-red-200">
                <TrendingUp className="w-5 h-5 text-[#e10000]" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="h-48 flex items-end gap-1 md:gap-2">
              {monthlyTrend.map((m, index) => {
                const max = Math.max(...monthlyTrend.map((x) => x.count), 1);
                const height = (m.count / max) * 100;
                const monthLabel = new Date(2024, m.month, 1).toLocaleDateString("id-ID", {
                  month: "short",
                });

                return (
                  <div key={index} className="flex-1 flex flex-col items-center gap-1">
                    <div
                      className="w-full rounded-t-lg bg-gradient-to-t from-[#e10000] to-[#ff6b6b] transition-all hover:opacity-80 cursor-pointer"
                      style={{ height: `${height || 4}%` }}
                      title={`${monthLabel}: ${m.count} pengajuan`}
                    />
                    <span className="text-[10px] text-gray-600 font-medium">{monthLabel}</span>
                    <span className="text-[10px] text-gray-400">{m.count}</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-200 bg-white shadow-sm">
          <CardHeader className="bg-gradient-to-r from-amber-50 to-white border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold text-gray-900">Distribusi Kategori Mitra</CardTitle>
                <p className="text-xs text-gray-600 mt-1">Perusahaan, Universitas, Pemerintah, dan NGO</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                <PieChart className="w-5 h-5 text-amber-600" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="flex items-center gap-6">
              <div className="relative w-32 h-32 shrink-0">
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#e10000] via-[#ff6b6b] to-[#ffcc00]" />
                <div className="absolute inset-3 rounded-full bg-white shadow-inner" />
                <div className="absolute inset-5 flex flex-col items-center justify-center">
                  <span className="text-xs text-gray-600 font-medium">Total</span>
                  <span className="text-2xl font-bold text-gray-900">{partnerCategories.total}</span>
                </div>
              </div>
              <div className="flex-1 space-y-2.5 text-xs">
                <CategoryRow label="Perusahaan" value={partnerCategories.perusahaan} pct={partnerCategories.perusahaanPct} color="bg-[#e10000]" />
                <CategoryRow label="Universitas Lain" value={partnerCategories.universitas} pct={partnerCategories.universitasPct} color="bg-[#b00000]" />
                <CategoryRow label="Instansi Pemerintah" value={partnerCategories.pemerintah} pct={partnerCategories.pemerintahPct} color="bg-[#ffcc00]" />
                <CategoryRow label="NGO" value={partnerCategories.ngo} pct={partnerCategories.ngoPct} color="bg-gray-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-gray-200 bg-white shadow-sm">
          <CardHeader className="bg-gradient-to-r from-gray-50 to-white border-b border-gray-200">
            <CardTitle className="text-base font-bold text-gray-900">Status Tracking Tahapan Dokumen</CardTitle>
            <p className="text-xs text-gray-600 mt-1">Distribusi dokumen berdasarkan tahap approval</p>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row md:items-stretch gap-4 md:gap-6">
              <TimelineStep
                label="Review Hukum (DKUI/Biro Hukum)"
                count={statusBuckets.reviewHukum}
                description="Dokumen dalam antrean review legal & naskah."
                color="border-gray-300 bg-gray-50"
              />
              <TimelineStep
                label="Sekretaris Rektor"
                count={statusBuckets.sekretaris}
                description="Menunggu penjadwalan atau pengelolaan administrasi."
                color="border-amber-200 bg-amber-50"
              />
              <TimelineStep
                label="Wakil Rektor / Rektor"
                count={statusBuckets.wakilRektor}
                description="Menunggu persetujuan dan penandatanganan akhir."
                color="border-red-200 bg-red-50"
              />
          </div>
          <p className="mt-4 text-xs text-gray-500 italic">
            *Angka akan lebih akurat setelah integrasi penuh dengan modul workflow internal.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function CategoryRow({
  label,
  value,
  pct,
  color,
}: {
  label: string;
  value: number;
  pct: number;
  color: string;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-2">
        <span className="text-gray-700 font-medium">{label}</span>
        <span className="text-gray-600 font-semibold">{value}</span>
      </div>
      <div className="h-2 w-full rounded-full bg-gray-100 overflow-hidden">
        <div 
          className={cn("h-full rounded-full transition-all duration-500", color)} 
          style={{ width: `${pct || 0}%` }} 
        />
      </div>
    </div>
  );
}

function TimelineStep({
  label,
  count,
  description,
  color,
}: {
  label: string;
  count: number;
  description: string;
  color: string;
}) {
  return (
    <div className={cn("flex-1 rounded-xl border-2 px-4 py-4 flex flex-col gap-2 transition-all hover:shadow-md", color)}>
      <span className="text-xs font-bold text-gray-700 uppercase tracking-wide">{label}</span>
      <span className="text-3xl font-bold text-gray-900">{count}</span>
      <span className="text-xs text-gray-600">{description}</span>
    </div>
  );
}
