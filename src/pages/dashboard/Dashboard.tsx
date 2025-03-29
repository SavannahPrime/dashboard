
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import StatCard from '@/components/dashboard/StatCard';
import ServiceCard from '@/components/dashboard/ServiceCard';
import SubscriptionStatusCard from '@/components/dashboard/SubscriptionStatusCard';
import { getServiceByTitle } from '@/lib/services-data';
import { Badge } from '@/components/ui/badge';
import { CreditCard, Calendar, Users, Clock, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Dashboard: React.FC = () => {
  const { currentUser } = useAuth();
  
  if (!currentUser) return null;
  
  // Get the service objects from the titles
  const userServices = currentUser.selectedServices
    .map(title => getServiceByTitle(title))
    .filter(Boolean);
  
  // Add safe access to the role property
  const userRole = currentUser && 'role' in currentUser ? currentUser.role : 'client';
  
  // Safe access to subscription expiry with a fallback
  const subscriptionExpiry = currentUser.subscriptionExpiry 
    ? new Date(currentUser.subscriptionExpiry).toLocaleDateString()
    : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString();

  return (
    <div className="animate-fade-in">
      <DashboardHeader pageTitle="Dashboard" />
      
      <div className="p-6">
        {/* Welcome Message */}
        <div className="mb-8">
          <div className="flex items-center">
            <h2 className="text-3xl font-bold">Welcome back, {currentUser.name.split(' ')[0]}</h2>
            <Badge className="ml-3">{userRole}</Badge>
          </div>
          <p className="text-muted-foreground mt-1">
            Here's what's happening with your account today
          </p>
        </div>
        
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Services Active"
            value={currentUser.selectedServices.length}
            icon={<Users className="h-5 w-5 text-primary" />}
          />
          <StatCard
            title="Next Payment"
            value={`$${userServices.reduce((sum, service) => sum + service!.price, 0)}`}
            icon={<CreditCard className="h-5 w-5 text-primary" />}
            subtitle="Due on Jul 15, 2023"
          />
          <StatCard
            title="Subscription Status"
            value={currentUser.subscriptionStatus || "Active"}
            icon={<Clock className="h-5 w-5 text-primary" />}
            change={{ value: 0, isPositive: true }}
          />
          <StatCard
            title="Subscription Expiry"
            value={subscriptionExpiry}
            icon={<Calendar className="h-5 w-5 text-primary" />}
          />
        </div>
        
        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Left Column: Services Overview */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold">Your Services</h3>
              <Button variant="ghost" className="text-sm group">
                View All
                <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {userServices.length > 0 ? (
                userServices.slice(0, 4).map(service => (
                  <ServiceCard key={service!.id} service={service!} />
                ))
              ) : (
                <div className="col-span-2 p-4 border rounded-lg bg-muted/20 text-center">
                  <p>You don't have any active services. Visit the Services page to subscribe.</p>
                  <Button variant="outline" className="mt-4" onClick={() => window.location.href = '/dashboard/services'}>
                    Browse Services
                  </Button>
                </div>
              )}
            </div>
          </div>
          
          {/* Right Column: Subscription and Activity */}
          <div className="space-y-6">
            <SubscriptionStatusCard />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
