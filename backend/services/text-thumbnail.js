import Replicate from "replicate";
import { supabase } from './supabase.js';
import dotenv from 'dotenv';
import fetch from 'node-fetch';

dotenv.config();

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

// Map frontend aspect ratios to image dimensions
const aspectRatioMap = {
  '16:9': { width: 1280, height: 720 },    // YouTube recommended dimensions
  '1:1': { width: 1080, height: 1080 },    // Square format
  '9:16': { width: 720, height: 1280 },    // Vertical video format
  '4:5': { width: 1080, height: 1350 }     // Instagram recommended
};

export const TextThumbnailService = {
  async generateThumbnail(userId, text, aspectRatio = '16:9') {
    try {
      // Check if user has enough credits
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('credits')
        .eq('id', userId)
        .single();

      if (profileError) throw profileError;
      if (!profile || profile.credits < 10) { 
        throw new Error('Insufficient credits');
      }

      // Get dimensions based on aspect ratio
      const dimensions = aspectRatioMap[aspectRatio] || aspectRatioMap['16:9'];

      // Create input for Replicate (using flux-schnell model)
      const input = {
        prompt: text,
        width: dimensions.width,
        height: dimensions.height
      };

      // Generate image using Replicate
      const output = await replicate.run(
        "black-forest-labs/flux-schnell",
        { input }
      );

      if (!output || !output[0]) {
        throw new Error('Failed to generate image');
      }

      // Fetch the image data from the URL
      const imageUrl = output[0];
      const imageResponse = await fetch(imageUrl);
      const imageBuffer = await imageResponse.buffer();

      // Upload the generated image to Supabase Storage
      const fileName = `${userId}/${Date.now()}_text_generated.png`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('thumbnails')
        .upload(fileName, imageBuffer, {
          contentType: 'image/png',
          cacheControl: '3600'
        });

      if (uploadError) throw uploadError;

      // Get the public URL of the uploaded image
      const { data: { publicUrl } } = supabase.storage
        .from('thumbnails')
        .getPublicUrl(fileName);

      // Create generation record
      const { data: generationData, error: generationError } = await supabase
        .from('generations')
        .insert({
          profile_id: userId,
          generation_type: 'text_to_thumbnail',
          output_image_url: publicUrl,
          credit_cost: 10  
        })
        .select()
        .single();

      if (generationError) throw generationError;

      // Deduct credits from user's profile
      const { error: creditError } = await supabase
        .from('profiles')
        .update({ credits: profile.credits - 10 })  
        .eq('id', userId);

      if (creditError) throw creditError;

      return generationData;
    } catch (error) {
      console.error('Error in generateThumbnail:', error);
      throw error;
    }
  }
};
