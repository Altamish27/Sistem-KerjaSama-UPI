import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/admin"

// ============================================
// GET /api/units
// ============================================
// Fetch all unit kerja for dropdown selection

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('unit_kerja')
      .select('id, nama_unit, jenis_unit')
      .order('nama_unit', { ascending: true })

    if (error) {
      console.error("Error fetching unit kerja:", error)
      return NextResponse.json({ error: "Gagal mengambil data unit kerja" }, { status: 500 })
    }

    return NextResponse.json(data || [])
  } catch (error) {
    console.error("Error in GET units:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
