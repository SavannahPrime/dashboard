
import React, { useEffect } from 'react';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, DollarSign, TrendingUp, Package, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Sample data for the charts
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

const conversionData = [
  { name: 'Website Visitors', value: 15000 },
  { name: 'Leads', value: 3000 },
  { name: 'Opportunities', value: 1200 },
  { name: 'New Clients', value: 450 }
];

const leadSourceData = [
  { name: 'Organic Search', value: 40 },
  { name: 'Referrals', value: 25 },
  { name: 'Social Media', value: 20 },
  { name: 'Email Campaigns', value: 10 },
  { name: 'Other', value: 5 }
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const SalesDashboard: React.FC = () => {
  const { currentAdmin } = useAdminAuth();
  
  useEffect(() => {
    // Store visit analytics in Supabase
    const logDashboardVisit = async () => {
      try {
        if (currentAdmin) {
          await supabase.from('analytics').insert({
            type: 'dashboard_visit',
            data: {
              dashboard: 'sales',
              admin_id: currentAdmin.id,
              admin_role: currentAdmin.role
            },
            period: 'daily'
          });
        }
      } catch (error) {
        console.error('Error logging dashboard visit:', error);
      }
    };
    
    logDashboardVisit();
  }, [currentAdmin]);
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };
  
  const handleContactClient = () => {
    toast.info('Contact feature would be implemented here');
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Sales Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome, <span className="font-medium">{currentAdmin?.name}</span>
        </p>
      </div>
      
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="leads">Leads</TabsTrigger>
          <TabsTrigger value="forecasting">Forecasting</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(642500)}</div>
                <div className="flex items-center text-xs text-muted-foreground mt-1">
                  <ArrowUpRight className="mr-1 h-4 w-4 text-green-500" />
                  <span className="text-green-500 font-medium">+18.5%</span> from last month
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">New Clients</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">45</div>
                <div className="flex items-center text-xs text-muted-foreground mt-1">
                  <ArrowUpRight className="mr-1 h-4 w-4 text-green-500" />
                  <span className="text-green-500 font-medium">+12.2%</span> from last month
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">3.2%</div>
                <div className="flex items-center text-xs text-muted-foreground mt-1">
                  <ArrowUpRight className="mr-1 h-4 w-4 text-green-500" />
                  <span className="text-green-500 font-medium">+0.5%</span> from last month
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Services Sold</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">182</div>
                <div className="flex items-center text-xs text-muted-foreground mt-1">
                  <ArrowDownRight className="mr-1 h-4 w-4 text-red-500" />
                  <span className="text-red-500 font-medium">-3.1%</span> from last month
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Charts */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Revenue Trends</CardTitle>
                <CardDescription>
                  Monthly revenue for the current year
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
            
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Lead Sources</CardTitle>
                <CardDescription>
                  Distribution of leads by source
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={leadSourceData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {leadSourceData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Sales Funnel */}
          <Card>
            <CardHeader>
              <CardTitle>Sales Funnel</CardTitle>
              <CardDescription>
                Conversion stages from visitors to clients
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={conversionData}
                    layout="vertical"
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="value" fill="#2c5cc5" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          
          {/* Recent Opportunities */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Opportunities</CardTitle>
              <CardDescription>
                Latest sales opportunities that need attention
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-auto max-h-[400px]">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-xs text-muted-foreground">
                      <th className="pb-3 font-medium">Client</th>
                      <th className="pb-3 font-medium">Service</th>
                      <th className="pb-3 font-medium">Value</th>
                      <th className="pb-3 font-medium">Stage</th>
                      <th className="pb-3 font-medium">Last Contact</th>
                      <th className="pb-3 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-t border-border hover:bg-muted/50">
                      <td className="py-3">David Wilson</td>
                      <td className="py-3">Website Development</td>
                      <td className="py-3">{formatCurrency(12500)}</td>
                      <td className="py-3"><span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">Negotiation</span></td>
                      <td className="py-3 text-muted-foreground text-sm">2 days ago</td>
                      <td className="py-3"><button onClick={handleContactClient} className="text-primary text-sm hover:underline">Contact</button></td>
                    </tr>
                    <tr className="border-t border-border hover:bg-muted/50">
                      <td className="py-3">Sarah Johnson</td>
                      <td className="py-3">Digital Marketing</td>
                      <td className="py-3">{formatCurrency(8200)}</td>
                      <td className="py-3"><span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">Proposal</span></td>
                      <td className="py-3 text-muted-foreground text-sm">5 days ago</td>
                      <td className="py-3"><button onClick={handleContactClient} className="text-primary text-sm hover:underline">Contact</button></td>
                    </tr>
                    <tr className="border-t border-border hover:bg-muted/50">
                      <td className="py-3">Michael Brown</td>
                      <td className="py-3">AI Automation</td>
                      <td className="py-3">{formatCurrency(18000)}</td>
                      <td className="py-3"><span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">Qualified</span></td>
                      <td className="py-3 text-muted-foreground text-sm">Yesterday</td>
                      <td className="py-3"><button onClick={handleContactClient} className="text-primary text-sm hover:underline">Contact</button></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="leads">
          <Card>
            <CardHeader>
              <CardTitle>Leads Management</CardTitle>
              <CardDescription>
                This tab will contain detailed lead management tools.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>Leads management content will be displayed here.</p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="forecasting">
          <Card>
            <CardHeader>
              <CardTitle>Sales Forecasting</CardTitle>
              <CardDescription>
                This tab will contain sales forecasting tools.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>Sales forecasting content will be displayed here.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SalesDashboard;
