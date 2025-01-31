import React, { useEffect, useState } from "react"
import { motion, m } from "framer-motion"
import { LucideIcon, Menu, X } from "lucide-react"
import { cn } from "../../lib/utils"

interface NavItem {
  name: string
  url: string
  icon: LucideIcon
}

interface NavBarProps {
  items: NavItem[]
  className?: string
  logo?: React.ReactNode
  actions?: React.ReactNode
}

export function NavBar({ items, className, logo, actions }: NavBarProps) {
  const [activeTab, setActiveTab] = useState(items[0].name)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  // Handle navigation
  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, item: NavItem) => {
    // If it's a hash link (starts with #), handle smooth scrolling
    if (item.url.startsWith('#')) {
      e.preventDefault();
      setActiveTab(item.name);
      
      const targetId = item.url.replace('#', '');
      const element = document.getElementById(targetId);
      
      if (element) {
        // Close mobile menu first if open
        if (isMenuOpen) {
          setIsMenuOpen(false);
        }

        // Add a small delay to ensure any layout shifts from menu closing are complete
        setTimeout(() => {
          const navbarHeight = 80; // Height of the fixed navbar
          const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
          const offsetPosition = elementPosition - navbarHeight;

          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });
        }, 50);
      }
    } else {
      // For regular navigation (like /dashboard), just update the active tab
      setActiveTab(item.name);
      if (isMenuOpen) {
        setIsMenuOpen(false);
      }
      // Let the default navigation happen
    }
  };

  // Handle scroll effect with debouncing
  useEffect(() => {
    const handleScroll = () => {
      // Update navbar background
      setScrolled(window.scrollY > 20);

      // Update active section based on scroll position
      const sections = items
        .map(item => ({ 
          id: item.url.replace('#', ''),
          name: item.name,
          element: document.getElementById(item.url.replace('#', ''))
        }))
        .filter(item => item.element); // Only consider elements that exist

      if (sections.length === 0) return;

      const scrollPosition = window.scrollY + 100;
      
      // Find the current section
      for (const section of sections) {
        const element = section.element;
        if (!element) continue;

        const rect = element.getBoundingClientRect();
        const offsetTop = rect.top + window.pageYOffset;
        const offsetBottom = offsetTop + rect.height;

        if (scrollPosition >= offsetTop && scrollPosition < offsetBottom) {
          setActiveTab(section.name);
          break;
        }
      }
    };

    // Debounce scroll handler
    let timeoutId: NodeJS.Timeout;
    const debouncedHandleScroll = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(handleScroll, 100);
    };

    window.addEventListener('scroll', debouncedHandleScroll);
    // Run once on mount to set initial active state
    handleScroll();

    return () => {
      window.removeEventListener('scroll', debouncedHandleScroll);
      clearTimeout(timeoutId);
    };
  }, [items]);

  // Close menu on resize if mobile menu is open
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024 && isMenuOpen) {
        setIsMenuOpen(false)
      }
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [isMenuOpen])

  return (
    <nav
      className={cn(
        "fixed top-0 w-full z-50 transition-all duration-300",
        scrolled ? "bg-background/80 backdrop-blur-lg shadow-lg" : "bg-transparent",
        className,
      )}
    >
      <div className="max-w-7xl mx-auto px-4 py-4">
        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center justify-between">
          <div className="flex items-center gap-2 text-blue-400">
            {logo}
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-3 bg-background/50 backdrop-blur-sm border border-white/10 py-1.5 px-1.5 rounded-full shadow-lg">
              {items.map((item) => {
                const Icon = item.icon
                const isActive = activeTab === item.name

                return (
                  <a
                    key={item.name}
                    href={item.url}
                    onClick={(e) => handleNavClick(e, item)}
                    className={cn(
                      "relative cursor-pointer text-sm font-semibold px-6 py-2.5 rounded-full transition-all",
                      "text-white/80 hover:text-blue-400",
                      isActive && "bg-white/10 text-blue-400 shadow-lg",
                    )}
                  >
                    <span className="flex items-center gap-2">
                      <Icon size={16} />
                      {item.name}
                    </span>
                    {isActive && (
                      <m.div
                        layoutId="lamp"
                        className="absolute inset-0 w-full rounded-full -z-10"
                        initial={false}
                        transition={{
                          type: "spring",
                          stiffness: 300,
                          damping: 30,
                        }}
                      >
                        <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-8 h-1 bg-blue-600 rounded-t-full">
                          <div className="absolute w-12 h-6 bg-blue-600/20 rounded-full -top-2 -left-2" />
                          <div className="absolute w-8 h-6 bg-blue-600/20 rounded-full -top-1" />
                          <div className="absolute w-4 h-4 bg-blue-600/20 rounded-full top-0 left-2" />
                        </div>
                      </m.div>
                    )}
                  </a>
                )
              })}
            </div>
            <div className="flex items-center gap-2">
              <a
                href="/login"
                className="relative cursor-pointer text-sm font-semibold px-6 py-2.5 rounded-full transition-all bg-white/10 text-blue-400 hover:bg-white/20"
              >
                Login
              </a>
              <a
                href="/signup"
                className="relative cursor-pointer text-sm font-semibold px-6 py-2.5 rounded-full transition-all bg-blue-600 text-white hover:bg-blue-700"
              >
                Sign up
              </a>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="lg:hidden flex items-center justify-between h-16">
          <div className="text-blue-400">
            {logo}
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 text-white/80 hover:text-white transition-colors rounded-lg border border-white/10 bg-white/5"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <motion.div
          initial={false}
          animate={isMenuOpen ? { height: 'auto', opacity: 1 } : { height: 0, opacity: 0 }}
          className={cn(
            "lg:hidden fixed inset-x-0 top-[72px] overflow-hidden",
            "bg-background/95 backdrop-blur-lg border-t border-white/10",
            isMenuOpen ? "pointer-events-auto" : "pointer-events-none"
          )}
        >
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col gap-2 p-4 max-h-[calc(100vh-80px)] overflow-y-auto">
              {items.map((item) => {
                const Icon = item.icon
                const isActive = activeTab === item.name

                return (
                  <a
                    key={item.name}
                    href={item.url}
                    onClick={(e) => handleNavClick(e, item)}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-lg transition-all",
                      "text-white/80 hover:text-blue-400",
                      isActive && "bg-white/10 text-blue-400"
                    )}
                  >
                    <Icon size={18} />
                    {item.name}
                  </a>
                )
              })}
              <div className="mt-4 pt-4 border-t border-white/10 flex flex-col gap-3">
                <a
                  href="/login"
                  className="relative cursor-pointer text-sm font-semibold px-6 py-2.5 rounded-full transition-all bg-white/10 text-blue-400 hover:bg-white/20"
                >
                  Login
                </a>
                <a
                  href="/signup"
                  className="relative cursor-pointer text-sm font-semibold px-6 py-2.5 rounded-full transition-all bg-blue-600 text-white hover:bg-blue-700"
                >
                  Sign up
                </a>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </nav>
  )
}