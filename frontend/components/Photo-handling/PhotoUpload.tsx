import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Upload, Loader2, CheckCircle, AlertCircle, X } from "lucide-react"
import { UploadedPhoto, usePhotoHandler } from "@/components/Photo-handling/PhotoHandler"
import { useEffect, useState } from "react"
import { useAuth } from "@/components/auth-provider"

interface PhotoUploadProps {
  onPhotosChange?: (photos: UploadedPhoto[]) => void
  maxPhotos?: number
  className?: string
  resetKey?: number // Add reset key to force component reset
}

export function PhotoUpload({ onPhotosChange, maxPhotos, className, resetKey }: PhotoUploadProps) {
  const { user } = useAuth()
  const {
    uploadedPhotos,
    fileInputRef,
    handleFileSelect,
    triggerFileSelect,
    clearAllPhotos,
    removePhoto
  } = usePhotoHandler()

  const [error, setError] = useState<string | null>(null)

  // Notify parent component when photos change
  useEffect(() => {
    if (onPhotosChange) {
      onPhotosChange(uploadedPhotos)
    }
  }, [uploadedPhotos]) // Remove onPhotosChange from dependencies to prevent infinite loops

  // Reset component when resetKey changes
  useEffect(() => {
    if (resetKey !== undefined) {
      clearAllPhotos()
      setError(null)
    }
  }, [resetKey])

  const handleFileSelectWithLimit = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files) return

    if (maxPhotos && uploadedPhotos.length + files.length > maxPhotos) {
      setError(`You can only upload up to ${maxPhotos} photos`)
      return
    }

    setError(null)
    handleFileSelect(event)
  }

  const handleStartOver = async () => {
    if (confirm("Are you sure you want to clear all selected photos?")) {
      clearAllPhotos()
      setError(null)
    }
  }

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload Photos
          </CardTitle>
          <CardDescription>
            Select photos to analyze for duplicates
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Error Display */}
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {/* Upload Area */}
          <div className="space-y-4">
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
              <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground mb-3">
                Click to select photos or drag and drop
              </p>
              <p className="text-xs text-muted-foreground mb-4">
                JPG, PNG, GIF, WebP, BMP, TIFF • Max {maxPhotos || 50} photos
              </p>
              <Button onClick={triggerFileSelect} className="gap-2">
                <Upload className="h-4 w-4" />
                Select Photos
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileSelectWithLimit}
                className="hidden"
              />
            </div>
          </div>

          {/* Selected Photos Display */}
          {uploadedPhotos.length > 0 && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="font-medium">Selected Photos ({uploadedPhotos.length})</h4>
                <Button variant="outline" size="sm" onClick={handleStartOver}>
                  Clear All
                </Button>
              </div>
              
              <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {uploadedPhotos.map((photo) => (
                  <div key={photo.id} className="relative group">
                    <div className="aspect-square rounded-lg overflow-hidden border bg-transparent">
                      <img
                        src={photo.preview}
                        alt={photo.name}
                        className="w-full h-full object-contain"
                      />
                      {/* Individual Remove Button */}
                      <button
                        onClick={() => removePhoto(photo.id)}
                        className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                        title="Remove photo"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                    <div className="mt-1">
                      <p className="text-xs font-medium truncate">{photo.name}</p>
                      <p className="text-xs text-muted-foreground">{photo.size}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 