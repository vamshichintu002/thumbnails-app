import axios from 'axios';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '../services/supabase.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Ensure the temp directory exists
const tempDir = path.join(__dirname, '..', 'temp');
fs.ensureDirSync(tempDir);

/**
 * Downloads an image, converts it to PNG, and uploads to Supabase storage
 * @param {string} url - The URL of the image to download
 * @returns {Promise<string>} The public URL of the uploaded image
 */
export async function downloadImage(url) {
  try {
    // Download the image
    const response = await axios({
      url,
      responseType: 'arraybuffer'
    });

    // Generate unique filename
    const timestamp = Date.now();
    const uuid = uuidv4();
    const fileName = `${timestamp}-${uuid}.png`;
    
    // Convert to PNG using sharp
    const pngBuffer = await sharp(response.data)
      .png()
      .toBuffer();

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('thumbnails')
      .upload(fileName, pngBuffer, {
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
