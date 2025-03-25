
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { 
  MessageSquare, 
  Clock, 
  ThumbsUp, 
  AlertCircle, 
  Search, 
  CheckCircle, 
  XCircle, 
  Clock as ClockIcon, 
  Users, 
  Filter, 
  Download, 
  UserCheck, 
  Loader2, 
  ArrowUpRight, 
  ArrowDownRight,
  Eye
} from 'lucide-react';
import { toast } from 'sonner';

// Sample ticket data
const ticketData = [
  { 
    id: 'TICKET-1234', 
    subject: 'Login issues with dashboard', 
    client: {
      name: 'John Smith',
      email: 'john@example.com',
      avatar: 'https://ui-avatars.com/api/?name=John+Smith'
    },
    status: 'open', 
    priority: 'high', 
    createdAt: '2023-11-24T09:30:00Z', 
    updatedAt: '2023-11-24T14:30:00Z',
    category: 'Technical',
    assignedTo: 'Support Team'
  },
  { 
    id: 'TICKET-1235', 
    subject: 'Billing discrepancy on monthly invoice', 
    client: {
      name: 'Sarah Johnson',
      email: 'sarah@example.com',
      avatar: 'https://ui-avatars.com/api/?name=Sarah+Johnson'
    },
    status: 'in-progress', 
    priority: 'medium', 
    createdAt: '2023-11-23T12:15:00Z', 
    updatedAt: '2023-11-24T11:20:00Z',
    category: 'Billing',
    assignedTo: 'Finance Team'
  },
  { 
    id: 'TICKET-1236', 
    subject: 'Request for additional SEO services', 
    client: {
      name: 'Michael Chen',
      email: 'michael@example.com',
      avatar: 'https://ui-avatars.com/api/?name=Michael+Chen'
    },
    status: 'waiting', 
    priority: 'low', 
    createdAt: '2023-11-22T15:45:00Z', 
    updatedAt: '2023-11-23T10:30:00Z',
    category: 'Sales',
    assignedTo: 'Sales Team'
  },
  { 
    id: 'TICKET-1237', 
    subject: 'Website displaying incorrectly on mobile', 
    client: {
      name: 'Emily Davis',
      email: 'emily@example.com',
      avatar: 'https://ui-avatars.com/api/?name=Emily+Davis'
    },
    status: 'open', 
    priority: 'high', 
    createdAt: '2023-11-21T08:20:00Z', 
    updatedAt: '2023-11-22T09:15:00Z',
    category: 'Technical',
    assignedTo: 'Dev Team'
  },
  { 
    id: 'TICKET-1238', 
    subject: 'Social media campaign not started on time', 
    client: {
      name: 'David Wilson',
      email: 'david@example.com',
      avatar: 'https://ui-avatars.com/api/?name=David+Wilson'
    },
    status: 'closed', 
    priority: 'medium', 
    createdAt: '2023-11-20T14:10:00Z', 
    updatedAt: '2023-11-21T16:45:00Z',
    category: 'Marketing',
    assignedTo: 'Marketing Team'
  },
];

// Sample performance data
const performanceData = [
  { day: 'Mon', resolved: 12, new: 8 },
  { day: 'Tue', resolved: 15, new: 10 },
  { day: 'Wed', resolved: 18, new: 12 },
  { day: 'Thu', resolved: 14, new: 9 },
  { day: 'Fri', resolved: 20, new: 15 },
  { day: 'Sat', resolved: 8, new: 6 },
  { day: 'Sun', resolved: 5, new: 4 },
];

// Sample response time data
const responseTimeData = [
  { month: 'Jan', time: 4.2 },
  { month: 'Feb', time: 3.8 },
  { month: 'Mar', time: 3.5 },
  { month: 'Apr', time: 3.2 },
  { month: 'May', time: 2.9 },
  { month: 'Jun', time: 2.5 },
];

const SupportDashboard: React.FC = () => {
  const [tickets, setTickets] = useState(ticketData);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setStatusPriority] = useState('all');
  
  // Filter tickets based on search and filters
  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = ticket.subject.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         ticket.client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         ticket.id.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || ticket.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });
  
  const handleImpersonateClient = () => {
    toast.info('Impersonation mode would connect to Supabase to grant temporary access');
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };
  
  const getStatusBadgeVariant = (status: string) => {
    switch(status) {
      case 'open': return 'destructive';
      case 'in-progress': return 'default';
      case 'waiting': return 'warning';
      case 'closed': return 'outline';
      default: return 'secondary';
    }
  };
  
  const getStatusBadgeIcon = (status: string) => {
    switch(status) {
      case 'open': return <AlertCircle className="h-3 w-3 mr-1" />;
      case 'in-progress': return <Loader2 className="h-3 w-3 mr-1" />;
      case 'waiting': return <Clock className="h-3 w-3 mr-1" />;
      case 'closed': return <CheckCircle className="h-3 w-3 mr-1" />;
      default: return null;
    }
  };
  
  const getPriorityBadgeVariant = (priority: string) => {
    switch(priority) {
      case 'high': return 'destructive';
      case 'medium': return 'warning';
      case 'low': return 'secondary';
      default: return 'outline';
    }
  };
  
  const exportReport = () => {
    toast.info('Exporting support report...');
    // In a real app, this would connect to Supabase to generate and download a report
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Support Dashboard</h1>
          <p className="text-muted-foreground">
            Ticket management and customer support metrics
          </p>
        </div>
        
        <Button onClick={exportReport} variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Export Report
        </Button>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Tickets</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">23</div>
            <div className="flex items-center pt-1">
              <ArrowUpRight className="mr-1 h-4 w-4 text-destructive" />
              <span className="text-xs text-destructive font-medium">+5</span>
              <span className="text-xs text-muted-foreground ml-1">from yesterday</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resolved Today</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">18</div>
            <div className="flex items-center pt-1">
              <ArrowUpRight className="mr-1 h-4 w-4 text-green-500" />
              <span className="text-xs text-green-500 font-medium">+3</span>
              <span className="text-xs text-muted-foreground ml-1">from yesterday</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Response Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2.5 hrs</div>
            <div className="flex items-center pt-1">
              <ArrowDownRight className="mr-1 h-4 w-4 text-green-500" />
              <span className="text-xs text-green-500 font-medium">-0.3 hrs</span>
              <span className="text-xs text-muted-foreground ml-1">from last week</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Satisfaction Rate</CardTitle>
            <ThumbsUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">94%</div>
            <div className="flex items-center pt-1">
              <ArrowUpRight className="mr-1 h-4 w-4 text-green-500" />
              <span className="text-xs text-green-500 font-medium">+2%</span>
              <span className="text-xs text-muted-foreground ml-1">from last month</span>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid gap-4 md:grid-cols-7">
        <Card className="md:col-span-4">
          <CardHeader>
            <CardTitle>Ticket Resolution vs. New Tickets</CardTitle>
            <CardDescription>Daily ticket activity for the past week</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="resolved" fill="#4CAF50" name="Resolved Tickets" />
                <Bar dataKey="new" fill="#2196F3" name="New Tickets" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        
        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle>Average Response Time</CardTitle>
            <CardDescription>Monthly trend (in hours)</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={responseTimeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="time" stroke="#FF9800" name="Response Time (hrs)" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
            <div>
              <CardTitle>Support Tickets</CardTitle>
              <CardDescription>Manage and respond to client support requests</CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                  type="search" 
                  placeholder="Search tickets..." 
                  className="pl-8 w-full" 
                  value={searchQuery} 
                  onChange={(e) => setSearchQuery(e.target.value)} 
                />
              </div>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="waiting">Waiting</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={priorityFilter} onValueChange={setStatusPriority}>
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
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ticket ID</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTickets.map(ticket => (
                <TableRow key={ticket.id}>
                  <TableCell className="font-medium">{ticket.id}</TableCell>
                  <TableCell>{ticket.subject}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={ticket.client.avatar} alt={ticket.client.name} />
                        <AvatarFallback>{ticket.client.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <span>{ticket.client.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(ticket.status)} className="flex items-center w-fit">
                      {getStatusBadgeIcon(ticket.status)}
                      {ticket.status === 'in-progress' ? 'In Progress' : ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getPriorityBadgeVariant(ticket.priority)}>
                      {ticket.priority.charAt(0).toUpperCase() + ticket.priority.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatDate(ticket.createdAt)}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Reply
                      </Button>
                      <Button variant="outline" size="icon" title="Impersonate Client" onClick={handleImpersonateClient}>
                        <UserCheck className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="icon" title="View Details">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter className="flex justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {filteredTickets.length} of {tickets.length} tickets
          </div>
          <div className="flex gap-1">
            <Button variant="outline" size="sm" disabled>Previous</Button>
            <Button variant="outline" size="sm" disabled>Next</Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default SupportDashboard;
