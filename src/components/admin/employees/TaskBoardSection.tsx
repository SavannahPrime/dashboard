
import React, { useState } from 'react';
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
  Calendar
} from 'lucide-react';

// Task priority colors
const priorityColors = {
  low: 'bg-blue-100 text-blue-800 border-blue-300',
  medium: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  high: 'bg-orange-100 text-orange-800 border-orange-300',
  critical: 'bg-red-100 text-red-800 border-red-300'
};

// Sample tasks
const sampleTasks = [
  {
    id: 1,
    title: 'Update SEO packages',
    description: 'Revise the pricing and features for all SEO service packages',
    status: 'to-do',
    priority: 'high',
    assignees: [
      { id: 1, name: 'James Taylor', image: 'https://ui-avatars.com/api/?name=James+Taylor&background=6366f1&color=fff' },
      { id: 7, name: 'Olivia Garcia', image: 'https://ui-avatars.com/api/?name=Olivia+Garcia&background=6366f1&color=fff' }
    ],
    dueDate: '2023-11-15',
    comments: 2,
    attachments: 1,
    department: 'Marketing',
    created: '2023-11-01'
  },
  {
    id: 2,
    title: 'Client onboarding automation',
    description: 'Create email sequence for new client onboarding process',
    status: 'in-progress',
    priority: 'medium',
    assignees: [
      { id: 3, name: 'Sarah Johnson', image: 'https://ui-avatars.com/api/?name=Sarah+Johnson&background=6366f1&color=fff' }
    ],
    dueDate: '2023-11-18',
    comments: 5,
    attachments: 3,
    department: 'Content',
    created: '2023-11-03'
  },
  {
    id: 3,
    title: 'Fix newsletter signup form',
    description: 'Debug and fix the newsletter signup form on the website',
    status: 'in-progress',
    priority: 'critical',
    assignees: [
      { id: 2, name: 'Michael Rodriguez', image: 'https://ui-avatars.com/api/?name=Michael+Rodriguez&background=6366f1&color=fff' }
    ],
    dueDate: '2023-11-12',
    comments: 4,
    attachments: 1,
    department: 'Development',
    created: '2023-11-05'
  },
  {
    id: 4,
    title: 'Quarterly sales report',
    description: 'Prepare the Q3 sales performance report with projections',
    status: 'review',
    priority: 'high',
    assignees: [
      { id: 6, name: 'James Taylor', image: 'https://ui-avatars.com/api/?name=James+Taylor&background=6366f1&color=fff' }
    ],
    dueDate: '2023-11-20',
    comments: 3,
    attachments: 2,
    department: 'Sales',
    created: '2023-11-02'
  },
  {
    id: 5,
    title: 'Social media content calendar',
    description: 'Plan next month\'s social media content calendar',
    status: 'done',
    priority: 'medium',
    assignees: [
      { id: 1, name: 'Alexandra Thompson', image: 'https://ui-avatars.com/api/?name=Alexandra+Thompson&background=6366f1&color=fff' },
      { id: 7, name: 'Olivia Garcia', image: 'https://ui-avatars.com/api/?name=Olivia+Garcia&background=6366f1&color=fff' }
    ],
    dueDate: '2023-11-05',
    comments: 8,
    attachments: 4,
    department: 'Marketing',
    created: '2023-10-25'
  },
  {
    id: 6,
    title: 'Client support tickets review',
    description: 'Review and categorize open support tickets',
    status: 'to-do',
    priority: 'low',
    assignees: [
      { id: 4, name: 'David Chen', image: 'https://ui-avatars.com/api/?name=David+Chen&background=6366f1&color=fff' }
    ],
    dueDate: '2023-11-17',
    comments: 0,
    attachments: 0,
    department: 'Support',
    created: '2023-11-08'
  },
  {
    id: 7,
    title: 'New feature development',
    description: 'Begin development on the new client dashboard features',
    status: 'to-do',
    priority: 'high',
    assignees: [
      { id: 2, name: 'Michael Rodriguez', image: 'https://ui-avatars.com/api/?name=Michael+Rodriguez&background=6366f1&color=fff' }
    ],
    dueDate: '2023-11-30',
    comments: 1,
    attachments: 2,
    department: 'Development',
    created: '2023-11-09'
  }
];

// Task status columns
const columns = [
  { id: 'to-do', name: 'To Do' },
  { id: 'in-progress', name: 'In Progress' },
  { id: 'review', name: 'Review' },
  { id: 'done', name: 'Done' }
];

const TaskBoardSection: React.FC = () => {
  const [tasks, setTasks] = useState(sampleTasks);
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  
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
  }, {} as Record<string, typeof tasks>);
  
  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };
  
  // Calculate days left or overdue
  const getDaysRemaining = (dueDate: string) => {
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
    setTasks(prevTasks => 
      prevTasks.map(task => 
        task.id === taskId ? { ...task, status: newStatus } : task
      )
    );
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
        
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          New Task
        </Button>
      </div>
      
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
                            <DropdownMenuItem>
                              <ArrowRight className="mr-2 h-4 w-4" />
                              Move to...
                            </DropdownMenuItem>
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
    </div>
  );
};

export default TaskBoardSection;
