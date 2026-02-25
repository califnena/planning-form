import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, CreditCard, ShoppingCart, ExternalLink, RefreshCw } from "lucide-react";
import { launchCheckout } from "@/lib/checkoutLauncher";
import { supabase } from "@/integrations/supabase/client";
import { useAdminStatus } from "@/hooks/useAdminStatus";
import { toast } from "sonner";
import { STRIPE_LOOKUP_KEYS, ALL_CANONICAL_LOOKUP_KEYS } from "@/lib/stripeLookupKeys";

interface ValidationResult {
  found: { lookupKey: string; priceId: string; active: boolean; productName: string | null; unitAmount: number | null; currency: string; interval: string | null }[];
  missing: string[];
  inactive: string[];
  duplicates: { lookupKey: string; count: number }[];
}

export default function AdminPaymentsTest() {
  const navigate = useNavigate();
  const { isAdmin, isLoading: adminLoading } = useAdminStatus();
  const [loadingKey, setLoadingKey] = useState<string | null>(null);
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [validating, setValidating] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);

  if (adminLoading) return <div className="p-8 text-center text-muted-foreground">Loading...</div>;
  if (!isAdmin) return <div className="p-8 text-center text-destructive">Admin access required</div>;

  const testCheckout = async (lookupKey: string) => {
    setLoadingKey(lookupKey);
    await launchCheckout({
      lookupKey,
      successUrl: `${window.location.origin}/purchase-success?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: window.location.href,
      navigate,
      onLoadingChange: (loading) => { if (!loading) setLoadingKey(null); },
    });
  };

  const openPortal = async () => {
    setPortalLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('stripe-portal', {
        body: { returnUrl: window.location.href },
      });
      if (error) throw error;
      if (data?.url) window.open(data.url, '_blank');
      else toast.error("No billing account found for this user.");
    } catch (e: any) {
      toast.error("Portal error: " + (e.message || "Unknown"));
    } finally {
      setPortalLoading(false);
    }
  };

  const runValidation = async () => {
    setValidating(true);
    try {
      const { data, error } = await supabase.functions.invoke('stripe-validate-prices', {
        body: { lookupKeys: [...ALL_CANONICAL_LOOKUP_KEYS] },
      });
      if (error) throw error;
      setValidation(data);
      toast.success("Validation complete");
    } catch (e: any) {
      toast.error("Validation failed: " + (e.message || "Unknown"));
    } finally {
      setValidating(false);
    }
  };

  const checkoutButtons = [
    { label: "Binder (One-Time)", key: STRIPE_LOOKUP_KEYS.BINDER, icon: ShoppingCart },
    { label: "Basic (One-Time)", key: STRIPE_LOOKUP_KEYS.BASIC, icon: CreditCard },
    { label: "Premium Monthly", key: STRIPE_LOOKUP_KEYS.PREMIUM, icon: CreditCard },
    { label: "Premium Yearly", key: STRIPE_LOOKUP_KEYS.PREMIUM_YEAR, icon: CreditCard },
    { label: "VIP Monthly", key: STRIPE_LOOKUP_KEYS.VIP_MONTHLY, icon: CreditCard },
    { label: "VIP Yearly", key: STRIPE_LOOKUP_KEYS.VIP_YEAR, icon: CreditCard },
    { label: "Do It For You", key: STRIPE_LOOKUP_KEYS.DO_IT_FOR_YOU, icon: CreditCard },
    { label: "Song Standard", key: STRIPE_LOOKUP_KEYS.SONG_STANDARD, icon: CreditCard },
    { label: "Song Premium", key: STRIPE_LOOKUP_KEYS.SONG_PREMIUM, icon: CreditCard },
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Payments Test (Admin)</h1>
        <Button variant="outline" size="sm" onClick={() => navigate('/admin')}>
          ← Back to Admin
        </Button>
      </div>

      {/* Test Checkout Buttons */}
      <Card>
        <CardHeader><CardTitle className="text-lg">Test Checkout Sessions</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {checkoutButtons.map(({ label, key, icon: Icon }) => (
            <Button
              key={key}
              variant="outline"
              className="justify-start gap-2"
              disabled={loadingKey === key}
              onClick={() => testCheckout(key)}
            >
              {loadingKey === key ? <Loader2 className="h-4 w-4 animate-spin" /> : <Icon className="h-4 w-4" />}
              {label} <span className="text-xs text-muted-foreground ml-auto">{key}</span>
            </Button>
          ))}
        </CardContent>
      </Card>

      {/* Customer Portal */}
      <Card>
        <CardHeader><CardTitle className="text-lg">Customer Portal</CardTitle></CardHeader>
        <CardContent>
          <Button onClick={openPortal} disabled={portalLoading} className="gap-2">
            {portalLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ExternalLink className="h-4 w-4" />}
            Open Stripe Customer Portal
          </Button>
        </CardContent>
      </Card>

      {/* Price Validation */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Stripe Price Validation</CardTitle>
          <Button size="sm" variant="outline" onClick={runValidation} disabled={validating} className="gap-2">
            {validating ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            Validate All Keys
          </Button>
        </CardHeader>
        <CardContent>
          {!validation ? (
            <p className="text-sm text-muted-foreground">Click "Validate All Keys" to check all lookup keys against Stripe.</p>
          ) : (
            <div className="space-y-4">
              {validation.missing.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-destructive mb-1">Missing Keys</h3>
                  <div className="flex flex-wrap gap-1">
                    {validation.missing.map(k => <Badge key={k} variant="destructive">{k}</Badge>)}
                  </div>
                </div>
              )}
              {validation.inactive.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-warning mb-1">Inactive</h3>
                  <div className="flex flex-wrap gap-1">
                    {validation.inactive.map(k => <Badge key={k} variant="secondary">{k}</Badge>)}
                  </div>
                </div>
              )}
              {validation.found.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-2">Found ({validation.found.length})</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead><tr className="text-left text-muted-foreground border-b">
                        <th className="pb-1">Key</th><th className="pb-1">Product</th><th className="pb-1">Price</th><th className="pb-1">Type</th><th className="pb-1">Status</th>
                      </tr></thead>
                      <tbody>
                        {validation.found.map(p => (
                          <tr key={p.lookupKey} className="border-b border-muted">
                            <td className="py-1 font-mono text-xs">{p.lookupKey}</td>
                            <td className="py-1">{p.productName || '—'}</td>
                            <td className="py-1">{p.unitAmount != null ? `$${(p.unitAmount / 100).toFixed(2)}` : '—'}</td>
                            <td className="py-1">{p.interval || 'one-time'}</td>
                            <td className="py-1"><Badge variant={p.active ? "default" : "destructive"}>{p.active ? 'Active' : 'Inactive'}</Badge></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
