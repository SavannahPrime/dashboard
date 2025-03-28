
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { Download, DollarSign, CreditCard, TrendingUp, AlertTriangle, ArrowUpRight, ArrowDownRight, Loader2 } from 'lucide-react';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { toast } from 'sonner';
import { 
  fetchRevenueData, 
  fetchUserStats, 
  fetchRecentTransactions, 
  fetchTransactionSummary,
  exportFinancialReport,
  type Transaction
} from '@/services/financialService';

const Finance: React.FC = () => {
  const { currentAdmin } = useAdminAuth();
  const [timeRange, setTimeRange] = useState('last30days');
  const [reportType, setReportType] = useState('revenue');
  const [isLoading, setIsLoading] = useState(true);
  
  const [revenueData, setRevenueData] = useState<{ name: string; revenue: number; }[]>([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [revenueGrowth, setRevenueGrowth] = useState(0);
  
  const [userStats, setUserStats] = useState({
    total: 0,
    active: 0,
    growth: 0
  });
  
  const [transactionSummary, setTransactionSummary] = useState({
    completed: 0,
    failed: 0,
    avgOrderValue: 0
  });
  
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  
  const paymentMethodData = [
    { name: 'Credit Card', value: 65 },
    { name: 'PayPal', value: 20 },
    { name: 'Bank Transfer', value: 10 },
    { name: 'Crypto', value: 5 },
  ];
  
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];
  
  // Fetch all financial data
  const fetchAllFinancialData = async () => {
    setIsLoading(true);
    try {
      // Fetch revenue data
      const revenue = await fetchRevenueData();
      setRevenueData(revenue.byMonth);
      setTotalRevenue(revenue.total);
      setRevenueGrowth(revenue.growth);
      
      // Fetch user stats
      const users = await fetchUserStats();
      setUserStats({
        total: users.total,
        active: users.active,
        growth: users.growth
      });
      
      // Fetch transaction summary
      const summary = await fetchTransactionSummary();
      setTransactionSummary({
        completed: summary.completed,
        failed: summary.failed,
        avgOrderValue: summary.avgOrderValue
      });
      
      // Fetch recent transactions
      const transactions = await fetchRecentTransactions();
      setRecentTransactions(transactions);
      
      toast.success('Financial data updated successfully');
    } catch (error) {
      console.error('Error fetching financial data:', error);
      toast.error('Failed to load financial data');
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    fetchAllFinancialData();
    
    // Set up auto-refresh every 5 minutes (300000ms)
    const intervalId = setInterval(() => {
      fetchAllFinancialData();
    }, 300000);
    
    return () => clearInterval(intervalId);
  }, []);
  
  const exportReport = async () => {
    toast.info(`Exporting ${reportType} report for ${timeRange}...`);
    
    try {
      const blob = await exportFinancialReport(
        reportType as any, 
        timeRange as any
      );
      
      if (!blob) {
        toast.error('Failed to generate report');
        return;
      }
      
      // Create download link
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${reportType}_${timeRange}_report.csv`;
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success('Report downloaded successfully');
    } catch (error) {
      console.error('Error exporting report:', error);
      toast.error('Failed to export report');
    }
  };
  
  // Helper function to get badge variant based on status
  const getBadgeVariant = (status: string) => {
    switch(status) {
      case 'completed':
        return 'default';
      case 'failed':
        return 'destructive';
      case 'pending':
      default:
        return 'outline';
    }
  };
  
  // Helper function to format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary mb-4" />
          <h3 className="text-lg font-medium">Loading financial data...</h3>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Financial Overview</h1>
          <p className="text-muted-foreground">
            Payment monitoring and financial reporting
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Select 
            value={timeRange} 
            onValueChange={setTimeRange}
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="last7days">Last 7 Days</SelectItem>
              <SelectItem value="last30days">Last 30 Days</SelectItem>
              <SelectItem value="last90days">Last 90 Days</SelectItem>
              <SelectItem value="lastyear">Last Year</SelectItem>
            </SelectContent>
          </Select>
          
          <Select 
            value={reportType} 
            onValueChange={setReportType}
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Report type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="revenue">Revenue</SelectItem>
              <SelectItem value="transactions">Transactions</SelectItem>
              <SelectItem value="subscriptions">Subscriptions</SelectItem>
              <SelectItem value="refunds">Refunds</SelectItem>
            </SelectContent>
          </Select>
          
          <Button onClick={exportReport} variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
            <div className="flex items-center pt-1">
              {revenueGrowth >= 0 ? (
                <>
                  <ArrowUpRight className="mr-1 h-4 w-4 text-green-500" />
                  <span className="text-xs text-green-500 font-medium">+{revenueGrowth.toFixed(1)}%</span>
                </>
              ) : (
                <>
                  <ArrowDownRight className="mr-1 h-4 w-4 text-red-500" />
                  <span className="text-xs text-red-500 font-medium">{revenueGrowth.toFixed(1)}%</span>
                </>
              )}
              <span className="text-xs text-muted-foreground ml-1">from last month</span>
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
            <div className="flex items-center pt-1">
              {userStats.growth >= 0 ? (
                <>
                  <ArrowUpRight className="mr-1 h-4 w-4 text-green-500" />
                  <span className="text-xs text-green-500 font-medium">+{userStats.growth.toFixed(1)}%</span>
                </>
              ) : (
                <>
                  <ArrowDownRight className="mr-1 h-4 w-4 text-red-500" />
                  <span className="text-xs text-red-500 font-medium">{userStats.growth.toFixed(1)}%</span>
                </>
              )}
              <span className="text-xs text-muted-foreground ml-1">from last month</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Order Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(transactionSummary.avgOrderValue)}</div>
            <div className="flex items-center pt-1">
              <ArrowUpRight className="mr-1 h-4 w-4 text-green-500" />
              <span className="text-xs text-green-500 font-medium">+8%</span>
              <span className="text-xs text-muted-foreground ml-1">from last month</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed Payments</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{transactionSummary.failed}</div>
            <div className="flex items-center pt-1">
              <ArrowDownRight className="mr-1 h-4 w-4 text-green-500" />
              <span className="text-xs text-green-500 font-medium">-3%</span>
              <span className="text-xs text-muted-foreground ml-1">from last month</span>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
          <TabsTrigger value="refunds">Refunds</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="lg:col-span-4">
              <CardHeader>
                <CardTitle>Revenue Analysis</CardTitle>
                <CardDescription>Monthly revenue over time</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                    <Legend />
                    <Bar dataKey="revenue" fill="#8884d8" name="Revenue" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            <Card className="lg:col-span-3">
              <CardHeader>
                <CardTitle>Payment Methods</CardTitle>
                <CardDescription>Distribution by payment type</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={paymentMethodData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {paymentMethodData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="transactions">
          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>Latest payment activities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative w-full overflow-auto">
                <table className="w-full caption-bottom text-sm">
                  <thead className="[&_tr]:border-b">
                    <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">ID</th>
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Customer</th>
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Amount</th>
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Status</th>
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Date</th>
                    </tr>
                  </thead>
                  <tbody className="[&_tr:last-child]:border-0">
                    {recentTransactions.map(transaction => (
                      <tr key={transaction.id} className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                        <td className="p-4 align-middle">{transaction.id.substring(0, 8)}...</td>
                        <td className="p-4 align-middle">{transaction.customer}</td>
                        <td className="p-4 align-middle">{formatCurrency(transaction.amount)}</td>
                        <td className="p-4 align-middle">
                          <Badge
                            variant={getBadgeVariant(transaction.status)}
                          >
                            {transaction.status}
                          </Badge>
                        </td>
                        <td className="p-4 align-middle">{new Date(transaction.date).toLocaleDateString()}</td>
                      </tr>
                    ))}
                    {recentTransactions.length === 0 && (
                      <tr>
                        <td colSpan={5} className="p-4 text-center text-muted-foreground">
                          No transactions found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="subscriptions">
          <Card>
            <CardHeader>
              <CardTitle>Subscription Lifecycle</CardTitle>
              <CardDescription>Active and churned subscriptions over time</CardDescription>
            </CardHeader>
            <CardContent className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="revenue" stroke="#8884d8" name="Active Subscriptions" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="refunds">
          <Card>
            <CardHeader>
              <CardTitle>Refund Analytics</CardTitle>
              <CardDescription>Refund rate and reasons</CardDescription>
            </CardHeader>
            <CardContent className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="revenue" fill="#FF8042" name="Refund Amount" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Finance;
