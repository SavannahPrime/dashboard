
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  User,
  Users,
  ShieldCheck,
  HeadphonesIcon,
  BarChartIcon,
  ChevronDown,
  CircleUserRound
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import sessionManager, { UserRole } from '@/lib/sessionManager';
import { useAuth } from '@/contexts/AuthContext';
import { useAdminAuth } from '@/contexts/AdminAuthContext';

interface SessionSwitcherProps {
  variant?: 'default' | 'outline' | 'ghost';
  className?: string;
}

const SessionSwitcher: React.FC<SessionSwitcherProps> = ({ 
  variant = 'outline',
  className = ''
}) => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { currentAdmin } = useAdminAuth();
  const [activeRoles, setActiveRoles] = React.useState<UserRole[]>([]);
  const [isOpen, setIsOpen] = React.useState(false);

  // Get role icon
  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return <ShieldCheck className="h-4 w-4 mr-2 text-primary" />;
      case 'sales':
        return <BarChartIcon className="h-4 w-4 mr-2 text-emerald-500" />;
      case 'support':
        return <HeadphonesIcon className="h-4 w-4 mr-2 text-blue-500" />;
      case 'client':
      default:
        return <User className="h-4 w-4 mr-2 text-orange-500" />;
    }
  };

  // Get current active session
  const getCurrentActiveSession = (): UserRole | null => {
    if (currentAdmin) {
      if (currentAdmin.role === 'super_admin') return 'admin';
      if (currentAdmin.role === 'sales') return 'sales';
      if (currentAdmin.role === 'support') return 'support';
    }
    if (currentUser) return 'client';
    return null;
  };

  // Get role display name
  const getRoleName = (role: UserRole): string => {
    switch (role) {
      case 'admin':
        return 'Admin';
      case 'sales':
        return 'Sales';
      case 'support':
        return 'Support';
      case 'client':
        return 'Client';
      default:
        return role;
    }
  };

  // Update active roles when component mounts
  React.useEffect(() => {
    const checkActiveSessions = () => {
      const roles = sessionManager.getActiveRoles();
      setActiveRoles(roles);
    };

    checkActiveSessions();
    // Check periodically for session changes
    const intervalId = setInterval(checkActiveSessions, 10000);
    
    return () => clearInterval(intervalId);
  }, [currentUser, currentAdmin]);

  // Switch to a different role
  const switchToRole = (role: UserRole) => {
    // Exit if already active
    if (getCurrentActiveSession() === role) {
      setIsOpen(false);
      return;
    }
    
    // Navigate to appropriate dashboard based on role
    switch (role) {
      case 'admin':
        navigate('/admin/dashboard');
        break;
      case 'sales':
        navigate('/admin/sales/dashboard');
        break;
      case 'support':
        navigate('/admin/support/dashboard');
        break;
      case 'client':
        navigate('/dashboard');
        break;
    }
    
    setIsOpen(false);
  };

  // If no sessions, don't render
  if (activeRoles.length <= 0) return null;

  // If only one session, don't render switcher
  if (activeRoles.length === 1 && (activeRoles[0] === getCurrentActiveSession())) return null;

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant={variant} className={`flex items-center space-x-1 ${className}`}>
          <Users className="h-4 w-4 mr-1" />
          <span>Accounts</span>
          <Badge variant="secondary" className="ml-1 text-xs px-1">
            {activeRoles.length}
          </Badge>
          <ChevronDown className="h-4 w-4 ml-1" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-2">
        <div className="space-y-1">
          <div className="text-xs font-medium text-muted-foreground px-2 py-1">
            Active Sessions
          </div>
          
          {activeRoles.map(role => {
            const isActive = getCurrentActiveSession() === role;
            const userName = role === 'client' 
              ? (currentUser?.name || 'Client User') 
              : (currentAdmin?.name || 'Admin User');
            
            return (
              <Button
                key={role}
                variant={isActive ? 'secondary' : 'ghost'}
                className="w-full justify-start text-left"
                onClick={() => switchToRole(role)}
              >
                {getRoleIcon(role)}
                <div className="flex flex-col items-start">
                  <span className="text-sm">{getRoleName(role)}</span>
                  {isActive && <span className="text-xs text-muted-foreground">{userName}</span>}
                </div>
                {isActive && (
                  <Badge variant="outline" className="ml-auto">
                    Active
                  </Badge>
                )}
              </Button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default SessionSwitcher;
