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
  User,
  Moon,
  ChevronDown
} from 'lucide-react';
import { cn } from '@/lib/utils';
import LogoutButton from '@/components/common/LogoutButton';
import { Badge } from '@/components/ui/badge';

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
    <div className={cn("flex flex-col w-64 h-full border-r border-[#2a3347] bg-[#0f1523]", className)}>
      {/* Logo */}
      <div className="px-6 py-5 flex items-center h-16 border-b border-[#2a3347]">
        <NavLink to="/dashboard" className="flex items-center">
          <span className="text-xl font-bold">Savannah Prime</span>
        </NavLink>
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
                    "bg-[#4086f4] text-white": isActive,
                    "text-[#8a9cb0] hover:text-white hover:bg-[#172138]": !isActive
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
      
      {/* My Account Section */}
      <div className="px-4 py-2 mt-4">
        <div className="text-[#8a9cb0] text-sm font-medium mb-2">My Account</div>
        <NavLink 
          to="/dashboard/settings/profile" 
          className={({ isActive }) =>
            cn(
              "flex items-center px-4 py-2 text-sm rounded-md transition-colors",
              {
                "bg-[#4086f4] text-white": isActive,
                "text-[#8a9cb0] hover:text-white hover:bg-[#172138]": !isActive
              }
            )
          }
        >
          <User className="h-5 w-5 mr-3" />
          Profile
        </NavLink>
        
        <NavLink 
          to="/dashboard/billing" 
          className={({ isActive }) =>
            cn(
              "flex items-center px-4 py-2 text-sm rounded-md transition-colors",
              {
                "bg-[#4086f4] text-white": isActive,
                "text-[#8a9cb0] hover:text-white hover:bg-[#172138]": !isActive
              }
            )
          }
        >
          <CreditCard className="h-5 w-5 mr-3" />
          Billing
        </NavLink>
        
        <NavLink 
          to="/dashboard/support" 
          className={({ isActive }) =>
            cn(
              "flex items-center px-4 py-2 text-sm rounded-md transition-colors",
              {
                "bg-[#4086f4] text-white": isActive,
                "text-[#8a9cb0] hover:text-white hover:bg-[#172138]": !isActive
              }
            )
          }
        >
          <HelpCircle className="h-5 w-5 mr-3" />
          Support
        </NavLink>
        
        <button className="w-full flex items-center px-4 py-2 text-sm rounded-md text-[#8a9cb0] hover:text-white hover:bg-[#172138] transition-colors">
          <Moon className="h-5 w-5 mr-3" />
          Light Mode
        </button>
      </div>
      
      {/* User Profile & Logout Button */}
      <div className="p-4 border-t border-[#2a3347]">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <div className="h-10 w-10 rounded-full bg-[#4086f4] flex items-center justify-center text-white font-medium">
              {currentUser?.email ? currentUser.email.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium truncate max-w-[120px]">
                {currentUser?.email?.split('@')[0] || '2206120'}
              </p>
              <Badge className="mt-1 bg-[#4086f4] text-white">client</Badge>
            </div>
          </div>
          <button className="text-[#8a9cb0] hover:text-white">
            <ChevronDown className="h-5 w-5" />
          </button>
        </div>
        
        <LogoutButton className="w-full justify-start" variant="outline">
          <LogOut className="h-5 w-5 mr-3" />
          <span>Log Out</span>
        </LogoutButton>
      </div>
    </div>
  );
};

export default DashboardSidebar;
