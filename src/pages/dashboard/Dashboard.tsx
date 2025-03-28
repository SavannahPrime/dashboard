
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Calendar, BarChart3, CreditCard, AlertCircle, Users, Bell, Clock, CheckCircle, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import StatCard from '@/components/dashboard/StatCard';
import CommunicationCenter from '@/components/dashboard/CommunicationCenter';
import SubscriptionStatusCard from '@/components/dashboard/SubscriptionStatusCard';

const Dashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    activeServices: 0,
    totalSpent: 0,
    nextPayment: null as null | string,
    unreadMessages: 0
  });
  const [announcements, setAnnouncements] = useState<any[]>([]);
  
  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!currentUser?.id) return;
      
      setIsLoading(true);
      try {
        // Fetch client data including selected services
        const { data: clientData, error: clientError } = await supabase
          .from('clients')
          .select('selected_services, subscription_status, subscription_expiry')
          .eq('id', currentUser.id)
          .single();
        
        if (clientError) throw clientError;
        
        // Fetch transactions
        const { data: transactions, error: transactionsError } = await supabase
          .from('transactions')
          .select('amount')
          .eq('client_id', currentUser.id)
          .eq('status', 'completed');
        
        if (transactionsError) throw transactionsError;
        
        // Fetch unread communications
        const { data: communications, error: communicationsError } = await supabase
          .from('communications')
          .select('id')
          .eq('client_id', currentUser.id)
          .eq('unread', true);
        
        if (communicationsError) throw communicationsError;
        
        // Fetch public announcements
        const { data: announcementsData, error: announcementsError } = await supabase
          .from('announcements')
          .select('*')
          .eq('status', 'published')
          .eq('audience', 'all')
          .order('date', { ascending: false })
          .limit(5);
        
        if (announcementsError) throw announcementsError;
        
        // Update stats
        setStats({
          activeServices: (clientData?.selected_services || []).length,
          totalSpent: transactions ? transactions.reduce((sum, t) => sum + Number(t.amount), 0) : 0,
          nextPayment: clientData?.subscription_expiry || null,
          unreadMessages: communications ? communications.length : 0
        });
        
        setAnnouncements(announcementsData || []);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        toast.error('Failed to load dashboard data');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDashboardData();
  }, [currentUser?.id]);
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {currentUser?.name || 'Client'}
        </p>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard 
          title="Active Services" 
          value={stats.activeServices.toString()}
          description={stats.activeServices === 0 ? "No active services" : "Services in your account"}
          icon={<Users className="h-4 w-4 text-muted-foreground" />}
          actionLabel={stats.activeServices === 0 ? "Browse Services" : "Manage Services"}
          onAction={() => navigate('/dashboard/services')}
        />
        
        <StatCard 
          title="Total Spent" 
          value={`$${stats.totalSpent.toFixed(2)}`}
          description="Total amount spent to date"
          icon={<CreditCard className="h-4 w-4 text-muted-foreground" />}
          actionLabel="View Billing History"
          onAction={() => navigate('/dashboard/billing')}
        />
        
        <StatCard 
          title="Next Payment" 
          value={stats.nextPayment ? new Date(stats.nextPayment).toLocaleDateString() : 'N/A'}
          description={stats.nextPayment ? "Upcoming payment date" : "No scheduled payments"}
          icon={<Calendar className="h-4 w-4 text-muted-foreground" />}
          actionLabel="Manage Payments"
          onAction={() => navigate('/dashboard/billing')}
        />
        
        <StatCard 
          title="Messages" 
          value={stats.unreadMessages.toString()} 
          description={stats.unreadMessages === 1 ? "Unread message" : "Unread messages"}
          icon={<Bell className="h-4 w-4 text-muted-foreground" />}
          actionLabel="View Messages"
          onAction={() => navigate('/dashboard/support')}
          highlighted={stats.unreadMessages > 0}
        />
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        <SubscriptionStatusCard />
        
        <CommunicationCenter />
      </div>
      
      <Tabs defaultValue="announcements">
        <TabsList>
          <TabsTrigger value="announcements">Announcements</TabsTrigger>
          <TabsTrigger value="activity">Recent Activity</TabsTrigger>
        </TabsList>
        
        <TabsContent value="announcements" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Latest Announcements</CardTitle>
              <CardDescription>
                Important updates and news
              </CardDescription>
            </CardHeader>
            <CardContent>
              {announcements.length > 0 ? (
                <div className="space-y-4">
                  {announcements.map(announcement => (
                    <div key={announcement.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <h3 className="font-semibold">{announcement.title}</h3>
                        <Badge variant="secondary">
                          {new Date(announcement.date).toLocaleDateString()}
                        </Badge>
                      </div>
                      <p className="mt-2 text-muted-foreground">{announcement.content}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <Bell className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                  <h3 className="text-lg font-medium">No announcements</h3>
                  <p className="text-muted-foreground">
                    There are no recent announcements to display
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="activity">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>
                Your recent account activity
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-6">
                <Clock className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                <h3 className="text-lg font-medium">Activity tracking coming soon</h3>
                <p className="text-muted-foreground">
                  We're working on tracking your account activity
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;
