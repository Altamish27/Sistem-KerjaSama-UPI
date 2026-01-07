-- ============================================
-- MIGRATION: Public Proposal Submission
-- ============================================
-- Run ini SETELAH schema.sql
-- Menambahkan field untuk support public submission

-- 1. Tambah kolom di table users
ALTER TABLE users ADD COLUMN IF NOT EXISTS account_status TEXT DEFAULT 'pending' CHECK (account_status IN ('pending', 'active', 'suspended'));
ALTER TABLE users ADD COLUMN IF NOT EXISTS invitation_token TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS invitation_expires_at TIMESTAMPTZ;
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_set_at TIMESTAMPTZ;

-- 2. Tambah kolom di table proposals untuk track public submission
ALTER TABLE proposals ADD COLUMN IF NOT EXISTS is_public_submission BOOLEAN DEFAULT false;
ALTER TABLE proposals ADD COLUMN IF NOT EXISTS contact_email TEXT; -- Email mitra yang belum punya akun
ALTER TABLE proposals ADD COLUMN IF NOT EXISTS contact_phone TEXT;
ALTER TABLE proposals ADD COLUMN IF NOT EXISTS contact_person TEXT;

-- 2.1. Make created_by nullable untuk support public submission (belum punya user)
ALTER TABLE proposals ALTER COLUMN created_by DROP NOT NULL;

-- 3. Create index untuk performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_account_status ON users(account_status);
CREATE INDEX IF NOT EXISTS idx_proposals_contact_email ON proposals(contact_email);
CREATE INDEX IF NOT EXISTS idx_proposals_is_public_submission ON proposals(is_public_submission);

-- 4. Function untuk generate invitation token
CREATE OR REPLACE FUNCTION generate_invitation_token()
RETURNS TEXT AS $$
BEGIN
  RETURN encode(gen_random_bytes(32), 'hex');
END;
$$ LANGUAGE plpgsql;

-- 5. Function untuk create user from approved proposal
CREATE OR REPLACE FUNCTION create_user_from_proposal(
  p_proposal_id UUID,
  p_temp_password TEXT
)
RETURNS UUID AS $$
DECLARE
  v_user_id UUID;
  v_email TEXT;
  v_name TEXT;
BEGIN
  -- Get proposal data
  SELECT contact_email, contact_person INTO v_email, v_name
  FROM proposals
  WHERE id = p_proposal_id;
  
  -- Create user if not exists
  INSERT INTO users (email, name, role, unit, account_status, password_set_at)
  VALUES (v_email, v_name, 'partner', NULL, 'active', NOW())
  ON CONFLICT (email) DO UPDATE
  SET account_status = 'active', password_set_at = NOW()
  RETURNING id INTO v_user_id;
  
  -- Update proposal dengan user_id
  UPDATE proposals
  SET created_by = v_user_id, is_public_submission = false
  WHERE id = p_proposal_id;
  
  RETURN v_user_id;
END;
$$ LANGUAGE plpgsql;

-- 6. Add comments
COMMENT ON COLUMN users.account_status IS 'Status akun: pending (belum aktivasi), active (sudah login), suspended';
COMMENT ON COLUMN proposals.is_public_submission IS 'True jika proposal disubmit dari public form (tanpa login)';
COMMENT ON COLUMN proposals.contact_email IS 'Email mitra untuk public submission (sebelum punya akun)';
