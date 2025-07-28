import { supabase } from './supabase'
import { v4 as uuidv4 } from 'uuid'

export interface StorageFile {
  id: string
  name: string
  path: string
  size: number
  url: string
  created_at: string
  user_id: string
  session_id: string
  mime_type?: string
  thumbnail_url?: string
}

export interface UploadResult {
  success: boolean
  file?: StorageFile
  error?: string
}

export interface UploadProgress {
  file: string
  progress: number
  status: 'uploading' | 'completed' | 'error'
}

class StorageService {
  private bucketName = 'pickperfect-photos'
  private maxFileSize = 50 * 1024 * 1024 // 50MB
  private allowedMimeTypes = [
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/gif',
    'image/webp',
    'image/bmp',
    'image/tiff'
  ]



  /**
   * Upload a single file with progress tracking
   */
  async uploadFile(
    file: File, 
    userId: string, 
    sessionId: string,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<UploadResult> {
    if (!supabase) {
      return { success: false, error: 'Supabase not configured' }
    }

    try {
      // Validate file
      const validation = this.validateFile(file)
      if (!validation.valid) {
        return { success: false, error: validation.error }
      }

      // Generate unique filename with session prefix for easy cleanup
      const fileExtension = file.name.split('.').pop()?.toLowerCase()
      const uniqueFileName = `${sessionId}_${uuidv4()}.${fileExtension}`
      const filePath = `${userId}/${uniqueFileName}`

      // Start upload
      if (onProgress) {
        onProgress({
          file: file.name,
          progress: 0,
          status: 'uploading'
        })
      }

      // Upload file to Supabase Storage with proper metadata
      const { data, error } = await supabase.storage
        .from(this.bucketName)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
          metadata: {
            owner_id: userId,
            session_id: sessionId,
            original_name: file.name
          }
        })

      if (error) {
        // Check if this is a false positive RLS error (uploads are actually working)
        if (error.message.includes('row-level security policy') && 
            error.message.includes('new row violates')) {
          console.warn('False positive RLS error detected - checking if upload succeeded:', error.message)
          
          // Try to verify if the file was actually uploaded
          try {
            const { data: checkData } = await supabase.storage
              .from(this.bucketName)
              .list(`${userId}`)
            
            const uploadedFile = checkData?.find(f => f.name === uniqueFileName)
            if (uploadedFile) {
                        console.log('✅ File was actually uploaded successfully despite RLS error - this is a known Supabase issue')
          // Continue with the process since upload succeeded
            } else {
              console.error('RLS error and file not found - upload failed')
              if (onProgress) {
                onProgress({
                  file: file.name,
                  progress: 0,
                  status: 'error'
                })
              }
              return { success: false, error: 'Upload failed due to RLS policy' }
            }
          } catch (checkError) {
            console.error('Error checking if file was uploaded:', checkError)
            if (onProgress) {
              onProgress({
                file: file.name,
                progress: 0,
                status: 'error'
              })
            }
            return { success: false, error: 'Upload failed' }
          }
        } else {
          console.error('Upload error:', error)
          if (onProgress) {
            onProgress({
              file: file.name,
              progress: 0,
              status: 'error'
            })
          }
          return { success: false, error: error.message }
        }
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from(this.bucketName)
        .getPublicUrl(filePath)

      // Create thumbnail URL (same as original for now)
      const thumbnailUrl = urlData.publicUrl

      const storageFile: StorageFile = {
        id: data?.path || filePath,
        name: file.name,
        path: filePath,
        size: file.size,
        url: urlData.publicUrl,
        thumbnail_url: thumbnailUrl,
        mime_type: file.type,
        created_at: new Date().toISOString(),
        user_id: userId,
        session_id: sessionId
      }

      if (onProgress) {
        onProgress({
          file: file.name,
          progress: 100,
          status: 'completed'
        })
      }

      return { success: true, file: storageFile }
    } catch (error) {
      console.error('Storage upload error:', error)
      if (onProgress) {
        onProgress({
          file: file.name,
          progress: 0,
          status: 'error'
        })
      }
      return { success: false, error: error instanceof Error ? error.message : 'Unknown upload error' }
    }
  }

  /**
   * Upload multiple files with progress tracking
   */
  async uploadMultipleFiles(
    files: File[], 
    userId: string, 
    sessionId: string,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<{ success: boolean; files?: StorageFile[]; errors?: string[] }> {
    const results: UploadResult[] = []
    const errors: string[] = []

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const result = await this.uploadFile(file, userId, sessionId, onProgress)
      results.push(result)
      
      if (!result.success) {
        errors.push(`${file.name}: ${result.error}`)
      }
    }

    const successfulUploads = results.filter(result => result.success)
    const failedUploads = results.filter(result => !result.success)

    return {
      success: failedUploads.length === 0,
      files: successfulUploads.map(result => result.file!),
      errors: failedUploads.map(result => result.error!)
    }
  }

  /**
   * Get all files for a session with enhanced metadata
   */
  async getSessionFiles(userId: string, sessionId: string): Promise<StorageFile[]> {
    if (!supabase) {
      throw new Error('Supabase not configured')
    }

    try {
      const { data, error } = await supabase.storage
        .from(this.bucketName)
        .list(`${userId}`)

      if (error) {
        console.error('Error listing files:', error)
        return []
      }

      if (!data) return []

      // Filter files that belong to this session (start with sessionId_)
      const sessionFiles = data.filter(file => file.name.startsWith(`${sessionId}_`))

      // Get file details for each file
      const files: StorageFile[] = []
      for (const file of sessionFiles) {
        const { data: urlData } = supabase.storage
          .from(this.bucketName)
          .getPublicUrl(`${userId}/${file.name}`)

        // Extract original filename from session-prefixed name
        const originalName = file.name.replace(`${sessionId}_`, '')

        files.push({
          id: file.id || file.name,
          name: originalName,
          path: `${userId}/${file.name}`,
          size: file.metadata?.size || 0,
          url: urlData.publicUrl,
          thumbnail_url: urlData.publicUrl, // Same as original for now
          mime_type: file.metadata?.mimetype || 'image/jpeg',
          created_at: file.created_at || new Date().toISOString(),
          user_id: userId,
          session_id: sessionId
        })
      }

      return files
    } catch (error) {
      console.error('Error getting session files:', error)
      return []
    }
  }

  /**
   * Delete a single file
   */
  async deleteFile(filePath: string): Promise<boolean> {
    if (!supabase) {
      return false
    }

    try {
      const { error } = await supabase.storage
        .from(this.bucketName)
        .remove([filePath])

      if (error) {
        console.error('Error deleting file:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Storage delete error:', error)
      return false
    }
  }

  /**
   * Delete all files for a session
   */
  async deleteSessionFiles(userId: string, sessionId: string): Promise<boolean> {
    if (!supabase) {
      return false
    }

    try {
      // List all files for the user
      const { data, error } = await supabase.storage
        .from(this.bucketName)
        .list(`${userId}`)

      if (error) {
        console.error('Error listing files for deletion:', error)
        return false
      }

      if (!data || data.length === 0) {
        return true // No files to delete
      }

      // Filter files that belong to this session (start with sessionId_)
      const sessionFiles = data.filter(file => file.name.startsWith(`${sessionId}_`))
      
      if (sessionFiles.length === 0) {
        return true // No session files to delete
      }

      // Delete all session files
      const filePaths = sessionFiles.map(file => `${userId}/${file.name}`)
      const { error: deleteError } = await supabase.storage
        .from(this.bucketName)
        .remove(filePaths)

      if (deleteError) {
        console.error('Error deleting session files:', deleteError)
        return false
      }

      return true
    } catch (error) {
      console.error('Storage delete session error:', error)
      return false
    }
  }

  /**
   * Delete all files for a user (cleanup on logout)
   */
  async deleteUserFiles(userId: string): Promise<boolean> {
    if (!supabase) {
      return false
    }

    try {
      // List all user directories
      const { data, error } = await supabase.storage
        .from(this.bucketName)
        .list(userId)

      if (error) {
        console.error('Error listing user files:', error)
        return false
      }

      if (!data || data.length === 0) {
        return true // No files to delete
      }

      // Delete all user files
      const filePaths = data.map(item => `${userId}/${item.name}`)
      const { error: deleteError } = await supabase.storage
        .from(this.bucketName)
        .remove(filePaths)

      if (deleteError) {
        console.error('Error deleting user files:', deleteError)
        return false
      }

      return true
    } catch (error) {
      console.error('Storage delete user error:', error)
      return false
    }
  }

  /**
   * Get file URL for analysis
   */
  getFileUrl(filePath: string): string {
    if (!supabase) {
      throw new Error('Supabase not configured')
    }

    console.log('StorageService.getFileUrl called with filePath:', filePath)
    const { data } = supabase.storage
      .from(this.bucketName)
      .getPublicUrl(filePath)

    console.log('Generated public URL:', data.publicUrl)
    return data.publicUrl
  }

  /**
   * Download file as blob
   */
  async downloadFile(filePath: string): Promise<Blob | null> {
    if (!supabase) {
      return null
    }

    try {
      const { data, error } = await supabase.storage
        .from(this.bucketName)
        .download(filePath)

      if (error) {
        console.error('Error downloading file:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('Storage download error:', error)
      return null
    }
  }

  /**
   * Validate file before upload
   */
  private validateFile(file: File): { valid: boolean; error?: string } {
    // Check file type
    if (!this.allowedMimeTypes.includes(file.type.toLowerCase())) {
      return { 
        valid: false, 
        error: `Invalid file type: ${file.type}. Allowed types: ${this.allowedMimeTypes.join(', ')}` 
      }
    }

    // Check file size
    if (file.size > this.maxFileSize) {
      return { 
        valid: false, 
        error: `File size too large: ${(file.size / 1024 / 1024).toFixed(2)}MB. Maximum: ${this.maxFileSize / 1024 / 1024}MB` 
      }
    }

    // Check file name
    if (!file.name || file.name.trim() === '') {
      return { valid: false, error: 'File name is required' }
    }

    return { valid: true }
  }


}

// Export singleton instance
export const enhancedStorageService = new StorageService() 