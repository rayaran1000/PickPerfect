"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
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

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="gap-2"
      >
        <Menu className="h-4 w-4" />
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