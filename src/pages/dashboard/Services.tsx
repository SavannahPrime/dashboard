
import React, { useEffect, useState } from 'react';
import { Check, Loader2, Package, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import ServiceCard from '@/components/dashboard/ServiceCard';
import ServiceSelectionCard from '@/components/dashboard/ServiceSelectionCard';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { ServiceOption } from '@/lib/services-data';

const Services: React.FC = () => {
  const [activeTab, setActiveTab] = useState('my-services');
  const [myServices, setMyServices] = useState<ServiceOption[]>([]);
  const [availableServices, setAvailableServices] = useState<ServiceOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isActivating, setIsActivating] = useState<string | null>(null);
  const { currentUser } = useAuth();
  
  const fetchServices = async () => {
    setIsLoading(true);
    try {
      if (!currentUser?.id) return;
      
      // Fetch all services from the database
      const { data: servicesData, error: servicesError } = await supabase
        .from('services')
        .select('*')
        .eq('active', true);
      
      if (servicesError) throw servicesError;
      
      // Fetch client's selected services
      const { data: clientData, error: clientError } = await supabase
        .from('clients')
        .select('selected_services')
        .eq('id', currentUser.id)
        .single();
      
      if (clientError && clientError.code !== 'PGRST116') {
        throw clientError;
      }
      
      const selectedServiceIds = clientData?.selected_services || [];
      
      // Transform services data to match our interface
      const transformedServices = servicesData?.map(service => ({
        id: service.id,
        name: service.name,
        title: service.name, // Map name to title for compatibility
        description: service.description || '',
        price: Number(service.price),
        priceUnit: 'month',
        features: service.features || [],
        category: service.category
      })) || [];
      
      // Separate services into "my" and "available"
      const myServicesList = transformedServices.filter(service => 
        selectedServiceIds.includes(service.id)
      );
      
      const availableServicesList = transformedServices.filter(service => 
        !selectedServiceIds.includes(service.id)
      );
      
      setMyServices(myServicesList);
      setAvailableServices(availableServicesList);
    } catch (error: any) {
      console.error('Error fetching services:', error);
      toast.error(error.message || 'Failed to load services');
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    fetchServices();
  }, [currentUser?.id]);
  
  const handleActivateService = async (serviceId: string) => {
    try {
      if (!currentUser?.id) {
        toast.error('You must be logged in to activate a service');
        return;
      }
      
      setIsActivating(serviceId);
      
      // Get current selected services
      const { data: clientData, error: clientError } = await supabase
        .from('clients')
        .select('selected_services')
        .eq('id', currentUser.id)
        .single();
      
      if (clientError) throw clientError;
      
      const currentServices = clientData?.selected_services || [];
      const updatedServices = [...currentServices, serviceId];
      
      // Update the client's selected services
      const { error: updateError } = await supabase
        .from('clients')
        .update({ selected_services: updatedServices })
        .eq('id', currentUser.id);
      
      if (updateError) throw updateError;
      
      // Create a transaction record
      const serviceToActivate = availableServices.find(s => s.id === serviceId);
      
      if (serviceToActivate) {
        const { error: transactionError } = await supabase
          .from('transactions')
          .insert({
            client_id: currentUser.id,
            amount: serviceToActivate.price,
            status: 'pending',
            type: 'subscription',
            description: `Subscription for ${serviceToActivate.title}`,
            date: new Date().toISOString()
          });
        
        if (transactionError) throw transactionError;
      }
      
      toast.success('Service activated successfully!');
      fetchServices();
      
      // Switch to "my services" tab
      setActiveTab('my-services');
    } catch (error: any) {
      console.error('Error activating service:', error);
      toast.error(error.message || 'Failed to activate service');
    } finally {
      setIsActivating(null);
    }
  };
  
  const handleDeactivateService = async (serviceId: string) => {
    try {
      if (!currentUser?.id) {
        toast.error('You must be logged in to deactivate a service');
        return;
      }
      
      // Get current selected services
      const { data: clientData, error: clientError } = await supabase
        .from('clients')
        .select('selected_services')
        .eq('id', currentUser.id)
        .single();
      
      if (clientError) throw clientError;
      
      const currentServices = clientData?.selected_services || [];
      const updatedServices = currentServices.filter(id => id !== serviceId);
      
      // Update the client's selected services
      const { error: updateError } = await supabase
        .from('clients')
        .update({ selected_services: updatedServices })
        .eq('id', currentUser.id);
      
      if (updateError) throw updateError;
      
      toast.success('Service deactivated successfully');
      fetchServices();
    } catch (error: any) {
      console.error('Error deactivating service:', error);
      toast.error(error.message || 'Failed to deactivate service');
    }
  };
  
  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <p className="text-lg">Loading services...</p>
        </div>
      );
    }
    
    return (
      <Tabs defaultValue={activeTab} value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="my-services">My Services</TabsTrigger>
          <TabsTrigger value="available-services">Available Services</TabsTrigger>
        </TabsList>
        
        <TabsContent value="my-services" className="py-6">
          {myServices.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {myServices.map((service) => (
                <ServiceCard 
                  key={service.id} 
                  service={service}
                  onDeactivate={() => handleDeactivateService(service.id)}
                />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Package className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-xl font-medium mb-2">No Active Services</h3>
                <p className="text-muted-foreground text-center max-w-md mb-6">
                  You haven't activated any services yet. Check out our available services to get started.
                </p>
                <button 
                  onClick={() => setActiveTab('available-services')}
                  className="flex items-center justify-center text-primary"
                >
                  Browse Available Services
                </button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="available-services" className="py-6">
          {availableServices.length > 0 ? (
            <>
              <Alert className="mb-6">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Payment Required</AlertTitle>
                <AlertDescription>
                  Activating a service will require payment. You will be charged according to the pricing shown.
                </AlertDescription>
              </Alert>
              
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {availableServices.map((service) => (
                  <ServiceSelectionCard 
                    key={service.id} 
                    service={service} 
                    isActive={false}
                    onActivate={() => handleActivateService(service.id)}
                    isLoading={isActivating === service.id}
                  />
                ))}
              </div>
            </>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Check className="h-12 w-12 text-green-500 mb-4" />
                <h3 className="text-xl font-medium mb-2">All Services Activated</h3>
                <p className="text-muted-foreground text-center max-w-md">
                  You've activated all available services. Check back later for new offerings.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    );
  };
  
  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Services</h1>
        <p className="text-muted-foreground">
          Manage your active services and explore new offerings
        </p>
      </div>
      
      {renderContent()}
    </div>
  );
};

export default Services;
