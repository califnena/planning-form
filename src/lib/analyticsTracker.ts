/**
 * First-party analytics tracker.
 *
 * - Persists visitor_id in localStorage, session_id in sessionStorage.
 * - Captures duration_ms on page_view by recording enter time and flushing on leave/route-change.
 * - Attaches user_id + user_email when authenticated.
 * - Fire-and-forget inserts into analytics_events.
 * - SKIPS all tracking for admin/staff/owner roles.
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

// ── Cached auth + admin check ───────────────────────────────────────────────

const ADMIN_ROLES = ["admin", "staff", "owner"];

let cachedUser: { id: string; email?: string } | null = null;
let cachedIsAdmin: boolean | null = null;
let userFetched = false;

async function getUser() {
  if (!userFetched) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      cachedUser = user ? { id: user.id, email: user.email ?? undefined } : null;
      if (user) {
        cachedIsAdmin = await checkIsAdminRole(user.id);
      } else {
        cachedIsAdmin = false;
      }
    } catch { /* ignore */ }
    userFetched = true;
  }
  return cachedUser;
}

async function checkIsAdminRole(userId: string): Promise<boolean> {
  try {
    // Check all admin-like roles
    for (const role of ADMIN_ROLES) {
      const { data } = await supabase.rpc("has_app_role", { _user_id: userId, _role: role });
      if (data === true) return true;
    }
  } catch { /* ignore */ }
  return false;
}

function isAdminUser(): boolean {
  return cachedIsAdmin === true;
}

// Refresh on auth state change
supabase.auth.onAuthStateChange((_event, session) => {
  if (session?.user) {
    cachedUser = { id: session.user.id, email: session.user.email ?? undefined };
    // Re-check admin status asynchronously
    checkIsAdminRole(session.user.id).then(result => { cachedIsAdmin = result; });
  } else {
    cachedUser = null;
    cachedIsAdmin = false;
  }
  userFetched = true;
});

// ── Geolocation (once per session) ──────────────────────────────────────────

const GEO_KEY = "efa_a_geo";

interface GeoData {
  country: string | null;
  region: string | null;
  city: string | null;
}

let geoData: GeoData | null = null;
let geoFetched = false;

async function getGeo(): Promise<GeoData> {
  if (geoFetched && geoData) return geoData;
  // Check session cache
  const cached = sessionStorage.getItem(GEO_KEY);
  if (cached) {
    geoData = JSON.parse(cached);
    geoFetched = true;
    return geoData!;
  }
  try {
    const res = await fetch("https://ipapi.co/json/", { signal: AbortSignal.timeout(3000) });
    if (res.ok) {
      const d = await res.json();
      geoData = { country: d.country_name || null, region: d.region || null, city: d.city || null };
    } else {
      geoData = { country: null, region: null, city: null };
    }
  } catch {
    geoData = { country: null, region: null, city: null };
  }
  sessionStorage.setItem(GEO_KEY, JSON.stringify(geoData));
  geoFetched = true;
  return geoData;
}

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

      // Skip tracking for admin/staff/owner users
      if (user && isAdminUser()) return;

      const geo = await getGeo();

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
        country: geo.country,
        region: geo.region,
        city: geo.city,
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
