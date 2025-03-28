
import React, { useState, useEffect } from 'react';
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
  ClipboardList,
  UserPlus,
  Download,
  Loader2
} from 'lucide-react';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { useQuery } from '@tanstack/react-query';
import { fetchEmployees, updateEmployeeStatus } from '@/services/employeeService';
import { Employee } from '@/lib/types';
import { toast } from 'sonner';
import AddEmployeeForm from './AddEmployeeForm';

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
  const [addEmployeeOpen, setAddEmployeeOpen] = useState(false);
  const itemsPerPage = 5;
  
  // Fetch employees using React Query
  const { data: employees = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['employees'],
    queryFn: fetchEmployees
  });
  
  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedDepartment, selectedRole]);
  
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
    if (!dateString) return 'N/A';
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  // Format time from ISO to relative time
  const formatLastActive = (isoDate: string) => {
    if (!isoDate) return 'N/A';
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
  
  // Handle employee status change
  const handleStatusChange = async (employeeId: string, newStatus: 'active' | 'inactive' | 'suspended') => {
    try {
      await updateEmployeeStatus(employeeId, newStatus);
      toast.success(`Employee status updated to ${newStatus}`);
      refetch();
    } catch (error) {
      toast.error('Failed to update employee status');
      console.error('Error updating employee status:', error);
    }
  };
  
  // Export employees to CSV
  const exportToCSV = () => {
    // Only export filtered employees
    const employeesToExport = filteredEmployees;
    
    // Define the CSV headers
    const headers = ['Name', 'Email', 'Role', 'Department', 'Status', 'Join Date', 'Last Active'];
    
    // Convert the data to CSV format
    const csvData = employeesToExport.map(employee => [
      employee.name,
      employee.email,
      employee.role,
      employee.department,
      employee.status,
      formatDate(employee.joinDate),
      formatLastActive(employee.lastActive)
    ]);
    
    // Combine headers and data
    const csv = [headers, ...csvData].map(row => row.join(',')).join('\n');
    
    // Create a Blob and download link
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `employees_export_${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
          <Button 
            variant="outline" 
            size="sm" 
            onClick={exportToCSV}
            disabled={filteredEmployees.length === 0}
          >
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          
          <Button 
            size="sm"
            onClick={() => setAddEmployeeOpen(true)}
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Add Employee
          </Button>
          
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
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  <div className="flex flex-col items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
                    <p className="text-muted-foreground">Loading employees...</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : isError ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-red-500">
                  Error loading employees. Please try again.
                </TableCell>
              </TableRow>
            ) : currentEmployees.length > 0 ? (
              currentEmployees.map((employee) => (
                <TableRow key={employee.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full overflow-hidden">
                        <img 
                          src={employee.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(employee.name)}&background=6366f1&color=fff`} 
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
                        {employee.status === 'active' ? (
                          <DropdownMenuItem 
                            className="text-amber-600"
                            onClick={() => handleStatusChange(employee.id, 'inactive')}
                          >
                            <Clock className="mr-2 h-4 w-4" />
                            Set Inactive
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem 
                            className="text-green-600"
                            onClick={() => handleStatusChange(employee.id, 'active')}
                          >
                            <Clock className="mr-2 h-4 w-4" />
                            Set Active
                          </DropdownMenuItem>
                        )}
                        {employee.status !== 'suspended' ? (
                          <DropdownMenuItem 
                            className="text-red-600"
                            onClick={() => handleStatusChange(employee.id, 'suspended')}
                          >
                            <AlertCircle className="mr-2 h-4 w-4" />
                            Suspend Employee
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem 
                            className="text-green-600"
                            onClick={() => handleStatusChange(employee.id, 'active')}
                          >
                            <AlertCircle className="mr-2 h-4 w-4" />
                            Remove Suspension
                          </DropdownMenuItem>
                        )}
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
      
      {filteredEmployees.length > itemsPerPage && (
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
      )}
      
      <AddEmployeeForm 
        open={addEmployeeOpen} 
        onOpenChange={setAddEmployeeOpen} 
        onSuccess={() => refetch()}
      />
    </div>
  );
};

export default EmployeeDirectorySection;
