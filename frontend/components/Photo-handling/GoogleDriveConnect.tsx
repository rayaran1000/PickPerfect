"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/components/auth-provider"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { UploadedPhoto } from "./PhotoHandler"
import { Loader2, Check, AlertCircle, FolderOpen, Shield, Info } from "lucide-react"

interface GoogleDriveConnectProps {
  onPhotosChange?: (photos: UploadedPhoto[]) => void
  maxPhotos?: number
}

export function GoogleDriveConnect({ onPhotosChange, maxPhotos }: GoogleDriveConnectProps) {
  const { user, session } = useAuth()
  const [isConnecting, setIsConnecting] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const [drivePhotos, setDrivePhotos] = useState<UploadedPhoto[]>([])
  const [error, setError] = useState<string | null>(null)
  const [showConsentModal, setShowConsentModal] = useState(false)

  // Check if user is authenticated with Google
  const isGoogleUser = user?.app_metadata?.provider === 'google'

  useEffect(() => {
    if (onPhotosChange && drivePhotos.length > 0) {
      onPhotosChange(drivePhotos)
    }
  }, [drivePhotos, onPhotosChange])

  // Check if we already have Drive access
  useEffect(() => {
    if (session?.provider_token && isGoogleUser) {
      checkDriveAccess()
    }
  }, [session, isGoogleUser])

  const checkDriveAccess = async () => {
    if (!session?.provider_token) return

    try {
      // Test if we have Drive access by making a simple API call
      const response = await fetch('https://www.googleapis.com/drive/v3/about?fields=user', {
        headers: {
          'Authorization': `Bearer ${session.provider_token}`,
        },
      })

      if (response.ok) {
        setIsConnected(true)
        loadDrivePhotos()
      } else if (response.status === 403) {
        // No Drive access - user needs to grant permissions
        setIsConnected(false)
      }
    } catch (error) {
      console.error('Error checking Drive access:', error)
      setIsConnected(false)
    }
  }

  const requestDriveAccess = async () => {
    if (!isGoogleUser) {
      setError("Please sign in with Google to access Drive")
      return
    }

    setShowConsentModal(true)
  }

  const confirmDriveAccess = async () => {
    setIsConnecting(true)
    setError(null)
    setShowConsentModal(false)

    try {
      // Use Supabase OAuth with additional Drive scopes
      const { error } = await supabase?.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
            scope: 'https://www.googleapis.com/auth/drive.readonly https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile'
          },
        }
      })

      if (error) throw error

      // The user will be redirected to Google OAuth with Drive consent
      // When they return, checkDriveAccess will detect the new permissions
      
    } catch (err) {
      console.error('Error requesting Drive access:', err)
      setError('Failed to connect to Google Drive. Please try again.')
      setIsConnecting(false)
    }
  }

  const loadDrivePhotos = async () => {
    if (!isConnected || !session?.provider_token) return

    try {
      // Use the provider token from Supabase session to access Google Drive API
      const response = await fetch(
        `https://www.googleapis.com/drive/v3/files?q=mimeType contains 'image/'&fields=files(id,name,mimeType,size,thumbnailLink,webContentLink)&pageSize=50`,
        {
          headers: {
            'Authorization': `Bearer ${session.provider_token}`,
          },
        }
      )

      if (!response.ok) {
        throw new Error('Failed to fetch files from Google Drive')
      }

      const data = await response.json()
      const files = data.files || []

      // Convert Google Drive files to UploadedPhoto format
      const photos: UploadedPhoto[] = await Promise.all(
        files.slice(0, maxPhotos || 50).map(async (file: any) => {
          // Create a mock file object for compatibility
          const mockFile = new File([''], file.name, { 
            type: file.mimeType || 'image/jpeg' 
          })

          return {
            id: `drive-${file.id}`,
            file: mockFile,
            preview: file.thumbnailLink || `https://via.placeholder.com/300x200?text=${encodeURIComponent(file.name)}`,
            name: file.name,
            size: formatFileSize(file.size || '0'),
            driveFileId: file.id, // Store the actual Drive file ID
            driveDownloadUrl: file.webContentLink
          }
        })
      )

      setDrivePhotos(photos)
    } catch (err) {
      console.error('Error loading Drive photos:', err)
      setError('Failed to load photos from Drive. You may need to grant Drive access.')
    }
  }

  const formatFileSize = (bytes: string): string => {
    const size = parseInt(bytes)
    if (size === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(size) / Math.log(k))
    return parseFloat((size / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  if (!isGoogleUser) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Connect Google Drive
          </CardTitle>
          <CardDescription>
            Sign in with Google to access your Drive photos
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-6 border-2 border-dashed border-muted-foreground/25 rounded-lg text-center">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <svg className="h-6 w-6 text-primary" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            </div>
            <h3 className="font-medium mb-2">Sign in with Google First</h3>
            <p className="text-sm text-muted-foreground mb-4">
              You need to sign in with Google to access your Drive photos
            </p>
            <Button disabled>
              Sign in with Google Required
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Connect Google Drive
          </CardTitle>
          <CardDescription>
            Access and select photos from your Google Drive
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {isConnected ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700">
                <Check className="h-4 w-4" />
                <span className="text-sm">Connected to Google Drive</span>
              </div>
              
              {drivePhotos.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <FolderOpen className="h-4 w-4" />
                    <h4 className="font-medium">Available Photos ({drivePhotos.length})</h4>
                  </div>
                  <div className="grid gap-2 md:grid-cols-2 max-h-60 overflow-y-auto">
                    {drivePhotos.map((photo) => (
                      <div key={photo.id} className="flex items-center gap-2 p-2 border rounded hover:bg-muted/50">
                        <img 
                          src={photo.preview} 
                          alt={photo.name}
                          className="w-8 h-8 object-cover rounded"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{photo.name}</p>
                          <p className="text-xs text-muted-foreground">{photo.size}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="p-6 border-2 border-dashed border-muted-foreground/25 rounded-lg text-center">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <svg className="h-6 w-6 text-primary" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
              </div>
              <h3 className="font-medium mb-2">Grant Drive Access</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Allow PickPerfect to access your Google Drive photos
              </p>
              <Button 
                onClick={requestDriveAccess}
                disabled={isConnecting}
                className="w-full"
              >
                {isConnecting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  'Grant Drive Access'
                )}
              </Button>
            </div>
          )}
          
          <div className="text-xs text-muted-foreground text-center">
            We only access photos you explicitly select. Your data remains private.
          </div>
        </CardContent>
      </Card>

      {/* Consent Modal */}
      {showConsentModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md mx-4">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="h-6 w-6 text-blue-500" />
              <h3 className="text-lg font-semibold">Google Drive Access</h3>
            </div>
            
            <div className="space-y-3 mb-6">
              <div className="flex items-start gap-2">
                <Info className="h-4 w-4 text-blue-500 mt-0.5" />
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  PickPerfect needs access to your Google Drive to help you organize your photos.
                </p>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-700 rounded p-3">
                <h4 className="font-medium text-sm mb-2">What we'll access:</h4>
                <ul className="text-xs text-gray-600 dark:text-gray-300 space-y-1">
                  <li>• Read-only access to your Google Drive</li>
                  <li>• Only image files (photos, screenshots, etc.)</li>
                  <li>• No ability to modify or delete your files</li>
                  <li>• No access to other file types</li>
                </ul>
              </div>
            </div>
            
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                onClick={() => setShowConsentModal(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button 
                onClick={confirmDriveAccess}
                className="flex-1"
              >
                Grant Access
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
} 