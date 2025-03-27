
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import ServiceCard from '@/components/dashboard/ServiceCard';
import ServiceSelectionCard from '@/components/dashboard/ServiceSelectionCard';
import { getServiceByTitle, serviceOptions } from '@/lib/services-data';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const Services: React.FC = () => {
  const { currentUser } = useAuth();
  const [availableServices, setAvailableServices] = useState<any[]>([]);
  const [activeServices, setActiveServices] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    if (currentUser) {
      fetchServices();
    }
  }, [currentUser]);
  
  const fetchServices = async () => {
    setIsLoading(true);
    try {
      // Fetch all services from database
      const { data: servicesData, error } = await supabase
        .from('services')
        .select('*')
        .order('price', { ascending: true });
      
      if (error) throw error;
      
      if (servicesData && currentUser) {
        // Format services with the expected structure
        const formattedServices = servicesData.map(service => ({
          id: service.id,
          title: service.name,
          description: service.description || '',
          price: service.price,
          priceUnit: 'month',
          features: service.features || [],
          category: service.category,
        }));
        
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
    } catch (error) {
      console.error('Error fetching services:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  if (!currentUser) return null;
  
  return (
    <div className="animate-fade-in">
      <DashboardHeader pageTitle="My Services" />
      
      <div className="p-6">
        <Tabs defaultValue="active" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="active">
              Active Services
              <Badge className="ml-2 bg-green-500">{activeServices.length}</Badge>
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
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {availableServices.map(service => (
                  <ServiceSelectionCard 
                    key={service.id} 
                    service={service} 
                    isActive={false} 
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Services;
