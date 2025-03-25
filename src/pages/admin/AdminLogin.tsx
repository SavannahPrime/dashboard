
import React, { useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useForm, SubmitHandler } from 'react-hook-form';
import { Shield, Lock } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

type FormValues = {
  email: string;
  password: string;
};

const AdminLogin: React.FC = () => {
  const { isAuthenticated, isLoading, login, currentAdmin } = useAdminAuth();
  const navigate = useNavigate();
  
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>();
  
  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    try {
      await login(data.email, data.password);
    } catch (error) {
      // Error is already handled in the login function
      console.error('Login error:', error);
    }
  };
  
  // Effect to redirect based on role after successful login
  useEffect(() => {
    if (isAuthenticated && !isLoading && currentAdmin) {
      // Redirect to role-specific dashboard
      if (currentAdmin.role === 'sales') {
        navigate('/admin/sales/dashboard', { replace: true });
      } else if (currentAdmin.role === 'support') {
        navigate('/admin/support/dashboard', { replace: true });
      } else {
        navigate('/admin/dashboard', { replace: true });
      }
    }
  }, [isAuthenticated, isLoading, currentAdmin, navigate]);
  
  const handleDemoLogin = async (role: string) => {
    let email = '';
    let password = '';
    
    switch (role) {
      case 'admin':
        email = 'admin@prime.com';
        password = 'PrimeAdmin@2024';
        break;
      case 'sales':
        email = 'sales@prime.com';
        password = 'PrimeSales@2024';
        break;
      case 'support':
        email = 'support@prime.com';
        password = 'PrimeSupport@2024';
        break;
      default:
        return;
    }
    
    try {
      // First ensure the user exists in Supabase Auth
      const { data: { user }, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });
      
      if (authError && !authError.message.includes('already registered')) {
        throw authError;
      }
      
      // Then perform login
      await login(email, password);
    } catch (error) {
      console.error('Demo login error:', error);
      // We'll try normal login as the user might already exist
      try {
        await login(email, password);
      } catch (secondError) {
        console.error('Second login attempt failed:', secondError);
      }
    }
  };
  
  // Show loading state while redirection is in progress
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }
  
  // If already authenticated, redirect based on role
  if (isAuthenticated && currentAdmin) {
    if (currentAdmin.role === 'sales') {
      return <Navigate to="/admin/sales/dashboard" replace />;
    } else if (currentAdmin.role === 'support') {
      return <Navigate to="/admin/support/dashboard" replace />;
    } else {
      return <Navigate to="/admin/dashboard" replace />;
    }
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Shield className="h-12 w-12 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-gradient">Admin Portal</h1>
          <p className="text-muted-foreground mt-2">
            Savannah Prime Agency
          </p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Administrator Login</CardTitle>
            <CardDescription>Enter your credentials to access the admin portal</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit(onSubmit)}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@prime.com"
                  autoComplete="email"
                  {...register('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /\S+@\S+\.\S+/,
                      message: 'Invalid email address',
                    },
                  })}
                />
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  autoComplete="current-password"
                  {...register('password', {
                    required: 'Password is required',
                    minLength: {
                      value: 8,
                      message: 'Password must be at least 8 characters',
                    },
                  })}
                />
                {errors.password && (
                  <p className="text-sm text-destructive">{errors.password.message}</p>
                )}
              </div>
              <div className="text-sm bg-muted p-3 rounded-md">
                <p className="font-medium mb-1">Quick Demo Login</p>
                <div className="space-y-2 mt-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm" 
                    className="w-full justify-start"
                    onClick={() => handleDemoLogin('admin')}
                  >
                    <Shield className="mr-2 h-4 w-4 text-primary" />
                    Login as Super Admin
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm" 
                    className="w-full justify-start"
                    onClick={() => handleDemoLogin('sales')}
                  >
                    <Shield className="mr-2 h-4 w-4 text-emerald-500" />
                    Login as Sales Account
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm" 
                    className="w-full justify-start"
                    onClick={() => handleDemoLogin('support')}
                  >
                    <Shield className="mr-2 h-4 w-4 text-blue-500" />
                    Login as Support Staff
                  </Button>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex-col space-y-4">
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <span className="animate-spin mr-2">◌</span>
                    Logging in...
                  </>
                ) : (
                  <>
                    <Lock className="mr-2 h-4 w-4" />
                    Log in
                  </>
                )}
              </Button>
              <Button
                variant="link"
                type="button"
                className="w-full"
                onClick={() => toast.info('Contact your system administrator to reset your password.')}
              >
                Forgot password?
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default AdminLogin;
