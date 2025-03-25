
import React from 'react';
import { Navigate } from 'react-router-dom';
import RegisterForm from '@/components/auth/RegisterForm';
import { useAuth } from '@/contexts/AuthContext';

const Register: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  
  // Redirect if already authenticated
  if (isAuthenticated && !isLoading) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gradient">Savannah Prime</h1>
          <p className="text-muted-foreground mt-2">
            Create an account to get started
          </p>
        </div>
        <div className="bg-card shadow-lg rounded-xl p-6 border">
          <RegisterForm />
        </div>
      </div>
    </div>
  );
};

export default Register;
