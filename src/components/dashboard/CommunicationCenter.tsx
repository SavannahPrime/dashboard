
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, Loader2, MessageSquare, Send } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface Message {
  id: string;
  content: string;
  sender: string;
  timestamp: string;
  is_public: boolean;
  sender_id?: string;
}

interface Communication {
  id: string;
  subject: string;
  preview: string;
  client_id: string;
  date: string;
  unread: boolean;
}

const CommunicationCenter: React.FC = () => {
  const { currentUser } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [communications, setCommunications] = useState<Communication[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentCommunication, setCurrentCommunication] = useState<Communication | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Fetch communications
  useEffect(() => {
    if (!currentUser?.id) return;
    
    const fetchCommunications = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('communications')
          .select('*')
          .eq('client_id', currentUser.id)
          .order('date', { ascending: false });
        
        if (error) throw error;
        
        setCommunications(data || []);
        
        // If there are communications, select the first one
        if (data && data.length > 0) {
          setCurrentCommunication(data[0]);
        }
      } catch (error) {
        console.error('Error fetching communications:', error);
        toast.error('Failed to load communications');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCommunications();
  }, [currentUser?.id]);
  
  // Set up real-time subscription for communications
  useEffect(() => {
    if (!currentUser?.id) return;
    
    const communicationsChannel = supabase
      .channel('public:communications')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'communications',
        filter: `client_id=eq.${currentUser.id}`
      }, (payload) => {
        // Refresh communications when changed
        if (payload.eventType === 'INSERT') {
          setCommunications(prev => [payload.new as Communication, ...prev]);
        } else if (payload.eventType === 'UPDATE') {
          setCommunications(prev => 
            prev.map(c => c.id === payload.new.id ? payload.new as Communication : c)
          );
        } else if (payload.eventType === 'DELETE') {
          setCommunications(prev => prev.filter(c => c.id !== payload.old.id));
        }
      })
      .subscribe();
    
    return () => {
      supabase.removeChannel(communicationsChannel);
    };
  }, [currentUser?.id]);
  
  // Fetch messages for the current communication
  useEffect(() => {
    if (!currentCommunication) return;
    
    const fetchMessages = async () => {
      try {
        const { data, error } = await supabase
          .from('communication_messages')
          .select('*')
          .eq('communication_id', currentCommunication.id)
          .order('timestamp', { ascending: true });
        
        if (error) throw error;
        
        setMessages(data || []);
        
        // Mark as read if unread
        if (currentCommunication.unread) {
          await supabase
            .from('communications')
            .update({ unread: false })
            .eq('id', currentCommunication.id);
          
          setCommunications(prev => 
            prev.map(c => c.id === currentCommunication.id ? { ...c, unread: false } : c)
          );
        }
      } catch (error) {
        console.error('Error fetching messages:', error);
        toast.error('Failed to load messages');
      }
    };
    
    fetchMessages();
    
    // Set up real-time subscription for messages
    const messagesChannel = supabase
      .channel('public:communication_messages')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'communication_messages',
        filter: `communication_id=eq.${currentCommunication.id}`
      }, (payload) => {
        setMessages(prev => [...prev, payload.new as Message]);
      })
      .subscribe();
    
    return () => {
      supabase.removeChannel(messagesChannel);
    };
  }, [currentCommunication]);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  const handleSelectCommunication = (communication: Communication) => {
    setCurrentCommunication(communication);
  };
  
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !currentCommunication || !currentUser?.id) return;
    
    setIsSending(true);
    try {
      // Send message
      const { error } = await supabase
        .from('communication_messages')
        .insert({
          communication_id: currentCommunication.id,
          content: newMessage.trim(),
          sender: 'client',
          is_public: isPublic,
          sender_id: currentUser.id
        });
      
      if (error) throw error;
      
      // Clear message input
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    } finally {
      setIsSending(false);
    }
  };
  
  const formatMessageTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) {
      return 'Today';
    } else if (diffInDays === 1) {
      return 'Yesterday';
    } else if (diffInDays < 7) {
      return date.toLocaleDateString('en-US', { weekday: 'long' });
    } else {
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    }
  };
  
  const createNewCommunication = async () => {
    if (!currentUser?.id) return;
    
    try {
      const { data, error } = await supabase
        .from('communications')
        .insert({
          subject: 'New Conversation',
          preview: 'Start a new conversation',
          client_id: currentUser.id
        })
        .select()
        .single();
      
      if (error) throw error;
      
      setCommunications(prev => [data, ...prev]);
      setCurrentCommunication(data);
      toast.success('New conversation created');
    } catch (error) {
      console.error('Error creating conversation:', error);
      toast.error('Failed to create new conversation');
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center py-10">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  return (
    <Card className="h-[500px] flex flex-col">
      <CardHeader className="pb-2">
        <CardTitle>Communication Center</CardTitle>
        <CardDescription>
          Communicate with our support team
        </CardDescription>
      </CardHeader>
      
      <CardContent className="flex-1 overflow-hidden p-0">
        <div className="flex h-full">
          {/* Communications list */}
          <div className="w-1/3 border-r h-full overflow-y-auto">
            <div className="p-4 border-b">
              <Button 
                onClick={createNewCommunication} 
                className="w-full"
              >
                New Conversation
              </Button>
            </div>
            
            <div className="divide-y">
              {communications.length > 0 ? (
                communications.map(communication => (
                  <div 
                    key={communication.id}
                    className={`p-3 hover:bg-muted cursor-pointer ${
                      currentCommunication?.id === communication.id ? 'bg-muted' : ''
                    }`}
                    onClick={() => handleSelectCommunication(communication)}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="font-medium">{communication.subject}</h4>
                      {communication.unread && (
                        <Badge variant="default" className="ml-2">New</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground truncate">{communication.preview}</p>
                    <div className="text-xs text-muted-foreground mt-1">
                      {formatDate(communication.date)}
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center">
                  <p className="text-muted-foreground mb-4">No conversations yet</p>
                  <Button onClick={createNewCommunication}>
                    Start a Conversation
                  </Button>
                </div>
              )}
            </div>
          </div>
          
          {/* Message area */}
          <div className="w-2/3 flex flex-col h-full">
            {currentCommunication ? (
              <>
                <div className="p-3 border-b flex justify-between items-center">
                  <h3 className="font-medium">{currentCommunication.subject}</h3>
                </div>
                
                <div className="flex-1 overflow-y-auto p-4">
                  {messages.length > 0 ? (
                    <div className="space-y-4">
                      {messages.map(message => (
                        <div 
                          key={message.id} 
                          className={`flex flex-col ${
                            message.sender === 'client' ? 'items-end' : 'items-start'
                          }`}
                        >
                          <div className={`max-w-[80%] rounded-lg p-3 ${
                            message.sender === 'client' 
                              ? 'bg-primary text-primary-foreground' 
                              : 'bg-muted'
                          }`}>
                            <p>{message.content}</p>
                          </div>
                          <div className="flex items-center space-x-2 text-xs text-muted-foreground mt-1">
                            <span>{message.sender === 'client' ? 'You' : 'Support'}</span>
                            <span>•</span>
                            <span>{formatMessageTime(message.timestamp)}</span>
                            {message.is_public && (
                              <>
                                <span>•</span>
                                <Badge variant="outline" className="text-xs">Public</Badge>
                              </>
                            )}
                          </div>
                        </div>
                      ))}
                      <div ref={messagesEndRef} />
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                      <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium mb-1">No messages yet</h3>
                      <p className="text-muted-foreground">
                        Send a message to start the conversation
                      </p>
                    </div>
                  )}
                </div>
                
                <div className="p-3 border-t">
                  <div className="flex items-center gap-2 mb-2">
                    <Switch
                      id="public-message"
                      checked={isPublic}
                      onCheckedChange={setIsPublic}
                    />
                    <Label htmlFor="public-message">
                      Make message visible to all team members
                    </Label>
                  </div>
                  <div className="flex gap-2">
                    <Textarea
                      placeholder="Type a message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      className="flex-1 min-h-[80px]"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                    />
                    <Button 
                      className="self-end" 
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim() || isSending}
                    >
                      {isSending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No conversation selected</h3>
                <p className="text-muted-foreground mb-4">
                  Select an existing conversation or start a new one
                </p>
                <Button onClick={createNewCommunication}>
                  Start a Conversation
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CommunicationCenter;
