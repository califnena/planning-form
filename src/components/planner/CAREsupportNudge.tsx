import { useState, useEffect } from "react";
import { X, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuthState } from "@/hooks/useAuthState";
import { useSubscriptionStatus } from "@/hooks/useSubscriptionStatus";

interface CARESupportNudgeProps {
  onTalkToClaire?: () => void;
}

export const CARESupportNudge = ({ onTalkToClaire }: CARESupportNudgeProps) => {
  const navigate = useNavigate();
  const { user } = useAuthState();
  const { hasActiveSubscription } = useSubscriptionStatus(user?.id);
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  // Show after 90 seconds of being on the page
  useEffect(() => {
    const dismissed = sessionStorage.getItem('care_nudge_dismissed');
    if (dismissed) {
      setIsDismissed(true);
      return;
    }

    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 90000); // 90 seconds

    return () => clearTimeout(timer);
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    setIsDismissed(true);
    sessionStorage.setItem('care_nudge_dismissed', 'true');
  };

  const handleTalkToClaire = () => {
    if (hasActiveSubscription && onTalkToClaire) {
      onTalkToClaire();
    } else {
      navigate('/care-support');
    }
    handleDismiss();
  };

  if (!isVisible || isDismissed) return null;

  return (
    <div className="fixed bottom-24 right-4 z-40 max-w-sm animate-in slide-in-from-right-5 duration-300">
      <div className="bg-card border-2 border-primary/20 rounded-xl shadow-lg p-4">
        <button
          onClick={handleDismiss}
          className="absolute top-2 right-2 p-1 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>
        
        <div className="flex items-start gap-3 pr-6">
          <div className="p-2 bg-primary/10 rounded-lg flex-shrink-0">
            <HelpCircle className="h-5 w-5 text-primary" />
          </div>
          <div className="space-y-2">
            <h4 className="font-medium text-foreground">Need a little help?</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Claire offers planning guidance, emotional support, and after-death help.
              Available 24/7, wherever you are.
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              <Button
                variant="link"
                size="sm"
                className="h-auto p-0 text-primary"
                onClick={handleTalkToClaire}
              >
                Talk to Claire
              </Button>
              <span className="text-muted-foreground">·</span>
              <Button
                variant="link"
                size="sm"
                className="h-auto p-0 text-muted-foreground hover:text-foreground"
                onClick={handleDismiss}
              >
                Not right now
              </Button>
            </div>
            <p className="text-[10px] text-muted-foreground/60 mt-1">
              Claire does not store personal details.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
