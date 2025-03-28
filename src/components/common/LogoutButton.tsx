
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { LogOut, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { useAdminAuth } from '@/contexts/AdminAuthContext';

interface LogoutButtonProps {
  isAdminLogout?: boolean;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
}

const LogoutButton: React.FC<LogoutButtonProps> = ({ 
  isAdminLogout = false, 
  variant = 'ghost',
  size = 'default',
  className = ''
}) => {
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { logout: clientLogout } = useAuth();
  const { logout: adminLogout } = useAdminAuth();
  
  const handleLogout = async () => {
    if (isLoggingOut) return; // Prevent multiple clicks
    
    try {
      setIsLoggingOut(true);
      toast.loading('Logging out...');
      
      if (isAdminLogout) {
        await adminLogout();
        // Short delay to ensure state is updated
        setTimeout(() => {
          navigate('/admin/login');
        }, 100);
      } else {
        await clientLogout();
        setTimeout(() => {
          navigate('/login');
        }, 100);
      }
      
      toast.dismiss();
      toast.success('Successfully logged out');
    } catch (error) {
      console.error('Logout error:', error);
      toast.dismiss();
      toast.error('Failed to log out. Please try again.');
    } finally {
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
        <LogOut className="h-4 w-4 mr-2" />
      )}
      Log Out
    </Button>
  );
};

export default LogoutButton;
