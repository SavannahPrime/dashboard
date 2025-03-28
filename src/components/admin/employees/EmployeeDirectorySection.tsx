
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
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
import {
  Search,
  Filter,
  MoreHorizontal,
  RefreshCw,
  Eye,
  Edit,
  Key,
  AlertCircle,
  Clock,
  ClipboardList
} from 'lucide-react';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';

// Sample employee data
const employees = [
  {
    id: 1,
    name: 'Alexandra Thompson',
    email: 'alex@savannahprime.com',
    role: 'Department Manager',
    department: 'Marketing',
    status: 'active',
    joinDate: '2022-03-15',
    lastActive: '2023-11-10T14:30:00Z',
    permissions: ['view_clients', 'send_comms', 'manage_team_tasks'],
    profileImage: 'https://ui-avatars.com/api/?name=Alexandra+Thompson&background=6366f1&color=fff'
  },
  {
    id: 2,
    name: 'Michael Rodriguez',
    email: 'michael@savannahprime.com',
    role: 'Team Lead',
    department: 'Development',
    status: 'active',
    joinDate: '2022-05-22',
    lastActive: '2023-11-09T16:45:00Z',
    permissions: ['edit_services', 'manage_team_tasks', 'dev_access'],
    profileImage: 'https://ui-avatars.com/api/?name=Michael+Rodriguez&background=6366f1&color=fff'
  },
  {
    id: 3,
    name: 'Sarah Johnson',
    email: 'sarah@savannahprime.com',
    role: 'Content Manager',
    department: 'Content',
    status: 'active',
    joinDate: '2022-06-10',
    lastActive: '2023-11-10T11:20:00Z',
    permissions: ['send_comms', 'manage_team_tasks', 'content_edit'],
    profileImage: 'https://ui-avatars.com/api/?name=Sarah+Johnson&background=6366f1&color=fff'
  },
  {
    id: 4,
    name: 'David Chen',
    email: 'david@savannahprime.com',
    role: 'Staff Member',
    department: 'Support',
    status: 'inactive',
    joinDate: '2022-08-05',
    lastActive: '2023-10-28T09:15:00Z',
    permissions: ['view_clients', 'send_comms'],
    profileImage: 'https://ui-avatars.com/api/?name=David+Chen&background=6366f1&color=fff'
  },
  {
    id: 5,
    name: 'Emily Wilson',
    email: 'emily@savannahprime.com',
    role: 'Intern',
    department: 'Sales',
    status: 'active',
    joinDate: '2023-01-15',
    lastActive: '2023-11-10T13:40:00Z',
    permissions: ['view_clients'],
    profileImage: 'https://ui-avatars.com/api/?name=Emily+Wilson&background=6366f1&color=fff'
  },
  {
    id: 6,
    name: 'James Taylor',
    email: 'james@savannahprime.com',
    role: 'Department Manager',
    department: 'Sales',
    status: 'active',
    joinDate: '2022-02-18',
    lastActive: '2023-11-09T15:30:00Z',
    permissions: ['view_clients', 'send_comms', 'manage_team_tasks', 'sales_data'],
    profileImage: 'https://ui-avatars.com/api/?name=James+Taylor&background=6366f1&color=fff'
  },
  {
    id: 7,
    name: 'Olivia Garcia',
    email: 'olivia@savannahprime.com',
    role: 'Staff Member',
    department: 'Marketing',
    status: 'active',
    joinDate: '2022-09-12',
    lastActive: '2023-11-08T10:50:00Z',
    permissions: ['view_clients', 'send_comms'],
    profileImage: 'https://ui-avatars.com/api/?name=Olivia+Garcia&background=6366f1&color=fff'
  }
];

const roleColors: Record<string, string> = {
  'Super Admin': 'bg-purple-100 text-purple-800 border-purple-300',
  'Department Manager': 'bg-blue-100 text-blue-800 border-blue-300',
  'Team Lead': 'bg-green-100 text-green-800 border-green-300',
  'Staff Member': 'bg-orange-100 text-orange-800 border-orange-300',
  'Intern': 'bg-gray-100 text-gray-800 border-gray-300'
};

const statusColors: Record<string, string> = {
  active: 'bg-green-500',
  inactive: 'bg-gray-500',
  suspended: 'bg-red-500'
};

const EmployeeDirectorySection: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [selectedRole, setSelectedRole] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  
  // Filter employees based on search and filters
  const filteredEmployees = employees.filter(employee => {
    const matchesSearch = 
      employee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      employee.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesDepartment = 
      selectedDepartment === 'all' || 
      employee.department.toLowerCase() === selectedDepartment.toLowerCase();
    
    const matchesRole = 
      selectedRole === 'all' || 
      employee.role.toLowerCase() === selectedRole.toLowerCase();
    
    return matchesSearch && matchesDepartment && matchesRole;
  });
  
  // Get current page employees
  const indexOfLastEmployee = currentPage * itemsPerPage;
  const indexOfFirstEmployee = indexOfLastEmployee - itemsPerPage;
  const currentEmployees = filteredEmployees.slice(indexOfFirstEmployee, indexOfLastEmployee);
  
  // Format date to readable format
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  // Format time from ISO to relative time
  const formatLastActive = (isoDate: string) => {
    const date = new Date(isoDate);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours !== 1 ? 's' : ''} ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays} day${diffInDays !== 1 ? 's' : ''} ago`;
    }
  };
  
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search employees..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 w-[200px] sm:w-[300px]"
            />
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <DropdownMenuLabel>Filter Options</DropdownMenuLabel>
              <DropdownMenuSeparator />
              
              <div className="p-2">
                <p className="text-sm font-medium mb-2">Department</p>
                <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
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
              </div>
              
              <div className="p-2">
                <p className="text-sm font-medium mb-2">Role</p>
                <Select value={selectedRole} onValueChange={setSelectedRole}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="super admin">Super Admin</SelectItem>
                    <SelectItem value="department manager">Department Manager</SelectItem>
                    <SelectItem value="team lead">Team Lead</SelectItem>
                    <SelectItem value="staff member">Staff Member</SelectItem>
                    <SelectItem value="intern">Intern</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => {
                setSelectedDepartment('all');
                setSelectedRole('all');
                setSearchQuery('');
              }}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Reset All Filters
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="px-3 py-1">
            Total: {filteredEmployees.length} employees
          </Badge>
        </div>
      </div>
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Employee</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Join Date</TableHead>
              <TableHead>Last Active</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentEmployees.length > 0 ? (
              currentEmployees.map((employee) => (
                <TableRow key={employee.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full overflow-hidden">
                        <img 
                          src={employee.profileImage} 
                          alt={employee.name} 
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div>
                        <p className="font-medium">{employee.name}</p>
                        <p className="text-sm text-muted-foreground">{employee.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant="outline"
                      className={roleColors[employee.role] || 'bg-gray-100 text-gray-800'}
                    >
                      {employee.role}
                    </Badge>
                  </TableCell>
                  <TableCell>{employee.department}</TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <div className={`h-2 w-2 rounded-full ${statusColors[employee.status]} mr-2`} />
                      <span className="capitalize">{employee.status}</span>
                    </div>
                  </TableCell>
                  <TableCell>{formatDate(employee.joinDate)}</TableCell>
                  <TableCell>{formatLastActive(employee.lastActive)}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                          <Eye className="mr-2 h-4 w-4" />
                          View Profile
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit Employee
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Key className="mr-2 h-4 w-4" />
                          Manage Permissions
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <ClipboardList className="mr-2 h-4 w-4" />
                          Assign Tasks
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-amber-600">
                          <AlertCircle className="mr-2 h-4 w-4" />
                          Send Warning
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600">
                          <Clock className="mr-2 h-4 w-4" />
                          Set Inactive
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-4 text-muted-foreground">
                  No employees found matching the criteria
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      
      <div className="mt-4">
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious 
                href="#" 
                onClick={(e) => {
                  e.preventDefault();
                  setCurrentPage(prev => Math.max(1, prev - 1));
                }}
              />
            </PaginationItem>
            
            {Array.from({ length: Math.ceil(filteredEmployees.length / itemsPerPage) }).map((_, index) => (
              <PaginationItem key={index}>
                <PaginationLink 
                  href="#" 
                  isActive={currentPage === index + 1}
                  onClick={(e) => {
                    e.preventDefault();
                    setCurrentPage(index + 1);
                  }}
                >
                  {index + 1}
                </PaginationLink>
              </PaginationItem>
            ))}
            
            <PaginationItem>
              <PaginationNext 
                href="#" 
                onClick={(e) => {
                  e.preventDefault();
                  setCurrentPage(prev => 
                    Math.min(Math.ceil(filteredEmployees.length / itemsPerPage), prev + 1)
                  );
                }}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
};

export default EmployeeDirectorySection;
