import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import sessionManager from '@/lib/sessionManager';

// Define client user interface
export interface ClientUser {
  id: string;
  email: string;
  name: string;
  status: string;
  subscriptionStatus: string;
  subscriptionExpiry?: string;
  selectedServices?: string[];
  profileImage?: string;
}

// Define the auth context interface
interface AuthContextType {
  user: User | null;
  currentUser: ClientUser | null;
  isLoading: boolean;
  isInitializing: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  updateProfile: (profile: Partial<ClientUser>) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

// Create the auth context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Create the auth provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [currentUser, setCurrentUser] = useState<ClientUser | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  // Fetch client profile data from database
  const fetchUserProfile = async (userId: string): Promise<ClientUser | null> => {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) {
        throw error;
      }
      
      if (data) {
        const clientUser: ClientUser = {
          id: data.id,
          email: data.email,
          name: data.name,
          status: data.status,
          subscriptionStatus: data.subscription_status,
          subscriptionExpiry: data.subscription_expiry,
          selectedServices: data.selected_services,
          profileImage: data.profile_image
        };
        return clientUser;
      }
      return null;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  };

  // Set up auth state listener
  useEffect(() => {
    setIsInitializing(true);
    
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user || null);
        
        if (session?.user) {
          // Use setTimeout to avoid potential supabase client deadlock
          setTimeout(async () => {
            const profile = await fetchUserProfile(session.user.id);
            if (profile) {
              setCurrentUser(profile);
              
              // Store in sessionManager
              sessionManager.storeSession(
                'client',
                session.user,
                session.access_token,
                session.refresh_token,
                session.expires_in
              );
            } else {
              setCurrentUser(null);
            }
          }, 0);
        } else {
          // Only clear user if we're actually signing out
          if (event === 'SIGNED_OUT') {
            setCurrentUser(null);
            sessionManager.clearSession('client');
          }
        }
      }
    );

    // THEN check for existing session
    const initAuth = async () => {
      try {
        // Check if we have a session in the session manager
        if (sessionManager.hasValidSession('client')) {
          const storedSession = sessionManager.getSession('client');
          if (storedSession?.user) {
            setUser(storedSession.user);
            const profile = await fetchUserProfile(storedSession.user.id);
            if (profile) {
              setCurrentUser(profile);
              setIsInitializing(false);
              return;
            }
          }
        }
        
        // Fall back to checking Supabase session
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user || null);
        
        if (session?.user) {
          const profile = await fetchUserProfile(session.user.id);
          if (profile) {
            setCurrentUser(profile);
            
            // Store in sessionManager
            sessionManager.storeSession(
              'client',
              session.user,
              session.access_token,
              session.refresh_token,
              session.expires_in
            );
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
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
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      if (data.user) {
        setUser(data.user);
        const profile = await fetchUserProfile(data.user.id);
        if (profile) {
          setCurrentUser(profile);
          
          // Store in sessionManager
          sessionManager.storeSession(
            'client',
            data.user,
            data.session?.access_token || null,
            data.session?.refresh_token || null,
            data.session?.expires_in
          );
          
          toast.success(`Welcome back, ${profile.name}!`);
        } else {
          // If profile doesn't exist, create one
          await createClientProfile(data.user.id, email, email.split('@')[0]);
          const newProfile = await fetchUserProfile(data.user.id);
          if (newProfile) {
            setCurrentUser(newProfile);
          }
        }
      }
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

  const register = async (email: string, password: string, name: string) => {
    setIsLoading(true);
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
      
      if (error) throw error;
      
      if (data.user) {
        setUser(data.user);
        await createClientProfile(data.user.id, email, name);
        const profile = await fetchUserProfile(data.user.id);
        if (profile) {
          setCurrentUser(profile);
          
          // Store in sessionManager
          sessionManager.storeSession(
            'client',
            data.user,
            data.session?.access_token || null,
            data.session?.refresh_token || null,
            data.session?.expires_in
          );
        }
        toast.success('Registration successful! Welcome to Savannah Prime Agency.');
      }
    } catch (error) {
      console.error('Registration error:', error);
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('Registration failed');
      }
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      // Clean up the client role session without affecting other roles
      sessionManager.clearSession('client');
      
      // Don't sign out from Supabase auth completely if other roles are active
      const activeRoles = sessionManager.getActiveRoles();
      if (activeRoles.length === 0) {
        // No other active sessions, sign out completely
        await supabase.auth.signOut();
      }
      
      // Update local state
      setUser(null);
      setCurrentUser(null);
      toast.info('You have been logged out');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Logout failed');
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to create a client profile
  const createClientProfile = async (userId: string, email: string, name: string) => {
    try {
      const { error } = await supabase.from('clients').insert({
        id: userId,
        email,
        name,
        status: 'active',
        subscription_status: 'active',
        profile_image: `https://ui-avatars.com/api/?name=${name.replace(' ', '+')}&background=6366f1&color=fff`,
        selected_services: []
      });
      
      if (error) throw error;
    } catch (error) {
      console.error('Error creating client profile:', error);
      toast.error('Failed to create profile');
    }
  };

  const updateProfile = async (profile: Partial<ClientUser>) => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('clients')
        .update(profile)
        .eq('id', user?.id);
      
      if (error) throw error;
      
      const updatedProfile = await fetchUserProfile(user?.id as string);
      if (updatedProfile) {
        setCurrentUser(updatedProfile);
        toast.success('Profile updated successfully!');
      }
    } catch (error) {
      console.error('Update profile error:', error);
      toast.error('Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + '/reset-password',
      });
      
      if (error) throw error;
      
      toast.success('Password reset email sent. Check your inbox.');
    } catch (error) {
      console.error('Reset password error:', error);
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
    user,
    currentUser,
    isLoading,
    isInitializing,
    isAuthenticated: !!user,
    login,
    logout,
    register,
    updateProfile,
    resetPassword,
  };
  
  // Show initialization loading UI
  if (isInitializing) {
    return (
      <div className="h-screen flex flex-col items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
