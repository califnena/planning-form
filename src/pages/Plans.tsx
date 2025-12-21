import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Sparkles, Star, RefreshCw, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AuthenticatedLayout } from "@/components/AuthenticatedLayout";
import { useNavigate } from "react-router-dom";
import { STRIPE_LOOKUP_KEYS } from "@/lib/stripeLookupKeys";
import { PLANS } from "@/lib/plans";

interface StripePrice {
  lookupKey: string;
  priceId: string;
  currency: string;
  unitAmount: number;
  type: string;
  interval: string | null;
  intervalCount: number | null;
  productName: string | null;
  productDescription: string | null;
}

function formatPrice(unitAmount: number, currency: string, interval: string | null): string {
  const amount = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
    minimumFractionDigits: 2,
  }).format(unitAmount / 100);

  if (interval) {
    return `${amount} / ${interval}`;
  }
  return amount;
}

export default function Plans() {
  const navigate = useNavigate();
  const [currentPlan, setCurrentPlan] = useState<string>("Free");
  const [isLoading, setIsLoading] = useState(true);
  const [prices, setPrices] = useState<Record<string, StripePrice>>({});
  const [pricesError, setPricesError] = useState<string | null>(null);
  const [pricesLoading, setPricesLoading] = useState(true);

  // Fetch user subscription status
  useEffect(() => {
    const loadSubscription = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setIsLoading(false);
        return;
      }

      const { data: adminRole } = await supabase
        .rpc('has_app_role', { _user_id: user.id, _role: 'admin' });
      
      if (adminRole) {
        setCurrentPlan("Master Account");
        setIsLoading(false);
        return;
      }

      const { data: subscription } = await supabase
        .from("subscriptions")
        .select("plan_type, status")
        .eq("user_id", user.id)
        .maybeSingle();

      if (subscription?.status === "active") {
        const planMap: Record<string, string> = {
          basic: "Basic",
          premium: "Premium",
          vip_annual: "VIP (Annual)",
          vip_monthly: "VIP (Monthly)"
        };
        setCurrentPlan(planMap[subscription.plan_type] || "Active");
      }

      setIsLoading(false);
    };

    loadSubscription();
  }, []);

  // Fetch Stripe prices
  const fetchPrices = async () => {
    setPricesLoading(true);
    setPricesError(null);
    
    try {
      const lookupKeys = [
        STRIPE_LOOKUP_KEYS.BASIC,
        STRIPE_LOOKUP_KEYS.PREMIUM_YEAR,
        STRIPE_LOOKUP_KEYS.VIP_YEAR,
        STRIPE_LOOKUP_KEYS.VIP_MONTHLY,
      ];

      const { data, error } = await supabase.functions.invoke('stripe-list-prices', {
        body: { lookupKeys },
      });

      if (error) throw error;
      
      if (data?.prices) {
        setPrices(data.prices);
      } else {
        throw new Error("No prices returned");
      }
    } catch (err) {
      console.error("Error fetching prices:", err);
      setPricesError("We couldn't load pricing right now. Please refresh or try again in a moment.");
    } finally {
      setPricesLoading(false);
    }
  };

  useEffect(() => {
    fetchPrices();
  }, []);

  const getPriceDisplay = (lookupKey: string, fallback: string): string => {
    const price = prices[lookupKey];
    if (!price) return fallback;
    return formatPrice(price.unitAmount, price.currency, price.interval);
  };

  if (isLoading) {
    return (
      <AuthenticatedLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Loading...</div>
        </div>
      </AuthenticatedLayout>
    );
  }

  return (
    <AuthenticatedLayout>
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="space-y-8">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-foreground">My Plan & Billing</h1>
            <p className="text-muted-foreground mt-2">Manage your subscription and access to features</p>
          </div>

          {/* Current Plan */}
          <Card>
            <CardHeader>
              <CardTitle>Current Plan</CardTitle>
              <CardDescription>Your active subscription</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-semibold text-foreground">{currentPlan}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {currentPlan === "Free" ? "Limited access to features" : "Full access to selected features"}
                  </p>
                </div>
                <Button onClick={() => navigate("/preplansteps/profile/subscription")}>
                  Manage Subscription
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Available Plans */}
          <div>
            <h2 className="text-2xl font-bold mb-4">Available Plans</h2>
            
            {/* Error State */}
            {pricesError && (
              <Card className="mb-6 border-destructive/50 bg-destructive/5">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="h-5 w-5 text-destructive" />
                    <p className="text-sm text-foreground">{pricesError}</p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={fetchPrices}
                      className="ml-auto"
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Retry
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Loading State */}
            {pricesLoading && !pricesError && (
              <div className="text-center py-8 text-muted-foreground">
                <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2" />
                Loading pricing...
              </div>
            )}

            {/* Plans Grid */}
            {!pricesLoading && (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {/* Basic Plan */}
                <Card className="border-2">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Star className="h-5 w-5 text-primary" />
                      {prices[STRIPE_LOOKUP_KEYS.BASIC]?.productName || "Basic"}
                    </CardTitle>
                    <CardDescription>
                      <span className="text-2xl font-bold text-foreground">
                        {getPriceDisplay(STRIPE_LOOKUP_KEYS.BASIC, PLANS.BASIC_ANNUAL.price)}
                      </span>
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {PLANS.BASIC_ANNUAL.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm">
                          <CheckCircle className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Button 
                      className="w-full mt-6" 
                      variant="outline" 
                      onClick={() => navigate("/preplansteps/profile/subscription")}
                    >
                      Select Plan
                    </Button>
                  </CardContent>
                </Card>

                {/* Premium Plan */}
                <Card className="border-2 border-primary">
                  <CardHeader>
                    <div className="flex items-center justify-between mb-2">
                      <Badge>Popular</Badge>
                    </div>
                    <CardTitle className="flex items-center gap-2">
                      <Star className="h-5 w-5 text-primary fill-primary" />
                      {prices[STRIPE_LOOKUP_KEYS.PREMIUM_YEAR]?.productName || "Premium"}
                    </CardTitle>
                    <CardDescription>
                      <span className="text-2xl font-bold text-foreground">
                        {getPriceDisplay(STRIPE_LOOKUP_KEYS.PREMIUM_YEAR, PLANS.PREMIUM_ANNUAL.price)}
                      </span>
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {PLANS.PREMIUM_ANNUAL.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm">
                          <CheckCircle className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Button 
                      className="w-full mt-6" 
                      onClick={() => navigate("/preplansteps/profile/subscription")}
                    >
                      Select Plan
                    </Button>
                  </CardContent>
                </Card>

                {/* VIP Plan */}
                <Card className="border-2 border-primary bg-primary/5">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-primary fill-primary" />
                      {prices[STRIPE_LOOKUP_KEYS.VIP_YEAR]?.productName || "CARE Support"}
                    </CardTitle>
                    <CardDescription>
                      <span className="text-2xl font-bold text-foreground">
                        {getPriceDisplay(STRIPE_LOOKUP_KEYS.VIP_YEAR, PLANS.VIP_ANNUAL.price)}
                      </span>
                      <span className="text-sm text-muted-foreground block mt-1">
                        or {getPriceDisplay(STRIPE_LOOKUP_KEYS.VIP_MONTHLY, PLANS.VIP_MONTHLY.price)}
                      </span>
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {PLANS.VIP_ANNUAL.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm">
                          <CheckCircle className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Button 
                      className="w-full mt-6" 
                      onClick={() => navigate("/preplansteps/profile/subscription")}
                    >
                      Select Plan
                    </Button>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
