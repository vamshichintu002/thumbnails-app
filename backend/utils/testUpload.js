import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { createClient } from '@supabase/supabase-js';
import sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';
import * as dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Debug: Log environment variables (redacted for security)
console.log('Supabase URL:', process.env.SUPABASE_URL ? 'Set' : 'Not set');
console.log('Supabase Service Key:', process.env.SUPABASE_SERVICE_KEY ? 'Set' : 'Not set');

// Initialize Supabase client with service role key
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

async function testUpload() {
  try {
    // Path to generated-images directory
    const generatedImagesDir = path.join(__dirname, '..', 'public', 'generated-images');
    
    // Get first image from the directory
    const files = await fs.readdir(generatedImagesDir);
    if (files.length === 0) {
      console.log('No images found in the directory');
      return;
    }

    const imageFile = files[0];
    const imagePath = path.join(generatedImagesDir, imageFile);
    console.log('Found image:', imagePath);

    // Convert to PNG if it's not already
    const timestamp = Date.now();
    const uuid = uuidv4();
    const pngBuffer = await sharp(imagePath)
      .png()
      .toBuffer();

    console.log('Converted to PNG, uploading to Supabase...');
    
    // Debug: Log upload details
    const fileName = `${timestamp}-${uuid}.png`;
    console.log('Upload path:', fileName);

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('thumbnails')
      .upload(fileName, pngBuffer, {
        contentType: 'image/png',
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.log('Upload error details:', uploadError);
      throw new Error(`Failed to upload to Supabase: ${uploadError.message}`);
    }

    console.log('Upload successful:', uploadData);

    // Get the public URL
    const { data: { publicUrl } } = supabase.storage
      .from('thumbnails')
      .getPublicUrl(fileName);

    console.log('Public URL:', publicUrl);
  } catch (error) {
    console.error('Error in test upload:', error);
  }
}

// Run the test
testUpload();
