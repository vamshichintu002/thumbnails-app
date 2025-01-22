import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Initialize Supabase client with service key
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

const DatabaseService = {
  // Profile Management
  async createProfile(user) {
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

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching profile:', error);
      throw error;
    }
  },

  async updateProfile(userId, updates) {
    console.log('Updating profile for user:', userId, updates);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  },

  async deductCredits(userId, amount) {
    console.log('Deducting credits for user:', userId, 'amount:', amount);
    try {
      const { data: profile, error: fetchError } = await supabase
        .from('profiles')
        .select('credits')
        .eq('id', userId)
        .single();

      if (fetchError) throw fetchError;

      if (profile.credits < amount) {
        throw new Error('Insufficient credits');
      }

      const { data, error: updateError } = await supabase
        .from('profiles')
        .update({
          credits: profile.credits - amount,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        .select()
        .single();

      if (updateError) throw updateError;
      return data;
    } catch (error) {
      console.error('Error deducting credits:', error);
      throw error;
    }
  },

  async addCredits(userId, amount) {
    console.log('Adding credits for user:', userId, 'amount:', amount);
    try {
      const { data: profile, error: fetchError } = await supabase
        .from('profiles')
        .select('credits')
        .eq('id', userId)
        .single();

      if (fetchError) throw fetchError;

      const { data, error: updateError } = await supabase
        .from('profiles')
        .update({
          credits: profile.credits + amount,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        .select()
        .single();

      if (updateError) throw updateError;
      return data;
    } catch (error) {
      console.error('Error adding credits:', error);
      throw error;
    }
  }
};

export { DatabaseService };
