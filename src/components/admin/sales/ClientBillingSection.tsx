import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Search, Download, FileText, DollarSign } from 'lucide-react';
import { toast } from 'sonner';

interface Transaction {
  id: string;
  client_id: string;
  amount: number;
  date: string;
  status: string;
  type: string;
  invoice_number?: string;
  description?: string;
  client?: {
    name: string;
    email: string;
  };
}

interface Client {
  id: string;
  name: string;
  email: string;
  status: string;
  subscription_status: string;
}

const ClientBillingSection: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  const [isInvoiceDialogOpen, setIsInvoiceDialogOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [newInvoice, setNewInvoice] = useState({
    amount: '',
    description: '',
    type: 'invoice',
    invoice_number: '',
  });

  const fetchTransactions = async () => {
    setIsLoading(true);
    try {
      const { data: clientsData, error: clientsError } = await supabase
        .from('clients')
        .select('id, name, email, status, subscription_status');
      
      if (clientsError) throw clientsError;
      
      setClients(clientsData || []);
      
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .order('date', { ascending: false });
      
      if (error) throw error;
      
      const enhancedTransactions = data?.map(transaction => {
        const client = clientsData?.find(c => c.id === transaction.client_id);
        return {
          ...transaction,
          client: client ? {
            name: client.name,
            email: client.email
          } : undefined
        };
      });
      
      setTransactions(enhancedTransactions || []);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      toast.error('Failed to load transactions');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
    
    const channel = supabase
      .channel('public:transactions')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'transactions' 
      }, () => {
        fetchTransactions();
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleCreateInvoice = async () => {
    if (!selectedClient || !newInvoice.amount || !newInvoice.description) {
      toast.error('Client, amount, and description are required');
      return;
    }
    
    setIsLoading(true);
    try {
      const invoiceNumber = newInvoice.invoice_number || 
        `INV-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
      
      const { data, error } = await supabase
        .from('transactions')
        .insert({
          client_id: selectedClient.id,
          amount: parseFloat(newInvoice.amount),
          description: newInvoice.description,
          type: newInvoice.type,
          invoice_number: invoiceNumber,
          status: 'pending',
          date: new Date().toISOString()
        })
        .select()
        .single();
      
      if (error) throw error;
      
      toast.success('Invoice created successfully');
      setIsInvoiceDialogOpen(false);
      
      setNewInvoice({
        amount: '',
        description: '',
        type: 'invoice',
        invoice_number: '',
      });
      
      fetchTransactions();
    } catch (error) {
      console.error('Error creating invoice:', error);
      toast.error('Failed to create invoice');
    } finally {
      setIsLoading(false);
    }
  };

  const openInvoiceDialog = (client: Client) => {
    setSelectedClient(client);
    setIsInvoiceDialogOpen(true);
  };

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = 
      transaction.client?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transaction.client?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transaction.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transaction.invoice_number?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = 
      statusFilter === 'all' || 
      transaction.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'completed':
        return 'default';
      case 'pending':
        return 'secondary';
      case 'failed':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Client Billing</h2>
          <p className="text-muted-foreground">
            Manage client payments and invoices
          </p>
        </div>
        
        <div className="flex gap-2">
          <Select
            value={statusFilter}
            onValueChange={setStatusFilter}
          >
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
            </SelectContent>
          </Select>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search transactions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 w-[200px]"
            />
          </div>
        </div>
      </div>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle>Transactions</CardTitle>
            <CardDescription>
              Recent payments and invoices
            </CardDescription>
          </div>
          <Button onClick={() => setIsInvoiceDialogOpen(true)}>
            <FileText className="mr-2 h-4 w-4" />
            Create Invoice
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredTransactions.length > 0 ? (
            <div className="rounded-md border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-muted/50 border-b">
                      <th className="text-left font-medium text-muted-foreground p-3">Client</th>
                      <th className="text-left font-medium text-muted-foreground p-3">Invoice #</th>
                      <th className="text-left font-medium text-muted-foreground p-3">Amount</th>
                      <th className="text-left font-medium text-muted-foreground p-3">Date</th>
                      <th className="text-left font-medium text-muted-foreground p-3">Status</th>
                      <th className="text-right font-medium text-muted-foreground p-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTransactions.map(transaction => (
                      <tr key={transaction.id} className="border-b hover:bg-muted/50">
                        <td className="p-3">
                          {transaction.client ? (
                            <div>
                              <div className="font-medium">{transaction.client.name}</div>
                              <div className="text-muted-foreground text-sm">{transaction.client.email}</div>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">Unknown client</span>
                          )}
                        </td>
                        <td className="p-3">
                          {transaction.invoice_number || '-'}
                        </td>
                        <td className="p-3 font-medium">
                          {formatCurrency(transaction.amount)}
                        </td>
                        <td className="p-3">
                          {formatDate(transaction.date)}
                        </td>
                        <td className="p-3">
                          <Badge variant={getStatusBadgeVariant(transaction.status)}>
                            {transaction.status}
                          </Badge>
                        </td>
                        <td className="p-3 text-right">
                          <Button variant="ghost" size="sm" onClick={() => {
                            toast.success('Invoice downloaded');
                          }}>
                            <Download className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="text-center py-10 border rounded-md">
              <DollarSign className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <h3 className="text-lg font-medium">No transactions found</h3>
              <p className="text-muted-foreground">
                {searchQuery || statusFilter !== 'all' ? 
                  'Try adjusting your search or filters' : 
                  'Get started by creating your first invoice'}
              </p>
              <Button 
                variant="outline" 
                onClick={() => setIsInvoiceDialogOpen(true)}
                className="mt-4"
              >
                <FileText className="mr-2 h-4 w-4" />
                Create Invoice
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Active Clients</CardTitle>
          <CardDescription>
            Send invoices to your active clients
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
            {clients
              .filter(client => client.status === 'active')
              .slice(0, 6)
              .map(client => (
                <Card key={client.id} className="overflow-hidden">
                  <CardHeader className="p-4">
                    <CardTitle className="text-base">{client.name}</CardTitle>
                    <CardDescription className="text-xs truncate">
                      {client.email}
                    </CardDescription>
                  </CardHeader>
                  <CardFooter className="p-4 pt-0 flex justify-between">
                    <Badge variant={
                      client.subscription_status === 'active' ? 'default' :
                      client.subscription_status === 'pending' ? 'secondary' : 
                      'outline'
                    }>
                      {client.subscription_status}
                    </Badge>
                    <Button 
                      size="sm" 
                      variant="secondary"
                      onClick={() => openInvoiceDialog(client)}
                    >
                      Invoice
                    </Button>
                  </CardFooter>
                </Card>
              ))}
          </div>
        </CardContent>
      </Card>
      
      <Dialog open={isInvoiceDialogOpen} onOpenChange={setIsInvoiceDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create Invoice</DialogTitle>
            <DialogDescription>
              {selectedClient 
                ? `Create an invoice for ${selectedClient.name}` 
                : 'Select a client and create an invoice'
              }
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {!selectedClient && (
              <div className="grid gap-2">
                <Label htmlFor="client">Select Client</Label>
                <Select onValueChange={(value) => {
                  const client = clients.find(c => c.id === value);
                  if (client) setSelectedClient(client);
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a client" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients
                      .filter(client => client.status === 'active')
                      .map(client => (
                        <SelectItem key={client.id} value={client.id}>
                          {client.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            
            <div className="grid gap-2">
              <Label htmlFor="invoice-number">Invoice Number</Label>
              <Input
                id="invoice-number"
                placeholder="INV-0001"
                value={newInvoice.invoice_number}
                onChange={(e) => setNewInvoice({ ...newInvoice, invoice_number: e.target.value })}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="amount">Amount ($)</Label>
              <Input
                id="amount"
                type="number"
                placeholder="0.00"
                value={newInvoice.amount}
                onChange={(e) => setNewInvoice({ ...newInvoice, amount: e.target.value })}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Invoice description..."
                value={newInvoice.description}
                onChange={(e) => setNewInvoice({ ...newInvoice, description: e.target.value })}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="type">Type</Label>
              <Select 
                value={newInvoice.type} 
                onValueChange={(value) => setNewInvoice({ ...newInvoice, type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="invoice">Invoice</SelectItem>
                  <SelectItem value="subscription">Subscription</SelectItem>
                  <SelectItem value="one-time">One-time</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsInvoiceDialogOpen(false);
              setSelectedClient(null);
            }}>
              Cancel
            </Button>
            <Button onClick={handleCreateInvoice} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Invoice'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ClientBillingSection;
