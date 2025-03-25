
import React from 'react';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Users, CreditCard, Package, ArrowUpRight, ArrowDownRight, DollarSign } from 'lucide-react';
import { BarChart, Bar, PieChart, Pie, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';

const AdminDashboard: React.FC = () => {
  const { currentAdmin } = useAdminAuth();
  
  // Sample data for charts
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
  
  const recentSignups = [
    { id: 1, name: 'John Doe', email: 'john@example.com', service: 'Website Development', date: '2 hours ago' },
    { id: 2, name: 'Sarah Smith', email: 'sarah@example.com', service: 'Digital Marketing', date: '4 hours ago' },
    { id: 3, name: 'Michael Johnson', email: 'michael@example.com', service: 'CMS Development', date: '1 day ago' },
    { id: 4, name: 'Emily Brown', email: 'emily@example.com', service: 'Branding & Design', date: '1 day ago' },
    { id: 5, name: 'David Wilson', email: 'david@example.com', service: 'AI Automation', date: '2 days ago' },
  ];
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, <span className="font-medium">{currentAdmin?.name}</span>
        </p>
      </div>
      
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">2,853</div>
                <div className="flex items-center text-xs text-muted-foreground mt-1">
                  <ArrowUpRight className="mr-1 h-4 w-4 text-green-500" />
                  <span className="text-green-500 font-medium">+14.2%</span> from last month
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
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
                <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
                <CreditCard className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">1,294</div>
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
          
          {/* Charts */}
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
          
          {/* Revenue Chart */}
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
          
          {/* Recent Signups */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Signups</CardTitle>
              <CardDescription>
                New clients that registered recently
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-auto max-h-[400px]">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-xs text-muted-foreground">
                      <th className="pb-3 font-medium">Name</th>
                      <th className="pb-3 font-medium">Email</th>
                      <th className="pb-3 font-medium">Service</th>
                      <th className="pb-3 font-medium text-right">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentSignups.map((user) => (
                      <tr key={user.id} className="border-t border-border hover:bg-muted/50">
                        <td className="py-3">{user.name}</td>
                        <td className="py-3">{user.email}</td>
                        <td className="py-3">{user.service}</td>
                        <td className="py-3 text-right text-muted-foreground text-sm">{user.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
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

// Custom tooltip component for the pie chart
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

export default AdminDashboard;
