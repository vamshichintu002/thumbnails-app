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
  },

  async logGeneration(userId, generationType, outputImageUrl, creditCost) {
    console.log('Starting logGeneration with:', {
      userId,
      generationType,
      outputImageUrl,
      creditCost
    });

    try {
      // First, deduct credits
      console.log('Attempting to deduct credits:', creditCost);
      await this.deductCredits(userId, creditCost);
      console.log('Credits deducted successfully');

      // Prepare generation data
      const generationData = {
        profile_id: userId,
        generation_type: generationType,
        output_image_url: outputImageUrl,
        credit_cost: creditCost,
        created_at: new Date().toISOString()
      };
      console.log('Generation data to insert:', generationData);

      // Then, log the generation
      const { data, error } = await supabase
        .from('generations')
        .insert(generationData)
        .select()
        .single();

      if (error) {
        console.error('Supabase error while logging generation:', error);
        throw error;
      }

      console.log('Generation logged successfully:', data);
      return data;
    } catch (error) {
      console.error('Error in logGeneration:', error);
      throw error;
    }
  },

  async getGenerationHistory(userId) {
    console.log('Fetching generation history for user:', userId);
    try {
      const { data, error } = await supabase
        .from('generations')
        .select(`
          id,
          generation_type,
          output_image_url,
          credit_cost,
          created_at
        `)
        .eq('profile_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching generation history:', error);
      throw error;
    }
  },

  async initializeGenerationTypes() {
    console.log('Initializing generation types');
    try {
      // First check if types already exist
      const { data: existingTypes, error: checkError } = await supabase
        .from('generation_types')
        .select('type_key');

      if (checkError) {
        console.error('Error checking existing types:', checkError);
        throw checkError;
      }

      if (existingTypes && existingTypes.length > 0) {
        console.log('Generation types already exist:', existingTypes);
        return;
      }

      // Insert default generation types
      const types = [
        {
          type_key: 'text_to_thumbnail',
          display_name: 'Text to Thumbnail',
          cost_credits: 10
        },
        {
          type_key: 'image_to_thumbnail',
          display_name: 'Image to Thumbnail',
          cost_credits: 15
        },
        {
          type_key: 'youtube_to_thumbnail',
          display_name: 'YouTube to Thumbnail',
          cost_credits: 20
        }
      ];

      console.log('Inserting generation types:', types);
      const { data, error } = await supabase
        .from('generation_types')
        .insert(types)
        .select();

      if (error) {
        console.error('Error inserting generation types:', error);
        throw error;
      }

      console.log('Generation types initialized:', data);
      return data;
    } catch (error) {
      console.error('Error in initializeGenerationTypes:', error);
      throw error;
    }
  },

  // Upload user image and store URL
  async uploadUserImage(userId, file) {
    if (!userId || !file) {
      throw new Error('User ID and file are required for image upload');
    }

    try {
      // Generate a unique file name
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/${Date.now()}.${fileExt}`;

      // Upload file to user_store bucket
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('user_store')
        .upload(fileName, file);

      if (uploadError) {
        console.error('Error uploading image:', uploadError);
        throw uploadError;
      }

      // Get the public URL for the uploaded file
      const { data: { publicUrl } } = supabase.storage
        .from('user_store')
        .getPublicUrl(fileName);

      // Store the URL in user_images table
      const { data: imageData, error: dbError } = await supabase
        .from('user_images')
        .insert({
          user_id: userId,
          image_url: publicUrl,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (dbError) {
        console.error('Error storing image URL:', dbError);
        throw dbError;
      }

      return imageData;
    } catch (error) {
      console.error('Error in uploadUserImage:', error);
      throw error;
    }
  },
};

export { DatabaseService };
