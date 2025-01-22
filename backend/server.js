import express from 'express';
import cors from 'cors';
import Replicate from 'replicate';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import axios from 'axios';
import fs from 'fs-extra';
import path from 'path';
import { DatabaseService } from './services/database.js';
import { AuthService } from './services/auth.js';
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

const app = express();
const port = 3001;

// Ensure the generated-images directory exists
const publicDir = path.join(__dirname, 'public');
const generatedImagesDir = path.join(publicDir, 'generated-images');
fs.ensureDirSync(publicDir);
fs.ensureDirSync(generatedImagesDir);

app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use('/public', express.static('public'));

const replicate = new Replicate({
  auth: process.env.VITE_REPLICATE_API_TOKEN,
});

async function downloadImage(url) {
  try {
    const response = await axios({
      url,
      responseType: 'arraybuffer'
    });

    const timestamp = Date.now();
    const filename = `thumbnail-${timestamp}.webp`;
    const filepath = path.join(generatedImagesDir, filename);
    
    await fs.writeFile(filepath, response.data);
    return `/public/generated-images/${filename}`;
  } catch (error) {
    console.error('Error downloading image:', error);
    throw error;
  }
}

// Function to call Groq API for image analysis
async function analyzeImageWithGroq(imageUrl) {
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
              { type: 'text', text: "Analyze this YouTube thumbnail and provide a creative, detailed description that would help in generating a new, unique thumbnail while keeping the main theme. Focus on the visual style, composition, and key elements." },
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

app.post('/api/generate-thumbnail', async (req, res) => {
  try {
    const { title, userId } = req.body;
    
    // Check credits and get generation cost
    const generationType = 'text_to_thumbnail';
    const creditCost = 10; // This should come from generation_types table

    // Generate the image
    const output = await replicate.run(
      "black-forest-labs/flux-schnell",
      {
        input: {
          prompt: `YouTube thumbnail for video titled "${title}", professional, high quality, engaging, 4K resolution, vibrant colors`,
          num_outputs: 1,
          width: 1280,
          height: 720,
          aspect_ratio: "16:9"
        }
      }
    );

    if (!output || !Array.isArray(output) || output.length === 0) {
      throw new Error('No valid images in API response');
    }

    // Download all images and get local URLs
    const localUrls = await Promise.all(output.map(url => downloadImage(url)));

    // Log the generation in database
    await DatabaseService.logGeneration(userId, generationType, localUrls[0], creditCost);

    res.json({
      success: true,
      images: localUrls,
      metadata: {
        model: "black-forest-labs/flux-schnell",
        width: 1280,
        height: 720,
        aspect_ratio: "16:9"
      }
    });

  } catch (error) {
    console.error('Error generating thumbnail:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Failed to generate thumbnail' 
    });
  }
});

// Handle image-based thumbnail generation
app.post('/api/generate-from-image', async (req, res) => {
  try {
    const { imageText, imageUrl } = req.body;
    
    const output = await replicate.run(
      "black-forest-labs/flux-schnell",
      {
        input: {
          prompt: `YouTube thumbnail based on the image with text: "${imageText}", professional, high quality, engaging, 4K resolution, vibrant colors`,
          image: imageUrl,
          num_outputs: 1,
          width: 1280,
          height: 720,
          aspect_ratio: "16:9"
        }
      }
    );

    if (!output || !Array.isArray(output) || output.length === 0) {
      throw new Error('No valid images in API response');
    }

    const localUrls = await Promise.all(output.map(url => downloadImage(url)));

    res.json({
      success: true,
      images: localUrls,
      metadata: {
        model: "black-forest-labs/flux-schnell",
        width: 1280,
        height: 720,
        aspect_ratio: "16:9"
      }
    });

  } catch (error) {
    console.error('Error generating thumbnail from image:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Failed to generate thumbnail from image' 
    });
  }
});

// Handle YouTube-based thumbnail generation
app.post('/api/generate-from-youtube', async (req, res) => {
  try {
    const { youtubeUrl, customText } = req.body;
    
    // Extract video ID from YouTube URL
    const videoId = youtubeUrl.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/)?.[1];
    
    if (!videoId) {
      throw new Error('Invalid YouTube URL');
    }

    // Get YouTube thumbnail as reference
    const youtubeThumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;

    // Analyze the YouTube thumbnail using Groq Vision API
    const imageDescription = await analyzeImageWithGroq(youtubeThumbnailUrl);

    // Use the Groq description to generate a new thumbnail with Flux
    const output = await replicate.run(
      "black-forest-labs/flux-schnell",
      {
        input: {
          prompt: `${imageDescription} ${customText}`,
          image: youtubeThumbnailUrl,
          width: 1280,
          height: 720,
          aspect_ratio: "16:9",
          num_outputs: 1
        }
      }
    );

    // Download the generated images
    const localUrls = await Promise.all(output.map(url => downloadImage(url)));

    res.json({ 
      success: true, 
      images: localUrls,
      metadata: {
        model: "black-forest-labs/flux-schnell",
        width: 1280,
        height: 720,
        aspect_ratio: "16:9",
        description: imageDescription
      }
    });

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Failed to generate thumbnail from YouTube video' 
    });
  }
});

app.get('/api/profile/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId) {
      return res.status(400).json({ 
        success: false,
        message: 'User ID is required'
      });
    }

    console.log('Fetching profile for user:', userId);
    const profile = await DatabaseService.getProfile(userId);
    
    res.json({
      success: true,
      data: profile
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch profile'
    });
  }
});

// Authentication endpoints
app.post('/api/auth/google/callback', async (req, res) => {
  const { access_token } = req.body;
  if (!access_token) {
    return res.status(400).json({ success: false, error: 'No token provided' });
  }
  const result = await AuthService.handleGoogleCallback(access_token);
  res.json(result);
});

app.post('/api/auth/signout', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ success: false, error: 'No token provided' });
  }
  const result = await AuthService.signOut(token);
  res.json(result);
});

app.get('/api/auth/verify', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ success: false, error: 'No token provided' });
  }
  const result = await AuthService.verifySession(token);
  res.json(result);
});

// Profile sync endpoint
app.post('/api/auth/sync-profile', async (req, res) => {
  try {
    // Get the authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    // Extract the token
    const token = authHeader.split(' ')[1];
    
    // Verify the token
    const { data: { user }, error: verifyError } = await supabase.auth.getUser(token);
    if (verifyError || !user) {
      console.error('Token verification failed:', verifyError);
      return res.status(401).json({ error: 'Invalid token' });
    }

    // Sync the profile
    const profile = await DatabaseService.syncUserProfile(user);
    
    res.json({ success: true, profile });
  } catch (error) {
    console.error('Error in sync-profile endpoint:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
  console.log(`Generated images will be saved in: ${generatedImagesDir}`);
});