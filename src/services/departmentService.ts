
import { supabase } from '@/integrations/supabase/client';
import { Department } from '@/lib/types';

export const fetchDepartments = async (): Promise<Department[]> => {
  try {
    const { data, error } = await supabase
      .from('departments')
      .select(`
        *,
        employees(id)
      `)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    // Transform the data to match our Department interface
    return data.map(dept => ({
      id: dept.id,
      name: dept.name,
      description: dept.description || undefined,
      managerId: dept.manager_id || undefined,
      employeeCount: Array.isArray(dept.employees) ? dept.employees.length : 0,
      createdAt: dept.created_at
    }));
  } catch (error) {
    console.error('Error fetching departments:', error);
    return [];
  }
};

export const addDepartment = async (departmentData: {
  name: string;
  description?: string;
  managerId?: string;
}) => {
  try {
    const { data, error } = await supabase
      .from('departments')
      .insert({
        name: departmentData.name,
        description: departmentData.description,
        manager_id: departmentData.managerId
      })
      .select();
    
    if (error) throw error;
    
    return data[0];
  } catch (error) {
    console.error('Error adding department:', error);
    throw error;
  }
};

export const updateDepartment = async (
  departmentId: string, 
  updates: Partial<{ name: string; description?: string; managerId?: string }>
) => {
  try {
    const { error } = await supabase
      .from('departments')
      .update({
        name: updates.name,
        description: updates.description,
        manager_id: updates.managerId
      })
      .eq('id', departmentId);
    
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error('Error updating department:', error);
    throw error;
  }
};

export const deleteDepartment = async (departmentId: string) => {
  try {
    const { error } = await supabase
      .from('departments')
      .delete()
      .eq('id', departmentId);
    
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error('Error deleting department:', error);
    throw error;
  }
};
