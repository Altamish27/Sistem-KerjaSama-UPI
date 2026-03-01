"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  MessageSquare, 
  AlertCircle,
  ExternalLink,
  FileText
} from "lucide-react"
import { supabase } from "@/lib/supabase/client"
import { useAuth } from "@/lib/auth-context"
import { formatDistanceToNow } from "date-fns"
import { id } from "date-fns/locale"
import Link from "next/link"

interface Comment {
  id: string
  comment: string
  action: string
  actor_name: string
  actor_role: string
  timestamp: string
  proposal_id: string
  proposal_number?: string
  proposal_title?: string
}

export function CommentsCard() {
  const { user } = useAuth()
  const [comments, setComments] = useState<Comment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    if (user?.id) {
      fetchComments()
      
      // Subscribe to realtime updates
      const subscription = supabase
        .channel('approval_history_changes')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'approval_history'
          },
          () => {
            fetchComments()
          }
        )
        .subscribe()

      return () => {
        subscription.unsubscribe()
      }
    }
  }, [user?.id])

  const fetchComments = async () => {
    if (!user?.id) return

    try {
      // Fetch approval history dengan comment yang tidak null
      // Join dengan proposals untuk mendapatkan info proposal
      const { data, error } = await supabase
        .from('approval_history')
        .select(`
          id,
          comment,
          action,
          actor_name,
          actor_role,
          timestamp,
          proposal_id,
          proposals (
            proposal_number,
            title,
            created_by,
            fakultas,
          )
        `)
        .not('comment', 'is', null)
        .neq('comment', '')
        .order('timestamp', { ascending: false })
        .limit(20)

      if (error) {
        console.error('Error fetching comments:', error)
        return
      }

      // Filter comments yang relevan untuk user ini
      const relevantComments = (data || []).filter((item: any) => {
        if (!item.proposals) return false
        
        const proposal = item.proposals
        
        // Show if user created the proposal
        if (proposal.created_by === user.id) return true
        
        // Show if user is assigned (DKUI)
        if (user.role === 'dkui' ) return true
        
        // Show if user is legal reviewer (Biro Hukum)
        if (user.role === 'biro_hukum') return true
        
        // Show if user is from the same fakultas
        if (user.role === 'fakultas' && proposal.fakultas === user.unit) return true
        
        // Show for rektor and wakil_rektor
        if (user.role === 'rektor' || user.role === 'wakil_rektor') return true
        
        return false
      })

      const formattedComments = relevantComments.map((item: any) => ({
        id: item.id,
        comment: item.comment,
        action: item.action,
        actor_name: item.actor_name,
        actor_role: item.actor_role,
        timestamp: item.timestamp,
        proposal_id: item.proposal_id,
        proposal_number: item.proposals?.proposal_number,
        proposal_title: item.proposals?.title
      }))

      setComments(formattedComments)
      
      // Count recent comments (last 24 hours) as "unread"
      const oneDayAgo = new Date()
      oneDayAgo.setHours(oneDayAgo.getHours() - 24)
      const recentCount = formattedComments.filter(
        (c: Comment) => new Date(c.timestamp) > oneDayAgo
      ).length
      setUnreadCount(recentCount)
      
    } catch (error) {
      console.error('Error fetching comments:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getActionLabel = (action: string) => {
    const labels: Record<string, string> = {
      'faculty_reject_substansi': 'Ditolak oleh Fakultas',
      'dkui_request_mitra_revision': 'Perlu Revisi',
      'biro_hukum_legalitas_rejected': 'Ditolak Biro Hukum',
      'warek_rejected': 'Ditolak Wakil Rektor',
      'rektor_rejected': 'Ditolak Rektor',
      'faculty_review_substansi': 'Review Substansi',
      'dkui_evaluate_feedback': 'Evaluasi Feedback',
      'dkui_legal_review_1': 'Review Legal',
      'biro_hukum_reviewing': 'Review Legalitas'
    }
    return labels[action] || action.replace(/_/g, ' ')
  }

  const getRoleLabel = (role: string) => {
    const labels: Record<string, string> = {
      'mitra': 'Mitra',
      'fakultas': 'Fakultas',
      'dkui': 'DKUI',
      'biro_hukum': 'Biro Hukum',
      'wakil_rektor': 'Wakil Rektor',
      'rektor': 'Rektor'
    }
    return labels[role] || role
  }

  if (isLoading) {
    return (
      <Card className="bg-white border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-slate-900 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-[#e10000]" />
            Catatan & Komentar
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#e10000]"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-white border-slate-200 shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-slate-900 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-[#e10000]" />
            Catatan & Komentar
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-2 bg-[#e10000]">
                {unreadCount} baru
              </Badge>
            )}
          </CardTitle>
        </div>
        <CardDescription>
          Komentar dan catatan dari proses review proposal
        </CardDescription>
      </CardHeader>
      <CardContent>
        {comments.length === 0 ? (
          <Alert className="bg-slate-50 border-slate-200">
            <MessageSquare className="h-4 w-4 text-slate-600" />
            <AlertDescription className="text-slate-600">
              Belum ada catatan atau komentar
            </AlertDescription>
          </Alert>
        ) : (
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-3">
              {comments.map((comment) => {
                const isRecent = new Date(comment.timestamp) > new Date(Date.now() - 24 * 60 * 60 * 1000)
                
                return (
                  <div
                    key={comment.id}
                    className={`p-4 rounded-lg border transition-colors ${
                      isRecent
                        ? 'bg-blue-50 border-blue-200'
                        : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <Badge variant="outline" className="bg-white">
                          {getActionLabel(comment.action)}
                        </Badge>
                        {isRecent && (
                          <Badge variant="outline" className="bg-[#e10000] text-white border-[#e10000]">
                            Baru
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="mb-3 p-3 bg-white rounded-md border border-slate-200">
                      <p className="text-sm text-slate-700 whitespace-pre-wrap">
                        {comment.comment}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600">
                      <span className="font-medium">
                        {comment.actor_name}
                      </span>
                      <span className="text-slate-400">•</span>
                      <span>
                        {getRoleLabel(comment.actor_role)}
                      </span>
                      <span className="text-slate-400">•</span>
                      <span>
                        {formatDistanceToNow(new Date(comment.timestamp), {
                          addSuffix: true,
                          locale: id
                        })}
                      </span>
                      {comment.proposal_number && (
                        <>
                          <span className="text-slate-400">•</span>
                          <Link 
                            href={`/dashboard/proposals/${comment.proposal_id}`}
                            className="flex items-center gap-1 text-[#e10000] hover:underline font-medium"
                          >
                            <FileText className="w-3 h-3" />
                            {comment.proposal_number}
                          </Link>
                        </>
                      )}
                    </div>
                    
                    {comment.proposal_title && (
                      <div className="mt-2 text-xs text-slate-500 truncate">
                        {comment.proposal_title}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  )
}
