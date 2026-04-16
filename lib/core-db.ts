import fs from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import type { AppRole, ProposalStatus, WorkflowActionType } from "@/lib/workflow";

export interface Partner {
  id: string;
  nama_instansi: string;
  alamat_lengkap: string;
  jenis_mitra: "industri" | "pendidikan" | "pemerintah" | "ngo";
  email_pic: string;
  nama_pic: string;
  no_hp_pic: string;
  is_active: boolean;
}

export interface PengajuanKerjasama {
  id: string;
  partner_id: string;
  pengusul_id: string | null;
  judul_kerjasama: string;
  latar_belakang: string;
  tujuan: string;
  tanggal_pengajuan: string;
  tipe_pengusul: "internal" | "external";
  status_pengajuan: "pending" | "approved" | "rejected";
}

export interface DokumenKerjasama {
  id: string;
  pengajuan_id: string;
  jenis_naskah: "MoU" | "MoA" | "IA";
  level_penandatangan: "rektor" | "unit";
  current_stage_id: string;
  current_stage_actor_role: AppRole | "system";
  current_stage_actor_label: string;
  unit_id: string | null;
  inisiator_id: string | null;
  nomor_naskah: string | null;
  file_url: string | null;
  file_bap_url: string | null;
  is_locked: boolean;
  tanggal_kadaluarsa: string | null;
  proposer_type: "external" | "internal";
  partner_account_sent_at: string | null;
}

export interface ReviewHistory {
  id: string;
  dokumen_id: string;
  reviewer_id: string | null;
  from_stage: string;
  to_stage: string;
  aksi: "approve" | "revise" | "reject";
  catatan: string | null;
  versi_dokumen: number;
  created_at: string;
}

export interface SignatureProfile {
  id: string;
  user_id: string;
  nama: string;
  jabatan: string;
  provider: "internal_upload" | "tte_provider";
  signature_hash: string;
  image_path: string | null;
  is_active: boolean;
  updated_at: string;
}

export interface SignatureLog {
  id: string;
  dokumen_id: string;
  user_id: string;
  stage_id: string;
  is_paraf: boolean;
  signature_profile_id: string | null;
  signature_hash_snapshot: string;
  image_path_snapshot: string | null;
  provider_snapshot: "internal_upload" | "tte_provider";
  signed_at: string;
}

export interface Unit {
  id: string;
  nama_unit: string;
  kode_unit: string;
  pimpinan_id: string | null;
}

export type DbUserRole =
  | "admin"
  | "dkui"
  | "fakultas_staf"
  | "pimpinan_unit"
  | "legal"
  | "sekretaris_univ"
  | "warek"
  | "rektor"
  | "mitra";

export interface DbUser {
  id: string;
  unit_id: string | null;
  partner_id: string | null;
  nama: string;
  email: string;
  password: string;
  role: DbUserRole;
}

export interface CoreDb {
  partners: Partner[];
  pengajuan_kerjasama: PengajuanKerjasama[];
  dokumen_kerjasama: DokumenKerjasama[];
  review_histories: ReviewHistory[];
  signature_profiles: SignatureProfile[];
  signature_logs: SignatureLog[];
  units: Unit[];
  users: DbUser[];
}

const DB_DIR = path.join(process.cwd(), "data", "core-db");
const TABLE_FILES = {
  partners: path.join(DB_DIR, "partners.json"),
  pengajuan_kerjasama: path.join(DB_DIR, "pengajuan_kerjasama.json"),
  dokumen_kerjasama: path.join(DB_DIR, "dokumen_kerjasama.json"),
  review_histories: path.join(DB_DIR, "review_histories.json"),
  signature_profiles: path.join(DB_DIR, "signature_profiles.json"),
  signature_logs: path.join(DB_DIR, "signature_logs.json"),
  units: path.join(DB_DIR, "units.json"),
  users: path.join(DB_DIR, "users.json"),
} as const;

const EMPTY_CORE_DB: CoreDb = {
  partners: [],
  pengajuan_kerjasama: [],
  dokumen_kerjasama: [],
  review_histories: [],
  signature_profiles: [],
  signature_logs: [],
  units: [],
  users: [],
};

function mapDbRoleToAppRole(role: DbUserRole): AppRole {
  if (role === "fakultas_staf" || role === "pimpinan_unit") return "fakultas";
  if (role === "legal") return "biro_hukum";
  return role as AppRole;
}

export function dbRoleToJabatan(role: DbUserRole): string {
  switch (role) {
    case "dkui":
      return "Staf DKUI";
    case "legal":
      return "Staf Biro Hukum";
    case "sekretaris_univ":
      return "Sekretaris Universitas";
    case "fakultas_staf":
      return "Staf Fakultas/Unit";
    case "pimpinan_unit":
      return "Pimpinan Unit";
    case "warek":
      return "Wakil Rektor";
    case "rektor":
      return "Rektor";
    case "mitra":
      return "Perwakilan Mitra";
    case "admin":
      return "Admin Sistem";
    default:
      return "Pengguna";
  }
}

function mapAppRoleToDbRole(role: AppRole): DbUserRole {
  if (role === "fakultas") return "fakultas_staf";
  if (role === "biro_hukum") return "legal";
  return role as DbUserRole;
}

export async function readCoreDb(): Promise<CoreDb> {
  const tableEntries = await Promise.all(
    Object.entries(TABLE_FILES).map(async ([tableName, filePath]) => {
      try {
        const raw = await fs.readFile(filePath, "utf-8");
        const parsed = JSON.parse(raw) as unknown;
        return [tableName, Array.isArray(parsed) ? parsed : []] as const;
      } catch (error: unknown) {
        if (typeof error === "object" && error && "code" in error && (error as { code?: string }).code === "ENOENT") {
          return [tableName, null] as const;
        }
        throw error;
      }
    }),
  );

  return {
    partners: tableEntries.find(([k]) => k === "partners")?.[1] as Partner[] || [],
    pengajuan_kerjasama: tableEntries.find(([k]) => k === "pengajuan_kerjasama")?.[1] as PengajuanKerjasama[] || [],
    dokumen_kerjasama: tableEntries.find(([k]) => k === "dokumen_kerjasama")?.[1] as DokumenKerjasama[] || [],
    review_histories: tableEntries.find(([k]) => k === "review_histories")?.[1] as ReviewHistory[] || [],
    signature_profiles: tableEntries.find(([k]) => k === "signature_profiles")?.[1] as SignatureProfile[] || [],
    signature_logs: tableEntries.find(([k]) => k === "signature_logs")?.[1] as SignatureLog[] || [],
    units: tableEntries.find(([k]) => k === "units")?.[1] as Unit[] || [],
    users: tableEntries.find(([k]) => k === "users")?.[1] as DbUser[] || [],
  };
}

export async function writeCoreDb(db: CoreDb) {
  await fs.mkdir(DB_DIR, { recursive: true });
  await Promise.all([
    fs.writeFile(TABLE_FILES.partners, JSON.stringify(db.partners, null, 2), "utf-8"),
    fs.writeFile(TABLE_FILES.pengajuan_kerjasama, JSON.stringify(db.pengajuan_kerjasama, null, 2), "utf-8"),
    fs.writeFile(TABLE_FILES.dokumen_kerjasama, JSON.stringify(db.dokumen_kerjasama, null, 2), "utf-8"),
    fs.writeFile(TABLE_FILES.review_histories, JSON.stringify(db.review_histories, null, 2), "utf-8"),
    fs.writeFile(TABLE_FILES.signature_profiles, JSON.stringify(db.signature_profiles, null, 2), "utf-8"),
    fs.writeFile(TABLE_FILES.signature_logs, JSON.stringify(db.signature_logs, null, 2), "utf-8"),
    fs.writeFile(TABLE_FILES.units, JSON.stringify(db.units, null, 2), "utf-8"),
    fs.writeFile(TABLE_FILES.users, JSON.stringify(db.users, null, 2), "utf-8"),
  ]);
}

export function toPublicProposalRecord(db: CoreDb, document: DokumenKerjasama) {
  const pengajuan = db.pengajuan_kerjasama.find((p) => p.id === document.pengajuan_id);
  if (!pengajuan) return null;
  const partner = db.partners.find((p) => p.id === pengajuan.partner_id);
  if (!partner) return null;

  const cooperationType = document.jenis_naskah === "MoU" ? "strategis" : "operasional";
  const scope = document.level_penandatangan === "rektor" ? "universitas" : "fakultas";

  const status: ProposalStatus =
    pengajuan.status_pengajuan === "rejected"
      ? "rejected"
      : document.current_stage_id === "completed"
      ? "completed"
      : document.current_stage_id === "archiving"
      ? "archived"
      : ["warek_paraf", "rector_tte", "unit_leader_tte", "partner_signing"].includes(document.current_stage_id)
      ? "signing"
      : ["guest_submitted", "negotiation", "draft_submission"].includes(document.current_stage_id)
      ? "drafting"
      : "reviewing";

  return {
    id: document.id,
    partnerName: partner.nama_instansi,
    address: partner.alamat_lengkap,
    contactPerson: partner.nama_pic,
    contactPosition: undefined,
    phone: partner.no_hp_pic,
    companyEmail: partner.email_pic,
    title: pengajuan.judul_kerjasama,
    purpose: pengajuan.tujuan,
    cooperationType,
    scope,
    filePath: document.file_url || undefined,
    fileBapPath: document.file_bap_url || undefined,
    createdAt: pengajuan.tanggal_pengajuan,
    status,
    workflowStage: document.current_stage_id,
    initiatorRole: document.inisiator_id ? "fakultas" : "mitra",
    initiatorUnit: document.unit_id || undefined,
    proposerType: document.proposer_type,
    signatoryLevel: document.level_penandatangan,
    partnerAccountSentAt: document.partner_account_sent_at || undefined,
  };
}

export function findDocumentByProposalIdOrDocumentId(db: CoreDb, id: string): DokumenKerjasama | undefined {
  return (
    db.dokumen_kerjasama.find((d) => d.id === id) ||
    db.dokumen_kerjasama.find((d) => d.pengajuan_id === id)
  );
}

export function createGuestSubmission(payload: {
  partnerName: string;
  address: string;
  contactPerson: string;
  phone: string;
  companyEmail: string;
  title: string;
  purpose: string;
  filePath?: string;
}): {
  partner: Partner;
  pengajuan: PengajuanKerjasama;
  dokumen: DokumenKerjasama;
} {
  const partnerId = randomUUID();
  const pengajuanId = randomUUID();
  const dokumenId = randomUUID();

  const partner: Partner = {
    id: partnerId,
    nama_instansi: payload.partnerName,
    alamat_lengkap: payload.address,
    jenis_mitra: "industri",
    email_pic: payload.companyEmail,
    nama_pic: payload.contactPerson,
    no_hp_pic: payload.phone,
    is_active: false,
  };

  const pengajuan: PengajuanKerjasama = {
    id: pengajuanId,
    partner_id: partnerId,
    pengusul_id: null,
    judul_kerjasama: payload.title,
    latar_belakang: payload.purpose,
    tujuan: payload.purpose,
    tanggal_pengajuan: new Date().toISOString(),
    tipe_pengusul: "external",
    status_pengajuan: "pending",
  };

  const dokumen: DokumenKerjasama = {
    id: dokumenId,
    pengajuan_id: pengajuanId,
    jenis_naskah: "MoU",
    level_penandatangan: "rektor",
    current_stage_id: "dkui_form_check",
    current_stage_actor_role: "dkui",
    current_stage_actor_label: "DKUI",
    unit_id: null,
    inisiator_id: null,
    nomor_naskah: null,
    file_url: payload.filePath || null,
    file_bap_url: null,
    is_locked: false,
    tanggal_kadaluarsa: null,
    proposer_type: "external",
    partner_account_sent_at: null,
  };

  return { partner, pengajuan, dokumen };
}

export function mapDbUserToSessionUser(user: DbUser) {
  return {
    id: user.id,
    email: user.email,
    password: user.password,
    name: user.nama,
    role: mapDbRoleToAppRole(user.role),
    unit: user.unit_id || undefined,
    institution: undefined,
  };
}

export function createDbUser(input: {
  name: string;
  email: string;
  password: string;
  role: AppRole;
  unit?: string;
  partnerId?: string;
}): DbUser {
  return {
    id: `u-${Date.now()}`,
    unit_id: input.unit || null,
    partner_id: input.partnerId || null,
    nama: input.name,
    email: input.email,
    password: input.password,
    role: mapAppRoleToDbRole(input.role),
  };
}

export function toWorkflowHistoryAction(action: WorkflowActionType): ReviewHistory["aksi"] {
  if (action === "advance") return "approve";
  if (action === "request_revision") return "revise";
  return "reject";
}
