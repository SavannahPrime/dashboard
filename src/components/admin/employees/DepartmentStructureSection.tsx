
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, PlusCircle, UsersRound, Building } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

interface Department {
  id: string;
  name: string;
  description: string;
  manager_id?: string;
  created_at: string;
  employeeCount?: number;
}

const DepartmentStructureSection: React.FC = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newDepartment, setNewDepartment] = useState({
    name: '',
    description: '',
  });

  const fetchDepartments = async () => {
    setIsLoading(true);
    try {
      // First fetch departments
      const { data: departmentsData, error: departmentsError } = await supabase
        .from('departments')
        .select('*')
        .order('name');

      if (departmentsError) throw departmentsError;

      // Then fetch employee counts per department
      const employeeCounts = [];
      for (const dept of departmentsData || []) {
        const { count, error } = await supabase
          .from('employees')
          .select('*', { count: 'exact', head: true })
          .eq('department', dept.name);
          
        if (error) throw error;
        
        employeeCounts.push({
          departmentId: dept.id,
          count: count || 0
        });
      }

      // Combine the data
      const departmentsWithCounts = departmentsData?.map(dept => ({
        ...dept,
        employeeCount: employeeCounts.find(ec => ec.departmentId === dept.id)?.count || 0
      }));

      setDepartments(departmentsWithCounts || []);
    } catch (error) {
      console.error('Error fetching departments:', error);
      toast.error('Failed to load departments');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const handleCreateDepartment = async () => {
    if (!newDepartment.name || !newDepartment.description) {
      toast.error('Department name and description are required');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('departments')
        .insert({
          name: newDepartment.name,
          description: newDepartment.description,
        })
        .select()
        .single();

      if (error) throw error;

      toast.success(`Department "${newDepartment.name}" created successfully`);
      setNewDepartment({ name: '', description: '' });
      setIsDialogOpen(false);
      fetchDepartments();
    } catch (error: any) {
      console.error('Error creating department:', error);
      toast.error(error.message || 'Failed to create department');
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-xl font-bold">Department Structure</CardTitle>
          <CardDescription>
            Organization departments and staff allocation
          </CardDescription>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Department
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Department</DialogTitle>
              <DialogDescription>
                Add a new department to your organization structure.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Department Name</Label>
                <Input
                  id="name"
                  value={newDepartment.name}
                  onChange={(e) => setNewDepartment({ ...newDepartment, name: e.target.value })}
                  placeholder="e.g., Finance"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Department Description</Label>
                <Textarea
                  id="description"
                  value={newDepartment.description}
                  onChange={(e) => setNewDepartment({ ...newDepartment, description: e.target.value })}
                  placeholder="What is this department responsible for?"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleCreateDepartment}>Create Department</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-6">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : departments.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {departments.map((department) => (
              <Card key={department.id} className="overflow-hidden">
                <CardHeader className="bg-muted/30 pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-base font-medium">{department.name}</CardTitle>
                    <Building className="h-5 w-5 text-muted-foreground" />
                  </div>
                </CardHeader>
                <CardContent className="text-sm pt-4">
                  <p className="text-muted-foreground mb-2">{department.description}</p>
                  <div className="flex items-center gap-2 mt-4">
                    <UsersRound className="h-4 w-4 text-muted-foreground" />
                    <Badge variant="secondary">{department.employeeCount} Employees</Badge>
                  </div>
                </CardContent>
                <CardFooter className="bg-muted/20 justify-end">
                  <Button variant="ghost" size="sm">View Details</Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-6">
            <Building className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
            <h3 className="text-lg font-medium">No Departments Found</h3>
            <p className="text-muted-foreground mb-4">
              Get started by creating your first department
            </p>
            <Button onClick={() => setIsDialogOpen(true)}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Department
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DepartmentStructureSection;
