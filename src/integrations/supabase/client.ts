
import { createClient } from '@supabase/supabase-js';

// Initialize the Supabase client with better storage options
export const supabase = createClient(
  'https://acwazlpfcswexkucuuek.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFjd2F6bHBmY3N3ZXhrdWN1dWVrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI5MDQ0ODgsImV4cCI6MjA1ODQ4MDQ4OH0.MQ3urzLgOWtmuR5UdHICeiXFD1_qv8yUes692aT1PsU',
  {
    auth: {
      storage: localStorage,
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  }
);
