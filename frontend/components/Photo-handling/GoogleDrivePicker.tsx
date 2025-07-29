"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, CheckCircle, AlertCircle, ExternalLink, FolderOpen, Upload } from "lucide-react"
import { useEffect, useState } from "react"
import { useAuth } from "@/components/auth-provider"
import { UploadedPhoto } from "./PhotoHandler"

interface GoogleDrivePickerProps {
  onPhotosChange?: (photos: UploadedPhoto[]) => void
  maxPhotos?: number
  className?: string
  resetKey?: number // Add reset key to force component reset
}

export function GoogleDrivePicker({ 
  onPhotosChange, 
  maxPhotos = 50,
  className,
  resetKey
}: GoogleDrivePickerProps) {
  const { user } = useAuth()
  const [isConnecting, setIsConnecting] = useState(false)
  const [selectedDrivePhotos, setSelectedDrivePhotos] = useState<UploadedPhoto[]>([])
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [accessToken, setAccessToken] = useState<string | null>(null)

  // Check for existing token on component mount
  useEffect(() => {
    const token = sessionStorage.getItem('google_drive_access_token')
    if (token) {
      setAccessToken(token)
    }
  }, [])

  // Listen for popup messages
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'drive-auth-success') {
        setIsConnecting(false)
        setAccessToken(event.data.token)
        setSuccess('Successfully connected to Google Drive!')
      } else if (event.data.type === 'drive-auth-error') {
        setIsConnecting(false)
        setError(event.data.error || 'Failed to connect to Google Drive')
      } else if (event.data.type === 'drive-files-selected') {
        // Handle selected files from popup
        const selectedFiles = event.data.files
        if (selectedFiles && selectedFiles.length > 0) {
          setSelectedDrivePhotos(selectedFiles)
          setSuccess(`Selected ${selectedFiles.length} images from Google Drive`)
          
          // Notify parent component
          if (onPhotosChange) {
            onPhotosChange(selectedFiles)
          }
        }
      }
    }

    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [onPhotosChange])

  // Reset component when resetKey changes
  useEffect(() => {
    if (resetKey !== undefined) {
      handleDisconnect()
    }
  }, [resetKey])

  const initiateGoogleDriveAuth = () => {
    if (!user?.id) {
      setError("User not authenticated")
      return
    }

    setIsConnecting(true)
    setError(null)

    // Google OAuth parameters
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
    const redirectUri = `${window.location.origin}/auth/drive-callback`
    const scope = 'https://www.googleapis.com/auth/drive.readonly'
    const state = 'drive-access'

    // Construct Google OAuth URL
    const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth')
    authUrl.searchParams.set('client_id', clientId || '')
    authUrl.searchParams.set('redirect_uri', redirectUri)
    authUrl.searchParams.set('response_type', 'code')
    authUrl.searchParams.set('scope', scope)
    authUrl.searchParams.set('state', state)
    authUrl.searchParams.set('access_type', 'offline')
    authUrl.searchParams.set('prompt', 'consent')

    // Open popup for OAuth
    const popup = window.open(
      authUrl.toString(),
      'google-drive-auth',
      'width=500,height=600,scrollbars=yes,resizable=yes'
    )

    // Listen for popup close
    const checkClosed = setInterval(() => {
      if (popup?.closed) {
        clearInterval(checkClosed)
        setIsConnecting(false)
        
        // Check if we got a token
        const token = sessionStorage.getItem('google_drive_access_token')
        if (token) {
          setAccessToken(token)
        }
      }
    }, 1000)
  }

  const openDriveFilePicker = () => {
    if (!accessToken) {
      setError("Please connect to Google Drive first")
      return
    }

    // Open file picker popup
    const pickerUrl = `${window.location.origin}/drive-picker?token=${accessToken}&maxFiles=${maxPhotos}`
    const popup = window.open(
      pickerUrl,
      'google-drive-picker',
      'width=800,height=600,scrollbars=yes,resizable=yes'
    )

    // Listen for popup close
    const checkClosed = setInterval(() => {
      if (popup?.closed) {
        clearInterval(checkClosed)
      }
    }, 1000)
  }

  const handleDisconnect = () => {
    // Clean up preview URLs
    selectedDrivePhotos.forEach(photo => {
      if (photo.preview && photo.preview.startsWith('blob:')) {
        URL.revokeObjectURL(photo.preview)
      }
    })
    
    sessionStorage.removeItem('google_drive_access_token')
    setAccessToken(null)
    setSelectedDrivePhotos([])
    setError(null)
    setSuccess(null)
  }

  const handleClearSelected = () => {
    // Clean up preview URLs
    selectedDrivePhotos.forEach(photo => {
      if (photo.preview && photo.preview.startsWith('blob:')) {
        URL.revokeObjectURL(photo.preview)
      }
    })
    
    setSelectedDrivePhotos([])
    setError(null)
    setSuccess(null)
    
    // Notify parent component
    if (onPhotosChange) {
      onPhotosChange([])
    }
  }

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FolderOpen className="h-5 w-5" />
            Google Drive
          </CardTitle>
          <CardDescription>
            Connect to your Google Drive to select photos for analysis
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
          {success && (
            <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700">
              <CheckCircle className="h-4 w-4" />
              <span className="text-sm">{success}</span>
            </div>
          )}

          {/* Connection Status */}
          {!accessToken ? (
            <div className="space-y-4">
              <div className="text-center p-6 border-2 border-dashed border-muted-foreground/25 rounded-lg">
                <FolderOpen className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground mb-3">
                  Connect to Google Drive to access your photos
                </p>
                <Button 
                  onClick={initiateGoogleDriveAuth}
                  disabled={isConnecting}
                  className="gap-2"
                >
                  {isConnecting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    <>
                      <ExternalLink className="h-4 w-4" />
                      Connect Google Drive
                    </>
                  )}
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Connected Status */}
              <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-green-700">Connected to Google Drive</span>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleDisconnect}
                >
                  Disconnect
                </Button>
              </div>

              {/* File Picker */}
              <div className="space-y-4">
                <div className="text-center p-6 border-2 border-dashed border-muted-foreground/25 rounded-lg">
                  <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground mb-3">
                    Browse and select images from your Google Drive
                  </p>
                  <Button 
                    onClick={openDriveFilePicker}
                    className="gap-2"
                  >
                    <FolderOpen className="h-4 w-4" />
                    Browse Drive Files
                  </Button>
                </div>

                {/* Selected Photos Display */}
                {selectedDrivePhotos.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h4 className="font-medium">Selected Drive Photos ({selectedDrivePhotos.length})</h4>
                      <Button variant="outline" size="sm" onClick={handleClearSelected}>
                        Clear All
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                      {selectedDrivePhotos.map((photo) => (
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
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 