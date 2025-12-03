import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, CreditCard, TrendingUp, Users, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { getSubscriptionStats, listSubscriptions, listUsers } from "@/lib/adminApi";

export function AdminBillingTab() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<{
    total: number;
    byPlan: Record<string, number>;
    byStatus: Record<string, number>;
  } | null>(null);
  const [subscriptions, setSubscriptions] = useState<Array<{
    id: string;
    user_id: string;
    plan_type: string;
    status: string;
    current_period_end: string | null;
    cancel_at_period_end: boolean;
  }>>([]);
  const [userEmails, setUserEmails] = useState<Record<string, string>>({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [statsData, subsData, usersData] = await Promise.all([
        getSubscriptionStats(),
        listSubscriptions(),
        listUsers()
      ]);
      setStats(statsData);
      setSubscriptions(subsData);
      
      // Build email lookup
      const emailMap: Record<string, string> = {};
      usersData.forEach(u => {
        emailMap[u.id] = u.email;
      });
      setUserEmails(emailMap);
    } catch (error: any) {
      toast({
        title: t("admin.error"),
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  const activeCount = stats?.byStatus?.active || 0;
  const canceledCount = stats?.byStatus?.canceled || 0;
  const pastDueCount = stats?.byStatus?.past_due || 0;

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("admin.billing.totalSubscriptions")}</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("admin.billing.active")}</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{activeCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("admin.billing.canceled")}</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{canceledCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("admin.billing.pastDue")}</CardTitle>
            <AlertCircle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{pastDueCount}</div>
          </CardContent>
        </Card>
      </div>

      {/* By Plan */}
      <Card>
        <CardHeader>
          <CardTitle>{t("admin.billing.byPlan")}</CardTitle>
          <CardDescription>{t("admin.billing.byPlanDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            {Object.entries(stats?.byPlan || {}).map(([plan, count]) => (
              <div key={plan} className="flex items-center gap-2 p-3 rounded-lg border">
                <Badge variant="outline">{plan}</Badge>
                <span className="text-2xl font-bold">{count}</span>
              </div>
            ))}
            {Object.keys(stats?.byPlan || {}).length === 0 && (
              <p className="text-muted-foreground">{t("admin.billing.noSubscriptions")}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Subscriptions List */}
      <Card>
        <CardHeader>
          <CardTitle>{t("admin.billing.allSubscriptions")}</CardTitle>
          <CardDescription>{t("admin.billing.allSubscriptionsDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("admin.billing.user")}</TableHead>
                  <TableHead>{t("admin.billing.plan")}</TableHead>
                  <TableHead>{t("admin.billing.status")}</TableHead>
                  <TableHead>{t("admin.billing.periodEnd")}</TableHead>
                  <TableHead>{t("admin.billing.cancelAtEnd")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {subscriptions.map((sub) => (
                  <TableRow key={sub.id}>
                    <TableCell className="font-medium">
                      {userEmails[sub.user_id] || sub.user_id.slice(0, 8) + "..."}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{sub.plan_type}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={
                          sub.status === "active" ? "default" :
                          sub.status === "canceled" ? "secondary" :
                          sub.status === "past_due" ? "destructive" :
                          "outline"
                        }
                      >
                        {sub.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {sub.current_period_end 
                        ? format(new Date(sub.current_period_end), "MMM d, yyyy")
                        : "-"
                      }
                    </TableCell>
                    <TableCell>
                      {sub.cancel_at_period_end ? (
                        <Badge variant="destructive">{t("common.yes")}</Badge>
                      ) : (
                        <span className="text-muted-foreground">{t("common.no")}</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                {subscriptions.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      {t("admin.billing.noSubscriptions")}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
