
import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { 
  Clock, 
  Plus, 
  ChevronDown, 
  MoreHorizontal, 
  ClipboardCheck, 
  AlertCircle, 
  ArrowRight,
  Edit,
  Trash,
  MessageSquare,
  Calendar,
  Download,
  Loader2
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchTasks, updateTaskStatus } from '@/services/taskService';
import { Task } from '@/lib/types';
import { toast } from 'sonner';
import AddTaskForm from './AddTaskForm';

// Task priority colors
const priorityColors = {
  low: 'bg-blue-100 text-blue-800 border-blue-300',
  medium: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  high: 'bg-orange-100 text-orange-800 border-orange-300',
  critical: 'bg-red-100 text-red-800 border-red-300'
};

// Task status columns
const columns = [
  { id: 'to-do', name: 'To Do' },
  { id: 'in-progress', name: 'In Progress' },
  { id: 'review', name: 'Review' },
  { id: 'done', name: 'Done' }
];

const TaskBoardSection: React.FC = () => {
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [addTaskOpen, setAddTaskOpen] = useState(false);
  
  const queryClient = useQueryClient();
  
  // Fetch tasks
  const { 
    data: tasks = [], 
    isLoading, 
    isError, 
    refetch 
  } = useQuery({
    queryKey: ['tasks'],
    queryFn: fetchTasks,
  });
  
  // Update task status mutation
  const updateTaskMutation = useMutation({
    mutationFn: ({ taskId, status }: { taskId: number; status: 'to-do' | 'in-progress' | 'review' | 'done' }) => 
      updateTaskStatus(taskId, status),
    onSuccess: () => {
      toast.success('Task status updated');
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
    onError: (error) => {
      toast.error('Failed to update task status');
      console.error('Error updating task status:', error);
    }
  });
  
  // Filter tasks based on department, priority and search query
  const filteredTasks = tasks.filter(task => {
    const matchesDepartment = filterDepartment === 'all' || task.department.toLowerCase() === filterDepartment.toLowerCase();
    const matchesPriority = filterPriority === 'all' || task.priority === filterPriority;
    const matchesSearch = 
      searchQuery === '' || 
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      task.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesDepartment && matchesPriority && matchesSearch;
  });
  
  // Group tasks by status
  const tasksByStatus = columns.reduce((acc, column) => {
    acc[column.id] = filteredTasks.filter(task => task.status === column.id);
    return acc;
  }, {} as Record<string, Task[]>);
  
  // Format date
  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };
  
  // Calculate days left or overdue
  const getDaysRemaining = (dueDate: string) => {
    if (!dueDate) return 'No due date';
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0);
    
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return `${Math.abs(diffDays)} day${Math.abs(diffDays) !== 1 ? 's' : ''} overdue`;
    } else if (diffDays === 0) {
      return 'Due today';
    } else {
      return `${diffDays} day${diffDays !== 1 ? 's' : ''} left`;
    }
  };
  
  // Move task to another status
  const moveTask = (taskId: number, newStatus: string) => {
    updateTaskMutation.mutate({
      taskId,
      status: newStatus as 'to-do' | 'in-progress' | 'review' | 'done'
    });
  };
  
  // Export tasks to CSV
  const exportToCSV = () => {
    // Only export filtered tasks
    const tasksToExport = filteredTasks;
    
    // Define the CSV headers
    const headers = ['ID', 'Title', 'Description', 'Status', 'Priority', 'Due Date', 'Assignees', 'Department', 'Created'];
    
    // Convert the data to CSV format
    const csvData = tasksToExport.map(task => [
      task.id,
      task.title,
      task.description.replace(/,/g, ';'),
      task.status,
      task.priority,
      formatDate(task.dueDate),
      task.assignees.map(a => a.name).join('; '),
      task.department,
      formatDate(task.created)
    ]);
    
    // Combine headers and data
    const csv = [headers, ...csvData].map(row => row.join(',')).join('\n');
    
    // Create a Blob and download link
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `tasks_export_${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex-1 flex flex-col sm:flex-row gap-2">
          <Input
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="sm:w-[300px]"
          />
          
          <Select value={filterDepartment} onValueChange={setFilterDepartment}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              <SelectItem value="marketing">Marketing</SelectItem>
              <SelectItem value="sales">Sales</SelectItem>
              <SelectItem value="development">Development</SelectItem>
              <SelectItem value="support">Support</SelectItem>
              <SelectItem value="content">Content</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={filterPriority} onValueChange={setFilterPriority}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priorities</SelectItem>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            onClick={exportToCSV}
            disabled={filteredTasks.length === 0}
          >
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          
          <Button onClick={() => setAddTaskOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Task
          </Button>
        </div>
      </div>
      
      {isLoading ? (
        <div className="flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
          <p>Loading tasks...</p>
        </div>
      ) : isError ? (
        <div className="text-center p-8 text-red-500">
          <AlertCircle className="h-8 w-8 mx-auto mb-2" />
          <p>Error loading tasks. Please try again.</p>
          <Button variant="outline" className="mt-4" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {columns.map(column => (
            <div key={column.id} className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">{column.name}</h3>
                <Badge variant="outline">
                  {tasksByStatus[column.id]?.length || 0}
                </Badge>
              </div>
              
              <div className="space-y-3">
                {tasksByStatus[column.id]?.length > 0 ? (
                  tasksByStatus[column.id].map(task => (
                    <Card key={task.id} className="shadow-sm">
                      <CardHeader className="p-3 pb-2">
                        <div className="flex justify-between items-start">
                          <Badge 
                            variant="outline" 
                            className={priorityColors[task.priority as keyof typeof priorityColors]}
                          >
                            {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                          </Badge>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit Task
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <MessageSquare className="mr-2 h-4 w-4" />
                                Add Comment
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuLabel>Move to...</DropdownMenuLabel>
                              {columns.map(col => (
                                col.id !== task.status && (
                                  <DropdownMenuItem 
                                    key={col.id}
                                    onClick={() => moveTask(task.id, col.id)}
                                  >
                                    <ArrowRight className="mr-2 h-4 w-4" />
                                    {col.name}
                                  </DropdownMenuItem>
                                )
                              ))}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-red-600">
                                <Trash className="mr-2 h-4 w-4" />
                                Delete Task
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                        <CardTitle className="text-base mt-2">{task.title}</CardTitle>
                        <CardDescription className="line-clamp-2 mt-1">
                          {task.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="px-3 py-0">
                        <div className="flex items-center text-sm text-muted-foreground mb-3">
                          <Calendar className="h-3.5 w-3.5 mr-1" />
                          <span>Due {formatDate(task.dueDate)}</span>
                          <span className="px-1.5">•</span>
                          <Badge variant="outline" className="text-xs font-normal">
                            {task.department}
                          </Badge>
                        </div>
                      </CardContent>
                      <CardFooter className="p-3 pt-0 flex justify-between">
                        <div className="flex -space-x-2">
                          {task.assignees.map((assignee, index) => (
                            <div 
                              key={index} 
                              className="h-7 w-7 rounded-full border-2 border-background overflow-hidden"
                              title={assignee.name}
                            >
                              <img 
                                src={assignee.image} 
                                alt={assignee.name} 
                                className="h-full w-full object-cover"
                              />
                            </div>
                          ))}
                        </div>
                        <div className="flex items-center gap-3 text-muted-foreground text-sm">
                          {task.comments > 0 && (
                            <span className="flex items-center gap-1">
                              <MessageSquare className="h-3.5 w-3.5" />
                              {task.comments}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" />
                            {getDaysRemaining(task.dueDate)}
                          </span>
                        </div>
                      </CardFooter>
                    </Card>
                  ))
                ) : (
                  <div className="border border-dashed rounded-md p-4 flex items-center justify-center">
                    <p className="text-muted-foreground text-sm">No tasks</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      
      <AddTaskForm 
        open={addTaskOpen} 
        onOpenChange={setAddTaskOpen} 
        onSuccess={() => refetch()}
      />
    </div>
  );
};

export default TaskBoardSection;
