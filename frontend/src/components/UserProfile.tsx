import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { logger } from '../utils/logger';

interface Profile {
  id: string;
  credits: number;
  referral_code: string;
  created_at: string;
  updated_at: string;
}

export function UserProfile() {
  const { user, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProfile() {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        setError(null);
        logger.log('Fetching profile for user:', user.id);
        
        const { data: session } = await supabase.auth.getSession();
        if (!session?.session) {
          throw new Error('No active session');
        }

        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) {
          logger.error('Supabase error:', error);
          throw error;
        }

        logger.log('Profile data:', data);
        setProfile(data);
      } catch (err) {
        logger.error('Error fetching profile:', err);
        setError(err instanceof Error ? err.message : 'Error fetching profile');
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, [user]);

  if (authLoading) {
    return <div>Loading auth...</div>;
  }

  if (!user) {
    return <div>Please sign in to view your profile.</div>;
  }

  if (loading) {
    return <div>Loading profile...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!profile) {
    return <div>No profile found.</div>;
  }


}
