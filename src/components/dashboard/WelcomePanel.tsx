import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Play, PlusCircle } from "lucide-react";
import mascotCouple from "@/assets/mascot-couple.png";

export const WelcomePanel = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState<string>("");

  useEffect(() => {
    const loadUserName = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("id", user.id)
          .single();
        
        if (profile?.full_name) {
          const name = profile.full_name.split(" ")[0];
          setFirstName(name);
        }
      }
    };
    loadUserName();
  }, []);

  const handleContinue = () => {
    const lastSection = localStorage.getItem("efa-last-section");
    navigate(lastSection || "/app");
  };

  const handleStartNew = () => {
    navigate("/app");
  };

  return (
    <Card className="border-2">
      <CardContent className="pt-6">
        <div className="space-y-6">
          {/* Hero Banner with Slogan and Avatars */}
          <div className="flex flex-col md:flex-row items-center gap-6 pb-6 border-b">
            <div className="flex-shrink-0">
              <img 
                src={mascotCouple} 
                alt="Everlasting Advisors" 
                className="w-32 h-32 md:w-40 md:h-40 object-contain"
              />
            </div>
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-2xl md:text-4xl font-bold text-foreground mb-3">
                {t("dashboard.slogan")}
              </h1>
              <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
                {t("dashboard.heroMessage")}
              </p>
            </div>
          </div>

          {/* Greeting */}
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-2">
              {firstName ? t("dashboard.welcome", { name: firstName }) : t("dashboard.welcomeGeneric")}
            </h2>
            <p className="text-base text-muted-foreground leading-relaxed">
              {t("dashboard.subtitle")}
            </p>
          </div>

          {/* Primary Actions */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Button 
              onClick={handleContinue}
              size="lg"
              className="flex-1 gap-2 h-14 text-base"
            >
              <Play className="h-5 w-5" />
              {t("dashboard.continueButton")}
            </Button>
            <Button 
              onClick={handleStartNew}
              variant="outline"
              size="lg"
              className="flex-1 gap-2 h-14 text-base"
            >
              <PlusCircle className="h-5 w-5" />
              {t("dashboard.startNewButton")}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
