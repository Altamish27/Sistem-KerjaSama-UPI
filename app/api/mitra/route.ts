import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/admin"

// ============================================
// GET /api/mitra?email=xxx
// ============================================
// Lookup mitra by email_pic. Returns mitra data if found.
// Used by proposal form to auto-fill mitra info.

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get("email")

    if (!email) {
      return NextResponse.json(
        { error: "Parameter 'email' wajib diisi" },
        { status: 400 },
      )
    }

    const { data: mitra, error } = await supabaseAdmin
      .from('mitra')
      .select('id, nama_instansi, alamat_lengkap, jenis_mitra, nama_penandatangan, jabatan_penandatangan, nama_pic, kontak_pic, email_pic')
      .eq('email_pic', email.toLowerCase().trim())
      .maybeSingle()

    if (error) {
      console.error("Error looking up mitra:", error)
      return NextResponse.json(
        { error: "Gagal mencari data mitra" },
        { status: 500 },
      )
    }

    if (!mitra) {
      return NextResponse.json({ found: false, mitra: null })
    }

    return NextResponse.json({
      found: true,
      mitra: {
        id: mitra.id,
        namaInstansi: mitra.nama_instansi,
        alamatLengkap: mitra.alamat_lengkap,
        jenisMitra: mitra.jenis_mitra,
        namaPenandatangan: mitra.nama_penandatangan,
        jabatanPenandatangan: mitra.jabatan_penandatangan,
        namaPic: mitra.nama_pic,
        kontakPic: mitra.kontak_pic,
        emailPic: mitra.email_pic,
      },
    })
  } catch (error) {
    console.error("Error in mitra lookup:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    )
  }
}

// ============================================
// POST /api/mitra
// ============================================
// Create a new mitra record. Returns the created mitra.

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const { data: mitra, error } = await supabaseAdmin
      .from('mitra')
      .insert({
        nama_instansi: body.namaInstansi,
        alamat_lengkap: body.alamatLengkap || null,
        jenis_mitra: body.jenisMitra || 'dalam_negeri',
        nama_penandatangan: body.namaPenandatangan || null,
        jabatan_penandatangan: body.jabatanPenandatangan || null,
        nama_pic: body.namaPic || null,
        kontak_pic: body.kontakPic || null,
        email_pic: body.emailPic?.toLowerCase().trim() || null,
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating mitra:", error)
      return NextResponse.json(
        { error: "Gagal menyimpan data mitra" },
        { status: 500 },
      )
    }

    return NextResponse.json({
      success: true,
      mitra: {
        id: mitra.id,
        namaInstansi: mitra.nama_instansi,
        emailPic: mitra.email_pic,
        namaPic: mitra.nama_pic,
        kontakPic: mitra.kontak_pic,
      },
    }, { status: 201 })
  } catch (error) {
    console.error("Error in mitra creation:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    )
  }
}
