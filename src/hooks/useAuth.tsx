import React, { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import type { User } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  roles: string[];
  loading: boolean;
  signOut: () => Promise<void>;
  hasRole: (role: string) => boolean;
  isAdmin: boolean;
  isCajero: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [roles, setRoles] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUserRoles = async (userId: string) => {
    console.log('fetchUserRoles called for userId:', userId);
    // Temporary: hardcode admin for testing
    if (userId === 'd336435a-9cfe-4eaf-b6aa-cbb4301c6c95') {
      return ['admin'];
    }
    return [];
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setRoles([]);
  };

  const hasRole = (role: string) => roles.includes(role);
  const isAdmin = hasRole('admin');
  const isCajero = hasRole('cajero');

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          console.error('Error getting session:', error);
        }

        if (session?.user) {
          setUser(session.user);
          const userRoles = await fetchUserRoles(session.user.id);
          setRoles(userRoles);
        } else {
          setUser(null);
          setRoles([]);
        }
      } catch (err) {
        console.error('Error in getInitialSession:', err);
        setUser(null);
        setRoles([]);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        try {
          if (session?.user) {
            setUser(session.user);
            const userRoles = await fetchUserRoles(session.user.id);
            setRoles(userRoles);
          } else {
            setUser(null);
            setRoles([]);
          }
        } catch (err) {
          console.error('Error in auth state change:', err);
          setUser(null);
          setRoles([]);
        } finally {
          setLoading(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const value: AuthContextType = {
    user,
    roles,
    loading,
    signOut,
    hasRole,
    isAdmin,
    isCajero,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};