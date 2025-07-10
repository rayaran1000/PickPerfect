import { useState, useRef } from 'react'

export interface UploadedPhoto {
  id: string
  file: File
  preview: string
  name: string
  size: string
}

export interface PhotoHandlerReturn {
  uploadedPhotos: UploadedPhoto[]
  fileInputRef: React.RefObject<HTMLInputElement | null>
  handleFileSelect: (event: React.ChangeEvent<HTMLInputElement>) => void
  removePhoto: (id: string) => void
  clearAllPhotos: () => void
  getTotalSize: () => string
  getPhotoCount: () => number
  triggerFileSelect: () => void
}

export const usePhotoHandler = (): PhotoHandlerReturn => {
  const [uploadedPhotos, setUploadedPhotos] = useState<UploadedPhoto[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files) return

    const newPhotos: UploadedPhoto[] = Array.from(files)
      .filter(file => file.type.startsWith('image/'))
      .map(file => ({
        id: Math.random().toString(36).substr(2, 9),
        file,
        preview: URL.createObjectURL(file),
        name: file.name,
        size: formatFileSize(file.size)
      }))

    setUploadedPhotos(prev => [...prev, ...newPhotos])
    
    // Reset the input value to allow selecting the same file again
    if (event.target) {
      event.target.value = ''
    }
  }

  const removePhoto = (id: string) => {
    setUploadedPhotos(prev => {
      const photo = prev.find(p => p.id === id)
      if (photo) {
        URL.revokeObjectURL(photo.preview)
      }
      return prev.filter(p => p.id !== id)
    })
  }

  const clearAllPhotos = () => {
    setUploadedPhotos(prev => {
      prev.forEach(photo => {
        URL.revokeObjectURL(photo.preview)
      })
      return []
    })
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getTotalSize = (): string => {
    const totalBytes = uploadedPhotos.reduce((sum, photo) => sum + photo.file.size, 0)
    return formatFileSize(totalBytes)
  }

  const getPhotoCount = (): number => {
    return uploadedPhotos.length
  }

  const triggerFileSelect = () => {
    fileInputRef.current?.click()
  }

  return {
    uploadedPhotos,
    fileInputRef,
    handleFileSelect,
    removePhoto,
    clearAllPhotos,
    getTotalSize,
    getPhotoCount,
    triggerFileSelect
  }
} 