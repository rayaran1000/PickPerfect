"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Settings, LogOut, RefreshCw, Check, Home, Upload, ChevronLeft, ChevronRight, RotateCcw, Brain, Zap, Star, Loader2 } from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { PhotoUpload } from "@/components/Photo-handling/PhotoUpload"
import { GoogleDrivePicker } from "@/components/Photo-handling/GoogleDrivePicker"
import { UploadedPhoto } from "@/components/Photo-handling/PhotoHandler"
import { AnalysisType, AnalysisTypeSelector } from "@/components/Photo-handling/AnalysisTypeSelector"
import { AnalysisResult, apiService } from "@/lib/api"

interface PhotoGroup {
  id: string
  type: 'duplicate' | 'similar' | 'unique'
  images: Array<{
    path: string
    filename: string
    quality: {
      overall_score: number
      resolution_score: number
      sharpness_score: number
      brightness_score: number
      contrast_score: number
      noise_score: number
      width: number
      height: number
    }
    file_size: number
  }>
  best_image: {
    path: string
    filename: string
    quality: any
    file_size: number
  }
  count: number
  similarity_score: number
}

export default function UserDashboard() {
  const { user, signOut, loading } = useAuth()
  const router = useRouter()
  
  const [uploadedPhotos, setUploadedPhotos] = useState<UploadedPhoto[]>([])
  const [activeTab, setActiveTab] = useState("upload")
  const [currentGroupIndex, setCurrentGroupIndex] = useState(0)
  const [selectedPhotos, setSelectedPhotos] = useState<Set<string>>(new Set())
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null)
  const [photoGroups, setPhotoGroups] = useState<PhotoGroup[]>([])
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [analysisType, setAnalysisType] = useState<AnalysisType>('pixel')
  const [showAnalysisControls, setShowAnalysisControls] = useState(false)
  const [showUploadButton, setShowUploadButton] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisProgress, setAnalysisProgress] = useState(0)
  const [showPreviewPage, setShowPreviewPage] = useState(false)
  const [resetKey, setResetKey] = useState(0) // Add reset key for component resets
  const [showResetMessage, setShowResetMessage] = useState(false) // Add reset message state

  // Get user info from Google OAuth using the correct structure
  const userEmail = user?.email
  const userName = user?.user_metadata?.full_name || 
                  user?.user_metadata?.name || 
                  userEmail?.split('@')[0]

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push("/")
    }
  }, [user, loading, router])

  // Cleanup any existing session data when dashboard initializes
  useEffect(() => {
    const cleanupExistingSession = async () => {
      if (user?.id) {
        try {
          // Clean up any existing session files for this user
          await apiService.cleanupUserFiles(user.id)
          console.log('Cleaned up existing session data on dashboard initialization')
        } catch (error) {
          console.error('Error cleaning up existing session:', error)
        }
      }
    }

    cleanupExistingSession()
  }, [user?.id])





  // Auto-advance tabs based on state
  useEffect(() => {
    if (analysisResult && photoGroups.length > 0) {
      setActiveTab("results")
      resetGroupNavigation()
    }
  }, [analysisResult, photoGroups.length])

  // Track photos from each source separately
  const [localPhotos, setLocalPhotos] = useState<UploadedPhoto[]>([])
  const [drivePhotos, setDrivePhotos] = useState<UploadedPhoto[]>([])

  // Combine photos whenever either source changes
  useEffect(() => {
    const allPhotos = [...localPhotos, ...drivePhotos]
    setUploadedPhotos(allPhotos)
    setShowUploadButton(allPhotos.length > 0)
  }, [localPhotos, drivePhotos])

  // Cleanup function to prevent memory leaks - only run on unmount
  useEffect(() => {
    return () => {
      // Clean up any object URLs when component unmounts
      uploadedPhotos.forEach(photo => {
        if (photo.preview && photo.preview.startsWith('blob:')) {
          URL.revokeObjectURL(photo.preview)
        }
      })
    }
  }, []) // Remove uploadedPhotos dependency to prevent premature cleanup

  const handleLocalPhotosChange = useCallback((photos: UploadedPhoto[]) => {
    setLocalPhotos(photos)
  }, [])

  const handleDrivePhotosChange = useCallback((photos: UploadedPhoto[]) => {
    setDrivePhotos(photos)
  }, [])

  const handleAnalysisComplete = (result: AnalysisResult) => {
    console.log('Analysis result received:', result)
    setAnalysisResult(result)
    
    // Set the session ID from the analysis result
    setSessionId(result.session_id)
    
    // Convert backend result to frontend format and sort by importance
    const groups: PhotoGroup[] = result.result.groups.map(group => {
      console.log('Processing group:', group)
      return {
        id: group.id,
        type: group.type,
        images: group.images.map(img => {
          console.log('Processing image:', img)
          // Extract filename from path (could be temp path or Supabase path)
          const pathParts = img.path.split('/')
          const fullFilename = pathParts[pathParts.length - 1] || 'unknown'
          
          // Try to extract original filename by removing session prefix
          const sessionPrefix = `${result.session_id}_`
          let originalFilename = fullFilename
          if (fullFilename.startsWith(sessionPrefix)) {
            originalFilename = fullFilename.substring(sessionPrefix.length)
          } else {
            // If no session prefix, try to extract from temp filename
            // Temp files might have UUID prefixes, so look for common image extensions
            const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.tiff']
            for (const ext of imageExtensions) {
              if (fullFilename.includes(ext)) {
                const extIndex = fullFilename.indexOf(ext)
                originalFilename = fullFilename.substring(extIndex - 8, extIndex + ext.length) // Approximate original name
                break
              }
            }
          }
          
          return {
            ...img,
            filename: originalFilename
          }
        }),
        best_image: {
          ...group.best_image,
          filename: (() => {
            const pathParts = group.best_image.path.split('/')
            const fullFilename = pathParts[pathParts.length - 1] || 'unknown'
            
            // Try to extract original filename by removing session prefix
            const sessionPrefix = `${result.session_id}_`
            let originalFilename = fullFilename
            if (fullFilename.startsWith(sessionPrefix)) {
              originalFilename = fullFilename.substring(sessionPrefix.length)
            } else {
              // If no session prefix, try to extract from temp filename
              const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.tiff']
              for (const ext of imageExtensions) {
                if (fullFilename.includes(ext)) {
                  const extIndex = fullFilename.indexOf(ext)
                  originalFilename = fullFilename.substring(extIndex - 8, extIndex + ext.length)
                  break
                }
              }
            }
            return originalFilename
          })()
        },
        count: group.count,
        similarity_score: group.similarity_score
      }
    })
    
    // Sort groups in descending order of importance:
    // 1. Duplicates/similar groups first (more important to review)
    // 2. Larger groups first (more potential space savings)
    // 3. Higher similarity scores first (more confident matches)
    const sortedGroups = groups.sort((a, b) => {
      // First priority: Group type (duplicates/similar > unique)
      const typePriority = { 'duplicate': 3, 'similar': 2, 'unique': 1 }
      const aTypePriority = typePriority[a.type] || 0
      const bTypePriority = typePriority[b.type] || 0
      
      if (aTypePriority !== bTypePriority) {
        return bTypePriority - aTypePriority // Descending order
      }
      
      // Second priority: Group size (larger groups first)
      if (a.count !== b.count) {
        return b.count - a.count // Descending order
      }
      
      // Third priority: Similarity score (higher scores first)
      return b.similarity_score - a.similarity_score // Descending order
    })
    
    setPhotoGroups(sortedGroups)
  }

  const handleSignOut = async () => {
    // Clean up current session photos if available
    if (sessionId && user?.id) {
      try {
        await apiService.cleanupSession(sessionId, user.id)
        console.log('Session cleaned up before logout')
      } catch (error) {
        console.error('Error cleaning up session:', error)
        // Continue with logout even if cleanup fails
      }
    }

    // Clean up any object URLs to prevent memory leaks
    const allPhotos = [...uploadedPhotos, ...localPhotos, ...drivePhotos]
    allPhotos.forEach(photo => {
      if (photo.preview && photo.preview.startsWith('blob:')) {
        URL.revokeObjectURL(photo.preview)
      }
    })

    // Sign out (this will also clean up all user files)
    await signOut()
    router.push("/")
  }

  const handleUploadAllPhotos = useCallback(async () => {
    if (!user?.id || uploadedPhotos.length === 0) {
      console.error('No user or photos to upload')
      return
    }

    setIsUploading(true)
    setUploadProgress(0)

    try {
      // All photos are already File objects (Drive photos were converted during selection)
      const allFiles: File[] = uploadedPhotos.map(photo => photo.file)
      
      setUploadProgress(30)

      // Upload all files to backend
      console.log(`Uploading ${allFiles.length} files to Supabase Storage...`)
      const uploadResponse = await apiService.uploadImages(allFiles, user.id)
      
      setUploadProgress(100)
      console.log('All photos uploaded:', uploadResponse)

      // Store the session ID for reuse in analysis
      setSessionId(uploadResponse.session_id)
      console.log('Session ID stored for reuse:', uploadResponse.session_id)

      // Show preview page
      setShowPreviewPage(true)
      setActiveTab("preview")

    } catch (error) {
      console.error('Upload failed:', error)
      setIsUploading(false)
      setUploadProgress(0)
    } finally {
      setIsUploading(false)
    }
  }, [user?.id, uploadedPhotos])

  const handleStartAnalysis = async () => {
    if (!user?.id || uploadedPhotos.length === 0) {
      console.error('No user or photos to analyze')
      return
    }

    setIsAnalyzing(true)
    setAnalysisProgress(0)

    try {
      let currentSessionId = sessionId

      // Only upload if we don't have a session ID (files haven't been uploaded yet)
      if (!currentSessionId) {
        console.log('No existing session ID, uploading photos first...')
        const uploadResponse = await apiService.uploadImages(
          uploadedPhotos.map(photo => photo.file),
          user.id
        )
        currentSessionId = uploadResponse.session_id
        console.log('Photos uploaded with session ID:', currentSessionId)
      } else {
        console.log('Using existing session ID:', currentSessionId)
        console.log('Skipping duplicate upload - files already uploaded to Supabase Storage')
      }

      // Start analysis with the session ID
      const analysisResponse = await apiService.startAnalysis(
        currentSessionId,
        user.id,
        analysisType
      )

      console.log('Analysis started:', analysisResponse)

      // Poll for completion
      const result = await apiService.pollAnalysisCompletion(
        analysisResponse.session_id,
        (status) => {
          // Extract progress from status if available
          if (status.status === 'processing') {
            setAnalysisProgress(50) // Show some progress
          } else if (status.status === 'completed') {
            setAnalysisProgress(100)
          }
        }
      )

      console.log('Analysis completed:', result)
      handleAnalysisComplete(result)

    } catch (error) {
      console.error('Analysis failed:', error)
      setIsAnalyzing(false)
      setAnalysisProgress(0)
    }
  }

  const resetDashboard = async () => {
    // Clean up current session if available
    if (sessionId && user?.id) {
      try {
        await apiService.cleanupSession(sessionId, user.id)
        console.log('Session cleaned up before starting over')
      } catch (error) {
        console.error('Error cleaning up session:', error)
        // Continue with start over even if cleanup fails
      }
    }
    
    // Clean up any object URLs to prevent memory leaks
    const allPhotos = [...uploadedPhotos, ...localPhotos, ...drivePhotos]
    allPhotos.forEach(photo => {
      if (photo.preview && photo.preview.startsWith('blob:')) {
        URL.revokeObjectURL(photo.preview)
      }
    })
    
    // Reset all state variables to initial values
    setUploadedPhotos([])
    setLocalPhotos([])
    setDrivePhotos([])
    setSelectedPhotos(new Set())
    setCurrentGroupIndex(0)
    setAnalysisResult(null)
    setPhotoGroups([])
    setSessionId(null)
    setAnalysisType('pixel') // Reset to default analysis type
    setActiveTab("upload")
    setShowAnalysisControls(false)
    setShowUploadButton(false)
    setIsUploading(false)
    setUploadProgress(0)
    setIsAnalyzing(false)
    setAnalysisProgress(0)
    setShowPreviewPage(false)
    setResetKey(prev => prev + 1) // Increment reset key to trigger component resets
    
    // Show reset success message
    setShowResetMessage(true)
    setTimeout(() => setShowResetMessage(false), 3000) // Hide after 3 seconds
    
    console.log('Dashboard reset to initial state')
  }

  const handleStartOver = async () => {
    if (confirm("Are you sure you want to start over? This will discard all current photos and analysis.")) {
      await resetDashboard()
    }
  }

  // Helper functions for group management
  const totalGroups = photoGroups.length
  const currentGroup = photoGroups[currentGroupIndex]
  const currentGroupPhotos = currentGroup?.images || []
  
  const handlePhotoSelection = (photoPath: string, selected: boolean) => {
    const newSelected = new Set(selectedPhotos)
    if (selected) {
      newSelected.add(photoPath)
    } else {
      newSelected.delete(photoPath)
    }
    setSelectedPhotos(newSelected)
  }

  const handleSelectAllInGroup = () => {
    const newSelected = new Set(selectedPhotos)
    currentGroupPhotos.forEach(photo => newSelected.add(photo.path))
    setSelectedPhotos(newSelected)
  }

  const handleClearAllInGroup = () => {
    const newSelected = new Set(selectedPhotos)
    currentGroupPhotos.forEach(photo => newSelected.delete(photo.path))
    setSelectedPhotos(newSelected)
  }

  const goToNextGroup = () => {
    if (currentGroupIndex < totalGroups - 1) {
      setCurrentGroupIndex(currentGroupIndex + 1)
    }
  }

  const goToPreviousGroup = () => {
    if (currentGroupIndex > 0) {
      setCurrentGroupIndex(currentGroupIndex - 1)
    }
  }

  const resetGroupNavigation = () => {
    setCurrentGroupIndex(0)
    setSelectedPhotos(new Set())
  }

  const handleDownloadSelected = async () => {
    if (selectedPhotos.size === 0) {
      alert("Please select at least one photo to download")
      return
    }

    if (!sessionId) {
      alert("No session found. Please upload photos first.")
      return
    }

    try {
      // Get the selected photo paths
      const selectedPhotoPaths = Array.from(selectedPhotos)
      
      // Call backend to create download
      const blob = await apiService.downloadSelectedPhotos(sessionId, selectedPhotoPaths)
      
      // Create download link
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `selected_photos_${new Date().toISOString().split('T')[0]}.zip`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      
    } catch (error) {
      console.error('Download error:', error)
      alert('Failed to download photos. Please try again.')
    }
  }

  const handleDownloadBestPhotos = async () => {
    if (!sessionId) {
      alert("No session found. Please upload photos first.")
      return
    }

    if (photoGroups.length === 0) {
      alert("No photo groups found.")
      return
    }

    try {
      // Get the best photo path from each group
      const bestPhotoPaths = photoGroups.map(group => group.best_image.path)
      
      // Call backend to create download
      const blob = await apiService.downloadSelectedPhotos(sessionId, bestPhotoPaths)
      
      // Create download link
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `best_photos_${new Date().toISOString().split('T')[0]}.zip`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      
    } catch (error) {
      console.error('Download error:', error)
      alert('Failed to download best photos. Please try again.')
    }
  }

  // Show loading while checking auth
  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      
      <main className="flex-1 container py-8">
        {/* Session Information */}
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start gap-2">
            <div className="flex-shrink-0 mt-0.5">
              <svg className="h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-sm text-blue-700">
                <strong>Note:</strong> Your progress is saved during this session. If you leave this page or refresh, you'll need to start over with a fresh upload. This is to ensure complete privacy and security.
              </p>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-1">Photo Organization</h1>
          <p className="text-muted-foreground">Upload photos to find duplicates and similar images</p>
        </div>

        {/* Reset Success Message */}
        {showResetMessage && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2">
              <div className="flex-shrink-0">
                <svg className="h-4 w-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-sm text-green-700">
                  <strong>Dashboard reset successfully!</strong> You can now start a new photo analysis session.
                </p>
              </div>
            </div>
          </div>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="upload" disabled={activeTab !== "upload" && uploadedPhotos.length > 0}>
              Upload Photos
            </TabsTrigger>
            <TabsTrigger value="preview" disabled={!showPreviewPage}>
              Preview Photos
            </TabsTrigger>
            <TabsTrigger value="processing" disabled={!analysisResult}>
              AI Processing
            </TabsTrigger>
            <TabsTrigger value="results" disabled={!analysisResult}>
              Review Results
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="space-y-4">
            {/* Analysis Type Selection at Top */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  Analysis Configuration
                </CardTitle>
                <CardDescription>
                  Choose how you want to analyze your photos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AnalysisTypeSelector
                  selectedType={analysisType}
                  onTypeChange={setAnalysisType}
                />
              </CardContent>
            </Card>

            {/* Upload Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <PhotoUpload
                onPhotosChange={handleLocalPhotosChange}
                maxPhotos={50}
                resetKey={resetKey}
              />
              <GoogleDrivePicker
                onPhotosChange={handleDrivePhotosChange}
                maxPhotos={50}
                resetKey={resetKey}
              />
            </div>

            {/* Upload Button */}
            {showUploadButton && !isUploading && (
              <div className="mt-6 text-center">
                <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-700">
                    <strong>Ready to upload:</strong> {uploadedPhotos.length} photos selected 
                    ({localPhotos.length} local, {drivePhotos.length} from Drive)
                  </p>
                </div>
                <Button 
                  onClick={handleUploadAllPhotos}
                  className="px-8"
                >
                  Upload All Photos to Storage
                </Button>
              </div>
            )}

            {/* Upload Progress */}
            {isUploading && (
              <div className="mt-6 space-y-4">
                <div className="text-center">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    {uploadProgress < 30 ? "Preparing files..." : 
                     uploadProgress < 60 ? "Uploading to storage..." : 
                     "Finalizing upload..."}
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <Progress value={uploadProgress} className="w-full" />
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="preview" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Photo Preview
                </CardTitle>
                <CardDescription>
                  Review your {uploadedPhotos.length} photos before starting analysis
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Photo Grid */}
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
                        <p className="text-xs text-blue-600">{photo.source}</p>
                      </div>
                    </div>
                  ))}
                </div>

                                 {/* Analysis Controls */}
                 <div className="flex gap-3 pt-4">
                   <Button 
                     onClick={handleStartAnalysis}
                     disabled={isAnalyzing || uploadedPhotos.length === 0}
                     className="flex-1"
                   >
                     {isAnalyzing ? (
                       <>
                         <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                         Analyzing...
                       </>
                     ) : (
                       <>
                         <Zap className="h-4 w-4 mr-2" />
                         Start Analysis
                       </>
                     )}
                   </Button>
                   
                   {/* Re-upload Button */}
                   <Button 
                     variant="outline"
                     onClick={resetDashboard}
                     disabled={isAnalyzing}
                     className="gap-2"
                   >
                     <RotateCcw className="h-4 w-4" />
                     Re-upload
                   </Button>
                 </div>

                {isAnalyzing && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Processing photos...</span>
                      <span>{analysisProgress}%</span>
                    </div>
                    <Progress value={analysisProgress} className="w-full" />
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="processing" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  AI Analysis Complete
                </CardTitle>
                <CardDescription>
                  Your photos have been analyzed by our AI
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {analysisResult && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700">
                      <Check className="h-5 w-5" />
                      <span>Analysis completed successfully!</span>
                    </div>
                    
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                      <div className="p-4 border rounded-lg text-center">
                        <div className="text-2xl font-bold text-primary">
                          {analysisResult.result.statistics.total_images}
                        </div>
                        <div className="text-sm text-muted-foreground">Total Photos</div>
                      </div>
                      <div className="p-4 border rounded-lg text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          {analysisResult.result.statistics.total_groups}
                        </div>
                        <div className="text-sm text-muted-foreground">Groups Found</div>
                      </div>
                      <div className="p-4 border rounded-lg text-center">
                        <div className="text-2xl font-bold text-orange-600">
                          {analysisType === 'ai' 
                            ? analysisResult.result.statistics.similar_count 
                            : analysisResult.result.statistics.duplicate_count
                          }
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {analysisType === 'ai' ? 'Similar Photos' : 'Duplicates'}
                        </div>
                      </div>
                      <div className="p-4 border rounded-lg text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {analysisResult.result.statistics.estimated_space_saved_mb.toFixed(1)} MB
                        </div>
                        <div className="text-sm text-muted-foreground">Space Saved</div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Button 
                  onClick={() => setActiveTab("results")} 
                  className="w-full"
                >
                  Review Results
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="results" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>
                      {analysisType === 'ai' ? 'Similar Image' : 'Exact Duplicate'} Analysis Results
                    </CardTitle>
                    <CardDescription>
                      {analysisResult && (
                        <>
                          Found {analysisType === 'ai' 
                            ? analysisResult.result.statistics.similar_count 
                            : analysisResult.result.statistics.duplicate_count
                          } {analysisType === 'ai' ? 'similar photos' : 'duplicates'}, and{' '}
                          {analysisResult.result.statistics.unique_count || 0} unique photos in {totalGroups} groups.
                          {analysisResult.result.statistics.estimated_space_saved_mb > 0 && 
                            ` You could save ${analysisResult.result.statistics.estimated_space_saved_mb.toFixed(1)} MB of space.`
                          }
                        </>
                      )}
                    </CardDescription>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleStartOver}
                    className="gap-2"
                  >
                    <RotateCcw className="h-4 w-4" />
                    Start Over
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {totalGroups === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">
                      No {analysisType === 'ai' ? 'similar photos' : 'duplicates'} found!
                    </p>
                    <p className="text-sm text-muted-foreground mt-2">
                      All your photos appear to be unique.
                    </p>
                  </div>
                ) : (
                  <>
                    {/* Progress indicator and sorting info */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-muted-foreground">
                          Group {currentGroupIndex + 1} of {totalGroups}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          Sorted by: {analysisType === 'ai' ? 'Similar' : 'Duplicate'} groups first, then by size
                        </span>
                      </div>
                      <div className="flex gap-2">
                        {[...Array(totalGroups)].map((_, i) => (
                          <div
                            key={i}
                            className={`w-2 h-2 rounded-full ${
                              i === currentGroupIndex ? 'bg-primary' : 'bg-muted'
                            }`}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Group content */}
                    {currentGroup && (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium">
                                Group {currentGroupIndex + 1} - {currentGroup.type}
                              </h4>
                              {/* Priority indicator */}
                              {currentGroup.type !== 'unique' && (
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  currentGroup.count >= 5 
                                    ? 'bg-red-100 text-red-700' 
                                    : currentGroup.count >= 3 
                                      ? 'bg-orange-100 text-orange-700'
                                      : 'bg-yellow-100 text-yellow-700'
                                }`}>
                                  {currentGroup.count >= 5 ? 'High Priority' : 
                                   currentGroup.count >= 3 ? 'Medium Priority' : 'Low Priority'}
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {currentGroup.type === 'unique' 
                                ? '1 unique photo found'
                                : `${currentGroup.count} ${analysisType === 'ai' ? 'similar' : 'duplicate'} photos found (${(currentGroup.similarity_score * 100).toFixed(0)}% similar)`
                              }
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={handleSelectAllInGroup}
                            >
                              Select All
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={handleClearAllInGroup}
                            >
                              Clear All
                            </Button>
                          </div>
                        </div>

                        {/* Best photo indicator */}
                        <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                          <p className="text-sm text-green-700">
                            <strong>Recommended:</strong> {currentGroup.best_image.filename} 
                            (highest quality in this group - {(currentGroup.best_image.quality.overall_score * 100).toFixed(0)}% quality score)
                          </p>
                        </div>

                        {/* Photos grid */}
                        <div className="grid gap-4 md:grid-cols-3">
                          {currentGroup.images.map((photo) => (
                            <div key={photo.path} className="relative group">
                              <div className="relative">
                                <img
                                  src={apiService.getImageUrl(analysisResult!.session_id, photo.path, user?.id)}
                                  alt={photo.filename}
                                  className="w-full h-auto max-h-64 object-contain rounded-lg"
                                />
                                <div className="absolute top-2 right-2">
                                  <input
                                    type="checkbox"
                                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                    checked={selectedPhotos.has(photo.path)}
                                    onChange={(e) => handlePhotoSelection(photo.path, e.target.checked)}
                                  />
                                </div>
                                {currentGroup.best_image.path === photo.path && (
                                  <div className="absolute top-2 left-2 bg-green-500 text-white px-2 py-1 rounded text-xs">
                                    Best
                                  </div>
                                )}
                              </div>
                              <div className="mt-2">
                                <p className="text-xs text-muted-foreground">
                                  {(photo.file_size / (1024 * 1024)).toFixed(1)} MB • {(photo.quality.overall_score * 100).toFixed(0)}% quality
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button 
                  variant="outline" 
                  onClick={goToPreviousGroup}
                  disabled={currentGroupIndex === 0}
                  className="gap-2"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous Group
                </Button>
                <div className="flex flex-col gap-1">
                  <span className="text-sm text-muted-foreground flex items-center">
                    {selectedPhotos.size} photos selected
                  </span>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    onClick={handleDownloadBestPhotos}
                    className="gap-2"
                  >
                    <Star className="h-4 w-4" />
                    Download Best Photos Only
                  </Button>
                  {currentGroupIndex === totalGroups - 1 && (
                    <Button onClick={handleDownloadSelected}>
                      Download Selected Photos
                    </Button>
                  )}
                  {currentGroupIndex < totalGroups - 1 && (
                    <Button onClick={goToNextGroup} className="gap-2">
                      Next Group
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
      
      <Footer />
    </div>
  )
}
