import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { X, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export function PreviewModeBanner() {
  const [isDismissed, setIsDismissed] = useState(false);
  const navigate = useNavigate();

  if (isDismissed) return null;

  return (
    <Alert className="relative border-primary bg-primary/5 mb-6">
      <Lock className="h-5 w-5 text-primary" />
      <button
        onClick={() => setIsDismissed(true)}
        className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
        aria-label="Dismiss"
      >
        <X className="h-4 w-4" />
      </button>
      <AlertTitle className="text-lg font-semibold mb-2">
        You're in Preview Mode
      </AlertTitle>
      <AlertDescription className="text-sm mb-4">
        You can browse and read FAQs/Guides. Editing and PDF exports are locked. Start a 1-day trial to unlock everything.
      </AlertDescription>
      <div className="flex flex-col sm:flex-row gap-2">
        <Button 
          onClick={() => navigate("/app/profile/subscription")}
          size="sm"
        >
          Start Trial
        </Button>
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => setIsDismissed(true)}
        >
          Continue Preview
        </Button>
      </div>
    </Alert>
  );
}
