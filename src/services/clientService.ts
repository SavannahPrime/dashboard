
import { supabase } from '@/integrations/supabase/client';

export type Client = {
  id: string;
  name: string;
  email: string;
  status: 'active' | 'inactive' | 'suspended';
  selectedServices: string[];
  profileImage?: string;
  joinDate: string;
};

export const fetchClients = async (): Promise<Client[]> => {
  try {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    return data.map(client => ({
      id: client.id,
      name: client.name,
      email: client.email,
      status: client.status as Client['status'],
      selectedServices: client.selected_services || [],
      profileImage: client.profile_image,
      joinDate: client.created_at
    }));
  } catch (error) {
    console.error('Error fetching clients:', error);
    return [];
  }
};

export const fetchClientById = async (clientId: string): Promise<Client | null> => {
  try {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('id', clientId)
      .single();
    
    if (error) throw error;
    
    return {
      id: data.id,
      name: data.name,
      email: data.email,
      status: data.status as Client['status'],
      selectedServices: data.selected_services || [],
      profileImage: data.profile_image,
      joinDate: data.created_at
    };
  } catch (error) {
    console.error(`Error fetching client with ID ${clientId}:`, error);
    return null;
  }
};

export const updateClientServices = async (clientId: string, services: string[]): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('clients')
      .update({ selected_services: services })
      .eq('id', clientId);
    
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error('Error updating client services:', error);
    return false;
  }
};

export const updateClientStatus = async (clientId: string, status: 'active' | 'inactive' | 'suspended'): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('clients')
      .update({ status })
      .eq('id', clientId);
    
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error('Error updating client status:', error);
    return false;
  }
};
