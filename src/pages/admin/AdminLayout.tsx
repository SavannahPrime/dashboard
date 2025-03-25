
import React from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/AdminHeader';
import { Loader2 } from 'lucide-react';

const AdminLayout: React.FC = () => {
  const { isAuthenticated, isLoading, currentAdmin } = useAdminAuth();
  const location = useLocation();
  
  // Check if the current route matches the user's role
  const checkRoleAccess = () => {
    if (!currentAdmin) return false;
    
    const path = location.pathname;
    
    // Super admin can access all routes
    if (currentAdmin.role === 'super_admin') return true;
    
    // Sales role can only access sales routes and some main admin routes
    if (currentAdmin.role === 'sales') {
      if (path.startsWith('/admin/sales')) return true;
      if (path === '/admin/users' || path === '/admin/finance' || path === '/admin/analytics') return true;
      return false;
    }
    
    // Support role can only access support routes and some main admin routes
    if (currentAdmin.role === 'support') {
      if (path.startsWith('/admin/support')) return true;
      if (path === '/admin/users' || path === '/admin/communications') return true;
      return false;
    }
    
    return false;
  };
  
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
  
  // Redirect to appropriate dashboard if role doesn't have access
  if (!checkRoleAccess()) {
    if (currentAdmin?.role === 'sales') {
      return <Navigate to="/admin/sales/dashboard" replace />;
    } else if (currentAdmin?.role === 'support') {
      return <Navigate to="/admin/support/dashboard" replace />;
    } else {
      return <Navigate to="/admin/dashboard" replace />;
    }
  }
  
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader />
        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
