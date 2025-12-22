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
    <Card className="border-amber-300 bg-amber-50/50 dark:bg-amber-950/20 max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="mx-auto mb-2">
          <AlertTriangle className="h-10 w-10 text-amber-600" />
        </div>
        <CardTitle className="text-amber-800 dark:text-amber-200">
          Secure checkout did not load
        </CardTitle>
        <CardDescription className="text-amber-700 dark:text-amber-300">
          Your browser may have blocked the secure checkout screen. This is usually caused by:
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <ul className="text-sm text-amber-700 dark:text-amber-300 space-y-1 list-disc list-inside">
          <li>Ad blockers or privacy extensions</li>
          <li>Safari's Intelligent Tracking Prevention</li>
          <li>VPN or network restrictions</li>
          <li>iCloud Private Relay</li>
        </ul>

        <div className="flex flex-col gap-2 pt-2">
          <Button onClick={handleReload} className="w-full" variant="default">
            <RefreshCw className="h-4 w-4 mr-2" />
            Reload Page
          </Button>
          
          {lastCheckoutUrl && (
            <Button onClick={handleOpenCheckout} className="w-full" variant="outline">
              <ExternalLink className="h-4 w-4 mr-2" />
              Open Checkout in New Tab
            </Button>
          )}
        </div>

        <p className="text-xs text-center text-muted-foreground pt-2">
          Try disabling ad blockers for this site, or open in Chrome if using Safari.
        </p>
      </CardContent>
    </Card>
  );
}
