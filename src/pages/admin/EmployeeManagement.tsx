
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import {
  UserPlus,
  Users,
  ShieldCheck,
  ClipboardList,
  BarChart3,
  Layers,
  GraduationCap
} from 'lucide-react';
import EmployeeDirectorySection from '@/components/admin/employees/EmployeeDirectorySection';
import PermissionsManagerSection from '@/components/admin/employees/PermissionsManagerSection';
import TaskBoardSection from '@/components/admin/employees/TaskBoardSection';
import PerformanceAnalyticsSection from '@/components/admin/employees/PerformanceAnalyticsSection';
import DepartmentStructureSection from '@/components/admin/employees/DepartmentStructureSection';
import TrainingResourcesSection from '@/components/admin/employees/TrainingResourcesSection';
import { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import AddEmployeeForm from '@/components/admin/employees/AddEmployeeForm';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Create a new QueryClient for this page
const queryClient = new QueryClient();

const EmployeeManagement: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(() => searchParams.get('tab') || 'directory');
  const [addEmployeeOpen, setAddEmployeeOpen] = useState(false);
  const navigate = useNavigate();
  
  // Sync the active tab with the URL parameter
  useEffect(() => {
    setSearchParams({ tab: activeTab });
  }, [activeTab, setSearchParams]);
  
  // Handle tab change
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    
    // Scroll to top when changing tabs
    window.scrollTo(0, 0);
  };
  
  return (
    <QueryClientProvider client={queryClient}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Employee Management</h1>
          <Button onClick={() => setAddEmployeeOpen(true)}>
            <UserPlus className="h-4 w-4 mr-2" />
            Add New Employee
          </Button>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Employee System</CardTitle>
            <CardDescription>
              Manage employees, roles, permissions, and tasks in a centralized interface.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="directory" value={activeTab} onValueChange={handleTabChange} className="space-y-6">
              <TabsList className="grid grid-cols-3 md:grid-cols-6 gap-2">
                <TabsTrigger value="directory" className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span className="hidden md:inline">Directory</span>
                </TabsTrigger>
                <TabsTrigger value="permissions" className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4" />
                  <span className="hidden md:inline">Permissions</span>
                </TabsTrigger>
                <TabsTrigger value="tasks" className="flex items-center gap-2">
                  <ClipboardList className="h-4 w-4" />
                  <span className="hidden md:inline">Tasks</span>
                </TabsTrigger>
                <TabsTrigger value="performance" className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  <span className="hidden md:inline">Performance</span>
                </TabsTrigger>
                <TabsTrigger value="departments" className="flex items-center gap-2">
                  <Layers className="h-4 w-4" />
                  <span className="hidden md:inline">Departments</span>
                </TabsTrigger>
                <TabsTrigger value="training" className="flex items-center gap-2">
                  <GraduationCap className="h-4 w-4" />
                  <span className="hidden md:inline">Training</span>
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="directory">
                <EmployeeDirectorySection />
              </TabsContent>
              
              <TabsContent value="permissions">
                <PermissionsManagerSection />
              </TabsContent>
              
              <TabsContent value="tasks">
                <TaskBoardSection />
              </TabsContent>
              
              <TabsContent value="performance">
                <PerformanceAnalyticsSection />
              </TabsContent>
              
              <TabsContent value="departments">
                <DepartmentStructureSection />
              </TabsContent>
              
              <TabsContent value="training">
                <TrainingResourcesSection />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
        
        <AddEmployeeForm 
          open={addEmployeeOpen}
          onOpenChange={setAddEmployeeOpen}
        />
      </div>
    </QueryClientProvider>
  );
};

export default EmployeeManagement;
