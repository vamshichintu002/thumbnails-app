import { supabase } from './supabase.js';
import dotenv from 'dotenv';
import fetch from 'node-fetch';
import Replicate from "replicate";

dotenv.config();
const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

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
              content: ' '
          },
          {
              role: 'user',
              content: `Generate a detailed YouTube thumbnail GENERATE PROMPT based on the following video title: ${userText}. Instructions: Title Integration: Ensure the video title is prominently featured in a bold, dynamic font that matches the theme of the content. Instead of just plain white text, the font should be stylized with colors, shadows, gradients, or textures that enhance readability and visual impact text at the top of the thumbnail. If the topic is intense, use metallic, grunge, or fiery effects; for tech-related content, use glowing neon or futuristic fonts; for mystery or documentary themes, use bold serif or stencil fonts with a cinematic effect. fmain - Central Figure: Include a central figure in a confident and engaging pose, interacting with relevant objects or technology related to the video title. Background Elements: Design a vibrant background with a gradient transitioning from one color to another, incorporating tech-inspired patterns, icons, and subtle glowing effects that relate to the video title. Visual Accents: Include optional visual accents like emojis, icons, or glowing elements to enhance the overall theme and energy of the thumbnail. Professional Layout: Ensure the layout is clean, balanced, and visually appealing, with a focus on readability and professionalism. DONT INCUDE " The design will be optimized for YouTube thumbnail dimensions (1280 x 720 pixels) and will not exceed 6000 characters." IN OUTPUT Strictly ensure that the final output does not exceed 6000 characters while following these instructions precisely.`
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

async function generateImageWithReplicate(prompt, { width, height }) {
  try {
    console.log('Generating image with Replicate fallback:', { prompt, width, height });
    
    // Calculate aspect ratio for Replicate
    let aspectRatio = width === 1280 && height === 720 ? "16:9" : "9:16";
    
    const output = await replicate.run(
      "bytedance/hyper-flux-8step:81946b1e09b256c543b35f37333a30d0d02ee2cd8c4f77cd915873a1ca622bad",
      {
        input: {
          prompt,
          aspect_ratio: aspectRatio,
          num_outputs: 1,
          guidance_scale: 3.5,
          num_inference_steps: 30,
          output_format: "webp"
        }
      }
    );

    if (!output || !output[0]) {
      throw new Error('Failed to generate image with Replicate');
    }

    // Fetch the image data
    const imageResponse = await fetch(output[0]);
    if (!imageResponse.ok) {
      throw new Error('Failed to fetch generated image from Replicate');
    }

    return { data: [{ url: output[0] }] };
  } catch (error) {
    console.error('Error generating image with Replicate:', error);
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

    // Create a promise that rejects after 30 seconds
    const timeout = new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error('Nebius AI timeout after 30 seconds'));
      }, 30000);
    });

    // Create the Nebius AI request promise
    const nebiusRequest = async () => {
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
          num_inference_steps: 30,
          image: referenceImage
        })
      });

      if (!response.ok) {
        throw new Error('Nebius AI failed to generate image');
      }

      const data = await response.json();
      if (!data || !data.data?.[0]?.url) {
        throw new Error('Nebius AI returned invalid data');
      }

      return data;
    };

    // Race between the timeout and the actual request
    try {
      const result = await Promise.race([nebiusRequest(), timeout]);
      console.log('Successfully generated image with Nebius AI');
      return result;
    } catch (error) {
      if (error.message.includes('timeout')) {
        console.log('Nebius AI timed out after 30 seconds, falling back to Replicate');
      } else {
        console.log('Nebius AI failed:', error.message);
      }
      return await generateImageWithReplicate(prompt, { width, height });
    }

  } catch (error) {
    console.error('Error in generateImageWithNebiusAI:', error);
    return await generateImageWithReplicate(prompt, { width, height });
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