/**
 * Client-side activity tracker — fire-and-forget inserts into user_activity.
 */

import { supabase } from "@/integrations/supabase/client";

const ANON_SESSION_KEY = "efa_anon_session_id";

function getAnonSessionId(): string {
  let id = sessionStorage.getItem(ANON_SESSION_KEY);
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem(ANON_SESSION_KEY, id);
  }
  return id;
}

export type ActivityEvent =
  | "page_view"
  | "mode_selected"
  | "faq_opened"
  | "common_question_clicked"
  | "download_clicked"
  | "pricing_opened"
  | "purchase_clicked";

export function trackActivity(
  eventName: ActivityEvent,
  opts?: {
    section?: "planning" | "after_death" | "emotional" | string;
    metadata?: Record<string, unknown>;
  }
): void {
  (async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      await supabase.from("user_activity" as any).insert({
        user_id: user?.id || null,
        anonymous_session_id: getAnonSessionId(),
        event_name: eventName,
        page_url: window.location.pathname,
        section: opts?.section || null,
        metadata: opts?.metadata || {},
      });
    } catch {
      // fire-and-forget
    }
  })();
}
