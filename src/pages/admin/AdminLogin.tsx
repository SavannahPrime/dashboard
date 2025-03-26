import React, { useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useForm, SubmitHandler } from 'react-hook-form';
import { Shield, Lock, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

type FormValues = {
  email: string;
  password: string;
};

const ADMIN_CREDENTIALS = {
  admin: {
    email: 'admin@savannahprimeagency.tech',
    password: 'SavannahPrime@Admin2024',
    name: 'Super Admin',
    role: 'super_admin',
    permissions: ['all']
  },
  sales: {
    email: 'sales@savannahprimeagency.tech',
    password: 'SavannahPrime@Sales2024',
    name: 'Sales Account',
    role: 'sales',
    permissions: ['view_clients', 'view_sales', 'edit_clients', 'view_reports']
  },
  support: {
    email: 'support@savannahprimeagency.tech',
    password: 'SavannahPrime@Support2024',
    name: 'Support Staff',
    role: 'support',
    permissions: ['view_clients', 'view_tickets', 'reply_tickets', 'impersonate']
  }
};

const AdminLogin: React.FC = () => {
  const { isAuthenticated, isLoading, login, currentAdmin } = useAdminAuth();
  const navigate = useNavigate();
  
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>();
  
  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    try {
      await login(data.email, data.password);
    } catch (error) {
      console.error('Login error:', error);
    }
  };
  
  useEffect(() => {
    if (isAuthenticated && !isLoading && currentAdmin) {
      if (currentAdmin.role === 'sales') {
        navigate('/admin/sales/dashboard', { replace: true });
      } else if (currentAdmin.role === 'support') {
        navigate('/admin/support/dashboard', { replace: true });
      } else {
        navigate('/admin/dashboard', { replace: true });
      }
    }
  }, [isAuthenticated, isLoading, currentAdmin, navigate]);
  
  const handleProfessionalLogin = async (role: string) => {
    const credentials = ADMIN_CREDENTIALS[role as keyof typeof ADMIN_CREDENTIALS];
    
    if (!credentials) {
      toast.error('Invalid role selected');
      return;
    }
    
    try {
      toast.loading('Logging in as ' + credentials.name);
      
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });
      
      if (signInError) {
        console.log('Sign in failed, creating account:', signInError.message);
        
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: credentials.email,
          password: credentials.password,
        });
        
        if (signUpError) {
          throw signUpError;
        }
        
        if (signUpData.user) {
          const { error: insertError } = await supabase
            .from('admin_users')
            .upsert({
              id: signUpData.user.id,
              email: credentials.email,
              name: credentials.name,
              role: credentials.role,
              permissions: credentials.permissions,
              profile_image: `https://ui-avatars.com/api/?name=${credentials.name.replace(' ', '+')}&background=2c5cc5&color=fff`
            });
          
          if (insertError) {
            console.error('Error creating admin user in database:', insertError);
            throw insertError;
          }
        }
        
        const { error: secondSignInError } = await supabase.auth.signInWithPassword({
          email: credentials.email,
          password: credentials.password,
        });
        
        if (secondSignInError) {
          throw secondSignInError;
        }
      }
      
      await login(credentials.email, credentials.password);
      toast.success(`Welcome, ${credentials.name}!`);
      
    } catch (error) {
      console.error('Professional login error:', error);
      toast.dismiss();
      
      if (error instanceof Error) {
        toast.error(`Login failed: ${error.message}`);
      } else {
        toast.error('Login failed. Please try again.');
      }
    }
  };
  
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
                  placeholder="admin@savannahprimeagency.tech"
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
                <p className="font-medium mb-1">Quick Account Access</p>
                <div className="space-y-2 mt-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm" 
                    className="w-full justify-start"
                    onClick={() => handleProfessionalLogin('admin')}
                  >
                    <Shield className="mr-2 h-4 w-4 text-primary" />
                    Login as Super Admin
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm" 
                    className="w-full justify-start"
                    onClick={() => handleProfessionalLogin('sales')}
                  >
                    <Shield className="mr-2 h-4 w-4 text-emerald-500" />
                    Login as Sales Account
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm" 
                    className="w-full justify-start"
                    onClick={() => handleProfessionalLogin('support')}
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
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
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
