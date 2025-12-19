import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type AppRole = Database["public"]["Enums"]["app_role"];

export interface TrustedPermissions {
  canViewAfterDeathPlanner: boolean;
  canViewAfterDeathChecklist: boolean;
  canViewInstructions: boolean;
  canViewSharedDocuments: boolean;
}

export interface UserRoleInfo {
  role: AppRole | null;
  isOwner: boolean;
  isTrustedContact: boolean;
  isAdmin: boolean;
  isCoach: boolean;
  isVip: boolean;
  isLoggedIn: boolean;
  orgId: string | null;
  permissions: TrustedPermissions;
  isLoading: boolean;
}

const DEFAULT_PERMISSIONS: TrustedPermissions = {
  canViewAfterDeathPlanner: false,
  canViewAfterDeathChecklist: false,
  canViewInstructions: false,
  canViewSharedDocuments: false,
};

export const useUserRole = (): UserRoleInfo => {
  const [role, setRole] = useState<AppRole | null>(null);
  const [orgId, setOrgId] = useState<string | null>(null);
  const [permissions, setPermissions] = useState<TrustedPermissions>(DEFAULT_PERMISSIONS);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchUserRole = async () => {
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError || !user) {
          if (isMounted) {
            setIsLoggedIn(false);
            setRole(null);
            setOrgId(null);
            setPermissions(DEFAULT_PERMISSIONS);
            setIsLoading(false);
          }
          return;
        }

        if (isMounted) {
          setIsLoggedIn(true);
        }

        // Get user's org membership
        const { data: orgMember, error: orgError } = await supabase
          .from('org_members')
          .select('org_id, role')
          .eq('user_id', user.id)
          .maybeSingle();

        if (orgError) {
          console.error('[useUserRole] Error fetching org membership:', orgError);
        }

        if (isMounted && orgMember) {
          setRole(orgMember.role as AppRole);
          setOrgId(orgMember.org_id);

          // If trusted_contact, fetch their permissions
          if (orgMember.role === 'trusted_contact') {
            const { data: perms, error: permsError } = await supabase
              .from('trusted_contact_permissions')
              .select('*')
              .eq('trusted_user_id', user.id)
              .eq('org_id', orgMember.org_id)
              .maybeSingle();

            if (permsError) {
              console.error('[useUserRole] Error fetching permissions:', permsError);
            }

            if (perms && isMounted) {
              setPermissions({
                canViewAfterDeathPlanner: perms.can_view_after_death_planner ?? false,
                canViewAfterDeathChecklist: perms.can_view_after_death_checklist ?? false,
                canViewInstructions: perms.can_view_instructions ?? false,
                canViewSharedDocuments: perms.can_view_shared_documents ?? false,
              });
            }
          }
        } else if (isMounted) {
          // User is logged in but not in any org - they're a new account holder
          setRole('owner');
        }

        if (isMounted) {
          setIsLoading(false);
        }
      } catch (error) {
        console.error('[useUserRole] Error:', error);
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchUserRole();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        fetchUserRole();
      } else if (event === 'SIGNED_OUT') {
        if (isMounted) {
          setIsLoggedIn(false);
          setRole(null);
          setOrgId(null);
          setPermissions(DEFAULT_PERMISSIONS);
        }
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return {
    role,
    isOwner: role === 'owner',
    isTrustedContact: role === 'trusted_contact',
    isAdmin: role === 'admin',
    isCoach: role === 'coach',
    isVip: role === 'vip',
    isLoggedIn,
    orgId,
    permissions,
    isLoading,
  };
};
