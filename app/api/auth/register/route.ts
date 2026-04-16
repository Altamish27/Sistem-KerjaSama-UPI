import { NextResponse } from "next/server";
import { createDbUser, readCoreDb, writeCoreDb } from "@/lib/core-db";
import type { AppRole } from "@/lib/workflow";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password, role, institution, fakultas } = body as {
      name?: string;
      email?: string;
      password?: string;
      role?: AppRole;
      institution?: string;
      fakultas?: string;
    };

    if (!name || !email || !password || !role) {
      return NextResponse.json({ message: "Data tidak lengkap" }, { status: 400 });
    }

    const db = await readCoreDb();
    const users = db.users;

    const exists = users.some((u) => u.email.toLowerCase() === email.toLowerCase());
    if (exists) {
      return NextResponse.json({ message: "Email sudah terdaftar" }, { status: 409 });
    }

    const newUser = createDbUser({
      name,
      email,
      password,
      role,
      unit: fakultas || institution || undefined,
    });

    db.users.push(newUser);
    await writeCoreDb(db);

    return NextResponse.json({ id: newUser.id }, { status: 201 });
  } catch (error) {
    console.error("Failed to register user", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan saat registrasi" },
      { status: 500 },
    );
  }
}
