import React, { createContext, useContext, useEffect, useState } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { UserProfile, Genotype, UserRole } from '../types/database';

export interface SignUpResult {
  error: Error | null;
  needsEmailConfirmation?: boolean;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  loading: boolean;
  isConfigured: boolean;
  signUp: (email: string, password: string, name: string, genotype: Genotype, role?: UserRole) => Promise<SignUpResult>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<{ error: Error | null }>;
  refreshProfile: () => Promise<void>;
  switchRole: (role: UserRole) => Promise<void>;
  resendConfirmationEmail: (email: string) => Promise<{ error: Error | null }>;
  verifyOtp: (email: string, token: string) => Promise<{ error: Error | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Clear any residual mock demo data from previous sessions
  useEffect(() => {
    localStorage.removeItem('sc_demo_profile');
    localStorage.removeItem('sc_quiz_scores');
  }, []);

  // Fetch public.users profile from Supabase
  const fetchProfile = async (userId: string, currentUser?: User | null) => {
    if (!isSupabaseConfigured) {
      return;
    }
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (!error && data) {
        setProfile({
          ...(data as UserProfile),
          role: (data.role || 'user') as UserRole
        });
      } else if (currentUser) {
        // Hydrate from user_metadata if public.users record is pending
        const meta = currentUser.user_metadata || {};
        const synchedProfile: UserProfile = {
          id: currentUser.id,
          email: currentUser.email || '',
          name: meta.name || currentUser.email?.split('@')[0] || 'User',
          genotype: (meta.genotype || 'Unknown') as Genotype,
          role: (meta.role || 'user') as UserRole,
          created_at: currentUser.created_at,
          updated_at: new Date().toISOString()
        };
        await supabase.from('users').upsert(synchedProfile);
        setProfile(synchedProfile);
      }
    } catch (err) {
      console.error('Error fetching profile from public.users:', err);
    }
  };

  useEffect(() => {
    // Supabase Auth listener
    const initAuth = async () => {
      try {
        // Exchange PKCE auth code if returning from email confirmation link
        if (typeof window !== 'undefined' && window.location.search.includes('code=')) {
          const params = new URLSearchParams(window.location.search);
          const code = params.get('code');
          if (code) {
            try {
              await supabase.auth.exchangeCodeForSession(code);
              window.history.replaceState({}, '', window.location.pathname);
            } catch (exchangeErr) {
              console.warn('PKCE code exchange error (may already be exchanged):', exchangeErr);
            }
          }
        }

        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          await fetchProfile(session.user.id, session.user);
        } else {
          setProfile(null);
        }
      } catch (err) {
        console.error('Auth check error:', err);
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        await fetchProfile(session.user.id, session.user);
      } else {
        setProfile(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (
    email: string,
    password: string,
    name: string,
    genotype: Genotype,
    role: UserRole = 'user'
  ): Promise<SignUpResult> => {
    if (!isSupabaseConfigured) {
      return { error: new Error('Supabase is not configured. Please check your .env file.') };
    }

    const cleanEmail = email.trim().toLowerCase();

    try {
      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: {
          data: {
            name: name.trim(),
            genotype,
            role
          },
          emailRedirectTo: typeof window !== 'undefined' ? `${window.location.origin}/` : undefined
        }
      });

      if (error) return { error };

      // In Supabase, if user already exists, it returns data.user with empty identities
      if (data.user && data.user.identities && data.user.identities.length === 0) {
        return {
          error: new Error('An account with this email already exists. Please sign in instead.'),
          needsEmailConfirmation: false
        };
      }

      // If email confirmation is enabled in Supabase, data.session is null
      const needsEmailConfirmation = !data.session;

      if (data.user && data.session) {
        // Direct session created (email confirmation is disabled in Supabase settings)
        const { error: upsertError } = await supabase
          .from('users')
          .upsert({
            id: data.user.id,
            email: cleanEmail,
            name: name.trim(),
            genotype,
            role,
            updated_at: new Date().toISOString()
          });

        if (upsertError) console.warn('Note on user profile upsert:', upsertError.message);
        await fetchProfile(data.user.id, data.user);
      }

      return { error: null, needsEmailConfirmation };
    } catch (err) {
      return { error: err as Error };
    }
  };

  const resendConfirmationEmail = async (email: string) => {
    if (!isSupabaseConfigured) {
      return { error: new Error('Supabase is not configured.') };
    }
    const cleanEmail = email.trim().toLowerCase();
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: cleanEmail,
        options: {
          emailRedirectTo: typeof window !== 'undefined' ? `${window.location.origin}/` : undefined
        }
      });
      return { error };
    } catch (err) {
      return { error: err as Error };
    }
  };

  const verifyOtp = async (email: string, token: string) => {
    if (!isSupabaseConfigured) {
      return { error: new Error('Supabase is not configured.') };
    }
    const cleanEmail = email.trim().toLowerCase();
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email: cleanEmail,
        token: token.trim(),
        type: 'signup'
      });
      if (error) {
        // Fallback to 'email' type if 'signup' fails
        const fallback = await supabase.auth.verifyOtp({
          email: cleanEmail,
          token: token.trim(),
          type: 'email'
        });
        if (fallback.error) return { error: fallback.error };
        if (fallback.data.user) {
          await fetchProfile(fallback.data.user.id, fallback.data.user);
        }
        return { error: null };
      }
      if (data.user) {
        await fetchProfile(data.user.id, data.user);
      }
      return { error: null };
    } catch (err) {
      return { error: err as Error };
    }
  };

  const signIn = async (email: string, password: string) => {
    if (!isSupabaseConfigured) {
      return { error: new Error('Supabase is not configured. Please check your .env file.') };
    }

    const cleanEmail = email.trim().toLowerCase();

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password
      });
      return { error };
    } catch (err) {
      return { error: err as Error };
    }
  };

  const signOut = async () => {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
    setUser(null);
    setSession(null);
    setProfile(null);
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!profile) return { error: new Error('No user profile found') };

    if (!isSupabaseConfigured) {
      return { error: new Error('Supabase is not configured.') };
    }

    try {
      const { data, error } = await supabase
        .from('users')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', profile.id)
        .select()
        .single();

      if (error) return { error };
      if (data) setProfile({ ...(data as UserProfile), role: (data.role || 'user') as UserRole });
      return { error: null };
    } catch (err) {
      return { error: err as Error };
    }
  };

  const switchRole = async (newRole: UserRole) => {
    if (!profile) return;
    await updateProfile({ role: newRole });
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        loading,
        isConfigured: isSupabaseConfigured,
        signUp,
        signIn,
        signOut,
        updateProfile,
        refreshProfile,
        switchRole,
        resendConfirmationEmail,
        verifyOtp
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
