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

async function enhancePromptWithGroq(userPrompt, gender) {
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
            content: `Must include a person that is ${gender} in the prompt making the thumbnail prompt
            `
  
          },
          {
            role: 'user',
            content: `enhance the following prompt: ${userPrompt} you must include a ${gender} person in that thumbnail prompt.
`
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
    // Return original prompt if enhancement fails
    return userPrompt;
  }
}

export const ImageThumbnailService = {
  async generateThumbnail(userId, prompt, referenceImageUrl = null, aspectRatio = '16:9', gender = 'male') {
    try {
      // Check if user has enough credits
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('credits')
        .eq('id', userId)
        .single();

      if (profileError) throw profileError;
      if (!profile || profile.credits < 20) {
        throw new Error('Insufficient credits');
      }

      // Enhance the prompt using Groq
      const enhancedPrompt = await enhancePromptWithGroq(prompt, gender);

      // Get dimensions based on aspect ratio
      const dimensions = aspectRatioMap[aspectRatio] || aspectRatioMap['16:9'];

      // Create input for Replicate
      const input = {
        prompt: enhancedPrompt,
        start_step: 3,
        num_outputs: 1,
        output_format: 'png',
        negative_prompt: "bad quality, worst quality, text, signature, watermark, extra limbs",
        width: dimensions.width,
        height: dimensions.height
      };

      if (!referenceImageUrl) {
        throw new Error('Please select a reference image');
      }

      // Add reference image if provided
      if (referenceImageUrl) {
        input.main_face_image = referenceImageUrl;
      }

      // Generate image using Replicate
      const output = await replicate.run(
        "bytedance/flux-pulid:8baa7ef2255075b46f4d91cd238c21d31181b3e6a864463f967960bb0112525b",
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
      const fileName = `${userId}/${Date.now()}_generated.png`;
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
          generation_type: 'image_to_thumbnail',
          output_image_url: publicUrl,
          credit_cost: 20
        })
        .select()
        .single();

      if (generationError) throw generationError;

      // Deduct credits from user's profile
      const { error: creditError } = await supabase
        .from('profiles')
        .update({ credits: profile.credits - 20 })
        .eq('id', userId);

      if (creditError) throw creditError;

      return generationData;
    } catch (error) {
      console.error('Error in generateThumbnail:', error);
      throw error;
    }
  }
};
