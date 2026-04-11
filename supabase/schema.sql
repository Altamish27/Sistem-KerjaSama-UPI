-- ============================================
-- SUPABASE SCHEMA - SISTEM KERJA SAMA UPI (SIMKERMA)
-- ============================================
-- Database schema sesuai Peraturan Rektor No. 019 Tahun 2022
-- dan standar pelaporan Lapkerma Kemdikbudristek.
--
-- Workflow: Sequential approval (BUKAN parallel signing)
--   Path A: Rektor (MoU strategis)
--   Path B: Pimpinan Unit (delegasi via Surat Kuasa)
--
-- Author: GitHub Copilot
-- Date: 2026-02-27

-- ============================================
-- EXTENSIONS
-- ============================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- ENUMS
-- ============================================

-- Role pengguna sesuai struktur organisasi UPI
CREATE TYPE user_role AS ENUM (
  'mitra',                    -- Mitra Eksternal
  'operator_unit',            -- Operator Unit (upload & tracking proposal)
  'pimpinan_unit',            -- Dekan / Direktur SPs / Kepala Lembaga / Kepala UPT (review only)
  'dkui',                     -- Direktorat Kerja Sama & Usaha Internasional
  'biro_hukum',               -- Kantor Hukum & Organisasi
  'sekretaris_universitas',   -- Sekretaris Universitas (SU) - paraf sebelum WR
  'wakil_rektor',             -- Wakil Rektor Bidang RUK
  'rektor'                    -- Rektor (TTE final)
);

-- Status dokumen kerja sama — alur sequential ketat
-- Path A (Rektor):  draft → submitted → pimpinan_unit_reviewing → ... → su_reviewing → ... → rektor_signing → rektor_signed → mitra_signing → mitra_signed → archived → completed
-- Path B (PU):      draft → submitted → pimpinan_unit_reviewing → ... → biro_hukum_approved → pimpinan_unit_signing → pimpinan_unit_signed → mitra_signing → mitra_signed → archived → completed
CREATE TYPE proposal_status AS ENUM (
  -- Drafting
  'draft',
  'submitted',

  -- Review berjenjang
  'pimpinan_unit_reviewing',
  'pimpinan_unit_approved',
  'pimpinan_unit_rejected',

  'dkui_reviewing',
  'dkui_approved',
  'dkui_rejected',

  'biro_hukum_reviewing',
  'biro_hukum_approved',
  'biro_hukum_rejected',

  -- Path A only: Sekretaris Universitas
  'su_reviewing',
  'su_approved',       -- paraf SU
  'su_rejected',

  -- Path A only: Wakil Rektor
  'wr_reviewing',
  'wr_approved',       -- paraf WR RUK
  'wr_rejected',

  -- Penandatanganan
  'rektor_signing',          -- Path A: TTE Rektor
  'rektor_signed',
  'pimpinan_unit_signing',   -- Path B: TTE Pimpinan Unit
  'pimpinan_unit_signed',
  'mitra_signing',           -- Tanda tangan mitra
  'mitra_signed',

  -- Revisi loop (Pasal 17 ayat 2)
  'dkui_self_revising',      -- DKUI sebagai legal drafter memperbaiki
  'mitra_resubmitted',       -- Persetujuan ulang inisiator & mitra

  -- Terminal
  'archived',
  'completed',
  'rejected'
);

-- Aksi approval dalam workflow
CREATE TYPE approval_action AS ENUM (
  'submit',

  'pimpinan_unit_review',
  'pimpinan_unit_approve',
  'pimpinan_unit_reject',

  'dkui_review',
  'dkui_approve',
  'dkui_reject',

  'biro_hukum_review',
  'biro_hukum_approve',
  'biro_hukum_reject',

  'su_review',
  'su_approve',
  'su_reject',

  'wr_review',
  'wr_approve',
  'wr_reject',

  'rektor_sign',
  'pimpinan_unit_sign',
  'mitra_sign',

  'dkui_self_revise',
  'mitra_resubmit',

  'archive',
  'complete',
  'final_rejection'
);

-- Jenis dokumen kerja sama (Peraturan Rektor Pasal 7)
CREATE TYPE jenis_dokumen AS ENUM (
  'MoU',       -- Memorandum of Understanding (Nota Kesepahaman)
  'MoA/PKS',   -- Memorandum of Agreement / Perjanjian Kerja Sama
  'IA'         -- Implementation Arrangement (Pengaturan Pelaksanaan)
);

-- Status pengajuan penjajakan (guest mode)
CREATE TYPE status_pengajuan AS ENUM (
  'pending',      -- Baru masuk, belum dicek DKUI
  'ditolak',      -- Ditolak DKUI atau Unit tidak bersedia
  'diteruskan'    -- Diteruskan ke unit terkait & inisiator ditetapkan
);

-- Tipe inisiator
CREATE TYPE initiator_type AS ENUM (
  'mitra',       -- Diinisiasi oleh mitra eksternal
  'internal'     -- Diinisiasi oleh unit internal UPI
);

-- Tipe partner/mitra
CREATE TYPE partner_type AS ENUM (
  'dalam_negeri',
  'luar_negeri'
);

-- Tipe revisi
CREATE TYPE revision_type AS ENUM (
  'mitra',   -- Revisi oleh mitra
  'dkui'     -- Revisi oleh DKUI (legal drafter)
);

-- ============================================
-- TABLES
-- ============================================

-- ==================== UNIT KERJA ====================
-- Daftar unit kerja di lingkungan UPI
CREATE TABLE unit_kerja (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nama_unit VARCHAR(255) NOT NULL,
  jenis_unit VARCHAR(100) NOT NULL, -- Fakultas, Sekolah Pascasarjana, Lembaga, UPT, Direktorat, dll.
  kode_unit VARCHAR(20),            -- Kode singkat unit (opsional)
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_unit_kerja_jenis ON unit_kerja(jenis_unit);

-- ==================== USERS ====================
-- Pengguna sistem (internal UPI + mitra)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT,               -- Nullable jika pakai Supabase Auth
  name VARCHAR(255) NOT NULL,
  role user_role NOT NULL,

  -- Relasi ke unit kerja (untuk user internal UPI)
  unit_id UUID REFERENCES unit_kerja(id),

  -- Info tambahan
  institution VARCHAR(255),         -- Nama instansi (untuk mitra)
  phone VARCHAR(50),
  address TEXT,

  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  email_verified BOOLEAN DEFAULT FALSE,
  account_status TEXT DEFAULT 'pending'
    CHECK (account_status IN ('pending', 'active', 'suspended')),

  -- Invitation flow
  invitation_token TEXT,
  invitation_expires_at TIMESTAMPTZ,
  password_set_at TIMESTAMPTZ,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_login_at TIMESTAMPTZ,

  -- Metadata
  created_by UUID REFERENCES users(id),
  avatar_url TEXT
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_unit_id ON users(unit_id) WHERE unit_id IS NOT NULL;
CREATE INDEX idx_users_account_status ON users(account_status);

-- ==================== MITRA ====================
-- Data institusi mitra kerja sama (terpisah dari users)
-- Satu mitra bisa punya banyak dokumen kerja sama
-- Fields mengikuti kebutuhan pelaporan Lapkerma Kemdikbudristek
CREATE TABLE mitra (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nama_instansi VARCHAR(500) NOT NULL,
  alamat_lengkap TEXT,
  jenis_mitra partner_type NOT NULL DEFAULT 'dalam_negeri',

  -- Data penandatangan (wajib Lapkerma)
  nama_penandatangan VARCHAR(255),
  jabatan_penandatangan VARCHAR(255),

  -- PIC (Person in Charge) untuk komunikasi
  nama_pic VARCHAR(255),
  kontak_pic VARCHAR(100),     -- Nomor HP / WhatsApp
  email_pic VARCHAR(255),

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_mitra_nama ON mitra(nama_instansi);
CREATE INDEX idx_mitra_email ON mitra(email_pic) WHERE email_pic IS NOT NULL;

-- ==================== PENGAJUAN PENJAJAKAN ====================
-- Tabel "inbox" untuk pengajuan dari mitra eksternal (guest mode)
-- Submisi publik masuk ke sini, BUKAN langsung ke proposals.
-- DKUI akan me-review dan meneruskan ke unit terkait jika lolos.
CREATE TABLE pengajuan_penjajakan (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Bisa FK ke mitra (jika sudah terdaftar) atau inline
  mitra_id UUID REFERENCES mitra(id),
  nama_instansi VARCHAR(500) NOT NULL,    -- Inline agar guest tidak perlu daftar dulu
  email_pic VARCHAR(255) NOT NULL,
  nama_pic VARCHAR(255),
  telepon_pic VARCHAR(100),

  -- Isi pengajuan
  judul_tawaran VARCHAR(500) NOT NULL,
  deskripsi_singkat TEXT,

  -- Dokumen pendukung (URL Supabase Storage)
  file_legalitas TEXT,        -- Akta pendirian / surat izin
  file_profil_mitra TEXT,     -- Company profile

  -- Status & review
  status_pengajuan status_pengajuan DEFAULT 'pending',
  catatan_dkui TEXT,          -- Alasan penolakan atau catatan internal
  reviewed_by UUID REFERENCES users(id),
  reviewed_at TIMESTAMPTZ,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_penjajakan_status ON pengajuan_penjajakan(status_pengajuan);
CREATE INDEX idx_penjajakan_email ON pengajuan_penjajakan(email_pic);
CREATE INDEX idx_penjajakan_created ON pengajuan_penjajakan(created_at DESC);

-- ==================== PROPOSALS (DOKUMEN KERJA SAMA) ====================
-- Tabel utama dokumen kerja sama.
-- Hanya diisi SETELAH penjajakan selesai dan DKUI menetapkan inisiator.
-- Nama tabel tetap "proposals" untuk backward compatibility dengan API routes.
CREATE TABLE proposals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  proposal_number VARCHAR(50) UNIQUE,   -- Auto-generated: KS/UPI/YYYY/XXX

  -- === Relasi Utama ===
  mitra_id UUID REFERENCES mitra(id),
  inisiator_id UUID REFERENCES users(id),       -- User internal yang ditunjuk sbg inisiator
  unit_terkait_id UUID REFERENCES unit_kerja(id),
  created_by UUID REFERENCES users(id),          -- Nullable: bisa dibuat oleh sistem

  -- === Info Dasar ===
  initiator initiator_type NOT NULL DEFAULT 'internal',
  title VARCHAR(500) NOT NULL,
  jenis_dokumen jenis_dokumen,                   -- MoU / MoA-PKS / IA

  -- === Konten ===
  description TEXT,
  objectives TEXT,
  benefits TEXT,
  scope_of_work TEXT,
  ruang_lingkup TEXT,                            -- Ruang lingkup bahasa Indonesia

  -- === Kebutuhan Lapkerma ===
  bentuk_kegiatan_lapkerma VARCHAR(255),          -- Bentuk kegiatan sesuai kategori Lapkerma

  -- === Dokumen Wajib (URL Supabase Storage) ===
  file_berita_acara_penjajakan TEXT,              -- Pasal 13 ayat 5: wajib sebelum drafting
  file_surat_kuasa TEXT,                          -- Pasal 16: jika Pimpinan Unit yang tanda tangan (Path B)
  file_naskah_final TEXT,                         -- Naskah final yang sudah ditandatangani

  -- === Penandatangan ===
  penandatangan_upi VARCHAR(255),                 -- Nama penandatangan dari sisi UPI

  -- === Keuangan ===
  is_income_generating BOOLEAN DEFAULT FALSE,     -- Pasal 6 & 26: apakah menghasilkan pendapatan

  -- === Timeline & Budget ===
  duration INTEGER,                               -- Durasi dalam bulan
  start_date DATE,
  end_date DATE,
  budget BIGINT,                                  -- Dalam Rupiah

  -- === Workflow Status ===
  status proposal_status DEFAULT 'draft',

  -- === Revision Info ===
  revision_type revision_type,
  revision_reason TEXT,

  -- === AI Summary (opsional) ===
  ai_summary TEXT,
  ai_summary_generated_at TIMESTAMPTZ,

  -- === Tracking Paraf & Tanda Tangan (Sequential) ===
  -- Step 1: Pimpinan Unit
  pimpinan_unit_approval_by UUID REFERENCES users(id),
  pimpinan_unit_approval_at TIMESTAMPTZ,

  -- Step 2: DKUI
  dkui_approval_by UUID REFERENCES users(id),
  dkui_approval_at TIMESTAMPTZ,

  -- Step 3: Biro Hukum
  biro_hukum_paraf_by UUID REFERENCES users(id),
  biro_hukum_paraf_at TIMESTAMPTZ,

  -- Step 4 (Path A): Sekretaris Universitas
  su_paraf_by UUID REFERENCES users(id),
  su_paraf_at TIMESTAMPTZ,

  -- Step 5 (Path A): Wakil Rektor
  wr_paraf_by UUID REFERENCES users(id),
  wr_paraf_at TIMESTAMPTZ,

  -- Step 6a (Path A): Rektor
  rektor_signed_by UUID REFERENCES users(id),
  rektor_signed_at TIMESTAMPTZ,

  -- Step 6b (Path B): Pimpinan Unit sebagai penandatangan
  pimpinan_unit_signed_by UUID REFERENCES users(id),
  pimpinan_unit_signed_at TIMESTAMPTZ,

  -- Step 7: Mitra
  mitra_signed_by UUID REFERENCES users(id),
  mitra_signed_at TIMESTAMPTZ,

  -- === Timestamps ===
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  submitted_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  rejected_at TIMESTAMPTZ,
  archived_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX idx_proposals_status ON proposals(status);
CREATE INDEX idx_proposals_mitra_id ON proposals(mitra_id);
CREATE INDEX idx_proposals_inisiator_id ON proposals(inisiator_id);
CREATE INDEX idx_proposals_unit_terkait ON proposals(unit_terkait_id);
CREATE INDEX idx_proposals_created_by ON proposals(created_by);
CREATE INDEX idx_proposals_created_at ON proposals(created_at DESC);
CREATE INDEX idx_proposals_jenis_dokumen ON proposals(jenis_dokumen) WHERE jenis_dokumen IS NOT NULL;
CREATE INDEX idx_proposals_proposal_number ON proposals(proposal_number) WHERE proposal_number IS NOT NULL;
CREATE INDEX idx_proposals_income ON proposals(is_income_generating) WHERE is_income_generating = TRUE;

-- ==================== DOCUMENTS ====================
-- Metadata file yang di-upload ke Supabase Storage
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  proposal_id UUID REFERENCES proposals(id) ON DELETE CASCADE NOT NULL,

  -- Document Info
  name VARCHAR(255) NOT NULL,
  type VARCHAR(100) NOT NULL,       -- MIME type
  size BIGINT NOT NULL,             -- Bytes
  storage_path TEXT NOT NULL,       -- Path di Supabase Storage
  url TEXT,                         -- Public/signed URL

  -- Category: 'initial', 'revision', 'legal', 'berita_acara', 'surat_kuasa', 'signed', 'final', 'archived'
  category VARCHAR(50) NOT NULL,

  -- Upload Info
  uploaded_by UUID REFERENCES users(id),  -- Nullable untuk submit tanpa login
  uploaded_at TIMESTAMPTZ DEFAULT NOW(),

  -- Metadata
  description TEXT,
  version INTEGER DEFAULT 1,
  is_current BOOLEAN DEFAULT TRUE
);

CREATE INDEX idx_documents_proposal_id ON documents(proposal_id);
CREATE INDEX idx_documents_category ON documents(category);
CREATE INDEX idx_documents_uploaded_by ON documents(uploaded_by);

-- ==================== APPROVAL HISTORY ====================
-- Riwayat semua aksi review dalam workflow & jejak audit
CREATE TABLE approval_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  proposal_id UUID REFERENCES proposals(id) ON DELETE CASCADE NOT NULL,

  -- Action
  action approval_action NOT NULL,

  -- Actor
  actor_id UUID REFERENCES users(id),  -- Nullable untuk aksi sistem
  actor_name VARCHAR(255) NOT NULL,
  actor_role user_role NOT NULL,

  -- Tahapan (tracking di tahap mana review terjadi)
  tahapan VARCHAR(100),   -- 'pimpinan_unit', 'dkui', 'biro_hukum', 'su', 'wr', 'rektor', 'mitra'

  -- Details
  comment TEXT,
  document_id UUID REFERENCES documents(id),

  -- Timestamp
  timestamp TIMESTAMPTZ DEFAULT NOW(),

  -- Metadata
  metadata JSONB
);

CREATE INDEX idx_approval_history_proposal_id ON approval_history(proposal_id);
CREATE INDEX idx_approval_history_actor_id ON approval_history(actor_id);
CREATE INDEX idx_approval_history_timestamp ON approval_history(timestamp DESC);
CREATE INDEX idx_approval_history_action ON approval_history(action);
CREATE INDEX idx_approval_history_tahapan ON approval_history(tahapan) WHERE tahapan IS NOT NULL;

-- ==================== PENDANAAN ====================
-- Tracking untuk kerja sama income-generating (Pasal 6 & 26)
CREATE TABLE pendanaan (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  proposal_id UUID REFERENCES proposals(id) ON DELETE CASCADE NOT NULL,

  nilai_kontrak BIGINT,                      -- Total nilai kontrak (Rupiah)
  biaya_pengembangan_institusi BIGINT,       -- Maks 15% dari nilai kontrak
  rekening_penerima VARCHAR(255),            -- Nomor rekening penerima
  status_pembayaran VARCHAR(50) DEFAULT 'belum_dibayar'
    CHECK (status_pembayaran IN ('belum_dibayar', 'sebagian', 'lunas')),

  catatan TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_pendanaan_proposal_id ON pendanaan(proposal_id);
CREATE INDEX idx_pendanaan_status ON pendanaan(status_pembayaran);

-- ==================== EMAIL NOTIFICATIONS ====================
-- Tracking email yang dikirim via Resend
CREATE TABLE email_notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  recipient_email VARCHAR(255) NOT NULL,
  recipient_name VARCHAR(255),
  recipient_user_id UUID REFERENCES users(id),

  subject VARCHAR(500) NOT NULL,
  body TEXT NOT NULL,
  template_name VARCHAR(100),

  proposal_id UUID REFERENCES proposals(id),

  status VARCHAR(50) DEFAULT 'pending'
    CHECK (status IN ('pending', 'sent', 'failed', 'bounced')),
  sent_at TIMESTAMPTZ,
  failed_at TIMESTAMPTZ,
  error_message TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB
);

CREATE INDEX idx_email_notifications_recipient ON email_notifications(recipient_email);
CREATE INDEX idx_email_notifications_status ON email_notifications(status);
CREATE INDEX idx_email_notifications_proposal ON email_notifications(proposal_id);
CREATE INDEX idx_email_notifications_created ON email_notifications(created_at DESC);

-- ==================== USER INVITATIONS ====================
-- Undangan untuk user baru (khususnya mitra setelah penjajakan disetujui)
CREATE TABLE user_invitations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  email VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  role user_role NOT NULL,
  institution VARCHAR(255),

  token VARCHAR(255) UNIQUE NOT NULL,

  proposal_id UUID REFERENCES proposals(id),

  status VARCHAR(50) DEFAULT 'pending'
    CHECK (status IN ('pending', 'accepted', 'expired')),
  invited_by UUID REFERENCES users(id) NOT NULL,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '7 days'),
  accepted_at TIMESTAMPTZ,

  temp_password TEXT
);

CREATE INDEX idx_invitations_email ON user_invitations(email);
CREATE INDEX idx_invitations_token ON user_invitations(token);
CREATE INDEX idx_invitations_status ON user_invitations(status);

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger ke semua tabel yang punya kolom updated_at
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_mitra_updated_at
  BEFORE UPDATE ON mitra FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_proposals_updated_at
  BEFORE UPDATE ON proposals FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pendanaan_updated_at
  BEFORE UPDATE ON pendanaan FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Auto-generate nomor proposal saat status = submitted
CREATE OR REPLACE FUNCTION generate_proposal_number()
RETURNS TRIGGER AS $$
DECLARE
  year_str VARCHAR(4);
  seq_num INTEGER;
  new_number VARCHAR(50);
BEGIN
  IF NEW.proposal_number IS NULL AND NEW.status = 'submitted' THEN
    year_str := TO_CHAR(NOW(), 'YYYY');

    SELECT COALESCE(MAX(
      CAST(SUBSTRING(proposal_number FROM '\d+$') AS INTEGER)
    ), 0) + 1 INTO seq_num
    FROM proposals
    WHERE proposal_number LIKE 'KS/UPI/' || year_str || '/%';

    new_number := 'KS/UPI/' || year_str || '/' || LPAD(seq_num::TEXT, 3, '0');
    NEW.proposal_number := new_number;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER generate_proposal_number_trigger
  BEFORE INSERT OR UPDATE ON proposals FOR EACH ROW
  EXECUTE FUNCTION generate_proposal_number();

-- Auto-set timestamps berdasarkan perubahan status
CREATE OR REPLACE FUNCTION update_proposal_timestamps()
RETURNS TRIGGER AS $$
BEGIN
  -- submitted
  IF NEW.status = 'submitted' AND (OLD IS NULL OR OLD.status != 'submitted') THEN
    NEW.submitted_at := NOW();
  END IF;

  -- completed
  IF NEW.status = 'completed' AND (OLD IS NULL OR OLD.status != 'completed') THEN
    NEW.completed_at := NOW();
  END IF;

  -- rejected
  IF NEW.status = 'rejected' AND (OLD IS NULL OR OLD.status != 'rejected') THEN
    NEW.rejected_at := NOW();
  END IF;

  -- archived
  IF NEW.status = 'archived' AND (OLD IS NULL OR OLD.status != 'archived') THEN
    NEW.archived_at := NOW();
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_proposal_timestamps_trigger
  BEFORE INSERT OR UPDATE ON proposals FOR EACH ROW
  EXECUTE FUNCTION update_proposal_timestamps();

-- Generate invitation token
CREATE OR REPLACE FUNCTION generate_invitation_token()
RETURNS TEXT AS $$
BEGIN
  RETURN encode(gen_random_bytes(32), 'hex');
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- ROW LEVEL SECURITY (RLS) - DISABLED
-- ============================================
-- RLS dinonaktifkan untuk simplifikasi development.
-- Security di-handle di application layer (middleware + API routes).
-- Uncomment di production:
-- ALTER TABLE users ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE mitra ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE pengajuan_penjajakan ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE proposals ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE approval_history ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE pendanaan ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE email_notifications ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE user_invitations ENABLE ROW LEVEL SECURITY;

-- ============================================
-- VIEWS
-- ============================================

-- Statistik proposal per status
CREATE OR REPLACE VIEW proposal_statistics AS
SELECT
  status,
  COUNT(*) AS count,
  COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '30 days') AS count_last_30_days,
  COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '7 days') AS count_last_7_days
FROM proposals
GROUP BY status;

-- Proposal dengan detail lengkap (JOIN ke mitra & unit_kerja)
CREATE OR REPLACE VIEW proposals_with_details AS
SELECT
  p.*,
  m.nama_instansi AS mitra_nama,
  m.jenis_mitra AS mitra_jenis,
  m.nama_penandatangan AS mitra_penandatangan,
  m.jabatan_penandatangan AS mitra_jabatan_penandatangan,
  m.nama_pic AS mitra_pic,
  m.email_pic AS mitra_email,
  uk.nama_unit AS unit_nama,
  uk.jenis_unit AS unit_jenis,
  u.name AS created_by_name,
  u.role AS created_by_role,
  ini.name AS inisiator_name,
  COUNT(DISTINCT d.id) AS document_count,
  COUNT(DISTINCT ah.id) AS approval_history_count
FROM proposals p
LEFT JOIN mitra m ON p.mitra_id = m.id
LEFT JOIN unit_kerja uk ON p.unit_terkait_id = uk.id
LEFT JOIN users u ON p.created_by = u.id
LEFT JOIN users ini ON p.inisiator_id = ini.id
LEFT JOIN documents d ON p.id = d.proposal_id
LEFT JOIN approval_history ah ON p.id = ah.proposal_id
GROUP BY p.id, m.id, uk.id, u.name, u.role, ini.name;

-- Inbox penjajakan guest + data mitra (untuk dashboard DKUI)
CREATE OR REPLACE VIEW pengajuan_with_mitra AS
SELECT
  pp.*,
  m.nama_instansi AS mitra_nama_terdaftar,
  m.jenis_mitra,
  rv.name AS reviewer_name
FROM pengajuan_penjajakan pp
LEFT JOIN mitra m ON pp.mitra_id = m.id
LEFT JOIN users rv ON pp.reviewed_by = rv.id;

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON TABLE unit_kerja IS 'Daftar unit kerja di lingkungan UPI (Fakultas, SPs, Lembaga, UPT, Direktorat)';
COMMENT ON TABLE users IS 'Pengguna sistem: mitra, pimpinan_unit, dkui, biro_hukum, sekretaris_universitas, wakil_rektor, rektor';
COMMENT ON TABLE mitra IS 'Data institusi mitra kerja sama. Fields mengikuti kebutuhan pelaporan Lapkerma.';
COMMENT ON TABLE pengajuan_penjajakan IS 'Inbox pengajuan guest mode dari mitra eksternal. DKUI review sebelum diteruskan ke unit.';
COMMENT ON TABLE proposals IS 'Dokumen kerja sama utama. Hanya diisi setelah penjajakan selesai. Nama tetap "proposals" untuk backward compat.';
COMMENT ON TABLE documents IS 'Metadata file yang di-upload ke Supabase Storage bucket proposal-documents.';
COMMENT ON TABLE approval_history IS 'Riwayat review / approval pada setiap tahapan workflow. Berfungsi sebagai audit trail.';
COMMENT ON TABLE pendanaan IS 'Tracking keuangan untuk kerja sama income-generating (Peraturan Rektor Pasal 6 & 26).';
COMMENT ON TABLE email_notifications IS 'Log email yang dikirim via Resend API.';
COMMENT ON TABLE user_invitations IS 'Undangan buat akun mitra setelah penjajakan disetujui.';

COMMENT ON COLUMN proposals.status IS 'Status dokumen mengikuti alur sequential sesuai Peraturan Rektor No. 019/2022.';
COMMENT ON COLUMN proposals.proposal_number IS 'Auto-generated saat status = submitted. Format: KS/UPI/YYYY/XXX';
COMMENT ON COLUMN proposals.file_berita_acara_penjajakan IS 'Pasal 13 ayat 5: Bukti tertulis hasil penjajakan. Wajib sebelum drafting.';
COMMENT ON COLUMN proposals.file_surat_kuasa IS 'Pasal 16: Surat Kuasa Rektor. Jika ada → Path B (TTE Pimpinan Unit).';
COMMENT ON COLUMN proposals.is_income_generating IS 'Pasal 6 & 26: Menandai kerja sama yang menghasilkan pendapatan.';
COMMENT ON COLUMN pendanaan.biaya_pengembangan_institusi IS 'Maksimal 15% dari nilai kontrak (Peraturan Rektor).';
