import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/admin"

// ============================================
// POST /api/create-mitra-account
// ============================================
// Create a Supabase Auth user + users table row for a mitra partner.
// Called by DKUI when a pengajuan_penjajakan is accepted and
// a formal proposal needs to be tracked with the mitra's own account.

export async function POST(request: NextRequest) {
  try {
    const { proposalId, email, name, institution } = await request.json()

    if (!email || !name) {
      return NextResponse.json(
        { error: "Email dan nama wajib diisi" },
        { status: 400 },
      )
    }

    // Check if user already exists in users table
    const { data: existingUser } = await supabaseAdmin
      .from('users')
      .select('id, email')
      .eq('email', email)
      .single()

    if (existingUser) {
      console.log(`User already exists: ${email}`)
      // Optionally link proposal
      if (proposalId) {
        await supabaseAdmin
          .from('proposals')
          .update({ created_by: existingUser.id })
          .eq('id', proposalId)
      }
      return NextResponse.json({
        success: true,
        message: "User sudah ada, proposal diupdate dengan user_id",
        userId: existingUser.id,
        isNewUser: false,
      })
    }

    // Generate temporary password
    const tempPassword = generateTempPassword()

    // Create user in Supabase Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: tempPassword,
      email_confirm: true,
      user_metadata: {
        name,
        role: 'mitra',
      },
    })

    if (authError) {
      console.error("Error creating auth user:", authError)
      return NextResponse.json(
        { error: authError.message || "Gagal membuat akun" },
        { status: 500 },
      )
    }

    // Insert to users table
    const { error: insertError } = await supabaseAdmin
      .from('users')
      .insert({
        id: authData.user.id,
        email,
        name,
        role: 'mitra',
        institution: institution || null,
        is_active: true,
        email_verified: true,
        account_status: 'active',
      })

    if (insertError) {
      console.error("Error inserting user data:", insertError)
      // Rollback: delete auth user
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id)
      return NextResponse.json(
        { error: "Gagal menyimpan data user" },
        { status: 500 },
      )
    }

    // Optionally link to proposal
    if (proposalId) {
      const { error: updateError } = await supabaseAdmin
        .from('proposals')
        .update({ created_by: authData.user.id })
        .eq('id', proposalId)

      if (updateError) {
        console.error("Error updating proposal:", updateError)
      }
    }

    // Send credentials email
    try {
      await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/send-credentials`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: email,
          name,
          tempPassword,
          proposalId: proposalId || null,
        }),
      })
    } catch (emailError) {
      console.error("Error sending credentials email:", emailError)
      // Don't fail the whole operation if email fails
    }

    return NextResponse.json({
      success: true,
      message: "Akun mitra berhasil dibuat dan credentials dikirim ke email",
      userId: authData.user.id,
      isNewUser: true,
    })
  } catch (error) {
    console.error("Error in create-mitra-account:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    )
  }
}

function generateTempPassword(): string {
  const uppercaseChars = 'ABCDEFGHJKLMNPQRSTUVWXYZ'
  const lowercaseChars = 'abcdefghjkmnpqrstuvwxyz'
  const numberChars = '23456789'
  const allChars = uppercaseChars + lowercaseChars + numberChars

  let password = ''
  password += uppercaseChars.charAt(Math.floor(Math.random() * uppercaseChars.length))
  password += lowercaseChars.charAt(Math.floor(Math.random() * lowercaseChars.length))
  password += numberChars.charAt(Math.floor(Math.random() * numberChars.length))

  for (let i = password.length; i < 10; i++) {
    password += allChars.charAt(Math.floor(Math.random() * allChars.length))
  }

  return password.split('').sort(() => Math.random() - 0.5).join('')
}
