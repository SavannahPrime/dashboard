
import { supabase } from '@/integrations/supabase/client';
import { Employee } from '@/lib/types';

export const fetchEmployees = async (): Promise<Employee[]> => {
  try {
    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    // Transform the data to match our Employee interface
    return data.map(employee => ({
      id: employee.id,
      name: employee.name,
      email: employee.email,
      role: employee.role,
      department: employee.department,
      status: employee.status,
      joinDate: employee.created_at,
      lastActive: employee.last_active,
      permissions: employee.permissions || [],
      profileImage: employee.profile_image
    }));
  } catch (error) {
    console.error('Error fetching employees:', error);
    return [];
  }
};

export const addEmployee = async (employee: Omit<Employee, 'id' | 'joinDate' | 'lastActive'>) => {
  try {
    const { data, error } = await supabase
      .from('employees')
      .insert({
        name: employee.name,
        email: employee.email,
        role: employee.role,
        department: employee.department,
        status: employee.status,
        permissions: employee.permissions || [],
        profile_image: employee.profileImage
      })
      .select();
    
    if (error) throw error;
    
    return data[0];
  } catch (error) {
    console.error('Error adding employee:', error);
    throw error;
  }
};

export const updateEmployeeStatus = async (employeeId: string, status: 'active' | 'inactive' | 'suspended') => {
  try {
    const { error } = await supabase
      .from('employees')
      .update({ status })
      .eq('id', employeeId);
    
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error('Error updating employee status:', error);
    throw error;
  }
};
