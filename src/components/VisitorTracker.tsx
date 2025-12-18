import { useVisitorTracking } from '@/hooks/useVisitorTracking';

/**
 * Component that tracks visitor activity on every route change.
 * Add this inside BrowserRouter to track all page visits.
 */
export function VisitorTracker() {
  // Track visits without org context (app-wide tracking)
  useVisitorTracking(null);
  
  return null;
}
