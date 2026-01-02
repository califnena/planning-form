/**
 * IDENTITY UTILITIES
 * 
 * Provides consistent identity resolution for storage keys.
 * Supports both authenticated users and guests.
 */

import { supabase } from "@/integrations/supabase/client";

const GUEST_ID_KEY = "guest_id";

/**
 * Get or create a guest ID for unauthenticated users
 */
export function getOrCreateGuestId(): string {
  let guestId = localStorage.getItem(GUEST_ID_KEY);
  if (!guestId) {
    guestId = crypto.randomUUID();
    localStorage.setItem(GUEST_ID_KEY, guestId);
  }
  return guestId;
}

/**
 * Get the current identity (user ID or guest ID)
 */
export async function getCurrentIdentity(): Promise<{ type: "user" | "guest"; id: string }> {
  const { data: { user } } = await supabase.auth.getUser();
  if (user?.id) {
    return { type: "user", id: user.id };
  }
  return { type: "guest", id: getOrCreateGuestId() };
}

/**
 * Get identity synchronously (for hooks that can't be async)
 * Falls back to guest if no cached user
 */
export function getIdentitySync(cachedUserId?: string | null): { type: "user" | "guest"; id: string } {
  if (cachedUserId) {
    return { type: "user", id: cachedUserId };
  }
  return { type: "guest", id: getOrCreateGuestId() };
}

/**
 * Build a standardized storage key
 * Format: section:<sectionId>:<identity>
 */
export function buildStorageKey(sectionId: string, identity: { type: string; id: string }): string {
  return `section:${sectionId}:${identity.type}:${identity.id}`;
}

/**
 * Old key formats to migrate from
 */
const OLD_KEY_PATTERNS: Record<string, (userId: string) => string[]> = {
  preplanning: (userId) => ["preplanning_checklist", `preplanning_${userId}`],
  preplanning_notes: (userId) => ["preplanning_notes", `preplanning_notes_${userId}`],
  healthcare: (userId) => [`healthcare_${userId}`, "healthcare_data"],
  travel: (userId) => [`travel_planning_${userId}`, "travel_planning_data"],
  advance_directive: (userId) => [`advance_directive_${userId}`, "advance_directive_data"],
  care_preferences: (userId) => [`care_preferences_${userId}`, "care_preferences_data"],
  personal: (userId) => [`aboutyou_data`, `personal_info_${userId}`, `plan_${userId}`],
  funeral: (userId) => [`funeral_wishes_${userId}`, `plan_${userId}`],
};

/**
 * Get data from storage, trying new key first, then migrating from old keys
 */
export function getStorageWithMigration(
  sectionId: string, 
  identity: { type: string; id: string }
): any | null {
  const newKey = buildStorageKey(sectionId, identity);
  
  // Try new key first
  const newData = localStorage.getItem(newKey);
  if (newData) {
    try {
      return JSON.parse(newData);
    } catch {
      return null;
    }
  }
  
  // Try old keys and migrate if found
  const oldKeyPatterns = OLD_KEY_PATTERNS[sectionId];
  if (oldKeyPatterns) {
    for (const oldKey of oldKeyPatterns(identity.id)) {
      const oldData = localStorage.getItem(oldKey);
      if (oldData) {
        try {
          const parsed = JSON.parse(oldData);
          // Migrate to new key
          localStorage.setItem(newKey, oldData);
          console.log(`[identityUtils] Migrated ${oldKey} -> ${newKey}`);
          return parsed;
        } catch {
          continue;
        }
      }
    }
  }
  
  return null;
}

/**
 * Save data to storage with standardized key
 */
export function saveToStorage(
  sectionId: string, 
  identity: { type: string; id: string },
  data: any
): void {
  const key = buildStorageKey(sectionId, identity);
  localStorage.setItem(key, JSON.stringify(data));
}

/**
 * Check if a section has any data in storage (new or old keys)
 */
export function hasSectionData(sectionId: string, identity: { type: string; id: string }): boolean {
  const data = getStorageWithMigration(sectionId, identity);
  if (!data) return false;
  
  // Check if data has any meaningful values
  if (typeof data === "object") {
    if (Array.isArray(data)) {
      return data.length > 0;
    }
    return Object.values(data).some(v => {
      if (v === null || v === undefined) return false;
      if (typeof v === "string") return v.trim().length > 0 && v.trim() !== "unsure";
      if (typeof v === "boolean") return v === true;
      if (Array.isArray(v)) return v.length > 0;
      if (typeof v === "object") return Object.keys(v).length > 0;
      return true;
    });
  }
  
  return true;
}
