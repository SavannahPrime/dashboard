
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import { Loader2, PaperPlaneIcon, HelpCircle, MessageSquare, AlertTriangle } from 'lucide-react';
import { SupportTicket } from '@/lib/types';
import { supabase } from '@/integrations/supabase/client';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

const Support: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('tickets');
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [ticketMessages, setTicketMessages] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [newTicket, setNewTicket] = useState({
    subject: '',
    message: '',
    category: 'general',
    priority: 'medium',
    refundAmount: '',
    refundService: ''
  });
  const [isRefundRequest, setIsRefundRequest] = useState(false);
  const [userServices, setUserServices] = useState<any[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load tickets for the current user
  const fetchTickets = async () => {
    setIsLoading(true);
    try {
      if (!user?.id) return;

      const { data, error } = await supabase
        .from('tickets')
        .select('*')
        .eq('client_id', user.id)
        .order('updated_at', { ascending: false });

      if (error) throw error;

      const formattedTickets = data.map(ticket => ({
        id: ticket.id,
        subject: ticket.subject,
        message: '', // This will be populated by the first message
        status: ticket.status,
        priority: ticket.priority,
        createdAt: ticket.created_at,
        lastUpdated: ticket.updated_at
      }));

      setTickets(formattedTickets);

      // If we have a ticket in the state, select it automatically
      if (location.state?.serviceTitle) {
        setNewTicket(prev => ({
          ...prev,
          subject: `Help with ${location.state.serviceTitle}`,
          category: location.state.requestType || 'general'
        }));
        setActiveTab('new-ticket');
      }

      // If this is a refund request from state, set that up
      if (location.state?.refundRequest) {
        setIsRefundRequest(true);
        setNewTicket(prev => ({
          ...prev,
          subject: `Refund Request for ${location.state.serviceTitle}`,
          category: 'refund',
          refundService: location.state.serviceId || ''
        }));
        setActiveTab('new-ticket');
      }

    } catch (error) {
      console.error('Error fetching tickets:', error);
      toast.error('Failed to load support tickets');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch user's services for refund requests
  const fetchUserServices = async () => {
    try {
      if (!user?.id) return;

      // First get the user's selected services
      const { data: clientData, error: clientError } = await supabase
        .from('clients')
        .select('selected_services')
        .eq('id', user.id)
        .single();

      if (clientError) throw clientError;

      const selectedServiceIds = clientData?.selected_services || [];

      if (selectedServiceIds.length === 0) return;

      // Then fetch the actual service details
      const { data: servicesData, error: servicesError } = await supabase
        .from('services')
        .select('id, name, price')
        .in('id', selectedServiceIds);

      if (servicesError) throw servicesError;

      setUserServices(servicesData || []);
    } catch (error) {
      console.error('Error fetching user services:', error);
    }
  };

  useEffect(() => {
    fetchTickets();
    fetchUserServices();
  }, [user?.id]);

  // Scroll to bottom of messages when they change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [ticketMessages]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'open':
        return 'secondary';
      case 'in-progress':
        return 'default';
      case 'resolved':
        return 'success';
      case 'closed':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const getPriorityBadgeVariant = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'destructive';
      case 'medium':
        return 'warning';
      case 'low':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const handleSelectTicket = async (ticket: SupportTicket) => {
    setSelectedTicket(ticket);
    setIsLoadingMessages(true);
    try {
      const { data, error } = await supabase
        .from('ticket_messages')
        .select('*')
        .eq('ticket_id', ticket.id)
        .order('timestamp', { ascending: true });

      if (error) throw error;

      setTicketMessages(data || []);
    } catch (error) {
      console.error('Error fetching ticket messages:', error);
      toast.error('Failed to load ticket messages');
    } finally {
      setIsLoadingMessages(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedTicket) return;

    setIsSubmitting(true);
    try {
      // Add the message to the ticket_messages table
      const { data, error } = await supabase
        .from('ticket_messages')
        .insert({
          ticket_id: selectedTicket.id,
          content: newMessage,
          sender: 'client'
        })
        .select()
        .single();

      if (error) throw error;

      // Update the ticket's updated_at timestamp
      const { error: updateError } = await supabase
        .from('tickets')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', selectedTicket.id);

      if (updateError) throw updateError;

      // If the ticket is closed, reopen it
      if (selectedTicket.status === 'closed' || selectedTicket.status === 'resolved') {
        const { error: statusError } = await supabase
          .from('tickets')
          .update({ status: 'open' })
          .eq('id', selectedTicket.id);

        if (statusError) throw statusError;

        setSelectedTicket({
          ...selectedTicket,
          status: 'open'
        });
      }

      // Add the message to the local state
      setTicketMessages([...ticketMessages, data]);
      setNewMessage('');
      toast.success('Message sent successfully');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitNewTicket = async () => {
    if (!newTicket.subject || !newTicket.message) {
      toast.error('Subject and message are required');
      return;
    }

    if (!user?.id) {
      toast.error('You must be logged in to submit a ticket');
      return;
    }

    setIsSubmitting(true);
    try {
      // Create the ticket first
      const ticketData: any = {
        subject: newTicket.subject,
        status: 'open',
        priority: newTicket.priority,
        client_id: user.id,
        category: newTicket.category
      };

      // Add refund fields if this is a refund request
      if (isRefundRequest && newTicket.refundService && newTicket.refundAmount) {
        ticketData.refund_service = newTicket.refundService;
        ticketData.refund_amount = parseFloat(newTicket.refundAmount);
      }

      const { data: ticketData, error: ticketError } = await supabase
        .from('tickets')
        .insert(ticketData)
        .select()
        .single();

      if (ticketError) throw ticketError;

      // Then create the first message
      const { error: messageError } = await supabase
        .from('ticket_messages')
        .insert({
          ticket_id: ticketData.id,
          content: newTicket.message,
          sender: 'client'
        });

      if (messageError) throw messageError;

      toast.success('Support ticket submitted successfully');

      // Reset form and refresh tickets
      setNewTicket({
        subject: '',
        message: '',
        category: 'general',
        priority: 'medium',
        refundAmount: '',
        refundService: ''
      });
      setIsRefundRequest(false);
      fetchTickets();
      setActiveTab('tickets');
    } catch (error) {
      console.error('Error submitting ticket:', error);
      toast.error('Failed to submit support ticket');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileUpload = () => {
    // This is a placeholder for file upload functionality
    // You would typically trigger a file input here
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.onchange = (e) => {
      const target = e.target as HTMLInputElement;
      if (target.files && target.files.length > 0) {
        toast.info(`File selected: ${target.files[0].name}`);
        // Here you would upload to storage, but for now just show a toast
        toast.success('File attached (simulated)');
      }
    };
    
    // Use a different approach than .click() to avoid the TypeScript error
    const clickEvent = new MouseEvent('click', {
      view: window,
      bubbles: true,
      cancelable: true,
    });
    fileInput.dispatchEvent(clickEvent);
  };

  const handleCloseTicket = async () => {
    if (!selectedTicket) return;

    try {
      const { error } = await supabase
        .from('tickets')
        .update({ 
          status: 'closed',
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedTicket.id);

      if (error) throw error;

      setSelectedTicket({
        ...selectedTicket,
        status: 'closed'
      });

      toast.success('Ticket closed successfully');
      setDialogOpen(false);
    } catch (error) {
      console.error('Error closing ticket:', error);
      toast.error('Failed to close ticket');
    }
  };

  const handleConfirmSatisfaction = async () => {
    if (!selectedTicket) return;

    try {
      const { error } = await supabase
        .from('tickets')
        .update({ 
          status: 'resolved',
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedTicket.id);

      if (error) throw error;

      // Add a system message indicating resolution
      const { error: messageError } = await supabase
        .from('ticket_messages')
        .insert({
          ticket_id: selectedTicket.id,
          content: 'Client marked this ticket as resolved.',
          sender: 'system'
        });

      if (messageError) throw messageError;

      setSelectedTicket({
        ...selectedTicket,
        status: 'resolved'
      });

      // Fetch messages again to include the system message
      handleSelectTicket(selectedTicket);

      toast.success('Ticket resolved successfully');
    } catch (error) {
      console.error('Error resolving ticket:', error);
      toast.error('Failed to resolve ticket');
    }
  };

  const renderTicketList = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <p className="text-lg">Loading your support tickets...</p>
        </div>
      );
    }

    if (tickets.length === 0) {
      return (
        <div className="text-center py-12">
          <HelpCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-medium mb-2">No Support Tickets</h3>
          <p className="text-muted-foreground mb-6">
            You haven't created any support tickets yet.
          </p>
          <Button onClick={() => setActiveTab('new-ticket')}>
            Create a New Ticket
          </Button>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {tickets.map((ticket) => (
          <Card 
            key={ticket.id} 
            className={`cursor-pointer hover:shadow-md transition-shadow ${
              selectedTicket?.id === ticket.id ? 'ring-2 ring-primary' : ''
            }`}
            onClick={() => handleSelectTicket(ticket)}
          >
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">{ticket.subject}</CardTitle>
                <Badge variant={getStatusBadgeVariant(ticket.status)}>
                  {ticket.status}
                </Badge>
              </div>
              <CardDescription>
                Ticket #{ticket.id.substring(0, 8)}
              </CardDescription>
            </CardHeader>
            <CardFooter className="pt-2 flex justify-between">
              <Badge variant={getPriorityBadgeVariant(ticket.priority)}>
                {ticket.priority} priority
              </Badge>
              <span className="text-xs text-muted-foreground">
                Updated {formatDate(ticket.lastUpdated)}
              </span>
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  };

  const renderTicketDetails = () => {
    if (!selectedTicket) {
      return (
        <div className="text-center py-12 border-l h-full flex flex-col items-center justify-center">
          <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-xl font-medium mb-2">No Ticket Selected</h3>
          <p className="text-muted-foreground">
            Select a ticket from the list to view its details.
          </p>
        </div>
      );
    }

    return (
      <div className="h-full flex flex-col border-l">
        <div className="p-4 border-b bg-muted/30">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-xl font-semibold">{selectedTicket.subject}</h3>
            <Badge variant={getStatusBadgeVariant(selectedTicket.status)}>
              {selectedTicket.status}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant={getPriorityBadgeVariant(selectedTicket.priority)}>
                {selectedTicket.priority} priority
              </Badge>
              <span className="text-xs text-muted-foreground">
                Created {formatDate(selectedTicket.createdAt)}
              </span>
            </div>
            <div className="flex gap-2">
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="sm"
                    disabled={selectedTicket.status === 'closed'}
                  >
                    Close Ticket
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Close Ticket</DialogTitle>
                    <DialogDescription>
                      Are you sure you want to close this ticket? This action cannot be undone.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                    <Button variant="destructive" onClick={handleCloseTicket}>Close Ticket</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              
              <Button 
                size="sm"
                onClick={handleConfirmSatisfaction}
                disabled={selectedTicket.status === 'resolved' || selectedTicket.status === 'closed'}
              >
                Resolve Issue
              </Button>
            </div>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {isLoadingMessages ? (
            <div className="flex justify-center py-6">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : ticketMessages.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-muted-foreground">No messages found for this ticket.</p>
            </div>
          ) : (
            ticketMessages.map((message) => (
              <div 
                key={message.id} 
                className={`flex ${message.sender === 'client' ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.sender === 'client' 
                      ? 'bg-primary text-primary-foreground' 
                      : message.sender === 'system'
                        ? 'bg-muted text-muted-foreground text-center italic' 
                        : 'bg-muted text-foreground'
                  }`}
                >
                  <p>{message.content}</p>
                  <div className={`text-xs mt-1 ${
                    message.sender === 'client' ? 'text-primary-foreground/70' : 'text-muted-foreground'
                  }`}>
                    {message.sender === 'system' ? 'System' : message.sender === 'client' ? 'You' : 'Support Agent'} • {formatDate(message.timestamp)}
                  </div>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
        
        {selectedTicket.status !== 'closed' && (
          <div className="p-4 border-t">
            <div className="flex items-end gap-2">
              <div className="flex-1">
                <Textarea 
                  placeholder="Type your message here..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  disabled={isSubmitting}
                  className="min-h-[80px] resize-none"
                />
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={handleFileUpload}
                  disabled={isSubmitting}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                    <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v10c0 1.1.9 2 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
                    <path d="M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" />
                  </svg>
                </Button>
                <Button 
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim() || isSubmitting}
                >
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <PaperPlaneIcon className="h-4 w-4 mr-2" />
                  )}
                  Send
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderNewTicketForm = () => {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Create a New Support Ticket</CardTitle>
          <CardDescription>
            Please provide details about your issue and we'll get back to you as soon as possible.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4 mb-6">
            <ToggleGroup type="single" value={isRefundRequest ? "refund" : "support"} onValueChange={(value) => {
              if (value === "refund") {
                setIsRefundRequest(true);
                setNewTicket(prev => ({
                  ...prev,
                  category: 'refund',
                  subject: 'Refund Request'
                }));
              } else if (value === "support") {
                setIsRefundRequest(false);
                setNewTicket(prev => ({
                  ...prev,
                  category: 'general',
                  subject: ''
                }));
              }
            }}>
              <ToggleGroupItem value="support">
                Support Request
              </ToggleGroupItem>
              <ToggleGroupItem value="refund">
                Refund Request
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
          
          {isRefundRequest && (
            <Alert variant="warning" className="mb-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Refund Request</AlertTitle>
              <AlertDescription>
                Refund requests are subject to review. Please provide detailed information about why you're requesting a refund.
              </AlertDescription>
            </Alert>
          )}
          
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="subject">Subject</Label>
              <Input 
                id="subject" 
                placeholder="Brief description of your issue"
                value={newTicket.subject}
                onChange={(e) => setNewTicket({...newTicket, subject: e.target.value})}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="category">Category</Label>
              <Select 
                value={newTicket.category}
                onValueChange={(value) => setNewTicket({...newTicket, category: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General Inquiry</SelectItem>
                  <SelectItem value="technical">Technical Issue</SelectItem>
                  <SelectItem value="billing">Billing Question</SelectItem>
                  <SelectItem value="feature">Feature Request</SelectItem>
                  <SelectItem value="refund">Refund Request</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="priority">Priority</Label>
              <Select
                value={newTicket.priority}
                onValueChange={(value) => setNewTicket({...newTicket, priority: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {isRefundRequest && (
              <>
                <div className="grid gap-2">
                  <Label htmlFor="refundService">Service to Refund</Label>
                  <Select
                    value={newTicket.refundService}
                    onValueChange={(value) => setNewTicket({...newTicket, refundService: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select service" />
                    </SelectTrigger>
                    <SelectContent>
                      {userServices.map(service => (
                        <SelectItem key={service.id} value={service.id}>
                          {service.name} (${service.price})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="refundAmount">Refund Amount ($)</Label>
                  <Input 
                    id="refundAmount" 
                    type="number"
                    placeholder="0.00"
                    value={newTicket.refundAmount}
                    onChange={(e) => setNewTicket({...newTicket, refundAmount: e.target.value})}
                  />
                </div>
              </>
            )}
            
            <div className="grid gap-2">
              <Label htmlFor="message">Message</Label>
              <Textarea 
                id="message" 
                placeholder="Please describe your issue in detail..."
                value={newTicket.message}
                onChange={(e) => setNewTicket({...newTicket, message: e.target.message})}
                className="min-h-[150px]"
              />
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => setActiveTab('tickets')}>
            Cancel
          </Button>
          <Button onClick={handleSubmitNewTicket} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              'Submit Ticket'
            )}
          </Button>
        </CardFooter>
      </Card>
    );
  };

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Support</h1>
        <p className="text-muted-foreground">
          Get help with your services and account
        </p>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="tickets">My Tickets</TabsTrigger>
          <TabsTrigger value="new-ticket">New Ticket</TabsTrigger>
          <TabsTrigger value="faq">FAQ</TabsTrigger>
        </TabsList>
        
        <TabsContent value="tickets" className="space-y-6">
          <div className="flex flex-col md:flex-row gap-6 h-[70vh]">
            <div className="w-full md:w-1/3 overflow-y-auto pr-2">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Support Tickets</h2>
                <Button size="sm" onClick={() => setActiveTab('new-ticket')}>
                  New Ticket
                </Button>
              </div>
              {renderTicketList()}
            </div>
            
            <div className="w-full md:w-2/3 h-full">
              {renderTicketDetails()}
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="new-ticket">
          {renderNewTicketForm()}
        </TabsContent>
        
        <TabsContent value="faq">
          <Card>
            <CardHeader>
              <CardTitle>Frequently Asked Questions</CardTitle>
              <CardDescription>
                Find quick answers to common questions about our services.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="border-b pb-4">
                  <h3 className="text-lg font-medium mb-2">How do I cancel a service?</h3>
                  <p className="text-muted-foreground">
                    You can cancel a service by going to the Services page, finding the service you want to cancel, and clicking the "Deactivate Service" button.
                  </p>
                </div>
                
                <div className="border-b pb-4">
                  <h3 className="text-lg font-medium mb-2">How do I request a refund?</h3>
                  <p className="text-muted-foreground">
                    To request a refund, create a new support ticket with the category "Refund Request" and provide details about why you're requesting a refund.
                  </p>
                </div>
                
                <div className="border-b pb-4">
                  <h3 className="text-lg font-medium mb-2">How long does it take to get a response to a support ticket?</h3>
                  <p className="text-muted-foreground">
                    We aim to respond to all support tickets within 24 hours. High priority tickets are typically addressed within 4-8 hours.
                  </p>
                </div>
                
                <div className="border-b pb-4">
                  <h3 className="text-lg font-medium mb-2">How do I update my payment method?</h3>
                  <p className="text-muted-foreground">
                    You can update your payment method by going to the Billing page and selecting the "Payment Methods" tab.
                  </p>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-2">What happens if my payment fails?</h3>
                  <p className="text-muted-foreground">
                    If your payment fails, we'll notify you via email and try to process the payment again in 3 days. If the second attempt fails, your service might be temporarily suspended until the payment issue is resolved.
                  </p>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <p className="text-sm text-muted-foreground">
                Can't find the answer you're looking for? <Button variant="link" className="p-0 h-auto" onClick={() => setActiveTab('new-ticket')}>Contact our support team</Button>.
              </p>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Support;
