
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowUpRight, Check } from 'lucide-react';
import { ServiceOption } from '@/lib/services-data';

interface ServiceCardProps {
  service: ServiceOption;
  isActive?: boolean;
}

const ServiceCard: React.FC<ServiceCardProps> = ({ service, isActive = true }) => {
  return (
    <Card className={`premium-card h-full flex flex-col ${isActive ? '' : 'opacity-75'}`}>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl">{service.title}</CardTitle>
            <CardDescription className="mt-1">{service.description}</CardDescription>
          </div>
          {isActive && (
            <Badge className="bg-green-500" variant="secondary">
              Active
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex-1">
        <div className="grid gap-2">
          {service.features.slice(0, 3).map((feature, index) => (
            <div key={index} className="flex items-start">
              <div className="mr-2 mt-1 bg-primary/10 rounded-full p-0.5">
                <Check className="h-3.5 w-3.5 text-primary" />
              </div>
              <span className="text-sm">{feature}</span>
            </div>
          ))}
        </div>
        
        <div className="mt-6 flex justify-between items-baseline">
          <div>
            <span className="text-2xl font-bold">${service.price}</span>
            <span className="text-muted-foreground">/{service.priceUnit}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button className="w-full group" variant="outline">
          Manage Service
          <ArrowUpRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ServiceCard;
