
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import { AuthProvider } from "./contexts/AuthContext";
import { AdminAuthProvider } from "./contexts/AdminAuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ResetPassword from "./pages/ResetPassword";
import DashboardLayout from "./pages/dashboard/DashboardLayout";
import Dashboard from "./pages/dashboard/Dashboard";
import Services from "./pages/dashboard/Services";
import Billing from "./pages/dashboard/Billing";
import Settings from "./pages/dashboard/Settings";
import Support from "./pages/dashboard/Support";
import NotFound from "./pages/NotFound";

import AdminLogin from "./pages/admin/AdminLogin";
import AdminAuth from "./pages/admin/AdminAuth";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/Dashboard";
import UserManagement from "./pages/admin/UserManagement";
import EmployeeManagement from "./pages/admin/EmployeeManagement";
import AdminAnalytics from "./pages/admin/Analytics";
import AdminFinance from "./pages/admin/Finance";
import AdminServices from "./pages/admin/Services";
import AdminCommunications from "./pages/admin/Communications";
import AdminSettings from "./pages/admin/Settings";
import SalesDashboard from "./pages/admin/sales/Dashboard";
import SupportDashboard from "./pages/admin/support/Dashboard";

// Create a new QueryClient instance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <AdminAuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                
                {/* Dashboard Routes */}
                <Route path="/dashboard" element={<DashboardLayout />}>
                  <Route index element={<Dashboard />} />
                  <Route path="services" element={<Services />} />
                  <Route path="billing" element={<Billing />} />
                  <Route path="settings" element={<Settings />} />
                  <Route path="support" element={<Support />} />
                </Route>
                
                {/* Admin Routes */}
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route path="/admin/auth" element={<AdminAuth />} />
                
                {/* Main Admin Routes */}
                <Route path="/admin" element={<AdminLayout />}>
                  <Route index element={<Navigate to="/admin/dashboard" replace />} />
                  <Route path="dashboard" element={<AdminDashboard />} />
                  <Route path="users" element={<UserManagement />} />
                  <Route path="employees" element={<EmployeeManagement />} />
                  <Route path="analytics" element={<AdminAnalytics />} />
                  <Route path="finance" element={<AdminFinance />} />
                  <Route path="services" element={<AdminServices />} />
                  <Route path="communications" element={<AdminCommunications />} />
                  <Route path="settings" element={<AdminSettings />} />
                </Route>

                {/* Sales Role Admin Dashboard */}
                <Route path="/admin/sales" element={<AdminLayout />}>
                  <Route index element={<Navigate to="/admin/sales/dashboard" replace />} />
                  <Route path="dashboard" element={<SalesDashboard />} />
                  <Route path="users" element={<UserManagement />} />
                  <Route path="finance" element={<AdminFinance />} />
                  <Route path="analytics" element={<AdminAnalytics />} />
                </Route>
                
                {/* Support Role Admin Dashboard */}
                <Route path="/admin/support" element={<AdminLayout />}>
                  <Route index element={<Navigate to="/admin/support/dashboard" replace />} />
                  <Route path="dashboard" element={<SupportDashboard />} />
                  <Route path="communications" element={<AdminCommunications />} />
                  <Route path="users" element={<UserManagement />} />
                </Route>
                
                {/* Catch All */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </AdminAuthProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
