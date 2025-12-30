-- Schema untuk University Cooperation System
-- Jalankan script ini di Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create ENUM types
CREATE TYPE user_role AS ENUM ('mitra', 'fakultas', 'dkui', 'biro_hukum', 'warek', 'rektor');
CREATE TYPE proposal_status AS ENUM ('draft', 'submitted', 'ai_summary', 'verifikasi_substansi', 'review_dkui', 'review_hukum', 'paraf_hukum', 'paraf_dkui', 'paraf_fakultas', 'review_warek', 'materai_warek', 'tte_warek', 'review_rektor', 'materai_rektor', 'tte_rektor', 'review_mitra_final', 'materai_mitra', 'tte_mitra', 'pertukaran_dokumen', 'arsip', 'revision_by_mitra', 'revision_by_dkui', 'rejected', 'completed');
CREATE TYPE review_status AS ENUM ('pending', 'approved', 'revision_required', 'rejected');
CREATE TYPE revision_type AS ENUM ('administrative', 'legal');
CREATE TYPE signature_status AS ENUM ('pending', 'completed');
CREATE TYPE document_type AS ENUM ('MOU', 'MOA', 'IA', 'PKS');
CREATE TYPE revisi_source AS ENUM ('mitra', 'dkui');

-- Table: users
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    role user_role NOT NULL,
    organization VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: proposals
CREATE TABLE proposals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(500) NOT NULL,
    description TEXT NOT NULL,
    partner_name VARCHAR(255) NOT NULL,
    partner_email VARCHAR(255) NOT NULL,
    cooperation_type VARCHAR(100) NOT NULL,
    document_type document_type NOT NULL,
    status proposal_status DEFAULT 'draft',
    current_stage VARCHAR(100) DEFAULT 'submission',
    submitted_by UUID REFERENCES users(id) ON DELETE CASCADE,
    assigned_faculty UUID REFERENCES users(id) ON DELETE SET NULL,
    ai_summary TEXT,
    document_url TEXT,
    
    -- Tracking untuk parallel gateway (TTE Mitra & TTE Rektor)
    parallel_tte_mitra_completed BOOLEAN DEFAULT FALSE,
    parallel_tte_rektor_completed BOOLEAN DEFAULT FALSE,
    
    -- Tracking materai
    materai_warek_url TEXT,
    materai_rektor_url TEXT,
    materai_mitra_url TEXT,
    
    -- Tracking revisi
    revision_source revisi_source,
    revision_count INTEGER DEFAULT 0,
    last_revision_feedback TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: reviews
CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    proposal_id UUID REFERENCES proposals(id) ON DELETE CASCADE,
    reviewer_id UUID REFERENCES users(id) ON DELETE CASCADE,
    reviewer_role user_role NOT NULL,
    stage VARCHAR(100) NOT NULL,
    status review_status DEFAULT 'pending',
    comments TEXT,
    revision_type revision_type,
    revised_document_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: notifications
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    proposal_id UUID REFERENCES proposals(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: activity_logs
CREATE TABLE activity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    proposal_id UUID REFERENCES proposals(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    action VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: signatures
CREATE TABLE signatures (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    proposal_id UUID REFERENCES proposals(id) ON DELETE CASCADE,
    signer_id UUID REFERENCES users(id) ON DELETE CASCADE,
    signer_role user_role NOT NULL,
    signature_url TEXT,
    stamp_url TEXT,
    signed_at TIMESTAMP WITH TIME ZONE,
    status signature_status DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_proposals_submitted_by ON proposals(submitted_by);
CREATE INDEX idx_proposals_status ON proposals(status);
CREATE INDEX idx_proposals_current_stage ON proposals(current_stage);
CREATE INDEX idx_reviews_proposal_id ON reviews(proposal_id);
CREATE INDEX idx_reviews_reviewer_id ON reviews(reviewer_id);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(read);
CREATE INDEX idx_activity_logs_proposal_id ON activity_logs(proposal_id);
CREATE INDEX idx_signatures_proposal_id ON signatures(proposal_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to send email notification via Supabase (placeholder for Edge Function)
CREATE OR REPLACE FUNCTION notify_proposal_status_change()
RETURNS TRIGGER AS $$
DECLARE
    recipient_email TEXT;
    notification_title TEXT;
    notification_message TEXT;
    recipient_id UUID;
BEGIN
    -- Determine recipient based on new status
    IF NEW.status IN ('submitted', 'revision_by_mitra') THEN
        -- Notifikasi ke DKUI dan Fakultas
        INSERT INTO notifications (user_id, proposal_id, type, title, message)
        SELECT id, NEW.id, 'status_change', 
               'Proposal Baru: ' || NEW.title,
               'Proposal dari ' || NEW.partner_name || ' telah disubmit dan menunggu review.'
        FROM users WHERE role IN ('dkui', 'fakultas');
        
    ELSIF NEW.status = 'review_dkui' THEN
        -- Notifikasi ke DKUI
        INSERT INTO notifications (user_id, proposal_id, type, title, message)
        SELECT id, NEW.id, 'review_required',
               'Review Diperlukan: ' || NEW.title,
               'Proposal memerlukan review dari DKUI.'
        FROM users WHERE role = 'dkui';
        
    ELSIF NEW.status = 'review_hukum' THEN
        -- Notifikasi ke Biro Hukum
        INSERT INTO notifications (user_id, proposal_id, type, title, message)
        SELECT id, NEW.id, 'review_required',
               'Review Hukum Diperlukan: ' || NEW.title,
               'Proposal memerlukan review legalitas dari Biro Hukum.'
        FROM users WHERE role = 'biro_hukum';
        
    ELSIF NEW.status = 'review_warek' THEN
        -- Notifikasi ke Warek
        INSERT INTO notifications (user_id, proposal_id, type, title, message)
        SELECT id, NEW.id, 'approval_required',
               'Persetujuan Diperlukan: ' || NEW.title,
               'Proposal memerlukan persetujuan dari Wakil Rektor.'
        FROM users WHERE role = 'warek';
        
    ELSIF NEW.status = 'review_rektor' THEN
        -- Notifikasi ke Rektor
        INSERT INTO notifications (user_id, proposal_id, type, title, message)
        SELECT id, NEW.id, 'approval_required',
               'Persetujuan Final Diperlukan: ' || NEW.title,
               'Proposal memerlukan persetujuan final dari Rektor.'
        FROM users WHERE role = 'rektor';
        
    ELSIF NEW.status IN ('revision_by_mitra', 'rejected') THEN
        -- Notifikasi ke Mitra (submitted_by)
        INSERT INTO notifications (user_id, proposal_id, type, title, message)
        VALUES (NEW.submitted_by, NEW.id, 
                CASE WHEN NEW.status = 'rejected' THEN 'proposal_rejected' ELSE 'revision_required' END,
                CASE WHEN NEW.status = 'rejected' THEN 'Proposal Ditolak' ELSE 'Revisi Diperlukan' END || ': ' || NEW.title,
                COALESCE(NEW.last_revision_feedback, 'Silakan cek detail proposal untuk informasi lebih lanjut.'));
        
    ELSIF NEW.status = 'review_mitra_final' THEN
        -- Notifikasi ke Mitra untuk persetujuan final
        INSERT INTO notifications (user_id, proposal_id, type, title, message)
        VALUES (NEW.submitted_by, NEW.id, 'approval_required',
                'Persetujuan Final Diperlukan: ' || NEW.title,
                'Dokumen final telah siap untuk ditandatangani. Silakan review dan lakukan TTE.');
        
    ELSIF NEW.status = 'completed' THEN
        -- Notifikasi ke semua pihak terkait
        INSERT INTO notifications (user_id, proposal_id, type, title, message)
        SELECT id, NEW.id, 'proposal_completed',
               'Proposal Selesai: ' || NEW.title,
               'Proposal telah selesai diproses dan telah diarsipkan.'
        FROM users WHERE role IN ('dkui', 'fakultas', 'biro_hukum', 'warek', 'rektor')
        UNION ALL
        SELECT NEW.submitted_by, NEW.id, 'proposal_completed',
               'Proposal Selesai: ' || NEW.title,
               'Proposal telah selesai diproses dan telah diarsipkan.';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_proposals_updated_at BEFORE UPDATE ON proposals
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON reviews
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger for email notifications on proposal status change
CREATE TRIGGER trigger_notify_proposal_status_change
    AFTER UPDATE OF status ON proposals
    FOR EACH ROW
    WHEN (OLD.status IS DISTINCT FROM NEW.status)
    EXECUTE FUNCTION notify_proposal_status_change();

-- Row Level Security (RLS) Policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE signatures ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own data
CREATE POLICY "Users can read own data" ON users
    FOR SELECT USING (auth.uid() = id);

-- Policy: Users can update their own data
CREATE POLICY "Users can update own data" ON users
    FOR UPDATE USING (auth.uid() = id);

-- Policy: Mitra can read their own proposals
CREATE POLICY "Mitra can read own proposals" ON proposals
    FOR SELECT USING (
        submitted_by = auth.uid() OR
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('fakultas', 'dkui', 'biro_hukum', 'warek', 'rektor'))
    );

-- Policy: Mitra can insert proposals
CREATE POLICY "Mitra can insert proposals" ON proposals
    FOR INSERT WITH CHECK (submitted_by = auth.uid());

-- Policy: Mitra can update own proposals
CREATE POLICY "Mitra can update own proposals" ON proposals
    FOR UPDATE USING (submitted_by = auth.uid());

-- Policy: Internal users can read all proposals
CREATE POLICY "Internal users read all proposals" ON proposals
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('fakultas', 'dkui', 'biro_hukum', 'warek', 'rektor'))
    );

-- Policy: Users can read reviews for their proposals
CREATE POLICY "Users can read reviews" ON reviews
    FOR SELECT USING (
        reviewer_id = auth.uid() OR
        EXISTS (SELECT 1 FROM proposals WHERE id = reviews.proposal_id AND submitted_by = auth.uid()) OR
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('fakultas', 'dkui', 'biro_hukum', 'warek', 'rektor'))
    );

-- Policy: Reviewers can insert reviews
CREATE POLICY "Reviewers can insert reviews" ON reviews
    FOR INSERT WITH CHECK (reviewer_id = auth.uid());

-- Policy: Users can read their notifications
CREATE POLICY "Users can read own notifications" ON notifications
    FOR SELECT USING (user_id = auth.uid());

-- Policy: Users can update their notifications
CREATE POLICY "Users can update own notifications" ON notifications
    FOR UPDATE USING (user_id = auth.uid());

-- Policy: Users can read activity logs for their proposals
CREATE POLICY "Users can read activity logs" ON activity_logs
    FOR SELECT USING (
        user_id = auth.uid() OR
        EXISTS (SELECT 1 FROM proposals WHERE id = activity_logs.proposal_id AND submitted_by = auth.uid()) OR
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('fakultas', 'dkui', 'biro_hukum', 'warek', 'rektor'))
    );

-- Policy: Users can read signatures
CREATE POLICY "Users can read signatures" ON signatures
    FOR SELECT USING (
        signer_id = auth.uid() OR
        EXISTS (SELECT 1 FROM proposals WHERE id = signatures.proposal_id AND submitted_by = auth.uid()) OR
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('fakultas', 'dkui', 'biro_hukum', 'warek', 'rektor'))
    );

-- Insert sample users untuk testing
INSERT INTO users (id, email, name, role, organization) VALUES
    ('00000000-0000-0000-0000-000000000001', 'mitra@example.com', 'PT. Mitra Sejahtera', 'mitra', 'PT. Mitra Sejahtera'),
    ('00000000-0000-0000-0000-000000000002', 'fakultas@ui.ac.id', 'Dr. Budi Santoso', 'fakultas', 'Fakultas Teknik'),
    ('00000000-0000-0000-0000-000000000003', 'dkui@ui.ac.id', 'Siti Nurhaliza, S.H.', 'dkui', 'DKUI'),
    ('00000000-0000-0000-0000-000000000004', 'hukum@ui.ac.id', 'Ahmad Dahlan, S.H., M.H.', 'biro_hukum', 'Biro Hukum'),
    ('00000000-0000-0000-0000-000000000005', 'warek@ui.ac.id', 'Prof. Dr. Ir. Wahyu Wijaya', 'warek', 'Wakil Rektor'),
    ('00000000-0000-0000-0000-000000000006', 'rektor@ui.ac.id', 'Prof. Dr. Anies Baswedan', 'rektor', 'Rektor UI');

COMMENT ON TABLE users IS 'Tabel pengguna sistem';
COMMENT ON TABLE proposals IS 'Tabel proposal kerja sama';
COMMENT ON TABLE reviews IS 'Tabel review dan persetujuan';
COMMENT ON TABLE notifications IS 'Tabel notifikasi pengguna';
COMMENT ON TABLE activity_logs IS 'Tabel log aktivitas';
COMMENT ON TABLE signatures IS 'Tabel tanda tangan digital';
