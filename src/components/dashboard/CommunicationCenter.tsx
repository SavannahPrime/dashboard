
import React, { useState, useEffect } from 'react';
import { Send, User, Users, Bell, MessageSquare } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';

interface Message {
  id: string;
  sender: string;
  content: string;
  timestamp: string;
  isPublic: boolean;
}

const CommunicationCenter: React.FC = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const { currentUser } = useAuth();
  
  // Fetch messages on component mount and when currentUser changes
  useEffect(() => {
    if (currentUser?.id) {
      fetchMessages();
      
      // Set up real-time subscription
      const channel = supabase
        .channel('public:communications')
        .on('postgres_changes', 
          { 
            event: 'INSERT', 
            schema: 'public', 
            table: 'communication_messages' 
          }, 
          payload => {
            const newMessage = payload.new as any;
            setMessages(prev => [
              ...prev,
              {
                id: newMessage.id,
                sender: newMessage.sender,
                content: newMessage.content,
                timestamp: newMessage.timestamp,
                isPublic: newMessage.is_public || false
              }
            ]);
          }
        )
        .subscribe();
        
      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [currentUser?.id]);
  
  const fetchMessages = async () => {
    if (!currentUser?.id) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('communication_messages')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(50);
        
      if (error) throw error;
      
      const formattedMessages = data.map(msg => ({
        id: msg.id,
        sender: msg.sender,
        content: msg.content,
        timestamp: msg.timestamp,
        isPublic: msg.is_public || false
      }));
      
      setMessages(formattedMessages);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast.error('Failed to load messages');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !currentUser) return;
    
    setIsSending(true);
    try {
      const { error } = await supabase
        .from('communication_messages')
        .insert({
          sender: currentUser.name,
          content: newMessage.trim(),
          is_public: isPublic,
          sender_id: currentUser.id
        });
        
      if (error) throw error;
      
      setNewMessage('');
      toast.success('Message sent successfully');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    } finally {
      setIsSending(false);
    }
  };
  
  const filteredMessages = messages.filter(msg => {
    if (activeTab === 'all') return true;
    if (activeTab === 'public') return msg.isPublic;
    if (activeTab === 'private') return !msg.isPublic;
    return true;
  });
  
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Communication Center</span>
          <Badge variant="outline" className="ml-2">{messages.length}</Badge>
        </CardTitle>
        <CardDescription>Stay connected with your team and clients</CardDescription>
        <Tabs defaultValue={activeTab} value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="public">Public</TabsTrigger>
            <TabsTrigger value="private">Private</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[350px] pr-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
            </div>
          ) : filteredMessages.length > 0 ? (
            <div className="space-y-4">
              {filteredMessages.map((message) => (
                <div 
                  key={message.id} 
                  className={`flex ${message.sender === currentUser?.name ? 'justify-end' : 'justify-start'}`}
                >
                  <div 
                    className={`flex max-w-[80%] ${
                      message.sender === currentUser?.name 
                        ? 'flex-row-reverse' 
                        : 'flex-row'
                    }`}
                  >
                    <Avatar className={`h-8 w-8 ${message.sender === currentUser?.name ? 'ml-2' : 'mr-2'}`}>
                      <AvatarFallback>{message.sender.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div 
                        className={`rounded-lg p-3 ${
                          message.sender === currentUser?.name 
                            ? 'bg-primary text-primary-foreground' 
                            : 'bg-muted'
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                      </div>
                      <div 
                        className={`flex mt-1 text-xs text-muted-foreground ${
                          message.sender === currentUser?.name ? 'justify-end' : 'justify-start'
                        }`}
                      >
                        <span className="mr-2">{message.sender}</span>
                        <span>{new Date(message.timestamp).toLocaleTimeString()}</span>
                        {message.isPublic && (
                          <Badge variant="outline" className="ml-1 h-4 text-[10px]">Public</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
              <MessageSquare className="h-12 w-12 mb-2 opacity-20" />
              <p>No messages yet</p>
            </div>
          )}
        </ScrollArea>
      </CardContent>
      <CardFooter className="flex flex-col space-y-2">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center">
            <Button 
              variant={isPublic ? "default" : "outline"} 
              size="sm" 
              className="mr-2"
              onClick={() => setIsPublic(!isPublic)}
            >
              {isPublic ? <Users className="h-4 w-4 mr-1" /> : <User className="h-4 w-4 mr-1" />}
              {isPublic ? 'Public' : 'Private'}
            </Button>
          </div>
        </div>
        <div className="flex w-full space-x-2">
          <Textarea
            placeholder="Type your message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="flex-1 resize-none"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
          />
          <Button 
            onClick={handleSendMessage} 
            disabled={!newMessage.trim() || isSending}
            className="self-end"
          >
            {isSending ? (
              <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full"></div>
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default CommunicationCenter;
