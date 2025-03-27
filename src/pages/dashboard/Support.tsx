
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation } from 'react-router-dom';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { 
  MessageCircle, 
  Plus, 
  TicketCheck, 
  Clock, 
  CheckCircle2, 
  RefreshCw,
  Loader2,
  Send
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface SupportTicket {
  id: string;
  subject: string;
  message: string;
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  createdAt: string;
  lastUpdated: string;
  messages?: TicketMessage[];
}

interface TicketMessage {
  id: string;
  ticketId: string;
  content: string;
  sender: string;
  timestamp: string;
}

const Support: React.FC = () => {
  const { currentUser } = useAuth();
  const location = useLocation();
  
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [newTicket, setNewTicket] = useState({
    subject: '',
    message: '',
    category: 'general',
    priority: 'medium',
  });
  const [activeTicket, setActiveTicket] = useState<SupportTicket | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [isCreatingTicket, setIsCreatingTicket] = useState(false);
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [isLoadingTickets, setIsLoadingTickets] = useState(true);
  
  // Initialize ticket data from location state if available
  useEffect(() => {
    if (location.state?.serviceTitle) {
      setNewTicket({
        ...newTicket,
        subject: `Support for ${location.state.serviceTitle}`,
        category: 'service-help'
      });
    }
  }, [location.state]);
  
  const fetchTickets = async () => {
    if (!currentUser) return;
    
    setIsLoadingTickets(true);
    try {
      // Fetch tickets
      const { data: ticketsData, error: ticketsError } = await supabase
        .from('tickets')
        .select('*')
        .eq('client_id', currentUser.id)
        .order('updated_at', { ascending: false });
      
      if (ticketsError) throw ticketsError;
      
      if (!ticketsData) {
        setTickets([]);
        setIsLoadingTickets(false);
        return;
      }
      
      // Format tickets
      const formattedTickets = ticketsData.map(ticket => ({
        id: ticket.id,
        subject: ticket.subject,
        message: '',
        status: ticket.status,
        priority: ticket.priority,
        createdAt: ticket.created_at,
        lastUpdated: ticket.updated_at,
      }));
      
      setTickets(formattedTickets);
      
      // If there are tickets, fetch messages for the first ticket
      if (formattedTickets.length > 0 && !activeTicket) {
        fetchTicketMessages(formattedTickets[0].id);
      }
      
    } catch (error) {
      console.error('Error fetching tickets:', error);
      toast.error('Failed to load support tickets');
    } finally {
      setIsLoadingTickets(false);
    }
  };
  
  const fetchTicketMessages = async (ticketId: string) => {
    try {
      // Get the ticket details first
      const { data: ticketData, error: ticketError } = await supabase
        .from('tickets')
        .select('*')
        .eq('id', ticketId)
        .single();
      
      if (ticketError) throw ticketError;
      
      // Fetch messages for this ticket
      const { data: messagesData, error: messagesError } = await supabase
        .from('ticket_messages')
        .select('*')
        .eq('ticket_id', ticketId)
        .order('timestamp', { ascending: true });
      
      if (messagesError) throw messagesError;
      
      // Format messages
      const formattedMessages = messagesData?.map(msg => ({
        id: msg.id,
        ticketId: msg.ticket_id,
        content: msg.content,
        sender: msg.sender,
        timestamp: msg.timestamp
      })) || [];
      
      // Set the active ticket with messages
      const currentTicket = tickets.find(t => t.id === ticketId);
      if (currentTicket) {
        const updatedTicket = {
          ...currentTicket,
          messages: formattedMessages
        };
        setActiveTicket(updatedTicket);
      } else if (ticketData) {
        const newTicket = {
          id: ticketData.id,
          subject: ticketData.subject,
          message: '',
          status: ticketData.status,
          priority: ticketData.priority,
          createdAt: ticketData.created_at,
          lastUpdated: ticketData.updated_at,
          messages: formattedMessages
        };
        setActiveTicket(newTicket);
      }
      
    } catch (error) {
      console.error('Error fetching ticket messages:', error);
      toast.error('Failed to load ticket messages');
    }
  };
  
  useEffect(() => {
    if (currentUser) {
      fetchTickets();
    }
    
    // Set up realtime subscription for ticket updates
    const ticketsChannel = supabase
      .channel('public:tickets')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'tickets',
        filter: `client_id=eq.${currentUser?.id}`
      }, () => {
        fetchTickets();
      })
      .subscribe();
      
    const messagesChannel = supabase
      .channel('public:ticket_messages')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'ticket_messages'
      }, (payload) => {
        // If this is for the active ticket, refresh its messages
        if (activeTicket && payload.new.ticket_id === activeTicket.id) {
          fetchTicketMessages(activeTicket.id);
        }
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(ticketsChannel);
      supabase.removeChannel(messagesChannel);
    };
  }, [currentUser, activeTicket]);
  
  const createTicket = async () => {
    if (!currentUser) return;
    
    if (!newTicket.subject || !newTicket.message) {
      toast.error('Please provide both subject and message');
      return;
    }
    
    setIsCreatingTicket(true);
    try {
      // Create the ticket
      const { data: ticketData, error: ticketError } = await supabase
        .from('tickets')
        .insert({
          subject: newTicket.subject,
          category: newTicket.category,
          priority: newTicket.priority,
          client_id: currentUser.id,
          status: 'open'
        })
        .select()
        .single();
      
      if (ticketError) throw ticketError;
      
      // Add the initial message
      const { error: messageError } = await supabase
        .from('ticket_messages')
        .insert({
          ticket_id: ticketData.id,
          content: newTicket.message,
          sender: 'client'
        });
      
      if (messageError) throw messageError;
      
      toast.success('Support ticket created successfully');
      
      // Reset form
      setNewTicket({
        subject: '',
        message: '',
        category: 'general',
        priority: 'medium',
      });
      
      // Refresh tickets
      await fetchTickets();
      
      // Set the new ticket as active
      await fetchTicketMessages(ticketData.id);
      
    } catch (error) {
      console.error('Error creating ticket:', error);
      toast.error('Failed to create support ticket');
    } finally {
      setIsCreatingTicket(false);
    }
  };
  
  const sendMessage = async () => {
    if (!activeTicket || !newMessage.trim() || !currentUser) return;
    
    setIsSendingMessage(true);
    try {
      // Add the message
      const { error } = await supabase
        .from('ticket_messages')
        .insert({
          ticket_id: activeTicket.id,
          content: newMessage,
          sender: 'client'
        });
      
      if (error) throw error;
      
      // Update ticket status if it was closed
      if (activeTicket.status === 'resolved' || activeTicket.status === 'closed') {
        const { error: updateError } = await supabase
          .from('tickets')
          .update({ status: 'open', updated_at: new Date().toISOString() })
          .eq('id', activeTicket.id);
        
        if (updateError) throw updateError;
      } else {
        // Just update the timestamp
        const { error: updateError } = await supabase
          .from('tickets')
          .update({ updated_at: new Date().toISOString() })
          .eq('id', activeTicket.id);
        
        if (updateError) throw updateError;
      }
      
      setNewMessage('');
      
      // Refresh messages
      await fetchTicketMessages(activeTicket.id);
      
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    } finally {
      setIsSendingMessage(false);
    }
  };
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-300">Open</Badge>;
      case 'in-progress':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">In Progress</Badge>;
      case 'resolved':
        return <Badge className="bg-green-100 text-green-800 border-green-300">Resolved</Badge>;
      case 'closed':
        return <Badge className="bg-gray-100 text-gray-800 border-gray-300">Closed</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };
  
  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'low':
        return <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-300">Low</Badge>;
      case 'medium':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">Medium</Badge>;
      case 'high':
        return <Badge variant="outline" className="bg-orange-100 text-orange-800 border-orange-300">High</Badge>;
      case 'urgent':
        return <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300">Urgent</Badge>;
      default:
        return <Badge variant="outline">{priority}</Badge>;
    }
  };
  
  if (!currentUser) return null;
  
  return (
    <div className="animate-fade-in">
      <DashboardHeader pageTitle="Support" />
      
      <div className="p-6">
        <Tabs defaultValue="tickets" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="tickets" className="flex items-center gap-2">
              <TicketCheck className="h-4 w-4" />
              My Tickets
            </TabsTrigger>
            <TabsTrigger value="new" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              New Ticket
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="tickets" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Tickets List */}
              <Card className="md:col-span-1 h-[calc(100vh-240px)] flex flex-col">
                <CardHeader className="pb-3">
                  <CardTitle className="text-xl flex justify-between items-center">
                    <span>Support Tickets</span>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={fetchTickets}
                      disabled={isLoadingTickets}
                    >
                      <RefreshCw className={`h-4 w-4 ${isLoadingTickets ? 'animate-spin' : ''}`} />
                    </Button>
                  </CardTitle>
                </CardHeader>
                <div className="overflow-auto flex-1">
                  {isLoadingTickets ? (
                    <div className="flex justify-center items-center h-full">
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    </div>
                  ) : tickets.length > 0 ? (
                    <div className="space-y-2 p-4 pt-0">
                      {tickets.map(ticket => (
                        <div 
                          key={ticket.id}
                          className={`p-3 rounded-md cursor-pointer transition-colors ${
                            activeTicket?.id === ticket.id 
                              ? 'bg-primary/10' 
                              : 'hover:bg-muted'
                          }`}
                          onClick={() => fetchTicketMessages(ticket.id)}
                        >
                          <div className="flex justify-between items-start mb-1">
                            <h4 className="font-medium line-clamp-1">{ticket.subject}</h4>
                            {getStatusBadge(ticket.status)}
                          </div>
                          <div className="flex justify-between items-center text-xs text-muted-foreground">
                            <span>{new Date(ticket.createdAt).toLocaleDateString()}</span>
                            {getPriorityBadge(ticket.priority)}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full p-6">
                      <p className="text-muted-foreground text-center mb-4">You don't have any support tickets yet</p>
                      <Button 
                        variant="outline"
                        onClick={() => document.querySelector('[data-value="new"]')?.click()}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Create Your First Ticket
                      </Button>
                    </div>
                  )}
                </div>
              </Card>
              
              {/* Ticket Conversation */}
              <Card className="md:col-span-2 h-[calc(100vh-240px)] flex flex-col">
                {activeTicket ? (
                  <>
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-xl">{activeTicket.subject}</CardTitle>
                          <CardDescription className="flex items-center gap-2 mt-1">
                            {getStatusBadge(activeTicket.status)}
                            {getPriorityBadge(activeTicket.priority)}
                            <span className="text-xs">
                              Created: {formatDate(activeTicket.createdAt)}
                            </span>
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <Separator />
                    <div className="flex-1 overflow-auto p-4">
                      {activeTicket.messages && activeTicket.messages.length > 0 ? (
                        <div className="space-y-4">
                          {activeTicket.messages.map(message => (
                            <div 
                              key={message.id} 
                              className={`flex ${
                                message.sender === 'client' ? 'justify-end' : 'justify-start'
                              }`}
                            >
                              <div 
                                className={`max-w-[80%] rounded-lg p-3 ${
                                  message.sender === 'client' 
                                    ? 'bg-primary text-primary-foreground' 
                                    : 'bg-muted'
                                }`}
                              >
                                <p className="whitespace-pre-wrap">{message.content}</p>
                                <p className="mt-1 text-xs opacity-70">
                                  {formatDate(message.timestamp)}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <p className="text-muted-foreground">No messages in this ticket yet</p>
                        </div>
                      )}
                    </div>
                    {activeTicket.status !== 'closed' && (
                      <CardFooter className="flex-col p-4 pt-3 border-t space-y-2">
                        <div className="flex gap-2 w-full">
                          <Textarea 
                            placeholder="Type your message here..." 
                            className="flex-1"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && !e.shiftKey && newMessage.trim()) {
                                e.preventDefault();
                                sendMessage();
                              }
                            }}
                            disabled={isSendingMessage}
                          />
                        </div>
                        <div className="flex justify-between w-full">
                          <div className="flex gap-2">
                            {activeTicket.status === 'resolved' && (
                              <Badge className="bg-green-100 text-green-800 border-green-300 flex items-center gap-1">
                                <CheckCircle2 className="h-3 w-3" />
                                Resolved
                              </Badge>
                            )}
                          </div>
                          <Button 
                            onClick={sendMessage} 
                            disabled={!newMessage.trim() || isSendingMessage}
                          >
                            {isSendingMessage ? (
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                              <Send className="h-4 w-4 mr-2" />
                            )}
                            Send
                          </Button>
                        </div>
                      </CardFooter>
                    )}
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full p-6">
                    <MessageCircle className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-center text-muted-foreground mb-2">
                      {tickets.length > 0 
                        ? 'Select a ticket to view the conversation' 
                        : 'You don\'t have any tickets yet'}
                    </p>
                    {tickets.length === 0 && (
                      <Button 
                        variant="outline"
                        onClick={() => document.querySelector('[data-value="new"]')?.click()}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Create Your First Ticket
                      </Button>
                    )}
                  </div>
                )}
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="new">
            <Card>
              <CardHeader>
                <CardTitle>Create New Support Ticket</CardTitle>
                <CardDescription>
                  Describe your issue and our support team will respond as soon as possible.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject</Label>
                    <Input 
                      id="subject" 
                      placeholder="Brief summary of your issue"
                      value={newTicket.subject}
                      onChange={(e) => setNewTicket({ ...newTicket, subject: e.target.value })}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="category">Category</Label>
                      <Select 
                        value={newTicket.category}
                        onValueChange={(value) => setNewTicket({ ...newTicket, category: value})}
                      >
                        <SelectTrigger id="category">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="general">General Inquiry</SelectItem>
                          <SelectItem value="billing">Billing Issue</SelectItem>
                          <SelectItem value="technical">Technical Support</SelectItem>
                          <SelectItem value="service-help">Service Help</SelectItem>
                          <SelectItem value="refund">Refund Request</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="priority">Priority</Label>
                      <Select 
                        value={newTicket.priority}
                        onValueChange={(value: any) => setNewTicket({ ...newTicket, priority: value})}
                      >
                        <SelectTrigger id="priority">
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="urgent">Urgent</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea 
                    id="message" 
                    placeholder="Describe your issue in detail..."
                    className="min-h-[200px]"
                    value={newTicket.message}
                    onChange={(e) => setNewTicket({ ...newTicket, message: e.target.value })}
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  onClick={createTicket}
                  disabled={isCreatingTicket || !newTicket.subject || !newTicket.message}
                >
                  {isCreatingTicket ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus className="mr-2 h-4 w-4" />
                      Submit Ticket
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Support;
