/**
 * Lightweight activity tracker that logs events to activity_events.
 * Works for both authenticated and anonymous visitors.
 * SKIPS all tracking for admin/staff/owner roles.
 */

import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

// ── Visitor / session identity ──────────────────────────────────────────────

const VISITOR_KEY = "efa_visitor_id";
const SESSION_KEY = "efa_session_id";
const ADMIN_ROLES = ["admin", "staff", "owner"];

function getVisitorId(): string {
  let id = localStorage.getItem(VISITOR_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(VISITOR_KEY, id);
  }
  return id;
}

function getSessionId(): string {
  let id = sessionStorage.getItem(SESSION_KEY);
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

// ── Admin check cache ───────────────────────────────────────────────────────

let cachedAdminCheck: { userId: string; isAdmin: boolean } | null = null;

async function isUserAdmin(userId: string): Promise<boolean> {
  if (cachedAdminCheck && cachedAdminCheck.userId === userId) return cachedAdminCheck.isAdmin;
  try {
    for (const role of ADMIN_ROLES) {
      const { data } = await supabase.rpc("has_app_role", { _user_id: userId, _role: role });
      if (data === true) {
        cachedAdminCheck = { userId, isAdmin: true };
        return true;
      }
    }
  } catch { /* ignore */ }
  cachedAdminCheck = { userId, isAdmin: false };
  return false;
}

// ── Section resolver ────────────────────────────────────────────────────────

function resolveSection(path: string): string | null {
  if (path.startsWith("/preplandashboard") || path.startsWith("/plan-ahead") || path.startsWith("/preplan")) return "planning";
  if (path.startsWith("/after-death") || path.startsWith("/next-steps")) return "after_death";
  if (path.startsWith("/care-support") || path.startsWith("/claire")) return "emotional";
  if (path.startsWith("/admin")) return "admin";
  if (path.startsWith("/pricing") || path.startsWith("/billing")) return "billing";
  return null;
}

// ── Public API ──────────────────────────────────────────────────────────────

export type EventType =
  | "page_view"
  | "click"
  | "mode_select"
  | "download"
  | "checkout_start"
  | "checkout_success"
  | "checkout_fail"
  | "chat_message";

export interface TrackEventOpts {
  eventType: EventType;
  pagePath?: string;
  section?: string;
  label?: string;
  value?: Record<string, unknown>;
}

/** Fire-and-forget event insert */
export function trackEvent(opts: TrackEventOpts): void {
  const visitorId = getVisitorId();
  const sessionId = getSessionId();
  const pagePath = opts.pagePath ?? window.location.pathname;

  (async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      // Skip tracking for admin/staff/owner users
      if (user && await isUserAdmin(user.id)) return;

      await supabase.from("activity_events" as any).insert({
        user_id: user?.id ?? null,
        visitor_id: visitorId,
        session_id: sessionId,
        event_type: opts.eventType,
        page_path: pagePath,
        section: opts.section ?? resolveSection(pagePath),
        label: opts.label ?? null,
        value: opts.value ?? {},
        referrer: document.referrer || null,
        user_agent: navigator.userAgent || null,
      });
    } catch {
      // fire-and-forget
    }
  })();
}

// ── Route-change hook (mount once in App) ───────────────────────────────────

export function useRouteTracker() {
  const location = useLocation();
  const prev = useRef<string | null>(null);

  useEffect(() => {
    // Skip duplicate fires for the same path
    if (location.pathname === prev.current) return;
    prev.current = location.pathname;

    trackEvent({ eventType: "page_view" });
  }, [location.pathname]);
}
