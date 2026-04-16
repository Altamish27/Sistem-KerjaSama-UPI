import { NextResponse } from "next/server";
import { mapDbUserToSessionUser, readCoreDb } from "@/lib/core-db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body as { email?: string; password?: string };

    if (!email || !password) {
      return NextResponse.json({ message: "Email dan password wajib diisi" }, { status: 400 });
    }

    const db = await readCoreDb();
    const users = db.users.map((u) => mapDbUserToSessionUser(u));

    const matched = users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password,
    );

    if (!matched) {
      return NextResponse.json({ message: "Email atau password salah" }, { status: 401 });
    }

    // Untuk prototipe, kirim kembali seluruh user (termasuk password) agar cocok dengan tipe User di frontend
    return NextResponse.json(matched, { status: 200 });
  } catch (error) {
    console.error("Failed to login user", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan saat login" },
      { status: 500 },
    );
  }
}
