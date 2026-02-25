/**
 * First-party analytics tracker.
 *
 * - Persists visitor_id in localStorage, session_id in sessionStorage.
 * - Captures duration_ms on page_view by recording enter time and flushing on leave/route-change.
 * - Attaches user_id + user_email when authenticated.
 * - Fire-and-forget inserts into analytics_events.
 */

import { supabase } from "@/integrations/supabase/client";

// ── Identity ────────────────────────────────────────────────────────────────

const VID_KEY = "efa_a_visitor";
const SID_KEY = "efa_a_session";

function getVisitorId(): string {
  let id = localStorage.getItem(VID_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(VID_KEY, id);
  }
  return id;
}

function getSessionId(): string {
  let id = sessionStorage.getItem(SID_KEY);
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem(SID_KEY, id);
  }
  return id;
}

// ── Cached auth (avoid repeated getUser calls) ──────────────────────────────

let cachedUser: { id: string; email?: string } | null = null;
let userFetched = false;

async function getUser() {
  if (!userFetched) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      cachedUser = user ? { id: user.id, email: user.email ?? undefined } : null;
    } catch { /* ignore */ }
    userFetched = true;
  }
  return cachedUser;
}

// Refresh on auth state change
supabase.auth.onAuthStateChange((_event, session) => {
  cachedUser = session?.user
    ? { id: session.user.id, email: session.user.email ?? undefined }
    : null;
  userFetched = true;
});

// ── Core send ───────────────────────────────────────────────────────────────

export interface AnalyticsPayload {
  event_name: string;
  page_path?: string;
  mode?: string;
  label?: string;
  duration_ms?: number;
  metadata?: Record<string, unknown>;
}

export function sendAnalyticsEvent(payload: AnalyticsPayload): void {
  const visitorId = getVisitorId();
  const sessionId = getSessionId();
  const pagePath = payload.page_path ?? window.location.pathname;

  (async () => {
    try {
      const user = await getUser();
      await supabase.from("analytics_events" as any).insert({
        event_name: payload.event_name,
        page_path: pagePath,
        referrer: document.referrer || null,
        mode: payload.mode ?? null,
        label: payload.label ?? null,
        visitor_id: visitorId,
        session_id: sessionId,
        user_id: user?.id ?? null,
        user_email: user?.email ?? null,
        duration_ms: payload.duration_ms ?? null,
        metadata: payload.metadata ?? null,
      });
    } catch {
      // fire-and-forget
    }
  })();
}

// ── Duration-aware page view ────────────────────────────────────────────────

let pageEnterTime: number | null = null;
let currentPath: string | null = null;

/** Call on route enter */
export function markPageEnter(path: string): void {
  // Flush previous page first
  flushPageView();
  pageEnterTime = Date.now();
  currentPath = path;
}

/** Flush a page_view with duration for the current page */
export function flushPageView(): void {
  if (pageEnterTime && currentPath) {
    const duration = Date.now() - pageEnterTime;
    sendAnalyticsEvent({
      event_name: "page_view",
      page_path: currentPath,
      duration_ms: duration,
    });
  }
  pageEnterTime = null;
  currentPath = null;
}

// Flush on tab close / hide
if (typeof window !== "undefined") {
  window.addEventListener("beforeunload", flushPageView);
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") flushPageView();
  });
}

// ── Convenience helpers ─────────────────────────────────────────────────────

export function trackModeSelected(mode: string): void {
  sendAnalyticsEvent({ event_name: "mode_selected", mode, label: mode });
}

export function trackDownload(label: string): void {
  sendAnalyticsEvent({ event_name: "download_clicked", label });
}

export function trackCheckoutClicked(product: string): void {
  sendAnalyticsEvent({ event_name: "checkout_clicked", label: product });
}

export function trackFaqOpened(slug: string): void {
  sendAnalyticsEvent({ event_name: "faq_opened", label: slug });
}
