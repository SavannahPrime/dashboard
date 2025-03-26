
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
    },
    realtime: {
      params: {
        eventsPerSecond: 10
      }
    },
    global: {
      headers: {
        'x-application-name': 'savannah-prime-admin'
      }
    }
  }
);

// Helper function to handle database errors
export const handleDatabaseError = (error: any) => {
  console.error('Database operation error:', error);
  
  // Return a user-friendly error message
  if (error?.code === '23505') {
    return 'This record already exists.';
  } else if (error?.code === '23503') {
    return 'This operation cannot be completed because the record is referenced by another record.';
  } else if (error?.code === '42P01') {
    return 'Database connection error. Please try again later.';
  } else if (error?.message) {
    return error.message;
  }
  
  return 'An unexpected error occurred. Please try again later.';
};
