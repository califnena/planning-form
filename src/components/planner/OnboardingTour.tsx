import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, ArrowRight, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface OnboardingTourProps {
  userId: string;
  onComplete: () => void;
  activeSection: string;
}

interface TourStep {
  title: string;
  description: string;
  highlightSelector?: string;
  position: "center" | "top" | "bottom" | "left" | "right";
  action?: string;
}

const TOUR_STEPS: TourStep[] = [
  {
    title: "Welcome to Your Planning Tool",
    description: "This guided tour will show you the key features to help you get started. You can skip this tour at any time and revisit the help section later.",
    position: "center"
  },
  {
    title: "Choose Your Topics",
    description: "In Preferences, turn on only the topics that apply to you. You don't need to fill out everything - just what matters for your situation.",
    position: "center",
    action: "Look for the Preferences section in the left sidebar"
  },
  {
    title: "Your Information Saves Automatically",
    description: "As you type, everything is saved automatically. You don't need to click a save button - your work is always protected.",
    position: "center",
    action: "Just start typing in any section"
  },
  {
    title: "Get Your Document",
    description: "When you're ready, you can create a PDF of your plan. Look for the 'Download PDF' or 'Preview Planner' buttons in the left sidebar under Actions.",
    position: "center",
    action: "Find the Actions section in the left sidebar"
  },
  {
    title: "Take Your Time",
    description: "There's no rush. You can work on this over days, weeks, or months. Come back anytime and pick up where you left off.",
    position: "center"
  }
];

export const OnboardingTour = ({ userId, onComplete, activeSection }: OnboardingTourProps) => {
  const { t } = useTranslation();
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    checkIfTourNeeded();
  }, [userId]);

  const checkIfTourNeeded = async () => {
    try {
      const { data } = await supabase
        .from("user_settings")
        .select("wizard_completed")
        .eq("user_id", userId)
        .maybeSingle();

      // Show tour if wizard_completed is false or null
      if (!data?.wizard_completed) {
        setIsVisible(true);
      }
    } catch (error) {
      console.error("Error checking tour status:", error);
    }
  };

  const handleNext = () => {
    if (currentStep < TOUR_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    handleComplete();
  };

  const handleComplete = async () => {
    try {
      await supabase
        .from("user_settings")
        .upsert({
          user_id: userId,
          wizard_completed: true,
          updated_at: new Date().toISOString()
        }, {
          onConflict: "user_id"
        });

      setIsVisible(false);
      onComplete();
    } catch (error) {
      console.error("Error completing tour:", error);
      setIsVisible(false);
      onComplete();
    }
  };

  if (!isVisible) return null;

  const step = TOUR_STEPS[currentStep];
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === TOUR_STEPS.length - 1;

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/60 z-50 animate-in fade-in" />

      {/* Tour Card */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <Card className="w-full max-w-2xl pointer-events-auto shadow-2xl animate-in zoom-in-95 duration-300">
          <CardHeader className="relative pb-3">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <CardTitle className="text-2xl font-bold pr-8">
                  {step.title}
                </CardTitle>
                <CardDescription className="text-base mt-2">
                  Step {currentStep + 1} of {TOUR_STEPS.length}
                </CardDescription>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleSkip}
                className="absolute top-4 right-4"
                aria-label="Close tour"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Description */}
            <p className="text-lg leading-relaxed text-foreground">
              {step.description}
            </p>

            {/* Action hint */}
            {step.action && (
              <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg">
                <p className="text-base font-medium text-primary">
                  💡 {step.action}
                </p>
              </div>
            )}

            {/* Progress dots */}
            <div className="flex items-center justify-center gap-2 pt-2">
              {TOUR_STEPS.map((_, index) => (
                <div
                  key={index}
                  className={`h-2 rounded-full transition-all ${
                    index === currentStep
                      ? "w-8 bg-primary"
                      : index < currentStep
                      ? "w-2 bg-primary/50"
                      : "w-2 bg-muted"
                  }`}
                />
              ))}
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between gap-3 pt-4">
              <Button
                variant="outline"
                size="lg"
                onClick={handleSkip}
                className="text-base px-6"
              >
                Skip Tour
              </Button>

              <div className="flex items-center gap-3">
                {!isFirstStep && (
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={handlePrevious}
                    className="text-base px-6"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    {t("common.back")}
                  </Button>
                )}

                <Button
                  size="lg"
                  onClick={handleNext}
                  className="text-base px-8"
                >
                  {isLastStep ? t("common.getStarted") : t("common.next")}
                  {!isLastStep && <ArrowRight className="ml-2 h-4 w-4" />}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
};
