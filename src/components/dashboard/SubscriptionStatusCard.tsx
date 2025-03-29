
import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, CreditCard } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const SubscriptionStatusCard: React.FC = () => {
  const { currentUser } = useAuth();
  
  if (!currentUser) return null;
  
  // Handle subscriptionExpiry safely with a fallback date
  const expiryDate = currentUser.subscriptionExpiry 
    ? new Date(currentUser.subscriptionExpiry) 
    : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // Default to 30 days from now if not set
    
  const today = new Date();
  const daysRemaining = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  
  const statusColors = {
    active: 'bg-green-500',
    expired: 'bg-red-500',
    pending: 'bg-yellow-500'
  };
  
  // Safely access subscriptionStatus
  const subscriptionStatus = currentUser.subscriptionStatus || 'active';
  
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl">Subscription Status</CardTitle>
          <Badge className={statusColors[subscriptionStatus] || 'bg-gray-500'}>
            {subscriptionStatus.charAt(0).toUpperCase() + subscriptionStatus.slice(1)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center">
          <Calendar className="h-5 w-5 mr-2 text-muted-foreground" />
          <div>
            <p className="text-sm font-medium">
              {subscriptionStatus === 'active'
                ? `${daysRemaining} days remaining`
                : 'Subscription expired'}
            </p>
            <p className="text-xs text-muted-foreground">
              Expires on {expiryDate.toLocaleDateString()}
            </p>
          </div>
        </div>
        
        <div className="flex items-center">
          <CreditCard className="h-5 w-5 mr-2 text-muted-foreground" />
          <div>
            <p className="text-sm font-medium">Next payment</p>
            <p className="text-xs text-muted-foreground">
              {subscriptionStatus === 'active'
                ? expiryDate.toLocaleDateString()
                : 'No upcoming payment'}
            </p>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <div className="flex space-x-2 w-full">
          <Button variant="outline" className="flex-1">Contact Support</Button>
          <Button className="flex-1">
            {subscriptionStatus === 'active' ? 'Manage Plan' : 'Renew Subscription'}
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default SubscriptionStatusCard;
