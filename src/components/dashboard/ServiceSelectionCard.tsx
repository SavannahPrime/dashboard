
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface Service {
  name: string;
  description: string;
  price: number;
}

interface ServiceSelectionCardProps {
  service: Service;
  isSelected: boolean;
  onSelect?: (service: Service) => void;
  onRemove?: (service: Service) => void;
}

const ServiceSelectionCard: React.FC<ServiceSelectionCardProps> = ({
  service,
  isSelected,
  onSelect,
  onRemove,
}) => {
  const { currentUser } = useAuth();

  const handleToggleService = async () => {
    if (!currentUser) return;
    
    try {
      if (isSelected) {
        // Remove service
        const updatedServices = (currentUser.selectedServices || []).filter(s => s !== service.name);
        
        // Update directly with Supabase instead of using updateUser
        const { error } = await supabase
          .from('clients')
          .update({ selected_services: updatedServices })
          .eq('id', currentUser.id);
        
        if (error) throw error;
        
        if (onRemove) onRemove(service);
        toast.success(`Removed ${service.name} from your services`);
      } else {
        // Add service
        const updatedServices = [...(currentUser.selectedServices || []), service.name];
        
        // Update directly with Supabase instead of using updateUser
        const { error } = await supabase
          .from('clients')
          .update({ selected_services: updatedServices })
          .eq('id', currentUser.id);
        
        if (error) throw error;
        
        if (onSelect) onSelect(service);
        toast.success(`Added ${service.name} to your services`);
      }
      
      // Refresh the page to reload user data
      window.location.reload();
    } catch (error) {
      console.error("Error updating services:", error);
      toast.error("Failed to update services");
    }
  };

  return (
    <Card className="w-full">
      <CardContent className="flex flex-row items-center justify-between space-y-0 pb-2">
        <Label htmlFor={service.name} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          {service.name}
        </Label>
        <Checkbox
          id={service.name}
          checked={isSelected}
          onCheckedChange={handleToggleService}
        />
      </CardContent>
    </Card>
  );
};

export default ServiceSelectionCard;
