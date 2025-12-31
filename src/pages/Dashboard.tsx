import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import { FileText, Star, BookOpen, Scale, Phone, Music, Printer, Users, ListChecks, ShoppingBag, Lightbulb, CalendarDays, Plane, ClipboardList, Loader2, ArrowRight, Heart } from "lucide-react";
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
import { usePlanDataStatus } from "@/hooks/usePlanDataStatus";

export default function Dashboard() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

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
      return true;
    }
    return false;
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
  
  const planDataStatus = usePlanDataStatus();

  useEffect(() => {
    const loadUserData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const freePlan = await checkIsFreePlan();
      setIsFreePlan(freePlan);

      const vipAccess = await checkVIPAccess();
      setHasVIPAccess(vipAccess);

      const printableAccess = await checkPrintableAccess();
      setHasPrintableAccess(printableAccess);

      const { data: profile } = await supabase.from("profiles").select("full_name").eq("id", user.id).single();
      if (profile?.full_name) {
        const name = profile.full_name.split(" ")[0];
        setFirstName(name);
      }

      const { data: orgMember } = await supabase.from("org_members").select("org_id").eq("user_id", user.id).eq("role", "owner").maybeSingle();
      
      if (orgMember) {
        const { data: settings } = await supabase.from("user_settings").select("selected_sections").eq("user_id", user.id).maybeSingle();
        const selectedSections = settings?.selected_sections || [];
        if (selectedSections.length > 0) {
          const { data: plan } = await supabase.from("plans").select("*").eq("org_id", orgMember.org_id).eq("owner_user_id", user.id).maybeSingle();
          
          if (plan) {
            let sectionsWithData = 0;
            const noteFields = ['instructions_notes', 'about_me_notes', 'checklist_notes', 'funeral_wishes_notes', 'financial_notes', 'insurance_notes', 'property_notes', 'pets_notes', 'digital_notes', 'legal_notes', 'messages_notes', 'to_loved_ones_message'];
            noteFields.forEach(field => {
              if (plan[field] && plan[field].trim().length > 0) {
                sectionsWithData++;
              }
            });

            const calculatedProgress = Math.round(sectionsWithData / selectedSections.length * 100);
            setProgress(calculatedProgress);

            await supabase.from("plans").update({
              percent_complete: calculatedProgress
            }).eq("id", plan.id);
          }
        }
      }
    };
    loadUserData();
  }, []);

  const checkPaidAccess = checkPaidAccessFn;
  const checkIsFreePlan = checkIsFreePlanFn;
  const checkVIPAccess = checkVIPAccessFn;
  const checkPrintableAccess = checkPrintableAccessFn;

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
    navigate('/plan-ahead');
  };

  const handleViewSummary = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate('/preplan-summary');
      return;
    }

    const { data: orgMember } = await supabase
      .from('org_members')
      .select('org_id')
      .eq('user_id', user.id)
      .eq('role', 'owner')
      .maybeSingle();

    if (!orgMember) {
      toast({
        title: "No planning data yet",
        description: "Complete at least one section to generate a summary.",
      });
      navigate('/preplandashboard');
      return;
    }

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
    navigate('/planner/start');
  };

  const handleGeneratePDF = async () => {
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
        title: "Document Created",
        description: "Your planning document has been created successfully."
      });
    } catch (error) {
      console.error("Error generating document:", error);
      toast({
        title: "Error",
        description: "Failed to create your document. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleDownloadWorkbook = async () => {
    const successUrl = `${window.location.origin}/purchase-success?type=printable`;
    
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
        title: "Your file is ready",
        description: "Your blank planner form has been created."
      });
    } catch (error) {
      console.error("Error generating blank PDF:", error);
      toast({
        title: "Something went wrong",
        description: "We couldn't create your file. Please try again.",
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
        title: "Document Created",
        description: "Your After-Death Planner document has been created successfully."
      });
    } catch (error) {
      console.error("Error generating After-Death document:", error);
      toast({
        title: "Error",
        description: "Failed to create your document. Please try again.",
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

  return (
    <AuthenticatedLayout>
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Resume Card - Shows if user has previous activity */}
        <div className="mb-8">
          <ResumeCard />
        </div>

        {/* Page Title and Purpose */}
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold mb-3">My Planning Document</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            This page helps you write down your wishes and keep them in one place.
          </p>
        </div>

        {/* My Planning Document Card */}
        <div className="mb-10">
          <MyPlanningDocumentCard hasData={planDataStatus.hasAnyData} />
        </div>

        {/* ==================== SECTION A: PRIMARY ==================== */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6 text-primary">Write Down Your Wishes</h2>
          
          <Card className="p-8">
            <div className="space-y-6">
              {/* Primary Action - Start or Continue Planning */}
              <div className="text-center">
                {isFreePlan ? (
                  <div className="space-y-4">
                    <p className="text-muted-foreground mb-4">
                      To start writing down your wishes, you'll need a subscription.
                    </p>
                    <Button 
                      onClick={handlePremiumSubscription} 
                      size="lg"
                      className="min-h-[56px] px-8 text-lg"
                    >
                      Get Started
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button 
                      onClick={handleStartDigitalPlanner} 
                      size="lg"
                      className="min-h-[56px] px-8 text-lg"
                    >
                      {planDataStatus.hasAnyData ? "Continue Planning" : "Start Planning"}
                    </Button>
                    <Button 
                      onClick={handleViewSummary} 
                      variant="outline" 
                      size="lg"
                      className="min-h-[56px] px-8 text-lg border-2"
                    >
                      <Printer className="h-5 w-5 mr-2" />
                      Print or Save My Wishes
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </Card>
        </section>

        {/* ==================== SECTION B: GET HELP IF YOU WANT IT ==================== */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4 text-muted-foreground">Get Help If You Want It</h2>
          <p className="text-muted-foreground mb-6 text-lg leading-relaxed">
            You don't have to do this alone. Help is available at your pace.
          </p>
          
          <div className="grid gap-6 md:grid-cols-2">
            {/* CARE Support */}
            <Card className="p-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Heart className="h-6 w-6 text-primary" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-2">CARE Support</h3>
                  <p className="text-muted-foreground mb-4 leading-relaxed">
                    Personal planning help from Claire — a real person who walks at your pace.
                  </p>
                  {hasVIPAccess ? (
                    <Button 
                      onClick={() => navigate('/care-support')} 
                      className="min-h-[48px]"
                    >
                      Talk to Claire
                    </Button>
                  ) : (
                    <Button 
                      onClick={handleVIPMonthly} 
                      className="min-h-[48px]"
                    >
                      Get CARE Support
                    </Button>
                  )}
                </div>
              </div>
            </Card>

            {/* We Handle It For You */}
            <Card className="p-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-2">We Handle It For You</h3>
                  <p className="text-muted-foreground mb-4 leading-relaxed">
                    We help organize your wishes and complete the planning with you.
                  </p>
                  <Button 
                    onClick={handleBookDoItForYou} 
                    variant="outline"
                    className="min-h-[48px] border-2"
                  >
                    Request Help
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </section>

        {/* ==================== SECTION C: OTHER OPTIONS ==================== */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold mb-6 text-muted-foreground">Other Options</h2>
          
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {/* Shop */}
            <Card 
              className="p-5 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => window.open('https://everlastingfuneraladvisors.com/shop/', '_blank')}
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <ShoppingBag className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">Shop</h3>
                  <p className="text-sm text-muted-foreground">Caskets, urns, flowers</p>
                </div>
              </div>
            </Card>

            {/* Custom Memorial Song */}
            <Card 
              className="p-5 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => navigate('/products/custom-song')}
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Music className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">Custom Memorial Song</h3>
                  <p className="text-sm text-muted-foreground">A unique tribute song</p>
                </div>
              </div>
            </Card>

            {/* After-Death Planner */}
            <Card 
              className="p-5 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => navigate('/after-death')}
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <ListChecks className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">After-Death Planner</h3>
                  <p className="text-sm text-muted-foreground">Step-by-step guidance</p>
                </div>
              </div>
            </Card>

            {/* Travel Protection */}
            <Card 
              className="p-5 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => navigate('/travel-protection')}
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Plane className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">Travel Protection</h3>
                  <p className="text-sm text-muted-foreground">Coverage when traveling</p>
                </div>
              </div>
            </Card>

            {/* Helpful Guides */}
            <Card 
              className="p-5 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => navigate('/resources')}
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <BookOpen className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">Guides & Resources</h3>
                  <p className="text-sm text-muted-foreground">Helpful information</p>
                </div>
              </div>
            </Card>

            {/* Printable Documents */}
            <Card 
              className="p-5 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => navigate('/legal-documents')}
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">Printable Documents</h3>
                  <p className="text-sm text-muted-foreground">Forms you can print</p>
                </div>
              </div>
            </Card>
          </div>
        </section>

        {/* Checklists Section - Optional visual secondary */}
        <div className="mb-12 opacity-90">
          <ChecklistsSection />
        </div>
      </div>

      <PIICollectionDialog open={showPIIDialog} onOpenChange={setShowPIIDialog} onSubmit={handlePIISubmit} />
      <PlannerModeModal 
        open={showPlannerModeModal} 
        onOpenChange={setShowPlannerModeModal} 
        onContinue={handlePlannerModeSelected} 
      />
    </AuthenticatedLayout>
  );
}
