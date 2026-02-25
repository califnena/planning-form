import { AnalyticsDashboard } from "@/components/admin/AnalyticsDashboard";
import { AdminBillingTab } from "@/components/admin/AdminBillingTab";
import { Separator } from "@/components/ui/separator";
import { ActivityAnalytics } from "@/components/admin/ActivityAnalytics";

export function AdminAnalyticsTab() {
  return (
    <div className="space-y-8">
      {/* Primary: first-party analytics */}
      <AnalyticsDashboard />

      <Separator />

      {/* Legacy activity_events tracker (kept for backwards compat) */}
      <details className="group">
        <summary className="cursor-pointer text-sm font-medium text-muted-foreground hover:text-foreground">
          Legacy Activity Events (old tracker)
        </summary>
        <div className="mt-4">
          <ActivityAnalytics />
        </div>
      </details>
    </div>
  );
}
