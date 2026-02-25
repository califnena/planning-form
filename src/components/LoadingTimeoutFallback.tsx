import { AlertCircle, RefreshCw, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface LoadingTimeoutFallbackProps {
  onRetry?: () => void;
}

/**
 * Friendly fallback shown when a page takes too long to load.
 * No technical details are shown to the user.
 */
export const LoadingTimeoutFallback = ({ onRetry }: LoadingTimeoutFallbackProps) => {
  const handleRetry = onRetry || (() => window.location.reload());

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-6">
      <Card className="max-w-md w-full border-2 border-muted">
        <CardContent className="p-8 text-center space-y-6">
          <div className="flex justify-center">
            <div className="w-20 h-20 rounded-full bg-muted/30 flex items-center justify-center">
              <AlertCircle className="h-10 w-10 text-muted-foreground" />
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-xl font-bold text-foreground">
              We're sorry.
            </h3>
            <p className="text-base text-muted-foreground leading-relaxed">
              Something unexpected happened.
            </p>
            <p className="text-base text-muted-foreground leading-relaxed">
              Our team has been notified and is already reviewing the issue.
              You may try again in a few minutes.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={handleRetry}
              size="lg"
              className="min-w-[160px] h-14 text-base gap-2"
            >
              <RefreshCw className="h-5 w-5" />
              Try again
            </Button>
            <Button
              variant="outline"
              size="lg"
              asChild
              className="min-w-[160px] h-14 text-base gap-2"
            >
              <a href="tel:18005550123">
                <Phone className="h-5 w-5" />
                Call us
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
