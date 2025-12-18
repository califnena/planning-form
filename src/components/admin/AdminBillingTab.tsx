import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard, Info } from "lucide-react";

export function AdminBillingTab() {
  const { t } = useTranslation();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          {t("admin.billing.title", "Billing")}
        </CardTitle>
        <CardDescription>
          {t("admin.billing.description", "Subscription and billing information")}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-3 p-4 rounded-lg bg-muted">
          <Info className="h-5 w-5 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            {t("admin.billing.comingSoon", "Billing management features are coming soon. For now, billing is handled through Stripe.")}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
