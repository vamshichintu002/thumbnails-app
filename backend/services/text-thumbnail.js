import { supabase } from './supabase.js';
import dotenv from 'dotenv';
import fetch from 'node-fetch';

dotenv.config();
async function enhancePromptWithGroq(userText) {
  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile', 
        messages: [
          {
              role: 'system',
              content: 'Strictly ensure the total response does not exceed 1900 characters while maintaining all requested details'
          },
          {
              role: 'user',
              content: `A highly detailed and vivid thumbnail illustration featuring [main subject description]. The main subject is [detailed description of the subject, including physical features, attire, and key actions or postures]. The environment is [description of the surroundings, atmosphere, or background with key elements and visual style]. The lighting is [description of the lighting setup, highlighting the mood or dramatic effect]. The composition is [how the subject is placed in the frame, perspective, and any dynamic elements involved]. The title '${userText}' is placed [description of how the title is incorporated into the image, e.g., in bold typography or a creative arrangement]. The style is [description of the artistic style, such as realism, cyberpunk, fantasy, etc.], evoking a sense of [mood or emotion]. Strictly ensure the total response does not exceed 1900 characters while maintaining all requested details. Title Input: "${userText}"`
          }
      ],
      
        temperature: 1,
        max_tokens: 1024,
        top_p: 1,
        stream: false
      })
    });

    if (!response.ok) {
      throw new Error(`Groq API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('Error enhancing prompt with Groq:', error);
    throw error;
  }
}

async function generateImageWithNebiusAI(prompt, { width, height }, referenceImage = null) {
  try {
    // Ensure prompt doesn't exceed length limit
    if (prompt.length > 2000) {
      prompt = prompt.substring(0, 1997) + "...";
    }
    
    console.log('Generating image with Nebius AI:', { prompt, width, height });
    const response = await fetch('https://api.studio.nebius.ai/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.NEBIUS_API_KEY}`
      },
      body: JSON.stringify({
        prompt,
        model: "black-forest-labs/flux-dev",
        n: 1,
        width,
        height,
        response_extension: "webp",
        num_inference_steps: 25,
        image: referenceImage
      })
    });

    if (!response.ok) {
      throw new Error('Something went wrong. Please try again');
    }

    const data = await response.json();
    console.log('Successfully generated image with Nebius AI');
    return data;
  } catch (error) {
    console.error('Error generating image with Nebius AI:', error);
    throw new Error('Something went wrong. Please try again');
  }
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

      // Enhance prompt using Groq
      const enhancedPrompt = await enhancePromptWithGroq(text);

      // Generate image using Nebius AI
      const result = await generateImageWithNebiusAI(enhancedPrompt, dimensions);
      
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