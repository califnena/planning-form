import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
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

const STEPS = [
  {
    id: "overview",
    component: Step0Overview,
    title: "Overview & Planning",
    subtitle: "Get an overview of all the steps you'll complete"
  },
  {
    id: "immediate",
    component: Step1ImmediateNeeds,
    title: "Immediate Needs",
    subtitle: "Handle urgent matters right after a death"
  },
  {
    id: "notifications",
    component: Step2OfficialNotifications,
    title: "Official Notifications",
    subtitle: "Notify government agencies and organizations"
  },
  {
    id: "documents",
    component: Step3KeyDocuments,
    title: "Key Documents",
    subtitle: "Gather and organize important documents"
  },
  {
    id: "certificates",
    component: Step4DeathCertificates,
    title: "Death Certificates",
    subtitle: "Order and distribute death certificates"
  },
  {
    id: "obituary",
    component: Step5Obituary,
    title: "Obituary",
    subtitle: "Write and publish an obituary"
  },
  {
    id: "service",
    component: Step6ServiceDetails,
    title: "Service Details",
    subtitle: "Plan the funeral or memorial service"
  },
  {
    id: "finances",
    component: Step7FinancesEstate,
    title: "Finances & Estate",
    subtitle: "Manage financial accounts and estate matters"
  },
  {
    id: "digital",
    component: Step8DigitalAccounts,
    title: "Digital Accounts",
    subtitle: "Handle online accounts and digital assets"
  },
  {
    id: "realestate",
    component: Step9RealEstateUtilities,
    title: "Real Estate & Utilities",
    subtitle: "Manage property and utility accounts"
  },
  {
    id: "subscriptions",
    component: Step10Subscriptions,
    title: "Subscriptions",
    subtitle: "Cancel or transfer subscriptions and memberships"
  },
  {
    id: "property",
    component: Step11OtherProperty,
    title: "Other Property",
    subtitle: "Handle vehicles, valuables, and personal items"
  },
  {
    id: "business",
    component: Step12Business,
    title: "Business Matters",
    subtitle: "Manage business interests and professional obligations"
  },
];

export default function AfterDeathWizard() {
  const navigate = useNavigate();
  const { caseId } = useParams();
  const { toast } = useToast();
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
        if (stepNum < STEPS.length) {
          setCurrentStepIndex(stepNum);
        }
      }
    } catch (error) {
      console.error("Error loading case:", error);
      toast({
        title: "Error",
        description: "Failed to load case data",
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
        title: "Error",
        description: "Failed to save progress",
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
    if (currentStepIndex < STEPS.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    } else {
      toast({
        title: "Congratulations!",
        description: "You've completed all after-death steps",
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
        <p className="text-muted-foreground">Loading wizard...</p>
      </div>
    );
  }

  const currentStep = STEPS[currentStepIndex];
  const StepComponent = currentStep.component;

  return (
    <WizardLayout
      currentStep={currentStepIndex + 1}
      totalSteps={STEPS.length}
      stepTitle={currentStep.title}
      stepSubtitle={currentStep.subtitle}
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
