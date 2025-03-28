
import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Session, User } from '@supabase/supabase-js';

export interface ClientUser {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'client';
  selectedServices: string[];
  subscriptionStatus: 'active' | 'expired' | 'pending';
  subscriptionExpiry: string;
  profileImage?: string;
}

interface AuthContextType {
  currentUser: ClientUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string, services: string[]) => Promise<void>;
  logout: () => void;
  resetPassword: (email: string) => Promise<void>;
  updateUser: (userData: Partial<ClientUser>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = 'savannah_prime_auth';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<ClientUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        if (session) {
          try {
            // Check if user exists in our clients table
            const { data, error } = await supabase
              .from('clients')
              .select('*')
              .eq('email', session.user.email)
              .single();
            
            if (error && error.code !== 'PGRST116') throw error;
            
            if (data) {
              const user: ClientUser = {
                id: data.id,
                email: data.email,
                name: data.name,
                role: 'client',
                selectedServices: data.selected_services || [],
                subscriptionStatus: data.subscription_status || 'active',
                subscriptionExpiry: data.subscription_expiry || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                profileImage: data.profile_image
              };
              
              setCurrentUser(user);
              localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
            } else {
              setCurrentUser(null);
              localStorage.removeItem(STORAGE_KEY);
            }
          } catch (error) {
            console.error('Error fetching user profile:', error);
            setCurrentUser(null);
          }
        } else {
          setCurrentUser(null);
          localStorage.removeItem(STORAGE_KEY);
        }
      }
    );

    // THEN check for existing session
    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        
        if (session) {
          // Check if user exists in our clients table
          const { data, error } = await supabase
            .from('clients')
            .select('*')
            .eq('email', session.user.email)
            .single();
          
          if (error && error.code !== 'PGRST116') throw error;
          
          if (data) {
            const user: ClientUser = {
              id: data.id,
              email: data.email,
              name: data.name,
              role: 'client',
              selectedServices: data.selected_services || [],
              subscriptionStatus: data.subscription_status || 'active',
              subscriptionExpiry: data.subscription_expiry || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
              profileImage: data.profile_image
            };
            
            setCurrentUser(user);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setIsLoading(false);
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
      
      // Fetch user from our clients table
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('email', email)
        .single();
      
      // If not found, create a minimal profile
      if (error && error.code === 'PGRST116') {
        // User exists in auth but not in our clients table
        const newUser: Partial<ClientUser> = {
          email,
          name: email.split('@')[0],
          role: 'client',
          selectedServices: [],
          subscriptionStatus: 'active',
          subscriptionExpiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        };
        
        // Create user in our database
        const { data: newData, error: insertError } = await supabase
          .from('clients')
          .insert({
            email: newUser.email,
            name: newUser.name,
            selected_services: newUser.selectedServices,
            subscription_status: newUser.subscriptionStatus,
            subscription_expiry: newUser.subscriptionExpiry,
            profile_image: `https://ui-avatars.com/api/?name=${newUser.name?.replace(' ', '+')}&background=2c5cc5&color=fff`
          })
          .select()
          .single();
        
        if (insertError) throw insertError;
        
        if (newData) {
          const user: ClientUser = {
            id: newData.id,
            email: newData.email,
            name: newData.name,
            role: 'client',
            selectedServices: newData.selected_services || [],
            subscriptionStatus: newData.subscription_status,
            subscriptionExpiry: newData.subscription_expiry,
            profileImage: newData.profile_image
          };
          
          setCurrentUser(user);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
        }
      } else if (error) {
        throw error;
      } else if (data) {
        const user: ClientUser = {
          id: data.id,
          email: data.email,
          name: data.name,
          role: 'client',
          selectedServices: data.selected_services || [],
          subscriptionStatus: data.subscription_status,
          subscriptionExpiry: data.subscription_expiry,
          profileImage: data.profile_image
        };
        
        setCurrentUser(user);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
      }
      
      toast.success('Welcome back!');
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

  const register = async (email: string, password: string, name: string, services: string[]) => {
    setIsLoading(true);
    
    try {
      // Check if email already exists in our database
      const { data: existingUser } = await supabase
        .from('clients')
        .select('email')
        .eq('email', email)
        .single();
      
      if (existingUser) {
        throw new Error('Email already in use');
      }
      
      // Sign up with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password
      });
      
      if (authError) throw authError;
      
      // Create profile in our database
      const profileData = {
        email,
        name,
        selected_services: services,
        subscription_status: 'active' as const,
        subscription_expiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        profile_image: `https://ui-avatars.com/api/?name=${name.replace(' ', '+')}&background=2c5cc5&color=fff`
      };
      
      const { data, error } = await supabase
        .from('clients')
        .insert(profileData)
        .select()
        .single();
      
      if (error) throw error;
      
      if (data) {
        const user: ClientUser = {
          id: data.id,
          email: data.email,
          name: data.name,
          role: 'client',
          selectedServices: data.selected_services || [],
          subscriptionStatus: data.subscription_status,
          subscriptionExpiry: data.subscription_expiry,
          profileImage: data.profile_image
        };
        
        setCurrentUser(user);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
      }
      
      toast.success('Account created successfully!');
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
    // Sign out from Supabase
    await supabase.auth.signOut();
    
    setCurrentUser(null);
    localStorage.removeItem(STORAGE_KEY);
    toast.info('You have been logged out');
  };

  const resetPassword = async (email: string) => {
    setIsLoading(true);
    try {
      // Check if user exists in our database
      const { data, error } = await supabase
        .from('clients')
        .select('email')
        .eq('email', email)
        .single();
      
      if (error && error.code !== 'PGRST116') throw new Error('No account found with this email');
      
      // Send password reset email through Supabase
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + '/reset-password',
      });
      
      if (resetError) throw resetError;
      
      toast.success('Password reset email sent. Check your inbox.');
    } catch (error) {
      console.error('Password reset error:', error);
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

  const updateUser = async (userData: Partial<ClientUser>) => {
    if (!currentUser) return;
    
    try {
      // Convert client-side model to database model
      const dbData: any = {};
      
      if (userData.name) dbData.name = userData.name;
      if (userData.selectedServices) dbData.selected_services = userData.selectedServices;
      if (userData.subscriptionStatus) dbData.subscription_status = userData.subscriptionStatus;
      if (userData.subscriptionExpiry) dbData.subscription_expiry = userData.subscriptionExpiry;
      if (userData.profileImage) dbData.profile_image = userData.profileImage;
      
      // Update in database
      const { error } = await supabase
        .from('clients')
        .update(dbData)
        .eq('id', currentUser.id);
      
      if (error) throw error;
      
      // Update local state
      const updatedUser = { ...currentUser, ...userData };
      setCurrentUser(updatedUser);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedUser));
      
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Update user error:', error);
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('Failed to update profile');
      }
    }
  };

  const value = {
    currentUser,
    isLoading,
    isAuthenticated: !!currentUser,
    login,
    register,
    logout,
    resetPassword,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
