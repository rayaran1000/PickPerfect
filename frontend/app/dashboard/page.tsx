"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LucideImage, Settings, LogOut, RefreshCw, Check, Home, Upload, ChevronLeft, ChevronRight, RotateCcw } from "lucide-react"
import { ThemeToggle } from "@/components/Theme-handling/theme-toggle"
import { PhotoUpload } from "@/components/Photo-handling/PhotoUpload"
import { UploadedPhoto } from "@/components/Photo-handling/PhotoHandler"
import { GoogleDriveConnect } from "@/components/Photo-handling/GoogleDriveConnect"

export default function UserDashboard() {
  const { user, signOut } = useAuth()
  const router = useRouter()
  
  const [scanStarted, setScanStarted] = useState(false)
  const [scanComplete, setScanComplete] = useState(false)
  const [scanProgress, setScanProgress] = useState(0)
  const [uploadedPhotos, setUploadedPhotos] = useState<UploadedPhoto[]>([])
  const [activeTab, setActiveTab] = useState("connect")
  const [currentGroupIndex, setCurrentGroupIndex] = useState(0)
  const [selectedPhotos, setSelectedPhotos] = useState<Set<string>>(new Set())

  // Get user info from Google OAuth using the correct structure
  const userEmail = user?.email
  const userName = user?.user_metadata?.full_name || 
                  user?.user_metadata?.name || 
                  userEmail?.split('@')[0]

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!user) {
      router.push("/")
    }
  }, [user, router])

  // Auto-advance tabs based on state
  useEffect(() => {
    if (uploadedPhotos.length > 0 && !scanStarted) {
      setActiveTab("scan")
    } else if (scanComplete) {
      setActiveTab("results")
      resetGroupNavigation()
    }
  }, [uploadedPhotos.length, scanStarted, scanComplete])

  const startScan = () => {
    setScanStarted(true)

    // Simulate scan progress
    const interval = setInterval(() => {
      setScanProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          setScanComplete(true)
          return 100
        }
        return prev + 10
      })
    }, 500)
  }

  const handleSignOut = async () => {
    await signOut()
    router.push("/")
  }

  const handleStartOver = () => {
    if (confirm("Are you sure you want to start over? This will discard all current photos and selections.")) {
      setUploadedPhotos([])
      setSelectedPhotos(new Set())
      setCurrentGroupIndex(0)
      setScanStarted(false)
      setScanComplete(false)
      setScanProgress(0)
      setActiveTab("connect")
    }
  }

  // Helper functions for group management
  const totalGroups = Math.ceil(uploadedPhotos.length / 3)
  const currentGroupPhotos = uploadedPhotos.slice(currentGroupIndex * 3, (currentGroupIndex + 1) * 3)
  
  const handlePhotoSelection = (photoId: string, selected: boolean) => {
    const newSelected = new Set(selectedPhotos)
    if (selected) {
      newSelected.add(photoId)
    } else {
      newSelected.delete(photoId)
    }
    setSelectedPhotos(newSelected)
  }

  const handleSelectAllInGroup = () => {
    const newSelected = new Set(selectedPhotos)
    currentGroupPhotos.forEach(photo => newSelected.add(photo.id))
    setSelectedPhotos(newSelected)
  }

  const handleClearAllInGroup = () => {
    const newSelected = new Set(selectedPhotos)
    currentGroupPhotos.forEach(photo => newSelected.delete(photo.id))
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

  // Handle URL parameters for Drive connection status
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const driveConnected = urlParams.get('drive_connected')
    const error = urlParams.get('error')
    
    if (driveConnected === 'true') {
      // Set Drive as connected
      sessionStorage.setItem('drive_auth_state', 'granted')
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname)
    }
    
    if (error) {
      console.error('Drive connection error:', error)
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname)
    }
  }, [])


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
      <header className="border-b">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <LucideImage className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">PickPerfect</span>
          </div>
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => router.push("/")}
              className="gap-2"
            >
              <Home className="h-4 w-4" />
              Home
            </Button>
            <Button variant="ghost" size="icon">
              <Settings className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2">
              <span className="hidden md:inline text-sm">{user.email}</span>
            </div>
            <ThemeToggle />
            <Button variant="ghost" size="icon" onClick={handleSignOut}>
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>
      
      <main className="flex-1 container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Photo Organization Dashboard</h1>
          <p className="text-muted-foreground">Organize and clean up your photo library with AI</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="connect" disabled={activeTab !== "connect" && uploadedPhotos.length > 0}>
              Connect
            </TabsTrigger>
            <TabsTrigger value="select" disabled={uploadedPhotos.length === 0 || (activeTab !== "select" && scanStarted)}>
              Select Photos ({uploadedPhotos.length})
            </TabsTrigger>
            <TabsTrigger value="scan" disabled={!scanStarted || (activeTab !== "scan" && scanComplete)}>
              Scan Photos
            </TabsTrigger>
            <TabsTrigger value="results" disabled={!scanComplete}>
              Review & Clean
            </TabsTrigger>
          </TabsList>

          <TabsContent value="connect" className="space-y-4">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Upload Photos Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Upload className="h-5 w-5" />
                    Upload Photos
                  </CardTitle>
                  <CardDescription>
                    Select photos from your local device to analyze
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <PhotoUpload 
                    onPhotosChange={setUploadedPhotos}
                    maxPhotos={50}
                  />
                </CardContent>
              </Card>

              {/* Google Drive Card */}
              <GoogleDriveConnect 
                onPhotosChange={(drivePhotos) => {
                  // Merge Drive photos with uploaded photos, avoiding duplicates
                  setUploadedPhotos(prev => {
                    const existingIds = new Set(prev.map(p => p.id))
                    const newPhotos = drivePhotos.filter(p => !existingIds.has(p.id))
                    return [...prev, ...newPhotos]
                  })
                }}
                maxPhotos={50}
              />
            </div>
          </TabsContent>

          <TabsContent value="select" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Selected Photos ({uploadedPhotos.length})</CardTitle>
                <CardDescription>
                  Review and manage the photos you've selected for analysis
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    {uploadedPhotos.length} photos selected for analysis. 
                    You'll be able to preview and review them after the scan is complete.
                  </p>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    Total size: {uploadedPhotos.reduce((acc, photo) => acc + parseFloat(photo.size.replace(' MB', '')), 0).toFixed(1)} MB
                  </span>
                  <Button 
                    variant="outline" 
                    onClick={() => setActiveTab("connect")}
                  >
                    Add More Photos
                  </Button>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  onClick={() => setActiveTab("scan")} 
                  disabled={uploadedPhotos.length === 0}
                  className="w-full"
                >
                  Start Analysis
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="scan" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Scan for Similar Photos</CardTitle>
                <CardDescription>
                  Our AI will analyze {uploadedPhotos.length} photos to find duplicates and similar images
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {scanStarted ? (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Scanning photos...</span>
                      <span>{scanProgress}%</span>
                    </div>
                    <Progress value={scanProgress} />
                    {scanComplete && (
                      <div className="flex items-center gap-2 text-green-600">
                        <Check className="h-5 w-5" />
                        <span>Scan complete! Found 24 similar photos in 8 groups.</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 gap-4">
                    <div className="rounded-full bg-primary/10 p-6">
                      <RefreshCw className="h-8 w-8 text-primary" />
                    </div>
                    <p className="text-center max-w-md text-muted-foreground">
                      Click the button below to start scanning your {uploadedPhotos.length} selected photos for similar images. 
                      This process may take a few minutes depending on the number of photos.
                    </p>
                  </div>
                )}
              </CardContent>
              <CardFooter>
                {!scanStarted ? (
                  <Button onClick={startScan} className="w-full">
                    Start Scan
                  </Button>
                ) : scanComplete ? (
                  <Button onClick={() => setActiveTab("results")} className="w-full">
                    View Results
                  </Button>
                ) : (
                  <Button disabled className="w-full">
                    Scanning...
                  </Button>
                )}
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="results" className="space-y-4">
            <Card>
                            <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Review & Clean Results</CardTitle>
                    <CardDescription>
                      Review each group of similar photos and choose which ones to keep
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
                {/* Progress indicator */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Group {currentGroupIndex + 1} of {totalGroups}
                  </span>
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
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Group {currentGroupIndex + 1}</h4>
                      <p className="text-sm text-muted-foreground">
                        {currentGroupPhotos.length} similar photos found
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

                  {/* Photos grid */}
                  <div className="grid gap-4 md:grid-cols-3">
                    {currentGroupPhotos.map((photo, photoIndex) => (
                      <div key={photo.id} className="relative group">
                        <div className="relative">
                          <img
                            src={photo.preview}
                            alt={photo.name}
                            className="w-full h-auto max-h-64 object-contain rounded-lg"
                          />
                          <div className="absolute top-2 right-2">
                            <input
                              type="checkbox"
                              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                              checked={selectedPhotos.has(photo.id)}
                              onChange={(e) => handlePhotoSelection(photo.id, e.target.checked)}
                            />
                          </div>
                        </div>
                        <div className="mt-2">
                          <p className="text-sm font-medium truncate">{photo.name}</p>
                          <p className="text-xs text-muted-foreground">{photo.size}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
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
                <div className="flex gap-2">
                  <span className="text-sm text-muted-foreground flex items-center">
                    {selectedPhotos.size} photos selected
                  </span>
                </div>
                {currentGroupIndex === totalGroups - 1 ? (
                  <Button>
                    Clean Up Photos
                  </Button>
                ) : (
                  <Button onClick={goToNextGroup} className="gap-2">
                    Next Group
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                )}
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
      
      <footer className="border-t py-6">
        <div className="container flex flex-col items-center justify-between gap-4 md:flex-row">
          <p className="text-sm text-muted-foreground">© 2025 PickPerfect. All rights reserved.</p>
          <div className="flex gap-4">
            <a href="#" className="text-sm text-muted-foreground hover:underline">
              Privacy Policy
            </a>
            <a href="#" className="text-sm text-muted-foreground hover:underline">
              Terms of Service
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}
