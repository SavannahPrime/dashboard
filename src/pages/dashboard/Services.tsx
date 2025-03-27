
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import ServiceCard from '@/components/dashboard/ServiceCard';
import ServiceSelectionCard from '@/components/dashboard/ServiceSelectionCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Loader2, AlertCircle, FilterX } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

interface Service {
  id: string;
  title: string;
  description: string;
  price: number;
  priceUnit: string;
  features: string[];
  category: string;
}

const Services: React.FC = () => {
  const { currentUser, updateUser } = useAuth();
  const navigate = useNavigate();
  const [availableServices, setAvailableServices] = useState<Service[]>([]);
  const [activeServices, setActiveServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [categories, setCategories] = useState<string[]>([]);
  const [isActivating, setIsActivating] = useState(false);
  
  useEffect(() => {
    if (currentUser) {
      fetchServices();
    }
  }, [currentUser]);
  
  const fetchServices = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Fetch all services from database
      const { data: servicesData, error: servicesError } = await supabase
        .from('services')
        .select('*')
        .order('price', { ascending: true });
      
      if (servicesError) throw servicesError;
      
      // If no data in services table, fallback to local data
      let formattedServices: Service[] = [];
      
      if (servicesData && servicesData.length > 0) {
        // Format services with the expected structure
        formattedServices = servicesData.map(service => ({
          id: service.id,
          title: service.name,
          description: service.description || '',
          price: service.price,
          priceUnit: service.price_unit || 'month',
          features: service.features || [],
          category: service.category || 'Other'
        }));
        
        // Extract unique categories
        const uniqueCategories = [...new Set(formattedServices.map(service => service.category))].filter(Boolean);
        setCategories(uniqueCategories);
      } else {
        // Fallback to local data from services-data.ts
        const { serviceOptions } = await import('@/lib/services-data');
        formattedServices = serviceOptions.map(service => ({
          id: service.id,
          title: service.title,
          description: service.description,
          price: service.price,
          priceUnit: service.priceUnit,
          features: service.features,
          category: service.category || 'Other'
        }));
        
        // Extract unique categories
        const uniqueCategories = [...new Set(formattedServices.map(service => service.category))].filter(Boolean);
        setCategories(uniqueCategories);
      }
      
      if (currentUser) {
        // Split into active and available services
        const active = formattedServices.filter(service => 
          currentUser.selectedServices.includes(service.title)
        );
        
        const available = formattedServices.filter(service => 
          !currentUser.selectedServices.includes(service.title)
        );
        
        setActiveServices(active);
        setAvailableServices(available);
      }
    } catch (error: any) {
      console.error('Error fetching services:', error);
      setError(error.message || 'Failed to load services');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleServiceActivation = async (service: Service) => {
    if (!currentUser) return;
    
    setIsActivating(true);
    try {
      // Add service to user's selected services
      const updatedServices = [...currentUser.selectedServices, service.title];
      
      // Update user in database
      const { error } = await supabase
        .from('clients')
        .update({
          selected_services: updatedServices
        })
        .eq('id', currentUser.id);
      
      if (error) throw error;
      
      // Update local state
      if (updateUser) {
        updateUser({
          ...currentUser,
          selectedServices: updatedServices
        });
      }
      
      // Move service from available to active
      setActiveServices([...activeServices, service]);
      setAvailableServices(availableServices.filter(s => s.id !== service.id));
      
      toast.success(`Service "${service.title}" activated successfully!`);
      
      // Navigate to billing to complete payment
      navigate('/dashboard/billing', { 
        state: { 
          selectedService: service,
          isNewService: true
        }
      });
      
    } catch (error: any) {
      console.error('Error activating service:', error);
      toast.error('Failed to activate service: ' + (error.message || 'Unknown error'));
    } finally {
      setIsActivating(false);
    }
  };
  
  const handleServiceDeactivation = async (service: Service) => {
    if (!currentUser) return;
    
    try {
      // Remove service from user's selected services
      const updatedServices = currentUser.selectedServices.filter(s => s !== service.title);
      
      // Update user in database
      const { error } = await supabase
        .from('clients')
        .update({
          selected_services: updatedServices
        })
        .eq('id', currentUser.id);
      
      if (error) throw error;
      
      // Update local state
      if (updateUser) {
        updateUser({
          ...currentUser,
          selectedServices: updatedServices
        });
      }
      
      // Move service from active to available
      setAvailableServices([...availableServices, service]);
      setActiveServices(activeServices.filter(s => s.id !== service.id));
      
      toast.success(`Service "${service.title}" deactivated successfully!`);
      
    } catch (error: any) {
      console.error('Error deactivating service:', error);
      toast.error('Failed to deactivate service: ' + (error.message || 'Unknown error'));
    }
  };
  
  const filteredAvailableServices = selectedCategory === 'all'
    ? availableServices
    : availableServices.filter(service => service.category === selectedCategory);
  
  if (!currentUser) return null;
  
  return (
    <div className="animate-fade-in">
      <DashboardHeader pageTitle="My Services" />
      
      <div className="p-6">
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <Tabs defaultValue="active" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="active">
              Active Services
              <Badge className="ml-2 bg-green-500 text-white">{activeServices.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="available">
              Available Services
              <Badge className="ml-2">{availableServices.length}</Badge>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="active">
            {isLoading ? (
              <div className="flex justify-center py-10">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : activeServices.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {activeServices.map(service => (
                  <ServiceCard 
                    key={service.id} 
                    service={service} 
                    onDeactivate={() => handleServiceDeactivation(service)}
                  />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="pt-6 text-center">
                  <p className="text-muted-foreground">
                    You don't have any active services yet. Browse available services to get started.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          <TabsContent value="available">
            {isLoading ? (
              <div className="flex justify-center py-10">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : availableServices.length > 0 ? (
              <>
                {categories.length > 0 && (
                  <div className="mb-6">
                    <div className="flex flex-wrap gap-2 items-center">
                      <span className="text-sm font-medium">Filter by category:</span>
                      <Button 
                        variant={selectedCategory === 'all' ? 'default' : 'outline'} 
                        size="sm"
                        onClick={() => setSelectedCategory('all')}
                      >
                        All
                      </Button>
                      {categories.map(category => (
                        <Button 
                          key={category} 
                          variant={selectedCategory === category ? 'default' : 'outline'} 
                          size="sm"
                          onClick={() => setSelectedCategory(category)}
                        >
                          {category}
                        </Button>
                      ))}
                      {selectedCategory !== 'all' && (
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="text-muted-foreground"
                          onClick={() => setSelectedCategory('all')}
                        >
                          <FilterX className="h-4 w-4 mr-1" />
                          Clear filter
                        </Button>
                      )}
                    </div>
                  </div>
                )}
                
                {filteredAvailableServices.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredAvailableServices.map(service => (
                      <ServiceSelectionCard 
                        key={service.id} 
                        service={service} 
                        isActive={false}
                        onActivate={() => handleServiceActivation(service)}
                        isLoading={isActivating}
                      />
                    ))}
                  </div>
                ) : (
                  <Card>
                    <CardContent className="pt-6 text-center">
                      <p className="text-muted-foreground">
                        No services found in the "{selectedCategory}" category.
                      </p>
                      <Button 
                        variant="outline" 
                        className="mt-4"
                        onClick={() => setSelectedCategory('all')}
                      >
                        View all services
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </>
            ) : (
              <Card>
                <CardContent className="pt-6 text-center">
                  <p className="text-muted-foreground">
                    No additional services are available at this time.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Services;
