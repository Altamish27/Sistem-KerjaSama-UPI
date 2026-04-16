"use client";

import { useEffect, useMemo, useState } from "react";
import { Save, RotateCcw, Database } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCoreDb } from "@/hooks/use-core-db";
import { useSessionUser } from "@/hooks/use-session-user";
import EnhancedCoreDbTable from "@/components/admin/enhanced-core-db-table";
import type { CoreDb } from "@/lib/core-db";

type TableName = keyof CoreDb;
type RowRecord = Record<string, unknown>;

const TABLE_OPTIONS: { value: TableName; label: string }[] = [
  { value: "partners", label: "Partners" },
  { value: "pengajuan_kerjasama", label: "Pengajuan Kerjasama" },
  { value: "dokumen_kerjasama", label: "Dokumen Kerjasama" },
  { value: "review_histories", label: "Review Histories" },
  { value: "signature_profiles", label: "Signature Profiles" },
  { value: "signature_logs", label: "Signature Logs" },
  { value: "units", label: "Units" },
  { value: "users", label: "Users" },
];

const TABLE_TEMPLATES: Record<TableName, RowRecord> = {
  partners: {
    id: "",
    nama_instansi: "",
    alamat_lengkap: "",
    jenis_mitra: "industri",
    email_pic: "",
    nama_pic: "",
    no_hp_pic: "",
    is_active: true,
  },
  pengajuan_kerjasama: {
    id: "",
    partner_id: "",
    pengusul_id: null,
    judul_kerjasama: "",
    latar_belakang: "",
    tujuan: "",
    tanggal_pengajuan: "",
    tipe_pengusul: "external",
    status_pengajuan: "pending",
  },
  dokumen_kerjasama: {
    id: "",
    pengajuan_id: "",
    jenis_naskah: "MoU",
    level_penandatangan: "rektor",
    current_stage_id: "",
    current_stage_actor_role: "mitra",
    current_stage_actor_label: "Mitra Eksternal",
    unit_id: null,
    inisiator_id: null,
    nomor_naskah: null,
    file_url: null,
    file_bap_url: null,
    is_locked: false,
    tanggal_kadaluarsa: null,
    proposer_type: "external",
    partner_account_sent_at: null,
  },
  review_histories: {
    id: "",
    dokumen_id: "",
    reviewer_id: null,
    from_stage: "",
    to_stage: "",
    aksi: "approve",
    catatan: null,
    versi_dokumen: 1,
    created_at: "",
  },
  signature_profiles: {
    id: "",
    user_id: "",
    nama: "",
    jabatan: "",
    provider: "internal_upload",
    signature_hash: "",
    image_path: null,
    is_active: true,
    updated_at: "",
  },
  signature_logs: {
    id: "",
    dokumen_id: "",
    user_id: "",
    stage_id: "",
    is_paraf: true,
    signature_profile_id: null,
    signature_hash_snapshot: "",
    image_path_snapshot: null,
    provider_snapshot: "internal_upload",
    signed_at: "",
  },
  units: {
    id: "",
    nama_unit: "",
    kode_unit: "",
    pimpinan_id: null,
  },
  users: {
    id: "",
    unit_id: null,
    partner_id: null,
    nama: "",
    email: "",
    password: "",
    role: "fakultas_staf",
  },
};

function valueToInput(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  return JSON.stringify(value);
}

function parseCellValue(raw: string, typeHint?: string): unknown {
  const value = raw.trim();
  if (value === "") return null;

  if (typeHint === "boolean") {
    return value === "true";
  }
  if (typeHint === "number") {
    const asNumber = Number(value);
    return Number.isNaN(asNumber) ? null : asNumber;
  }
  if (typeHint === "object") {
    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  }

  if (value === "true") return true;
  if (value === "false") return false;
  if (/^-?\d+(\.\d+)?$/.test(value)) return Number(value);

  if (value.startsWith("{") || value.startsWith("[")) {
    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  }

  return value;
}

export default function CoreDbAdminModule() {
  const user = useSessionUser();
  const { data, isLoading, error, refetch } = useCoreDb();

  const [draftDb, setDraftDb] = useState<CoreDb>(data);
  const [activeTable, setActiveTable] = useState<TableName>("partners");
  const [newColumnName, setNewColumnName] = useState("");
  const [newRow, setNewRow] = useState<RowRecord>(TABLE_TEMPLATES.partners);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    setDraftDb(data);
  }, [data]);

  useEffect(() => {
    const template = TABLE_TEMPLATES[activeTable];
    setNewRow({ ...template });
  }, [activeTable]);

  const activeRows = useMemo(() => draftDb[activeTable] as RowRecord[], [draftDb, activeTable]);

  const columns = useMemo(() => {
    const fromRows = new Set<string>();
    activeRows.forEach((row) => {
      Object.keys(row).forEach((key) => fromRows.add(key));
    });
    Object.keys(TABLE_TEMPLATES[activeTable]).forEach((key) => fromRows.add(key));
    return Array.from(fromRows);
  }, [activeRows, activeTable]);

  const columnTypeHints = useMemo(() => {
    const hints: Record<string, string> = {};
    columns.forEach((column) => {
      for (const row of activeRows) {
        const value = row[column];
        if (value !== null && value !== undefined) {
          hints[column] = Array.isArray(value) ? "object" : typeof value;
          break;
        }
      }
      if (!hints[column]) {
        const templateValue = TABLE_TEMPLATES[activeTable][column];
        if (templateValue !== null && templateValue !== undefined) {
          hints[column] = Array.isArray(templateValue) ? "object" : typeof templateValue;
        }
      }
    });
    return hints;
  }, [columns, activeRows, activeTable]);

  const updateCell = (rowIndex: number, column: string, rawValue: string) => {
    setDraftDb((prev) => {
      const tableRows = [...(prev[activeTable] as RowRecord[])];
      const row = { ...tableRows[rowIndex] };
      row[column] = parseCellValue(rawValue, columnTypeHints[column]);
      tableRows[rowIndex] = row;
      return { ...prev, [activeTable]: tableRows };
    });
  };

  const addColumn = () => {
    const col = newColumnName.trim();
    if (!col) return;
    if (columns.includes(col)) {
      setSaveError("Nama kolom sudah ada.");
      return;
    }

    setDraftDb((prev) => {
      const tableRows = [...(prev[activeTable] as RowRecord[])].map((row) => ({ ...row, [col]: null }));
      return { ...prev, [activeTable]: tableRows };
    });
    setNewRow((prev) => ({ ...prev, [col]: "" }));
    setNewColumnName("");
    setSaveError(null);
  };

  const removeColumn = (col: string) => {
    setDraftDb((prev) => {
      const tableRows = [...(prev[activeTable] as RowRecord[])].map((row) => {
        const copy = { ...row };
        delete copy[col];
        return copy;
      });
      return { ...prev, [activeTable]: tableRows };
    });
    setNewRow((prev) => {
      const copy = { ...prev };
      delete copy[col];
      return copy;
    });
  };

  const updateNewRowField = (column: string, value: string) => {
    setNewRow((prev) => ({
      ...prev,
      [column]: parseCellValue(value, columnTypeHints[column]),
    }));
  };

  const addRow = () => {
    const normalized: RowRecord = {};
    columns.forEach((col) => {
      normalized[col] = newRow[col] ?? null;
    });

    setDraftDb((prev) => ({
      ...prev,
      [activeTable]: [...(prev[activeTable] as RowRecord[]), normalized],
    }));
    setNewRow({ ...TABLE_TEMPLATES[activeTable] });
  };

  const removeRow = (index: number) => {
    setDraftDb((prev) => ({
      ...prev,
      [activeTable]: (prev[activeTable] as RowRecord[]).filter((_, rowIndex) => rowIndex !== index),
    }));
  };

  const handleSave = async () => {
    setSaveError(null);
    setSaveMessage(null);
    setSaving(true);

    try {
      const res = await fetch("/api/core-db", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          actorRole: user?.role,
          data: draftDb,
        }),
      });

      if (!res.ok) {
        const payload = (await res.json().catch(() => null)) as { message?: string } | null;
        throw new Error(payload?.message || "Gagal menyimpan data inti.");
      }

      setSaveMessage("Data tabel berhasil disimpan.");
      await refetch();
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Gagal menyimpan data inti.");
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-[#e10000] rounded-full animate-spin mx-auto" />
          <p className="text-sm text-gray-500">Memuat data database...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert className="border-red-200 bg-red-50">
        <AlertDescription className="text-red-800">{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Database Management</h2>
          <p className="text-gray-600 mt-1 text-sm md:text-base">
            Kelola data sistem dengan interface yang mudah dan intuitif
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={() => void handleSave()}
            disabled={saving || user?.role !== "admin"}
            className="gap-2 bg-[#e10000] hover:bg-[#b00000]"
          >
            <Save className="w-4 h-4" />
            {saving ? "Menyimpan..." : "Simpan Perubahan"}
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              setDraftDb(data);
              setSaveError(null);
              setSaveMessage(null);
            }}
            disabled={saving}
            className="gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </Button>
        </div>
      </div>

      {saveError && (
        <Alert className="border-red-200 bg-red-50">
          <AlertDescription className="text-red-700">{saveError}</AlertDescription>
        </Alert>
      )}

      {saveMessage && (
        <Alert className="border-emerald-200 bg-emerald-50">
          <AlertDescription className="text-emerald-700">{saveMessage}</AlertDescription>
        </Alert>
      )}

      {user?.role !== "admin" && (
        <Alert className="border-amber-200 bg-amber-50">
          <AlertDescription className="text-amber-800 text-sm">
            Hanya user role admin yang bisa menyimpan perubahan.
          </AlertDescription>
        </Alert>
      )}

      <Card className="border-gray-200 bg-white shadow-sm">
        <CardHeader className="bg-gradient-to-r from-gray-50 to-white border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center">
              <Database className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg">Pilih Tabel</CardTitle>
              <p className="text-xs text-gray-500 mt-0.5">Pilih tabel yang ingin Anda kelola</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {TABLE_OPTIONS.map((table) => {
              const isActive = activeTable === table.value;
              const rowCount = (draftDb[table.value] as RowRecord[]).length;

              return (
                <button
                  key={table.value}
                  onClick={() => setActiveTable(table.value)}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${
                    isActive
                      ? "border-[#e10000] bg-red-50 shadow-md"
                      : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm"
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <Database className={`w-5 h-5 ${isActive ? "text-[#e10000]" : "text-gray-400"}`} />
                    {isActive && (
                      <div className="w-2 h-2 bg-[#e10000] rounded-full animate-pulse" />
                    )}
                  </div>
                  <h3 className="font-semibold text-gray-900 text-sm mb-1">{table.label}</h3>
                  <p className="text-xs text-gray-500">
                    {rowCount} {rowCount === 1 ? "record" : "records"}
                  </p>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <EnhancedCoreDbTable
        tableName={activeTable}
        tableLabel={TABLE_OPTIONS.find((t) => t.value === activeTable)?.label || activeTable}
        rows={activeRows}
        columns={columns}
        columnTypeHints={columnTypeHints}
        onUpdateCell={updateCell}
        onAddRow={addRow}
        onRemoveRow={removeRow}
        onAddColumn={addColumn}
        onRemoveColumn={removeColumn}
        template={newRow}
      />
    </div>
  );
}
