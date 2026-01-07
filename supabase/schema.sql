-- ============================================
-- SUPABASE SCHEMA - UNIVERSITY COOPERATION SYSTEM
-- ============================================
-- Database schema untuk sistem e-contract kerja sama universitas
-- Author: GitHub Copilot
-- Date: 2026-01-07

-- ============================================
-- EXTENSIONS
-- ============================================
-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable pgcrypto for password hashing
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- ENUMS
-- ============================================

-- User roles dalam sistem
CREATE TYPE user_role AS ENUM (
  'mitra',
  'fakultas',
  'dkui',
  'biro_hukum',
  'wakil_rektor',
  'rektor'
);

-- Status proposal mengikuti BPMN workflow
CREATE TYPE proposal_status AS ENUM (
  'draft',
  'submitted',
  'dkui_received',
  'dkui_need_summary',
  'dkui_summarized',
  'dkui_selecting_faculty',
  'dkui_sent_to_faculty',
  'faculty_reviewing',
  'faculty_substansi_approved',
  'faculty_substansi_rejected',
  'dkui_evaluating_feedback',
  'dkui_deciding_revision',
  'dkui_requesting_mitra_revision',
  'mitra_revising',
  'mitra_resubmitted',
  'dkui_self_revising',
  'dkui_revision_completed',
  'dkui_legal_review_1',
  'dkui_legal_approved_1',
  'biro_hukum_reviewing',
  'biro_hukum_legalitas_approved',
  'biro_hukum_legalitas_rejected',
  'biro_hukum_paraf',
  'dkui_paraf',
  'faculty_final_approval',
  'parallel_signing_started',
  'mitra_ready_to_sign',
  'mitra_stamped',
  'mitra_signed',
  'warek_reviewing',
  'warek_stamped',
  'warek_signed',
  'warek_rejected',
  'rektor_reviewing',
  'rektor_stamped',
  'rektor_signed',
  'rektor_rejected',
  'document_exchange',
  'archived',
  'completed',
  'rejected'
);

-- Tipe inisiator proposal
CREATE TYPE initiator_type AS ENUM ('mitra', 'fakultas');

-- Tipe partner
CREATE TYPE partner_type AS ENUM ('dalam_negeri', 'luar_negeri');

-- Approval actions dalam workflow
CREATE TYPE approval_action AS ENUM (
  'submit',
  'dkui_receive',
  'dkui_trigger_ai_summary',
  'dkui_select_faculty',
  'dkui_send_to_faculty',
  'faculty_review_substansi',
  'faculty_approve_substansi',
  'faculty_reject_substansi',
  'dkui_evaluate_feedback',
  'dkui_decide_revision_mitra',
  'dkui_decide_revision_self',
  'final_rejection',
  'dkui_request_mitra_revision',
  'mitra_upload_revision',
  'dkui_self_revise',
  'dkui_complete_revision',
  'dkui_legal_review_1',
  'dkui_approve_legal_1',
  'biro_hukum_review',
  'biro_hukum_approve',
  'biro_hukum_reject',
  'biro_hukum_paraf',
  'dkui_paraf',
  'faculty_final_approve',
  'start_parallel_signing',
  'mitra_prepare_sign',
  'mitra_stamp',
  'mitra_sign',
  'warek_review',
  'warek_stamp',
  'warek_sign',
  'warek_reject',
  'rektor_review',
  'rektor_stamp',
  'rektor_sign',
  'rektor_reject',
  'document_exchange',
  'archive',
  'complete'
);

-- Tipe revisi
CREATE TYPE revision_type AS ENUM ('mitra', 'dkui');

-- ============================================
-- TABLES
-- ============================================

-- ==================== USERS ====================
-- Table untuk menyimpan data user sistem
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT, -- Hashed password (nullable untuk Supabase Auth)
  name VARCHAR(255) NOT NULL,
  role user_role NOT NULL,
  fakultas VARCHAR(255), -- Untuk user dengan role fakultas
  institution VARCHAR(255), -- Untuk user dengan role mitra
  phone VARCHAR(50),
  address TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  email_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_login_at TIMESTAMPTZ,
  
  -- Metadata
  created_by UUID REFERENCES users(id),
  avatar_url TEXT
);

-- Index untuk performa
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_institution ON users(institution) WHERE institution IS NOT NULL;

-- ==================== PROPOSALS ====================
-- Table utama untuk proposal kerja sama
CREATE TABLE proposals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  proposal_number VARCHAR(50) UNIQUE, -- Format: KS/UPI/2024/001
  
  -- Basic Info
  initiator initiator_type NOT NULL,
  title VARCHAR(500) NOT NULL,
  partner_name VARCHAR(255) NOT NULL,
  partner_type partner_type NOT NULL,
  
  -- Content
  description TEXT NOT NULL,
  objectives TEXT NOT NULL,
  benefits TEXT NOT NULL,
  scope_of_work TEXT NOT NULL,
  
  -- Timeline & Budget
  duration INTEGER NOT NULL, -- in months
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  budget BIGINT, -- in Rupiah
  
  -- Workflow Status
  status proposal_status DEFAULT 'draft',
  
  -- Relations
  created_by UUID REFERENCES users(id) NOT NULL,
  fakultas VARCHAR(255), -- Fakultas yang ditugaskan
  selected_faculty_by UUID REFERENCES users(id), -- DKUI yang memilih fakultas
  
  -- AI Summary
  ai_summary TEXT,
  ai_summary_generated_at TIMESTAMPTZ,
  
  -- Revision Info
  revision_type revision_type,
  revision_reason TEXT,
  
  -- Tracking Paraf & Tanda Tangan
  biro_hukum_paraf_by UUID REFERENCES users(id),
  biro_hukum_paraf_at TIMESTAMPTZ,
  dkui_paraf_by UUID REFERENCES users(id),
  dkui_paraf_at TIMESTAMPTZ,
  faculty_approval_by UUID REFERENCES users(id),
  faculty_approval_at TIMESTAMPTZ,
  
  mitra_stamp_at TIMESTAMPTZ,
  mitra_signed_by UUID REFERENCES users(id),
  mitra_signed_at TIMESTAMPTZ,
  
  warek_stamp_at TIMESTAMPTZ,
  warek_signed_by UUID REFERENCES users(id),
  warek_signed_at TIMESTAMPTZ,
  
  rektor_stamp_at TIMESTAMPTZ,
  rektor_signed_by UUID REFERENCES users(id),
  rektor_signed_at TIMESTAMPTZ,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  submitted_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  rejected_at TIMESTAMPTZ
);

-- Index untuk performa
CREATE INDEX idx_proposals_status ON proposals(status);
CREATE INDEX idx_proposals_created_by ON proposals(created_by);
CREATE INDEX idx_proposals_fakultas ON proposals(fakultas) WHERE fakultas IS NOT NULL;
CREATE INDEX idx_proposals_created_at ON proposals(created_at DESC);
CREATE INDEX idx_proposals_proposal_number ON proposals(proposal_number) WHERE proposal_number IS NOT NULL;

-- ==================== DOCUMENTS ====================
-- Table untuk menyimpan metadata dokumen
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  proposal_id UUID REFERENCES proposals(id) ON DELETE CASCADE NOT NULL,
  
  -- Document Info
  name VARCHAR(255) NOT NULL,
  type VARCHAR(100) NOT NULL, -- MIME type
  size BIGINT NOT NULL, -- in bytes
  storage_path TEXT NOT NULL, -- Path di Supabase Storage
  url TEXT, -- Public URL jika applicable
  
  -- Document Category
  category VARCHAR(50) NOT NULL, -- 'initial', 'revision', 'legal', 'signed', 'final', 'archived'
  
  -- Upload Info
  uploaded_by UUID REFERENCES users(id) NOT NULL,
  uploaded_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Metadata
  description TEXT,
  version INTEGER DEFAULT 1,
  is_current BOOLEAN DEFAULT TRUE
);

-- Index untuk performa
CREATE INDEX idx_documents_proposal_id ON documents(proposal_id);
CREATE INDEX idx_documents_category ON documents(category);
CREATE INDEX idx_documents_uploaded_by ON documents(uploaded_by);

-- ==================== APPROVAL HISTORY ====================
-- Table untuk tracking semua approval dan aksi dalam workflow
CREATE TABLE approval_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  proposal_id UUID REFERENCES proposals(id) ON DELETE CASCADE NOT NULL,
  
  -- Action Info
  action approval_action NOT NULL,
  
  -- Actor Info
  actor_id UUID REFERENCES users(id) NOT NULL,
  actor_name VARCHAR(255) NOT NULL,
  actor_role user_role NOT NULL,
  
  -- Details
  comment TEXT,
  
  -- Document Reference (jika ada upload)
  document_id UUID REFERENCES documents(id),
  
  -- Timestamp
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  
  -- Metadata
  metadata JSONB -- untuk data tambahan yang fleksibel
);

-- Index untuk performa
CREATE INDEX idx_approval_history_proposal_id ON approval_history(proposal_id);
CREATE INDEX idx_approval_history_actor_id ON approval_history(actor_id);
CREATE INDEX idx_approval_history_timestamp ON approval_history(timestamp DESC);
CREATE INDEX idx_approval_history_action ON approval_history(action);

-- ==================== EMAIL NOTIFICATIONS ====================
-- Table untuk tracking email yang dikirim
CREATE TABLE email_notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Recipient Info
  recipient_email VARCHAR(255) NOT NULL,
  recipient_name VARCHAR(255),
  recipient_user_id UUID REFERENCES users(id),
  
  -- Email Info
  subject VARCHAR(500) NOT NULL,
  body TEXT NOT NULL,
  template_name VARCHAR(100), -- nama template yang digunakan
  
  -- Related Data
  proposal_id UUID REFERENCES proposals(id),
  
  -- Status
  status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'sent', 'failed', 'bounced'
  sent_at TIMESTAMPTZ,
  failed_at TIMESTAMPTZ,
  error_message TEXT,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB
);

-- Index untuk performa
CREATE INDEX idx_email_notifications_recipient_email ON email_notifications(recipient_email);
CREATE INDEX idx_email_notifications_status ON email_notifications(status);
CREATE INDEX idx_email_notifications_proposal_id ON email_notifications(proposal_id);
CREATE INDEX idx_email_notifications_created_at ON email_notifications(created_at DESC);

-- ==================== USER INVITATIONS ====================
-- Table untuk invite user baru (khususnya mitra)
CREATE TABLE user_invitations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Invitation Info
  email VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  role user_role NOT NULL,
  institution VARCHAR(255),
  
  -- Token untuk verifikasi
  token VARCHAR(255) UNIQUE NOT NULL,
  
  -- Related Proposal (jika invitation dari proposal baru)
  proposal_id UUID REFERENCES proposals(id),
  
  -- Status
  status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'accepted', 'expired'
  invited_by UUID REFERENCES users(id) NOT NULL,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '7 days'),
  accepted_at TIMESTAMPTZ,
  
  -- Credentials (sementara, untuk email)
  temp_password TEXT -- akan di-hash saat user pertama login
);

-- Index untuk performa
CREATE INDEX idx_user_invitations_email ON user_invitations(email);
CREATE INDEX idx_user_invitations_token ON user_invitations(token);
CREATE INDEX idx_user_invitations_status ON user_invitations(status);

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Function untuk auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger untuk users table
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger untuk proposals table
CREATE TRIGGER update_proposals_updated_at
  BEFORE UPDATE ON proposals
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function untuk generate proposal number
CREATE OR REPLACE FUNCTION generate_proposal_number()
RETURNS TRIGGER AS $$
DECLARE
  year_str VARCHAR(4);
  seq_num INTEGER;
  new_number VARCHAR(50);
BEGIN
  -- Hanya generate jika belum ada dan status submitted
  IF NEW.proposal_number IS NULL AND NEW.status = 'submitted' THEN
    year_str := TO_CHAR(NOW(), 'YYYY');
    
    -- Get next sequence number untuk tahun ini
    SELECT COALESCE(MAX(
      CAST(SUBSTRING(proposal_number FROM '\d+$') AS INTEGER)
    ), 0) + 1 INTO seq_num
    FROM proposals
    WHERE proposal_number LIKE 'KS/UPI/' || year_str || '/%';
    
    -- Format: KS/UPI/2024/001
    new_number := 'KS/UPI/' || year_str || '/' || LPAD(seq_num::TEXT, 3, '0');
    NEW.proposal_number := new_number;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger untuk auto-generate proposal number
CREATE TRIGGER generate_proposal_number_trigger
  BEFORE INSERT OR UPDATE ON proposals
  FOR EACH ROW
  EXECUTE FUNCTION generate_proposal_number();

-- Function untuk auto-set timestamps berdasarkan status
CREATE OR REPLACE FUNCTION update_proposal_timestamps()
RETURNS TRIGGER AS $$
BEGIN
  -- Set submitted_at saat status jadi submitted
  IF NEW.status = 'submitted' AND OLD.status != 'submitted' THEN
    NEW.submitted_at := NOW();
  END IF;
  
  -- Set completed_at saat status jadi completed
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    NEW.completed_at := NOW();
  END IF;
  
  -- Set rejected_at saat status jadi rejected
  IF NEW.status = 'rejected' AND OLD.status != 'rejected' THEN
    NEW.rejected_at := NOW();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger untuk auto-update timestamps
CREATE TRIGGER update_proposal_timestamps_trigger
  BEFORE UPDATE ON proposals
  FOR EACH ROW
  EXECUTE FUNCTION update_proposal_timestamps();

-- ============================================
-- ROW LEVEL SECURITY (RLS) - DISABLED
-- ============================================
-- RLS dinonaktifkan untuk simplifikasi development
-- Security akan dihandle di application layer

-- NOTE: Jika ingin enable RLS di production, uncomment baris berikut:
-- ALTER TABLE users ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE proposals ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE approval_history ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE email_notifications ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE user_invitations ENABLE ROW LEVEL SECURITY;

-- ============================================
-- VIEWS
-- ============================================

-- View untuk dashboard statistics
CREATE OR REPLACE VIEW proposal_statistics AS
SELECT
  status,
  COUNT(*) AS count,
  COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '30 days') AS count_last_30_days,
  COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '7 days') AS count_last_7_days
FROM proposals
GROUP BY status;

-- View untuk proposal dengan detail lengkap
CREATE OR REPLACE VIEW proposals_with_details AS
SELECT
  p.*,
  u.name AS created_by_name,
  u.role AS created_by_role,
  u.institution AS created_by_institution,
  COUNT(DISTINCT d.id) AS document_count,
  COUNT(DISTINCT ah.id) AS approval_history_count
FROM proposals p
LEFT JOIN users u ON p.created_by = u.id
LEFT JOIN documents d ON p.id = d.proposal_id
LEFT JOIN approval_history ah ON p.id = ah.proposal_id
GROUP BY p.id, u.name, u.role, u.institution;

-- ============================================
-- INITIAL DATA (Optional)
-- ============================================

-- Insert default DKUI admin user
-- Password: "admin123" (harus diganti setelah first login)
INSERT INTO users (id, email, password_hash, name, role, is_active, email_verified)
VALUES (
  uuid_generate_v4(),
  'dkui@upi.edu',
  crypt('admin123', gen_salt('bf')),
  'Administrator DKUI',
  'dkui',
  true,
  true
) ON CONFLICT (email) DO NOTHING;

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON TABLE users IS 'Menyimpan data user sistem (mitra, fakultas, dkui, biro hukum, wakil rektor, rektor)';
COMMENT ON TABLE proposals IS 'Table utama untuk proposal kerja sama, mengikuti BPMN workflow';
COMMENT ON TABLE documents IS 'Menyimpan metadata dokumen yang di-upload (file fisik di Supabase Storage)';
COMMENT ON TABLE approval_history IS 'Tracking semua approval dan action dalam workflow proposal';
COMMENT ON TABLE email_notifications IS 'Tracking email yang dikirim ke user';
COMMENT ON TABLE user_invitations IS 'Menyimpan invitation untuk user baru (terutama mitra)';

COMMENT ON COLUMN proposals.status IS 'Status proposal mengikuti BPMN workflow diagram';
COMMENT ON COLUMN proposals.proposal_number IS 'Auto-generated saat status = submitted. Format: KS/UPI/YYYY/XXX';
COMMENT ON COLUMN documents.category IS 'Kategori dokumen: initial, revision, legal, signed, final, archived';
COMMENT ON COLUMN email_notifications.template_name IS 'Nama template email yang digunakan untuk tracking';
