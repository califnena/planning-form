import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, Info } from "lucide-react";

interface LegalDisclaimerProps {
  variant?: "prominent" | "compact";
  className?: string;
}

/**
 * Standard legal disclaimer component used across Resources, Guides, and Legal Info pages.
 * Ensures consistent messaging that this app does not provide legal, financial, or medical advice.
 */
export const LegalDisclaimer = ({ variant = "prominent", className = "" }: LegalDisclaimerProps) => {
  if (variant === "compact") {
    return (
      <div className={`text-sm text-muted-foreground bg-muted/50 rounded-lg p-4 ${className}`}>
        <div className="flex items-start gap-2">
          <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <p>
            <strong>For informational purposes only.</strong> This is not legal, financial, or medical advice. 
            Consult qualified professionals for guidance specific to your situation.
          </p>
        </div>
      </div>
    );
  }

  return (
    <Alert variant="destructive" className={`border-2 ${className}`}>
      <AlertTriangle className="h-5 w-5" />
      <AlertTitle className="text-lg font-bold mb-2">Important Notice</AlertTitle>
      <AlertDescription className="text-base space-y-2">
        <p>
          <strong>This information is for educational and informational purposes only.</strong> It does not 
          constitute legal, financial, or medical advice.
        </p>
        <p>
          Every situation is different. Laws and regulations vary by state and change over time. 
          Always consult with qualified professionals (attorneys, financial advisors, healthcare providers) 
          for guidance specific to your circumstances.
        </p>
        <p className="pt-2 font-semibold">
          Using this app does not create a professional-client relationship of any kind.
        </p>
      </AlertDescription>
    </Alert>
  );
};
