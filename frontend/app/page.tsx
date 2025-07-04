"use client"

import { Button } from "@/components/ui/button"
import { useAuth } from "@/components/auth-provider"
import { FcGoogle } from "react-icons/fc"
import { LucideImage } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"

export default function Home() {
  const { signInWithGoogle, signOut, user, loading } = useAuth()

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <LucideImage className="h-6 w-6" />
            <span className="text-xl font-bold">Pick Perfect</span>
          </div>
          <ThemeToggle />
        </div>
      </header>
      <main className="flex-1">
        <section className="container py-12 md:py-24 lg:py-32">
          <div className="mx-auto flex max-w-[980px] flex-col items-center gap-8 text-center">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              Clean up your Photos library
            </h1>
            <p className="max-w-[700px] text-lg text-muted-foreground md:text-xl">
              Automatically detect and remove duplicate or similar photos to free up space and keep your library
              organized.
            </p>
            {user ? (
              <div className="text-center">
                <p className="text-lg">Welcome, {user.email}!</p>
                <p className="text-muted-foreground">You're ready to start organizing your photos.</p>
                <Button size="lg" onClick={signOut} className="mt-4">
                  Sign Out
                </Button>
              </div>
            ) : (
              <Button size="lg" onClick={signInWithGoogle} disabled={loading} className="gap-2">
                <FcGoogle className="h-5 w-5" />
                Sign in with Google
              </Button>
            )}
          </div>
        </section>
        <section className="container py-12 md:py-24 lg:py-32 border-t">
          <div className="grid gap-12 md:grid-cols-3">
            <div className="flex flex-col items-center text-center gap-2">
              <div className="rounded-full bg-primary/10 p-4">
                <LucideImage className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold">Smart Detection</h3>
              <p className="text-muted-foreground">Our AI identifies similar photos, even with slight differences</p>
            </div>
            <div className="flex flex-col items-center text-center gap-2">
              <div className="rounded-full bg-primary/10 p-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-6 w-6 text-primary"
                >
                  <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
              </div>
              <h3 className="text-xl font-bold">Manual or Automatic</h3>
              <p className="text-muted-foreground">
                Choose between manual review or let our AI decide which photos to keep
              </p>
            </div>
            <div className="flex flex-col items-center text-center gap-2">
              <div className="rounded-full bg-primary/10 p-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-6 w-6 text-primary"
                >
                  <path d="M12 2v8"></path>
                  <path d="m4.93 10.93 1.41 1.41"></path>
                  <path d="M2 18h2"></path>
                  <path d="M20 18h2"></path>
                  <path d="m19.07 10.93-1.41 1.41"></path>
                  <path d="M22 22H2"></path>
                  <path d="m16 6-4 4-4-4"></path>
                  <path d="M16 18a4 4 0 0 0-8 0"></path>
                </svg>
              </div>
              <h3 className="text-xl font-bold">Safe Deletion</h3>
              <p className="text-muted-foreground">Review before deleting and restore any photos you want to keep</p>
            </div>
          </div>
        </section>
      </main>
      <footer className="border-t py-6">
        <div className="container flex flex-col items-center justify-between gap-4 md:flex-row">
          <p className="text-sm text-muted-foreground">© 2025 PickPerfect. All rights reserved.</p>
          <div className="flex gap-4 md:ml-auto md:mr-8">
            <a href="#" className="text-sm text-muted-foreground hover:underline">
              Privacy Policy
            </a>
            <a href="#" className="text-sm text-muted-foreground hover:underline">
              Terms of Service
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}
