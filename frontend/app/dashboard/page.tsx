"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
//import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LucideImage, Settings, LogOut, RefreshCw, Check } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
//import { GooglePhotosConnect } from "@/components/google-photos-connect"
//import { FolderSelector } from "@/components/folder-selector"
//import { ScanResults } from "@/components/scan-results"

export default function Dashboard() {
  //const { user, signOut, googlePhotosConnected } = useAuth()
  const router = useRouter()
  const [scanStarted, setScanStarted] = useState(false)
  const [scanComplete, setScanComplete] = useState(false)
  const [scanProgress, setScanProgress] = useState(0)
  const [folderSelected, setFolderSelected] = useState(false)
  const [activeTab, setActiveTab] = useState("connect")

//   useEffect(() => {
//     if (!user) {
//       router.push("/")
//     }
//   }, [user, router])

//   useEffect(() => {
//     if (googlePhotosConnected && !folderSelected) {
//       setActiveTab("select")
//     } else if (folderSelected && !scanStarted) {
//       setActiveTab("scan")
//     } else if (scanComplete) {
//       setActiveTab("results")
//     }
//   }, [googlePhotosConnected, folderSelected, scanStarted, scanComplete])

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

  //if (!user) {
  //  return null
  //}

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <LucideImage className="h-6 w-6" />
            <span className="text-xl font-bold">PhotoCleaner</span>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon">
              <Settings className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2">
              <Avatar>
                <AvatarImage src={user.image} alt={user.name} />
                <AvatarFallback>U</AvatarFallback>
              </Avatar>
              <span className="hidden md:inline">User</span>
            </div>
            <Button variant="ghost" size="icon" onClick={signOut}>
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>
      <main className="flex-1 container py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="connect" disabled={activeTab !== "connect" && googlePhotosConnected}>
              Connect
            </TabsTrigger>
            <TabsTrigger value="select" disabled={!googlePhotosConnected || (activeTab !== "select" && folderSelected)}>
              Select Folder
            </TabsTrigger>
            <TabsTrigger value="scan" disabled={!folderSelected || (activeTab !== "scan" && scanComplete)}>
              Scan Photos
            </TabsTrigger>
            <TabsTrigger value="results" disabled={!scanComplete}>
              Review & Clean
            </TabsTrigger>
          </TabsList>

          <TabsContent value="connect" className="space-y-4">
            <GooglePhotosConnect />
          </TabsContent>

          <TabsContent value="select" className="space-y-4">
            <FolderSelector onFolderSelect={handleFolderSelect} />
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
            <ScanResults />
          </TabsContent>
        </Tabs>
      </main>
      <footer className="border-t py-6">
        <div className="container flex flex-col items-center justify-between gap-4 md:flex-row">
          <p className="text-sm text-muted-foreground">© 2025 PhotoCleaner. All rights reserved.</p>
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
