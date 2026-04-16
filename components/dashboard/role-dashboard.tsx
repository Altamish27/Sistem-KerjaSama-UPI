"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { usePublicProposals } from "@/hooks/use-public-proposals";
import { useWorkflowConfig } from "@/hooks/use-workflow-config";
import { useSessionUser } from "@/hooks/use-session-user";
import {
  getNextStage,
  getStage,
  normalizeWorkflowStage,
  ROLE_LABEL,
  WORKFLOW_TITLE,
  type AppRole,
} from "@/lib/workflow";
import { roleToSegment } from "@/lib/dashboard-config";
import WorkflowTimeline from "@/components/workflow/workflow-timeline";
import Link from "next/link";

interface RoleDashboardProps {
  role: AppRole;
}

export default function RoleDashboard({ role }: RoleDashboardProps) {
  const user = useSessionUser();
  const { proposals, isLoading, error } = usePublicProposals();
  const { config } = useWorkflowConfig();
  const roleSegment = roleToSegment(role);

  const filtered = useMemo(() => {
    const normalize = proposals.map((proposal) => {
      const stageId = normalizeWorkflowStage(proposal.workflowStage, config.stages);
      const stage = getStage(stageId, config.stages);
      const next = getNextStage(stageId, config.stages);

      return {
        ...proposal,
        stageId,
        stage,
        next,
      };
    });

    if (role === "mitra" && user?.email) {
      return normalize.filter((item) => item.companyEmail.toLowerCase() === user.email.toLowerCase());
    }

    return normalize;
  }, [proposals, role, user?.email, config.stages]);

  const assignedToRole = filtered.filter((item) => item.stage.actorRole === role);
  const canActCount = filtered.filter((item) => item.stage.actorRole === role).length;

  const agingAlerts = useMemo(() => {
    const now = Date.now();
    return filtered.filter((item) => {
      const createdAt = new Date(item.createdAt).getTime();
      if (Number.isNaN(createdAt)) return false;
      const ageInDays = (now - createdAt) / (24 * 60 * 60 * 1000);
      return ageInDays >= 3 && item.stage.actorRole === role && item.status !== "completed";
    });
  }, [filtered, role]);

  const workloadByUnit = useMemo(() => {
    const map = new Map<string, number>();
    filtered.forEach((item) => {
      const unit = item.initiatorUnit || "Belum ditentukan";
      map.set(unit, (map.get(unit) || 0) + 1);
    });
    return Array.from(map.entries())
      .map(([unit, total]) => ({ unit, total }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);
  }, [filtered]);

  const finalInbox = useMemo(() => {
    return filtered.filter((item) => item.stageId === "rector_tte" || item.stageId === "warek_paraf");
  }, [filtered]);

  return (
    <div className="space-y-6 md:space-y-8">
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-[0.18em] text-slate-500 font-semibold">Dashboard Peran</p>
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900">{config.title || WORKFLOW_TITLE}</h1>
        <p className="text-sm text-slate-600">
          Ruang kerja role: <span className="font-semibold">{ROLE_LABEL[role]}</span>
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="border-slate-200 bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs text-slate-500">Total Pengajuan</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-slate-900">{filtered.length}</p>
          </CardContent>
        </Card>
        <Card className="border-slate-200 bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs text-slate-500">Menunggu Role Ini</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-slate-900">{assignedToRole.length}</p>
          </CardContent>
        </Card>
        <Card className="border-slate-200 bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs text-slate-500">Aksi Bisa Dijalankan</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-slate-900">{canActCount}</p>
          </CardContent>
        </Card>
      </div>

      {role === "mitra" && (
        <Card className="border-sky-200 bg-sky-50/70">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-sky-900">Mitra Tracking View</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-sky-900 space-y-1">
            <p>My Collaboration List tersedia pada daftar di bawah.</p>
            <p>Tracker menggunakan bahasa proses sederhana (bukan ID teknis stage).</p>
            <p>Catatan internal reviewer tidak ditampilkan untuk akun mitra.</p>
          </CardContent>
        </Card>
      )}

      {role === "dkui" && (
        <div className="grid gap-3 md:grid-cols-2">
          <Card className="border-slate-200 bg-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-slate-700">Workload Monitoring Unit</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs text-slate-700">
              {workloadByUnit.length === 0 && <p>Belum ada data unit.</p>}
              {workloadByUnit.map((row) => (
                <div key={row.unit} className="flex items-center justify-between rounded border px-2 py-1">
                  <span>{row.unit}</span>
                  <span className="font-semibold">{row.total}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-amber-200 bg-amber-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-amber-900">Aging Alert (&gt; 3 Hari)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs text-amber-900">
              {agingAlerts.length === 0 && <p>Tidak ada dokumen tertahan di role DKUI.</p>}
              {agingAlerts.slice(0, 5).map((item) => (
                <div key={item.id} className="rounded border border-amber-300 bg-white px-2 py-1">
                  <p className="font-medium">{item.title}</p>
                  <p className="text-[11px]">Mitra: {item.partnerName}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}

      {role === "fakultas" && (
        <Card className="border-slate-200 bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-slate-700">Inisiator Workspace</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-slate-700 space-y-1">
            <p>Drafting Editor/Uploader dan Revision Room tersedia di halaman detail proposal pada tahap drafting/revisi.</p>
            <p>Partner Sync tersedia pada tahap draft submission.</p>
            <p>Write lock aktif otomatis ketika dokumen sudah berada di meja reviewer/pimpinan.</p>
          </CardContent>
        </Card>
      )}

      {(role === "biro_hukum" || role === "sekretaris_univ" || role === "warek") && (
        <Card className="border-slate-200 bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-slate-700">Reviewer Tracking View</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-slate-700 space-y-1">
            <p>Approval Queue hanya menampilkan dokumen pada tahap role Anda.</p>
            <p>Aksi approve/revisi/tolak hanya aktif sesuai stage dan flow.</p>
            <p>Halaman detail menampilkan upstream/downstream (dari tahap sebelumnya ke tahap berikutnya).</p>
          </CardContent>
        </Card>
      )}

      {role === "rektor" && (
        <div className="grid gap-3 md:grid-cols-2">
          <Card className="border-slate-200 bg-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-slate-700">Final Approval Inbox</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs text-slate-700">
              {finalInbox.length === 0 && <p>Tidak ada dokumen matang yang menunggu pengesahan.</p>}
              {finalInbox.slice(0, 5).map((item) => (
                <div key={item.id} className="rounded border px-2 py-1">
                  <p className="font-medium">{item.title}</p>
                  <p className="text-[11px]">Tahap: {item.stage.title}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-slate-200 bg-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-slate-700">Completion Progress</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs text-slate-700">
              {filtered.slice(0, 3).map((item) => {
                const stageIndex = config.stages.findIndex((s) => s.id === item.stageId);
                const pct = Math.max(5, Math.round(((stageIndex + 1) / Math.max(1, config.stages.length)) * 100));
                return (
                  <div key={item.id} className="space-y-1">
                    <p className="line-clamp-1">{item.title}</p>
                    <div className="h-2 rounded bg-slate-100 overflow-hidden">
                      <div className="h-full bg-slate-900" style={{ width: `${pct}%` }} />
                    </div>
                    <p className="text-[11px] text-slate-500">{pct}% menuju pengarsipan</p>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>
      )}

      {isLoading && <p className="text-sm text-slate-500">Memuat data dashboard...</p>}

      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertDescription className="text-red-700 text-sm">{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-4">
        {filtered.map((proposal) => {
          return (
            <Card key={proposal.id} className="border-slate-200 bg-white shadow-sm">
              <CardHeader className="pb-2 md:pb-3">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-2">
                  <div>
                    <CardTitle className="text-base text-slate-900">{proposal.title}</CardTitle>
                    <p className="text-xs text-slate-500 mt-1">
                      {proposal.partnerName} · ID {proposal.id}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] text-slate-700">
                      Tahap: {proposal.stage.title}
                    </span>
                    {proposal.next && (
                      <span className="inline-flex rounded-full border border-blue-200 bg-blue-50 px-2 py-1 text-[11px] text-blue-700">
                        Next: {proposal.next.title}
                      </span>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <WorkflowTimeline stageId={proposal.stageId} createdAt={proposal.createdAt} />

                <div className="flex items-center justify-between gap-2">
                  <Button asChild variant="outline" size="sm" className="h-8 text-xs">
                    <Link href={`/dashboard/proposal/${proposal.id}?role=${roleSegment}`}>Buka Detail Proposal</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
