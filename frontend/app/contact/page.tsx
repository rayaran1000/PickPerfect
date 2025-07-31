'use client';

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Sparkles, Mail, MessageSquare, Send, ArrowRight, CheckCircle, LogOut, Home, Mail as MailIcon, MessageCircle, Star, Heart, Users, Zap } from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { useAuth } from "@/components/auth-provider"
import { useRouter } from "next/navigation"
import { useState } from "react"

export default function ContactPage() {
    const { signOut, user } = useAuth()
    const router = useRouter()
    const [emailCopied, setEmailCopied] = useState(false)
    const [selectedFeedbackTypes, setSelectedFeedbackTypes] = useState<string[]>([])
    const [feedbackMessage, setFeedbackMessage] = useState('')
    const [showThankYou, setShowThankYou] = useState(false)
    
    const feedbackEmail = "aranya.ray1998@gmail.com"
    
    const copyEmailToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(feedbackEmail)
            setEmailCopied(true)
            setTimeout(() => setEmailCopied(false), 2000)
        } catch (err) {
            console.error('Failed to copy email:', err)
        }
    }

    const toggleFeedbackType = (type: string) => {
        setSelectedFeedbackTypes(prev => 
            prev.includes(type) 
                ? prev.filter(t => t !== type)
                : [...prev, type]
        )
    }

    const openGmailCompose = () => {
        const feedbackTypesText = selectedFeedbackTypes.length > 0 
            ? selectedFeedbackTypes.join(', ') 
            : 'General Feedback'
        
        const subject = encodeURIComponent(`PickPerfect Feedback - ${feedbackTypesText}`)
        const body = encodeURIComponent(`Hi PickPerfect team,\n\nFeedback Types: ${feedbackTypesText}\n\nI'd like to share some feedback:\n\n${feedbackMessage || '[Your feedback here]'}\n\nBest regards,\n${user?.email || '[Your name]'}`)
        
        // Open Gmail compose in new tab
        window.open(`https://mail.google.com/mail/?view=cm&fs=1&to=${feedbackEmail}&su=${subject}&body=${body}`, '_blank')
        
        // Show thank you message
        setShowThankYou(true)
    }

    const resetFeedback = () => {
        setSelectedFeedbackTypes([])
        setFeedbackMessage('')
        setShowThankYou(false)
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
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative py-20 md:py-32">
            <div className="mx-auto flex max-w-[1200px] flex-col items-center gap-12 text-center">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-sm font-medium text-primary">
                <MessageSquare className="h-4 w-4" />
                We'd Love to Hear From You
              </div>

              {/* Main heading */}
              <div className="space-y-6">
                <h1 className="text-5xl font-bold tracking-tight sm:text-6xl md:text-7xl">
                  <span className="bg-gradient-to-r from-primary via-purple-600 to-pink-600 bg-clip-text text-transparent">
                    Get in Touch
                  </span>
                  <br />
                  <span className="text-foreground">Share Your Feedback</span>
                </h1>
                <p className="max-w-[800px] text-xl text-muted-foreground md:text-2xl leading-relaxed">
                  Your feedback helps us make PickPerfect even better. We're here to listen and improve.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
          <div className="mx-auto max-w-4xl">
            <div className="grid gap-12 md:grid-cols-2">
              {/* Contact Information */}
              <div className="space-y-8">
                <div>
                  <h2 className="text-3xl font-bold mb-4">Let's Connect</h2>
                  <p className="text-lg text-muted-foreground mb-8">
                    We value your input and are committed to making PickPerfect the best photo organization tool possible.
                  </p>
                </div>

                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Mail className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Email Feedback</h3>
                      <p className="text-muted-foreground mb-3">
                        Send us your thoughts, suggestions, or report any issues you've encountered.
                      </p>
                      <Button 
                        onClick={copyEmailToClipboard}
                        variant="outline" 
                        className="gap-2"
                      >
                        <MailIcon className="h-4 w-4" />
                        {emailCopied ? 'Email Copied!' : feedbackEmail}
                        {emailCopied && <CheckCircle className="h-4 w-4 text-green-500" />}
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center flex-shrink-0">
                      <MessageCircle className="h-6 w-6 text-purple-500" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Response Time</h3>
                      <p className="text-muted-foreground">
                        We typically respond to feedback within 24-48 hours during business days.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-pink-500/10 flex items-center justify-center flex-shrink-0">
                      <Heart className="h-6 w-6 text-pink-500" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-2">We Appreciate You</h3>
                      <p className="text-muted-foreground">
                        Every piece of feedback helps us improve and create a better experience for all users.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Card */}
              <div className="space-y-6">
                {!showThankYou ? (
                  <>
                    <Card className="border-2 border-primary/10">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Send className="h-5 w-5 text-primary" />
                          Send Feedback
                        </CardTitle>
                        <CardDescription>
                          Share your experience, suggestions, or report issues
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="space-y-4">
                          <div>
                            <label className="text-sm font-medium mb-2 block">Your Email</label>
                            <div className="p-3 bg-muted rounded-lg border">
                              <p className="text-sm text-muted-foreground">
                                {user?.email || 'Please sign in to auto-fill your email'}
                              </p>
                            </div>
                          </div>
                          
                          <div>
                            <label className="text-sm font-medium mb-2 block">Feedback Type</label>
                            <div className="grid grid-cols-2 gap-2">
                              <Button 
                                variant={selectedFeedbackTypes.includes('Feature Request') ? 'default' : 'outline'} 
                                size="sm" 
                                className="justify-start"
                                onClick={() => toggleFeedbackType('Feature Request')}
                              >
                                <Star className="h-4 w-4 mr-2" />
                                Feature Request
                              </Button>
                              <Button 
                                variant={selectedFeedbackTypes.includes('Bug Report') ? 'default' : 'outline'} 
                                size="sm" 
                                className="justify-start"
                                onClick={() => toggleFeedbackType('Bug Report')}
                              >
                                <MessageCircle className="h-4 w-4 mr-2" />
                                Bug Report
                              </Button>
                              <Button 
                                variant={selectedFeedbackTypes.includes('General Feedback') ? 'default' : 'outline'} 
                                size="sm" 
                                className="justify-start"
                                onClick={() => toggleFeedbackType('General Feedback')}
                              >
                                <Heart className="h-4 w-4 mr-2" />
                                General Feedback
                              </Button>
                              <Button 
                                variant={selectedFeedbackTypes.includes('User Experience') ? 'default' : 'outline'} 
                                size="sm" 
                                className="justify-start"
                                onClick={() => toggleFeedbackType('User Experience')}
                              >
                                <Users className="h-4 w-4 mr-2" />
                                User Experience
                              </Button>
                            </div>
                            {selectedFeedbackTypes.length > 0 && (
                              <p className="text-sm text-muted-foreground mt-2">
                                Selected: <span className="font-medium text-primary">{selectedFeedbackTypes.join(', ')}</span>
                              </p>
                            )}
                          </div>

                          <div>
                            <label className="text-sm font-medium mb-2 block">Message</label>
                            <textarea 
                              className="w-full p-3 border rounded-lg bg-background resize-none"
                              rows={6}
                              placeholder="Tell us about your experience with PickPerfect..."
                              value={feedbackMessage}
                              onChange={(e) => setFeedbackMessage(e.target.value)}
                            />
                          </div>

                          <Button className="w-full gap-2" onClick={openGmailCompose}>
                            <MailIcon className="h-4 w-4" />
                            Send Feedback via Gmail
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </>
                ) : (
                  <Card className="border-2 border-green-600 bg-green-100/30">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-green-800">
                        <CheckCircle className="h-5 w-5" />
                        Thank You for Your Feedback!
                      </CardTitle>
                      <CardDescription className="text-green-700">
                        We've opened Gmail for you to send your feedback. We appreciate you taking the time to help us improve PickPerfect.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="text-center space-y-4">
                        <div className="flex items-center justify-center gap-2 text-green-800">
                          <MailIcon className="h-4 w-4" />
                          <span className="text-sm font-medium">Gmail compose window opened in a new tab</span>
                        </div>
                        <p className="text-sm text-green-700">
                          We typically respond to feedback within 24-48 hours. Your input helps us make PickPerfect even better!
                        </p>
                        <Button 
                          onClick={resetFeedback}
                          variant="outline" 
                          className="gap-2"
                        >
                          <Send className="h-4 w-4" />
                          Send More Feedback
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* What We're Looking For Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32 border-t">
          <div className="mx-auto max-w-6xl">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4">What Kind of Feedback We Value</h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Help us understand how to make PickPerfect even better for you
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              <div className="group relative p-6 rounded-2xl border bg-card hover:bg-card/80 transition-all duration-300 hover:shadow-lg">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-purple-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Zap className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-bold mb-2">Performance Issues</h3>
                  <p className="text-muted-foreground text-sm">
                    Let us know if you experience slow processing, crashes, or other technical problems.
                  </p>
                </div>
              </div>

              <div className="group relative p-6 rounded-2xl border bg-card hover:bg-card/80 transition-all duration-300 hover:shadow-lg">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-pink-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative">
                  <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Star className="h-6 w-6 text-purple-500" />
                  </div>
                  <h3 className="text-lg font-bold mb-2">Feature Requests</h3>
                  <p className="text-muted-foreground text-sm">
                    Suggest new features or improvements that would make photo organization easier for you.
                  </p>
                </div>
              </div>

              <div className="group relative p-6 rounded-2xl border bg-card hover:bg-card/80 transition-all duration-300 hover:shadow-lg">
                <div className="absolute inset-0 bg-gradient-to-r from-pink-500/5 to-primary/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative">
                  <div className="w-12 h-12 rounded-xl bg-pink-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Users className="h-6 w-6 text-pink-500" />
                  </div>
                  <h3 className="text-lg font-bold mb-2">User Experience</h3>
                  <p className="text-muted-foreground text-sm">
                    Share your thoughts on the interface, workflow, or any confusing aspects of the app.
                  </p>
                </div>
              </div>

              <div className="group relative p-6 rounded-2xl border bg-card hover:bg-card/80 transition-all duration-300 hover:shadow-lg">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-cyan-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative">
                  <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <MessageCircle className="h-6 w-6 text-blue-500" />
                  </div>
                  <h3 className="text-lg font-bold mb-2">Accuracy Feedback</h3>
                  <p className="text-muted-foreground text-sm">
                    Tell us about the accuracy of duplicate detection or similar image grouping.
                  </p>
                </div>
              </div>

              <div className="group relative p-6 rounded-2xl border bg-card hover:bg-card/80 transition-all duration-300 hover:shadow-lg">
                <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-emerald-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative">
                  <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Heart className="h-6 w-6 text-green-500" />
                  </div>
                  <h3 className="text-lg font-bold mb-2">Positive Feedback</h3>
                  <p className="text-muted-foreground text-sm">
                    We love hearing what works well! Your positive feedback motivates us to keep improving.
                  </p>
                </div>
              </div>

              <div className="group relative p-6 rounded-2xl border bg-card hover:bg-card/80 transition-all duration-300 hover:shadow-lg">
                <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 to-red-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative">
                  <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Mail className="h-6 w-6 text-orange-500" />
                  </div>
                  <h3 className="text-lg font-bold mb-2">General Comments</h3>
                  <p className="text-muted-foreground text-sm">
                    Any other thoughts, suggestions, or comments about your experience with PickPerfect.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Response Commitment */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32 border-t">
          <div className="mx-auto max-w-4xl text-center">
            <div className="space-y-6">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                <CheckCircle className="h-8 w-8 text-primary" />
              </div>
              <h2 className="text-3xl font-bold mb-4">We Promise to Respond</h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
                Every piece of feedback is read and considered. We're committed to making PickPerfect better based on your input.
              </p>
              
              <div className="grid gap-6 md:grid-cols-3">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">24-48h</div>
                  <div className="text-sm text-muted-foreground">Response Time</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">100%</div>
                  <div className="text-sm text-muted-foreground">Feedback Read</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">Active</div>
                  <div className="text-sm text-muted-foreground">Development</div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
