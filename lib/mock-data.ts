// ============================================
// APP TYPES & LABELS — SISTEM KERJA SAMA UPI
// ============================================
// Re-exports enum types from database.types.ts (single source of truth).
// Defines frontend interfaces (camelCase) and display labels.

import type {
  UserRole as DbUserRole,
  ProposalStatus as DbProposalStatus,
  ApprovalAction as DbApprovalAction,
  JenisDokumen,
  StatusPengajuan,
  InitiatorType as DbInitiatorType,
  RevisionType,
} from "@/lib/supabase/database.types"

// Re-export enum types so existing imports from "@/lib/mock-data" keep working
export type UserRole = DbUserRole
export type ProposalStatus = DbProposalStatus
export type ApprovalActionType = DbApprovalAction
export type InitiatorType = DbInitiatorType
export type { JenisDokumen, StatusPengajuan, RevisionType }

// ============================================
// USER
// ============================================

export interface User {
  id: string
  email: string
  password: string // empty string when loaded from DB
  name: string
  role: UserRole
  unitId?: string      // FK ke unit_kerja
  unitName?: string    // nama unit (joined / denormalized)
  institution?: string // untuk mitra
}

// Mock users sudah tidak digunakan — semua data dari Supabase
export const MOCK_USERS: User[] = []

export const ROLE_LABELS: Record<UserRole, string> = {
  mitra: "Mitra Eksternal",
  operator_unit: "Operator Unit",
  pimpinan_unit: "Pimpinan Unit",
  dkui: "DKUI",
  biro_hukum: "Biro Hukum",
  sekretaris_universitas: "Sekretaris Universitas",
  wakil_rektor: "Wakil Rektor",
  rektor: "Rektor",
}

// ============================================
// PROPOSAL DOCUMENT
// ============================================

export interface ProposalDocument {
  id: string
  name: string
  type: string
  size: number
  uploadedAt: string
  url: string
  category?: string
}

// ============================================
// PROPOSAL (frontend camelCase interface)
// ============================================

export interface Proposal {
  id: string
  proposalNumber?: string

  // Relations
  mitraId?: string
  inisiatorId?: string
  unitTerkaitId?: string
  createdBy?: string

  // Info dasar
  initiator: InitiatorType
  title: string
  jenisDokumen?: JenisDokumen

  // Konten
  description?: string
  objectives?: string
  benefits?: string
  scopeOfWork?: string
  ruangLingkup?: string

  // Lapkerma
  bentukKegiatanLapkerma?: string

  // Dokumen wajib (URL)
  fileBeritaAcaraPenjajakan?: string
  fileSuratKuasa?: string
  fileNaskahFinal?: string

  // Penandatangan
  penandatanganUpi?: string

  // Keuangan
  isIncomeGenerating: boolean

  // Timeline & Budget
  duration?: number
  startDate?: string
  endDate?: string
  budget?: number

  // Workflow
  status: ProposalStatus
  revisionType?: RevisionType
  revisionReason?: string

  // AI
  aiSummary?: string
  aiSummaryGeneratedAt?: string

  // Documents & History
  documents: ProposalDocument[]
  approvalHistory: ApprovalHistory[]

  // Denormalized display fields (from JOINs)
  mitraName?: string         // from mitra.nama_instansi
  unitName?: string          // from unit_kerja.nama_unit
  createdByName?: string
  createdByRole?: UserRole
  inisiatorName?: string

  // Tracking paraf & tanda tangan (sequential)
  pimpinanUnitApprovalBy?: string
  pimpinanUnitApprovalAt?: string
  dkuiApprovalBy?: string
  dkuiApprovalAt?: string
  biroHukumParafBy?: string
  biroHukumParafAt?: string
  suParafBy?: string
  suParafAt?: string
  wrParafBy?: string
  wrParafAt?: string
  rektorSignedBy?: string
  rektorSignedAt?: string
  pimpinanUnitSignedBy?: string
  pimpinanUnitSignedAt?: string
  mitraSignedBy?: string
  mitraSignedAt?: string

  // Timestamps
  createdAt: string
  updatedAt: string
  submittedAt?: string
  completedAt?: string
  rejectedAt?: string
  archivedAt?: string
}

// ============================================
// APPROVAL HISTORY
// ============================================

export interface ApprovalHistory {
  id: string
  proposalId: string
  action: ApprovalActionType
  actor: string        // actor_id
  actorName: string
  actorRole: UserRole
  tahapan?: string     // Tahap review (pimpinan_unit, dkui, biro_hukum, su, wr, rektor, mitra)
  comment?: string
  timestamp: string
  documentUrl?: string
}

// ============================================
// PENGAJUAN PENJAJAKAN (Guest Mode)
// ============================================

export interface PengajuanPenjajakan {
  id: string
  mitraId?: string
  namaInstansi: string
  emailPic: string
  namaPic?: string
  teleponPic?: string
  judulTawaran: string
  deskripsiSingkat?: string
  fileLegalitas?: string
  fileProfilMitra?: string
  statusPengajuan: StatusPengajuan
  catatanDkui?: string
  reviewedBy?: string
  reviewedAt?: string
  createdAt: string
}

// ============================================
// PENDANAAN (Income-Generating)
// ============================================

export interface Pendanaan {
  id: string
  proposalId: string
  nilaiKontrak?: number
  biayaPengembanganInstitusi?: number  // max 15%
  rekeningPenerima?: string
  statusPembayaran: string
  catatan?: string
  createdAt: string
  updatedAt: string
}

// ============================================
// MITRA
// ============================================

export interface Mitra {
  id: string
  namaInstansi: string
  alamatLengkap?: string
  jenisMitra: "dalam_negeri" | "luar_negeri"
  namaPenandatangan?: string
  jabatanPenandatangan?: string
  namaPic?: string
  kontakPic?: string
  emailPic?: string
  createdAt: string
  updatedAt: string
}

// ============================================
// UNIT KERJA
// ============================================

export interface UnitKerja {
  id: string
  namaUnit: string
  jenisUnit: string
  kodeUnit?: string
  createdAt: string
}

// ============================================
// STATUS & ACTION LABELS
// ============================================

// Mock proposals storage — tidak digunakan, data dari Supabase
export const MOCK_PROPOSALS: Proposal[] = []

export const STATUS_LABELS: Record<ProposalStatus, string> = {
  // Drafting
  draft: "Draft",
  submitted: "Diajukan",

  // Review berjenjang
  pimpinan_unit_reviewing: "Pimpinan Unit: Review",
  pimpinan_unit_approved: "Pimpinan Unit: Disetujui",
  pimpinan_unit_rejected: "Pimpinan Unit: Ditolak",

  dkui_reviewing: "DKUI: Review",
  dkui_approved: "DKUI: Disetujui",
  dkui_rejected: "DKUI: Ditolak",

  biro_hukum_reviewing: "Biro Hukum: Review Legalitas",
  biro_hukum_approved: "Biro Hukum: Legalitas Disetujui",
  biro_hukum_rejected: "Biro Hukum: Legalitas Ditolak",

  // Path A: SU & WR
  su_reviewing: "Sekretaris Universitas: Review",
  su_approved: "Sekretaris Universitas: Paraf",
  su_rejected: "Sekretaris Universitas: Ditolak",

  wr_reviewing: "Wakil Rektor: Review",
  wr_approved: "Wakil Rektor: Paraf",
  wr_rejected: "Wakil Rektor: Ditolak",

  // Penandatanganan
  rektor_signing: "Rektor: Tanda Tangan",
  rektor_signed: "Rektor: Sudah Ditandatangani",
  pimpinan_unit_signing: "Pimpinan Unit: Tanda Tangan",
  pimpinan_unit_signed: "Pimpinan Unit: Sudah Ditandatangani",
  mitra_signing: "Mitra: Tanda Tangan",
  mitra_signed: "Mitra: Sudah Ditandatangani",

  // Revisi loop
  dkui_self_revising: "DKUI: Revisi Draf",
  mitra_resubmitted: "Persetujuan Ulang",

  // Terminal
  archived: "Diarsipkan",
  completed: "Selesai",
  rejected: "Ditolak Final",
}

export const STATUS_PENGAJUAN_LABELS: Record<StatusPengajuan, string> = {
  pending: "Menunggu Review",
  ditolak: "Ditolak",
  diteruskan: "Diteruskan ke Unit",
}

export const JENIS_DOKUMEN_LABELS: Record<JenisDokumen, string> = {
  "MoU": "MoU (Nota Kesepahaman)",
  "MoA/PKS": "MoA / PKS (Perjanjian Kerja Sama)",
  "IA": "IA (Pengaturan Pelaksanaan)",
}

export const PROPOSAL_TYPE_LABELS = {
  internal: "Pengusul Internal UPI",
  mitra: "Pengusul Mitra Eksternal",
}
