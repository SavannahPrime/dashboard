
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  LayoutDashboard, 
  Users, 
  Settings, 
  FileBarChart, 
  MessageSquare, 
  Shield, 
  CreditCard, 
  Package, 
  LogOut, 
  ChevronLeft, 
  ChevronRight 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';

const AdminSidebar: React.FC = () => {
  const { currentAdmin, logout } = useAdminAuth();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const navigationItems = [
    {
      name: 'Dashboard',
      path: '/admin/dashboard',
      icon: LayoutDashboard,
      showFor: ['super_admin', 'sales', 'support']
    },
    {
      name: 'User Management',
      path: '/admin/users',
      icon: Users,
      showFor: ['super_admin', 'sales', 'support']
    },
    {
      name: 'Service Configuration',
      path: '/admin/services',
      icon: Package,
      showFor: ['super_admin']
    },
    {
      name: 'Financial Overview',
      path: '/admin/finance',
      icon: CreditCard,
      showFor: ['super_admin', 'sales']
    },
    {
      name: 'Communication Center',
      path: '/admin/communications',
      icon: MessageSquare,
      showFor: ['super_admin', 'support']
    },
    {
      name: 'Analytics & Reports',
      path: '/admin/analytics',
      icon: FileBarChart,
      showFor: ['super_admin', 'sales']
    },
    {
      name: 'System Settings',
      path: '/admin/settings',
      icon: Settings,
      showFor: ['super_admin']
    },
  ];

  // Filter navigation items based on user role
  const filteredNavigationItems = navigationItems.filter(item => 
    item.showFor.includes(currentAdmin?.role || '')
  );

  return (
    <aside 
      className={cn(
        "bg-card border-r border-border flex flex-col transition-all duration-300 h-screen",
        collapsed ? "w-[70px]" : "w-[250px]"
      )}
    >
      <div className="p-4 flex justify-between items-center">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            <span className="font-bold text-lg">Admin Portal</span>
          </div>
        )}
        {collapsed && <Shield className="h-6 w-6 text-primary mx-auto" />}
        <Button 
          variant="ghost" 
          size="icon" 
          className="ml-auto" 
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </Button>
      </div>

      <Separator />

      <div className="p-4">
        {!collapsed && (
          <div className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 rounded-full overflow-hidden">
              <img 
                src={currentAdmin?.profileImage || 'https://ui-avatars.com/api/?name=Admin+User'}
                alt="Admin avatar"
                className="h-full w-full object-cover"
              />
            </div>
            <div className="overflow-hidden">
              <p className="font-medium truncate">{currentAdmin?.name}</p>
              <p className="text-xs text-muted-foreground truncate">{currentAdmin?.role.replace('_', ' ')}</p>
            </div>
          </div>
        )}
        {collapsed && (
          <div className="flex justify-center mb-6">
            <div className="h-10 w-10 rounded-full overflow-hidden">
              <img 
                src={currentAdmin?.profileImage || 'https://ui-avatars.com/api/?name=Admin+User'}
                alt="Admin avatar"
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        )}
      </div>

      <ScrollArea className="flex-1">
        <div className="px-2">
          <nav className="flex flex-col gap-1">
            {filteredNavigationItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md transition-colors",
                  "hover:bg-muted",
                  location.pathname === item.path ? "bg-accent text-accent-foreground" : "text-foreground"
                )}
              >
                <item.icon className="h-5 w-5 shrink-0" />
                {!collapsed && <span>{item.name}</span>}
              </Link>
            ))}
          </nav>
        </div>
      </ScrollArea>

      <div className="p-4 mt-auto">
        <Button 
          variant="ghost" 
          className={cn(
            "w-full flex items-center gap-3", 
            collapsed ? "justify-center" : "justify-start"
          )}
          onClick={logout}
        >
          <LogOut className="h-5 w-5" />
          {!collapsed && <span>Log Out</span>}
        </Button>
      </div>
    </aside>
  );
};

export default AdminSidebar;
