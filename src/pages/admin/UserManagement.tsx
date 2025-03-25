
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Filter, UserPlus, MoreHorizontal, RefreshCw } from 'lucide-react';
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
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';

// Sample user data
const users = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    status: 'active',
    role: 'client',
    services: ['Website Development', 'Digital Marketing'],
    subscriptionStatus: 'active',
    subscriptionExpiry: '2024-12-31',
    lastLogin: '2023-11-10T14:30:00Z',
    joinDate: '2023-05-15',
  },
  {
    id: '2',
    name: 'Sarah Smith',
    email: 'sarah@example.com',
    status: 'active',
    role: 'client',
    services: ['Digital Marketing', 'Branding & Design'],
    subscriptionStatus: 'expired',
    subscriptionExpiry: '2023-10-15',
    lastLogin: '2023-10-05T09:45:00Z',
    joinDate: '2023-02-22',
  },
  {
    id: '3',
    name: 'Michael Johnson',
    email: 'michael@example.com',
    status: 'suspended',
    role: 'client',
    services: ['CMS Development'],
    subscriptionStatus: 'pending',
    subscriptionExpiry: '2024-01-20',
    lastLogin: '2023-09-18T16:20:00Z',
    joinDate: '2023-06-10',
  },
  {
    id: '4',
    name: 'Emily Brown',
    email: 'emily@example.com',
    status: 'active',
    role: 'client',
    services: ['Website Development', 'AI Automation'],
    subscriptionStatus: 'active',
    subscriptionExpiry: '2024-11-05',
    lastLogin: '2023-11-08T11:15:00Z',
    joinDate: '2023-08-01',
  },
  {
    id: '5',
    name: 'David Wilson',
    email: 'david@example.com',
    status: 'inactive',
    role: 'client',
    services: ['Digital Marketing'],
    subscriptionStatus: 'cancelled',
    subscriptionExpiry: '2023-09-30',
    lastLogin: '2023-09-28T13:40:00Z',
    joinDate: '2023-01-15',
  },
  {
    id: '6',
    name: 'Jennifer Taylor',
    email: 'jennifer@example.com',
    status: 'active',
    role: 'client',
    services: ['Branding & Design', 'CMS Development'],
    subscriptionStatus: 'active',
    subscriptionExpiry: '2024-10-10',
    lastLogin: '2023-11-09T10:30:00Z',
    joinDate: '2023-07-12',
  },
  {
    id: '7',
    name: 'Robert Martinez',
    email: 'robert@example.com',
    status: 'active',
    role: 'client',
    services: ['AI Automation'],
    subscriptionStatus: 'active',
    subscriptionExpiry: '2024-08-22',
    lastLogin: '2023-11-07T14:50:00Z',
    joinDate: '2023-03-28',
  },
];

const statusColors: Record<string, string> = {
  active: 'bg-green-500',
  inactive: 'bg-gray-500',
  suspended: 'bg-red-500',
};

const subscriptionColors: Record<string, string> = {
  active: 'bg-green-100 text-green-800 border-green-300',
  expired: 'bg-red-100 text-red-800 border-red-300',
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  cancelled: 'bg-gray-100 text-gray-800 border-gray-300',
};

const UserManagement: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedService, setSelectedService] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  
  // Filter users based on search query and filters
  const filteredUsers = users.filter(user => {
    // Search query filter
    const matchesSearch = 
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Status filter
    const matchesStatus = 
      selectedStatus === 'all' || 
      user.status === selectedStatus;
    
    // Service filter
    const matchesService = 
      selectedService === 'all' ||
      user.services.includes(selectedService);
    
    return matchesSearch && matchesStatus && matchesService;
  });
  
  // Get current page users
  const indexOfLastUser = currentPage * itemsPerPage;
  const indexOfFirstUser = indexOfLastUser - itemsPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  
  // Format date to readable format
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
        <Button>
          <UserPlus className="h-4 w-4 mr-2" />
          Add New User
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
          <CardDescription>
            Manage user accounts, subscriptions, and permissions.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between gap-4">
              <TabsList>
                <TabsTrigger value="all">All Users</TabsTrigger>
                <TabsTrigger value="active">Active</TabsTrigger>
                <TabsTrigger value="inactive">Inactive</TabsTrigger>
                <TabsTrigger value="suspended">Suspended</TabsTrigger>
              </TabsList>
              
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search users..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 w-[200px]"
                  />
                </div>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon">
                      <Filter className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56">
                    <DropdownMenuLabel>Filter Options</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    
                    <div className="p-2">
                      <p className="text-sm font-medium mb-2">Status</p>
                      <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All</SelectItem>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                          <SelectItem value="suspended">Suspended</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="p-2">
                      <p className="text-sm font-medium mb-2">Service</p>
                      <Select value={selectedService} onValueChange={setSelectedService}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select service" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Services</SelectItem>
                          <SelectItem value="Website Development">Website Development</SelectItem>
                          <SelectItem value="CMS Development">CMS Development</SelectItem>
                          <SelectItem value="AI Automation">AI Automation</SelectItem>
                          <SelectItem value="Digital Marketing">Digital Marketing</SelectItem>
                          <SelectItem value="Branding & Design">Branding & Design</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => {
                      setSelectedStatus('all');
                      setSelectedService('all');
                      setSearchQuery('');
                    }}>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Reset All Filters
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            
            <TabsContent value="all">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50px]">ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Subscription</TableHead>
                      <TableHead>Services</TableHead>
                      <TableHead>Join Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentUsers.length > 0 ? (
                      currentUsers.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">{user.id}</TableCell>
                          <TableCell>{user.name}</TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <div className={`h-2 w-2 rounded-full ${statusColors[user.status]} mr-2`} />
                              <span className="capitalize">{user.status}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant="outline"
                              className={subscriptionColors[user.subscriptionStatus]}
                            >
                              {user.subscriptionStatus}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {user.services.map((service, index) => (
                                <Badge key={index} variant="secondary" className="truncate max-w-[120px]">
                                  {service}
                                </Badge>
                              ))}
                            </div>
                          </TableCell>
                          <TableCell>{formatDate(user.joinDate)}</TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem>View Profile</DropdownMenuItem>
                                <DropdownMenuItem>Edit User</DropdownMenuItem>
                                <DropdownMenuItem>Subscription Details</DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-amber-600">Send Warning</DropdownMenuItem>
                                {user.status === 'active' ? (
                                  <DropdownMenuItem className="text-red-600">Suspend User</DropdownMenuItem>
                                ) : (
                                  <DropdownMenuItem className="text-green-600">Activate User</DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-4 text-muted-foreground">
                          No users found matching the criteria
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
              
              <div className="mt-4">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious 
                        href="#" 
                        onClick={(e) => {
                          e.preventDefault();
                          setCurrentPage(prev => Math.max(1, prev - 1));
                        }}
                      />
                    </PaginationItem>
                    
                    {[...Array(Math.ceil(filteredUsers.length / itemsPerPage))].map((_, index) => (
                      <PaginationItem key={index}>
                        <PaginationLink 
                          href="#" 
                          isActive={currentPage === index + 1}
                          onClick={(e) => {
                            e.preventDefault();
                            setCurrentPage(index + 1);
                          }}
                        >
                          {index + 1}
                        </PaginationLink>
                      </PaginationItem>
                    ))}
                    
                    <PaginationItem>
                      <PaginationNext 
                        href="#" 
                        onClick={(e) => {
                          e.preventDefault();
                          setCurrentPage(prev => 
                            Math.min(Math.ceil(filteredUsers.length / itemsPerPage), prev + 1)
                          );
                        }}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            </TabsContent>
            
            <TabsContent value="active">
              {/* Active users content - similar to "all" but filtered */}
              <p>Active users will be shown here</p>
            </TabsContent>
            
            <TabsContent value="inactive">
              {/* Inactive users content */}
              <p>Inactive users will be shown here</p>
            </TabsContent>
            
            <TabsContent value="suspended">
              {/* Suspended users content */}
              <p>Suspended users will be shown here</p>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserManagement;
