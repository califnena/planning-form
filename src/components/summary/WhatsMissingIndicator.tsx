import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Info, CheckCircle2, ArrowRight } from "lucide-react";

interface MissingSection {
  id: string;
  name: string;
  status: string;
  actionLabel: string;
}

interface WhatsMissingIndicatorProps {
  missingSections: MissingSection[];
  onNavigateToSection: (sectionId: string) => void;
}

export const WhatsMissingIndicator = ({
  missingSections,
  onNavigateToSection,
}: WhatsMissingIndicatorProps) => {
  const isComplete = missingSections.length === 0;

  if (isComplete) {
    return (
      <Card className="bg-green-50/50 dark:bg-green-950/20 border-green-200 dark:border-green-800">
        <CardContent className="py-4">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
            <div>
              <p className="font-medium text-green-800 dark:text-green-200">
                Your planning summary looks complete
              </p>
              <p className="text-sm text-green-700 dark:text-green-300">
                You can still make changes anytime.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-muted/30 border-border">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Info className="h-4 w-4 text-muted-foreground" />
          What you may want to add
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          You can complete these anytime. All sections are optional.
        </p>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-2">
          {missingSections.map((section) => (
            <div
              key={section.id}
              className="flex items-center justify-between p-3 bg-background rounded-lg border hover:border-primary/50 transition-colors"
            >
              <div>
                <p className="text-sm font-medium">{section.name}</p>
                <p className="text-xs text-muted-foreground">{section.status}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onNavigateToSection(section.id)}
                className="gap-1 text-primary hover:text-primary"
              >
                {section.actionLabel}
                <ArrowRight className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
