import { useState, useEffect } from "react";
import { CheckCircle, Clock, FileText, Phone, Building2, Church, DollarSign, Globe, Home, CreditCard, Package, Briefcase } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import mascotImage from "@/assets/mascot-couple.png";
import { useTranslation } from "react-i18next";
import { PrePlanInfoBanner } from "@/components/summary/PrePlanInfoBanner";

interface Step0OverviewProps {
  formData: any;
  onSave: (data: any) => void;
  caseId: string;
  planPreparedFor?: string;
}

const STEP_ICONS = [
  Clock,      // Step 1: Immediate Needs
  Phone,      // Step 2: Official Notifications
  FileText,   // Step 3: Key Documents
  FileText,   // Step 4: Death Certificates
  FileText,   // Step 5: Obituary
  Church,     // Step 6: Service Details
  DollarSign, // Step 7: Finances & Estate
  Globe,      // Step 8: Digital Accounts
  Home,       // Step 9: Real Estate & Utilities
  CreditCard, // Step 10: Subscriptions
  Package,    // Step 11: Other Property
  Briefcase,  // Step 12: Business
];

export function Step0Overview({ formData, onSave, planPreparedFor }: Step0OverviewProps) {
  const { t } = useTranslation();
  const [preparedFor, setPreparedFor] = useState(formData?.preparedFor || "");
  
  // Get the name to use in the intro text
  const displayName = planPreparedFor || "This person";
  const [overviewNotes, setOverviewNotes] = useState(formData?.overviewNotes || "");
  
  const handleClearAll = () => {
    setPreparedFor("");
    setOverviewNotes("");
    setStep1Complete(false);
    setStep2Complete(false);
    setStep3Complete(false);
    setStep4Complete(false);
    setStep5Complete(false);
    setStep6Complete(false);
    setStep7Complete(false);
    setStep8Complete(false);
    setStep9Complete(false);
    setStep10Complete(false);
    setStep11Complete(false);
    setStep12Complete(false);
  };
  
  // Step completion tracking
  const [step1Complete, setStep1Complete] = useState(formData?.step1Complete || false);
  const [step2Complete, setStep2Complete] = useState(formData?.step2Complete || false);
  const [step3Complete, setStep3Complete] = useState(formData?.step3Complete || false);
  const [step4Complete, setStep4Complete] = useState(formData?.step4Complete || false);
  const [step5Complete, setStep5Complete] = useState(formData?.step5Complete || false);
  const [step6Complete, setStep6Complete] = useState(formData?.step6Complete || false);
  const [step7Complete, setStep7Complete] = useState(formData?.step7Complete || false);
  const [step8Complete, setStep8Complete] = useState(formData?.step8Complete || false);
  const [step9Complete, setStep9Complete] = useState(formData?.step9Complete || false);
  const [step10Complete, setStep10Complete] = useState(formData?.step10Complete || false);
  const [step11Complete, setStep11Complete] = useState(formData?.step11Complete || false);
  const [step12Complete, setStep12Complete] = useState(formData?.step12Complete || false);

  useEffect(() => {
    const timer = setTimeout(() => {
      onSave({ 
        preparedFor,
        overviewNotes,
        step1Complete,
        step2Complete,
        step3Complete,
        step4Complete,
        step5Complete,
        step6Complete,
        step7Complete,
        step8Complete,
        step9Complete,
        step10Complete,
        step11Complete,
        step12Complete,
      });
    }, 1000);
    return () => clearTimeout(timer);
  }, [preparedFor, overviewNotes, step1Complete, step2Complete, step3Complete, step4Complete, step5Complete, step6Complete, step7Complete, step8Complete, step9Complete, step10Complete, step11Complete, step12Complete]);

  const steps = [
    { complete: step1Complete, setComplete: setStep1Complete, title: t("afterDeathSteps.step1Full") },
    { complete: step2Complete, setComplete: setStep2Complete, title: t("afterDeathSteps.step2Full") },
    { complete: step3Complete, setComplete: setStep3Complete, title: t("afterDeathSteps.step3Full") },
    { complete: step4Complete, setComplete: setStep4Complete, title: t("afterDeathSteps.step4Full") },
    { complete: step5Complete, setComplete: setStep5Complete, title: t("afterDeathSteps.step5Full") },
    { complete: step6Complete, setComplete: setStep6Complete, title: t("afterDeathSteps.step6Full") },
    { complete: step7Complete, setComplete: setStep7Complete, title: t("afterDeathSteps.step7Full") },
    { complete: step8Complete, setComplete: setStep8Complete, title: t("afterDeathSteps.step8Full") },
    { complete: step9Complete, setComplete: setStep9Complete, title: t("afterDeathSteps.step9Full") },
    { complete: step10Complete, setComplete: setStep10Complete, title: t("afterDeathSteps.step10Full") },
    { complete: step11Complete, setComplete: setStep11Complete, title: t("afterDeathSteps.step11Full") },
    { complete: step12Complete, setComplete: setStep12Complete, title: t("afterDeathSteps.step12Full") },
  ];

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Pre-Planning Info Banner */}
      <PrePlanInfoBanner 
        onUseInfo={() => {
          // Pre-fill the prepared for field if available
          if (planPreparedFor) {
            setPreparedFor(planPreparedFor);
          }
        }}
      />

      <div className="flex justify-end">
        <Button 
          variant="outline" 
          onClick={handleClearAll}
          size="sm"
        >
          {t("afterDeathPlan.clearAll")}
        </Button>
      </div>

      {/* Introduction */}
      <div className="bg-muted/30 rounded-lg p-8 space-y-4">
        <h2 className="text-2xl font-bold text-foreground">{t("afterDeathSteps.plannerTitle")}</h2>
        <p className="text-base text-muted-foreground leading-relaxed">
          {t("afterDeathSteps.introText")} {t("afterDeathSteps.introDynamicText", { name: displayName })}
        </p>
      </div>

      {/* Prepared For Section */}
      <div className="bg-primary/10 border border-primary/20 rounded-lg p-6">
        <Label htmlFor="preparedFor" className="text-base font-bold text-foreground mb-3 block">
          {t("afterDeathSteps.preparedForLabel")}
        </Label>
        <Input
          id="preparedFor"
          value={preparedFor}
          onChange={(e) => setPreparedFor(e.target.value)}
          placeholder={t("afterDeathPlan.preparedForPlaceholder")}
          className="text-base"
        />
      </div>

      {/* 12-Step Action Plan */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-foreground">{t("afterDeathSteps.actionPlanTitle")}</h3>
        <p className="text-sm text-muted-foreground">
          {t("afterDeathSteps.actionPlanDescription")}
        </p>
        
        <div className="space-y-4">
          {steps.map((step, index) => {
            const IconComponent = STEP_ICONS[index];
            return (
              <div
                key={index}
                className="flex items-start gap-4 p-4 rounded-lg border border-border bg-card hover:bg-accent/5 transition-colors"
              >
                <div className="flex items-center gap-3 flex-1">
                  <div className="flex-shrink-0">
                    <IconComponent className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex items-center gap-2 flex-1">
                    <Checkbox
                      id={`step-${index + 1}`}
                      checked={step.complete}
                      onCheckedChange={(checked) => step.setComplete(checked as boolean)}
                    />
                    <Label
                      htmlFor={`step-${index + 1}`}
                      className={`text-base cursor-pointer flex-1 ${
                        step.complete ? "line-through text-muted-foreground" : "text-foreground"
                      }`}
                    >
                      <span className="font-semibold mr-2">Step {index + 1}:</span>
                      {step.title}
                    </Label>
                  </div>
                  {step.complete && (
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Overview Notes */}
      <div className="space-y-3">
        <Label htmlFor="overviewNotes" className="text-base font-semibold text-foreground">
          Overview Notes
        </Label>
        <Textarea
          id="overviewNotes"
          value={overviewNotes}
          onChange={(e) => setOverviewNotes(e.target.value)}
          placeholder="Add any general notes or important information about this plan..."
          rows={6}
          className="resize-none text-base"
        />
      </div>

      {/* Helpful Tip */}
      <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
        <p className="text-sm text-blue-900 dark:text-blue-100">
          <strong>💡 Tip:</strong> Use the sidebar on the left to navigate through each step. 
          Your progress is automatically saved as you work.
        </p>
      </div>
    </div>
  );
}
