-- ============================================
-- EMAIL NOTIFICATION TEMPLATES
-- ============================================
-- Template email untuk berbagai notifikasi dalam sistem

-- Table untuk menyimpan email templates
CREATE TABLE email_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) UNIQUE NOT NULL,
  subject VARCHAR(500) NOT NULL,
  body_html TEXT NOT NULL,
  body_text TEXT NOT NULL,
  description TEXT,
  variables JSONB, -- List of available variables
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;

-- Policy: Semua dapat membaca templates
CREATE POLICY "Anyone can read email templates"
  ON email_templates FOR SELECT
  USING (true);

-- Policy: Hanya DKUI dapat update templates
CREATE POLICY "DKUI can update email templates"
  ON email_templates FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id::text = auth.uid()::text
      AND role = 'dkui'
    )
  );

-- ============================================
-- INSERT EMAIL TEMPLATES
-- ============================================

-- Template 1: Welcome Email untuk Mitra Baru
INSERT INTO email_templates (name, subject, body_html, body_text, description, variables)
VALUES (
  'mitra_welcome',
  'Selamat Datang di Sistem Kerja Sama UPI',
  '<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .header { background: #e10000; color: white; padding: 20px; text-align: center; }
    .content { padding: 20px; }
    .credentials { background: #f4f4f4; padding: 15px; border-radius: 5px; margin: 20px 0; }
    .button { background: #e10000; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 10px 0; }
    .footer { background: #f4f4f4; padding: 15px; text-align: center; font-size: 12px; color: #666; }
  </style>
</head>
<body>
  <div class="header">
    <h1>Universitas Pendidikan Indonesia</h1>
    <p>Sistem e-Contract Kerja Sama</p>
  </div>
  
  <div class="content">
    <h2>Selamat Datang, {{partner_name}}!</h2>
    
    <p>Proposal kerja sama Anda <strong>"{{proposal_title}}"</strong> telah diterima oleh Divisi Kerja Sama Universitas Indonesia (DKUI) UPI.</p>
    
    <p>Kami telah membuatkan akun dashboard untuk Anda agar dapat memantau progress proposal secara real-time.</p>
    
    <div class="credentials">
      <h3>🔐 Kredensial Login Anda:</h3>
      <p><strong>Email:</strong> {{email}}</p>
      <p><strong>Password Sementara:</strong> {{temp_password}}</p>
      <p><strong>Link Dashboard:</strong> <a href="{{dashboard_url}}">{{dashboard_url}}</a></p>
    </div>
    
    <p><strong>⚠️ Penting:</strong></p>
    <ul>
      <li>Harap segera login dan ubah password Anda</li>
      <li>Password sementara akan hangus dalam 7 hari</li>
      <li>Jangan bagikan kredensial Anda kepada siapapun</li>
    </ul>
    
    <a href="{{dashboard_url}}" class="button">Akses Dashboard</a>
    
    <h3>📋 Status Proposal Anda:</h3>
    <p>Proposal Anda saat ini berstatus: <strong>{{proposal_status}}</strong></p>
    <p>Nomor Proposal: <strong>{{proposal_number}}</strong></p>
    
    <p>Anda dapat memantau perkembangan proposal melalui dashboard kapan saja.</p>
    
    <p>Jika ada pertanyaan, silakan hubungi kami di:</p>
    <ul>
      <li>Email: dkui@upi.edu</li>
      <li>Telepon: (022) 1234567</li>
    </ul>
    
    <p>Terima kasih atas kerja sama Anda!</p>
    
    <p>Salam,<br><strong>Tim DKUI UPI</strong></p>
  </div>
  
  <div class="footer">
    <p>&copy; 2026 Universitas Pendidikan Indonesia. All rights reserved.</p>
    <p>Email ini dikirim otomatis oleh sistem. Mohon jangan balas email ini.</p>
  </div>
</body>
</html>',
  'Selamat Datang di Sistem Kerja Sama UPI

{{partner_name}},

Proposal kerja sama Anda "{{proposal_title}}" telah diterima oleh DKUI UPI.

Kredensial Login:
- Email: {{email}}
- Password Sementara: {{temp_password}}
- Dashboard: {{dashboard_url}}

Harap segera login dan ubah password Anda.

Status Proposal: {{proposal_status}}
Nomor Proposal: {{proposal_number}}

Kontak:
- Email: dkui@upi.edu
- Telepon: (022) 1234567

Terima kasih!

Tim DKUI UPI',
  'Email selamat datang untuk mitra baru dengan kredensial akun',
  '{"partner_name": "Nama partner", "proposal_title": "Judul proposal", "email": "Email user", "temp_password": "Password sementara", "dashboard_url": "URL dashboard", "proposal_status": "Status proposal", "proposal_number": "Nomor proposal"}'::jsonb
);

-- Template 2: Notifikasi Revisi Diperlukan ke Mitra
INSERT INTO email_templates (name, subject, body_html, body_text, description, variables)
VALUES (
  'mitra_revision_required',
  'Revisi Diperlukan - {{proposal_title}}',
  '<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .header { background: #e10000; color: white; padding: 20px; text-align: center; }
    .content { padding: 20px; }
    .alert { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
    .feedback { background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0; }
    .button { background: #e10000; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 10px 0; }
    .footer { background: #f4f4f4; padding: 15px; text-align: center; font-size: 12px; color: #666; }
  </style>
</head>
<body>
  <div class="header">
    <h1>Universitas Pendidikan Indonesia</h1>
    <p>Sistem e-Contract Kerja Sama</p>
  </div>
  
  <div class="content">
    <h2>Revisi Diperlukan</h2>
    
    <div class="alert">
      <h3>⚠️ Proposal Memerlukan Revisi</h3>
      <p>Proposal <strong>"{{proposal_title}}"</strong> ({{proposal_number}}) memerlukan revisi dari pihak Anda.</p>
    </div>
    
    <h3>📝 Feedback dari Tim:</h3>
    <div class="feedback">
      <p><strong>Dari:</strong> {{reviewer_name}} ({{reviewer_role}})</p>
      <p><strong>Tanggal:</strong> {{feedback_date}}</p>
      <p><strong>Catatan:</strong></p>
      <p>{{feedback_comment}}</p>
    </div>
    
    <h3>Langkah Selanjutnya:</h3>
    <ol>
      <li>Login ke dashboard Anda</li>
      <li>Buka halaman detail proposal</li>
      <li>Review feedback yang diberikan</li>
      <li>Lakukan revisi sesuai arahan</li>
      <li>Upload dokumen revisi melalui dashboard</li>
    </ol>
    
    <a href="{{proposal_url}}" class="button">Lihat Detail & Upload Revisi</a>
    
    <p><strong>Batas Waktu Revisi:</strong> {{deadline}}</p>
    
    <p>Jika ada pertanyaan mengenai feedback, silakan hubungi:</p>
    <ul>
      <li>Email: {{reviewer_email}}</li>
      <li>Telepon: (022) 1234567</li>
    </ul>
    
    <p>Terima kasih atas perhatian dan kerja sama Anda!</p>
    
    <p>Salam,<br><strong>Tim DKUI UPI</strong></p>
  </div>
  
  <div class="footer">
    <p>&copy; 2026 Universitas Pendidikan Indonesia. All rights reserved.</p>
    <p>Email ini dikirim otomatis oleh sistem. Mohon jangan balas email ini.</p>
  </div>
</body>
</html>',
  'Revisi Diperlukan - {{proposal_title}}

Proposal "{{proposal_title}}" ({{proposal_number}}) memerlukan revisi.

Feedback dari {{reviewer_name}} ({{reviewer_role}}):
{{feedback_comment}}

Batas Waktu: {{deadline}}

Silakan login ke dashboard dan upload dokumen revisi:
{{proposal_url}}

Kontak: {{reviewer_email}}

Terima kasih!
Tim DKUI UPI',
  'Notifikasi ke mitra bahwa proposal perlu direvisi',
  '{"proposal_title": "Judul proposal", "proposal_number": "Nomor proposal", "reviewer_name": "Nama reviewer", "reviewer_role": "Role reviewer", "reviewer_email": "Email reviewer", "feedback_date": "Tanggal feedback", "feedback_comment": "Isi feedback", "deadline": "Batas waktu revisi", "proposal_url": "URL detail proposal"}'::jsonb
);

-- Template 3: Notifikasi Proposal Disetujui
INSERT INTO email_templates (name, subject, body_html, body_text, description, variables)
VALUES (
  'proposal_approved',
  '✅ Proposal Disetujui - {{proposal_title}}',
  '<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .header { background: #28a745; color: white; padding: 20px; text-align: center; }
    .content { padding: 20px; }
    .success { background: #d4edda; border-left: 4px solid #28a745; padding: 15px; margin: 20px 0; }
    .details { background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0; }
    .button { background: #28a745; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 10px 0; }
    .footer { background: #f4f4f4; padding: 15px; text-align: center; font-size: 12px; color: #666; }
  </style>
</head>
<body>
  <div class="header">
    <h1>✅ Selamat!</h1>
    <p>Proposal Anda Telah Disetujui</p>
  </div>
  
  <div class="content">
    <h2>Kabar Baik!</h2>
    
    <div class="success">
      <h3>🎉 Proposal Disetujui</h3>
      <p>Proposal <strong>"{{proposal_title}}"</strong> ({{proposal_number}}) telah disetujui oleh {{approver_name}} ({{approver_role}}).</p>
    </div>
    
    <h3>📋 Detail Approval:</h3>
    <div class="details">
      <p><strong>Disetujui oleh:</strong> {{approver_name}}</p>
      <p><strong>Jabatan:</strong> {{approver_role}}</p>
      <p><strong>Tanggal:</strong> {{approval_date}}</p>
      <p><strong>Status Saat Ini:</strong> {{current_status}}</p>
    </div>
    
    <h3>Langkah Selanjutnya:</h3>
    <p>{{next_steps}}</p>
    
    <a href="{{proposal_url}}" class="button">Lihat Detail Proposal</a>
    
    <p>Anda dapat memantau progress selanjutnya melalui dashboard.</p>
    
    <p>Terima kasih atas kesabaran dan kerja sama Anda!</p>
    
    <p>Salam,<br><strong>Tim DKUI UPI</strong></p>
  </div>
  
  <div class="footer">
    <p>&copy; 2026 Universitas Pendidikan Indonesia. All rights reserved.</p>
  </div>
</body>
</html>',
  '✅ Proposal Disetujui

{{partner_name}},

Proposal "{{proposal_title}}" ({{proposal_number}}) telah disetujui oleh {{approver_name}} ({{approver_role}}).

Tanggal: {{approval_date}}
Status: {{current_status}}

Langkah Selanjutnya:
{{next_steps}}

Lihat detail: {{proposal_url}}

Terima kasih!
Tim DKUI UPI',
  'Notifikasi approval proposal ke mitra',
  '{"partner_name": "Nama partner", "proposal_title": "Judul proposal", "proposal_number": "Nomor proposal", "approver_name": "Nama yang approve", "approver_role": "Role yang approve", "approval_date": "Tanggal approval", "current_status": "Status saat ini", "next_steps": "Langkah selanjutnya", "proposal_url": "URL proposal"}'::jsonb
);

-- Template 4: Notifikasi Proposal Ditolak
INSERT INTO email_templates (name, subject, body_html, body_text, description, variables)
VALUES (
  'proposal_rejected',
  '❌ Proposal Ditolak - {{proposal_title}}',
  '<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .header { background: #dc3545; color: white; padding: 20px; text-align: center; }
    .content { padding: 20px; }
    .danger { background: #f8d7da; border-left: 4px solid #dc3545; padding: 15px; margin: 20px 0; }
    .reason { background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0; }
    .button { background: #e10000; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 10px 0; }
    .footer { background: #f4f4f4; padding: 15px; text-align: center; font-size: 12px; color: #666; }
  </style>
</head>
<body>
  <div class="header">
    <h1>Pemberitahuan Penolakan Proposal</h1>
  </div>
  
  <div class="content">
    <h2>Pemberitahuan Penting</h2>
    
    <div class="danger">
      <h3>❌ Proposal Ditolak</h3>
      <p>Proposal <strong>"{{proposal_title}}"</strong> ({{proposal_number}}) tidak dapat dilanjutkan.</p>
    </div>
    
    <h3>📋 Alasan Penolakan:</h3>
    <div class="reason">
      <p><strong>Dari:</strong> {{rejector_name}} ({{rejector_role}})</p>
      <p><strong>Tanggal:</strong> {{rejection_date}}</p>
      <p><strong>Alasan:</strong></p>
      <p>{{rejection_reason}}</p>
    </div>
    
    <p>Kami menghargai waktu dan upaya yang telah Anda berikan dalam menyusun proposal ini.</p>
    
    <h3>Opsi Selanjutnya:</h3>
    <ul>
      <li>Anda dapat mengajukan proposal baru dengan penyesuaian berdasarkan feedback</li>
      <li>Hubungi kami untuk diskusi lebih lanjut mengenai kemungkinan kerja sama</li>
    </ul>
    
    <a href="{{proposal_url}}" class="button">Lihat Detail</a>
    
    <p>Jika ada pertanyaan, silakan hubungi:</p>
    <ul>
      <li>Email: dkui@upi.edu</li>
      <li>Telepon: (022) 1234567</li>
    </ul>
    
    <p>Terima kasih atas pengertian Anda.</p>
    
    <p>Salam,<br><strong>Tim DKUI UPI</strong></p>
  </div>
  
  <div class="footer">
    <p>&copy; 2026 Universitas Pendidikan Indonesia. All rights reserved.</p>
  </div>
</body>
</html>',
  '❌ Proposal Ditolak

{{partner_name}},

Proposal "{{proposal_title}}" ({{proposal_number}}) tidak dapat dilanjutkan.

Alasan dari {{rejector_name}} ({{rejector_role}}):
{{rejection_reason}}

Tanggal: {{rejection_date}}

Anda dapat mengajukan proposal baru dengan penyesuaian.

Lihat detail: {{proposal_url}}

Kontak: dkui@upi.edu

Terima kasih.
Tim DKUI UPI',
  'Notifikasi penolakan final proposal',
  '{"partner_name": "Nama partner", "proposal_title": "Judul proposal", "proposal_number": "Nomor proposal", "rejector_name": "Nama yang menolak", "rejector_role": "Role yang menolak", "rejection_date": "Tanggal penolakan", "rejection_reason": "Alasan penolakan", "proposal_url": "URL proposal"}'::jsonb
);

-- Template 5: Notifikasi Status Update
INSERT INTO email_templates (name, subject, body_html, body_text, description, variables)
VALUES (
  'status_update',
  '🔄 Update Status Proposal - {{proposal_title}}',
  '<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .header { background: #007bff; color: white; padding: 20px; text-align: center; }
    .content { padding: 20px; }
    .info { background: #d1ecf1; border-left: 4px solid #0c5460; padding: 15px; margin: 20px 0; }
    .timeline { background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0; }
    .button { background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 10px 0; }
    .footer { background: #f4f4f4; padding: 15px; text-align: center; font-size: 12px; color: #666; }
  </style>
</head>
<body>
  <div class="header">
    <h1>Update Status Proposal</h1>
  </div>
  
  <div class="content">
    <h2>Pemberitahuan Progress</h2>
    
    <div class="info">
      <h3>🔄 Status Berubah</h3>
      <p>Proposal <strong>"{{proposal_title}}"</strong> ({{proposal_number}}) telah mengalami perubahan status.</p>
    </div>
    
    <div class="timeline">
      <p><strong>Status Sebelumnya:</strong> {{old_status}}</p>
      <p><strong>Status Saat Ini:</strong> {{new_status}}</p>
      <p><strong>Diupdate oleh:</strong> {{updated_by}} ({{updated_by_role}})</p>
      <p><strong>Tanggal:</strong> {{update_date}}</p>
      <p><strong>Catatan:</strong> {{update_comment}}</p>
    </div>
    
    <h3>Informasi:</h3>
    <p>{{additional_info}}</p>
    
    <a href="{{proposal_url}}" class="button">Pantau Progress</a>
    
    <p>Anda akan terus mendapatkan update via email setiap ada perubahan status.</p>
    
    <p>Salam,<br><strong>Tim DKUI UPI</strong></p>
  </div>
  
  <div class="footer">
    <p>&copy; 2026 Universitas Pendidikan Indonesia. All rights reserved.</p>
  </div>
</body>
</html>',
  '🔄 Update Status Proposal

{{partner_name}},

Proposal "{{proposal_title}}" ({{proposal_number}}) telah diupdate.

Status: {{old_status}} → {{new_status}}
Diupdate oleh: {{updated_by}} ({{updated_by_role}})
Tanggal: {{update_date}}

Catatan: {{update_comment}}

Info: {{additional_info}}

Pantau: {{proposal_url}}

Tim DKUI UPI',
  'Notifikasi umum untuk update status proposal',
  '{"partner_name": "Nama partner", "proposal_title": "Judul proposal", "proposal_number": "Nomor proposal", "old_status": "Status lama", "new_status": "Status baru", "updated_by": "Nama yang update", "updated_by_role": "Role yang update", "update_date": "Tanggal update", "update_comment": "Catatan update", "additional_info": "Info tambahan", "proposal_url": "URL proposal"}'::jsonb
);

-- Template 6: Reminder untuk Action yang Diperlukan
INSERT INTO email_templates (name, subject, body_html, body_text, description, variables)
VALUES (
  'action_reminder',
  '⏰ Reminder: Action Diperlukan - {{proposal_title}}',
  '<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .header { background: #ffc107; color: #333; padding: 20px; text-align: center; }
    .content { padding: 20px; }
    .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
    .action { background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0; }
    .button { background: #ffc107; color: #333; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 10px 0; font-weight: bold; }
    .footer { background: #f4f4f4; padding: 15px; text-align: center; font-size: 12px; color: #666; }
  </style>
</head>
<body>
  <div class="header">
    <h1>⏰ Reminder</h1>
    <p>Action Diperlukan</p>
  </div>
  
  <div class="content">
    <h2>Perhatian!</h2>
    
    <div class="warning">
      <h3>⏰ Tindakan Diperlukan</h3>
      <p>Proposal <strong>"{{proposal_title}}"</strong> ({{proposal_number}}) memerlukan tindakan dari Anda.</p>
    </div>
    
    <div class="action">
      <p><strong>Action yang Diperlukan:</strong> {{required_action}}</p>
      <p><strong>Batas Waktu:</strong> {{deadline}}</p>
      <p><strong>Waktu Tersisa:</strong> {{time_remaining}}</p>
    </div>
    
    <p>Mohon segera melakukan tindakan yang diperlukan untuk melanjutkan proses proposal.</p>
    
    <a href="{{proposal_url}}" class="button">Lakukan Action Sekarang</a>
    
    <p>Jika Anda memerlukan bantuan atau memiliki pertanyaan, silakan hubungi kami.</p>
    
    <p>Terima kasih atas perhatian Anda!</p>
    
    <p>Salam,<br><strong>Tim DKUI UPI</strong></p>
  </div>
  
  <div class="footer">
    <p>&copy; 2026 Universitas Pendidikan Indonesia. All rights reserved.</p>
  </div>
</body>
</html>',
  '⏰ Reminder: Action Diperlukan

{{partner_name}},

Proposal "{{proposal_title}}" ({{proposal_number}}) memerlukan tindakan dari Anda.

Action: {{required_action}}
Deadline: {{deadline}}
Waktu Tersisa: {{time_remaining}}

Segera lakukan action di: {{proposal_url}}

Terima kasih!
Tim DKUI UPI',
  'Email reminder untuk action yang diperlukan',
  '{"partner_name": "Nama partner", "proposal_title": "Judul proposal", "proposal_number": "Nomor proposal", "required_action": "Action yang diperlukan", "deadline": "Batas waktu", "time_remaining": "Waktu tersisa", "proposal_url": "URL proposal"}'::jsonb
);

-- Trigger untuk auto-update updated_at
CREATE TRIGGER update_email_templates_updated_at
  BEFORE UPDATE ON email_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- HELPER FUNCTION untuk render email template
-- ============================================

CREATE OR REPLACE FUNCTION render_email_template(
  template_name VARCHAR,
  variables JSONB
)
RETURNS TABLE (
  subject TEXT,
  body_html TEXT,
  body_text TEXT
) AS $$
DECLARE
  template RECORD;
  rendered_subject TEXT;
  rendered_html TEXT;
  rendered_text TEXT;
  var_key TEXT;
  var_value TEXT;
BEGIN
  -- Get template
  SELECT * INTO template
  FROM email_templates
  WHERE name = template_name;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Template % not found', template_name;
  END IF;
  
  -- Initialize with template content
  rendered_subject := template.subject;
  rendered_html := template.body_html;
  rendered_text := template.body_text;
  
  -- Replace variables
  FOR var_key, var_value IN SELECT * FROM jsonb_each_text(variables)
  LOOP
    rendered_subject := REPLACE(rendered_subject, '{{' || var_key || '}}', var_value);
    rendered_html := REPLACE(rendered_html, '{{' || var_key || '}}', var_value);
    rendered_text := REPLACE(rendered_text, '{{' || var_key || '}}', var_value);
  END LOOP;
  
  RETURN QUERY SELECT rendered_subject, rendered_html, rendered_text;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- EXAMPLE USAGE
-- ============================================
-- 
-- SELECT * FROM render_email_template(
--   'mitra_welcome',
--   '{"partner_name": "PT ABC", "proposal_title": "Kerja Sama Penelitian", "email": "abc@example.com", "temp_password": "Pass123!", "dashboard_url": "https://econtract.upi.edu/dashboard", "proposal_status": "Diterima", "proposal_number": "KS/UPI/2024/001"}'::jsonb
-- );
