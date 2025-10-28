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
import { PLANS } from "@/lib/plans";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function Subscription() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [currentSubscription, setCurrentSubscription] = useState<any>(null);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [isMasterAccount, setIsMasterAccount] = useState(false);

  const loadSubscription = async () => {
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
      setLoading(false);
      return;
    }

    const { data: subscription } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", user.id)
      .single();

    setCurrentSubscription(subscription);
    setLoading(false);
  };

  useEffect(() => {
    loadSubscription();
  }, [navigate]);

  const open = (url: string) => window.open(url, "_blank", "noopener,noreferrer");

  const PLAN_LOOKUP: Record<string, { envKey: string; mode: "subscription" | "payment" }> = {
    [PLANS.BASIC_ANNUAL.key]: { envKey: "STRIPE_LOOKUP_BASIC", mode: "subscription" },
    [PLANS.PREMIUM_ANNUAL.key]: { envKey: "STRIPE_LOOKUP_PREMIUM_YEAR", mode: "subscription" },
    [PLANS.VIP_ANNUAL.key]: { envKey: "STRIPE_LOOKUP_VIP_YEAR", mode: "subscription" },
    [PLANS.VIP_MONTHLY.key]: { envKey: "STRIPE_LOOKUP_VIP_MONTHLY", mode: "subscription" },
    [PLANS.BINDER.key]: { envKey: "STRIPE_LOOKUP_BINDER", mode: "payment" },
    [PLANS.DO_IT_FOR_YOU.key]: { envKey: "STRIPE_LOOKUP_DIFY", mode: "payment" },
  };

  const handleCheckout = async (planKey: string) => {
    try {
      const successUrl = `${window.location.origin}/subscription?status=success`;
      const cancelUrl = `${window.location.origin}/subscription?status=cancel`;
      const mapping = PLAN_LOOKUP[planKey];
      if (!mapping) {
        toast({ title: "Checkout error", description: "Unknown plan.", variant: "destructive" });
        return;
      }
      const { data, error } = await supabase.functions.invoke("stripe-create-checkout", {
        body: {
          planKey: mapping.envKey,
          mode: mapping.mode,
          successUrl,
          cancelUrl,
          allowPromotionCodes: true,
          trialDays: 1,
        },
      });
      if (error) throw error;
      if (data?.url) {
        window.location.href = data.url as string;
      } else {
        throw new Error("Invalid checkout response");
      }
    } catch (err) {
      console.error(err);
      toast({ title: "Checkout error", description: "Failed to start checkout. Try again.", variant: "destructive" });
    }
  };

  const handleCancelSubscription = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from("subscriptions")
        .update({ status: "canceled" })
        .eq("user_id", user.id);

      if (error) throw error;

      toast({
        title: "Subscription Cancelled",
        description: "Your subscription has been cancelled successfully.",
      });

      setCurrentSubscription(null);
      setShowCancelDialog(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to cancel subscription. Please try again.",
        variant: "destructive",
      });
    }
  };

  const hasActiveSubscription = currentSubscription && currentSubscription.status === "active";
  const currentPlanKey = currentSubscription?.plan_type;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const handleStartTrial = () => {
    toast({
      title: "Trial Starting Soon",
      description: "The 1-day trial feature will be available shortly. Stay tuned!",
    });
  };

  return (
    <div className="container mx-auto py-10">
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
        <p className="text-sm text-muted-foreground mt-2">
          Subscriptions are paid in advance, per user. 1-day trial available.
        </p>
      </div>

      {/* Trial Call-to-Action */}
      {!hasActiveSubscription && !isMasterAccount && (
        <Card className="mb-8 border-primary bg-gradient-to-r from-primary/10 to-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Try It Free for 1 Day
            </CardTitle>
            <CardDescription>
              Experience all features with no commitment. Start your free 1-day trial now and unlock full access to the planner.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleStartTrial} size="lg" className="w-full sm:w-auto">
              Start 1-Day Trial
            </Button>
          </CardContent>
        </Card>
      )}

      {isMasterAccount && (
        <Card className="mb-6 border-primary bg-gradient-to-r from-primary/5 to-primary/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Check className="h-5 w-5 text-primary" />
              Master Account - Full Access
            </CardTitle>
            <CardDescription>
              Your account has unlimited access to all features without requiring a subscription.
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      {/* Current Subscription Status */}
      {hasActiveSubscription && (
        <Card className="mb-8 border-primary">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-primary" />
                  Active Subscription
                </CardTitle>
                <CardDescription className="mt-1">
                  You're currently subscribed to {PLANS[currentPlanKey.toUpperCase() as keyof typeof PLANS]?.name || currentPlanKey}
                </CardDescription>
              </div>
              <Button 
                variant="outline" 
                onClick={() => setShowCancelDialog(true)}
                className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
              >
                Cancel Subscription
              </Button>
            </div>
          </CardHeader>
        </Card>
      )}

      {/* Subscription Plans */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Subscription Plans</h2>
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {[PLANS.BASIC_ANNUAL, PLANS.PREMIUM_ANNUAL].map((p) => {
            const isCurrentPlan = currentPlanKey === p.key;
            return (
              <Card key={p.key} className={`rounded-2xl shadow-sm ${isCurrentPlan ? "border-primary border-2" : ""}`}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>{p.name}</CardTitle>
                    {isCurrentPlan && <Badge>Current Plan</Badge>}
                  </div>
                  <div className="text-xl font-semibold text-muted-foreground">{p.price}</div>
                  {p.description && (
                    <CardDescription className="mt-2 text-sm">{p.description}</CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <ul className="space-y-1 mb-4 list-disc pl-5">
                    {p.features.map((f) => <li key={f} className="text-sm">{f}</li>)}
                  </ul>
                  <Button 
                    className="w-full" 
                    onClick={() => handleCheckout(p.key)}
                    disabled={hasActiveSubscription}
                  >
                    {hasActiveSubscription ? "Already Subscribed" : "Subscribe"}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* VIP Plans */}
        <Card className="rounded-2xl shadow-sm border-primary border-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              VIP Plans
              <Badge variant="secondary">Most Popular</Badge>
            </CardTitle>
            <CardDescription className="mt-2">
              Experience complete peace of mind with 24/7 guided planning and emotional support. Includes everything in Premium plus access to a compassionate, AI-powered coach for personalized guidance through end-of-life planning, organization, and coping.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-1 mb-6 list-disc pl-5">
              <li className="text-sm">Everything in Premium</li>
              <li className="text-sm">24/7 guided planning & coping coach (AI-powered)</li>
            </ul>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold">Annual Plan</h4>
                  {currentPlanKey === PLANS.VIP_ANNUAL.key && <Badge>Current</Badge>}
                </div>
                <div className="text-2xl font-bold text-primary mb-4">{PLANS.VIP_ANNUAL.price}</div>
                <Button 
                  className="w-full" 
                  onClick={() => handleCheckout(PLANS.VIP_ANNUAL.key)}
                  disabled={hasActiveSubscription}
                >
                  {hasActiveSubscription ? "Already Subscribed" : "Subscribe Annual"}
                </Button>
              </div>
              
              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold">Monthly Plan</h4>
                  {currentPlanKey === PLANS.VIP_MONTHLY.key && <Badge>Current</Badge>}
                </div>
                <div className="text-2xl font-bold text-primary mb-4">{PLANS.VIP_MONTHLY.price}</div>
                <Button 
                  className="w-full" 
                  onClick={() => handleCheckout(PLANS.VIP_MONTHLY.key)}
                  disabled={hasActiveSubscription}
                >
                  {hasActiveSubscription ? "Already Subscribed" : "Subscribe Monthly"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Premium Services */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Premium Services</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="rounded-2xl shadow-sm">
            <CardHeader>
              <CardTitle>{PLANS.BINDER.name}</CardTitle>
              <div className="text-xl font-semibold text-muted-foreground">{PLANS.BINDER.price}</div>
            </CardHeader>
            <CardContent>
              <div className="aspect-video w-full overflow-hidden rounded-lg mb-4">
                <img 
                  src={binderImage} 
                  alt={PLANS.BINDER.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <ul className="space-y-1 mb-4 list-disc pl-5">
                {PLANS.BINDER.features.map((f) => <li key={f} className="text-sm">{f}</li>)}
              </ul>
              <Button className="w-full" onClick={() => handleCheckout(PLANS.BINDER.key)}>
                Order Binder
              </Button>
            </CardContent>
          </Card>

          <Card className="rounded-2xl shadow-sm border-primary border-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {PLANS.DO_IT_FOR_YOU.name}
                <Badge variant="secondary">Popular</Badge>
              </CardTitle>
              <div className="text-xl font-semibold text-muted-foreground">{PLANS.DO_IT_FOR_YOU.price}</div>
              {PLANS.DO_IT_FOR_YOU.description && (
                <CardDescription className="mt-2 text-sm">{PLANS.DO_IT_FOR_YOU.description}</CardDescription>
              )}
            </CardHeader>
            <CardContent>
              <ul className="space-y-1 mb-4 list-disc pl-5">
                {PLANS.DO_IT_FOR_YOU.features.map((f) => <li key={f} className="text-sm">{f}</li>)}
              </ul>
              <Button className="w-full" asChild>
                <a href="https://calendar.app.google/2PVUy1ZuajWR1VaZ7" target="_blank" rel="noopener noreferrer">
                  Book Appointment
                </a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Subscription</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel your subscription? You will lose access to all premium features at the end of your billing period.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Subscription</AlertDialogCancel>
            <AlertDialogAction onClick={handleCancelSubscription} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Cancel Subscription
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
