"use client"

import { LucideImage, Sparkles } from "lucide-react"
import { ThemeToggle } from "@/components/Theme-handling/theme-toggle"
import { NavigationMenu } from "@/components/navigation-menu"

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="relative">
            <LucideImage className="h-6 w-6 text-primary" />
            <Sparkles className="h-3 w-3 text-yellow-500 absolute -top-1 -right-1" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
            PickPerfect
          </span>
        </div>
        <div className="flex items-center gap-4">
          <NavigationMenu />
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
} 