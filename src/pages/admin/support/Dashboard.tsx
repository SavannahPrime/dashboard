
import React, { useEffect } from 'react';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MessageSquare, Clock, CheckCircle, AlertCircle, ArrowUpRight, ArrowDownRight, Users } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Sample data for charts
const weeklyTicketsData = [
  { name: 'Mon', tickets: 12 },
  { name: 'Tue', tickets: 19 },
  { name: 'Wed', tickets: 15 },
  { name: 'Thu', tickets: 22 },
  { name: 'Fri', tickets: 18 },
  { name: 'Sat', tickets: 8 },
  { name: 'Sun', tickets: 5 }
];

const ticketCategoriesData = [
  { name: 'Technical Issue', value: 42 },
  { name: 'Billing', value: 28 },
  { name: 'Feature Request', value: 15 },
  { name: 'General Question', value: 10 },
  { name: 'Complaint', value: 5 }
];

const responseTimeData = [
  { name: 'Week 1', responseTime: 5.2 },
  { name: 'Week 2', responseTime: 4.8 },
  { name: 'Week 3', responseTime: 3.9 },
  { name: 'Week 4', responseTime: 2.5 }
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

// Sample tickets data
const activeTickets = [
  {
    id: 'T-1234',
    client: 'Sarah Johnson',
    subject: 'Login issue after password reset',
    priority: 'high',
    status: 'open',
    created: '2023-11-23T14:30:00Z'
  },
  {
    id: 'T-1235',
    client: 'Michael Brown',
    subject: 'Question about billing cycle',
    priority: 'medium',
    status: 'in-progress',
    created: '2023-11-22T09:15:00Z'
  },
  {
    id: 'T-1236',
    client: 'Emily Davis',
    subject: 'Feature request: dark mode',
    priority: 'low',
    status: 'open',
    created: '2023-11-21T16:45:00Z'
  },
  {
    id: 'T-1237',
    client: 'David Wilson',
    subject: 'Website loading slowly',
    priority: 'high',
    status: 'in-progress',
    created: '2023-11-24T11:20:00Z'
  }
];

const SupportDashboard: React.FC = () => {
  const { currentAdmin } = useAdminAuth();
  
  useEffect(() => {
    // Store visit analytics in Supabase
    const logDashboardVisit = async () => {
      try {
        if (currentAdmin) {
          await supabase.from('analytics').insert({
            type: 'dashboard_visit',
            data: {
              dashboard: 'support',
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
  
  const handleTicketAction = (ticketId: string, action: string) => {
    toast.success(`Ticket ${ticketId} ${action} successfully`);
  };
  
  const getPriorityBadgeClass = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-blue-100 text-blue-800';
      case 'in-progress':
        return 'bg-purple-100 text-purple-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      case 'closed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours !== 1 ? 's' : ''} ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays} day${diffInDays !== 1 ? 's' : ''} ago`;
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Support Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome, <span className="font-medium">{currentAdmin?.name}</span>
        </p>
      </div>
      
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="tickets">Active Tickets</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Open Tickets</CardTitle>
                <AlertCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">24</div>
                <div className="flex items-center text-xs text-muted-foreground mt-1">
                  <ArrowUpRight className="mr-1 h-4 w-4 text-red-500" />
                  <span className="text-red-500 font-medium">+12.5%</span> from last week
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg. Response Time</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">2.5h</div>
                <div className="flex items-center text-xs text-muted-foreground mt-1">
                  <ArrowDownRight className="mr-1 h-4 w-4 text-green-500" />
                  <span className="text-green-500 font-medium">-35.8%</span> from last week
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Solved Tickets</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">87</div>
                <div className="flex items-center text-xs text-muted-foreground mt-1">
                  <ArrowUpRight className="mr-1 h-4 w-4 text-green-500" />
                  <span className="text-green-500 font-medium">+8.2%</span> from last week
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Satisfaction Rate</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">92%</div>
                <div className="flex items-center text-xs text-muted-foreground mt-1">
                  <ArrowUpRight className="mr-1 h-4 w-4 text-green-500" />
                  <span className="text-green-500 font-medium">+2.1%</span> from last week
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Charts */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Ticket Categories</CardTitle>
                <CardDescription>
                  Distribution of tickets by category
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={ticketCategoriesData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {ticketCategoriesData.map((entry, index) => (
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
            
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Weekly Tickets</CardTitle>
                <CardDescription>
                  Number of tickets created each day
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={weeklyTicketsData}
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
                      <Bar dataKey="tickets" fill="#2c5cc5" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Response Time Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Response Time Trend</CardTitle>
              <CardDescription>
                Average response time in hours per week
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={responseTimeData}
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
                    <Tooltip formatter={(value) => [`${value} hours`, 'Response Time']} />
                    <Legend />
                    <Line type="monotone" dataKey="responseTime" stroke="#8884d8" activeDot={{ r: 8 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          
          {/* Active Tickets */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Active Tickets</CardTitle>
              <CardDescription>
                Top priority tickets that need attention
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-auto max-h-[400px]">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-xs text-muted-foreground">
                      <th className="pb-3 font-medium">ID</th>
                      <th className="pb-3 font-medium">Client</th>
                      <th className="pb-3 font-medium">Subject</th>
                      <th className="pb-3 font-medium">Priority</th>
                      <th className="pb-3 font-medium">Status</th>
                      <th className="pb-3 font-medium">Created</th>
                      <th className="pb-3 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeTickets.map(ticket => (
                      <tr key={ticket.id} className="border-t border-border hover:bg-muted/50">
                        <td className="py-3 font-medium">{ticket.id}</td>
                        <td className="py-3">{ticket.client}</td>
                        <td className="py-3 max-w-[200px] truncate">{ticket.subject}</td>
                        <td className="py-3">
                          <span className={`px-2 py-1 ${getPriorityBadgeClass(ticket.priority)} rounded-full text-xs`}>
                            {ticket.priority.charAt(0).toUpperCase() + ticket.priority.slice(1)}
                          </span>
                        </td>
                        <td className="py-3">
                          <span className={`px-2 py-1 ${getStatusBadgeClass(ticket.status)} rounded-full text-xs`}>
                            {ticket.status.replace('-', ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                          </span>
                        </td>
                        <td className="py-3 text-muted-foreground text-sm">{formatDate(ticket.created)}</td>
                        <td className="py-3">
                          <div className="flex gap-2">
                            <button 
                              onClick={() => handleTicketAction(ticket.id, 'viewed')} 
                              className="text-primary text-sm hover:underline"
                            >
                              View
                            </button>
                            <button 
                              onClick={() => handleTicketAction(ticket.id, ticket.status === 'open' ? 'assigned' : 'resolved')} 
                              className="text-primary text-sm hover:underline"
                            >
                              {ticket.status === 'open' ? 'Assign' : 'Resolve'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="tickets">
          <Card>
            <CardHeader>
              <CardTitle>Active Tickets Management</CardTitle>
              <CardDescription>
                This tab will contain detailed ticket management tools.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>Ticket management content will be displayed here.</p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="performance">
          <Card>
            <CardHeader>
              <CardTitle>Support Performance</CardTitle>
              <CardDescription>
                This tab will contain support team performance metrics.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>Performance metrics content will be displayed here.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SupportDashboard;
