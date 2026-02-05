import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { HelpCircle, X, MessageCircle, Users } from "lucide-react";
import { useAssistedHelpTrigger } from "@/hooks/useAssistedHelpTrigger";
import { cn } from "@/lib/utils";

interface AssistedHelpTriggerProps {
  /** Whether this is a read-only/printable page */
  isReadOnly?: boolean;
  /** Additional class names */
  className?: string;
}

/**
 * Non-intrusive assisted help trigger component
 * 
 * Shows a calm, supportive message when users appear stuck.
 * Positioned at bottom-right, does not dim screen or interrupt.
 * 
 * Trigger conditions:
 * - Time-based: User idle for 3-5 minutes (admin configurable)
 * - Incomplete section: User attempts to move with empty fields
 * - Manual: User clicks "Need help?" button
 */
export function AssistedHelpTrigger({ 
  isReadOnly = false,
  className 
}: AssistedHelpTriggerProps) {
  const {
    isVisible,
    hasDismissed,
    config,
    configLoaded,
    dismiss,
    triggerManually,
  } = useAssistedHelpTrigger({ isReadOnly });

  // Don't render anything if disabled, dismissed, or read-only
  if (!configLoaded || !config.enabled || isReadOnly) {
    return null;
  }

  return (
    <>
      {/* Manual trigger button - always visible unless dismissed */}
      {!hasDismissed && !isVisible && (
        <button
          onClick={triggerManually}
          className={cn(
            "fixed bottom-24 right-4 z-40",
            "flex items-center gap-2 px-3 py-2",
            "bg-muted/90 hover:bg-muted border border-border rounded-full",
            "text-sm text-muted-foreground hover:text-foreground",
            "transition-colors shadow-sm",
            "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
            className
          )}
          aria-label="Get help filling out this form"
        >
          <HelpCircle className="h-4 w-4" />
          <span className="hidden sm:inline">Need help?</span>
        </button>
      )}

      {/* Helper panel - shown when triggered */}
      {isVisible && (
        <div
          role="complementary"
          aria-label="Help options"
          className={cn(
            "fixed bottom-24 right-4 z-50",
            "w-[calc(100vw-2rem)] max-w-sm",
            "animate-in slide-in-from-bottom-4 fade-in duration-300",
            className
          )}
        >
          <Card className="border-primary/20 shadow-lg">
            <CardContent className="p-4 sm:p-6">
              {/* Dismiss button */}
              <button
                onClick={dismiss}
                className={cn(
                  "absolute top-3 right-3",
                  "p-1 rounded-full hover:bg-muted",
                  "text-muted-foreground hover:text-foreground",
                  "focus:outline-none focus:ring-2 focus:ring-ring"
                )}
                aria-label="Dismiss help panel"
              >
                <X className="h-4 w-4" />
              </button>

              {/* Message */}
              <div className="pr-6 mb-4">
                <h3 className="text-lg font-semibold mb-2">
                  Would you like help filling this out?
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  Claire can guide you, or a person can help you complete it.
                </p>
              </div>

              {/* Action buttons */}
              <div className="space-y-2">
                <Button
                  asChild
                  className="w-full min-h-[44px] justify-start gap-3"
                  variant="default"
                >
                  <Link to="/assisted-planning">
                    <Users className="h-5 w-5" />
                    Get help
                  </Link>
                </Button>

                <Button
                  asChild
                  className="w-full min-h-[44px] justify-start gap-3"
                  variant="outline"
                >
                  <Link to="/vip-planning-support">
                    <MessageCircle className="h-5 w-5" />
                    Work with Claire
                  </Link>
                </Button>

                <Button
                  onClick={dismiss}
                  variant="ghost"
                  className="w-full min-h-[44px] text-muted-foreground"
                >
                  Continue on my own
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}

export default AssistedHelpTrigger;
