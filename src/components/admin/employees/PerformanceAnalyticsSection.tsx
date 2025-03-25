
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, LineChart, PieChart } from '@/components/ui/chart';
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

  const departmentComparisonData = {
    labels: ['Marketing', 'Sales', 'Development', 'Support', 'Content'],
    datasets: [
      {
        label: 'Average Productivity Score',
        data: [85, 78, 92, 81, 76],
        backgroundColor: [
          'rgba(99, 102, 241, 0.7)',
          'rgba(34, 197, 94, 0.7)',
          'rgba(245, 158, 11, 0.7)',
          'rgba(239, 68, 68, 0.7)',
          'rgba(16, 185, 129, 0.7)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const productivityTrendsData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [
      {
        label: 'Team Productivity',
        data: [22, 19, 27, 23, 22, 24, 17, 25, 23, 24, 20, 19],
        fill: false,
        borderColor: 'rgb(99, 102, 241)',
        tension: 0.1
      }
    ]
  };

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
            <BarChart data={employeePerformanceData} className="h-[200px]" />
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
                <LineChart data={productivityTrendsData} />
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
                <BarChart data={departmentComparisonData} />
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
                <PieChart data={departmentComparisonData} />
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
