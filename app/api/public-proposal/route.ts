import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/admin"
import type { StatusPengajuan } from "@/lib/supabase/database.types"
import { sendEmail } from "@/lib/email-service"

// ============================================
// POST /api/public-proposal
// ============================================
// Pengajuan penjajakan kerja sama dari mitra (guest/public mode).
// Inserts into `pengajuan_penjajakan` table, NOT into `proposals`.
// DKUI staff will review and decide whether to create a formal proposal.

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const {
      namaInstansi,
      emailPic,
      namaPic,
      teleponPic,
      judulTawaran,
      deskripsiSingkat,
      fileLegalitas,
      fileProfilMitra,
      fromLoggedInMitra,
      unitTerkaitId,
    } = body

    // Validation
    if (!namaInstansi || !emailPic || !judulTawaran) {
      return NextResponse.json(
        { error: "Nama instansi, email PIC, dan judul tawaran wajib diisi" },
        { status: 400 },
      )
    }

    if (!unitTerkaitId) {
      return NextResponse.json(
        { error: "Unit terkait wajib dipilih" },
        { status: 400 },
      )
    }

    // If submitted by a logged-in mitra, try to find matching mitra record by email
    let resolvedMitraId: string | null = null
    if (fromLoggedInMitra && emailPic) {
      const { data: mitraRecord } = await supabaseAdmin
        .from('mitra')
        .select('id')
        .eq('email_pic', emailPic)
        .maybeSingle()
      resolvedMitraId = mitraRecord?.id || null
    }

    // Insert pengajuan penjajakan
    const { data: pengajuan, error: insertError } = await supabaseAdmin
      .from('pengajuan_penjajakan')
      .insert({
        nama_instansi: namaInstansi,
        email_pic: emailPic,
        nama_pic: namaPic || null,
        telepon_pic: teleponPic || null,
        judul_tawaran: judulTawaran,
        deskripsi_singkat: deskripsiSingkat || null,
        file_legalitas: fileLegalitas || null,
        file_profil_mitra: fileProfilMitra || null,
        status_pengajuan: 'pending',
        mitra_id: resolvedMitraId,
        unit_terkait_id: unitTerkaitId,
      })
      .select()
      .single()

    if (insertError) {
      console.error("Error creating pengajuan penjajakan:", insertError)
      return NextResponse.json(
        { error: "Gagal mengirim pengajuan penjajakan" },
        { status: 500 },
      )
    }

    // Send confirmation email to PIC (skip for logged-in mitra)
    if (!fromLoggedInMitra) {
      try {
        await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/send-confirmation`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: emailPic,
            name: namaPic || namaInstansi,
            proposalTitle: judulTawaran,
            proposalId: pengajuan.id,
          }),
        })
      } catch (emailError) {
        console.error("Error sending confirmation email:", emailError)
        // Don't fail submission if email fails
      }
    }

    return NextResponse.json({
      success: true,
      pengajuanId: pengajuan.id,
      message: "Pengajuan penjajakan berhasil dikirim. Kami akan mengirimkan konfirmasi ke email Anda.",
    })
  } catch (error) {
    console.error("Error in public proposal submission:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    )
  }
}

// ============================================
// GET /api/public-proposal
// ============================================
// Fetch pengajuan penjajakan with unit info.
// Supports filters: ?status=, ?unitId=, ?email=

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const unitId = searchParams.get('unitId')
    const email = searchParams.get('email')

    let query = supabaseAdmin
      .from('pengajuan_penjajakan')
      .select(`
        *,
        unit_kerja:unit_terkait_id(id, nama_unit, jenis_unit)
      `)
      .order('created_at', { ascending: false })

    if (status) {
      query = query.eq('status_pengajuan', status as StatusPengajuan)
    }
    if (unitId) {
      query = query.eq('unit_terkait_id', unitId)
    }
    if (email) {
      query = query.eq('email_pic', email)
    }

    const { data, error } = await query

    if (error) {
      console.error("Error fetching pengajuan:", error)
      return NextResponse.json({ error: "Gagal mengambil data pengajuan" }, { status: 500 })
    }

    return NextResponse.json(data || [])
  } catch (error) {
    console.error("Error in GET pengajuan:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// ============================================
// PATCH /api/public-proposal
// ============================================
// Review pengajuan penjajakan:
// - DKUI: diteruskan / ditolak
// - Pimpinan Unit: diterima_unit / ditolak

export async function PATCH(request: NextRequest) {
  try {
    const { pengajuanId, statusPengajuan, catatanDkui, reviewedBy, unitReviewedBy } = await request.json()

    if (!pengajuanId || !statusPengajuan) {
      return NextResponse.json(
        { error: "pengajuanId dan statusPengajuan wajib diisi" },
        { status: 400 },
      )
    }

    const validStatuses = ['ditolak', 'diteruskan', 'diterima_unit']
    if (!validStatuses.includes(statusPengajuan)) {
      return NextResponse.json(
        { error: `statusPengajuan harus salah satu dari: ${validStatuses.join(', ')}` },
        { status: 400 },
      )
    }

    // Build update object based on who is reviewing
    const updateData: Record<string, unknown> = {
      status_pengajuan: statusPengajuan,
    }

    if (statusPengajuan === 'diterima_unit' || (statusPengajuan === 'ditolak' && unitReviewedBy)) {
      // Pimpinan Unit reviewing
      updateData.unit_reviewed_by = unitReviewedBy || null
      updateData.unit_reviewed_at = new Date().toISOString()
      if (catatanDkui) updateData.catatan_dkui = catatanDkui
    } else {
      // DKUI reviewing
      updateData.catatan_dkui = catatanDkui || null
      updateData.reviewed_by = reviewedBy || null
      updateData.reviewed_at = new Date().toISOString()
    }

    const { data, error } = await supabaseAdmin
      .from('pengajuan_penjajakan')
      .update(updateData)
      .eq('id', pengajuanId)
      .select()
      .single()

    if (error) {
      console.error("Error updating pengajuan:", error)
      return NextResponse.json({ error: "Gagal mengupdate pengajuan" }, { status: 500 })
    }

    // If diterima_unit -> check if mitra already has account, create if not, then send PIC contact email
    if (statusPengajuan === 'diterima_unit' && data) {
      try {
        const pengajuanData = data as any

        // 1. Check if mitra already has an account in users table
        const { data: existingUser } = await supabaseAdmin
          .from('users')
          .select('id, email, name')
          .eq('email', data.email_pic)
          .maybeSingle()

        let isNewUser = false

        if (!existingUser) {
          // Mitra belum terdaftar → buat akun baru via create-mitra-account
          isNewUser = true
          try {
            const createRes = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/create-mitra-account`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                email: data.email_pic,
                name: data.nama_pic || data.nama_instansi,
                institution: data.nama_instansi,
              }),
            })
            const createResult = await createRes.json()
            if (!createRes.ok) {
              console.error('Failed to create mitra account:', createResult)
            } else {
              console.log(`Mitra account created for ${data.email_pic}:`, createResult)
            }
          } catch (accountErr) {
            console.error('Error creating mitra account:', accountErr)
            // Don't fail the PATCH if account creation fails
          }
        } else {
          console.log(`Mitra ${data.email_pic} already registered (userId: ${existingUser.id}), skipping account creation`)
        }

        // 2. Look up operator_unit (PIC) for this unit
        const { data: operatorUser } = await supabaseAdmin
          .from('users')
          .select('name, email, phone')
          .eq('role', 'operator_unit')
          .eq('unit_id', pengajuanData.unit_terkait_id)
          .limit(1)
          .maybeSingle()

        // 3. Look up unit name
        const { data: unitData } = await supabaseAdmin
          .from('unit_kerja')
          .select('nama_unit')
          .eq('id', pengajuanData.unit_terkait_id)
          .single()

        const unitName = unitData?.nama_unit || 'Unit Terkait'
        const operatorName = operatorUser?.name || 'PIC Unit'
        const operatorEmail = operatorUser?.email || '-'
        const operatorPhone = operatorUser?.phone || '-'

        // 4. Send PIC contact email to mitra
        const accountNote = isNewUser
          ? `<div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 16px; margin: 16px 0;">
              <p style="margin: 0; color: #166534; font-weight: 600;">✅ Akun Anda Telah Dibuat</p>
              <p style="margin: 8px 0 0 0; color: #334155; font-size: 14px;">
                Kami telah membuat akun untuk Anda di Sistem Kerja Sama UPI. Kredensial login telah dikirim dalam email terpisah.
                Anda dapat login ke dashboard untuk memantau progress kerjasama.
              </p>
            </div>`
          : `<div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 16px; margin: 16px 0;">
              <p style="margin: 0; color: #1e40af; font-weight: 600;">ℹ️ Anda Sudah Terdaftar</p>
              <p style="margin: 8px 0 0 0; color: #334155; font-size: 14px;">
                Anda sudah memiliki akun di Sistem Kerja Sama UPI. Silakan login ke dashboard untuk memantau progress kerjasama Anda.
              </p>
            </div>`

        await sendEmail({
          to: data.email_pic,
          subject: `Pengajuan Penjajakan Diterima - ${unitName}`,
          html: `
            <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background: #e10000; padding: 24px; text-align: center;">
                <h1 style="color: white; margin: 0; font-size: 22px;">Pengajuan Penjajakan Diterima</h1>
              </div>
              <div style="padding: 32px 24px; background: #ffffff; border: 1px solid #e2e8f0;">
                <p style="color: #334155; font-size: 15px; line-height: 1.6;">Yth. <strong>${data.nama_pic || data.nama_instansi}</strong>,</p>
                <p style="color: #334155; font-size: 15px; line-height: 1.6;">
                  Pengajuan penjajakan kerjasama Anda dengan judul <strong>"${data.judul_tawaran}"</strong>
                  telah <span style="color: #059669; font-weight: bold;">diterima</span> oleh <strong>${unitName}</strong>.
                </p>
                <p style="color: #334155; font-size: 15px; line-height: 1.6;">Silakan hubungi unit terkait melalui contact person berikut untuk melanjutkan proses penjajakan:</p>
                ${accountNote}
                <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin: 20px 0;">
                  <h3 style="margin: 0 0 12px 0; color: #1e293b; font-size: 16px;">Contact Person - ${unitName}</h3>
                  <table style="width: 100%; border-collapse: collapse;">
                    <tr><td style="padding: 6px 0; color: #64748b; width: 100px;">Nama</td><td style="padding: 6px 0; color: #1e293b; font-weight: 600;">${operatorName}</td></tr>
                    <tr><td style="padding: 6px 0; color: #64748b;">Email</td><td style="padding: 6px 0; color: #1e293b;"><a href="mailto:${operatorEmail}" style="color: #e10000;">${operatorEmail}</a></td></tr>
                    <tr><td style="padding: 6px 0; color: #64748b;">Telepon</td><td style="padding: 6px 0; color: #1e293b;">${operatorPhone}</td></tr>
                  </table>
                </div>
                <p style="color: #64748b; font-size: 13px; margin-top: 24px;">Email ini dikirim secara otomatis oleh Sistem Kerja Sama UPI.</p>
              </div>
            </div>
          `,
        })
      } catch (emailErr) {
        console.error('Error sending penjajakan accepted email:', emailErr)
        // Don't fail the PATCH if email fails
      }
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error in PATCH pengajuan:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
