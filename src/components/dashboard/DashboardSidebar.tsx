
import React from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Separator } from "@/components/ui/separator"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  ArrowRight,
  ChevronDown,
  CreditCard,
  ExternalLink,
  HelpCircle,
  Home,
  LogOut,
  MessageSquare,
  Settings,
  User,
  Moon,
  Sun,
  Package,
} from "lucide-react"
import { Link, NavLink } from 'react-router-dom';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '../ui/button';
import LogoutButton from '@/components/common/LogoutButton';

interface DashboardSidebarProps {
  className?: string;
}

const DashboardSidebar: React.FC<DashboardSidebarProps> = ({ className }) => {
  const { theme, setTheme } = useTheme();
  const { currentUser } = useAuth();

  return (
    <div className={`hidden border-r bg-card/40 md:block h-screen fixed top-0 left-0 w-64 ${className}`}>
      <div className="flex flex-col h-full">
        <div className="flex items-center px-6 py-4">
          <Link to="/" className="flex items-center gap-2 font-semibold text-xl">
            Savannah Prime
          </Link>
        </div>
        <Separator />
        <div className="flex-1 overflow-auto py-4">
          <nav className="grid items-start gap-2 px-4">
            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-secondary
                ${isActive ? 'bg-secondary text-primary font-semibold' : 'text-muted-foreground'}`
              }
            >
              <Home className="h-4 w-4" />
              Dashboard
            </NavLink>
            <NavLink
              to="/dashboard/services"
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-secondary
                ${isActive ? 'bg-secondary text-primary font-semibold' : 'text-muted-foreground'}`
              }
            >
              <Package className="h-4 w-4" />
              Services
            </NavLink>
            <NavLink
              to="/dashboard/billing"
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-secondary
                ${isActive ? 'bg-secondary text-primary font-semibold' : 'text-muted-foreground'}`
              }
            >
              <CreditCard className="h-4 w-4" />
              Billing
            </NavLink>
            <NavLink
              to="/dashboard/support"
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-secondary
                ${isActive ? 'bg-secondary text-primary font-semibold' : 'text-muted-foreground'}`
              }
            >
              <MessageSquare className="h-4 w-4" />
              Support
            </NavLink>
            <NavLink
              to="/dashboard/settings"
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-secondary
                ${isActive ? 'bg-secondary text-primary font-semibold' : 'text-muted-foreground'}`
              }
            >
              <Settings className="h-4 w-4" />
              Settings
            </NavLink>
          </nav>
        </div>
        <Separator />
        <div className="py-4 px-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex w-full items-center justify-between rounded-md px-3 py-2 text-sm font-medium hover:bg-secondary">
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={currentUser?.profileImage} alt={currentUser?.name} />
                    <AvatarFallback>{currentUser?.name?.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col items-start">
                    <span className="font-medium truncate max-w-[120px]">{currentUser?.name}</span>
                    <span className="text-xs text-muted-foreground">{currentUser?.email}</span>
                  </div>
                </div>
                <ChevronDown className="h-4 w-4 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/dashboard/settings" className="flex items-center">
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/dashboard/billing" className="flex items-center">
                  <CreditCard className="mr-2 h-4 w-4" />
                  <span>Billing</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/dashboard/support" className="flex items-center">
                  <HelpCircle className="mr-2 h-4 w-4" />
                  <span>Support</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => {
                if (theme === "light") {
                  setTheme("dark")
                } else {
                  setTheme("light")
                }
              }}>
                {theme === "light" ? (
                  <>
                    <Moon className="mr-2 h-4 w-4" />
                    <span>Dark Mode</span>
                  </>
                ) : (
                  <>
                    <Sun className="mr-2 h-4 w-4" />
                    <span>Light Mode</span>
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <LogoutButton />
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
};

export default DashboardSidebar;
