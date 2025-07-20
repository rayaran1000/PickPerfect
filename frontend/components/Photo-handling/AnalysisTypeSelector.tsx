import { Button } from "@/components/ui/button"
import { Brain, Zap, Lock } from "lucide-react"

export type AnalysisType = 'pixel' | 'ai'

interface AnalysisTypeSelectorProps {
  selectedType: AnalysisType
  onTypeChange: (type: AnalysisType) => void
  disabled?: boolean
  className?: string
}

export function AnalysisTypeSelector({ selectedType, onTypeChange, disabled = false, className }: AnalysisTypeSelectorProps) {
  return (
    <div className={className}>
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
          Analysis Type
          {disabled && <Lock className="h-3 w-3" />}
        </label>
        <div className="flex gap-2">
          <Button
            type="button"
            variant={selectedType === 'pixel' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onTypeChange('pixel')}
            disabled={disabled}
            className={`flex items-center gap-2 ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
            title={disabled ? 'Analysis type cannot be changed after upload' : 'Select exact duplicate detection'}
          >
            <Zap className="h-4 w-4" />
            Exact Duplicates
          </Button>
          <Button
            type="button"
            variant={selectedType === 'ai' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onTypeChange('ai')}
            disabled={disabled}
            className={`flex items-center gap-2 ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
            title={disabled ? 'Analysis type cannot be changed after upload' : 'Select similar image detection'}
          >
            <Brain className="h-4 w-4" />
            Similar Images
          </Button>
        </div>
        <p className={`text-xs ${disabled ? 'text-blue-600 font-medium' : 'text-muted-foreground'}`}>
          {disabled 
            ? `Analysis type locked: ${selectedType === 'pixel' ? 'Exact Duplicates' : 'Similar Images'}`
            : selectedType === 'pixel' 
              ? 'Find identical or nearly identical photos'
              : 'Find photos with similar content using AI'
          }
        </p>
      </div>
    </div>
  )
} 