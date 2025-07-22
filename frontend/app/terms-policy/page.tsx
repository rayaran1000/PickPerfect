import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LucideImage, Sparkles, ArrowLeft, Shield, Users, Zap } from "lucide-react"
import { ThemeToggle } from "@/components/Theme-handling/theme-toggle"
import Link from "next/link"

export default function TermsAndPolicyPage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
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
            <Link href="/">
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Home
              </Button>
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="flex-1 container py-8">
        <div className="max-w-4xl mx-auto">
          {/* Page Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Terms and Conditions</h1>
            <p className="text-xl text-muted-foreground">
              Last updated: January 2025
            </p>
          </div>

          {/* Terms Content */}
          <div className="space-y-8">
            {/* Introduction */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Introduction
                </CardTitle>
              </CardHeader>
              <CardContent className="prose prose-sm max-w-none">
                <p>
                  Welcome to PickPerfect ("we," "our," or "us"). These Terms and Conditions ("Terms") govern your use of our AI-powered photo organization service available at our website and any related services.
                </p>
                <p>
                  By accessing or using PickPerfect, you agree to be bound by these Terms. If you disagree with any part of these terms, then you may not access our service.
                </p>
              </CardContent>
            </Card>

            {/* Service Description */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Service Description
                </CardTitle>
              </CardHeader>
              <CardContent className="prose prose-sm max-w-none">
                <p>
                  PickPerfect is an AI-powered photo organization service that helps users:
                </p>
                <ul>
                  <li>Identify and remove duplicate photos</li>
                  <li>Find similar images using advanced AI algorithms</li>
                  <li>Organize photo libraries efficiently</li>
                  <li>Optimize storage space</li>
                </ul>
                <p>
                  Our service processes photos locally and does not permanently store your images on our servers.
                </p>
              </CardContent>
            </Card>

            {/* User Accounts */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  User Accounts and Registration
                </CardTitle>
              </CardHeader>
              <CardContent className="prose prose-sm max-w-none">
                <p>
                  To use certain features of PickPerfect, you may be required to create an account using Google OAuth. You are responsible for:
                </p>
                <ul>
                  <li>Maintaining the confidentiality of your account credentials</li>
                  <li>All activities that occur under your account</li>
                  <li>Notifying us immediately of any unauthorized use</li>
                  <li>Ensuring your account information is accurate and up-to-date</li>
                </ul>
                <p>
                  We reserve the right to terminate accounts that violate these Terms or are inactive for extended periods.
                </p>
              </CardContent>
            </Card>

            {/* Acceptable Use */}
            <Card>
              <CardHeader>
                <CardTitle>Acceptable Use Policy</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-sm max-w-none">
                <p>You agree to use PickPerfect only for lawful purposes and in accordance with these Terms. You agree not to:</p>
                <ul>
                  <li>Upload content that is illegal, harmful, threatening, abusive, or defamatory</li>
                  <li>Upload content that infringes on intellectual property rights</li>
                  <li>Attempt to gain unauthorized access to our systems</li>
                  <li>Use the service to distribute malware or harmful code</li>
                  <li>Interfere with or disrupt the service or servers</li>
                  <li>Use automated systems to access the service without permission</li>
                  <li>Upload excessive amounts of data that could impact service performance</li>
                </ul>
              </CardContent>
            </Card>

            {/* Privacy and Data */}
            <Card>
              <CardHeader>
                <CardTitle>Privacy and Data Protection</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-sm max-w-none">
                <p>
                  Your privacy is important to us. Our Privacy Policy explains how we collect, use, and protect your information.
                </p>
                <p>
                  <strong>Photo Processing:</strong> Your photos are processed locally and temporarily stored only for the duration of your analysis session. We do not permanently store your images on our servers.
                </p>
                <p>
                  <strong>Data Retention:</strong> Session data is automatically deleted after 24 hours or when you manually clean up your session.
                </p>
                <p>
                  <strong>Third-Party Services:</strong> We use Google OAuth for authentication. Please review Google's privacy policy for information about how they handle your data.
                </p>
              </CardContent>
            </Card>

            {/* Service Limitations */}
            <Card>
              <CardHeader>
                <CardTitle>Service Limitations and Restrictions</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-sm max-w-none">
                <p>PickPerfect has the following limitations:</p>
                <ul>
                  <li>Maximum 50 photos per analysis session</li>
                  <li>Maximum 50MB per individual file</li>
                  <li>Maximum 100MB total per session</li>
                  <li>Supported formats: JPG, PNG, GIF, WebP, BMP, TIFF</li>
                  <li>Analysis processing time varies based on image count and size</li>
                </ul>
                <p>
                  We reserve the right to modify these limitations at any time with reasonable notice.
                </p>
              </CardContent>
            </Card>

            {/* Intellectual Property */}
            <Card>
              <CardHeader>
                <CardTitle>Intellectual Property Rights</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-sm max-w-none">
                <p>
                  <strong>Your Content:</strong> You retain all rights to your photos and content. By using our service, you grant us a limited, temporary license to process your images solely for the purpose of providing our analysis service.
                </p>
                <p>
                  <strong>Our Service:</strong> PickPerfect, including its software, algorithms, and design, is protected by intellectual property laws. You may not copy, modify, or distribute our service without permission.
                </p>
                <p>
                  <strong>AI Models:</strong> Our service uses third-party AI models and libraries. These are subject to their respective licenses and terms of use.
                </p>
              </CardContent>
            </Card>

            {/* Disclaimers */}
            <Card>
              <CardHeader>
                <CardTitle>Disclaimers and Limitations of Liability</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-sm max-w-none">
                <p>
                  <strong>Service Availability:</strong> We strive to provide reliable service but cannot guarantee uninterrupted availability. The service is provided "as is" without warranties of any kind.
                </p>
                <p>
                  <strong>Analysis Accuracy:</strong> While our AI strives for accuracy, we cannot guarantee 100% accuracy in duplicate or similar image detection. Users should review results before deleting any photos.
                </p>
                <p>
                  <strong>Data Loss:</strong> We are not responsible for any data loss that may occur during the use of our service. Users should maintain backups of their photos.
                </p>
                <p>
                  <strong>Limitation of Liability:</strong> In no event shall PickPerfect be liable for any indirect, incidental, special, or consequential damages arising from your use of the service.
                </p>
              </CardContent>
            </Card>

            {/* Termination */}
            <Card>
              <CardHeader>
                <CardTitle>Termination</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-sm max-w-none">
                <p>
                  We may terminate or suspend your access to PickPerfect immediately, without prior notice, for any reason, including breach of these Terms.
                </p>
                <p>
                  Upon termination, your right to use the service will cease immediately, and we will delete any remaining session data.
                </p>
                <p>
                  You may terminate your account at any time by contacting us or using the sign-out function.
                </p>
              </CardContent>
            </Card>

            {/* Changes to Terms */}
            <Card>
              <CardHeader>
                <CardTitle>Changes to Terms</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-sm max-w-none">
                <p>
                  We reserve the right to modify these Terms at any time. We will notify users of significant changes by:
                </p>
                <ul>
                  <li>Posting the updated Terms on our website</li>
                  <li>Updating the "Last updated" date</li>
                  <li>Sending email notifications for major changes</li>
                </ul>
                <p>
                  Your continued use of PickPerfect after changes become effective constitutes acceptance of the new Terms.
                </p>
              </CardContent>
            </Card>

            {/* Governing Law */}
            <Card>
              <CardHeader>
                <CardTitle>Governing Law and Dispute Resolution</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-sm max-w-none">
                <p>
                  These Terms are governed by and construed in accordance with the laws of the jurisdiction where PickPerfect operates.
                </p>
                <p>
                  Any disputes arising from these Terms or your use of the service will be resolved through binding arbitration, except for claims that may be brought in small claims court.
                </p>
                <p>
                  You agree to resolve disputes individually and waive any right to participate in class action lawsuits.
                </p>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-sm max-w-none">
                <p>
                  If you have any questions about these Terms and Conditions, please contact us:
                </p>
                <ul>
                  <li>Email: legal@pickperfect.com</li>
                  <li>Website: <a href="/contact" className="text-primary hover:underline">Contact Form</a></li>
                  <li>Address: [Your Business Address]</li>
                </ul>
                <p>
                  We will respond to your inquiry within a reasonable timeframe.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Footer Actions */}
          <div className="mt-12 text-center space-y-4">
            <p className="text-sm text-muted-foreground">
              By using PickPerfect, you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/">
                <Button variant="outline">
                  Return to Home
                </Button>
              </Link>
              <Link href="/contact">
                <Button>
                  Contact Support
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t py-6 mt-12">
        <div className="container flex flex-col items-center justify-between gap-4 md:flex-row">
          <p className="text-sm text-muted-foreground">© 2025 PickPerfect. All rights reserved.</p>
          <div className="flex gap-4">
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
