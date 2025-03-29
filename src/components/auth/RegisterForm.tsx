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
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

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
});

interface RegisterFormProps extends React.HTMLAttributes<HTMLDivElement> {}

const RegisterForm: React.FC<RegisterFormProps> = ({ className, ...props }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
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
      // Update this call to remove the role parameter or add it to the function signature
      const result = await signUp(values.email, values.password, values.name);
      
      if (result.error) {
        setError(result.error);
      } else {
        router('/login');
        toast.success('Registration successful! Please check your email to verify your account.');
      }
    } catch (error) {
      console.error('Registration error:', error);
      setError('An unexpected error occurred during registration.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className={cn('w-[350px]', className)} {...props}>
      <CardHeader>
        <CardTitle>Create an account</CardTitle>
        <CardDescription>
          Enter your email below to create your account
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
        {error && <p className="text-sm text-red-500">{error}</p>}
      </CardContent>
      <CardFooter>
        <Button disabled={isLoading} className="w-full" onClick={handleSubmit(onSignUp)}>
          {isLoading ? 'Loading ...' : 'Create account'}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default RegisterForm;
