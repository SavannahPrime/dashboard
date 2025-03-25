
import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  LayoutDashboard,
  LayoutGrid,
  CreditCard,
  Settings,
  LifeBuoy,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Moon,
  Sun,
} from 'lucide-react';

interface SidebarLinkProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  isCollapsed: boolean;
}

const SidebarLink: React.FC<SidebarLinkProps> = ({ to, icon, label, isCollapsed }) => {
  return (
    <NavLink
      to={to}
      className={({ isActive }) => `
        flex items-center p-3 rounded-md transition-colors
        ${isActive ? 'bg-primary text-primary-foreground' : 'hover:bg-secondary'}
        ${isCollapsed ? 'justify-center' : ''}
      `}
    >
      {icon}
      {!isCollapsed && <span className="ml-3">{label}</span>}
    </NavLink>
  );
};

const DashboardSidebar: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { currentUser, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div
      className={`h-screen sticky top-0 flex flex-col bg-card border-r transition-all duration-300 ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Logo */}
      <div className="p-4 flex items-center justify-between border-b">
        {!isCollapsed && (
          <div className="text-xl font-bold">Savannah Prime</div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleCollapse}
          className={isCollapsed ? 'mx-auto' : ''}
        >
          {isCollapsed ? <ChevronRight /> : <ChevronLeft />}
        </Button>
      </div>

      {/* User Profile */}
      <div className={`p-4 border-b ${isCollapsed ? 'text-center' : ''}`}>
        <div className={`flex ${isCollapsed ? 'flex-col items-center' : 'items-center'}`}>
          <Avatar className="h-10 w-10">
            <AvatarImage src={currentUser?.profileImage} alt={currentUser?.name} />
            <AvatarFallback>
              {currentUser?.name?.charAt(0) || 'U'}
            </AvatarFallback>
          </Avatar>
          {!isCollapsed && (
            <div className="ml-3">
              <div className="font-medium">{currentUser?.name}</div>
              <div className="text-xs text-muted-foreground">{currentUser?.email}</div>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        <SidebarLink
          to="/dashboard"
          icon={<LayoutDashboard className="h-5 w-5" />}
          label="Dashboard"
          isCollapsed={isCollapsed}
        />
        <SidebarLink
          to="/dashboard/services"
          icon={<LayoutGrid className="h-5 w-5" />}
          label="My Services"
          isCollapsed={isCollapsed}
        />
        <SidebarLink
          to="/dashboard/billing"
          icon={<CreditCard className="h-5 w-5" />}
          label="Payments & Billing"
          isCollapsed={isCollapsed}
        />
        <SidebarLink
          to="/dashboard/settings"
          icon={<Settings className="h-5 w-5" />}
          label="Profile Settings"
          isCollapsed={isCollapsed}
        />
        <SidebarLink
          to="/dashboard/support"
          icon={<LifeBuoy className="h-5 w-5" />}
          label="Support"
          isCollapsed={isCollapsed}
        />
      </div>

      {/* Footer */}
      <div className="p-4 border-t space-y-2">
        <Button
          variant="ghost"
          size={isCollapsed ? 'icon' : 'default'}
          onClick={toggleTheme}
          className={`w-full justify-${isCollapsed ? 'center' : 'start'}`}
        >
          {theme === 'light' ? (
            <>
              <Moon className="h-5 w-5" />
              {!isCollapsed && <span className="ml-3">Dark Mode</span>}
            </>
          ) : (
            <>
              <Sun className="h-5 w-5" />
              {!isCollapsed && <span className="ml-3">Light Mode</span>}
            </>
          )}
        </Button>
        <Button
          variant="ghost"
          size={isCollapsed ? 'icon' : 'default'}
          onClick={handleLogout}
          className={`w-full justify-${isCollapsed ? 'center' : 'start'} hover:text-destructive`}
        >
          <LogOut className="h-5 w-5" />
          {!isCollapsed && <span className="ml-3">Logout</span>}
        </Button>
      </div>
    </div>
  );
};

export default DashboardSidebar;
