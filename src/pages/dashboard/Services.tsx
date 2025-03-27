
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import ServiceCard from '@/components/dashboard/ServiceCard';
import ServiceSelectionCard from '@/components/dashboard/ServiceSelectionCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Loader2, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const Services: React.FC = () => {
  const { currentUser } = useAuth();
  const [availableServices, setAvailableServices] = useState<any[]>([]);
  const [activeServices, setActiveServices] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
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
      let formattedServices = [];
      
      if (servicesData && servicesData.length > 0) {
        // Format services with the expected structure
        formattedServices = servicesData.map(service => ({
          id: service.id,
          title: service.name,
          description: service.description || '',
          price: service.price,
          priceUnit: service.price_unit || 'month',
          features: service.features || [],
          category: service.category,
        }));
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
          category: '',
        }));
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
                  <ServiceCard key={service.id} service={service} />
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {availableServices.map(service => (
                  <ServiceSelectionCard 
                    key={service.id} 
                    service={service} 
                    isActive={false} 
                  />
                ))}
              </div>
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
