"use client"

import { useTheme } from "@/components/Theme-handling/theme-provider"
import { useEffect, useState } from "react"

interface BackgroundImageProps {
  className?: string
}

export function BackgroundImage({ className = "" }: BackgroundImageProps) {
  const { theme } = useTheme()
  const [currentTheme, setCurrentTheme] = useState<'light' | 'dark'>('light')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return

    // Determine the actual theme (system preference or user choice)
    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
      setCurrentTheme(systemTheme)
    } else {
      setCurrentTheme(theme as 'light' | 'dark')
    }
  }, [theme, mounted])

  // Don't render until mounted to prevent hydration mismatch
  if (!mounted) {
    return null
  }

  return (
    <div className={`fixed inset-0 -z-10 ${className}`}>
      {/* Background Image Container */}
      <div className="absolute inset-0">
        {/* The background image will be set via CSS */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('/background-image.jpg')`,
            // Apply different overlays based on theme
            ...(currentTheme === 'dark' 
              ? {
                  filter: 'brightness(0.7) contrast(1.2) saturate(1.1)',
                  opacity: 0.8
                }
              : {
                  filter: 'brightness(1.0) contrast(1.0) saturate(1.0)',
                  opacity: 0.7
                }
            )
          }}
        />
      </div>

      {/* Theme-specific overlay gradients */}
      {currentTheme === 'dark' ? (
        // Dark theme overlay - enhances the neon effect
        <>
          <div className="absolute inset-0 bg-gradient-to-br from-black/40 via-transparent to-black/30" />
          <div className="absolute inset-0 bg-gradient-to-r from-pink-500/10 via-transparent to-blue-500/10" />
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent via-black/20 to-black/40" />
        </>
      ) : (
        // Light theme overlay - lighter overlay to show the image while maintaining readability
        <>
          <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-white/30 to-white/50" />
          <div className="absolute inset-0 bg-gradient-to-r from-pink-100/20 via-transparent to-blue-100/20" />
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-white/30 via-transparent to-white/40" />
        </>
      )}

      {/* Additional decorative elements that complement the image */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-pink-500/5 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl animate-pulse" />
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-pink-500/3 to-blue-500/3 rounded-full blur-3xl" />
    </div>
  )
} 