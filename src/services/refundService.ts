
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// This interface defines the expected properties for a refund request
export interface RefundRequest {
  id: string;
  client_id: string;
  transaction_id: string;
  reason: string;
  amount: number;
  status: 'pending' | 'approved' | 'denied';
  created_at: string;
  client?: {
    name?: string;
    email?: string;
  } | null;
}

// Function to fetch all refund requests
export const fetchRefundRequests = async (): Promise<RefundRequest[]> => {
  const { data, error } = await supabase
    .from('refund_requests')
    .select(`
      *,
      client:client_id (
        name, 
        email
      )
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching refund requests:', error);
    throw error;
  }

  // Process the data to handle potential null clients
  const processedData = data.map(item => ({
    ...item,
    client: item.client || { name: 'Unknown', email: 'Unknown' }
  }));

  return processedData;
};

// Function to approve a refund request
export const approveRefund = async (refundId: string): Promise<void> => {
  try {
    // First get the refund request details
    const { data: refundData, error: refundError } = await supabase
      .from('refund_requests')
      .select(`
        *,
        client:client_id (
          name
        )
      `)
      .eq('id', refundId)
      .single();

    if (refundError) throw refundError;

    // Update the refund status
    const { error: updateError } = await supabase
      .from('refund_requests')
      .update({ status: 'approved' })
      .eq('id', refundId);

    if (updateError) throw updateError;

    // Create a transaction record for this refund
    const { error: transactionError } = await supabase
      .from('transactions')
      .insert({
        client_id: refundData.client_id,
        amount: -refundData.amount, // Negative amount for refund
        description: `Refund for ${refundData.reason}`,
        transaction_type: 'refund',
        status: 'completed',
        reference_id: refundId
      });

    if (transactionError) throw transactionError;

    const clientName = refundData.client && refundData.client.name ? refundData.client.name : 'Unknown client';
    toast.success(`Refund approved for ${clientName}`);
  } catch (error) {
    console.error('Error approving refund:', error);
    toast.error('Failed to approve refund');
    throw error;
  }
};

// Function to deny a refund request
export const denyRefund = async (refundId: string): Promise<void> => {
  try {
    // First get the refund request details
    const { data: refundData, error: refundError } = await supabase
      .from('refund_requests')
      .select(`
        *,
        client:client_id (
          name
        )
      `)
      .eq('id', refundId)
      .single();

    if (refundError) throw refundError;

    // Update the refund status
    const { error: updateError } = await supabase
      .from('refund_requests')
      .update({ status: 'denied' })
      .eq('id', refundId);

    if (updateError) throw updateError;

    const clientName = refundData.client && refundData.client.name ? refundData.client.name : 'Unknown client';
    toast.success(`Refund denied for ${clientName}`);
  } catch (error) {
    console.error('Error denying refund:', error);
    toast.error('Failed to deny refund');
    throw error;
  }
};

// Function to create a new refund request
export const createRefundRequest = async (
  clientId: string,
  transactionId: string,
  reason: string,
  amount: number
): Promise<void> => {
  try {
    const { error } = await supabase
      .from('refund_requests')
      .insert({
        client_id: clientId,
        transaction_id: transactionId,
        reason,
        amount,
        status: 'pending'
      });

    if (error) throw error;

    toast.success('Refund request submitted successfully');
  } catch (error) {
    console.error('Error creating refund request:', error);
    toast.error('Failed to submit refund request');
    throw error;
  }
};
