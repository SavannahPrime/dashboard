
import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'sonner';
import { createClient } from '@supabase/supabase-js';

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
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  resetPassword: (email: string) => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

// Sample admin users for demo
const sampleAdmins: AdminUser[] = [
  {
    id: '1',
    email: 'admin@prime.com',
    name: 'Super Admin',
    role: 'super_admin',
    permissions: ['all'],
    lastLogin: new Date().toISOString(),
    profileImage: 'https://ui-avatars.com/api/?name=Super+Admin&background=2c5cc5&color=fff',
  },
  {
    id: '2',
    email: 'sales@prime.com',
    name: 'Sales Account',
    role: 'sales',
    permissions: ['view_clients', 'view_sales', 'edit_clients', 'view_reports'],
    lastLogin: new Date().toISOString(),
    profileImage: 'https://ui-avatars.com/api/?name=Sales+Account&background=2c5cc5&color=fff',
  },
  {
    id: '3',
    email: 'support@prime.com',
    name: 'Support Staff',
    role: 'support',
    permissions: ['view_clients', 'view_tickets', 'reply_tickets', 'impersonate'],
    lastLogin: new Date().toISOString(),
    profileImage: 'https://ui-avatars.com/api/?name=Support+Staff&background=2c5cc5&color=fff',
  },
];

const STORAGE_KEY = 'savannah_prime_admin';

// Initialize Supabase client - in a real app you would use actual credentials
// For demo purposes, we'll continue using localStorage but structure the code for Supabase integration
let supabase: any = null;
try {
  // For future Supabase implementation
  // This would use actual API keys in production
  // supabase = createClient('https://your-supabase-url.supabase.co', 'your-anon-key');
} catch (error) {
  console.error('Error initializing Supabase client', error);
}

export const AdminAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentAdmin, setCurrentAdmin] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for stored admin on initial load
    // In a real Supabase implementation, this would verify the session
    const checkAuth = async () => {
      setIsLoading(true);
      
      try {
        if (supabase) {
          // For future Supabase implementation
          // const { data: { session }, error } = await supabase.auth.getSession();
          // if (session) {
          //   // Fetch user profile from Supabase
          //   const { data, error } = await supabase.from('admin_users').select('*').eq('id', session.user.id).single();
          //   if (data) setCurrentAdmin(data);
          // }
        } else {
          // Fallback to localStorage for demo
          const storedAdmin = localStorage.getItem(STORAGE_KEY);
          if (storedAdmin) {
            setCurrentAdmin(JSON.parse(storedAdmin));
          }
        }
      } catch (error) {
        console.error('Error checking auth:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    
    try {
      if (supabase) {
        // For future Supabase implementation
        // const { data: { session }, error } = await supabase.auth.signInWithPassword({ email, password });
        // if (error) throw error;
        // 
        // // Fetch user profile from Supabase
        // const { data, error: profileError } = await supabase.from('admin_users').select('*').eq('id', session.user.id).single();
        // if (profileError) throw profileError;
        // 
        // setCurrentAdmin(data);
        // localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      } else {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Check admin credentials
        if (email === 'admin@prime.com' && password === 'PrimeAdmin@2024') {
          const admin = sampleAdmins.find(u => u.email === email) || null;
          setCurrentAdmin(admin);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(admin));
          toast.success('Welcome back, Super Admin!');
          return;
        }
        
        if (email === 'sales@prime.com' && password === 'PrimeSales@2024') {
          const admin = sampleAdmins.find(u => u.email === email) || null;
          setCurrentAdmin(admin);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(admin));
          toast.success('Welcome back, Sales Account!');
          return;
        }
        
        if (email === 'support@prime.com' && password === 'PrimeSupport@2024') {
          const admin = sampleAdmins.find(u => u.email === email) || null;
          setCurrentAdmin(admin);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(admin));
          toast.success('Welcome back, Support Staff!');
          return;
        }
        
        throw new Error('Invalid credentials');
      }
    } catch (error) {
      toast.error('Invalid email or password');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    if (supabase) {
      // For future Supabase implementation
      // supabase.auth.signOut();
    }
    
    setCurrentAdmin(null);
    localStorage.removeItem(STORAGE_KEY);
    toast.info('You have been logged out');
  };

  const resetPassword = async (email: string) => {
    setIsLoading(true);
    try {
      if (supabase) {
        // For future Supabase implementation
        // const { error } = await supabase.auth.resetPasswordForEmail(email);
        // if (error) throw error;
      } else {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Check if admin exists
        const adminExists = sampleAdmins.some(u => u.email === email);
        if (!adminExists) {
          throw new Error('No admin account found with this email');
        }
      }
      
      // In a real app, we would send a password reset email
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
    isAuthenticated: !!currentAdmin,
    login,
    logout,
    resetPassword,
  };

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
};

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (context === undefined) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
};
