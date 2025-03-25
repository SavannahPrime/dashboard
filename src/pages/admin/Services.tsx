
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Package, PlusCircle, Settings, Trash2, Edit, Search, Filter } from 'lucide-react';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { toast } from 'sonner';

// Sample service data
const servicesList = [
  { 
    id: '1', 
    name: 'SEO Standard Package', 
    description: 'Basic SEO optimization for small businesses', 
    category: 'SEO', 
    price: 299, 
    active: true, 
    billingCycle: 'monthly' 
  },
  { 
    id: '2', 
    name: 'SEO Premium Package', 
    description: 'Advanced SEO optimization with content strategy', 
    category: 'SEO', 
    price: 599, 
    active: true, 
    billingCycle: 'monthly' 
  },
  { 
    id: '3', 
    name: 'Web Development Basic', 
    description: 'Simple website with up to 5 pages', 
    category: 'Development', 
    price: 999, 
    active: true, 
    billingCycle: 'one-time' 
  },
  { 
    id: '4', 
    name: 'Web Development Premium', 
    description: 'Full website with CMS and e-commerce capabilities', 
    category: 'Development', 
    price: 2999, 
    active: true, 
    billingCycle: 'one-time' 
  },
  { 
    id: '5', 
    name: 'Social Media Management', 
    description: 'Full management of all social media accounts', 
    category: 'Social', 
    price: 499, 
    active: true, 
    billingCycle: 'monthly' 
  },
  { 
    id: '6', 
    name: 'Content Creation Plan', 
    description: 'Weekly blog posts and content strategy', 
    category: 'Content', 
    price: 399, 
    active: false, 
    billingCycle: 'monthly' 
  },
];

const Services: React.FC = () => {
  const { currentAdmin } = useAdminAuth();
  const [services, setServices] = useState(servicesList);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [activeFilter, setActiveFilter] = useState('all');
  const [editingService, setEditingService] = useState<any>(null);
  
  // Filter the services based on search and filters
  const filteredServices = services.filter(service => {
    const matchesSearch = service.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         service.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = categoryFilter === 'all' || service.category === categoryFilter;
    const matchesActive = activeFilter === 'all' || 
                         (activeFilter === 'active' && service.active) || 
                         (activeFilter === 'inactive' && !service.active);
    
    return matchesSearch && matchesCategory && matchesActive;
  });
  
  const handleAddService = () => {
    toast.info('This would connect to Supabase to add a new service');
  };
  
  const handleEditService = (service: any) => {
    setEditingService(service);
  };
  
  const handleSaveService = () => {
    if (editingService) {
      setServices(prevServices => 
        prevServices.map(service => service.id === editingService.id ? editingService : service)
      );
      toast.success('Service updated successfully');
      setEditingService(null);
    }
  };
  
  const handleToggleService = (id: string) => {
    setServices(prevServices => 
      prevServices.map(service => 
        service.id === id ? { ...service, active: !service.active } : service
      )
    );
    toast.success('Service status updated');
  };
  
  const handleDeleteService = (id: string) => {
    setServices(prevServices => prevServices.filter(service => service.id !== id));
    toast.success('Service deleted successfully');
  };
  
  // Get unique categories for the filter
  const categories = ['all', ...new Set(services.map(service => service.category))];
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Service Configuration</h1>
          <p className="text-muted-foreground">
            Manage service offerings and pricing
          </p>
        </div>
        
        <Button onClick={handleAddService}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Service
        </Button>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex items-center gap-2 flex-1">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              type="search" 
              placeholder="Search services..." 
              className="pl-8" 
              value={searchQuery} 
              onChange={(e) => setSearchQuery(e.target.value)} 
            />
          </div>
        </div>
        
        <div className="flex gap-2">
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map(category => (
                <SelectItem key={category} value={category}>
                  {category === 'all' ? 'All Categories' : category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={activeFilter} onValueChange={setActiveFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active Only</SelectItem>
              <SelectItem value="inactive">Inactive Only</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <Tabs defaultValue="services">
        <TabsList>
          <TabsTrigger value="services">Services List</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="analytics">Service Analytics</TabsTrigger>
        </TabsList>
        
        <TabsContent value="services">
          <Card>
            <CardHeader>
              <CardTitle>Available Services</CardTitle>
              <CardDescription>Manage your service offerings</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Billing</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredServices.map((service) => (
                    <TableRow key={service.id}>
                      <TableCell className="font-medium">
                        {service.name}
                        <div className="text-xs text-muted-foreground">{service.description}</div>
                      </TableCell>
                      <TableCell>{service.category}</TableCell>
                      <TableCell>${service.price}</TableCell>
                      <TableCell>
                        {service.billingCycle === 'monthly' ? 'Monthly' : 'One-time'}
                      </TableCell>
                      <TableCell>
                        <Badge variant={service.active ? "default" : "secondary"}>
                          {service.active ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="icon" onClick={() => handleEditService(service)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="icon" onClick={() => handleToggleService(service.id)}>
                            <Settings className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="icon" onClick={() => handleDeleteService(service.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="categories">
          <Card>
            <CardHeader>
              <CardTitle>Service Categories</CardTitle>
              <CardDescription>Manage and organize service categories</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from(new Set(services.map(s => s.category))).map(category => (
                  <Card key={category}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">{category}</CardTitle>
                      <CardDescription>
                        {services.filter(s => s.category === category).length} services
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pb-2">
                      <ul className="text-sm space-y-1">
                        {services.filter(s => s.category === category).map(service => (
                          <li key={service.id} className="flex items-center justify-between">
                            <span>{service.name}</span>
                            <Badge variant={service.active ? "default" : "secondary"}>
                              {service.active ? 'Active' : 'Inactive'}
                            </Badge>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                    <CardFooter>
                      <Button variant="outline" size="sm" className="w-full">Manage Category</Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>Service Analytics</CardTitle>
              <CardDescription>Performance metrics for services</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {Array.from(new Set(services.map(s => s.category))).map(category => (
                  <Card key={category}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">{category}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Subscribers</span>
                          <span className="font-medium">{Math.floor(Math.random() * 100) + 20}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Revenue</span>
                          <span className="font-medium">${Math.floor(Math.random() * 10000) + 1000}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Growth</span>
                          <span className="font-medium text-green-500">+{Math.floor(Math.random() * 20) + 5}%</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {editingService && (
        <Card>
          <CardHeader>
            <CardTitle>Edit Service</CardTitle>
            <CardDescription>Update service details</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Service Name</Label>
                <Input 
                  id="name" 
                  value={editingService.name} 
                  onChange={(e) => setEditingService({...editingService, name: e.target.value})}
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea 
                  id="description" 
                  value={editingService.description} 
                  onChange={(e) => setEditingService({...editingService, description: e.target.value})}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="category">Category</Label>
                  <Select 
                    value={editingService.category}
                    onValueChange={(value) => setEditingService({...editingService, category: value})}
                  >
                    <SelectTrigger id="category">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from(new Set(services.map(s => s.category))).map(category => (
                        <SelectItem key={category} value={category}>{category}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="price">Price ($)</Label>
                  <Input 
                    id="price" 
                    type="number" 
                    value={editingService.price} 
                    onChange={(e) => setEditingService({...editingService, price: Number(e.target.value)})}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="billingCycle">Billing Cycle</Label>
                  <Select 
                    value={editingService.billingCycle}
                    onValueChange={(value) => setEditingService({...editingService, billingCycle: value})}
                  >
                    <SelectTrigger id="billingCycle">
                      <SelectValue placeholder="Select billing cycle" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="yearly">Yearly</SelectItem>
                      <SelectItem value="one-time">One-time</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="status">Status</Label>
                  <div className="flex items-center space-x-2 pt-2">
                    <Switch 
                      id="status" 
                      checked={editingService.active}
                      onCheckedChange={(checked) => setEditingService({...editingService, active: checked})}
                    />
                    <Label htmlFor="status">{editingService.active ? 'Active' : 'Inactive'}</Label>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={() => setEditingService(null)}>Cancel</Button>
            <Button onClick={handleSaveService}>Save Changes</Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
};

export default Services;
