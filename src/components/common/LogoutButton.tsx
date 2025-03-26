
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { useAdminAuth } from '@/contexts/AdminAuthContext';

interface LogoutButtonProps {
  adminLogout?: boolean;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
}

const LogoutButton: React.FC<LogoutButtonProps> = ({ 
  adminLogout = false, 
  variant = 'ghost',
  size = 'default',
  className = ''
}) => {
  const navigate = useNavigate();
  const { logout: clientLogout } = useAuth();
  const { logout: adminLogout } = useAdminAuth();
  
  const handleLogout = async () => {
    try {
      toast.loading('Logging out...');
      
      if (adminLogout) {
        await adminLogout();
        navigate('/admin/login');
      } else {
        await clientLogout();
        navigate('/login');
      }
      
      toast.dismiss();
      toast.success('Successfully logged out');
    } catch (error) {
      console.error('Logout error:', error);
      toast.dismiss();
      toast.error('Failed to log out. Please try again.');
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleLogout}
      className={className}
    >
      <LogOut className="h-4 w-4 mr-2" />
      Log Out
    </Button>
  );
};

export default LogoutButton;
