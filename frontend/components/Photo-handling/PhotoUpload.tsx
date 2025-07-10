import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Upload, X, FileImage } from "lucide-react"
import { UploadedPhoto, usePhotoHandler } from "@/components/Photo-handling/PhotoHandler"
import { useEffect } from "react"

interface PhotoUploadProps {
  onPhotosChange?: (photos: UploadedPhoto[]) => void
  maxPhotos?: number
  className?: string
}

export function PhotoUpload({ onPhotosChange, maxPhotos, className }: PhotoUploadProps) {
  const {
    uploadedPhotos,
    fileInputRef,
    handleFileSelect,
    removePhoto,
    getPhotoCount,
    triggerFileSelect
  } = usePhotoHandler()

  // Notify parent component when photos change
  useEffect(() => {
    if (onPhotosChange) {
      onPhotosChange(uploadedPhotos)
    }
  }, [uploadedPhotos, onPhotosChange])



  const handleFileSelectWithLimit = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files) return

    if (maxPhotos && uploadedPhotos.length + files.length > maxPhotos) {
      alert(`You can only upload up to ${maxPhotos} photos`)
      return
    }

    handleFileSelect(event)
  }

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <CardTitle>Upload Photos</CardTitle>
          <CardDescription>
            Select photos from your device to analyze for duplicates
            {maxPhotos && ` (Max ${maxPhotos} photos)`}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Upload Area */}
          <div 
            className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center cursor-pointer hover:border-primary transition-colors"
            onClick={triggerFileSelect}
          >
            <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-2">
              Click to select photos or drag and drop them here
            </p>
            <p className="text-sm text-muted-foreground">
              Supports: JPG, PNG, GIF, WebP
            </p>
          </div>

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileSelectWithLimit}
            className="hidden"
          />

          {/* Photo Count Display */}
          {uploadedPhotos.length > 0 && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="font-medium">Selected Photos ({uploadedPhotos.length})</h4>
                <Button variant="outline" size="sm" onClick={triggerFileSelect}>
                  Add More
                </Button>
              </div>
              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  {uploadedPhotos.length} photos selected for analysis. 
                  You'll be able to preview and review them after the scan is complete.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 