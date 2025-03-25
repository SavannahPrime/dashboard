
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  UsersRound, 
  User, 
  ChevronRight, 
  Plus, 
  FolderPlus, 
  Users,
  Building2, 
  LayoutGrid,
  ListTree
} from 'lucide-react';

// Department structure data
const departments = [
  {
    id: 1,
    name: 'Marketing',
    headCount: 12,
    manager: 'Alexandra Thompson',
    managerTitle: 'Marketing Director',
    managerImage: 'https://ui-avatars.com/api/?name=Alexandra+Thompson&background=6366f1&color=fff',
    teams: [
      {
        id: 101,
        name: 'Digital Marketing',
        lead: 'Brian Williams',
        headCount: 5,
        description: 'Handles SEO, SEM, and digital ad campaigns'
      },
      {
        id: 102,
        name: 'Content Marketing',
        lead: 'Olivia Garcia',
        headCount: 4,
        description: 'Manages content strategy and creation'
      },
      {
        id: 103,
        name: 'Brand Marketing',
        lead: 'Nathan Lee',
        headCount: 3,
        description: 'Oversees brand identity and marketing materials'
      }
    ]
  },
  {
    id: 2,
    name: 'Sales',
    headCount: 15,
    manager: 'James Taylor',
    managerTitle: 'Sales Director',
    managerImage: 'https://ui-avatars.com/api/?name=James+Taylor&background=6366f1&color=fff',
    teams: [
      {
        id: 201,
        name: 'New Business',
        lead: 'Rebecca Martinez',
        headCount: 6,
        description: 'Focuses on acquiring new clients and accounts'
      },
      {
        id: 202,
        name: 'Account Management',
        lead: 'Daniel Robinson',
        headCount: 5,
        description: 'Maintains relationships with existing clients'
      },
      {
        id: 203,
        name: 'Sales Operations',
        lead: 'Emily Wilson',
        headCount: 4,
        description: 'Handles sales data, analyses, and processes'
      }
    ]
  },
  {
    id: 3,
    name: 'Development',
    headCount: 18,
    manager: 'Michael Rodriguez',
    managerTitle: 'CTO',
    managerImage: 'https://ui-avatars.com/api/?name=Michael+Rodriguez&background=6366f1&color=fff',
    teams: [
      {
        id: 301,
        name: 'Frontend Development',
        lead: 'Jessica Chen',
        headCount: 6,
        description: 'Creates user interfaces and client-side applications'
      },
      {
        id: 302,
        name: 'Backend Development',
        lead: 'Thomas Brown',
        headCount: 7,
        description: 'Builds server-side logic and infrastructure'
      },
      {
        id: 303,
        name: 'QA & Testing',
        lead: 'Lisa Johnson',
        headCount: 5,
        description: 'Ensures quality and stability of products'
      }
    ]
  },
  {
    id: 4,
    name: 'Support',
    headCount: 10,
    manager: 'David Chen',
    managerTitle: 'Customer Success Manager',
    managerImage: 'https://ui-avatars.com/api/?name=David+Chen&background=6366f1&color=fff',
    teams: [
      {
        id: 401,
        name: 'Technical Support',
        lead: 'Robert Wilson',
        headCount: 6,
        description: 'Resolves technical issues and client questions'
      },
      {
        id: 402,
        name: 'Customer Success',
        lead: 'Amanda Lewis',
        headCount: 4,
        description: 'Ensures client satisfaction and retention'
      }
    ]
  },
  {
    id: 5,
    name: 'Content',
    headCount: 8,
    manager: 'Sarah Johnson',
    managerTitle: 'Content Director',
    managerImage: 'https://ui-avatars.com/api/?name=Sarah+Johnson&background=6366f1&color=fff',
    teams: [
      {
        id: 501,
        name: 'Content Creation',
        lead: 'Kevin Zhang',
        headCount: 5,
        description: 'Produces written and visual content'
      },
      {
        id: 502,
        name: 'Content Strategy',
        lead: 'Maria Gonzalez',
        headCount: 3,
        description: 'Plans content approach and distribution'
      }
    ]
  }
];

const DepartmentStructureSection: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <h3 className="text-lg font-medium">Organizational Structure</h3>
        <div className="flex items-center gap-2">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Employee
          </Button>
          <Button variant="outline">
            <FolderPlus className="h-4 w-4 mr-2" />
            New Department
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="departments" className="space-y-4">
        <TabsList>
          <TabsTrigger value="departments" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            <span>Departments</span>
          </TabsTrigger>
          <TabsTrigger value="grid" className="flex items-center gap-2">
            <LayoutGrid className="h-4 w-4" />
            <span>Grid View</span>
          </TabsTrigger>
          <TabsTrigger value="tree" className="flex items-center gap-2">
            <ListTree className="h-4 w-4" />
            <span>Tree View</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="departments" className="space-y-4">
          {departments.map((department) => (
            <Card key={department.id} className="overflow-hidden">
              <CardHeader className="bg-accent/50 pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <UsersRound className="h-6 w-6 text-primary" />
                    <div>
                      <CardTitle>{department.name} Department</CardTitle>
                      <CardDescription>
                        {department.headCount} employees
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="font-medium">{department.manager}</p>
                      <p className="text-sm text-muted-foreground">{department.managerTitle}</p>
                    </div>
                    <div className="h-10 w-10 rounded-full overflow-hidden">
                      <img 
                        src={department.managerImage} 
                        alt={department.manager} 
                        className="h-full w-full object-cover"
                      />
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0">
                  {department.teams.map((team) => (
                    <div key={team.id} className="p-4 border-b md:border-r">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{team.name}</h4>
                        <Badge variant="outline">
                          {team.headCount} members
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        {team.description}
                      </p>
                      <div className="flex items-center">
                        <User className="h-4 w-4 text-muted-foreground mr-2" />
                        <span className="text-sm">Lead: {team.lead}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
        
        <TabsContent value="grid" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {departments.map((department) => (
              <Card key={department.id}>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-primary" />
                    <CardTitle className="text-lg">{department.name}</CardTitle>
                  </div>
                  <CardDescription>
                    {department.headCount} employees • {department.teams.length} teams
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="h-10 w-10 rounded-full overflow-hidden">
                        <img 
                          src={department.managerImage} 
                          alt={department.manager} 
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div>
                        <p className="font-medium">{department.manager}</p>
                        <p className="text-sm text-muted-foreground">{department.managerTitle}</p>
                      </div>
                    </div>
                    
                    <h4 className="text-sm font-medium mb-2">Teams:</h4>
                    <div className="space-y-1">
                      {department.teams.map((team) => (
                        <div key={team.id} className="flex items-center justify-between">
                          <span className="text-sm">{team.name}</span>
                          <Badge variant="outline" className="text-xs">
                            {team.headCount}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="tree" className="space-y-4">
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold">Savannah Prime Agency</h3>
                    <p className="text-muted-foreground">Organizational Structure</p>
                  </div>
                </div>
                
                <div className="space-y-4 pl-6 border-l">
                  {departments.map((department) => (
                    <div key={department.id} className="space-y-2">
                      <div className="flex items-center gap-3 relative">
                        <div className="absolute -left-10 top-4 h-4 w-8 border-t border-l border-border"></div>
                        <div className="h-8 w-8 rounded-full bg-accent flex items-center justify-center">
                          <Building2 className="h-4 w-4" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium">{department.name} Department</h4>
                            <Badge variant="outline">
                              {department.headCount} employees
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Manager: {department.manager}, {department.managerTitle}
                          </p>
                        </div>
                      </div>
                      
                      <div className="space-y-2 pl-12 border-l ml-4">
                        {department.teams.map((team) => (
                          <div key={team.id} className="flex items-center gap-3 relative">
                            <div className="absolute -left-8 top-4 h-4 w-8 border-t border-l border-border"></div>
                            <div className="h-8 w-8 rounded-full bg-background border border-border flex items-center justify-center">
                              <Users className="h-4 w-4" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <h5 className="font-medium">{team.name}</h5>
                                <Badge variant="outline" className="text-xs">
                                  {team.headCount} members
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                Lead: {team.lead}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <div className="flex justify-center mt-6">
        <Button variant="outline">
          Export Organization Chart
        </Button>
      </div>
    </div>
  );
};

export default DepartmentStructureSection;
