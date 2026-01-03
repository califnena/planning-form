import { useState, useEffect, createContext, useContext } from "react";
import { Outlet, useNavigate, Link, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { GlobalHeader } from "@/components/GlobalHeader";
import { PlannerShell } from "@/components/planner/PlannerShell";
import { usePlanData, PlanData, SaveState } from "@/hooks/usePlanData";
import { useSubscriptionStatus } from "@/hooks/useSubscriptionStatus";
import { useToast } from "@/hooks/use-toast";
import { RevisionPromptDialog } from "@/components/planner/RevisionPromptDialog";
import { EmailPlanDialog } from "@/components/EmailPlanDialog";
import { PreviewModeBanner } from "@/components/PreviewModeBanner";
import { PIICollectionDialog } from "@/components/planner/PIICollectionDialog";
import { generatePlanPDF } from "@/lib/pdfGenerator";
import { generateManuallyFillablePDF } from "@/lib/manuallyFillablePdfGenerator";
import { useTranslation } from "react-i18next";
import { AssistantWidget } from "@/components/assistant/AssistantWidget";
import { OnboardingTour } from "@/components/planner/OnboardingTour";
import { AppFooter } from "@/components/AppFooter";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";
import { mergeVisibleSections } from "@/lib/sections";
import { PlanDebugPanel } from "@/components/debug/PlanDebugPanel";

// Preview Mode Context
const PreviewModeContext = createContext<{ isPreviewMode: boolean }>({ isPreviewMode: false });
export const usePreviewMode = () => useContext(PreviewModeContext);

// Plan Context for sharing data with section pages
interface PlanContextType {
  plan: PlanData;
  updatePlan: (updates: Partial<PlanData>) => void;
  saveState: SaveState;
  user: User | null;
  isPreviewMode: boolean;
  userSettings: string[] | null;
}

const PlanContext = createContext<PlanContextType | null>(null);
export const usePlanContext = () => {
  const context = useContext(PlanContext);
  if (!context) {
    throw new Error("usePlanContext must be used within PlannerLayout");
  }
  return context;
};

// Route to section ID mapping
const routeToSectionId: Record<string, string> = {
  "/preplandashboard/preferences": "preferences",
  "/preplandashboard/overview": "overview",
  "/preplandashboard/pre-planning": "preplanning",
  "/preplandashboard/health-care": "healthcare",
  "/preplandashboard/care-preferences": "carepreferences",
  "/preplandashboard/personal-family": "personal",
  "/preplandashboard/life-story": "legacy",
  "/preplandashboard/funeral-wishes": "funeral",
  "/preplandashboard/financial-life": "financial",
  "/preplandashboard/property-valuables": "property",
  "/preplandashboard/legal-docs": "legal",
  "/preplandashboard/insurance": "insurance",
  "/preplandashboard/pets": "pets",
  "/preplandashboard/digital": "digital",
  "/preplandashboard/messages": "messages",
  "/preplandashboard/contacts": "contacts",
  "/preplandashboard/providers": "providers",
  "/preplandashboard/checklist": "checklist",
  "/preplandashboard/instructions": "instructions",
  "/preplandashboard/legalresources": "legalresources",
  "/preplandashboard/willprep": "willprep",
};

export default function PlannerLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { t } = useTranslation();
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [showRevisionDialog, setShowRevisionDialog] = useState(false);
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const [showPIIDialog, setShowPIIDialog] = useState(false);
  const [pendingAction, setPendingAction] = useState<"download" | "email" | "preview" | null>(null);
  const [pendingPIIData, setPendingPIIData] = useState<any>(null);
  const [userSettings, setUserSettings] = useState<string[] | null>(null);
  const [settingsLoading, setSettingsLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Get active section from current route
  const activeSection = routeToSectionId[location.pathname] || "preferences";

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
      
      // If no sections selected and on base route, go to preferences
      if ((!selectedSections || selectedSections.length === 0) && location.pathname === "/preplandashboard") {
        navigate("/preplandashboard/preferences", { replace: true });
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
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        localStorage.setItem("efa_last_visited_route", location.pathname);
        navigate("/login", { replace: true });
        return;
      }

      setUser(session.user);
      await ensureUserHasOrg(session.user.id, session.user.email || "User");
      await loadUserSettings(session.user.id);
      setAuthLoading(false);
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' && !session) {
        navigate("/login", { replace: true });
      } else if (session) {
        setUser(session.user);
        if (event === "SIGNED_IN") {
          setTimeout(() => {
            ensureUserHasOrg(session.user.id, session.user.email || "User");
          }, 0);
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, location.pathname]);

  // Redirect base route to last visited or preferences
  useEffect(() => {
    if (!authLoading && !settingsLoading && location.pathname === "/preplandashboard") {
      const lastRoute = localStorage.getItem("last_planner_route");
      if (lastRoute && lastRoute.startsWith("/preplandashboard/")) {
        navigate(lastRoute, { replace: true });
      } else {
        navigate("/preplandashboard/preferences", { replace: true });
      }
    }
  }, [authLoading, settingsLoading, location.pathname, navigate]);

  // Save current route for next visit
  useEffect(() => {
    if (location.pathname.startsWith("/preplandashboard/")) {
      localStorage.setItem("last_planner_route", location.pathname);
    }
  }, [location.pathname]);

  const ensureUserHasOrg = async (userId: string, email: string) => {
    try {
      const { data: existingMembership, error: memberError } = await supabase
        .from("org_members")
        .select("id, org_id")
        .eq("user_id", userId)
        .limit(1)
        .maybeSingle();

      if (memberError) {
        console.error("Error checking org membership:", memberError);
      }

      if (existingMembership) {
        return;
      }

      const { data: orgData, error: orgError } = await supabase
        .from("orgs")
        .insert({ name: `${email}'s Organization` })
        .select()
        .single();

      if (orgError) {
        console.error("Error creating org:", orgError);
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
        }
      }
    } catch (e) {
      console.error("ensureUserHasOrg error:", e);
    }
  };

  const { plan, loading: planLoading, updatePlan, saveState } = usePlanData(user?.id || "");
  const { hasActiveSubscription, isLoading: subscriptionLoading } = useSubscriptionStatus(user?.id);
  const isPreviewMode = !hasActiveSubscription;

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const handleManualSave = () => {
    toast({
      title: "Saved",
      description: "Your plan has been saved successfully.",
    });
  };

  const handleAfterLifePlan = async () => {
    try {
      const { data: newCase, error } = await supabase
        .from("cases")
        .insert({ user_id: user!.id })
        .select()
        .single();

      if (error) throw error;

      navigate(`/next-steps/case/${newCase.id}`);
      
      toast({
        title: "After-Death Planner Started",
        description: "Begin the guided checklist for next steps.",
      });
    } catch (error) {
      console.error("Error creating after-death planner:", error);
      toast({
        title: "Error",
        description: "Failed to create after-death planner. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handlePreviewPDF = () => {
    if (isPreviewMode) {
      toast({
        title: "Read-Only Mode",
        description: "Subscribe to create your printable copy.",
        variant: "destructive",
      });
      return;
    }
    setPendingAction("preview");
    setShowPIIDialog(true);
  };

  const handleDownloadPDF = () => {
    if (isPreviewMode) {
      toast({
        title: "Read-Only Mode",
        description: "Subscribe to create your printable copy.",
        variant: "destructive",
      });
      return;
    }
    setPendingAction("download");
    setShowPIIDialog(true);
  };

  const handleDownloadManualForm = () => {
    if (isPreviewMode) {
      toast({
        title: "Read-Only Mode",
        description: "Subscribe to create your printable copy.",
        variant: "destructive",
      });
      return;
    }
    try {
      const pdf = generateManuallyFillablePDF(plan);
      pdf.save(`My-Final-Wishes-Blank-Form-${new Date().toISOString().split('T')[0]}.pdf`);
      toast({
        title: "Printable Form Downloaded",
        description: "Blank form ready for handwriting.",
      });
    } catch (error) {
      console.error("Error generating manual form:", error);
      toast({
        title: "Error",
        description: "Failed to create printable form. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleEmailPlan = () => {
    if (isPreviewMode) {
      toast({
        title: "Read-Only Mode",
        description: "Subscribe to email your plan.",
        variant: "destructive",
      });
      return;
    }
    setPendingAction("email");
    setShowPIIDialog(true);
  };

  const handlePIISubmit = (piiData: any) => {
    setPendingPIIData(piiData);
    
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
          description: "Document opened in new tab (PII data not saved)",
        });
      } catch (error) {
        console.error("Error generating document:", error);
        toast({
          title: "Error",
          description: "Failed to create document preview. Please try again.",
          variant: "destructive",
        });
      }
      setPendingAction(null);
      setPendingPIIData(null);
    } else {
      setShowRevisionDialog(true);
    }
  };

  const handleRevisionConfirm = async (revision: {
    revision_date: string;
    signature_png: string;
    prepared_by: string;
  }) => {
    const currentRevisions = plan.revisions || [];
    await updatePlan({
      revisions: [...currentRevisions, revision],
      prepared_by: revision.prepared_by,
    });

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
        console.error("Error generating document:", error);
        toast({
          title: "Error",
          description: "Failed to create your document. Please try again.",
          variant: "destructive",
        });
      }
    } else if (pendingAction === "email") {
      setShowEmailDialog(true);
    }

    setPendingAction(null);
    setPendingPIIData(null);
  };

  // Build section items for sidebar
  const allSectionItems = [
    { id: "overview", label: "Overview", completed: false },
    { id: "checklist", label: t("navigation.checklist"), completed: !!plan.checklist_notes },
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
    { id: "willprep", label: "Prepare Information for a Will", completed: false },
  ];

  const visibleSections = mergeVisibleSections(userSettings);
  const visibleIds = new Set(visibleSections.map(s => s.id));
  
  const enabledSections = allSectionItems.filter(item => visibleIds.has(item.id) && item.id !== "overview");
  const alwaysVisibleSections = [
    { id: "legalresources", label: t("navigation.legalresources"), completed: false },
  ];
  
  const sectionItems = [
    { id: "preferences", label: t("navigation.preferences"), completed: false },
    { id: "overview", label: "Overview", completed: false },
    ...enabledSections,
    ...alwaysVisibleSections
  ];

  // Section ID to route mapping for navigation
  const sectionIdToRoute: Record<string, string> = {
    preferences: "/preplandashboard/preferences",
    overview: "/preplandashboard/overview",
    preplanning: "/preplandashboard/pre-planning",
    healthcare: "/preplandashboard/health-care",
    carepreferences: "/preplandashboard/care-preferences",
    personal: "/preplandashboard/personal-family",
    legacy: "/preplandashboard/life-story",
    funeral: "/preplandashboard/funeral-wishes",
    financial: "/preplandashboard/financial-life",
    property: "/preplandashboard/property-valuables",
    legal: "/preplandashboard/legal-docs",
    insurance: "/preplandashboard/insurance",
    pets: "/preplandashboard/pets",
    digital: "/preplandashboard/digital",
    messages: "/preplandashboard/messages",
    contacts: "/preplandashboard/contacts",
    providers: "/preplandashboard/providers",
    checklist: "/preplandashboard/checklist",
    instructions: "/preplandashboard/instructions",
    legalresources: "/preplandashboard/legalresources",
    willprep: "/preplandashboard/willprep",
  };

  const handleSectionChange = (sectionId: string) => {
    const route = sectionIdToRoute[sectionId];
    if (route) {
      navigate(route);
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

  return (
    <PreviewModeContext.Provider value={{ isPreviewMode }}>
      <PlanContext.Provider value={{ plan, updatePlan, saveState, user, isPreviewMode, userSettings }}>
        <div className="min-h-screen flex flex-col bg-background">
          <GlobalHeader onGenerateDocument={handleDownloadPDF} />
          
          <div className="container mx-auto px-4 py-2">
            <Link to="/">
              <Button variant="ghost" size="sm" className="gap-2">
                <Home className="h-4 w-4" />
                Home
              </Button>
            </Link>
          </div>
          
          <PlannerShell
            sectionItems={sectionItems}
            activeSection={activeSection}
            onSectionChange={handleSectionChange}
            onPreviewPDF={handlePreviewPDF}
            onDownloadPDF={handleDownloadPDF}
            onDownloadManualForm={handleDownloadManualForm}
            onEmailPlan={handleEmailPlan}
            onSignOut={handleSignOut}
            onSave={handleManualSave}
            onAfterLifePlan={handleAfterLifePlan}
          >
            {isPreviewMode && <PreviewModeBanner />}
            <Outlet />
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
          
          {user && (
            <OnboardingTour
              userId={user.id}
              onComplete={() => setShowOnboarding(false)}
              activeSection={activeSection}
            />
          )}
          
          {/* DEV: Plan debug panel to verify plan_id consistency */}
          <PlanDebugPanel />
          
          <AppFooter />
        </div>
      </PlanContext.Provider>
    </PreviewModeContext.Provider>
  );
}
