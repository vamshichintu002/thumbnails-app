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
  style: "Analyze this YouTube thumbnail and describe its visual style, composition, and key elements. What are the dominant colors, textures, and overall aesthetic? How are the elements arranged and positioned? What are the key themes or messages conveyed through the visual elements?",
  recreate: "Analyze this YouTube thumbnail and provide a creative, detailed description that would help in generating a new, unique thumbnail while keeping the main theme. Focus on the visual style, composition, and key elements."
};

// Map frontend aspect ratios to image dimensions
const aspectRatioMap = {
  '16:9': { width: 1280, height: 720 },    // YouTube recommended dimensions
  '1:1': { width: 1080, height: 1080 },    // Square format
  '9:16': { width: 720, height: 1280 },    // Vertical video format
  '4:5': { width: 1080, height: 1350 }     // Instagram recommended
};

async function analyzeImageWithGroq(imageUrl, prompt) {
  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.2-11b-vision-preview',
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: prompt },
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

async function generateImageWithNebiusAI(prompt, { width, height }, referenceImage = null) {
  try {
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

// Initialize generation in database and return immediately
async function initializeGeneration(userId, youtubeUrl, videoTitle, generationOption) {
  const { data, error } = await supabase
    .from('thumbnail_generations')
    .insert([{
      user_id: userId,
      youtube_url: youtubeUrl,
      video_title: videoTitle,
      generation_option: generationOption,
      status: 'pending',
      generation_type: 'youtube_to_thumbnail'
    }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Update generation status
async function updateGenerationStatus(id, status, resultUrl = null, errorMessage = null) {
  const { error } = await supabase
    .from('thumbnail_generations')
    .update({
      status,
      result_url: resultUrl,
      error_message: errorMessage,
      updated_at: new Date().toISOString()
    })
    .eq('id', id);

  if (error) throw error;
}

async function generateThumbnail(userId, youtubeUrl, videoTitle, generationOption, referenceImageUrl = null, aspectRatio = '16:9') {
  // Initialize generation record
  const generation = await initializeGeneration(userId, youtubeUrl, videoTitle, generationOption);

  // Start async processing
  (async () => {
    try {
      await updateGenerationStatus(generation.id, 'processing');

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
        const imageAnalysis = await analyzeImageWithGroq(youtubeThumbnailUrl, GROQ_PROMPTS.style);
        
        const replicateOutput = await replicate.run(
          "bytedance/flux-pulid:8baa7ef2255075b46f4d91cd238c21d31181b3e6a864463f967960bb0112525b",
          {
            input: {
              prompt: `${imageAnalysis} Create a professional YouTube thumbnail for "${videoTitle}" incorporating these style elements and the person from the reference image. Ensure high quality, engaging composition, and vibrant colors.`,
              image: youtubeThumbnailUrl,
              main_face_image: referenceImageUrl,
              num_outputs: 1,
              width: dimensions.width,
              height: dimensions.height,
              negative_prompt: "bad quality, worst quality, text, signature, watermark, extra limbs"
            }
          }
        );
        
        if (!replicateOutput || !replicateOutput[0]) {
          throw new Error('Failed to generate thumbnail');
        }
        generatedImageUrl = replicateOutput[0];
      } else {
        // Case 1 & 2: Without user photo - Use Nebius AI
        const groqPrompt = GROQ_PROMPTS[generationOption] || GROQ_PROMPTS.style;
        const imageAnalysis = await analyzeImageWithGroq(youtubeThumbnailUrl, groqPrompt);
        
        const result = await generateImageWithNebiusAI(
          `${imageAnalysis} Create a YouTube thumbnail for "${videoTitle}"`,
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

      // Update status with success
      await updateGenerationStatus(generation.id, 'completed', outputImageUrl);
    } catch (error) {
      console.error('Generation error:', error);
      await updateGenerationStatus(generation.id, 'failed', null, error.message);
    }
  })().catch(console.error);

  // Return immediately with generation ID
  return {
    generationId: generation.id,
    status: 'pending'
  };
}

export const YoutubeThumbnailService = {
  generateThumbnail
};
