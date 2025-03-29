
import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CircleUserRound } from 'lucide-react';
import sessionManager, { UserRole } from '@/lib/sessionManager';
import { useAuth } from '@/contexts/AuthContext';
import { useAdminAuth } from '@/contexts/AdminAuthContext';

const SessionSwitcherIndicator: React.FC = () => {
  const { currentUser } = useAuth();
  const { currentAdmin } = useAdminAuth();
  const [activeRoles, setActiveRoles] = React.useState<UserRole[]>([]);

  // Update active roles when component mounts
  React.useEffect(() => {
    const roles = sessionManager.getActiveRoles();
    setActiveRoles(roles);
    
    // Check periodically for session changes
    const intervalId = setInterval(() => {
      const updatedRoles = sessionManager.getActiveRoles();
      setActiveRoles(updatedRoles);
    }, 5000);
    
    return () => clearInterval(intervalId);
  }, [currentUser, currentAdmin]);

  // Get current active session
  const getCurrentActiveSession = (): UserRole | null => {
    if (currentAdmin) {
      if (currentAdmin.role === 'super_admin') return 'admin';
      if (currentAdmin.role === 'sales') return 'sales';
      if (currentAdmin.role === 'support') return 'support';
    }
    if (currentUser) return 'client';
    return null;
  };

  // If no sessions, don't render
  if (activeRoles.length === 0) return null;
  
  // Don't show counter if there's only one role active
  if (activeRoles.length === 1) return null;

  return (
    <Badge 
      variant="outline" 
      className="bg-secondary text-secondary-foreground rounded-full px-2 py-1"
    >
      <CircleUserRound className="h-3 w-3 mr-1" />
      {activeRoles.length}
    </Badge>
  );
};

export default SessionSwitcherIndicator;
