import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/admin"

/**
 * Create user account for mitra after faculty approval
 * Called automatically when proposal status changes to faculty_substansi_approved
 */
export async function POST(request: NextRequest) {
  try {
    const { proposalId, email, name, institution } = await request.json()

    if (!proposalId || !email || !name) {
      return NextResponse.json(
        { error: "Proposal ID, email, dan nama wajib diisi" },
        { status: 400 }
      )
    }

    // Check if user already exists
    const { data: existingUser } = await supabaseAdmin
      .from('users')
      .select('id, email')
      .eq('email', email)
      .single()

    if (existingUser) {
      console.log(`User already exists: ${email}`)
      // Update proposal dengan user_id yang sudah ada
      await supabaseAdmin
        .from('proposals')
        .update({ created_by: existingUser.id })
        .eq('id', proposalId)

      return NextResponse.json({
        success: true,
        message: "User sudah ada, proposal diupdate dengan user_id",
        userId: existingUser.id,
        isNewUser: false,
      })
    }

    // Generate temporary password (8 karakter alfanumerik)
    const tempPassword = generateTempPassword()

    // Create user in Supabase Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: tempPassword,
      email_confirm: true, // Auto-confirm
      user_metadata: {
        name,
        role: "mitra",
        created_from_proposal: proposalId,
      },
    })

    if (authError) {
      console.error("Error creating auth user:", authError)
      return NextResponse.json(
        { error: authError.message || "Gagal membuat akun" },
        { status: 500 }
      )
    }

    // Insert to users table
    const { error: insertError } = await supabaseAdmin
      .from('users')
      .insert({
        id: authData.user.id,
        email,
        name,
        role: "mitra",
        institution: institution || null,
        account_status: 'active',
        created_at: new Date().toISOString(),
      })

    if (insertError) {
      console.error("Error inserting user data:", insertError)
      // Rollback: delete auth user
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id)
      return NextResponse.json(
        { error: "Gagal menyimpan data user" },
        { status: 500 }
      )
    }

    // Update proposal dengan user_id mitra yang baru dibuat
    const { error: updateError } = await supabaseAdmin
      .from('proposals')
      .update({ created_by: authData.user.id })
      .eq('id', proposalId)

    if (updateError) {
      console.error("Error updating proposal:", updateError)
    }

    // Send credentials email
    const emailResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/send-credentials`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: email,
        name,
        tempPassword,
        proposalId,
      }),
    })

    if (!emailResponse.ok) {
      const emailError = await emailResponse.json()
      console.error("Error sending credentials email:", emailError)
      // Don't fail the whole operation if email fails
    }

    return NextResponse.json({
      success: true,
      message: "Akun berhasil dibuat dan credentials dikirim ke email mitra",
      userId: authData.user.id,
      isNewUser: true,
      tempPassword, // Return untuk testing, hapus di production
    })
  } catch (error) {
    console.error("Error in create-mitra-account:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

function generateTempPassword(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789'
  let password = ''
  for (let i = 0; i < 8; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return password
}
