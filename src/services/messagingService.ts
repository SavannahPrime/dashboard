
import { supabase } from '@/integrations/supabase/client';

export type MessageThread = {
  id: string;
  subject: string;
  preview: string;
  date: string;
  unread: boolean;
  client: {
    id: string;
    name: string;
    email: string;
    avatar: string;
  };
  messages?: Message[];
};

export type Message = {
  id: string;
  content: string;
  timestamp: string;
  sender: 'admin' | 'client' | 'sales' | 'support';
  senderId: string;
};

// Function to fetch message threads
export const fetchMessageThreads = async (): Promise<MessageThread[]> => {
  try {
    const { data, error } = await supabase
      .from('communications')
      .select(`
        *,
        clients:client_id (*)
      `)
      .order('date', { ascending: false });
    
    if (error) throw error;
    
    return (data || []).map(thread => {
      const clientData = thread.clients || {};
      const defaultName = 'Unknown Client';
      
      // Create safe client object with fallback values
      const safeClient = {
        id: clientData && typeof clientData.id === 'string' ? clientData.id : '',
        name: clientData && typeof clientData.name === 'string' ? clientData.name : defaultName,
        email: clientData && typeof clientData.email === 'string' ? clientData.email : '',
        avatar: clientData && typeof clientData.profile_image === 'string' 
          ? clientData.profile_image 
          : `https://ui-avatars.com/api/?name=${encodeURIComponent(defaultName)}&background=6366f1&color=fff`
      };
      
      return {
        id: thread.id,
        subject: thread.subject,
        preview: thread.preview || 'No preview available',
        date: thread.date,
        unread: thread.unread || false,
        client: safeClient
      };
    });
  } catch (error) {
    console.error('Error fetching message threads:', error);
    return [];
  }
};

// Function to fetch messages for a specific thread
export const fetchMessages = async (threadId: string): Promise<Message[]> => {
  try {
    const { data, error } = await supabase
      .from('communication_messages')
      .select('*')
      .eq('communication_id', threadId)
      .order('timestamp', { ascending: true });
    
    if (error) throw error;
    
    return (data || []).map(message => ({
      id: message.id,
      content: message.content,
      timestamp: message.timestamp,
      sender: message.sender as 'admin' | 'client' | 'sales' | 'support',
      senderId: message.sender_id || ''
    }));
  } catch (error) {
    console.error(`Error fetching messages for thread ${threadId}:`, error);
    return [];
  }
};

// Function to send a message
export const sendMessage = async (
  threadId: string,
  content: string,
  sender: 'admin' | 'client' | 'sales' | 'support',
  senderId: string
): Promise<Message | null> => {
  try {
    // Insert the message
    const { data, error } = await supabase
      .from('communication_messages')
      .insert({
        communication_id: threadId,
        content,
        sender,
        sender_id: senderId
      })
      .select()
      .single();
    
    if (error) throw error;
    
    // Update the thread's preview and unread status
    await supabase
      .from('communications')
      .update({
        preview: content.substring(0, 100) + (content.length > 100 ? '...' : ''),
        unread: sender === 'client', // Mark as unread only if sent by client
        date: new Date().toISOString()
      })
      .eq('id', threadId);
    
    return {
      id: data.id,
      content: data.content,
      timestamp: data.timestamp,
      sender: data.sender as 'admin' | 'client' | 'sales' | 'support',
      senderId: data.sender_id || ''
    };
  } catch (error) {
    console.error('Error sending message:', error);
    return null;
  }
};

// Function to create a new message thread
export const createThread = async (
  clientId: string,
  subject: string,
  content: string,
  sender: 'admin' | 'client' | 'sales' | 'support',
  senderId: string
): Promise<MessageThread | null> => {
  try {
    // First, get client data
    const { data: clientData, error: clientError } = await supabase
      .from('clients')
      .select('*')
      .eq('id', clientId)
      .single();
    
    if (clientError) throw clientError;
    
    // Then create the communication thread
    const { data: threadData, error: threadError } = await supabase
      .from('communications')
      .insert({
        client_id: clientId,
        subject,
        preview: content.substring(0, 100) + (content.length > 100 ? '...' : ''),
        unread: sender === 'client' // Mark as unread only if sent by client
      })
      .select()
      .single();
    
    if (threadError) throw threadError;
    
    // Then add the initial message
    const { error: messageError } = await supabase
      .from('communication_messages')
      .insert({
        communication_id: threadData.id,
        content,
        sender,
        sender_id: senderId
      });
    
    if (messageError) throw messageError;
    
    const defaultName = 'Unknown Client';
    
    // Create safe client object
    const safeClient = {
      id: clientId,
      name: clientData && typeof clientData.name === 'string' ? clientData.name : defaultName,
      email: clientData && typeof clientData.email === 'string' ? clientData.email : '',
      avatar: clientData && typeof clientData.profile_image === 'string' 
        ? clientData.profile_image 
        : `https://ui-avatars.com/api/?name=${encodeURIComponent(defaultName)}&background=6366f1&color=fff`
    };
    
    return {
      id: threadData.id,
      subject: threadData.subject,
      preview: threadData.preview,
      date: threadData.date,
      unread: threadData.unread,
      client: safeClient
    };
  } catch (error) {
    console.error('Error creating message thread:', error);
    return null;
  }
};

// Function to mark a thread as read
export const markThreadAsRead = async (threadId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('communications')
      .update({ unread: false })
      .eq('id', threadId);
    
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error(`Error marking thread ${threadId} as read:`, error);
    return false;
  }
};
