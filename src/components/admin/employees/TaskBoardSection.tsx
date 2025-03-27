
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CalendarIcon, Loader2, PlusCircle, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useAdminAuth } from '@/contexts/AdminAuthContext';

interface Task {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'in-progress' | 'review' | 'done';
  priority: 'low' | 'medium' | 'high';
  assigned_to: string;
  due_date: string | null;
  completed_at: string | null;
  created_at: string;
  created_by: string;
  assignee?: {
    name: string;
    email: string;
    department: string;
  };
}

interface Employee {
  id: string;
  name: string;
  email: string;
  department: string;
  role: string;
}

const TaskBoardSection: React.FC = () => {
  const { currentAdmin } = useAdminAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [activeTab, setActiveTab] = useState<string>('todo');
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    assigned_to: '',
    priority: 'medium',
    status: 'todo',
    due_date: null as Date | null,
  });
  
  const fetchTasks = async () => {
    setIsLoading(true);
    try {
      const { data: tasksData, error: tasksError } = await supabase
        .from('tasks')
        .select(`
          *,
          assignee:assigned_to(name, email, department)
        `)
        .order('created_at', { ascending: false });
      
      if (tasksError) throw tasksError;
      
      setTasks(tasksData as Task[] || []);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      toast.error('Failed to load tasks');
    } finally {
      setIsLoading(false);
    }
  };
  
  const fetchEmployees = async () => {
    try {
      const { data, error } = await supabase
        .from('employees')
        .select('id, name, email, department, role')
        .eq('status', 'active')
        .order('name');
      
      if (error) throw error;
      
      setEmployees(data || []);
      
      // If there's at least one employee, set as default
      if (data && data.length > 0) {
        setNewTask(prev => ({ ...prev, assigned_to: data[0].id }));
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
      toast.error('Failed to load employees');
    }
  };
  
  useEffect(() => {
    fetchTasks();
    fetchEmployees();
  }, []);
  
  const handleCreateTask = async () => {
    if (!newTask.title || !newTask.description || !newTask.assigned_to) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    if (!currentAdmin?.id) {
      toast.error('You must be logged in to create tasks');
      return;
    }
    
    setIsSubmitting(true);
    try {
      const { data, error } = await supabase
        .from('tasks')
        .insert({
          title: newTask.title,
          description: newTask.description,
          assigned_to: newTask.assigned_to,
          priority: newTask.priority,
          status: newTask.status,
          due_date: newTask.due_date ? format(newTask.due_date, 'yyyy-MM-dd') : null,
          created_by: currentAdmin.id
        })
        .select()
        .single();
      
      if (error) throw error;
      
      toast.success('Task created successfully');
      setIsDialogOpen(false);
      setNewTask({
        title: '',
        description: '',
        assigned_to: employees[0]?.id || '',
        priority: 'medium',
        status: 'todo',
        due_date: null,
      });
      fetchTasks();
    } catch (error: any) {
      console.error('Error creating task:', error);
      toast.error(error.message || 'Failed to create task');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleUpdateTaskStatus = async (taskId: string, newStatus: 'todo' | 'in-progress' | 'review' | 'done') => {
    try {
      const now = new Date().toISOString();
      const updates: any = { status: newStatus };
      
      // If marking as done, set completed_at
      if (newStatus === 'done') {
        updates.completed_at = now;
      } else {
        updates.completed_at = null;
      }
      
      const { error } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', taskId);
      
      if (error) throw error;
      
      toast.success(`Task moved to ${newStatus}`);
      fetchTasks();
      
      // Update the task locally
      setTasks(prevTasks => 
        prevTasks.map(task => 
          task.id === taskId 
            ? { ...task, status: newStatus, completed_at: newStatus === 'done' ? now : null } 
            : task
        )
      );
    } catch (error) {
      console.error('Error updating task status:', error);
      toast.error('Failed to update task status');
    }
  };
  
  const getTasksByStatus = (status: string) => {
    return tasks.filter(task => task.status === status);
  };
  
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-destructive/10 text-destructive border-destructive/20';
      case 'medium':
        return 'bg-warning/10 text-warning border-warning/20';
      case 'low':
        return 'bg-muted text-muted-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };
  
  const formatDueDate = (dateString: string | null) => {
    if (!dateString) return 'No due date';
    const date = new Date(dateString);
    return format(date, 'MMM d, yyyy');
  };
  
  const isOverdue = (dueDate: string | null, status: string) => {
    if (!dueDate || status === 'done') return false;
    const today = new Date();
    const due = new Date(dueDate);
    return today > due;
  };
  
  const getAssigneeName = (task: Task) => {
    return task.assignee?.name || 'Unassigned';
  };
  
  const renderTaskList = (status: 'todo' | 'in-progress' | 'review' | 'done') => {
    const statusTasks = getTasksByStatus(status);
    
    if (statusTasks.length === 0) {
      return (
        <div className="text-center py-8 border border-dashed rounded-md">
          <p className="text-muted-foreground">No tasks</p>
        </div>
      );
    }
    
    return (
      <div className="space-y-3">
        {statusTasks.map((task) => (
          <Card key={task.id} className="overflow-hidden">
            <CardHeader className="p-4 pb-2">
              <div className="flex justify-between items-start">
                <CardTitle className="text-base">{task.title}</CardTitle>
                <Badge className={cn("ml-2", getPriorityColor(task.priority))}>
                  {task.priority}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-0 pb-2">
              <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                {task.description}
              </p>
              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <span className="font-medium">{getAssigneeName(task)}</span>
                </div>
                {task.due_date && (
                  <div className="flex items-center gap-1">
                    {isOverdue(task.due_date, task.status) ? (
                      <Badge variant="destructive" className="text-xs">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        Overdue
                      </Badge>
                    ) : (
                      <span className="text-xs text-muted-foreground flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {formatDueDate(task.due_date)}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter className="p-2 border-t flex justify-between bg-muted/30">
              {status !== 'todo' && (
                <Button variant="ghost" size="sm" onClick={() => {
                  const prevStatus = status === 'in-progress' ? 'todo' : (status === 'review' ? 'in-progress' : 'review');
                  handleUpdateTaskStatus(task.id, prevStatus);
                }}>
                  ← Move Back
                </Button>
              )}
              {status !== 'done' && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className={status === 'todo' ? 'ml-auto' : ''}
                  onClick={() => {
                    const nextStatus = status === 'todo' ? 'in-progress' : (status === 'in-progress' ? 'review' : 'done');
                    handleUpdateTaskStatus(task.id, nextStatus);
                  }}
                >
                  {status === 'review' ? (
                    <>
                      <CheckCircle2 className="h-4 w-4 mr-1" />
                      Complete
                    </>
                  ) : (
                    <>Move Forward →</>
                  )}
                </Button>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  };
  
  return (
    <Card className="col-span-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-xl font-bold">Task Board</CardTitle>
          <CardDescription>
            Manage and track team tasks
          </CardDescription>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Create Task
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Task</DialogTitle>
              <DialogDescription>
                Add a new task and assign it to a team member.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Task Title</Label>
                <Input
                  id="title"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  placeholder="Enter task title"
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  placeholder="Describe the task..."
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="assigned">Assign To</Label>
                  <Select 
                    value={newTask.assigned_to} 
                    onValueChange={(value) => setNewTask({ ...newTask, assigned_to: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select employee" />
                    </SelectTrigger>
                    <SelectContent>
                      {employees.map((employee) => (
                        <SelectItem key={employee.id} value={employee.id}>
                          {employee.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Select 
                    value={newTask.priority} 
                    onValueChange={(value: any) => setNewTask({ ...newTask, priority: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="due-date">Due Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !newTask.due_date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {newTask.due_date ? format(newTask.due_date, "PPP") : "Select a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={newTask.due_date || undefined}
                      onSelect={(date) => setNewTask({ ...newTask, due_date: date })}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleCreateTask} disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Task'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
          </div>
        ) : (
          <Tabs defaultValue={activeTab} value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4 mb-8">
              <TabsTrigger value="todo">
                To Do ({getTasksByStatus('todo').length})
              </TabsTrigger>
              <TabsTrigger value="in-progress">
                In Progress ({getTasksByStatus('in-progress').length})
              </TabsTrigger>
              <TabsTrigger value="review">
                Review ({getTasksByStatus('review').length})
              </TabsTrigger>
              <TabsTrigger value="done">
                Done ({getTasksByStatus('done').length})
              </TabsTrigger>
            </TabsList>
            
            <div className="grid grid-cols-1 gap-6">
              <TabsContent value="todo" className="min-h-[300px]">
                {renderTaskList('todo')}
              </TabsContent>
              
              <TabsContent value="in-progress" className="min-h-[300px]">
                {renderTaskList('in-progress')}
              </TabsContent>
              
              <TabsContent value="review" className="min-h-[300px]">
                {renderTaskList('review')}
              </TabsContent>
              
              <TabsContent value="done" className="min-h-[300px]">
                {renderTaskList('done')}
              </TabsContent>
            </div>
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
};

export default TaskBoardSection;
