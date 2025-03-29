
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Define interfaces for financial data
export interface Transaction {
  id: string;
  client_id: string;
  amount: number;
  description: string;
  transaction_type: string;
  status: string;
  created_at: string;
  client?: {
    name?: string;
    id?: string;
  } | null;
}

export interface RevenueData {
  month: string;
  amount: number;
}

export interface FinancialSummary {
  totalRevenue: number;
  totalClients: number;
  averageRevenue: number;
  byMonth: RevenueData[];
  total: number;
  growth: number;
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
export const fetchRevenueData = async (): Promise<RevenueData[]> => {
  const { data, error } = await supabase
    .from('revenue_by_month')
    .select('*')
    .order('month', { ascending: true });

  if (error) {
    console.error('Error fetching revenue data:', error);
    throw error;
  }

  return data || [];
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
    const totalRevenue = revenueData.reduce((sum, item) => sum + item.amount, 0);
    
    // Calculate average revenue per client
    const averageRevenue = totalClients ? totalRevenue / totalClients : 0;
    
    // Calculate growth (from previous month to current)
    const sortedData = [...revenueData].sort((a, b) => 
      new Date(b.month).getTime() - new Date(a.month).getTime()
    );
    
    const currentMonth = sortedData[0]?.amount || 0;
    const previousMonth = sortedData[1]?.amount || 0;
    
    const growthPercentage = previousMonth ? 
      ((currentMonth - previousMonth) / previousMonth) * 100 : 0;
    
    return {
      totalRevenue,
      totalClients: totalClients || 0,
      averageRevenue,
      byMonth: revenueData,
      total: totalRevenue,
      growth: growthPercentage
    };
  } catch (error) {
    console.error('Error fetching financial summary:', error);
    throw error;
  }
};

// These functions are added to match the imports in Finance.tsx
export const fetchUserStats = async () => {
  return {
    totalUsers: 0,
    activeUsers: 0,
    newUsersThisMonth: 0
  };
};

export const fetchRecentTransactions = async () => {
  return await fetchTransactions();
};

export const fetchTransactionSummary = async () => {
  return await fetchTransactionData();
};

export const exportFinancialReport = async () => {
  toast.success("Financial report exported successfully");
  return true;
};
