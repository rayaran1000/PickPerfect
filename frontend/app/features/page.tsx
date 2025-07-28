'use client';

import { Button } from "@/components/ui/button"
import { FcGoogle } from "react-icons/fc"
import { Sparkles, Shield, Zap, Users, Star, ArrowRight, CheckCircle, LogOut, Brain, Camera, Download, Search, Filter, Clock, HardDrive, Lock, Eye, Smartphone, Globe, BarChart3, Settings, Palette, RefreshCw, FileImage, Layers, Target, Award, TrendingUp, Sparkles as SparklesIcon, Trash2 } from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { useAuth } from "@/components/auth-provider"
import { useRouter } from "next/navigation"

export default function FeaturesPage() {
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
          
          <div className="container relative py-20 md:py-32">
            <div className="mx-auto flex max-w-[1200px] flex-col items-center gap-12 text-center">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-sm font-medium text-primary">
                <SparklesIcon className="h-4 w-4" />
                Powerful Features
              </div>

              {/* Main heading */}
              <div className="space-y-6">
                <h1 className="text-5xl font-bold tracking-tight sm:text-6xl md:text-7xl">
                  <span className="bg-gradient-to-r from-primary via-purple-600 to-pink-600 bg-clip-text text-transparent">
                    Everything You Need
                  </span>
                  <br />
                  <span className="text-foreground">to Organize Photos</span>
                </h1>
                <p className="max-w-[800px] text-xl text-muted-foreground md:text-2xl leading-relaxed">
                  Discover the comprehensive suite of features that make PickPerfect the ultimate photo organization tool.
                </p>
              </div>

              {/* CTA Button */}
              {user ? (
                <div className="text-center space-y-4">
                  <div className="flex items-center gap-2 justify-center">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <p className="text-lg font-medium">Welcome back, {user.email}!</p>
                  </div>
                  <p className="text-muted-foreground">Ready to explore these features?</p>
                  <Button size="lg" onClick={() => router.push('/dashboard')} className="gap-2">
                    <ArrowRight className="h-4 w-4" />
                    Go to Dashboard
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <Button size="lg" onClick={signInWithGoogle} disabled={loading} className="gap-2 px-8 py-6 text-lg">
                    <FcGoogle className="h-5 w-5" />
                    Try Features Now
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                  <p className="text-sm text-muted-foreground">Free to use • No credit card required</p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Core Features Section */}
        <section className="container py-20 md:py-32">
          <div className="mx-auto max-w-6xl">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4">Core Features</h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                The essential tools that make photo organization effortless and intelligent
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {/* AI Analysis */}
              <div className="group relative p-8 rounded-2xl border bg-card hover:bg-card/80 transition-all duration-300 hover:shadow-lg">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-purple-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <Brain className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">Advanced AI Analysis</h3>
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    Two powerful analysis modes: exact duplicate detection using pixel-perfect comparison and AI-powered similar image recognition using CLIP models for semantic understanding.
                  </p>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Pixel-perfect duplicate detection (96%+ similarity)</li>
                    <li>• CLIP-based semantic similarity analysis</li>
                    <li>• 99.9% accuracy rate</li>
                    <li>• Real-time processing feedback</li>
                  </ul>
                </div>
              </div>

              {/* Quality Assessment */}
              <div className="group relative p-8 rounded-2xl border bg-card hover:bg-card/80 transition-all duration-300 hover:shadow-lg">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-pink-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative">
                  <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <Target className="h-6 w-6 text-purple-500" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">Smart Quality Assessment</h3>
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    Automatic evaluation of image quality using multiple metrics to identify the best photos in each group with detailed scoring.
                  </p>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Resolution analysis (30% weight)</li>
                    <li>• Sharpness detection (25% weight)</li>
                    <li>• Brightness & contrast optimization (35% weight)</li>
                    <li>• Noise assessment (10% weight)</li>
                  </ul>
                </div>
              </div>

              {/* Batch Processing */}
              <div className="group relative p-8 rounded-2xl border bg-card hover:bg-card/80 transition-all duration-300 hover:shadow-lg">
                <div className="absolute inset-0 bg-gradient-to-r from-pink-500/5 to-primary/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative">
                  <div className="w-12 h-12 rounded-xl bg-pink-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <Layers className="h-6 w-6 text-pink-500" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">Batch Processing</h3>
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    Process up to 50 photos simultaneously with real-time progress tracking and background processing for optimal performance.
                  </p>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Up to 50 photos per session</li>
                    <li>• Real-time progress updates</li>
                    <li>• Background processing</li>
                    <li>• Session-based organization</li>
                  </ul>
                </div>
              </div>

              {/* File Management */}
              <div className="group relative p-8 rounded-2xl border bg-card hover:bg-card/80 transition-all duration-300 hover:shadow-lg">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-cyan-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative">
                  <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <FileImage className="h-6 w-6 text-blue-500" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">Smart File Management</h3>
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    Comprehensive file handling with automatic cleanup, session management, and secure storage with privacy-first approach.
                  </p>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Multiple format support (JPG, PNG, GIF, WebP, BMP, TIFF)</li>
                    <li>• Automatic session cleanup</li>
                    <li>• Secure file handling</li>
                    <li>• Privacy-first design</li>
                  </ul>
                </div>
              </div>

              {/* Download Options */}
              <div className="group relative p-8 rounded-2xl border bg-card hover:bg-card/80 transition-all duration-300 hover:shadow-lg">
                <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-emerald-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative">
                  <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <Download className="h-6 w-6 text-green-500" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">Flexible Download Options</h3>
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    Download selected photos or automatically get the best quality images from each group with organized ZIP packaging.
                  </p>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Selective photo download</li>
                    <li>• Best photos only option</li>
                    <li>• ZIP file packaging</li>
                    <li>• Organized file structure</li>
                  </ul>
                </div>
              </div>

              {/* Space Optimization */}
              <div className="group relative p-8 rounded-2xl border bg-card hover:bg-card/80 transition-all duration-300 hover:shadow-lg">
                <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 to-red-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative">
                  <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <HardDrive className="h-6 w-6 text-orange-500" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">Space Optimization</h3>
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    Calculate potential storage savings and optimize your photo library for maximum efficiency with detailed analytics.
                  </p>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Storage savings calculator</li>
                    <li>• File size optimization</li>
                    <li>• Space usage analytics</li>
                    <li>• Duplicate percentage tracking</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Advanced Features Section */}
        <section className="container py-20 md:py-32 border-t">
          <div className="mx-auto max-w-6xl">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4">Advanced Features</h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Professional-grade tools for power users and photographers
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-2">
              {/* Left Column */}
              <div className="space-y-8">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Search className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Intelligent Grouping</h3>
                    <p className="text-muted-foreground">
                      Advanced clustering algorithms using FAISS and DBSCAN group similar photos together, making it easy to review and select the best images from each set with similarity scores.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center flex-shrink-0">
                    <Filter className="h-5 w-5 text-purple-500" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Smart Filtering</h3>
                    <p className="text-muted-foreground">
                      Filter results by similarity score, file size, quality rating, and more to focus on the most important duplicates and similar images.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-pink-500/10 flex items-center justify-center flex-shrink-0">
                    <BarChart3 className="h-5 w-5 text-pink-500" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Detailed Analytics</h3>
                    <p className="text-muted-foreground">
                      Comprehensive statistics and insights about your photo library, including duplicate percentages, space savings, and quality distribution across your photos.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                    <Clock className="h-5 w-5 text-blue-500" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Progress Tracking</h3>
                    <p className="text-muted-foreground">
                      Real-time progress updates with detailed status information, so you always know what's happening with your analysis including current processing stage and estimated completion time.
                    </p>
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-8">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center flex-shrink-0">
                    <Lock className="h-5 w-5 text-green-500" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Complete Privacy Protection</h3>
                    <p className="text-muted-foreground">
                      Your photos are automatically deleted when you leave the dashboard. No data is permanently stored, ensuring complete privacy and security with automatic cleanup mechanisms.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center flex-shrink-0">
                    <Trash2 className="h-5 w-5 text-red-500" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Automatic Cleanup</h3>
                    <p className="text-muted-foreground">
                      All uploaded photos and analysis data are automatically cleaned up when you leave the dashboard, protecting your privacy and ensuring no data persists beyond your active session.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center flex-shrink-0">
                    <Smartphone className="h-5 w-5 text-orange-500" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Responsive Design</h3>
                    <p className="text-muted-foreground">
                      Fully responsive interface that works perfectly on desktop, tablet, and mobile devices for photo management anywhere with optimized touch interactions and mobile-friendly controls.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-cyan-500/10 flex items-center justify-center flex-shrink-0">
                    <Palette className="h-5 w-5 text-cyan-500" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Dark Mode Support</h3>
                    <p className="text-muted-foreground">
                      Beautiful dark and light themes with automatic system preference detection for comfortable photo editing in any lighting condition with consistent visual hierarchy.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Technical Specifications */}
        <section className="container py-20 md:py-32 border-t">
          <div className="mx-auto max-w-6xl">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4">Technical Specifications</h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Built with cutting-edge technology for maximum performance and reliability
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-3">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                  <Camera className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold">Supported Formats</h3>
                <p className="text-muted-foreground">
                  JPG, PNG, GIF, WebP, BMP, TIFF
                </p>
                <p className="text-sm text-muted-foreground">
                  Maximum file size: 50MB per file, 100MB total per session
                </p>
              </div>

              <div className="text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-purple-500/10 flex items-center justify-center mx-auto">
                  <Zap className="h-8 w-8 text-purple-500" />
                </div>
                <h3 className="text-xl font-bold">Performance</h3>
                <p className="text-muted-foreground">
                  Up to 50 photos per session
                </p>
                <p className="text-sm text-muted-foreground">
                  Processing time: 2-5 minutes depending on image count and size
                </p>
              </div>

              <div className="text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-pink-500/10 flex items-center justify-center mx-auto">
                  <Shield className="h-8 w-8 text-pink-500" />
                </div>
                <h3 className="text-xl font-bold">Privacy & Security</h3>
                <p className="text-muted-foreground">
                  Auto-cleanup on exit
                </p>
                <p className="text-sm text-muted-foreground">
                  No permanent data storage, local processing only
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Comparison Section */}
        <section className="container py-20 md:py-32 border-t">
          <div className="mx-auto max-w-4xl">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4">Why PickPerfect Stands Out</h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                See how we compare to other photo organization tools
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-2">
              <div className="p-6 rounded-2xl border bg-card">
                <div className="flex items-center gap-2 mb-4">
                  <Award className="h-5 w-5 text-green-500" />
                  <h3 className="text-lg font-bold">PickPerfect</h3>
                </div>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    AI-powered similarity detection (CLIP models)
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Quality assessment algorithms
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Real-time progress tracking
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Free to use
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Modern, intuitive interface
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Automatic privacy cleanup
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Two analysis modes (pixel & AI)
                  </li>
                </ul>
              </div>

              <div className="p-6 rounded-2xl border bg-muted/50">
                <div className="flex items-center gap-2 mb-4">
                  <Eye className="h-5 w-5 text-muted-foreground" />
                  <h3 className="text-lg font-bold text-muted-foreground">Other Tools</h3>
                </div>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <div className="h-4 w-4 rounded-full bg-muted-foreground/20" />
                    Basic duplicate detection only
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-4 w-4 rounded-full bg-muted-foreground/20" />
                    No quality assessment
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-4 w-4 rounded-full bg-muted-foreground/20" />
                    Limited progress feedback
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-4 w-4 rounded-full bg-muted-foreground/20" />
                    Often requires payment
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-4 w-4 rounded-full bg-muted-foreground/20" />
                    Outdated interfaces
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-4 w-4 rounded-full bg-muted-foreground/20" />
                    Data privacy concerns
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-4 w-4 rounded-full bg-muted-foreground/20" />
                    Single analysis mode
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="container py-20 md:py-32 border-t">
          <div className="mx-auto max-w-4xl text-center">
            <div className="space-y-6">
              <h2 className="text-4xl font-bold mb-4">Ready to Experience These Features?</h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Join thousands of users who have transformed their photo libraries with PickPerfect
              </p>

              {user ? (
                <div className="space-y-4">
                  <Button size="lg" onClick={() => router.push('/dashboard')} className="gap-2 px-8 py-6 text-lg">
                    <ArrowRight className="h-4 w-4" />
                    Go to Dashboard
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <Button size="lg" onClick={signInWithGoogle} disabled={loading} className="gap-2 px-8 py-6 text-lg">
                    <FcGoogle className="h-5 w-5" />
                    Start Using Features
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                  <p className="text-sm text-muted-foreground">Free to use • No credit card required</p>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
