import { AlertCircle, RefreshCw, Phone, ExternalLink, WifiOff, Eye, FileQuestion } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type EmptyStateReason = 
  | "load-failed"
  | "read-only"
  | "opens-new-page"
  | "slow-connection"
  | "restricted"
  | "not-found";

interface ErrorPanelProps {
  title?: string;
  message?: string;
  reason?: EmptyStateReason;
  onRetry?: () => void;
  showCallUs?: boolean;
  phoneNumber?: string;
  externalLink?: string;
  externalLinkLabel?: string;
}

const REASON_MESSAGES: Record<EmptyStateReason, { title: string; message: string; icon: typeof AlertCircle }> = {
  "load-failed": {
    title: "This did not load.",
    message: "Please try again. If it still does not work, call us and we will help.",
    icon: AlertCircle,
  },
  "read-only": {
    title: "You're viewing the planner.",
    message: "Choose a plan to save your work.",
    icon: Eye,
  },
  "opens-new-page": {
    title: "This content opens in a new page.",
    message: "Click the button below to view this guide for the best viewing experience.",
    icon: ExternalLink,
  },
  "slow-connection": {
    title: "Your internet connection may be slow.",
    message: "Please check your connection and try again.",
    icon: WifiOff,
  },
  "restricted": {
    title: "This section is not available right now.",
    message: "Choose a plan to access this content.",
    icon: Eye,
  },
  "not-found": {
    title: "This content could not be found.",
    message: "The page or resource you're looking for may have been moved.",
    icon: FileQuestion,
  },
};

/**
 * Senior-friendly empty state panel with large text and clear actions.
 * RULE: Never show empty states without explanation.
 * Always shows: explanation, Try Again button, and Call Us button.
 */
export const ErrorPanel = ({
  title,
  message,
  reason = "load-failed",
  onRetry,
  showCallUs = true,
  phoneNumber = "1-800-555-0123",
  externalLink,
  externalLinkLabel = "Open guide",
}: ErrorPanelProps) => {
  const reasonConfig = REASON_MESSAGES[reason];
  const Icon = reasonConfig.icon;
  const displayTitle = title || reasonConfig.title;
  const displayMessage = message || reasonConfig.message;

  return (
    <Card className="border-2 border-muted bg-muted/10">
      <CardContent className="p-8 text-center space-y-6">
        <div className="flex justify-center">
          <div className="w-20 h-20 rounded-full bg-muted/30 flex items-center justify-center">
            <Icon className="h-10 w-10 text-muted-foreground" />
          </div>
        </div>
        
        <div className="space-y-3">
          <h3 className="text-xl font-bold text-foreground">{displayTitle}</h3>
          <p className="text-base text-muted-foreground leading-relaxed max-w-md mx-auto">
            {displayMessage}
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          {/* External link button for "opens-new-page" reason */}
          {externalLink && (
            <Button 
              size="lg" 
              asChild
              className="min-w-[180px] h-14 text-base gap-2"
            >
              <a href={externalLink} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-5 w-5" />
                {externalLinkLabel}
              </a>
            </Button>
          )}

          {onRetry && (
            <Button 
              onClick={onRetry} 
              size="lg" 
              variant={externalLink ? "outline" : "default"}
              className="min-w-[160px] h-14 text-base gap-2"
            >
              <RefreshCw className="h-5 w-5" />
              Try again
            </Button>
          )}
          
          {showCallUs && (
            <Button 
              variant="outline" 
              size="lg" 
              asChild
              className="min-w-[160px] h-14 text-base gap-2"
            >
              <a href={`tel:${phoneNumber.replace(/[^0-9]/g, '')}`}>
                <Phone className="h-5 w-5" />
                Call us
              </a>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};