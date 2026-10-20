import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/state/auth';
import { identify, reset as resetAnalytics } from '@/lib/analytics';

export function useSession(): void {
  const setSession = useAuthStore((s) => s.setSession);
  const reset = useAuthStore((s) => s.reset);

  useEffect(() => {
    let cancelled = false;

    supabase.auth.getSession().then(({ data }) => {
      if (cancelled) return;
      setSession(data.session);
      if (data.session?.user) {
        identify(data.session.user.id);
      }
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user) {
        identify(session.user.id);
        console.log('JWT:', session.access_token);   
      } else {
        resetAnalytics();
      }
    });

    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, [setSession, reset]);
}