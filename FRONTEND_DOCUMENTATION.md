# 📖 Dokumentasi Frontend Lengkap
# Sistem Kerja Sama UPI

> **Tujuan dokumen ini:** Panduan teknis bagi developer agar mudah memahami alur halaman, komponen yang dipakai di setiap halaman, dan titik integrasi backend.

---

## 📦 Stack & Library yang Digunakan

| Library | Versi | Kegunaan |
|---|---|---|
| **Next.js** | 14+ (App Router) | Framework utama, routing halaman |
| **TypeScript** | 5+ | Tipe data yang aman |
| **Tailwind CSS** | 3+ | Styling utility-first |
| **Shadcn UI** | Latest | Komponen UI siap pakai (Button, Card, dll) |
| **Lucide React** | Latest | Ikon-ikon |
| **Framer Motion** | Latest | Animasi |
| **Supabase-js** | 2+ | Database & Auth client |
| **Vercel Analytics** | Latest | Tracking penggunaan |

---

## 🏗️ Arsitektur Folder

```
app/                          ← Semua HALAMAN (URL-based routing)
├── layout.tsx                ← Root Layout: wrap AuthProvider + DataStoreProvider
├── page.tsx                  ← Landing Page (/)
├── login/page.tsx            ← Halaman Login (/login)
├── register/page.tsx         ← Halaman Registrasi (/register)
├── submit-proposal/page.tsx  ← Form publik mitra (/submit-proposal)
├── playground/page.tsx       ← Halaman dev/testing (/playground)
├── dashboard/
│   ├── page.tsx              ← Dashboard Router (/dashboard)
│   ├── proposals/
│   │   ├── page.tsx          ← Daftar Proposal (/dashboard/proposals)
│   │   ├── new/page.tsx      ← Form Proposal Baru (/dashboard/proposals/new)
│   │   └── [id]/page.tsx     ← Detail Proposal (/dashboard/proposals/[id])
│   └── review/page.tsx       ← Halaman Review (/dashboard/review)
└── api/                      ← API Routes (Server-side)
    ├── register/             ← POST /api/register
    ├── proposals/            ← GET|POST /api/proposals
    ├── approval/             ← POST /api/approval
    ├── upload/               ← POST /api/upload
    ├── public-proposal/      ← POST /api/public-proposal
    ├── create-mitra-account/ ← POST /api/create-mitra-account
    ├── send-welcome/         ← POST /api/send-welcome
    ├── send-confirmation/    ← POST /api/send-confirmation
    └── send-credentials/     ← POST /api/send-credentials

components/
├── dashboard-baru/           ← View per Role (Hasil refactoring)
│   ├── mitra-dashboard-baru.tsx
│   ├── fakultas-dashboard-baru.tsx
│   ├── biro-hukum-dashboard-baru.tsx
│   └── supervisi-dashboard-baru.tsx
├── landing-baru/             ← Komponen Landing Page (Hasil refactoring)
│   ├── header-baru.tsx
│   ├── hero-baru.tsx
│   ├── stats-baru.tsx
│   ├── features-baru.tsx
│   ├── workflow-baru.tsx
│   ├── partners-baru.tsx
│   └── footer-baru.tsx
├── ui/                       ← Base components Shadcn (jangan edit manual)
├── dashboard-layout.tsx      ← Sidebar + Header navigasi dashboard
├── dkui-statistics-dashboard.tsx ← Dashboard khusus DKUI
├── simple-tracker.tsx        ← Progress tracker workflow proposal
├── workflow-actions.tsx      ← Tombol aksi sesuai role & status
├── pdf-viewer.tsx            ← Preview dokumen PDF
├── comments-card.tsx         ← Kartu komentar/catatan proposal
├── protected-route.tsx       ← Guard: redirect ke /login jika belum auth
└── theme-provider.tsx        ← Provider dark/light mode

lib/
├── auth-context.tsx          ← AuthProvider: state user, login, logout
├── data-store.tsx            ← DataStoreProvider: state proposals (mock)
├── mock-data.ts              ← Data dummy & type definitions
├── workflow-engine.ts        ← Logic alur kerja (siapa boleh aksi apa)
├── workflow-data.ts          ← Data definisi step-step workflow
├── email-service.ts          ← Helper kirim email notifikasi
└── supabase/                 ← Konfigurasi Supabase client & admin
```

---

## 🌊 Alur Aplikasi (User Journey)

### Alur 1: Mitra Eksternal Belum Punya Akun
```
Landing Page (/)
    └→ Klik "Ajukan Kerja Sama" (tanpa login)
        └→ /submit-proposal
            └→ Isi form + Upload dokumen
                └→ POST /api/public-proposal
                    └→ Email konfirmasi terkirim ke Mitra
                        └→ DKUI review di dashboard
                            └→ Jika disetujui → POST /api/create-mitra-account
                                └→ Mitra terima email kredensial login
```

### Alur 2: Mitra Login & Ajukan Proposal
```
/login → Input email & password
    └→ Supabase Auth validate
        └→ AuthContext.login() → simpan user state
            └→ Redirect ke /dashboard
                └→ DashboardContent deteksi role = "mitra"
                    └→ Render <MitraDashboardBaru />
                        └→ Klik "Ajukan Proposal Kerja Sama"
                            └→ /dashboard/proposals/new
                                └→ Isi form → Klik "Ajukan"
                                    └→ addProposal() → simpan ke DataStore
                                        └→ Redirect ke /dashboard/proposals
```

### Alur 3: DKUI Review Proposal
```
/login (role: dkui)
    └→ /dashboard → Render <DKUIStatisticsDashboard />
        └→ Klik proposal dari daftar
            └→ /dashboard/proposals/[id]
                └→ <WorkflowActions /> tampilkan tombol aksi sesuai status
                    └→ Klik aksi (contoh: "Terima Proposal")
                        └→ handleWorkflowAction()
                            └→ updateProposal() + addApprovalHistory()
                                └→ Status proposal berubah
                                    └→ Email notifikasi terkirim ke Mitra
```

---

## 📄 Detail Setiap Halaman

---

### 1. 🏠 Landing Page
**File:** `app/page.tsx`
**URL:** `/`
**Akses:** Publik (tanpa login)

**Tujuan:** Halaman promosi & pintu masuk sistem.

**Komponen yang Dipakai:**
| Komponen | File | Fungsi |
|---|---|---|
| `HeaderBaru` | `components/landing-baru/header-baru.tsx` | Navigasi atas (Login, Daftar, Ajukan) |
| `HeroBaru` | `components/landing-baru/hero-baru.tsx` | Banner utama & CTA |
| `StatsBaru` | `components/landing-baru/stats-baru.tsx` | Angka statistik UPI |
| `FeaturesBaru` | `components/landing-baru/features-baru.tsx` | Fitur-fitur unggulan sistem |
| `WorkflowBaru` | `components/landing-baru/workflow-baru.tsx` | Diagram alur kerja sama |
| `PartnersBaru` | `components/landing-baru/partners-baru.tsx` | Logo mitra yang sudah kerja sama |
| `FooterBaru` | `components/landing-baru/footer-baru.tsx` | Footer dengan link & kontak |

**Titik Integrasi Backend:**
> Saat ini tidak ada API call. Nanti bisa ditambahkan:
> - `GET /api/stats` → untuk mengisi data statistik di `StatsBaru`
> - `GET /api/partners` → untuk mengisi logo mitra di `PartnersBaru`

---

### 2. 🔐 Halaman Login
**File:** `app/login/page.tsx`
**URL:** `/login`
**Akses:** Publik

**Tujuan:** Autentikasi user ke dalam sistem.

**Komponen yang Dipakai:**
| Komponen | File | Fungsi |
|---|---|---|
| `Card, CardContent` | `components/ui/card.tsx` | Wadah form login |
| `Input` | `components/ui/input.tsx` | Field email & password |
| `Button` | `components/ui/button.tsx` | Tombol Login |
| `Alert` | `components/ui/alert.tsx` | Tampilkan error jika login gagal |

**Alur Logic:**
```
handleSubmit()
    └→ useAuth().login(email, password)
        └→ supabase.auth.signInWithPassword()
            └→ [sukses] fetch data user dari tabel `users`
                └→ AuthContext.setUser() → redirect /dashboard
            └→ [gagal] tampilkan pesan error
```

**Titik Integrasi Backend (sudah terhubung):**
- `supabase.auth.signInWithPassword()` — Supabase Auth
- Query tabel `users` di Supabase Database

---

### 3. 📝 Halaman Registrasi
**File:** `app/register/page.tsx`
**URL:** `/register`
**Akses:** Publik

**Tujuan:** Pendaftaran akun baru (Fakultas, Biro Hukum, Pimpinan).

**Komponen yang Dipakai:**
| Komponen | File | Fungsi |
|---|---|---|
| `Card` | `components/ui/card.tsx` | Wadah form register |
| `Input` | `components/ui/input.tsx` | Field nama, email, password |
| `Select` | `components/ui/select.tsx` | Dropdown pilih Role (Hak Akses) |
| `Button` | `components/ui/button.tsx` | Tombol Daftar |
| `Alert` | `components/ui/alert.tsx` | Tampilkan error |

**Alur Logic:**
```
handleSubmit()
    └→ POST /api/register (dengan JSON: name, email, password, role)
        └→ supabaseAdmin.auth.admin.createUser()
        └→ Insert ke tabel `users` di database
            └→ [sukses] redirect /login + tampilkan pesan sukses
            └→ [gagal 400] tampilkan error spesifik (ex: email sudah dipakai)
```

**Titik Integrasi Backend (sudah terhubung):**
- `POST /api/register` — `app/api/register/route.ts`

---

### 4. 📋 Halaman Submit Proposal Publik
**File:** `app/submit-proposal/page.tsx`
**URL:** `/submit-proposal`
**Akses:** Publik (tanpa login)

**Tujuan:** Mitra eksternal yang BELUM punya akun bisa mengajukan proposal awal.

**Komponen yang Dipakai:**
| Komponen | File | Fungsi |
|---|---|---|
| `Card` | `components/ui/card.tsx` | Section form |
| `Input` | `components/ui/input.tsx` | Field kontak & detail proposal |
| `Textarea` | `components/ui/textarea.tsx` | Field tujuan kerja sama |
| `Select` | `components/ui/select.tsx` | Pilih jenis dokumen (MoU/MoA/PKS/IA) |
| `Alert` | `components/ui/alert.tsx` | Tampilkan error/sukses |
| `Button` | `components/ui/button.tsx` | Tombol kirim & batal |

**Alur Logic:**
```
handleSubmit()
    └→ POST /api/public-proposal (data kontak + detail proposal)
        └→ [sukses] dapat proposalId
            └→ POST /api/upload (kirim file dokumen)
                └→ Halaman sukses → redirect ke / setelah 3 detik
        └→ [gagal] tampilkan error
```

**Titik Integrasi Backend:**
- `POST /api/public-proposal` — Simpan proposal publik
- `POST /api/upload` — Upload file dokumen

---

### 5. 📊 Dashboard (Router Utama)
**File:** `app/dashboard/page.tsx`
**URL:** `/dashboard`
**Akses:** Login required (semua role)

**Tujuan:** "Traffic Controller" — mendeteksi role dan menampilkan view yang tepat.

**Layout yang Dipakai:**
| Komponen | File | Fungsi |
|---|---|---|
| `ProtectedRoute` | `components/protected-route.tsx` | Cek apakah sudah login |
| `DashboardLayout` | `components/dashboard-layout.tsx` | Sidebar + Header navigasi |

**Routing per Role:**
| Role | Komponen yang Ditampilkan | File |
|---|---|---|
| `mitra` | `<MitraDashboardBaru />` | `components/dashboard-baru/mitra-dashboard-baru.tsx` |
| `fakultas` | `<FakultasDashboardBaru />` | `components/dashboard-baru/fakultas-dashboard-baru.tsx` |
| `dkui` | `<DKUIStatisticsDashboard />` | `components/dkui-statistics-dashboard.tsx` |
| `biro_hukum` | `<BiroHukumDashboardBaru />` | `components/dashboard-baru/biro-hukum-dashboard-baru.tsx` |
| `wakil_rektor` / `rektor` | `<SupervisiDashboardBaru />` | `components/dashboard-baru/supervisi-dashboard-baru.tsx` |

---

### 5a. Dashboard — Mitra
**File:** `components/dashboard-baru/mitra-dashboard-baru.tsx`

**Konten:**
- Statistik card: Draft, Dalam Proses, Selesai, Ditolak
- Daftar proposal yang butuh aksi dari Mitra
- Tracking progress proposal aktif (`<SimpleTracker />`)
- Catatan/komentar (`<CommentsCard />`)
- Daftar proposal terbaru

**Komponen Internal:**
| Komponen | Fungsi |
|---|---|
| `Card, CardContent` | Wadah statistik & daftar |
| `Badge` | Label status proposal |
| `SimpleTracker` | Bar progress status workflow |
| `CommentsCard` | Komentar/catatan dari reviewer |
| `useDataStore()` | Ambil data proposals (saat ini: mock) |
| `canUserTakeAction()` | Cek apakah mitra boleh aksi di status ini |

**Titik Integrasi Backend (Nanti ganti ini):**
```tsx
// Sekarang (mock):
const { proposals } = useDataStore()

// Nanti (real API):
const { data: proposals } = await fetch('/api/proposals?role=mitra&userId=' + user.id)
```

---

### 5b. Dashboard — Fakultas
**File:** `components/dashboard-baru/fakultas-dashboard-baru.tsx`

**Konten:**
- Statistik: Total, Menunggu Verifikasi, Aktif, Selesai
- List proposal yang butuh verifikasi Fakultas
- Tracking proposal aktif
- Semua proposal Fakultas

**Titik Integrasi Backend:**
```tsx
// Nanti ganti ini:
const { proposals } = useDataStore()
// Dengan:
const { data } = await fetch('/api/proposals?unit=' + user.unit)
```

---

### 5c. Dashboard — DKUI
**File:** `components/dkui-statistics-dashboard.tsx`

**Konten:**
- Statistik visual besar seluruh sistem
- Grafik/chart distribusi status
- Semua proposal untuk di-manage

**Titik Integrasi Backend:**
```tsx
// Nanti ganti dengan:
const { data: stats } = await fetch('/api/stats/overview')
const { data: proposals } = await fetch('/api/proposals?role=dkui')
```

---

### 5d. Dashboard — Biro Hukum
**File:** `components/dashboard-baru/biro-hukum-dashboard-baru.tsx`

**Konten:**
- Statistik: Total Review, Menunggu, Disetujui, Ditolak
- Dokumen yang butuh validasi legal
- Tracking dokumen dalam review
- Riwayat review

---

### 5e. Dashboard — Supervisi (Rektor/Warek)
**File:** `components/dashboard-baru/supervisi-dashboard-baru.tsx`

**Konten:**
- Statistik: Total, Menunggu Review, Dalam Review, Disetujui
- Proposal yang butuh tanda tangan digital/approval akhir
- Tracking proposal tahap supervisi

---

### 6. 📃 Daftar Proposal
**File:** `app/dashboard/proposals/page.tsx`
**URL:** `/dashboard/proposals`
**Akses:** Login required

**Tujuan:** User (khususnya Mitra) melihat semua proposal miliknya.

**Komponen yang Dipakai:**
| Komponen | Fungsi |
|---|---|
| `DashboardLayout` | Sidebar & Header |
| `Card, Badge` | Tampilan list item proposal |
| `useDataStore()` | Ambil daftar proposals |
| `useAuth()` | Filter berdasarkan `user.id` |

---

### 7. ✍️ Form Proposal Baru
**File:** `app/dashboard/proposals/new/page.tsx`
**URL:** `/dashboard/proposals/new`
**Akses:** Login required (Mitra & Fakultas)

**Tujuan:** Mengisi dan mengajukan proposal kerja sama yang lengkap.

**Komponen yang Dipakai:**
| Komponen | File | Fungsi |
|---|---|---|
| `Card` | `ui/card.tsx` | Wadah form |
| `Input` | `ui/input.tsx` | Judul, nama mitra, tanggal |
| `Textarea` | `ui/textarea.tsx` | Deskripsi, tujuan, manfaat, ruang lingkup |
| `Select` | `ui/select.tsx` | Jenis mitra, tingkat perjanjian, jenis dokumen |
| `Button` | `ui/button.tsx` | Simpan Draft & Ajukan |
| `Alert` | `ui/alert.tsx` | Tampilkan error validasi |

**Alur Logic:**
```
handleSubmit("draft" | "submitted")
    └→ Validasi semua field wajib
        └→ addProposal() → simpan ke DataStore
            └→ Jika role mitra & status submitted:
                └→ POST /api/send-welcome (kirim email)
            └→ Redirect ke /dashboard/proposals
```

**Titik Integrasi Backend (Nanti):**
```tsx
// Ganti addProposal() dengan:
await fetch('/api/proposals', {
  method: 'POST',
  body: JSON.stringify(newProposal)
})
```

---

### 8. 🔍 Detail Proposal
**File:** `app/dashboard/proposals/[id]/page.tsx`
**URL:** `/dashboard/proposals/[id]`
**Akses:** Login required (semua role)

**Tujuan:** Lihat detail lengkap proposal & lakukan aksi workflow.

**Komponen yang Dipakai:**
| Komponen | File | Fungsi |
|---|---|---|
| `SimpleTracker` | `components/simple-tracker.tsx` | Visualisasi progress tahapan |
| `WorkflowActions` | `components/workflow-actions.tsx` | Tombol aksi sesuai role & status |
| `PdfViewer` | `components/pdf-viewer.tsx` | Preview dokumen yang diupload |
| `Card, Badge` | `components/ui/` | Layout info proposal |

**Alur Logic Aksi:**
```
handleWorkflowAction(actionLabel, comment?)
    └→ getNextStatus(proposal.status, actionLabel) ← dari workflow-engine.ts
        └→ updateProposal(proposal.id, { status: nextStatus })
            └→ addApprovalHistory(proposal.id, historyEntry, sendEmail=true)
                └→ email-service.ts kirim notifikasi ke pihak terkait
                    └→ refreshData() → tampilan diupdate
```

**Titik Integrasi Backend (Nanti):**
```tsx
// Ganti ini:
await updateProposal(proposal.id, updates)
// Dengan:
await fetch(`/api/proposals/${proposal.id}`, {
  method: 'PATCH',
  body: JSON.stringify(updates)
})
```

---

### 9. 📋 Halaman Review
**File:** `app/dashboard/review/page.tsx`
**URL:** `/dashboard/review`
**Akses:** Login required (bukan role Mitra)

**Tujuan:** Menampilkan semua proposal yang menunggu aksi dari user yang sedang login.

**Komponen yang Dipakai:**
| Komponen | Fungsi |
|---|---|
| `Card, Badge` | Tampilan list proposal |
| `canUserTakeAction()` | Filter proposal berdasarkan role & status |
| `useDataStore()` | Ambil semua proposals |

**Titik Integrasi Backend:**
```tsx
// Nanti ganti dengan:
const { data } = await fetch('/api/proposals/pending?role=' + user.role)
```

---

## 🧩 Komponen Reusable Penting

### `DashboardLayout`
**File:** `components/dashboard-layout.tsx`
**Dipakai di:** Semua halaman dashboard

Menyediakan struktur halaman dengan:
- **Header:** Nama sistem, nama user, tombol logout
- **Sidebar:** Navigasi (Dashboard, Proposal, Review)
- **Badge notifikasi** pada menu Review (jumlah proposal pending)
- **Mobile responsive** (sidebar bisa collapse)

---

### `ProtectedRoute`
**File:** `components/protected-route.tsx`
**Dipakai di:** Semua halaman yang butuh login

Logika: Cek `useAuth().user` → jika null, redirect ke `/login`.

---

### `SimpleTracker`
**File:** `components/simple-tracker.tsx`
**Dipakai di:** Detail proposal, dashboard Mitra & Fakultas

Menampilkan progress bar visual tahapan workflow proposal dari awal hingga selesai.

---

### `WorkflowActions`
**File:** `components/workflow-actions.tsx`
**Dipakai di:** Detail Proposal `[id]/page.tsx`

Menampilkan tombol aksi yang BERBEDA tergantung kombinasi `user.role` + `proposal.status`. Inti dari sistem approval.

**Titik Integrasi Backend:** Ini adalah komponen kunci. Semua aksi approval nanti akan memanggil `PATCH /api/proposals/[id]`.

---

## 🔑 State Management

### AuthContext (`lib/auth-context.tsx`)
Provider yang di-wrap di root `layout.tsx`. Tersedia di semua komponen via `useAuth()`.

```ts
const { user, login, logout, isLoading } = useAuth()
// user: { id, name, email, role, unit, fakultas }
```

### DataStoreContext (`lib/data-store.tsx`)
Provider untuk data proposals. **Saat ini masih menggunakan mock data (`lib/mock-data.ts`).**

```ts
const { proposals, addProposal, updateProposal, ... } = useDataStore()
```

> ⚠️ **Ini adalah titik utama refactoring backend nanti!**
> Ganti semua operasi di `DataStoreContext` dengan API call ke database sungguhan.

---

## 🔗 API Routes (Backend Layer)

Semua file di `app/api/*/route.ts` adalah server-side code (tidak terekspos ke browser).

| Endpoint | Method | Fungsi | Status |
|---|---|---|---|
| `/api/register` | POST | Buat akun baru via Supabase Admin | ✅ Aktif |
| `/api/proposals` | GET/POST | Ambil/buat proposal | ⚠️ Partial |
| `/api/approval` | POST | Proses aksi persetujuan | ⚠️ Partial |
| `/api/upload` | POST | Upload file dokumen ke storage | ✅ Aktif |
| `/api/public-proposal` | POST | Submit proposal tanpa login | ✅ Aktif |
| `/api/create-mitra-account` | POST | Buat akun otomatis untuk Mitra | ✅ Aktif |
| `/api/send-welcome` | POST | Kirim email selamat datang | ✅ Aktif |
| `/api/send-confirmation` | POST | Kirim email konfirmasi | ✅ Aktif |
| `/api/send-credentials` | POST | Kirim email kredensial login | ✅ Aktif |

---

## 🚀 Panduan Integrasi Backend (Checklist)

Saat backend database sudah siap, lakukan penggantian bertahap berikut:

- [ ] **Step 1:** Ganti `useDataStore()` di tiap dashboard view dengan `fetch('/api/proposals?...')`
- [ ] **Step 2:** Update `handleSubmit` di `proposals/new/page.tsx` ke `POST /api/proposals`
- [ ] **Step 3:** Update `handleWorkflowAction` di `proposals/[id]/page.tsx` ke `PATCH /api/proposals/[id]`
- [ ] **Step 4:** Ganti data statis di `StatsBaru` (Landing) dengan `GET /api/stats`
- [ ] **Step 5:** Ganti data mitra di `PartnersBaru` (Landing) dengan `GET /api/partners`

---

*📅 Terakhir diperbarui: April 2026 | Dibuat untuk proyek Sistem Kerja Sama UPI*
