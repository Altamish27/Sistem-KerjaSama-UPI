import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/admin"
import type { UserRole } from "@/lib/supabase/database.types"

export async function POST(request: NextRequest) {
  try {
    const { name, email, password, role, institution, unitId, phone } = await request.json()

    // Validasi input
    if (!name || !email || !password || !role) {
      return NextResponse.json(
        { error: "Nama, email, password, dan role wajib diisi" },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password minimal 6 karakter" },
        { status: 400 }
      )
    }

    // Validasi role — matches UserRole enum
    const validRoles: UserRole[] = [
      "mitra",
      "pimpinan_unit",
      "dkui",
      "biro_hukum",
      "sekretaris_universitas",
      "wakil_rektor",
      "rektor",
    ]
    if (!validRoles.includes(role)) {
      return NextResponse.json(
        { error: "Role tidak valid" },
        { status: 400 }
      )
    }

    // Check if email already exists
    const { data: existingUser } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('email', email)
      .single()

    if (existingUser) {
      return NextResponse.json(
        { error: "Email sudah terdaftar" },
        { status: 409 }
      )
    }

    // Create user in Supabase Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        name,
        role,
      },
    })

    if (authError) {
      console.error("Error creating auth user:", authError)
      return NextResponse.json(
        { error: authError.message || "Gagal membuat akun" },
        { status: 500 }
      )
    }

    // Insert user data to users table
    const userData: Record<string, unknown> = {
      id: authData.user.id,
      email,
      name,
      role,
      account_status: 'active',
      is_active: true,
      email_verified: true,
      created_at: new Date().toISOString(),
    }

    // Add optional fields based on role
    if (role === "mitra" && institution) {
      userData.institution = institution
    }

    // Internal roles can be linked to a unit_kerja
    if (unitId && role !== "mitra") {
      userData.unit_id = unitId
    }

    if (phone) {
      userData.phone = phone
    }

    const { error: insertError } = await supabaseAdmin
      .from('users')
      .insert(userData as any)

    if (insertError) {
      console.error("Error inserting user data:", insertError)

      // Rollback: delete auth user if database insert fails
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id)

      return NextResponse.json(
        { error: "Gagal menyimpan data user" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: "Registrasi berhasil! Silakan login.",
      userId: authData.user.id,
    })
  } catch (error) {
    console.error("Error in register:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
