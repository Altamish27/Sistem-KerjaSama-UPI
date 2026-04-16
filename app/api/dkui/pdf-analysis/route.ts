import fs from "node:fs/promises";
import path from "node:path";
import { NextRequest, NextResponse } from "next/server";
import { readCoreDb } from "@/lib/core-db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const PYTHON_API_BASE_URL = process.env.PYTHON_PDF_API_BASE_URL || "http://127.0.0.1:8000";

interface PdfAnalysisRequest {
  documentId?: string;
  question?: string;
}

function buildPublicFilePath(fileUrl: string): string {
  const publicDir = path.resolve(process.cwd(), "public");
  const relativePath = fileUrl.replace(/^\/+/, "");
  const absolutePath = path.resolve(publicDir, relativePath);

  if (!absolutePath.startsWith(publicDir + path.sep) && absolutePath !== publicDir) {
    throw new Error("Lokasi file tidak valid");
  }

  return absolutePath;
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as PdfAnalysisRequest;
    const documentId = body.documentId?.trim();

    if (!documentId) {
      return NextResponse.json({ message: "documentId wajib diisi" }, { status: 400 });
    }

    const db = await readCoreDb();
    const dokumen = db.dokumen_kerjasama.find((item) => item.id === documentId);

    if (!dokumen) {
      return NextResponse.json({ message: "Dokumen tidak ditemukan" }, { status: 404 });
    }

    if (!dokumen.file_url) {
      return NextResponse.json({ message: "Dokumen belum memiliki file PDF" }, { status: 400 });
    }

    const filePath = buildPublicFilePath(dokumen.file_url);
    const fileBuffer = await fs.readFile(filePath);
    const fileName = path.basename(filePath);

    const form = new FormData();
    form.append("file", new Blob([fileBuffer], { type: "application/pdf" }), fileName);
    form.append(
      "question",
      body.question?.trim() ||
        "Buat ringkasan dokumen ini dalam Bahasa Indonesia. Jelaskan isi utama, tujuan, pihak terlibat, ruang lingkup, dan poin penting secara bullet points.",
    );

    const upstreamResponse = await fetch(`${PYTHON_API_BASE_URL}/pdf/chat`, {
      method: "POST",
      body: form,
      cache: "no-store",
    });

    const raw = await upstreamResponse.text();
    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      parsed = { raw };
    }

    if (!upstreamResponse.ok) {
      return NextResponse.json(
        {
          message: "Gagal menganalisis PDF dari service Python",
          upstreamStatus: upstreamResponse.status,
          detail: parsed,
        },
        { status: 502 },
      );
    }

    return NextResponse.json(parsed, { status: 200 });
  } catch (error) {
    console.error("PDF analysis error:", error);
    return NextResponse.json(
      {
        message: "Terjadi kesalahan saat menganalisis PDF",
      },
      { status: 500 },
    );
  }
}
