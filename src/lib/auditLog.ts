import { supabase } from "@/integrations/supabase/client";

export type AuditEventType = 
  | 'section_updated'
  | 'section_completed'
  | 'section_uncompleted'
  | 'section_reset'
  | 'section_archived';

interface LogAuditEventParams {
  userId: string;
  eventType: AuditEventType;
  sectionId: string;
  changedFieldsCount?: number;
  archiveId?: string;
  note?: string;
  plannerMode?: string;
}

export const logAuditEvent = async ({
  userId,
  eventType,
  sectionId,
  changedFieldsCount,
  archiveId,
  note,
  plannerMode
}: LogAuditEventParams): Promise<void> => {
  try {
    await supabase.from("audit_log").insert({
      user_id: userId,
      event_type: eventType,
      section_id: sectionId,
      changed_fields_count: changedFieldsCount,
      archive_id: archiveId,
      note: note,
      planner_mode: plannerMode
    });
  } catch (error) {
    console.error("Error logging audit event:", error);
  }
};

export interface AuditLogEntry {
  id: string;
  event_type: AuditEventType;
  section_id: string;
  changed_fields_count: number | null;
  archive_id: string | null;
  note: string | null;
  created_at: string;
}

export const fetchSectionAuditLog = async (
  userId: string,
  sectionId: string,
  limit: number = 10
): Promise<AuditLogEntry[]> => {
  try {
    const { data, error } = await supabase
      .from("audit_log")
      .select("*")
      .eq("user_id", userId)
      .eq("section_id", sectionId)
      .order("created_at", { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return (data || []) as AuditLogEntry[];
  } catch (error) {
    console.error("Error fetching audit log:", error);
    return [];
  }
};

export const getLastUpdatedAt = async (
  userId: string,
  sectionId: string
): Promise<string | null> => {
  try {
    const { data, error } = await supabase
      .from("audit_log")
      .select("created_at")
      .eq("user_id", userId)
      .eq("section_id", sectionId)
      .eq("event_type", "section_updated")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    
    if (error) throw error;
    return data?.created_at || null;
  } catch (error) {
    console.error("Error fetching last updated:", error);
    return null;
  }
};

export const getLastCompletedAt = async (
  userId: string,
  sectionId: string
): Promise<string | null> => {
  try {
    const { data, error } = await supabase
      .from("audit_log")
      .select("created_at")
      .eq("user_id", userId)
      .eq("section_id", sectionId)
      .eq("event_type", "section_completed")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    
    if (error) throw error;
    return data?.created_at || null;
  } catch (error) {
    console.error("Error fetching last completed:", error);
    return null;
  }
};

export const formatAuditEventLabel = (eventType: AuditEventType): string => {
  switch (eventType) {
    case 'section_updated': return 'Updated section';
    case 'section_completed': return 'Marked complete';
    case 'section_uncompleted': return 'Unmarked complete';
    case 'section_reset': return 'Reset section';
    case 'section_archived': return 'Archived version';
    default: return 'Unknown event';
  }
};
