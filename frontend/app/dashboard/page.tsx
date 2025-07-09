"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LucideImage, Settings, LogOut, RefreshCw, Check, ArrowLeft, Home } from "lucide-react"
//import { GooglePhotosConnect } from "@/components/google-photos-connect"
//import { FolderSelector } from "@/components/folder-selector"
//import { ScanResults } from "@/components/scan-results"

export default function UserDashboard() {
  const { user, signOut } = useAuth()
  const router = useRouter()
  const [scanStarted, setScanStarted] = useState(false)
  const [scanComplete, setScanComplete] = useState(false)
  const [scanProgress, setScanProgress] = useState(0)
  const [folderSelected, setFolderSelected] = useState(false)
  const [activeTab, setActiveTab] = useState("connect")

  // Debug: Log user data to see the structure
  useEffect(() => {
    if (user) {
      console.log('User object:', user)
      console.log('User metadata:', user.user_metadata)
      console.log('User app metadata:', user.app_metadata)
    }
  }, [user])

  // Get user info from Google OAuth using the correct structure
  const userEmail = user?.email
  const userName = user?.user_metadata?.full_name || 
                  user?.user_metadata?.name || 
                  userEmail?.split('@')[0]
  
  // Use the correct avatar URL from your metadata
  const userAvatar = user?.user_metadata?.avatar_url || 
                    user?.user_metadata?.picture

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!user) {
      router.push("/")
    }
  }, [user, router])

  // Auto-advance tabs based on state
  useEffect(() => {
    if (folderSelected && !scanStarted) {
      setActiveTab("scan")
    } else if (scanComplete) {
      setActiveTab("results")
    }
  }, [folderSelected, scanStarted, scanComplete])

  const handleFolderSelect = () => {
    setFolderSelected(true)
  }

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
            <TabsTrigger value="connect" disabled={activeTab !== "connect" && folderSelected}>
              Connect
            </TabsTrigger>
            <TabsTrigger value="select" disabled={!folderSelected || (activeTab !== "select" && scanStarted)}>
              Select Folder
            </TabsTrigger>
            <TabsTrigger value="scan" disabled={!scanStarted || (activeTab !== "scan" && scanComplete)}>
              Scan Photos
            </TabsTrigger>
            <TabsTrigger value="results" disabled={!scanComplete}>
              Review & Clean
            </TabsTrigger>
          </TabsList>

          <TabsContent value="connect" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Connect Your Photos</CardTitle>
                <CardDescription>
                  Choose how you want to connect your photos for analysis
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <Card className="p-6 border-dashed border-2 hover:border-primary transition-colors cursor-pointer">
                    <div className="text-center space-y-4">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                        <LucideImage className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold">Upload Photos</h3>
                        <p className="text-sm text-muted-foreground">Upload photos directly from your device</p>
                      </div>
                    </div>
                  </Card>
                  <Card className="p-6 border-dashed border-2 hover:border-primary transition-colors cursor-pointer">
                    <div className="text-center space-y-4">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                        <LucideImage className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold">Google Drive</h3>
                        <p className="text-sm text-muted-foreground">Connect your Google Drive account</p>
                      </div>
                    </div>
                  </Card>
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={handleFolderSelect} className="w-full">
                  Continue with Upload
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="select" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Select Photos to Analyze</CardTitle>
                <CardDescription>
                  Choose which photos you want to scan for duplicates
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                  <LucideImage className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">
                    Click to select photos or drag and drop them here
                  </p>
                  <Button variant="outline">
                    Select Photos
                  </Button>
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={() => setActiveTab("scan")} className="w-full">
                  Start Analysis
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="scan" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Scan for Similar Photos</CardTitle>
                <CardDescription>Our AI will analyze your photos to find duplicates and similar images</CardDescription>
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
                      Click the button below to start scanning your selected folder for similar photos. This process may
                      take a few minutes depending on the number of photos.
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
                <CardTitle>Review & Clean Results</CardTitle>
                <CardDescription>
                  Review the similar photos found and choose which ones to keep or remove
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center py-8">
                  <Check className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Analysis Complete!</h3>
                  <p className="text-muted-foreground">
                    Found 24 similar photos organized in 8 groups. 
                    Review each group and select which photos to keep.
                  </p>
                </div>
                <div className="grid gap-4">
                  {[...Array(3)].map((_, i) => (
                    <Card key={i} className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">Group {i + 1}</h4>
                          <p className="text-sm text-muted-foreground">3 similar photos found</p>
                        </div>
                        <Button variant="outline" size="sm">
                          Review Group
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full">
                  Clean Up Photos
                </Button>
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
