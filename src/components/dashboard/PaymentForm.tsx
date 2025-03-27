
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { CreditCard, Phone, DollarSign, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { PaymentType } from '@/lib/types';

interface PaymentFormProps {
  invoiceId?: string;
  amount: number;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const PaymentForm: React.FC<PaymentFormProps> = ({ 
  invoiceId, 
  amount, 
  onSuccess, 
  onCancel 
}) => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('card');
  const [isProcessing, setIsProcessing] = useState(false);
  
  const [cardForm, setCardForm] = useState({
    cardNumber: '',
    expiryDate: '',
    cvc: '',
    name: currentUser?.name || '',
  });
  
  const [mobileForm, setMobileForm] = useState({
    phoneNumber: '',
  });
  
  const handleCardChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCardForm(prev => ({ ...prev, [name]: value }));
  };
  
  const handleMobileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setMobileForm(prev => ({ ...prev, [name]: value }));
  };
  
  const processCardPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!cardForm.cardNumber || !cardForm.expiryDate || !cardForm.cvc || !cardForm.name) {
      toast.error('Please fill in all card details');
      return;
    }
    
    setIsProcessing(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      await recordTransaction('card');
      
      toast.success('Payment processed successfully');
      onSuccess?.();
    } catch (error) {
      console.error('Payment error:', error);
      toast.error('Failed to process payment');
    } finally {
      setIsProcessing(false);
    }
  };
  
  const processPayPalPayment = async () => {
    setIsProcessing(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      await recordTransaction('paypal');
      
      toast.success('PayPal payment processed successfully');
      onSuccess?.();
    } catch (error) {
      console.error('PayPal error:', error);
      toast.error('Failed to process PayPal payment');
    } finally {
      setIsProcessing(false);
    }
  };
  
  const processMobilePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!mobileForm.phoneNumber) {
      toast.error('Please enter your phone number');
      return;
    }
    
    setIsProcessing(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      await recordTransaction('mobile');
      
      toast.success('Mobile payment initiated. Check your phone for confirmation.');
      onSuccess?.();
    } catch (error) {
      console.error('Mobile payment error:', error);
      toast.error('Failed to process mobile payment');
    } finally {
      setIsProcessing(false);
    }
  };
  
  const recordTransaction = async (paymentMethod: string): Promise<void> => {
    if (!currentUser) return;
    
    // Create transaction data
    const transactionData: Partial<PaymentType> = {
      amount: amount,
      status: 'completed',
      method: paymentMethod,
      description: invoiceId ? `Payment for invoice ${invoiceId}` : 'Service payment',
    };
    
    // Insert transaction into database
    const { error } = await supabase
      .from('transactions')
      .insert({
        client_id: currentUser.id,
        amount: amount,
        type: 'payment',
        status: 'completed',
        description: invoiceId ? `Payment for invoice ${invoiceId}` : 'Service payment',
        invoice_number: invoiceId,
        method: paymentMethod
      });
    
    if (error) {
      console.error('Error recording transaction:', error);
      throw error;
    }
    
    // If invoice exists, update its status
    if (invoiceId) {
      const { error: updateError } = await supabase
        .from('invoices')
        .update({ status: 'paid' })
        .eq('id', invoiceId);
      
      if (updateError) {
        console.error('Error updating invoice status:', updateError);
      }
    }
  };
  
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Payment</CardTitle>
        <CardDescription>
          Complete your payment of ${amount.toFixed(2)}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="card" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="card">
              <CreditCard className="h-4 w-4 mr-2" />
              Card
            </TabsTrigger>
            <TabsTrigger value="paypal">
              <DollarSign className="h-4 w-4 mr-2" />
              PayPal
            </TabsTrigger>
            <TabsTrigger value="mobile">
              <Phone className="h-4 w-4 mr-2" />
              M-Pesa
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="card">
            <form onSubmit={processCardPayment}>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Cardholder Name</Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="John Doe"
                    value={cardForm.name}
                    onChange={handleCardChange}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="cardNumber">Card Number</Label>
                  <Input
                    id="cardNumber"
                    name="cardNumber"
                    placeholder="4242 4242 4242 4242"
                    value={cardForm.cardNumber}
                    onChange={handleCardChange}
                    required
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="expiryDate">Expiry Date</Label>
                    <Input
                      id="expiryDate"
                      name="expiryDate"
                      placeholder="MM/YY"
                      value={cardForm.expiryDate}
                      onChange={handleCardChange}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="cvc">CVC</Label>
                    <Input
                      id="cvc"
                      name="cvc"
                      placeholder="123"
                      value={cardForm.cvc}
                      onChange={handleCardChange}
                      required
                    />
                  </div>
                </div>
                
                <div className="flex justify-between pt-4">
                  <Button type="button" variant="outline" onClick={onCancel}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isProcessing}>
                    {isProcessing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      'Pay Now'
                    )}
                  </Button>
                </div>
              </div>
            </form>
          </TabsContent>
          
          <TabsContent value="paypal">
            <div className="space-y-6">
              <div className="rounded-lg bg-blue-50 dark:bg-blue-900/20 p-6 text-center">
                <div className="flex justify-center mb-4">
                  <DollarSign className="h-12 w-12 text-blue-600 dark:text-blue-400" />
                </div>
                <p className="text-sm mb-4">
                  You will be redirected to PayPal to complete your payment.
                </p>
                
                <div className="flex justify-between">
                  <Button type="button" variant="outline" onClick={onCancel}>
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    variant="default"
                    onClick={processPayPalPayment}
                    disabled={isProcessing}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Redirecting...
                      </>
                    ) : (
                      'Pay with PayPal'
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="mobile">
            <form onSubmit={processMobilePayment}>
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">M-Pesa Phone Number</Label>
                  <Input
                    id="phoneNumber"
                    name="phoneNumber"
                    placeholder="254XXXXXXXXX"
                    value={mobileForm.phoneNumber}
                    onChange={handleMobileChange}
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Enter your M-Pesa registered phone number starting with country code
                  </p>
                </div>
                
                <div className="flex justify-between">
                  <Button type="button" variant="outline" onClick={onCancel}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isProcessing}>
                    {isProcessing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      'Pay with M-Pesa'
                    )}
                  </Button>
                </div>
              </div>
            </form>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default PaymentForm;
