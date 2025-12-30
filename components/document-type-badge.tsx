import { Badge } from "@/components/ui/badge"
import { FileSignature } from "lucide-react"

interface DocumentTypeBadgeProps {
  type: 'MOU' | 'MOA' | 'IA' | 'PKS'
  showIcon?: boolean
  className?: string
}

const DOCUMENT_TYPE_CONFIG = {
  MOU: {
    label: 'MOU',
    fullName: 'Memorandum of Understanding',
    color: 'bg-blue-100 text-blue-800 border-blue-300',
  },
  MOA: {
    label: 'MOA',
    fullName: 'Memorandum of Agreement',
    color: 'bg-green-100 text-green-800 border-green-300',
  },
  IA: {
    label: 'IA',
    fullName: 'Implementation Agreement',
    color: 'bg-purple-100 text-purple-800 border-purple-300',
  },
  PKS: {
    label: 'PKS',
    fullName: 'Perjanjian Kerja Sama',
    color: 'bg-orange-100 text-orange-800 border-orange-300',
  },
}

export function DocumentTypeBadge({ type, showIcon = false, className = '' }: DocumentTypeBadgeProps) {
  const config = DOCUMENT_TYPE_CONFIG[type]

  return (
    <Badge 
      variant="outline" 
      className={`${config.color} ${className}`}
      title={config.fullName}
    >
      {showIcon && <FileSignature className="mr-1 h-3 w-3" />}
      {config.label}
    </Badge>
  )
}

export function DocumentTypeLabel({ type }: { type: 'MOU' | 'MOA' | 'IA' | 'PKS' }) {
  const config = DOCUMENT_TYPE_CONFIG[type]
  
  return (
    <div className="flex items-center gap-2">
      <FileSignature className="h-4 w-4 text-muted-foreground" />
      <div>
        <p className="font-medium">{config.label}</p>
        <p className="text-xs text-muted-foreground">{config.fullName}</p>
      </div>
    </div>
  )
}
