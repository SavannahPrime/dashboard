
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Bell, User, Settings, HelpCircle, ChevronDown } from 'lucide-react';
import LogoutButton from '@/components/common/LogoutButton';
import SessionSwitcher from '@/components/common/SessionSwitcher';

interface DashboardHeaderProps {
  pageTitle: string;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ pageTitle }) => {
  const { currentUser } = useAuth();
  const [notifications, setNotifications] = React.useState<any[]>([]);
  
  React.useEffect(() => {
    // Simulate loading notifications
    const demoNotifications = [
      { id: 1, title: 'Welcome to Savannah Prime!', read: false },
      { id: 2, title: 'Your subscription is active', read: true },
      { id: 3, title: 'New service available', read: false }
    ];
    
    // Set demo notifications
    setNotifications(demoNotifications);
  }, []);
  
  const unreadCount = notifications.filter(n => !n.read).length;
  const initials = currentUser?.name ? currentUser.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'U';
  
  return (
    <div className="flex flex-col">
      <header className="sticky top-0 z-30 h-16 flex items-center justify-between border-b bg-background px-6">
        <div className="flex items-center">
          <h1 className="text-lg font-semibold md:block">{pageTitle}</h1>
        </div>
        
        <div className="flex items-center gap-4">
          <SessionSwitcher />
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="relative">
                <Bell className="h-4 w-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-0 right-0 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              <DropdownMenuLabel>Notifications</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {notifications.length > 0 ? (
                <>
                  {notifications.map(notification => (
                    <DropdownMenuItem key={notification.id} className={notification.read ? 'opacity-70' : 'font-medium'}>
                      {!notification.read && <span className="mr-2 h-2 w-2 rounded-full bg-primary flex-shrink-0" />}
                      {notification.title}
                    </DropdownMenuItem>
                  ))}
                </>
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  No notifications
                </div>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-9 flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={currentUser?.profileImage} alt={currentUser?.name || 'User'} />
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col items-start text-left hidden sm:flex">
                  <span className="text-sm font-medium">{currentUser?.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {currentUser?.subscriptionStatus === 'active' ? 'Active Client' : 'Client'}
                  </span>
                </div>
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <HelpCircle className="mr-2 h-4 w-4" />
                <span>Help & Support</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <LogoutButton variant="ghost" className="w-full justify-start p-0 h-auto" />
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>
      
      <div className="bg-gradient-to-r from-purple-500/10 via-indigo-500/10 to-blue-500/10 py-6 px-6">
        <h1 className="text-xl md:text-2xl font-bold">{pageTitle}</h1>
        <p className="text-muted-foreground">
          {pageTitle === 'Dashboard' && 'Welcome to your Savannah Prime client dashboard.'}
          {pageTitle === 'Services' && 'Explore and manage your subscribed services.'}
          {pageTitle === 'Billing' && 'View and manage your billing information and payments.'}
          {pageTitle === 'Support' && 'Get help and support for your services.'}
          {pageTitle === 'Settings' && 'Configure your account settings and preferences.'}
        </p>
      </div>
    </div>
  );
};

export default DashboardHeader;
