// ============================================
// DATABASE TYPES - SISTEM KERJA SAMA UPI (SIMKERMA)
// ============================================
// Types sesuai schema.sql (Peraturan Rektor No. 019/2022)
// Single source of truth untuk semua TypeScript types.
//
// Generate ulang dengan: npx supabase gen types typescript --project-id <id> > lib/supabase/database.types.ts

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

// ============================================
// ENUM TYPES (mirrors PostgreSQL enums)
// ============================================

export type UserRole =
  | 'mitra'
  | 'operator_unit'
  | 'pimpinan_unit'
  | 'dkui'
  | 'biro_hukum'
  | 'sekretaris_universitas'
  | 'wakil_rektor'
  | 'rektor'

export type ProposalStatus =
  // Drafting
  | 'draft'
  | 'submitted'
  // Review berjenjang
  | 'pimpinan_unit_reviewing'
  | 'pimpinan_unit_approved'
  | 'pimpinan_unit_rejected'
  | 'dkui_reviewing'
  | 'dkui_approved'
  | 'dkui_rejected'
  | 'biro_hukum_reviewing'
  | 'biro_hukum_approved'
  | 'biro_hukum_rejected'
  // Path A: SU & WR
  | 'su_reviewing'
  | 'su_approved'
  | 'su_rejected'
  | 'wr_reviewing'
  | 'wr_approved'
  | 'wr_rejected'
  // Penandatanganan
  | 'rektor_signing'
  | 'rektor_signed'
  | 'pimpinan_unit_signing'
  | 'pimpinan_unit_signed'
  | 'mitra_signing'
  | 'mitra_signed'
  // Revisi loop
  | 'dkui_self_revising'
  | 'mitra_resubmitted'
  // Terminal
  | 'archived'
  | 'completed'
  | 'rejected'

export type ApprovalAction =
  | 'submit'
  | 'pimpinan_unit_review'
  | 'pimpinan_unit_approve'
  | 'pimpinan_unit_reject'
  | 'dkui_review'
  | 'dkui_approve'
  | 'dkui_reject'
  | 'biro_hukum_review'
  | 'biro_hukum_approve'
  | 'biro_hukum_reject'
  | 'su_review'
  | 'su_approve'
  | 'su_reject'
  | 'wr_review'
  | 'wr_approve'
  | 'wr_reject'
  | 'rektor_sign'
  | 'pimpinan_unit_sign'
  | 'mitra_sign'
  | 'dkui_self_revise'
  | 'mitra_resubmit'
  | 'archive'
  | 'complete'
  | 'final_rejection'

export type JenisDokumen = 'MoU' | 'MoA/PKS' | 'IA'

export type StatusPengajuan = 'pending' | 'ditolak' | 'diteruskan'

export type InitiatorType = 'mitra' | 'internal'

export type PartnerType = 'dalam_negeri' | 'luar_negeri'

export type RevisionType = 'mitra' | 'dkui'

// ============================================
// TABLE TYPES
// ============================================

export interface Database {
  public: {
    Tables: {
      unit_kerja: {
        Row: {
          id: string
          nama_unit: string
          jenis_unit: string
          kode_unit: string | null
          created_at: string
        }
        Insert: {
          id?: string
          nama_unit: string
          jenis_unit: string
          kode_unit?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          nama_unit?: string
          jenis_unit?: string
          kode_unit?: string | null
        }
        Relationships: []
      }
      users: {
        Row: {
          id: string
          email: string
          password_hash: string | null
          name: string
          role: UserRole
          unit_id: string | null
          institution: string | null
          phone: string | null
          address: string | null
          is_active: boolean
          email_verified: boolean
          account_status: string
          invitation_token: string | null
          invitation_expires_at: string | null
          password_set_at: string | null
          created_at: string
          updated_at: string
          last_login_at: string | null
          created_by: string | null
          avatar_url: string | null
        }
        Insert: {
          id?: string
          email: string
          password_hash?: string | null
          name: string
          role: UserRole
          unit_id?: string | null
          institution?: string | null
          phone?: string | null
          address?: string | null
          is_active?: boolean
          email_verified?: boolean
          account_status?: string
          invitation_token?: string | null
          invitation_expires_at?: string | null
          password_set_at?: string | null
          created_at?: string
          updated_at?: string
          last_login_at?: string | null
          created_by?: string | null
          avatar_url?: string | null
        }
        Update: {
          id?: string
          email?: string
          password_hash?: string | null
          name?: string
          role?: UserRole
          unit_id?: string | null
          institution?: string | null
          phone?: string | null
          address?: string | null
          is_active?: boolean
          email_verified?: boolean
          account_status?: string
          invitation_token?: string | null
          invitation_expires_at?: string | null
          password_set_at?: string | null
          last_login_at?: string | null
          created_by?: string | null
          avatar_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'users_unit_id_fkey'
            columns: ['unit_id']
            isOneToOne: false
            referencedRelation: 'unit_kerja'
            referencedColumns: ['id']
          }
        ]
      }
      mitra: {
        Row: {
          id: string
          nama_instansi: string
          alamat_lengkap: string | null
          jenis_mitra: PartnerType
          nama_penandatangan: string | null
          jabatan_penandatangan: string | null
          nama_pic: string | null
          kontak_pic: string | null
          email_pic: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          nama_instansi: string
          alamat_lengkap?: string | null
          jenis_mitra?: PartnerType
          nama_penandatangan?: string | null
          jabatan_penandatangan?: string | null
          nama_pic?: string | null
          kontak_pic?: string | null
          email_pic?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          nama_instansi?: string
          alamat_lengkap?: string | null
          jenis_mitra?: PartnerType
          nama_penandatangan?: string | null
          jabatan_penandatangan?: string | null
          nama_pic?: string | null
          kontak_pic?: string | null
          email_pic?: string | null
        }
        Relationships: []
      }
      pengajuan_penjajakan: {
        Row: {
          id: string
          mitra_id: string | null
          nama_instansi: string
          email_pic: string
          nama_pic: string | null
          telepon_pic: string | null
          judul_tawaran: string
          deskripsi_singkat: string | null
          file_legalitas: string | null
          file_profil_mitra: string | null
          status_pengajuan: StatusPengajuan
          catatan_dkui: string | null
          reviewed_by: string | null
          reviewed_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          mitra_id?: string | null
          nama_instansi: string
          email_pic: string
          nama_pic?: string | null
          telepon_pic?: string | null
          judul_tawaran: string
          deskripsi_singkat?: string | null
          file_legalitas?: string | null
          file_profil_mitra?: string | null
          status_pengajuan?: StatusPengajuan
          catatan_dkui?: string | null
          reviewed_by?: string | null
          reviewed_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          mitra_id?: string | null
          nama_instansi?: string
          email_pic?: string
          nama_pic?: string | null
          telepon_pic?: string | null
          judul_tawaran?: string
          deskripsi_singkat?: string | null
          file_legalitas?: string | null
          file_profil_mitra?: string | null
          status_pengajuan?: StatusPengajuan
          catatan_dkui?: string | null
          reviewed_by?: string | null
          reviewed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'pengajuan_penjajakan_mitra_id_fkey'
            columns: ['mitra_id']
            isOneToOne: false
            referencedRelation: 'mitra'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'pengajuan_penjajakan_reviewed_by_fkey'
            columns: ['reviewed_by']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          }
        ]
      }
      proposals: {
        Row: {
          id: string
          proposal_number: string | null
          // Relations
          mitra_id: string | null
          inisiator_id: string | null
          unit_terkait_id: string | null
          created_by: string | null
          // Info dasar
          initiator: InitiatorType
          title: string
          jenis_dokumen: JenisDokumen | null
          // Konten
          description: string | null
          objectives: string | null
          benefits: string | null
          scope_of_work: string | null
          ruang_lingkup: string | null
          // Lapkerma
          bentuk_kegiatan_lapkerma: string | null
          // Dokumen wajib
          file_berita_acara_penjajakan: string | null
          file_surat_kuasa: string | null
          file_naskah_final: string | null
          // Penandatangan
          penandatangan_upi: string | null
          // Keuangan
          is_income_generating: boolean
          // Timeline & Budget
          duration: number | null
          start_date: string | null
          end_date: string | null
          budget: number | null
          // Workflow
          status: ProposalStatus
          revision_type: RevisionType | null
          revision_reason: string | null
          // AI
          ai_summary: string | null
          ai_summary_generated_at: string | null
          // Tracking paraf (sequential)
          pimpinan_unit_approval_by: string | null
          pimpinan_unit_approval_at: string | null
          dkui_approval_by: string | null
          dkui_approval_at: string | null
          biro_hukum_paraf_by: string | null
          biro_hukum_paraf_at: string | null
          su_paraf_by: string | null
          su_paraf_at: string | null
          wr_paraf_by: string | null
          wr_paraf_at: string | null
          rektor_signed_by: string | null
          rektor_signed_at: string | null
          pimpinan_unit_signed_by: string | null
          pimpinan_unit_signed_at: string | null
          mitra_signed_by: string | null
          mitra_signed_at: string | null
          // Timestamps
          created_at: string
          updated_at: string
          submitted_at: string | null
          completed_at: string | null
          rejected_at: string | null
          archived_at: string | null
        }
        Insert: {
          id?: string
          proposal_number?: string | null
          mitra_id?: string | null
          inisiator_id?: string | null
          unit_terkait_id?: string | null
          created_by?: string | null
          initiator?: InitiatorType
          title: string
          jenis_dokumen?: JenisDokumen | null
          description?: string | null
          objectives?: string | null
          benefits?: string | null
          scope_of_work?: string | null
          ruang_lingkup?: string | null
          bentuk_kegiatan_lapkerma?: string | null
          file_berita_acara_penjajakan?: string | null
          file_surat_kuasa?: string | null
          file_naskah_final?: string | null
          penandatangan_upi?: string | null
          is_income_generating?: boolean
          duration?: number | null
          start_date?: string | null
          end_date?: string | null
          budget?: number | null
          status?: ProposalStatus
          revision_type?: RevisionType | null
          revision_reason?: string | null
          ai_summary?: string | null
          ai_summary_generated_at?: string | null
        }
        Update: {
          id?: string
          proposal_number?: string | null
          mitra_id?: string | null
          inisiator_id?: string | null
          unit_terkait_id?: string | null
          created_by?: string | null
          initiator?: InitiatorType
          title?: string
          jenis_dokumen?: JenisDokumen | null
          description?: string | null
          objectives?: string | null
          benefits?: string | null
          scope_of_work?: string | null
          ruang_lingkup?: string | null
          bentuk_kegiatan_lapkerma?: string | null
          file_berita_acara_penjajakan?: string | null
          file_surat_kuasa?: string | null
          file_naskah_final?: string | null
          penandatangan_upi?: string | null
          is_income_generating?: boolean
          duration?: number | null
          start_date?: string | null
          end_date?: string | null
          budget?: number | null
          status?: ProposalStatus
          revision_type?: RevisionType | null
          revision_reason?: string | null
          ai_summary?: string | null
          ai_summary_generated_at?: string | null
          pimpinan_unit_approval_by?: string | null
          pimpinan_unit_approval_at?: string | null
          dkui_approval_by?: string | null
          dkui_approval_at?: string | null
          biro_hukum_paraf_by?: string | null
          biro_hukum_paraf_at?: string | null
          su_paraf_by?: string | null
          su_paraf_at?: string | null
          wr_paraf_by?: string | null
          wr_paraf_at?: string | null
          rektor_signed_by?: string | null
          rektor_signed_at?: string | null
          pimpinan_unit_signed_by?: string | null
          pimpinan_unit_signed_at?: string | null
          mitra_signed_by?: string | null
          mitra_signed_at?: string | null
          archived_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'proposals_mitra_id_fkey'
            columns: ['mitra_id']
            isOneToOne: false
            referencedRelation: 'mitra'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'proposals_inisiator_id_fkey'
            columns: ['inisiator_id']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'proposals_unit_terkait_id_fkey'
            columns: ['unit_terkait_id']
            isOneToOne: false
            referencedRelation: 'unit_kerja'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'proposals_created_by_fkey'
            columns: ['created_by']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          }
        ]
      }
      documents: {
        Row: {
          id: string
          proposal_id: string
          name: string
          type: string
          size: number
          storage_path: string
          url: string | null
          category: string
          uploaded_by: string | null
          uploaded_at: string
          description: string | null
          version: number
          is_current: boolean
        }
        Insert: {
          id?: string
          proposal_id: string
          name: string
          type: string
          size: number
          storage_path: string
          url?: string | null
          category: string
          uploaded_by?: string | null
          uploaded_at?: string
          description?: string | null
          version?: number
          is_current?: boolean
        }
        Update: {
          id?: string
          proposal_id?: string
          name?: string
          type?: string
          size?: number
          storage_path?: string
          url?: string | null
          category?: string
          uploaded_by?: string | null
          description?: string | null
          version?: number
          is_current?: boolean
        }
        Relationships: [
          {
            foreignKeyName: 'documents_proposal_id_fkey'
            columns: ['proposal_id']
            isOneToOne: false
            referencedRelation: 'proposals'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'documents_uploaded_by_fkey'
            columns: ['uploaded_by']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          }
        ]
      }
      approval_history: {
        Row: {
          id: string
          proposal_id: string
          action: ApprovalAction
          actor_id: string | null
          actor_name: string
          actor_role: UserRole
          tahapan: string | null
          comment: string | null
          document_id: string | null
          timestamp: string
          metadata: Json | null
        }
        Insert: {
          id?: string
          proposal_id: string
          action: ApprovalAction
          actor_id?: string | null
          actor_name: string
          actor_role: UserRole
          tahapan?: string | null
          comment?: string | null
          document_id?: string | null
          timestamp?: string
          metadata?: Json | null
        }
        Update: {
          id?: string
          proposal_id?: string
          action?: ApprovalAction
          actor_id?: string | null
          actor_name?: string
          actor_role?: UserRole
          tahapan?: string | null
          comment?: string | null
          document_id?: string | null
          timestamp?: string
          metadata?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: 'approval_history_proposal_id_fkey'
            columns: ['proposal_id']
            isOneToOne: false
            referencedRelation: 'proposals'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'approval_history_actor_id_fkey'
            columns: ['actor_id']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          }
        ]
      }
      pendanaan: {
        Row: {
          id: string
          proposal_id: string
          nilai_kontrak: number | null
          biaya_pengembangan_institusi: number | null
          rekening_penerima: string | null
          status_pembayaran: string
          catatan: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          proposal_id: string
          nilai_kontrak?: number | null
          biaya_pengembangan_institusi?: number | null
          rekening_penerima?: string | null
          status_pembayaran?: string
          catatan?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          proposal_id?: string
          nilai_kontrak?: number | null
          biaya_pengembangan_institusi?: number | null
          rekening_penerima?: string | null
          status_pembayaran?: string
          catatan?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'pendanaan_proposal_id_fkey'
            columns: ['proposal_id']
            isOneToOne: false
            referencedRelation: 'proposals'
            referencedColumns: ['id']
          }
        ]
      }
      email_notifications: {
        Row: {
          id: string
          recipient_email: string
          recipient_name: string | null
          recipient_user_id: string | null
          subject: string
          body: string
          template_name: string | null
          proposal_id: string | null
          status: string
          sent_at: string | null
          failed_at: string | null
          error_message: string | null
          created_at: string
          metadata: Json | null
        }
        Insert: {
          id?: string
          recipient_email: string
          recipient_name?: string | null
          recipient_user_id?: string | null
          subject: string
          body: string
          template_name?: string | null
          proposal_id?: string | null
          status?: string
          sent_at?: string | null
          failed_at?: string | null
          error_message?: string | null
          created_at?: string
          metadata?: Json | null
        }
        Update: {
          id?: string
          recipient_email?: string
          recipient_name?: string | null
          recipient_user_id?: string | null
          subject?: string
          body?: string
          template_name?: string | null
          proposal_id?: string | null
          status?: string
          sent_at?: string | null
          failed_at?: string | null
          error_message?: string | null
          metadata?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: 'email_notifications_recipient_user_id_fkey'
            columns: ['recipient_user_id']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'email_notifications_proposal_id_fkey'
            columns: ['proposal_id']
            isOneToOne: false
            referencedRelation: 'proposals'
            referencedColumns: ['id']
          }
        ]
      }
      user_invitations: {
        Row: {
          id: string
          email: string
          name: string
          role: UserRole
          institution: string | null
          token: string
          proposal_id: string | null
          status: string
          invited_by: string
          created_at: string
          expires_at: string
          accepted_at: string | null
          temp_password: string | null
        }
        Insert: {
          id?: string
          email: string
          name: string
          role: UserRole
          institution?: string | null
          token: string
          proposal_id?: string | null
          status?: string
          invited_by: string
          created_at?: string
          expires_at?: string
          accepted_at?: string | null
          temp_password?: string | null
        }
        Update: {
          id?: string
          email?: string
          name?: string
          role?: UserRole
          institution?: string | null
          token?: string
          proposal_id?: string | null
          status?: string
          invited_by?: string
          accepted_at?: string | null
          temp_password?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'user_invitations_invited_by_fkey'
            columns: ['invited_by']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          }
        ]
      }
    }
    Views: {
      proposal_statistics: {
        Row: {
          status: ProposalStatus | null
          count: number | null
          count_last_30_days: number | null
          count_last_7_days: number | null
        }
        Relationships: []
      }
      proposals_with_details: {
        Row: {
          id: string
          proposal_number: string | null
          title: string
          status: ProposalStatus
          mitra_nama: string | null
          mitra_jenis: PartnerType | null
          mitra_penandatangan: string | null
          mitra_jabatan_penandatangan: string | null
          mitra_pic: string | null
          mitra_email: string | null
          unit_nama: string | null
          unit_jenis: string | null
          created_by_name: string | null
          created_by_role: UserRole | null
          inisiator_name: string | null
          document_count: number | null
          approval_history_count: number | null
          [key: string]: any // Allow access to all proposal columns
        }
        Relationships: []
      }
      pengajuan_with_mitra: {
        Row: {
          id: string
          nama_instansi: string
          email_pic: string
          judul_tawaran: string
          status_pengajuan: StatusPengajuan
          created_at: string
          mitra_nama_terdaftar: string | null
          jenis_mitra: PartnerType | null
          reviewer_name: string | null
          [key: string]: any
        }
        Relationships: []
      }
    }
    Functions: {
      generate_storage_path: {
        Args: {
          p_proposal_id: string
          p_category: string
          p_filename: string
        }
        Returns: string
      }
      generate_penjajakan_storage_path: {
        Args: {
          p_penjajakan_id: string
          p_category: string
          p_filename: string
        }
        Returns: string
      }
      generate_invitation_token: {
        Args: Record<string, never>
        Returns: string
      }
    }
    Enums: {
      user_role: UserRole
      proposal_status: ProposalStatus
      approval_action: ApprovalAction
      jenis_dokumen: JenisDokumen
      status_pengajuan: StatusPengajuan
      initiator_type: InitiatorType
      partner_type: PartnerType
      revision_type: RevisionType
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// ============================================
// CONVENIENCE TYPE ALIASES
// ============================================
// Use these instead of Database['public']['Tables']['xxx']['Row']

export type DbUnitKerja = Database['public']['Tables']['unit_kerja']['Row']
export type DbUser = Database['public']['Tables']['users']['Row']
export type DbMitra = Database['public']['Tables']['mitra']['Row']
export type DbPengajuanPenjajakan = Database['public']['Tables']['pengajuan_penjajakan']['Row']
export type DbProposal = Database['public']['Tables']['proposals']['Row']
export type DbDocument = Database['public']['Tables']['documents']['Row']
export type DbApprovalHistory = Database['public']['Tables']['approval_history']['Row']
export type DbPendanaan = Database['public']['Tables']['pendanaan']['Row']
export type DbEmailNotification = Database['public']['Tables']['email_notifications']['Row']
export type DbUserInvitation = Database['public']['Tables']['user_invitations']['Row']
