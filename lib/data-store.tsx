"use client"

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react"
import { supabase } from "./supabase"
import { useAuth } from "./auth-context"

export interface Proposal {
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

export interface Review {
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

export interface Notification {
  id: string
  user_id: string
  proposal_id: string
  type: string
  title: string
  message: string
  read: boolean
  created_at: string
}

export interface ActivityLog {
  id: string
  proposal_id: string
  user_id: string
  action: string
  description: string
  metadata: any
  created_at: string
}

interface DataStoreContextType {
  proposals: Proposal[]
  reviews: Review[]
  notifications: Notification[]
  activityLogs: ActivityLog[]
  isLoading: boolean
  getProposalById: (id: string) => Proposal | undefined
  createProposal: (proposal: Omit<Proposal, 'id' | 'created_at' | 'updated_at' | 'parallel_tte_mitra_completed' | 'parallel_tte_rektor_completed' | 'materai_warek_url' | 'materai_rektor_url' | 'materai_mitra_url' | 'revision_source' | 'revision_count' | 'last_revision_feedback'>) => Promise<Proposal | null>
  updateProposal: (id: string, updates: Partial<Proposal>) => Promise<void>
  deleteProposal: (id: string) => Promise<void>
  createReview: (review: Omit<Review, 'id' | 'created_at' | 'updated_at'>) => Promise<void>
  updateReview: (id: string, updates: Partial<Review>) => Promise<void>
  markNotificationAsRead: (id: string) => Promise<void>
  getProposalReviews: (proposalId: string) => Review[]
  getProposalActivityLogs: (proposalId: string) => ActivityLog[]
  refreshData: () => Promise<void>
  transitionProposalStatus: (proposalId: string, targetStatus: string, actionData?: { feedback?: string; materaiUrl?: string; revisionSource?: 'mitra' | 'dkui' }) => Promise<void>
}

const DataStoreContext = createContext<DataStoreContextType | undefined>(undefined)

export function DataStoreProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [proposals, setProposals] = useState<Proposal[]>([])
  const [reviews, setReviews] = useState<Review[]>([])
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Load data on mount and when user changes
  useEffect(() => {
    if (user) {
      loadData()
      subscribeToChanges()
    }
  }, [user])

  const loadData = async () => {
    if (!user) return
    
    setIsLoading(true)
    try {
      // Load proposals
      const { data: proposalsData, error: proposalsError } = await supabase
        .from('proposals')
        .select('*')
        .order('created_at', { ascending: false })

      if (proposalsError) throw proposalsError
      setProposals(proposalsData || [])

      // Load reviews
      const { data: reviewsData, error: reviewsError } = await supabase
        .from('reviews')
        .select('*')
        .order('created_at', { ascending: false })

      if (reviewsError) throw reviewsError
      setReviews(reviewsData || [])

      // Load notifications for current user
      const { data: notificationsData, error: notificationsError } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50)

      if (notificationsError) throw notificationsError
      setNotifications(notificationsData || [])

      // Load activity logs
      const { data: logsData, error: logsError } = await supabase
        .from('activity_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100)

      if (logsError) throw logsError
      setActivityLogs(logsData || [])
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const subscribeToChanges = () => {
    // Subscribe to proposals changes
    const proposalsChannel = supabase
      .channel('proposals-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'proposals' },
        () => {
          loadData()
        }
      )
      .subscribe()

    // Subscribe to notifications changes
    const notificationsChannel = supabase
      .channel('notifications-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'notifications', filter: `user_id=eq.${user?.id}` },
        () => {
          loadData()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(proposalsChannel)
      supabase.removeChannel(notificationsChannel)
    }
  }

  const getProposalById = useCallback(
    (id: string) => {
      return proposals.find((p) => p.id === id)
    },
    [proposals]
  )

  const createProposal = async (proposal: Omit<Proposal, 'id' | 'created_at' | 'updated_at'>): Promise<Proposal | null> => {
    try {
      const { data, error } = await supabase
        .from('proposals')
        .insert([proposal])
        .select()
        .single()

      if (error) throw error

      // Log activity
      if (data) {
        await supabase.from('activity_logs').insert([{
          proposal_id: data.id,
          user_id: user?.id,
          action: 'created',
          description: `Proposal "${proposal.title}" dibuat`,
        }])
      }

      return data
    } catch (error) {
      console.error('Error creating proposal:', error)
      return null
    }
  }

  const updateProposal = async (id: string, updates: Partial<Proposal>) => {
    try {
      const { error } = await supabase
        .from('proposals')
        .update(updates)
        .eq('id', id)

      if (error) throw error

      // Log activity
      await supabase.from('activity_logs').insert([{
        proposal_id: id,
        user_id: user?.id,
        action: 'updated',
        description: `Proposal diperbarui`,
        metadata: updates,
      }])

      await loadData()
    } catch (error) {
      console.error('Error updating proposal:', error)
    }
  }

  const deleteProposal = async (id: string) => {
    try {
      const { error } = await supabase
        .from('proposals')
        .delete()
        .eq('id', id)

      if (error) throw error
      await loadData()
    } catch (error) {
      console.error('Error deleting proposal:', error)
    }
  }

  const createReview = async (review: Omit<Review, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .insert([review])
        .select()
        .single()

      if (error) throw error

      // Log activity
      if (data) {
        await supabase.from('activity_logs').insert([{
          proposal_id: review.proposal_id,
          user_id: user?.id,
          action: 'reviewed',
          description: `Review ${review.stage} - ${review.status}`,
          metadata: { review_id: data.id },
        }])
      }

      await loadData()
    } catch (error) {
      console.error('Error creating review:', error)
    }
  }

  const updateReview = async (id: string, updates: Partial<Review>) => {
    try {
      const { error } = await supabase
        .from('reviews')
        .update(updates)
        .eq('id', id)

      if (error) throw error
      await loadData()
    } catch (error) {
      console.error('Error updating review:', error)
    }
  }

  const markNotificationAsRead = async (id: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', id)

      if (error) throw error
      await loadData()
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  const getProposalReviews = useCallback(
    (proposalId: string) => {
      return reviews.filter((r) => r.proposal_id === proposalId)
    },
    [reviews]
  )

  const getProposalActivityLogs = useCallback(
    (proposalId: string) => {
      return activityLogs.filter((log) => log.proposal_id === proposalId)
    },
    [activityLogs]
  )

  const refreshData = async () => {
    await loadData()
  }

  // Workflow action: Transition to next status
  const transitionProposalStatus = async (
    proposalId: string,
    targetStatus: string,
    actionData?: {
      feedback?: string
      materaiUrl?: string
      revisionSource?: 'mitra' | 'dkui'
    }
  ) => {
    try {
      const updates: any = { status: targetStatus }
      
      // Handle specific status transitions
      if (targetStatus === 'revision_by_mitra' || targetStatus === 'revision_by_dkui') {
        updates.revision_count = (getProposalById(proposalId)?.revision_count || 0) + 1
        if (actionData?.feedback) {
          updates.last_revision_feedback = actionData.feedback
        }
        if (actionData?.revisionSource) {
          updates.revision_source = actionData.revisionSource
        }
      }
      
      // Handle materai uploads
      if (targetStatus === 'tte_warek' && actionData?.materaiUrl) {
        updates.materai_warek_url = actionData.materaiUrl
      }
      if (targetStatus === 'tte_rektor' && actionData?.materaiUrl) {
        updates.materai_rektor_url = actionData.materaiUrl
      }
      if (targetStatus === 'tte_mitra' && actionData?.materaiUrl) {
        updates.materai_mitra_url = actionData.materaiUrl
      }
      
      // Handle parallel TTE completion
      if (targetStatus === 'tte_mitra') {
        updates.parallel_tte_mitra_completed = true
      }
      if (targetStatus === 'tte_rektor') {
        updates.parallel_tte_rektor_completed = true
      }
      
      // Check if both parallel TTEs are done, then move to pertukaran_dokumen
      const proposal = getProposalById(proposalId)
      if (proposal) {
        if (targetStatus === 'tte_mitra' && proposal.parallel_tte_rektor_completed) {
          updates.status = 'pertukaran_dokumen'
        }
        if (targetStatus === 'tte_rektor' && proposal.parallel_tte_mitra_completed) {
          updates.status = 'pertukaran_dokumen'
        }
      }
      
      await updateProposal(proposalId, updates)
      
      // Log activity
      await supabase.from('activity_logs').insert([{
        proposal_id: proposalId,
        user_id: user?.id,
        action: 'status_transition',
        description: `Status diubah ke: ${targetStatus}`,
        metadata: { previous_status: proposal?.status, new_status: targetStatus, ...actionData },
      }])
      
      await loadData()
    } catch (error) {
      console.error('Error transitioning proposal status:', error)
      throw error
    }
  }

  return (
    <DataStoreContext.Provider
      value={{
        proposals,
        reviews,
        notifications,
        activityLogs,
        isLoading,
        getProposalById,
        createProposal,
        updateProposal,
        deleteProposal,
        createReview,
        updateReview,
        markNotificationAsRead,
        getProposalReviews,
        getProposalActivityLogs,
        refreshData,
        transitionProposalStatus,
      }}
    >
      {children}
    </DataStoreContext.Provider>
  )
}

export function useDataStore() {
  const context = useContext(DataStoreContext)
  if (context === undefined) {
    throw new Error("useDataStore must be used within a DataStoreProvider")
  }
  return context
}
