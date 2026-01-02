import { QrCode, BookOpen } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface BinderCompanionBannerProps {
  className?: string;
}

/**
 * Explains the QR code binder companion feature.
 * Shows once to reassure seniors they can use both paper and digital.
 */
export const BinderCompanionBanner = ({ className = "" }: BinderCompanionBannerProps) => {
  return (
    <Card className={`border-primary/20 bg-primary/5 ${className}`}>
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
            <QrCode className="h-6 w-6 text-primary" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Using the Printed Binder?
            </h3>
            <p className="text-base text-muted-foreground leading-relaxed">
              If you use the printed binder, each section includes a QR code. 
              Scan it with your phone to update that section here anytime. 
              Your paper and digital plans stay in sync.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
