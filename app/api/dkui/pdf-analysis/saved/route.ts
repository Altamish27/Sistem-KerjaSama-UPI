import fs from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const STORAGE_PATH = path.join(process.cwd(), "data", "core-db", "pdf_analysis_results.json");

type AnalysisType = "summary" | "chat";

interface SavedPdfAnalysis {
  id: string;
  documentId: string;
  type: AnalysisType;
  question: string | null;
  answer: string;
  model: string;
  createdAt: string;
}

interface SavePayload {
  documentId?: string;
  type?: AnalysisType;
  question?: string | null;
  answer?: string;
  model?: string;
}

async function readStorage(): Promise<SavedPdfAnalysis[]> {
  try {
    const raw = await fs.readFile(STORAGE_PATH, "utf-8");
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? (parsed as SavedPdfAnalysis[]) : [];
  } catch (error: unknown) {
    const code = typeof error === "object" && error && "code" in error ? (error as { code?: string }).code : undefined;
    if (code === "ENOENT") {
      return [];
    }
    throw error;
  }
}

async function writeStorage(rows: SavedPdfAnalysis[]) {
  await fs.mkdir(path.dirname(STORAGE_PATH), { recursive: true });
  await fs.writeFile(STORAGE_PATH, JSON.stringify(rows, null, 2), "utf-8");
}

export async function GET(req: NextRequest) {
  try {
    const documentId = req.nextUrl.searchParams.get("documentId")?.trim();
    if (!documentId) {
      return NextResponse.json({ message: "documentId wajib diisi" }, { status: 400 });
    }

    const rows = await readStorage();
    const filtered = rows
      .filter((row) => row.documentId === documentId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json(filtered, { status: 200 });
  } catch (error) {
    console.error("Failed to load saved PDF analysis", error);
    return NextResponse.json({ message: "Gagal memuat hasil tersimpan" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as SavePayload;

    const documentId = body.documentId?.trim();
    const answer = body.answer?.trim();
    const type = body.type;
    const model = body.model?.trim();

    if (!documentId || !answer || !type || !model) {
      return NextResponse.json({ message: "Parameter penyimpanan tidak lengkap" }, { status: 400 });
    }

    if (type !== "summary" && type !== "chat") {
      return NextResponse.json({ message: "Tipe hasil tidak valid" }, { status: 400 });
    }

    const rows = await readStorage();

    const duplicate = rows.find(
      (row) =>
        row.documentId === documentId &&
        row.type === type &&
        (row.question || "") === (body.question?.trim() || "") &&
        row.answer === answer,
    );

    if (duplicate) {
      return NextResponse.json(duplicate, { status: 200 });
    }

    const created: SavedPdfAnalysis = {
      id: randomUUID(),
      documentId,
      type,
      question: body.question?.trim() || null,
      answer,
      model,
      createdAt: new Date().toISOString(),
    };

    rows.push(created);
    await writeStorage(rows);

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error("Failed to save PDF analysis", error);
    return NextResponse.json({ message: "Gagal menyimpan hasil analisis" }, { status: 500 });
  }
}
