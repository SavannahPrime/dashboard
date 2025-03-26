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
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
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
  Copy,
  CreditCard,
  ExternalLink,
  Github,
  HelpCircle,
  Home,
  LogOut,
  Mail,
  MessageSquare,
  Plus,
  Settings,
  User,
  Moon,
  Sun,
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
    <div className={`hidden border-r bg-gray-100/40 dark:bg-gray-800/40 md:block h-screen fixed top-0 left-0 w-60 ${className}`}>
      <div className="flex flex-col h-full">
        <div className="flex items-center px-4 py-3">
          <Link to="/" className="flex items-center gap-2 font-semibold">
            Savannah Prime
          </Link>
        </div>
        <Separator />
        <div className="flex-1 overflow-auto py-2">
          <nav className="grid items-start gap-2 px-4">
            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                `flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-gray-100 dark:hover:bg-gray-800
                ${isActive ? 'bg-gray-100 dark:bg-gray-800 font-semibold' : 'text-gray-600 dark:text-gray-400'}`
              }
            >
              <Home className="h-4 w-4" />
              Home
            </NavLink>
            <NavLink
              to="/dashboard/services"
              className={({ isActive }) =>
                `flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-gray-100 dark:hover:bg-gray-800
                ${isActive ? 'bg-gray-100 dark:bg-gray-800 font-semibold' : 'text-gray-600 dark:text-gray-400'}`
              }
            >
              <CreditCard className="h-4 w-4" />
              Services
            </NavLink>
            <NavLink
              to="/dashboard/billing"
              className={({ isActive }) =>
                `flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-gray-100 dark:hover:bg-gray-800
                ${isActive ? 'bg-gray-100 dark:bg-gray-800 font-semibold' : 'text-gray-600 dark:text-gray-400'}`
              }
            >
              <CreditCard className="h-4 w-4" />
              Billing
            </NavLink>
            <NavLink
              to="/dashboard/support"
              className={({ isActive }) =>
                `flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-gray-100 dark:hover:bg-gray-800
                ${isActive ? 'bg-gray-100 dark:bg-gray-800 font-semibold' : 'text-gray-600 dark:text-gray-400'}`
              }
            >
              <MessageSquare className="h-4 w-4" />
              Support
            </NavLink>
            <NavLink
              to="/dashboard/settings"
              className={({ isActive }) =>
                `flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-gray-100 dark:hover:bg-gray-800
                ${isActive ? 'bg-gray-100 dark:bg-gray-800 font-semibold' : 'text-gray-600 dark:text-gray-400'}`
              }
            >
              <Settings className="h-4 w-4" />
              Settings
            </NavLink>
          </nav>
        </div>
        <Separator />
        <div className="py-2 px-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex h-8 w-full items-center justify-between rounded-md px-3 py-2 text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-800">
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={currentUser?.profileImage} alt={currentUser?.name} />
                    <AvatarFallback>{currentUser?.name?.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <span>{currentUser?.name}</span>
                </div>
                <ChevronDown className="h-4 w-4 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" forceMount className="w-56">
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
              <DropdownMenuItem>
                <HelpCircle className="mr-2 h-4 w-4" />
                <span>Support</span>
              </DropdownMenuItem>
              <DropdownMenuItem disabled>
                <Github className="mr-2 h-4 w-4" />
                <span>Github</span>
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
