import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Bug } from "lucide-react";
import { useAdminStatus } from "@/hooks/useAdminStatus";

interface PlanDebugPanelProps {
  userId?: string | null;
  orgId: string | null;
  planId: string | null;
  debugInfo?: string | null;
  counts: {
    personalProfile: boolean;
    contacts: number;
    pets: number;
    insurance: number;
    properties: number;
    messages: number;
    planNotes: number;
  };
}

/**
 * Admin-only debug panel showing plan resolution and data counts.
 * Only visible when user has admin role.
 */
export function PlanDebugPanel({ userId, orgId, planId, debugInfo, counts }: PlanDebugPanelProps) {
  const { isAdmin, isLoading } = useAdminStatus();

  if (isLoading || !isAdmin) {
    return null;
  }

  return (
    <Alert className="mb-4 border-amber-400 bg-amber-50 print:hidden">
      <Bug className="h-4 w-4 text-amber-600" />
      <AlertTitle className="text-amber-800">Admin Debug: Plan Data Status</AlertTitle>
      <AlertDescription className="text-amber-700 mt-2">
        <div className="grid grid-cols-2 gap-2 text-sm font-mono">
          {userId !== undefined && (
            <>
              <div>user_id:</div>
              <div className="truncate">{userId || "null"}</div>
            </>
          )}
          
          <div>org_id:</div>
          <div className="truncate">{orgId || "null"}</div>
          
          <div>plan_id:</div>
          <div className="truncate">{planId || "null"}</div>
          
          {debugInfo && (
            <>
              <div>debug:</div>
              <div className="truncate">{debugInfo}</div>
            </>
          )}
          
          <div className="col-span-2 border-t border-amber-300 pt-2 mt-2 font-semibold">
            Data Counts:
          </div>
          
          <div>personal_profiles:</div>
          <div>{counts.personalProfile ? "1 (has name)" : "0"}</div>
          
          <div>contacts_notify:</div>
          <div>{counts.contacts}</div>
          
          <div>pets:</div>
          <div>{counts.pets}</div>
          
          <div>insurance_policies:</div>
          <div>{counts.insurance}</div>
          
          <div>properties:</div>
          <div>{counts.properties}</div>
          
          <div>messages:</div>
          <div>{counts.messages}</div>
          
          <div>plan_notes (non-empty):</div>
          <div>{counts.planNotes}</div>
        </div>
        <p className="text-xs mt-3 italic">
          This panel is only visible to admins. Remove after verification.
        </p>
      </AlertDescription>
    </Alert>
  );
}
