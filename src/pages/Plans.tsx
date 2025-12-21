import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Sparkles, Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AuthenticatedLayout } from "@/components/AuthenticatedLayout";
import { useNavigate } from "react-router-dom";
import { PLANS } from "@/lib/plans";

export default function Plans() {
  const navigate = useNavigate();
  const [currentPlan, setCurrentPlan] = useState<string>("Free");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadSubscription = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setIsLoading(false);
        return;
      }

      // Check if admin/master account
      const { data: adminRole } = await supabase
        .rpc('has_app_role', { _user_id: user.id, _role: 'admin' });
      
      if (adminRole) {
        setCurrentPlan("Master Account");
        setIsLoading(false);
        return;
      }

      // Check subscription
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
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {/* Basic Plan */}
              <Card className="border-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="h-5 w-5 text-primary" />
                    Basic
                  </CardTitle>
                  <CardDescription>
                    <span className="text-2xl font-bold text-foreground">{PLANS.BASIC_ANNUAL.price}</span>
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
                  <Button className="w-full mt-6" variant="outline" onClick={() => navigate("/preplansteps/profile/subscription")}>
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
                    Premium
                  </CardTitle>
                  <CardDescription>
                    <span className="text-2xl font-bold text-foreground">{PLANS.PREMIUM_ANNUAL.price}</span>
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
                  <Button className="w-full mt-6" onClick={() => navigate("/preplansteps/profile/subscription")}>
                    Select Plan
                  </Button>
                </CardContent>
              </Card>

              {/* VIP Plan */}
              <Card className="border-2 border-primary bg-primary/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary fill-primary" />
                    VIP
                  </CardTitle>
                  <CardDescription>
                    <span className="text-2xl font-bold text-foreground">{PLANS.VIP_ANNUAL.price}</span>
                    <span className="text-sm text-muted-foreground block mt-1">or {PLANS.VIP_MONTHLY.price}</span>
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
                  <Button className="w-full mt-6" onClick={() => navigate("/preplansteps/profile/subscription")}>
                    Select Plan
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
