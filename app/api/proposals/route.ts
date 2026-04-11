import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/admin"
import type { Proposal } from "@/lib/mock-data"

// ============================================
// Helper: snake_case DB row → camelCase Proposal
// ============================================
function transformProposal(p: any): Proposal {
  return {
    id: p.id,
    proposalNumber: p.proposal_number,
    // Relations
    mitraId: p.mitra_id,
    inisiatorId: p.inisiator_id,
    unitTerkaitId: p.unit_terkait_id,
    createdBy: p.created_by,
    // Info dasar
    initiator: p.initiator,
    title: p.title,
    jenisDokumen: p.jenis_dokumen,
    // Konten
    description: p.description,
    objectives: p.objectives,
    benefits: p.benefits,
    scopeOfWork: p.scope_of_work,
    ruangLingkup: p.ruang_lingkup,
    bentukKegiatanLapkerma: p.bentuk_kegiatan_lapkerma,
    // Dokumen wajib
    fileBeritaAcaraPenjajakan: p.file_berita_acara_penjajakan,
    fileSuratKuasa: p.file_surat_kuasa,
    fileNaskahFinal: p.file_naskah_final,
    penandatanganUpi: p.penandatangan_upi,
    // Keuangan
    isIncomeGenerating: p.is_income_generating ?? false,
    // Timeline & Budget
    duration: p.duration,
    startDate: p.start_date,
    endDate: p.end_date,
    budget: p.budget,
    // Workflow
    status: p.status,
    revisionType: p.revision_type,
    revisionReason: p.revision_reason,
    // AI
    aiSummary: p.ai_summary,
    aiSummaryGeneratedAt: p.ai_summary_generated_at,
    // Denormalized display fields
    createdByName: p.created_by_user?.name || '',
    createdByRole: p.created_by_user?.role || '',
    mitraName: p.mitra_rel?.nama_instansi || '',
    unitName: p.unit_kerja_rel?.nama_unit || '',
    // Documents & History
    documents: (p.documents || []).map((d: any) => ({
      id: d.id,
      name: d.name,
      type: d.type,
      size: d.size,
      uploadedAt: d.uploaded_at,
      url: d.url,
      category: d.category,
    })),
    approvalHistory: (p.approval_history || []).map((h: any) => ({
      id: h.id,
      proposalId: p.id,
      action: h.action,
      actor: h.actor_id,
      actorName: h.actor_name,
      actorRole: h.actor_role,
      tahapan: h.tahapan,
      comment: h.comment,
      timestamp: h.timestamp,
      documentUrl: h.document_id,
    })),
    // Tracking paraf & tanda tangan (sequential)
    pimpinanUnitApprovalBy: p.pimpinan_unit_approval_by,
    pimpinanUnitApprovalAt: p.pimpinan_unit_approval_at,
    dkuiApprovalBy: p.dkui_approval_by,
    dkuiApprovalAt: p.dkui_approval_at,
    biroHukumParafBy: p.biro_hukum_paraf_by,
    biroHukumParafAt: p.biro_hukum_paraf_at,
    suParafBy: p.su_paraf_by,
    suParafAt: p.su_paraf_at,
    wrParafBy: p.wr_paraf_by,
    wrParafAt: p.wr_paraf_at,
    rektorSignedBy: p.rektor_signed_by,
    rektorSignedAt: p.rektor_signed_at,
    pimpinanUnitSignedBy: p.pimpinan_unit_signed_by,
    pimpinanUnitSignedAt: p.pimpinan_unit_signed_at,
    mitraSignedBy: p.mitra_signed_by,
    mitraSignedAt: p.mitra_signed_at,
    // Timestamps
    createdAt: p.created_at,
    updatedAt: p.updated_at,
    submittedAt: p.submitted_at,
    completedAt: p.completed_at,
    rejectedAt: p.rejected_at,
    archivedAt: p.archived_at,
  }
}

// ============================================
// GET - Read all proposals
// ============================================
export async function GET() {
  try {
    const { data: proposals, error } = await supabaseAdmin
      .from('proposals')
      .select(`
        *,
        created_by_user:users!proposals_created_by_fkey(name, role, institution),
        mitra_rel:mitra!proposals_mitra_id_fkey(nama_instansi),
        unit_kerja_rel:unit_kerja!proposals_unit_terkait_id_fkey(nama_unit),
        documents(id, name, type, size, category, uploaded_at, url),
        approval_history(id, action, actor_id, actor_name, actor_role, tahapan, comment, timestamp, document_id)
      `)
      .order('created_at', { ascending: false })

    if (error) {
      console.error("Error reading proposals:", error)
      return NextResponse.json([], { status: 500 })
    }

    const transformed = (proposals || []).map(transformProposal)
    return NextResponse.json(transformed)
  } catch (error) {
    console.error("Error reading proposals:", error)
    return NextResponse.json([], { status: 500 })
  }
}

// ============================================
// POST - Create new proposal
// ============================================
export async function POST(request: NextRequest) {
  try {
    const body: Partial<Proposal> = await request.json()

    const { data, error } = await supabaseAdmin
      .from('proposals')
      .insert({
        initiator: body.initiator || 'internal',
        title: body.title || '',
        jenis_dokumen: body.jenisDokumen,
        mitra_id: body.mitraId,
        inisiator_id: body.inisiatorId,
        unit_terkait_id: body.unitTerkaitId,
        created_by: body.createdBy,
        description: body.description,
        objectives: body.objectives,
        benefits: body.benefits,
        scope_of_work: body.scopeOfWork,
        ruang_lingkup: body.ruangLingkup,
        bentuk_kegiatan_lapkerma: body.bentukKegiatanLapkerma,
        file_berita_acara_penjajakan: body.fileBeritaAcaraPenjajakan,
        file_surat_kuasa: body.fileSuratKuasa,
        penandatangan_upi: body.penandatanganUpi,
        is_income_generating: body.isIncomeGenerating ?? false,
        duration: body.duration,
        start_date: body.startDate,
        end_date: body.endDate,
        budget: body.budget,
        status: body.status || 'draft',
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating proposal:", error)
      return NextResponse.json({ error: "Failed to create proposal" }, { status: 500 })
    }

    return NextResponse.json(transformProposal(data), { status: 201 })
  } catch (error) {
    console.error("Error creating proposal:", error)
    return NextResponse.json({ error: "Failed to create proposal" }, { status: 500 })
  }
}

// ============================================
// PUT - Update proposal
// ============================================
export async function PUT(request: NextRequest) {
  try {
    const { id, updates } = await request.json()

    // Map camelCase frontend fields → snake_case DB columns
    const fieldMap: Record<string, string> = {
      status: 'status',
      jenisDokumen: 'jenis_dokumen',
      mitraId: 'mitra_id',
      inisiatorId: 'inisiator_id',
      unitTerkaitId: 'unit_terkait_id',
      description: 'description',
      objectives: 'objectives',
      benefits: 'benefits',
      scopeOfWork: 'scope_of_work',
      ruangLingkup: 'ruang_lingkup',
      bentukKegiatanLapkerma: 'bentuk_kegiatan_lapkerma',
      fileBeritaAcaraPenjajakan: 'file_berita_acara_penjajakan',
      fileSuratKuasa: 'file_surat_kuasa',
      fileNaskahFinal: 'file_naskah_final',
      penandatanganUpi: 'penandatangan_upi',
      isIncomeGenerating: 'is_income_generating',
      duration: 'duration',
      startDate: 'start_date',
      endDate: 'end_date',
      budget: 'budget',
      revisionType: 'revision_type',
      revisionReason: 'revision_reason',
      aiSummary: 'ai_summary',
      aiSummaryGeneratedAt: 'ai_summary_generated_at',
      // Tracking paraf & tanda tangan
      pimpinanUnitApprovalBy: 'pimpinan_unit_approval_by',
      pimpinanUnitApprovalAt: 'pimpinan_unit_approval_at',
      dkuiApprovalBy: 'dkui_approval_by',
      dkuiApprovalAt: 'dkui_approval_at',
      biroHukumParafBy: 'biro_hukum_paraf_by',
      biroHukumParafAt: 'biro_hukum_paraf_at',
      suParafBy: 'su_paraf_by',
      suParafAt: 'su_paraf_at',
      wrParafBy: 'wr_paraf_by',
      wrParafAt: 'wr_paraf_at',
      rektorSignedBy: 'rektor_signed_by',
      rektorSignedAt: 'rektor_signed_at',
      pimpinanUnitSignedBy: 'pimpinan_unit_signed_by',
      pimpinanUnitSignedAt: 'pimpinan_unit_signed_at',
      mitraSignedBy: 'mitra_signed_by',
      mitraSignedAt: 'mitra_signed_at',
      // Timestamps
      submittedAt: 'submitted_at',
      completedAt: 'completed_at',
      rejectedAt: 'rejected_at',
      archivedAt: 'archived_at',
    }

    const dbUpdates: Record<string, any> = {}
    for (const [camel, snake] of Object.entries(fieldMap)) {
      if (updates[camel] !== undefined) {
        dbUpdates[snake] = updates[camel]
      }
    }

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

    return NextResponse.json(transformProposal(data))
  } catch (error) {
    console.error("Error updating proposal:", error)
    return NextResponse.json({ error: "Failed to update proposal" }, { status: 500 })
  }
}

// ============================================
// DELETE - Delete proposal
// ============================================
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
