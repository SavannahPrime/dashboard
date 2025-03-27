
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2, RefreshCcw } from 'lucide-react';

interface RefundRequestFormProps {
  onSuccess?: () => void;
}

const RefundRequestForm: React.FC<RefundRequestFormProps> = ({ onSuccess }) => {
  const { currentUser } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [refundRequest, setRefundRequest] = useState({
    service: '',
    amount: '',
    reason: 'service-issue',
    description: '',
  });
  
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(false);
  
  const fetchTransactions = async () => {
    if (!currentUser) return;
    
    setIsLoadingTransactions(true);
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('client_id', currentUser.id)
        .eq('status', 'completed')
        .order('date', { ascending: false })
        .limit(10);
      
      if (error) throw error;
      
      setTransactions(data || []);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      toast.error('Failed to load transactions');
    } finally {
      setIsLoadingTransactions(false);
    }
  };
  
  React.useEffect(() => {
    if (currentUser) {
      fetchTransactions();
    }
  }, [currentUser]);
  
  const handleSubmit = async () => {
    if (!currentUser) return;
    
    if (!refundRequest.service || !refundRequest.amount || !refundRequest.description) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    setIsSubmitting(true);
    try {
      // Create a refund request (using tickets system with refund category)
      const { data, error } = await supabase
        .from('tickets')
        .insert({
          subject: `Refund Request - ${refundRequest.service}`,
          category: 'refund',
          priority: 'high',
          client_id: currentUser.id,
          status: 'open',
          refund_amount: parseFloat(refundRequest.amount),
          refund_service: refundRequest.service
        })
        .select()
        .single();
      
      if (error) throw error;
      
      // Add the initial message explaining the refund
      const { error: messageError } = await supabase
        .from('ticket_messages')
        .insert({
          ticket_id: data.id,
          content: `Refund request reason: ${refundRequest.reason}\n\n${refundRequest.description}`,
          sender: 'client'
        });
      
      if (messageError) throw messageError;
      
      toast.success('Refund request submitted successfully');
      
      // Reset form
      setRefundRequest({
        service: '',
        amount: '',
        reason: 'service-issue',
        description: '',
      });
      
      // Call the success callback if provided
      if (onSuccess) onSuccess();
      
    } catch (error) {
      console.error('Error submitting refund request:', error);
      toast.error('Failed to submit refund request');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Request a Refund</span>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={fetchTransactions}
            disabled={isLoadingTransactions}
          >
            <RefreshCcw className={`h-4 w-4 ${isLoadingTransactions ? 'animate-spin' : ''}`} />
          </Button>
        </CardTitle>
        <CardDescription>
          If you're not satisfied with a service, you can request a refund.
          Refund requests are reviewed by our team within 48 hours.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="service">Service</Label>
          <Select 
            value={refundRequest.service}
            onValueChange={(value) => setRefundRequest({ ...refundRequest, service: value })}
          >
            <SelectTrigger id="service">
              <SelectValue placeholder="Select service" />
            </SelectTrigger>
            <SelectContent>
              {currentUser?.selectedServices.map((service, index) => (
                <SelectItem key={index} value={service}>{service}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="amount">
            Refund Amount
            {transactions.length > 0 && (
              <span className="text-xs text-muted-foreground ml-2">
                (Recent payments: {transactions.slice(0, 3).map(t => formatCurrency(t.amount)).join(', ')})
              </span>
            )}
          </Label>
          <Input
            id="amount"
            type="number"
            step="0.01"
            min="0"
            placeholder="Enter amount"
            value={refundRequest.amount}
            onChange={(e) => setRefundRequest({ ...refundRequest, amount: e.target.value })}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="reason">Reason</Label>
          <Select 
            value={refundRequest.reason}
            onValueChange={(value) => setRefundRequest({ ...refundRequest, reason: value })}
          >
            <SelectTrigger id="reason">
              <SelectValue placeholder="Select reason" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="service-issue">Service Issue</SelectItem>
              <SelectItem value="not-as-described">Not As Described</SelectItem>
              <SelectItem value="double-charged">Double Charged</SelectItem>
              <SelectItem value="cancellation">Subscription Cancellation</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            placeholder="Please explain why you're requesting a refund..."
            rows={4}
            value={refundRequest.description}
            onChange={(e) => setRefundRequest({ ...refundRequest, description: e.target.value })}
          />
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={handleSubmit}
          disabled={isSubmitting || !refundRequest.service || !refundRequest.amount || !refundRequest.description}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Submitting...
            </>
          ) : (
            'Submit Refund Request'
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default RefundRequestForm;
