import express from 'express';
import cors from 'cors';
import * as dotenv from 'dotenv';
import { DatabaseService } from './services/database.js';
import { AuthService } from './services/auth.js';
import { generateThumbnail } from './controllers/thumbnailController.js';

dotenv.config();

const app = express();
const port = 3001;

app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use('/public', express.static('public'));

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

// Thumbnail generation endpoints
app.post('/api/generate-thumbnail', generateThumbnail);

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
});