
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  GraduationCap, 
  Search, 
  BookOpen, 
  Video, 
  FileText, 
  BarChart, 
  CalendarDays,
  Clock,
  Plus,
  ArrowUpRight,
  Users
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// Sample training resources
const trainingResources = [
  {
    id: 1,
    title: 'Digital Marketing Fundamentals',
    type: 'course',
    format: 'video',
    department: 'Marketing',
    duration: '4 hours',
    instructor: 'Alexandra Thompson',
    recommended: ['Marketing Team', 'Sales Team'],
    completions: 32,
    lastUpdated: '2023-09-15',
    description: 'Learn the basics of digital marketing, including SEO, SEM, and social media marketing strategies.'
  },
  {
    id: 2,
    title: 'Client Communication Best Practices',
    type: 'workshop',
    format: 'interactive',
    department: 'Sales',
    duration: '2 hours',
    instructor: 'James Taylor',
    recommended: ['Sales Team', 'Support Team'],
    completions: 45,
    lastUpdated: '2023-08-22',
    description: 'Improve your client communication skills with proven techniques and role-playing exercises.'
  },
  {
    id: 3,
    title: 'Modern JavaScript Development',
    type: 'course',
    format: 'video',
    department: 'Development',
    duration: '8 hours',
    instructor: 'Michael Rodriguez',
    recommended: ['Development Team'],
    completions: 18,
    lastUpdated: '2023-10-05',
    description: 'Master modern JavaScript concepts, frameworks, and best practices for web development.'
  },
  {
    id: 4,
    title: 'Customer Support Excellence',
    type: 'course',
    format: 'document',
    department: 'Support',
    duration: '3 hours',
    instructor: 'David Chen',
    recommended: ['Support Team'],
    completions: 27,
    lastUpdated: '2023-07-30',
    description: 'Learn techniques to provide exceptional customer support and handle difficult situations.'
  },
  {
    id: 5,
    title: 'Content Strategy Masterclass',
    type: 'workshop',
    format: 'interactive',
    department: 'Content',
    duration: '4 hours',
    instructor: 'Sarah Johnson',
    recommended: ['Content Team', 'Marketing Team'],
    completions: 22,
    lastUpdated: '2023-09-28',
    description: 'Develop effective content strategies that engage audiences and drive business results.'
  },
  {
    id: 6,
    title: 'Project Management Essentials',
    type: 'course',
    format: 'video',
    department: 'All',
    duration: '6 hours',
    instructor: 'External - PMI Certified',
    recommended: ['Team Leads', 'Department Managers'],
    completions: 38,
    lastUpdated: '2023-08-15',
    description: 'Learn essential project management techniques to keep projects on time and within budget.'
  }
];

// Sample employee training assignments
const employeeAssignments = [
  {
    employeeId: 2,
    name: 'Michael Rodriguez',
    role: 'CTO',
    department: 'Development',
    assignedCourses: [
      {
        id: 6,
        title: 'Project Management Essentials',
        progress: 75,
        dueDate: '2023-11-30'
      }
    ]
  },
  {
    employeeId: 1,
    name: 'Alexandra Thompson',
    role: 'Marketing Director',
    department: 'Marketing',
    assignedCourses: [
      {
        id: 6,
        title: 'Project Management Essentials',
        progress: 100,
        dueDate: '2023-11-15'
      },
      {
        id: 2,
        title: 'Client Communication Best Practices',
        progress: 50,
        dueDate: '2023-12-05'
      }
    ]
  },
  {
    employeeId: 4,
    name: 'David Chen',
    role: 'Customer Success Manager',
    department: 'Support',
    assignedCourses: [
      {
        id: 2,
        title: 'Client Communication Best Practices',
        progress: 0,
        dueDate: '2023-12-10'
      }
    ]
  },
  {
    employeeId: 7,
    name: 'Olivia Garcia',
    role: 'Staff Member',
    department: 'Marketing',
    assignedCourses: [
      {
        id: 1,
        title: 'Digital Marketing Fundamentals',
        progress: 25,
        dueDate: '2023-12-15'
      },
      {
        id: 5,
        title: 'Content Strategy Masterclass',
        progress: 0,
        dueDate: '2023-12-20'
      }
    ]
  }
];

// Format types with their icons
const formatIcons = {
  video: Video,
  document: FileText,
  interactive: Users
};

const TrainingResourcesSection: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  
  // Filter training resources based on search and filters
  const filteredResources = trainingResources.filter(resource => {
    const matchesSearch = 
      resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesDepartment = 
      departmentFilter === 'all' || 
      resource.department === departmentFilter || 
      resource.department === 'All';
    
    const matchesType = 
      typeFilter === 'all' || 
      resource.type === typeFilter;
    
    return matchesSearch && matchesDepartment && matchesType;
  });

  return (
    <div className="space-y-6">
      <Tabs defaultValue="resources" className="space-y-4">
        <TabsList>
          <TabsTrigger value="resources" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            <span>Resources</span>
          </TabsTrigger>
          <TabsTrigger value="assignments" className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4" />
            <span>Assignments</span>
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart className="h-4 w-4" />
            <span>Analytics</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="resources" className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <div className="flex-1 flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search resources..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              
              <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  <SelectItem value="Marketing">Marketing</SelectItem>
                  <SelectItem value="Sales">Sales</SelectItem>
                  <SelectItem value="Development">Development</SelectItem>
                  <SelectItem value="Support">Support</SelectItem>
                  <SelectItem value="Content">Content</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="course">Courses</SelectItem>
                  <SelectItem value="workshop">Workshops</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Resource
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredResources.map((resource) => {
              const FormatIcon = formatIcons[resource.format as keyof typeof formatIcons] || FileText;
              
              return (
                <Card key={resource.id} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <Badge variant="outline" className="mb-2">
                        {resource.type.charAt(0).toUpperCase() + resource.type.slice(1)}
                      </Badge>
                      <Badge variant={resource.department === "All" ? "default" : "outline"}>
                        {resource.department}
                      </Badge>
                    </div>
                    <CardTitle className="line-clamp-1">{resource.title}</CardTitle>
                    <CardDescription className="line-clamp-2">
                      {resource.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <div className="space-y-2">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <FormatIcon className="h-4 w-4 mr-2" />
                        <span className="capitalize">{resource.format} Format</span>
                        <span className="mx-2">•</span>
                        <Clock className="h-4 w-4 mr-1" />
                        <span>{resource.duration}</span>
                      </div>
                      
                      <div className="flex flex-wrap gap-1 mt-2">
                        {resource.recommended.map((group, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            For: {group}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <div className="text-sm text-muted-foreground">
                      {resource.completions} completions
                    </div>
                    <Button variant="ghost" size="sm" className="gap-1">
                      <span>View</span>
                      <ArrowUpRight className="h-3 w-3" />
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        </TabsContent>
        
        <TabsContent value="assignments" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Assigned Trainings</h3>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Assign Training
            </Button>
          </div>
          
          <div className="space-y-4">
            {employeeAssignments.map((employee) => (
              <Card key={employee.employeeId}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full overflow-hidden">
                        <img 
                          src={`https://ui-avatars.com/api/?name=${employee.name.replace(' ', '+')}&background=6366f1&color=fff`}
                          alt={employee.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div>
                        <CardTitle className="text-base">{employee.name}</CardTitle>
                        <CardDescription>
                          {employee.role} • {employee.department}
                        </CardDescription>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      Add Course
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {employee.assignedCourses.map((course) => (
                    <div key={course.id} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <h4 className="font-medium">{course.title}</h4>
                        <div className="flex items-center gap-3">
                          <Badge variant="outline" className={
                            course.progress === 100 
                              ? "bg-green-100 text-green-800 border-green-300" 
                              : "bg-blue-100 text-blue-800 border-blue-300"
                          }>
                            {course.progress === 100 ? "Completed" : "In Progress"}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            Due: {new Date(course.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </span>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>Progress</span>
                          <span>{course.progress}%</span>
                        </div>
                        <Progress value={course.progress} className="h-2" />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Course Completion Rate</CardTitle>
                <CardDescription>Overall training completion</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center">
                  <div className="text-4xl font-bold mb-2">78%</div>
                  <Progress value={78} className="h-2 w-full" />
                  <p className="text-sm text-muted-foreground mt-2">
                    165 of 212 assigned courses completed
                  </p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Most Popular Resource</CardTitle>
                <CardDescription>Highest completion rate</CardDescription>
              </CardHeader>
              <CardContent>
                <h3 className="font-medium mb-1">Client Communication Best Practices</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  45 employees completed this training
                </p>
                <div className="flex items-center text-sm">
                  <Users className="h-4 w-4 mr-2 text-primary" />
                  <span>Workshop format • 2 hours</span>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Department Training</CardTitle>
                <CardDescription>Completion by department</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>Marketing</span>
                    <span>92%</span>
                  </div>
                  <Progress value={92} className="h-2" />
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>Sales</span>
                    <span>86%</span>
                  </div>
                  <Progress value={86} className="h-2" />
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>Development</span>
                    <span>78%</span>
                  </div>
                  <Progress value={78} className="h-2" />
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>Support</span>
                    <span>65%</span>
                  </div>
                  <Progress value={65} className="h-2" />
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>Content</span>
                    <span>88%</span>
                  </div>
                  <Progress value={88} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Training Insights</CardTitle>
              <CardDescription>Key metrics for employee development</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Total Training Hours</h3>
                  <div className="flex items-end gap-2">
                    <span className="text-3xl font-bold">248</span>
                    <span className="text-sm text-green-600">+14% vs last month</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Hours spent on training by all employees
                  </p>
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Avg. Completion Time</h3>
                  <div className="flex items-end gap-2">
                    <span className="text-3xl font-bold">6.2</span>
                    <span className="text-sm">days</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Average time to complete assigned courses
                  </p>
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Certification Rate</h3>
                  <div className="flex items-end gap-2">
                    <span className="text-3xl font-bold">62%</span>
                    <span className="text-sm text-amber-600">-5% vs goal</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Employees with required certifications
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TrainingResourcesSection;
