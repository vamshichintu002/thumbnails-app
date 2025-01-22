import { supabase } from '../services/supabase.js';
import Replicate from 'replicate';
import { downloadImage } from '../utils/imageUtils.js';

const replicate = new Replicate({
  auth: process.env.VITE_REPLICATE_API_TOKEN,
});

export const generateThumbnail = async (req, res) => {
  const { userId, generationType, title, imageText, youtubeUrl, aspectRatio = "16:9" } = req.body;

  try {
    // 1. Fetch user's current credits
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('credits')
      .eq('id', userId)
      .single();

    if (profileError) {
      console.error('Profile error:', profileError);
      return res.status(400).json({ error: 'User profile not found.' });
    }

    // 2. Fetch the cost of the selected generation type
    const { data: genType, error: genTypeError } = await supabase
      .from('generation_types')
      .select('cost_credits')
      .eq('type_key', generationType)
      .single();

    if (genTypeError) {
      console.error('Generation type error:', genTypeError);
      return res.status(400).json({ error: 'Invalid generation type.' });
    }

    const cost = genType.cost_credits;

    // 3. Check if the user has enough credits
    if (profile.credits < cost) {
      return res.status(400).json({ error: 'Insufficient credits.' });
    }

    // 4. Deduct credits from the user's profile
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ credits: profile.credits - cost })
      .eq('id', userId);

    if (updateError) {
      console.error('Update credits error:', updateError);
      return res.status(400).json({ error: 'Failed to update credits.' });
    }

    // 5. Generate the thumbnail using Replicate
    let prompt = '';
    let input = {
      num_outputs: 1,
      width: 1280,
      height: 720,
      aspect_ratio: aspectRatio
    };

    switch (generationType) {
      case 'text_to_thumbnail':
        prompt = `YouTube thumbnail for video titled "${title}", professional, high quality, engaging, 4K resolution, vibrant colors`;
        break;
      case 'image_to_thumbnail':
        prompt = `YouTube thumbnail based on the image with text: "${imageText}", professional, high quality, engaging, 4K resolution, vibrant colors`;
        input.image = imageText; // assuming imageText is the image URL in this case
        break;
      case 'youtube_to_thumbnail':
        prompt = `YouTube thumbnail based on video: "${youtubeUrl}", professional, high quality, engaging, 4K resolution, vibrant colors`;
        break;
      default:
        return res.status(400).json({ error: 'Invalid generation type.' });
    }

    input.prompt = prompt;
    console.log('Calling Replicate with input:', input);

    const output = await replicate.run(
      "black-forest-labs/flux-schnell",
      { input }
    );

    if (!output || !Array.isArray(output) || output.length === 0) {
      throw new Error('No valid images in API response');
    }

    // 6. Download and save the generated image
    const localUrls = await Promise.all(output.map(url => downloadImage(url)));
    const generatedImageUrl = localUrls[0]; // This will now be a Supabase storage URL

    // 7. Store the generation record in the 'generations' table with the Supabase URL
    const { error: insertError } = await supabase
      .from('generations')
      .insert({
        profile_id: userId,
        generation_type: generationType,
        output_image_url: generatedImageUrl,
        credit_cost: cost,
        created_at: new Date().toISOString()
      });

    if (insertError) {
      console.error('Insert generation error:', insertError);
      return res.status(400).json({ error: 'Failed to record generation.' });
    }

    // 8. Respond with the generated image URL and metadata
    res.status(200).json({
      success: true,
      images: localUrls, // These will now be Supabase storage URLs
      metadata: {
        model: "black-forest-labs/flux-schnell",
        width: 1280,
        height: 720,
        aspect_ratio: aspectRatio
      }
    });
  } catch (error) {
    console.error('Unexpected error in generateThumbnail:', error);
    res.status(500).json({ 
      success: false,
      error: error.message || 'An unexpected error occurred.' 
    });
  }
};
