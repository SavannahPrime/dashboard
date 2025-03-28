
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, CheckCircle, Globe, Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ServiceOption } from '@/lib/types';
import ServiceCard from '@/components/dashboard/ServiceCard';
import ServiceSelectionCard from '@/components/dashboard/ServiceSelectionCard';

const Services: React.FC = () => {
  const { currentUser, refreshUserData } = useAuth();
  const navigate = useNavigate();
  
  const [services, setServices] = useState<ServiceOption[]>([]);
  const [filteredServices, setFilteredServices] = useState<ServiceOption[]>([]);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [currentTab, setCurrentTab] = useState<'available' | 'selected'>('available');
  
  // Fetch services from Supabase
  useEffect(() => {
    const fetchServices = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('services')
          .select('*')
          .eq('active', true);
        
        if (error) throw error;
        
        // Transform data to match ServiceOption structure
        const formattedServices = data.map(service => ({
          id: service.id,
          name: service.name,
          title: service.name, // Map name to title
          description: service.description || '',
          price: Number(service.price),
          priceUnit: 'month',
          features: service.features || [],
          category: service.category,
          icon: Globe // Default icon
        }));
        
        setServices(formattedServices);
        setFilteredServices(formattedServices);
        
        // Extract unique categories
        const uniqueCategories = Array.from(
          new Set(formattedServices.map(service => service.category).filter(Boolean))
        ) as string[];
        
        setCategories(uniqueCategories);
      } catch (error) {
        console.error('Error fetching services:', error);
        toast.error('Failed to load services');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchServices();
  }, []);
  
  // Fetch user's selected services
  useEffect(() => {
    if (currentUser?.id) {
      const fetchUserServices = async () => {
        try {
          const { data, error } = await supabase
            .from('clients')
            .select('selected_services')
            .eq('id', currentUser.id)
            .single();
          
          if (error) throw error;
          
          setSelectedServices(data.selected_services || []);
        } catch (error) {
          console.error('Error fetching user services:', error);
        }
      };
      
      fetchUserServices();
    }
  }, [currentUser?.id]);
  
  // Filter services by category
  useEffect(() => {
    if (activeCategory === 'all') {
      setFilteredServices(services);
    } else {
      setFilteredServices(services.filter(service => service.category === activeCategory));
    }
  }, [activeCategory, services]);
  
  const handleCategoryChange = (category: string) => {
    setActiveCategory(category);
  };
  
  const handleServiceToggle = async (serviceId: string) => {
    if (!currentUser?.id) {
      toast.error('Please log in to select services');
      return;
    }
    
    setIsUpdating(true);
    try {
      // Toggle service selection
      let updatedSelectedServices: string[];
      
      if (selectedServices.includes(serviceId)) {
        updatedSelectedServices = selectedServices.filter(id => id !== serviceId);
      } else {
        updatedSelectedServices = [...selectedServices, serviceId];
      }
      
      // Update in Supabase
      const { error } = await supabase
        .from('clients')
        .update({ selected_services: updatedSelectedServices })
        .eq('id', currentUser.id);
      
      if (error) throw error;
      
      // Update local state
      setSelectedServices(updatedSelectedServices);
      refreshUserData();
      
      toast.success(
        selectedServices.includes(serviceId) 
          ? 'Service removed from your selection' 
          : 'Service added to your selection'
      );
    } catch (error) {
      console.error('Error updating services:', error);
      toast.error('Failed to update service selection');
    } finally {
      setIsUpdating(false);
    }
  };
  
  const getSelectedServicesData = () => {
    return services.filter(service => selectedServices.includes(service.id));
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Services</h1>
        <p className="text-muted-foreground">
          Browse and manage your service subscriptions
        </p>
      </div>
      
      <Tabs defaultValue="available" value={currentTab} onValueChange={(value) => setCurrentTab(value as any)}>
        <TabsList>
          <TabsTrigger value="available">Available Services</TabsTrigger>
          <TabsTrigger value="selected">
            My Services {selectedServices.length > 0 && `(${selectedServices.length})`}
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="available" className="space-y-6">
          {/* Category selection */}
          <div className="flex flex-wrap gap-2">
            <Badge 
              variant={activeCategory === 'all' ? 'default' : 'outline'}
              className="cursor-pointer hover:bg-secondary"
              onClick={() => handleCategoryChange('all')}
            >
              All
            </Badge>
            {categories.map(category => (
              <Badge
                key={category}
                variant={activeCategory === category ? 'default' : 'outline'}
                className="cursor-pointer hover:bg-secondary"
                onClick={() => handleCategoryChange(category)}
              >
                {category}
              </Badge>
            ))}
          </div>
          
          {/* Services listing */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredServices.map(service => (
              <ServiceSelectionCard
                key={service.id}
                service={service}
                isSelected={selectedServices.includes(service.id)}
                onToggle={() => handleServiceToggle(service.id)}
                isUpdating={isUpdating}
              />
            ))}
          </div>
          
          {filteredServices.length === 0 && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-xl font-medium mb-2">No Services Found</h3>
                <p className="text-muted-foreground text-center max-w-md">
                  There are no services available in this category. Please check back later.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="selected" className="space-y-6">
          {selectedServices.length > 0 ? (
            <>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {getSelectedServicesData().map(service => (
                  <ServiceCard
                    key={service.id}
                    service={service}
                    onRemove={() => handleServiceToggle(service.id)}
                    isUpdating={isUpdating}
                  />
                ))}
              </div>
              
              <div className="flex justify-end gap-4">
                <Button onClick={() => navigate('/dashboard/billing')}>
                  Manage Billing
                </Button>
              </div>
            </>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-xl font-medium mb-2">No Services Selected</h3>
                <p className="text-muted-foreground text-center max-w-md mb-6">
                  You haven't selected any services yet. Browse our available services and add ones that meet your needs.
                </p>
                <Button onClick={() => setCurrentTab('available')}>
                  Browse Services
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Services;
