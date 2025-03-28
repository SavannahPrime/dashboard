
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Home, 
  Settings, 
  Package, 
  CreditCard, 
  HelpCircle,
  LogOut,
  User
} from 'lucide-react';
import { cn } from '@/lib/utils';
import LogoutButton from '@/components/common/LogoutButton';

export interface DashboardSidebarProps {
  className?: string;
  onNavClick?: () => void;
}

const DashboardSidebar: React.FC<DashboardSidebarProps> = ({ 
  className,
  onNavClick 
}) => {
  const location = useLocation();
  const { currentUser } = useAuth();
  
  const handleNavClick = () => {
    if (onNavClick) {
      onNavClick();
    }
  };
  
  const navItems = [
    {
      title: 'Dashboard',
      href: '/dashboard',
      icon: <Home className="h-5 w-5" />
    },
    {
      title: 'Services',
      href: '/dashboard/services',
      icon: <Package className="h-5 w-5" />
    },
    {
      title: 'Billing',
      href: '/dashboard/billing',
      icon: <CreditCard className="h-5 w-5" />
    },
    {
      title: 'Support',
      href: '/dashboard/support',
      icon: <HelpCircle className="h-5 w-5" />
    },
    {
      title: 'Settings',
      href: '/dashboard/settings',
      icon: <Settings className="h-5 w-5" />
    }
  ];
  
  return (
    <div className={cn("flex flex-col w-64 h-full border-r bg-card", className)}>
      {/* Logo */}
      <div className="px-6 py-5 flex items-center h-16 border-b">
        <NavLink to="/dashboard" className="flex items-center">
          <span className="text-xl font-bold">Prime Dashboard</span>
        </NavLink>
      </div>
      
      {/* User Profile */}
      <div className="p-4 border-b">
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
            {currentUser?.email ? (
              <span className="text-sm font-medium text-primary">
                {currentUser.email.charAt(0).toUpperCase()}
              </span>
            ) : (
              <User className="h-5 w-5 text-primary" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">
              {currentUser?.email || 'User'}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              Client
            </p>
          </div>
        </div>
      </div>
      
      {/* Navigation Items */}
      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.href;
          
          return (
            <NavLink
              key={item.href}
              to={item.href}
              onClick={handleNavClick}
              className={({ isActive }) =>
                cn(
                  "flex items-center px-4 py-2 text-sm rounded-md transition-colors",
                  {
                    "bg-primary text-primary-foreground": isActive,
                    "text-muted-foreground hover:text-foreground hover:bg-muted": !isActive
                  }
                )
              }
            >
              <span className="mr-3">{item.icon}</span>
              {item.title}
            </NavLink>
          );
        })}
      </nav>
      
      {/* Logout Button */}
      <div className="p-4 border-t">
        <LogoutButton className="w-full justify-start" variant="ghost">
          <LogOut className="h-5 w-5 mr-3" />
          <span>Logout</span>
        </LogoutButton>
      </div>
    </div>
  );
};

export default DashboardSidebar;
