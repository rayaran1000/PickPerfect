import { enhancedStorageService, StorageFile } from './storage'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

export interface UploadedFile {
  path: string
  filename: string
  size: number
  size_mb: number
  created_time: string
  modified_time: string
}

export interface UploadResponse {
  success: boolean
  session_id: string
  uploaded_files: StorageFile[]
  count: number
  message: string
}

export interface AnalysisStatus {
  status: 'processing' | 'completed' | 'error' | 'not_found'
  message?: string
  error?: string
  result?: any
}

export interface AnalysisResult {
  success: boolean
  session_id: string
  result: {
    groups: Array<{
      id: string
      type: 'duplicate' | 'similar' | 'unique'
      images: Array<{
        path: string
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
        quality: any
        file_size: number
      }
      count: number
      similarity_score: number
    }>
    statistics: {
      total_images: number
      total_groups: number
      duplicate_count: number
      similar_count: number
      unique_count: number
      estimated_space_saved_bytes: number
      estimated_space_saved_mb: number
    }
  }
}

class ApiService {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`
    
    const defaultOptions: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    }

    const response = await fetch(url, { ...defaultOptions, ...options })
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
    }
    
    return response.json()
  }

  // Health check
  async healthCheck(): Promise<{ status: string; message: string; timestamp: number }> {
    return this.request('/health')
  }

  // Upload images to Supabase Storage
  async uploadImages(files: File[], userId: string): Promise<UploadResponse> {
    try {
      // Generate session ID
      const sessionId = crypto.randomUUID()
      
      // Upload files to Supabase Storage
      const result = await enhancedStorageService.uploadMultipleFiles(files, userId, sessionId)
      
      if (!result.success) {
        throw new Error(`Upload failed: ${result.errors?.join(', ')}`)
      }
      
      return {
        success: true,
        session_id: sessionId,
        uploaded_files: result.files || [],
        count: result.files?.length || 0,
        message: `Successfully uploaded ${result.files?.length || 0} images`
      }
    } catch (error) {
      console.error('Upload error:', error)
      throw error
    }
  }

  // Start analysis with session ID
  async startAnalysis(sessionId: string, userId: string, analysisType: 'pixel' | 'ai' = 'pixel'): Promise<{
    success: boolean
    session_id: string
    message: string
    total_images: number
    status: string
  }> {
    return this.request('/analyze', {
      method: 'POST',
      body: JSON.stringify({ 
        session_id: sessionId,
        user_id: userId,
        analysis_type: analysisType
      }),
    })
  }

  // Get analysis status
  async getAnalysisStatus(sessionId: string): Promise<AnalysisStatus> {
    return this.request(`/analysis-status/${sessionId}`)
  }

  // Get analysis results
  async getAnalysisResults(sessionId: string): Promise<AnalysisResult> {
    return this.request(`/results/${sessionId}`)
  }

      // Get image URL directly from Supabase Storage
    getImageUrl(sessionId: string, filePath: string, userId?: string): string {
      console.log('getImageUrl called with:', { sessionId, filePath, userId })
      
      // If filePath already contains the full Supabase Storage path, use it directly
      if (filePath.includes('/') && userId) {
        const url = enhancedStorageService.getFileUrl(filePath)
        console.log('Using full Supabase path, generated URL:', url)
        return url
      }
      
      // Otherwise, construct the Supabase Storage path: userId/sessionId_filename
      if (userId) {
        // Extract filename from the path
        let filename = filePath
        if (filePath.includes('/')) {
          filename = filePath.split('/').pop() || filePath
        }
        
        // Remove any session prefixes to get the original filename
        if (filename.startsWith(`${sessionId}_`)) {
          filename = filename.substring(`${sessionId}_`.length)
        }
        
        const fullPath = `${userId}/${sessionId}_${filename}`
        const url = enhancedStorageService.getFileUrl(fullPath)
        console.log('Constructed Supabase path, generated URL:', url)
        return url
      }
      
      // Fallback to backend URL (should not happen in normal flow)
      const filename = filePath.includes('/') ? filePath.split('/').pop() || filePath : filePath
      const url = `${API_BASE_URL}/image/${sessionId}/${filename}`
      console.log('Using fallback backend URL:', url)
      return url
    }

  // Cleanup session from Supabase Storage
  async cleanupSession(sessionId: string, userId?: string): Promise<{
    success: boolean
    message: string
  }> {
    if (!userId) {
      return {
        success: false,
        message: 'User ID required for cleanup'
      }
    }
    
    try {
      // Use Supabase Storage service for cleanup
      const success = await enhancedStorageService.deleteSessionFiles(userId, sessionId)
      return {
        success,
        message: success ? 'Session cleaned up successfully' : 'Failed to cleanup session'
      }
    } catch (error) {
      console.error('Cleanup error:', error)
      return {
        success: false,
        message: 'Cleanup failed'
      }
    }
  }

  // Cleanup user files from Supabase Storage
  async cleanupUserFiles(userId: string): Promise<{
    success: boolean
    message: string
  }> {
    try {
      const success = await enhancedStorageService.deleteUserFiles(userId)
      return {
        success,
        message: success ? 'User files cleaned up successfully' : 'Failed to cleanup user files'
      }
    } catch (error) {
      console.error('User cleanup error:', error)
      return {
        success: false,
        message: 'User cleanup failed'
      }
    }
  }

  // Get system statistics
  async getStatistics(): Promise<{
    total_sessions: number
    completed_analyses: number
    total_images_analyzed: number
    active_sessions: number
  }> {
    return this.request('/statistics')
  }

  // Download selected photos from Supabase Storage
  async downloadSelectedPhotos(sessionId: string, photoPaths: string[], userId?: string): Promise<Blob> {
    try {
      // Download all selected files
      const downloadPromises = photoPaths.map(async (filePath) => {
        const blob = await enhancedStorageService.downloadFile(filePath)
        if (!blob) {
          throw new Error(`Failed to download file: ${filePath}`)
        }
        return blob
      })

      const blobs = await Promise.all(downloadPromises)

      // Create a ZIP file in memory
      const JSZip = (await import('jszip')).default
      const zip = new JSZip()

      // Add each file to the ZIP
      photoPaths.forEach((filePath, index) => {
        const fileName = filePath.split('/').pop() || `file_${index}.jpg`
        zip.file(fileName, blobs[index])
      })

      // Generate ZIP blob
      const zipBlob = await zip.generateAsync({ type: 'blob' })
      return zipBlob
    } catch (error) {
      console.error('Download error:', error)
      throw new Error('Failed to download photos')
    }
  }

  // Poll for analysis completion
  async pollAnalysisCompletion(
    sessionId: string,
    onProgress?: (status: AnalysisStatus) => void,
    maxAttempts: number = 60, // 5 minutes with 5-second intervals
    interval: number = 5000 // 5 seconds
  ): Promise<AnalysisResult> {
    let attempts = 0

    while (attempts < maxAttempts) {
      try {
        const status = await this.getAnalysisStatus(sessionId)
        
        if (onProgress) {
          onProgress(status)
        }

        if (status.status === 'completed') {
          return await this.getAnalysisResults(sessionId)
        } else if (status.status === 'error') {
          throw new Error(status.error || 'Analysis failed')
        } else if (status.status === 'not_found') {
          // Analysis not found yet, wait a bit longer before retrying
          console.log(`Analysis not found for session ${sessionId}, waiting...`)
          await new Promise(resolve => setTimeout(resolve, interval * 2))
          attempts++
          continue
        }

        // Wait before next attempt
        await new Promise(resolve => setTimeout(resolve, interval))
        attempts++
      } catch (error) {
        console.error('Error polling analysis status:', error)
        
        // If it's a 404 error, the analysis might not be ready yet
        if (error instanceof Error && error.message.includes('404')) {
          console.log(`Analysis not ready for session ${sessionId}, waiting...`)
          await new Promise(resolve => setTimeout(resolve, interval * 2))
          attempts++
          continue
        }
        
        attempts++
        
        if (attempts >= maxAttempts) {
          throw error
        }
      }
    }

    throw new Error('Analysis timed out')
  }
}

// Export singleton instance
export const apiService = new ApiService() 