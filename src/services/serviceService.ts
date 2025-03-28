
import { supabase } from '@/integrations/supabase/client';

export type Service = {
  id: string;
  name: string;
  description: string;
  price: number;
  features: string[];
  category?: string;
  active: boolean;
};

export const fetchServices = async (): Promise<Service[]> => {
  try {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .order('price', { ascending: true });
    
    if (error) throw error;
    
    return data.map(service => ({
      id: service.id,
      name: service.name,
      description: service.description || '',
      price: service.price,
      features: service.features || [],
      category: service.category,
      active: service.active !== false // Default to true if not specified
    }));
  } catch (error) {
    console.error('Error fetching services:', error);
    return [];
  }
};

export const createService = async (serviceData: Omit<Service, 'id'>): Promise<Service | null> => {
  try {
    const { data, error } = await supabase
      .from('services')
      .insert({
        name: serviceData.name,
        description: serviceData.description,
        price: serviceData.price,
        features: serviceData.features,
        category: serviceData.category,
        active: serviceData.active
      })
      .select();
    
    if (error) throw error;
    
    return {
      id: data[0].id,
      name: data[0].name,
      description: data[0].description || '',
      price: data[0].price,
      features: data[0].features || [],
      category: data[0].category,
      active: data[0].active !== false
    };
  } catch (error) {
    console.error('Error creating service:', error);
    return null;
  }
};

export const updateService = async (id: string, serviceData: Partial<Omit<Service, 'id'>>): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('services')
      .update(serviceData)
      .eq('id', id);
    
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error('Error updating service:', error);
    return false;
  }
};

export const toggleServiceStatus = async (id: string, active: boolean): Promise<boolean> => {
  return updateService(id, { active });
};
