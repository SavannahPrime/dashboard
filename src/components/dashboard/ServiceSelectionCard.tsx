
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Loader2 } from 'lucide-react';

interface ServiceSelectionCardProps {
  service: {
    id: string;
    title: string;
    description: string;
    price: number;
    priceUnit: string;
    features: string[];
    category?: string;
  };
  isActive: boolean;
  onActivate?: () => void;
  isLoading?: boolean;
}

const ServiceSelectionCard: React.FC<ServiceSelectionCardProps> = ({ 
  service, 
  isActive,
  onActivate,
  isLoading = false
}) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };
  
  return (
    <Card className={`flex flex-col h-full transition-shadow duration-300 ${isActive ? 'border-primary shadow-md' : 'hover:shadow-md'}`}>
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
      <CardFooter>
        {isActive ? (
          <Button className="w-full" variant="outline" disabled>
            Active
          </Button>
        ) : (
          <Button 
            className="w-full" 
            onClick={onActivate}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Activating...
              </>
            ) : (
              'Activate Service'
            )}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default ServiceSelectionCard;
