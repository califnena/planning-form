/**
 * Route-level hook: records page enter/leave with duration.
 * Mount once inside <BrowserRouter>.
 */

import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { markPageEnter, flushPageView } from "@/lib/analyticsTracker";

export function useAnalyticsPageTracker() {
  const { pathname } = useLocation();
  const prev = useRef<string | null>(null);

  useEffect(() => {
    if (pathname === prev.current) return;
    prev.current = pathname;
    markPageEnter(pathname);

    return () => {
      // on unmount (route change), flush is handled by markPageEnter's internal call
    };
  }, [pathname]);

  // Flush on component unmount (app close)
  useEffect(() => {
    return () => flushPageView();
  }, []);
}
