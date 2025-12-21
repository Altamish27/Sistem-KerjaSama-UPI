# 🎯 Sistem Presentasi Alur Kerja Sama Universitas

Sistem presentasi interaktif untuk mendemonstrasikan alur kerja sama universitas dengan visualisasi lengkap dan UI mockup yang mudah dipahami.

## ✨ Fitur Utama

### 1. **Visualisasi Alur Proses (Flow Diagram)**
- Diagram alur horizontal yang menampilkan 8 fase utama
- Highlight real-time pada fase yang sedang aktif
- Indikator progress: ✅ Selesai | 🔵 Aktif | ⚪ Belum dimulai
- Auto-scroll dan zoom pada step aktif

### 2. **UI Mockup Interaktif**
Setiap step dilengkapi dengan UI mockup yang menampilkan:
- **Login Portal** - Tampilan login untuk setiap aktor
- **Upload Proposal** - Form lengkap dengan drag & drop
- **Review Dokumen** - Interface review dengan ringkasan AI
- **Digital Signature** - Proses tanda tangan digital
- **Document Tracking** - Timeline status dokumen
- **Archive System** - Sistem pengarsipan final

### 3. **Dashboard Tracking Real-time**
- **Progress Keseluruhan** - Persentase dan estimasi waktu
- **Status Per Aktor** - Progress setiap stakeholder
- **Milestone Utama** - Checklist pencapaian penting
- **Riwayat Langkah** - Timeline aktivitas yang sudah dilalui

## 🚀 Cara Menggunakan

### Akses Presentasi
1. Buka browser dan akses: `http://localhost:3000/welcome`
2. Klik tombol **"Demo Presentasi Interaktif"**
3. Pilih alur yang ingin ditampilkan:
   - **External Mitra** - Mitra luar mengajukan ke universitas ✅
   - **Internal Unit** - Unit internal mengajukan (Coming Soon)

### Navigasi Presentasi
- **Tombol "Lanjut"** - Pindah ke step berikutnya
- **Tombol "Kembali"** - Kembali ke step sebelumnya
- **Gateway/Keputusan** - Pilih salah satu opsi (Setuju/Tolak)
- **Reset Alur** - Mulai ulang dari awal

### Tips Presentasi ke Client
1. **Mulai dengan Overview** - Tunjukkan flow diagram di bagian atas
2. **Jelaskan Tiap Fase** - Gunakan UI mockup untuk menjelaskan detail
3. **Highlight Decision Points** - Tunjukkan gateway dan kemungkinan jalur
4. **Monitor Dashboard** - Tunjukkan progress tracking di sidebar kanan
5. **Demo Scenario** - Jalankan satu alur lengkap dari awal sampai akhir

## 📊 Alur Proses External Mitra

### Fase 1: Pengajuan (Mitra)
1. Login ke Portal Mitra
2. Submit Proposal

### Fase 2: Penerimaan & AI Processing (DKUI)
3. Terima Proposal
4. Ringkas Proposal (AI/LLM)
5. Simpan ke Database
6. Salurkan ke Fakultas

### Fase 3: Verifikasi Fakultas
7. Review Substansi
8. **Gateway**: Setuju/Tolak
   - ❌ Tolak → Feedback ke Mitra → Selesai
   - ✅ Setuju → Lanjut ke Fase 4

### Fase 4: Penyusunan Dokumen (DKUI)
9. Legal Drafter menyusun naskah
10. Paraf Kepala Divisi
11. Kirim ke Biro Hukum

### Fase 5: Validasi Hukum (Biro Hukum)
12. Validasi & Paraf
13. **Gateway**: Lolos/Revisi
   - ❌ Revisi → Kembali ke DKUI
   - ✅ Lolos → Lanjut Paralel

### Fase 6: Proses Paralel
**Jalur A - Mitra:**
14. DKUI kirim ke Mitra
15. Mitra review dokumen
16. Mitra tanda tangan & materai
17. Kirim kembali ke DKUI

**Jalur B - Supervisi:**
18. DKUI kirim ke Wakil Rektor
19. **Gateway** Wakil Rektor: Setuju/Revisi
20. Digital Signing Wakil Rektor
21. Kirim ke Rektor
22. **Gateway** Rektor: Setuju/Revisi
23. Digital Signing Rektor
24. Pembubuhan Materai
25. Kirim ke DKUI

### Fase 7: Finalisasi (DKUI)
26. Terima dokumen Mitra & Rektor
27. Pertukaran Dokumen Final

### Fase 8: Arsip
28. Arsipkan Dokumen
29. ✅ **Proses Selesai!**

## 🎨 Aktor & Warna

| Aktor | Warna | Peran |
|-------|-------|-------|
| 🟠 **Mitra External** | Orange | Pengajuan & Penandatanganan |
| 🔵 **DKUI** | Blue | Koordinasi & Administrasi |
| 🟢 **Fakultas/Unit** | Green | Verifikasi Substansi |
| 🟣 **Biro Hukum** | Purple | Validasi Legal |
| 🔷 **Supervisi** | Teal | Approval Wakil Rektor & Rektor |

## 🛠️ Development

### Install Dependencies
```bash
npm install --force
```

### Run Development Server
```bash
npm run dev
```

### Build for Production
```bash
npm run build
npm start
```

## 📁 Struktur File Penting

```
app/
  presentation/page.tsx          # Halaman utama presentasi
  welcome/page.tsx               # Landing page

components/
  workflow-viewer.tsx            # Main viewer component
  workflow-flow-diagram.tsx      # Visualisasi flow diagram
  workflow-tracking-dashboard.tsx # Dashboard tracking
  workflow-ui-mockups.tsx        # UI mockup components

lib/
  workflow-data.ts               # Data alur workflow
```

## 💡 Skenario Demo untuk Client

### Skenario 1: Happy Path (Semua Disetujui)
1. Mulai dari login Mitra
2. Submit proposal
3. Pilih "Disetujui" di semua gateway
4. Tunjukkan proses paralel (Mitra & Supervisi)
5. Finish di arsip dokumen

**Waktu Demo**: ~5-7 menit

### Skenario 2: Rejection Path
1. Mulai dari login Mitra
2. Submit proposal
3. Pilih "Tidak Disetujui" di Fakultas
4. Tunjukkan feedback penolakan
5. Jelaskan mitra bisa mengajukan ulang

**Waktu Demo**: ~2-3 menit

### Skenario 3: Revision Path
1. Submit proposal
2. Setuju di Fakultas
3. "Tidak Disetujui" di Biro Hukum (revisi)
4. Tunjukkan loop revisi
5. Kemudian approve dan lanjutkan

**Waktu Demo**: ~4-5 menit

## 🎯 Key Points untuk Client

1. **Automasi AI** - Ringkasan proposal otomatis menghemat waktu
2. **Transparansi** - Tracking real-time untuk semua pihak
3. **Digital Signature** - Paperless, cepat, dan aman
4. **Multi-level Approval** - Checks and balances yang jelas
5. **Centralized Archive** - Semua dokumen tersimpan rapi

## 📞 Support

Untuk pertanyaan atau customization, hubungi tim development.

---

**Version**: 1.0.0  
**Last Updated**: 21 Desember 2025  
**Developed for**: Direktorat Kerja Sama Universitas Indonesia
