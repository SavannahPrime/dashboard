
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  MessageSquare, 
  Users, 
  Clock, 
  CheckCircle, 
  Search, 
  Filter, 
  MoreHorizontal, 
  Loader2
} from 'lucide-react';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Textarea } from '@/components/ui/textarea';

const SupportDashboard: React.FC = () => {
  const { currentAdmin } = useAdminAuth();
  
  const [tickets, setTickets] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  
  // View ticket dialog state
  const [isViewTicketOpen, setIsViewTicketOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [ticketMessages, setTicketMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isSubmittingMessage, setIsSubmittingMessage] = useState(false);
  
  const fetchTickets = async () => {
    setIsLoading(true);
    try {
      const { data: clientsData, error: clientsError } = await supabase
        .from('clients')
        .select('id, name, email');
      
      if (clientsError) throw clientsError;
      
      const { data: ticketsData, error: ticketsError } = await supabase
        .from('tickets')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (ticketsError) throw ticketsError;
      
      // Add client details to tickets
      const enhancedTickets = ticketsData?.map(ticket => {
        const client = clientsData?.find(c => c.id === ticket.client_id);
        return {
          ...ticket,
          client: client ? {
            name: client.name,
            email: client.email
          } : undefined
        };
      });
      
      setTickets(enhancedTickets || []);
    } catch (error) {
      console.error('Error fetching tickets:', error);
      toast.error('Failed to load tickets');
    } finally {
      setIsLoading(false);
    }
  };
  
  const fetchTicketMessages = async (ticketId: string) => {
    if (!ticketId) return;
    
    setIsLoadingMessages(true);
    try {
      const { data, error } = await supabase
        .from('ticket_messages')
        .select('*')
        .eq('ticket_id', ticketId)
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
  
  useEffect(() => {
    fetchTickets();
    
    // Set up realtime subscription for ticket updates
    const ticketsChannel = supabase
      .channel('public:tickets')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'tickets' 
      }, () => {
        fetchTickets();
      })
      .subscribe();
    
    return () => {
      supabase.removeChannel(ticketsChannel);
    };
  }, []);
  
  useEffect(() => {
    if (selectedTicket?.id) {
      fetchTicketMessages(selectedTicket.id);
      
      // Set up realtime subscription for ticket message updates
      const messagesChannel = supabase
        .channel('public:ticket_messages')
        .on('postgres_changes', { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'ticket_messages',
          filter: `ticket_id=eq.${selectedTicket.id}`
        }, () => {
          fetchTicketMessages(selectedTicket.id);
        })
        .subscribe();
      
      return () => {
        supabase.removeChannel(messagesChannel);
      };
    }
  }, [selectedTicket?.id]);
  
  const handleViewTicket = (ticket: any) => {
    setSelectedTicket(ticket);
    setIsViewTicketOpen(true);
  };
  
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedTicket?.id) return;
    
    setIsSubmittingMessage(true);
    try {
      const { error } = await supabase
        .from('ticket_messages')
        .insert({
          ticket_id: selectedTicket.id,
          sender: 'admin',
          content: newMessage.trim()
        });
      
      if (error) throw error;
      
      // Update ticket status to 'in_progress' if it's 'open'
      if (selectedTicket.status === 'open') {
        await supabase
          .from('tickets')
          .update({ 
            status: 'in_progress',
            assigned_to: currentAdmin?.name || 'Support Agent',
            updated_at: new Date().toISOString()
          })
          .eq('id', selectedTicket.id);
        
        setSelectedTicket({
          ...selectedTicket,
          status: 'in_progress',
          assigned_to: currentAdmin?.name || 'Support Agent'
        });
      }
      
      setNewMessage('');
      toast.success('Message sent');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    } finally {
      setIsSubmittingMessage(false);
    }
  };
  
  const handleUpdateTicketStatus = async (ticketId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('tickets')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', ticketId);
      
      if (error) throw error;
      
      toast.success(`Ticket status updated to ${newStatus}`);
      
      if (selectedTicket?.id === ticketId) {
        setSelectedTicket({
          ...selectedTicket,
          status: newStatus
        });
      }
      
      fetchTickets();
    } catch (error) {
      console.error('Error updating ticket status:', error);
      toast.error('Failed to update ticket status');
    }
  };
  
  const handleUpdateTicketPriority = async (ticketId: string, newPriority: string) => {
    try {
      const { error } = await supabase
        .from('tickets')
        .update({ 
          priority: newPriority,
          updated_at: new Date().toISOString()
        })
        .eq('id', ticketId);
      
      if (error) throw error;
      
      toast.success(`Ticket priority updated to ${newPriority}`);
      
      if (selectedTicket?.id === ticketId) {
        setSelectedTicket({
          ...selectedTicket,
          priority: newPriority
        });
      }
      
      fetchTickets();
    } catch (error) {
      console.error('Error updating ticket priority:', error);
      toast.error('Failed to update ticket priority');
    }
  };
  
  const handleAssignTicket = async (ticketId: string) => {
    if (!currentAdmin?.name) return;
    
    try {
      const { error } = await supabase
        .from('tickets')
        .update({ 
          assigned_to: currentAdmin.name,
          status: 'in_progress',
          updated_at: new Date().toISOString()
        })
        .eq('id', ticketId);
      
      if (error) throw error;
      
      toast.success('Ticket assigned to you');
      
      if (selectedTicket?.id === ticketId) {
        setSelectedTicket({
          ...selectedTicket,
          assigned_to: currentAdmin.name,
          status: 'in_progress'
        });
      }
      
      fetchTickets();
    } catch (error) {
      console.error('Error assigning ticket:', error);
      toast.error('Failed to assign ticket');
    }
  };
  
  // Filter tickets based on search and filters
  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = 
      ticket.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.client?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.client?.email?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = 
      statusFilter === 'all' || 
      ticket.status === statusFilter;
    
    const matchesPriority = 
      priorityFilter === 'all' || 
      ticket.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });
  
  // Format date
  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
      if (diffHours === 0) {
        const diffMinutes = Math.floor(diffTime / (1000 * 60));
        return `${diffMinutes} minutes ago`;
      }
      return `${diffHours} hours ago`;
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    }
  };
  
  // Format message timestamp
  const formatMessageTime = (dateString: string) => {
    if (!dateString) return '';
    
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Get status badge color
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'open':
        return 'secondary';
      case 'in_progress':
        return 'default';
      case 'resolved':
        return 'success';
      case 'closed':
        return 'outline';
      default:
        return 'outline';
    }
  };
  
  // Get priority badge color
  const getPriorityBadgeVariant = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'destructive';
      case 'medium':
        return 'default';
      case 'low':
        return 'secondary';
      default:
        return 'outline';
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Support Dashboard</h1>
          <p className="text-muted-foreground">
            Manage support tickets and client communications
          </p>
        </div>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Tickets</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {tickets.filter(ticket => ticket.status === 'open').length}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {tickets.filter(ticket => ticket.status === 'open' && ticket.priority === 'high').length} high priority
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {tickets.filter(ticket => ticket.status === 'in_progress').length}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {tickets.filter(ticket => ticket.status === 'in_progress' && 
                ticket.assigned_to === currentAdmin?.name).length} assigned to you
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Response</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1.4 hours</div>
            <div className="text-xs text-muted-foreground mt-1">
              Down from 2.3 hours last week
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resolved</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {tickets.filter(ticket => ticket.status === 'resolved' || ticket.status === 'closed').length}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              In the last 30 days
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Support Tickets</CardTitle>
          <CardDescription>
            View and manage client support requests
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search tickets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            
            <div className="flex flex-wrap items-center gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priority</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredTickets.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Subject</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Assigned To</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTickets.map(ticket => (
                    <TableRow key={ticket.id}>
                      <TableCell className="font-medium">{ticket.subject}</TableCell>
                      <TableCell>
                        {ticket.client ? (
                          <div>
                            <div>{ticket.client.name}</div>
                            <div className="text-muted-foreground text-xs">{ticket.client.email}</div>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">Unknown</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(ticket.status)}>
                          {ticket.status.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getPriorityBadgeVariant(ticket.priority)}>
                          {ticket.priority}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {ticket.assigned_to || (
                          <span className="text-muted-foreground text-sm">Unassigned</span>
                        )}
                      </TableCell>
                      <TableCell>{formatDate(ticket.created_at)}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleViewTicket(ticket)}>
                              View Ticket
                            </DropdownMenuItem>
                            {ticket.assigned_to !== currentAdmin?.name && (
                              <DropdownMenuItem onClick={() => handleAssignTicket(ticket.id)}>
                                Assign to Me
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuLabel>Set Status</DropdownMenuLabel>
                            <DropdownMenuItem 
                              onClick={() => handleUpdateTicketStatus(ticket.id, 'open')}
                              disabled={ticket.status === 'open'}
                            >
                              Open
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleUpdateTicketStatus(ticket.id, 'in_progress')}
                              disabled={ticket.status === 'in_progress'}
                            >
                              In Progress
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleUpdateTicketStatus(ticket.id, 'resolved')}
                              disabled={ticket.status === 'resolved'}
                            >
                              Resolved
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleUpdateTicketStatus(ticket.id, 'closed')}
                              disabled={ticket.status === 'closed'}
                            >
                              Closed
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuLabel>Set Priority</DropdownMenuLabel>
                            <DropdownMenuItem 
                              onClick={() => handleUpdateTicketPriority(ticket.id, 'high')}
                              disabled={ticket.priority === 'high'}
                            >
                              High
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleUpdateTicketPriority(ticket.id, 'medium')}
                              disabled={ticket.priority === 'medium'}
                            >
                              Medium
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleUpdateTicketPriority(ticket.id, 'low')}
                              disabled={ticket.priority === 'low'}
                            >
                              Low
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-10 border rounded-md">
              <MessageSquare className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <h3 className="text-lg font-medium">No tickets found</h3>
              <p className="text-muted-foreground">
                {searchQuery || statusFilter !== 'all' || priorityFilter !== 'all' ? 
                  'Try adjusting your filters' : 
                  'There are no support tickets to display'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* View Ticket Dialog */}
      <Dialog open={isViewTicketOpen} onOpenChange={setIsViewTicketOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Ticket #{selectedTicket?.id?.substring(0, 8)}</DialogTitle>
            <DialogDescription>
              {selectedTicket?.subject}
            </DialogDescription>
          </DialogHeader>
          
          {selectedTicket && (
            <div className="flex-1 overflow-hidden flex flex-col">
              <div className="py-4 flex items-center justify-between">
                <div className="flex space-x-4">
                  <Badge variant={getStatusBadgeVariant(selectedTicket.status)}>
                    {selectedTicket.status.replace('_', ' ')}
                  </Badge>
                  <Badge variant={getPriorityBadgeVariant(selectedTicket.priority)}>
                    {selectedTicket.priority}
                  </Badge>
                </div>
                
                <div className="text-sm text-muted-foreground">
                  {formatDate(selectedTicket.created_at)}
                </div>
              </div>
              
              <div className="flex justify-between items-center mb-4">
                <div>
                  <p className="text-sm text-muted-foreground">From</p>
                  <p className="font-medium">{selectedTicket.client?.name}</p>
                  <p className="text-sm">{selectedTicket.client?.email}</p>
                </div>
                
                <div>
                  <p className="text-sm text-muted-foreground">Assigned to</p>
                  <p className="font-medium">{selectedTicket.assigned_to || 'Unassigned'}</p>
                </div>
              </div>
              
              <div className="border rounded-md flex-1 overflow-hidden flex flex-col">
                <div className="overflow-y-auto p-4 flex-1">
                  {isLoadingMessages ? (
                    <div className="flex justify-center py-6">
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    </div>
                  ) : ticketMessages.length > 0 ? (
                    <div className="space-y-4">
                      {ticketMessages.map((message, index) => (
                        <div 
                          key={message.id} 
                          className={`flex flex-col ${
                            message.sender === 'admin' ? 'items-end' : 'items-start'
                          }`}
                        >
                          <div className={`max-w-[80%] rounded-lg p-3 ${
                            message.sender === 'admin' 
                              ? 'bg-primary text-primary-foreground' 
                              : 'bg-muted'
                          }`}>
                            <p>{message.content}</p>
                          </div>
                          <span className="text-xs text-muted-foreground mt-1">
                            {message.sender === 'admin' ? 'Support Agent' : 'Client'} • {formatMessageTime(message.timestamp)}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 text-muted-foreground">
                      No messages yet
                    </div>
                  )}
                </div>
                
                <div className="border-t p-4">
                  <div className="flex gap-2">
                    <Textarea
                      placeholder="Type your reply..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      className="min-h-[100px]"
                    />
                  </div>
                </div>
              </div>
              
              <DialogFooter className="mt-4">
                <div className="flex justify-between w-full">
                  <div className="flex gap-2">
                    <Select 
                      value={selectedTicket.status} 
                      onValueChange={(value) => handleUpdateTicketStatus(selectedTicket.id, value)}
                    >
                      <SelectTrigger className="w-[140px]">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="open">Open</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="resolved">Resolved</SelectItem>
                        <SelectItem value="closed">Closed</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <Select 
                      value={selectedTicket.priority} 
                      onValueChange={(value) => handleUpdateTicketPriority(selectedTicket.id, value)}
                    >
                      <SelectTrigger className="w-[140px]">
                        <SelectValue placeholder="Priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <Button onClick={handleSendMessage} disabled={!newMessage.trim() || isSubmittingMessage}>
                    {isSubmittingMessage ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      'Send Reply'
                    )}
                  </Button>
                </div>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
      
      <Tabs defaultValue="assigned" className="space-y-6">
        <TabsList>
          <TabsTrigger value="assigned">My Tickets</TabsTrigger>
          <TabsTrigger value="recent">Recent Activity</TabsTrigger>
          <TabsTrigger value="analytics">Support Analytics</TabsTrigger>
        </TabsList>
        
        <TabsContent value="assigned">
          <Card>
            <CardHeader>
              <CardTitle>My Assigned Tickets</CardTitle>
              <CardDescription>
                Tickets currently assigned to you
              </CardDescription>
            </CardHeader>
            <CardContent>
              {filteredTickets.filter(ticket => ticket.assigned_to === currentAdmin?.name).length > 0 ? (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Subject</TableHead>
                        <TableHead>Client</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Priority</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredTickets
                        .filter(ticket => ticket.assigned_to === currentAdmin?.name)
                        .map(ticket => (
                          <TableRow key={ticket.id}>
                            <TableCell className="font-medium">{ticket.subject}</TableCell>
                            <TableCell>{ticket.client?.name || 'Unknown'}</TableCell>
                            <TableCell>
                              <Badge variant={getStatusBadgeVariant(ticket.status)}>
                                {ticket.status.replace('_', ' ')}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant={getPriorityBadgeVariant(ticket.priority)}>
                                {ticket.priority}
                              </Badge>
                            </TableCell>
                            <TableCell>{formatDate(ticket.created_at)}</TableCell>
                            <TableCell className="text-right">
                              <Button variant="ghost" size="sm" onClick={() => handleViewTicket(ticket)}>
                                View
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  No tickets are currently assigned to you
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="recent">
          <Card>
            <CardHeader>
              <CardTitle>Recent Ticket Activity</CardTitle>
              <CardDescription>
                Recently updated or created tickets
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>Recent ticket activity will be displayed here.</p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>Support Analytics</CardTitle>
              <CardDescription>
                Performance metrics and trends
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>Support analytics will be displayed here.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SupportDashboard;
