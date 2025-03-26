
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { serviceOptions } from '@/lib/services-data';
import { Checkbox } from '@/components/ui/checkbox';
import { ChevronLeft, ChevronRight, Eye, EyeOff, Globe, LayoutGrid, Cpu, BarChart, Paintbrush, Loader2, Check } from 'lucide-react';
import { toast } from 'sonner';

const icons: Record<string, React.ReactNode> = {
  'globe': <Globe className="h-6 w-6" />,
  'layout-grid': <LayoutGrid className="h-6 w-6" />,
  'cpu': <Cpu className="h-6 w-6" />,
  'bar-chart': <BarChart className="h-6 w-6" />,
  'paintbrush': <Paintbrush className="h-6 w-6" />,
};

const RegisterForm: React.FC = () => {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [registrationError, setRegistrationError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const validatePassword = (password: string) => {
    if (password.length < 8) {
      return 'Password must be at least 8 characters long';
    }
    if (!/[A-Z]/.test(password)) {
      return 'Password must contain at least one uppercase letter';
    }
    if (!/[0-9]/.test(password)) {
      return 'Password must contain at least one number';
    }
    if (!/[!@#$%^&*]/.test(password)) {
      return 'Password must contain at least one special character (!, @, #, $, %, ^, &, *)';
    }
    return '';
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    setPasswordError(validatePassword(newPassword));
  };

  const handleNextStep = () => {
    if (step === 1) {
      // Validate first step
      if (!name || !email || !password || password !== confirmPassword || passwordError) {
        return;
      }
      setStep(2);
    }
  };

  const handlePrevStep = () => {
    if (step === 2) {
      setStep(1);
    }
  };

  const toggleService = (serviceId: string) => {
    if (selectedServices.includes(serviceId)) {
      setSelectedServices(selectedServices.filter(id => id !== serviceId));
    } else {
      setSelectedServices([...selectedServices, serviceId]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedServices.length === 0) {
      toast.error('Please select at least one service');
      return;
    }
    
    setIsSubmitting(true);
    setRegistrationError('');
    
    try {
      // Convert service IDs to their title names for the auth context
      const serviceNames = selectedServices.map(id => {
        const service = serviceOptions.find(s => s.id === id);
        return service ? service.title : '';
      }).filter(Boolean);
      
      await register(email, password, name, serviceNames);
      toast.success('Registration successful! Redirecting to dashboard...');
      navigate('/dashboard');
    } catch (error) {
      console.error('Registration error:', error);
      if (error instanceof Error) {
        setRegistrationError(error.message);
        toast.error(`Registration failed: ${error.message}`);
      } else {
        setRegistrationError('An unknown error occurred during registration');
        toast.error('Registration failed. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto animate-fade-in">
      <form onSubmit={handleSubmit} className="space-y-6">
        {step === 1 ? (
          // Step 1: Personal Information
          <>
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="h-12"
              />
            </div>
            
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
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={handlePasswordChange}
                  required
                  className="h-12 pr-10"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              {passwordError && (
                <p className="text-sm text-destructive mt-1">{passwordError}</p>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                Password must be at least 8 characters with uppercase, number, and special character
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="h-12"
              />
              {password && confirmPassword && password !== confirmPassword && (
                <p className="text-sm text-destructive mt-1">Passwords do not match</p>
              )}
            </div>
            
            <Button 
              type="button" 
              onClick={handleNextStep}
              disabled={!name || !email || !password || password !== confirmPassword || !!passwordError}
              className="w-full h-12"
            >
              Continue
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </>
        ) : (
          // Step 2: Service Selection
          <>
            <div className="text-center mb-6">
              <h3 className="text-lg font-medium">Select Services</h3>
              <p className="text-sm text-muted-foreground">Choose the services you're interested in</p>
            </div>
            
            {registrationError && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md text-destructive text-sm mb-4">
                {registrationError}
              </div>
            )}
            
            <div className="grid grid-cols-1 gap-4 mb-6">
              {serviceOptions.map((service) => (
                <div 
                  key={service.id} 
                  className={`cursor-pointer transition-all border rounded-lg ${
                    selectedServices.includes(service.id) 
                      ? 'border-primary ring-2 ring-primary/20' 
                      : 'hover:border-primary/50'
                  }`}
                  onClick={() => toggleService(service.id)}
                >
                  <div className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        <div className="p-2 rounded-full bg-primary/10 text-primary">
                          {icons[service.icon]}
                        </div>
                        <h3 className="text-base font-medium">{service.title}</h3>
                      </div>
                      <div className="flex items-center justify-center w-5 h-5 rounded-full border">
                        {selectedServices.includes(service.id) && (
                          <Check className="h-3 w-3 text-primary" />
                        )}
                      </div>
                    </div>
                    <div className="mt-2">
                      <p className="text-sm text-muted-foreground">{service.description}</p>
                      <p className="font-medium mt-1">
                        ${service.price}/{service.priceUnit}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="flex space-x-3">
              <Button 
                type="button" 
                variant="outline" 
                onClick={handlePrevStep}
                className="flex-1 h-12"
              >
                <ChevronLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              
              <Button 
                type="submit" 
                disabled={selectedServices.length === 0 || isSubmitting}
                className="flex-1 h-12"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  'Complete Registration'
                )}
              </Button>
            </div>
          </>
        )}
        
        <div className="text-center text-sm">
          Already have an account?{' '}
          <Link to="/login" className="text-primary font-medium hover:underline">
            Sign in
          </Link>
        </div>
      </form>
    </div>
  );
};

export default RegisterForm;
