"use client";

import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Building2, Search, Users } from "lucide-react";
import { usePublicProposals } from "@/hooks/use-public-proposals";

interface PartnerProfile {
  name: string;
  companyEmail: string;
  totalProposals: number;
  lastProposalAt: string;
  category: string;
}

export default function MitraModule() {
  const { proposals } = usePublicProposals();
  const [search, setSearch] = useState("");

  const partners = useMemo<PartnerProfile[]>(() => {
    const map = new Map<string, PartnerProfile>();

    for (const p of proposals) {
      const key = `${p.partnerName}__${p.companyEmail}`;
      const existing = map.get(key);

      const category = (() => {
        const name = p.partnerName.toLowerCase();
        if (name.includes("universitas") || p.scope === "universitas") return "Universitas";
        if (name.includes("kementerian") || name.includes("dinas")) return "Instansi Pemerintah";
        return "Perusahaan / NGO";
      })();

      if (!existing) {
        map.set(key, {
          name: p.partnerName,
          companyEmail: p.companyEmail,
          totalProposals: 1,
          lastProposalAt: p.createdAt,
          category,
        });
      } else {
        existing.totalProposals += 1;
        if (new Date(p.createdAt) > new Date(existing.lastProposalAt)) {
          existing.lastProposalAt = p.createdAt;
        }
      }
    }

    return Array.from(map.values()).sort((a, b) => b.totalProposals - a.totalProposals);
  }, [proposals]);

  const filtered = useMemo(() => {
    const term = search.toLowerCase();
    if (!term) return partners;
    return partners.filter((p) =>
      p.name.toLowerCase().includes(term) || p.companyEmail.toLowerCase().includes(term),
    );
  }, [partners, search]);

  return (
    <div className="space-y-6 md:space-y-8">
      <div>
        <h2 className="text-2xl md:text-3xl font-semibold text-slate-900">Manajemen Mitra</h2>
        <p className="text-slate-600 mt-1 text-sm md:text-base">
          Daftar profil mitra eksternal yang sudah mengajukan kerja sama melalui kanal publik.
        </p>
      </div>

      <Card className="border-slate-200 bg-white shadow-sm">
        <CardHeader className="pb-3 md:pb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-slate-500" />
            <div>
              <CardTitle className="text-sm font-medium text-slate-700">Daftar Mitra</CardTitle>
              <p className="text-xs text-slate-500 mt-0.5">{filtered.length} mitra terdaftar.</p>
            </div>
          </div>
          <div className="relative w-full md:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-2 top-1/2 -translate-y-1/2" />
            <Input
              placeholder="Cari nama mitra / email"
              className="pl-8 h-8 text-xs"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {filtered.length === 0 ? (
            <div className="py-10 flex flex-col items-center gap-3 text-center text-sm text-slate-600">
              Belum ada mitra yang terdaftar dari pengajuan publik.
            </div>
          ) : (
            <div className="overflow-x-auto -mx-2 md:mx-0">
              <table className="min-w-full text-xs md:text-sm">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr className="text-left text-slate-600">
                    <th className="px-3 py-2 font-medium whitespace-nowrap">Mitra</th>
                    <th className="px-3 py-2 font-medium whitespace-nowrap">Kategori</th>
                    <th className="px-3 py-2 font-medium whitespace-nowrap">Total Pengajuan</th>
                    <th className="px-3 py-2 font-medium whitespace-nowrap">Pengajuan Terakhir</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((p) => {
                    const date = new Date(p.lastProposalAt).toLocaleDateString("id-ID", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    });

                    return (
                      <tr key={p.name + p.companyEmail} className="border-b border-slate-100 hover:bg-slate-50/60">
                        <td className="px-3 py-2 align-top min-w-[200px]">
                          <div className="flex items-start gap-2">
                            <div className="mt-0.5">
                              <Building2 className="w-4 h-4 text-slate-400" />
                            </div>
                            <div>
                              <div className="font-semibold text-slate-900">{p.name}</div>
                              <div className="text-[11px] text-slate-500">{p.companyEmail}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-2 align-top whitespace-nowrap text-xs text-slate-700">{p.category}</td>
                        <td className="px-3 py-2 align-top whitespace-nowrap text-xs text-slate-700">{p.totalProposals}</td>
                        <td className="px-3 py-2 align-top whitespace-nowrap text-xs text-slate-700">{date}</td>
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
