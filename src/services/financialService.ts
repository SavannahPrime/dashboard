
import { supabase } from '@/integrations/supabase/client';

export type RevenueData = {
  total: number;
  byMonth: { name: string; revenue: number }[];
  growth: number;
};

export type UserStats = {
  total: number;
  active: number;
  newThisMonth: number;
  growth: number;
};

export type TransactionSummary = {
  totalTransactions: number;
  completed: number;
  pending: number;
  failed: number;
  avgOrderValue: number;
};

export type Transaction = {
  id: string;
  customer: string;
  customerId: string;
  amount: number;
  status: 'completed' | 'pending' | 'failed';
  date: string;
  description: string;
  method?: string;
};

export const fetchRevenueData = async (): Promise<RevenueData> => {
  try {
    // Get all completed transactions
    const { data: transactions, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('status', 'completed');
    
    if (error) throw error;
    
    // Calculate total revenue
    const totalRevenue = transactions.reduce((sum, transaction) => {
      return sum + (parseFloat(transaction.amount) || 0);
    }, 0);
    
    // Group transactions by month for chart data
    const monthlyData: Record<string, number> = {};
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    transactions.forEach(transaction => {
      const date = new Date(transaction.date);
      const monthName = months[date.getMonth()];
      
      if (!monthlyData[monthName]) {
        monthlyData[monthName] = 0;
      }
      
      monthlyData[monthName] += parseFloat(transaction.amount) || 0;
    });
    
    // Convert to array format for charts
    const byMonth = Object.keys(monthlyData).map(month => ({
      name: month,
      revenue: monthlyData[month]
    }));
    
    // Sort by month order
    byMonth.sort((a, b) => {
      return months.indexOf(a.name) - months.indexOf(b.name);
    });
    
    // Calculate growth (comparing to previous month)
    let growth = 0;
    const currentMonth = new Date().getMonth();
    const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    
    const currentMonthRevenue = monthlyData[months[currentMonth]] || 0;
    const previousMonthRevenue = monthlyData[months[previousMonth]] || 0;
    
    if (previousMonthRevenue > 0) {
      growth = ((currentMonthRevenue - previousMonthRevenue) / previousMonthRevenue) * 100;
    }
    
    return {
      total: totalRevenue,
      byMonth,
      growth
    };
  } catch (error) {
    console.error('Error fetching revenue data:', error);
    return {
      total: 0,
      byMonth: [],
      growth: 0
    };
  }
};

export const fetchUserStats = async (): Promise<UserStats> => {
  try {
    const { data: clients, error } = await supabase
      .from('clients')
      .select('*');
    
    if (error) throw error;
    
    const total = clients.length;
    const active = clients.filter(client => client.status === 'active').length;
    
    // Calculate new clients this month
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    const newThisMonth = clients.filter(client => {
      const createdDate = new Date(client.created_at);
      return createdDate.getMonth() === currentMonth && 
             createdDate.getFullYear() === currentYear;
    }).length;
    
    // Calculate previous month count for growth calculation
    const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const prevMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
    
    const prevMonthCount = clients.filter(client => {
      const createdDate = new Date(client.created_at);
      return createdDate.getMonth() === prevMonth && 
             createdDate.getFullYear() === prevMonthYear;
    }).length;
    
    let growth = 0;
    if (prevMonthCount > 0) {
      growth = ((newThisMonth - prevMonthCount) / prevMonthCount) * 100;
    } else if (newThisMonth > 0) {
      growth = 100; // If previous month had 0, but this month has some, that's 100% growth
    }
    
    return {
      total,
      active,
      newThisMonth,
      growth
    };
  } catch (error) {
    console.error('Error fetching user stats:', error);
    return {
      total: 0,
      active: 0,
      newThisMonth: 0,
      growth: 0
    };
  }
};

export const fetchRecentTransactions = async (limit = 5): Promise<Transaction[]> => {
  try {
    const { data, error } = await supabase
      .from('transactions')
      .select(`
        id,
        amount,
        date,
        status,
        description,
        clients(id, name, email)
      `)
      .order('date', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    
    return data.map(transaction => ({
      id: transaction.id,
      customer: transaction.clients?.name || 'Unknown',
      customerId: transaction.clients?.id || '',
      amount: parseFloat(transaction.amount) || 0,
      status: transaction.status as 'completed' | 'pending' | 'failed',
      date: transaction.date,
      description: transaction.description || ''
    }));
  } catch (error) {
    console.error('Error fetching recent transactions:', error);
    return [];
  }
};

export const fetchTransactionSummary = async (): Promise<TransactionSummary> => {
  try {
    const { data, error } = await supabase
      .from('transactions')
      .select('*');
    
    if (error) throw error;
    
    const totalTransactions = data.length;
    const completed = data.filter(t => t.status === 'completed').length;
    const pending = data.filter(t => t.status === 'pending').length;
    const failed = data.filter(t => t.status === 'failed').length;
    
    // Calculate average order value from completed transactions
    const completedTransactions = data.filter(t => t.status === 'completed');
    const totalValue = completedTransactions.reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);
    const avgOrderValue = completedTransactions.length > 0 ? totalValue / completedTransactions.length : 0;
    
    return {
      totalTransactions,
      completed,
      pending,
      failed,
      avgOrderValue
    };
  } catch (error) {
    console.error('Error fetching transaction summary:', error);
    return {
      totalTransactions: 0,
      completed: 0,
      pending: 0,
      failed: 0,
      avgOrderValue: 0
    };
  }
};

export const exportFinancialReport = async (
  reportType: 'revenue' | 'transactions' | 'subscriptions' | 'refunds',
  timeRange: 'last7days' | 'last30days' | 'last90days' | 'lastyear'
): Promise<Blob | null> => {
  // This would connect to a real export functionality
  // For now, we'll simulate the export with a CSV
  try {
    let data: any[];
    
    // Get date range
    const endDate = new Date();
    const startDate = new Date();
    
    switch (timeRange) {
      case 'last7days':
        startDate.setDate(endDate.getDate() - 7);
        break;
      case 'last30days':
        startDate.setDate(endDate.getDate() - 30);
        break;
      case 'last90days':
        startDate.setDate(endDate.getDate() - 90);
        break;
      case 'lastyear':
        startDate.setFullYear(endDate.getFullYear() - 1);
        break;
    }
    
    // Format dates for query
    const startDateStr = startDate.toISOString();
    const endDateStr = endDate.toISOString();
    
    // Fetch relevant data based on report type
    switch (reportType) {
      case 'transactions':
        const { data: transactions } = await supabase
          .from('transactions')
          .select(`
            id,
            amount,
            date,
            status,
            description,
            clients(name)
          `)
          .gte('date', startDateStr)
          .lte('date', endDateStr);
          
        data = transactions || [];
        break;
        
      // Implement other report types as needed
      default:
        data = [];
    }
    
    // Create CSV content
    let csvContent = '';
    
    // Add headers based on report type
    if (reportType === 'transactions') {
      csvContent = 'ID,Customer,Amount,Date,Status,Description\n';
      
      // Add rows
      data.forEach(item => {
        csvContent += `${item.id},`;
        // Fix: Access clients object correctly by checking if it's an object, not an array
        const clientData = item.clients || {};
        const clientName = typeof clientData === 'object' && !Array.isArray(clientData) ? clientData.name || 'Unknown' : 'Unknown';
        csvContent += `"${clientName}",`;
        csvContent += `${item.amount},`;
        csvContent += `${new Date(item.date).toLocaleDateString()},`;
        csvContent += `${item.status},`;
        csvContent += `"${item.description || ''}"\n`;
      });
    }
    
    // Create and return the Blob
    return new Blob([csvContent], { type: 'text/csv' });
  } catch (error) {
    console.error(`Error exporting ${reportType} report:`, error);
    return null;
  }
};
