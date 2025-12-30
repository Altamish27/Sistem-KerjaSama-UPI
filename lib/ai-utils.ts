import { supabase } from './supabase';

/**
 * Generate AI summary untuk dokumen proposal
 * PLACEHOLDER - hanya skema, tidak menggunakan API AI real
 */
export async function generateAISummary(documentText: string, proposalData?: any): Promise<string> {
  try {
    // SKEMA PLACEHOLDER - TIDAK MENGGUNAKAN API AI REAL
    // Simulasi delay untuk user experience
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const words = documentText.split(' ');
    const sentences = documentText.split(/[.!?]+/).filter(s => s.trim().length > 0);
    
    // Generate ringkasan placeholder berdasarkan data proposal
    const summary = `
📄 RINGKASAN OTOMATIS DOKUMEN

📋 Informasi Umum:
- Jenis Dokumen: ${proposalData?.document_type || 'N/A'}
- Mitra: ${proposalData?.partner_name || 'N/A'}
- Jenis Kerja Sama: ${proposalData?.cooperation_type || 'N/A'}

📊 Statistik Dokumen:
- Total Kata: ${words.length.toLocaleString()}
- Total Kalimat: ${sentences.length}
- Karakter: ${documentText.length.toLocaleString()}

🔍 Preview Isi:
${documentText.substring(0, 300)}${documentText.length > 300 ? '...' : ''}

✅ Status: Dokumen telah diproses
⏰ Waktu Proses: ${new Date().toLocaleString('id-ID')}

⚠️ CATATAN: Ini adalah ringkasan otomatis placeholder. 
Pada implementasi final, akan menggunakan AI/LLM untuk analisis mendalam.

🔹 Yang akan dianalisis oleh AI (skema):
   • Identifikasi pihak-pihak yang terlibat
   • Ruang lingkup kerja sama
   • Hak dan kewajiban
   • Jangka waktu kerjasama
   • Potensi risiko legal
   • Rekomendasi tindak lanjut
    `.trim();

    return summary;
  } catch (error) {
    console.error('Error generating AI summary:', error);
    return '❌ Error: Tidak dapat membuat ringkasan otomatis';
  }
}

/**
 * Extract text dari file untuk AI processing
 */
export async function extractTextFromFile(file: File): Promise<string> {
  try {
    // Untuk PDF, DOC, dll - perlu library khusus
    // Untuk sekarang, hanya handle text files
    
    if (file.type.includes('text')) {
      return await file.text();
    }
    
    // Placeholder untuk PDF/DOC
    return `[File ${file.name} - ${file.type}] - Text extraction memerlukan implementasi khusus`;
  } catch (error) {
    console.error('Error extracting text:', error);
    return '';
  }
}

/**
 * Analyze proposal dan generate recommendations
 */
export async function analyzeProposal(proposalData: {
  title: string;
  description: string;
  cooperation_type: string;
  document_text?: string;
}): Promise<{
  risk_level: 'low' | 'medium' | 'high';
  recommendations: string[];
  key_points: string[];
}> {
  try {
    // Placeholder AI analysis
    const recommendations: string[] = [];
    const key_points: string[] = [];
    let risk_level: 'low' | 'medium' | 'high' = 'medium';

    // Basic analysis
    if (proposalData.description.length < 100) {
      recommendations.push('Deskripsi terlalu singkat, perlu detail lebih lanjut');
      risk_level = 'high';
    }

    if (!proposalData.cooperation_type) {
      recommendations.push('Jenis kerja sama belum ditentukan');
      risk_level = 'high';
    }

    // Extract key points from description
    const sentences = proposalData.description.split(/[.!?]+/);
    key_points.push(...sentences.slice(0, 3).map(s => s.trim()).filter(s => s.length > 20));

    if (recommendations.length === 0) {
      recommendations.push('Proposal terlihat lengkap dan sesuai format');
      risk_level = 'low';
    }

    return {
      risk_level,
      recommendations,
      key_points: key_points.length > 0 ? key_points : ['Tidak ada poin kunci yang terdeteksi'],
    };
  } catch (error) {
    console.error('Error analyzing proposal:', error);
    return {
      risk_level: 'medium',
      recommendations: ['Error dalam analisis otomatis'],
      key_points: [],
    };
  }
}

/**
 * Check for potential issues dalam dokumen
 */
export async function checkDocumentCompliance(documentText: string): Promise<{
  is_compliant: boolean;
  issues: string[];
  warnings: string[];
}> {
  try {
    const issues: string[] = [];
    const warnings: string[] = [];

    // Basic compliance checks
    const requiredSections = [
      'tujuan',
      'ruang lingkup',
      'jangka waktu',
      'hak dan kewajiban',
    ];

    const lowerText = documentText.toLowerCase();
    
    requiredSections.forEach(section => {
      if (!lowerText.includes(section)) {
        warnings.push(`Kemungkinan tidak ada bagian "${section}"`);
      }
    });

    // Check for common issues
    if (documentText.length < 500) {
      issues.push('Dokumen terlalu singkat');
    }

    if (!lowerText.includes('pasal') && !lowerText.includes('klausul')) {
      warnings.push('Tidak terdeteksi struktur pasal/klausul formal');
    }

    return {
      is_compliant: issues.length === 0,
      issues,
      warnings,
    };
  } catch (error) {
    console.error('Error checking compliance:', error);
    return {
      is_compliant: false,
      issues: ['Error dalam pemeriksaan compliance'],
      warnings: [],
    };
  }
}

/**
 * Generate notification content based on workflow stage
 */
export async function generateNotificationMessage(
  action: string,
  proposalTitle: string,
  additionalInfo?: any
): Promise<{ title: string; message: string }> {
  const messages: Record<string, { title: string; message: string }> = {
    'proposal_submitted': {
      title: 'Proposal Baru Diterima',
      message: `Proposal "${proposalTitle}" telah diajukan dan menunggu verifikasi substansi.`,
    },
    'substance_verification': {
      title: 'Verifikasi Substansi Diperlukan',
      message: `Proposal "${proposalTitle}" memerlukan verifikasi substansi dari fakultas/unit.`,
    },
    'legal_review': {
      title: 'Review Hukum Diperlukan',
      message: `Proposal "${proposalTitle}" siap untuk review hukum.`,
    },
    'revision_required': {
      title: 'Revisi Diperlukan',
      message: `Proposal "${proposalTitle}" memerlukan revisi. Silakan cek komentar reviewer.`,
    },
    'approved': {
      title: 'Proposal Disetujui',
      message: `Proposal "${proposalTitle}" telah disetujui dan melanjutkan ke tahap berikutnya.`,
    },
    'signature_required': {
      title: 'Tanda Tangan Diperlukan',
      message: `Proposal "${proposalTitle}" siap untuk ditandatangani.`,
    },
    'completed': {
      title: 'Kerja Sama Selesai',
      message: `Proposal "${proposalTitle}" telah selesai dan diarsipkan.`,
    },
  };

  return messages[action] || {
    title: 'Notifikasi',
    message: `Update untuk proposal "${proposalTitle}"`,
  };
}
