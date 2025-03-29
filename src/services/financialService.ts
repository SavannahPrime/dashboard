
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { FinancialSummary, TransactionSummary, UserStats } from '@/lib/types';

// Define interfaces for financial data
export interface Transaction {
  id: string;
  client_id: string;
  amount: number;
  description: string;
  transaction_type: string;
  status: string;
  created_at: string;
  date: string;
  customer: string;
  client?: {
    name?: string;
    id?: string;
  } | null;
}

export interface RevenueData {
  month: string;
  amount: number;
  name?: string;
  revenue?: number;
  year?: number;
  total?: number;
  growth?: number;
  byMonth?: { name: string; revenue: number; }[];
}

// Function to fetch all transactions
export const fetchTransactions = async (): Promise<Transaction[]> => {
  const { data, error } = await supabase
    .from('transactions')
    .select(`
      *,
      client:client_id (
        name,
        id
      )
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching transactions:', error);
    throw error;
  }

  // Process the data to handle potential null clients
  const processedData = data.map(item => {
    // Ensure client is never null, provide default values if needed
    const safeClient = item.client || {};
    
    return {
      ...item,
      date: item.date || item.created_at,
      customer: safeClient.name || 'Unknown',
      client: {
        name: safeClient.name || 'Unknown',
        id: safeClient.id || 'unknown-id'
      }
    };
  });

  return processedData;
};

// Function to fetch transactions for a specific client
export const fetchClientTransactions = async (clientId: string): Promise<Transaction[]> => {
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('client_id', clientId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching client transactions:', error);
    throw error;
  }

  return data || [];
};

// Function to create a new transaction
export const createTransaction = async (
  clientId: string,
  amount: number,
  description: string,
  type: string
): Promise<void> => {
  try {
    const { error } = await supabase
      .from('transactions')
      .insert({
        client_id: clientId,
        amount,
        description,
        transaction_type: type,
        status: 'completed'
      });

    if (error) throw error;

    toast.success('Transaction created successfully');
  } catch (error) {
    console.error('Error creating transaction:', error);
    toast.error('Failed to create transaction');
    throw error;
  }
};

// Function to fetch revenue data for dashboard
export const fetchRevenueData = async (): Promise<RevenueData> => {
  try {
    const { data, error } = await supabase
      .from('revenue_by_month')
      .select('*')
      .order('month', { ascending: true });

    if (error) {
      console.error('Error fetching revenue data:', error);
      throw error;
    }

    // Transform data to match expected format
    const byMonth = (data || []).map(item => ({
      name: item.month,
      revenue: item.amount
    }));

    // Calculate total revenue
    const total = (data || []).reduce((sum, item) => sum + item.amount, 0);
    
    // Calculate growth (from previous month to current)
    const sortedData = [...(data || [])].sort((a, b) => 
      new Date(b.month).getTime() - new Date(a.month).getTime()
    );
    
    const currentMonth = sortedData[0]?.amount || 0;
    const previousMonth = sortedData[1]?.amount || 0;
    
    const growth = previousMonth ? 
      ((currentMonth - previousMonth) / previousMonth) * 100 : 0;

    return {
      month: sortedData[0]?.month || new Date().toISOString().slice(0, 7),
      year: new Date().getFullYear(),
      byMonth,
      total,
      growth,
      amount: total
    };
  } catch (error) {
    console.error('Error in fetchRevenueData:', error);
    // Return fallback data
    return {
      month: new Date().toISOString().slice(0, 7),
      year: new Date().getFullYear(),
      byMonth: [],
      total: 0,
      growth: 0,
      amount: 0
    };
  }
};

// Function to fetch transaction summary data
export const fetchTransactionData = async (): Promise<FinancialSummary> => {
  try {
    // Fetch revenue data
    const revenueData = await fetchRevenueData();
    
    // Fetch total number of clients
    const { count: totalClients, error: clientsError } = await supabase
      .from('clients')
      .select('*', { count: 'exact', head: true });
    
    if (clientsError) throw clientsError;
    
    // Calculate total revenue
    const totalRevenue = revenueData.total || 0;
    
    // Calculate average revenue per client
    const averageRevenue = totalClients ? totalRevenue / totalClients : 0;
    
    return {
      totalRevenue,
      totalClients: totalClients || 0,
      averageRevenue,
      byMonth: revenueData.byMonth || [],
      total: totalRevenue,
      growth: revenueData.growth || 0,
      completed: 0,
      failed: 0,
      avgOrderValue: 0
    };
  } catch (error) {
    console.error('Error fetching financial summary:', error);
    throw error;
  }
};

// Function to fetch user stats
export const fetchUserStats = async (): Promise<UserStats> => {
  try {
    // Fetch client data
    const { data, error } = await supabase
      .from('clients')
      .select('*');
    
    if (error) throw error;
    
    const total = data?.length || 0;
    const active = data?.filter(client => client.status === 'active').length || 0;
    
    // Calculate growth (mock data for now)
    const growth = 5.2;
    
    return {
      total,
      active,
      growth,
      totalUsers: total,
      activeUsers: active,
      newUsersThisMonth: Math.floor(total * 0.1) // 10% of total as new users
    };
  } catch (error) {
    console.error('Error fetching user stats:', error);
    return {
      total: 0,
      active: 0,
      growth: 0,
      totalUsers: 0,
      activeUsers: 0,
      newUsersThisMonth: 0
    };
  }
};

// Function to fetch recent transactions
export const fetchRecentTransactions = async (): Promise<Transaction[]> => {
  return await fetchTransactions();
};

// Function to fetch transaction summary
export const fetchTransactionSummary = async (): Promise<TransactionSummary> => {
  try {
    const { data, error } = await supabase
      .from('transactions')
      .select('*');
    
    if (error) throw error;
    
    const completed = data?.filter(transaction => transaction.status === 'completed').length || 0;
    const failed = data?.filter(transaction => transaction.status === 'failed').length || 0;
    
    // Calculate average order value
    const completedTransactions = data?.filter(transaction => transaction.status === 'completed') || [];
    const totalAmount = completedTransactions.reduce((sum, transaction) => sum + transaction.amount, 0);
    const avgOrderValue = completedTransactions.length ? totalAmount / completedTransactions.length : 0;
    
    return {
      completed,
      failed,
      avgOrderValue
    };
  } catch (error) {
    console.error('Error fetching transaction summary:', error);
    return {
      completed: 0,
      failed: 0,
      avgOrderValue: 0
    };
  }
};

// Function to export financial report
export const exportFinancialReport = async (
  reportType: string,
  timeRange: string
): Promise<Blob | null> => {
  try {
    // Mock implementation - In a real app, this would call an API endpoint
    // that generates a CSV or PDF file
    console.log(`Exporting ${reportType} report for ${timeRange}`);
    
    // Simulate successful export
    const csvData = "Date,Amount,Description\n2023-01-01,1000,Subscription\n2023-01-15,750,Service Fee";
    const blob = new Blob([csvData], { type: 'text/csv' });
    
    return blob;
  } catch (error) {
    console.error('Error exporting report:', error);
    return null;
  }
};
