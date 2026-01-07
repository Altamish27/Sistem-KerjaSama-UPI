import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/admin"
import {
  sendRevisionRequiredEmail,
  sendProposalApprovedEmail,
  sendProposalRejectedEmail,
  sendStatusUpdateEmail,
  sendWelcomeEmail,
} from "@/lib/email-service"

export async function POST(request: NextRequest) {
  try {
    const { proposalId, history, sendEmail } = await request.json()

    // Insert approval history
    const { data: historyData, error: historyError } = await supabaseAdmin
      .from('approval_history')
      .insert({
        proposal_id: proposalId,
        action: history.action,
        actor_id: history.actor,
        actor_name: history.actorName,
        actor_role: history.actorRole,
        comment: history.comment,
      })
      .select()
      .single()

    if (historyError) {
      console.error("Error adding approval history:", historyError)
      return NextResponse.json({ error: "Failed to add approval history" }, { status: 500 })
    }

    // Get proposal data untuk email
    const { data: proposal } = await supabaseAdmin
      .from('proposals')
      .select('*, created_by_user:users!proposals_created_by_fkey(email, name)')
      .eq('id', proposalId)
      .single()

    if (!proposal) {
      return NextResponse.json(historyData)
    }

    console.log('📧 Email Check - Action:', history.action)
    console.log('📧 Email Check - is_public_submission:', proposal.is_public_submission)
    console.log('📧 Email Check - created_by:', proposal.created_by)

    // Check if this is a public submission yang baru diterima DKUI untuk pertama kali
    // HANYA trigger user creation + email kredensial saat DKUI menerima proposal
    if (
      proposal.is_public_submission &&
      !proposal.created_by &&
      history.action === 'dkui_receive'
    ) {
      console.log('🎯 MASUK ke blok pembuatan user dan email kredensial!')
      try {
        // Generate random password yang kuat
        const tempPassword = generateSecurePassword()
        
        // Cek apakah user dengan email ini sudah ada
        const { data: existingUser } = await supabaseAdmin
          .from('users')
          .select('id, email')
          .eq('email', proposal.contact_email)
          .single()

        let userId: string
        let isNewUser = false

        if (existingUser) {
          // User sudah ada, update proposal saja
          userId = existingUser.id
          await supabaseAdmin
            .from('proposals')
            .update({ created_by: userId })
            .eq('id', proposalId)
          
          console.log(`User sudah ada: ${proposal.contact_email}, proposal di-link ke user`)
        } else {
          // Buat user baru
          const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
            email: proposal.contact_email,
            password: tempPassword,
            email_confirm: true,
            user_metadata: {
              name: proposal.contact_person,
              role: 'mitra',
            },
          })

          // Jika error email_exists, berarti user sudah ada di auth tapi belum di tabel users
          if (authError && authError.code === 'email_exists') {
            console.log("⚠️ User sudah ada di Auth, akan link ke tabel users")
            // Get user dari auth by email
            const { data: authUsers } = await supabaseAdmin.auth.admin.listUsers()
            const existingAuthUser = authUsers.users.find(u => u.email === proposal.contact_email)
            
            if (existingAuthUser) {
              userId = existingAuthUser.id
              isNewUser = true // Tetap kirim email karena ini pertama kali link ke proposal
            } else {
              throw authError
            }
          } else if (authError) {
            console.error("Error creating auth user:", authError)
            throw authError
          } else {
            userId = authData.user.id
            isNewUser = true
          }

          // Insert ke tabel users
          const { error: insertError } = await supabaseAdmin
            .from('users')
            .insert({
              id: userId,
              email: proposal.contact_email,
              name: proposal.contact_person,
              role: 'mitra',
              institution: proposal.institution,
              is_active: true,
              email_verified: true,
            })

          if (insertError) {
            console.error("Error inserting user:", insertError)
            // Rollback auth user
            await supabaseAdmin.auth.admin.deleteUser(userId)
            throw insertError
          }

          // Update proposal dengan created_by
          await supabaseAdmin
            .from('proposals')
            .update({ created_by: userId })
            .eq('id', proposalId)

          console.log(`Akun mitra baru berhasil dibuat untuk: ${proposal.contact_email}`)
        }

        // KIRIM EMAIL KREDENSIAL - untuk user baru saja
        if (isNewUser) {
          try {
            await sendWelcomeEmail({
              email: proposal.contact_email,
              partnerName: proposal.contact_person,
              proposalTitle: proposal.title,
              proposalNumber: proposal.proposal_number || 'Menunggu Nomor',
              proposalStatus: 'Diterima - Sedang Diproses',
              tempPassword: tempPassword,
            })
            console.log(`✅ Email kredensial berhasil dikirim ke: ${proposal.contact_email}`)
          } catch (emailError) {
            console.error("❌ Error mengirim email kredensial:", emailError)
            // Jangan fail approval jika email gagal, tapi log error-nya
            // User sudah dibuat, tapi perlu manual reset password jika perlu
          }
        }
      } catch (userCreationError) {
        console.error("Error in user creation process:", userCreationError)
        // Fail the approval if user creation fails
        return NextResponse.json(
          { error: "Gagal membuat akun mitra. Approval dibatalkan.", details: userCreationError },
          { status: 500 }
        )
      }
    }

    // Kirim email HANYA untuk dkui_receive (email kredensial sudah dikirim di atas)
    // Email lainnya TIDAK perlu dikirim
    if (sendEmail && history.action === 'dkui_receive') {
      // Email kredensial sudah dikirim di bagian user creation di atas
      // Tidak perlu kirim email lagi di sini
    }

    // MATIKAN semua email notifikasi untuk action lainnya
    // Mitra cukup pantau progress di dashboard
    /*
    if (sendEmail) {
      // Untuk public submission, gunakan contact_email
      // Untuk authenticated submission, gunakan created_by_user.email
      const mitraEmail = proposal.is_public_submission 
        ? proposal.contact_email 
        : proposal.created_by_user?.email
      
      const mitraName = proposal.is_public_submission
        ? proposal.contact_person
        : proposal.created_by_user?.name

      if (!mitraEmail) {
        return NextResponse.json(historyData)
      }

      try {
        // Revisi diperlukan
        if (
          history.action === 'faculty_reject_substansi' ||
          history.action === 'dkui_decide_revision_mitra' ||
          history.action === 'biro_hukum_reject'
        ) {
          await sendRevisionRequiredEmail({
            email: mitraEmail,
            partnerName: mitraName,
            proposalId: proposal.id,
            proposalTitle: proposal.title,
            proposalNumber: proposal.proposal_number || '',
            reviewerName: history.actorName,
            reviewerRole: history.actorRole,
            reviewerEmail: 'dkui@upi.edu', // TODO: Get from actor
            feedbackComment: history.comment || 'Mohon lakukan revisi sesuai catatan.',
            deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toLocaleDateString('id-ID'),
          })
        }

        // Approval
        if (
          history.action === 'faculty_approve_substansi' ||
          history.action === 'biro_hukum_approve' ||
          history.action === 'dkui_approve_legal_1'
        ) {
          await sendProposalApprovedEmail({
            email: mitraEmail,
            partnerName: mitraName,
            proposalId: proposal.id,
            proposalTitle: proposal.title,
            proposalNumber: proposal.proposal_number || '',
            approverName: history.actorName,
            approverRole: history.actorRole,
            currentStatus: 'Approved',
            nextSteps: 'Proposal sedang dalam proses review berikutnya.',
          })
        }

        // Rejection final
        if (history.action === 'final_rejection') {
          await sendProposalRejectedEmail({
            email: mitraEmail,
            partnerName: mitraName,
            proposalId: proposal.id,
            proposalTitle: proposal.title,
            proposalNumber: proposal.proposal_number || '',
            rejectorName: history.actorName,
            rejectorRole: history.actorRole,
            rejectionReason: history.comment || 'Proposal tidak dapat dilanjutkan.',
          })
        }

        // General status update
        if (!['faculty_reject_substansi', 'faculty_approve_substansi', 'final_rejection'].includes(history.action)) {
          await sendStatusUpdateEmail({
            email: mitraEmail,
            partnerName: mitraName,
            proposalId: proposal.id,
            proposalTitle: proposal.title,
            proposalNumber: proposal.proposal_number || '',
            oldStatus: proposal.status,
            newStatus: proposal.status,
            updatedBy: history.actorName,
            updatedByRole: history.actorRole,
            updateComment: history.comment || '',
            additionalInfo: 'Silakan cek dashboard untuk detail lengkap.',
          })
        }
      } catch (emailError) {
        console.error("Error sending email:", emailError)
        // Fail the request if email fails - status should not change if notification fails
        return NextResponse.json(
          { error: "Failed to send email notification. Status not updated.", details: emailError },
          { status: 500 }
        )
      }
    }
    */

    return NextResponse.json(historyData)
  } catch (error) {
    console.error("Error in approval history:", error)
    return NextResponse.json({ error: "Failed to process approval" }, { status: 500 })
  }
}

/**
 * Generate secure random password untuk mitra
 * Format: 10 karakter alfanumerik dengan minimal 1 huruf besar, 1 huruf kecil, 1 angka
 */
function generateSecurePassword(): string {
  const uppercaseChars = 'ABCDEFGHJKLMNPQRSTUVWXYZ'
  const lowercaseChars = 'abcdefghjkmnpqrstuvwxyz'
  const numberChars = '23456789'
  const allChars = uppercaseChars + lowercaseChars + numberChars

  // Pastikan minimal ada 1 dari setiap kategori
  let password = ''
  password += uppercaseChars.charAt(Math.floor(Math.random() * uppercaseChars.length))
  password += lowercaseChars.charAt(Math.floor(Math.random() * lowercaseChars.length))
  password += numberChars.charAt(Math.floor(Math.random() * numberChars.length))

  // Tambahkan karakter random untuk mencapai 10 karakter
  for (let i = password.length; i < 10; i++) {
    password += allChars.charAt(Math.floor(Math.random() * allChars.length))
  }

  // Shuffle password agar tidak predictable
  return password.split('').sort(() => Math.random() - 0.5).join('')
}
