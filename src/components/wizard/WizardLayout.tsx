import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ChevronLeft, ChevronRight, Home } from "lucide-react";
import { useAccessibility } from "@/contexts/AccessibilityContext";
import { cn } from "@/lib/utils";

interface WizardLayoutProps {
  currentStep: number;
  totalSteps: number;
  stepTitle: string;
  stepSubtitle: string;
  children: ReactNode;
  onBack: () => void;
  onNext: () => void;
  onExit: () => void;
  canGoBack: boolean;
  canGoNext: boolean;
  mode: "preplanning" | "afterdeath";
}

export const WizardLayout = ({
  currentStep,
  totalSteps,
  stepTitle,
  stepSubtitle,
  children,
  onBack,
  onNext,
  onExit,
  canGoBack,
  canGoNext,
  mode,
}: WizardLayoutProps) => {
  const { superSeniorMode } = useAccessibility();
  const progress = (currentStep / totalSteps) * 100;

  const modeTitle = mode === "preplanning" 
    ? "My Final Wishes – Step-by-Step Guide"
    : "After-Death Steps – Step-by-Step Guide";

  const modeColor = mode === "afterdeath" 
    ? "bg-orange-500 dark:bg-orange-600"
    : "bg-primary";

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Wizard Header */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h1 className={cn(
              "font-semibold",
              superSeniorMode ? "text-3xl" : "text-2xl"
            )}>
              {modeTitle}
            </h1>
            <Button
              variant="outline"
              onClick={onExit}
              className={cn(superSeniorMode && "h-12 px-6 text-lg")}
            >
              <Home className="h-4 w-4 mr-2" />
              Exit to Dashboard
            </Button>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>Step {currentStep} of {totalSteps}</span>
              <span>{Math.round(progress)}% Complete</span>
            </div>
            <Progress value={progress} className="h-3" />
          </div>

          {/* Step Header */}
          <div className="space-y-1">
            <h2 className={cn(
              "font-semibold",
              superSeniorMode ? "text-2xl" : "text-xl"
            )}>
              {stepTitle}
            </h2>
            <p className={cn(
              "text-muted-foreground",
              superSeniorMode ? "text-lg" : "text-base"
            )}>
              {stepSubtitle}
            </p>
          </div>
        </div>

        {/* Step Content */}
        <div className={cn(
          "bg-card border rounded-lg p-6",
          mode === "afterdeath" && "border-orange-200 dark:border-orange-900"
        )}>
          {children}
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between gap-4 pt-4 border-t">
          <Button
            variant="outline"
            onClick={onBack}
            disabled={!canGoBack}
            className={cn(superSeniorMode && "h-12 px-6 text-lg")}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back
          </Button>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={onExit}
              className={cn(superSeniorMode && "h-12 px-6 text-lg")}
            >
              Save and Exit
            </Button>
            <Button
              onClick={onNext}
              disabled={!canGoNext}
              className={cn(
                superSeniorMode && "h-12 px-6 text-lg",
                mode === "afterdeath" && modeColor
              )}
            >
              Save and Continue
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
