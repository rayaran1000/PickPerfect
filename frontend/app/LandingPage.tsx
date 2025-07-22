import { Button } from "@/components/ui/button"
import { FcGoogle } from "react-icons/fc"
import { LucideImage, Sparkles, Shield, Zap, Users, Star, ArrowRight, CheckCircle, LogOut } from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { useAuth } from "@/components/auth-provider"
import { useRouter } from "next/navigation"

export default function LandingPage() {
    const { signInWithGoogle, signOut, user, loading } = useAuth()
    const router = useRouter()
    
  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-purple-500/5" />
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
          
          <div className="container relative py-20 md:py-32 lg:py-40">
            <div className="mx-auto flex max-w-[1200px] flex-col items-center gap-12 text-center">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-sm font-medium text-primary">
                <Sparkles className="h-4 w-4" />
                AI-Powered Photo Organization
              </div>

              {/* Main heading */}
              <div className="space-y-6">
                <h1 className="text-5xl font-bold tracking-tight sm:text-6xl md:text-7xl lg:text-8xl">
                  <span className="bg-gradient-to-r from-primary via-purple-600 to-pink-600 bg-clip-text text-transparent">
                    Clean up your
                  </span>
                  <br />
                  <span className="text-foreground">Photo Library</span>
                </h1>
                <p className="max-w-[800px] text-xl text-muted-foreground md:text-2xl leading-relaxed">
                  Transform your cluttered photo collection into a perfectly organized gallery. 
                  Our AI detects duplicates and similar photos with incredible accuracy.
                </p>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-2xl">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">99.9%</div>
                  <div className="text-sm text-muted-foreground">Accuracy Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">10x</div>
                  <div className="text-sm text-muted-foreground">Faster Processing</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">50GB+</div>
                  <div className="text-sm text-muted-foreground">Space Saved</div>
                </div>
              </div>

              {/* CTA Button */}
              {user ? (
                <div className="text-center space-y-4">
                <div className="flex items-center gap-2 justify-center">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <p className="text-lg font-medium">Welcome back, {user.email}!</p>
                </div>
                <p className="text-muted-foreground">Ready to organize your photos?</p>
                <div className="flex flex-col items-center gap-4">
                  <Button size="lg" onClick={() => router.push('/dashboard')} className="gap-2 w-full max-w-xs">
                    <ArrowRight className="h-4 w-4" />
                    Go to Dashboard
                  </Button>
                  <Button size="lg" onClick={signOut} variant="outline" className="gap-2 w-full max-w-xs">
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </Button>
                </div>
              </div>
              ) : (
                <div className="space-y-4">
                  <Button size="lg" onClick={signInWithGoogle} disabled={loading} className="gap-2 px-8 py-6 text-lg">
                    <FcGoogle className="h-5 w-5" />
                    Get Started with Google
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                  <p className="text-sm text-muted-foreground">Free to use • No credit card required</p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="container py-20 md:py-32">
          <div className="mx-auto max-w-6xl">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4">Why Choose PickPerfect?</h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Advanced AI technology combined with intuitive design makes photo organization effortless
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {/* Feature 1 */}
              <div className="group relative p-8 rounded-2xl border bg-card hover:bg-card/80 transition-all duration-300 hover:shadow-lg">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-purple-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <Zap className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">Lightning Fast AI</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Our advanced AI analyzes thousands of photos in minutes, identifying duplicates with incredible precision.
                  </p>
                </div>
              </div>

              {/* Feature 2 */}
              <div className="group relative p-8 rounded-2xl border bg-card hover:bg-card/80 transition-all duration-300 hover:shadow-lg">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-pink-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative">
                  <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <Shield className="h-6 w-6 text-purple-500" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">Safe & Secure</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Your photos are processed locally and never stored on our servers. Complete privacy guaranteed.
                  </p>
                </div>
              </div>

              {/* Feature 3 */}
              <div className="group relative p-8 rounded-2xl border bg-card hover:bg-card/80 transition-all duration-300 hover:shadow-lg">
                <div className="absolute inset-0 bg-gradient-to-r from-pink-500/5 to-primary/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative">
                  <div className="w-12 h-12 rounded-xl bg-pink-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <Users className="h-6 w-6 text-pink-500" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">Smart Organization</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Automatically organize photos by date, location, and content. Find what you need instantly.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How it Works Section */}
        <section className="container py-20 md:py-32 border-t">
          <div className="mx-auto max-w-6xl">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4">How It Works</h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Three simple steps to transform your photo library
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-3">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto text-2xl font-bold text-primary">
                  1
                </div>
                <h3 className="text-xl font-bold">Connect Your Photos</h3>
                <p className="text-muted-foreground">
                  Securely connect your Google Photos account or upload photos directly
                </p>
              </div>
              <div className="text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto text-2xl font-bold text-primary">
                  2
                </div>
                <h3 className="text-xl font-bold">AI Analysis</h3>
                <p className="text-muted-foreground">
                  Our AI scans your photos and identifies duplicates and similar images
                </p>
              </div>
              <div className="text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto text-2xl font-bold text-primary">
                  3
                </div>
                <h3 className="text-xl font-bold">Clean & Organize</h3>
                <p className="text-muted-foreground">
                  Review and remove duplicates, then enjoy your perfectly organized library
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="container py-20 md:py-32 border-t">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="text-4xl font-bold mb-4">Loved by Photographers</h2>
            <p className="text-xl text-muted-foreground mb-12">
              See what our users are saying about PickPerfect
            </p>
            
            <div className="grid gap-8 md:grid-cols-2">
              <div className="p-6 rounded-2xl border bg-card">
                <div className="flex items-center gap-1 mb-4 justify-center">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-muted-foreground mb-4">
                  "PickPerfect saved me hours of manual work. The AI is incredibly accurate and the interface is so intuitive!"
                </p>
                <div className="font-medium">- Sarah Chen, Professional Photographer</div>
              </div>
              
              <div className="p-6 rounded-2xl border bg-card">
                <div className="flex items-center gap-1 mb-4 justify-center">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-muted-foreground mb-4">
                  "Finally, a tool that actually works! I freed up 30GB of space and my photos are perfectly organized now."
                </p>
                <div className="font-medium">- Mike Rodriguez, Travel Blogger</div>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        {!user && (
        <section className="container py-20 md:py-32 border-t">
          <div className="mx-auto max-w-4xl text-center">
                <div className="text-center space-y-4">
                <h2 className="text-4xl font-bold mb-4">Ready to Transform Your Photo Library?</h2>
                 <p className="text-xl text-muted-foreground">
                 Join thousands of users who have already organized their photos with PickPerfect
                 </p>

                <div className="space-y-4">
                  <Button size="lg" onClick={signInWithGoogle} disabled={loading} className="gap-2 px-8 py-6 text-lg">
                    <FcGoogle className="h-5 w-5" />
                    Start Organizing Now
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
                </div>
              </div>
            </section>
          )}
      </main>

      <Footer />
    </div>
  )
}
