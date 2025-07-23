import { Button } from "@/components/ui/button"
import { FcGoogle } from "react-icons/fc"
import { LucideImage, Sparkles, Shield, Zap, Users, Star, ArrowRight, CheckCircle, LogOut, List } from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { useAuth } from "@/components/auth-provider"
import { useRouter } from "next/navigation"
import { BackgroundImage } from "@/components/BackgroundImage"
import { FAQAccordion } from "@/components/FAQAccordion"
import { TestimonialsCarousel } from "@/components/TestimonialsCarousel"

export default function LandingPage() {
    const { signInWithGoogle, signOut, user, loading } = useAuth()
    const router = useRouter()
    
  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden min-h-screen flex items-center">
          {/* Background Image with Theme Support */}
          <BackgroundImage />
          
          <div className="container relative py-20 md:py-32 lg:py-40 w-full">
            <div className="mx-auto flex max-w-[1200px] flex-col items-center gap-12 text-center">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/90 backdrop-blur-sm border border-white/50 text-sm font-medium text-gray-900 shadow-lg">
                <Sparkles className="h-4 w-4" />
                AI-Powered Photo Organization
              </div>

              {/* Main heading */}
              <div className="space-y-6">
                <h1 className="text-5xl font-bold tracking-tight sm:text-6xl md:text-7xl lg:text-8xl">
                  <span className="bg-gradient-to-r from-gray-800 via-purple-700 to-pink-700 bg-clip-text text-transparent drop-shadow-lg">
                    Clean up your
                  </span>
                  <br />
                  <span className="text-gray-900 drop-shadow-lg">Photo Library</span>
                </h1>
                <p className="max-w-[800px] text-xl text-gray-800 md:text-2xl leading-relaxed drop-shadow-md dark:text-white">
                  Transform your cluttered photo collection into a perfectly organized gallery. 
                  Our AI detects duplicates and similar photos with incredible accuracy.
                </p>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-2xl">
                <div className="text-center p-4 rounded-xl bg-white/20 backdrop-blur-sm border border-white/30 shadow-lg dark:bg-black/20 dark:border-white/20">
                  <div className="text-3xl font-bold text-gray-900 drop-shadow-lg dark:text-white">99.9%</div>
                  <div className="text-sm text-gray-800 drop-shadow-md dark:text-white/90">Accuracy Rate</div>
                </div>
                <div className="text-center p-4 rounded-xl bg-white/20 backdrop-blur-sm border border-white/30 shadow-lg dark:bg-black/20 dark:border-white/20">
                  <div className="text-3xl font-bold text-gray-900 drop-shadow-lg dark:text-white">10x</div>
                  <div className="text-sm text-gray-800 drop-shadow-md dark:text-white/90">Faster Processing</div>
                </div>
                <div className="text-center p-4 rounded-xl bg-white/20 backdrop-blur-sm border border-white/30 shadow-lg dark:bg-black/20 dark:border-white/20">
                  <div className="text-3xl font-bold text-gray-900 drop-shadow-lg dark:text-white">50GB+</div>
                  <div className="text-sm text-gray-800 drop-shadow-md dark:text-white/90">Space Saved</div>
                </div>
              </div>

              {/* CTA Button */}
              {user ? (
                <div className="text-center space-y-4">
                <div className="flex items-center gap-2 justify-center">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <p className="text-lg font-medium text-foreground">Welcome back, {user.user_metadata.full_name}!</p>
                </div>
                <p className="text-muted-foreground">Ready to organize your photos?</p>
                <div className="flex flex-col items-center gap-4">
                  <Button size="lg" onClick={() => router.push('/dashboard')} className="gap-2 w-full max-w-xs shadow-lg">
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
                  <Button size="lg" onClick={signInWithGoogle} disabled={loading} className="gap-2 px-8 py-6 text-lg shadow-lg">
                    <FcGoogle className="h-5 w-5" />
                    Get Started with Google
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                  <p className="text-sm text-gray-700 dark:text-gray-300">Free to use • No credit card required</p>
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
        <section className="container py-20 md:py-32">
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
        <section className="container py-20 md:py-32">
          <div className="mx-auto max-w-6xl">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4">Loved by Photographers</h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                See what our users are saying about PickPerfect
              </p>
            </div>
            
            <TestimonialsCarousel 
              testimonials={[
                {
                  id: 1,
                  text: "PickPerfect saved me hours of manual work. The AI is incredibly accurate and the interface is so intuitive!",
                  author: "Sarah Chen",
                  role: "Professional Photographer"
                },
                {
                  id: 2,
                  text: "Finally, a tool that actually works! I freed up 30GB of space and my photos are perfectly organized now.",
                  author: "Mike Rodriguez",
                  role: "Travel Blogger"
                },
                {
                  id: 3,
                  text: "The AI analysis is mind-blowing. It found duplicates I didn't even know existed and the quality assessment is spot-on.",
                  author: "Emma Thompson",
                  role: "Wedding Photographer"
                },
                {
                  id: 4,
                  text: "As a content creator, I have thousands of photos. PickPerfect helped me organize everything in minutes, not hours.",
                  author: "Alex Johnson",
                  role: "Content Creator"
                },
                {
                  id: 5,
                  text: "The best photo organization tool I've ever used. The similar image detection is incredibly smart and accurate.",
                  author: "David Kim",
                  role: "Product Photographer"
                },
                {
                  id: 6,
                  text: "I was skeptical at first, but PickPerfect exceeded all my expectations. It's like having a professional photo editor.",
                  author: "Lisa Wang",
                  role: "Event Photographer"
                },
                {
                  id: 7,
                  text: "This tool is a game-changer for anyone with a large photo library. The space savings alone make it worth it!",
                  author: "James Wilson",
                  role: "Real Estate Photographer"
                }
              ]}
            />
          </div>
        </section>

        {/* FAQ Section */}
        <section className="container py-20 md:py-32">
          <div className="mx-auto max-w-5xl">
            <div className="flex items-center gap-3 mb-12">
              <List className="h-6 w-6 text-primary" />
              <h2 className="text-3xl font-bold">FAQs</h2>
            </div>

            <div className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-2xl p-8 dark:bg-black/20 dark:border-white/20">
              <FAQAccordion 
                faqs={[
                  {
                    question: "How does PickPerfect work?",
                    answer: "PickPerfect uses advanced AI technology to analyze your photos. It can detect both exact duplicates and similar images using two different modes: pixel-perfect comparison and AI-powered semantic analysis with CLIP models."
                  },
                  {
                    question: "What file formats are supported?",
                    answer: "We support all major image formats including JPG, PNG, GIF, WebP, BMP, and TIFF. Each file can be up to 50MB, and you can upload up to 50 photos per session."
                  },
                  {
                    question: "Is my data secure?",
                    answer: "Yes! Your photos are processed locally and never permanently stored on our servers. All files are automatically cleaned up after your session ends, ensuring complete privacy and security."
                  },
                  {
                    question: "What's the difference between exact duplicates and similar images?",
                    answer: "Exact duplicates are identical or nearly identical photos (99%+ similarity). Similar images are photos with similar content, composition, or subject matter detected by our AI, even if they're not pixel-perfect matches."
                  },
                  {
                    question: "How accurate is the AI analysis?",
                    answer: "Our AI achieves 99.9% accuracy in detecting duplicates and similar images. The system uses multiple quality metrics to identify the best photo in each group, ensuring you keep the highest quality version."
                  },
                  {
                    question: "Can I download the photos I want to keep?",
                    answer: "Absolutely! You can download selected photos individually or choose to download only the best quality photo from each group. All downloads are provided as ZIP files for easy organization."
                  },
                  {
                    question: "How long does the analysis take?",
                    answer: "Analysis typically takes 2-5 minutes depending on the number and size of your photos. Our AI processes images in batches and provides real-time progress updates so you always know what's happening."
                  },
                  {
                    question: "Is PickPerfect free to use?",
                    answer: "Yes! PickPerfect is completely free to use with no credit card required. We believe everyone should have access to powerful photo organization tools without any cost barriers."
                  }
                ]} 
              />
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        {!user && (
        <section className="container py-20 md:py-32">
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
