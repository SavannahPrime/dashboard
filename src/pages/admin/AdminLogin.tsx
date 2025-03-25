
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
                <p className="font-medium mb-1">Sample Credentials</p>
                <ul className="space-y-1 text-muted-foreground">
                  <li><span className="font-medium">Super Admin:</span> admin@prime.com / PrimeAdmin@2024</li>
                  <li><span className="font-medium">Sales:</span> sales@prime.com / PrimeSales@2024</li>
                  <li><span className="font-medium">Support:</span> support@prime.com / PrimeSupport@2024</li>
                </ul>
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
