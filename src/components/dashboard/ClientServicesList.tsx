
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Check, X, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import type { Service } from '@/services/serviceService';

type ClientService = {
  id: string;
  name: string;
  description: string;
  price: number;
  status: 'active' | 'pending' | 'expired';
  startDate: string;
  expiryDate?: string;
};

interface ClientServicesListProps {
  clientId: string;
}

export const ClientServicesList: React.FC<ClientServicesListProps> = ({ clientId }) => {
  const [assignedServices, setAssignedServices] = useState<ClientService[]>([]);
  const [availableServices, setAvailableServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchClientServices = async () => {
      setIsLoading(true);
      try {
        // Fetch client data with selected services
        const { data: clientData, error: clientError } = await supabase
          .from('clients')
          .select('selected_services, subscription_expiry')
          .eq('id', clientId)
          .single();
          
        if (clientError) throw clientError;
        
        // Fetch assigned services details
        const selectedServiceIds = clientData.selected_services || [];
        if (selectedServiceIds.length > 0) {
          const { data: servicesData, error: servicesError } = await supabase
            .from('services')
            .select('*')
            .in('id', selectedServiceIds);
            
          if (servicesError) throw servicesError;
          
          const mappedServices: ClientService[] = servicesData.map(service => ({
            id: service.id,
            name: service.name,
            description: service.description || '',
            price: service.price,
            status: clientData.subscription_expiry && new Date(clientData.subscription_expiry) < new Date() 
              ? 'expired' 
              : 'active',
            startDate: new Date().toISOString().split('T')[0], // This should come from subscription start date
            expiryDate: clientData.subscription_expiry
          }));
          
          setAssignedServices(mappedServices);
        }
        
        // Fetch all available services
        const { data: allServices, error: allServicesError } = await supabase
          .from('services')
          .select('*')
          .eq('active', true)
          .order('price', { ascending: true });
          
        if (allServicesError) throw allServicesError;
        
        const filteredServices = allServices.filter(
          service => !selectedServiceIds.includes(service.id)
        );
        
        setAvailableServices(filteredServices);
      } catch (error) {
        console.error('Error fetching client services:', error);
        toast.error('Failed to load services');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchClientServices();
    
    // Set up real-time listener for service changes
    const servicesChannel = supabase
      .channel('services-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'services' }, 
        () => {
          fetchClientServices();
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(servicesChannel);
    };
  }, [clientId]);
  
  const handleAddService = async (serviceId: string) => {
    try {
      // Get current selected services
      const { data, error } = await supabase
        .from('clients')
        .select('selected_services')
        .eq('id', clientId)
        .single();
        
      if (error) throw error;
      
      // Update selected services
      const selectedServices = [...(data.selected_services || []), serviceId];
      
      const { error: updateError } = await supabase
        .from('clients')
        .update({ selected_services: selectedServices })
        .eq('id', clientId);
        
      if (updateError) throw updateError;
      
      toast.success('Service added successfully');
      
      // Refresh services
      const selectedService = availableServices.find(s => s.id === serviceId);
      if (selectedService) {
        setAssignedServices(prev => [...prev, {
          id: selectedService.id,
          name: selectedService.name,
          description: selectedService.description || '',
          price: selectedService.price,
          status: 'active',
          startDate: new Date().toISOString().split('T')[0]
        }]);
        
        setAvailableServices(prev => prev.filter(s => s.id !== serviceId));
      }
    } catch (error) {
      console.error('Error adding service:', error);
      toast.error('Failed to add service');
    }
  };
  
  const handleRemoveService = async (serviceId: string) => {
    try {
      // Get current selected services
      const { data, error } = await supabase
        .from('clients')
        .select('selected_services')
        .eq('id', clientId)
        .single();
        
      if (error) throw error;
      
      // Update selected services
      const selectedServices = (data.selected_services || []).filter(
        (id: string) => id !== serviceId
      );
      
      const { error: updateError } = await supabase
        .from('clients')
        .update({ selected_services: selectedServices })
        .eq('id', clientId);
        
      if (updateError) throw updateError;
      
      toast.success('Service removed successfully');
      
      // Refresh services
      const removedService = assignedServices.find(s => s.id === serviceId);
      if (removedService) {
        setAvailableServices(prev => [...prev, {
          id: removedService.id,
          name: removedService.name,
          description: removedService.description,
          price: removedService.price,
          features: [],
          active: true
        }]);
        
        setAssignedServices(prev => prev.filter(s => s.id !== serviceId));
      }
    } catch (error) {
      console.error('Error removing service:', error);
      toast.error('Failed to remove service');
    }
  };
  
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'active':
        return 'default';
      case 'pending':
        return 'secondary';
      case 'expired':
        return 'destructive';
      default:
        return 'outline';
    }
  };
  
  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-4">Your Services</h2>
        {assignedServices.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
              <p className="text-lg font-medium">No services assigned</p>
              <p className="text-muted-foreground">Browse available services below to get started</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {assignedServices.map((service) => (
              <Card key={service.id} className="overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle>{service.name}</CardTitle>
                    <Badge variant={getStatusBadgeVariant(service.status)}>
                      {service.status}
                    </Badge>
                  </div>
                  <CardDescription>{service.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="font-medium text-lg mb-2">{new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'USD',
                    minimumFractionDigits: 0
                  }).format(service.price)}</div>
                  
                  <div className="text-xs text-muted-foreground mb-4">
                    Start date: {new Date(service.startDate).toLocaleDateString()}
                    {service.expiryDate && (
                      <>
                        <br />
                        Expiry date: {new Date(service.expiryDate).toLocaleDateString()}
                      </>
                    )}
                  </div>
                  
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    onClick={() => handleRemoveService(service.id)}
                    className="w-full mt-2"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Remove
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
      
      <div>
        <h2 className="text-2xl font-bold mb-4">Available Services</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {availableServices.map((service) => (
            <Card key={service.id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle>{service.name}</CardTitle>
                <CardDescription>{service.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="font-medium text-lg mb-2">{new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: 'USD',
                  minimumFractionDigits: 0
                }).format(service.price)}</div>
                
                {service.features && service.features.length > 0 && (
                  <ul className="text-sm mb-4 space-y-1">
                    {service.features.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <Check className="h-4 w-4 mr-2 text-green-500 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                )}
                
                <Button 
                  variant="default" 
                  size="sm" 
                  onClick={() => handleAddService(service.id)}
                  className="w-full mt-2"
                >
                  <Check className="h-4 w-4 mr-2" />
                  Add Service
                </Button>
              </CardContent>
            </Card>
          ))}
          {availableServices.length === 0 && (
            <Card className="col-span-full">
              <CardContent className="p-6 text-center">
                <p className="text-muted-foreground">No additional services available</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClientServicesList;
