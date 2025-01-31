import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '../services/supabase.js';

/**
 * Downloads an image and uploads directly to Supabase storage
 * @param {string} url - The URL of the image to download
 * @returns {Promise<string>} The public URL of the uploaded image
 */
export async function downloadImage(url) {
  try {
    // Download the image directly as buffer
    const response = await axios({
      url,
      responseType: 'arraybuffer'
    });

    // Generate unique filename
    const timestamp = Date.now();
    const uuid = uuidv4();
    const fileName = `${timestamp}-${uuid}.png`;
    
    // Upload directly to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('thumbnails')
      .upload(fileName, response.data, {
        contentType: 'image/png',
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      throw new Error(`Failed to upload to Supabase: ${uploadError.message}`);
    }

    // Get the public URL
    const { data: { publicUrl } } = supabase.storage
      .from('thumbnails')
      .getPublicUrl(fileName);

    return publicUrl;
  } catch (error) {
    console.error('Error processing image:', error);
    throw error;
  }
}
