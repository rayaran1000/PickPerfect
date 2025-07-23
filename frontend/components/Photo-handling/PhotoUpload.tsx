import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Upload, Loader2, CheckCircle, AlertCircle } from "lucide-react"
import { UploadedPhoto, usePhotoHandler } from "@/components/Photo-handling/PhotoHandler"
import { AnalysisTypeSelector, AnalysisType } from "@/components/Photo-handling/AnalysisTypeSelector"
import { useEffect, useState } from "react"
import { apiService, UploadResponse, AnalysisResult } from "@/lib/api"
import { useAuth } from "@/components/auth-provider"

interface PhotoUploadProps {
  onPhotosChange?: (photos: UploadedPhoto[]) => void
  onAnalysisComplete?: (result: AnalysisResult) => void
  onAnalysisTypeChange?: (type: AnalysisType) => void
  maxPhotos?: number
  className?: string
}

export function PhotoUpload({ onPhotosChange, onAnalysisComplete, onAnalysisTypeChange, maxPhotos, className }: PhotoUploadProps) {
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
  const [analysisType, setAnalysisType] = useState<AnalysisType>('pixel')

  // Notify parent component when photos change
  useEffect(() => {
    if (onPhotosChange) {
      onPhotosChange(uploadedPhotos)
    }
  }, [uploadedPhotos, onPhotosChange])

  // Notify parent component when analysis type changes
  useEffect(() => {
    if (onAnalysisTypeChange) {
      onAnalysisTypeChange(analysisType)
    }
  }, [analysisType, onAnalysisTypeChange])

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
      
      // First, check if backend is available
      try {
        await apiService.healthCheck()
        console.log('Backend health check passed')
      } catch (healthError) {
        console.error('Backend health check failed:', healthError)
        setError('Backend server is not available. Please make sure the backend is running on http://localhost:5000')
        return
      }
      
      // Convert UploadedPhoto objects to File objects
      const files = uploadedPhotos.map(photo => photo.file)
      
      // Upload to backend
      const response: UploadResponse = await apiService.uploadImages(files, user.id)
      
      setSessionId(response.session_id)
      setUploadSuccess(true)
      setUploadProgress(100)
      
      console.log(`Successfully uploaded ${response.count} images`)
      
    } catch (err) {
      console.error('Upload error:', err)
      if (err instanceof Error) {
        if (err.message.includes('Failed to fetch')) {
          setError('Cannot connect to backend server. Please make sure the backend is running on http://localhost:5000')
        } else {
          setError(err.message)
        }
      } else {
        setError('Upload failed - unknown error')
      }
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

    // Check if user has uploaded more than 1 photo
    if (uploadedPhotos.length <= 1) {
      setError("Please upload more than 1 photo for analysis. Duplicate detection requires at least 2 photos to compare.")
      return
    }

    setIsAnalyzing(true)
    setError(null)
    setAnalysisProgress(0)

    try {
      // Start analysis with user ID and analysis type
      await apiService.startAnalysis(sessionId, user.id, analysisType)
      
      // Give the backend a moment to set up the analysis
      await new Promise(resolve => setTimeout(resolve, 1000))
      
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
      if (err instanceof Error) {
        if (err.message.includes('404') || err.message.includes('not_found')) {
          setError('Analysis is taking longer than expected. Please try again in a moment.')
        } else if (err.message.includes('timed out')) {
          setError('Analysis timed out. Please try with fewer photos or try again.')
        } else {
          setError(err.message)
        }
      } else {
        setError('Analysis failed - unknown error')
      }
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
      setAnalysisType('pixel') // Reset to default analysis type
    }
  }

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <CardTitle>Upload Photos</CardTitle>
          <CardDescription>
            Select photos to analyze for {analysisType === 'ai' ? 'similar images' : 'duplicates'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Analysis Type Selection */}
          <AnalysisTypeSelector
            selectedType={analysisType}
            onTypeChange={setAnalysisType}
            disabled={uploadSuccess}
          />
          
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
              <span className="text-sm">Photos uploaded successfully! Ready for analysis.</span>
            </div>
          )}

          {/* Warning Display - Only 1 photo uploaded */}
          {uploadSuccess && uploadedPhotos.length === 1 && (
            <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-700">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">Please upload more than 1 photo to start analysis. Duplicate detection requires at least 2 photos to compare.</span>
            </div>
          )}

          {/* Upload Area - Only show when no photos uploaded */}
          {!uploadSuccess && (
            <>
              <div 
                className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center cursor-pointer hover:border-primary transition-colors"
                onClick={triggerFileSelect}
              >
                <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground mb-1">
                  Click to select photos or drag and drop
                </p>
                <p className="text-xs text-muted-foreground">
                  JPG, PNG, GIF, WebP, BMP, TIFF • Max 50 photos
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
                    variant="outline"
                    onClick={handleStartOver}
                    size="sm"
                  >
                    Re-upload
                  </Button>
                  <Button 
                    onClick={startAnalysis}
                    disabled={isAnalyzing || uploadedPhotos.length <= 1}
                    size="sm"
                    title={uploadedPhotos.length <= 1 ? "Upload more than 1 photo to start analysis" : ""}
                  >
                    {isAnalyzing ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      'Start Analysis'
                    )}
                  </Button>
                </div>
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

          {/* Photo Count Display - Only show when photos selected but not uploaded */}
          {uploadedPhotos.length > 0 && !uploadSuccess && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="font-medium">Selected Photos ({uploadedPhotos.length})</h4>
                <Button variant="outline" size="sm" onClick={handleStartOver}>
                  Clear All
                </Button>
              </div>
              
              <div className="p-3 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  {uploadedPhotos.length} photos selected. Click "Upload Photos" to continue.
                </p>
              </div>

              {/* Progress Indicators */}
              {(isUploading || isAnalyzing) && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>{isUploading ? 'Uploading...' : 'Analyzing...'}</span>
                    <span>{isUploading ? uploadProgress : analysisProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${
                        isUploading ? 'bg-primary' : 'bg-green-500'
                      }`}
                      style={{ width: `${isUploading ? uploadProgress : analysisProgress}%` }}
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