import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { getActivePlanId, getPlanTableCounts } from "@/lib/getActivePlanId";
import { Bug, RefreshCw } from "lucide-react";

interface PlanDebugInfo {
  userId: string | null;
  orgId: string | null;
  planId: string | null;
  planUpdatedAt: string | null;
  planOwnerUserId: string | null;
  payloadKeys: string[];
  tableCounts: Record<string, number>;
  loading: boolean;
  activePlanIdFromSettings: string | null;
}

/**
 * DEV ONLY: Debug panel showing plan_id consistency across pages.
 * This helps identify when different pages are reading/writing to different plans.
 * 
 * Shows:
 * - Current user.id
 * - Current org_id
 * - Current plan_id (the one being used)
 * - active_plan_id from user_settings (the saved preference)
 * - plan.updated_at
 * - plan.owner_user_id
 * - Table row counts by plan_id
 * - plan_payload top-level keys
 */
export function PlanDebugPanel() {
  const [info, setInfo] = useState<PlanDebugInfo>({
    userId: null,
    orgId: null,
    planId: null,
    planUpdatedAt: null,
    planOwnerUserId: null,
    payloadKeys: [],
    tableCounts: {},
    loading: true,
    activePlanIdFromSettings: null,
  });
  const [expanded, setExpanded] = useState(false);

  const loadDebugInfo = async () => {
    try {
      setInfo(prev => ({ ...prev, loading: true }));
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setInfo(prev => ({ ...prev, loading: false }));
        return;
      }

      // Get active_plan_id from user_settings
      const { data: settings } = await supabase
        .from("user_settings")
        .select("active_plan_id")
        .eq("user_id", user.id)
        .maybeSingle();

      const { planId, orgId, plan } = await getActivePlanId(user.id);
      
      let tableCounts: Record<string, number> = {};
      let payloadKeys: string[] = [];

      if (planId) {
        tableCounts = await getPlanTableCounts(planId);
        
        if (plan?.plan_payload && typeof plan.plan_payload === "object") {
          payloadKeys = Object.keys(plan.plan_payload);
        }
      }

      setInfo({
        userId: user.id,
        orgId,
        planId,
        planUpdatedAt: plan?.updated_at || null,
        planOwnerUserId: plan?.owner_user_id || null,
        payloadKeys,
        tableCounts,
        loading: false,
        activePlanIdFromSettings: settings?.active_plan_id || null,
      });

      if (import.meta.env.DEV) {
        console.log("[PlanDebugPanel] Loaded:", { 
          userId: user.id, 
          planId, 
          activePlanIdFromSettings: settings?.active_plan_id,
          tableCounts,
          payloadKeys 
        });
      }
    } catch (error) {
      console.error("[PlanDebugPanel] Error:", error);
      setInfo(prev => ({ ...prev, loading: false }));
    }
  };

  useEffect(() => {
    loadDebugInfo();
  }, []);

  // Only show in DEV mode
  if (!import.meta.env.DEV) {
    return null;
  }

  if (info.loading) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Card className="w-64 bg-yellow-50 border-yellow-300 shadow-lg">
          <CardContent className="p-2 text-xs">
            <div className="flex items-center gap-2">
              <Bug className="h-4 w-4 text-yellow-600 animate-pulse" />
              <span>Loading debug info...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const totalRows = Object.values(info.tableCounts).reduce((a, b) => a + b, 0);
  const idMismatch = info.userId && info.planOwnerUserId && info.userId !== info.planOwnerUserId;
  const settingsMismatch = info.activePlanIdFromSettings && info.planId && info.activePlanIdFromSettings !== info.planId;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Card className={`bg-yellow-50 border-yellow-300 shadow-lg ${expanded ? "w-80" : "w-auto"}`}>
        <CardContent className="p-2 text-xs font-mono">
          <button 
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-2 w-full text-left"
          >
            <Bug className="h-4 w-4 text-yellow-600" />
            <span className="font-bold">DEV: Plan Debug</span>
            <Badge variant={idMismatch || settingsMismatch ? "destructive" : "outline"} className="ml-auto text-[10px]">
              {idMismatch ? "ID MISMATCH!" : settingsMismatch ? "SETTINGS MISMATCH!" : `${totalRows} rows`}
            </Badge>
            <button 
              onClick={(e) => { e.stopPropagation(); loadDebugInfo(); }}
              className="ml-1 p-1 hover:bg-yellow-200 rounded"
              title="Refresh"
            >
              <RefreshCw className={`h-3 w-3 ${info.loading ? 'animate-spin' : ''}`} />
            </button>
          </button>
          
          {expanded && (
            <div className="mt-2 space-y-1 border-t border-yellow-200 pt-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">user.id:</span>
                <span className="truncate max-w-[160px]" title={info.userId || ""}>
                  {info.userId?.slice(0, 8) || "none"}...
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">org_id:</span>
                <span className="truncate max-w-[160px]" title={info.orgId || ""}>
                  {info.orgId?.slice(0, 8) || "none"}...
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">plan_id:</span>
                <span className={`truncate max-w-[160px] ${!info.planId ? "text-red-600" : ""}`} title={info.planId || ""}>
                  {info.planId?.slice(0, 8) || "NONE!"}...
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">saved_plan_id:</span>
                <span className={`truncate max-w-[160px] ${settingsMismatch ? "text-orange-600" : ""}`} title={info.activePlanIdFromSettings || ""}>
                  {info.activePlanIdFromSettings?.slice(0, 8) || "not set"}...
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">updated_at:</span>
                <span className="truncate max-w-[160px]">
                  {info.planUpdatedAt ? new Date(info.planUpdatedAt).toLocaleTimeString() : "never"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">owner_user_id:</span>
                <span className={`truncate max-w-[160px] ${idMismatch ? "text-red-600 font-bold" : ""}`}>
                  {info.planOwnerUserId?.slice(0, 8) || "none"}...
                </span>
              </div>
              
              <div className="border-t border-yellow-200 mt-1 pt-1">
                <div className="text-muted-foreground mb-1">Table counts (plan_id):</div>
                <div className="grid grid-cols-2 gap-x-2 gap-y-0.5">
                  {Object.entries(info.tableCounts).map(([table, count]) => (
                    <div key={table} className="flex justify-between">
                      <span className="truncate">{table.replace("_", " ")}:</span>
                      <span className={count > 0 ? "text-green-600 font-bold" : "text-muted-foreground"}>
                        {count}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="border-t border-yellow-200 mt-1 pt-1">
                <div className="text-muted-foreground mb-1">
                  plan_payload keys ({info.payloadKeys.length}):
                </div>
                <div className="text-[10px] break-words">
                  {info.payloadKeys.length > 0 
                    ? info.payloadKeys.join(", ") 
                    : <span className="text-orange-600">EMPTY</span>
                  }
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
