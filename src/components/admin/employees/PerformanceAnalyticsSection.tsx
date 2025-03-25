
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Button } from '@/components/ui/button';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart3, Activity, PieChart as PieChartIcon, CalendarRange, Download } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, PieChart, Pie, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';

const PerformanceAnalyticsSection: React.FC = () => {
  // Sample data for charts
  const employeePerformanceData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Tasks Completed',
        data: [65, 59, 80, 81, 56, 55],
        backgroundColor: 'rgba(99, 102, 241, 0.5)',
        borderColor: 'rgb(99, 102, 241)',
      },
      {
        label: 'On-time Completion Rate',
        data: [28, 48, 40, 19, 86, 27],
        backgroundColor: 'rgba(34, 197, 94, 0.5)',
        borderColor: 'rgb(34, 197, 94)',
      },
    ],
  };

  // Convert chart data to Recharts format
  const rechartsEmployeePerformanceData = employeePerformanceData.labels.map((month, index) => ({
    name: month,
    'Tasks Completed': employeePerformanceData.datasets[0].data[index],
    'On-time Completion Rate': employeePerformanceData.datasets[1].data[index],
  }));

  const departmentComparisonData = [
    { name: 'Marketing', value: 85 },
    { name: 'Sales', value: 78 },
    { name: 'Development', value: 92 },
    { name: 'Support', value: 81 },
    { name: 'Content', value: 76 },
  ];

  const productivityTrendsData = [
    { name: 'Jan', productivity: 22 },
    { name: 'Feb', productivity: 19 },
    { name: 'Mar', productivity: 27 },
    { name: 'Apr', productivity: 23 },
    { name: 'May', productivity: 22 },
    { name: 'Jun', productivity: 24 },
    { name: 'Jul', productivity: 17 },
    { name: 'Aug', productivity: 25 },
    { name: 'Sep', productivity: 23 },
    { name: 'Oct', productivity: 24 },
    { name: 'Nov', productivity: 20 },
    { name: 'Dec', productivity: 19 },
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <Select defaultValue="individual">
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="View type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="individual">Individual Performance</SelectItem>
              <SelectItem value="team">Team Performance</SelectItem>
              <SelectItem value="department">Department Performance</SelectItem>
            </SelectContent>
          </Select>
          
          <Select defaultValue="last6months">
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Time period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="last30days">Last 30 Days</SelectItem>
              <SelectItem value="last3months">Last 3 Months</SelectItem>
              <SelectItem value="last6months">Last 6 Months</SelectItem>
              <SelectItem value="lastyear">Last Year</SelectItem>
              <SelectItem value="custom">Custom Range</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <Button variant="outline">
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
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Productivity Score</span>
                <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
                  87/100 (Excellent)
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Tasks Completion Rate</span>
                <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">
                  92%
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Meeting Attendance</span>
                <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
                  98%
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">On-time Deliveries</span>
                <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">
                  78%
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Client Satisfaction</span>
                <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
                  4.7/5.0
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="col-span-1 md:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Performance Metrics</CardTitle>
            <CardDescription>Task completion and on-time rates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={rechartsEmployeePerformanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="Tasks Completed" fill="rgba(99, 102, 241, 0.8)" />
                  <Bar dataKey="On-time Completion Rate" fill="rgba(34, 197, 94, 0.8)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
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
          <TabsTrigger value="trends" className="flex items-center gap-2">
            <PieChartIcon className="h-4 w-4" />
            <span className="hidden sm:inline">Trends</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="productivity">
          <Card>
            <CardHeader>
              <CardTitle>Productivity Breakdown</CardTitle>
              <CardDescription>Analyzing task completion efficiency</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={productivityTrendsData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="productivity" name="Team Productivity" stroke="rgb(99, 102, 241)" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
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
              <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={departmentComparisonData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="value" name="Average Productivity Score" fill="#8884d8">
                      {departmentComparisonData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="trends">
          <Card>
            <CardHeader>
              <CardTitle>Performance Trends</CardTitle>
              <CardDescription>Skill distribution and improvements</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={departmentComparisonData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={120}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {departmentComparisonData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <div className="text-center mt-8 text-muted-foreground text-sm">
        <p>Performance data is updated daily. Last updated: November 10, 2023</p>
      </div>
    </div>
  );
};

export default PerformanceAnalyticsSection;
