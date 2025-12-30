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
  | "draft" // Draft proposal, belum diajukan
  | "submitted" // Mitra mengajukan proposal
  
  // DKUI Flow
  | "dkui_received" // DKUI menerima proposal dari mitra
  | "dkui_need_summary" // DKUI perlu menjalankan fitur ringkasan AI secara manual
  | "dkui_summarized" // DKUI sudah meringkas dengan AI (manual trigger)
  | "dkui_selecting_faculty" // DKUI sedang memilih fakultas/unit untuk distribusi
  | "dkui_sent_to_faculty" // DKUI sudah mengirim ke Fakultas/Unit
  
  // Fakultas/Unit Flow - Verifikasi Substansi
  | "faculty_reviewing" // Fakultas/Unit sedang review substansi
  | "faculty_substansi_approved" // Gateway: Substansi OK = Ya
  | "faculty_substansi_rejected" // Gateway: Substansi OK = Tidak
  
  // DKUI Evaluasi Feedback (setelah penolakan dari mana pun)
  | "dkui_evaluating_feedback" // DKUI mengevaluasi feedback penolakan/revisi
  | "dkui_deciding_revision" // Gateway: Revisi oleh Mitra atau DKUI?
  | "dkui_requesting_mitra_revision" // DKUI meminta mitra melakukan revisi
  | "mitra_revising" // Mitra sedang melakukan revisi
  | "mitra_resubmitted" // Mitra sudah upload ulang dokumen revisi
  | "dkui_self_revising" // DKUI melakukan revisi sendiri sebagai legal drafter
  | "dkui_revision_completed" // DKUI selesai revisi, akan kirim ulang ke Fakultas
  
  // DKUI Review Hukum Tahap 1
  | "dkui_legal_review_1" // DKUI review hukum tahap pertama sebagai legal drafter
  | "dkui_legal_approved_1" // DKUI tahap 1 OK, kirim ke Biro Hukum
  
  // Biro Hukum Flow - Review Tahap 2
  | "biro_hukum_reviewing" // Biro Hukum sedang review legalitas
  | "biro_hukum_legalitas_approved" // Gateway: Legalitas OK = Ya
  | "biro_hukum_legalitas_rejected" // Gateway: Legalitas OK = Tidak, kembali ke DKUI evaluasi
  
  // Alur Paraf Internal
  | "biro_hukum_paraf" // Biro Hukum melakukan paraf
  | "dkui_paraf" // DKUI melakukan paraf
  | "faculty_final_approval" // Fakultas/Unit memberikan persetujuan akhir
  
  // Parallel Gateway: Tanda Tangan Elektronik
  | "parallel_signing_started" // Mulai parallel process tanda tangan
  | "mitra_ready_to_sign" // Jalur Mitra: Mitra siap tanda tangan
  | "mitra_stamped" // Mitra bubuh materai
  | "mitra_signed" // Mitra tanda tangan elektronik selesai
  | "warek_reviewing" // Jalur Internal: Wakil Rektor review
  | "warek_stamped" // Wakil Rektor bubuh materai
  | "warek_signed" // Wakil Rektor tanda tangan
  | "warek_rejected" // Wakil Rektor menolak, kembali ke DKUI evaluasi
  | "rektor_reviewing" // Rektor review
  | "rektor_stamped" // Rektor bubuh materai
  | "rektor_signed" // Rektor tanda tangan selesai
  | "rektor_rejected" // Rektor menolak, kembali ke DKUI evaluasi
  
  // Finalisasi
  | "document_exchange" // DKUI melakukan pertukaran dokumen final antara Rektor dan Mitra
  | "archived" // DKUI mengarsipkan dokumen
  | "completed" // Proses selesai
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
  aiSummaryGeneratedAt?: string
  selectedFacultyBy?: string // ID user DKUI yang pilih fakultas
  revisionType?: "mitra" | "dkui" // siapa yang melakukan revisi
  revisionReason?: string // alasan revisi
  revisionDocument?: ProposalDocument // dokumen hasil revisi
  legalDocument?: ProposalDocument // dokumen legal yang disusun DKUI
  mitraSignedDocument?: ProposalDocument // dokumen yang sudah ditandatangani MITRA
  rektorSignedDocument?: ProposalDocument // dokumen yang sudah ditandatangani Rektor
  finalExchangedDocument?: ProposalDocument // dokumen hasil pertukaran final
  archivedDocument?: ProposalDocument // dokumen yang sudah diarsipkan
  // Tracking paraf dan tanda tangan
  biroHukumParafBy?: string
  biroHukumParafAt?: string
  dkuiParafBy?: string
  dkuiParafAt?: string
  facultyApprovalBy?: string
  facultyApprovalAt?: string
  mitraStampAt?: string
  mitraSignedBy?: string
  mitraSignedAt?: string
  warekStampAt?: string
  warekSignedBy?: string
  warekSignedAt?: string
  rektorStampAt?: string
  rektorSignedBy?: string
  rektorSignedAt?: string
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
    | "submit" // Mitra mengajukan
    | "dkui_receive" // DKUI terima
    | "dkui_trigger_ai_summary" // DKUI jalankan fitur AI summary manual
    | "dkui_select_faculty" // DKUI pilih fakultas/unit
    | "dkui_send_to_faculty" // DKUI kirim ke fakultas
    | "faculty_review_substansi" // Fakultas review substansi
    | "faculty_approve_substansi" // Fakultas setuju substansi
    | "faculty_reject_substansi" // Fakultas tolak substansi
    | "dkui_evaluate_feedback" // DKUI evaluasi feedback
    | "dkui_decide_revision_mitra" // DKUI putuskan revisi oleh mitra
    | "dkui_decide_revision_self" // DKUI putuskan revisi sendiri
    | "dkui_request_mitra_revision" // DKUI minta mitra revisi
    | "mitra_upload_revision" // Mitra upload revisi
    | "dkui_self_revise" // DKUI revisi sendiri
    | "dkui_complete_revision" // DKUI selesai revisi
    | "dkui_legal_review_1" // DKUI review hukum tahap 1
    | "dkui_approve_legal_1" // DKUI approve tahap 1
    | "biro_hukum_review" // Biro Hukum review
    | "biro_hukum_approve" // Biro Hukum approve legalitas
    | "biro_hukum_reject" // Biro Hukum reject legalitas
    | "biro_hukum_paraf" // Biro Hukum paraf
    | "dkui_paraf" // DKUI paraf
    | "faculty_final_approve" // Fakultas approval akhir
    | "start_parallel_signing" // Mulai parallel signing
    | "mitra_prepare_sign" // Mitra siap tanda tangan
    | "mitra_stamp" // Mitra bubuh materai
    | "mitra_sign" // Mitra tanda tangan
    | "warek_review" // Warek review
    | "warek_stamp" // Warek materai
    | "warek_sign" // Warek tanda tangan
    | "warek_reject" // Warek tolak
    | "rektor_review" // Rektor review
    | "rektor_stamp" // Rektor materai
    | "rektor_sign" // Rektor tanda tangan
    | "rektor_reject" // Rektor tolak
    | "document_exchange" // DKUI tukar dokumen
    | "archive" // DKUI arsipkan
    | "complete" // Selesai
  actor: string
  actorName: string
  actorRole: UserRole
  comment?: string
  timestamp: string
  documentUrl?: string // URL dokumen jika ada upload
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
    status: "dkui_need_summary",
    createdBy: "1",
    createdByName: "PT. Global Education Indonesia",
    createdByRole: "mitra",
    fakultas: "Fakultas Pendidikan Teknologi dan Kejuruan",
    createdAt: "2024-05-15T10:30:00",
    updatedAt: "2024-05-16T09:00:00",
    approvalHistory: [
      {
        id: "h1",
        proposalId: "1",
        action: "submit",
        actor: "1",
        actorName: "PT. Global Education Indonesia",
        actorRole: "mitra",
        comment: "Mengajukan proposal kerja sama pengembangan kurikulum",
        timestamp: "2024-05-15T10:30:00",
      },
      {
        id: "h2",
        proposalId: "1",
        action: "dkui_receive",
        actor: "3",
        actorName: "Divisi Kerja Sama Universitas Indonesia",
        actorRole: "dkui",
        comment: "Proposal diterima oleh DKUI dan terdaftar dalam sistem",
        timestamp: "2024-05-16T09:00:00",
      },
    ],
  },
  {
    id: "2",
    proposalNumber: "KS/UPI/2024/002",
    initiator: "mitra",
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
    status: "faculty_reviewing",
    createdBy: "1",
    createdByName: "Universitas Teknologi Malaysia",
    createdByRole: "mitra",
    fakultas: "Fakultas Pendidikan Teknologi dan Kejuruan",
    createdAt: "2024-05-20T09:15:00",
    updatedAt: "2024-05-22T14:30:00",
    approvalHistory: [
      {
        id: "h3",
        proposalId: "2",
        action: "submit",
        actor: "1",
        actorName: "Universitas Teknologi Malaysia",
        actorRole: "mitra",
        comment: "Mengajukan proposal kerja sama penelitian teknologi pendidikan",
        timestamp: "2024-05-20T09:15:00",
      },
      {
        id: "h4",
        proposalId: "2",
        action: "dkui_receive",
        actor: "3",
        actorName: "Divisi Kerja Sama Universitas Indonesia",
        actorRole: "dkui",
        comment: "Proposal diterima DKUI",
        timestamp: "2024-05-21T10:00:00",
      },
      {
        id: "h5",
        proposalId: "2",
        action: "dkui_trigger_ai_summary",
        actor: "3",
        actorName: "Divisi Kerja Sama Universitas Indonesia",
        actorRole: "dkui",
        comment: "DKUI menjalankan fitur ringkasan AI secara manual",
        timestamp: "2024-05-21T10:15:00",
      },
      {
        id: "h6",
        proposalId: "2",
        action: "dkui_select_faculty",
        actor: "3",
        actorName: "Divisi Kerja Sama Universitas Indonesia",
        actorRole: "dkui",
        comment: "DKUI memilih Fakultas Pendidikan Teknologi dan Kejuruan",
        timestamp: "2024-05-21T11:00:00",
      },
      {
        id: "h7",
        proposalId: "2",
        action: "dkui_send_to_faculty",
        actor: "3",
        actorName: "Divisi Kerja Sama Universitas Indonesia",
        actorRole: "dkui",
        comment: "DKUI mengirim proposal ke Fakultas untuk verifikasi substansi",
        timestamp: "2024-05-22T14:30:00",
      },
    ],
    aiSummary:
      "Proposal kerja sama penelitian antara UPI dan Universitas Teknologi Malaysia fokus pada pengembangan teknologi pendidikan inovatif. Program meliputi penelitian kolaboratif, publikasi jurnal internasional, dan pertukaran peneliti. Durasi 36 bulan dengan anggaran Rp 750 juta. Tujuan utama adalah peningkatan kapasitas penelitian dan reputasi internasional UPI.",
    aiSummaryGeneratedAt: "2024-05-21T10:15:00",
    selectedFacultyBy: "3",
  },
]

export const STATUS_LABELS: Record<ProposalStatus, string> = {
  draft: "Draft",
  submitted: "Diajukan Mitra",
  dkui_received: "Diterima DKUI",
  dkui_need_summary: "DKUI: Perlu Ringkasan AI",
  dkui_summarized: "DKUI: Sudah Diringkas AI",
  dkui_selecting_faculty: "DKUI: Memilih Fakultas/Unit",
  dkui_sent_to_faculty: "DKUI: Dikirim ke Fakultas/Unit",
  faculty_reviewing: "Fakultas: Verifikasi Substansi",
  faculty_substansi_approved: "Fakultas: Substansi Disetujui",
  faculty_substansi_rejected: "Fakultas: Substansi Ditolak",
  dkui_evaluating_feedback: "DKUI: Evaluasi Feedback",
  dkui_deciding_revision: "DKUI: Menentukan Revisi",
  dkui_requesting_mitra_revision: "DKUI: Minta Revisi Mitra",
  mitra_revising: "Mitra: Sedang Revisi",
  mitra_resubmitted: "Mitra: Upload Ulang",
  dkui_self_revising: "DKUI: Revisi Sendiri",
  dkui_revision_completed: "DKUI: Revisi Selesai",
  dkui_legal_review_1: "DKUI: Review Hukum Tahap 1",
  dkui_legal_approved_1: "DKUI: Legal Tahap 1 OK",
  biro_hukum_reviewing: "Biro Hukum: Review Legalitas",
  biro_hukum_legalitas_approved: "Biro Hukum: Legalitas Disetujui",
  biro_hukum_legalitas_rejected: "Biro Hukum: Legalitas Ditolak",
  biro_hukum_paraf: "Biro Hukum: Paraf",
  dkui_paraf: "DKUI: Paraf",
  faculty_final_approval: "Fakultas: Approval Akhir",
  parallel_signing_started: "Proses Tanda Tangan Dimulai",
  mitra_ready_to_sign: "Mitra: Siap Tanda Tangan",
  mitra_stamped: "Mitra: Materai",
  mitra_signed: "Mitra: Tanda Tangan Selesai",
  warek_reviewing: "Wakil Rektor: Review",
  warek_stamped: "Wakil Rektor: Materai",
  warek_signed: "Wakil Rektor: Tanda Tangan",
  warek_rejected: "Wakil Rektor: Ditolak",
  rektor_reviewing: "Rektor: Review",
  rektor_stamped: "Rektor: Materai",
  rektor_signed: "Rektor: Tanda Tangan Selesai",
  rektor_rejected: "Rektor: Ditolak",
  document_exchange: "Pertukaran Dokumen",
  archived: "Diarsipkan",
  completed: "Selesai",
  rejected: "Ditolak Final",
}

export const PROPOSAL_TYPE_LABELS = {
  internal: "Kerja Sama Internal",
  external: "Kerja Sama Eksternal",
}
