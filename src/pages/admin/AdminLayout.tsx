
import React, { Suspense } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/AdminHeader';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { Loader2 } from 'lucide-react';
import { Toaster } from 'sonner';

const AdminLayout: React.FC = () => {
  const { isAuthenticated, isLoading, isInitializing } = useAdminAuth();

  if (isInitializing) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <span className="ml-2 text-lg">Initializing admin panel...</span>
      </div>
    );
  }
  
  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <span className="ml-2 text-lg">Loading...</span>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }
  
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader />
        <main className="flex-1 overflow-auto p-6">
          <Suspense fallback={
            <div className="flex items-center justify-center h-full">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
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

export default AdminLayout;
