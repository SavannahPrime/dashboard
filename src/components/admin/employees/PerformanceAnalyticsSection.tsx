
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Activity, BarChart3, Calendar, Download, Loader2, PieChart as PieChartIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, PieChart, Pie, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface PerformanceData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor: string;
    borderColor: string;
  }[];
}

interface DepartmentPerformance {
  name: string;
  value: number;
}

interface EmployeePerformance {
  id: string;
  name: string;
  department: string;
  tasksCompleted: number;
  tasksAssigned: number;
  completionRate: number;
  onTimeRate: number;
  averageTimeToComplete: number; // in days
}

const PerformanceAnalyticsSection: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [timePeriod, setTimePeriod] = useState("last6months");
  const [viewType, setViewType] = useState("individual");
  const [performanceData, setPerformanceData] = useState<PerformanceData | null>(null);
  const [departmentData, setDepartmentData] = useState<DepartmentPerformance[]>([]);
  const [employeePerformance, setEmployeePerformance] = useState<EmployeePerformance[]>([]);
  const [productivityTrends, setProductivityTrends] = useState<any[]>([]);
  
  const fetchPerformanceData = async () => {
    setIsLoading(true);
    
    try {
      // Get tasks data
      let dateFilter;
      const now = new Date();
      switch (timePeriod) {
        case 'last30days':
          dateFilter = new Date(now.setDate(now.getDate() - 30)).toISOString();
          break;
        case 'last3months':
          dateFilter = new Date(now.setMonth(now.getMonth() - 3)).toISOString();
          break;
        case 'last6months':
          dateFilter = new Date(now.setMonth(now.getMonth() - 6)).toISOString();
          break;
        case 'lastyear':
          dateFilter = new Date(now.setFullYear(now.getFullYear() - 1)).toISOString();
          break;
        default:
          dateFilter = new Date(now.setMonth(now.getMonth() - 6)).toISOString();
      }
      
      // Get all tasks within the time period
      const { data: tasksData, error: tasksError } = await supabase
        .from('tasks')
        .select(`
          id,
          status,
          priority,
          assigned_to,
          due_date,
          created_at,
          completed_at,
          employees(name, department)
        `)
        .gte('created_at', dateFilter);
      
      if (tasksError) throw tasksError;
      
      if (!tasksData || tasksData.length === 0) {
        setIsLoading(false);
        return; // No tasks data available
      }
      
      // Get all employees
      const { data: employeesData, error: employeesError } = await supabase
        .from('employees')
        .select('id, name, department, role')
        .eq('status', 'active');
      
      if (employeesError) throw employeesError;
      
      // Calculate performance metrics for each employee
      const employeeMetrics = employeesData?.map(employee => {
        const employeeTasks = tasksData.filter(task => task.assigned_to === employee.id);
        const completedTasks = employeeTasks.filter(task => task.status === 'completed');
        const tasksAssigned = employeeTasks.length;
        const tasksCompleted = completedTasks.length;
        
        // Calculate on-time completion rate
        const onTimeCompletions = completedTasks.filter(task => {
          const completedAt = task.completed_at ? new Date(task.completed_at) : null;
          const dueDate = task.due_date ? new Date(task.due_date) : null;
          return completedAt && dueDate && completedAt <= dueDate;
        }).length;
        
        const onTimeRate = tasksCompleted > 0 ? (onTimeCompletions / tasksCompleted) * 100 : 0;
        
        // Calculate average time to complete
        const completionTimes = completedTasks.map(task => {
          const createdAt = new Date(task.created_at);
          const completedAt = task.completed_at ? new Date(task.completed_at) : new Date();
          return (completedAt.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24); // in days
        });
        
        const averageTimeToComplete = completionTimes.length > 0 
          ? completionTimes.reduce((sum, time) => sum + time, 0) / completionTimes.length 
          : 0;
        
        return {
          id: employee.id,
          name: employee.name,
          department: employee.department,
          tasksCompleted,
          tasksAssigned,
          completionRate: tasksAssigned > 0 ? (tasksCompleted / tasksAssigned) * 100 : 0,
          onTimeRate,
          averageTimeToComplete
        };
      }) || [];
      
      setEmployeePerformance(employeeMetrics);
      
      // Process department performance
      const departments = [...new Set(employeeMetrics.map(emp => emp.department))];
      const departmentPerformance = departments.map(dept => {
        const deptEmployees = employeeMetrics.filter(emp => emp.department === dept);
        const avgCompletionRate = deptEmployees.reduce((sum, emp) => sum + emp.completionRate, 0) / deptEmployees.length;
        
        return {
          name: dept,
          value: Math.round(avgCompletionRate)
        };
      });
      
      setDepartmentData(departmentPerformance);
      
      // Process monthly data for productivity trends
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const currentYear = new Date().getFullYear();
      
      // Group tasks by month
      const tasksByMonth = months.map((month, index) => {
        const monthTasks = tasksData.filter(task => {
          const taskDate = new Date(task.created_at);
          return taskDate.getMonth() === index && taskDate.getFullYear() === currentYear;
        });
        
        const completedInMonth = tasksByMonth.filter(task => {
          const completedAt = task.completed_at ? new Date(task.completed_at) : null;
          return completedAt && completedAt.getMonth() === index && completedAt.getFullYear() === currentYear;
        }).length;
        
        return {
          name: month,
          productivity: completedInMonth
        };
      });
      
      setProductivityTrends(tasksByMonth);
      
      // Process performance data for charts
      const labels = months.slice(0, 6); // Last 6 months
      const completedData = labels.map((_, index) => {
        const monthTasks = tasksData.filter(task => {
          const taskDate = new Date(task.created_at);
          const monthIndex = (new Date().getMonth() - 5 + index) % 12;
          return taskDate.getMonth() === monthIndex && task.status === 'completed';
        });
        
        return monthTasks.length;
      });
      
      const onTimeData = labels.map((_, index) => {
        const monthTasks = tasksData.filter(task => {
          const taskDate = new Date(task.created_at);
          const monthIndex = (new Date().getMonth() - 5 + index) % 12;
          return taskDate.getMonth() === monthIndex && task.status === 'completed';
        });
        
        const onTimeCount = monthTasks.filter(task => {
          const completedAt = task.completed_at ? new Date(task.completed_at) : null;
          const dueDate = task.due_date ? new Date(task.due_date) : null;
          return completedAt && dueDate && completedAt <= dueDate;
        }).length;
        
        return onTimeCount;
      });
      
      setPerformanceData({
        labels,
        datasets: [
          {
            label: 'Tasks Completed',
            data: completedData,
            backgroundColor: 'rgba(99, 102, 241, 0.5)',
            borderColor: 'rgb(99, 102, 241)',
          },
          {
            label: 'On-time Completion',
            data: onTimeData,
            backgroundColor: 'rgba(34, 197, 94, 0.5)',
            borderColor: 'rgb(34, 197, 94)',
          },
        ],
      });
      
    } catch (error) {
      console.error('Error fetching performance data:', error);
      toast.error('Failed to load performance data');
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    fetchPerformanceData();
  }, [timePeriod, viewType]);
  
  const handleExportReport = () => {
    // Export data based on the current tab
    let exportData;
    let filename;
    
    if (employeePerformance.length === 0) {
      toast.error('No data available to export');
      return;
    }
    
    // Format data for export
    exportData = employeePerformance.map(emp => ({
      Name: emp.name,
      Department: emp.department,
      'Tasks Assigned': emp.tasksAssigned,
      'Tasks Completed': emp.tasksCompleted,
      'Completion Rate (%)': emp.completionRate.toFixed(1),
      'On-time Rate (%)': emp.onTimeRate.toFixed(1),
      'Avg. Days to Complete': emp.averageTimeToComplete.toFixed(1)
    }));
    
    filename = `performance_report_${timePeriod}_${new Date().toISOString().split('T')[0]}.csv`;
    
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
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('Performance report exported successfully');
  };
  
  // Convert chart data to Recharts format
  const rechartsPerformanceData = performanceData?.labels.map((month, index) => ({
    name: month,
    'Tasks Completed': performanceData.datasets[0].data[index],
    'On-time Completion': performanceData.datasets[1].data[index],
  })) || [];
  
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading performance data...</span>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <Select defaultValue={viewType} onValueChange={setViewType}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="View type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="individual">Individual Performance</SelectItem>
              <SelectItem value="team">Team Performance</SelectItem>
              <SelectItem value="department">Department Performance</SelectItem>
            </SelectContent>
          </Select>
          
          <Select defaultValue={timePeriod} onValueChange={setTimePeriod}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Time period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="last30days">Last 30 Days</SelectItem>
              <SelectItem value="last3months">Last 3 Months</SelectItem>
              <SelectItem value="last6months">Last 6 Months</SelectItem>
              <SelectItem value="lastyear">Last Year</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <Button variant="outline" onClick={handleExportReport}>
          <Download className="h-4 w-4 mr-2" />
          Export Report
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Performance Summary</CardTitle>
            <CardDescription>Overall employee metrics</CardDescription>
          </CardHeader>
          <CardContent>
            {employeePerformance.length > 0 ? (
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Average Completion Rate</span>
                  <Badge variant="outline" className={getCompletionRateBadgeClass(
                    employeePerformance.reduce((sum, emp) => sum + emp.completionRate, 0) / employeePerformance.length
                  )}>
                    {(employeePerformance.reduce((sum, emp) => sum + emp.completionRate, 0) / employeePerformance.length).toFixed(1)}%
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Tasks Completed</span>
                  <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">
                    {employeePerformance.reduce((sum, emp) => sum + emp.tasksCompleted, 0)}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">On-time Completion Rate</span>
                  <Badge variant="outline" className={getCompletionRateBadgeClass(
                    employeePerformance.reduce((sum, emp) => sum + emp.onTimeRate, 0) / employeePerformance.length
                  )}>
                    {(employeePerformance.reduce((sum, emp) => sum + emp.onTimeRate, 0) / employeePerformance.length).toFixed(1)}%
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Avg. Time to Complete</span>
                  <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">
                    {(employeePerformance.reduce((sum, emp) => sum + emp.averageTimeToComplete, 0) / employeePerformance.length).toFixed(1)} days
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Top Performing Dept</span>
                  <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
                    {departmentData.length > 0 
                      ? departmentData.reduce((prev, current) => (prev.value > current.value) ? prev : current).name 
                      : 'N/A'}
                  </Badge>
                </div>
              </div>
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                <p>No performance data available</p>
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card className="col-span-1 md:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Performance Metrics</CardTitle>
            <CardDescription>Task completion and on-time rates</CardDescription>
          </CardHeader>
          <CardContent>
            {rechartsPerformanceData.length > 0 ? (
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={rechartsPerformanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="Tasks Completed" fill="rgba(99, 102, 241, 0.8)" />
                    <Bar dataKey="On-time Completion" fill="rgba(34, 197, 94, 0.8)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex items-center justify-center h-[200px] text-muted-foreground">
                <p>No task data available for the selected period</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="productivity">
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="productivity" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            <span className="hidden sm:inline">Productivity</span>
          </TabsTrigger>
          <TabsTrigger value="departments" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            <span className="hidden sm:inline">Departments</span>
          </TabsTrigger>
          <TabsTrigger value="employees" className="flex items-center gap-2">
            <PieChartIcon className="h-4 w-4" />
            <span className="hidden sm:inline">Employees</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="productivity">
          <Card>
            <CardHeader>
              <CardTitle>Productivity Breakdown</CardTitle>
              <CardDescription>Analyzing task completion efficiency</CardDescription>
            </CardHeader>
            <CardContent>
              {productivityTrends.length > 0 ? (
                <div className="h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={productivityTrends}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="productivity" name="Tasks Completed" stroke="rgb(99, 102, 241)" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="flex items-center justify-center h-[350px] text-muted-foreground">
                  <p>No productivity data available for the selected period</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="departments">
          <Card>
            <CardHeader>
              <CardTitle>Department Comparison</CardTitle>
              <CardDescription>Average productivity scores by department</CardDescription>
            </CardHeader>
            <CardContent>
              {departmentData.length > 0 ? (
                <div className="h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={departmentData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="value" name="Completion Rate (%)" fill="#8884d8">
                        {departmentData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="flex items-center justify-center h-[350px] text-muted-foreground">
                  <p>No department data available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="employees">
          <Card>
            <CardHeader>
              <CardTitle>Employee Performance</CardTitle>
              <CardDescription>Individual performance metrics</CardDescription>
            </CardHeader>
            <CardContent>
              {employeePerformance.length > 0 ? (
                <div className="rounded-md border overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-muted border-b">
                        <th className="py-2 px-4 text-left font-medium">Employee</th>
                        <th className="py-2 px-4 text-left font-medium">Department</th>
                        <th className="py-2 px-4 text-left font-medium">Assigned</th>
                        <th className="py-2 px-4 text-left font-medium">Completed</th>
                        <th className="py-2 px-4 text-left font-medium">Completion %</th>
                        <th className="py-2 px-4 text-left font-medium">On-time %</th>
                      </tr>
                    </thead>
                    <tbody>
                      {employeePerformance.map((emp, index) => (
                        <tr key={emp.id} className={index % 2 === 0 ? 'bg-background' : 'bg-muted/30'}>
                          <td className="py-2 px-4">{emp.name}</td>
                          <td className="py-2 px-4">{emp.department}</td>
                          <td className="py-2 px-4">{emp.tasksAssigned}</td>
                          <td className="py-2 px-4">{emp.tasksCompleted}</td>
                          <td className="py-2 px-4">
                            <Badge variant="outline" className={getCompletionRateBadgeClass(emp.completionRate)}>
                              {emp.completionRate.toFixed(1)}%
                            </Badge>
                          </td>
                          <td className="py-2 px-4">
                            <Badge variant="outline" className={getCompletionRateBadgeClass(emp.onTimeRate)}>
                              {emp.onTimeRate.toFixed(1)}%
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="flex items-center justify-center h-[350px] text-muted-foreground">
                  <p>No employee performance data available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <div className="text-center mt-8 text-muted-foreground text-sm">
        <p>Performance data is updated in real-time. Last updated: {new Date().toLocaleDateString()}</p>
      </div>
    </div>
  );
};

// Helper function to get badge class based on completion rate
function getCompletionRateBadgeClass(rate: number): string {
  if (rate >= 90) return 'bg-green-100 text-green-800 border-green-300';
  if (rate >= 70) return 'bg-blue-100 text-blue-800 border-blue-300';
  if (rate >= 50) return 'bg-yellow-100 text-yellow-800 border-yellow-300';
  return 'bg-red-100 text-red-800 border-red-300';
}

export default PerformanceAnalyticsSection;
