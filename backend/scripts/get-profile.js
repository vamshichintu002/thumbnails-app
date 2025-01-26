import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function getTestProfile() {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, email')
      .limit(1)
      .single();

    if (error) throw error;

    console.log('Test profile found:', data);
    return data.id;
  } catch (error) {
    console.error('Error:', error);
  }
}

getTestProfile(); 