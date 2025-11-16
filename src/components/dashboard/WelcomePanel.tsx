import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Play, PlusCircle } from "lucide-react";

export const WelcomePanel = () => {
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
          {/* Greeting */}
          <div>
            <h2 className="text-3xl font-bold text-foreground mb-2">
              Welcome{firstName ? `, ${firstName}` : ""}
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Use this planner to organize your wishes, important contacts, and after-death 
              instructions. You can work at your own pace and save as you go.
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
              Continue where I left off
            </Button>
            <Button 
              onClick={handleStartNew}
              variant="outline"
              size="lg"
              className="flex-1 gap-2 h-14 text-base"
            >
              <PlusCircle className="h-5 w-5" />
              Start a new planner
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
