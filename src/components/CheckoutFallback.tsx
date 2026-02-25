/**
 * CheckoutFallback Component
 * 
 * Shows when Stripe checkout hangs or fails to load.
 * Provides reload and direct link options.
 */

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw, ExternalLink, Loader2 } from "lucide-react";
import { getLastCheckoutUrl } from "@/lib/checkoutLauncher";

interface CheckoutFallbackProps {
  /** Show loading state initially */
  isLoading?: boolean;
  /** Timeout in ms before showing fallback (default: 8000) */
  timeoutMs?: number;
  /** Callback when user clicks reload */
  onReload?: () => void;
  /** Whether checkout was initiated */
  checkoutStarted?: boolean;
}

export function CheckoutFallback({
  isLoading = false,
  timeoutMs = 8000,
  onReload,
  checkoutStarted = false,
}: CheckoutFallbackProps) {
  const [showFallback, setShowFallback] = useState(false);
  const [timedOut, setTimedOut] = useState(false);
  const lastCheckoutUrl = getLastCheckoutUrl();

  useEffect(() => {
    if (!checkoutStarted) return;

    const timer = setTimeout(() => {
      setTimedOut(true);
      setShowFallback(true);
    }, timeoutMs);

    return () => clearTimeout(timer);
  }, [checkoutStarted, timeoutMs]);

  // Show loading spinner if loading and not timed out
  if (isLoading && !timedOut) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Preparing secure checkout...</p>
      </div>
    );
  }

  // Show fallback if timed out or explicitly shown
  if (!showFallback && !timedOut) {
    return null;
  }

  const handleReload = () => {
    if (onReload) {
      onReload();
    } else {
      window.location.reload();
    }
  };

  const handleOpenCheckout = () => {
    if (lastCheckoutUrl) {
      window.open(lastCheckoutUrl, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <Card className="border-2 border-muted max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="mx-auto mb-2 w-16 h-16 rounded-full bg-muted/30 flex items-center justify-center">
          <AlertTriangle className="h-8 w-8 text-muted-foreground" />
        </div>
        <CardTitle className="text-foreground">
          We're sorry.
        </CardTitle>
        <CardDescription className="text-base text-muted-foreground leading-relaxed">
          Something unexpected happened. Our team has been notified and is already reviewing the issue.
          You may try again in a few minutes.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col gap-2 pt-2">
          <Button onClick={handleReload} className="w-full h-14 text-base" variant="default">
            <RefreshCw className="h-5 w-5 mr-2" />
            Try again
          </Button>
          
          {lastCheckoutUrl && (
            <Button onClick={handleOpenCheckout} className="w-full h-14 text-base" variant="outline">
              <ExternalLink className="h-5 w-5 mr-2" />
              Open Checkout in New Tab
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
