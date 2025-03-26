
import React, { useEffect, useState } from 'react';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, DollarSign, TrendingUp, Package, ArrowUpRight, ArrowDownRight, RefreshCw, Loader2, FileText } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const SalesDashboard: React.FC = () => {
  const { currentAdmin } = useAdminAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [salesStats, setSalesStats] = useState({
    totalSales: 0,
    newClients: 0,
    conversionRate: 0,
    servicesSold: 0
  });
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [isCreateInvoiceOpen, setIsCreateInvoiceOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [clients, setClients] = useState<any[]>([]);
  const [newInvoice, setNewInvoice] = useState({
    clientId: '',
    amount: '',
    description: '',
    dueDate: ''
  });
  
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
  
  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      // Fetch transactions
      const { data: transactionsData, error: transactionsError } = await supabase
        .from('transactions')
        .select(`
          *,
          clients (
            name,
            email
          )
        `)
        .order('date', { ascending: false });
      
      if (transactionsError) throw transactionsError;
      
      setRecentTransactions(transactionsData?.slice(0, 5) || []);
      
      // Calculate sales statistics
      const totalSales = transactionsData?.reduce((sum, transaction) => {
        return sum + (transaction.amount ? parseFloat(transaction.amount) : 0);
      }, 0) || 0;
      
      // Fetch clients count
      const { count: clientsCount, error: clientsError } = await supabase
        .from('clients')
        .select('*', { count: 'exact', head: true });
      
      if (clientsError) throw clientsError;
      
      // Fetch new clients this month
      const now = new Date();
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      
      const { count: newClientsCount, error: newClientsError } = await supabase
        .from('clients')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', firstDayOfMonth);
      
      if (newClientsError) throw newClientsError;
      
      // Set statistics
      setSalesStats({
        totalSales,
        newClients: newClientsCount || 0,
        conversionRate: 3.2, // Could calculate this from actual data
        servicesSold: 182 // Could calculate this from actual data
      });
      
      // Set up sample opportunities for now
      // In a real app, you'd fetch these from a CRM table
      setOpportunities([
        {
          id: 1,
          client: 'David Wilson',
          service: 'Website Development',
          value: 12500,
          stage: 'Negotiation',
          lastContact: '2 days ago'
        },
        {
          id: 2,
          client: 'Sarah Johnson',
          service: 'Digital Marketing',
          value: 8200,
          stage: 'Proposal',
          lastContact: '5 days ago'
        },
        {
          id: 3,
          client: 'Michael Brown',
          service: 'AI Automation',
          value: 18000,
          stage: 'Qualified',
          lastContact: 'Yesterday'
        }
      ]);
      
      // Log visit analytics in Supabase
      await supabase.from('analytics').insert({
        type: 'dashboard_visit',
        data: {
          dashboard: 'sales',
          admin_id: currentAdmin?.id,
          admin_role: currentAdmin?.role
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
  
  const fetchClients = async () => {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('status', 'active')
        .order('name', { ascending: true });
      
      if (error) throw error;
      
      setClients(data || []);
    } catch (error) {
      console.error('Error fetching clients:', error);
      toast.error('Failed to load clients');
    }
  };
  
  const handleCreateInvoice = async () => {
    if (!newInvoice.clientId || !newInvoice.amount || !newInvoice.description) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    setIsLoading(true);
    try {
      // Generate invoice number
      const invoiceNumber = `INV-${Date.now().toString().slice(-6)}`;
      
      // Create transaction record
      const { data, error } = await supabase
        .from('transactions')
        .insert({
          client_id: newInvoice.clientId,
          amount: parseFloat(newInvoice.amount),
          description: newInvoice.description,
          type: 'invoice',
          status: 'pending',
          invoice_number: invoiceNumber,
          date: new Date().toISOString()
        })
        .select()
        .single();
      
      if (error) throw error;
      
      toast.success('Invoice created successfully');
      
      // Log analytics
      await supabase.from('analytics').insert({
        type: 'admin_action',
        data: {
          admin_id: currentAdmin?.id,
          action: 'create_invoice',
          invoice_id: data.id,
          client_id: newInvoice.clientId,
          amount: newInvoice.amount
        },
        period: 'daily'
      });
      
      // Clear form and close dialog
      setNewInvoice({
        clientId: '',
        amount: '',
        description: '',
        dueDate: ''
      });
      setIsCreateInvoiceOpen(false);
      
      // Refresh dashboard data
      fetchDashboardData();
    } catch (error) {
      console.error('Error creating invoice:', error);
      toast.error('Failed to create invoice');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSendInvoice = async (transactionId: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('transactions')
        .update({ status: 'sent' })
        .eq('id', transactionId)
        .select()
        .single();
      
      if (error) throw error;
      
      toast.success('Invoice sent to client');
      fetchDashboardData();
      
      // Log analytics
      await supabase.from('analytics').insert({
        type: 'admin_action',
        data: {
          admin_id: currentAdmin?.id,
          action: 'send_invoice',
          invoice_id: transactionId
        },
        period: 'daily'
      });
    } catch (error) {
      console.error('Error sending invoice:', error);
      toast.error('Failed to send invoice');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleCancelInvoice = async (transactionId: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('transactions')
        .update({ status: 'cancelled' })
        .eq('id', transactionId)
        .select()
        .single();
      
      if (error) throw error;
      
      toast.success('Invoice cancelled');
      fetchDashboardData();
      
      // Log analytics
      await supabase.from('analytics').insert({
        type: 'admin_action',
        data: {
          admin_id: currentAdmin?.id,
          action: 'cancel_invoice',
          invoice_id: transactionId
        },
        period: 'daily'
      });
    } catch (error) {
      console.error('Error cancelling invoice:', error);
      toast.error('Failed to cancel invoice');
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    fetchDashboardData();
    fetchClients();
    
    // Set up realtime subscription for transactions
    const channel = supabase
      .channel('public:transactions')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'transactions' 
      }, () => {
        fetchDashboardData(); // Refresh when transactions are updated
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentAdmin?.id]);
  
  const handleContactClient = (clientName: string) => {
    toast.success(`Contacting ${clientName}. Opening communication channel...`);
  };
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };
  
  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Sales Dashboard</h1>
        <div className="flex items-center gap-4">
          <p className="text-muted-foreground">
            Welcome, <span className="font-medium">{currentAdmin?.name}</span>
          </p>
          <Button onClick={() => setIsCreateInvoiceOpen(true)}>
            <FileText className="h-4 w-4 mr-2" />
            Create Invoice
          </Button>
          <Button variant="outline" onClick={fetchDashboardData} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="leads">Leads</TabsTrigger>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
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
                <div className="text-2xl font-bold">{formatCurrency(salesStats.totalSales)}</div>
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
                <div className="text-2xl font-bold">{salesStats.newClients}</div>
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
                <div className="text-2xl font-bold">{salesStats.conversionRate}%</div>
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
                <div className="text-2xl font-bold">{salesStats.servicesSold}</div>
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
                    {opportunities.map(opportunity => (
                      <tr key={opportunity.id} className="border-t border-border hover:bg-muted/50">
                        <td className="py-3">{opportunity.client}</td>
                        <td className="py-3">{opportunity.service}</td>
                        <td className="py-3">{formatCurrency(opportunity.value)}</td>
                        <td className="py-3">
                          <Badge 
                            variant="outline"
                            className={
                              opportunity.stage === 'Negotiation' ? 'bg-yellow-100 text-yellow-800 border-yellow-300' :
                              opportunity.stage === 'Proposal' ? 'bg-blue-100 text-blue-800 border-blue-300' :
                              'bg-green-100 text-green-800 border-green-300'
                            }
                          >
                            {opportunity.stage}
                          </Badge>
                        </td>
                        <td className="py-3 text-muted-foreground text-sm">{opportunity.lastContact}</td>
                        <td className="py-3">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleContactClient(opportunity.client)}
                          >
                            Contact
                          </Button>
                        </td>
                      </tr>
                    ))}
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
                Track and manage your sales leads and opportunities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>Leads management content will be implemented here.</p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="invoices" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>
                Recent payment activities and invoices
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-10">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Invoice Number</TableHead>
                        <TableHead>Client</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {recentTransactions.length > 0 ? (
                        recentTransactions.map((transaction) => (
                          <TableRow key={transaction.id}>
                            <TableCell className="font-medium">
                              {transaction.invoice_number || 'N/A'}
                            </TableCell>
                            <TableCell>
                              {transaction.clients?.name || 'Unknown'}
                            </TableCell>
                            <TableCell>{formatCurrency(transaction.amount)}</TableCell>
                            <TableCell>{transaction.description || 'No description'}</TableCell>
                            <TableCell>
                              <Badge 
                                variant="outline"
                                className={
                                  transaction.status === 'completed' ? 'bg-green-100 text-green-800 border-green-300' :
                                  transaction.status === 'pending' ? 'bg-yellow-100 text-yellow-800 border-yellow-300' :
                                  transaction.status === 'sent' ? 'bg-blue-100 text-blue-800 border-blue-300' :
                                  'bg-gray-100 text-gray-800 border-gray-300'
                                }
                              >
                                {transaction.status}
                              </Badge>
                            </TableCell>
                            <TableCell>{formatDate(transaction.date)}</TableCell>
                            <TableCell>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    Actions
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuLabel>Manage</DropdownMenuLabel>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem onClick={() => {
                                    toast.success('Invoice viewed');
                                  }}>
                                    View Details
                                  </DropdownMenuItem>
                                  {transaction.status === 'pending' && (
                                    <DropdownMenuItem onClick={() => handleSendInvoice(transaction.id)}>
                                      Send to Client
                                    </DropdownMenuItem>
                                  )}
                                  {(transaction.status === 'pending' || transaction.status === 'sent') && (
                                    <DropdownMenuItem onClick={() => handleCancelInvoice(transaction.id)}>
                                      Cancel Invoice
                                    </DropdownMenuItem>
                                  )}
                                  <DropdownMenuItem onClick={() => {
                                    toast.success('Invoice downloaded');
                                  }}>
                                    Download PDF
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
                            No recent transactions found
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Create Invoice Dialog */}
      <Dialog open={isCreateInvoiceOpen} onOpenChange={setIsCreateInvoiceOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create New Invoice</DialogTitle>
            <DialogDescription>
              Create an invoice to bill a client for services
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="client" className="text-right">
                Client
              </Label>
              <div className="col-span-3">
                <select
                  id="client"
                  className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={newInvoice.clientId}
                  onChange={(e) => setNewInvoice({ ...newInvoice, clientId: e.target.value })}
                >
                  <option value="">Select a client</option>
                  {clients.map(client => (
                    <option key={client.id} value={client.id}>
                      {client.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="amount" className="text-right">
                Amount
              </Label>
              <div className="col-span-3 relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2">$</span>
                <Input
                  id="amount"
                  type="number"
                  className="pl-7"
                  value={newInvoice.amount}
                  onChange={(e) => setNewInvoice({ ...newInvoice, amount: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Description
              </Label>
              <Input
                id="description"
                className="col-span-3"
                value={newInvoice.description}
                onChange={(e) => setNewInvoice({ ...newInvoice, description: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="dueDate" className="text-right">
                Due Date
              </Label>
              <Input
                id="dueDate"
                type="date"
                className="col-span-3"
                value={newInvoice.dueDate}
                onChange={(e) => setNewInvoice({ ...newInvoice, dueDate: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateInvoiceOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateInvoice} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Invoice'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SalesDashboard;
