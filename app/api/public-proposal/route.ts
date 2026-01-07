import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/admin"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const {
      contactPerson,
      contactEmail,
      contactPhone,
      institution,
      title,
      cooperationType,
      objectives,
      startDate,
      endDate,
      documentFile,
    } = body

    // Validation
    if (!contactEmail || !contactPerson || !institution || !title || !objectives || !cooperationType) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Insert proposal sebagai public submission
    const { data: proposal, error: proposalError } = await supabaseAdmin
      .from('proposals')
      .insert({
        initiator: 'mitra',
        title,
        partner_name: institution,
        partner_type: 'dalam_negeri',
        description: objectives,
        objectives: objectives,
        benefits: '-',
        scope_of_work: '-',
        duration: 12,
        jenis_doc: cooperationType,
        contact_person: contactPerson,
        contact_email: contactEmail,
        contact_phone: contactPhone,
        start_date: startDate,
        end_date: endDate,
        status: 'submitted',
        is_public_submission: true,
        created_by: null,
      })
      .select()
      .single()

    if (proposalError) {
      console.error("Error creating proposal:", proposalError)
      return NextResponse.json(
        { error: "Failed to create proposal" },
        { status: 500 }
      )
    }

    // Kirim konfirmasi email ke mitra
    try {
      await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/send-confirmation`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: contactEmail,
          name: contactPerson,
          proposalTitle: title,
          proposalId: proposal.id,
        }),
      })
    } catch (emailError) {
      console.error("Error sending confirmation email:", emailError)
      // Don't fail proposal submission if email fails
    }

    return NextResponse.json({
      success: true,
      proposalId: proposal.id,
      message: "Proposal berhasil dikirim. Kami akan mengirimkan konfirmasi ke email Anda."
    })

  } catch (error) {
    console.error("Error in public proposal submission:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
