import React, { useEffect, useState } from 'react';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChartContainer } from '@/components/ui/chart';
import { Users, CreditCard, Package, ArrowUpRight, ArrowDownRight, DollarSign, RefreshCw } from 'lucide-react';
import { BarChart, Bar, PieChart, Pie, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import RecentSignupsSection from '@/components/admin/dashboard/RecentSignupsSection';

const AdminDashboard: React.FC = () => {
  const { currentAdmin } = useAdminAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [userStats, setUserStats] = useState({
    total: 0,
    active: 0,
    newThisMonth: 0,
    growth: 0
  });
  const [revenueStats, setRevenueStats] = useState({
    total: 0,
    growth: 0
  });
  const [subscriptionStats, setSubscriptionStats] = useState({
    total: 0,
    growth: 0
  });
  const [recentSignups, setRecentSignups] = useState<any[]>([]);
  
  const userActivityData = [
    { name: 'Jan', users: 45 },
    { name: 'Feb', users: 52 },
    { name: 'Mar', users: 49 },
    { name: 'Apr', users: 62 },
    { name: 'May', users: 87 },
    { name: 'Jun', users: 95 },
    { name: 'Jul', users: 100 },
    { name: 'Aug', users: 118 },
    { name: 'Sep', users: 136 },
    { name: 'Oct', users: 155 },
    { name: 'Nov', users: 180 },
    { name: 'Dec', users: 210 }
  ];
  
  const revenueData = [
    { name: 'Jan', revenue: 25000 },
    { name: 'Feb', revenue: 28000 },
    { name: 'Mar', revenue: 32000 },
    { name: 'Apr', revenue: 40000 },
    { name: 'May', revenue: 45000 },
    { name: 'Jun', revenue: 52000 },
    { name: 'Jul', revenue: 58000 },
    { name: 'Aug', revenue: 62000 },
    { name: 'Sep', revenue: 68000 },
    { name: 'Oct', revenue: 72000 },
    { name: 'Nov', revenue: 76000 },
    { name: 'Dec', revenue: 85000 }
  ];
  
  const servicesData = [
    { name: 'Website Development', value: 35 },
    { name: 'CMS Development', value: 20 },
    { name: 'AI Automation', value: 15 },
    { name: 'Digital Marketing', value: 25 },
    { name: 'Branding & Design', value: 15 }
  ];
  
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const { data: clientsData, error: clientsError } = await supabase
        .from('clients')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (clientsError) throw clientsError;
      
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();
      const firstDayOfMonth = new Date(currentYear, currentMonth, 1).toISOString();
      
      const newClientsThisMonth = clientsData?.filter(
        client => client.created_at >= firstDayOfMonth
      ).length;
      
      const totalClients = clientsData?.length || 0;
      const activeClients = clientsData?.filter(client => client.status === 'active').length || 0;
      
      const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
      const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
      const firstDayLastMonth = new Date(lastMonthYear, lastMonth, 1).toISOString();
      const lastDayLastMonth = new Date(currentYear, currentMonth, 0).toISOString();
      
      const { data: lastMonthData } = await supabase
        .from('clients')
        .select('count')
        .gte('created_at', firstDayLastMonth)
        .lte('created_at', lastDayLastMonth)
        .single();
      
      const lastMonthCount = lastMonthData?.count || 0;
      const growthPercentage = lastMonthCount > 0 
        ? ((newClientsThisMonth - lastMonthCount) / lastMonthCount) * 100 
        : 100;
      
      setUserStats({
        total: totalClients,
        active: activeClients,
        newThisMonth: newClientsThisMonth,
        growth: growthPercentage
      });
      
      const { data: transactionsData, error: transactionsError } = await supabase
        .from('transactions')
        .select('amount, date')
        .eq('status', 'completed')
        .order('date', { ascending: false });
      
      if (transactionsError) throw transactionsError;
      
      const totalRevenue = transactionsData?.reduce((sum, transaction) => sum + (parseFloat(transaction.amount) || 0), 0) || 0;
      
      setRevenueStats({
        total: totalRevenue,
        growth: 18.5
      });
      
      const recentSignupsData = clientsData?.slice(0, 5).map(client => {
        const createdDate = new Date(client.created_at);
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - createdDate.getTime());
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        
        let timeAgo;
        if (diffDays === 0) {
          const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
          timeAgo = diffHours === 0 ? 'Just now' : `${diffHours} hours ago`;
        } else if (diffDays === 1) {
          timeAgo = 'Yesterday';
        } else {
          timeAgo = `${diffDays} days ago`;
        }
        
        return {
          id: client.id,
          name: client.name,
          email: client.email,
          service: client.selected_services ? client.selected_services[0] : 'No service selected',
          date: timeAgo
        };
      });
      
      setRecentSignups(recentSignupsData || []);
      
      await supabase.from('analytics').insert({
        type: 'dashboard_view',
        data: {
          admin_id: currentAdmin?.id,
          admin_role: currentAdmin?.role,
          view_type: 'admin_dashboard'
        },
        period: 'daily'
      });
      
      toast.success('Dashboard data updated successfully');
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    fetchDashboardData();
    
    const channel = supabase
      .channel('public:clients')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'clients' 
      }, payload => {
        toast.info('New client just signed up!');
        fetchDashboardData();
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentAdmin?.id]);
  
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border border-border p-2 rounded-md shadow-md">
          <p className="font-medium">{payload[0].name}</p>
          <p className="text-sm">{`${payload[0].value} clients (${(payload[0].payload.percent * 100).toFixed(0)}%)`}</p>
        </div>
      );
    }
    return null;
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <div className="flex items-center gap-2">
          <p className="text-muted-foreground">
            Welcome back, <span className="font-medium">{currentAdmin?.name}</span>
          </p>
          <Button 
            size="sm" 
            variant="outline" 
            onClick={fetchDashboardData} 
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{userStats.total}</div>
                <div className="flex items-center text-xs text-muted-foreground mt-1">
                  {userStats.growth > 0 ? (
                    <>
                      <ArrowUpRight className="mr-1 h-4 w-4 text-green-500" />
                      <span className="text-green-500 font-medium">+{userStats.growth.toFixed(1)}%</span>
                    </>
                  ) : (
                    <>
                      <ArrowDownRight className="mr-1 h-4 w-4 text-red-500" />
                      <span className="text-red-500 font-medium">{userStats.growth.toFixed(1)}%</span>
                    </>
                  )}
                  {' '}from last month
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(revenueStats.total)}</div>
                <div className="flex items-center text-xs text-muted-foreground mt-1">
                  <ArrowUpRight className="mr-1 h-4 w-4 text-green-500" />
                  <span className="text-green-500 font-medium">+{revenueStats.growth}%</span> from last month
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
                <CreditCard className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{userStats.active}</div>
                <div className="flex items-center text-xs text-muted-foreground mt-1">
                  <ArrowUpRight className="mr-1 h-4 w-4 text-green-500" />
                  <span className="text-green-500 font-medium">+5.2%</span> from last month
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Services Sold</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">4,721</div>
                <div className="flex items-center text-xs text-muted-foreground mt-1">
                  <ArrowDownRight className="mr-1 h-4 w-4 text-red-500" />
                  <span className="text-red-500 font-medium">-3.1%</span> from last month
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Service Distribution</CardTitle>
                <CardDescription>
                  Service popularity breakdown
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={servicesData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {servicesData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>User Growth</CardTitle>
                <CardDescription>
                  New users over time
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={userActivityData}
                      margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="users" fill="#2c5cc5" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Card className="col-span-2">
            <CardHeader>
              <CardTitle>Revenue Overview</CardTitle>
              <CardDescription>
                Monthly revenue trends
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={revenueData}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis tickFormatter={(value) => `$${value / 1000}k`} />
                    <Tooltip formatter={(value) => [`$${value}`, 'Revenue']} />
                    <Legend />
                    <Line type="monotone" dataKey="revenue" stroke="#8884d8" activeDot={{ r: 8 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          
          <RecentSignupsSection />
        </TabsContent>
        
        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>Detailed Analytics</CardTitle>
              <CardDescription>
                This tab will contain more detailed analytics views.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>Detailed analytics content will be displayed here.</p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="reports">
          <Card>
            <CardHeader>
              <CardTitle>Reports</CardTitle>
              <CardDescription>
                This tab will contain reports generation features.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>Reports content will be displayed here.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;
