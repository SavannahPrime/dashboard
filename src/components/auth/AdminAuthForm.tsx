
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Loader2, Mail, Lock, LucideShieldCheck } from 'lucide-react';
import { verifyAdminEmail, sendOTPEmail, loginAdminWithOTP } from '@/services/adminAuthService';

// Define the form schemas for each step
const emailSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

const otpSchema = z.object({
  otp: z.string().min(6, 'OTP must be at least 6 characters').max(6, 'OTP must be 6 characters'),
});

type EmailFormValues = z.infer<typeof emailSchema>;
type OTPFormValues = z.infer<typeof otpSchema>;

const AdminAuthForm: React.FC = () => {
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [isLoading, setIsLoading] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [userRole, setUserRole] = useState<string | undefined>(undefined);
  const navigate = useNavigate();
  
  // Form for email step
  const emailForm = useForm<EmailFormValues>({
    resolver: zodResolver(emailSchema),
    defaultValues: {
      email: '',
    },
  });
  
  // Form for OTP step
  const otpForm = useForm<OTPFormValues>({
    resolver: zodResolver(otpSchema),
    defaultValues: {
      otp: '',
    },
  });
  
  // Handle email submission
  const onEmailSubmit = async (values: EmailFormValues) => {
    setIsLoading(true);
    try {
      // Verify if email is valid for admin access
      const { valid, role } = await verifyAdminEmail(values.email);
      
      if (!valid) {
        toast.error('Invalid email. Only admin staff can access this panel');
        return;
      }
      
      // Store the email and role for the next step
      setUserEmail(values.email);
      setUserRole(role);
      
      // Send OTP to the email
      const otpSent = await sendOTPEmail(values.email);
      
      if (!otpSent) {
        toast.error('Failed to send OTP. Please try again later');
        return;
      }
      
      toast.success('OTP sent to your email');
      
      // Move to the OTP step
      setStep('otp');
    } catch (error) {
      console.error('Error in email verification:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle OTP submission
  const onOTPSubmit = async (values: OTPFormValues) => {
    setIsLoading(true);
    try {
      // Verify OTP and login
      const { success, message } = await loginAdminWithOTP(userEmail, values.otp);
      
      if (!success) {
        toast.error(message);
        return;
      }
      
      toast.success('Authentication successful');
      
      // Redirect based on user role
      if (userRole === 'super_admin') {
        navigate('/admin/dashboard');
      } else if (userRole === 'sales') {
        navigate('/admin/sales/dashboard');
      } else if (userRole === 'support') {
        navigate('/admin/support/dashboard');
      } else {
        navigate('/admin/dashboard');
      }
    } catch (error) {
      console.error('Error in OTP verification:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle resending the OTP
  const handleResendOTP = async () => {
    setIsLoading(true);
    try {
      const otpSent = await sendOTPEmail(userEmail);
      
      if (!otpSent) {
        toast.error('Failed to resend OTP. Please try again later');
        return;
      }
      
      toast.success('OTP resent to your email');
    } catch (error) {
      console.error('Error resending OTP:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="space-y-1">
        <div className="flex justify-center mb-2">
          <LucideShieldCheck className="h-12 w-12 text-primary" />
        </div>
        <CardTitle className="text-2xl text-center">Admin Authentication</CardTitle>
        <CardDescription className="text-center">
          {step === 'email' 
            ? 'Enter your admin email to proceed' 
            : 'Enter the verification code sent to your email'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {step === 'email' ? (
          <Form {...emailForm}>
            <form onSubmit={emailForm.handleSubmit(onEmailSubmit)} className="space-y-4">
              <FormField
                control={emailForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input 
                          {...field} 
                          placeholder="admin@example.com" 
                          type="email" 
                          className="pl-10"
                          disabled={isLoading}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Continue
              </Button>
            </form>
          </Form>
        ) : (
          <Form {...otpForm}>
            <form onSubmit={otpForm.handleSubmit(onOTPSubmit)} className="space-y-4">
              <FormField
                control={otpForm.control}
                name="otp"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Verification Code</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input 
                          {...field} 
                          placeholder="123456" 
                          type="text" 
                          className="pl-10 text-center tracking-widest"
                          disabled={isLoading}
                          maxLength={6}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Verify
              </Button>
            </form>
          </Form>
        )}
      </CardContent>
      <CardFooter className="flex flex-col items-center gap-2">
        {step === 'otp' && (
          <Button
            variant="link"
            onClick={handleResendOTP}
            disabled={isLoading}
            className="text-sm"
          >
            Didn't receive a code? Resend
          </Button>
        )}
        <Button
          variant="outline"
          onClick={() => step === 'email' ? null : setStep('email')}
          disabled={step === 'email' || isLoading}
          className="w-full mt-2"
        >
          Back to Email
        </Button>
      </CardFooter>
    </Card>
  );
};

export default AdminAuthForm;
