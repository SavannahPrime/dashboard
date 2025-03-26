
import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface RecentSignup {
  id: string;
  name: string;
  email: string;
  service: string;
  date: string;
}

const RecentSignupsSection: React.FC = () => {
  const [recentSignups, setRecentSignups] = useState<RecentSignup[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchRecentSignups = async () => {
    try {
      const { data: clientsData, error: clientsError } = await supabase
        .from('clients')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);
      
      if (clientsError) throw clientsError;
      
      const formattedSignups = clientsData?.map(client => {
        const createdDate = new Date(client.created_at);
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - createdDate.getTime());
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        
        let timeAgo;
        if (diffDays === 0) {
          const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
          timeAgo = diffHours === 0 ? 'Just now' : `${diffHours} hours ago`;
        } else if (diffDays === 1) {
          timeAgo = 'Yesterday';
        } else {
          timeAgo = `${diffDays} days ago`;
        }
        
        return {
          id: client.id,
          name: client.name,
          email: client.email,
          service: client.selected_services ? client.selected_services[0] : 'No service selected',
          date: timeAgo
        };
      });
      
      setRecentSignups(formattedSignups || []);
    } catch (error) {
      console.error('Error fetching recent signups:', error);
      toast.error('Failed to load recent signups');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRecentSignups();
    
    // Set up realtime subscription for new signups
    const channel = supabase
      .channel('public:clients')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'clients' 
      }, () => {
        fetchRecentSignups();
        toast.info('New client just signed up!');
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Signups</CardTitle>
        <CardDescription>
          New clients that registered recently
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-auto max-h-[400px]">
          {isLoading ? (
            <div className="flex justify-center py-6">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : recentSignups.length > 0 ? (
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs text-muted-foreground">
                  <th className="pb-3 font-medium">Name</th>
                  <th className="pb-3 font-medium">Email</th>
                  <th className="pb-3 font-medium">Service</th>
                  <th className="pb-3 font-medium text-right">Date</th>
                </tr>
              </thead>
              <tbody>
                {recentSignups.map((user) => (
                  <tr key={user.id} className="border-t border-border hover:bg-muted/50">
                    <td className="py-3">{user.name}</td>
                    <td className="py-3">{user.email}</td>
                    <td className="py-3">{user.service}</td>
                    <td className="py-3 text-right text-muted-foreground text-sm">{user.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-6 text-muted-foreground">
              No recent signups found
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentSignupsSection;
