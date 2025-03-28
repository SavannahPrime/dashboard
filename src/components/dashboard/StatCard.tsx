
import React from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { ArrowDown, ArrowUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  change?: {
    value: number;
    isPositive: boolean;
  };
  subtitle?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  highlighted?: boolean;
  color?: 'default' | 'blue' | 'green' | 'amber' | 'red' | 'purple';
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  change,
  subtitle,
  description,
  actionLabel,
  onAction,
  highlighted = false,
  color = 'default'
}) => {
  // Generate color classes based on the color prop
  const getColorClasses = () => {
    switch (color) {
      case 'blue':
        return {
          bg: 'bg-blue-50 dark:bg-blue-900/20',
          iconBg: 'bg-blue-100 dark:bg-blue-800',
          button: 'text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-800/50'
        };
      case 'green':
        return {
          bg: 'bg-green-50 dark:bg-green-900/20',
          iconBg: 'bg-green-100 dark:bg-green-800',
          button: 'text-green-700 dark:text-green-300 hover:bg-green-100 dark:hover:bg-green-800/50'
        };
      case 'amber':
        return {
          bg: 'bg-amber-50 dark:bg-amber-900/20',
          iconBg: 'bg-amber-100 dark:bg-amber-800',
          button: 'text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-800/50'
        };
      case 'red':
        return {
          bg: 'bg-red-50 dark:bg-red-900/20',
          iconBg: 'bg-red-100 dark:bg-red-800',
          button: 'text-red-700 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-800/50'
        };
      case 'purple':
        return {
          bg: 'bg-purple-50 dark:bg-purple-900/20',
          iconBg: 'bg-purple-100 dark:bg-purple-800',
          button: 'text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-800/50'
        };
      default:
        return {
          bg: '',
          iconBg: 'bg-primary/10',
          button: 'text-primary hover:bg-primary/10'
        };
    }
  };
  
  const colorClasses = getColorClasses();
  
  return (
    <Card className={`${highlighted ? 'border-primary shadow-md' : ''} ${colorClasses.bg}`}>
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
            
            {subtitle && (
              <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
            )}
            
            {description && (
              <p className="text-sm mt-2 line-clamp-2">{description}</p>
            )}
          </div>
          
          <div className={`p-2 rounded-md ${colorClasses.iconBg}`}>
            {icon}
          </div>
        </div>
      </CardContent>
      
      {actionLabel && onAction && (
        <CardFooter className="pt-0 px-6 pb-4">
          <Button 
            variant="ghost" 
            className={`px-0 w-full justify-start ${colorClasses.button}`}
            onClick={onAction}
          >
            {actionLabel}
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};

export default StatCard;
