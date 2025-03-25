import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  MessageSquare, 
  Send, 
  Users, 
  Bell, 
  Search, 
  PlusCircle, 
  ChevronLeft, 
  ChevronRight, 
  Filter, 
  FileText, 
  Paperclip, 
  MoveLeft, 
  FileImage
} from 'lucide-react';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { toast } from 'sonner';

// Sample message data
const messageData = [
  { 
    id: '1', 
    client: { id: '101', name: 'John Smith', email: 'john@example.com', avatar: 'https://ui-avatars.com/api/?name=John+Smith' }, 
    subject: 'Question about SEO package',
    preview: 'I was wondering if the SEO package includes monthly reports and analytics?',
    date: '2023-11-24T14:30:00Z',
    unread: true,
    messages: [
      { 
        id: 'm1', 
        sender: 'client', 
        content: 'I was wondering if the SEO package includes monthly reports and analytics?', 
        timestamp: '2023-11-24T14:30:00Z' 
      }
    ]
  },
  { 
    id: '2', 
    client: { id: '102', name: 'Sarah Johnson', email: 'sarah@example.com', avatar: 'https://ui-avatars.com/api/?name=Sarah+Johnson' }, 
    subject: 'Website redesign proposal',
    preview: 'Thank you for the proposal. I have a few questions about the timeline.',
    date: '2023-11-23T10:15:00Z',
    unread: false,
    messages: [
      { 
        id: 'm1', 
        sender: 'client', 
        content: 'Hi there, I received your website redesign proposal. It looks great!', 
        timestamp: '2023-11-23T09:15:00Z' 
      },
      { 
        id: 'm2', 
        sender: 'admin', 
        content: 'Thank you for your interest! Let me know if you have any questions.', 
        timestamp: '2023-11-23T09:45:00Z' 
      },
      { 
        id: 'm3', 
        sender: 'client', 
        content: 'Thank you for the proposal. I have a few questions about the timeline.', 
        timestamp: '2023-11-23T10:15:00Z' 
      }
    ]
  },
  { 
    id: '3', 
    client: { id: '103', name: 'Michael Chen', email: 'michael@example.com', avatar: 'https://ui-avatars.com/api/?name=Michael+Chen' }, 
    subject: 'Social media campaign results',
    preview: 'The results from our last campaign look promising. Can we schedule a call?',
    date: '2023-11-22T16:45:00Z',
    unread: false,
    messages: [
      { 
        id: 'm1', 
        sender: 'client', 
        content: 'The results from our last campaign look promising. Can we schedule a call?', 
        timestamp: '2023-11-22T16:45:00Z' 
      }
    ]
  },
  { 
    id: '4', 
    client: { id: '104', name: 'Emily Davis', email: 'emily@example.com', avatar: 'https://ui-avatars.com/api/?name=Emily+Davis' }, 
    subject: 'Billing question',
    preview: 'I noticed an extra charge on my last invoice. Can you please explain?',
    date: '2023-11-21T11:20:00Z',
    unread: false,
    messages: [
      { 
        id: 'm1', 
        sender: 'client', 
        content: 'I noticed an extra charge on my last invoice. Can you please explain?', 
        timestamp: '2023-11-21T11:20:00Z' 
      }
    ]
  },
  { 
    id: '5', 
    client: { id: '105', name: 'David Wilson', email: 'david@example.com', avatar: 'https://ui-avatars.com/api/?name=David+Wilson' }, 
    subject: 'Content creation schedule',
    preview: "I'd like to discuss our content calendar for the next quarter.",
    date: '2023-11-20T09:10:00Z',
    unread: true,
    messages: [
      { 
        id: 'm1', 
        sender: 'client', 
        content: "I'd like to discuss our content calendar for the next quarter.", 
        timestamp: '2023-11-20T09:10:00Z' 
      }
    ]
  },
];

// Template data
const templateData = [
  { id: '1', name: 'Welcome Message', subject: 'Welcome to Savannah Prime', content: 'Dear [Client Name],\n\nWelcome to Savannah Prime! We are excited to have you on board. Here are some next steps to get started with our services...' },
  { id: '2', name: 'Payment Confirmation', subject: 'Payment Received - Thank You', content: 'Dear [Client Name],\n\nThank you for your recent payment of $[Amount]. This email confirms that we have received your payment for [Service Name]...' },
  { id: '3', name: 'Monthly Report', subject: 'Your Monthly Performance Report', content: 'Dear [Client Name],\n\nPlease find attached your monthly performance report for [Month]. Here\'s a summary of the key highlights...' },
  { id: '4', name: 'Service Update', subject: 'Important Update to Your Services', content: 'Dear [Client Name],\n\nWe are writing to inform you about an important update to your [Service Name]. Effective [Date], the following changes will take place...' },
  { id: '5', name: 'Support Request Follow-up', subject: 'Follow-up on Your Recent Support Request', content: 'Dear [Client Name],\n\nThank you for contacting our support team regarding [Issue]. We wanted to follow up and ensure that everything has been resolved to your satisfaction...' },
];

// Announcement data
const announcementData = [
  { id: '1', title: 'Holiday Schedule', content: 'Our offices will be closed from December 24th to January 2nd for the holiday season. Support will be available via email only during this time.', audience: 'all', status: 'scheduled', date: '2023-12-01' },
  { id: '2', title: 'New Service Launch', content: 'We are excited to announce the launch of our new Advanced Analytics package, available starting January 15th.', audience: 'premium', status: 'sent', date: '2023-11-15' },
  { id: '3', title: 'System Maintenance', content: 'We will be performing scheduled maintenance on our systems on Saturday, November 25th from 2 AM to 6 AM EST. You may experience brief service interruptions during this period.', audience: 'all', status: 'sent', date: '2023-11-20' },
];

const Communications: React.FC = () => {
  const { currentAdmin } = useAdminAuth();
  const [messages, setMessages] = useState(messageData);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMessage, setSelectedMessage] = useState<any>(null);
  const [replyText, setReplyText] = useState('');
  const [templates, setTemplates] = useState(templateData);
  const [announcements, setAnnouncements] = useState(announcementData);
  
  // Filter messages based on search
  const filteredMessages = messages.filter(message => {
    const searchLower = searchQuery.toLowerCase();
    return message.client.name.toLowerCase().includes(searchLower) || 
           message.subject.toLowerCase().includes(searchLower) || 
           message.preview.toLowerCase().includes(searchLower);
  });
  
  const handleSelectMessage = (message: any) => {
    // If the message was unread, mark it as read
    if (message.unread) {
      const updatedMessages = messages.map(m => 
        m.id === message.id ? { ...m, unread: false } : m
      );
      setMessages(updatedMessages);
    }
    
    setSelectedMessage(message);
  };
  
  const handleSendReply = () => {
    if (!replyText.trim() || !selectedMessage) return;
    
    // Add reply to the message
    const newReply = {
      id: `m${selectedMessage.messages.length + 1}`,
      sender: 'admin',
      content: replyText,
      timestamp: new Date().toISOString()
    };
    
    const updatedMessages = messages.map(m => 
      m.id === selectedMessage.id 
        ? { 
            ...m, 
            messages: [...m.messages, newReply],
            preview: replyText
          } 
        : m
    );
    
    setMessages(updatedMessages);
    setSelectedMessage({
      ...selectedMessage,
      messages: [...selectedMessage.messages, newReply]
    });
    setReplyText('');
    toast.success('Reply sent successfully');
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };
  
  const createTemplate = () => {
    toast.info('This would open a form to create a new message template');
  };
  
  const createAnnouncement = () => {
    toast.info('This would open a form to create a new announcement');
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Communication Center</h1>
          <p className="text-muted-foreground">
            Manage all client communications and announcements
          </p>
        </div>
      </div>
      
      <Tabs defaultValue="messages">
        <TabsList>
          <TabsTrigger value="messages" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            <span>Client Messages</span>
          </TabsTrigger>
          <TabsTrigger value="templates" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span>Message Templates</span>
          </TabsTrigger>
          <TabsTrigger value="announcements" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            <span>Announcements</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="messages">
          <div className="border rounded-md h-[calc(100vh-250px)] flex">
            {/* Messages list */}
            <div className="w-1/3 border-r flex flex-col">
              <div className="p-3 border-b">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input 
                    type="search" 
                    placeholder="Search messages..." 
                    className="pl-8" 
                    value={searchQuery} 
                    onChange={(e) => setSearchQuery(e.target.value)} 
                  />
                </div>
              </div>
              
              <div className="flex-1 overflow-auto">
                {filteredMessages.map((message) => (
                  <div 
                    key={message.id} 
                    className={`border-b p-3 cursor-pointer hover:bg-accent/50 ${selectedMessage?.id === message.id ? 'bg-accent' : ''} ${message.unread ? 'font-medium' : ''}`}
                    onClick={() => handleSelectMessage(message)}
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={message.client.avatar} alt={message.client.name} />
                        <AvatarFallback>{message.client.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center">
                          <span className="truncate">{message.client.name}</span>
                          <span className="text-xs text-muted-foreground">{formatDate(message.date)}</span>
                        </div>
                        <div className="font-medium text-sm truncate">{message.subject}</div>
                        <div className="text-xs text-muted-foreground truncate">{message.preview}</div>
                      </div>
                      {message.unread && (
                        <div className="h-2 w-2 rounded-full bg-primary"></div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Message content */}
            <div className="flex-1 flex flex-col">
              {selectedMessage ? (
                <>
                  <div className="p-4 border-b">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mb-3" 
                      onClick={() => setSelectedMessage(null)}
                    >
                      <MoveLeft className="h-4 w-4 mr-2" />
                      Back to Messages
                    </Button>
                    <h2 className="text-xl font-semibold">{selectedMessage.subject}</h2>
                    <div className="flex items-center gap-2 mt-1">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={selectedMessage.client.avatar} alt={selectedMessage.client.name} />
                        <AvatarFallback>{selectedMessage.client.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <span className="text-sm">{selectedMessage.client.name}</span>
                      <span className="text-xs text-muted-foreground">({selectedMessage.client.email})</span>
                    </div>
                  </div>
                  
                  <div className="flex-1 overflow-auto p-4 space-y-4">
                    {selectedMessage.messages.map((msg: any) => (
                      <div 
                        key={msg.id} 
                        className={`p-3 rounded-lg max-w-[80%] ${msg.sender === 'client' ? 'bg-muted ml-0 mr-auto' : 'bg-primary text-primary-foreground ml-auto mr-0'}`}
                      >
                        <div className="text-sm whitespace-pre-line">{msg.content}</div>
                        <div className={`text-xs mt-1 ${msg.sender === 'client' ? 'text-muted-foreground' : 'text-primary-foreground/80'}`}>
                          {formatDate(msg.timestamp)}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="p-3 border-t">
                    <div className="flex flex-col gap-3">
                      <Textarea 
                        placeholder="Type your reply..." 
                        className="min-h-24" 
                        value={replyText} 
                        onChange={(e) => setReplyText(e.target.value)}
                      />
                      <div className="flex justify-between">
                        <Button variant="outline" size="icon">
                          <Paperclip className="h-4 w-4" />
                        </Button>
                        <Button onClick={handleSendReply} disabled={!replyText.trim()}>
                          <Send className="h-4 w-4 mr-2" />
                          Send Reply
                        </Button>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  <div className="text-center">
                    <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-20" />
                    <h3 className="text-lg font-medium">No message selected</h3>
                    <p>Select a message from the list to view it</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="templates">
          <div className="flex justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold">Message Templates</h2>
              <p className="text-muted-foreground">Manage and create reusable message templates</p>
            </div>
            <Button onClick={createTemplate}>
              <PlusCircle className="h-4 w-4 mr-2" />
              Create Template
            </Button>
          </div>
          
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Template Name</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Preview</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {templates.map((template) => (
                    <TableRow key={template.id}>
                      <TableCell className="font-medium">{template.name}</TableCell>
                      <TableCell>{template.subject}</TableCell>
                      <TableCell className="truncate max-w-[300px]">{template.content.substring(0, 50)}...</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="sm">Edit</Button>
                          <Button variant="outline" size="sm">Use</Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="announcements">
          <div className="flex justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold">Announcements</h2>
              <p className="text-muted-foreground">Create and manage broadcast announcements to clients</p>
            </div>
            <Button onClick={createAnnouncement}>
              <PlusCircle className="h-4 w-4 mr-2" />
              Create Announcement
            </Button>
          </div>
          
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Content</TableHead>
                    <TableHead>Audience</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {announcements.map((announcement) => (
                    <TableRow key={announcement.id}>
                      <TableCell className="font-medium">{announcement.title}</TableCell>
                      <TableCell className="truncate max-w-[300px]">{announcement.content}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {announcement.audience === 'all' ? 'All Clients' : 'Premium Clients'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={announcement.status === 'sent' ? 'default' : 'secondary'}>
                          {announcement.status === 'sent' ? 'Sent' : 'Scheduled'}
                        </Badge>
                      </TableCell>
                      <TableCell>{announcement.date}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="sm">Edit</Button>
                          <Button variant="outline" size="sm" disabled={announcement.status === 'sent'}>
                            {announcement.status === 'sent' ? 'Sent' : 'Send Now'}
                          </Button>
                        </div>
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
  );
};

export default Communications;
