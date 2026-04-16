"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertCircle, Eye, Filter, Search } from "lucide-react";
import { usePublicProposals } from "@/hooks/use-public-proposals";
import { useWorkflowConfig } from "@/hooks/use-workflow-config";
import { getStage, normalizeWorkflowStage, type AppRole } from "@/lib/workflow";

interface ReviewQueueModuleProps {
  showActions?: boolean;
  roleSegment?: string;
  role?: AppRole;
}

export default function ReviewQueueModule({
  showActions = false,
  roleSegment = "dkui",
  role,
}: ReviewQueueModuleProps) {
  const router = useRouter();
  const { proposals } = usePublicProposals();
  const { config } = useWorkflowConfig();
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const filtered = useMemo(() => {
    return proposals.filter((p) => {
      if (role) {
        const stageId = normalizeWorkflowStage(p.workflowStage, config.stages);
        const stage = getStage(stageId, config.stages);
        if (stage.actorRole !== role) {
          return false;
        }
      }

      const term = search.toLowerCase();
      const matchText = !term || p.partnerName.toLowerCase().includes(term) || p.title.toLowerCase().includes(term);

      if (!matchText) return false;

      const created = new Date(p.createdAt).getTime();
      if (dateFrom) {
        const from = new Date(dateFrom).getTime();
        if (created < from) return false;
      }
      if (dateTo) {
        const to = new Date(dateTo).getTime() + 24 * 60 * 60 * 1000 - 1;
        if (created > to) return false;
      }

      return true;
    });
  }, [proposals, search, dateFrom, dateTo, role, config.stages]);

  return (
    <div className="space-y-6 md:space-y-8">
      <div>
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Antrean Review</h2>
        <p className="text-gray-600 mt-1 text-sm md:text-base">
          {role
            ? "Dokumen yang sedang berada di tahap review role Anda."
            : "Daftar pengajuan baru dari Mitra yang perlu dicek kelengkapannya."}
        </p>
      </div>

      <Card className="border-gray-200 bg-white shadow-sm">
        <CardHeader className="bg-gradient-to-r from-gray-50 to-white border-b border-gray-200">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <CardTitle className="text-base font-bold text-gray-900 flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#e10000] to-[#b00000] flex items-center justify-center">
                  <Filter className="w-4 h-4 text-white" />
                </div>
                Antrean Verifikasi
              </CardTitle>
              <p className="text-xs text-gray-600 mt-1.5">
                {filtered.length} pengajuan {filtered.length !== proposals.length && `dari total ${proposals.length}`}
              </p>
            </div>

            <div className="flex flex-col md:flex-row gap-2 md:items-center">
              <div className="relative w-full md:w-64">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <Input
                  placeholder="Cari nama mitra / judul"
                  className="pl-10 h-9 text-sm border-gray-300"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <Input 
                  type="date" 
                  className="h-9 text-sm border-gray-300" 
                  value={dateFrom} 
                  onChange={(e) => setDateFrom(e.target.value)}
                  title="Tanggal mulai"
                />
                <Input 
                  type="date" 
                  className="h-9 text-sm border-gray-300" 
                  value={dateTo} 
                  onChange={(e) => setDateTo(e.target.value)}
                  title="Tanggal akhir"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <div className="py-16 flex flex-col items-center gap-4 text-center">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-gray-400" />
              </div>
              <div>
                <p className="text-base font-semibold text-gray-900">Tidak ada pengajuan</p>
                <p className="text-sm text-gray-600 mt-1">Belum ada pengajuan yang menunggu review saat ini.</p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr className="text-left text-gray-700">
                    <th className="px-4 py-3 font-bold text-xs uppercase tracking-wider">Tanggal Masuk</th>
                    <th className="px-4 py-3 font-bold text-xs uppercase tracking-wider">Nama Mitra</th>
                    <th className="px-4 py-3 font-bold text-xs uppercase tracking-wider">Judul Kerja Sama</th>
                    {showActions && <th className="px-4 py-3 font-bold text-xs uppercase tracking-wider text-right">Aksi</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filtered.map((p) => {
                    const date = new Date(p.createdAt).toLocaleDateString("id-ID", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    });

                    return (
                      <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 align-top whitespace-nowrap text-gray-700 font-medium">{date}</td>
                        <td className="px-4 py-3 align-top min-w-[160px]">
                          <div className="font-semibold text-gray-900">{p.partnerName}</div>
                          <div className="text-xs text-gray-600 mt-0.5">{p.companyEmail}</div>
                        </td>
                        <td className="px-4 py-3 align-top min-w-[220px]">
                          <div className="text-gray-900 font-medium line-clamp-2">{p.title}</div>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-md font-medium">
                              {p.cooperationType}
                            </span>
                            <span className="text-xs text-gray-500">· {p.scope}</span>
                          </div>
                        </td>
                        {showActions && (
                          <td className="px-4 py-3 align-top whitespace-nowrap text-right">
                            <Button
                              variant="outline"
                              size="sm"
                              className="gap-2 border-gray-300 hover:border-[#e10000] hover:bg-red-50 hover:text-[#e10000]"
                              onClick={() => router.push(`/dashboard/${roleSegment}/review/${p.id}`)}
                            >
                              <Eye className="w-4 h-4" />
                              Review
                            </Button>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
