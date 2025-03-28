
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export type AdminAuthStatus = 'unauthenticated' | 'pending' | 'authenticated' | 'error';

export const verifyAdminEmail = async (email: string): Promise<{ valid: boolean; role?: string }> => {
  try {
    // Check if email exists in the admin_users table
    const { data, error } = await supabase
      .from('admin_users')
      .select('email, role')
      .eq('email', email)
      .single();
    
    if (error) {
      console.error('Error verifying admin email:', error);
      return { valid: false };
    }
    
    return { valid: true, role: data.role };
  } catch (error) {
    console.error('Error verifying admin email:', error);
    return { valid: false };
  }
};

export const sendOTPEmail = async (email: string): Promise<boolean> => {
  try {
    // Generate a random 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Store the OTP in the database with an expiration time (10 minutes)
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 10);
    
    // First, delete any existing OTPs for this email
    await supabase
      .from('admin_auth_otp')
      .delete()
      .eq('email', email);
    
    // Then insert the new OTP
    const { error } = await supabase
      .from('admin_auth_otp')
      .insert({
        email,
        otp,
        expires_at: expiresAt.toISOString()
      });
    
    if (error) throw error;
    
    // In a real app, you would send an email here.
    // For demo purposes, we'll just log it and show a toast.
    console.log(`OTP for ${email}: ${otp}`);
    toast.info(`OTP sent to ${email}. For demo: ${otp}`);
    
    return true;
  } catch (error) {
    console.error('Error sending OTP:', error);
    return false;
  }
};

export const verifyOTP = async (email: string, otp: string): Promise<boolean> => {
  try {
    // Check if the OTP exists and is valid
    const { data, error } = await supabase
      .from('admin_auth_otp')
      .select('otp, expires_at')
      .eq('email', email)
      .single();
    
    if (error) throw error;
    
    // Check if OTP is expired
    const now = new Date();
    const expiresAt = new Date(data.expires_at);
    if (now > expiresAt) {
      return false;
    }
    
    // Verify OTP
    return data.otp === otp;
  } catch (error) {
    console.error('Error verifying OTP:', error);
    return false;
  }
};

export const loginAdminWithOTP = async (email: string, otp: string): Promise<{ success: boolean; message: string }> => {
  try {
    // Verify the OTP
    const isValid = await verifyOTP(email, otp);
    if (!isValid) {
      return { success: false, message: 'Invalid or expired OTP' };
    }
    
    // Get admin data
    const { data: adminData, error: adminError } = await supabase
      .from('admin_users')
      .select('*')
      .eq('email', email)
      .single();
    
    if (adminError) throw adminError;
    
    // Create an auth session via Supabase Auth
    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password: process.env.ADMIN_DEFAULT_PASSWORD || 'admin123', // This is a placeholder
    });
    
    if (authError) {
      // If user doesn't exist in auth, sign them up
      if (authError.message.includes('Invalid login credentials')) {
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password: process.env.ADMIN_DEFAULT_PASSWORD || 'admin123',
          options: {
            data: {
              role: adminData.role
            }
          }
        });
        
        if (signUpError) throw signUpError;
      } else {
        throw authError;
      }
    }
    
    // Update last login time
    await supabase
      .from('admin_users')
      .update({ last_login: new Date().toISOString() })
      .eq('email', email);
    
    // Delete the used OTP
    await supabase
      .from('admin_auth_otp')
      .delete()
      .eq('email', email);
    
    return { success: true, message: 'Login successful' };
  } catch (error) {
    console.error('Error logging in with OTP:', error);
    return { success: false, message: error.message || 'Login failed' };
  }
};

export const logoutAdmin = async (): Promise<boolean> => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error logging out:', error);
    return false;
  }
};
