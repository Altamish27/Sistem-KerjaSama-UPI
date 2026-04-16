import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import {
  createGuestSubmission,
  readCoreDb,
  toPublicProposalRecord,
  writeCoreDb,
} from "@/lib/core-db";
import { getStage, normalizeWorkflowStage, ROLE_LABEL } from "@/lib/workflow";
import { readWorkflowConfig } from "@/lib/workflow-config-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "proposals");

// GET: daftar seluruh pengajuan publik (untuk dashboard DKUI)
export async function GET() {
  try {
    const db = await readCoreDb();
    const config = await readWorkflowConfig();

    let mutated = false;
    db.dokumen_kerjasama = db.dokumen_kerjasama.map((doc) => {
      const stageId = normalizeWorkflowStage(doc.current_stage_id, config.stages);
      const stage = getStage(stageId, config.stages);
      const actorRole = stage.actorRole;
      const actorLabel = actorRole === "system" ? "System" : ROLE_LABEL[actorRole];

      if (
        doc.current_stage_id !== stageId ||
        doc.current_stage_actor_role !== actorRole ||
        doc.current_stage_actor_label !== actorLabel
      ) {
        mutated = true;
        return {
          ...doc,
          current_stage_id: stageId,
          current_stage_actor_role: actorRole,
          current_stage_actor_label: actorLabel,
        };
      }

      return doc;
    });

    if (mutated) {
      await writeCoreDb(db);
    }

    const records = db.dokumen_kerjasama
      .map((doc) => toPublicProposalRecord(db, doc))
      .filter((item) => item !== null);
    return NextResponse.json(records, { status: 200 });
  } catch (error) {
    console.error("Failed to list public proposals", error);
    return NextResponse.json(
      { message: "Gagal memuat data pengajuan" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    const partnerName = String(formData.get("partnerName") || "").trim();
    const address = String(formData.get("address") || "").trim();
    const contactPerson = String(formData.get("contactPerson") || "").trim();
    const contactPosition = String(formData.get("contactPosition") || "").trim();
    const phone = String(formData.get("phone") || "").trim();
    const companyEmail = String(formData.get("companyEmail") || "").trim();
    const title = String(formData.get("title") || "").trim();
    const purpose = String(formData.get("purpose") || "").trim();
    const cooperationType = String(formData.get("cooperationType") || "").trim();
    const scope = String(formData.get("scope") || "").trim();

    if (
      !partnerName ||
      !address ||
      !contactPerson ||
      !phone ||
      !companyEmail ||
      !title ||
      !purpose ||
      !cooperationType ||
      !scope
    ) {
      return NextResponse.json(
        { message: "Field wajib belum lengkap" },
        { status: 400 },
      );
    }

    let storedFilePath: string | undefined;

    const file = formData.get("file");
    if (file && file instanceof File) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const safeName = file.name.replace(/[^a-zA-Z0-9_.-]/g, "_");
      const fileName = `${Date.now()}_${safeName}`;

      await fs.mkdir(UPLOAD_DIR, { recursive: true });
      const fullPath = path.join(UPLOAD_DIR, fileName);
      await fs.writeFile(fullPath, buffer);

      // Path yang disimpan di JSON, relatif dari public
      storedFilePath = `/uploads/proposals/${fileName}`;
    }

    const db = await readCoreDb();

    const created = createGuestSubmission({
      partnerName,
      address,
      contactPerson,
      phone,
      companyEmail,
      title,
      purpose,
      filePath: storedFilePath,
    });

    db.partners.push(created.partner);
    db.pengajuan_kerjasama.push(created.pengajuan);
    db.dokumen_kerjasama.push(created.dokumen);

    await writeCoreDb(db);

    return NextResponse.json({ success: true, id: created.dokumen.id }, { status: 201 });
  } catch (error) {
    console.error("Failed to handle public proposal submit", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan saat menyimpan pengajuan" },
      { status: 500 },
    );
  }
}
