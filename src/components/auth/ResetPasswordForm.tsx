
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { ChevronLeft, Loader2, CheckCircle } from 'lucide-react';

const ResetPasswordForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { resetPassword } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await resetPassword(email);
      setIsSuccess(true);
    } catch (error) {
      // Error is handled in the AuthContext
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="w-full max-w-md mx-auto text-center space-y-6 animate-fade-in">
        <div className="flex justify-center">
          <div className="rounded-full bg-primary/10 p-4">
            <CheckCircle className="h-12 w-12 text-primary" />
          </div>
        </div>
        <h2 className="text-2xl font-bold">Check your email</h2>
        <p className="text-muted-foreground">
          We've sent a password reset link to <span className="font-medium">{email}</span>.
          Please check your inbox and follow the instructions to reset your password.
        </p>
        <div className="pt-4">
          <p className="text-sm text-muted-foreground">
            Didn't receive the email? Check your spam folder or{' '}
            <button
              type="button"
              onClick={() => setIsSuccess(false)}
              className="text-primary-blue hover:underline"
            >
              try again
            </button>
          </p>
        </div>
        <div className="pt-4">
          <Link to="/login" className="text-primary-blue hover:underline text-sm">
            <ChevronLeft className="inline h-4 w-4 mr-1" />
            Back to login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto animate-fade-in">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="name@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="h-12"
          />
        </div>
        
        <Button type="submit" disabled={isSubmitting} className="w-full h-12">
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Sending Reset Link...
            </>
          ) : (
            'Send Reset Link'
          )}
        </Button>
        
        <div className="text-center">
          <Link to="/login" className="text-primary-blue hover:underline text-sm">
            <ChevronLeft className="inline h-4 w-4 mr-1" />
            Back to login
          </Link>
        </div>
      </form>
    </div>
  );
};

export default ResetPasswordForm;
