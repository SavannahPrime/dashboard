
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Loader2, PlusCircle, Search, User, Download, Mail, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Checkbox } from '@/components/ui/checkbox';

interface Employee {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  status: string;
  permissions: string[];
  profile_image?: string;
  created_at: string;
  last_active: string;
}

const EmployeeDirectorySection: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [departments, setDepartments] = useState<string[]>([]);
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [newEmployee, setNewEmployee] = useState({
    name: '',
    email: '',
    role: 'staff',
    department: '',
    permissions: [] as string[]
  });
  
  useEffect(() => {
    fetchEmployees();
    fetchDepartments();
  }, []);
  
  const fetchEmployees = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .order('name');
      
      if (error) throw error;
      
      setEmployees(data || []);
      setFilteredEmployees(data || []);
    } catch (error) {
      console.error('Error fetching employees:', error);
      toast.error('Failed to load employees');
    } finally {
      setIsLoading(false);
    }
  };
  
  const fetchDepartments = async () => {
    try {
      const { data, error } = await supabase
        .from('departments')
        .select('name')
        .order('name');
      
      if (error) throw error;
      
      setDepartments(data.map(d => d.name) || []);
      
      // Set the first department as default for new employee if available
      if (data && data.length > 0) {
        setNewEmployee(prev => ({ ...prev, department: data[0].name }));
      }
    } catch (error) {
      console.error('Error fetching departments:', error);
      toast.error('Failed to load departments');
    }
  };
  
  useEffect(() => {
    filterEmployees();
  }, [searchQuery, activeTab, selectedDepartment, employees]);
  
  const filterEmployees = () => {
    let filtered = [...employees];
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(emp => 
        emp.name.toLowerCase().includes(query) || 
        emp.email.toLowerCase().includes(query) ||
        emp.role.toLowerCase().includes(query)
      );
    }
    
    // Filter by tab (status)
    if (activeTab !== 'all') {
      filtered = filtered.filter(emp => emp.status === activeTab);
    }
    
    // Filter by department
    if (selectedDepartment !== 'all') {
      filtered = filtered.filter(emp => emp.department === selectedDepartment);
    }
    
    setFilteredEmployees(filtered);
  };
  
  const handleAddEmployee = async () => {
    // Validate form
    if (!newEmployee.name || !newEmployee.email || !newEmployee.department) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    setIsSubmitting(true);
    try {
      const { data, error } = await supabase
        .from('employees')
        .insert({
          name: newEmployee.name,
          email: newEmployee.email,
          role: newEmployee.role,
          department: newEmployee.department,
          permissions: newEmployee.permissions,
          status: 'active'
        })
        .select()
        .single();
      
      if (error) throw error;
      
      toast.success(`Employee ${newEmployee.name} added successfully`);
      setIsAddDialogOpen(false);
      
      // Reset form
      setNewEmployee({
        name: '',
        email: '',
        role: 'staff',
        department: departments[0] || '',
        permissions: []
      });
      
      // Refresh employee list
      fetchEmployees();
    } catch (error: any) {
      console.error('Error adding employee:', error);
      toast.error(error.message || 'Failed to add employee');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleExportEmployees = () => {
    try {
      const dataToExport = filteredEmployees.map(emp => ({
        Name: emp.name,
        Email: emp.email,
        Role: emp.role,
        Department: emp.department,
        Status: emp.status,
        'Created At': new Date(emp.created_at).toLocaleDateString()
      }));
      
      // Convert to CSV
      const headers = Object.keys(dataToExport[0]);
      const csvRows = [];
      
      csvRows.push(headers.join(','));
      
      for (const row of dataToExport) {
        const values = headers.map(header => {
          const escaped = ('' + row[header as keyof typeof row]).replace(/"/g, '\\"');
          return `"${escaped}"`;
        });
        csvRows.push(values.join(','));
      }
      
      const csvString = csvRows.join('\n');
      const blob = new Blob([csvString], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.setAttribute('hidden', '');
      a.setAttribute('href', url);
      a.setAttribute('download', 'employees.csv');
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      toast.success('Employee data exported successfully');
    } catch (error) {
      console.error('Error exporting employee data:', error);
      toast.error('Failed to export employee data');
    }
  };
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  const handleToggleEmployeeStatus = async (employee: Employee) => {
    const newStatus = employee.status === 'active' ? 'inactive' : 'active';
    
    try {
      const { error } = await supabase
        .from('employees')
        .update({ status: newStatus })
        .eq('id', employee.id);
      
      if (error) throw error;
      
      toast.success(`Employee ${employee.name} is now ${newStatus}`);
      
      // Update locally
      setEmployees(employees.map(emp => 
        emp.id === employee.id ? { ...emp, status: newStatus } : emp
      ));
    } catch (error) {
      console.error('Error updating employee status:', error);
      toast.error('Failed to update employee status');
    }
  };
  
  const permissions = [
    { id: 'view_clients', label: 'View Clients' },
    { id: 'manage_clients', label: 'Manage Clients' },
    { id: 'view_finances', label: 'View Finances' },
    { id: 'manage_finances', label: 'Manage Finances' },
    { id: 'view_tasks', label: 'View Tasks' },
    { id: 'manage_tasks', label: 'Manage Tasks' },
    { id: 'admin_access', label: 'Admin Access' }
  ];
  
  return (
    <Card className="col-span-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-xl font-bold">Employee Directory</CardTitle>
          <CardDescription>
            Manage your team members and their roles
          </CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleExportEmployees}
            disabled={filteredEmployees.length === 0}
          >
            <Download className="h-4 w-4 mr-1" />
            Export
          </Button>
          
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <PlusCircle className="h-4 w-4 mr-1" />
                Add Employee
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Add New Employee</DialogTitle>
                <DialogDescription>
                  Add a new employee to your organization.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={newEmployee.name}
                    onChange={(e) => setNewEmployee({ ...newEmployee, name: e.target.value })}
                    placeholder="John Doe"
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newEmployee.email}
                    onChange={(e) => setNewEmployee({ ...newEmployee, email: e.target.value })}
                    placeholder="john.doe@example.com"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="role">Role</Label>
                    <Select 
                      value={newEmployee.role} 
                      onValueChange={(value) => setNewEmployee({ ...newEmployee, role: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="manager">Manager</SelectItem>
                        <SelectItem value="staff">Staff</SelectItem>
                        <SelectItem value="intern">Intern</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="department">Department</Label>
                    <Select 
                      value={newEmployee.department} 
                      onValueChange={(value) => setNewEmployee({ ...newEmployee, department: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent>
                        {departments.map((dept) => (
                          <SelectItem key={dept} value={dept}>
                            {dept}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="grid gap-2">
                  <Label>Permissions</Label>
                  <div className="grid grid-cols-2 gap-2 border rounded-md p-3">
                    {permissions.map((permission) => (
                      <div key={permission.id} className="flex items-center space-x-2">
                        <Checkbox 
                          id={permission.id}
                          checked={newEmployee.permissions.includes(permission.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setNewEmployee({
                                ...newEmployee,
                                permissions: [...newEmployee.permissions, permission.id]
                              });
                            } else {
                              setNewEmployee({
                                ...newEmployee,
                                permissions: newEmployee.permissions.filter(p => p !== permission.id)
                              });
                            }
                          }}
                        />
                        <label 
                          htmlFor={permission.id}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {permission.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddEmployee} disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    'Add Employee'
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 justify-between">
            <div className="flex space-x-2">
              <Tabs defaultValue={activeTab} value={activeTab} onValueChange={setActiveTab}>
                <TabsList>
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="active">Active</TabsTrigger>
                  <TabsTrigger value="inactive">Inactive</TabsTrigger>
                </TabsList>
              </Tabs>
              
              <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All Departments" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  {departments.map((dept) => (
                    <SelectItem key={dept} value={dept}>
                      {dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search employees..."
                className="pl-8 w-full sm:w-[250px]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
          ) : filteredEmployees.length === 0 ? (
            <div className="text-center py-12 border rounded-md">
              <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No Employees Found</h3>
              <p className="text-muted-foreground mb-6">
                {searchQuery || activeTab !== 'all' || selectedDepartment !== 'all' ? 
                  'Try adjusting your search or filters' : 
                  'Add your first employee to get started'}
              </p>
              <Button onClick={() => setIsAddDialogOpen(true)}>
                <PlusCircle className="h-4 w-4 mr-2" />
                Add Employee
              </Button>
            </div>
          ) : (
            <div className="rounded-md border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-muted/50">
                      <th className="text-left font-medium text-muted-foreground p-3">Employee</th>
                      <th className="text-left font-medium text-muted-foreground p-3">Department</th>
                      <th className="text-left font-medium text-muted-foreground p-3">Role</th>
                      <th className="text-left font-medium text-muted-foreground p-3">Status</th>
                      <th className="text-left font-medium text-muted-foreground p-3">Joined</th>
                      <th className="text-right font-medium text-muted-foreground p-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredEmployees.map((employee) => (
                      <tr key={employee.id} className="border-t hover:bg-muted/50">
                        <td className="p-3">
                          <div className="flex items-center">
                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center mr-2">
                              {employee.profile_image ? (
                                <img 
                                  src={employee.profile_image}
                                  alt={employee.name}
                                  className="h-8 w-8 rounded-full object-cover"
                                />
                              ) : (
                                <span className="text-sm font-medium text-primary">
                                  {employee.name.charAt(0)}
                                </span>
                              )}
                            </div>
                            <div>
                              <div className="font-medium">{employee.name}</div>
                              <div className="text-sm text-muted-foreground flex items-center">
                                <Mail className="h-3 w-3 mr-1" />
                                {employee.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="p-3">{employee.department}</td>
                        <td className="p-3">
                          <Badge variant="outline">{employee.role}</Badge>
                        </td>
                        <td className="p-3">
                          <Badge variant={employee.status === 'active' ? 'default' : 'secondary'}>
                            {employee.status}
                          </Badge>
                        </td>
                        <td className="p-3">
                          <span className="flex items-center text-muted-foreground text-sm">
                            <Clock className="h-3 w-3 mr-1" />
                            {formatDate(employee.created_at)}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                            >
                              Edit
                            </Button>
                            <Button
                              variant={employee.status === 'active' ? 'destructive' : 'outline'}
                              size="sm"
                              onClick={() => handleToggleEmployeeStatus(employee)}
                            >
                              {employee.status === 'active' ? 'Deactivate' : 'Activate'}
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default EmployeeDirectorySection;
