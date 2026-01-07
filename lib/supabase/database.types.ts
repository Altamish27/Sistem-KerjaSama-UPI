// ============================================
// DATABASE TYPES
// ============================================
// Auto-generated types dari Supabase schema
// Generate dengan: npx supabase gen types typescript --project-id your-project-id > lib/supabase/database.types.ts

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          password_hash: string | null
          name: string
          role: 'mitra' | 'fakultas' | 'dkui' | 'biro_hukum' | 'wakil_rektor' | 'rektor'
          fakultas: string | null
          institution: string | null
          phone: string | null
          address: string | null
          is_active: boolean
          email_verified: boolean
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
          role: 'mitra' | 'fakultas' | 'dkui' | 'biro_hukum' | 'wakil_rektor' | 'rektor'
          fakultas?: string | null
          institution?: string | null
          phone?: string | null
          address?: string | null
          is_active?: boolean
          email_verified?: boolean
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
          role?: 'mitra' | 'fakultas' | 'dkui' | 'biro_hukum' | 'wakil_rektor' | 'rektor'
          fakultas?: string | null
          institution?: string | null
          phone?: string | null
          address?: string | null
          is_active?: boolean
          email_verified?: boolean
          created_at?: string
          updated_at?: string
          last_login_at?: string | null
          created_by?: string | null
          avatar_url?: string | null
        }
      }
      proposals: {
        Row: {
          id: string
          proposal_number: string | null
          initiator: 'mitra' | 'fakultas'
          title: string
          partner_name: string
          partner_type: 'dalam_negeri' | 'luar_negeri'
          description: string
          objectives: string
          benefits: string
          scope_of_work: string
          duration: number
          start_date: string
          end_date: string
          budget: number | null
          status: string
          created_by: string
          fakultas: string | null
          selected_faculty_by: string | null
          ai_summary: string | null
          ai_summary_generated_at: string | null
          revision_type: 'mitra' | 'dkui' | null
          revision_reason: string | null
          biro_hukum_paraf_by: string | null
          biro_hukum_paraf_at: string | null
          dkui_paraf_by: string | null
          dkui_paraf_at: string | null
          faculty_approval_by: string | null
          faculty_approval_at: string | null
          mitra_stamp_at: string | null
          mitra_signed_by: string | null
          mitra_signed_at: string | null
          warek_stamp_at: string | null
          warek_signed_by: string | null
          warek_signed_at: string | null
          rektor_stamp_at: string | null
          rektor_signed_by: string | null
          rektor_signed_at: string | null
          created_at: string
          updated_at: string
          submitted_at: string | null
          completed_at: string | null
          rejected_at: string | null
        }
        Insert: {
          id?: string
          proposal_number?: string | null
          initiator: 'mitra' | 'fakultas'
          title: string
          partner_name: string
          partner_type: 'dalam_negeri' | 'luar_negeri'
          description: string
          objectives: string
          benefits: string
          scope_of_work: string
          duration: number
          start_date: string
          end_date: string
          budget?: number | null
          status?: string
          created_by: string
          fakultas?: string | null
          selected_faculty_by?: string | null
          ai_summary?: string | null
          ai_summary_generated_at?: string | null
          revision_type?: 'mitra' | 'dkui' | null
          revision_reason?: string | null
          [key: string]: any
        }
        Update: {
          [key: string]: any
        }
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
          uploaded_by: string
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
          uploaded_by: string
          uploaded_at?: string
          description?: string | null
          version?: number
          is_current?: boolean
        }
        Update: {
          [key: string]: any
        }
      }
      approval_history: {
        Row: {
          id: string
          proposal_id: string
          action: string
          actor_id: string
          actor_name: string
          actor_role: string
          comment: string | null
          document_id: string | null
          timestamp: string
          metadata: Json | null
        }
        Insert: {
          id?: string
          proposal_id: string
          action: string
          actor_id: string
          actor_name: string
          actor_role: string
          comment?: string | null
          document_id?: string | null
          timestamp?: string
          metadata?: Json | null
        }
        Update: {
          [key: string]: any
        }
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
          [key: string]: any
        }
      }
      user_invitations: {
        Row: {
          id: string
          email: string
          name: string
          role: string
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
          role: string
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
          [key: string]: any
        }
      }
      email_templates: {
        Row: {
          id: string
          name: string
          subject: string
          body_html: string
          body_text: string
          description: string | null
          variables: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          subject: string
          body_html: string
          body_text: string
          description?: string | null
          variables?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          [key: string]: any
        }
      }
    }
    Views: {
      proposal_statistics: {
        Row: {
          status: string | null
          count: number | null
          count_last_30_days: number | null
          count_last_7_days: number | null
        }
      }
      proposals_with_details: {
        Row: {
          id: string
          proposal_number: string | null
          title: string
          created_by_name: string | null
          created_by_role: string | null
          created_by_institution: string | null
          document_count: number | null
          approval_history_count: number | null
          [key: string]: any
        }
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
      render_email_template: {
        Args: {
          template_name: string
          variables: Json
        }
        Returns: {
          subject: string
          body_html: string
          body_text: string
        }[]
      }
    }
    Enums: {
      user_role: 'mitra' | 'fakultas' | 'dkui' | 'biro_hukum' | 'wakil_rektor' | 'rektor'
      proposal_status: string
      initiator_type: 'mitra' | 'fakultas'
      partner_type: 'dalam_negeri' | 'luar_negeri'
      approval_action: string
      revision_type: 'mitra' | 'dkui'
    }
  }
}
