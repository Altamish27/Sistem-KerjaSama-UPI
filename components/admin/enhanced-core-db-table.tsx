"use client";

import { useState, useMemo } from "react";
import { Search, Plus, Trash2, Edit2, Save, X, Database, Filter, Download, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type RowRecord = Record<string, unknown>;

interface EnhancedCoreDbTableProps {
  tableName: string;
  tableLabel: string;
  rows: RowRecord[];
  columns: string[];
  columnTypeHints: Record<string, string>;
  onUpdateCell: (rowIndex: number, column: string, value: string) => void;
  onAddRow: (row: RowRecord) => void;
  onRemoveRow: (index: number) => void;
  onAddColumn: (columnName: string) => void;
  onRemoveColumn: (columnName: string) => void;
  template: RowRecord;
}

function valueToInput(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  return JSON.stringify(value);
}

function parseCellValue(raw: string, typeHint?: string): unknown {
  const value = raw.trim();
  if (value === "") return null;

  if (typeHint === "boolean") return value === "true";
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

export default function EnhancedCoreDbTable({
  tableName,
  tableLabel,
  rows,
  columns,
  columnTypeHints,
  onUpdateCell,
  onAddRow,
  onRemoveRow,
  onAddColumn,
  onRemoveColumn,
  template,
}: EnhancedCoreDbTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [editingRowIndex, setEditingRowIndex] = useState<number | null>(null);
  const [editingRowData, setEditingRowData] = useState<RowRecord>({});
  const [isAddingRow, setIsAddingRow] = useState(false);
  const [newRowData, setNewRowData] = useState<RowRecord>(template);
  const [newColumnName, setNewColumnName] = useState("");
  const [showColumnManager, setShowColumnManager] = useState(false);

  const filteredRows = useMemo(() => {
    if (!searchQuery) return rows;
    const query = searchQuery.toLowerCase();
    return rows.filter((row) =>
      Object.values(row).some((val) => String(val).toLowerCase().includes(query))
    );
  }, [rows, searchQuery]);

  const startEdit = (index: number) => {
    setEditingRowIndex(index);
    setEditingRowData({ ...rows[index] });
  };

  const cancelEdit = () => {
    setEditingRowIndex(null);
    setEditingRowData({});
  };

  const saveEdit = () => {
    if (editingRowIndex === null) return;
    columns.forEach((col) => {
      onUpdateCell(editingRowIndex, col, valueToInput(editingRowData[col]));
    });
    cancelEdit();
  };

  const startAddRow = () => {
    setIsAddingRow(true);
    setNewRowData({ ...template });
  };

  const cancelAddRow = () => {
    setIsAddingRow(false);
    setNewRowData({ ...template });
  };

  const saveNewRow = () => {
    const normalized: RowRecord = {};
    columns.forEach((col) => {
      normalized[col] = parseCellValue(valueToInput(newRowData[col]), columnTypeHints[col]);
    });
    onAddRow(normalized);
    cancelAddRow();
  };

  const handleAddColumn = () => {
    if (!newColumnName.trim()) return;
    onAddColumn(newColumnName.trim());
    setNewColumnName("");
  };

  return (
    <div className="space-y-4">
      <Card className="border-gray-200 bg-white shadow-sm">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-white border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#e10000] to-[#b00000] flex items-center justify-center">
                <Database className="w-5 h-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-lg">{tableLabel}</CardTitle>
                <p className="text-xs text-gray-500 mt-0.5">
                  {filteredRows.length} {filteredRows.length === 1 ? "record" : "records"} {searchQuery && `(filtered from ${rows.length})`}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowColumnManager(!showColumnManager)}
                className="gap-2"
              >
                <Filter className="w-4 h-4" />
                Kelola Kolom
              </Button>
              <Button size="sm" onClick={startAddRow} className="gap-2 bg-[#e10000] hover:bg-[#b00000]">
                <Plus className="w-4 h-4" />
                Tambah Data
              </Button>
            </div>
          </div>

          <div className="relative mt-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari data..."
              className="pl-10 border-gray-300"
            />
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {showColumnManager && (
            <div className="p-4 bg-blue-50 border-b border-gray-200">
              <div className="space-y-3">
                <div className="flex items-end gap-2">
                  <div className="flex-1">
                    <Label className="text-xs font-semibold text-gray-700">Nama Kolom Baru</Label>
                    <Input
                      value={newColumnName}
                      onChange={(e) => setNewColumnName(e.target.value)}
                      placeholder="nama_kolom"
                      className="border-gray-300"
                    />
                  </div>
                  <Button onClick={handleAddColumn} size="sm" variant="outline">
                    <Plus className="w-4 h-4 mr-1" />
                    Tambah
                  </Button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {columns.map((col) => (
                    <div
                      key={col}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-xs"
                    >
                      <span className="font-medium text-gray-700">{col}</span>
                      <button
                        onClick={() => {
                          if (confirm(`Hapus kolom "${col}"?`)) {
                            onRemoveColumn(col);
                          }
                        }}
                        className="text-gray-400 hover:text-red-600 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100 border-b border-gray-200 sticky top-0">
                <tr>
                  <th className="text-left p-3 text-xs font-bold text-gray-700 uppercase tracking-wider w-16">
                    No
                  </th>
                  {columns.map((col) => (
                    <th
                      key={col}
                      className="text-left p-3 text-xs font-bold text-gray-700 uppercase tracking-wider min-w-40"
                    >
                      {col}
                      <span className="ml-1 text-[10px] font-normal text-gray-500">
                        ({columnTypeHints[col] || "string"})
                      </span>
                    </th>
                  ))}
                  <th className="text-left p-3 text-xs font-bold text-gray-700 uppercase tracking-wider w-32">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredRows.length === 0 && (
                  <tr>
                    <td colSpan={columns.length + 2} className="p-8 text-center text-gray-500">
                      <Database className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                      <p className="text-sm">
                        {searchQuery ? "Tidak ada data yang sesuai pencarian" : "Belum ada data"}
                      </p>
                    </td>
                  </tr>
                )}

                {filteredRows.map((row, rowIndex) => {
                  const isEditing = editingRowIndex === rowIndex;
                  const originalIndex = rows.indexOf(row);

                  return (
                    <tr
                      key={`${tableName}-${originalIndex}`}
                      className={cn(
                        "transition-colors",
                        isEditing ? "bg-blue-50" : "bg-white hover:bg-gray-50"
                      )}
                    >
                      <td className="p-3 text-sm text-gray-600 font-medium">{originalIndex + 1}</td>
                      {columns.map((col) => (
                        <td key={`${originalIndex}-${col}`} className="p-3">
                          {isEditing ? (
                            <Input
                              value={valueToInput(editingRowData[col])}
                              onChange={(e) =>
                                setEditingRowData((prev) => ({
                                  ...prev,
                                  [col]: parseCellValue(e.target.value, columnTypeHints[col]),
                                }))
                              }
                              className="text-sm border-gray-300"
                            />
                          ) : (
                            <span className="text-sm text-gray-700">
                              {valueToInput(row[col]) || (
                                <span className="text-gray-400 italic">null</span>
                              )}
                            </span>
                          )}
                        </td>
                      ))}
                      <td className="p-3">
                        {isEditing ? (
                          <div className="flex items-center gap-1">
                            <Button
                              size="sm"
                              onClick={saveEdit}
                              className="gap-1 bg-green-600 hover:bg-green-700"
                            >
                              <Save className="w-3 h-3" />
                              Simpan
                            </Button>
                            <Button size="sm" variant="ghost" onClick={cancelEdit}>
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => startEdit(originalIndex)}
                              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                            >
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                if (confirm("Hapus data ini?")) {
                                  onRemoveRow(originalIndex);
                                }
                              }}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {isAddingRow && (
        <Card className="border-[#e10000] bg-red-50 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-red-100 to-white border-b border-gray-200">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Tambah Data Baru</CardTitle>
              <Button size="sm" variant="ghost" onClick={cancelAddRow}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-4">
              {columns.map((col) => (
                <div key={`new-${col}`} className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-700">
                    {col}
                    <span className="ml-1 text-xs font-normal text-gray-500">
                      ({columnTypeHints[col] || "string"})
                    </span>
                  </Label>
                  <Input
                    value={valueToInput(newRowData[col])}
                    onChange={(e) =>
                      setNewRowData((prev) => ({
                        ...prev,
                        [col]: parseCellValue(e.target.value, columnTypeHints[col]),
                      }))
                    }
                    placeholder={
                      columnTypeHints[col] === "object"
                        ? '{"key":"value"}'
                        : columnTypeHints[col] === "boolean"
                          ? "true / false"
                          : "isi nilai"
                    }
                    className="border-gray-300"
                  />
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={cancelAddRow}>
                Batal
              </Button>
              <Button onClick={saveNewRow} className="gap-2 bg-[#e10000] hover:bg-[#b00000]">
                <Save className="w-4 h-4" />
                Simpan Data
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
