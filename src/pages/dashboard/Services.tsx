
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import ServiceCard from '@/components/dashboard/ServiceCard';
import { getServiceByTitle, serviceOptions } from '@/lib/services-data';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

const Services: React.FC = () => {
  const { currentUser } = useAuth();
  
  if (!currentUser) return null;
  
  // Get active services
  const activeServices = currentUser.selectedServices
    .map(title => getServiceByTitle(title))
    .filter(Boolean);
  
  // Get available services (not currently subscribed)
  const availableServices = serviceOptions.filter(
    service => !currentUser.selectedServices.includes(service.title)
  );
  
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
            {activeServices.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {activeServices.map(service => (
                  <ServiceCard key={service!.id} service={service!} />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="pt-6 text-center">
                  <p className="text-muted-foreground">
                    You don't have any active services yet.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          <TabsContent value="available">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {availableServices.map(service => (
                <ServiceCard key={service.id} service={service} isActive={false} />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Services;
