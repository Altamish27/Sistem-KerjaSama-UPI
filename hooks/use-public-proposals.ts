"use client";

import { useCallback, useEffect, useState } from "react";
import type { AppRole } from "@/lib/workflow";

export interface PublicProposalRecord {
  id: string;
  partnerName: string;
  address: string;
  contactPerson: string;
  contactPosition?: string;
  phone: string;
  companyEmail: string;
  title: string;
  purpose: string;
  cooperationType: string;
  scope: string;
  filePath?: string;
  fileBapPath?: string;
  createdAt: string;
  status?: "drafting" | "reviewing" | "signing" | "archived" | "rejected" | "completed";
  workflowStage?: string;
  initiatorRole?: "mitra" | "fakultas";
  initiatorUnit?: string;
  proposerType?: "external" | "internal";
  signatoryLevel?: "rektor" | "unit";
  partnerAccountSentAt?: string;
}

export interface WorkflowLogEntry {
  id: string;
  proposalId: string;
  action: "advance" | "reject" | "request_revision";
  version?: number;
  fromStage: string;
  toStage: string;
  actorRole: AppRole;
  actorName: string;
  comment?: string;
  at: string;
}

export function usePublicProposals() {
  const [data, setData] = useState<PublicProposalRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/public-proposal", { cache: "no-store" });
      if (!res.ok) {
        throw new Error("Gagal memuat data pengajuan");
      }
      const json = (await res.json()) as PublicProposalRecord[];
      setData(Array.isArray(json) ? json : []);
    } catch (err) {
      console.error("Failed to load public proposals", err);
      setError("Tidak dapat memuat data pengajuan publik.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/public-proposal", { cache: "no-store" });
        if (!res.ok) {
          throw new Error("Gagal memuat data pengajuan");
        }
        const json = (await res.json()) as PublicProposalRecord[];
        if (!cancelled) {
          setData(Array.isArray(json) ? json : []);
        }
      } catch (err) {
        console.error("Failed to load public proposals", err);
        if (!cancelled) {
          setError("Tidak dapat memuat data pengajuan publik.");
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    load();
    const intervalId = setInterval(() => {
      void load();
    }, 10000);

    return () => {
      cancelled = true;
      clearInterval(intervalId);
    };
  }, []);

  return { proposals: data, isLoading, error, refetch: load };
}

export function useWorkflowLogs(proposalId?: string) {
  const [logs, setLogs] = useState<WorkflowLogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!proposalId) {
      setLogs([]);
      return;
    }

    let cancelled = false;

    const load = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/public-proposal/${proposalId}/workflow`, { cache: "no-store" });
        if (!res.ok) {
          throw new Error("Gagal memuat log workflow");
        }
        const json = (await res.json()) as WorkflowLogEntry[];
        if (!cancelled) {
          setLogs(Array.isArray(json) ? json : []);
        }
      } catch (err) {
        console.error("Failed to load workflow logs", err);
        if (!cancelled) {
          setError("Tidak dapat memuat log workflow.");
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    load();
    const intervalId = setInterval(() => {
      void load();
    }, 10000);

    return () => {
      cancelled = true;
      clearInterval(intervalId);
    };
  }, [proposalId]);

  return { logs, isLoading, error };
}
