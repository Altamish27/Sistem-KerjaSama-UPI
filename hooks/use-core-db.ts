"use client";

import { useCallback, useEffect, useState } from "react";
import type { CoreDb } from "@/lib/core-db";

const EMPTY_DB: CoreDb = {
  partners: [],
  pengajuan_kerjasama: [],
  dokumen_kerjasama: [],
  review_histories: [],
  signature_profiles: [],
  signature_logs: [],
  units: [],
  users: [],
};

export function useCoreDb() {
  const [data, setData] = useState<CoreDb>(EMPTY_DB);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/core-db", { cache: "no-store" });
      if (!res.ok) {
        throw new Error("Gagal memuat data inti.");
      }
      const json = (await res.json()) as CoreDb;
      setData(json);
    } catch (err) {
      console.error("Failed to load core db", err);
      setError("Tidak dapat memuat data inti.");
      setData(EMPTY_DB);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return { data, isLoading, error, refetch: load };
}
