
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { getServiceByTitle } from '@/lib/services-data';
import { Download, CreditCard, Clock, Calendar, Check } from 'lucide-react';

// Sample payment history
const paymentHistory = [
  {
    id: '12345',
    date: '2023-06-15',
    amount: 399,
    status: 'completed',
    method: 'Credit Card',
    description: 'Monthly subscription payment'
  },
  {
    id: '12344',
    date: '2023-05-15',
    amount: 399,
    status: 'completed',
    method: 'Credit Card',
    description: 'Monthly subscription payment'
  },
  {
    id: '12343',
    date: '2023-04-15',
    amount: 399,
    status: 'completed',
    method: 'Credit Card',
    description: 'Monthly subscription payment'
  }
];

// Sample invoices
const invoices = [
  {
    id: 'INV-001',
    date: '2023-06-15',
    amount: 399,
    status: 'paid'
  },
  {
    id: 'INV-002',
    date: '2023-05-15',
    amount: 399,
    status: 'paid'
  },
  {
    id: 'INV-003',
    date: '2023-04-15',
    amount: 399,
    status: 'paid'
  }
];

const Billing: React.FC = () => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('subscription');
  
  if (!currentUser) return null;
  
  // Get active services
  const activeServices = currentUser.selectedServices
    .map(title => getServiceByTitle(title))
    .filter(Boolean);
  
  // Calculate monthly cost
  const monthlyCost = activeServices.reduce((sum, service) => sum + service!.price, 0);
  
  // Next billing date
  const nextBillingDate = new Date(currentUser.subscriptionExpiry);
  
  return (
    <div className="animate-fade-in">
      <DashboardHeader pageTitle="Payments & Billing" />
      
      <div className="p-6">
        <Tabs defaultValue="subscription" onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="subscription">Subscription</TabsTrigger>
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
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1">
                          <div className="text-sm text-muted-foreground">Subscription Status</div>
                          <div className="flex items-center">
                            <Badge className="bg-green-500">Active</Badge>
                          </div>
                        </div>
                        
                        <div className="space-y-1">
                          <div className="text-sm text-muted-foreground">Monthly Cost</div>
                          <div className="text-xl font-bold">${monthlyCost}</div>
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
                            Visa ending in 1234
                          </div>
                        </div>
                      </div>
                      
                      <div className="pt-4 flex flex-wrap gap-3">
                        <Button>Update Payment Method</Button>
                        <Button variant="outline">Cancel Subscription</Button>
                      </div>
                    </div>
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
                    <ul className="space-y-4">
                      {activeServices.map(service => (
                        <li key={service!.id} className="flex justify-between items-start border-b pb-3 last:border-0">
                          <div>
                            <div className="font-medium">{service!.title}</div>
                            <div className="text-sm text-muted-foreground">${service!.price}/{service!.priceUnit}</div>
                          </div>
                          <Check className="h-5 w-5 text-green-500" />
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </div>
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
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Payment Method</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paymentHistory.map(payment => (
                      <TableRow key={payment.id}>
                        <TableCell>{new Date(payment.date).toLocaleDateString()}</TableCell>
                        <TableCell>{payment.description}</TableCell>
                        <TableCell>${payment.amount}</TableCell>
                        <TableCell>
                          <Badge className="bg-green-500">
                            {payment.status === 'completed' ? 'Completed' : payment.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{payment.method}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="invoices">
            <Card>
              <CardHeader>
                <CardTitle>Invoices</CardTitle>
                <CardDescription>
                  Download your invoices for record keeping
                </CardDescription>
              </CardHeader>
              <CardContent>
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
                        <TableCell>{invoice.id}</TableCell>
                        <TableCell>{new Date(invoice.date).toLocaleDateString()}</TableCell>
                        <TableCell>${invoice.amount}</TableCell>
                        <TableCell>
                          <Badge className={invoice.status === 'paid' ? 'bg-green-500' : ''}>
                            {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm">
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Billing;
