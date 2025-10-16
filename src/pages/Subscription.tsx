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

    // Check if master account
    if (user.email === "califnena@gmail.com") {
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
      </div>

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

      <div className="grid md:grid-cols-3 gap-6">
        {[PLANS.BASIC_ANNUAL, PLANS.PREMIUM_ANNUAL, PLANS.VIP_ANNUAL].map((p) => {
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
                {isCurrentPlan ? (
                  <Button 
                    variant="destructive" 
                    className="w-full" 
                    onClick={() => setShowCancelDialog(true)}
                  >
                    Cancel Plan
                  </Button>
                ) : (
                  <Button 
                    className="w-full" 
                    onClick={() => open(p.payLink)}
                    disabled={hasActiveSubscription}
                  >
                    {hasActiveSubscription ? "Already Subscribed" : "Subscribe"}
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid md:grid-cols-2 gap-6 mt-8">
        {[PLANS.VIP_MONTHLY, PLANS.BINDER].map((p) => {
          const isCurrentPlan = currentPlanKey === p.key;
          const isSubscription = p.key !== "fireproof_binder";
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
                {p.key === "fireproof_binder" && (
                  <div className="aspect-video w-full overflow-hidden rounded-lg mb-4">
                    <img 
                      src={binderImage} 
                      alt={p.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <ul className="space-y-1 mb-4 list-disc pl-5">
                  {p.features.map((f) => <li key={f} className="text-sm">{f}</li>)}
                </ul>
                {isCurrentPlan ? (
                  <Button 
                    variant="destructive" 
                    className="w-full" 
                    onClick={() => setShowCancelDialog(true)}
                  >
                    Cancel Plan
                  </Button>
                ) : (
                  <Button 
                    className="w-full" 
                    onClick={() => open(p.payLink)}
                    disabled={isSubscription && hasActiveSubscription}
                  >
                    {isSubscription && hasActiveSubscription ? "Already Subscribed" : "Buy"}
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}

        <Card className="rounded-2xl shadow-sm">
          <CardHeader>
            <CardTitle>{PLANS.DO_IT_FOR_YOU.name}</CardTitle>
            <div className="text-xl font-semibold text-muted-foreground">{PLANS.DO_IT_FOR_YOU.price}</div>
            {PLANS.DO_IT_FOR_YOU.description && (
              <CardDescription className="mt-2 text-sm">{PLANS.DO_IT_FOR_YOU.description}</CardDescription>
            )}
          </CardHeader>
          <CardContent>
            <ul className="space-y-1 mb-4 list-disc pl-5">
              {PLANS.DO_IT_FOR_YOU.features.map((f) => <li key={f} className="text-sm">{f}</li>)}
            </ul>
            <Button className="w-full" onClick={() => open(PLANS.DO_IT_FOR_YOU.payLink)}>
              Book Session
            </Button>
          </CardContent>
        </Card>
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
