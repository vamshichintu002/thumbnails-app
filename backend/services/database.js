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
  async createProfile(userId, referralCode = null) {
    console.log('Creating new profile for user:', userId);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          credits: 50,
          referral_code: referralCode || this.generateReferralCode(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
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
    console.log('Syncing profile for user:', user.id);
    try {
      // First, try to get existing profile
      const { data: existingProfile, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (fetchError && fetchError.code === 'PGRST116') {
        // Profile doesn't exist, create it
        console.log('No profile found, creating new profile');
        return await this.createProfile(user.id);
      } else if (fetchError) {
        // Other error occurred
        console.error('Error checking profile:', fetchError);
        throw fetchError;
      }

      // Profile exists, update timestamp
      console.log('Updating existing profile');
      const { data, error: updateError } = await supabase
        .from('profiles')
        .update({
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

  // Generation Management
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

  // User Images Management
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

  // Credits Management
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

  // Referral Management
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

  generateReferralCode() {
    return 'REF' + Math.random().toString(36).substring(2, 8).toUpperCase();
  }
};
