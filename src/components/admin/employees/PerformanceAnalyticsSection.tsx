import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface EmployeePerformance {
  name: string;
  completedTasks: number;
  ongoingTasks: number;
  overdueTasks: number;
  totalTasks: number;
  performance: number;
}

interface DepartmentPerformance {
  department: string;
  completedTasks: number;
  totalEmployees: number;
  avgPerformance: number;
}

const PerformanceAnalyticsSection: React.FC = () => {
  const [timeRange, setTimeRange] = useState('month');
  const [isLoading, setIsLoading] = useState(true);
  const [employeePerformance, setEmployeePerformance] = useState<EmployeePerformance[]>([]);
  const [departmentPerformance, setDepartmentPerformance] = useState<DepartmentPerformance[]>([]);
  
  const fetchPerformanceData = async () => {
    setIsLoading(true);
    try {
      // Get date range based on selected time period
      const today = new Date();
      let startDate = new Date();
      
      if (timeRange === 'week') {
        startDate.setDate(today.getDate() - 7);
      } else if (timeRange === 'month') {
        startDate.setMonth(today.getMonth() - 1);
      } else if (timeRange === 'quarter') {
        startDate.setMonth(today.getMonth() - 3);
      } else if (timeRange === 'year') {
        startDate.setFullYear(today.getFullYear() - 1);
      }
      
      const startDateIso = startDate.toISOString();
      
      // Fetch employees
      const { data: employees, error: employeesError } = await supabase
        .from('employees')
        .select('id, name, department')
        .eq('status', 'active');
      
      if (employeesError) throw employeesError;
      
      // Fetch tasks and calculate performance by employee
      const employeeData: EmployeePerformance[] = [];
      
      for (const employee of employees || []) {
        // Get all tasks assigned to this employee within the time range
        const { data: tasks, error: tasksError } = await supabase
          .from('tasks')
          .select('*')
          .eq('assigned_to', employee.id)
          .gte('created_at', startDateIso);
        
        if (tasksError) throw tasksError;
        
        // Calculate metrics
        const totalTasks = tasks?.length || 0;
        const completedTasks = tasks?.filter(t => t.status === 'done').length || 0;
        const ongoingTasks = tasks?.filter(t => ['todo', 'in-progress', 'review'].includes(t.status)).length || 0;
        
        // Calculate overdue tasks
        const overdueTasks = tasks?.filter(task => {
          if (task.status === 'done' || !task.due_date) return false;
          const dueDate = new Date(task.due_date);
          return dueDate < today;
        }).length || 0;
        
        // Calculate performance score (completed tasks / total tasks * 100)
        // If no tasks, set to 0
        const performance = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
        
        employeeData.push({
          name: employee.name,
          completedTasks,
          ongoingTasks,
          overdueTasks,
          totalTasks,
          performance: Math.round(performance)
        });
      }
      
      // Sort by performance (highest first)
      employeeData.sort((a, b) => b.performance - a.performance);
      
      // Only keep top 10 employees
      setEmployeePerformance(employeeData.slice(0, 10));
      
      // Calculate department performance
      const departmentMap = new Map<string, { 
        completedTasks: number, 
        totalTasks: number, 
        employees: Set<string>
      }>();
      
      // Initialize with employees from each department
      for (const employee of employees || []) {
        if (!departmentMap.has(employee.department)) {
          departmentMap.set(employee.department, {
            completedTasks: 0,
            totalTasks: 0,
            employees: new Set([employee.id])
          });
        } else {
          departmentMap.get(employee.department)?.employees.add(employee.id);
        }
      }
      
      // Get all tasks within the time range
      const { data: allTasks, error: allTasksError } = await supabase
        .from('tasks')
        .select('status, assigned_to')
        .gte('created_at', startDateIso);
      
      if (allTasksError) throw allTasksError;
      
      // For each task, find employee and increment department counts
      for (const task of allTasks || []) {
        const employeeInfo = employees?.find(e => e.id === task.assigned_to);
        if (employeeInfo) {
          const dept = departmentMap.get(employeeInfo.department);
          if (dept) {
            dept.totalTasks++;
            if (task.status === 'done') {
              dept.completedTasks++;
            }
          }
        }
      }
      
      // Convert map to array
      const deptData: DepartmentPerformance[] = [];
      
      departmentMap.forEach((value, department) => {
        const avgPerformance = value.totalTasks > 0 
          ? (value.completedTasks / value.totalTasks) * 100 
          : 0;
        
        deptData.push({
          department,
          completedTasks: value.completedTasks,
          totalEmployees: value.employees.size,
          avgPerformance: Math.round(avgPerformance)
        });
      });
      
      // Sort by average performance (highest first)
      deptData.sort((a, b) => b.avgPerformance - a.avgPerformance);
      
      setDepartmentPerformance(deptData);
    } catch (error) {
      console.error('Error fetching performance data:', error);
      toast.error('Failed to load performance analytics');
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    fetchPerformanceData();
  }, [timeRange]);
  
  const getPerformanceColor = (performance: number) => {
    if (performance >= 75) return '#10b981'; // Green for high performance
    if (performance >= 50) return '#f59e0b'; // Amber for medium performance
    return '#ef4444'; // Red for low performance
  };
  
  const renderChart = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center h-[300px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      );
    }
    
    if (employeePerformance.length === 0) {
      return (
        <div className="flex justify-center items-center h-[300px] text-muted-foreground">
          No performance data available
        </div>
      );
    }
    
    return (
      <ResponsiveContainer width="100%" height={400}>
        <BarChart
          data={employeePerformance}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 60,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="name" 
            tick={{ fill: 'currentColor', fontSize: 12 }}
            angle={-45}
            textAnchor="end"
            height={70}
          />
          <YAxis tick={{ fill: 'currentColor' }} />
          <Tooltip 
            formatter={(value, name) => {
              if (name === 'performance') return [`${value}%`, 'Performance'];
              return [value, name];
            }}
            contentStyle={{ backgroundColor: 'var(--background)', borderRadius: '4px', border: '1px solid var(--border)' }}
          />
          <Legend />
          <Bar dataKey="completedTasks" name="Completed Tasks" fill="#4ade80" />
          <Bar dataKey="ongoingTasks" name="Ongoing Tasks" fill="#60a5fa" />
          <Bar dataKey="overdueTasks" name="Overdue Tasks" fill="#f87171" />
        </BarChart>
      </ResponsiveContainer>
    );
  };
  
  const renderDepartmentChart = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center h-[300px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      );
    }
    
    if (departmentPerformance.length === 0) {
      return (
        <div className="flex justify-center items-center h-[300px] text-muted-foreground">
          No department data available
        </div>
      );
    }
    
    return (
      <ResponsiveContainer width="100%" height={300}>
        <LineChart
          data={departmentPerformance}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="department" tick={{ fill: 'currentColor' }} />
          <YAxis tick={{ fill: 'currentColor' }} />
          <Tooltip 
            formatter={(value, name) => {
              if (name === 'avgPerformance') return [`${value}%`, 'Avg. Performance'];
              if (name === 'totalEmployees') return [value, 'Team Size'];
              return [value, name];
            }}
            contentStyle={{ backgroundColor: 'var(--background)', borderRadius: '4px', border: '1px solid var(--border)' }}
          />
          <Legend />
          <Line type="monotone" dataKey="avgPerformance" name="Avg. Performance" stroke="#8884d8" activeDot={{ r: 8 }} />
          <Line type="monotone" dataKey="completedTasks" name="Completed Tasks" stroke="#4ade80" />
          <Line type="monotone" dataKey="totalEmployees" name="Team Size" stroke="#f59e0b" />
        </LineChart>
      </ResponsiveContainer>
    );
  };
  
  return (
    <Card className="col-span-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-xl font-bold">Performance Analytics</CardTitle>
          <CardDescription>
            Team and individual performance metrics
          </CardDescription>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select time range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="week">Last Week</SelectItem>
            <SelectItem value="month">Last Month</SelectItem>
            <SelectItem value="quarter">Last Quarter</SelectItem>
            <SelectItem value="year">Last Year</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          <div>
            <h3 className="text-lg font-medium mb-4">Employee Performance</h3>
            {renderChart()}
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-4">Department Performance</h3>
            {renderDepartmentChart()}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            {departmentPerformance.slice(0, 3).map((dept) => (
              <Card key={dept.department}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">{dept.department}</CardTitle>
                  <CardDescription>{dept.totalEmployees} team members</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold" style={{ color: getPerformanceColor(dept.avgPerformance) }}>
                    {dept.avgPerformance}%
                  </div>
                  <p className="text-sm text-muted-foreground">Performance Score</p>
                  <div className="mt-2 text-sm">
                    {dept.completedTasks} completed tasks
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PerformanceAnalyticsSection;
