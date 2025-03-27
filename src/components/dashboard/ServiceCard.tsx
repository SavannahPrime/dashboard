
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, HelpCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useNavigate } from 'react-router-dom';

interface ServiceCardProps {
  service: {
    id: string;
    title: string;
    description: string;
    price: number;
    priceUnit: string;
    features: string[];
    category?: string;
  };
  onDeactivate?: () => void;
}

const ServiceCard: React.FC<ServiceCardProps> = ({ service, onDeactivate }) => {
  const [isDeactivateDialogOpen, setIsDeactivateDialogOpen] = useState(false);
  const navigate = useNavigate();
  
  const handleViewDetails = () => {
    toast.success(`Viewing details for ${service.title}`);
  };
  
  const handleManageBilling = () => {
    navigate('/dashboard/billing', { 
      state: { 
        selectedService: service
      } 
    });
  };
  
  const handleSupportRequest = () => {
    navigate('/dashboard/support', { 
      state: { 
        serviceTitle: service.title,
        requestType: 'service-help'
      } 
    });
  };
  
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };
  
  return (
    <Card className="flex flex-col h-full">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>{service.title}</CardTitle>
            <CardDescription className="mt-1">{service.description}</CardDescription>
          </div>
          {service.category && (
            <Badge variant="outline">{service.category}</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex-1">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-2xl font-bold">{formatPrice(service.price)}</span>
          <span className="text-muted-foreground">/{service.priceUnit}</span>
        </div>
        
        <div className="space-y-2">
          {service.features.map((feature, index) => (
            <div key={index} className="flex items-start gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
              <span>{feature}</span>
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter className="flex flex-col gap-2">
        <div className="grid grid-cols-2 gap-2 w-full">
          <Button variant="outline" onClick={handleSupportRequest}>
            <HelpCircle className="mr-2 h-4 w-4" />
            Support
          </Button>
          <Button onClick={handleManageBilling}>
            Manage Billing
          </Button>
        </div>
        
        <Dialog open={isDeactivateDialogOpen} onOpenChange={setIsDeactivateDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost" className="text-destructive hover:text-destructive w-full mt-2">
              <AlertCircle className="mr-2 h-4 w-4" />
              Deactivate Service
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Deactivate Service</DialogTitle>
              <DialogDescription>
                Are you sure you want to deactivate {service.title}? 
                This will stop your access to the service and cancel future billing.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDeactivateDialogOpen(false)}>Cancel</Button>
              <Button 
                variant="destructive" 
                onClick={() => {
                  setIsDeactivateDialogOpen(false);
                  if (onDeactivate) onDeactivate();
                }}
              >
                Deactivate
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardFooter>
    </Card>
  );
};

export default ServiceCard;
