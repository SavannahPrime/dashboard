
import { supabase } from '@/integrations/supabase/client';

export type RevenueData = {
  id: string;
  amount: number;
  date: string;
  month: string;
  year: number;
  source: string;
  category: string;
  // Additional fields for summarized data
  total?: number;
  growth?: number;
  byMonth?: { name: string; amount: number }[];
};

export type InvoiceData = {
  id: string;
  invoiceNumber: string;
  clientId: string;
  clientName: string;
  amount: number;
  date: string;
  dueDate: string;
  status: 'paid' | 'unpaid' | 'overdue';
};

export type TransactionData = {
  id: string;
  clientId: string;
  clientName: string;
  amount: number;
  date: string;
  type: string;
  status: string;
  description: string;
};

export type ClientData = {
  id: string;
  name: string;
  email: string;
  status: string;
  subscriptionStatus: string;
  totalSpent: number;
  joinDate: string;
  lastPurchase: string;
};

export type PaymentMethodData = {
  id: string;
  clientId: string;
  cardType: string;
  lastFour: string;
  expiryMonth: string;
  expiryYear: string;
  isDefault: boolean;
};

// Function to fetch revenue data
export const fetchRevenueData = async (): Promise<RevenueData[]> => {
  try {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('status', 'completed')
      .order('date', { ascending: false });
    
    if (error) throw error;
    
    return (data || []).map(transaction => ({
      id: transaction.id,
      amount: parseFloat(transaction.amount) || 0,
      date: transaction.date,
      month: new Date(transaction.date).toLocaleString('default', { month: 'short' }),
      year: new Date(transaction.date).getFullYear(),
      source: transaction.type,
      category: transaction.description ? transaction.description.split(':')[0].trim() : 'General'
    }));
  } catch (error) {
    console.error('Error fetching revenue data:', error);
    return [];
  }
};

// Function to fetch summarized revenue data
export const fetchRevenueSummary = async (period: 'daily' | 'monthly' | 'yearly' = 'monthly'): Promise<RevenueData> => {
  try {
    const now = new Date();
    let startDate;
    
    switch (period) {
      case 'daily':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 30);
        break;
      case 'monthly':
        startDate = new Date(now.getFullYear(), now.getMonth() - 12, 1);
        break;
      case 'yearly':
        startDate = new Date(now.getFullYear() - 5, 0, 1);
        break;
    }
    
    // Format startDate to ISO string
    const startDateStr = startDate.toISOString();
    
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('status', 'completed')
      .gte('date', startDateStr)
      .order('date', { ascending: false });
    
    if (error) throw error;
    
    const total = (data || []).reduce((sum, transaction) => sum + (parseFloat(transaction.amount) || 0), 0);
    
    // Group by period
    const groupedData: Record<string, number> = {};
    
    (data || []).forEach(transaction => {
      const date = new Date(transaction.date);
      let key;
      
      if (period === 'daily') {
        key = date.toISOString().split('T')[0]; // YYYY-MM-DD
      } else if (period === 'monthly') {
        const monthName = date.toLocaleString('default', { month: 'short' });
        key = `${monthName} ${date.getFullYear()}`;
      } else {
        key = date.getFullYear().toString();
      }
      
      if (!groupedData[key]) {
        groupedData[key] = 0;
      }
      
      groupedData[key] += parseFloat(transaction.amount) || 0;
    });
    
    // Convert to array and sort
    const byMonth = Object.keys(groupedData).map(key => ({
      name: key,
      amount: groupedData[key]
    })).sort((a, b) => {
      // For monthly data, sort by month and year
      if (period === 'monthly') {
        const [aMonth, aYear] = a.name.split(' ');
        const [bMonth, bYear] = b.name.split(' ');
        
        if (aYear !== bYear) {
          return parseInt(aYear) - parseInt(bYear);
        }
        
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return months.indexOf(aMonth) - months.indexOf(bMonth);
      }
      
      return a.name.localeCompare(b.name);
    });
    
    return {
      id: 'summary',
      amount: 0,
      date: now.toISOString(),
      month: now.toLocaleString('default', { month: 'short' }),
      year: now.getFullYear(),
      source: 'all',
      category: 'all',
      total: total,
      growth: 0, // Calculate growth based on previous period
      byMonth: byMonth
    };
  } catch (error) {
    console.error('Error fetching revenue summary:', error);
    return {
      id: 'error',
      amount: 0,
      date: new Date().toISOString(),
      month: '',
      year: 0,
      source: '',
      category: '',
      total: 0,
      growth: 0,
      byMonth: []
    };
  }
};

// Function to fetch invoice data
export const fetchInvoiceData = async (): Promise<InvoiceData[]> => {
  try {
    const { data, error } = await supabase
      .from('transactions')
      .select(`
        *,
        clients:client_id (name, id)
      `)
      .not('invoice_number', 'is', null)
      .order('date', { ascending: false });
    
    if (error) throw error;
    
    return (data || []).map(invoice => {
      // Safely handle client data
      const clientData = invoice.clients || {};
      
      return {
        id: invoice.id,
        invoiceNumber: invoice.invoice_number || `INV-${Math.floor(Math.random() * 10000)}`,
        clientId: invoice.client_id,
        clientName: clientData && typeof clientData.name === 'string' ? clientData.name : 'Unknown Client',
        amount: parseFloat(invoice.amount) || 0,
        date: invoice.date,
        dueDate: new Date(new Date(invoice.date).getTime() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        status: invoice.status as 'paid' | 'unpaid' | 'overdue'
      };
    });
  } catch (error) {
    console.error('Error fetching invoice data:', error);
    return [];
  }
};

// Function to fetch transaction data
export const fetchTransactionData = async (): Promise<TransactionData[]> => {
  try {
    const { data, error } = await supabase
      .from('transactions')
      .select(`
        *,
        clients:client_id (name, id)
      `)
      .order('date', { ascending: false });
    
    if (error) throw error;
    
    return (data || []).map(transaction => {
      // Safely access client data with proper type checking
      const clientData = transaction.clients || {};
      
      return {
        id: transaction.id,
        clientId: clientData && typeof clientData.id === 'string' ? clientData.id : '',
        clientName: clientData && typeof clientData.name === 'string' ? clientData.name : 'Unknown Client',
        amount: parseFloat(transaction.amount) || 0,
        date: transaction.date,
        type: transaction.type,
        status: transaction.status,
        description: transaction.description || ''
      };
    });
  } catch (error) {
    console.error('Error fetching transaction data:', error);
    return [];
  }
};

// Function to fetch client financial data
export const fetchClientFinancialData = async (): Promise<ClientData[]> => {
  try {
    // Get client data
    const { data: clientsData, error: clientsError } = await supabase
      .from('clients')
      .select('*');
    
    if (clientsError) throw clientsError;
    
    // Get transaction data
    const { data: transactionsData, error: transactionsError } = await supabase
      .from('transactions')
      .select('*')
      .eq('status', 'completed');
    
    if (transactionsError) throw transactionsError;
    
    // Aggregate transaction data per client
    const clientTransactions: Record<string, { total: number, lastPurchase: string }> = {};
    
    (transactionsData || []).forEach(transaction => {
      const clientId = transaction.client_id;
      if (!clientId) return;
      
      if (!clientTransactions[clientId]) {
        clientTransactions[clientId] = { total: 0, lastPurchase: '' };
      }
      
      clientTransactions[clientId].total += parseFloat(transaction.amount) || 0;
      
      // Track last purchase date
      const transactionDate = new Date(transaction.date);
      const lastPurchaseDate = clientTransactions[clientId].lastPurchase 
        ? new Date(clientTransactions[clientId].lastPurchase)
        : new Date(0);
      
      if (transactionDate > lastPurchaseDate) {
        clientTransactions[clientId].lastPurchase = transaction.date;
      }
    });
    
    // Map client data with transaction data
    return (clientsData || []).map(client => ({
      id: client.id,
      name: client.name,
      email: client.email,
      status: client.status,
      subscriptionStatus: client.subscription_status,
      totalSpent: clientTransactions[client.id]?.total || 0,
      joinDate: client.created_at,
      lastPurchase: clientTransactions[client.id]?.lastPurchase || client.created_at
    }));
  } catch (error) {
    console.error('Error fetching client financial data:', error);
    return [];
  }
};

// Function to fetch client payment methods
export const fetchClientPaymentMethods = async (clientId: string): Promise<PaymentMethodData[]> => {
  try {
    const { data, error } = await supabase
      .from('payment_methods')
      .select('*')
      .eq('client_id', clientId)
      .order('is_default', { ascending: false });
    
    if (error) throw error;
    
    return (data || []).map(method => ({
      id: method.id,
      clientId: method.client_id,
      cardType: method.card_type,
      lastFour: method.last_four,
      expiryMonth: method.expiry_month,
      expiryYear: method.expiry_year,
      isDefault: method.is_default
    }));
  } catch (error) {
    console.error('Error fetching client payment methods:', error);
    return [];
  }
};

// Function to fetch a specific client's financial data
export const fetchClientDetails = async (clientId: string): Promise<ClientData | null> => {
  try {
    // Get client data
    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select('*')
      .eq('id', clientId)
      .single();
    
    if (clientError) throw clientError;
    
    // Get transaction data
    const { data: transactionsData, error: transactionsError } = await supabase
      .from('transactions')
      .select('*')
      .eq('client_id', clientId)
      .eq('status', 'completed');
    
    if (transactionsError) throw transactionsError;
    
    // Calculate total spent and find last purchase
    let totalSpent = 0;
    let lastPurchase = client.created_at;
    
    (transactionsData || []).forEach(transaction => {
      totalSpent += parseFloat(transaction.amount) || 0;
      
      // Track last purchase date
      const transactionDate = new Date(transaction.date);
      const lastPurchaseDate = lastPurchase ? new Date(lastPurchase) : new Date(0);
      
      if (transactionDate > lastPurchaseDate) {
        lastPurchase = transaction.date;
      }
    });
    
    return {
      id: client.id,
      name: client.name,
      email: client.email,
      status: client.status,
      subscriptionStatus: client.subscription_status,
      totalSpent: totalSpent,
      joinDate: client.created_at,
      lastPurchase: lastPurchase
    };
  } catch (error) {
    console.error(`Error fetching client details for ${clientId}:`, error);
    return null;
  }
};

// Function to add a payment method
export const addPaymentMethod = async (
  clientId: string,
  cardType: string,
  lastFour: string,
  expiryMonth: string,
  expiryYear: string,
  isDefault: boolean = false
): Promise<PaymentMethodData | null> => {
  try {
    // If isDefault is true, set all existing payment methods to non-default
    if (isDefault) {
      await supabase
        .from('payment_methods')
        .update({ is_default: false })
        .eq('client_id', clientId);
    }
    
    // Add new payment method
    const { data, error } = await supabase
      .from('payment_methods')
      .insert({
        client_id: clientId,
        card_type: cardType,
        last_four: lastFour,
        expiry_month: expiryMonth,
        expiry_year: expiryYear,
        is_default: isDefault
      })
      .select()
      .single();
    
    if (error) throw error;
    
    return {
      id: data.id,
      clientId: data.client_id,
      cardType: data.card_type,
      lastFour: data.last_four,
      expiryMonth: data.expiry_month,
      expiryYear: data.expiry_year,
      isDefault: data.is_default
    };
  } catch (error) {
    console.error('Error adding payment method:', error);
    return null;
  }
};

// Function to update default payment method
export const updateDefaultPaymentMethod = async (clientId: string, paymentMethodId: string): Promise<boolean> => {
  try {
    // Set all payment methods to non-default
    await supabase
      .from('payment_methods')
      .update({ is_default: false })
      .eq('client_id', clientId);
    
    // Set selected payment method to default
    const { error } = await supabase
      .from('payment_methods')
      .update({ is_default: true })
      .eq('id', paymentMethodId)
      .eq('client_id', clientId);
    
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error('Error updating default payment method:', error);
    return false;
  }
};

// Function to delete a payment method
export const deletePaymentMethod = async (clientId: string, paymentMethodId: string): Promise<boolean> => {
  try {
    // Check if this is the default payment method
    const { data: paymentMethod, error: fetchError } = await supabase
      .from('payment_methods')
      .select('is_default')
      .eq('id', paymentMethodId)
      .eq('client_id', clientId)
      .single();
    
    if (fetchError) throw fetchError;
    
    // Delete the payment method
    const { error: deleteError } = await supabase
      .from('payment_methods')
      .delete()
      .eq('id', paymentMethodId)
      .eq('client_id', clientId);
    
    if (deleteError) throw deleteError;
    
    // If it was the default payment method, set a new default
    if (paymentMethod.is_default) {
      const { data: otherMethods, error: otherMethodsError } = await supabase
        .from('payment_methods')
        .select('id')
        .eq('client_id', clientId)
        .limit(1);
      
      if (otherMethodsError) throw otherMethodsError;
      
      if (otherMethods && otherMethods.length > 0) {
        await supabase
          .from('payment_methods')
          .update({ is_default: true })
          .eq('id', otherMethods[0].id);
      }
    }
    
    return true;
  } catch (error) {
    console.error('Error deleting payment method:', error);
    return false;
  }
};

// Function to update client's subscription status
export const updateClientSubscription = async (
  clientId: string, 
  status: string, 
  expiryDate?: string
): Promise<boolean> => {
  try {
    const updates: any = { subscription_status: status };
    
    if (expiryDate) {
      updates.subscription_expiry = expiryDate;
    }
    
    const { error } = await supabase
      .from('clients')
      .update(updates)
      .eq('id', clientId);
    
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error('Error updating client subscription:', error);
    return false;
  }
};

// Function to get client by ID with type-safe client access
export const getClientById = async (clientId: string): Promise<ClientData | null> => {
  try {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('id', clientId)
      .single();
    
    if (error) throw error;
    if (!data) return null;
    
    return {
      id: data.id,
      name: data.name,
      email: data.email,
      status: data.status,
      subscriptionStatus: data.subscription_status,
      totalSpent: 0, // This would require another query to calculate
      joinDate: data.created_at,
      lastPurchase: data.created_at // This would require another query to calculate
    };
  } catch (error) {
    console.error(`Error fetching client with ID ${clientId}:`, error);
    return null;
  }
};
