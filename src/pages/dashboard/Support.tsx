
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Loader2, MessageSquare, PlusCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { SupportTicket } from '@/lib/types';

// Status colors for the badges
const statusColors: Record<string, string> = {
  'open': 'bg-yellow-500',
  'in-progress': 'bg-blue-500',
  'resolved': 'bg-green-500',
  'closed': 'bg-gray-500'
};

// Priority colors
const priorityColors: Record<string, string> = {
  'low': 'bg-gray-400',
  'medium': 'bg-yellow-500',
  'high': 'bg-red-500'
};

const Support: React.FC = () => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('new-ticket');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Form state for new ticket
  const [ticketForm, setTicketForm] = useState({
    subject: '',
    message: '',
    priority: 'medium',
    serviceRelated: '',
  });
  
  useEffect(() => {
    if (currentUser) {
      fetchTickets();
    }
  }, [currentUser]);

  const fetchTickets = async () => {
    if (!currentUser) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('tickets')
        .select('*')
        .eq('client_id', currentUser.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Transform data to match our SupportTicket type
      const formattedTickets = data.map(ticket => ({
        id: ticket.id,
        subject: ticket.subject,
        status: ticket.status,
        priority: ticket.priority,
        createdAt: ticket.created_at,
        lastUpdated: ticket.updated_at,
      }));
      
      setTickets(formattedTickets);
    } catch (error) {
      console.error('Error fetching tickets:', error);
      toast.error('Failed to load support tickets');
    } finally {
      setIsLoading(false);
    }
  };
  
  if (!currentUser) return null;
  
  const handleTicketChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setTicketForm(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSelectChange = (name: string, value: string) => {
    setTicketForm(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmitTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!ticketForm.subject || !ticketForm.message) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Create ticket in database
      const { data, error } = await supabase
        .from('tickets')
        .insert({
          subject: ticketForm.subject,
          client_id: currentUser.id,
          priority: ticketForm.priority,
          status: 'open',
          category: ticketForm.serviceRelated || null
        })
        .select()
        .single();
      
      if (error) throw error;
      
      // Add initial message
      const { error: messageError } = await supabase
        .from('ticket_messages')
        .insert({
          ticket_id: data.id,
          content: ticketForm.message,
          sender: 'client'
        });
      
      if (messageError) throw messageError;
      
      // Add new ticket to state
      const newTicket: SupportTicket = {
        id: data.id,
        subject: data.subject,
        status: data.status,
        priority: data.priority,
        createdAt: data.created_at,
        lastUpdated: data.updated_at
      };
      
      setTickets([newTicket, ...tickets]);
      
      // Reset form
      setTicketForm({
        subject: '',
        message: '',
        priority: 'medium',
        serviceRelated: '',
      });
      
      toast.success('Support ticket created successfully!');
      
      // Switch to tickets tab
      setActiveTab('tickets');
    } catch (error) {
      console.error('Failed to create support ticket:', error);
      toast.error('Failed to create support ticket');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };
  
  return (
    <div className="animate-fade-in">
      <DashboardHeader pageTitle="Support" />
      
      <div className="p-6">
        <Tabs defaultValue="new-ticket" value={activeTab} onValueChange={setActiveTab}>
          <div className="flex justify-between items-center mb-6">
            <TabsList>
              <TabsTrigger value="new-ticket">
                <PlusCircle className="h-4 w-4 mr-2" />
                New Ticket
              </TabsTrigger>
              <TabsTrigger value="tickets">
                <MessageSquare className="h-4 w-4 mr-2" />
                My Tickets
              </TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="new-ticket">
            <Card>
              <form onSubmit={handleSubmitTicket}>
                <CardHeader>
                  <CardTitle>Create Support Ticket</CardTitle>
                  <CardDescription>
                    Submit a new ticket and our support team will get back to you
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject</Label>
                    <Input
                      id="subject"
                      name="subject"
                      placeholder="Brief description of your issue"
                      value={ticketForm.subject}
                      onChange={handleTicketChange}
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="priority">Priority</Label>
                      <Select
                        value={ticketForm.priority}
                        onValueChange={(value) => handleSelectChange('priority', value)}
                      >
                        <SelectTrigger id="priority">
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="serviceRelated">Related Service</Label>
                      <Select
                        value={ticketForm.serviceRelated}
                        onValueChange={(value) => handleSelectChange('serviceRelated', value)}
                      >
                        <SelectTrigger id="serviceRelated">
                          <SelectValue placeholder="Select service" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="general">General Inquiry</SelectItem>
                          {currentUser.selectedServices.map((service, index) => (
                            <SelectItem key={index} value={service}>
                              {service}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="message">Message</Label>
                    <Textarea
                      id="message"
                      name="message"
                      placeholder="Provide details about your issue or question"
                      rows={6}
                      value={ticketForm.message}
                      onChange={handleTicketChange}
                      required
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" disabled={isSubmitting}>
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
              </form>
            </Card>
          </TabsContent>
          
          <TabsContent value="tickets">
            <Card>
              <CardHeader>
                <CardTitle>My Support Tickets</CardTitle>
                <CardDescription>
                  Track the status of your support requests
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : tickets.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Ticket ID</TableHead>
                        <TableHead>Subject</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Priority</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead>Last Updated</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {tickets.map(ticket => (
                        <TableRow key={ticket.id} className="cursor-pointer hover:bg-secondary">
                          <TableCell className="font-medium">{ticket.id.slice(0, 8)}</TableCell>
                          <TableCell>{ticket.subject}</TableCell>
                          <TableCell>
                            <Badge className={statusColors[ticket.status]}>
                              {ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1).replace('-', ' ')}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={priorityColors[ticket.priority]}>
                              {ticket.priority.charAt(0).toUpperCase() + ticket.priority.slice(1)}
                            </Badge>
                          </TableCell>
                          <TableCell>{formatDate(ticket.createdAt)}</TableCell>
                          <TableCell>{formatDate(ticket.lastUpdated)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">You don't have any support tickets yet.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Support;
