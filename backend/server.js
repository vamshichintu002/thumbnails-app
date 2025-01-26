import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import Stripe from 'stripe';
import { DatabaseService } from './services/database.js';
import { AuthService } from './services/auth.js';
import { TextThumbnailService } from './services/text-thumbnail.js';
import { ImageThumbnailService } from './services/image-thumbnail.js';
import { YoutubeThumbnailService } from './services/youtube-thumbnail.js';
import stripeRoutes from './routes/stripe-routes.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// CORS configuration
app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization', 'stripe-signature']
}));

// Handle raw body for webhooks, JSON for other routes
app.use('/api/stripe/webhook', express.raw({ type: 'application/json' }));
app.use(express.json()); // For all other routes

// Static files
app.use('/public', express.static('public'));

// Mount the stripe routes
app.use('/api/stripe', stripeRoutes);

// Thumbnail generation endpoints
app.post('/api/generate-thumbnail', async (req, res) => {
  try {
    const { 
      userId, 
      generationType, 
      prompt, 
      youtubeUrl,
      videoTitle,
      referenceImageUrl, 
      aspectRatio, 
      generationOption 
    } = req.body;

    // Basic validation
    if (!userId || !aspectRatio || !generationType) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    let result;

    switch (generationType) {
      case 'text_to_thumbnail':
        if (!prompt) {
          return res.status(400).json({ error: 'Missing prompt for text generation' });
        }
        result = await TextThumbnailService.generateThumbnail(userId, prompt, aspectRatio);
        break;
      case 'image_to_thumbnail':
        if (!prompt) {
          return res.status(400).json({ error: 'Missing prompt for image generation' });
        }
        result = await ImageThumbnailService.generateThumbnail(userId, prompt, referenceImageUrl, aspectRatio);
        break;
      case 'youtube_to_thumbnail':
        if (!youtubeUrl || !videoTitle) {
          return res.status(400).json({ error: 'Missing YouTube URL or video title' });
        }
        result = await YoutubeThumbnailService.generateThumbnail(
          userId, 
          youtubeUrl, 
          videoTitle, 
          generationOption, 
          aspectRatio, 
          referenceImageUrl
        );
        break;
      default:
        throw new Error('Invalid generation type');
    }

    res.json(result);
  } catch (error) {
    console.error('Error generating thumbnail:', error);
    res.status(500).json({ 
      error: error.message || 'Failed to generate thumbnail'
    });
  }
});

// Profile and auth endpoints
app.get('/api/profile/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId) {
      return res.status(400).json({ 
        success: false, 
        error: 'User ID is required' 
      });
    }

    const profile = await DatabaseService.getProfile(userId);
    res.json({ success: true, profile });
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Failed to fetch profile' 
    });
  }
});

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
    const { data: { user }, error: verifyError } = await AuthService.verifySession(token);
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

// Initialize database
(async () => {
  try {
    console.log('Initializing database...');
    await DatabaseService.initializeGenerationTypes();
    console.log('Database initialization complete');
  } catch (error) {
    console.error('Error initializing database:', error);
  }
})();

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});