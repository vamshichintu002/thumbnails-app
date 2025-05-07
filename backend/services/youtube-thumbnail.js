import Replicate from "replicate";
import { supabase } from './supabase.js';
import dotenv from 'dotenv';
import fetch from 'node-fetch';
import axios from 'axios';

dotenv.config();

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

// YouTube URL pattern
const YOUTUBE_URL_PATTERN = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;

// Groq prompts for different cases
const GROQ_PROMPTS = {
  style: (videoTitle) => `You have a reference YouTube thumbnail image and a new video title: "${videoTitle}".
Analyze the reference image for:
• Color palette (dominant colors, gradients)
• Composition (where key elements are placed)
• Typography (font style, size, alignment)
• Overall mood (fun, serious, energetic, etc.)

Now generate a single, concise text prompt that will help an image-generation model replicate the **same style** as the reference thumbnail. 

Key requirements:
1. Maintain similar color palette, composition layout, and typography style.
2. Include the new title "${videoTitle}" as the main text in the thumbnail.
3. The prompt must be suitable for a 16:9 YouTube thumbnail.
4. The description should briefly mention the desired lighting or atmosphere if relevant (e.g., "bright and energetic," "dramatic shadows," etc.).
5. Keep the prompt under 60 words if possible.

Provide **only** the final text prompt to be sent to the image-generation model.`,

  recreate: () => `"Analyze this YouTube thumbnail and describe its visual style, composition, and key elements. What are the dominant colors, textures, and overall aesthetic? How are the elements arranged and positioned? What are the key themes or messages conveyed through the visual elements?
`};

// Map frontend aspect ratios to image dimensions
const aspectRatioMap = {
  '16:9': { width: 1280, height: 720 },    // YouTube recommended dimensions
  '1:1': { width: 1080, height: 1080 },    // Square format
  '9:16': { width: 720, height: 1280 },    // Vertical video format
  '4:5': { width: 1080, height: 1350 }     // Instagram recommended
};

async function analyzeImageWithGroq(imageUrl, prompt, videoTitle) {
  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'meta-llama/llama-4-maverick-17b-128e-instruct',
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: prompt(videoTitle) },
              { type: 'image_url', image_url: { url: imageUrl } }
            ]
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
    console.error('Error analyzing image with Groq:', error);
    throw error;
  }
}

async function generateImageWithReplicate(prompt, { width, height }, referenceImage = null) {
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
          output_format: "webp",
          image: referenceImage
        }
      }
    );

    if (!output || !output[0]) {
      throw new Error('Failed to generate image with Replicate');
    }

    return { data: [{ url: output[0] }] };
  } catch (error) {
    console.error('Error generating image with Replicate:', error);
    throw error;
  }
}

async function generateImageWithNebiusAI(prompt, { width, height }, referenceImage = null) {
  try {
    console.log('Generating image with Nebius AI:', { prompt, width, height });

    // Create a promise that rejects after 30 seconds
    const timeout = new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error('Nebius AI timeout after 30 seconds'));
      }, 20000);  // 30000 milliseconds = 30 seconds
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
      return await generateImageWithReplicate(prompt, { width, height }, referenceImage);
    }

  } catch (error) {
    console.error('Error in generateImageWithNebiusAI:', error);
    return await generateImageWithReplicate(prompt, { width, height }, referenceImage);
  }
}

async function uploadToSupabase(imageUrl, userId) {
  try {
    console.log('Downloading image from URL:', imageUrl);
    // Download image from URL directly as buffer
    const response = await axios({
      url: imageUrl,
      responseType: 'arraybuffer'
    });

    // Generate unique filename with timestamp and random string
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(7);
    const filename = `${userId}/youtube_thumbnail_${timestamp}_${randomString}.png`;

    console.log('Uploading to Supabase storage:', filename);
    // Upload directly to Supabase storage from memory buffer
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('thumbnails')
      .upload(filename, response.data, {
        contentType: 'image/png',
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error('Error uploading to Supabase:', uploadError);
      throw uploadError;
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('thumbnails')
      .getPublicUrl(filename);

    console.log('Successfully uploaded to Supabase:', publicUrl);
    return publicUrl;
  } catch (error) {
    console.error('Error in uploadToSupabase:', error);
    throw error;
  }
}

export const YoutubeThumbnailService = {
  async generateThumbnail(userId, youtubeUrl, videoTitle, generationOption, aspectRatio = '16:9', referenceImageUrl = null) {
    try {
      // Validate required fields
      if (!youtubeUrl || !videoTitle) {
        throw new Error('YouTube URL and video title are required');
      }

      // Check if user has enough credits
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('credits')
        .eq('id', userId)
        .single();

      if (profileError) throw profileError;
      if (!profile || profile.credits < 20) {
        throw new Error('Insufficient credits (20 credits required)');
      }

      // Extract YouTube video ID
      const videoId = youtubeUrl.match(YOUTUBE_URL_PATTERN)?.[1];
      if (!videoId) {
        throw new Error('Invalid YouTube URL');
      }

      // Get YouTube thumbnail URL
      const youtubeThumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;

      // Get dimensions based on aspect ratio
      const dimensions = aspectRatioMap[aspectRatio] || aspectRatioMap['16:9'];

      let generatedImageUrl;
      if (referenceImageUrl) {
        // Case 3: With user photo - always use style analysis regardless of generation option
        const imageAnalysis = await analyzeImageWithGroq(youtubeThumbnailUrl, GROQ_PROMPTS.style, videoTitle);
        
        const replicateOutput = await replicate.run(
          "bytedance/flux-pulid:8baa7ef2255075b46f4d91cd238c21d31181b3e6a864463f967960bb0112525b",
          {
            input: {
              prompt: `${imageAnalysis}`,
              image: youtubeThumbnailUrl,
              main_face_image: referenceImageUrl,
              num_outputs: 1,
              width: dimensions.width,
              height: dimensions.height,
              negative_prompt: "bad quality, worst quality, text, signature, watermark, extra limbs,"
            }
          }
        );
        
        if (!replicateOutput || !replicateOutput[0]) {
          throw new Error('Failed to generate thumbnail');
        }
        generatedImageUrl = replicateOutput[0];
      } else {
        // Case 1 & 2: Without user photo - Use Nebius AI with fallback to Replicate
        const groqPrompt = GROQ_PROMPTS[generationOption] || GROQ_PROMPTS.style;
        const imageAnalysis = await analyzeImageWithGroq(youtubeThumbnailUrl, groqPrompt, videoTitle);
        
        const result = await generateImageWithNebiusAI(
          ` ${imageAnalysis}`,
          dimensions,
          youtubeThumbnailUrl
        );
        
        if (!result || !result.data?.[0]?.url) {
          throw new Error('Failed to generate thumbnail');
        }
        generatedImageUrl = result.data[0].url;
      }

      // Upload generated image to Supabase and get public URL
      const outputImageUrl = await uploadToSupabase(generatedImageUrl, userId);

      // Create generation record
      const { data: generationData, error: generationError } = await supabase
        .from('generations')
        .insert({
          profile_id: userId,
          generation_type: 'youtube_to_thumbnail',
          output_image_url: outputImageUrl,
          credit_cost: 20,
          metadata: {
            youtubeUrl,
            videoTitle,
            generationOption,
            aspectRatio
          }
        })
        .select()
        .single();

      if (generationError) throw generationError;

      // Deduct credits
      const { error: creditError } = await supabase
        .from('profiles')
        .update({ credits: profile.credits - 20 })
        .eq('id', userId);

      if (creditError) throw creditError;

      return generationData;
    } catch (error) {
      console.error('Error in generateYoutubeThumbnail:', error);
      throw error;
    }
  }
};