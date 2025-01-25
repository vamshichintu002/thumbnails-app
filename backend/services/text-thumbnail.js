import { supabase } from './supabase.js';
import dotenv from 'dotenv';
import fetch from 'node-fetch';

dotenv.config();

// Direct API call to Nebius AI
async function generateImageWithNebiusAI(prompt, { width, height }) {
  const response = await fetch('https://api.studio.nebius.ai/v1/images/generations', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.NEBIUS_API_KEY}`
    },
    body: JSON.stringify({
      prompt,
      model: "black-forest-labs/flux-schnell",
      n: 1,
      width,
      height,
      response_extension: "webp",
      num_inference_steps: 15
    })
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Nebius AI API error: ${response.status} ${text}`);
  }

  const data = await response.json();
  return data;
}

// Map frontend aspect ratios to dimensions
const aspectRatioMap = {
  '16:9': { width: 1280, height: 720 },  // Standard YouTube thumbnail size
  '9:16': { width: 720, height: 1280 }   // Vertical video thumbnail size
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

      // Validate aspect ratio
      if (!aspectRatioMap[aspectRatio]) {
        throw new Error(`Invalid aspect ratio: ${aspectRatio}. Supported ratios are: ${Object.keys(aspectRatioMap).join(', ')}`);
      }

      const dimensions = aspectRatioMap[aspectRatio];
      console.log('Generating with input:', { prompt: text, ...dimensions });

      // Generate image using Nebius AI
      const result = await generateImageWithNebiusAI(text, dimensions);
      
      if (!result || !result.data?.[0]?.url) {
        throw new Error('Failed to generate image');
      }

      // Fetch the image data from the URL
      const imageUrl = result.data[0].url;
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
