 import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Download, ArrowLeft, ExternalLink, Mail, Check, AlertCircle, Package, Smartphone } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getPlanDisplayName } from "@/lib/billingPlans";
import { isStoreIAP } from "@/lib/billingMode";
 import { CallbackRequestDialog } from "@/components/resources/CallbackRequestDialog";

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

const PRODUCT_NAMES: Record<string, string> = {
  EFABINDER: "Fireproof Planning Binder",
  EFADOFORU: "Do-It-For-You Planning",
  STANDARDSONG: "Custom Memorial Song",
  PREMIUMSONG: "Premium Memorial Song",
  EFAPRINTABLE: "Printable Access",
  EFAGUIDED: "Guided Access",
  EFAVIPMONTHLY: "VIP Planning Support (Monthly)",
  EFAVIPYEARLY: "VIP Planning Support (Yearly)",
};

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
 const [showContactDialog, setShowContactDialog] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/login");
        return;
      }

      const { data: adminRole } = await supabase
        .rpc('has_app_role', { _user_id: user.id, _role: 'admin' });
      
      if (adminRole) {
        setIsMasterAccount(true);
      }

      const { data: subscriptionData } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (subscriptionData) {
        setSubscription(subscriptionData);
      }

      const { data: purchaseData } = await supabase
        .from("purchases")
        .select("*")
        .eq("user_id", user.id)
        .order("purchased_at", { ascending: false });

      if (purchaseData) {
        setPurchases(purchaseData);
      }

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
        title: "No billing account",
        description: "Please contact support for assistance.",
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
      } else {
        toast({
          title: "Portal unavailable",
          description: "Please contact support for billing changes.",
        });
      }
    } catch (err) {
      console.error("Portal error:", err);
      toast({
        title: "Error",
        description: "Could not open billing portal. Please try again.",
        variant: "destructive",
      });
    } finally {
      setPortalLoading(false);
    }
  };

  const handleContactSupport = () => {
   setShowContactDialog(true);
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

  const getProductName = (lookupKey: string) => {
    return PRODUCT_NAMES[lookupKey] || getPlanDisplayName(lookupKey.replace('EFA', '').toLowerCase()) || lookupKey;
  };

  const isSubscriptionCancellable = subscription && 
    ["active", "trialing", "past_due"].includes(subscription.status) &&
    !subscription.cancel_at_period_end;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const hasActiveSubscription = subscription && ["active", "trialing", "past_due"].includes(subscription.status);

  return (
    <div className="container max-w-4xl py-8 space-y-8">
      <Button 
        variant="ghost" 
        onClick={() => navigate("/dashboard")}
        className="mb-6"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Planning Menu
      </Button>
      
      <div>
        <h1 className="text-3xl font-bold">Billing</h1>
        <p className="text-muted-foreground">Manage your subscriptions and view your purchases.</p>
      </div>

      {/* Master Account Notice */}
      {isMasterAccount && (
        <Card className="border-primary bg-gradient-to-r from-primary/5 to-primary/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Check className="h-5 w-5 text-primary" />
              Master Account
            </CardTitle>
            <CardDescription>
              You have full access to all features as an administrator.
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      {/* Active Subscriptions */}
      <Card>
        <CardHeader>
          <CardTitle>Subscriptions</CardTitle>
          <CardDescription>
            Subscriptions renew automatically. You can cancel anytime. If you cancel, access remains available through the end of your current billing period.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {hasActiveSubscription ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <h3 className="font-semibold">
                    {getProductName(subscription.plan_type.toUpperCase())}
                  </h3>
                  <div className="flex items-center gap-2">
                    <Badge variant={subscription.status === "active" ? "default" : subscription.status === "past_due" ? "destructive" : "secondary"}>
                      {subscription.status === "active" ? "Active" : 
                       subscription.status === "trialing" ? "Trial" : 
                       subscription.status === "past_due" ? "Past Due" : subscription.status}
                    </Badge>
                    {subscription.cancel_at_period_end && (
                      <Badge variant="outline" className="text-amber-600 border-amber-600">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        Cancels {formatDate(subscription.current_period_end)}
                      </Badge>
                    )}
                  </div>
                  {subscription.current_period_end && !subscription.cancel_at_period_end && (
                    <p className="text-sm text-muted-foreground">
                      Renews {formatDate(subscription.current_period_end)}
                    </p>
                  )}
                </div>
                {isSubscriptionCancellable && !isStoreIAP && (
                  <Button 
                    variant="outline" 
                    onClick={handleManageBilling}
                    disabled={portalLoading}
                  >
                    {portalLoading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <ExternalLink className="mr-2 h-4 w-4" />
                    )}
                    Manage Subscription
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-6 text-muted-foreground">
              <p>No active subscriptions.</p>
              <Button 
                variant="link" 
                onClick={() => navigate("/pricing")}
                className="mt-2"
              >
                View available plans
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Store IAP Management Card */}
      {isStoreIAP && (
        <Card className="border-blue-200 bg-blue-50/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Smartphone className="h-5 w-5 text-blue-600" />
              Manage Subscriptions
            </CardTitle>
            <CardDescription>
              Subscriptions purchased in the iOS App Store or Google Play are managed in your store account settings.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              variant="outline" 
              onClick={() => navigate("/payment-help")}
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              How to Manage
            </Button>
          </CardContent>
        </Card>
      )}

      {/* One-Time Purchases */}
      <Card>
        <CardHeader>
          <CardTitle>One-Time Purchases</CardTitle>
          <CardDescription>
            One-time purchases do not renew and do not require cancellation.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {purchases.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Purchased</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {purchases.map((purchase) => (
                  <TableRow key={purchase.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{getProductName(purchase.product_lookup_key)}</span>
                      </div>
                    </TableCell>
                    <TableCell>{formatDate(purchase.purchased_at)}</TableCell>
                    <TableCell>
                      <Badge variant="default" className="bg-green-600">
                        <Check className="h-3 w-3 mr-1" />
                        Owned
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-6 text-muted-foreground">
              No one-time purchases yet.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Billing History */}
      {invoices.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Payment History</CardTitle>
            <CardDescription>Your receipts and invoices.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Receipt</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell>{formatDate(invoice.created_at)}</TableCell>
                    <TableCell>{formatCurrency(invoice.amount, invoice.currency)}</TableCell>
                    <TableCell>
                      <Badge variant={invoice.status === "paid" ? "default" : "secondary"}>
                        {invoice.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {invoice.invoice_pdf && (
                        <Button variant="ghost" size="sm" asChild>
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
          </CardContent>
        </Card>
      )}

      {/* Support */}
      <Card>
        <CardHeader>
          <CardTitle>Need Help?</CardTitle>
        </CardHeader>
        <CardContent>
          <Button variant="outline" onClick={handleContactSupport}>
            <Mail className="mr-2 h-4 w-4" />
            Contact Support
          </Button>
        </CardContent>
      </Card>

     {/* Contact Support Dialog */}
     <CallbackRequestDialog 
       open={showContactDialog} 
       onOpenChange={setShowContactDialog} 
     />
   </div>
  );
}
