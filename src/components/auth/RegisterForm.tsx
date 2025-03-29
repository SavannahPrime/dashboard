
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { signUp } from '@/integrations/supabase/auth';
import { cn } from '@/lib/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';

const formSchema = z.object({
  name: z.string().min(2, {
    message: 'Name must be at least 2 characters.',
  }),
  email: z.string().email({
    message: 'Please enter a valid email address.',
  }),
  password: z.string().min(8, {
    message: 'Password must be at least 8 characters.',
  }),
  phone: z.string().optional(),
  address: z.string().optional(),
});

interface RegisterFormProps extends React.HTMLAttributes<HTMLDivElement> {}

const RegisterForm: React.FC<RegisterFormProps> = ({ className, ...props }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  const onSignUp = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    setError('');
    
    try {
      // Call the signUp function with all user details
      const result = await signUp(
        values.email, 
        values.password, 
        values.name,
        values.phone,
        values.address
      );
      
      if (result.error) {
        throw new Error(result.error);
      }
      
      // Success message
      toast({
        title: "Registration successful!",
        description: "Please check your email and login to your account.",
        variant: "default",
      });
      
      // Navigate to login page
      navigate('/login');
    } catch (error: any) {
      console.error('Registration error:', error);
      setError(error.message || 'An unexpected error occurred during registration.');
      
      toast({
        title: "Registration failed",
        description: error.message || "There was a problem creating your account.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className={cn('w-[350px]', className)} {...props}>
      <CardHeader>
        <CardTitle>Create an account</CardTitle>
        <CardDescription>
          Enter your details below to create your account
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            placeholder="Enter your name"
            type="text"
            aria-invalid={!!errors.name}
            {...register('name')}
          />
          {errors?.name && (
            <p className="text-sm text-red-500">{errors.name?.message}</p>
          )}
        </div>
        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            placeholder="Enter your email"
            type="email"
            autoCapitalize="none"
            autoComplete="email"
            aria-invalid={!!errors.email}
            {...register('email')}
          />
          {errors?.email && (
            <p className="text-sm text-red-500">{errors.email?.message}</p>
          )}
        </div>
        <div className="grid gap-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            placeholder="Enter your password"
            type="password"
            aria-invalid={!!errors.password}
            {...register('password')}
          />
          {errors?.password && (
            <p className="text-sm text-red-500">{errors.password?.message}</p>
          )}
        </div>
        <div className="grid gap-2">
          <Label htmlFor="phone">Phone (Optional)</Label>
          <Input
            id="phone"
            placeholder="Enter your phone number"
            type="tel"
            {...register('phone')}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="address">Address (Optional)</Label>
          <Input
            id="address"
            placeholder="Enter your address"
            type="text"
            {...register('address')}
          />
        </div>
        {error && <p className="text-sm text-red-500">{error}</p>}
      </CardContent>
      <CardFooter>
        <Button disabled={isLoading} className="w-full" onClick={handleSubmit(onSignUp)}>
          {isLoading ? 'Creating account...' : 'Create account'}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default RegisterForm;
