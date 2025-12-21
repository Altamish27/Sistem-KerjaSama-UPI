// Mock users data untuk simulasi tanpa database
export type UserRole = "mitra" | "fakultas" | "dkui" | "biro_hukum" | "wakil_rektor" | "rektor"

export interface User {
  id: string
  email: string
  password: string
  name: string
  role: UserRole
  fakultas?: string
  institution?: string // untuk mitra
}

export const MOCK_USERS: User[] = [
  {
    id: "1",
    email: "mitra@partner.com",
    password: "password",
    name: "PT. Global Education Indonesia",
    role: "mitra",
    institution: "PT. Global Education Indonesia",
  },
  {
    id: "2",
    email: "fakultas@upi.edu",
    password: "password",
    name: "Fakultas Pendidikan Teknologi dan Kejuruan",
    role: "fakultas",
    fakultas: "Fakultas Pendidikan Teknologi dan Kejuruan",
  },
  {
    id: "3",
    email: "dkui@upi.edu",
    password: "password",
    name: "Divisi Kerja Sama Universitas Indonesia",
    role: "dkui",
  },
  {
    id: "4",
    email: "biro.hukum@upi.edu",
    password: "password",
    name: "Biro Hukum UPI",
    role: "biro_hukum",
  },
  {
    id: "5",
    email: "warek@upi.edu",
    password: "password",
    name: "Prof. Dr. Wakil Rektor",
    role: "wakil_rektor",
  },
  {
    id: "6",
    email: "rektor@upi.edu",
    password: "password",
    name: "Prof. Dr. Rektor UPI",
    role: "rektor",
  },
]

export const ROLE_LABELS: Record<UserRole, string> = {
  mitra: "MITRA (Eksternal)",
  fakultas: "Fakultas/Unit",
  dkui: "DKUI",
  biro_hukum: "Biro Hukum",
  wakil_rektor: "Wakil Rektor",
  rektor: "Rektor",
}

export type InitiatorType = "mitra" | "fakultas"

export type ProposalStatus =
  | "draft"
  | "submitted"
  | "dkui_summarized" // DKUI sudah meringkas dengan LLM
  | "verification_pending" // menunggu verifikasi Fakultas (jika dari MITRA) atau MITRA (jika dari Fakultas)
  | "verification_approved" // disetujui oleh verifikator
  | "verification_rejected" // ditolak oleh verifikator
  | "legal_draft" // DKUI sedang menyusun dokumen
  | "legal_review" // DKUI paraf Kepala Divisi
  | "biro_hukum_review" // Biro Hukum sedang review
  | "biro_hukum_approved" // Biro Hukum menyetujui
  | "biro_hukum_rejected" // Biro Hukum menolak, kembali ke DKUI
  | "mitra_signing" // MITRA melakukan tanda tangan dan materai
  | "warek_review" // Wakil Rektor melakukan review
  | "warek_approved" // Wakil Rektor menyetujui
  | "warek_rejected" // Wakil Rektor menolak
  | "rektor_review" // Rektor melakukan review
  | "rektor_approved" // Rektor menyetujui dan materai
  | "document_exchange" // DKUI melakukan pertukaran dokumen
  | "completed" // Selesai dan diarsipkan
  | "rejected" // Ditolak final

export interface Proposal {
  id: string
  proposalNumber?: string
  initiator: InitiatorType // siapa yang mengajukan
  title: string
  partnerName: string // nama mitra
  partnerType: "dalam_negeri" | "luar_negeri"
  description: string
  objectives: string
  benefits: string
  scopeOfWork: string
  duration: number // in months
  startDate: string
  endDate: string
  budget?: number
  documents: ProposalDocument[]
  status: ProposalStatus
  createdBy: string
  createdByName: string
  createdByRole: UserRole
  fakultas?: string
  createdAt: string
  updatedAt: string
  approvalHistory: ApprovalHistory[]
  aiSummary?: string
  legalDocument?: ProposalDocument // dokumen legal yang disusun DKUI
  mitraSignedDocument?: ProposalDocument // dokumen yang sudah ditandatangani MITRA
  rektorSignedDocument?: ProposalDocument // dokumen yang sudah ditandatangani Rektor
}

export interface ProposalDocument {
  id: string
  name: string
  type: string
  size: number
  uploadedAt: string
  url: string
}

export interface ApprovalHistory {
  id: string
  proposalId: string
  action:
    | "submit"
    | "summarize"
    | "verify_approve"
    | "verify_reject"
    | "legal_draft"
    | "legal_review"
    | "biro_approve"
    | "biro_reject"
    | "mitra_sign"
    | "warek_approve"
    | "warek_reject"
    | "rektor_approve"
    | "rektor_reject"
    | "exchange"
    | "archive"
  actor: string
  actorName: string
  actorRole: UserRole
  comment?: string
  timestamp: string
}

// Mock proposals storage
export const MOCK_PROPOSALS: Proposal[] = [
  {
    id: "1",
    proposalNumber: "KS/UPI/2024/001",
    initiator: "mitra",
    title: "Kerja Sama Pengembangan Kurikulum Berbasis Industri",
    partnerName: "PT. Global Education Indonesia",
    partnerType: "dalam_negeri",
    description: "Proposal kerja sama untuk pengembangan kurikulum yang sesuai dengan kebutuhan industri modern.",
    objectives: "Meningkatkan relevansi kurikulum dengan kebutuhan industri",
    benefits: "Lulusan lebih siap kerja dan sesuai kebutuhan industri",
    scopeOfWork: "Penyusunan kurikulum, pelatihan dosen, magang mahasiswa",
    duration: 24,
    startDate: "2024-06-01",
    endDate: "2026-06-01",
    budget: 500000000,
    documents: [
      {
        id: "doc1",
        name: "proposal-kerja-sama.pdf",
        type: "application/pdf",
        size: 2048576,
        uploadedAt: "2024-05-15T10:30:00",
        url: "#",
      },
    ],
    status: "dkui_summarized",
    createdBy: "1",
    createdByName: "PT. Global Education Indonesia",
    createdByRole: "mitra",
    fakultas: "Fakultas Pendidikan Teknologi dan Kejuruan",
    createdAt: "2024-05-15T10:30:00",
    updatedAt: "2024-05-16T14:20:00",
    approvalHistory: [
      {
        id: "h1",
        proposalId: "1",
        action: "submit",
        actor: "1",
        actorName: "PT. Global Education Indonesia",
        actorRole: "mitra",
        comment: "Mengajukan proposal kerja sama",
        timestamp: "2024-05-15T10:30:00",
      },
      {
        id: "h2",
        proposalId: "1",
        action: "summarize",
        actor: "3",
        actorName: "Divisi Kerja Sama Universitas Indonesia",
        actorRole: "dkui",
        comment: "Proposal telah diringkas menggunakan AI",
        timestamp: "2024-05-16T14:20:00",
      },
    ],
    aiSummary:
      "Proposal ini mengusulkan kerja sama antara UPI dan PT. Global Education Indonesia untuk pengembangan kurikulum berbasis industri. Fokus utama adalah penyusunan kurikulum yang relevan, pelatihan dosen, dan program magang mahasiswa. Durasi kerja sama 24 bulan dengan anggaran Rp 500 juta. Manfaat utama adalah peningkatan kesiapan lulusan dalam menghadapi dunia kerja.",
  },
  {
    id: "2",
    proposalNumber: "KS/UPI/2024/002",
    initiator: "fakultas",
    title: "Kerja Sama Penelitian Bersama di Bidang Teknologi Pendidikan",
    partnerName: "Universitas Teknologi Malaysia",
    partnerType: "luar_negeri",
    description: "Proposal kerja sama penelitian bersama untuk pengembangan teknologi pendidikan inovatif.",
    objectives: "Menghasilkan publikasi internasional dan produk teknologi pendidikan",
    benefits: "Peningkatan kapasitas penelitian dan reputasi internasional",
    scopeOfWork: "Penelitian kolaboratif, publikasi jurnal, pertukaran peneliti",
    duration: 36,
    startDate: "2024-07-01",
    endDate: "2027-07-01",
    budget: 750000000,
    documents: [
      {
        id: "doc2",
        name: "research-proposal.pdf",
        type: "application/pdf",
        size: 3145728,
        uploadedAt: "2024-05-20T09:15:00",
        url: "#",
      },
    ],
    status: "submitted",
    createdBy: "2",
    createdByName: "Fakultas Pendidikan Teknologi dan Kejuruan",
    createdByRole: "fakultas",
    fakultas: "Fakultas Pendidikan Teknologi dan Kejuruan",
    createdAt: "2024-05-20T09:15:00",
    updatedAt: "2024-05-20T09:15:00",
    approvalHistory: [
      {
        id: "h3",
        proposalId: "2",
        action: "submit",
        actor: "2",
        actorName: "Fakultas Pendidikan Teknologi dan Kejuruan",
        actorRole: "fakultas",
        comment: "Mengajukan proposal kerja sama penelitian",
        timestamp: "2024-05-20T09:15:00",
      },
    ],
  },
]

export const STATUS_LABELS: Record<ProposalStatus, string> = {
  draft: "Draft",
  submitted: "Diajukan",
  dkui_summarized: "Diringkas DKUI",
  verification_pending: "Menunggu Verifikasi",
  verification_approved: "Verifikasi Disetujui",
  verification_rejected: "Verifikasi Ditolak",
  legal_draft: "Penyusunan Dokumen Legal",
  legal_review: "Review Legal DKUI",
  biro_hukum_review: "Review Biro Hukum",
  biro_hukum_approved: "Disetujui Biro Hukum",
  biro_hukum_rejected: "Ditolak Biro Hukum",
  mitra_signing: "Penandatanganan MITRA",
  warek_review: "Review Wakil Rektor",
  warek_approved: "Disetujui Wakil Rektor",
  warek_rejected: "Ditolak Wakil Rektor",
  rektor_review: "Review Rektor",
  rektor_approved: "Disetujui Rektor",
  document_exchange: "Pertukaran Dokumen",
  completed: "Selesai",
  rejected: "Ditolak",
}

export const PROPOSAL_TYPE_LABELS = {
  internal: "Kerja Sama Internal",
  external: "Kerja Sama Eksternal",
}
