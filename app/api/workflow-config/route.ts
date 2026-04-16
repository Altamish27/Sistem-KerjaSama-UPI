import { NextResponse } from "next/server";
import { readWorkflowConfig, validateWorkflowConfig, writeWorkflowConfig } from "@/lib/workflow-config-server";
import type { WorkflowConfig } from "@/lib/workflow";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const config = await readWorkflowConfig();
    return NextResponse.json(config, { status: 200 });
  } catch (error) {
    console.error("Failed to load workflow config", error);
    return NextResponse.json({ message: "Gagal memuat konfigurasi alur." }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = (await request.json()) as {
      actorRole?: string;
      config?: WorkflowConfig;
    };

    if (body.actorRole !== "admin") {
      return NextResponse.json({ message: "Hanya admin yang dapat mengubah alur." }, { status: 403 });
    }

    const validation = validateWorkflowConfig(body.config);
    if (!validation.valid) {
      return NextResponse.json({ message: validation.message || "Konfigurasi alur tidak valid." }, { status: 400 });
    }

    await writeWorkflowConfig(body.config as WorkflowConfig);
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Failed to save workflow config", error);
    return NextResponse.json({ message: "Gagal menyimpan konfigurasi alur." }, { status: 500 });
  }
}
