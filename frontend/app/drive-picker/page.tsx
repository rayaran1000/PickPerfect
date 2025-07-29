"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, CheckCircle, AlertCircle, FolderOpen, Download } from "lucide-react"
import { UploadedPhoto } from "@/components/Photo-handling/PhotoHandler"

interface DriveFile {
  id: string
  name: string
  mimeType: string
  size: string
  thumbnailLink?: string
  webContentLink?: string
  previewUrl?: string
}

export default function DrivePicker() {
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [driveFiles, setDriveFiles] = useState<DriveFile[]>([])
  const [selectedFiles, setSelectedFiles] = useState<DriveFile[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [maxFiles, setMaxFiles] = useState(50)

  useEffect(() => {
    // Get token and maxFiles from URL params
    const urlParams = new URLSearchParams(window.location.search)
    const token = urlParams.get('token')
    const max = urlParams.get('maxFiles')
    
    if (token) {
      setAccessToken(token)
      if (max) {
        setMaxFiles(parseInt(max))
      }
      loadDriveFiles(token)
    } else {
      setError("No access token provided")
    }
  }, [])

  // Cleanup preview URLs on unmount
  useEffect(() => {
    return () => {
      driveFiles.forEach(file => {
        if (file.previewUrl) {
          URL.revokeObjectURL(file.previewUrl)
        }
      })
    }
  }, [driveFiles])

  const loadDriveFiles = async (token: string) => {
    setIsLoading(true)
    setError(null)

    try {
      console.log('Loading Drive files with token:', token ? 'present' : 'missing')
      
      // Call Google Drive API to list image files
      const response = await fetch(
        'https://www.googleapis.com/drive/v3/files?fields=files(id,name,mimeType,size,thumbnailLink,webContentLink)&q=mimeType contains "image/"&orderBy=modifiedTime desc&pageSize=100',
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          method: 'GET',
          cache: 'no-cache',
        }
      )

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Access token expired. Please reconnect to Google Drive.')
        }
        throw new Error('Failed to fetch files from Google Drive')
      }

      const data = await response.json()
      console.log('Drive API response:', data)
      
      // Filter for image files
      const imageFiles = data.files.filter((file: DriveFile) => 
        file.mimeType && file.mimeType.startsWith('image/')
      )
      
      console.log('Found image files:', imageFiles.length)

      // Set files with thumbnail links (no complex preview generation)
      setDriveFiles(imageFiles)
      
    } catch (err) {
      console.error('Error loading Drive files:', err)
      setError(err instanceof Error ? err.message : 'Failed to load files from Google Drive.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleFileSelection = (file: DriveFile, selected: boolean) => {
    if (selected) {
      if (selectedFiles.length >= maxFiles) {
        setError(`You can only select up to ${maxFiles} photos`)
        return
      }
      setSelectedFiles(prev => [...prev, file])
    } else {
      setSelectedFiles(prev => prev.filter(f => f.id !== file.id))
    }
    setError(null)
  }

  const handleDownloadAndSelect = async () => {
    if (selectedFiles.length === 0) {
      setError("No files selected")
      return
    }

    if (!accessToken) {
      setError("No access token available")
      return
    }

    setIsDownloading(true)
    setError(null)

    try {
      // Download files from Google Drive and create previews
      const downloadPromises = selectedFiles.map(async (file) => {
        try {
          // Get download URL for the file
          const downloadResponse = await fetch(
            `https://www.googleapis.com/drive/v3/files/${file.id}?alt=media`,
            {
              headers: {
                'Authorization': `Bearer ${accessToken}`,
              },
            }
          )

          if (!downloadResponse.ok) {
            throw new Error(`Failed to download ${file.name}`)
          }

          const blob = await downloadResponse.blob()
          
          // Validate file size (max 50MB per file)
          const maxSize = 50 * 1024 * 1024 // 50MB
          if (blob.size > maxSize) {
            throw new Error(`${file.name} is too large (${(blob.size / (1024 * 1024)).toFixed(1)}MB). Maximum size is 50MB.`)
          }
          
          // Create a File object from the blob
          const fileObj = new File([blob], file.name, { type: file.mimeType })
          
          return fileObj
        } catch (err) {
          console.error(`Error downloading ${file.name}:`, err)
          throw err
        }
      })

      const fileObjects = await Promise.all(downloadPromises)
      
      // Convert to UploadedPhoto format
      const uploadedPhotos: UploadedPhoto[] = fileObjects.map((file, index) => ({
        id: `drive-${index}`,
        file: file,
        name: file.name,
        size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
        preview: URL.createObjectURL(file),
        source: 'drive' as const,
        type: file.type,
        downloadUrl: undefined
      }))

      // Send selected files back to parent window
      window.opener.postMessage({
        type: 'drive-files-selected',
        files: uploadedPhotos
      }, '*')

      // Close the popup
      window.close()

    } catch (err) {
      console.error('Error downloading files:', err)
      setError(err instanceof Error ? err.message : 'Failed to download files from Google Drive. Please try again.')
    } finally {
      setIsDownloading(false)
    }
  }

  const handleCancel = () => {
    window.close()
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FolderOpen className="h-5 w-5" />
              Select Images from Google Drive
            </CardTitle>
            <CardDescription>
              Browse and select images from your Google Drive ({selectedFiles.length} selected)
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

            {/* File Grid */}
            {isLoading ? (
              <div className="text-center p-8">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                <p className="text-muted-foreground">Loading files from Google Drive...</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-96 overflow-y-auto">
                  {driveFiles.map((file) => {
                    const isSelected = selectedFiles.some(f => f.id === file.id)
                    return (
                      <div 
                        key={file.id}
                        className={`relative cursor-pointer rounded-lg border-2 p-2 transition-all ${
                          isSelected 
                            ? 'border-primary bg-primary/10' 
                            : 'border-muted hover:border-primary/50'
                        }`}
                        onClick={() => handleFileSelection(file, !isSelected)}
                      >
                        {/* Image Preview with Fallback */}
                        <div className="w-full h-20 rounded mb-2 overflow-hidden">
                          {file.thumbnailLink ? (
                            <img 
                              src={file.thumbnailLink}
                              alt={file.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                // Hide failed image and show fallback
                                const target = e.target as HTMLImageElement
                                target.style.display = 'none'
                                const fallback = target.parentElement?.querySelector('.thumbnail-fallback')
                                if (fallback) {
                                  fallback.classList.remove('hidden')
                                }
                              }}
                            />
                          ) : null}
                          {/* Fallback for no thumbnail or failed load */}
                          <div className={`w-full h-full bg-muted flex items-center justify-center thumbnail-fallback ${file.thumbnailLink ? 'hidden' : ''}`}>
                            <div className="text-center">
                              <FolderOpen className="h-4 w-4 text-muted-foreground mx-auto mb-1" />
                              <p className="text-xs text-muted-foreground">No Preview</p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="text-xs">
                          <p className="font-medium truncate">{file.name}</p>
                          <p className="text-muted-foreground">{file.size}</p>
                        </div>
                        {isSelected && (
                          <div className="absolute top-1 right-1">
                            <div className="w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                              <CheckCircle className="h-3 w-3 text-white" />
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button 
                variant="outline"
                onClick={handleCancel}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleDownloadAndSelect}
                disabled={isDownloading || selectedFiles.length === 0}
                className="flex-1"
              >
                {isDownloading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Downloading & Selecting...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Select {selectedFiles.length} Files
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}