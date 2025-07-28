'use client';

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Sparkles, Mail, MessageSquare, Send, ArrowRight, CheckCircle, LogOut, Home, Mail as MailIcon, MessageCircle, Star, Heart, Users, Zap, Code, Github, Linkedin, Globe, Award, Clock, Target, Lightbulb, Shield, TrendingUp, Brain, Twitter } from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { useAuth } from "@/components/auth-provider"
import { useRouter } from "next/navigation"
import { useState } from "react"

export default function AboutPage() {
    const { signOut, user } = useAuth()
    const router = useRouter()
    const [emailCopied, setEmailCopied] = useState(false)
    
    const copyEmailToClipboard = async () => {
        try {
            await navigator.clipboard.writeText('aranya.ray1998@gmail.com')
            setEmailCopied(true)
            setTimeout(() => setEmailCopied(false), 2000)
        } catch (err) {
            console.error('Failed to copy email:', err)
        }
    }
    
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
                <Code className="h-4 w-4" />
                About the Developer
              </div>

              {/* Main heading */}
              <div className="space-y-6">
                <h1 className="text-5xl font-bold tracking-tight sm:text-6xl md:text-7xl">
                  <span className="bg-gradient-to-r from-primary via-purple-600 to-pink-600 bg-clip-text text-transparent">
                    About PickPerfect
                  </span>
                  <br />
                  <span className="text-foreground">& The Developer</span>
                </h1>
                <p className="max-w-[800px] text-xl text-muted-foreground md:text-2xl leading-relaxed">
                  Discover the story behind PickPerfect and meet the developer who brought this AI-powered photo organization tool to life.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Developer Section */}
        <section className="container py-20 md:py-32">
          <div className="mx-auto max-w-6xl">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4">Meet the Developer</h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                The passionate mind behind PickPerfect's innovative AI technology
              </p>
            </div>

            <div className="max-w-4xl mx-auto">
              {/* Developer Info */}
              <div className="space-y-8">
                <div className="space-y-4">
                  <h3 className="text-3xl font-bold">Aranya Ray</h3>
                  <p className="text-lg text-muted-foreground">
                    AI Engineer • India
                  </p>
                  <p className="text-muted-foreground leading-relaxed">
                    I am a passionate AI engineer with a strong interest in building innovative solutions using AI and machine learning. I love exploring the intersection of technology and creativity, which led me to create PickPerfect - a tool that combines computer vision, machine learning, and user experience design to solve real-world problems.
                  </p>
                </div>

                <div className="space-y-4">
                  <h4 className="text-xl font-semibold">Skills & Expertise</h4>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">Full Stack Development</span>
                    <span className="px-3 py-1 bg-purple-500/10 text-purple-500 rounded-full text-sm">Gen AI</span>
                    <span className="px-3 py-1 bg-yellow-500/10 text-yellow-500 rounded-full text-sm">Machine Learning</span>
                    <span className="px-3 py-1 bg-pink-500/10 text-pink-500 rounded-full text-sm">React/Next.js</span>
                    <span className="px-3 py-1 bg-blue-500/10 text-blue-500 rounded-full text-sm">Python</span>
                    <span className="px-3 py-1 bg-green-500/10 text-green-500 rounded-full text-sm">Computer Vision</span>
                    <span className="px-3 py-1 bg-orange-500/10 text-orange-500 rounded-full text-sm">UI/UX Design</span>
                    <span className="px-3 py-1 bg-cyan-500/10 text-cyan-500 rounded-full text-sm">Flask</span>
                    <span className="px-3 py-1 bg-indigo-500/10 text-indigo-500 rounded-full text-sm">PyTorch</span>
                    <span className="px-3 py-1 bg-red-500/10 text-red-500 rounded-full text-sm">OpenCV</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-xl font-semibold">Connect With Me</h4>
                  <div className="flex gap-4">
                    <Button variant="outline" size="sm" className="gap-2" onClick={() => window.open('https://github.com/rayaran1000', '_blank')}>
                      <Github className="h-4 w-4" />
                      GitHub
                    </Button>
                    <Button variant="outline" size="sm" className="gap-2" onClick={() => window.open('https://www.linkedin.com/in/aranya-ray-46a635156/', '_blank')}>
                      <Linkedin className="h-4 w-4" />
                      LinkedIn
                    </Button>
                    <Button variant="outline" size="sm" className="gap-2" onClick={() => window.open('https://x.com/AranyaRay1998', '_blank')}>
                      <Twitter className="h-4 w-4" />
                      Twitter
                    </Button>
                    <Button variant="outline" size="sm" className="gap-2" onClick={() => window.open('https://aranya-ray-portfolio.vercel.app/', '_blank')}>
                      <Globe className="h-4 w-4" />
                      Portfolio
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Project Story Section */}
        <section className="container py-20 md:py-32 border-t">
          <div className="mx-auto max-w-6xl">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4">The PickPerfect Story</h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                How this innovative photo organization tool came to life
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              <div className="group relative p-6 rounded-2xl border bg-card hover:bg-card/80 transition-all duration-300 hover:shadow-lg">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-purple-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Lightbulb className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-bold mb-2">The Inspiration</h3>
                  <p className="text-muted-foreground text-sm">
                    Like many people, I struggled with organizing thousands of photos across multiple devices. Existing solutions were either too expensive, lacked privacy, or weren't accurate enough. I wanted to create something that was both powerful and accessible to everyone, with a focus on privacy and user experience.
                  </p>
                </div>
              </div>

              <div className="group relative p-6 rounded-2xl border bg-card hover:bg-card/80 transition-all duration-300 hover:shadow-lg">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-pink-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative">
                  <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Target className="h-6 w-6 text-purple-500" />
                  </div>
                  <h3 className="text-lg font-bold mb-2">The Vision</h3>
                  <p className="text-muted-foreground text-sm">
                    I envisioned PickPerfect as a tool that would make photo organization effortless and intelligent. The goal was to create an AI-powered solution that could understand photo content, detect duplicates with high accuracy using both pixel-perfect comparison and CLIP models, and provide a beautiful, intuitive interface that anyone could use.
                  </p>
                </div>
              </div>

              <div className="group relative p-6 rounded-2xl border bg-card hover:bg-card/80 transition-all duration-300 hover:shadow-lg">
                <div className="absolute inset-0 bg-gradient-to-r from-pink-500/5 to-primary/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative">
                  <div className="w-12 h-12 rounded-xl bg-pink-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Clock className="h-6 w-6 text-pink-500" />
                  </div>
                  <h3 className="text-lg font-bold mb-2">The Journey</h3>
                  <p className="text-muted-foreground text-sm">
                    The journey involved learning advanced computer vision techniques, experimenting with different AI models including CLIP for semantic understanding, and building a full-stack application with Flask backend and Next.js frontend. From initial prototypes to the current version, each iteration brought new insights and improvements based on user feedback and technological advancements.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Technology Stack Section */}
        <section className="container py-20 md:py-32 border-t">
          <div className="mx-auto max-w-6xl">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4">Technology Stack</h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                The cutting-edge technologies powering PickPerfect
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
              <Card className="text-center p-6">
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center mx-auto mb-4">
                  <Code className="h-6 w-6 text-blue-500" />
                </div>
                <h3 className="font-bold mb-2">Frontend</h3>
                <p className="text-sm text-muted-foreground">
                  Next.js 15, React 19, TypeScript, Tailwind CSS, Supabase Auth
                </p>
              </Card>

              <Card className="text-center p-6">
                <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center mx-auto mb-4">
                  <Zap className="h-6 w-6 text-green-500" />
                </div>
                <h3 className="font-bold mb-2">Backend</h3>
                <p className="text-sm text-muted-foreground">
                  Flask, Python, PyTorch, OpenCV, scikit-learn, FAISS
                </p>
              </Card>

              <Card className="text-center p-6">
                <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center mx-auto mb-4">
                  <Brain className="h-6 w-6 text-purple-500" />
                </div>
                <h3 className="font-bold mb-2">AI/ML</h3>
                <p className="text-sm text-muted-foreground">
                  CLIP Models, FAISS, scikit-learn, ResNet-50, DBSCAN Clustering
                </p>
              </Card>

              <Card className="text-center p-6">
                <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-6 w-6 text-orange-500" />
                </div>
                <h3 className="font-bold mb-2">Infrastructure</h3>
                <p className="text-sm text-muted-foreground">
                  Supabase, Vercel, Local Processing, Auto-cleanup
                </p>
              </Card>
            </div>
          </div>
        </section>

        {/* Development Philosophy Section */}
        <section className="container py-20 md:py-32 border-t">
          <div className="mx-auto max-w-4xl">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4">Development Philosophy</h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                The principles that guide every decision in PickPerfect's development
              </p>
            </div>

            <div className="space-y-8">
              <div className="flex items-start gap-6">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">User-Centric Design</h3>
                  <p className="text-muted-foreground">
                    Every feature in PickPerfect is designed with the user in mind. I believe in creating intuitive interfaces that require minimal learning curve. The application offers two analysis modes (pixel-perfect and AI-powered) to cater to different user needs. User feedback is invaluable - it drives every major update and helps ensure the tool solves real problems people face.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-6">
                <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center flex-shrink-0">
                  <Shield className="h-6 w-6 text-purple-500" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">Privacy First</h3>
                  <p className="text-muted-foreground">
                    Privacy is fundamental to PickPerfect. Your photos are processed locally and never stored on our servers. All files are automatically cleaned up when you leave the dashboard. In an age where data privacy is crucial, I believe users should have complete control over their personal photos and data.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-6">
                <div className="w-12 h-12 rounded-xl bg-pink-500/10 flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="h-6 w-6 text-pink-500" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">Continuous Innovation</h3>
                  <p className="text-muted-foreground">
                    The AI landscape is constantly evolving, and I'm committed to staying at the forefront. I regularly experiment with new models, techniques, and technologies to ensure PickPerfect remains cutting-edge while maintaining reliability and performance. The integration of CLIP models for semantic understanding is just one example of this commitment to innovation.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Future Vision Section */}
        <section className="container py-20 md:py-32 border-t">
          <div className="mx-auto max-w-6xl">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4">Future Vision</h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Where PickPerfect is headed and what's next on the roadmap
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              <Card className="p-6">
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center mb-4">
                  <Globe className="h-6 w-6 text-blue-500" />
                </div>
                <h3 className="text-lg font-bold mb-2">Cloud Integration</h3>
                <p className="text-muted-foreground text-sm">
                  Expanding cloud storage integrations to include Google Drive, Dropbox, OneDrive, and other popular platforms for seamless photo management across devices and automatic backup capabilities.
                </p>
              </Card>

              <Card className="p-6">
                <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center mb-4">
                  <Award className="h-6 w-6 text-green-500" />
                </div>
                <h3 className="text-lg font-bold mb-2">Advanced AI</h3>
                <p className="text-muted-foreground text-sm">
                  Implementing more advanced AI models for better duplicate detection, content-based organization, and intelligent photo tagging. Exploring newer CLIP variants and custom fine-tuned models for even more accurate similarity detection.
                </p>
              </Card>

              <Card className="p-6">
                <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-purple-500" />
                </div>
                <h3 className="text-lg font-bold mb-2">Community Features</h3>
                <p className="text-muted-foreground text-sm">
                  Building a community of users who can share organization tips, collaborate on photo projects, and contribute to making PickPerfect even better through feedback and suggestions. Planning to add user forums and feature request voting systems.
                </p>
              </Card>
            </div>
          </div>
        </section>

        {/* Contact Developer Section */}
        <section className="container py-20 md:py-32 border-t">
          <div className="mx-auto max-w-4xl text-center">
            <div className="space-y-6">
              <h2 className="text-3xl font-bold mb-4">Get in Touch</h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
                Have questions about PickPerfect or want to collaborate? I'd love to hear from you!
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" onClick={() => router.push('/contact')} className="gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Send Feedback
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="gap-2" 
                  onClick={copyEmailToClipboard}
                >
                  <MailIcon className="h-4 w-4" />
                  {emailCopied ? 'Email Copied!' : 'aranya.ray1998@gmail.com'}
                  {emailCopied && <CheckCircle className="h-4 w-4 text-green-500" />}
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}