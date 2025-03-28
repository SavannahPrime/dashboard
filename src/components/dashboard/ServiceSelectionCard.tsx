
import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, PlusCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface ServiceProps {
  id: string;
  title: string;
  description: string;
  features: string[];
  price: number;
  priceUnit: string;
  category?: string;
  icon?: React.ReactNode;
}

interface ServiceSelectionCardProps {
  service: ServiceProps;
  isActive?: boolean;
}

const ServiceSelectionCard: React.FC<ServiceSelectionCardProps> = ({
  service,
  isActive = false,
}) => {
  const { currentUser, updateUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  
  const handleAddService = async () => {
    if (!currentUser) {
      toast.error('You need to be logged in to add services');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Add to user's selected services
      const updatedServices = [...(currentUser.selectedServices || []), service.title];
      
      // Update in database
      const { error } = await supabase
        .from('clients')
        .update({ selected_services: updatedServices })
        .eq('id', currentUser.id);
      
      if (error) throw error;
      
      // Update local user state
      updateUser({ selectedServices: updatedServices });
      
      toast.success(`Added ${service.title} to your account!`);
      
      // Create a transaction record
      await supabase
        .from('transactions')
        .insert({
          client_id: currentUser.id,
          amount: service.price,
          type: 'subscription',
          status: 'pending',
          description: `Subscription to ${service.title}`
        });
      
    } catch (error) {
      console.error('Error adding service:', error);
      toast.error('Failed to add service');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Card className={`overflow-hidden transition-all duration-300 ${isActive ? 'border-primary' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>{service.title}</CardTitle>
            <CardDescription className="mt-1.5">{service.description}</CardDescription>
          </div>
          {isActive && (
            <Badge className="bg-green-500 text-white">Active</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="pb-3">
        <div className="text-2xl font-bold mb-4">
          ${service.price}<span className="text-sm font-normal text-muted-foreground">/{service.priceUnit}</span>
        </div>
        
        <ul className="space-y-2 text-sm">
          {service.features.map((feature, index) => (
            <li key={index} className="flex items-start">
              <CheckCircle2 className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter>
        {isActive ? (
          <Button variant="outline" className="w-full" disabled>
            Current Plan
          </Button>
        ) : (
          <Button 
            className="w-full" 
            onClick={handleAddService}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Adding...
              </>
            ) : (
              <>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Service
              </>
            )}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default ServiceSelectionCard;
