
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Download, Edit, Loader2, MoreHorizontal, PlusCircle, Trash2, Users } from 'lucide-react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface Department {
  id: string;
  name: string;
  description: string;
  employeeCount: number;
  createdAt: string;
  manager?: string;
}

const DepartmentStructureSection: React.FC = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddDepartmentOpen, setIsAddDepartmentOpen] = useState(false);
  const [isEditDepartmentOpen, setIsEditDepartmentOpen] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
  const [newDepartment, setNewDepartment] = useState({
    name: '',
    description: '',
    manager: ''
  });
  
  const fetchDepartments = async () => {
    setIsLoading(true);
    try {
      // Get departments from database
      const { data, error } = await supabase
        .from('departments')
        .select('*')
        .order('name', { ascending: true });
      
      if (error) throw error;
      
      // Get employee counts for each department
      const { data: employeeCountData, error: countError } = await supabase
        .from('employees')
        .select('department, count')
        .group('department');
      
      if (countError) throw countError;
      
      // Convert to a map for easier access
      const employeeCounts = employeeCountData?.reduce<Record<string, number>>((acc, curr) => {
        acc[curr.department] = curr.count;
        return acc;
      }, {}) || {};
      
      const formattedDepartments = data?.map(dept => ({
        id: dept.id,
        name: dept.name,
        description: dept.description || '',
        employeeCount: employeeCounts[dept.name] || 0,
        createdAt: dept.created_at,
        manager: dept.manager_id || ''
      })) || [];
      
      setDepartments(formattedDepartments);
    } catch (error) {
      console.error('Error fetching departments:', error);
      toast.error('Failed to load departments');
    } finally {
      setIsLoading(false);
    }
  };
  
  const fetchEmployees = async () => {
    try {
      const { data, error } = await supabase
        .from('employees')
        .select('id, name, role')
        .in('role', ['Department Manager', 'Team Lead', 'Super Admin'])
        .eq('status', 'active')
        .order('name', { ascending: true });
      
      if (error) throw error;
      
      setEmployees(data || []);
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };
  
  useEffect(() => {
    fetchDepartments();
    fetchEmployees();
    
    // Set up realtime subscription for department updates
    const channel = supabase
      .channel('public:departments')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'departments' 
      }, () => {
        fetchDepartments(); // Refresh when departments are updated
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);
  
  const handleAddDepartment = async () => {
    if (!newDepartment.name) {
      toast.error('Department name is required');
      return;
    }
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('departments')
        .insert({
          name: newDepartment.name,
          description: newDepartment.description,
          manager_id: newDepartment.manager || null
        })
        .select()
        .single();
      
      if (error) throw error;
      
      toast.success('Department added successfully');
      setIsAddDepartmentOpen(false);
      setNewDepartment({
        name: '',
        description: '',
        manager: ''
      });
      
      await fetchDepartments();
      
    } catch (error) {
      console.error('Error adding department:', error);
      toast.error('Failed to add department');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleEditDepartment = async () => {
    if (!selectedDepartment) return;
    
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('departments')
        .update({
          name: selectedDepartment.name,
          description: selectedDepartment.description,
          manager_id: selectedDepartment.manager || null
        })
        .eq('id', selectedDepartment.id);
      
      if (error) throw error;
      
      toast.success('Department updated successfully');
      setIsEditDepartmentOpen(false);
      setSelectedDepartment(null);
      
      await fetchDepartments();
      
    } catch (error) {
      console.error('Error updating department:', error);
      toast.error('Failed to update department');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDeleteDepartment = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this department?')) return;
    
    try {
      // First check if there are employees in this department
      const { data: employeesInDept, error: countError } = await supabase
        .from('employees')
        .select('count')
        .eq('department', departments.find(d => d.id === id)?.name || '');
      
      if (countError) throw countError;
      
      if (employeesInDept && employeesInDept.length > 0 && employeesInDept[0].count > 0) {
        toast.error('Cannot delete department with assigned employees');
        return;
      }
      
      const { error } = await supabase
        .from('departments')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      toast.success('Department deleted successfully');
      await fetchDepartments();
      
    } catch (error) {
      console.error('Error deleting department:', error);
      toast.error('Failed to delete department');
    }
  };
  
  const handleExportDepartments = () => {
    // Format departments data for export
    const exportData = departments.map(dept => ({
      ID: dept.id,
      Name: dept.name,
      Description: dept.description,
      'Employee Count': dept.employeeCount,
      'Created At': formatDate(dept.createdAt),
      Manager: employees.find(e => e.id === dept.manager)?.name || 'None'
    }));

    // Convert to CSV
    const headers = Object.keys(exportData[0]);
    const csvContent = [
      headers.join(','),
      ...exportData.map(row => headers.map(header => JSON.stringify(row[header as keyof typeof row])).join(','))
    ].join('\n');

    // Create a blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `departments_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('Departments exported successfully');
  };
  
  // Format date to readable format
  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between">
        <h3 className="text-xl font-medium">Department Structure</h3>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportDepartments}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button onClick={() => setIsAddDepartmentOpen(true)}>
            <PlusCircle className="h-4 w-4 mr-2" />
            Add Department
          </Button>
        </div>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : departments.length > 0 ? (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Department</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Manager</TableHead>
                  <TableHead>Employees</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {departments.map(dept => (
                  <TableRow key={dept.id}>
                    <TableCell className="font-medium">{dept.name}</TableCell>
                    <TableCell className="max-w-[300px] truncate">{dept.description}</TableCell>
                    <TableCell>
                      {employees.find(e => e.id === dept.manager)?.name || 'None'}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {dept.employeeCount}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(dept.createdAt)}</TableCell>
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
                          <DropdownMenuItem onClick={() => {
                            setSelectedDepartment(dept);
                            setIsEditDepartmentOpen(true);
                          }}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Department
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => toast.success(`Viewing ${dept.name} employees`)}>
                            <Users className="mr-2 h-4 w-4" />
                            View Employees
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => handleDeleteDepartment(dept.id)}
                            className="text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete Department
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-6">
            <p className="text-muted-foreground text-center">No departments have been created yet</p>
            <Button 
              className="mt-4"
              onClick={() => setIsAddDepartmentOpen(true)}
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Your First Department
            </Button>
          </CardContent>
        </Card>
      )}
      
      {/* Add Department Dialog */}
      <Dialog open={isAddDepartmentOpen} onOpenChange={setIsAddDepartmentOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add New Department</DialogTitle>
            <DialogDescription>
              Create a new department to organize your employees.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                className="col-span-3"
                value={newDepartment.name}
                onChange={(e) => setNewDepartment({ ...newDepartment, name: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="description" className="text-right pt-2">
                Description
              </Label>
              <Textarea
                id="description"
                className="col-span-3"
                value={newDepartment.description}
                onChange={(e) => setNewDepartment({ ...newDepartment, description: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="manager" className="text-right">
                Manager
              </Label>
              <select
                id="manager"
                className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={newDepartment.manager}
                onChange={(e) => setNewDepartment({ ...newDepartment, manager: e.target.value })}
              >
                <option value="">Select a manager (optional)</option>
                {employees.map(emp => (
                  <option key={emp.id} value={emp.id}>{emp.name} - {emp.role}</option>
                ))}
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDepartmentOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddDepartment} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                'Add Department'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Edit Department Dialog */}
      <Dialog open={isEditDepartmentOpen} onOpenChange={setIsEditDepartmentOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Department</DialogTitle>
            <DialogDescription>
              Update department information.
            </DialogDescription>
          </DialogHeader>
          {selectedDepartment && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-name" className="text-right">
                  Name
                </Label>
                <Input
                  id="edit-name"
                  className="col-span-3"
                  value={selectedDepartment.name}
                  onChange={(e) => setSelectedDepartment({ ...selectedDepartment, name: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="edit-description" className="text-right pt-2">
                  Description
                </Label>
                <Textarea
                  id="edit-description"
                  className="col-span-3"
                  value={selectedDepartment.description}
                  onChange={(e) => setSelectedDepartment({ ...selectedDepartment, description: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-manager" className="text-right">
                  Manager
                </Label>
                <select
                  id="edit-manager"
                  className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={selectedDepartment.manager || ''}
                  onChange={(e) => setSelectedDepartment({ ...selectedDepartment, manager: e.target.value })}
                >
                  <option value="">Select a manager (optional)</option>
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.name} - {emp.role}</option>
                  ))}
                </select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsEditDepartmentOpen(false);
              setSelectedDepartment(null);
            }}>
              Cancel
            </Button>
            <Button onClick={handleEditDepartment} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DepartmentStructureSection;
