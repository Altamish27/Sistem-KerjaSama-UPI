import { NextResponse } from "next/server";
import { readCoreDb, writeCoreDb } from "@/lib/core-db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function validateCoreDbShape(data: unknown): { valid: boolean; message?: string } {
  if (!isObject(data)) return { valid: false, message: "Format core-db tidak valid." };

  const requiredKeys = [
    "partners",
    "pengajuan_kerjasama",
    "dokumen_kerjasama",
    "review_histories",
    "signature_profiles",
    "signature_logs",
    "units",
    "users",
  ];

  for (const key of requiredKeys) {
    if (!(key in data)) {
      return { valid: false, message: `Field ${key} wajib ada.` };
    }
    if (!Array.isArray((data as Record<string, unknown>)[key])) {
      return { valid: false, message: `Field ${key} wajib berupa array.` };
    }
  }

  return { valid: true };
}

export async function GET() {
  try {
    const db = await readCoreDb();
    return NextResponse.json(db, { status: 200 });
  } catch (error) {
    console.error("Failed to load core db", error);
    return NextResponse.json({ message: "Gagal memuat data inti." }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = (await request.json()) as {
      actorRole?: string;
      data?: unknown;
    };

    if (body.actorRole !== "admin") {
      return NextResponse.json({ message: "Hanya admin yang dapat mengubah data inti." }, { status: 403 });
    }

    const validation = validateCoreDbShape(body.data);
    if (!validation.valid) {
      return NextResponse.json({ message: validation.message || "Data inti tidak valid." }, { status: 400 });
    }

    await writeCoreDb(body.data as Awaited<ReturnType<typeof readCoreDb>>);
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Failed to save core db", error);
    return NextResponse.json({ message: "Gagal menyimpan data inti." }, { status: 500 });
  }
}
