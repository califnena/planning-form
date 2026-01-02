import { AlertCircle, RefreshCw, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface ErrorPanelProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  showCallUs?: boolean;
  phoneNumber?: string;
}

/**
 * Senior-friendly error panel with large text and clear actions.
 * Shows: explanation, Try Again button, and Call Us button.
 */
export const ErrorPanel = ({
  title = "Something did not load.",
  message = "Please try again. If it still does not work, call us and we will help.",
  onRetry,
  showCallUs = true,
  phoneNumber = "1-800-555-0123", // Replace with actual support number
}: ErrorPanelProps) => {
  return (
    <Card className="border-2 border-destructive/30 bg-destructive/5">
      <CardContent className="p-8 text-center space-y-6">
        <div className="flex justify-center">
          <AlertCircle className="h-16 w-16 text-destructive" />
        </div>
        
        <div className="space-y-3">
          <h3 className="text-xl font-bold text-foreground">{title}</h3>
          <p className="text-base text-muted-foreground leading-relaxed max-w-md mx-auto">
            {message}
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          {onRetry && (
            <Button 
              onClick={onRetry} 
              size="lg" 
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