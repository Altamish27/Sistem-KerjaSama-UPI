"use client"

import { useState } from "react"
import { Button } from "./ui/button"
import { Textarea } from "./ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { Label } from "./ui/label"
import { Badge } from "./ui/badge"
import { Input } from "./ui/input"
import { 
  CheckCircle2, 
  XCircle, 
  RefreshCw, 
  Upload, 
  FileText,
  AlertCircle,
  Stamp
} from "lucide-react"
import { useDataStore } from "@/lib/data-store"
import { useAuth } from "@/lib/auth-context"
import { 
  getAvailableTransitions, 
  getStageLabel, 
  type ProposalStatus,
  type UserRole 
} from "@/lib/workflow-engine"
import { toast } from "sonner"

interface WorkflowActionsProps {
  proposalId: string
  currentStatus: string
  onActionComplete?: () => void
}

export function WorkflowActions({ proposalId, currentStatus, onActionComplete }: WorkflowActionsProps) {
  const { user } = useAuth()
  const { transitionProposalStatus, getProposalById } = useDataStore()
  const [feedback, setFeedback] = useState("")
  const [materaiFile, setMateraiFile] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  
  const proposal = getProposalById(proposalId)
  const userRole = user?.role as UserRole
  
  if (!user || !proposal) return null
  
  const availableTransitions = getAvailableTransitions(currentStatus as ProposalStatus, userRole)
  
  if (availableTransitions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Status Workflow</CardTitle>
          <CardDescription>
            Tidak ada aksi yang tersedia untuk Anda pada tahap ini.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <AlertCircle className="h-4 w-4" />
            <span>Status saat ini: {getStageLabel(currentStatus as ProposalStatus)}</span>
          </div>
        </CardContent>
      </Card>
    )
  }
  
  const handleAction = async (targetStatus: ProposalStatus, requiresMaterai: boolean = false) => {
    setIsLoading(true)
    try {
      const actionData: any = {}
      
      // Handle feedback untuk revisi/rejection
      if (targetStatus.includes('revision') || targetStatus === 'rejected') {
        if (!feedback.trim()) {
          toast.error("Mohon berikan feedback untuk revisi/penolakan")
          setIsLoading(false)
          return
        }
        actionData.feedback = feedback
        
        // Determine revision source
        if (targetStatus === 'revision_by_dkui') {
          actionData.revisionSource = 'dkui'
        } else if (targetStatus === 'revision_by_mitra') {
          actionData.revisionSource = 'mitra'
        }
      }
      
      // Handle materai upload
      if (requiresMaterai) {
        if (!materaiFile) {
          toast.error("Mohon upload file materai terlebih dahulu")
          setIsLoading(false)
          return
        }
        // TODO: Upload materai file to Supabase Storage
        // For now, just use placeholder URL
        actionData.materaiUrl = `materai_${Date.now()}_${materaiFile.name}`
      }
      
      await transitionProposalStatus(proposalId, targetStatus, actionData)
      
      toast.success(`Status berhasil diubah ke: ${getStageLabel(targetStatus)}`)
      setFeedback("")
      setMateraiFile(null)
      
      if (onActionComplete) {
        onActionComplete()
      }
    } catch (error) {
      console.error('Error executing workflow action:', error)
      toast.error("Gagal mengubah status proposal")
    } finally {
      setIsLoading(false)
    }
  }
  
  const getActionIcon = (action: string) => {
    if (action.includes('approve')) return <CheckCircle2 className="h-4 w-4" />
    if (action.includes('reject')) return <XCircle className="h-4 w-4" />
    if (action.includes('revise')) return <RefreshCw className="h-4 w-4" />
    if (action.includes('materai')) return <Stamp className="h-4 w-4" />
    if (action.includes('upload')) return <Upload className="h-4 w-4" />
    return <FileText className="h-4 w-4" />
  }
  
  const getActionVariant = (action: string): "default" | "destructive" | "outline" => {
    if (action.includes('approve') || action.includes('paraf')) return "default"
    if (action.includes('reject')) return "destructive"
    return "outline"
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Aksi Workflow</CardTitle>
        <CardDescription>
          Pilih aksi yang ingin dilakukan pada proposal ini
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Show feedback textarea if needed */}
        {availableTransitions.some(t => t.to.includes('revision') || t.to === 'rejected') && (
          <div className="space-y-2">
            <Label htmlFor="feedback">Feedback/Komentar *</Label>
            <Textarea
              id="feedback"
              placeholder="Berikan feedback atau alasan untuk revisi/penolakan..."
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              rows={4}
            />
          </div>
        )}
        
        {/* Show materai upload if needed */}
        {availableTransitions.some(t => t.requiresMaterai) && (
          <div className="space-y-2">
            <Label htmlFor="materai">Upload Materai *</Label>
            <Input
              id="materai"
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => setMateraiFile(e.target.files?.[0] || null)}
            />
            {materaiFile && (
              <p className="text-sm text-muted-foreground">
                File terpilih: {materaiFile.name}
              </p>
            )}
          </div>
        )}
        
        {/* Action buttons */}
        <div className="flex flex-wrap gap-2">
          {availableTransitions.map((transition) => (
            <Button
              key={`${transition.from}-${transition.to}`}
              variant={getActionVariant(transition.action)}
              onClick={() => handleAction(transition.to as ProposalStatus, transition.requiresMaterai)}
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              {getActionIcon(transition.action)}
              {getStageLabel(transition.to as ProposalStatus)}
            </Button>
          ))}
        </div>
        
        {/* Info badges */}
        <div className="flex flex-wrap gap-2 pt-2 border-t">
          <Badge variant="outline">
            Status: {getStageLabel(currentStatus as ProposalStatus)}
          </Badge>
          <Badge variant="outline">
            Role: {userRole}
          </Badge>
          {proposal.revision_count > 0 && (
            <Badge variant="secondary">
              Revisi: {proposal.revision_count}x
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
