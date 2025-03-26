
import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Session, User } from '@supabase/supabase-js';
import { Loader2 } from 'lucide-react'; // Adding the missing import

export type AdminRole = 'super_admin' | 'sales' | 'support';

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: AdminRole;
  permissions: string[];
  lastLogin: string;
  profileImage?: string;
}

interface AdminAuthContextType {
  currentAdmin: AdminUser | null;
  isLoading: boolean;
  isInitializing: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

const STORAGE_KEY = 'savannah_prime_admin';

export const AdminAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentAdmin, setCurrentAdmin] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [session, setSession] = useState<Session | null>(null);

  // Function to fetch admin profile data
  const fetchAdminProfile = async (email: string): Promise<AdminUser | null> => {
    try {
      const { data, error } = await supabase
        .from('admin_users')
        .select('*')
        .eq('email', email)
        .single();
      
      if (error) throw error;
      
      if (data) {
        const adminUser: AdminUser = {
          id: data.id,
          email: data.email,
          name: data.name,
          role: data.role as AdminRole,
          permissions: data.permissions || [],
          lastLogin: new Date().toISOString(),
          profileImage: data.profile_image
        };
        return adminUser;
      }
      return null;
    } catch (error) {
      console.error('Error fetching admin profile:', error);
      return null;
    }
  };

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        
        if (session) {
          const email = session.user.email;
          if (!email) {
            setCurrentAdmin(null);
            localStorage.removeItem(STORAGE_KEY);
            return;
          }
          
          // Use setTimeout to avoid potential supabase client deadlock
          setTimeout(async () => {
            const adminUser = await fetchAdminProfile(email);
            if (adminUser) {
              setCurrentAdmin(adminUser);
              localStorage.setItem(STORAGE_KEY, JSON.stringify(adminUser));
            } else {
              setCurrentAdmin(null);
              localStorage.removeItem(STORAGE_KEY);
            }
          }, 0);
        } else {
          setCurrentAdmin(null);
          localStorage.removeItem(STORAGE_KEY);
        }
      }
    );

    // THEN check for existing session
    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        
        if (session?.user?.email) {
          const adminUser = await fetchAdminProfile(session.user.email);
          if (adminUser) {
            setCurrentAdmin(adminUser);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(adminUser));
          }
        }
      } catch (error) {
        console.error('Error initializing admin auth:', error);
      } finally {
        setIsInitializing(false);
      }
    };
    
    initAuth();
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    
    try {
      // Sign in with Supabase
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (authError) throw authError;
      
      // Fetch admin user from the database
      const adminUser = await fetchAdminProfile(email);
      
      if (!adminUser) {
        throw new Error('Admin account not found');
      }
      
      // Update last login time
      await supabase
        .from('admin_users')
        .update({ last_login: new Date().toISOString() })
        .eq('email', email);
      
      setCurrentAdmin(adminUser);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(adminUser));
      
      let welcomeMessage = 'Welcome back';
      if (adminUser.role === 'super_admin') welcomeMessage += ', Super Admin!';
      else if (adminUser.role === 'sales') welcomeMessage += ', Sales Account!';
      else if (adminUser.role === 'support') welcomeMessage += ', Support Staff!';
      else welcomeMessage += '!';
      
      toast.success(welcomeMessage);
    } catch (error) {
      console.error('Login error:', error);
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('Invalid email or password');
      }
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      // Sign out from Supabase
      await supabase.auth.signOut();
      
      setCurrentAdmin(null);
      localStorage.removeItem(STORAGE_KEY);
      toast.info('You have been logged out');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Logout failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    setIsLoading(true);
    try {
      // Check if admin exists in our database
      const { data, error } = await supabase
        .from('admin_users')
        .select('email')
        .eq('email', email)
        .single();
      
      if (error) throw new Error('No admin account found with this email');
      
      // Send password reset email through Supabase
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + '/admin/reset-password',
      });
      
      if (resetError) throw resetError;
      
      toast.success('Password reset email sent. Check your inbox.');
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('Password reset failed');
      }
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    currentAdmin,
    isLoading,
    isInitializing,
    isAuthenticated: !!currentAdmin,
    login,
    logout,
    resetPassword,
  };

  // Show initialization loading UI at the outermost level
  if (isInitializing) {
    return (
      <div className="h-screen flex flex-col items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Loading admin panel...</p>
      </div>
    );
  }

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
};

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (context === undefined) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
};
