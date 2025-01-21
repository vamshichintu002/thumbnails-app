import { Youtube, Sparkles, Star, Users, LogIn, LayoutDashboard } from 'lucide-react'
import { NavBar } from "./tubelight-navbar"

export function NavBarDemo() {
  // Mock authentication state
  const isAuthenticated = true;

  const navItems = isAuthenticated ? [
    { name: 'Dashboard', url: '/dashboard', icon: LayoutDashboard },
    { name: 'Features', url: '#features', icon: Sparkles },
    { name: 'Reviews', url: '#reviews', icon: Star },
    { name: 'Pricing', url: '#pricing', icon: Users },
  ] : [
    { name: 'Features', url: '#features', icon: Sparkles },
    { name: 'Reviews', url: '#reviews', icon: Star },
    { name: 'Pricing', url: '#pricing', icon: Users },
    { name: 'Log In', url: '#login', icon: LogIn },
  ];

  const logo = (
    <a href="/" className="flex items-center gap-2 text-xl font-bold">
      <Youtube className="w-6 h-6" />
      <span>ThumbAI</span>
    </a>
  )

  const actions = isAuthenticated ? (
    <>
      <button className="px-4 py-2 text-sm font-semibold text-white/90 hover:text-white transition-colors">
        Profile
      </button>
      <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-sm font-semibold rounded-full transition-colors">
        Generate
      </button>
    </>
  ) : (
    <>
      <button className="px-4 py-2 text-sm font-semibold text-white/90 hover:text-white transition-colors">
        Sign Up
      </button>
      <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-sm font-semibold rounded-full transition-colors">
        Try for Free
      </button>
    </>
  );

  return (
    <NavBar 
      items={navItems} 
      logo={logo}
      actions={actions}
    />
  )
}