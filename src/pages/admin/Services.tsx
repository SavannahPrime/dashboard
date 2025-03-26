
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { 
  Package, 
  Search, 
  PlusCircle, 
  Filter, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  X, 
  Check, 
  Loader2
} from 'lucide-react';
import { supabase, handleDatabaseError } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAdminAuth } from '@/contexts/AdminAuthContext';

const AdminServices: React.FC = () => {
  const { currentAdmin } = useAdminAuth();
  const [services, setServices] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [categories, setCategories] = useState<string[]>([]);
  
  // Add/Edit service dialog state
  const [isAddServiceDialogOpen, setIsAddServiceDialogOpen] = useState(false);
  const [isEditServiceDialogOpen, setIsEditServiceDialogOpen] = useState(false);
  const [isViewServiceDialogOpen, setIsViewServiceDialogOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<any>(null);
  
  // New service state
  const [newService, setNewService] = useState({
    name: '',
    price: '',
    description: '',
    category: '',
    features: [] as string[],
    active: true
  });
  
  // Feature input state
  const [featureInput, setFeatureInput] = useState('');
  
  // Delete dialog state
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState<any>(null);
  
  // Load services
  const fetchServices = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      setServices(data || []);
      
      // Extract unique categories
      const uniqueCategories = Array.from(new Set(data?.map(service => service.category).filter(Boolean))) as string[];
      setCategories(uniqueCategories);
      
    } catch (error) {
      console.error('Error fetching services:', error);
      toast.error('Failed to load services');
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    fetchServices();
    
    // Set up realtime subscription for service updates
    const channel = supabase
      .channel('public:services')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'services' 
      }, () => {
        fetchServices();
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);
  
  // Add a new feature to the list
  const addFeature = () => {
    if (!featureInput.trim()) return;
    
    if (isEditServiceDialogOpen && selectedService) {
      setSelectedService({
        ...selectedService,
        features: [...(selectedService.features || []), featureInput.trim()]
      });
    } else {
      setNewService({
        ...newService,
        features: [...newService.features, featureInput.trim()]
      });
    }
    
    setFeatureInput('');
  };
  
  // Remove a feature from the list
  const removeFeature = (index: number) => {
    if (isEditServiceDialogOpen && selectedService) {
      const updatedFeatures = [...(selectedService.features || [])];
      updatedFeatures.splice(index, 1);
      setSelectedService({
        ...selectedService,
        features: updatedFeatures
      });
    } else {
      const updatedFeatures = [...newService.features];
      updatedFeatures.splice(index, 1);
      setNewService({
        ...newService,
        features: updatedFeatures
      });
    }
  };
  
  // Handle adding a new service
  const handleAddService = async () => {
    if (!newService.name || !newService.price) {
      toast.error('Name and price are required');
      return;
    }
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('services')
        .insert({
          name: newService.name,
          price: parseFloat(newService.price),
          description: newService.description,
          category: newService.category,
          features: newService.features,
          active: newService.active
        })
        .select()
        .single();
      
      if (error) throw error;
      
      toast.success('Service added successfully');
      setIsAddServiceDialogOpen(false);
      
      // Reset form
      setNewService({
        name: '',
        price: '',
        description: '',
        category: '',
        features: [],
        active: true
      });
      
      fetchServices();
      
      // Log the action
      await supabase.from('analytics').insert({
        type: 'admin_action',
        data: {
          admin_id: currentAdmin?.id,
          action: 'add_service',
          service_id: data.id
        },
        period: 'daily'
      });
      
    } catch (error) {
      console.error('Error adding service:', error);
      toast.error(handleDatabaseError(error));
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle updating a service
  const handleUpdateService = async () => {
    if (!selectedService?.name || !selectedService?.price) {
      toast.error('Name and price are required');
      return;
    }
    
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('services')
        .update({
          name: selectedService.name,
          price: parseFloat(selectedService.price),
          description: selectedService.description,
          category: selectedService.category,
          features: selectedService.features,
          active: selectedService.active
        })
        .eq('id', selectedService.id);
      
      if (error) throw error;
      
      toast.success('Service updated successfully');
      setIsEditServiceDialogOpen(false);
      fetchServices();
      
      // Log the action
      await supabase.from('analytics').insert({
        type: 'admin_action',
        data: {
          admin_id: currentAdmin?.id,
          action: 'update_service',
          service_id: selectedService.id
        },
        period: 'daily'
      });
      
    } catch (error) {
      console.error('Error updating service:', error);
      toast.error(handleDatabaseError(error));
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle deleting a service
  const handleDeleteService = async () => {
    if (!serviceToDelete?.id) return;
    
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('services')
        .delete()
        .eq('id', serviceToDelete.id);
      
      if (error) throw error;
      
      toast.success('Service deleted successfully');
      setIsDeleteDialogOpen(false);
      fetchServices();
      
      // Log the action
      await supabase.from('analytics').insert({
        type: 'admin_action',
        data: {
          admin_id: currentAdmin?.id,
          action: 'delete_service',
          service_id: serviceToDelete.id
        },
        period: 'daily'
      });
      
    } catch (error) {
      console.error('Error deleting service:', error);
      toast.error(handleDatabaseError(error));
    } finally {
      setIsLoading(false);
    }
  };
  
  // Open edit dialog with service data
  const openEditDialog = (service: any) => {
    setSelectedService(service);
    setIsEditServiceDialogOpen(true);
  };
  
  // Open view dialog with service data
  const openViewDialog = (service: any) => {
    setSelectedService(service);
    setIsViewServiceDialogOpen(true);
  };
  
  // Open delete dialog
  const openDeleteDialog = (service: any) => {
    setServiceToDelete(service);
    setIsDeleteDialogOpen(true);
  };
  
  // Filter services based on search and filters
  const filteredServices = services.filter(service => {
    const matchesSearch = 
      service.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.category?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = 
      statusFilter === 'all' || 
      (statusFilter === 'active' && service.active) ||
      (statusFilter === 'inactive' && !service.active);
    
    const matchesCategory = 
      categoryFilter === 'all' || 
      service.category === categoryFilter;
    
    return matchesSearch && matchesStatus && matchesCategory;
  });
  
  // Format price
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(price);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Services Management</h1>
          <p className="text-muted-foreground">
            Manage service offerings for your clients
          </p>
        </div>
        
        <Button onClick={() => setIsAddServiceDialogOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add New Service
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Services</CardTitle>
          <CardDescription>
            View and manage all service offerings available to clients
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search services..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredServices.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Features</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredServices.map(service => (
                    <TableRow key={service.id}>
                      <TableCell className="font-medium">{service.name}</TableCell>
                      <TableCell>{service.category || 'Uncategorized'}</TableCell>
                      <TableCell>{formatPrice(service.price)}</TableCell>
                      <TableCell>
                        <Badge variant={service.active ? "secondary" : "outline"}>
                          {service.active ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {service.features && service.features.length > 0 ? (
                            <span>{service.features.length} feature{service.features.length !== 1 ? 's' : ''}</span>
                          ) : (
                            <span className="text-muted-foreground text-sm">No features</span>
                          )}
                        </div>
                      </TableCell>
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
                            <DropdownMenuItem onClick={() => openViewDialog(service)}>
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => openEditDialog(service)}>
                              Edit Service
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={() => openDeleteDialog(service)}
                            >
                              Delete Service
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-10 border rounded-md">
              <Package className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <h3 className="text-lg font-medium">No services found</h3>
              <p className="text-muted-foreground">
                {searchQuery || statusFilter !== 'all' || categoryFilter !== 'all' ? 
                  'Try adjusting your search or filters' : 
                  'Get started by adding your first service'}
              </p>
              <Button 
                variant="outline" 
                onClick={() => setIsAddServiceDialogOpen(true)}
                className="mt-4"
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Service
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Add Service Dialog */}
      <Dialog open={isAddServiceDialogOpen} onOpenChange={setIsAddServiceDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add New Service</DialogTitle>
            <DialogDescription>
              Create a new service offering for your clients.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Service Name</Label>
              <Input
                id="name"
                value={newService.name}
                onChange={(e) => setNewService({ ...newService, name: e.target.value })}
                placeholder="e.g. Web Development"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="price">Price</Label>
              <Input
                id="price"
                type="number"
                value={newService.price}
                onChange={(e) => setNewService({ ...newService, price: e.target.value })}
                placeholder="e.g. 999"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                value={newService.category}
                onChange={(e) => setNewService({ ...newService, category: e.target.value })}
                placeholder="e.g. Development"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={newService.description}
                onChange={(e) => setNewService({ ...newService, description: e.target.value })}
                placeholder="Describe the service..."
                className="min-h-[100px]"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="features">Features</Label>
              <div className="flex gap-2">
                <Input
                  id="features"
                  value={featureInput}
                  onChange={(e) => setFeatureInput(e.target.value)}
                  placeholder="Add a feature"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addFeature();
                    }
                  }}
                />
                <Button type="button" onClick={addFeature} variant="secondary">
                  Add
                </Button>
              </div>
              <div className="mt-2 space-y-2">
                {newService.features.map((feature, index) => (
                  <div key={index} className="flex items-center justify-between bg-secondary/20 p-2 rounded">
                    <span>{feature}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeFeature(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="active"
                checked={newService.active}
                onCheckedChange={(checked) => 
                  setNewService({ ...newService, active: checked as boolean })
                }
              />
              <Label htmlFor="active">Active (available to clients)</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddServiceDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddService} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                'Add Service'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Edit Service Dialog */}
      <Dialog open={isEditServiceDialogOpen} onOpenChange={setIsEditServiceDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Service</DialogTitle>
            <DialogDescription>
              Update service details and features.
            </DialogDescription>
          </DialogHeader>
          {selectedService && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-name">Service Name</Label>
                <Input
                  id="edit-name"
                  value={selectedService.name}
                  onChange={(e) => setSelectedService({ ...selectedService, name: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-price">Price</Label>
                <Input
                  id="edit-price"
                  type="number"
                  value={selectedService.price}
                  onChange={(e) => setSelectedService({ ...selectedService, price: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-category">Category</Label>
                <Input
                  id="edit-category"
                  value={selectedService.category}
                  onChange={(e) => setSelectedService({ ...selectedService, category: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  value={selectedService.description}
                  onChange={(e) => setSelectedService({ ...selectedService, description: e.target.value })}
                  className="min-h-[100px]"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-features">Features</Label>
                <div className="flex gap-2">
                  <Input
                    id="edit-features"
                    value={featureInput}
                    onChange={(e) => setFeatureInput(e.target.value)}
                    placeholder="Add a feature"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addFeature();
                      }
                    }}
                  />
                  <Button type="button" onClick={addFeature} variant="secondary">
                    Add
                  </Button>
                </div>
                <div className="mt-2 space-y-2">
                  {selectedService.features && selectedService.features.map((feature: string, index: number) => (
                    <div key={index} className="flex items-center justify-between bg-secondary/20 p-2 rounded">
                      <span>{feature}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeFeature(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="edit-active"
                  checked={selectedService.active}
                  onCheckedChange={(checked) => 
                    setSelectedService({ ...selectedService, active: checked as boolean })
                  }
                />
                <Label htmlFor="edit-active">Active (available to clients)</Label>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditServiceDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateService} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                'Update Service'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* View Service Dialog */}
      <Dialog open={isViewServiceDialogOpen} onOpenChange={setIsViewServiceDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Service Details</DialogTitle>
            <DialogDescription>
              Detailed information about this service.
            </DialogDescription>
          </DialogHeader>
          {selectedService && (
            <div className="space-y-4">
              <div className="flex items-start space-x-4">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-primary text-2xl">
                  <Package className="h-8 w-8" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold">{selectedService.name}</h3>
                  <p className="text-lg font-medium text-primary">{formatPrice(selectedService.price)}</p>
                </div>
              </div>
              
              <Separator />
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Category</p>
                  <p className="font-medium">{selectedService.category || 'Uncategorized'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge variant={selectedService.active ? "secondary" : "outline"}>
                    {selectedService.active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </div>
              
              <div>
                <p className="text-sm text-muted-foreground mb-1">Description</p>
                <p>{selectedService.description || 'No description provided.'}</p>
              </div>
              
              <div>
                <p className="text-sm text-muted-foreground mb-1">Features</p>
                {selectedService.features && selectedService.features.length > 0 ? (
                  <ul className="space-y-1 list-disc list-inside">
                    {selectedService.features.map((feature: string, index: number) => (
                      <li key={index}>{feature}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-muted-foreground">No features listed.</p>
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewServiceDialogOpen(false)}>
              Close
            </Button>
            <Button onClick={() => {
              setIsViewServiceDialogOpen(false);
              openEditDialog(selectedService);
            }}>
              Edit Service
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Service Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Delete Service</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this service? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {serviceToDelete && (
            <div className="py-4">
              <p className="font-medium">{serviceToDelete.name}</p>
              <p className="text-muted-foreground text-sm">{serviceToDelete.category || 'Uncategorized'} • {formatPrice(serviceToDelete.price)}</p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteService} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete Service'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminServices;
