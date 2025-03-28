
import React, { Suspense, useState, useEffect } from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import DashboardSidebar from '@/components/dashboard/DashboardSidebar';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, Menu, X, Bell, Search } from 'lucide-react';
import { Toaster } from 'sonner';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

const DashboardLayout: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  
  // Close sidebar on navigation in mobile view
  useEffect(() => {
    if (isMobile && isSidebarOpen) {
      setIsSidebarOpen(false);
    }
  }, [location.pathname, isMobile]);
  
  // Update isMobile state on window resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#0f1523] text-white">
        <Loader2 className="h-10 w-10 animate-spin text-[#4086f4]" />
        <span className="ml-2 text-lg">Loading dashboard...</span>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return (
    <div className="flex h-screen overflow-hidden bg-[#0f1523] text-white">
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <DashboardSidebar />
      </div>
      
      {/* Mobile Sidebar */}
      <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
        <SheetTrigger asChild>
          <Button 
            variant="ghost" 
            size="icon" 
            className="md:hidden fixed top-3 left-3 z-40"
            onClick={() => setIsSidebarOpen(true)}
          >
            {isSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            <span className="sr-only">Toggle Menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-64 border-r border-[#2a3347] bg-[#0f1523]">
          <DashboardSidebar className="block w-full h-full border-0" onNavClick={() => setIsSidebarOpen(false)} />
        </SheetContent>
      </Sheet>
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden md:pl-64">
        {/* Header */}
        <header className="h-16 flex items-center justify-between px-6 border-b border-[#2a3347]">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <div className="flex items-center space-x-4">
            {/* Search */}
            <div className="relative hidden md:flex items-center">
              <Search className="absolute left-2.5 h-4 w-4 text-[#8a9cb0]" />
              <Input
                type="search"
                placeholder="Search..."
                className="w-64 pl-9 h-10 bg-[#121a2e] border-[#2a3347] text-white focus:border-[#4086f4]"
              />
            </div>
            
            {/* Notifications */}
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-[#4086f4]">
                3
              </Badge>
            </Button>
          </div>
        </header>
        
        <main className="flex-1 overflow-auto p-6">
          <Suspense fallback={
            <div className="flex items-center justify-center h-full">
              <Loader2 className="h-10 w-10 animate-spin text-[#4086f4]" />
              <span className="ml-2 text-lg">Loading content...</span>
            </div>
          }>
            <Outlet />
          </Suspense>
        </main>
      </div>
      <Toaster position="top-right" closeButton />
    </div>
  );
};

export default DashboardLayout;
