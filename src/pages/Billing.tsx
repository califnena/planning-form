import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Loader2, CreditCard, Download, ArrowLeft, ExternalLink, Mail, Check, AlertCircle } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getPlanDisplayName, getPlanFeatures } from "@/lib/billingPlans";

interface Subscription {
  id: string;
  plan_type: string;
  status: string;
  current_period_start: string | null;
  current_period_end: string | null;
  cancel_at_period_end?: boolean;
  stripe_customer_id: string | null;
}

interface Purchase {
  id: string;
  product_lookup_key: string;
  status: string;
  amount: number;
  purchased_at: string;
}

export default function Billing() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [isMasterAccount, setIsMasterAccount] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/login");
        return;
      }

      // Check for admin role
      const { data: adminRole } = await supabase
        .rpc('has_app_role', { _user_id: user.id, _role: 'admin' });
      
      if (adminRole) {
        setIsMasterAccount(true);
      }

      // Fetch subscription
      const { data: subscriptionData } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (subscriptionData) {
        setSubscription(subscriptionData);
      }

      // Fetch purchases
      const { data: purchaseData } = await supabase
        .from("purchases")
        .select("*")
        .eq("user_id", user.id)
        .order("purchased_at", { ascending: false });

      if (purchaseData) {
        setPurchases(purchaseData);
      }

      // Fetch invoices
      const { data: invoiceData } = await supabase
        .from("invoices")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (invoiceData) {
        setInvoices(invoiceData);
      }
      
      setLoading(false);
    };

    checkAuth();
  }, [navigate]);

  const handleManageBilling = async () => {
    if (!subscription?.stripe_customer_id) {
      toast({
        title: t("billing.noAccount"),
        description: t("billing.contactSupport"),
      });
      return;
    }

    setPortalLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("stripe-portal", {
        body: { returnUrl: window.location.href },
      });

      if (error) throw error;

      if (data?.url) {
        window.location.href = data.url;
      } else if (data?.error) {
        // Portal not available, show contact option
        toast({
          title: t("billing.portalUnavailable"),
          description: t("billing.contactSupportDescription"),
        });
      }
    } catch (err) {
      console.error("Portal error:", err);
      toast({
        title: t("billing.error"),
        description: t("billing.contactSupportDescription"),
        variant: "destructive",
      });
    } finally {
      setPortalLoading(false);
    }
  };

  const handleContactSupport = () => {
    window.location.href = "mailto:support@everlastingfuneraladvisors.com?subject=Billing%20Support%20Request";
  };

  const formatCurrency = (amount: number, currency: string = "usd") => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency.toUpperCase(),
    }).format(amount / 100);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      active: "default",
      trialing: "secondary",
      past_due: "destructive",
      canceled: "outline",
      incomplete: "destructive",
    };
    return <Badge variant={variants[status] || "secondary"}>{status}</Badge>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const isActiveSubscription = subscription?.status === "active" || subscription?.status === "trialing";
  const planFeatures = subscription?.plan_type ? getPlanFeatures(subscription.plan_type) : [];

  return (
    <div className="container max-w-4xl py-8 space-y-8">
      <Button 
        variant="ghost" 
        onClick={() => navigate("/app")}
        className="mb-6"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        {t("billing.returnHome")}
      </Button>
      
      <div>
        <h1 className="text-3xl font-bold">{t("billing.title")}</h1>
        <p className="text-muted-foreground">{t("billing.description")}</p>
      </div>

      {/* Master Account Notice */}
      {isMasterAccount && (
        <Card className="border-primary bg-gradient-to-r from-primary/5 to-primary/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Check className="h-5 w-5 text-primary" />
              {t("billing.masterAccount")}
            </CardTitle>
            <CardDescription>
              {t("billing.masterAccountDescription")}
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      {/* Current Plan */}
      <Card>
        <CardHeader>
          <CardTitle>{t("billing.currentPlan")}</CardTitle>
          <CardDescription>{t("billing.currentPlanDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          {subscription && subscription.plan_type !== "free" ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold">
                    {getPlanDisplayName(subscription.plan_type)}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    {getStatusBadge(subscription.status)}
                    {subscription.cancel_at_period_end && (
                      <Badge variant="outline" className="text-amber-600 border-amber-600">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        {t("billing.cancelsAtPeriodEnd")}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              {isActiveSubscription && (
                <>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">{t("billing.currentPeriodStart")}</p>
                      <p className="font-medium">{formatDate(subscription.current_period_start)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">{t("billing.renewalDate")}</p>
                      <p className="font-medium">{formatDate(subscription.current_period_end)}</p>
                    </div>
                  </div>

                  {planFeatures.length > 0 && (
                    <div>
                      <p className="text-sm font-medium mb-2">{t("billing.planIncludes")}</p>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        {planFeatures.slice(0, 4).map((feature, i) => (
                          <li key={i} className="flex items-center gap-2">
                            <Check className="h-3 w-3 text-primary" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </>
              )}
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-muted-foreground mb-4">{t("billing.noActivePlan")}</p>
              <Button onClick={() => navigate("/subscription")}>
                {t("billing.viewPlans")}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* One-Time Purchases */}
      {purchases.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>{t("billing.oneTimePurchases")}</CardTitle>
            <CardDescription>{t("billing.oneTimePurchasesDescription")}</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("billing.product")}</TableHead>
                  <TableHead>{t("billing.dateColumn")}</TableHead>
                  <TableHead>{t("billing.statusColumn")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {purchases.map((purchase) => (
                  <TableRow key={purchase.id}>
                    <TableCell className="font-medium">
                      {getPlanDisplayName(purchase.product_lookup_key.replace('EFA', '').toLowerCase())}
                    </TableCell>
                    <TableCell>{formatDate(purchase.purchased_at)}</TableCell>
                    <TableCell>{getStatusBadge(purchase.status)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Manage Billing */}
      <Card>
        <CardHeader>
          <CardTitle>{t("billing.manageBilling")}</CardTitle>
          <CardDescription>{t("billing.manageBillingDescription")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {subscription?.stripe_customer_id ? (
            <div className="flex flex-col sm:flex-row gap-3">
              <Button onClick={handleManageBilling} disabled={portalLoading}>
                {portalLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <ExternalLink className="mr-2 h-4 w-4" />
                )}
                {t("billing.manageSubscription")}
              </Button>
              <Button variant="outline" onClick={handleContactSupport}>
                <Mail className="mr-2 h-4 w-4" />
                {t("billing.contactSupport")}
              </Button>
            </div>
          ) : (
            <div className="bg-muted/50 rounded-lg p-4">
              <p className="text-sm text-muted-foreground mb-3">
                {t("billing.noStripeAccount")}
              </p>
              <Button variant="outline" onClick={handleContactSupport}>
                <Mail className="mr-2 h-4 w-4" />
                {t("billing.contactSupport")}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment Method */}
      <Card>
        <CardHeader>
          <CardTitle>{t("billing.paymentMethod")}</CardTitle>
          <CardDescription>{t("billing.paymentMethodDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          {subscription?.stripe_customer_id ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CreditCard className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">{t("billing.cardOnFile")}</p>
                  <p className="text-sm text-muted-foreground">{t("billing.paymentConnected")}</p>
                </div>
              </div>
              <Button variant="outline" onClick={handleManageBilling} disabled={portalLoading}>
                {t("billing.update")}
              </Button>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-muted-foreground mb-4">{t("billing.noPaymentMethod")}</p>
              <Button onClick={() => navigate("/subscription")}>
                <CreditCard className="mr-2 h-4 w-4" />
                {t("billing.addPaymentMethod")}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Billing History */}
      <Card>
        <CardHeader>
          <CardTitle>{t("billing.billingHistory")}</CardTitle>
          <CardDescription>{t("billing.billingHistoryDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          {invoices.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("billing.dateColumn")}</TableHead>
                  <TableHead>{t("billing.amountColumn")}</TableHead>
                  <TableHead>{t("billing.statusColumn")}</TableHead>
                  <TableHead className="text-right">{t("billing.invoiceColumn")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell>
                      {new Date(invoice.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {formatCurrency(invoice.amount, invoice.currency)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={invoice.status === "paid" ? "default" : "secondary"}>
                        {invoice.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {invoice.invoice_pdf && (
                        <Button
                          variant="ghost"
                          size="sm"
                          asChild
                        >
                          <a href={invoice.invoice_pdf} target="_blank" rel="noopener noreferrer">
                            <Download className="h-4 w-4" />
                          </a>
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              {t("billing.noInvoices")}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
