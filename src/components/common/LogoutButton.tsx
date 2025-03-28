
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { LogOut, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { useAdminAuth } from '@/contexts/AdminAuthContext';

interface LogoutButtonProps {
  isAdminLogout?: boolean;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link' | 'success' | 'warning';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  children?: React.ReactNode;
}

const LogoutButton: React.FC<LogoutButtonProps> = ({ 
  isAdminLogout = false, 
  variant = 'ghost',
  size = 'default',
  className = '',
  children
}) => {
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { logout: clientLogout } = useAuth();
  const { logout: adminLogout } = useAdminAuth();
  
  const handleLogout = () => {
    if (isLoggingOut) return; // Prevent multiple clicks
    
    setIsLoggingOut(true);
    
    try {
      // Navigate immediately to reduce perceived delay
      if (isAdminLogout) {
        navigate('/admin/login');
        // Perform logout after navigation starts
        setTimeout(() => {
          adminLogout().finally(() => {
            setIsLoggingOut(false);
            toast.success('Successfully logged out');
          });
        }, 0);
      } else {
        navigate('/login');
        // Perform logout after navigation starts
        setTimeout(() => {
          clientLogout().finally(() => {
            setIsLoggingOut(false);
            toast.success('Successfully logged out');
          });
        }, 0);
      }
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Failed to log out. Please try again.');
      setIsLoggingOut(false);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleLogout}
      className={className}
      disabled={isLoggingOut}
    >
      {isLoggingOut ? (
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
      ) : (
        children || (
          <>
            <LogOut className="h-4 w-4 mr-2" />
            Log Out
          </>
        )
      )}
    </Button>
  );
};

export default LogoutButton;
