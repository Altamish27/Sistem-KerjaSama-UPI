# Context & Objective

[cite_start]I need to refactor an existing Next.js 14 App Router project (Simkerma UPI) to comply strictly with the official university regulation (Peraturan Rektor No. 019 Tahun 2022) [cite: 44, 46, 47, 48, 50, 51] and Kemdikbudristek Lapkerma reporting standards.

Currently, the system's workflow, roles, and database schema deviate from the standard operating procedure. We need to restructure the database, update TypeScript types, and rewrite the workflow engine (`lib/workflow-engine.ts`) to match a strict sequential approval process and handle two distinct signing scenarios.

Please execute this refactoring step-by-step. Do not proceed to the next phase until the current phase is fully implemented and tested.

---

## Phase 1: Database Schema & Supabase Migrations

Create a new SQL migration file to apply the following changes to our Supabase PostgreSQL database:

1. **Update Enums (`user_role` & `proposal_status`):**
   - [cite_start]Add new role: `sekretaris_universitas` (SU)[cite: 87, 229].
   - [cite_start]Rename role `fakultas` to `pimpinan_unit`[cite: 91].
   - Remove parallel signing statuses. The new flow is STRICTLY sequential.
   - Add specific statuses for SU: `su_reviewing`, `su_approved` (paraf), `su_rejected`.

2. **Create New Table: `pengajuan_penjajakan` (Guest Mode Bucket):**
   - Move the "Public Submission" logic out of the `proposals` table.
   - Fields: `id`, `mitra_id`, `judul_tawaran`, `deskripsi_singkat`, `file_legalitas`, `file_profil_mitra`, `status_pengajuan` (Pending, Ditolak, Diteruskan), `created_at`.

3. **Modify `proposals` (dokumen_kerjasama) Table:**
   - [cite_start]Add `jenis_dokumen` ENUM ('MoU', 'MoA/PKS', 'IA')[cite: 95, 96, 116].
   - Add Lapkerma integration fields: `bentuk_kegiatan_lapkerma` (VARCHAR).
   - [cite_start]Add `file_berita_acara_penjajakan` (TEXT/URL) - Mandatory before drafting[cite: 241].
   - [cite_start]Add `is_income_generating` (BOOLEAN)[cite: 129].
   - [cite_start]Add `file_surat_kuasa` (TEXT/URL) - Mandatory if signed by Pimpinan Unit[cite: 214, 284].
   - Add tracking for SU: `su_paraf_by` (UUID), `su_paraf_at` (TIMESTAMPTZ).
   - Change table concept: The `proposals` table should only be populated AFTER DKUI and Pimpinan Unit accept the `pengajuan_penjajakan` and designate an internal initiator.

4. **Modify `users` / `mitra` Data:**
   - Ensure the partner/mitra table has Lapkerma required fields: `nama_penandatangan`, `jabatan_penandatangan`, `nama_pic`, `kontak_pic`.

5. **Create New Table: `pendanaan`:**
   - [cite_start]To track income-generating agreements[cite: 129, 370].
   - [cite_start]Fields: `id`, `proposal_id` (FK), `nilai_kontrak` (BIGINT), `biaya_pengembangan_institusi` (BIGINT - max 15%), `rekening_penerima`, `status_pembayaran`[cite: 372].

---

## Phase 2: TypeScript Types & Global Store

Refactor `/lib/supabase/database.types.ts` and `/lib/mock-data.ts` to reflect the schema changes in Phase 1.

- Update the `Proposal` interface to include the new Lapkerma fields and `is_income_generating` flag.
- Add interfaces for `PengajuanPenjajakan` and `Pendanaan`.
- Update the `DataStoreContext` (`/lib/data-store.tsx`) to handle fetching and state management for the new `pengajuan_penjajakan` table.

---

## Phase 3: Rewrite Workflow Engine (`lib/workflow-engine.ts`)

The current parallel signing logic is WRONG. Rewrite the state machine based on these TWO strictly sequential paths:

**Path A: Tanda Tangan Rektor (Strategic Documents)**

1. [cite_start]Draft Uploaded (requires `file_berita_acara_penjajakan`)[cite: 241].
2. [cite_start]Review Pimpinan Unit -> IF Reject: Revisions[cite: 262, 263].
3. [cite_start]Review DKUI -> IF Reject: Revisions[cite: 210, 222].
4. [cite_start]Review Biro Hukum -> IF Reject: Revisions[cite: 211].
5. [cite_start]Review Sekretaris Universitas (SU) -> IF Reject: Revisions[cite: 229, 282].
6. [cite_start]Paraf Wakil Rektor (WR RUK) -> IF Reject: Revisions[cite: 285].
7. [cite_start]TTE Rektor[cite: 159, 288].
8. Tanda Tangan Mitra -> Archive.

**Path B: Tanda Tangan Pimpinan Unit (Delegated / Surat Kuasa)**
_Triggered if `file_surat_kuasa` is provided._

1. [cite_start]Draft Uploaded (requires `file_berita_acara_penjajakan`)[cite: 241].
2. Review Pimpinan Unit -> IF Reject: Revisions.
3. [cite_start]Review DKUI -> IF Reject: Revisions[cite: 284].
4. [cite_start]Review Biro Hukum (MUST validate `file_surat_kuasa`) -> IF Reject: Revisions[cite: 284].
5. [cite_start]**[SKIPS SU, WR, and REKTOR]** [cite: 284] [cite_start]-> TTE Pimpinan Unit[cite: 288].
6. Tanda Tangan Mitra -> Archive.

[cite_start]_Note on Revisions:_ If ANY node rejects, the status goes to `dkui_self_revising` (DKUI acts as legal drafter to fix it), then requires `mitra_resubmitted` (Persetujuan Ulang), before looping back to `Review Pimpinan Unit`[cite: 283, 285].

---

## Phase 4: Refactor Frontend Forms & Dashboards

1. **Public Submission Form (`/submit-proposal`):**
   - Point the submission endpoint to the new `pengajuan_penjajakan` table, NOT the main `proposals` table.
2. **Proposal Draft Form (`/dashboard/proposals/new`):**
   - [cite_start]Add a mandatory file upload for "Berita Acara Penjajakan"[cite: 241].
   - Add a toggle for "Income Generating?" (triggers `pendanaan` fields).
   - Add Lapkerma mandatory fields (Bentuk Kegiatan, Jabatan Penandatangan Mitra).
   - [cite_start]Add optional upload for "Surat Kuasa Rektor" (which dictates the workflow path)[cite: 214].
3. **Dashboards:**
   - Create a new view/tab for `DKUI` to manage "Inbox Penjajakan Guest" before converting them to official proposals.
   - [cite_start]Create a specific dashboard for the new `Sekretaris Universitas` role to view their approval queue[cite: 229].
