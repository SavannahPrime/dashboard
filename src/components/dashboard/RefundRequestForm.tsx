
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface RefundRequestFormProps {
  onSuccess?: () => void;
}

const RefundRequestForm: React.FC<RefundRequestFormProps> = ({ onSuccess }) => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userServices, setUserServices] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    serviceId: '',
    amount: '',
    reason: '',
  });

  // Fetch the user's services
  useEffect(() => {
    const fetchUserServices = async () => {
      try {
        if (!currentUser?.id) return;

        // First get the user's selected services
        const { data: clientData, error: clientError } = await supabase
          .from('clients')
          .select('selected_services')
          .eq('id', currentUser.id)
          .single();

        if (clientError) throw clientError;

        const selectedServiceIds = clientData?.selected_services || [];

        if (selectedServiceIds.length === 0) return;

        // Then fetch the actual service details
        const { data: servicesData, error: servicesError } = await supabase
          .from('services')
          .select('id, name, price')
          .in('id', selectedServiceIds);

        if (servicesError) throw servicesError;

        setUserServices(servicesData || []);
        
        // If there are services, set the first one as default
        if (servicesData && servicesData.length > 0) {
          setFormData(prev => ({
            ...prev,
            serviceId: servicesData[0].id,
            amount: servicesData[0].price.toString()
          }));
        }
      } catch (error) {
        console.error('Error fetching user services:', error);
        toast.error('Failed to load your services');
      }
    };

    fetchUserServices();
  }, [currentUser?.id]);

  const handleServiceChange = (serviceId: string) => {
    const selectedService = userServices.find(s => s.id === serviceId);
    if (selectedService) {
      setFormData({
        ...formData,
        serviceId,
        amount: selectedService.price.toString()
      });
    }
  };

  const handleSubmit = async () => {
    // Validate form
    if (!formData.serviceId || !formData.amount || !formData.reason) {
      toast.error('Please fill in all fields');
      return;
    }

    if (!currentUser?.id) {
      toast.error('You must be logged in to submit a refund request');
      return;
    }

    setIsSubmitting(true);
    try {
      // Create a new support ticket with refund information
      const selectedService = userServices.find(s => s.id === formData.serviceId);
      
      const { data, error } = await supabase
        .from('tickets')
        .insert({
          subject: `Refund Request for ${selectedService?.name || 'Service'}`,
          status: 'open',
          priority: 'high',
          client_id: currentUser.id,
          category: 'refund',
          refund_service: formData.serviceId,
          refund_amount: parseFloat(formData.amount)
        })
        .select()
        .single();

      if (error) throw error;

      // Add the first message
      const { error: messageError } = await supabase
        .from('ticket_messages')
        .insert({
          ticket_id: data.id,
          content: formData.reason,
          sender: 'client'
        });

      if (messageError) throw messageError;

      toast.success('Refund request submitted successfully');
      
      // Reset form
      setFormData({
        serviceId: '',
        amount: '',
        reason: ''
      });
      
      // Navigate to support page or call onSuccess
      if (onSuccess) {
        onSuccess();
      } else {
        navigate('/dashboard/support', { 
          state: { activeTab: 'tickets' } 
        });
      }
    } catch (error: any) {
      console.error('Error submitting refund request:', error);
      toast.error(error.message || 'Failed to submit refund request');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (userServices.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <AlertTriangle className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-xl font-medium mb-2">No Active Services</h3>
          <p className="text-muted-foreground text-center max-w-md mb-6">
            You don't have any active services to request a refund for.
          </p>
          <Button onClick={() => navigate('/dashboard/services')}>
            View Available Services
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Request a Refund</CardTitle>
        <CardDescription>
          Submit a refund request for one of your active services
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Important Information</AlertTitle>
          <AlertDescription>
            Refund requests are subject to review. Please provide detailed information about why you're requesting a refund.
          </AlertDescription>
        </Alert>

        <div className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="service">Service</Label>
            <Select 
              value={formData.serviceId} 
              onValueChange={handleServiceChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a service" />
              </SelectTrigger>
              <SelectContent>
                {userServices.map(service => (
                  <SelectItem key={service.id} value={service.id}>
                    {service.name} (${service.price})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="amount">Refund Amount ($)</Label>
            <Input 
              id="amount"
              type="number"
              value={formData.amount}
              onChange={(e) => setFormData({...formData, amount: e.target.value})}
              placeholder="0.00"
            />
            <p className="text-xs text-muted-foreground">
              The maximum refund amount is the amount you paid for the service.
            </p>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="reason">Reason for Refund</Label>
            <Textarea 
              id="reason"
              value={formData.reason}
              onChange={(e) => setFormData({...formData, reason: e.target.value})}
              placeholder="Please explain why you're requesting a refund..."
              className="min-h-[120px]"
            />
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={() => navigate(-1)}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Submitting...
            </>
          ) : (
            'Submit Refund Request'
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default RefundRequestForm;
