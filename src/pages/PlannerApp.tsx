import { useState, useEffect, createContext, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { GlobalHeader } from "@/components/GlobalHeader";
import { PlannerShell } from "@/components/planner/PlannerShell";
import { usePlanData } from "@/hooks/usePlanData";
import { useSubscriptionStatus } from "@/hooks/useSubscriptionStatus";
import { useToast } from "@/hooks/use-toast";
import { RevisionPromptDialog } from "@/components/planner/RevisionPromptDialog";
import { EmailPlanDialog } from "@/components/EmailPlanDialog";
import { SectionNavigation } from "@/components/planner/SectionNavigation";
import { PreviewModeBanner } from "@/components/PreviewModeBanner";
import { PIICollectionDialog } from "@/components/planner/PIICollectionDialog";
import { generatePlanPDF } from "@/lib/pdfGenerator";
import { generateManuallyFillablePDF } from "@/lib/manuallyFillablePdfGenerator";
import { useTranslation } from "react-i18next";
import { AssistantWidget } from "@/components/assistant/AssistantWidget";

// Preview Mode Context
const PreviewModeContext = createContext<{ isPreviewMode: boolean }>({ isPreviewMode: false });
export const usePreviewMode = () => useContext(PreviewModeContext);

// Section components
import { SectionPreferences } from "@/components/planner/sections/SectionPreferences";
import { SectionInstructions } from "@/components/planner/sections/SectionInstructions";
import { SectionPersonal } from "@/components/planner/sections/SectionPersonal";
import { SectionContacts } from "@/components/planner/sections/SectionContacts";
import { SectionAbout } from "@/components/planner/sections/SectionAbout";
import { SectionChecklist } from "@/components/planner/sections/SectionChecklist";
import { SectionFuneral } from "@/components/planner/sections/SectionFuneral";
import { SectionFinancial } from "@/components/planner/sections/SectionFinancial";
import { SectionInsurance } from "@/components/planner/sections/SectionInsurance";
import { SectionProperty } from "@/components/planner/sections/SectionProperty";
import { SectionPets } from "@/components/planner/sections/SectionPets";
import { SectionDigital } from "@/components/planner/sections/SectionDigital";
import { SectionLegal } from "@/components/planner/sections/SectionLegal";
import { SectionMessages } from "@/components/planner/sections/SectionMessages";
import { SectionVendors } from "@/components/planner/sections/SectionVendors";
import { SectionRevisions } from "@/components/planner/sections/SectionRevisions";
import { SectionGuide } from "@/components/planner/sections/SectionGuide";
import { SectionFAQ } from "@/components/planner/sections/SectionFAQ";
import { mergeVisibleSections } from "@/lib/sections";

const PlannerApp = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useTranslation();
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [activeSection, setActiveSection] = useState("preferences");
  const [showRevisionDialog, setShowRevisionDialog] = useState(false);
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const [showPIIDialog, setShowPIIDialog] = useState(false);
  const [pendingAction, setPendingAction] = useState<"download" | "email" | "preview" | null>(null);
  const [pendingPIIData, setPendingPIIData] = useState<any>(null);
  const [userSettings, setUserSettings] = useState<string[] | null>(null);
  const [settingsLoading, setSettingsLoading] = useState(true);

  const loadUserSettings = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("user_settings")
        .select("selected_sections")
        .eq("user_id", userId)
        .maybeSingle();

      if (error && error.code !== "PGRST116") {
        console.error("Error loading settings:", error);
      }

      const selectedSections = data?.selected_sections || null;
      setUserSettings(selectedSections);
      
      // If no sections selected, auto-open preferences
      if (!selectedSections || selectedSections.length === 0) {
        setActiveSection("preferences");
      }
    } catch (error) {
      console.error("Error loading user settings:", error);
    } finally {
      setSettingsLoading(false);
    }
  };

  const handleVisibilityChange = async () => {
    if (user) {
      await loadUserSettings(user.id);
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        navigate("/login");
        return;
      }

      setUser(session.user);
      await ensureUserHasOrg(session.user.id, session.user.email || "User");
      await loadUserSettings(session.user.id);
      setAuthLoading(false);
    };

    checkAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        navigate("/login");
      } else {
        setUser(session.user);
        if (event === "SIGNED_IN") {
          setTimeout(() => {
            ensureUserHasOrg(session.user.id, session.user.email || "User");
          }, 0);
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const ensureUserHasOrg = async (userId: string, email: string) => {
    try {
      // Check if user already has an org membership
      const { data: existingMembership, error: memberError } = await supabase
        .from("org_members")
        .select("id, org_id")
        .eq("user_id", userId)
        .limit(1)
        .maybeSingle();

      if (memberError) {
        console.error("Error checking org membership:", memberError);
      }

      // If user already has membership, we're done
      if (existingMembership) {
        console.log("User already has org membership");
        return;
      }

      // Try to create new org and membership
      const { data: orgData, error: orgError } = await supabase
        .from("orgs")
        .insert({ name: `${email}'s Organization` })
        .select()
        .single();

      if (orgError) {
        console.error("Error creating org:", orgError);
        // Org creation failed, but app can still work with localStorage
        return;
      }

      if (orgData) {
        const { error: memberInsertError } = await supabase
          .from("org_members")
          .insert({
            org_id: orgData.id,
            user_id: userId,
            role: "owner",
          });

        if (memberInsertError) {
          console.error("Error creating org membership:", memberInsertError);
        } else {
          console.log("Org and membership created successfully");
        }
      }
    } catch (e) {
      console.error("ensureUserHasOrg error:", e);
      // Don't throw - app can still work with localStorage
    }
  };

  const { plan, loading: planLoading, updatePlan } = usePlanData(user?.id || "");
  const { hasActiveSubscription, isLoading: subscriptionLoading } = useSubscriptionStatus(user?.id);
  const isPreviewMode = !hasActiveSubscription;

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const handleManualSave = () => {
    // Data is already auto-saved, this just provides user feedback
    toast({
      title: "Saved",
      description: "Your plan has been saved successfully.",
    });
  };

  const handleAfterLifePlan = async () => {
    try {
      // Create a new case
      const { data: newCase, error } = await supabase
        .from("cases")
        .insert({ user_id: user!.id })
        .select()
        .single();

      if (error) throw error;

      // Navigate directly to the case detail page
      navigate(`/next-steps/case/${newCase.id}`);
      
      toast({
        title: "After-Life Plan Started",
        description: "Begin the guided checklist for next steps.",
      });
    } catch (error) {
      console.error("Error creating after-life plan:", error);
      toast({
        title: "Error",
        description: "Failed to create after-life plan. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handlePreviewPDF = () => {
    if (isPreviewMode) {
      toast({
        title: "Preview Mode",
        description: "PDF export is locked. Start a trial to unlock.",
        variant: "destructive",
      });
      return;
    }
    // Show PII dialog first
    setPendingAction("preview");
    setShowPIIDialog(true);
  };

  const handleDownloadPDF = () => {
    if (isPreviewMode) {
      toast({
        title: "Preview Mode",
        description: "PDF export is locked. Start a trial to unlock.",
        variant: "destructive",
      });
      return;
    }
    setPendingAction("download");
    setShowPIIDialog(true);  // Show PII dialog first
  };

  const handleDownloadManualForm = () => {
    if (isPreviewMode) {
      toast({
        title: "Preview Mode",
        description: "PDF export is locked. Start a trial to unlock.",
        variant: "destructive",
      });
      return;
    }
    try {
      const pdf = generateManuallyFillablePDF(plan);
      pdf.save(`My-Final-Wishes-Blank-Form-${new Date().toISOString().split('T')[0]}.pdf`);
      toast({
        title: "Blank Form Downloaded",
        description: "Printable blank form ready for handwriting.",
      });
    } catch (error) {
      console.error("Error generating manual form:", error);
      toast({
        title: "Error",
        description: "Failed to generate manual form. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleEmailPlan = () => {
    if (isPreviewMode) {
      toast({
        title: "Preview Mode",
        description: "Email export is locked. Start a trial to unlock.",
        variant: "destructive",
      });
      return;
    }
    setPendingAction("email");
    setShowPIIDialog(true);  // Show PII dialog first
  };

  // Handle PII data submission
  const handlePIISubmit = (piiData: any) => {
    setPendingPIIData(piiData);
    
    // For preview, generate PDF immediately
    if (pendingAction === "preview") {
      try {
        const visibleSections = mergeVisibleSections(userSettings);
        const planWithPII = { ...plan, _pii: piiData, _visibleSections: visibleSections.map(s => s.id) };
        const pdf = generatePlanPDF(planWithPII);
        const pdfBlob = pdf.output('blob');
        const pdfUrl = URL.createObjectURL(pdfBlob);
        window.open(pdfUrl, '_blank');
        toast({
          title: "Preview opened",
          description: "PDF opened in new tab (PII data not saved)",
        });
      } catch (error) {
        console.error("Error generating PDF:", error);
        toast({
          title: "Error",
          description: "Failed to generate PDF preview. Please try again.",
          variant: "destructive",
        });
      }
      setPendingAction(null);
      setPendingPIIData(null);
    } else {
      // For download/email, proceed to revision dialog
      setShowRevisionDialog(true);
    }
  };

  const handleRevisionConfirm = async (revision: {
    revision_date: string;
    signature_png: string;
    prepared_by: string;
  }) => {
    // Add the revision to the plan
    const currentRevisions = plan.revisions || [];
    await updatePlan({
      revisions: [...currentRevisions, revision],
      prepared_by: revision.prepared_by,
    });

    // Proceed with the pending action
    if (pendingAction === "download") {
      try {
        const visibleSections = mergeVisibleSections(userSettings);
        const planWithPII = { ...plan, _pii: pendingPIIData, _visibleSections: visibleSections.map(s => s.id) };
        const pdf = generatePlanPDF(planWithPII);
        pdf.save(`My-Final-Wishes-${new Date().toISOString().split('T')[0]}.pdf`);
        toast({
          title: "Revision Saved",
          description: "Your plan has been updated and downloaded successfully. (PII data not saved)",
        });
      } catch (error) {
        console.error("Error generating PDF:", error);
        toast({
          title: "Error",
          description: "Failed to generate PDF. Please try again.",
          variant: "destructive",
        });
      }
    } else if (pendingAction === "email") {
      setShowEmailDialog(true);
    }

    setPendingAction(null);
    setPendingPIIData(null);  // Clear PII data after use
  };

  // Map section IDs to labels and completion status
  const allSectionItems = [
    { id: "overview", label: t("navigation.checklist"), completed: !!plan.checklist_notes },
    { id: "instructions", label: t("navigation.instructions"), completed: !!plan.instructions_notes },
    { id: "personal", label: t("navigation.personal"), completed: false },
    { id: "legacy", label: t("navigation.about"), completed: !!plan.about_me_notes },
    { id: "contacts", label: t("navigation.contacts"), completed: false },
    { id: "providers", label: t("navigation.vendors"), completed: false },
    { id: "funeral", label: t("navigation.funeral"), completed: !!plan.funeral_wishes_notes },
    { id: "financial", label: t("navigation.financial"), completed: !!plan.financial_notes },
    { id: "insurance", label: t("navigation.insurance"), completed: !!plan.insurance_notes },
    { id: "property", label: t("navigation.property"), completed: !!plan.property_notes },
    { id: "pets", label: t("navigation.pets"), completed: !!plan.pets_notes },
    { id: "digital", label: t("navigation.digital"), completed: !!plan.digital_notes },
    { id: "legal", label: t("navigation.legal"), completed: !!plan.legal_notes },
    { id: "messages", label: t("navigation.messages"), completed: !!plan.messages_notes },
  ];

  const visibleSections = mergeVisibleSections(userSettings);
  const visibleIds = new Set(visibleSections.map(s => s.id));
  
  // Build sidebar: preferences always first, then enabled sections, then always-visible sections
  const enabledSections = allSectionItems.filter(item => visibleIds.has(item.id));
  const alwaysVisibleSections = [
    { id: "resources", label: t("navigation.guide"), completed: false },
    { id: "faq", label: t("navigation.faq"), completed: false },
  ];
  
  const sectionItems = [
    { id: "preferences", label: t("navigation.preferences"), completed: false },
    ...enabledSections,
    ...alwaysVisibleSections
  ];

  const handleNextSection = () => {
    const currentIndex = sectionItems.findIndex(item => item.id === activeSection);
    if (currentIndex < sectionItems.length - 1) {
      setActiveSection(sectionItems[currentIndex + 1].id);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  if (authLoading || planLoading || subscriptionLoading || settingsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading your planner...</p>
        </div>
      </div>
    );
  }

  const renderSection = () => {
    const currentIndex = sectionItems.findIndex(item => item.id === activeSection);
    const isLastSection = activeSection === "messages";
    
    let sectionContent;
    
    switch (activeSection) {
      case "preferences":
        sectionContent = user ? (
          <SectionPreferences 
            user={user} 
            onSave={handleVisibilityChange}
            onContinue={() => {
              // Move to first enabled section or resources
              const firstEnabledSection = sectionItems.find(item => 
                item.id !== "preferences" && item.id !== "resources" && item.id !== "faq"
              );
              setActiveSection(firstEnabledSection?.id || "resources");
            }}
            showWelcome={!userSettings || userSettings.length === 0}
          />
        ) : null;
        break;
      case "overview":
        sectionContent = (
          <SectionChecklist
            data={plan}
            onChange={(data) => updatePlan(data)}
          />
        );
        break;
      case "legacy":
        sectionContent = (
          <SectionAbout
            value={plan.about_me_notes}
            onChange={(value) => updatePlan({ about_me_notes: value })}
          />
        );
        break;
      case "providers":
        sectionContent = (
          <SectionVendors
            data={plan}
            onChange={(data) => updatePlan(data)}
          />
        );
        break;
      case "resources":
        sectionContent = <SectionGuide />;
        break;
      case "instructions":
        sectionContent = (
          <SectionInstructions
            value={plan.instructions_notes}
            onChange={(value) => updatePlan({ instructions_notes: value })}
          />
        );
        break;
      case "funeral":
        sectionContent = (
          <SectionFuneral
            data={plan}
            onChange={(data) => updatePlan(data)}
          />
        );
        break;
      case "financial":
        sectionContent = (
          <SectionFinancial
            data={plan}
            onChange={(data) => updatePlan(data)}
          />
        );
        break;
      case "insurance":
        sectionContent = (
          <SectionInsurance
            data={plan}
            onChange={(data) => updatePlan(data)}
          />
        );
        break;
      case "property":
        sectionContent = (
          <SectionProperty
            data={plan}
            onChange={(data) => updatePlan(data)}
          />
        );
        break;
      case "pets":
        sectionContent = (
          <SectionPets
            data={plan}
            onChange={updatePlan}
          />
        );
        break;
      case "digital":
        sectionContent = (
          <SectionDigital
            data={plan}
            onChange={(data) => updatePlan(data)}
          />
        );
        break;
      case "legal":
        sectionContent = (
          <SectionLegal
            data={plan}
            onChange={(data) => updatePlan(data)}
          />
        );
        break;
      case "messages":
        sectionContent = (
          <SectionMessages
            data={plan}
            onChange={(data) => updatePlan(data)}
          />
        );
        break;
      case "personal":
        sectionContent = <SectionPersonal data={plan} onChange={updatePlan} />;
        break;
      case "contacts":
        sectionContent = <SectionContacts data={plan} onChange={updatePlan} />;
        break;
      case "revisions":
        sectionContent = <SectionRevisions data={plan} onChange={updatePlan} />;
        break;
      case "faq":
        sectionContent = <SectionFAQ />;
        break;
      default:
        sectionContent = (
          <div className="text-center text-muted-foreground py-12">
            This section is coming soon...
          </div>
        );
    }

    // Don't show navigation on resources, faq, revisions, and preferences sections
    const showNavigation = !["resources", "faq", "revisions", "preferences"].includes(activeSection);

    return (
      <div>
        {sectionContent}
        {showNavigation && (
          <SectionNavigation
            currentSection={activeSection}
            onNext={handleNextSection}
            onGenerateDocument={handleDownloadPDF}
            isLastSection={isLastSection}
          />
        )}
      </div>
    );
  };

  return (
    <PreviewModeContext.Provider value={{ isPreviewMode }}>
      <GlobalHeader />
      <PlannerShell
        sectionItems={sectionItems}
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        onPreviewPDF={handlePreviewPDF}
        onDownloadPDF={handleDownloadPDF}
        onDownloadManualForm={handleDownloadManualForm}
        onEmailPlan={handleEmailPlan}
        onSignOut={handleSignOut}
        onSave={handleManualSave}
        onAfterLifePlan={handleAfterLifePlan}
      >
        {isPreviewMode && <PreviewModeBanner />}
        {renderSection()}
      </PlannerShell>

      <RevisionPromptDialog
        open={showRevisionDialog}
        onOpenChange={setShowRevisionDialog}
        onConfirm={handleRevisionConfirm}
        preparedBy={plan.prepared_by || ""}
      />

      <PIICollectionDialog
        open={showPIIDialog}
        onOpenChange={setShowPIIDialog}
        onSubmit={handlePIISubmit}
      />

      <EmailPlanDialog
        open={showEmailDialog}
        onOpenChange={setShowEmailDialog}
        planData={{ ...plan, _pii: pendingPIIData }}
        preparedBy={plan.prepared_by || ""}
      />
      
      <AssistantWidget />
    </PreviewModeContext.Provider>
  );
};

export default PlannerApp;
