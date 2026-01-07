import { Resend } from 'resend'
import { supabaseAdmin } from './supabase/admin'

// ============================================
// EMAIL SERVICE - Resend
// ============================================
// Service untuk mengirim email notifikasi

const resend = new Resend(process.env.RESEND_API_KEY!)

const EMAIL_FROM = process.env.EMAIL_FROM || 'onboarding@resend.dev'
const EMAIL_FROM_NAME = process.env.EMAIL_FROM_NAME || 'DKUI UPI'
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
const DEV_EMAIL_TO = 'hasbiberbagi@gmail.com' // Alihkan semua email ke sini saat development

// ============================================
// SEND EMAIL FUNCTION
// ============================================

interface SendEmailParams {
  to: string
  subject: string
  html: string
  text?: string
  proposalId?: string
  templateName?: string
}

export async function sendEmail({ to, subject, html, text, proposalId, templateName }: SendEmailParams) {
  try {
    // Untuk development, alihkan semua email ke DEV_EMAIL_TO
    const isDevelopment = process.env.NODE_ENV === 'development' || !process.env.RESEND_DOMAIN_VERIFIED
    const actualTo = isDevelopment ? DEV_EMAIL_TO : to
    const actualSubject = isDevelopment ? `[DEV - Original: ${to}] ${subject}` : subject
    
    // Tambahkan info original recipient di HTML jika development
    const actualHtml = isDevelopment 
      ? `<div style="background: #fff3cd; padding: 10px; margin-bottom: 20px; border-left: 4px solid #ffc107;">
           <strong>⚠️ DEVELOPMENT MODE</strong><br/>
           Original recipient: <strong>${to}</strong>
         </div>${html}`
      : html
    
    // Send email via Resend
    const { data, error } = await resend.emails.send({
      from: `${EMAIL_FROM_NAME} <${EMAIL_FROM}>`,
      to: [actualTo],
      subject: actualSubject,
      html: actualHtml,
      text: text || undefined,
    })

    if (error) {
      console.error('Error sending email:', error)

      // Log failed email to database
      await supabaseAdmin.from('email_notifications').insert({
        recipient_email: to,
        subject,
        body: html,
        template_name: templateName,
        proposal_id: proposalId,
        status: 'failed',
        failed_at: new Date().toISOString(),
        error_message: error.message,
      })

      throw error
    }

    // Log successful email to database
    await supabaseAdmin.from('email_notifications').insert({
      recipient_email: to,
      subject,
      body: html,
      template_name: templateName,
      proposal_id: proposalId,
      status: 'sent',
      sent_at: new Date().toISOString(),
    })

    return data
  } catch (error) {
    console.error('Failed to send email:', error)
    throw error
  }
}

// ============================================
// TEMPLATE-BASED EMAIL FUNCTIONS
// ============================================

/**
 * Render email template dengan variables
 */
async function renderTemplate(templateName: string, variables: Record<string, string>) {
  const { data, error } = await supabaseAdmin.rpc('render_email_template', {
    template_name: templateName,
    variables: variables as any,
  })

  if (error || !data || data.length === 0) {
    throw new Error(`Template ${templateName} not found`)
  }

  return data[0]
}

/**
 * Send welcome email ke mitra baru dengan kredensial
 */
export async function sendWelcomeEmail(params: {
  email: string
  partnerName: string
  proposalTitle: string
  proposalNumber: string
  proposalStatus: string
  tempPassword: string
}) {
  const loginUrl = `${APP_URL}/login`
  const dashboardUrl = `${APP_URL}/dashboard`

  const html = `
    <!DOCTYPE html>
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
        <h2>Selamat Datang, ${params.partnerName}!</h2>
        
        <p>Proposal kerja sama Anda <strong>"${params.proposalTitle}"</strong> telah diterima oleh Divisi Kerja Sama Universitas Indonesia (DKUI) UPI.</p>
        
        <p>Kami telah membuatkan akun dashboard untuk Anda agar dapat memantau progress proposal secara real-time.</p>
        
        <div class="credentials">
          <h3>🔐 Kredensial Login Anda:</h3>
          <p><strong>Email:</strong> ${params.email}</p>
          <p><strong>Password Sementara:</strong> <code style="background: #fff; padding: 5px 10px; border-radius: 3px; font-size: 16px;">${params.tempPassword}</code></p>
          <p><strong>Link Login:</strong> <a href="${loginUrl}">${loginUrl}</a></p>
        </div>
        
        <p><strong>⚠️ Penting:</strong></p>
        <ul>
          <li>Harap segera login dan ubah password Anda</li>
          <li>Jangan bagikan kredensial Anda kepada siapapun</li>
          <li>Simpan email ini dengan aman</li>
        </ul>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${loginUrl}" class="button">Login ke Dashboard</a>
        </div>
        
        <h3>📋 Status Proposal Anda:</h3>
        <p>Status: <strong>${params.proposalStatus}</strong></p>
        <p>Nomor Proposal: <strong>${params.proposalNumber}</strong></p>
        
        <p>Anda dapat memantau perkembangan proposal melalui dashboard kapan saja.</p>
        
        <p>Jika ada pertanyaan, silakan hubungi kami di:</p>
        <ul>
          <li>Email: dkui@upi.edu</li>
          <li>Website: <a href="${dashboardUrl}">${dashboardUrl}</a></li>
        </ul>
      </div>
      
      <div class="footer">
        <p>Email ini dikirim secara otomatis oleh sistem. Mohon tidak membalas email ini.</p>
        <p>&copy; ${new Date().getFullYear()} Universitas Pendidikan Indonesia</p>
      </div>
    </body>
    </html>
  `

  const text = `
Selamat Datang, ${params.partnerName}!

Proposal kerja sama Anda "${params.proposalTitle}" telah diterima oleh DKUI UPI.

KREDENSIAL LOGIN ANDA:
Email: ${params.email}
Password Sementara: ${params.tempPassword}
Link Login: ${loginUrl}

PENTING:
- Harap segera login dan ubah password Anda
- Jangan bagikan kredensial kepada siapapun

Status Proposal: ${params.proposalStatus}
Nomor Proposal: ${params.proposalNumber}

Hubungi kami: dkui@upi.edu
  `

  return sendEmail({
    to: params.email,
    subject: '🎉 Akun Dashboard Anda Sudah Siap - Sistem Kerja Sama UPI',
    html,
    text,
    templateName: 'mitra_welcome',
  })
}

/**
 * Send revision required email ke mitra
 */
export async function sendRevisionRequiredEmail(params: {
  email: string
  partnerName: string
  proposalId: string
  proposalTitle: string
  proposalNumber: string
  reviewerName: string
  reviewerRole: string
  reviewerEmail: string
  feedbackComment: string
  deadline: string
}) {
  const template = await renderTemplate('mitra_revision_required', {
    partner_name: params.partnerName,
    proposal_title: params.proposalTitle,
    proposal_number: params.proposalNumber,
    reviewer_name: params.reviewerName,
    reviewer_role: params.reviewerRole,
    reviewer_email: params.reviewerEmail,
    feedback_date: new Date().toLocaleDateString('id-ID'),
    feedback_comment: params.feedbackComment,
    deadline: params.deadline,
    proposal_url: `${APP_URL}/dashboard/proposals/${params.proposalId}`,
  })

  return sendEmail({
    to: params.email,
    subject: template.subject,
    html: template.body_html,
    text: template.body_text,
    proposalId: params.proposalId,
    templateName: 'mitra_revision_required',
  })
}

/**
 * Send proposal approved email
 */
export async function sendProposalApprovedEmail(params: {
  email: string
  partnerName: string
  proposalId: string
  proposalTitle: string
  proposalNumber: string
  approverName: string
  approverRole: string
  currentStatus: string
  nextSteps: string
}) {
  const template = await renderTemplate('proposal_approved', {
    partner_name: params.partnerName,
    proposal_title: params.proposalTitle,
    proposal_number: params.proposalNumber,
    approver_name: params.approverName,
    approver_role: params.approverRole,
    approval_date: new Date().toLocaleDateString('id-ID'),
    current_status: params.currentStatus,
    next_steps: params.nextSteps,
    proposal_url: `${APP_URL}/dashboard/proposals/${params.proposalId}`,
  })

  return sendEmail({
    to: params.email,
    subject: template.subject,
    html: template.body_html,
    text: template.body_text,
    proposalId: params.proposalId,
    templateName: 'proposal_approved',
  })
}

/**
 * Send proposal rejected email
 */
export async function sendProposalRejectedEmail(params: {
  email: string
  partnerName: string
  proposalId: string
  proposalTitle: string
  proposalNumber: string
  rejectorName: string
  rejectorRole: string
  rejectionReason: string
}) {
  const template = await renderTemplate('proposal_rejected', {
    partner_name: params.partnerName,
    proposal_title: params.proposalTitle,
    proposal_number: params.proposalNumber,
    rejector_name: params.rejectorName,
    rejector_role: params.rejectorRole,
    rejection_date: new Date().toLocaleDateString('id-ID'),
    rejection_reason: params.rejectionReason,
    proposal_url: `${APP_URL}/dashboard/proposals/${params.proposalId}`,
  })

  return sendEmail({
    to: params.email,
    subject: template.subject,
    html: template.body_html,
    text: template.body_text,
    proposalId: params.proposalId,
    templateName: 'proposal_rejected',
  })
}

/**
 * Send status update email
 */
export async function sendStatusUpdateEmail(params: {
  email: string
  partnerName: string
  proposalId: string
  proposalTitle: string
  proposalNumber: string
  oldStatus: string
  newStatus: string
  updatedBy: string
  updatedByRole: string
  updateComment: string
  additionalInfo: string
}) {
  const template = await renderTemplate('status_update', {
    partner_name: params.partnerName,
    proposal_title: params.proposalTitle,
    proposal_number: params.proposalNumber,
    old_status: params.oldStatus,
    new_status: params.newStatus,
    updated_by: params.updatedBy,
    updated_by_role: params.updatedByRole,
    update_date: new Date().toLocaleDateString('id-ID'),
    update_comment: params.updateComment,
    additional_info: params.additionalInfo,
    proposal_url: `${APP_URL}/dashboard/proposals/${params.proposalId}`,
  })

  return sendEmail({
    to: params.email,
    subject: template.subject,
    html: template.body_html,
    text: template.body_text,
    proposalId: params.proposalId,
    templateName: 'status_update',
  })
}

/**
 * Send action reminder email
 */
export async function sendActionReminderEmail(params: {
  email: string
  partnerName: string
  proposalId: string
  proposalTitle: string
  proposalNumber: string
  requiredAction: string
  deadline: string
  timeRemaining: string
}) {
  const template = await renderTemplate('action_reminder', {
    partner_name: params.partnerName,
    proposal_title: params.proposalTitle,
    proposal_number: params.proposalNumber,
    required_action: params.requiredAction,
    deadline: params.deadline,
    time_remaining: params.timeRemaining,
    proposal_url: `${APP_URL}/dashboard/proposals/${params.proposalId}`,
  })

  return sendEmail({
    to: params.email,
    subject: template.subject,
    html: template.body_html,
    text: template.body_text,
    proposalId: params.proposalId,
    templateName: 'action_reminder',
  })
}

// ============================================
// NOTIFICATION HELPERS
// ============================================

/**
 * Get mitra email from proposal
 */
async function getMitraEmailFromProposal(proposalId: string) {
  const { data: proposal } = await supabaseAdmin
    .from('proposals')
    .select('created_by')
    .eq('id', proposalId)
    .single()

  if (!proposal) {
    throw new Error('Proposal not found')
  }

  const { data: user } = await supabaseAdmin.from('users').select('email, name').eq('id', proposal.created_by).single()

  if (!user) {
    throw new Error('User not found')
  }

  return user
}

/**
 * Notify mitra about proposal status change
 */
export async function notifyMitraStatusChange(proposalId: string, oldStatus: string, newStatus: string, comment: string) {
  try {
    const mitra = await getMitraEmailFromProposal(proposalId)
    const { data: proposal } = await supabaseAdmin
      .from('proposals')
      .select('title, proposal_number, partner_name')
      .eq('id', proposalId)
      .single()

    if (!proposal) return

    await sendStatusUpdateEmail({
      email: mitra.email,
      partnerName: proposal.partner_name,
      proposalId,
      proposalTitle: proposal.title,
      proposalNumber: proposal.proposal_number || '',
      oldStatus,
      newStatus,
      updatedBy: 'Tim DKUI',
      updatedByRole: 'Administrator',
      updateComment: comment,
      additionalInfo: 'Proposal Anda sedang dalam proses review.',
    })
  } catch (error) {
    console.error('Failed to notify mitra:', error)
  }
}

export default {
  sendEmail,
  sendWelcomeEmail,
  sendRevisionRequiredEmail,
  sendProposalApprovedEmail,
  sendProposalRejectedEmail,
  sendStatusUpdateEmail,
  sendActionReminderEmail,
  notifyMitraStatusChange,
}
