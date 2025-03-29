
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
  name?: string
): Promise<AuthResult> => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
        },
      },
    });

    if (error) {
      return { error: error.message };
    }

    // After successful signup, create a profile record
    if (data.user) {
      // Note: This might not be needed if you have DB triggers set up
      const { error: profileError } = await supabase
        .from('clients')
        .insert({
          id: data.user.id,
          name: name || '',
          email: email,
          selected_services: [],
          created_at: new Date().toISOString(),
        });

      if (profileError) {
        console.error('Error creating profile:', profileError);
        // We don't return this error as it would prevent login
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
