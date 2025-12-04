import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { WizardLayout } from "@/components/wizard/WizardLayout";

// Import step components
import { Step0Overview } from "@/components/nextsteps/steps/Step0Overview";
import { Step1ImmediateNeeds } from "@/components/nextsteps/steps/Step1ImmediateNeeds";
import { Step2OfficialNotifications } from "@/components/nextsteps/steps/Step2OfficialNotifications";
import { Step3KeyDocuments } from "@/components/nextsteps/steps/Step3KeyDocuments";
import { Step4DeathCertificates } from "@/components/nextsteps/steps/Step4DeathCertificates";
import { Step5Obituary } from "@/components/nextsteps/steps/Step5Obituary";
import { Step6ServiceDetails } from "@/components/nextsteps/steps/Step6ServiceDetails";
import { Step7FinancesEstate } from "@/components/nextsteps/steps/Step7FinancesEstate";
import { Step8DigitalAccounts } from "@/components/nextsteps/steps/Step8DigitalAccounts";
import { Step9RealEstateUtilities } from "@/components/nextsteps/steps/Step9RealEstateUtilities";
import { Step10Subscriptions } from "@/components/nextsteps/steps/Step10Subscriptions";
import { Step11OtherProperty } from "@/components/nextsteps/steps/Step11OtherProperty";
import { Step12Business } from "@/components/nextsteps/steps/Step12Business";

const STEP_KEYS = [
  { id: "overview", component: Step0Overview, titleKey: "afterDeathSteps.overview.title", subtitleKey: "afterDeathSteps.overview.subtitle" },
  { id: "immediate", component: Step1ImmediateNeeds, titleKey: "afterDeathSteps.immediate.title", subtitleKey: "afterDeathSteps.immediate.subtitle" },
  { id: "notifications", component: Step2OfficialNotifications, titleKey: "afterDeathSteps.notifications.title", subtitleKey: "afterDeathSteps.notifications.subtitle" },
  { id: "documents", component: Step3KeyDocuments, titleKey: "afterDeathSteps.documents.title", subtitleKey: "afterDeathSteps.documents.subtitle" },
  { id: "certificates", component: Step4DeathCertificates, titleKey: "afterDeathSteps.certificates.title", subtitleKey: "afterDeathSteps.certificates.subtitle" },
  { id: "obituary", component: Step5Obituary, titleKey: "afterDeathSteps.obituary.title", subtitleKey: "afterDeathSteps.obituary.subtitle" },
  { id: "service", component: Step6ServiceDetails, titleKey: "afterDeathSteps.service.title", subtitleKey: "afterDeathSteps.service.subtitle" },
  { id: "finances", component: Step7FinancesEstate, titleKey: "afterDeathSteps.finances.title", subtitleKey: "afterDeathSteps.finances.subtitle" },
  { id: "digital", component: Step8DigitalAccounts, titleKey: "afterDeathSteps.digital.title", subtitleKey: "afterDeathSteps.digital.subtitle" },
  { id: "realestate", component: Step9RealEstateUtilities, titleKey: "afterDeathSteps.realestate.title", subtitleKey: "afterDeathSteps.realestate.subtitle" },
  { id: "subscriptions", component: Step10Subscriptions, titleKey: "afterDeathSteps.subscriptions.title", subtitleKey: "afterDeathSteps.subscriptions.subtitle" },
  { id: "property", component: Step11OtherProperty, titleKey: "afterDeathSteps.property.title", subtitleKey: "afterDeathSteps.property.subtitle" },
  { id: "business", component: Step12Business, titleKey: "afterDeathSteps.business.title", subtitleKey: "afterDeathSteps.business.subtitle" },
];

export default function AfterDeathWizard() {
  const navigate = useNavigate();
  const { caseId } = useParams();
  const { toast } = useToast();
  const { t } = useTranslation();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [formData, setFormData] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCaseData();
  }, [caseId]);

  useEffect(() => {
    // Save current step to localStorage
    if (caseId) {
      localStorage.setItem(`afterdeath_wizard_step_${caseId}`, currentStepIndex.toString());
    }
  }, [currentStepIndex, caseId]);

  const loadCaseData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/login");
        return;
      }

      if (!caseId) {
        navigate("/next-steps");
        return;
      }

      const { data: caseData, error } = await supabase
        .from("cases")
        .select("*")
        .eq("id", caseId)
        .single();

      if (error) throw error;

      setFormData(caseData.form_data || {});

      // Load saved step position
      const savedStep = localStorage.getItem(`afterdeath_wizard_step_${caseId}`);
      if (savedStep) {
        const stepNum = parseInt(savedStep);
        if (stepNum < STEP_KEYS.length) {
          setCurrentStepIndex(stepNum);
        }
      }
    } catch (error) {
      console.error("Error loading case:", error);
      toast({
        title: t("common.error"),
        description: t("afterDeathSteps.errorLoadingCase"),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const saveFormData = async (data: any) => {
    if (!caseId) return;

    try {
      const { error } = await supabase
        .from("cases")
        .update({ form_data: data })
        .eq("id", caseId);

      if (error) throw error;
      setFormData(data);
    } catch (error) {
      console.error("Error saving data:", error);
      toast({
        title: t("common.error"),
        description: t("afterDeathSteps.errorSavingProgress"),
        variant: "destructive",
      });
    }
  };

  const handleBack = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentStepIndex < STEP_KEYS.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    } else {
      toast({
        title: t("afterDeathSteps.congratulations"),
        description: t("afterDeathSteps.completedAllSteps"),
      });
      navigate(`/next-steps/case/${caseId}`);
    }
  };

  const handleExit = () => {
    navigate(`/next-steps/case/${caseId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">{t("afterDeathSteps.loadingWizard")}</p>
      </div>
    );
  }

  const currentStep = STEP_KEYS[currentStepIndex];
  const StepComponent = currentStep.component;

  return (
    <WizardLayout
      currentStep={currentStepIndex + 1}
      totalSteps={STEP_KEYS.length}
      stepTitle={t(currentStep.titleKey)}
      stepSubtitle={t(currentStep.subtitleKey)}
      onBack={handleBack}
      onNext={handleNext}
      onExit={handleExit}
      canGoBack={currentStepIndex > 0}
      canGoNext={true}
      mode="afterdeath"
    >
      <StepComponent
        formData={formData}
        onSave={saveFormData}
        caseId={caseId || ""}
      />
    </WizardLayout>
  );
}
