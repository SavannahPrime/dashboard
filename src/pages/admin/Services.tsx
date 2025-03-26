
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Search, Plus, Edit, Trash2, MoreHorizontal, Eye, PlusCircle, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { toast } from 'sonner';

interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  features: string[];
  category: string;
  active: boolean;
  created_at: string;
}

const ServiceManagement: React.FC = () => {
  const { currentAdmin } = useAdminAuth();
  const [services, setServices] = useState<Service[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [newFeature, setNewFeature] = useState('');
  const [newService, setNewService] = useState<Partial<Service>>({
    name: '',
    description: '',
    price: 0,
    features: [],
    category: '',
    active: true
  });
  
  const fetchServices = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      setServices(data || []);
      
      // Log analytics
      await supabase.from('analytics').insert({
        type: 'admin_action',
        data: {
          admin_id: currentAdmin?.id,
          action: 'fetch_services',
          count: data?.length || 0
        },
        period: 'daily'
      });
      
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
        fetchServices(); // Refresh when services are updated
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentAdmin?.id]);
  
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
          description: newService.description,
          price: newService.price,
          features: newService.features,
          category: newService.category,
          active: newService.active
        })
        .select()
        .single();
      
      if (error) throw error;
      
      toast.success('Service added successfully');
      setIsAddDialogOpen(false);
      resetNewService();
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
      toast.error('Failed to add service');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleUpdateService = async () => {
    if (!selectedService) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('services')
        .update({
          name: selectedService.name,
          description: selectedService.description,
          price: selectedService.price,
          features: selectedService.features,
          category: selectedService.category,
          active: selectedService.active
        })
        .eq('id', selectedService.id)
        .select()
        .single();
      
      if (error) throw error;
      
      toast.success('Service updated successfully');
      setIsEditDialogOpen(false);
      setSelectedService(null);
      fetchServices();
      
      // Log the action
      await supabase.from('analytics').insert({
        type: 'admin_action',
        data: {
          admin_id: currentAdmin?.id,
          action: 'update_service',
          service_id: data.id
        },
        period: 'daily'
      });
      
    } catch (error) {
      console.error('Error updating service:', error);
      toast.error('Failed to update service');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDeleteService = async () => {
    if (!selectedService) return;
    
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('services')
        .delete()
        .eq('id', selectedService.id);
      
      if (error) throw error;
      
      toast.success('Service deleted successfully');
      setIsDeleteDialogOpen(false);
      setSelectedService(null);
      fetchServices();
      
      // Log the action
      await supabase.from('analytics').insert({
        type: 'admin_action',
        data: {
          admin_id: currentAdmin?.id,
          action: 'delete_service',
          service_id: selectedService.id
        },
        period: 'daily'
      });
      
    } catch (error) {
      console.error('Error deleting service:', error);
      toast.error('Failed to delete service');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleToggleActive = async (service: Service) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('services')
        .update({ active: !service.active })
        .eq('id', service.id)
        .select()
        .single();
      
      if (error) throw error;
      
      toast.success(`Service ${data.active ? 'activated' : 'deactivated'} successfully`);
      fetchServices();
      
      // Log the action
      await supabase.from('analytics').insert({
        type: 'admin_action',
        data: {
          admin_id: currentAdmin?.id,
          action: 'toggle_service_status',
          service_id: service.id,
          new_status: data.active ? 'active' : 'inactive'
        },
        period: 'daily'
      });
      
    } catch (error) {
      console.error('Error toggling service status:', error);
      toast.error('Failed to update service status');
    } finally {
      setIsLoading(false);
    }
  };
  
  const addFeature = () => {
    if (!newFeature.trim()) return;
    if (isEditDialogOpen && selectedService) {
      setSelectedService({
        ...selectedService,
        features: [...(selectedService.features || []), newFeature.trim()]
      });
    } else {
      setNewService({
        ...newService,
        features: [...(newService.features || []), newFeature.trim()]
      });
    }
    setNewFeature('');
  };
  
  const removeFeature = (index: number) => {
    if (isEditDialogOpen && selectedService) {
      const updatedFeatures = [...(selectedService.features || [])];
      updatedFeatures.splice(index, 1);
      setSelectedService({
        ...selectedService,
        features: updatedFeatures
      });
    } else {
      const updatedFeatures = [...(newService.features || [])];
      updatedFeatures.splice(index, 1);
      setNewService({
        ...newService,
        features: updatedFeatures
      });
    }
  };
  
  const resetNewService = () => {
    setNewService({
      name: '',
      description: '',
      price: 0,
      features: [],
      category: '',
      active: true
    });
  };
  
  const filteredServices = services.filter(service =>
    service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    service.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    service.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Service Management</h1>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add New Service
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Services</CardTitle>
          <CardDescription>
            Manage your service offerings, pricing, and features.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between mb-6">
            <div className="relative w-[300px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search services..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center items-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Features</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredServices.length > 0 ? (
                    filteredServices.map((service) => (
                      <TableRow key={service.id}>
                        <TableCell className="font-medium">{service.name}</TableCell>
                        <TableCell>{service.category || 'Uncategorized'}</TableCell>
                        <TableCell>{formatPrice(service.price)}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {service.features && service.features.length > 0 ? (
                              <Badge variant="outline" className="truncate max-w-[150px]">
                                {service.features.length} features
                              </Badge>
                            ) : (
                              <span className="text-muted-foreground text-sm">No features</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={service.active ? "success" : "secondary"}>
                            {service.active ? 'Active' : 'Inactive'}
                          </Badge>
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
                              <DropdownMenuItem onClick={() => {
                                setSelectedService(service);
                                setIsViewDialogOpen(true);
                              }}>
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => {
                                setSelectedService(service);
                                setIsEditDialogOpen(true);
                              }}>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit Service
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => handleToggleActive(service)}>
                                <Badge variant={service.active ? "outline" : "secondary"} className="mr-2">
                                  {service.active ? 'Deactivate' : 'Activate'}
                                </Badge>
                                {service.active ? 'Deactivate' : 'Activate'} Service
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                className="text-red-600" 
                                onClick={() => {
                                  setSelectedService(service);
                                  setIsDeleteDialogOpen(true);
                                }}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete Service
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-4 text-muted-foreground">
                        No services found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Add Service Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Add New Service</DialogTitle>
            <DialogDescription>
              Create a new service offering for your clients.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                className="col-span-3"
                value={newService.name}
                onChange={(e) => setNewService({ ...newService, name: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="price" className="text-right">
                Price
              </Label>
              <Input
                id="price"
                type="number"
                className="col-span-3"
                value={newService.price}
                onChange={(e) => setNewService({ ...newService, price: parseFloat(e.target.value) })}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="category" className="text-right">
                Category
              </Label>
              <Input
                id="category"
                className="col-span-3"
                value={newService.category}
                onChange={(e) => setNewService({ ...newService, category: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="active" className="text-right">
                Active
              </Label>
              <div className="flex items-center space-x-2 col-span-3">
                <Switch
                  id="active"
                  checked={newService.active}
                  onCheckedChange={(checked) => setNewService({ ...newService, active: checked })}
                />
                <Label htmlFor="active" className="cursor-pointer">
                  {newService.active ? 'Active' : 'Inactive'}
                </Label>
              </div>
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="description" className="text-right pt-2">
                Description
              </Label>
              <Textarea
                id="description"
                className="col-span-3"
                rows={4}
                value={newService.description}
                onChange={(e) => setNewService({ ...newService, description: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <Label className="text-right pt-2">Features</Label>
              <div className="col-span-3 space-y-2">
                <div className="flex space-x-2">
                  <Input
                    value={newFeature}
                    onChange={(e) => setNewFeature(e.target.value)}
                    placeholder="Add a feature"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addFeature();
                      }
                    }}
                  />
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="icon"
                    onClick={addFeature}
                  >
                    <PlusCircle className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {newService.features && newService.features.map((feature, index) => (
                    <Badge 
                      key={index} 
                      variant="outline"
                      className="flex items-center gap-1"
                    >
                      {feature}
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-4 w-4 p-0 text-muted-foreground ml-1 hover:text-foreground"
                        onClick={() => removeFeature(index)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsAddDialogOpen(false);
              resetNewService();
            }}>
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
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Service</DialogTitle>
            <DialogDescription>
              Update service details and features.
            </DialogDescription>
          </DialogHeader>
          {selectedService && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-name" className="text-right">
                  Name
                </Label>
                <Input
                  id="edit-name"
                  className="col-span-3"
                  value={selectedService.name}
                  onChange={(e) => setSelectedService({ ...selectedService, name: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-price" className="text-right">
                  Price
                </Label>
                <Input
                  id="edit-price"
                  type="number"
                  className="col-span-3"
                  value={selectedService.price}
                  onChange={(e) => setSelectedService({ ...selectedService, price: parseFloat(e.target.value) })}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-category" className="text-right">
                  Category
                </Label>
                <Input
                  id="edit-category"
                  className="col-span-3"
                  value={selectedService.category || ''}
                  onChange={(e) => setSelectedService({ ...selectedService, category: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-active" className="text-right">
                  Active
                </Label>
                <div className="flex items-center space-x-2 col-span-3">
                  <Switch
                    id="edit-active"
                    checked={selectedService.active}
                    onCheckedChange={(checked) => setSelectedService({ ...selectedService, active: checked })}
                  />
                  <Label htmlFor="edit-active" className="cursor-pointer">
                    {selectedService.active ? 'Active' : 'Inactive'}
                  </Label>
                </div>
              </div>
              <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="edit-description" className="text-right pt-2">
                  Description
                </Label>
                <Textarea
                  id="edit-description"
                  className="col-span-3"
                  rows={4}
                  value={selectedService.description || ''}
                  onChange={(e) => setSelectedService({ ...selectedService, description: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-4 items-start gap-4">
                <Label className="text-right pt-2">Features</Label>
                <div className="col-span-3 space-y-2">
                  <div className="flex space-x-2">
                    <Input
                      value={newFeature}
                      onChange={(e) => setNewFeature(e.target.value)}
                      placeholder="Add a feature"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addFeature();
                        }
                      }}
                    />
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="icon"
                      onClick={addFeature}
                    >
                      <PlusCircle className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedService.features && selectedService.features.map((feature, index) => (
                      <Badge 
                        key={index} 
                        variant="outline"
                        className="flex items-center gap-1"
                      >
                        {feature}
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-4 w-4 p-0 text-muted-foreground ml-1 hover:text-foreground"
                          onClick={() => removeFeature(index)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsEditDialogOpen(false);
              setSelectedService(null);
            }}>
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
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Service Details</DialogTitle>
            <DialogDescription>
              Detailed information about the service.
            </DialogDescription>
          </DialogHeader>
          {selectedService && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p className="font-medium">{selectedService.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Price</p>
                  <p className="font-medium">{formatPrice(selectedService.price)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Category</p>
                  <p className="font-medium">{selectedService.category || 'Uncategorized'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge variant={selectedService.active ? "success" : "secondary"}>
                    {selectedService.active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-muted-foreground mb-1">Description</p>
                  <p className="font-medium">{selectedService.description || 'No description provided'}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-muted-foreground mb-1">Features</p>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {selectedService.features && selectedService.features.length > 0 ? (
                      selectedService.features.map((feature, index) => (
                        <Badge key={index} variant="outline">
                          {feature}
                        </Badge>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">No features available</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              Close
            </Button>
            <Button onClick={() => {
              setIsViewDialogOpen(false);
              setSelectedService({...selectedService});
              setIsEditDialogOpen(true);
            }}>
              Edit Service
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Service Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Delete Service</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this service? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {selectedService && (
            <div className="py-4">
              <p className="mb-2"><span className="font-semibold">Name:</span> {selectedService.name}</p>
              <p><span className="font-semibold">Price:</span> {formatPrice(selectedService.price)}</p>
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

export default ServiceManagement;
