
import React, { useState, useEffect } from 'react';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, MoreHorizontal, RefreshCw, MessageCircle, ClipboardList, Loader2 } from 'lucide-react';
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
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const priorityColors: Record<string, string> = {
  high: 'bg-red-100 text-red-800 border-red-300',
  medium: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  low: 'bg-blue-100 text-blue-800 border-blue-300',
};

const statusColors: Record<string, string> = {
  open: 'bg-green-100 text-green-800 border-green-300',
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  closed: 'bg-gray-100 text-gray-800 border-gray-300',
};

const SupportDashboard: React.FC = () => {
  const { currentAdmin } = useAdminAuth();
  const [tickets, setTickets] = useState<any[]>([]);
  const [filteredTickets, setFilteredTickets] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedPriority, setSelectedPriority] = useState('all');
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isViewTicketOpen, setIsViewTicketOpen] = useState(false);
  const [ticketMessages, setTicketMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [newTicketStatus, setNewTicketStatus] = useState('');
  const [newTicketPriority, setNewTicketPriority] = useState('');
  
  const fetchTickets = async () => {
    setIsLoading(true);
    try {
      let query = supabase
        .from('tickets')
        .select(`
          *,
          clients (
            name,
            email
          )
        `)
        .order('updated_at', { ascending: false });
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      setTickets(data || []);
      
      // Log analytics
      await supabase.from('analytics').insert({
        type: 'admin_action',
        data: {
          admin_id: currentAdmin?.id,
          action: 'fetch_support_tickets',
          count: data?.length || 0
        },
        period: 'daily'
      });
      
    } catch (error) {
      console.error('Error fetching tickets:', error);
      toast.error('Failed to load tickets');
    } finally {
      setIsLoading(false);
    }
  };
  
  const fetchTicketMessages = async (ticketId: string) => {
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
    }
  };
  
  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedTicket) return;
    
    try {
      const { data, error } = await supabase
        .from('ticket_messages')
        .insert({
          ticket_id: selectedTicket.id,
          sender: `admin:${currentAdmin?.name}`,
          content: newMessage.trim()
        })
        .select()
        .single();
      
      if (error) throw error;
      
      // Update tickets last updated time
      await supabase
        .from('tickets')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', selectedTicket.id);
      
      setNewMessage('');
      fetchTicketMessages(selectedTicket.id);
      
      // Log analytics
      await supabase.from('analytics').insert({
        type: 'admin_action',
        data: {
          admin_id: currentAdmin?.id,
          action: 'support_reply',
          ticket_id: selectedTicket.id
        },
        period: 'daily'
      });
      
      toast.success('Message sent successfully');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    }
  };
  
  const updateTicketStatus = async () => {
    if (!selectedTicket || !newTicketStatus) return;
    
    try {
      const { data, error } = await supabase
        .from('tickets')
        .update({ 
          status: newTicketStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedTicket.id)
        .select()
        .single();
      
      if (error) throw error;
      
      // Add system message about status change
      await supabase
        .from('ticket_messages')
        .insert({
          ticket_id: selectedTicket.id,
          sender: 'system',
          content: `Ticket status changed to "${newTicketStatus}" by ${currentAdmin?.name}`
        });
      
      fetchTickets();
      fetchTicketMessages(selectedTicket.id);
      setSelectedTicket({ ...selectedTicket, status: newTicketStatus });
      
      // Log analytics
      await supabase.from('analytics').insert({
        type: 'admin_action',
        data: {
          admin_id: currentAdmin?.id,
          action: 'update_ticket_status',
          ticket_id: selectedTicket.id,
          new_status: newTicketStatus
        },
        period: 'daily'
      });
      
      toast.success(`Ticket status updated to ${newTicketStatus}`);
    } catch (error) {
      console.error('Error updating ticket status:', error);
      toast.error('Failed to update ticket status');
    }
  };
  
  const updateTicketPriority = async () => {
    if (!selectedTicket || !newTicketPriority) return;
    
    try {
      const { data, error } = await supabase
        .from('tickets')
        .update({ 
          priority: newTicketPriority,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedTicket.id)
        .select()
        .single();
      
      if (error) throw error;
      
      // Add system message about priority change
      await supabase
        .from('ticket_messages')
        .insert({
          ticket_id: selectedTicket.id,
          sender: 'system',
          content: `Ticket priority changed to "${newTicketPriority}" by ${currentAdmin?.name}`
        });
      
      fetchTickets();
      fetchTicketMessages(selectedTicket.id);
      setSelectedTicket({ ...selectedTicket, priority: newTicketPriority });
      
      // Log analytics
      await supabase.from('analytics').insert({
        type: 'admin_action',
        data: {
          admin_id: currentAdmin?.id,
          action: 'update_ticket_priority',
          ticket_id: selectedTicket.id,
          new_priority: newTicketPriority
        },
        period: 'daily'
      });
      
      toast.success(`Ticket priority updated to ${newTicketPriority}`);
    } catch (error) {
      console.error('Error updating ticket priority:', error);
      toast.error('Failed to update ticket priority');
    }
  };
  
  const assignTicket = async () => {
    if (!selectedTicket) return;
    
    try {
      const { data, error } = await supabase
        .from('tickets')
        .update({ 
          assigned_to: currentAdmin?.email,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedTicket.id)
        .select()
        .single();
      
      if (error) throw error;
      
      // Add system message about assignment
      await supabase
        .from('ticket_messages')
        .insert({
          ticket_id: selectedTicket.id,
          sender: 'system',
          content: `Ticket assigned to ${currentAdmin?.name}`
        });
      
      fetchTickets();
      fetchTicketMessages(selectedTicket.id);
      setSelectedTicket({ ...selectedTicket, assigned_to: currentAdmin?.email });
      
      // Log analytics
      await supabase.from('analytics').insert({
        type: 'admin_action',
        data: {
          admin_id: currentAdmin?.id,
          action: 'assign_ticket',
          ticket_id: selectedTicket.id
        },
        period: 'daily'
      });
      
      toast.success('Ticket assigned to you');
    } catch (error) {
      console.error('Error assigning ticket:', error);
      toast.error('Failed to assign ticket');
    }
  };
  
  useEffect(() => {
    fetchTickets();
    
    // Set up realtime subscription for ticket updates
    const channel = supabase
      .channel('public:tickets')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'tickets' 
      }, () => {
        fetchTickets(); // Refresh when tickets are updated
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentAdmin?.id]);
  
  useEffect(() => {
    if (selectedTicket) {
      fetchTicketMessages(selectedTicket.id);
      
      setNewTicketStatus(selectedTicket.status);
      setNewTicketPriority(selectedTicket.priority);
      
      // Set up realtime subscription for ticket messages
      const channel = supabase
        .channel(`ticket:${selectedTicket.id}`)
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
        supabase.removeChannel(channel);
      };
    }
  }, [selectedTicket?.id]);
  
  useEffect(() => {
    // Filter tickets based on search and filters
    const filtered = tickets.filter(ticket => {
      const matchesSearch = 
        ticket.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ticket.clients?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ticket.clients?.email?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = 
        selectedStatus === 'all' || 
        ticket.status === selectedStatus;
      
      const matchesPriority = 
        selectedPriority === 'all' || 
        ticket.priority === selectedPriority;
      
      return matchesSearch && matchesStatus && matchesPriority;
    });
    
    setFilteredTickets(filtered);
  }, [tickets, searchQuery, selectedStatus, selectedPriority]);
  
  const handleViewTicket = (ticket: any) => {
    setSelectedTicket(ticket);
    setIsViewTicketOpen(true);
  };
  
  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };
  
  const formatMessageDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      day: 'numeric',
      month: 'short'
    }).format(date);
  };
  
  const getInitials = (name: string) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase();
  };
  
  const getSenderName = (sender: string) => {
    if (sender.startsWith('admin:')) {
      return sender.replace('admin:', '');
    }
    if (sender === 'system') {
      return 'System';
    }
    if (selectedTicket?.clients?.name) {
      return selectedTicket.clients.name;
    }
    return 'User';
  };
  
  const isAdminMessage = (sender: string) => {
    return sender.startsWith('admin:');
  };
  
  const isSystemMessage = (sender: string) => {
    return sender === 'system';
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Support Dashboard</h1>
        <Button onClick={fetchTickets} disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Support Tickets</CardTitle>
          <CardDescription>
            Manage and respond to client support requests.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between gap-4">
              <TabsList>
                <TabsTrigger value="all">All Tickets</TabsTrigger>
                <TabsTrigger value="assigned">Assigned to Me</TabsTrigger>
                <TabsTrigger value="open">Open</TabsTrigger>
                <TabsTrigger value="pending">Pending</TabsTrigger>
                <TabsTrigger value="closed">Closed</TabsTrigger>
              </TabsList>
              
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search tickets..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 w-[250px]"
                  />
                </div>
                
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className="w-[130px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={selectedPriority} onValueChange={setSelectedPriority}>
                  <SelectTrigger className="w-[130px]">
                    <SelectValue placeholder="Priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priorities</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <TabsContent value="all">
              <div className="border rounded-md overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead>Client</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Updated</TableHead>
                      <TableHead>Assigned To</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-10">
                          <div className="flex justify-center">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : filteredTickets.length > 0 ? (
                      filteredTickets.map((ticket) => (
                        <TableRow key={ticket.id}>
                          <TableCell className="font-medium">{ticket.id.substring(0, 4)}...</TableCell>
                          <TableCell>{ticket.subject}</TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">{ticket.clients?.name || 'Unknown'}</p>
                              <p className="text-sm text-muted-foreground">{ticket.clients?.email || 'No email'}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant="outline"
                              className={statusColors[ticket.status] || 'bg-gray-100 text-gray-800'}
                            >
                              {ticket.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant="outline"
                              className={priorityColors[ticket.priority] || 'bg-gray-100 text-gray-800'}
                            >
                              {ticket.priority}
                            </Badge>
                          </TableCell>
                          <TableCell>{formatDate(ticket.updated_at)}</TableCell>
                          <TableCell>
                            {ticket.assigned_to || (
                              <span className="text-muted-foreground">Unassigned</span>
                            )}
                          </TableCell>
                          <TableCell>
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
                                  <MessageCircle className="h-4 w-4 mr-2" />
                                  View & Respond
                                </DropdownMenuItem>
                                {!ticket.assigned_to && (
                                  <DropdownMenuItem onClick={() => {
                                    setSelectedTicket(ticket);
                                    assignTicket();
                                  }}>
                                    <ClipboardList className="h-4 w-4 mr-2" />
                                    Assign to Me
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-4">
                          <p className="text-muted-foreground">No tickets found matching your criteria</p>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
            
            <TabsContent value="assigned">
              <div className="border rounded-md overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead>Client</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Updated</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTickets.filter(t => t.assigned_to === currentAdmin?.email).length > 0 ? (
                      filteredTickets
                        .filter(t => t.assigned_to === currentAdmin?.email)
                        .map((ticket) => (
                          <TableRow key={ticket.id}>
                            <TableCell className="font-medium">{ticket.id.substring(0, 4)}...</TableCell>
                            <TableCell>{ticket.subject}</TableCell>
                            <TableCell>
                              <div>
                                <p className="font-medium">{ticket.clients?.name || 'Unknown'}</p>
                                <p className="text-sm text-muted-foreground">{ticket.clients?.email || 'No email'}</p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge 
                                variant="outline"
                                className={statusColors[ticket.status] || 'bg-gray-100 text-gray-800'}
                              >
                                {ticket.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge 
                                variant="outline"
                                className={priorityColors[ticket.priority] || 'bg-gray-100 text-gray-800'}
                              >
                                {ticket.priority}
                              </Badge>
                            </TableCell>
                            <TableCell>{formatDate(ticket.updated_at)}</TableCell>
                            <TableCell>
                              <Button variant="outline" size="sm" onClick={() => handleViewTicket(ticket)}>
                                <MessageCircle className="h-4 w-4 mr-2" />
                                View & Respond
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-4">
                          <p className="text-muted-foreground">No tickets assigned to you</p>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
            
            <TabsContent value="open">
              <div className="border rounded-md overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead>Client</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTickets.filter(t => t.status === 'open').length > 0 ? (
                      filteredTickets
                        .filter(t => t.status === 'open')
                        .map((ticket) => (
                          <TableRow key={ticket.id}>
                            <TableCell className="font-medium">{ticket.id.substring(0, 4)}...</TableCell>
                            <TableCell>{ticket.subject}</TableCell>
                            <TableCell>
                              <div>
                                <p className="font-medium">{ticket.clients?.name || 'Unknown'}</p>
                                <p className="text-sm text-muted-foreground">{ticket.clients?.email || 'No email'}</p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge 
                                variant="outline"
                                className={priorityColors[ticket.priority] || 'bg-gray-100 text-gray-800'}
                              >
                                {ticket.priority}
                              </Badge>
                            </TableCell>
                            <TableCell>{formatDate(ticket.created_at)}</TableCell>
                            <TableCell>
                              <Button variant="outline" size="sm" onClick={() => handleViewTicket(ticket)}>
                                <MessageCircle className="h-4 w-4 mr-2" />
                                View & Respond
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-4">
                          <p className="text-muted-foreground">No open tickets found</p>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
            
            <TabsContent value="pending">
              <div className="border rounded-md overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead>Client</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Updated</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTickets.filter(t => t.status === 'pending').length > 0 ? (
                      filteredTickets
                        .filter(t => t.status === 'pending')
                        .map((ticket) => (
                          <TableRow key={ticket.id}>
                            <TableCell className="font-medium">{ticket.id.substring(0, 4)}...</TableCell>
                            <TableCell>{ticket.subject}</TableCell>
                            <TableCell>
                              <div>
                                <p className="font-medium">{ticket.clients?.name || 'Unknown'}</p>
                                <p className="text-sm text-muted-foreground">{ticket.clients?.email || 'No email'}</p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge 
                                variant="outline"
                                className={priorityColors[ticket.priority] || 'bg-gray-100 text-gray-800'}
                              >
                                {ticket.priority}
                              </Badge>
                            </TableCell>
                            <TableCell>{formatDate(ticket.updated_at)}</TableCell>
                            <TableCell>
                              <Button variant="outline" size="sm" onClick={() => handleViewTicket(ticket)}>
                                <MessageCircle className="h-4 w-4 mr-2" />
                                View & Respond
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-4">
                          <p className="text-muted-foreground">No pending tickets found</p>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
            
            <TabsContent value="closed">
              <div className="border rounded-md overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead>Client</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Closed At</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTickets.filter(t => t.status === 'closed').length > 0 ? (
                      filteredTickets
                        .filter(t => t.status === 'closed')
                        .map((ticket) => (
                          <TableRow key={ticket.id}>
                            <TableCell className="font-medium">{ticket.id.substring(0, 4)}...</TableCell>
                            <TableCell>{ticket.subject}</TableCell>
                            <TableCell>
                              <div>
                                <p className="font-medium">{ticket.clients?.name || 'Unknown'}</p>
                                <p className="text-sm text-muted-foreground">{ticket.clients?.email || 'No email'}</p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge 
                                variant="outline"
                                className={priorityColors[ticket.priority] || 'bg-gray-100 text-gray-800'}
                              >
                                {ticket.priority}
                              </Badge>
                            </TableCell>
                            <TableCell>{formatDate(ticket.updated_at)}</TableCell>
                            <TableCell>
                              <Button variant="outline" size="sm" onClick={() => handleViewTicket(ticket)}>
                                <MessageCircle className="h-4 w-4 mr-2" />
                                View History
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-4">
                          <p className="text-muted-foreground">No closed tickets found</p>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      {/* View & Respond to Ticket Dialog */}
      <Dialog open={isViewTicketOpen} onOpenChange={setIsViewTicketOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Ticket: {selectedTicket?.subject}</DialogTitle>
            <DialogDescription>
              ID: {selectedTicket?.id}
            </DialogDescription>
          </DialogHeader>
          
          {selectedTicket && (
            <div className="flex-1 overflow-hidden flex flex-col">
              {/* Ticket Info */}
              <div className="grid grid-cols-2 gap-4 py-2">
                <div>
                  <p className="text-sm text-muted-foreground">Client</p>
                  <p className="font-medium">{selectedTicket.clients?.name || 'Unknown'}</p>
                  <p className="text-sm text-muted-foreground">{selectedTicket.clients?.email || 'No email'}</p>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <Select value={newTicketStatus} onValueChange={setNewTicketStatus}>
                      <SelectTrigger className="w-[120px] h-8">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="open">Open</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="closed">Closed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Priority</p>
                    <Select value={newTicketPriority} onValueChange={setNewTicketPriority}>
                      <SelectTrigger className="w-[120px] h-8">
                        <SelectValue placeholder="Priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-x-2 self-end">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={updateTicketStatus} 
                      disabled={newTicketStatus === selectedTicket.status}
                    >
                      Update Status
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={updateTicketPriority}
                      disabled={newTicketPriority === selectedTicket.priority}
                    >
                      Update Priority
                    </Button>
                  </div>
                </div>
              </div>
              
              {/* Messages */}
              <div className="flex-1 overflow-y-auto border rounded-md mt-4 p-4 space-y-4 min-h-[300px] max-h-[400px]">
                {ticketMessages.length === 0 ? (
                  <div className="flex justify-center items-center h-full">
                    <p className="text-muted-foreground">No messages yet</p>
                  </div>
                ) : (
                  ticketMessages.map((message, index) => (
                    <div 
                      key={index}
                      className={`flex gap-3 ${isAdminMessage(message.sender) ? 'flex-row-reverse' : ''}`}
                    >
                      {isSystemMessage(message.sender) ? (
                        <div className="bg-muted w-full text-center py-2 rounded-md text-sm text-muted-foreground">
                          {message.content}
                        </div>
                      ) : (
                        <>
                          <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                            isAdminMessage(message.sender) 
                              ? 'bg-primary text-primary-foreground' 
                              : 'bg-muted text-muted-foreground'
                          }`}>
                            {getInitials(getSenderName(message.sender))}
                          </div>
                          <div className={`max-w-[75%] ${isAdminMessage(message.sender) ? 'text-right' : ''}`}>
                            <div className="flex items-center gap-2">
                              <p className={`font-semibold ${isAdminMessage(message.sender) ? 'ml-auto' : ''}`}>
                                {getSenderName(message.sender)}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {formatMessageDate(message.timestamp)}
                              </p>
                            </div>
                            <div className={`mt-1 p-3 rounded-lg ${
                              isAdminMessage(message.sender)
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted'
                            }`}>
                              {message.content}
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  ))
                )}
              </div>
              
              {/* Reply Form */}
              {selectedTicket.status !== 'closed' && (
                <div className="mt-4">
                  <Textarea
                    placeholder="Type your response here..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="min-h-[100px]"
                  />
                  <div className="flex justify-between mt-2">
                    <div>
                      {!selectedTicket.assigned_to && (
                        <Button variant="outline" onClick={assignTicket}>
                          Assign to Me
                        </Button>
                      )}
                    </div>
                    <Button onClick={sendMessage} disabled={!newMessage.trim()}>
                      Send Response
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SupportDashboard;
