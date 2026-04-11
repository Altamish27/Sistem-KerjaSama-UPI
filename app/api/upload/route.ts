import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/admin"

// Konfigurasi max body size untuk Next.js App Router
export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File
    const proposalId = formData.get("proposalId") as string | null
    const category = formData.get("category") as string || "initial"

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 })
    }

    // Validasi ukuran file (max 10MB)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      return NextResponse.json({ error: "File too large (max 10MB)" }, { status: 400 })
    }

    // Generate storage path yang terorganisir
    const timestamp = Date.now()
    const randomStr = Math.random().toString(36).substring(2, 9)
    const year = new Date().getFullYear()
    const month = String(new Date().getMonth() + 1).padStart(2, '0')
    const fileExt = file.name.split('.').pop()
    // Jika belum ada proposalId (draft baru), simpan di folder drafts/
    const folder = proposalId || 'drafts'
    const storagePath = `${year}/${month}/${folder}/${category}/${timestamp}_${randomStr}.${fileExt}`

    // Upload ke Supabase Storage
    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from('proposal-documents')
      .upload(storagePath, file, {
        contentType: file.type,
        cacheControl: '3600',
        upsert: false,
      })

    if (uploadError) {
      console.error("Upload error:", uploadError)
      return NextResponse.json({ error: "Upload failed" }, { status: 500 })
    }

    // Get public URL
    const { data: { publicUrl } } = supabaseAdmin.storage
      .from('proposal-documents')
      .getPublicUrl(storagePath)

    // Jika ada proposalId, simpan metadata ke database
    if (proposalId) {
      const { data: docData, error: docError } = await supabaseAdmin
        .from('documents')
        .insert({
          proposal_id: proposalId,
          name: file.name,
          type: file.type,
          size: file.size,
          storage_path: storagePath,
          url: publicUrl,
          category: category,
          uploaded_by: null,
          version: 1,
          is_current: true,
        })
        .select()
        .single()

      if (docError) {
        // Rollback: delete uploaded file
        await supabaseAdmin.storage.from('proposal-documents').remove([storagePath])
        console.error("Database error:", docError)
        return NextResponse.json({ error: "Failed to save file metadata" }, { status: 500 })
      }

      return NextResponse.json({
        success: true,
        file: {
          id: docData.id,
          name: file.name,
          savedName: storagePath.split('/').pop(),
          type: file.type,
          size: file.size,
          url: publicUrl,
          storagePath: storagePath,
          uploadedAt: new Date().toISOString(),
        },
      })
    }

    // Tanpa proposalId (draft baru) — return URL saja, metadata disimpan nanti
    return NextResponse.json({
      success: true,
      file: {
        id: `temp-${timestamp}`,
        name: file.name,
        savedName: storagePath.split('/').pop(),
        type: file.type,
        size: file.size,
        url: publicUrl,
        storagePath: storagePath,
        uploadedAt: new Date().toISOString(),
      },
    })
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json({ error: "Upload failed" }, { status: 500 })
  }
}
