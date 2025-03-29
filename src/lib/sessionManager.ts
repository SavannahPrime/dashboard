import { User } from '@supabase/supabase-js';

type StoredSession = {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  expiresAt: number | null;
};

export type UserRole = 'client' | 'admin' | 'sales' | 'support';

/**
 * Manages different sessions for different user roles
 */
class SessionManager {
  // Store sessions for different user roles
  private sessions: Map<UserRole, StoredSession>;

  constructor() {
    this.sessions = new Map();
  }

  /**
   * Store session for a specific role
   */
  storeSession(role: UserRole, user: User | null, accessToken: string | null, refreshToken: string | null, expiresIn?: number): void {
    const expiresAt = expiresIn ? Date.now() + expiresIn * 1000 : null;
    
    this.sessions.set(role, {
      user,
      accessToken,
      refreshToken,
      expiresAt
    });
    
    // Store in localStorage for persistence
    try {
      localStorage.setItem(`savannah_prime_${role}`, JSON.stringify({
        user,
        accessToken,
        refreshToken,
        expiresAt
      }));
    } catch (error) {
      console.error(`Failed to store ${role} session in localStorage:`, error);
    }
  }

  /**
   * Get session for a specific role
   */
  getSession(role: UserRole): StoredSession | undefined {
    // If session is in memory, return it
    if (this.sessions.has(role)) {
      return this.sessions.get(role);
    }
    
    // Otherwise try to get from localStorage
    try {
      const storedSession = localStorage.getItem(`savannah_prime_${role}`);
      if (storedSession) {
        const parsedSession = JSON.parse(storedSession) as StoredSession;
        this.sessions.set(role, parsedSession);
        return parsedSession;
      }
    } catch (error) {
      console.error(`Failed to get ${role} session from localStorage:`, error);
    }
    
    return undefined;
  }

  /**
   * Clear session for a specific role
   */
  clearSession(role: UserRole): void {
    this.sessions.delete(role);
    localStorage.removeItem(`savannah_prime_${role}`);
  }

  /**
   * Check if a session exists for a role and is valid
   */
  hasValidSession(role: UserRole): boolean {
    const session = this.getSession(role);
    if (!session || !session.user || !session.accessToken) return false;
    
    // Check if session has expired
    if (session.expiresAt && session.expiresAt < Date.now()) {
      this.clearSession(role);
      return false;
    }
    
    return true;
  }

  /**
   * Get all active roles
   */
  getActiveRoles(): UserRole[] {
    return ['client', 'admin', 'sales', 'support'].filter(role => 
      this.hasValidSession(role as UserRole)
    ) as UserRole[];
  }
}

// Create a singleton instance
export const sessionManager = new SessionManager();

export default sessionManager;
