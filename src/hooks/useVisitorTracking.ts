import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

const VISITOR_ID_KEY = 'efa_visitor_id';

function getOrCreateVisitorId(): string {
  let visitorId = localStorage.getItem(VISITOR_ID_KEY);
  if (!visitorId) {
    visitorId = crypto.randomUUID();
    localStorage.setItem(VISITOR_ID_KEY, visitorId);
  }
  return visitorId;
}

export function useVisitorTracking(orgId?: string | null) {
  const location = useLocation();
  const lastTrackedPath = useRef<string | null>(null);

  useEffect(() => {
    // Don't track the same path twice in a row
    if (lastTrackedPath.current === location.pathname) {
      return;
    }
    lastTrackedPath.current = location.pathname;

    const trackVisit = async () => {
      try {
        const visitorId = getOrCreateVisitorId();
        const referrer = document.referrer || null;
        
        // Get auth token if logged in
        const { data: { session } } = await supabase.auth.getSession();
        
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
        };
        
        // Include auth header if user is logged in
        if (session?.access_token) {
          headers['Authorization'] = `Bearer ${session.access_token}`;
        }

        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/track-visit`,
          {
            method: 'POST',
            headers,
            body: JSON.stringify({
              visitorId,
              orgId: orgId || null,
              path: location.pathname,
              referrer,
            }),
          }
        );

        if (!response.ok) {
          console.warn('Visit tracking failed:', await response.text());
        }
      } catch (error) {
        // Never block page load for tracking errors
        console.warn('Visit tracking error (non-blocking):', error);
      }
    };

    // Small delay to not block initial render
    const timeoutId = setTimeout(trackVisit, 100);
    return () => clearTimeout(timeoutId);
  }, [location.pathname, orgId]);
}
