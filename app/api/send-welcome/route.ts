import { NextRequest, NextResponse } from "next/server"
import { sendWelcomeEmail } from "@/lib/email-service"
import { supabaseAdmin } from "@/lib/supabase/admin"

export async function POST(request: NextRequest) {
  try {
    const { proposalId, mitraEmail, mitraName, tempPassword } = await request.json()

    // Get proposal data
    const { data: proposal } = await supabaseAdmin
      .from('proposals')
      .select('id, title, proposal_number')
      .eq('id', proposalId)
      .single()

    if (!proposal) {
      return NextResponse.json({ error: "Proposal not found" }, { status: 404 })
    }

    // Kirim welcome email dengan credentials
    await sendWelcomeEmail({
      email: mitraEmail,
      partnerName: mitraName,
      proposalTitle: proposal.title,
      proposalNumber: proposal.proposal_number || '',
      proposalStatus: 'Submitted - Menunggu Review',
      tempPassword: tempPassword,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error sending welcome email:", error)
    return NextResponse.json({ error: "Failed to send welcome email" }, { status: 500 })
  }
}
