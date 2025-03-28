
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowDown, ArrowUp, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StatCardProps } from '@/lib/types';

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  description,
  icon,
  change,
  subtitle,
  actionLabel,
  onAction,
  highlighted = false,
}) => {
  return (
    <Card className={highlighted ? 'border-primary' : ''}>
      <CardContent className="pt-6">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <h3 className="text-2xl font-bold mt-1">{value}</h3>
            
            {change && (
              <div className="flex items-center mt-1">
                <div
                  className={`flex items-center ${
                    change.isPositive ? 'text-green-500' : 'text-red-500'
                  }`}
                >
                  {change.isPositive ? (
                    <ArrowUp className="h-4 w-4 mr-1" />
                  ) : (
                    <ArrowDown className="h-4 w-4 mr-1" />
                  )}
                  <span className="text-sm font-medium">{Math.abs(change.value)}%</span>
                </div>
                <span className="text-xs text-muted-foreground ml-1">vs last period</span>
              </div>
            )}
            
            <p className="text-xs text-muted-foreground mt-1">{description}</p>
            
            {subtitle && (
              <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
            )}
            
            {actionLabel && onAction && (
              <Button 
                variant="link" 
                className="px-0 h-auto text-xs mt-2" 
                onClick={onAction}
              >
                {actionLabel} <ChevronRight className="h-3 w-3 ml-1" />
              </Button>
            )}
          </div>
          
          <div className="p-2 rounded-md bg-primary/10">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StatCard;
