
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
  messages: Message[];
};

export type Message = {
  id: string;
  sender: 'client' | 'admin';
  content: string;
  timestamp: string;
};

export const fetchMessageThreads = async (): Promise<MessageThread[]> => {
  try {
    const { data, error } = await supabase
      .from('communications')
      .select(`
        id,
        subject,
        preview,
        date,
        unread,
        client_id,
        clients(id, name, email, profile_image)
      `)
      .order('date', { ascending: false });
    
    if (error) throw error;
    
    // Now fetch messages for each thread
    const threadsWithMessages = await Promise.all(data.map(async thread => {
      const { data: messageData, error: messageError } = await supabase
        .from('communication_messages')
        .select('*')
        .eq('communication_id', thread.id)
        .order('timestamp', { ascending: true });
      
      if (messageError) throw messageError;
      
      // Ensure sender is either 'client' or 'admin'
      const messages = messageData.map(msg => ({
        id: msg.id,
        sender: msg.sender === 'client' ? 'client' : 'admin' as 'client' | 'admin',
        content: msg.content,
        timestamp: msg.timestamp
      }));
      
      // Fix: Access clients object correctly
      const client = thread.clients || {};
      
      return {
        id: thread.id,
        subject: thread.subject,
        preview: thread.preview,
        date: thread.date,
        unread: thread.unread,
        client: {
          id: client.id || '',
          name: client.name || 'Unknown',
          email: client.email || '',
          avatar: client.profile_image || `https://ui-avatars.com/api/?name=${encodeURIComponent(client.name || 'Unknown')}&background=6366f1&color=fff`
        },
        messages
      };
    }));
    
    return threadsWithMessages;
  } catch (error) {
    console.error('Error fetching message threads:', error);
    return [];
  }
};

export const markThreadAsRead = async (threadId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('communications')
      .update({ unread: false })
      .eq('id', threadId);
    
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error('Error marking thread as read:', error);
    return false;
  }
};

export const sendReply = async (
  threadId: string, 
  content: string, 
  senderId: string
): Promise<Message | null> => {
  try {
    // Add new message
    const { data: messageData, error: messageError } = await supabase
      .from('communication_messages')
      .insert({
        communication_id: threadId,
        content,
        sender: 'admin',
        sender_id: senderId
      })
      .select()
      .single();
    
    if (messageError) throw messageError;
    
    // Update preview in the thread
    const { error: updateError } = await supabase
      .from('communications')
      .update({ 
        preview: content,
        date: new Date().toISOString() 
      })
      .eq('id', threadId);
    
    if (updateError) throw updateError;
    
    return {
      id: messageData.id,
      sender: 'admin',
      content: messageData.content,
      timestamp: messageData.timestamp
    };
  } catch (error) {
    console.error('Error sending reply:', error);
    return null;
  }
};

export const getMessageTemplates = async () => {
  try {
    const { data, error } = await supabase
      .from('message_templates')
      .select('*')
      .order('name', { ascending: true });
    
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Error fetching message templates:', error);
    return [];
  }
};

export const createMessageTemplate = async (
  name: string,
  subject: string,
  content: string
) => {
  try {
    const { data, error } = await supabase
      .from('message_templates')
      .insert({
        name,
        subject,
        content
      })
      .select();
    
    if (error) throw error;
    
    return data[0];
  } catch (error) {
    console.error('Error creating message template:', error);
    return null;
  }
};

export const createNewThread = async (
  clientId: string,
  subject: string,
  content: string,
  senderId: string
): Promise<string | null> => {
  try {
    // Create the communication thread
    const { data: threadData, error: threadError } = await supabase
      .from('communications')
      .insert({
        client_id: clientId,
        subject,
        preview: content,
        date: new Date().toISOString(),
        unread: true
      })
      .select()
      .single();
    
    if (threadError) throw threadError;
    
    // Add the initial message
    const { error: messageError } = await supabase
      .from('communication_messages')
      .insert({
        communication_id: threadData.id,
        content,
        sender: 'admin',
        sender_id: senderId
      });
    
    if (messageError) throw messageError;
    
    return threadData.id;
  } catch (error) {
    console.error('Error creating new message thread:', error);
    return null;
  }
};
