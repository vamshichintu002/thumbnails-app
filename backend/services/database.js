import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

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

export const DatabaseService = {
  // Profile Management
  async createProfile(user, referralCode = null) {
    if (!user || !user.id) {
      throw new Error('Invalid user data provided to createProfile');
    }
    
    console.log('Creating new profile for user:', user.id);
    try {
      const profileData = {
        id: user.id,
        email: user.email,
        full_name: user.user_metadata?.full_name || user.user_metadata?.name,
        avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.picture,
        credits: 50,
        referral_code: referralCode || this.generateReferralCode(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      console.log('Profile data to insert:', profileData);

      const { data, error } = await supabase
        .from('profiles')
        .insert(profileData)
        .select()
        .single();

      if (error) {
        console.error('Error creating profile:', error);
        throw error;
      }
      console.log('Profile created successfully:', data);
      return data;
    } catch (error) {
      console.error('Error in createProfile:', error);
      throw error;
    }
  },

  async getProfile(userId) {
    console.log('Fetching profile for user:', userId);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        throw error;
      }

      console.log('Profile fetched:', data || 'Not found');
      return data;
    } catch (error) {
      console.error('Error in getProfile:', error);
      throw error;
    }
  },

  async updateProfileTimestamp(userId) {
    const { data, error } = await supabase
      .from('profiles')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', userId)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async syncUserProfile(user) {
    if (!user || !user.id) {
      throw new Error('Invalid user data provided to syncUserProfile');
    }

    console.log('Syncing profile for user:', user.id);
    try {
      // Check if profile exists
      const { data: existingProfile, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (fetchError && fetchError.code === 'PGRST116') {
        // Profile doesn't exist, create it
        console.log('No profile found, creating new profile');
        return await this.createProfile(user);
      } else if (fetchError) {
        // Other error occurred
        console.error('Error checking profile:', fetchError);
        throw fetchError;
      }

      // Profile exists, update it
      console.log('Updating existing profile');
      const { data, error: updateError } = await supabase
        .from('profiles')
        .update({
          email: user.email,
          full_name: user.user_metadata?.full_name || user.user_metadata?.name,
          avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.picture,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)
        .select()
        .single();

      if (updateError) {
        console.error('Error updating profile:', updateError);
        throw updateError;
      }

      console.log('Profile synced successfully:', data);
      return data;
    } catch (error) {
      console.error('Error in syncUserProfile:', error);
      throw error;
    }
  },

  async syncAllAuthUsers() {
    console.log('Starting sync of all auth users to profiles');
    try {
      // Get all existing profiles
      const { data: existingProfiles, error: profileError } = await supabase
        .from('profiles')
        .select('id');

      if (profileError) {
        console.error('Error fetching existing profiles:', profileError);
        throw profileError;
      }

      const existingProfileIds = new Set(existingProfiles.map(p => p.id));

      // Define known users
      const knownUsers = [
        {
          id: 'c6ff9ffe-1fc9-4ae1-8c5a-09d93c767f82',
          email: 'devtern.tech@gmail.com',
          user_metadata: {
            full_name: 'Devtern',
            name: 'Devtern'
          }
        },
        {
          id: '7d618497-d441-4ec7-b031-69683b952821',
          email: 'thumbnailslabs@gmail.com',
          user_metadata: {
            full_name: 'Thumbnails Labs',
            name: 'Thumbnails Labs'
          }
        }
      ];

      // Sync each known user
      for (const user of knownUsers) {
        if (!existingProfileIds.has(user.id)) {
          console.log(`Creating missing profile for user: ${user.id}`);
          await this.syncUserProfile(user);
        }
      }

      console.log('Completed syncing all auth users to profiles');
      return { success: true };
    } catch (error) {
      console.error('Error in syncAllAuthUsers:', error);
      throw error;
    }
  },

  async ensureUserProfile(userId) {
    try {
      // Check if profile exists
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', userId)
        .single();

      if (profileError && profileError.code === 'PGRST116') {
        // Profile doesn't exist, create it
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error) throw error;
        return await this.syncUserProfile(user);
      } else if (profileError) {
        throw profileError;
      }

      return profile;
    } catch (error) {
      console.error('Error in ensureUserProfile:', error);
      throw error;
    }
  },

  async logGeneration(profileId, type, outputUrl, creditCost) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('credits')
      .eq('id', profileId)
      .single()

    if (profile.credits < creditCost) {
      throw new Error('Insufficient credits')
    }

    // Start a transaction
    const { data, error } = await supabase.rpc('create_generation', {
      p_profile_id: profileId,
      p_generation_type: type,
      p_output_url: outputUrl,
      p_credit_cost: creditCost
    })

    if (error) throw error
    return data
  },

  async saveUserImage(profileId, imageUrl) {
    const { data, error } = await supabase
      .from('user_images')
      .insert({
        profile_id: profileId,
        image_url: imageUrl
      })
      .single()

    if (error) throw error
    return data
  },

  async addCredits(profileId, amount) {
    const { data, error } = await supabase
      .from('profiles')
      .update({ credits: supabase.raw(`credits + ${amount}`) })
      .eq('id', profileId)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async processReferral(referralCode, newUserId) {
    const { data: referrer } = await supabase
      .from('profiles')
      .select('id')
      .eq('referral_code', referralCode)
      .single()

    if (!referrer) throw new Error('Invalid referral code')

    await Promise.all([
      // Add credits to referrer
      this.addCredits(referrer.id, 30),
      // Update new user's referred_by
      supabase
        .from('profiles')
        .update({ referred_by: referralCode })
        .eq('id', newUserId)
    ])
  },

  async syncMissingProfiles() {
    console.log('Syncing missing profiles for existing users');
    try {
      // Get all users that don't have profiles
      const { data, error } = await supabase.rpc('sync_missing_profiles');
      
      if (error) {
        console.error('Error syncing missing profiles:', error);
        throw error;
      }

      console.log('Successfully synced missing profiles:', data);
      return { success: true, data };
    } catch (error) {
      console.error('Error in syncMissingProfiles:', error);
      throw error;
    }
  },

  generateReferralCode() {
    return 'REF' + Math.random().toString(36).substring(2, 8).toUpperCase();
  }
};
