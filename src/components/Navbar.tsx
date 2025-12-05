import { useState } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()

  const closeMenu = () => setIsMenuOpen(false)
  
  const handleGetStarted = () => {
    closeMenu()
    navigate('/onboarding/step1')
  }

  const navLinks = [
    { to: "/", label: "Home" },
    { to: "/dashboard", label: "Dashboard" },
    { to: "/features", label: "Features" },
    { to: "/about", label: "About" },
    { to: "/settings", label: "Settings" }
  ]

  return (
    <>
      <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Link to="/" className="flex items-center gap-2 group" onClick={closeMenu}>
              {/* Logo Icon - visible on all screens */}
              <div className="flex-shrink-0">
                <img 
                  src="/logo-icon.svg" 
                  alt="JobsearchAI" 
                  className="h-8 w-8 transition-transform duration-200 group-hover:scale-110"
                />
              </div>
              {/* Text - hidden on mobile, visible on tablet and up */}
              <span className="hidden md:inline-block text-xl font-bold bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent whitespace-nowrap">
                JobsearchAI
              </span>
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link 
                key={link.to}
                to={link.to} 
                className={`text-sm font-medium transition-colors ${
                  location.pathname === link.to
                    ? 'text-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-4">
            {/* Mobile Menu Button */}
            <button
              type="button"
              className="md:hidden inline-flex items-center justify-center size-9 rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 relative z-50 cursor-pointer"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu"
              aria-expanded={isMenuOpen}
            >
              {isMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
            {/* Desktop Get Started Button */}
            <Button 
              variant="default" 
              className="hidden md:inline-flex"
              onClick={handleGetStarted}
            >
              Get Started
            </Button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 md:hidden"
            onClick={closeMenu}
            aria-hidden="true"
          />
          
          {/* Mobile Menu Panel */}
          <div 
            className="fixed top-16 left-0 right-0 z-50 md:hidden border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="container mx-auto px-4 py-4">
              <nav className="flex flex-col gap-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={closeMenu}
                    className={`text-base font-medium py-3 px-4 rounded-md transition-colors ${
                      location.pathname === link.to
                        ? 'text-foreground bg-accent border-l-4 border-primary'
                        : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
                <div className="pt-3 border-t border-border mt-2">
                  <Button 
                    variant="default" 
                    className="w-full"
                    onClick={handleGetStarted}
                  >
                    Get Started
                  </Button>
                </div>
              </nav>
            </div>
          </div>
        </>
      )}
    </>
  )
}

