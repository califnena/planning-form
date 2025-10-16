import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Check } from "lucide-react";

type SubscriptionPlan = "free" | "basic" | "premium";

export default function Subscription() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [currentPlan, setCurrentPlan] = useState<SubscriptionPlan>("free");
  const [subscriptionData, setSubscriptionData] = useState<any>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/login");
        return;
      }

      const { data: subscription } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (subscription) {
        setCurrentPlan(subscription.plan_type);
        setSubscriptionData(subscription);
      }
      setLoading(false);
    };

    checkAuth();
  }, [navigate]);

  const plans = [
    {
      name: "Free",
      value: "free" as SubscriptionPlan,
      price: "$0",
      period: "forever",
      features: [
        "Preview all sections",
        "No PDF generation",
        "No data input",
      ],
    },
    {
      name: "Basic",
      value: "basic" as SubscriptionPlan,
      price: "$49",
      period: "per year",
      features: [
        "Preview all sections",
        "Generate blank forms",
        "View only access",
      ],
    },
    {
      name: "Premium",
      value: "premium" as SubscriptionPlan,
      price: "$99",
      period: "per year",
      features: [
        "Full access to all features",
        "Input and save data",
        "Generate filled PDFs",
        "Email plans",
        "Priority support",
      ],
    },
  ];

  const handleUpgrade = (plan: SubscriptionPlan) => {
    toast({
      title: "Coming soon",
      description: "Stripe integration will be added to handle subscription upgrades.",
    });
  };

  const handleCancel = () => {
    toast({
      title: "Coming soon",
      description: "Subscription cancellation will be available once Stripe is integrated.",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container max-w-6xl py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Subscription Plans</h1>
        <p className="text-muted-foreground">Choose the plan that works best for you</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <Card key={plan.value} className={currentPlan === plan.value ? "border-primary" : ""}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{plan.name}</CardTitle>
                {currentPlan === plan.value && (
                  <Badge>Current</Badge>
                )}
              </div>
              <CardDescription>
                <span className="text-3xl font-bold text-foreground">{plan.price}</span>
                <span className="text-muted-foreground"> / {plan.period}</span>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
              
              {currentPlan === plan.value ? (
                currentPlan !== "free" && (
                  <Button variant="outline" onClick={handleCancel} className="w-full">
                    Cancel Subscription
                  </Button>
                )
              ) : (
                <Button 
                  onClick={() => handleUpgrade(plan.value)} 
                  className="w-full"
                  disabled={plan.value === "free"}
                >
                  {plan.value === "free" ? "Current Plan" : "Upgrade"}
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {subscriptionData && subscriptionData.current_period_end && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Subscription Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status:</span>
                <Badge variant={subscriptionData.status === "active" ? "default" : "secondary"}>
                  {subscriptionData.status}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Current period ends:</span>
                <span>{new Date(subscriptionData.current_period_end).toLocaleDateString()}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
