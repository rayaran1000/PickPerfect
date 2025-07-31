import { LucideImage } from "lucide-react"
import Link from "next/link"

export function Footer() {
  return (
    <footer className="border-t py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-4">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <LucideImage className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold">PickPerfect</span>
            </div>
            <p className="text-sm text-muted-foreground">
              AI-powered photo organization that actually works.
            </p>
          </div>
          
          <div className="space-y-4">
            <h4 className="font-semibold">About</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/features" className="hover:text-foreground transition-colors">Features</Link></li> 
              <li><Link href="/about" className="hover:text-foreground transition-colors">About Us</Link></li>
            </ul>
          </div>
          
          <div className="space-y-4">
            <h4 className="font-semibold">Feedback</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/contact" className="hover:text-foreground transition-colors">Contact Us</Link></li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold">Policy and Terms</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="#" className="hover:text-foreground transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms-policy" className="hover:text-foreground transition-colors">Terms of Conditions</Link></li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  )
} 