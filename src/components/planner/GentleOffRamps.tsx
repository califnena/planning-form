import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Handshake, BookOpen, MessageCircle } from "lucide-react";
import { useAuthState } from "@/hooks/useAuthState";
import { useSubscriptionStatus } from "@/hooks/useSubscriptionStatus";

interface GentleOffRampsProps {
  onTalkToClaire?: () => void;
}

export const GentleOffRamps = ({ onTalkToClaire }: GentleOffRampsProps) => {
  const navigate = useNavigate();
  const { user } = useAuthState();
  const { hasActiveSubscription } = useSubscriptionStatus(user?.id);

  const handleTalkToClaire = () => {
    if (hasActiveSubscription && onTalkToClaire) {
      onTalkToClaire();
    } else {
      navigate('/care-support');
    }
  };

  return (
    <div className="mt-12 pt-8 border-t border-border">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Section Header */}
        <div className="text-center space-y-2">
          <h2 className="text-xl font-semibold text-foreground">
            If this feels like a lot, you have options
          </h2>
          <p className="text-muted-foreground text-sm max-w-lg mx-auto">
            Some people prefer extra help or a physical copy.
            These options are available anytime. You don't need to decide now.
          </p>
        </div>

        {/* Option Cards */}
        <div className="grid md:grid-cols-2 gap-4">
          {/* Do-It-For-You Card */}
          <Card className="border-2 border-border hover:border-primary/30 transition-colors">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Handshake className="h-5 w-5 text-primary" />
                </div>
                <CardTitle className="text-lg">Have Us Help You</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground leading-relaxed">
                We help you organize your wishes and complete the planning with you.
                Someone will guide you step by step.
              </p>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => navigate('/do-it-for-you')}
              >
                Learn About Do-It-For-You
              </Button>
              <p className="text-xs text-muted-foreground text-center">
                You can come back to this later.
              </p>
            </CardContent>
          </Card>

          {/* Physical Binder Card */}
          <Card className="border-2 border-border hover:border-primary/30 transition-colors">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <BookOpen className="h-5 w-5 text-primary" />
                </div>
                <CardTitle className="text-lg">Get a Physical Planning Binder</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground leading-relaxed">
                A printed binder to keep your planning information organized in one place.
                Helpful for sharing with family.
              </p>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => navigate('/product-binder')}
              >
                View Binder Details
              </Button>
              <p className="text-xs text-muted-foreground text-center">
                Optional. Does not replace digital planning.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Claire Help Link */}
        <div className="text-center pt-4">
          <button
            onClick={handleTalkToClaire}
            className="inline-flex items-center gap-2 text-sm text-primary hover:text-primary/80 hover:underline transition-colors"
          >
            <MessageCircle className="h-4 w-4" />
            Need help deciding? Talk to Claire
          </button>
        </div>

        {/* Final Reassurance */}
        <p className="text-center text-xs text-muted-foreground pt-2">
          You're always in control. You can continue planning, pause, or ask for help anytime.
        </p>
      </div>
    </div>
  );
};
