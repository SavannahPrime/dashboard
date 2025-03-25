
import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'sonner';

export interface User {
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
  currentUser: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string, services: string[]) => Promise<void>;
  logout: () => void;
  resetPassword: (email: string) => Promise<void>;
  updateUser: (userData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Sample users for demo
const sampleUsers: User[] = [
  {
    id: '1',
    email: 'admin@example.com',
    name: 'Admin User',
    role: 'admin',
    selectedServices: ['Website Development', 'Digital Marketing', 'Branding'],
    subscriptionStatus: 'active',
    subscriptionExpiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    profileImage: 'https://ui-avatars.com/api/?name=Admin+User&background=2c5cc5&color=fff',
  },
  {
    id: '2',
    email: 'client@example.com',
    name: 'Demo Client',
    role: 'client',
    selectedServices: ['Website Development', 'CMS Development'],
    subscriptionStatus: 'active',
    subscriptionExpiry: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
    profileImage: 'https://ui-avatars.com/api/?name=Demo+Client&background=2c5cc5&color=fff',
  }
];

const STORAGE_KEY = 'savannah_prime_auth';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for stored user on initial load
    const storedUser = localStorage.getItem(STORAGE_KEY);
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Check if user exists with given credentials (for demo purposes)
      if (email === 'admin@example.com' && password === 'Admin@1234') {
        const user = sampleUsers.find(u => u.email === email) || null;
        setCurrentUser(user);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
        toast.success('Welcome back!');
        return;
      }
      
      const user = sampleUsers.find(u => u.email === email);
      if (user) {
        setCurrentUser(user);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
        toast.success('Welcome back!');
        return;
      }
      
      throw new Error('Invalid credentials');
    } catch (error) {
      toast.error('Invalid email or password');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password: string, name: string, services: string[]) => {
    setIsLoading(true);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Check if email already exists
      if (sampleUsers.some(u => u.email === email)) {
        throw new Error('Email already in use');
      }
      
      // Create new user
      const newUser: User = {
        id: String(sampleUsers.length + 1),
        email,
        name,
        role: 'client',
        selectedServices: services,
        subscriptionStatus: 'active',
        subscriptionExpiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        profileImage: `https://ui-avatars.com/api/?name=${name.replace(' ', '+')}&background=2c5cc5&color=fff`,
      };
      
      // In a real app, we would send this to an API
      // For demo, we'll just update local state
      sampleUsers.push(newUser);
      setCurrentUser(newUser);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newUser));
      toast.success('Account created successfully!');
    } catch (error) {
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

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem(STORAGE_KEY);
    toast.info('You have been logged out');
  };

  const resetPassword = async (email: string) => {
    setIsLoading(true);
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Check if user exists
      const userExists = sampleUsers.some(u => u.email === email);
      if (!userExists) {
        throw new Error('No account found with this email');
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

  const updateUser = (userData: Partial<User>) => {
    if (!currentUser) return;
    
    const updatedUser = { ...currentUser, ...userData };
    setCurrentUser(updatedUser);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedUser));
    
    // Update in sample array too (for demo purposes)
    const index = sampleUsers.findIndex(u => u.id === currentUser.id);
    if (index !== -1) {
      sampleUsers[index] = updatedUser;
    }
    
    toast.success('Profile updated successfully');
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
