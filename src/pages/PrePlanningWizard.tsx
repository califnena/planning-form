import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { WizardLayout } from "@/components/wizard/WizardLayout";
import { usePlanData } from "@/hooks/usePlanData";
import { useTranslation } from "react-i18next";

// Import section components
import { SectionPersonal } from "@/components/planner/sections/SectionPersonal";
import { SectionFuneral } from "@/components/planner/sections/SectionFuneral";
import { SectionContacts } from "@/components/planner/sections/SectionContacts";
import { SectionFinancial } from "@/components/planner/sections/SectionFinancial";
import { SectionInsurance } from "@/components/planner/sections/SectionInsurance";
import { SectionProperty } from "@/components/planner/sections/SectionProperty";
import { SectionPets } from "@/components/planner/sections/SectionPets";
import { SectionDigital } from "@/components/planner/sections/SectionDigital";
import { SectionLegal } from "@/components/planner/sections/SectionLegal";
import { SectionMessages } from "@/components/planner/sections/SectionMessages";

const SECTION_CONFIG = {
  personal: {
    component: SectionPersonal,
    title: "Personal & Family Details",
    subtitle: "Share information about yourself and your family"
  },
  funeral: {
    component: SectionFuneral,
    title: "Funeral Wishes",
    subtitle: "Describe your preferences for your funeral or memorial service"
  },
  contacts: {
    component: SectionContacts,
    title: "Important Contacts",
    subtitle: "List the people who should be notified and consulted"
  },
  financial: {
    component: SectionFinancial,
    title: "Financial Accounts",
    subtitle: "Record your banking, investment, and financial information"
  },
  insurance: {
    component: SectionInsurance,
    title: "Insurance Policies",
    subtitle: "Document your insurance coverage and beneficiaries"
  },
  property: {
    component: SectionProperty,
    title: "Property & Assets",
    subtitle: "List your real estate and valuable possessions"
  },
  pets: {
    component: SectionPets,
    title: "Pet Care Instructions",
    subtitle: "Provide details about caring for your pets"
  },
  digital: {
    component: SectionDigital,
    title: "Digital Accounts",
    subtitle: "List your online accounts and digital assets"
  },
  legal: {
    component: SectionLegal,
    title: "Legal Documents",
    subtitle: "Record the location of important legal papers"
  },
  messages: {
    component: SectionMessages,
    title: "Personal Messages",
    subtitle: "Write messages to your loved ones"
  },
};

export default function PrePlanningWizard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useTranslation();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [selectedSections, setSelectedSections] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string>("");
  const { plan, updatePlan } = usePlanData(userId);

  useEffect(() => {
    checkAuthAndLoadSections();
  }, []);

  const checkAuthAndLoadSections = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/login");
        return;
      }

      setUserId(user.id);
      await loadUserSections(user.id);
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description: "Failed to load data",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  useEffect(() => {
    // Save current step to localStorage
    if (selectedSections.length > 0 && userId) {
      localStorage.setItem("preplanning_wizard_step", currentStepIndex.toString());
    }
  }, [currentStepIndex, selectedSections, userId]);

  const loadUserSections = async (uid: string) => {
    try {
      const { data: settings } = await supabase
        .from("user_settings")
        .select("selected_sections")
        .eq("user_id", uid)
        .maybeSingle();

      // Only use sections that were explicitly selected by the user
      // If no selections exist, selectedSections will be empty and the user will be redirected to preferences
      const sections = settings?.selected_sections || [];
      setSelectedSections(sections.filter(s => SECTION_CONFIG[s as keyof typeof SECTION_CONFIG]));

      // Load saved step position
      const savedStep = localStorage.getItem("preplanning_wizard_step");
      if (savedStep) {
        const stepNum = parseInt(savedStep);
        if (stepNum < sections.length) {
          setCurrentStepIndex(stepNum);
        }
      }
    } catch (error) {
      console.error("Error loading sections:", error);
      toast({
        title: "Error",
        description: "Failed to load your preferences",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentStepIndex < selectedSections.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    } else {
      // Completed all steps
      toast({
        title: "Congratulations!",
        description: "You've completed all steps in your plan",
      });
      navigate("/dashboard");
    }
  };

  const handleExit = () => {
    navigate("/dashboard");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading wizard...</p>
      </div>
    );
  }

  if (selectedSections.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-semibold">No Sections Selected</h2>
          <p className="text-muted-foreground">
            Please select sections in your Preferences before starting the wizard.
          </p>
          <button
            onClick={() => navigate("/app?section=preferences")}
            className="text-primary underline"
          >
            Go to Preferences
          </button>
        </div>
      </div>
    );
  }

  const currentSectionId = selectedSections[currentStepIndex];
  const config = SECTION_CONFIG[currentSectionId as keyof typeof SECTION_CONFIG];
  const SectionComponent = config.component;

  return (
    <WizardLayout
      currentStep={currentStepIndex + 1}
      totalSteps={selectedSections.length}
      stepTitle={config.title}
      stepSubtitle={config.subtitle}
      onBack={handleBack}
      onNext={handleNext}
      onExit={handleExit}
      canGoBack={currentStepIndex > 0}
      canGoNext={true}
      mode="preplanning"
    >
      <SectionComponent data={plan} onChange={updatePlan} />
    </WizardLayout>
  );
}
