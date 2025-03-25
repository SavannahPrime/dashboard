
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
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
import {
  UserPlus,
  Search,
  Filter,
  MoreHorizontal,
  RefreshCw,
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

const EmployeeManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState('directory');
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Employee Management</h1>
        <Button>
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
          <Tabs defaultValue="directory" value={activeTab} onValueChange={setActiveTab} className="space-y-6">
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
    </div>
  );
};

export default EmployeeManagement;
