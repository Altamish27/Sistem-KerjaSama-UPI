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
  duration?: string; // Estimasi durasi
  nextSteps?: string[]; // ID step selanjutnya (legacy)
  nextStepId?: string; // Single next step ID (untuk non-gateway)
  conditions?: {
    label: string;
    nextStep: string;
    nextStepId: string; // Tambahkan nextStepId di kondisi juga
    type: 'approve' | 'reject';
    condition: 'approve' | 'reject' | 'revise'; // Untuk styling di NextStepPreview
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
  description: 'Proses pengajuan proposal kerja sama dari mitra eksternal hingga penandatanganan dan arsip dokumen dengan gateway revisi yang jelas',
  startStepId: 'ext-1',
  steps: [
    // === MITRA: PENGAJUAN AWAL ===
    {
      id: 'ext-1',
      actor: 'MITRA',
      actorLabel: 'Mitra External',
      title: 'Mulai Proses',
      description: 'Mitra external memulai proses pengajuan kerja sama dengan universitas',
      icon: 'play-circle',
      type: 'start',
      color: '#f97316',
      duration: '5 menit',
      uiMockup: 'login',
      nextSteps: ['ext-2'],
      nextStepId: 'ext-2'
    },
    {
      id: 'ext-2',
      actor: 'MITRA',
      actorLabel: 'Mitra External',
      title: 'Submit Proposal Kerja Sama',
      description: 'Mitra mengajukan proposal kerja sama melalui sistem',
      icon: 'upload',
      type: 'activity',
      color: '#f97316',
      duration: '30 menit',
      uiMockup: 'upload',
      nextSteps: ['ext-3'],
      nextStepId: 'ext-3'
    },

    // === SISTEM: AI RINGKASAN ===
    {
      id: 'ext-3',
      actor: 'DKUI',
      actorLabel: 'Sistem AI',
      title: 'Ringkasan Dokumen Berbasis AI',
      description: 'Sistem secara otomatis meringkas dokumen proposal menggunakan AI/LLM',
      icon: 'cpu',
      type: 'activity',
      color: '#3b82f6',
      duration: '5 menit (otomatis)',
      uiMockup: 'processing',
      nextSteps: ['ext-4'],
      nextStepId: 'ext-4'
    },

    // === FAKULTAS: VERIFIKASI SUBSTANSI ===
    {
      id: 'ext-4',
      actor: 'FAKULTAS',
      actorLabel: 'Fakultas/Unit Terkait',
      title: 'Verifikasi Substansi Implementasi',
      description: 'Fakultas/Unit melakukan verifikasi substansi implementasi kerja sama',
      icon: 'check-square',
      type: 'activity',
      color: '#22c55e',
      duration: '3-5 hari kerja',
      uiMockup: 'review',
      nextSteps: ['ext-5'],
      nextStepId: 'ext-5'
    },
    {
      id: 'ext-5',
      actor: 'FAKULTAS',
      actorLabel: 'Fakultas/Unit Terkait',
      title: 'Gateway: Substansi Layak?',
      description: 'Keputusan kelayakan substansi kerja sama',
      icon: 'git-branch',
      type: 'gateway',
      color: '#22c55e',
      duration: '1 hari',
      conditions: [
        {
          label: '❌ Tidak Layak - Evaluasi Penolakan',
          nextStep: 'ext-6',
          nextStepId: 'ext-6',
          type: 'reject',
          condition: 'reject'
        },
        {
          label: '✅ Layak - Lanjut ke Legal Draft',
          nextStep: 'ext-9',
          nextStepId: 'ext-9',
          type: 'approve',
          condition: 'approve'
        }
      ]
    },

    // === JALUR PENOLAKAN SUBSTANSI ===
    {
      id: 'ext-6',
      actor: 'FAKULTAS',
      actorLabel: 'Fakultas/Unit Terkait',
      title: 'Evaluasi Penolakan',
      description: 'Fakultas melakukan evaluasi dan menyusun alasan penolakan',
      icon: 'x-circle',
      type: 'activity',
      color: '#22c55e',
      duration: '1 hari',
      nextSteps: ['ext-7'],
      nextStepId: 'ext-7'
    },
    {
      id: 'ext-7',
      actor: 'DKUI',
      actorLabel: 'DKUI',
      title: 'Penyampaian Notifikasi Penolakan',
      description: 'DKUI menyampaikan notifikasi penolakan kepada mitra',
      icon: 'message-square',
      type: 'activity',
      color: '#3b82f6',
      duration: '1 hari',
      nextSteps: ['ext-8'],
      nextStepId: 'ext-8'
    },
    {
      id: 'ext-8',
      actor: 'MITRA',
      actorLabel: 'Mitra External',
      title: 'Terima Notifikasi & Perbaikan',
      description: 'Mitra menerima notifikasi untuk melakukan perbaikan proposal',
      icon: 'file-text',
      type: 'activity',
      color: '#f97316',
      duration: '7-14 hari',
      uiMockup: 'feedback',
      nextSteps: ['ext-2'], // Kembali ke submit proposal
      nextStepId: 'ext-2'
    },

    // === JALUR PERSETUJUAN: LEGAL DRAFT ===
    {
      id: 'ext-9',
      actor: 'DKUI',
      actorLabel: 'DKUI (Legal Drafter)',
      title: 'Review Tahap Pertama oleh DKUI',
      description: 'DKUI sebagai legal drafter melakukan review tahap pertama',
      icon: 'file-plus',
      type: 'activity',
      color: '#3b82f6',
      duration: '2-3 hari',
      nextSteps: ['ext-10'],
      nextStepId: 'ext-10'
    },
    {
      id: 'ext-10',
      actor: 'DKUI',
      actorLabel: 'DKUI',
      title: 'Gateway: DKUI Approve?',
      description: 'Keputusan DKUI terhadap dokumen',
      icon: 'git-branch',
      type: 'gateway',
      color: '#3b82f6',
      duration: '1 hari',
      conditions: [
        {
          label: '🔄 Perlu Revisi',
          nextStep: 'ext-11',
          nextStepId: 'ext-11',
          type: 'reject',
          condition: 'revise'
        },
        {
          label: '✅ Lanjut ke Biro Hukum',
          nextStep: 'ext-14',
          nextStepId: 'ext-14',
          type: 'approve',
          condition: 'approve'
        }
      ]
    },

    // === GATEWAY REVISI: SIAPA YANG REVISI? ===
    {
      id: 'ext-11',
      actor: 'DKUI',
      actorLabel: 'DKUI (Pengendali Utama)',
      title: 'Gateway: Revisi Dilakukan oleh Siapa?',
      description: 'DKUI menentukan apakah revisi dilakukan oleh Mitra (administratif/data) atau DKUI sendiri (substansi hukum)',
      icon: 'git-branch',
      type: 'gateway',
      color: '#3b82f6',
      duration: '1 hari',
      conditions: [
        {
          label: '👥 Revisi oleh Mitra (Administratif/Data)',
          nextStep: 'ext-12a',
          nextStepId: 'ext-12a',
          type: 'reject',
          condition: 'revise'
        },
        {
          label: '⚖️ Revisi oleh DKUI (Substansi Hukum)',
          nextStep: 'ext-12b',
          nextStepId: 'ext-12b',
          type: 'approve',
          condition: 'revise'
        }
      ]
    },

    // === JALUR REVISI MITRA ===
    {
      id: 'ext-12a',
      actor: 'DKUI',
      actorLabel: 'DKUI',
      title: 'Kirim Notifikasi Revisi ke Mitra',
      description: 'Sistem mengirim notifikasi kepada mitra untuk perbaikan administratif/data',
      icon: 'message-square',
      type: 'activity',
      color: '#3b82f6',
      duration: '1 hari',
      nextSteps: ['ext-12a2'],
      nextStepId: 'ext-12a2'
    },
    {
      id: 'ext-12a2',
      actor: 'MITRA',
      actorLabel: 'Mitra External',
      title: 'Perbaikan & Upload Ulang Dokumen',
      description: 'Mitra melakukan perbaikan dan mengunggah ulang dokumen yang diperbaiki',
      icon: 'upload',
      type: 'activity',
      color: '#f97316',
      duration: '7-14 hari',
      uiMockup: 'upload',
      nextSteps: ['ext-12a3'],
      nextStepId: 'ext-12a3'
    },
    {
      id: 'ext-12a3',
      actor: 'DKUI',
      actorLabel: 'Sistem AI',
      title: 'Ringkasan Ulang Dokumen Perbaikan',
      description: 'Sistem meringkas kembali dokumen hasil perbaikan mitra',
      icon: 'cpu',
      type: 'activity',
      color: '#3b82f6',
      duration: '5 menit (otomatis)',
      uiMockup: 'processing',
      nextSteps: ['ext-4'],
      nextStepId: 'ext-4' // Kembali ke verifikasi substansi
    },

    // === JALUR REVISI DKUI ===
    {
      id: 'ext-12b',
      actor: 'DKUI',
      actorLabel: 'DKUI (Legal Drafter)',
      title: 'Perbaikan Langsung oleh DKUI',
      description: 'DKUI sebagai legal drafter melakukan perbaikan langsung pada dokumen (substansi hukum/klausul)',
      icon: 'edit',
      type: 'activity',
      color: '#3b82f6',
      duration: '2-3 hari',
      nextSteps: ['ext-12b2'],
      nextStepId: 'ext-12b2'
    },
    {
      id: 'ext-12b2',
      actor: 'FAKULTAS',
      actorLabel: 'Fakultas/Unit Terkait',
      title: 'Verifikasi Substansi (Revisi DKUI)',
      description: 'Fakultas memverifikasi substansi dokumen hasil revisi DKUI',
      icon: 'check-square',
      type: 'activity',
      color: '#22c55e',
      duration: '2-3 hari',
      nextSteps: ['ext-14'],
      nextStepId: 'ext-14' // Lanjut ke Biro Hukum
    },

    // === BIRO HUKUM REVIEW ===
    {
      id: 'ext-14',
      actor: 'BIRO_HUKUM',
      actorLabel: 'Biro Hukum',
      title: 'Review Biro Hukum',
      description: 'Biro Hukum melakukan validasi aspek legal',
      icon: 'scale',
      type: 'activity',
      color: '#a855f7',
      duration: '3-5 hari',
      uiMockup: 'review',
      nextSteps: ['ext-15'],
      nextStepId: 'ext-15'
    },
    {
      id: 'ext-15',
      actor: 'BIRO_HUKUM',
      actorLabel: 'Biro Hukum',
      title: 'Gateway: Biro Hukum Approve?',
      description: 'Keputusan Biro Hukum terhadap aspek legal',
      icon: 'git-branch',
      type: 'gateway',
      color: '#a855f7',
      duration: '1 hari',
      conditions: [
        {
          label: '🔄 Perlu Revisi',
          nextStep: 'ext-11',
          nextStepId: 'ext-11',
          type: 'reject',
          condition: 'revise'
        },
        {
          label: '✅ Lanjut ke Wakil Rektor',
          nextStep: 'ext-16',
          nextStepId: 'ext-16',
          type: 'approve',
          condition: 'approve'
        }
      ]
    },

    // === WAKIL REKTOR REVIEW ===
    {
      id: 'ext-16',
      actor: 'SUPERVISI',
      actorLabel: 'Wakil Rektor',
      title: 'Review Wakil Rektor',
      description: 'Wakil Rektor melakukan review dokumen kerja sama',
      icon: 'user-check',
      type: 'activity',
      color: '#14b8a6',
      duration: '3-5 hari',
      uiMockup: 'review',
      nextSteps: ['ext-17'],
      nextStepId: 'ext-17'
    },
    {
      id: 'ext-17',
      actor: 'SUPERVISI',
      actorLabel: 'Wakil Rektor',
      title: 'Gateway: Wakil Rektor Approve?',
      description: 'Keputusan Wakil Rektor',
      icon: 'git-branch',
      type: 'gateway',
      color: '#14b8a6',
      duration: '1 hari',
      conditions: [
        {
          label: '🔄 Perlu Revisi',
          nextStep: 'ext-11',
          nextStepId: 'ext-11',
          type: 'reject',
          condition: 'revise'
        },
        {
          label: '✅ Lanjut ke Rektor',
          nextStep: 'ext-18',
          nextStepId: 'ext-18',
          type: 'approve',
          condition: 'approve'
        }
      ]
    },

    // === REKTOR REVIEW ===
    {
      id: 'ext-18',
      actor: 'SUPERVISI',
      actorLabel: 'Rektor',
      title: 'Review Rektor',
      description: 'Rektor melakukan review final dokumen kerja sama',
      icon: 'user-check',
      type: 'activity',
      color: '#14b8a6',
      duration: '3-5 hari',
      uiMockup: 'review',
      nextSteps: ['ext-19'],
      nextStepId: 'ext-19'
    },
    {
      id: 'ext-19',
      actor: 'SUPERVISI',
      actorLabel: 'Rektor',
      title: 'Gateway: Rektor Approve?',
      description: 'Keputusan final Rektor',
      icon: 'git-branch',
      type: 'gateway',
      color: '#14b8a6',
      duration: '1 hari',
      conditions: [
        {
          label: '🔄 Perlu Revisi',
          nextStep: 'ext-11',
          nextStepId: 'ext-11',
          type: 'reject',
          condition: 'revise'
        },
        {
          label: '✅ Lanjut ke Penandatanganan',
          nextStep: 'ext-20',
          nextStepId: 'ext-20',
          type: 'approve',
          condition: 'approve'
        }
      ]
    },

    // === GATEWAY PARALEL: PENANDATANGANAN ===
    {
      id: 'ext-20',
      actor: 'DKUI',
      actorLabel: 'DKUI',
      title: 'Mulai Proses Paralel Penandatanganan',
      description: 'Proses penandatanganan digital dimulai secara paralel: Mitra dan Universitas',
      icon: 'git-branch',
      type: 'gateway',
      color: '#3b82f6',
      duration: '1 hari',
      nextSteps: ['ext-21', 'ext-30'] // Paralel: Mitra dan Supervisi
    },

    // === JALUR PARALEL A: PENANDATANGANAN MITRA ===
    {
      id: 'ext-21',
      actor: 'MITRA',
      actorLabel: 'Mitra External',
      title: 'Persetujuan Akhir Mitra',
      description: 'Mitra melakukan persetujuan akhir terhadap dokumen kerja sama',
      icon: 'check-circle',
      type: 'activity',
      color: '#f97316',
      duration: '3-5 hari',
      uiMockup: 'review',
      nextSteps: ['ext-22'],
      nextStepId: 'ext-22'
    },
    {
      id: 'ext-22',
      actor: 'MITRA',
      actorLabel: 'Mitra External',
      title: 'Pembubuhan Materai Mitra',
      description: 'Mitra membubuhkan materai pada dokumen',
      icon: 'file-text',
      type: 'activity',
      color: '#f97316',
      duration: '1 hari',
      nextSteps: ['ext-23'],
      nextStepId: 'ext-23'
    },
    {
      id: 'ext-23',
      actor: 'MITRA',
      actorLabel: 'Mitra External',
      title: 'Tanda Tangan Elektronik Mitra',
      description: 'Mitra melakukan tanda tangan elektronik pada dokumen',
      icon: 'pen-tool',
      type: 'activity',
      color: '#f97316',
      duration: '1 hari',
      uiMockup: 'sign',
      nextSteps: ['ext-50'],
      nextStepId: 'ext-50'
    },

    // === JALUR PARALEL B: REVIEW & PENANDATANGANAN UNIVERSITAS ===
    {
      id: 'ext-30',
      actor: 'SUPERVISI',
      actorLabel: 'Wakil Rektor',
      title: 'Review Wakil Rektor',
      description: 'Wakil Rektor melakukan review dokumen kerja sama',
      icon: 'user-check',
      type: 'activity',
      color: '#14b8a6',
      duration: '3-5 hari',
      uiMockup: 'review',
      nextSteps: ['ext-31'],
      nextStepId: 'ext-31'
    },
    {
      id: 'ext-31',
      actor: 'SUPERVISI',
      actorLabel: 'Rektor',
      title: 'Review Rektor',
      description: 'Rektor melakukan review final dokumen kerja sama',
      icon: 'user-check',
      type: 'activity',
      color: '#14b8a6',
      duration: '3-5 hari',
      uiMockup: 'review',
      nextSteps: ['ext-32'],
      nextStepId: 'ext-32'
    },
    {
      id: 'ext-32',
      actor: 'SUPERVISI',
      actorLabel: 'Institusi',
      title: 'Pembubuhan Materai Institusi',
      description: 'Pembubuhan materai pada dokumen oleh institusi',
      icon: 'file-text',
      type: 'activity',
      color: '#14b8a6',
      duration: '1 hari',
      nextSteps: ['ext-33'],
      nextStepId: 'ext-33'
    },
    {
      id: 'ext-33',
      actor: 'SUPERVISI',
      actorLabel: 'Pejabat Terkait',
      title: 'Tanda Tangan Elektronik Pejabat',
      description: 'Pejabat terkait (Rektor/Wakil Rektor) melakukan tanda tangan elektronik',
      icon: 'pen-tool',
      type: 'activity',
      color: '#14b8a6',
      duration: '1 hari',
      uiMockup: 'sign',
      nextSteps: ['ext-50'],
      nextStepId: 'ext-50'
    },

    // === GABUNG PARALEL & FINALISASI ===
    {
      id: 'ext-50',
      actor: 'DKUI',
      actorLabel: 'DKUI',
      title: 'Pertukaran Dokumen Final Rektor & Mitra',
      description: 'Pertukaran dokumen final yang telah ditandatangani antara Rektor dan Mitra',
      icon: 'repeat',
      type: 'activity',
      color: '#3b82f6',
      duration: '1-2 hari',
      uiMockup: 'tracking',
      nextSteps: ['ext-51'],
      nextStepId: 'ext-51'
    },
    {
      id: 'ext-51',
      actor: 'DKUI',
      actorLabel: 'DKUI',
      title: 'Arsipkan Dokumen Kerja Sama',
      description: 'DKUI mengarsipkan dokumen kerja sama yang sudah lengkap dan sah secara hukum',
      icon: 'archive',
      type: 'activity',
      color: '#3b82f6',
      duration: '1 hari',
      uiMockup: 'archive',
      nextSteps: ['ext-end'],
      nextStepId: 'ext-end'
    },
    {
      id: 'ext-end',
      actor: 'DKUI',
      actorLabel: 'DKUI',
      title: 'Proses Selesai',
      description: 'Dokumen final lengkap dan sah secara hukum. Sistem menutup proses pengajuan dengan status selesai.',
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
