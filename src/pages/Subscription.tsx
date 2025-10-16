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
import { PLANS, withPromo } from "@/lib/plans";

export default function Subscription() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/login");
        return;
      }
      setLoading(false);
    };

    checkAuth();
  }, [navigate]);

  const open = (url: string) => window.open(url, "_blank", "noopener,noreferrer");

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

      <div className="grid md:grid-cols-3 gap-6">
        {[PLANS.BASIC_ANNUAL, PLANS.PREMIUM_ANNUAL, PLANS.VIP_ANNUAL].map((p) => (
          <Card key={p.key} className="rounded-2xl shadow-sm">
            <CardHeader>
              <CardTitle>{p.name}</CardTitle>
              <div className="text-xl font-semibold text-muted-foreground">{p.price}</div>
              {p.description && (
                <CardDescription className="mt-2 text-sm">{p.description}</CardDescription>
              )}
            </CardHeader>
            <CardContent>
              <ul className="space-y-1 mb-4 list-disc pl-5">
                {p.features.map((f) => <li key={f} className="text-sm">{f}</li>)}
              </ul>
              <div className="flex gap-2">
                <Button className="w-full" onClick={() => open(p.payLink)}>Subscribe</Button>
                <Button variant="outline" className="w-full" onClick={() => open(withPromo(p.payLink))}>
                  Apply EFA10
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6 mt-8">
        {[PLANS.VIP_MONTHLY, PLANS.BINDER].map((p) => (
          <Card key={p.key} className="rounded-2xl shadow-sm">
            <CardHeader>
              <CardTitle>{p.name}</CardTitle>
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
              <div className="flex gap-2">
                <Button className="w-full" onClick={() => open(p.payLink)}>Buy</Button>
                <Button variant="outline" className="w-full" onClick={() => open(withPromo(p.payLink))}>
                  Apply EFA10
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

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
            <div className="flex gap-2">
              <Button className="w-full" onClick={() => open(PLANS.DO_IT_FOR_YOU.payLink)}>Book Session</Button>
              <Button variant="outline" className="w-full" onClick={() => open(withPromo(PLANS.DO_IT_FOR_YOU.payLink))}>
                Apply EFA10
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
