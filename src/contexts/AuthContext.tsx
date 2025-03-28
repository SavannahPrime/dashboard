import React, { createContext, useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export type AuthContextType = {
  currentUser: any | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  isAuthenticated: boolean;
  isLoading: boolean;
  refreshUserData: () => Promise<void>; // Add this line
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<any | null>(null);
  const [session, setSession] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const getSession = async () => {
      setIsLoading(true);
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);

        if (session?.user) {
          const { data, error } = await supabase
            .from('clients')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (error) throw error;

          setCurrentUser({
            id: session.user.id,
            email: session.user.email,
            ...data
          });
        }
      } catch (error) {
        console.error("Error fetching session:", error);
      } finally {
        setIsLoading(false);
      }
    };

    getSession();

    supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      if (session?.user) {
        try {
          setIsLoading(true);
          const { data, error } = await supabase
            .from('clients')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (error) throw error;

          setCurrentUser({
            id: session.user.id,
            email: session.user.email,
            ...data
          });
        } catch (error) {
          console.error("Error fetching user data on auth state change:", error);
        } finally {
          setIsLoading(false);
        }
      } else {
        setCurrentUser(null);
        setIsLoading(false);
      }
    });
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      const { data: userData, error: userError } = await supabase
        .from('clients')
        .select('*')
        .eq('id', data.user?.id)
        .single();

      if (userError) throw userError;

      setCurrentUser({
        id: data.user?.id,
        email: data.user?.email,
        ...userData
      });

      toast.success('Successfully logged in');
      navigate('/dashboard');
    } catch (error: any) {
      console.error("Login error:", error);
      toast.error(error.message || 'Failed to log in');
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (email: string, password: string, name: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name,
          }
        }
      });

      if (error) throw error;

      // Create a new client entry in the clients table
      const { error: clientError } = await supabase
        .from('clients')
        .insert({
          id: data.user?.id,
          email: data.user?.email,
          name: name,
          subscription_status: 'active',
          selected_services: []
        });

      if (clientError) throw clientError;

      setCurrentUser({
        id: data.user?.id,
        email: data.user?.email,
        name: name
      });

      toast.success('Successfully signed up');
      navigate('/dashboard');
    } catch (error: any) {
      console.error("Signup error:", error);
      toast.error(error.message || 'Failed to sign up');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setCurrentUser(null);
      toast.success('Successfully logged out');
      navigate('/login');
    } catch (error: any) {
      console.error("Logout error:", error);
      toast.error(error.message || 'Failed to log out');
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/update-password`,
      });
      if (error) throw error;
      toast.success('Password reset email sent');
    } catch (error: any) {
      console.error("Reset password error:", error);
      toast.error(error.message || 'Failed to send reset password email');
    } finally {
      setIsLoading(false);
    }
  };

  const refreshUserData = async () => {
    if (!session?.user?.id) return;
    
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('id', session.user.id)
        .single();
    
    if (error) throw error;
    
    setCurrentUser({
      id: session.user.id,
      email: session.user.email,
      ...data
    });
  } catch (error) {
    console.error('Error refreshing user data:', error);
  } finally {
    setIsLoading(false);
  }
};

  const value = {
    currentUser,
    login,
    signup,
    logout,
    resetPassword,
    isAuthenticated: !!session?.user,
    isLoading,
    refreshUserData // Add this line
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
