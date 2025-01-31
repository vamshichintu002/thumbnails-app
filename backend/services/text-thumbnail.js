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
              content: 'You are a thumbnail generation expert. You need to generate a prompt for a YouTube thumbnail.'
          },
          {
              role: 'user',
              content: `Generate a YouTube thumbnail description for the title: "${userText}". Key elements: 
              1. **Title**: Prominently feature in bold, large white text at the top. 
              2. **Central Figure**: Show a confident figure engaging with relevant objects or tech. 
              3. **Background**: Use a vibrant gradient with tech patterns and subtle glowing effects. 
              4. **Accents**: Add optional emojis or icons to enhance energy. 
              5. **Layout**: Ensure a clean, balanced design focused on readability.`
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
        num_inference_steps: 15,
        image: referenceImage
      })
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Nebius AI API error: ${response.status} ${text}`);
    }

    const data = await response.json();
    console.log('Successfully generated image with Nebius AI');
    return data;
  } catch (error) {
    console.error('Error generating image with Nebius AI:', error);
    throw error;
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