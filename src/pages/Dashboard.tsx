import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import { FileText, Star, BookOpen, Scale, Phone, Music, Printer, Users, ListChecks, ShoppingBag, Lightbulb, CalendarDays, Plane, ClipboardList, Loader2, ArrowRight } from "lucide-react";
import { AuthenticatedLayout } from "@/components/AuthenticatedLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { PIICollectionDialog } from "@/components/planner/PIICollectionDialog";
import { PlannerModeModal } from "@/components/planner/PlannerModeModal";
import { generatePlanPDF } from "@/lib/pdfGenerator";
import { generateManuallyFillablePDF } from "@/lib/manuallyFillablePdfGenerator";
import { generateBlankAfterLifePlanPDF } from "@/lib/blankAfterLifePlanPdfGenerator";
import { checkPaidAccess as checkPaidAccessFn, checkVIPAccess as checkVIPAccessFn, checkPrintableAccess as checkPrintableAccessFn, checkIsFreePlan as checkIsFreePlanFn } from "@/lib/accessChecks";
import { ChecklistsSection } from "@/components/dashboard/ChecklistsSection";
import { ResumeCard } from "@/components/dashboard/ResumeCard";
import { MyPlanningDocumentCard } from "@/components/dashboard/MyPlanningDocumentCard";
import { setPendingCheckout } from "@/lib/pendingCheckout";

export default function Dashboard() {
  const {
    t
  } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const {
    toast
  } = useToast();

  // Helper to queue checkout and redirect to login if not authenticated
  const queueCheckoutAndGoLogin = async (lookupKey: string, successUrl: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setPendingCheckout({
        lookupKey,
        successUrl,
        cancelUrl: window.location.href,
        postSuccessRedirect: "/dashboard",
      });
      localStorage.setItem("efa_last_visited_route", location.pathname);
      navigate("/login");
      return true; // Indicate we need to stop and redirect
    }
    return false; // User is authenticated, proceed with checkout
  };
  const [firstName, setFirstName] = useState<string>("");
  const [progress, setProgress] = useState(0);
  const [showPIIDialog, setShowPIIDialog] = useState(false);
  const [showPlannerModeModal, setShowPlannerModeModal] = useState(false);
  const [pendingPIIData, setPendingPIIData] = useState<any>(null);
  const [isFreePlan, setIsFreePlan] = useState(true);
  const [hasVIPAccess, setHasVIPAccess] = useState(false);
  const [hasPrintableAccess, setHasPrintableAccess] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  useEffect(() => {
    const loadUserData = async () => {
      const {
        data: {
          user
        }
      } = await supabase.auth.getUser();
      if (!user) return;

      // Check if user is on free plan
      const freePlan = await checkIsFreePlan();
      setIsFreePlan(freePlan);

      // Check if user has VIP access
      const vipAccess = await checkVIPAccess();
      setHasVIPAccess(vipAccess);

      // Check if user has printable access (EFABASIC)
      const printableAccess = await checkPrintableAccess();
      setHasPrintableAccess(printableAccess);

      // Load user name
      const {
        data: profile
      } = await supabase.from("profiles").select("full_name").eq("id", user.id).single();
      if (profile?.full_name) {
        const name = profile.full_name.split(" ")[0];
        setFirstName(name);
      }

      // Load progress and calculate dynamically
      // DEBUG: Log user context
      console.log("[Dashboard] Loading data for user:", user.id);
      
      const {
        data: orgMember
      } = await supabase.from("org_members").select("org_id").eq("user_id", user.id).eq("role", "owner").maybeSingle();
      
      // DEBUG: Log org lookup
      console.log("[Dashboard] Org member lookup:", { userId: user.id, orgMember });
      
      if (orgMember) {
        // Get user's selected sections from preferences
        const {
          data: settings
        } = await supabase.from("user_settings").select("selected_sections").eq("user_id", user.id).maybeSingle();
        const selectedSections = settings?.selected_sections || [];
        if (selectedSections.length > 0) {
          // Get plan data to check which sections have content
          const {
            data: plan
          } = await supabase.from("plans").select("*").eq("org_id", orgMember.org_id).eq("owner_user_id", user.id).maybeSingle();
          
          // DEBUG: Log plan data
          console.log("[Dashboard] Plan query result:", { 
            orgId: orgMember.org_id, 
            userId: user.id, 
            planId: plan?.id,
            hasAboutMe: !!plan?.about_me_notes,
            hasFuneral: !!plan?.funeral_wishes_notes,
            hasFinancial: !!plan?.financial_notes,
            hasProperty: !!plan?.property_notes,
            hasLegal: !!plan?.legal_notes
          });
          if (plan) {
            // Count sections with any data
            let sectionsWithData = 0;
            const noteFields = ['instructions_notes', 'about_me_notes', 'checklist_notes', 'funeral_wishes_notes', 'financial_notes', 'insurance_notes', 'property_notes', 'pets_notes', 'digital_notes', 'legal_notes', 'messages_notes', 'to_loved_ones_message'];
            noteFields.forEach(field => {
              if (plan[field] && plan[field].trim().length > 0) {
                sectionsWithData++;
              }
            });

            // Calculate percentage
            const calculatedProgress = Math.round(sectionsWithData / selectedSections.length * 100);
            setProgress(calculatedProgress);

            // Update the plan with new percentage
            await supabase.from("plans").update({
              percent_complete: calculatedProgress
            }).eq("id", plan.id);
          }
        }
      }
    };
    loadUserData();
  }, []);

  // Use imported access check functions (single source of truth)
  const checkPaidAccess = checkPaidAccessFn;
  const checkIsFreePlan = checkIsFreePlanFn;
  const checkVIPAccess = checkVIPAccessFn;
  const checkPrintableAccess = checkPrintableAccessFn;
  // Check if user has planner progress
  const [hasPlannerProgress, setHasPlannerProgress] = useState(false);
  const [lastStepIndex, setLastStepIndex] = useState(0);
  const [totalSteps, setTotalSteps] = useState(0);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  useEffect(() => {
    const checkPlannerProgress = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: settings } = await supabase
        .from('user_settings')
        .select('planner_mode, selected_sections, last_step_index, last_planner_activity')
        .eq('user_id', user.id)
        .maybeSingle();

      const settingsData = settings as {
        planner_mode?: string;
        selected_sections?: string[];
        last_step_index?: number;
        last_planner_activity?: string;
      } | null;

      const hasProgress = !!(settingsData?.planner_mode || settingsData?.selected_sections?.length);
      setHasPlannerProgress(hasProgress);
      setLastStepIndex((settingsData?.last_step_index ?? 0) + 1);
      setTotalSteps(settingsData?.selected_sections?.length ?? 0);
      
      if (settingsData?.last_planner_activity) {
        const date = new Date(settingsData.last_planner_activity);
        const now = new Date();
        const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays === 0) {
          setLastUpdated('Today');
        } else if (diffDays === 1) {
          setLastUpdated('Yesterday');
        } else {
          setLastUpdated(`${diffDays} days ago`);
        }
      }
    };
    checkPlannerProgress();
  }, []);

  const handleStartDigitalPlanner = () => {
    // Start Digital Planner → go to /plan-ahead entry
    navigate('/plan-ahead');
  };

  const handleViewSummary = async () => {
    // Check if user has any plan data before going to summary
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate('/preplan-summary');
      return;
    }

    // Check if user has an org and plan
    const { data: orgMember } = await supabase
      .from('org_members')
      .select('org_id')
      .eq('user_id', user.id)
      .eq('role', 'owner')
      .maybeSingle();

    if (!orgMember) {
      // No org, redirect to planner dashboard with message
      toast({
        title: "No planning data yet",
        description: "Complete at least one section to generate a summary.",
      });
      navigate('/preplandashboard');
      return;
    }

    // Check if plan has any content
    const { data: plan } = await supabase
      .from('plans')
      .select('instructions_notes, about_me_notes, funeral_wishes_notes, financial_notes')
      .eq('org_id', orgMember.org_id)
      .eq('owner_user_id', user.id)
      .maybeSingle();

    const hasContent = plan && (
      plan.instructions_notes || 
      plan.about_me_notes || 
      plan.funeral_wishes_notes || 
      plan.financial_notes
    );

    if (hasContent) {
      navigate('/preplan-summary');
    } else {
      toast({
        title: "No planning data yet",
        description: "Complete at least one section to generate a summary.",
      });
      navigate('/preplandashboard');
    }
  };

  const handlePlannerModeSelected = async (mode: 'guided' | 'free') => {
    setShowPlannerModeModal(false);
    // Navigate to planner start which handles everything
    navigate('/planner/start');
  };
  const handleGeneratePDF = async () => {
    // Check for paid access (subscription required)
    const hasPaidAccess = await checkPaidAccess();
    if (!hasPaidAccess) {
      navigate('/pricing');
      return;
    }
    setShowPIIDialog(true);
  };
  const handlePIISubmit = async (piiData: any) => {
    try {
      await generatePlanPDF(piiData);
      toast({
        title: "PDF Generated",
        description: "Your Pre-Planning document has been generated successfully."
      });
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast({
        title: "Error",
        description: "Failed to generate PDF. Please try again.",
        variant: "destructive"
      });
    }
  };
  const handleDownloadWorkbook = async () => {
    const successUrl = `${window.location.origin}/purchase-success?type=printable`;
    
    // Check if user is logged in, queue checkout if not
    const needsLogin = await queueCheckoutAndGoLogin("EFABASIC", successUrl);
    if (needsLogin) return;

    try {
      const { data, error } = await supabase.functions.invoke('stripe-create-checkout', {
        body: {
          lookupKey: 'EFABASIC',
          successUrl,
          cancelUrl: `${window.location.origin}/dashboard`,
          allowPromotionCodes: true
        }
      });
      if (error) {
        console.error('Stripe function error:', error);
        toast({
          title: "Checkout failed",
          description: "Unable to start checkout. Please try again.",
          variant: "destructive"
        });
        return;
      }
      if (data?.url) {
        window.location.href = data.url;
      } else {
        toast({
          title: "Error",
          description: "No checkout URL received. Please try again.",
          variant: "destructive"
        });
      }
    } catch (error: any) {
      console.error("Error starting checkout:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to start checkout. Please try again.",
        variant: "destructive"
      });
    }
  };
  const handlePurchaseBinder = async () => {
    const successUrl = `${window.location.origin}/purchase-success?type=binder`;
    
    // Check if user is logged in, queue checkout if not
    const needsLogin = await queueCheckoutAndGoLogin("EFABINDER", successUrl);
    if (needsLogin) return;

    try {
      const { data, error } = await supabase.functions.invoke('stripe-create-checkout', {
        body: {
          lookupKey: 'EFABINDER',
          successUrl,
          cancelUrl: `${window.location.origin}/dashboard`,
          allowPromotionCodes: true
        }
      });
      if (error) {
        console.error('Stripe function error:', error);
        toast({
          title: "Checkout failed",
          description: "Unable to start checkout. Please try again.",
          variant: "destructive"
        });
        return;
      }
      if (data?.url) {
        window.location.href = data.url;
      } else {
        toast({
          title: "Error",
          description: "No checkout URL received. Please try again.",
          variant: "destructive"
        });
      }
    } catch (error: any) {
      console.error("Error starting checkout:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to start checkout. Please try again.",
        variant: "destructive"
      });
    }
  };
  const handleStartWizard = async () => {
    // Route to unified planner start
    navigate('/planner/start');
  };
  const handleDownloadBlankPlanner = async () => {
    setIsGeneratingPDF(true);
    toast({
      title: "Preparing your file...",
      description: "This may take a moment."
    });
    
    try {
      await generateManuallyFillablePDF({});
      toast({
        title: "Download started",
        description: "Your blank planner form has been downloaded."
      });
    } catch (error) {
      console.error("Error generating blank PDF:", error);
      toast({
        title: "Download failed",
        description: "We couldn't generate your printable file. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGeneratingPDF(false);
    }
  };
  const handleGenerateAfterDeathPDF = async () => {
    try {
      await generateBlankAfterLifePlanPDF();
      toast({
        title: "PDF Generated",
        description: "Your After-Death Planner document has been generated successfully."
      });
    } catch (error) {
      console.error("Error generating After-Death PDF:", error);
      toast({
        title: "Error",
        description: "Failed to generate PDF. Please try again.",
        variant: "destructive"
      });
    }
  };
  const handleVIPMonthly = async () => {
    const successUrl = `${window.location.origin}/purchase-success?type=vip`;
    
    const needsLogin = await queueCheckoutAndGoLogin("EFAVIPMONTHLY", successUrl);
    if (needsLogin) return;

    try {
      const { data, error } = await supabase.functions.invoke("stripe-create-checkout", {
        body: {
          lookupKey: "EFAVIPMONTHLY",
          successUrl,
          cancelUrl: `${window.location.origin}/dashboard`,
          allowPromotionCodes: true
        }
      });
      if (error) {
        console.error("VIP Monthly checkout error:", error);
        toast({
          title: "Checkout failed",
          description: error.message || "Unable to start checkout. Please try again.",
          variant: "destructive"
        });
        return;
      }
      if (data?.url) {
        window.location.href = data.url;
      } else {
        toast({
          title: "Error",
          description: "No checkout URL received. Please try again.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    }
  };
  const handleVIPYearly = async () => {
    const successUrl = `${window.location.origin}/purchase-success?type=vip`;
    
    const needsLogin = await queueCheckoutAndGoLogin("EFAVIPYEAR", successUrl);
    if (needsLogin) return;

    try {
      const { data, error } = await supabase.functions.invoke("stripe-create-checkout", {
        body: {
          lookupKey: "EFAVIPYEAR",
          successUrl,
          cancelUrl: `${window.location.origin}/dashboard`,
          allowPromotionCodes: true
        }
      });
      if (error) {
        console.error("VIP Yearly checkout error:", error);
        toast({
          title: "Checkout failed",
          description: error.message || "Unable to start checkout. Please try again.",
          variant: "destructive"
        });
        return;
      }
      if (data?.url) {
        window.location.href = data.url;
      } else {
        toast({
          title: "Error",
          description: "No checkout URL received. Please try again.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    }
  };
  const handlePremiumSubscription = async () => {
    const successUrl = `${window.location.origin}/purchase-success?type=premium`;
    
    const needsLogin = await queueCheckoutAndGoLogin("EFAPREMIUM", successUrl);
    if (needsLogin) return;

    try {
      const { data, error } = await supabase.functions.invoke("stripe-create-checkout", {
        body: {
          lookupKey: "EFAPREMIUM",
          successUrl,
          cancelUrl: `${window.location.origin}/dashboard`,
          allowPromotionCodes: true
        }
      });
      if (error) {
        console.error("Checkout error:", error);
        toast({
          title: "Checkout failed",
          description: error.message || "Unable to start checkout. Please try again.",
          variant: "destructive"
        });
        return;
      }
      if (data?.url) {
        window.location.href = data.url;
      } else {
        toast({
          title: "Error",
          description: "No checkout URL received. Please try again.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    }
  };
  const handleBookDoItForYou = async () => {
    const successUrl = `${window.location.origin}/purchase-success?type=done_for_you`;
    
    const needsLogin = await queueCheckoutAndGoLogin("EFADOFORU", successUrl);
    if (needsLogin) return;

    try {
      const { data, error } = await supabase.functions.invoke("stripe-create-checkout", {
        body: {
          lookupKey: "EFADOFORU",
          successUrl,
          cancelUrl: `${window.location.origin}/dashboard`,
          allowPromotionCodes: true
        }
      });
      if (error) {
        console.error('Stripe function error:', error);
        toast({
          title: "Checkout failed",
          description: "Unable to start checkout. Please try again.",
          variant: "destructive"
        });
        return;
      }
      if (data?.url) {
        window.location.href = data.url;
      } else {
        toast({
          title: "Error",
          description: "No checkout URL received. Please try again.",
          variant: "destructive"
        });
      }
    } catch (error: any) {
      console.error('Checkout error:', error);
      toast({
        title: "Checkout failed",
        description: error.message || "Unable to start checkout. Please try again.",
        variant: "destructive"
      });
    }
  };
  return <AuthenticatedLayout>
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Resume Card - Shows if user has previous activity */}
        <div className="mb-6">
          <ResumeCard />
        </div>

        {/* Planning Menu Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-2">Your Planning Menu</h1>
          <p className="text-muted-foreground max-w-4xl mx-auto mb-3">
            This is your planning menu. You can explore freely. Sign in only when you want to save, download, or continue.
          </p>
          <p className="text-sm text-muted-foreground/80 max-w-3xl mx-auto italic">
            {t('dashboard.autoSaveNote')}
          </p>
          <div className="mt-4 p-4 bg-muted/30 rounded-lg max-w-3xl mx-auto">
            <p className="text-sm text-muted-foreground leading-relaxed">
              <strong>{t('dashboard.pdfInstructionsTitle')}</strong> {t('dashboard.pdfInstructionsText')}
            </p>
          </div>
        </div>

        {/* Progress Tracker - Centered with connecting lines */}
        <div className="mb-12">
          <div className="flex justify-between items-center gap-2 max-w-4xl mx-auto relative">
            {/* Connecting line behind circles */}
            <div className="absolute top-6 left-0 right-0 h-0.5 bg-[hsl(210,100%,45%)]/30 -z-10" style={{
            marginLeft: '2.5rem',
            marginRight: '2.5rem'
          }}></div>
            
            {[t('dashboard.steps.planAhead'), t('dashboard.steps.getSupport'), t('dashboard.steps.shop'), t('dashboard.steps.personalTouch'), t('dashboard.steps.afterDeathGuide')].map((step, idx) => <div key={idx} className="flex flex-col items-center flex-1">
                <div className="w-12 h-12 rounded-full bg-[hsl(210,100%,45%)] text-white flex items-center justify-center font-semibold text-base mb-2 shadow-md">
                  {idx + 1}
                </div>
                <span className="text-xs text-center text-muted-foreground">{step}</span>
              </div>)}
          </div>
        </div>

        {/* My Planning Document Card */}
        <div className="mb-8">
          <MyPlanningDocumentCard hasData={progress > 0} />
        </div>

        {/* STEP 1 - My Planning Steps */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-full bg-[hsl(210,100%,45%)] text-white flex items-center justify-center font-bold text-lg shadow-md">
              1
            </div>
            <h2 className="text-2xl font-bold">My Planning Steps</h2>
          </div>
          
          <Card className="p-6">
            <div className="space-y-6">
              {/* Digital Planner - Simplified to ONE entry point */}
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <FileText className="h-4 w-4 text-primary" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold mb-2">Digital Planner</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {t('dashboard.option1DigitalDesc')}
                  </p>
                  {isFreePlan ? (
                    <div className="space-y-4">
                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                        <p className="text-sm text-amber-900 mb-3">
                          <strong>{t('dashboard.upgradeRequired')}</strong> {t('dashboard.upgradeRequiredDesc')}
                        </p>
                        <Button onClick={handlePremiumSubscription} className="bg-[hsl(210,100%,35%)] hover:bg-[hsl(210,100%,30%)] text-white whitespace-normal h-auto py-2">
                          {t('dashboard.subscribeToPremium')}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Button 
                        onClick={handleStartDigitalPlanner} 
                        className="bg-[hsl(210,100%,35%)] hover:bg-[hsl(210,100%,30%)] whitespace-normal h-auto py-3 px-6"
                      >
                        Start Digital Planner
                      </Button>
                      <Button 
                        onClick={handleGeneratePDF} 
                        variant="outline" 
                        className="border-2 border-[hsl(210,100%,35%)] text-[hsl(210,100%,35%)] bg-white hover:bg-[hsl(210,100%,35%)]/10 whitespace-normal h-auto py-3 px-6"
                      >
                        Printable Version
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              <div className="border-t pt-6" />

              {/* Option 2: Printable Documents */}
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Printer className="h-4 w-4 text-primary" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold mb-2">Printable Documents</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {t('dashboard.option2PrintableDesc')}
                  </p>
                  <div className="flex flex-col sm:flex-row flex-wrap gap-2">
                    {hasPrintableAccess && <Button onClick={handleDownloadBlankPlanner} disabled={isGeneratingPDF} variant="outline" className="w-full sm:w-auto sm:flex-1 border-2 border-[hsl(210,100%,35%)] bg-blue-800 hover:bg-blue-700 text-primary-foreground whitespace-normal h-auto py-2">
                        {isGeneratingPDF ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Preparing...</> : t('dashboard.downloadBlankPlannerForm')}
                      </Button>}
                    {!hasPrintableAccess && <Button onClick={handleDownloadWorkbook} className="w-full sm:w-auto sm:flex-1 bg-[hsl(210,100%,35%)] hover:bg-[hsl(210,100%,30%)] whitespace-normal h-auto py-2">
                        {t('dashboard.purchase')}
                      </Button>}
                    <Button onClick={handlePurchaseBinder} variant="outline" className="w-full sm:w-auto sm:flex-1 border-2 border-[hsl(210,100%,35%)] text-[hsl(210,100%,35%)] bg-white hover:bg-[hsl(210,100%,35%)]/10 whitespace-normal h-auto py-2">
                      {t('dashboard.purchasePhysicalBinder')}
                    </Button>
                  </div>
                </div>
              </div>

              <div className="border-t pt-6" />

              {/* Option 3: Do-It-For-You Planning */}
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Users className="h-4 w-4 text-primary" />
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold">Do-It-For-You Planning</h3>
                    <span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 text-xs font-medium rounded">{t('dashboard.popular')}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    We help organize your wishes and complete the planning with you.
                  </p>
                  <div className="flex flex-col sm:flex-row flex-wrap gap-2">
                    <Button onClick={handleBookDoItForYou} className="w-full sm:w-auto sm:flex-1 bg-primary-foreground text-blue-700 whitespace-normal h-auto py-2">
                      Request Do-It-For-You Planning
                    </Button>
                    <Button onClick={handleDownloadWorkbook} variant="outline" className="w-full sm:w-auto sm:flex-1 border-2 border-[hsl(210,100%,35%)] text-[hsl(210,100%,35%)] bg-white hover:bg-[hsl(210,100%,35%)]/10 whitespace-normal h-auto py-2">
                      {t('dashboard.purchasePhysicalBinder')}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* STEP 2 - CARE Support */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-full bg-[hsl(210,100%,45%)] text-white flex items-center justify-center font-bold text-lg shadow-md">
              2
            </div>
            <h2 className="text-2xl font-bold">CARE Support</h2>
          </div>
          
          <Card className="p-6 bg-amber-50/50 border-amber-200">
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                  <Star className="h-4 w-4 text-amber-600" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold mb-2">Personal planning help from Claire</h3>
                <p className="text-muted-foreground mb-4">
                  CARE Support goes beyond planning—offering compassionate check-ins, help during moments of distress, and steady guidance before or after a loss.
                </p>
                <ul className="space-y-2 mb-4 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-amber-600 mt-1">✓</span>
                    <span>One-on-one guidance through your planning steps</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-600 mt-1">✓</span>
                    <span>Help organizing thoughts when decisions feel heavy</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-600 mt-1">✓</span>
                    <span>Clear explanations without pressure or sales</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-600 mt-1">✓</span>
                    <span>A real assistant who walks at your pace</span>
                  </li>
                </ul>
                {hasVIPAccess ? <Button onClick={() => navigate('/care-support')} className="bg-[hsl(210,100%,35%)] hover:bg-[hsl(210,100%,30%)] min-h-[48px]">
                    Talk to Claire
                  </Button> : <div className="flex flex-wrap gap-3">
                    <Button onClick={handleVIPMonthly} className="bg-[hsl(210,100%,35%)] hover:bg-[hsl(210,100%,30%)] min-h-[48px]">
                      Get CARE Support
                    </Button>
                    <Button onClick={handleVIPYearly} variant="outline" className="border-2 border-[hsl(210,100%,35%)] text-[hsl(210,100%,35%)] bg-white hover:bg-[hsl(210,100%,35%)]/10 min-h-[48px]">
                      Yearly CARE Support (Save 20%)
                    </Button>
                  </div>}
              </div>
            </div>
          </Card>
        </div>

        {/* STEP 3 - Shop */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-full bg-[hsl(210,100%,45%)] text-white flex items-center justify-center font-bold text-lg shadow-md">
              3
            </div>
            <h2 className="text-2xl font-bold">{t('dashboard.steps.shop')}</h2>
          </div>
          
          <Card className="p-6 border-2 border-blue-400 bg-gradient-to-br from-blue-50 to-blue-100/50 relative">
            <div className="absolute top-4 right-4">
              <span className="px-3 py-1 bg-red-500 text-white text-xs font-semibold rounded-full">{t('dashboard.highDemand')}</span>
            </div>
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <ShoppingBag className="h-4 w-4 text-blue-600" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold mb-2">{t('dashboard.casketsUrnsFlowers')}</h3>
                <p className="text-muted-foreground mb-4">
                  {t('dashboard.shopDesc')}
                </p>
                <div className="flex justify-start">
                  <Button onClick={() => window.open('https://everlastingfuneraladvisors.com/shop/', '_blank')} size="sm" className="bg-[hsl(210,100%,35%)] hover:bg-[hsl(210,100%,30%)]">
                    {t('dashboard.browseProducts')}
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* STEP 4 - Custom Memorial Song */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-full bg-[hsl(210,100%,45%)] text-white flex items-center justify-center font-bold text-lg shadow-md">
              4
            </div>
            <h2 className="text-2xl font-bold">{t('dashboard.customSong')}</h2>
          </div>
          
          <Card className="p-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Music className="h-4 w-4 text-primary" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold mb-2">{t('dashboard.createUniqueTributeSong')}</h3>
                <p className="text-muted-foreground mb-4">
                  {t('dashboard.customSongDesc')}
                </p>
                <div className="flex justify-start">
                  <Button onClick={() => navigate('/products/custom-song')} size="sm" className="bg-[hsl(210,100%,35%)] hover:bg-[hsl(210,100%,30%)]">
                    {t('dashboard.createSong')}
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* STEP 5 - After-Death Planner */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-full bg-[hsl(210,100%,45%)] text-white flex items-center justify-center font-bold text-lg shadow-md">
              5
            </div>
            <h2 className="text-2xl font-bold">{t('dashboard.afterDeathPlanner')}</h2>
          </div>
          
          <Card className="p-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <ListChecks className="h-4 w-4 text-primary" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold mb-2">{t('dashboard.guidedStepsAfterLoss')}</h3>
                <p className="text-muted-foreground mb-4">
                  {t('dashboard.afterDeathDesc')}
                </p>
                <div className="flex flex-col sm:flex-row flex-wrap gap-2">
                  <Button onClick={() => navigate('/after-death')} className="w-full sm:w-auto sm:flex-1 bg-[hsl(210,100%,35%)] hover:bg-[hsl(210,100%,30%)] whitespace-normal h-auto py-2">
                    {t('dashboard.openAfterDeathPlanner')}
                  </Button>
                  <Button onClick={handleGenerateAfterDeathPDF} className="w-full sm:w-auto sm:flex-1 bg-[hsl(210,100%,35%)] hover:bg-[hsl(210,100%,30%)] whitespace-normal h-auto py-2">
                    {t('dashboard.getPrintableDocument')}
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Checklists Section */}
        <div className="mb-12">
          <ChecklistsSection />
        </div>

        {/* STEP 6 - Helpful Guides & Planning Support */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Helpful Guides & Planning Support</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/resources')}>
              <div className="flex flex-col items-center text-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                  <BookOpen className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-semibold">Helpful Guides</h3>
              </div>
            </Card>
            
            <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/legal-documents')}>
              <div className="flex flex-col items-center text-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
                  <Scale className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-semibold">Printable Documents</h3>
              </div>
            </Card>
            
            <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/faq')}>
              <div className="flex flex-col items-center text-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
                  <Lightbulb className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-semibold">{t('dashboard.tiles.questions.title')}</h3>
              </div>
            </Card>
            
            <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/vendors')}>
              <div className="flex flex-col items-center text-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
                  <Phone className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-semibold">{t('dashboard.tiles.vendors.title')}</h3>
              </div>
            </Card>
            
            <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/events')}>
              <div className="flex flex-col items-center text-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center">
                  <CalendarDays className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-semibold">{t('dashboard.tiles.events.title', 'Events')}</h3>
              </div>
            </Card>
          </div>
        </div>

        {/* Travel Death Protection - Optional Planning Tool */}
        <div className="mb-12">
          <Card className="p-6 border-l-4 border-l-sky-500">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-sky-500 to-sky-600 flex items-center justify-center">
                  <Plane className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-xl font-semibold">{t('dashboard.travelProtection.title', 'Travel Death Protection')}</h3>
                  <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded">
                    {t('dashboard.travelProtection.optional', 'Optional')}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  {t('dashboard.travelProtection.subtitle', 'One Less Thing for Your Family to Worry About')}
                </p>
                <p className="text-muted-foreground mb-4">
                  {t('dashboard.travelProtection.description', 'If someone passes away while traveling far from home, the cost and logistics can be overwhelming. This travel protection plan covers the coordination and transportation needed to bring your loved one home. It works worldwide and is paid once, not monthly.')}
                </p>
                <div className="bg-muted/50 rounded-lg p-3 mb-4">
                  <p className="text-sm font-medium mb-2">{t('dashboard.travelProtection.bestFor', 'Best for:')}</p>
                  <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                    <span>• {t('dashboard.travelProtection.frequentTravelers', 'Frequent travelers')}</span>
                    <span>• {t('dashboard.travelProtection.snowbirds', 'Snowbirds')}</span>
                    <span>• {t('dashboard.travelProtection.retirees', 'Retirees')}</span>
                    <span>• {t('dashboard.travelProtection.militaryFamilies', 'Military families')}</span>
                  </div>
                </div>
                <Button 
                  onClick={() => navigate('/travel-protection')} 
                  variant="outline"
                  className="border-sky-500 text-sky-600 hover:bg-sky-50"
                >
                  {t('dashboard.travelProtection.learnMore', 'Learn More About Travel Protection')}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <PIICollectionDialog open={showPIIDialog} onOpenChange={setShowPIIDialog} onSubmit={handlePIISubmit} />
      <PlannerModeModal 
        open={showPlannerModeModal} 
        onOpenChange={setShowPlannerModeModal} 
        onContinue={handlePlannerModeSelected} 
      />
    </AuthenticatedLayout>;
}