# Dokumentasi Sistem Kerja Sama UPI (e-Contract)

> Sistem Informasi Pengajuan dan Pengelolaan Kerja Sama — Universitas Pendidikan Indonesia

---

## Daftar Isi

1. [Gambaran Umum](#1-gambaran-umum)
2. [Tech Stack](#2-tech-stack)
3. [Bisnis Proses](#3-bisnis-proses)
4. [ERD (Entity Relationship Diagram)](#4-erd-entity-relationship-diagram)
5. [Struktur Database](#5-struktur-database)
6. [Arsitektur Sistem](#6-arsitektur-sistem)
7. [API Routes](#7-api-routes)
8. [Role & Hak Akses](#8-role--hak-akses)
9. [Alur Email Notifikasi](#9-alur-email-notifikasi)
10. [Storage & File Management](#10-storage--file-management)

---

## 1. Gambaran Umum

**Sistem Kerja Sama UPI** adalah platform digital untuk mengelola seluruh proses kerja sama antara Universitas Pendidikan Indonesia (UPI) dengan mitra eksternal maupun internal (antar-fakultas). Sistem ini mengautomasi seluruh tahapan dari pengajuan proposal hingga penandatanganan dokumen MoU/MoA/PKS secara digital.

### Fitur Utama

- **Pengajuan Publik** — Mitra eksternal dapat mengajukan proposal tanpa perlu memiliki akun terlebih dahulu
- **Dashboard Multi-Role** — Setiap role mendapatkan tampilan dan aksi yang sesuai
- **Workflow BPMN** — Proses mengikuti standar Business Process Model & Notation
- **AI Summary** — Ringkasan proposal otomatis dengan LLM (fitur manual trigger)
- **Tracking Real-time** — Pemantauan progress proposal secara real-time
- **Email Notifikasi** — Notifikasi otomatis di setiap tahap workflow
- **Upload Dokumen** — Unggah dan kelola berbagai versi dokumen proposal
- **Tanda Tangan Elektronik** — Materai dan tanda tangan digital secara paralel

---

## 2. Tech Stack

### Frontend

| Teknologi | Versi | Keterangan |
|-----------|-------|------------|
| **Next.js** | 16.0.10 | Framework React dengan App Router |
| **React** | 19.2.0 | UI Library |
| **TypeScript** | ^5 | Type-safe JavaScript |
| **Tailwind CSS** | ^4.1.9 | Utility-first CSS framework |
| **shadcn/ui** | New York style | Komponen UI berbasis Radix UI |
| **Radix UI** | Various | Accessible UI primitives |
| **Lucide React** | ^0.454.0 | Icon library |
| **Recharts** | 2.15.4 | Chart & data visualization |
| **Embla Carousel** | 8.5.1 | Carousel component |

### Form & Validation

| Teknologi | Versi | Keterangan |
|-----------|-------|------------|
| **React Hook Form** | ^7.60.0 | Form state management |
| **Zod** | 3.25.76 | Schema validation |
| **@hookform/resolvers** | ^3.10.0 | Integrasi Zod dengan RHF |

### Backend / BaaS

| Teknologi | Versi / Detail | Keterangan |
|-----------|----------------|------------|
| **Next.js API Routes** | App Router (Route Handlers) | Server-side logic & endpoints |
| **Supabase** | Cloud Hosted | Database, Auth, Storage |
| **PostgreSQL** | via Supabase | Relational database |
| **Supabase Auth** | @supabase/supabase-js ^2.49.4 | Authentication & session management |
| **Supabase Storage** | Bucket: `proposal-documents` | File storage |

### Email Service

| Teknologi | Versi | Keterangan |
|-----------|-------|------------|
| **Resend** | ^4.8.0 | Transactional email delivery |

### Utilities & Lainnya

| Teknologi | Versi | Keterangan |
|-----------|-------|------------|
| **date-fns** | 4.1.0 | Date manipulation |
| **next-themes** | ^0.4.6 | Dark/light mode |
| **sonner** | ^1.7.4 | Toast notifications |
| **@vercel/analytics** | 1.3.1 | Web analytics |
| **tsx** | ^4.19.2 | TypeScript script runner |
| **vaul** | ^1.1.2 | Drawer component |
| **cmdk** | 1.0.4 | Command menu |

### Development Tools

| Tool | Keterangan |
|------|------------|
| **pnpm** | Package manager |
| **TypeScript Strict Mode** | Type checking |
| **ESLint** | Code linting |
| **PostCSS** | CSS processing |

### Environment Variables

```env
# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Supabase
NEXT_PUBLIC_SUPABASE_URL=           # Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=      # Client-side key (public)
SUPABASE_SERVICE_ROLE_KEY=          # Server-side key (secret)

# Email
RESEND_API_KEY=                     # Resend API key
EMAIL_FROM=onboarding@resend.dev    # Sender email
EMAIL_FROM_NAME=DKUI UPI            # Sender name
```

---

## 3. Bisnis Proses

### 3.1 Jalur Pengajuan

Sistem mendukung **dua jalur pengajuan** proposal kerja sama:

```
Jalur A: MITRA EKSTERNAL  →  Mengajukan ke UPI
Jalur B: FAKULTAS/UNIT    →  Mengajukan atas nama UPI ke Mitra
```

---

### 3.2 Bisnis Proses Lengkap (BPMN)

```
╔═══════════════════════════════════════════════════════════════════════╗
║                    SISTEM KERJA SAMA UPI - BPMN FLOW                 ║
╚═══════════════════════════════════════════════════════════════════════╝

┌─────────────────────────────────────────────────────────────────────┐
│ POOL: MITRA EKSTERNAL                                                │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  [START] ──► [Submit Proposal] ─────────────────────────────────►  │
│              (Publik, tanpa                                          │
│               akun / dengan akun)                                    │
│                                                                      │
│  ◄── [Upload Revisi Dokumen] ◄── (Jika diminta revisi)             │
│                                                                      │
│  ◄── [Bubuh Materai & Tanda Tangan Elektronik] ◄── (Tahap akhir)  │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│ POOL: DKUI (Divisi Kerja Sama Universitas Indonesia)                 │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  [Terima Proposal] ──► [AI Summary (Manual)] ──► [Pilih Fakultas] │
│                                                                      │
│  [Kirim ke Fakultas] ──► ... ──► [Evaluasi Feedback]               │
│         │                              │                            │
│         │              ┌───────────────┴──────────────┐            │
│         │         [Revisi Mitra]                [Revisi DKUI]       │
│         │              │                              │             │
│         │         [Kirim Ulang                [Revisi Selesai]      │
│         │          ke Fakultas] ◄─────────────────────┘            │
│         │                                                           │
│  [Legal Review Tahap 1] ──► [Kirim ke Biro Hukum]                 │
│                                                                     │
│  [Paraf DKUI] ──► ... ──► [Notifikasi Mitra & Buat Akun]         │
│                                                                     │
│  [Pertukaran Dokumen Final] ──► [Arsip] ──► [SELESAI]             │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│ POOL: FAKULTAS / UNIT                                                │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  [Verifikasi Substansi] ──► <Gateway: Substansi OK?>               │
│                                    │           │                    │
│                              [YA: Approved]  [TIDAK: Rejected]     │
│                                    │           │                    │
│                                    ▼           ▼                    │
│                          [Lanjut] [Kirim Feedback ke DKUI]         │
│                                                                      │
│  [Approval Akhir Fakultas] (setelah semua paraf)                   │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│ POOL: BIRO HUKUM                                                     │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  [Review Legalitas] ──► <Gateway: Legalitas OK?>                   │
│                                │           │                        │
│                      [YA: Paraf Biro Hukum]  [TIDAK: Kembali DKUI] │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│ POOL: PIMPINAN (Wakil Rektor & Rektor) — PARALLEL GATEWAY          │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌── Jalur Mitra ────────────────────────────────────────────────┐  │
│  │  [Siap Tanda Tangan] ──► [Bubuh Materai] ──► [TTD Mitra]     │  │
│  └───────────────────────────────────────────────────────────────┘  │
│  ┌── Jalur Internal ─────────────────────────────────────────────┐  │
│  │  [Warek Review] ──► [Materai Warek] ──► [TTD Warek]          │  │
│  │       ──► [Rektor Review] ──► [Materai Rektor] ──► [TTD]     │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  [JOIN GATEWAY] ──► DKUI: Pertukaran Dokumen                       │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

### 3.3 Status Workflow (40 Status)

| # | Status | Aktor | Deskripsi |
|---|--------|-------|-----------|
| 1 | `draft` | Mitra | Proposal dalam tahap draft |
| 2 | `submitted` | Mitra | Proposal diajukan |
| 3 | `dkui_received` | DKUI | DKUI menerima proposal |
| 4 | `dkui_need_summary` | DKUI | Perlu ringkasan AI |
| 5 | `dkui_summarized` | DKUI | AI Summary selesai |
| 6 | `dkui_selecting_faculty` | DKUI | Memilih fakultas |
| 7 | `dkui_sent_to_faculty` | DKUI | Dikirim ke Fakultas |
| 8 | `faculty_reviewing` | Fakultas | Fakultas sedang review substansi |
| 9 | `faculty_substansi_approved` | Fakultas → DKUI | Substansi disetujui |
| 10 | `faculty_substansi_rejected` | Fakultas → DKUI | Substansi ditolak |
| 11 | `dkui_notifying_mitra` | DKUI | Notifikasi & buat akun Mitra |
| 12 | `dkui_evaluating_feedback` | DKUI | Evaluasi feedback penolakan |
| 13 | `dkui_deciding_revision` | DKUI | Memutuskan siapa yang revisi |
| 14 | `dkui_requesting_mitra_revision` | DKUI → Mitra | Minta Mitra untuk revisi |
| 15 | `mitra_revising` | Mitra | Mitra sedang revisi |
| 16 | `mitra_resubmitted` | Mitra | Mitra upload ulang revisi |
| 17 | `dkui_self_revising` | DKUI | DKUI revisi sebagai legal drafter |
| 18 | `dkui_revision_completed` | DKUI | Revisi DKUI selesai |
| 19 | `dkui_legal_review_1` | DKUI | Review hukum tahap 1 |
| 20 | `dkui_legal_approved_1` | DKUI | Legal tahap 1 disetujui |
| 21 | `biro_hukum_reviewing` | Biro Hukum | Review legalitas |
| 22 | `biro_hukum_legalitas_approved` | Biro Hukum | Legalitas disetujui |
| 23 | `biro_hukum_legalitas_rejected` | Biro Hukum | Legalitas ditolak |
| 24 | `biro_hukum_paraf` | Biro Hukum | Biro Hukum membubuhkan paraf |
| 25 | `dkui_paraf` | DKUI | DKUI membubuhkan paraf |
| 26 | `faculty_final_approval` | Fakultas | Persetujuan akhir Fakultas |
| 27 | `parallel_signing_started` | DKUI | Memulai proses tanda tangan paralel |
| 28 | `mitra_ready_to_sign` | Mitra | Mitra siap tanda tangan |
| 29 | `mitra_stamped` | Mitra | Mitra membubuhkan materai |
| 30 | `mitra_signed` | Mitra | Mitra selesai tanda tangan |
| 31 | `warek_reviewing` | Wakil Rektor | Wakil Rektor review |
| 32 | `warek_stamped` | Wakil Rektor | Wakil Rektor membubuhkan materai |
| 33 | `warek_signed` | Wakil Rektor | Wakil Rektor selesai tanda tangan |
| 34 | `warek_rejected` | Wakil Rektor | Wakil Rektor menolak |
| 35 | `rektor_reviewing` | Rektor | Rektor review |
| 36 | `rektor_stamped` | Rektor | Rektor membubuhkan materai |
| 37 | `rektor_signed` | Rektor | Rektor selesai tanda tangan |
| 38 | `rektor_rejected` | Rektor | Rektor menolak |
| 39 | `document_exchange` | DKUI | Pertukaran dokumen final |
| 40 | `archived` | DKUI | Dokumen diarsipkan |
| 41 | `completed` | — | Proses selesai |
| 42 | `rejected` | — | Ditolak final |

---

### 3.4 Jalur Revisi (Revision Loop)

```
[Penolakan dari Fakultas / Biro Hukum / Warek / Rektor]
              │
              ▼
  [DKUI: Evaluasi Feedback]
              │
    ┌─────────┴─────────┐
    │                   │
[Revisi Mitra]    [Revisi DKUI]    [Tolak Final]
    │                   │
[Mitra Upload]   [DKUI Revisi]
    │                   │
    └─────────┬─────────┘
              │
  [Kirim Ulang ke Fakultas]
```

---

## 4. ERD (Entity Relationship Diagram)

```
┌─────────────────────────────────────┐
│               USERS                  │
├─────────────────────────────────────┤
│ PK  id              UUID            │
│     email           VARCHAR(255)    │
│     password_hash   TEXT            │
│     name            VARCHAR(255)    │
│     role            user_role ENUM  │
│     fakultas        VARCHAR(255)    │
│     institution     VARCHAR(255)    │
│     phone           VARCHAR(50)     │
│     address         TEXT            │
│     is_active       BOOLEAN         │
│     email_verified  BOOLEAN         │
│     account_status  TEXT            │
│     invitation_token TEXT           │
│     created_at      TIMESTAMPTZ     │
│     updated_at      TIMESTAMPTZ     │
│     last_login_at   TIMESTAMPTZ     │
│ FK  created_by      → users(id)     │
│     avatar_url      TEXT            │
└───────────────┬─────────────────────┘
                │ 1
                │ created_by
                │ N
┌───────────────▼─────────────────────┐
│             PROPOSALS                │
├─────────────────────────────────────┤
│ PK  id               UUID           │
│     proposal_number  VARCHAR(50)    │ ◄── Auto: KS/UPI/YYYY/XXX
│     initiator        initiator_type │
│     title            VARCHAR(500)   │
│     partner_name     VARCHAR(255)   │
│     partner_type     partner_type   │
│     description      TEXT           │
│     objectives       TEXT           │
│     benefits         TEXT           │
│     scope_of_work    TEXT           │
│     duration         INTEGER        │
│     start_date       DATE           │
│     end_date         DATE           │
│     budget           BIGINT         │
│     status           proposal_status│
│ FK  created_by       → users(id)    │ (nullable: public submission)
│     fakultas         VARCHAR(255)   │
│ FK  selected_faculty_by → users(id) │
│     ai_summary       TEXT           │
│     revision_type    revision_type  │
│     revision_reason  TEXT           │
│     is_public_submission BOOLEAN    │
│     contact_email    TEXT           │
│     contact_phone    TEXT           │
│     contact_person   TEXT           │
│     -- Tracking Paraf & TTD --      │
│ FK  biro_hukum_paraf_by → users(id) │
│     biro_hukum_paraf_at  TIMESTAMPTZ│
│ FK  dkui_paraf_by    → users(id)    │
│     dkui_paraf_at    TIMESTAMPTZ    │
│ FK  faculty_approval_by → users(id) │
│     faculty_approval_at  TIMESTAMPTZ│
│ FK  mitra_signed_by  → users(id)    │
│     mitra_stamp_at   TIMESTAMPTZ    │
│     mitra_signed_at  TIMESTAMPTZ    │
│ FK  warek_signed_by  → users(id)    │
│     warek_stamp_at   TIMESTAMPTZ    │
│     warek_signed_at  TIMESTAMPTZ    │
│ FK  rektor_signed_by → users(id)    │
│     rektor_stamp_at  TIMESTAMPTZ    │
│     rektor_signed_at TIMESTAMPTZ    │
│     created_at       TIMESTAMPTZ    │
│     updated_at       TIMESTAMPTZ    │
│     submitted_at     TIMESTAMPTZ    │
│     completed_at     TIMESTAMPTZ    │
│     rejected_at      TIMESTAMPTZ    │
└────┬──────────────┬─────────────────┘
     │ 1            │ 1
     │              │
     │ N            │ N
┌────▼────────┐  ┌──▼──────────────────┐
│  DOCUMENTS  │  │   APPROVAL_HISTORY  │
├─────────────┤  ├─────────────────────┤
│ PK id  UUID │  │ PK id   UUID        │
│ FK proposal_│  │ FK proposal_id      │
│    id       │  │    action (ENUM)    │
│    name     │  │ FK actor_id → users │
│    type     │  │    actor_name       │
│    size     │  │    actor_role       │
│    storage_ │  │    comment  TEXT    │
│    path     │  │ FK document_id      │
│    url      │  │    timestamp        │
│    category │  │    metadata JSONB   │
│ FK uploaded_│  └─────────────────────┘
│    by →users│
│    uploaded_│
│    at       │
│    version  │
│    is_      │
│    current  │
└─────────────┘

┌─────────────────────────────────────┐
│         EMAIL_NOTIFICATIONS          │
├─────────────────────────────────────┤
│ PK  id                UUID          │
│     recipient_email   VARCHAR       │
│     recipient_name    VARCHAR       │
│ FK  recipient_user_id → users(id)   │
│     subject           VARCHAR(500)  │
│     body              TEXT          │
│     template_name     VARCHAR(100)  │
│ FK  proposal_id    → proposals(id)  │
│     status  (pending/sent/failed)   │
│     sent_at           TIMESTAMPTZ   │
│     failed_at         TIMESTAMPTZ   │
│     error_message     TEXT          │
│     created_at        TIMESTAMPTZ   │
│     metadata          JSONB         │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│           USER_INVITATIONS           │
├─────────────────────────────────────┤
│ PK  id         UUID                 │
│     email      VARCHAR              │
│     name       VARCHAR              │
│     role       user_role            │
│     institution VARCHAR             │
│     token      VARCHAR UNIQUE       │
│ FK  proposal_id → proposals(id)     │
│     status     (pending/accepted/   │
│                 expired)            │
│ FK  invited_by → users(id)          │
│     created_at  TIMESTAMPTZ         │
│     expires_at  TIMESTAMPTZ         │ ◄── Default +7 days
│     accepted_at TIMESTAMPTZ         │
│     temp_password TEXT              │
└─────────────────────────────────────┘
```

### 4.1 Relasi Utama

| Relasi | Kardinalitas | Keterangan |
|--------|-------------|------------|
| `users` → `proposals` (created_by) | 1 : N | Satu user bisa buat banyak proposal |
| `proposals` → `documents` | 1 : N | Satu proposal punya banyak dokumen |
| `proposals` → `approval_history` | 1 : N | Satu proposal punya banyak history |
| `proposals` → `email_notifications` | 1 : N | Satu proposal trigger banyak email |
| `proposals` → `user_invitations` | 1 : 1 | Proposal publik punya 1 undangan |
| `users` → `approval_history` (actor) | 1 : N | Satu user melakukan banyak aksi |
| `users` → `documents` (uploaded_by) | 1 : N | Satu user upload banyak dokumen |
| `approval_history` → `documents` | N : 1 | History bisa referensi dokumen |

---

## 5. Struktur Database

### 5.1 Tipe Data yang Digunakan (ENUMs)

```sql
-- 6 Role User
user_role: mitra | fakultas | dkui | biro_hukum | wakil_rektor | rektor

-- 42 Status Proposal (BPMN workflow states)
proposal_status: draft | submitted | dkui_received | ... | completed | rejected

-- Siapa yang Mengajukan
initiator_type: mitra | fakultas

-- Tipe Partner
partner_type: dalam_negeri | luar_negeri

-- 35 Tipe Aksi dalam History
approval_action: submit | dkui_receive | ... | complete

-- Siapa yang Revisi
revision_type: mitra | dkui
```

### 5.2 Database Functions & Triggers

| Function | Trigger | Keterangan |
|----------|---------|------------|
| `update_updated_at_column()` | `users`, `proposals` BEFORE UPDATE | Auto-set `updated_at = NOW()` |
| `generate_proposal_number()` | `proposals` BEFORE INSERT/UPDATE | Auto-generate `KS/UPI/YYYY/XXX` saat status = submitted |
| `update_proposal_timestamps()` | `proposals` BEFORE UPDATE | Auto-set `submitted_at`, `completed_at`, `rejected_at` |
| `generate_invitation_token()` | Manual call | Generate 32-byte hex token |
| `create_user_from_proposal()` | Manual call | Buat user dari proposal yang disetujui |

### 5.3 Database Views

```sql
-- 1. proposal_statistics: Statistik proposal per status
SELECT status, COUNT(*), count_last_30_days, count_last_7_days
FROM proposals GROUP BY status;

-- 2. proposals_with_details: Proposal dengan join lengkap
SELECT p.*, u.name AS created_by_name,
       COUNT(d.id) AS document_count,
       COUNT(ah.id) AS approval_history_count
FROM proposals p
LEFT JOIN users u ON p.created_by = u.id
LEFT JOIN documents d ON p.id = d.proposal_id
LEFT JOIN approval_history ah ON p.id = ah.proposal_id
GROUP BY p.id, u.name, u.role, u.institution;
```

### 5.4 Indexes

```sql
-- users
idx_users_email, idx_users_role, idx_users_institution,
idx_users_account_status

-- proposals
idx_proposals_status, idx_proposals_created_by, idx_proposals_fakultas,
idx_proposals_created_at, idx_proposals_proposal_number,
idx_proposals_contact_email, idx_proposals_is_public_submission

-- documents
idx_documents_proposal_id, idx_documents_category, idx_documents_uploaded_by

-- approval_history
idx_approval_history_proposal_id, idx_approval_history_actor_id,
idx_approval_history_timestamp, idx_approval_history_action

-- email_notifications
idx_email_notifications_recipient_email, idx_email_notifications_status,
idx_email_notifications_proposal_id, idx_email_notifications_created_at

-- user_invitations
idx_user_invitations_email, idx_user_invitations_token,
idx_user_invitations_status
```

---

## 6. Arsitektur Sistem

### 6.1 Arsitektur Umum

```
┌───────────────────────────────────────────────────────────────┐
│                          CLIENT                               │
│   ┌──────────────────────────────────────────────────────┐    │
│   │  Browser (React 19 + Next.js 16 App Router)          │    │
│   │                                                       │    │
│   │  AuthProvider (auth-context.tsx)                      │    │
│   │  DataStoreProvider (data-store.tsx)                   │    │
│   │                                                       │    │
│   │  Pages:                    Components:                │    │
│   │  / (Landing)               DashboardLayout            │    │
│   │  /login                    ProtectedRoute             │    │
│   │  /register                 WorkflowActions            │    │
│   │  /submit-proposal          SimpleTracker              │    │
│   │  /dashboard                ProposalTracker            │    │
│   │  /dashboard/proposals      PdfViewer                  │    │
│   │  /dashboard/proposals/new  CommentsCard               │    │
│   │  /dashboard/proposals/[id]                            │    │
│   │  /dashboard/review                                    │    │
│   └─────────────────────────┬────────────────────────────┘    │
└─────────────────────────────┼─────────────────────────────────┘
                              │ HTTP / Fetch
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    NEXT.JS SERVER (PORT 3000)                    │
│                                                                  │
│  API Routes (Route Handlers):                                    │
│  POST /api/register             → Registrasi user baru          │
│  GET/POST/PUT/DELETE /api/proposals → CRUD proposal             │
│  POST /api/approval             → Workflow action + history      │
│  POST /api/create-mitra-account → Buat akun mitra               │
│  POST /api/public-proposal      → Submit tanpa akun             │
│  POST /api/upload               → Upload file                   │
│  POST /api/send-confirmation    → Email konfirmasi              │
│  POST /api/send-credentials     → Email kredensial              │
│  POST /api/send-welcome         → Email welcome mitra           │
│                                                                  │
│  supabaseAdmin (SERVICE_ROLE_KEY) ──────────────────────┐       │
└────────────────────────────────────────────────────────┬┘       │
                                                         │        │
                         ┌───────────────────────────────┘        │
                         │                                        │
                         ▼                                        ▼
         ┌───────────────────────────┐          ┌─────────────────────────┐
         │   SUPABASE CLOUD          │          │   RESEND API             │
         │                           │          │                          │
         │   ┌───────────────────┐   │          │   Email Templates:        │
         │   │ PostgreSQL DB     │   │          │   - Konfirmasi proposal   │
         │   │                   │   │          │   - Kredensial login      │
         │   │ Tables:           │   │          │   - Welcome mitra         │
         │   │ - users           │   │          │                          │
         │   │ - proposals       │   │          │   Dev: redirect ke       │
         │   │ - documents       │   │          │   hasbiberbagi@gmail.com │
         │   │ - approval_history│   │          └─────────────────────────┘
         │   │ - email_notif.    │   │
         │   │ - user_invitations│   │
         │   └───────────────────┘   │
         │                           │
         │   ┌───────────────────┐   │
         │   │ Supabase Auth     │   │
         │   │                   │   │
         │   │ - Session mgmt    │   │
         │   │ - JWT tokens      │   │
         │   │ - Email confirm   │   │
         │   └───────────────────┘   │
         │                           │
         │   ┌───────────────────┐   │
         │   │ Supabase Storage  │   │
         │   │                   │   │
         │   │ Buckets:          │   │
         │   │ - proposal-docs   │   │
         │   │   (private, 10MB) │   │
         │   │ - avatars         │   │
         │   │   (public, 2MB)   │   │
         │   └───────────────────┘   │
         └───────────────────────────┘
```

### 6.2 Supabase Client Architecture

```typescript
// Client-side (Browser) - ANON KEY
lib/supabase/client.ts
→ supabase.auth.signIn / signOut / getSession
→ supabase.from('table').select() [PUBLIC DATA]
→ Digunakan di: auth-context.tsx, komponen "use client"

// Server-side (API Routes) - SERVICE ROLE KEY
lib/supabase/admin.ts
→ supabaseAdmin.auth.admin.createUser()
→ supabaseAdmin.from('table').select/insert/update/delete()
→ Bypass RLS, full access
→ Digunakan di: semua API routes (/api/*)
```

### 6.3 State Management

```
Global State:
├── AuthContext (lib/auth-context.tsx)
│   ├── user: User | null         (app user data)
│   ├── supabaseUser              (supabase auth data)
│   ├── login(email, password)    → supabase.auth.signInWithPassword
│   ├── logout()                  → supabase.auth.signOut
│   └── isLoading: boolean
│
└── DataStoreContext (lib/data-store.tsx)
    ├── proposals: Proposal[]     (client-side cache)
    ├── isLoading: boolean
    ├── getProposalById(id)
    ├── updateProposal(id, updates)   → PUT /api/proposals
    ├── addProposal(proposal)         → POST /api/proposals
    ├── deleteProposal(id)            → DELETE /api/proposals
    ├── addApprovalHistory(...)       → POST /api/approval
    ├── updateProposalStatus(...)     → PUT /api/proposals
    └── refreshData()                 → GET /api/proposals
```

---

## 7. API Routes

### 7.1 `/api/proposals` — CRUD Proposal

| Method | Request | Response | Keterangan |
|--------|---------|----------|------------|
| GET | — | `Proposal[]` | Ambil semua proposal dengan join users, documents, approval_history |
| POST | `{title, partnerName, ...}` | `Proposal` | Buat proposal baru |
| PUT | `{id, updates}` | `Proposal` | Update proposal (status, paraf, TTD, dll) |
| DELETE | `?id=UUID` | `{success}` | Hapus proposal |

### 7.2 `/api/approval` — Workflow Action

| Method | Request | Keterangan |
|--------|---------|------------|
| POST | `{proposalId, history, sendEmail}` | Insert approval history. Jika `dkui_receive` + public submission → auto-create akun mitra + kirim welcome email |

### 7.3 `/api/create-mitra-account` — Buat Akun Mitra

| Method | Request | Keterangan |
|--------|---------|------------|
| POST | `{proposalId, email, name}` | Buat Supabase Auth user + users record + link ke proposal + kirim email kredensial |

### 7.4 `/api/public-proposal` — Submit Publik

| Method | Request | Keterangan |
|--------|---------|------------|
| POST | `{contactEmail, contactPerson, institution, title, objectives, ...}` | Submit proposal tanpa login. `created_by = null`, `is_public_submission = true`. Kirim email konfirmasi |

### 7.5 `/api/register` — Registrasi User

| Method | Request | Keterangan |
|--------|---------|------------|
| POST | `{name, email, password, role, institution?, fakultas?, phone?}` | Buat Supabase Auth user + users record. Validasi role enum |

### 7.6 `/api/upload` — Upload File

| Method | Request | Keterangan |
|--------|---------|------------|
| POST | `FormData: {file, proposalId, category?}` | Upload ke Supabase Storage bucket `proposal-documents`. Insert metadata ke `documents` table. Max 10MB |

### 7.7 `/api/send-confirmation` — Email Konfirmasi

| Method | Request | Keterangan |
|--------|---------|------------|
| POST | `{email, name, proposalTitle}` | Kirim email "Proposal Berhasil Dikirim" via Resend |

### 7.8 `/api/send-credentials` — Email Kredensial

| Method | Request | Keterangan |
|--------|---------|------------|
| POST | `{email, name, password}` | Kirim email berisi username + password sementara via Resend |

### 7.9 `/api/send-welcome` — Email Welcome

| Method | Request | Keterangan |
|--------|---------|------------|
| POST | `{email, name, proposalId, tempPassword}` | Ambil data proposal dari DB, kirim email welcome mitra dengan detail proposal |

---

## 8. Role & Hak Akses

### 8.1 Definisi Role

| Role | Label | Deskripsi |
|------|-------|-----------|
| `mitra` | Mitra Eksternal | Partner external yang mengajukan / diajak kerja sama |
| `fakultas` | Fakultas/Unit | Staff fakultas atau unit universitas |
| `dkui` | DKUI | Divisi Kerja Sama Universitas Indonesia (admin utama) |
| `biro_hukum` | Biro Hukum | Tim legal universitas |
| `wakil_rektor` | Wakil Rektor | Wakil Rektor bidang kerja sama |
| `rektor` | Rektor | Rektor universitas |

### 8.2 Hak Akses per Role

| Fitur | mitra | fakultas | dkui | biro_hukum | wakil_rektor | rektor |
|-------|-------|----------|------|------------|-------------|--------|
| Dashboard | ✅ (own) | ✅ | ✅ (full) | ✅ | ✅ | ✅ |
| Submit Proposal | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Lihat My Proposals | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Review Queue | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Terima Proposal | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ |
| AI Summary | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ |
| Pilih Fakultas | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ |
| Verifikasi Substansi | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Review Legal | ❌ | ❌ | ✅ | ✅ | ❌ | ❌ |
| Paraf Biro Hukum | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ |
| Paraf DKUI | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ |
| Approval Akhir Fakultas | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Tanda Tangan Mitra | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Tanda Tangan Warek | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ |
| Tanda Tangan Rektor | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| Pertukaran Dokumen | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ |
| Arsip | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ |

### 8.3 Dashboard per Role

| Role | Dashboard Spesifik | Fitur Utama |
|------|-------------------|-------------|
| `mitra` | MitraDashboard | Status proposal, tracking, komentar |
| `fakultas` | FakultasDashboard | Queue verifikasi substansi, tracking aktif |
| `dkui` | DKUIStatisticsDashboard | Statistik lengkap semua proposal |
| `biro_hukum` | BiroHukumDashboard | Queue validasi legal |
| `wakil_rektor` / `rektor` | SupervisiDashboard | Queue tanda tangan, supervisi |

---

## 9. Alur Email Notifikasi

### 9.1 Email Events

| Event | Template | Penerima | Trigger |
|-------|----------|----------|---------|
| Proposal berhasil disubmit | Konfirmasi Pengajuan | Mitra/Submitter | `/api/public-proposal` → `/api/send-confirmation` |
| Akun mitra dibuat | Kredensial Login | Mitra baru | `/api/create-mitra-account` → `/api/send-credentials` |
| DKUI menerima proposal publik | Welcome + Kredensial | Mitra | `/api/approval` (dkui_receive) → `sendWelcomeEmail()` |

### 9.2 Email Service Architecture

```
Email Request
     │
     ▼
lib/email-service.ts :: sendEmail()
     │
     ├── isDevelopment?
     │   ├── YES → redirect to: hasbiberbagi@gmail.com
     │   │         prefix subject: [DEV - Original: xxx@xxx.com]
     │   └── NO  → send to actual recipient
     │
     ├── Resend SDK → email delivery
     │
     └── Log ke DB: email_notifications table
         ├── status: 'sent'    (success)
         └── status: 'failed'  (error + error_message)
```

### 9.3 Email Configuration

```
DEV Mode (NODE_ENV=development):
- Semua email dikirim ke: hasbiberbagi@gmail.com
- Subject diprefiks: [DEV - Original: actual@email.com]
- Dev mode indicator di body email

PROD Mode:
- Email dikirim ke recipient asli
- Dari: EMAIL_FROM_NAME <EMAIL_FROM>
- Provider: Resend API
```

---

## 10. Storage & File Management

### 10.1 Bucket Configuration

| Bucket | Akses | Max Size | MIME Types |
|--------|-------|----------|------------|
| `proposal-documents` | Private | 10 MB | PDF, DOC, DOCX, XLS, XLSX, PNG, JPG |
| `avatars` | Public | 2 MB | PNG, JPG, WEBP |

### 10.2 File Path Structure (proposal-documents)

```
proposal-documents/
└── {year}/
    └── {month}/
        └── {proposalId}/
            └── {category}/
                └── {timestamp}_{random8chars}.{ext}

Contoh:
proposal-documents/2026/02/abc-123-uuid/initial/1709123456_a1b2c3d4.pdf
proposal-documents/2026/02/abc-123-uuid/revision/1709234567_e5f6g7h8.docx
```

### 10.3 Kategori Dokumen

| Kategori | Keterangan |
|----------|------------|
| `initial` | Dokumen proposal awal |
| `revision` | Dokumen hasil revisi (mitra/dkui) |
| `legal` | Dokumen legal yang disusun DKUI |
| `signed` | Dokumen yang sudah ditandatangani |
| `final` | Dokumen final hasil pertukaran |
| `archived` | Dokumen yang diarsipkan |

### 10.4 Upload Flow

```
Client → POST /api/upload (FormData: file + proposalId + category)
     │
     ├── Validasi: file exists, size ≤ 10MB
     │
     ├── Upload ke Supabase Storage
     │   Path: {year}/{month}/{proposalId}/{category}/{ts}_{rand}.{ext}
     │
     ├── Insert metadata ke DB:
     │   table: documents
     │   fields: name, type, size, storage_path, url, category, uploaded_by
     │
     └── Return: document metadata + public URL
         (Rollback: hapus dari storage jika DB insert gagal)
```

---

## 11. Migrations

| File | Keterangan |
|------|------------|
| `schema.sql` | Schema utama — semua tabel, enum, trigger, views |
| `storage.sql` | Setup Supabase Storage buckets |
| `migration-public-submission.sql` | Tambah kolom untuk public submission (is_public_submission, contact_*) |
| `migration-created-by-nullable.sql` | Make created_by nullable untuk public submission |
| `migration-uploaded-by-nullable.sql` | Make uploaded_by nullable |
| `migration-add-notifying-status.sql` | Tambah status dkui_notifying_mitra ke enum |
| `seed-users.sql` | Seed initial test users |
| `seed_test_proposals.sql` | Seed test proposals |
| `email-templates.sql` | Template email di database |
| `reset_proposals.sql` | Reset semua proposals (dev only) |
| `fix_test_proposals.sql` | Fix data test proposals |
| `delete_dkui_account.sql` | Helper delete DKUI account |

---

## 12. Struktur Direktori Projek

```
d:\Sistem-KerjaSama-UPI\
├── app/                          # Next.js App Router
│   ├── layout.tsx                # Root layout (AuthProvider + DataStoreProvider)
│   ├── page.tsx                  # Landing page (public)
│   ├── globals.css               # Global styles
│   ├── api/                      # API Routes (server-side)
│   │   ├── proposals/route.ts    # CRUD proposals
│   │   ├── approval/route.ts     # Workflow actions
│   │   ├── create-mitra-account/ # Create mitra account
│   │   ├── public-proposal/      # Public submission
│   │   ├── register/             # User registration
│   │   ├── upload/               # File upload
│   │   ├── send-confirmation/    # Email confirmation
│   │   ├── send-credentials/     # Email credentials
│   │   └── send-welcome/         # Email welcome
│   ├── login/page.tsx            # Login page
│   ├── register/page.tsx         # Registration page
│   ├── submit-proposal/page.tsx  # Public proposal form
│   └── dashboard/                # Protected dashboard
│       ├── page.tsx              # Main dashboard (role-based)
│       ├── proposals/            
│       │   ├── page.tsx          # My proposals list
│       │   ├── new/page.tsx      # Create new proposal
│       │   └── [id]/page.tsx     # Proposal detail + workflow
│       └── review/page.tsx       # Review queue
│
├── components/                   # Reusable components
│   ├── dashboard-layout.tsx      # Shell layout + sidebar
│   ├── protected-route.tsx       # Auth guard
│   ├── workflow-actions.tsx      # Workflow action panel
│   ├── proposal-tracker.tsx      # Visual timeline tracker
│   ├── simple-tracker.tsx        # Simplified tracker
│   ├── comments-card.tsx         # Comments display
│   ├── pdf-viewer.tsx            # PDF document viewer
│   └── ui/                       # shadcn/ui components
│
├── lib/                          # Shared utilities & logic
│   ├── auth-context.tsx          # Authentication context
│   ├── data-store.tsx            # Global data store
│   ├── workflow-engine.ts        # BPMN workflow state machine
│   ├── workflow-utils.ts         # Workflow utility functions
│   ├── workflow-data.ts          # Workflow step definitions
│   ├── email-service.ts          # Email sending service
│   ├── mock-data.ts              # TypeScript type definitions
│   ├── utils.ts                  # Utility functions
│   └── supabase/
│       ├── client.ts             # Supabase browser client (ANON)
│       ├── admin.ts              # Supabase server client (SERVICE ROLE)
│       └── database.types.ts     # Generated TypeScript types
│
├── hooks/                        # Custom React hooks
│   ├── use-mobile.ts             # Mobile detection
│   └── use-toast.ts              # Toast notifications
│
├── supabase/                     # Database files
│   ├── schema.sql                # Main schema
│   ├── storage.sql               # Storage config
│   ├── migration-*.sql           # Database migrations
│   └── migrations/               # Versioned migrations
│
├── scripts/
│   └── create-users.ts           # User seeding script
│
├── public/                       # Static assets
├── .env.local                    # Environment variables
├── next.config.mjs               # Next.js config
├── tsconfig.json                 # TypeScript config
├── components.json               # shadcn/ui config
└── package.json                  # Dependencies
```

---

## 13. Default User untuk Testing

| Email | Password | Role | Keterangan |
|-------|----------|------|------------|
| `dkui@upi.edu` | `admin123` | `dkui` | Auto-created dari schema.sql |

> **Catatan:** User lain bisa dibuat via halaman `/register` atau Supabase Dashboard.

---

*Dokumentasi ini dibuat pada February 27, 2026*
*Versi: Branch `new`*
