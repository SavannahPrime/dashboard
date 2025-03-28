
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  CreditCard, 
  Clock, 
  Calendar,
  ChevronRight,
  CheckCircle,
  ArrowUp
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const Dashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [services, setServices] = useState<any[]>([]);
  const [stats, setStats] = useState({
    activeServices: 0,
    nextPayment: {
      amount: 348,
      date: '07/15/2023',
    },
    subscriptionStatus: 'Active',
    subscriptionExpiry: '4/25/2025'
  });
  
  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!currentUser?.id) return;
      
      setIsLoading(true);
      try {
        // Fetch client data including selected services
        const { data: clientData, error: clientError } = await supabase
          .from('clients')
          .select('selected_services, subscription_status, subscription_expiry')
          .eq('id', currentUser.id)
          .single();
        
        if (clientError) throw clientError;
        
        // Fetch services details
        const { data: servicesData, error: servicesError } = await supabase
          .from('services')
          .select('*')
          .in('name', clientData.selected_services || []);
          
        if (servicesError) throw servicesError;
        
        setServices(servicesData || []);
        setStats({
          activeServices: (clientData?.selected_services || []).length,
          nextPayment: {
            amount: 348,
            date: '07/15/2023',
          },
          subscriptionStatus: clientData?.subscription_status || 'Active',
          subscriptionExpiry: clientData?.subscription_expiry || '4/25/2025'
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        toast.error('Failed to load dashboard data');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDashboardData();
  }, [currentUser?.id]);
  
  return (
    <div className="min-h-screen bg-[#0f1523] text-white">
      <div className="px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight">Welcome back, {currentUser?.name || currentUser?.email?.split('@')[0] || 'Client'}</h1>
          <p className="text-[#8a9cb0] text-lg mt-2">
            Here's what's happening with your account today
          </p>
        </div>
        
        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-10">
          <StatCard 
            title="Services Active"
            value={stats.activeServices.toString()}
            icon={<Users className="h-6 w-6 text-[#4086f4]" />}
            iconBg="bg-[#172138]"
          />
          
          <StatCard 
            title="Next Payment"
            value={`$${stats.nextPayment.amount}`}
            subtext={`Due on Jul 15, 2023`}
            icon={<CreditCard className="h-6 w-6 text-[#4086f4]" />}
            iconBg="bg-[#172138]"
          />
          
          <StatCard 
            title="Subscription Status"
            value={stats.subscriptionStatus}
            statusIndicator={
              <div className="flex items-center text-green-500">
                <ArrowUp className="h-3 w-3 mr-1" />
                <span>0% vs last period</span>
              </div>
            }
            icon={<Clock className="h-6 w-6 text-[#4086f4]" />}
            iconBg="bg-[#172138]"
          />
          
          <StatCard 
            title="Subscription Expiry"
            value={stats.subscriptionExpiry}
            icon={<Calendar className="h-6 w-6 text-[#4086f4]" />}
            iconBg="bg-[#172138]"
          />
        </div>
        
        {/* Your Services Section */}
        <div className="mb-10">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Your Services</h2>
            <Button 
              variant="ghost" 
              className="text-[#4086f4] hover:text-blue-400"
              onClick={() => navigate('/dashboard/services')}
            >
              View All <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
          
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {services.slice(0, 3).map((service) => (
              <ServiceCard 
                key={service.id}
                title={service.name}
                description={service.description}
                status="Active"
              />
            ))}
            
            {services.length === 0 && (
              <div className="col-span-2 lg:col-span-3 p-8 rounded-lg border border-[#2a3347] text-center">
                <h3 className="text-xl font-medium mb-2">No active services</h3>
                <p className="text-[#8a9cb0] mb-4">Browse our services and add them to your account</p>
                <Button onClick={() => navigate('/dashboard/services')}>
                  Browse Services
                </Button>
              </div>
            )}
          </div>
        </div>
        
        {/* Subscription Status Side Panel */}
        <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-2">
            {/* Extra content like announcements could go here */}
          </div>
          
          <div className="bg-[#121a2e] rounded-lg p-6 border border-[#2a3347]">
            <h2 className="text-xl font-bold mb-4">Subscription Status</h2>
            <Badge className="bg-green-500 text-white mb-6">Active</Badge>
            
            <div className="flex items-center mb-4">
              <Calendar className="h-5 w-5 mr-3 text-[#8a9cb0]" />
              <div>
                <p className="font-medium">29 days remaining</p>
                <p className="text-sm text-[#8a9cb0]">Expires on 4/25/2025</p>
              </div>
            </div>
            
            <div className="flex items-center mb-6">
              <CreditCard className="h-5 w-5 mr-3 text-[#8a9cb0]" />
              <div>
                <p className="font-medium">Next payment</p>
                <p className="text-sm text-[#8a9cb0]">4/25/2025</p>
              </div>
            </div>
            
            <div className="space-y-3">
              <Button className="w-full" variant="outline">Contact Support</Button>
              <Button className="w-full">Manage Plan</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

type StatCardProps = {
  title: string;
  value: string;
  icon: React.ReactNode;
  iconBg: string;
  subtext?: string;
  statusIndicator?: React.ReactNode;
};

const StatCard: React.FC<StatCardProps> = ({ 
  title, 
  value, 
  icon, 
  iconBg,
  subtext,
  statusIndicator
}) => {
  return (
    <div className="bg-[#121a2e] rounded-lg p-6 border border-[#2a3347]">
      <div className="flex justify-between mb-4">
        <h3 className="text-[#8a9cb0] font-medium">{title}</h3>
        <div className={`${iconBg} p-3 rounded-lg`}>
          {icon}
        </div>
      </div>
      <div>
        <p className="text-3xl font-bold mb-1">{value}</p>
        {subtext && <p className="text-[#8a9cb0] text-sm">{subtext}</p>}
        {statusIndicator && <div className="text-xs mt-1">{statusIndicator}</div>}
      </div>
    </div>
  );
};

type ServiceCardProps = {
  title: string;
  description: string;
  status: 'Active' | 'Inactive' | 'Pending';
};

const ServiceCard: React.FC<ServiceCardProps> = ({ title, description, status }) => {
  return (
    <div className="bg-[#121a2e] rounded-lg p-6 border border-[#2a3347]">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xl font-semibold">{title}</h3>
        <Badge className={status === 'Active' ? 'bg-green-500' : 'bg-amber-500'}>
          {status}
        </Badge>
      </div>
      <p className="text-[#8a9cb0] mb-4 line-clamp-2">{description}</p>
      
      {status === 'Active' && (
        <div className="flex items-center text-[#8a9cb0]">
          <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
          <span className="text-sm">Professional website creation with reliable hosting solutions.</span>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
