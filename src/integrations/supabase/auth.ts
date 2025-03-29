
import { supabase } from './client';

export interface AuthResult {
  error?: string;
  success?: boolean;
  data?: any;
}

/**
 * Register a new user with email and password
 */
export const signUp = async (
  email: string, 
  password: string, 
  name?: string,
  phone?: string,
  address?: string
): Promise<AuthResult> => {
  try {
    // First, check if a user with this email already exists
    const { data: existingUsers } = await supabase
      .from('clients')
      .select('email')
      .eq('email', email)
      .maybeSingle();
    
    if (existingUsers) {
      return { error: 'A user with this email already exists' };
    }

    // Proceed with signup
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          phone,
          address,
        },
      },
    });

    if (error) {
      console.error('Auth signup error:', error);
      return { error: error.message };
    }

    // After successful signup, create a profile record
    if (data.user) {
      try {
        // Create default values for any missing fields
        const defaultName = name || email.split('@')[0];
        const userProfile = {
          id: data.user.id,
          name: defaultName,
          email: email,
          selected_services: [],
          status: 'active',
          subscription_status: 'active',
          profile_image: `https://ui-avatars.com/api/?name=${defaultName.replace(' ', '+')}&background=6366f1&color=fff`,
          subscription_expiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          phone: phone || '',
          address: address || '',
          created_at: new Date().toISOString(),
        };

        const { error: profileError } = await supabase
          .from('clients')
          .insert(userProfile);

        if (profileError) {
          console.error('Error creating profile:', profileError);
          // We log the error but don't return it as it would prevent login
        }
      } catch (profileErr) {
        console.error('Profile creation exception:', profileErr);
      }
    }

    return { 
      success: true,
      data 
    };
  } catch (err: any) {
    console.error('Sign up error:', err);
    return { error: err.message || 'An unexpected error occurred' };
  }
};

/**
 * Sign in a user with email and password
 */
export const signIn = async (email: string, password: string): Promise<AuthResult> => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { error: error.message };
    }

    return { 
      success: true,
      data 
    };
  } catch (err: any) {
    console.error('Sign in error:', err);
    return { error: err.message || 'An unexpected error occurred' };
  }
};

/**
 * Sign out the current user
 */
export const signOut = async (): Promise<AuthResult> => {
  try {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      return { error: error.message };
    }
    
    return { success: true };
  } catch (err: any) {
    console.error('Sign out error:', err);
    return { error: err.message || 'An unexpected error occurred' };
  }
};

/**
 * Reset password for a user
 */
export const resetPassword = async (email: string): Promise<AuthResult> => {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    
    if (error) {
      return { error: error.message };
    }
    
    return { success: true };
  } catch (err: any) {
    console.error('Reset password error:', err);
    return { error: err.message || 'An unexpected error occurred' };
  }
};

/**
 * Update password for the current user
 */
export const updatePassword = async (password: string): Promise<AuthResult> => {
  try {
    const { error } = await supabase.auth.updateUser({
      password,
    });
    
    if (error) {
      return { error: error.message };
    }
    
    return { success: true };
  } catch (err: any) {
    console.error('Update password error:', err);
    return { error: err.message || 'An unexpected error occurred' };
  }
};
