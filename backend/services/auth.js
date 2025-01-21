import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import { DatabaseService } from './database.js'

// Load environment variables
dotenv.config()

// Verify environment variables
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
  throw new Error('Missing Supabase environment variables')
}

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

export const AuthService = {
  async handleGoogleCallback(token) {
    try {
      // Verify the token with Supabase
      const { data: { user }, error: verifyError } = await supabase.auth.getUser(token)
      
      if (verifyError) {
        console.error('Token verification failed:', verifyError)
        throw verifyError
      }

      if (!user) {
        throw new Error('No user found after authentication')
      }

      // Sync user data to profiles table
      await DatabaseService.syncUserProfile(user)

      return { success: true, user }
    } catch (error) {
      console.error('Error in handleGoogleCallback:', error)
      return { 
        success: false, 
        error: error.message || 'Authentication failed'
      }
    }
  },

  async signOut(token) {
    try {
      // Verify token before sign out
      const { error: verifyError } = await supabase.auth.getUser(token)
      if (verifyError) throw verifyError

      const { error } = await supabase.auth.admin.signOut(token)
      if (error) throw error

      return { success: true }
    } catch (error) {
      console.error('Error in signOut:', error)
      return { 
        success: false, 
        error: error.message || 'Sign out failed'
      }
    }
  },

  async verifySession(token) {
    try {
      if (!token) {
        throw new Error('No token provided')
      }

      // Verify the token and get user
      const { data: { user }, error } = await supabase.auth.getUser(token)
      
      if (error) {
        console.error('Session verification failed:', error)
        throw error
      }

      if (!user) {
        throw new Error('Invalid session')
      }

      // Update profile timestamp
      await DatabaseService.syncUserProfile(user)

      return { success: true, user }
    } catch (error) {
      console.error('Error in verifySession:', error)
      return { 
        success: false, 
        error: error.message || 'Session verification failed'
      }
    }
  }
}
