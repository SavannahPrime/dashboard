
import { supabase } from '@/integrations/supabase/client';
import { Task } from '@/lib/types';

export const fetchTasks = async (): Promise<Task[]> => {
  try {
    const { data, error } = await supabase
      .from('tasks')
      .select(`
        id,
        title,
        description,
        status,
        priority,
        due_date,
        created_at,
        employees(name, profile_image)
      `)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    // Transform the data to match our Task interface
    return data.map(task => ({
      id: task.id,
      title: task.title,
      description: task.description || '',
      status: task.status === 'todo' ? 'to-do' : task.status as any,
      priority: task.priority as any,
      assignees: task.employees ? [
        {
          id: 1, // Will be replaced with actual ID from DB
          name: task.employees.name,
          image: task.employees.profile_image || `https://ui-avatars.com/api/?name=${encodeURIComponent(task.employees.name)}&background=6366f1&color=fff`
        }
      ] : [],
      dueDate: task.due_date,
      comments: 0, // Will be implemented with a separate comments table
      attachments: 0, // Will be implemented with a separate attachments table
      department: 'General', // Will be replaced with actual department
      created: task.created_at
    }));
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return [];
  }
};

export const updateTaskStatus = async (taskId: number, status: 'to-do' | 'in-progress' | 'review' | 'done') => {
  // Map our frontend status to backend status
  const backendStatus = status === 'to-do' ? 'todo' : status;
  
  try {
    const { error } = await supabase
      .from('tasks')
      .update({ status: backendStatus })
      .eq('id', taskId);
    
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error('Error updating task status:', error);
    throw error;
  }
};

export const addTask = async (taskData: {
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  assignedTo: string;
  dueDate: string;
  department?: string;
}) => {
  try {
    const { data, error } = await supabase
      .from('tasks')
      .insert({
        title: taskData.title,
        description: taskData.description,
        status: 'todo',
        priority: taskData.priority,
        assigned_to: taskData.assignedTo,
        created_by: (await supabase.auth.getUser()).data.user?.id || null,
        due_date: taskData.dueDate,
        tags: taskData.department ? [taskData.department.toLowerCase()] : undefined
      })
      .select();
    
    if (error) throw error;
    
    return data[0];
  } catch (error) {
    console.error('Error adding task:', error);
    throw error;
  }
};
