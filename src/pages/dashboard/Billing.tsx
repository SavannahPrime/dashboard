import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Download, CreditCard, Clock, Calendar, Check, Loader2, AlertCircle, Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import PaymentForm from '@/components/dashboard/PaymentForm';
import { PaymentType } from '@/lib/types';

const Billing: React.FC = () => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('subscription');
  const [isLoading, setIsLoading] = useState(true);
  const [paymentHistory, setPaymentHistory] = useState<PaymentType[]>([]);
  const [savedPaymentMethods, setSavedPaymentMethods] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [activeServices, setActiveServices] = useState<any[]>([]);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [showAddPaymentMethodDialog, setShowAddPaymentMethodDialog] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    if (currentUser) {
      fetchData();
    }
  }, [currentUser]);
  
  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Fetch services
      const { data: servicesData, error: servicesError } = await supabase
        .from('services')
        .select('*');
      
      if (servicesError) throw servicesError;
      
      if (servicesData && currentUser) {
        // Format services
        const active = servicesData.filter(service => 
          currentUser.selectedServices && currentUser.selectedServices.includes(service.name)
        ).map(service => ({
          id: service.id,
          title: service.name,
          price: service.price,
          priceUnit: service.price_unit || 'month',
          description: service.description,
        }));
        
        setActiveServices(active);
      }
      
      // Fetch payment history
      const { data: transactionsData, error: transactionsError } = await supabase
        .from('transactions')
        .select('*')
        .eq('client_id', currentUser?.id)
        .order('date', { ascending: false });
      
      if (transactionsError) throw transactionsError;
      
      if (transactionsData) {
        setPaymentHistory(transactionsData);
      }
      
      try {
        // Fetch saved payment methods - handle the case if the table doesn't exist yet
        const { data: paymentMethodsData, error: paymentMethodsError } = await supabase
          .from('payment_methods')
          .select('*')
          .eq('client_id', currentUser?.id);
          
        if (paymentMethodsError) {
          // If the error is about the table not existing, don't throw an error, just log it
          if (paymentMethodsError.code === '42P01') {
            console.log('Payment methods table does not exist yet. This is expected on first run.');
            setSavedPaymentMethods([]);
          } else {
            throw paymentMethodsError;
          }
        } else {
          setSavedPaymentMethods(paymentMethodsData || []);
        }
      } catch (paymentMethodError) {
        console.error('Error fetching payment methods:', paymentMethodError);
        // Don't set global error for this specific case to avoid disrupting the whole page
        setSavedPaymentMethods([]);
      }
      
      // Fetch invoices
      const { data: invoicesData, error: invoicesError } = await supabase
        .from('invoices')
        .select('*')
        .eq('client_id', currentUser?.id)
        .order('date', { ascending: false });
      
      if (invoicesError) throw invoicesError;
      
      if (invoicesData) {
        setInvoices(invoicesData || []);
      }
    } catch (error: any) {
      console.error('Error fetching billing data:', error);
      setError(error.message || 'Failed to load billing data');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Calculate monthly cost
  const monthlyCost = activeServices.reduce((sum, service) => sum + (service.price || 0), 0);
  
  // Next billing date
  const nextBillingDate = currentUser?.subscriptionExpiry 
    ? new Date(currentUser.subscriptionExpiry) 
    : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  
  const handlePayInvoice = (invoice: any) => {
    setSelectedInvoice(invoice);
    setShowPaymentDialog(true);
  };
  
  const handlePaymentSuccess = () => {
    setShowPaymentDialog(false);
    setShowAddPaymentMethodDialog(false);
    setSelectedInvoice(null);
    fetchData(); // Refresh data
  };
  
  const handleAddPaymentMethod = () => {
    setShowAddPaymentMethodDialog(true);
  };
  
  // Default payment method display if none saved
  const defaultPaymentMethod = {
    type: 'card',
    details: 'No payment methods saved',
    isDefault: true,
  };
  
  if (!currentUser) return null;
  
  return (
    <div className="animate-fade-in">
      <DashboardHeader pageTitle="Payments & Billing" />
      
      <div className="p-6">
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <Tabs defaultValue="subscription" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="subscription">Subscription</TabsTrigger>
            <TabsTrigger value="payment-methods">Payment Methods</TabsTrigger>
            <TabsTrigger value="payment-history">Payment History</TabsTrigger>
            <TabsTrigger value="invoices">Invoices</TabsTrigger>
          </TabsList>
          
          <TabsContent value="subscription">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column: Subscription Details */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Subscription Details</CardTitle>
                    <CardDescription>
                      Your current subscription and billing information
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <div className="flex justify-center py-6">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      </div>
                    ) : (
                      <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-1">
                            <div className="text-sm text-muted-foreground">Subscription Status</div>
                            <div className="flex items-center">
                              <Badge className="bg-green-500 text-white">
                                {currentUser.subscriptionStatus.charAt(0).toUpperCase() + 
                                 currentUser.subscriptionStatus.slice(1)}
                              </Badge>
                            </div>
                          </div>
                          
                          <div className="space-y-1">
                            <div className="text-sm text-muted-foreground">Monthly Cost</div>
                            <div className="text-xl font-bold">${monthlyCost.toFixed(2)}</div>
                          </div>
                          
                          <div className="space-y-1">
                            <div className="text-sm text-muted-foreground">Billing Cycle</div>
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 mr-2 text-primary" />
                              Monthly
                            </div>
                          </div>
                          
                          <div className="space-y-1">
                            <div className="text-sm text-muted-foreground">Next Billing Date</div>
                            <div className="flex items-center">
                              <Clock className="h-4 w-4 mr-2 text-primary" />
                              {nextBillingDate.toLocaleDateString()}
                            </div>
                          </div>
                          
                          <div className="space-y-1">
                            <div className="text-sm text-muted-foreground">Payment Method</div>
                            <div className="flex items-center">
                              <CreditCard className="h-4 w-4 mr-2 text-primary" />
                              {savedPaymentMethods.length > 0 ? (
                                <span>
                                  {savedPaymentMethods[0].card_type} ending in {savedPaymentMethods[0].last_four}
                                </span>
                              ) : (
                                <span>No payment method on file</span>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="pt-4 flex flex-wrap gap-3">
                          <Button onClick={handleAddPaymentMethod}>
                            {savedPaymentMethods.length > 0 ? 'Update Payment Method' : 'Add Payment Method'}
                          </Button>
                          <Button variant="outline">Cancel Subscription</Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
              
              {/* Right Column: Active Services */}
              <div>
                <Card>
                  <CardHeader>
                    <CardTitle>Active Services</CardTitle>
                    <CardDescription>
                      Services included in your subscription
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <div className="flex justify-center py-6">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      </div>
                    ) : activeServices.length > 0 ? (
                      <ul className="space-y-4">
                        {activeServices.map(service => (
                          <li key={service.id} className="flex justify-between items-start border-b pb-3 last:border-0">
                            <div>
                              <div className="font-medium">{service.title}</div>
                              <div className="text-sm text-muted-foreground">${service.price}/{service.priceUnit}</div>
                            </div>
                            <Check className="h-5 w-5 text-green-500" />
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-muted-foreground">No active services found.</p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="payment-methods">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="space-y-1">
                  <CardTitle>Payment Methods</CardTitle>
                  <CardDescription>
                    Manage your saved payment methods
                  </CardDescription>
                </div>
                <Button size="sm" className="ml-auto" onClick={handleAddPaymentMethod}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add New
                </Button>
              </CardHeader>
              <CardContent className="pt-6">
                {isLoading ? (
                  <div className="flex justify-center py-6">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : (
                  <div className="space-y-4">
                    {savedPaymentMethods.length > 0 ? (
                      savedPaymentMethods.map((method) => (
                        <div key={method.id} className="flex items-center justify-between border-b pb-4">
                          <div className="flex items-center space-x-3">
                            <CreditCard className="h-8 w-8 text-primary" />
                            <div>
                              <div className="font-medium">
                                {method.card_type} •••• {method.last_four}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                Expires {method.expiry_month}/{method.expiry_year}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            {method.is_default && (
                              <Badge className="bg-green-500 text-white">Default</Badge>
                            )}
                            <Button variant="ghost" size="sm">Edit</Button>
                            <Button variant="ghost" size="sm">Remove</Button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <CreditCard className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                        <h3 className="text-lg font-medium mb-2">No payment methods saved</h3>
                        <p className="text-muted-foreground mb-6">
                          Add a payment method to easily manage your subscription and invoices
                        </p>
                        <Button onClick={handleAddPaymentMethod}>
                          <Plus className="mr-2 h-4 w-4" />
                          Add Payment Method
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="payment-history">
            <Card>
              <CardHeader>
                <CardTitle>Payment History</CardTitle>
                <CardDescription>
                  View all your past payments
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex justify-center py-6">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : paymentHistory.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Method</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Reference</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paymentHistory.map(payment => (
                        <TableRow key={payment.id}>
                          <TableCell>{new Date(payment.date).toLocaleDateString()}</TableCell>
                          <TableCell>{payment.description}</TableCell>
                          <TableCell>${payment.amount}</TableCell>
                          <TableCell className="capitalize">{payment.method || 'Card'}</TableCell>
                          <TableCell>
                            <Badge className={payment.status === 'completed' ? 'bg-green-500 text-white' : ''}>
                              {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                            </Badge>
                          </TableCell>
                          <TableCell>{payment.id.substring(0, 8) || '-'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-6">
                    <p className="text-muted-foreground">No payment history found.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="invoices">
            <Card>
              <CardHeader>
                <CardTitle>Invoices</CardTitle>
                <CardDescription>
                  Manage and pay your invoices
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex justify-center py-6">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : invoices.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Invoice ID</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {invoices.map(invoice => (
                        <TableRow key={invoice.id}>
                          <TableCell>{invoice.id.substring(0, 8)}</TableCell>
                          <TableCell>{new Date(invoice.date).toLocaleDateString()}</TableCell>
                          <TableCell>${invoice.amount}</TableCell>
                          <TableCell>
                            <Badge className={invoice.status === 'paid' ? 'bg-green-500 text-white' : ''}>
                              {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button variant="ghost" size="sm">
                                <Download className="h-4 w-4 mr-2" />
                                Download
                              </Button>
                              
                              {invoice.status !== 'paid' && (
                                <Button 
                                  size="sm"
                                  onClick={() => handlePayInvoice(invoice)}
                                >
                                  Pay Now
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-6">
                    <p className="text-muted-foreground">No invoices found.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Payment Dialog for invoices */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {selectedInvoice 
                ? `Pay Invoice #${selectedInvoice.id.substring(0, 8)}`
                : 'Update Payment Method'
              }
            </DialogTitle>
            <DialogDescription>
              {selectedInvoice
                ? `Complete your payment of $${selectedInvoice.amount}`
                : 'Enter your payment details to update your payment method'
              }
            </DialogDescription>
          </DialogHeader>
          
          <PaymentForm
            invoiceId={selectedInvoice?.id}
            amount={selectedInvoice ? selectedInvoice.amount : monthlyCost}
            onSuccess={handlePaymentSuccess}
            onCancel={() => setShowPaymentDialog(false)}
          />
        </DialogContent>
      </Dialog>
      
      {/* Add Payment Method Dialog */}
      <Dialog open={showAddPaymentMethodDialog} onOpenChange={setShowAddPaymentMethodDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Payment Method</DialogTitle>
            <DialogDescription>
              Enter your payment details to save a new payment method
            </DialogDescription>
          </DialogHeader>
          
          <PaymentForm
            amount={0}
            onSuccess={handlePaymentSuccess}
            onCancel={() => setShowAddPaymentMethodDialog(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Billing;
