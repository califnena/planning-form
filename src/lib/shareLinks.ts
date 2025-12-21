import { supabase } from "@/integrations/supabase/client";

export interface ShareLink {
  id: string;
  user_id: string;
  label: string;
  token: string;
  is_enabled: boolean;
  share_archives: boolean;
  permissions_scope: string;
  last_accessed_at: string | null;
  total_views: number;
  created_at: string;
  updated_at: string;
}

export interface ShareLinkAccessLog {
  id: string;
  share_link_id: string;
  accessed_at: string;
  device_type: 'mobile' | 'desktop' | 'unknown';
  ip_hash: string | null;
  country: string | null;
}

export const COMMON_LABELS = [
  "Mom",
  "Dad", 
  "Spouse",
  "Child",
  "Executor",
  "Attorney",
  "Pastor"
];

export const fetchShareLinks = async (userId: string): Promise<ShareLink[]> => {
  const { data, error } = await supabase
    .from("share_links")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  
  if (error) throw error;
  return (data || []) as ShareLink[];
};

export const createShareLink = async (
  userId: string, 
  label: string,
  shareArchives: boolean = false
): Promise<ShareLink> => {
  const { data, error } = await supabase
    .from("share_links")
    .insert({
      user_id: userId,
      label,
      share_archives: shareArchives
    })
    .select()
    .single();
  
  if (error) throw error;
  return data as ShareLink;
};

export const updateShareLink = async (
  linkId: string,
  updates: Partial<Pick<ShareLink, 'label' | 'is_enabled' | 'share_archives'>>
): Promise<void> => {
  const { error } = await supabase
    .from("share_links")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", linkId);
  
  if (error) throw error;
};

export const regenerateShareLinkToken = async (linkId: string): Promise<string> => {
  // Generate new token on client side
  const newToken = crypto.randomUUID().replace(/-/g, '') + crypto.randomUUID().replace(/-/g, '');
  
  const { error } = await supabase
    .from("share_links")
    .update({ 
      token: newToken,
      updated_at: new Date().toISOString() 
    })
    .eq("id", linkId);
  
  if (error) throw error;
  return newToken;
};

export const deleteShareLink = async (linkId: string): Promise<void> => {
  const { error } = await supabase
    .from("share_links")
    .delete()
    .eq("id", linkId);
  
  if (error) throw error;
};

export const fetchAccessLog = async (
  shareLinkId: string,
  limit: number = 10
): Promise<ShareLinkAccessLog[]> => {
  const { data, error } = await supabase
    .from("share_link_access_log")
    .select("*")
    .eq("share_link_id", shareLinkId)
    .order("accessed_at", { ascending: false })
    .limit(limit);
  
  if (error) throw error;
  return (data || []) as ShareLinkAccessLog[];
};

export const clearAccessLog = async (shareLinkId: string): Promise<void> => {
  const { error } = await supabase
    .from("share_link_access_log")
    .delete()
    .eq("share_link_id", shareLinkId);
  
  if (error) throw error;
  
  // Reset total views
  await supabase
    .from("share_links")
    .update({ total_views: 0, last_accessed_at: null })
    .eq("id", shareLinkId);
};

export const logShareLinkAccess = async (
  token: string,
  deviceType: 'mobile' | 'desktop' | 'unknown'
): Promise<ShareLink | null> => {
  // First get the share link by token
  const { data: link, error: linkError } = await supabase
    .from("share_links")
    .select("*")
    .eq("token", token)
    .eq("is_enabled", true)
    .maybeSingle();
  
  if (linkError || !link) return null;
  
  // Log the access
  await supabase
    .from("share_link_access_log")
    .insert({
      share_link_id: link.id,
      device_type: deviceType
    });
  
  // Update the share link stats
  await supabase
    .from("share_links")
    .update({
      last_accessed_at: new Date().toISOString(),
      total_views: (link.total_views || 0) + 1
    })
    .eq("id", link.id);
  
  return link as ShareLink;
};

export const getShareLinkUrl = (token: string): string => {
  return `${window.location.origin}/shared/${token}`;
};

// Message generator functions
export const generateTextMessage = (
  label: string,
  shareUrl: string,
  customNote?: string
): string => {
  let message = `Hi ${label}, I put together my planning details here. This link is read-only. You can view completed sections and download a summary.\n\n${shareUrl}`;
  
  if (customNote) {
    message += `\n\nNote: ${customNote}`;
  }
  
  return message;
};

export const generateEmailMessage = (
  label: string,
  shareUrl: string,
  ownerName?: string,
  customNote?: string
): { subject: string; body: string } => {
  let body = `Hi ${label},

I'm sharing my planning details with you here. This link is read-only. You can view completed sections and download a printable summary.

${shareUrl}`;

  if (customNote) {
    body += `\n\nNote: ${customNote}`;
  }

  body += `

If you have questions, please call or text me.

Thanks,
${ownerName || 'Me'}`;

  return {
    subject: "Planning link (read-only)",
    body
  };
};
