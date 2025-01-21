import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'

export default function Signup() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()
  const { signInWithGoogle } = useAuth()

  const handleGoogleSignup = async () => {
    try {
      setLoading(true)
      setError(null)
      await signInWithGoogle()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during sign up')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[hsl(225,25%,3%)]">
      <div className="relative max-w-md w-full space-y-8 p-8 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-lg">
        <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-32 h-1 bg-blue-600 rounded-t-full">
          <div className="absolute w-40 h-6 bg-blue-600/20 rounded-full -top-2 -left-4" />
          <div className="absolute w-32 h-6 bg-blue-600/20 rounded-full -top-1 -left-0" />
          <div className="absolute w-16 h-4 bg-blue-600/20 rounded-full top-0 left-8" />
        </div>
        
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
            Create Account
          </h2>
          <p className="mt-2 text-center text-sm text-white/60">
            Join ThumbAI and start creating
          </p>
        </div>

        <div className="mt-8 space-y-6">
          <motion.button
            onClick={handleGoogleSignup}
            disabled={loading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full flex justify-center py-3 px-4 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 border border-white/10"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 border-2 border-white/20 border-t-white/80 rounded-full animate-spin" />
                <span>Signing up...</span>
              </div>
            ) : (
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Continue with Google
              </div>
            )}
          </motion.button>
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-red-400 text-sm text-center mt-2 bg-red-500/10 py-2 px-4 rounded-lg border border-red-500/20"
            >
              {error}
            </motion.div>
          )}
          
          <div className="text-center space-y-4">
            <p className="text-sm text-white/60">
              Already have an account?{' '}
              <button 
                onClick={() => navigate('/login')} 
                className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
              >
                Sign in
              </button>
            </p>
            
            <p className="text-xs text-white/40 whitespace-nowrap">
              By continuing, you agree to our{' '}
              <a 
                href="/terms-conditions.html" 
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 transition-colors"
              >
                Terms of Service
              </a>
              {' '}and{' '}
              <a 
                href="/privacy-policy.html" 
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 transition-colors"
              >
                Privacy Policy
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
