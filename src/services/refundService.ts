
import { supabase } from '@/integrations/supabase/client';

export type RefundStatus = 'pending' | 'approved' | 'denied' | 'completed';

export type RefundRequest = {
  id: string;
  clientId: string;
  clientName: string;
  transactionId: string;
  amount: number;
  reason: string;
  status: RefundStatus;
  createdAt: string;
  updatedAt: string;
  notes?: string;
  approvedBy?: string;
};

export const fetchClientRefundRequests = async (clientId: string): Promise<RefundRequest[]> => {
  try {
    const { data, error } = await supabase
      .from('tickets')
      .select(`
        id,
        client_id,
        subject,
        refund_amount,
        refund_service,
        status,
        created_at,
        updated_at,
        clients(name)
      `)
      .eq('client_id', clientId)
      .not('refund_amount', 'is', null)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    return (data || []).map(request => {
      // Safely handle potentially undefined client data
      const clientData = request.clients || {};
      
      return {
        id: request.id,
        clientId: request.client_id,
        clientName: clientData && typeof clientData.name === 'string' ? clientData.name : 'Unknown',
        transactionId: '', // This would be linked in a real application
        amount: request.refund_amount || 0,
        reason: request.subject,
        status: mapTicketStatusToRefundStatus(request.status),
        createdAt: request.created_at,
        updatedAt: request.updated_at,
        notes: ''
      };
    });
  } catch (error) {
    console.error('Error fetching client refund requests:', error);
    return [];
  }
};

export const fetchAllRefundRequests = async (): Promise<RefundRequest[]> => {
  try {
    const { data, error } = await supabase
      .from('tickets')
      .select(`
        id,
        client_id,
        subject,
        refund_amount,
        refund_service,
        status,
        created_at,
        updated_at,
        assigned_to,
        clients(name)
      `)
      .not('refund_amount', 'is', null)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    return (data || []).map(request => {
      // Safely handle potentially undefined client data
      const clientData = request.clients || {};
      
      return {
        id: request.id,
        clientId: request.client_id,
        clientName: clientData && typeof clientData.name === 'string' ? clientData.name : 'Unknown',
        transactionId: '', // This would be linked in a real application
        amount: request.refund_amount || 0,
        reason: request.subject,
        status: mapTicketStatusToRefundStatus(request.status),
        createdAt: request.created_at,
        updatedAt: request.updated_at,
        notes: '',
        approvedBy: request.assigned_to
      };
    });
  } catch (error) {
    console.error('Error fetching all refund requests:', error);
    return [];
  }
};

export const createRefundRequest = async (
  clientId: string, 
  amount: number, 
  reason: string,
  serviceId?: string
): Promise<string | null> => {
  try {
    const { data, error } = await supabase
      .from('tickets')
      .insert({
        client_id: clientId,
        subject: reason,
        refund_amount: amount,
        refund_service: serviceId,
        status: 'open',
        priority: 'high',
        category: 'refund'
      })
      .select()
      .single();
    
    if (error) throw error;
    
    return data.id;
  } catch (error) {
    console.error('Error creating refund request:', error);
    return null;
  }
};

export const updateRefundStatus = async (
  refundId: string, 
  status: RefundStatus, 
  adminId: string, 
  notes?: string
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('tickets')
      .update({
        status: mapRefundStatusToTicketStatus(status),
        assigned_to: adminId,
        updated_at: new Date().toISOString()
      })
      .eq('id', refundId);
    
    if (error) throw error;
    
    // If approved or denied, add a message with the notes
    if (status === 'approved' || status === 'denied' || status === 'completed') {
      const { error: messageError } = await supabase
        .from('ticket_messages')
        .insert({
          ticket_id: refundId,
          sender: 'admin',
          content: notes || `Refund request ${status}`,
          timestamp: new Date().toISOString()
        });
      
      if (messageError) throw messageError;
      
      // If approved, create a refund transaction
      if (status === 'completed') {
        const { data: ticketData } = await supabase
          .from('tickets')
          .select('client_id, refund_amount, refund_service')
          .eq('id', refundId)
          .single();
        
        if (ticketData) {
          const { error: transactionError } = await supabase
            .from('transactions')
            .insert({
              client_id: ticketData.client_id,
              amount: ticketData.refund_amount,
              type: 'refund',
              status: 'completed',
              description: `Refund for service: ${ticketData.refund_service || 'Unknown'}`
            });
          
          if (transactionError) throw transactionError;
        }
      }
    }
    
    return true;
  } catch (error) {
    console.error('Error updating refund status:', error);
    return false;
  }
};

export const getRefundAnalytics = async (): Promise<{
  totalRefunds: number;
  totalAmount: number;
  byMonth: { name: string, amount: number }[];
  mostRefundedServices: { name: string, count: number }[];
}> => {
  try {
    const { data: refundTransactions, error } = await supabase
      .from('transactions')
      .select('amount, date, description')
      .eq('type', 'refund')
      .eq('status', 'completed');
    
    if (error) throw error;
    
    const totalAmount = refundTransactions.reduce((sum, transaction) => {
      return sum + (parseFloat(transaction.amount) || 0);
    }, 0);
    
    // Group by month
    const monthlyData: Record<string, number> = {};
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    refundTransactions.forEach(transaction => {
      const date = new Date(transaction.date);
      const monthName = months[date.getMonth()];
      
      if (!monthlyData[monthName]) {
        monthlyData[monthName] = 0;
      }
      
      monthlyData[monthName] += parseFloat(transaction.amount) || 0;
    });
    
    const byMonth = Object.keys(monthlyData).map(month => ({
      name: month,
      amount: monthlyData[month]
    })).sort((a, b) => months.indexOf(a.name) - months.indexOf(b.name));
    
    // Count most refunded services
    const serviceRefunds: Record<string, number> = {};
    
    refundTransactions.forEach(transaction => {
      const description = transaction.description || '';
      const serviceName = description.includes(':')
        ? description.split(':')[1].trim()
        : 'Unknown';
      
      if (!serviceRefunds[serviceName]) {
        serviceRefunds[serviceName] = 0;
      }
      
      serviceRefunds[serviceName]++;
    });
    
    const mostRefundedServices = Object.keys(serviceRefunds)
      .map(service => ({
        name: service,
        count: serviceRefunds[service]
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
    
    return {
      totalRefunds: refundTransactions.length,
      totalAmount,
      byMonth,
      mostRefundedServices
    };
  } catch (error) {
    console.error('Error fetching refund analytics:', error);
    return {
      totalRefunds: 0,
      totalAmount: 0,
      byMonth: [],
      mostRefundedServices: []
    };
  }
};

// Helper functions
const mapTicketStatusToRefundStatus = (ticketStatus: string): RefundStatus => {
  switch (ticketStatus) {
    case 'open':
      return 'pending';
    case 'in_progress':
      return 'approved';
    case 'resolved':
      return 'completed';
    case 'closed':
      return 'denied';
    default:
      return 'pending';
  }
};

const mapRefundStatusToTicketStatus = (refundStatus: RefundStatus): string => {
  switch (refundStatus) {
    case 'pending':
      return 'open';
    case 'approved':
      return 'in_progress';
    case 'completed':
      return 'resolved';
    case 'denied':
      return 'closed';
    default:
      return 'open';
  }
};
