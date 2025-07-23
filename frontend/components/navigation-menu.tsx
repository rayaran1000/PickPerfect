"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ChevronDown, Home, Star, Users, FileText, Settings, LogOut, Menu, MessageSquare } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { FcGoogle } from "react-icons/fc"

export function NavigationMenu() {
  const [isOpen, setIsOpen] = useState(false)
  const { user, signOut, signInWithGoogle } = useAuth()
  const router = useRouter()

  const handleSignOut = async () => {
    await signOut()
    router.push("/")
  }

  const handleGoogleSignIn = async () => {
    await signInWithGoogle()
    setIsOpen(false)
  }

  const publicPages = [
    { name: "Home", href: "/", icon: Home },
    { name: "Features", href: "/features", icon: Star },
    { name: "About Us", href: "/about", icon: Users },
    { name: "Contact Us", href: "/contact", icon: MessageSquare },
    { name: "Terms & Policy", href: "/terms-policy", icon: FileText },
  ]

  const authenticatedPages = [
    ...publicPages,
    { name: "Dashboard", href: "/dashboard", icon: Settings },
  ]

  const pages = user ? authenticatedPages : publicPages

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!user) return "U"
    
    const name = user.user_metadata?.full_name || 
                user.user_metadata?.name || 
                user.email?.split('@')[0] || 
                "U"
    
    return name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
  }

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="gap-2"
      >
        {user ? (
          // Show user initials when logged in
          <Avatar className="h-8 w-8">
            <AvatarFallback className="text-xs font-medium">
              {getUserInitials()}
            </AvatarFallback>
          </Avatar>
        ) : (
          // Show menu icon when user is not logged in
          <Menu className="h-4 w-4" />
        )}
        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </Button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown Menu */}
          <div className="absolute right-0 top-full mt-2 w-56 rounded-md border bg-background shadow-lg z-50">
            <div className="p-2 space-y-1">
              {/* User info section when logged in */}
              {user && (
                <div className="px-3 py-2 border-b">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-xs font-medium">
                        {getUserInitials()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {user.user_metadata?.full_name || user.user_metadata?.name || "User"}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {user.email}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation pages */}
              {pages.map((page) => {
                const Icon = page.icon
                return (
                  <Link
                    key={page.name}
                    href={page.href}
                    onClick={() => setIsOpen(false)}
                  >
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start gap-3 h-10"
                    >
                      <Icon className="h-4 w-4" />
                      {page.name}
                    </Button>
                  </Link>
                )
              })}
              
              {/* Divider and auth buttons */}
              <div className="border-t my-2" />
              
              {user ? (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSignOut}
                  className="w-full justify-start gap-3 h-10 text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleGoogleSignIn}
                  className="w-full justify-start gap-3 h-10"
                >
                  <FcGoogle className="h-4 w-4" />
                  Sign in with Google
                </Button>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
} 