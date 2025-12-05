/**
 * Footer component with links to legal pages
 */

import { Link } from 'react-router-dom'

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] items-start gap-8">
          {/* Brand Section - Left */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <img 
                src="/logo-icon.svg" 
                alt="JobsearchAI" 
                className="h-8 w-8"
              />
              <span className="text-xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                JobsearchAI
              </span>
            </div>
            <p className="text-sm text-muted-foreground max-w-xs">
              AI-powered job search platform helping you find and prepare for your next career opportunity.
            </p>
          </div>

          {/* Legal Links - Center */}
          <div className="space-y-4 md:justify-self-center">
            <h3 className="font-semibold text-sm">Legal</h3>
            <ul className="space-y-2">
              <li>
                <Link 
                  to="/privacy" 
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link 
                  to="/terms" 
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Terms of Use
                </Link>
              </li>
            </ul>
          </div>

          {/* Quick Links - Right */}
          <div className="space-y-4 md:justify-self-end">
            <h3 className="font-semibold text-sm">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link 
                  to="/" 
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link 
                  to="/about" 
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  About
                </Link>
              </li>
              <li>
                <Link 
                  to="/features" 
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Features
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-8 border-t border-border flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            © {currentYear} JobsearchAI. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            {/* Social links can be added here if needed */}
          </div>
        </div>
      </div>
    </footer>
  )
}

