// Data Workflow untuk Presentasi Alur Kerja Sama Universitas

export type StepStatus = 'pending' | 'active' | 'completed' | 'rejected';

export interface WorkflowStep {
  id: string;
  actor: 'MITRA' | 'DKUI' | 'FAKULTAS' | 'BIRO_HUKUM' | 'SUPERVISI';
  actorLabel: string;
  title: string;
  description: string;
  icon: string;
  type: 'start' | 'activity' | 'gateway' | 'end';
  color: string;
  uiMockup?: 'login' | 'upload' | 'review' | 'sign' | 'tracking' | 'archive' | 'feedback' | 'processing' | 'simple';
  nextSteps?: string[]; // ID step selanjutnya
  conditions?: {
    label: string;
    nextStep: string;
    type: 'approve' | 'reject';
  }[];
}

export interface WorkflowData {
  id: string;
  name: string;
  description: string;
  steps: WorkflowStep[];
  startStepId: string;
}

// Workflow: EXTERNAL MITRA mengajukan ke Universitas
export const externalMitraWorkflow: WorkflowData = {
  id: 'external-mitra',
  name: 'Alur Kerja Sama External Mitra ke Universitas',
  description: 'Proses pengajuan proposal kerja sama dari mitra eksternal hingga penandatanganan dan arsip dokumen',
  startStepId: 'ext-1',
  steps: [
    // === MITRA ===
    {
      id: 'ext-1',
      actor: 'MITRA',
      actorLabel: 'Mitra External',
      title: 'Mulai Proses',
      description: 'Mitra external memulai proses pengajuan kerja sama dengan universitas',
      icon: 'play-circle',
      type: 'start',
      color: '#f97316',
      uiMockup: 'login',
      nextSteps: ['ext-2']
    },
    {
      id: 'ext-2',
      actor: 'MITRA',
      actorLabel: 'Mitra External',
      title: 'Submit Proposal',
      description: 'Mitra mengajukan proposal kerja sama ke universitas melalui sistem atau email resmi',
      icon: 'upload',
      type: 'activity',
      color: '#f97316',
      uiMockup: 'upload',
      nextSteps: ['ext-3']
    },

    // === DKUI ===
    {
      id: 'ext-3',
      actor: 'DKUI',
      actorLabel: 'DKUI (Direktorat Kerja Sama UI)',
      title: 'Terima Proposal',
      description: 'DKUI menerima dan mendaftarkan proposal yang masuk dari mitra',
      icon: 'inbox',
      type: 'activity',
      color: '#3b82f6',
      nextSteps: ['ext-4']
    },
    {
      id: 'ext-4',
      actor: 'DKUI',
      actorLabel: 'DKUI',
      title: 'Ringkas Proposal (LLM)',
      description: 'Sistem menggunakan AI/LLM untuk meringkas proposal secara otomatis',
      icon: 'cpu',
      type: 'activity',
      color: '#3b82f6',
      uiMockup: 'processing',
      nextSteps: ['ext-5']
    },
    {
      id: 'ext-5',
      actor: 'DKUI',
      actorLabel: 'DKUI',
      title: 'Simpan Proposal & Ringkasan',
      description: 'Proposal dan ringkasan disimpan dalam sistem database',
      icon: 'save',
      type: 'activity',
      color: '#3b82f6',
      nextSteps: ['ext-6']
    },
    {
      id: 'ext-6',
      actor: 'DKUI',
      actorLabel: 'DKUI',
      title: 'Salurkan ke Fakultas/Unit',
      description: 'DKUI meneruskan proposal ke fakultas atau unit terkait untuk verifikasi substansi',
      icon: 'share-2',
      type: 'activity',
      color: '#3b82f6',
      nextSteps: ['ext-7']
    },

    // === FAKULTAS/UNIT ===
    {
      id: 'ext-7',
      actor: 'FAKULTAS',
      actorLabel: 'Fakultas/Unit Terkait',
      title: 'Verifikasi Substansi',
      description: 'Fakultas melakukan review dan verifikasi substansi proposal kerja sama',
      icon: 'check-square',
      type: 'activity',
      color: '#22c55e',
      uiMockup: 'review',
      nextSteps: ['ext-8']
    },
    {
      id: 'ext-8',
      actor: 'FAKULTAS',
      actorLabel: 'Fakultas/Unit Terkait',
      title: 'Keputusan: Disetujui?',
      description: 'Fakultas memutuskan apakah proposal disetujui atau ditolak',
      icon: 'git-branch',
      type: 'gateway',
      color: '#22c55e',
      conditions: [
        {
          label: 'Tidak Disetujui',
          nextStep: 'ext-9',
          type: 'reject'
        },
        {
          label: 'Disetujui',
          nextStep: 'ext-11',
          type: 'approve'
        }
      ]
    },

    // === PENOLAKAN FAKULTAS ===
    {
      id: 'ext-9',
      actor: 'FAKULTAS',
      actorLabel: 'Fakultas/Unit Terkait',
      title: 'Kirim Penolakan ke DKUI',
      description: 'Fakultas mengirim feedback penolakan beserta alasan ke DKUI',
      icon: 'x-circle',
      type: 'activity',
      color: '#22c55e',
      nextSteps: ['ext-10']
    },
    {
      id: 'ext-10',
      actor: 'DKUI',
      actorLabel: 'DKUI',
      title: 'Kirim Feedback Penolakan ke Mitra',
      description: 'DKUI meneruskan feedback penolakan dari fakultas kepada mitra',
      icon: 'message-square',
      type: 'activity',
      color: '#3b82f6',
      nextSteps: ['ext-10b']
    },
    {
      id: 'ext-10b',
      actor: 'MITRA',
      actorLabel: 'Mitra External',
      title: 'Menerima Feedback Penolakan',
      description: 'Mitra menerima feedback penolakan dari universitas',
      icon: 'file-text',
      type: 'activity',
      color: '#f97316',
      uiMockup: 'feedback',
      nextSteps: ['ext-end-reject']
    },
    {
      id: 'ext-end-reject',
      actor: 'MITRA',
      actorLabel: 'Mitra External',
      title: 'Proses Selesai (Ditolak)',
      description: 'Proposal ditolak, proses pengajuan selesai. Mitra dapat mengajukan proposal baru dengan perbaikan.',
      icon: 'x-circle',
      type: 'end',
      color: '#ef4444',
      nextSteps: []
    },

    // === PERSETUJUAN FAKULTAS ===
    {
      id: 'ext-11',
      actor: 'FAKULTAS',
      actorLabel: 'Fakultas/Unit Terkait',
      title: 'Kirim Persetujuan ke DKUI',
      description: 'Fakultas mengirim persetujuan substansi ke DKUI',
      icon: 'check-circle',
      type: 'activity',
      color: '#22c55e',
      nextSteps: ['ext-12']
    },
    {
      id: 'ext-12',
      actor: 'DKUI',
      actorLabel: 'DKUI',
      title: 'Menyusun & Periksa Dokumen Naskah',
      description: 'Legal Drafter DKUI menyusun dokumen naskah perjanjian kerja sama (MoU/MoA)',
      icon: 'file-plus',
      type: 'activity',
      color: '#3b82f6',
      nextSteps: ['ext-13']
    },
    {
      id: 'ext-13',
      actor: 'DKUI',
      actorLabel: 'DKUI',
      title: 'Paraf Kepala Divisi',
      description: 'Kepala Divisi DKUI memberikan paraf pada dokumen naskah',
      icon: 'pen-tool',
      type: 'activity',
      color: '#3b82f6',
      nextSteps: ['ext-14']
    },
    {
      id: 'ext-14',
      actor: 'DKUI',
      actorLabel: 'DKUI',
      title: 'Kirim ke Biro Hukum',
      description: 'Dokumen dikirim ke Biro Hukum untuk validasi aspek legal',
      icon: 'send',
      type: 'activity',
      color: '#3b82f6',
      nextSteps: ['ext-15']
    },

    // === BIRO HUKUM ===
    {
      id: 'ext-15',
      actor: 'BIRO_HUKUM',
      actorLabel: 'Biro Hukum',
      title: 'Validasi & Paraf',
      description: 'Biro Hukum melakukan validasi legal dan memberikan paraf',
      icon: 'check-circle',
      type: 'activity',
      color: '#a855f7',
      uiMockup: 'review',
      nextSteps: ['ext-16']
    },
    {
      id: 'ext-16',
      actor: 'BIRO_HUKUM',
      actorLabel: 'Biro Hukum',
      title: 'Keputusan: Disetujui?',
      description: 'Biro Hukum memutuskan apakah dokumen sudah sesuai aspek legal',
      icon: 'git-branch',
      type: 'gateway',
      color: '#a855f7',
      conditions: [
        {
          label: 'Tidak Disetujui',
          nextStep: 'ext-17',
          type: 'reject'
        },
        {
          label: 'Disetujui',
          nextStep: 'ext-19',
          type: 'approve'
        }
      ]
    },

    // === PENOLAKAN BIRO HUKUM ===
    {
      id: 'ext-17',
      actor: 'BIRO_HUKUM',
      actorLabel: 'Biro Hukum',
      title: 'Kirim Feedback Penolakan',
      description: 'Biro Hukum mengirim feedback revisi ke DKUI',
      icon: 'message-square',
      type: 'activity',
      color: '#a855f7',
      nextSteps: ['ext-18']
    },
    {
      id: 'ext-18',
      actor: 'DKUI',
      actorLabel: 'DKUI',
      title: 'Revisi Dokumen Naskah',
      description: 'DKUI merevisi dokumen sesuai feedback dari Biro Hukum',
      icon: 'edit',
      type: 'activity',
      color: '#3b82f6',
      nextSteps: ['ext-12'] // Kembali ke menyusun dokumen
    },

    // === PERSETUJUAN BIRO HUKUM - PARALEL ===
    {
      id: 'ext-19',
      actor: 'BIRO_HUKUM',
      actorLabel: 'Biro Hukum',
      title: 'Kirim ke DKUI',
      description: 'Dokumen yang sudah divalidasi dikirim kembali ke DKUI',
      icon: 'send',
      type: 'activity',
      color: '#a855f7',
      nextSteps: ['ext-20']
    },
    {
      id: 'ext-20',
      actor: 'DKUI',
      actorLabel: 'DKUI',
      title: 'Gateway Paralel: Kirim ke Mitra & Supervisi',
      description: 'DKUI memproses paralel: mengirim ke mitra untuk tanda tangan DAN ke supervisi untuk review',
      icon: 'git-branch',
      type: 'gateway',
      color: '#3b82f6',
      nextSteps: ['ext-21', 'ext-30'] // Paralel: Mitra dan Supervisi
    },

    // === JALUR PARALEL 1: MITRA ===
    {
      id: 'ext-21',
      actor: 'DKUI',
      actorLabel: 'DKUI',
      title: 'Kirim Dokumen ke Mitra',
      description: 'DKUI mengirim dokumen final ke mitra untuk ditanda tangani',
      icon: 'send',
      type: 'activity',
      color: '#3b82f6',
      nextSteps: ['ext-22']
    },
    {
      id: 'ext-22',
      actor: 'MITRA',
      actorLabel: 'Mitra External',
      title: 'Review Dokumen',
      description: 'Mitra melakukan review dokumen perjanjian kerja sama',
      icon: 'file-text',
      type: 'activity',
      color: '#f97316',
      nextSteps: ['ext-23']
    },
    {
      id: 'ext-23',
      actor: 'MITRA',
      actorLabel: 'Mitra External',
      title: 'Tanda Tangan & Materai',
      description: 'Mitra menandatangani dokumen dan membubuhkan materai',
      icon: 'edit-3',
      type: 'activity',
      color: '#f97316',
      nextSteps: ['ext-24']
    },
    {
      id: 'ext-24',
      actor: 'MITRA',
      actorLabel: 'Mitra External',
      title: 'Kirim Dokumen ke DKUI',
      description: 'Mitra mengirim dokumen bermaterai kembali ke DKUI',
      icon: 'send',
      type: 'activity',
      color: '#f97316',
      nextSteps: ['ext-25']
    },
    {
      id: 'ext-25',
      actor: 'DKUI',
      actorLabel: 'DKUI',
      title: 'Terima Dokumen Bermaterai Mitra',
      description: 'DKUI menerima dokumen yang sudah ditandatangani dan bermaterai dari mitra',
      icon: 'inbox',
      type: 'activity',
      color: '#3b82f6',
      nextSteps: ['ext-45'] // Menunggu dokumen dari Rektor juga
    },

    // === JALUR PARALEL 2: SUPERVISI ===
    {
      id: 'ext-30',
      actor: 'DKUI',
      actorLabel: 'DKUI',
      title: 'Kirim ke Supervisi',
      description: 'DKUI mengirim dokumen ke Supervisi (Wakil Rektor) untuk review',
      icon: 'send',
      type: 'activity',
      color: '#3b82f6',
      nextSteps: ['ext-31']
    },
    {
      id: 'ext-31',
      actor: 'SUPERVISI',
      actorLabel: 'Supervisi (Wakil Rektor)',
      title: 'Review Wakil Rektor',
      description: 'Wakil Rektor melakukan review dokumen kerja sama',
      icon: 'eye',
      type: 'activity',
      color: '#14b8a6',
      nextSteps: ['ext-32']
    },
    {
      id: 'ext-32',
      actor: 'SUPERVISI',
      actorLabel: 'Supervisi (Wakil Rektor)',
      title: 'Keputusan Wakil Rektor: Disetujui?',
      description: 'Wakil Rektor memutuskan apakah dokumen disetujui atau perlu revisi',
      icon: 'git-branch',
      type: 'gateway',
      color: '#14b8a6',
      conditions: [
        {
          label: 'Tidak Disetujui - Perlu Revisi',
          nextStep: 'ext-33',
          type: 'reject'
        },
        {
          label: 'Disetujui',
          nextStep: 'ext-35',
          type: 'approve'
        }
      ]
    },

    // === PENOLAKAN WAKIL REKTOR ===
    {
      id: 'ext-33',
      actor: 'SUPERVISI',
      actorLabel: 'Supervisi (Wakil Rektor)',
      title: 'Kembalikan ke DKUI untuk Revisi',
      description: 'Wakil Rektor mengembalikan dokumen ke DKUI dengan catatan revisi',
      icon: 'corner-up-left',
      type: 'activity',
      color: '#14b8a6',
      nextSteps: ['ext-34']
    },
    {
      id: 'ext-34',
      actor: 'DKUI',
      actorLabel: 'DKUI',
      title: 'Terima Feedback & Kirim ke Mitra',
      description: 'DKUI menerima feedback revisi dan menginformasikan ke mitra',
      icon: 'edit',
      type: 'activity',
      color: '#3b82f6',
      nextSteps: ['ext-34b']
    },
    {
      id: 'ext-34b',
      actor: 'MITRA',
      actorLabel: 'Mitra External',
      title: 'Menerima Feedback Revisi',
      description: 'Mitra menerima feedback untuk revisi proposal/dokumen',
      icon: 'message-square',
      type: 'activity',
      color: '#f97316',
      nextSteps: ['ext-12'] // Kembali ke penyusunan dokumen
    },

    // === PERSETUJUAN WAKIL REKTOR ===
    {
      id: 'ext-35',
      actor: 'SUPERVISI',
      actorLabel: 'Supervisi (Wakil Rektor)',
      title: 'Digital Signing Wakil Rektor',
      description: 'Wakil Rektor melakukan tanda tangan digital pada dokumen',
      icon: 'pen-tool',
      type: 'activity',
      color: '#14b8a6',
      uiMockup: 'sign',
      nextSteps: ['ext-36']
    },
    {
      id: 'ext-36',
      actor: 'SUPERVISI',
      actorLabel: 'Supervisi (Wakil Rektor)',
      title: 'Kirim ke Rektor',
      description: 'Dokumen yang sudah di-approve Wakil Rektor dikirim ke Rektor',
      icon: 'send',
      type: 'activity',
      color: '#14b8a6',
      nextSteps: ['ext-37']
    },
    {
      id: 'ext-37',
      actor: 'SUPERVISI',
      actorLabel: 'Supervisi (Rektor)',
      title: 'Review Rektor',
      description: 'Rektor melakukan review final dokumen kerja sama',
      icon: 'eye',
      type: 'activity',
      color: '#14b8a6',
      nextSteps: ['ext-38']
    },
    {
      id: 'ext-38',
      actor: 'SUPERVISI',
      actorLabel: 'Supervisi (Rektor)',
      title: 'Keputusan Rektor: Disetujui?',
      description: 'Rektor membuat keputusan final',
      icon: 'git-branch',
      type: 'gateway',
      color: '#14b8a6',
      conditions: [
        {
          label: 'Tidak Disetujui',
          nextStep: 'ext-33',
          type: 'reject'
        },
        {
          label: 'Disetujui',
          nextStep: 'ext-40',
          type: 'approve'
        }
      ]
    },

    // === PERSETUJUAN REKTOR ===
    {
      id: 'ext-40',
      actor: 'SUPERVISI',
      actorLabel: 'Supervisi (Rektor)',
      title: 'Digital Signing Rektor',
      description: 'Rektor melakukan tanda tangan digital pada dokumen',
      icon: 'pen-tool',
      type: 'activity',
      color: '#14b8a6',
      uiMockup: 'sign',
      nextSteps: ['ext-41']
    },
    {
      id: 'ext-41',
      actor: 'SUPERVISI',
      actorLabel: 'Supervisi',
      title: 'Pembubuhan Materai',
      description: 'Dokumen diberi materai sesuai ketentuan',
      icon: 'file-text',
      type: 'activity',
      color: '#14b8a6',
      nextSteps: ['ext-42']
    },
    {
      id: 'ext-42',
      actor: 'SUPERVISI',
      actorLabel: 'Supervisi',
      title: 'Kirim Dokumen ke DKUI',
      description: 'Dokumen bermaterai dari Rektor dikirim ke DKUI',
      icon: 'send',
      type: 'activity',
      color: '#14b8a6',
      nextSteps: ['ext-43']
    },
    {
      id: 'ext-43',
      actor: 'DKUI',
      actorLabel: 'DKUI',
      title: 'Terima Dokumen Bermaterai Rektor',
      description: 'DKUI menerima dokumen yang sudah ditandatangani Rektor dan bermaterai',
      icon: 'inbox',
      type: 'activity',
      color: '#3b82f6',
      nextSteps: ['ext-45'] // Menunggu dokumen dari Mitra juga
    },

    // === GABUNG PARALEL & FINALISASI ===
    {
      id: 'ext-45',
      actor: 'DKUI',
      actorLabel: 'DKUI',
      title: 'Pertukaran Dokumen Final Rektor & Mitra',
      description: 'DKUI melakukan pertukaran dokumen final yang sudah ditandatangani kedua belah pihak',
      icon: 'repeat',
      type: 'activity',
      color: '#3b82f6',
      uiMockup: 'tracking',
      nextSteps: ['ext-46']
    },
    {
      id: 'ext-46',
      actor: 'DKUI',
      actorLabel: 'DKUI',
      title: 'Arsipkan Dokumen',
      description: 'DKUI mengarsipkan dokumen perjanjian kerja sama yang sudah lengkap',
      icon: 'archive',
      type: 'activity',
      color: '#3b82f6',
      uiMockup: 'archive',
      nextSteps: ['ext-end']
    },
    {
      id: 'ext-end',
      actor: 'DKUI',
      actorLabel: 'DKUI',
      title: 'Proses Selesai (Berhasil)',
      description: 'Kerja sama berhasil disepakati, dokumen telah ditandatangani kedua belah pihak dan diarsipkan',
      icon: 'check-circle',
      type: 'end',
      color: '#22c55e',
      nextSteps: []
    }
  ]
};

// TODO: Workflow INTERNAL akan ditambahkan
export const internalMitraWorkflow: WorkflowData = {
  id: 'internal-mitra',
  name: 'Alur Kerja Sama Internal Universitas',
  description: 'Proses pengajuan kerja sama dari unit internal universitas (Coming Soon)',
  startStepId: 'int-1',
  steps: [
    {
      id: 'int-1',
      actor: 'FAKULTAS',
      actorLabel: 'Unit Internal',
      title: 'Coming Soon',
      description: 'Alur untuk mitra internal akan segera ditambahkan',
      icon: 'clock',
      type: 'start',
      color: '#6b7280',
      nextSteps: []
    }
  ]
};

export const workflows = {
  external: externalMitraWorkflow,
  internal: internalMitraWorkflow
};
