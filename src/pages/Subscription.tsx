import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Check, ArrowLeft } from "lucide-react";
import binderImage from "@/assets/fireproof-binder.png";

type SubscriptionPlan = "free" | "basic" | "premium";

export default function Subscription() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useTranslation();
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
      name: t("subscription.free"),
      value: "free" as SubscriptionPlan,
      price: "$0",
      period: t("subscription.freePeriod"),
      features: [
        t("subscription.freeFeature1"),
        t("subscription.freeFeature2"),
        t("subscription.freeFeature3"),
      ],
    },
    {
      name: t("subscription.basic"),
      value: "basic" as SubscriptionPlan,
      price: t("subscription.basicPrice"),
      period: t("subscription.perYear"),
      features: [
        t("subscription.basicFeature1"),
        t("subscription.basicFeature2"),
        t("subscription.basicFeature3"),
      ],
    },
    {
      name: t("subscription.premium"),
      value: "premium" as SubscriptionPlan,
      price: t("subscription.premiumPrice"),
      period: t("subscription.perYear"),
      features: [
        t("subscription.premiumFeature1"),
        t("subscription.premiumFeature2"),
        t("subscription.premiumFeature3"),
        t("subscription.premiumFeature4"),
        t("subscription.premiumFeature5"),
      ],
    },
  ];

  const handleUpgrade = (plan: SubscriptionPlan) => {
    if (plan === "basic") {
      window.location.href = "https://buy.stripe.com/6oU28r2x75OrbLxg6q7bW00";
    } else {
      toast({
        title: t("subscription.comingSoon"),
        description: t("subscription.comingSoonDescription"),
      });
    }
  };

  const handleCancel = () => {
    toast({
      title: t("subscription.comingSoon"),
      description: t("subscription.cancelComingSoon"),
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
      <Button 
        variant="ghost" 
        onClick={() => navigate("/app")}
        className="mb-6"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        {t("subscription.returnHome")}
      </Button>
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold">{t("subscription.title")}</h1>
        <p className="text-muted-foreground">{t("subscription.description")}</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <Card key={plan.value} className={currentPlan === plan.value ? "border-primary" : ""}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{plan.name}</CardTitle>
                {currentPlan === plan.value && (
                  <Badge>{t("subscription.currentBadge")}</Badge>
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
                    {t("subscription.cancelSubscription")}
                  </Button>
                )
              ) : (
                <Button 
                  onClick={() => handleUpgrade(plan.value)} 
                  className="w-full"
                  disabled={plan.value === "free"}
                >
                  {plan.value === "free" ? t("subscription.currentBadge") : t("subscription.upgrade")}
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>{t("subscription.binderTitle")}</CardTitle>
          <CardDescription>
            {t("subscription.binderDescription")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="aspect-video w-full overflow-hidden rounded-lg mb-4">
            <img 
              src={binderImage} 
              alt={t("subscription.binderTitle")}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold">{t("subscription.binderPrice")}</span>
              <span className="text-sm text-muted-foreground">{t("subscription.plusShipping")}</span>
            </div>
            <ul className="space-y-2 mt-4">
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <span className="text-sm">{t("subscription.binderFeature1")}</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <span className="text-sm">{t("subscription.binderFeature2")}</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <span className="text-sm">{t("subscription.binderFeature3")}</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <span className="text-sm">{t("subscription.binderFeature4")}</span>
              </li>
            </ul>
          </div>
          <Button className="w-full" onClick={() => toast({
            title: t("subscription.comingSoon"),
            description: t("subscription.binderComingSoon"),
          })}>
            {t("subscription.orderNow")}
          </Button>
        </CardContent>
      </Card>

      {subscriptionData && subscriptionData.current_period_end && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>{t("subscription.subscriptionDetails")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t("subscription.statusLabel")}</span>
                <Badge variant={subscriptionData.status === "active" ? "default" : "secondary"}>
                  {subscriptionData.status}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t("subscription.periodEndsLabel")}</span>
                <span>{new Date(subscriptionData.current_period_end).toLocaleDateString()}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
