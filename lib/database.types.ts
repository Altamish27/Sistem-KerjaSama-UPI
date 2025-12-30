export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          name: string
          role: 'mitra' | 'fakultas' | 'dkui' | 'biro_hukum' | 'warek' | 'rektor'
          organization: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          name: string
          role: 'mitra' | 'fakultas' | 'dkui' | 'biro_hukum' | 'warek' | 'rektor'
          organization?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string
          role?: 'mitra' | 'fakultas' | 'dkui' | 'biro_hukum' | 'warek' | 'rektor'
          organization?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      proposals: {
        Row: {
          id: string
          title: string
          description: string
          partner_name: string
          partner_email: string
          cooperation_type: string
          document_type: 'MOU' | 'MOA' | 'IA' | 'PKS'
          status: string
          current_stage: string
          submitted_by: string
          assigned_faculty: string | null
          ai_summary: string | null
          document_url: string | null
          parallel_tte_mitra_completed: boolean
          parallel_tte_rektor_completed: boolean
          materai_warek_url: string | null
          materai_rektor_url: string | null
          materai_mitra_url: string | null
          revision_source: 'mitra' | 'dkui' | null
          revision_count: number
          last_revision_feedback: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description: string
          partner_name: string
          partner_email: string
          cooperation_type: string
          document_type: 'MOU' | 'MOA' | 'IA' | 'PKS'
          status?: string
          current_stage?: string
          submitted_by: string
          assigned_faculty?: string | null
          ai_summary?: string | null
          document_url?: string | null
          parallel_tte_mitra_completed?: boolean
          parallel_tte_rektor_completed?: boolean
          materai_warek_url?: string | null
          materai_rektor_url?: string | null
          materai_mitra_url?: string | null
          revision_source?: 'mitra' | 'dkui' | null
          revision_count?: number
          last_revision_feedback?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          partner_name?: string
          partner_email?: string
          cooperation_type?: string
          document_type?: 'MOU' | 'MOA' | 'IA' | 'PKS'
          status?: string
          current_stage?: string
          submitted_by?: string
          assigned_faculty?: string | null
          ai_summary?: string | null
          document_url?: string | null
          parallel_tte_mitra_completed?: boolean
          parallel_tte_rektor_completed?: boolean
          materai_warek_url?: string | null
          materai_rektor_url?: string | null
          materai_mitra_url?: string | null
          revision_source?: 'mitra' | 'dkui' | null
          revision_count?: number
          last_revision_feedback?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      reviews: {
        Row: {
          id: string
          proposal_id: string
          reviewer_id: string
          reviewer_role: string
          stage: string
          status: 'pending' | 'approved' | 'revision_required' | 'rejected'
          comments: string | null
          revision_type: 'administrative' | 'legal' | null
          revised_document_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          proposal_id: string
          reviewer_id: string
          reviewer_role: string
          stage: string
          status?: 'pending' | 'approved' | 'revision_required' | 'rejected'
          comments?: string | null
          revision_type?: 'administrative' | 'legal' | null
          revised_document_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          proposal_id?: string
          reviewer_id?: string
          reviewer_role?: string
          stage?: string
          status?: 'pending' | 'approved' | 'revision_required' | 'rejected'
          comments?: string | null
          revision_type?: 'administrative' | 'legal' | null
          revised_document_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          proposal_id: string
          type: string
          title: string
          message: string
          read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          proposal_id: string
          type: string
          title: string
          message: string
          read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          proposal_id?: string
          type?: string
          title?: string
          message?: string
          read?: boolean
          created_at?: string
        }
      }
      activity_logs: {
        Row: {
          id: string
          proposal_id: string
          user_id: string
          action: string
          description: string
          metadata: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          proposal_id: string
          user_id: string
          action: string
          description: string
          metadata?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          proposal_id?: string
          user_id?: string
          action?: string
          description?: string
          metadata?: Json | null
          created_at?: string
        }
      }
      signatures: {
        Row: {
          id: string
          proposal_id: string
          signer_id: string
          signer_role: string
          signature_url: string | null
          stamp_url: string | null
          signed_at: string | null
          status: 'pending' | 'completed'
          created_at: string
        }
        Insert: {
          id?: string
          proposal_id: string
          signer_id: string
          signer_role: string
          signature_url?: string | null
          stamp_url?: string | null
          signed_at?: string | null
          status?: 'pending' | 'completed'
          created_at?: string
        }
        Update: {
          id?: string
          proposal_id?: string
          signer_id?: string
          signer_role?: string
          signature_url?: string | null
          stamp_url?: string | null
          signed_at?: string | null
          status?: 'pending' | 'completed'
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      user_role: 'mitra' | 'fakultas' | 'dkui' | 'biro_hukum' | 'warek' | 'rektor'
      proposal_status: 'draft' | 'submitted' | 'ai_summary' | 'verifikasi_substansi' | 'review_dkui' | 'review_hukum' | 'paraf_hukum' | 'paraf_dkui' | 'paraf_fakultas' | 'review_warek' | 'materai_warek' | 'tte_warek' | 'review_rektor' | 'materai_rektor' | 'tte_rektor' | 'review_mitra_final' | 'materai_mitra' | 'tte_mitra' | 'pertukaran_dokumen' | 'arsip' | 'revision_by_mitra' | 'revision_by_dkui' | 'rejected' | 'completed'
      review_status: 'pending' | 'approved' | 'revision_required' | 'rejected'
      revision_type: 'administrative' | 'legal'
      signature_status: 'pending' | 'completed'
      revisi_source: 'mitra' | 'dkui'
      document_type: 'MOU' | 'MOA' | 'IA' | 'PKS'
    }
  }
}
