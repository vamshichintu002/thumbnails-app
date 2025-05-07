import { createClient } from '@supabase/supabase-js';

// These should be environment variables in a production environment
const supabaseUrl = 'https://ujsjwovfdifsdavzwiec.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVqc2p3b3ZmZGlmc2Rhdnp3aWVjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzczNzk1MTgsImV4cCI6MjA1Mjk1NTUxOH0.i3BjLF8krbb08AM4H0IO32rw6_Ys-CVQDousZbCom9M';

// Create a single supabase client for interacting with your database
const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase; 