
import React from 'react';
import { Bell, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/AuthContext';

const notifications = [
  {
    id: '1',
    title: 'Subscription Renewal',
    message: 'Your subscription will renew in 5 days.',
    time: '2 hours ago'
  },
  {
    id: '2',
    title: 'Payment Processed',
    message: 'Your recent payment was successfully processed.',
    time: '1 day ago'
  },
  {
    id: '3',
    title: 'New Feature Available',
    message: 'We\'ve added new features to your dashboard.',
    time: '3 days ago'
  }
];

const DashboardHeader: React.FC<{ pageTitle: string }> = ({ pageTitle }) => {
  const { currentUser } = useAuth();
  
  return (
    <div className="flex justify-between items-center py-4 px-6 border-b">
      <h1 className="text-2xl font-bold">{pageTitle}</h1>
      
      <div className="flex items-center space-x-4">
        {/* Search */}
        <div className="relative hidden md:flex items-center">
          <Search className="absolute left-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search..."
            className="w-64 pl-9 h-10 bg-background"
          />
        </div>
        
        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0">
                {notifications.length}
              </Badge>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel>Notifications</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {notifications.map((notification) => (
              <DropdownMenuItem key={notification.id} className="py-3 px-4 cursor-pointer flex flex-col items-start">
                <div className="font-medium">{notification.title}</div>
                <div className="text-sm text-muted-foreground">{notification.message}</div>
                <div className="text-xs text-muted-foreground mt-1">{notification.time}</div>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem className="py-2 px-4 cursor-pointer justify-center text-primary">
              View all notifications
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default DashboardHeader;
