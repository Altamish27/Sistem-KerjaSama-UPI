import { NextRequest, NextResponse } from "next/server"
import { writeFile, mkdir } from "fs/promises"
import path from "path"

// Konfigurasi max body size untuk Next.js App Router
export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 })
    }

    // Validasi ukuran file (max 10MB)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      return NextResponse.json({ error: "File too large (max 10MB)" }, { status: 400 })
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Create unique filename
    const timestamp = Date.now()
    const randomStr = Math.random().toString(36).substring(2, 9)
    const ext = path.extname(file.name)
    const filename = `${timestamp}-${randomStr}${ext}`

    // Ensure uploads directory exists
    const uploadsDir = path.join(process.cwd(), "public", "uploads")
    try {
      await mkdir(uploadsDir, { recursive: true })
    } catch (error) {
      // Directory might already exist, that's okay
    }

    // Save file
    const filepath = path.join(uploadsDir, filename)
    await writeFile(filepath, buffer)

    // Return file info
    return NextResponse.json({
      success: true,
      file: {
        id: `FILE-${timestamp}-${randomStr}`,
        name: file.name,
        savedName: filename,
        type: file.type,
        size: file.size,
        url: `/uploads/${filename}`,
        uploadedAt: new Date().toISOString(),
      },
    })
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json({ error: "Upload failed" }, { status: 500 })
  }
}
