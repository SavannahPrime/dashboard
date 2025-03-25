
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { Button } from '@/components/ui/button';
import { 
  Bell, 
  Search, 
  Moon, 
  Sun,
  Menu
} from 'lucide-react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useTheme } from '@/contexts/ThemeContext';

const AdminHeader: React.FC = () => {
  const { currentAdmin, logout } = useAdminAuth();
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  
  return (
    <header className="h-16 px-6 border-b border-border flex items-center justify-between bg-background">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
        </Button>
        <div className="relative hidden md:flex items-center">
          <Search className="absolute left-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search..."
            className="pl-9 w-[300px] bg-muted/50"
          />
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        >
          {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0">
                3
              </Badge>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel>Notifications</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <div className="max-h-[300px] overflow-auto">
              <DropdownMenuItem className="cursor-pointer flex flex-col items-start space-y-1">
                <p className="font-medium">New user registered</p>
                <p className="text-sm text-muted-foreground">Client: John Doe</p>
                <p className="text-xs text-muted-foreground">2 minutes ago</p>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer flex flex-col items-start space-y-1">
                <p className="font-medium">Payment failed</p>
                <p className="text-sm text-muted-foreground">Client: Sarah Smith</p>
                <p className="text-xs text-muted-foreground">1 hour ago</p>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer flex flex-col items-start space-y-1">
                <p className="font-medium">Support ticket opened</p>
                <p className="text-sm text-muted-foreground">Ticket #12456</p>
                <p className="text-xs text-muted-foreground">3 hours ago</p>
              </DropdownMenuItem>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer text-center text-primary" onClick={() => navigate('/admin/notifications')}>
              View all notifications
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        
        <Separator orientation="vertical" className="h-8" />
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2 px-2">
              <div className="h-8 w-8 rounded-full overflow-hidden">
                <img 
                  src={currentAdmin?.profileImage || 'https://ui-avatars.com/api/?name=Admin+User'}
                  alt="Admin avatar"
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium">{currentAdmin?.name}</p>
                <p className="text-xs text-muted-foreground">{currentAdmin?.role.replace('_', ' ')}</p>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer" onClick={() => navigate('/admin/profile')}>
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer" onClick={() => navigate('/admin/settings')}>
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer text-destructive" onClick={logout}>
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default AdminHeader;
