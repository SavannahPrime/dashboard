
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Layers, Users, User, Plus, Download, Edit, Trash, MoreHorizontal, Loader2 } from 'lucide-react';
import { fetchDepartments, deleteDepartment } from '@/services/departmentService';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import AddDepartmentForm from './AddDepartmentForm';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';

// Department layout component for the main list view
const DepartmentCard: React.FC<{
  id: string;
  name: string;
  description?: string;
  employeeCount: number;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}> = ({ id, name, description, employeeCount, onEdit, onDelete }) => {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className="flex items-center">
            <Layers className="h-5 w-5 text-primary mr-2" />
            <CardTitle className="text-lg">{name}</CardTitle>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onEdit(id)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit Department
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="text-red-600"
                onClick={() => onDelete(id)}
              >
                <Trash className="mr-2 h-4 w-4" />
                Delete Department
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        {description && (
          <CardDescription className="mt-1">{description}</CardDescription>
        )}
      </CardHeader>
      <CardContent>
        <div className="flex items-center text-muted-foreground">
          <Users className="h-4 w-4 mr-1" />
          <span>{employeeCount} {employeeCount === 1 ? 'employee' : 'employees'}</span>
        </div>
      </CardContent>
      <CardFooter className="pt-0">
        <Button variant="outline" size="sm" className="w-full">
          <User className="h-4 w-4 mr-2" />
          View Team
        </Button>
      </CardFooter>
    </Card>
  );
};

// Confirmation dialog for deleting a department
const DeleteConfirmationDialog: React.FC<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
  departmentName: string;
  onConfirm: () => void;
  isDeleting: boolean;
}> = ({ open, onOpenChange, departmentName, onConfirm, isDeleting }) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Department</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete the department "{departmentName}"? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button 
            variant="destructive" 
            onClick={onConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const DepartmentStructureSection: React.FC = () => {
  const [addDepartmentOpen, setAddDepartmentOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState<{ id: string; name: string } | null>(null);
  
  const queryClient = useQueryClient();
  
  // Fetch departments
  const { 
    data: departments = [], 
    isLoading, 
    isError 
  } = useQuery({
    queryKey: ['departments'],
    queryFn: fetchDepartments,
  });
  
  // Delete department mutation
  const deleteMutation = useMutation({
    mutationFn: (departmentId: string) => deleteDepartment(departmentId),
    onSuccess: () => {
      toast.success('Department deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      setDeleteDialogOpen(false);
      setSelectedDepartment(null);
    },
    onError: (error) => {
      toast.error('Failed to delete department');
      console.error('Error deleting department:', error);
    }
  });
  
  const handleDeleteClick = (id: string) => {
    const department = departments.find(dept => dept.id === id);
    if (department) {
      setSelectedDepartment({
        id: department.id,
        name: department.name
      });
      setDeleteDialogOpen(true);
    }
  };
  
  const handleEditClick = (id: string) => {
    // This will be implemented when we add the edit department form
    toast.info('Edit department functionality coming soon');
  };
  
  const confirmDelete = () => {
    if (selectedDepartment) {
      deleteMutation.mutate(selectedDepartment.id);
    }
  };
  
  // Export departments to CSV
  const exportToCSV = () => {
    // Define the CSV headers
    const headers = ['ID', 'Name', 'Description', 'Employee Count', 'Created At'];
    
    // Convert the data to CSV format
    const csvData = departments.map(dept => [
      dept.id,
      dept.name,
      dept.description || 'N/A',
      dept.employeeCount.toString(),
      new Date(dept.createdAt).toLocaleDateString()
    ]);
    
    // Combine headers and data
    const csv = [headers, ...csvData].map(row => row.join(',')).join('\n');
    
    // Create a Blob and download link
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `departments_export_${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Department Structure</h2>
        <div className="flex gap-2">
          <Button 
            variant="outline"
            onClick={exportToCSV}
            disabled={departments.length === 0}
          >
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Button onClick={() => setAddDepartmentOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Department
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          <div className="col-span-full flex items-center justify-center p-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
            <p>Loading departments...</p>
          </div>
        ) : isError ? (
          <div className="col-span-full text-center p-12 text-red-500">
            <p>Error loading departments. Please try again.</p>
          </div>
        ) : departments.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center p-12 border border-dashed rounded-lg">
            <Layers className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No Departments Yet</h3>
            <p className="text-muted-foreground text-center mb-4">
              Create departments to organize your team structure.
            </p>
            <Button onClick={() => setAddDepartmentOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Department
            </Button>
          </div>
        ) : (
          departments.map(department => (
            <DepartmentCard
              key={department.id}
              id={department.id}
              name={department.name}
              description={department.description}
              employeeCount={department.employeeCount}
              onEdit={handleEditClick}
              onDelete={handleDeleteClick}
            />
          ))
        )}
      </div>
      
      {/* Organization chart will be added here in a future enhancement */}
      
      <AddDepartmentForm 
        open={addDepartmentOpen}
        onOpenChange={setAddDepartmentOpen}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['departments'] });
        }}
      />
      
      <DeleteConfirmationDialog 
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        departmentName={selectedDepartment?.name || ''}
        onConfirm={confirmDelete}
        isDeleting={deleteMutation.isPending}
      />
    </div>
  );
};

export default DepartmentStructureSection;
