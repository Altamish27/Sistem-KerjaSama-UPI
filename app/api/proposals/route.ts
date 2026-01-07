import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/admin"
import type { Proposal } from "@/lib/mock-data"

// GET - Read all proposals
export async function GET() {
  try {
    const { data: proposals, error } = await supabaseAdmin
      .from('proposals')
      .select(`
        *,
        created_by_user:users!proposals_created_by_fkey(name, role, institution),
        documents(id, name, type, size, category, uploaded_at),
        approval_history(id, action, actor_name, actor_role, comment, timestamp)
      `)
      .order('created_at', { ascending: false })

    if (error) {
      console.error("Error reading proposals:", error)
      return NextResponse.json([], { status: 500 })
    }

    // Transform data untuk compatibility dengan format lama
    const transformedProposals = proposals.map((p: any) => ({
      id: p.id,
      proposalNumber: p.proposal_number,
      initiator: p.initiator,
      title: p.title,
      partnerName: p.partner_name,
      partnerType: p.partner_type,
      description: p.description,
      objectives: p.objectives,
      benefits: p.benefits,
      scopeOfWork: p.scope_of_work,
      duration: p.duration,
      startDate: p.start_date,
      endDate: p.end_date,
      budget: p.budget,
      status: p.status,
      createdBy: p.created_by,
      createdByName: p.created_by_user?.name || '',
      createdByRole: p.created_by_user?.role || '',
      fakultas: p.fakultas,
      createdAt: p.created_at,
      updatedAt: p.updated_at,
      documents: p.documents || [],
      approvalHistory: (p.approval_history || []).map((h: any) => ({
        id: h.id,
        proposalId: p.id,
        action: h.action,
        actor: p.created_by,
        actorName: h.actor_name,
        actorRole: h.actor_role,
        comment: h.comment,
        timestamp: h.timestamp,
      })),
      aiSummary: p.ai_summary,
      aiSummaryGeneratedAt: p.ai_summary_generated_at,
    }))

    return NextResponse.json(transformedProposals)
  } catch (error) {
    console.error("Error reading proposals:", error)
    return NextResponse.json([], { status: 500 })
  }
}

// POST - Create new proposal
export async function POST(request: NextRequest) {
  try {
    const newProposal: Proposal = await request.json()

    const { data, error } = await supabaseAdmin
      .from('proposals')
      .insert({
        initiator: newProposal.initiator,
        title: newProposal.title,
        partner_name: newProposal.partnerName,
        partner_type: newProposal.partnerType,
        description: newProposal.description,
        objectives: newProposal.objectives,
        benefits: newProposal.benefits,
        scope_of_work: newProposal.scopeOfWork,
        duration: newProposal.duration,
        start_date: newProposal.startDate,
        end_date: newProposal.endDate,
        budget: newProposal.budget,
        status: newProposal.status || 'draft',
        created_by: newProposal.createdBy,
        fakultas: newProposal.fakultas,
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating proposal:", error)
      return NextResponse.json({ error: "Failed to create proposal" }, { status: 500 })
    }

    // Transform back to format lama
    const transformed = {
      ...newProposal,
      id: data.id,
      proposalNumber: data.proposal_number,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    }

    return NextResponse.json(transformed, { status: 201 })
  } catch (error) {
    console.error("Error creating proposal:", error)
    return NextResponse.json({ error: "Failed to create proposal" }, { status: 500 })
  }
}

// PUT - Update proposal
export async function PUT(request: NextRequest) {
  try {
    const { id, updates } = await request.json()

    // Convert camelCase to snake_case untuk Supabase
    const dbUpdates: any = {}
    if (updates.status) dbUpdates.status = updates.status
    if (updates.fakultas) dbUpdates.fakultas = updates.fakultas
    if (updates.aiSummary) dbUpdates.ai_summary = updates.aiSummary
    if (updates.aiSummaryGeneratedAt) dbUpdates.ai_summary_generated_at = updates.aiSummaryGeneratedAt
    if (updates.selectedFacultyBy) dbUpdates.selected_faculty_by = updates.selectedFacultyBy
    if (updates.revisionType) dbUpdates.revision_type = updates.revisionType
    if (updates.revisionReason) dbUpdates.revision_reason = updates.revisionReason
    
    // Paraf & signing tracking
    if (updates.biroHukumParafBy) dbUpdates.biro_hukum_paraf_by = updates.biroHukumParafBy
    if (updates.biroHukumParafAt) dbUpdates.biro_hukum_paraf_at = updates.biroHukumParafAt
    if (updates.dkuiParafBy) dbUpdates.dkui_paraf_by = updates.dkuiParafBy
    if (updates.dkuiParafAt) dbUpdates.dkui_paraf_at = updates.dkuiParafAt
    if (updates.facultyApprovalBy) dbUpdates.faculty_approval_by = updates.facultyApprovalBy
    if (updates.facultyApprovalAt) dbUpdates.faculty_approval_at = updates.facultyApprovalAt
    if (updates.mitraStampAt) dbUpdates.mitra_stamp_at = updates.mitraStampAt
    if (updates.mitraSignedBy) dbUpdates.mitra_signed_by = updates.mitraSignedBy
    if (updates.mitraSignedAt) dbUpdates.mitra_signed_at = updates.mitraSignedAt
    if (updates.warekStampAt) dbUpdates.warek_stamp_at = updates.warekStampAt
    if (updates.warekSignedBy) dbUpdates.warek_signed_by = updates.warekSignedBy
    if (updates.warekSignedAt) dbUpdates.warek_signed_at = updates.warekSignedAt
    if (updates.rektorStampAt) dbUpdates.rektor_stamp_at = updates.rektorStampAt
    if (updates.rektorSignedBy) dbUpdates.rektor_signed_by = updates.rektorSignedBy
    if (updates.rektorSignedAt) dbUpdates.rektor_signed_at = updates.rektorSignedAt

    const { data, error } = await supabaseAdmin
      .from('proposals')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error("Error updating proposal:", error)
      return NextResponse.json({ error: "Failed to update proposal" }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error updating proposal:", error)
    return NextResponse.json({ error: "Failed to update proposal" }, { status: 500 })
  }
}

// DELETE - Delete proposal
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "ID required" }, { status: 400 })
    }

    const { error } = await supabaseAdmin
      .from('proposals')
      .delete()
      .eq('id', id)

    if (error) {
      console.error("Error deleting proposal:", error)
      return NextResponse.json({ error: "Failed to delete proposal" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting proposal:", error)
    return NextResponse.json({ error: "Failed to delete proposal" }, { status: 500 })
  }
}
