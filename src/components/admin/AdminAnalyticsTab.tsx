import { ActivityAnalytics } from "@/components/admin/ActivityAnalytics";
import { UserActivitySection } from "@/components/admin/UserActivitySection";
import { useTranslation } from "react-i18next";
import { Separator } from "@/components/ui/separator";

export function AdminAnalyticsTab() {
  const { t } = useTranslation();

  return (
    <div className="space-y-8">
      {/* Primary: real-time activity analytics */}
      <ActivityAnalytics />

      <Separator />

      {/* Legacy user_activity section (kept for backwards compatibility) */}
      <details className="group">
        <summary className="cursor-pointer text-sm font-medium text-muted-foreground hover:text-foreground">
          Legacy User Activity (old tracker)
        </summary>
        <div className="mt-4">
          <UserActivitySection />
        </div>
      </details>
    </div>
  );
}
