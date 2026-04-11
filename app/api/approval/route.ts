import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/admin"
import type { ApprovalAction, UserRole, ProposalStatus } from "@/lib/supabase/database.types"
import { getNextStatus, determineWorkflowPath } from "@/lib/workflow-engine"

// ============================================
// POST /api/approval
// ============================================
// Insert approval_history record, update proposal status,
// update paraf/signing tracking columns, and optionally
// trigger mitra account creation on first DKUI review.

export async function POST(request: NextRequest) {
  try {
    const { proposalId, history, sendEmail } = await request.json()

    const action: ApprovalAction = history.action
    const actorId: string | null = history.actor || null
    const actorName: string = history.actorName
    const actorRole: UserRole = history.actorRole
    const comment: string | null = history.comment || null

    // ── 1. Fetch current proposal ──────────────────────────
    const { data: proposal, error: proposalError } = await supabaseAdmin
      .from('proposals')
      .select('*')
      .eq('id', proposalId)
      .single()

    if (proposalError || !proposal) {
      return NextResponse.json({ error: "Proposal not found" }, { status: 404 })
    }

    // ── 2. Determine workflow path ─────────────────────────
    const workflowPath = determineWorkflowPath(proposal.file_surat_kuasa)

    // ── 3. Calculate next status ───────────────────────────
    const nextStatus = getNextStatus(
      proposal.status as ProposalStatus,
      action,
      workflowPath,
    )

    if (!nextStatus) {
      return NextResponse.json(
        { error: `Action "${action}" is not valid for status "${proposal.status}"` },
        { status: 400 },
      )
    }

    // ── 4. Insert approval_history ─────────────────────────
    const { data: historyData, error: historyError } = await supabaseAdmin
      .from('approval_history')
      .insert({
        proposal_id: proposalId,
        action,
        actor_id: actorId,
        actor_name: actorName,
        actor_role: actorRole,
        tahapan: nextStatus,
        comment,
      })
      .select()
      .single()

    if (historyError) {
      console.error("Error adding approval history:", historyError)
      return NextResponse.json({ error: "Failed to add approval history" }, { status: 500 })
    }

    // ── 5. Build proposal update payload ───────────────────
    const now = new Date().toISOString()
    const updatePayload: Record<string, unknown> = {
      status: nextStatus,
      updated_at: now,
    }

    // Set paraf/signing tracking columns based on action
    switch (action) {
      case 'submit':
        updatePayload.submitted_at = now
        break
      case 'pimpinan_unit_approve':
        updatePayload.pimpinan_unit_approval_by = actorId
        updatePayload.pimpinan_unit_approval_at = now
        break
      case 'dkui_approve':
        updatePayload.dkui_approval_by = actorId
        updatePayload.dkui_approval_at = now
        break
      case 'biro_hukum_approve':
        updatePayload.biro_hukum_paraf_by = actorId
        updatePayload.biro_hukum_paraf_at = now
        break
      case 'su_approve':
        updatePayload.su_paraf_by = actorId
        updatePayload.su_paraf_at = now
        break
      case 'wr_approve':
        updatePayload.wr_paraf_by = actorId
        updatePayload.wr_paraf_at = now
        break
      case 'rektor_sign':
        updatePayload.rektor_signed_by = actorId
        updatePayload.rektor_signed_at = now
        break
      case 'pimpinan_unit_sign':
        updatePayload.pimpinan_unit_signed_by = actorId
        updatePayload.pimpinan_unit_signed_at = now
        break
      case 'mitra_sign':
        updatePayload.mitra_signed_by = actorId
        updatePayload.mitra_signed_at = now
        break
      case 'archive':
        updatePayload.archived_at = now
        break
      case 'complete':
        updatePayload.completed_at = now
        break
      case 'final_rejection':
        updatePayload.rejected_at = now
        break
      case 'dkui_self_revise':
        updatePayload.revision_type = 'dkui'
        updatePayload.revision_reason = comment
        break
      case 'mitra_resubmit':
        updatePayload.revision_type = 'mitra'
        updatePayload.revision_reason = comment
        break
    }

    // For any rejection that triggers revision, record reason
    if (['pimpinan_unit_reject', 'dkui_reject', 'biro_hukum_reject', 'su_reject', 'wr_reject'].includes(action)) {
      updatePayload.revision_reason = comment
    }

    // ── 6. Update proposal ─────────────────────────────────
    const { error: updateError } = await supabaseAdmin
      .from('proposals')
      .update(updatePayload)
      .eq('id', proposalId)

    if (updateError) {
      console.error("Error updating proposal status:", updateError)
      return NextResponse.json({ error: "Failed to update proposal status" }, { status: 500 })
    }

    // ── 7. Auto-create mitra account on pimpinan_unit approval ──
    if (action === 'pimpinan_unit_approve' && proposal.mitra_id) {
      try {
        // Fetch mitra data
        const { data: mitra } = await supabaseAdmin
          .from('mitra')
          .select('nama_instansi, email_pic, nama_pic')
          .eq('id', proposal.mitra_id)
          .single()

        if (mitra?.email_pic) {
          const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
          await fetch(`${baseUrl}/api/create-mitra-account`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: mitra.email_pic,
              name: mitra.nama_instansi,
              proposalId,
            }),
          })
        }
      } catch (mitraErr) {
        console.error('Mitra account creation error (non-blocking):', mitraErr)
        // Non-blocking: don't fail the approval if mitra account creation fails
      }
    }

    // ── 8. Return result ───────────────────────────────────
    return NextResponse.json({
      ...historyData,
      newStatus: nextStatus,
    })
  } catch (error) {
    console.error("Error in approval history:", error)
    return NextResponse.json({ error: "Failed to process approval" }, { status: 500 })
  }
}
