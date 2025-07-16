import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Upload, Loader2, CheckCircle, AlertCircle } from "lucide-react"
import { UploadedPhoto, usePhotoHandler } from "@/components/Photo-handling/PhotoHandler"
import { useEffect, useState } from "react"
import { apiService, UploadResponse, AnalysisResult } from "@/lib/api"
import { useAuth } from "@/components/auth-provider"

interface PhotoUploadProps {
  onPhotosChange?: (photos: UploadedPhoto[]) => void
  onAnalysisComplete?: (result: AnalysisResult) => void
  maxPhotos?: number
  className?: string
}

export function PhotoUpload({ onPhotosChange, onAnalysisComplete, maxPhotos, className }: PhotoUploadProps) {
  const { user } = useAuth()
  const {
    uploadedPhotos,
    fileInputRef,
    handleFileSelect,
    triggerFileSelect,
    clearAllPhotos
  } = usePhotoHandler()

  const [isUploading, setIsUploading] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [analysisProgress, setAnalysisProgress] = useState(0)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [uploadSuccess, setUploadSuccess] = useState(false)

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

  const uploadToBackend = async () => {
    if (uploadedPhotos.length === 0) {
      setError("No photos to upload")
      return
    }

    if (!user?.id) {
      setError("User not authenticated")
      return
    }

    setIsUploading(true)
    setError(null)
    setUploadProgress(0)

    try {
      console.log('Starting upload for user:', user.id)
      console.log('Number of files:', uploadedPhotos.length)
      
      // Convert UploadedPhoto objects to File objects
      const files = uploadedPhotos.map(photo => photo.file)
      
      // Upload to Supabase Storage
      const response: UploadResponse = await apiService.uploadImages(files, user.id)
      
      setSessionId(response.session_id)
      setUploadSuccess(true)
      setUploadProgress(100)
      
      console.log(`Successfully uploaded ${response.count} images`)
      
    } catch (err) {
      console.error('Upload error:', err)
      setError(err instanceof Error ? err.message : 'Upload failed')
      setUploadProgress(0)
    } finally {
      setIsUploading(false)
    }
  }

  const startAnalysis = async () => {
    if (!sessionId) {
      setError("No session ID available. Please upload photos first.")
      return
    }

    if (!user?.id) {
      setError("User not authenticated")
      return
    }

    setIsAnalyzing(true)
    setError(null)
    setAnalysisProgress(0)

    try {
      // Start analysis with user ID
      await apiService.startAnalysis(sessionId, user.id)
      
      // Poll for completion
      const result = await apiService.pollAnalysisCompletion(
        sessionId,
        (status) => {
          if (status.status === 'processing') {
            setAnalysisProgress(50) // Show progress
          }
        }
      )
      
      setAnalysisProgress(100)
      
      // Notify parent component
      if (onAnalysisComplete) {
        onAnalysisComplete(result)
      }
      
      console.log('Analysis completed:', result)
      
    } catch (err) {
      console.error('Analysis error:', err)
      setError(err instanceof Error ? err.message : 'Analysis failed')
      setAnalysisProgress(0)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleStartOver = () => {
    if (confirm("Are you sure you want to start over? This will clear all uploaded photos.")) {
      clearAllPhotos()
      setSessionId(null)
      setUploadSuccess(false)
      setUploadProgress(0)
      setAnalysisProgress(0)
      setError(null)
    }
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
          {/* Error Display */}
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {/* Success Display */}
          {uploadSuccess && (
            <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700">
              <CheckCircle className="h-4 w-4" />
              <span className="text-sm">Photos uploaded successfully! Ready for AI analysis.</span>
            </div>
          )}

          {/* Upload Area - Only show when no photos uploaded */}
          {!uploadSuccess && (
            <>
              <div 
                className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center cursor-pointer hover:border-primary transition-colors"
                onClick={triggerFileSelect}
              >
                <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-2">
                  Click to select photos or drag and drop them here
                </p>
                <p className="text-sm text-muted-foreground">
                  Supports: JPG, PNG, GIF, WebP, BMP, TIFF
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
            </>
          )}

          {/* Photo Preview Grid - Show when photos are uploaded */}
          {uploadSuccess && uploadedPhotos.length > 0 && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="font-medium">Uploaded Photos ({uploadedPhotos.length})</h4>
                <div className="flex gap-2">
                  <Button 
                    onClick={startAnalysis}
                    disabled={isAnalyzing}
                    size="sm"
                  >
                    {isAnalyzing ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      'Start AI Analysis'
                    )}
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleStartOver}>
                    Start Over
                  </Button>
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {uploadedPhotos.map((photo) => (
                  <div key={photo.id} className="relative group">
                    <div className="aspect-square rounded-lg overflow-hidden border bg-transparent">
                      <img
                        src={photo.preview}
                        alt={photo.name}
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="mt-2">
                      <p className="text-sm font-medium truncate">{photo.name}</p>
                      <p className="text-xs text-muted-foreground">{photo.size}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Photo Count Display - Only show when photos selected but not uploaded */}
          {uploadedPhotos.length > 0 && !uploadSuccess && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="font-medium">Selected Photos ({uploadedPhotos.length})</h4>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handleStartOver}>
                    Clear All
                  </Button>
                </div>
              </div>
              
              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  {uploadedPhotos.length} photos selected for AI analysis. 
                  Click "Upload & Analyze" to start the process.
                </p>
              </div>

              {/* Upload Progress */}
              {isUploading && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Uploading photos...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Analysis Progress */}
              {isAnalyzing && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>AI analyzing photos...</span>
                    <span>{analysisProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${analysisProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2">
                {!uploadSuccess && (
                  <Button 
                    onClick={uploadToBackend}
                    disabled={isUploading || uploadedPhotos.length === 0}
                    className="flex-1"
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      'Upload Photos'
                    )}
                  </Button>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 