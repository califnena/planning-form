import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Download, FileText, CheckCircle, Loader2, Printer, HandHelping, ChevronDown, ChevronUp, HelpCircle, Phone, MessageCircle, Heart, Eye } from "lucide-react";
import { PublicHeader } from "@/components/PublicHeader";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { AppFooter } from "@/components/AppFooter";
import mascotFamilyPlanning from "@/assets/mascot-family-planning.png";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { usePreviewModeContext } from "@/contexts/PreviewModeContext";
import { useAdminStatus } from "@/hooks/useAdminStatus";
import { isStoreIAP } from "@/lib/billingMode";
import { StoreIAPModal } from "@/components/StoreIAPModal";
import { setPendingCheckout } from "@/lib/pendingCheckout";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function PlanAheadLanding() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [learnOpen, setLearnOpen] = useState(false);
  
  const [hasPlannerProgress, setHasPlannerProgress] = useState(false);
  const [showIAPModal, setShowIAPModal] = useState(false);
  const [plannerMode, setPlannerMode] = useState<string | null>(null);
  const [isResuming, setIsResuming] = useState(false);
  const [showPrintableConfirmation, setShowPrintableConfirmation] = useState(false);
  const { isLoggedIn, hasPaidAccess, hasPrintableAccess, openLockedModal, saveLastVisitedRoute } = usePreviewModeContext();
  const { isAdmin } = useAdminStatus();

  // Handle resume logic
  useEffect(() => {
    const handleResume = async () => {
      const resume = searchParams.get('resume');
      if (resume !== '1') return;

      // Step 1: Confirm auth
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        // Redirect to login with return URL
        navigate('/login?return=/plan-ahead?resume=1');
        return;
      }

      setIsResuming(true);

      // Step 2: Get user's planner settings
      const { data: settings } = await supabase
        .from('user_settings')
        .select('planner_mode, selected_sections, last_step_index, completed_sections')
        .eq('user_id', user.id)
        .maybeSingle();

      const settingsData = settings as {
        planner_mode?: string;
        selected_sections?: string[];
        last_step_index?: number;
        completed_sections?: string[];
      } | null;

      // Step 3: Determine where to redirect - always go to planner dashboard
      navigate('/preplandashboard');
    };

    if (isLoggedIn !== undefined) {
      handleResume();
    }
  }, [searchParams, isLoggedIn, navigate]);

  // Check for planner progress on mount (for button labels)
  useEffect(() => {
    const checkProgress = async () => {
      if (!isLoggedIn) return;
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      const { data: settings } = await supabase
        .from('user_settings')
        .select('planner_mode, selected_sections')
        .eq('user_id', user.id)
        .maybeSingle();
      
      const hasProgress = !!(settings?.planner_mode || settings?.selected_sections);
      setHasPlannerProgress(hasProgress);
      setPlannerMode(settings?.planner_mode ?? null);
    };
    checkProgress();
  }, [isLoggedIn]);

  const queueCheckoutAndLogin = (lookupKey: string, successUrl: string) => {
    setPendingCheckout({
      lookupKey,
      successUrl,
      cancelUrl: window.location.href,
      postSuccessRedirect: "/dashboard",
    });
    saveLastVisitedRoute(location.pathname);
    openLockedModal("To save or download your plan, please sign in. You can preview everything first.");
  };

  const handlePreviewPlanner = () => {
    navigate("/planner-preview");
  };

  const handleStartPlanning = () => {
    if (isLoggedIn && hasPlannerProgress) {
      // Continue Planning → go to planner dashboard
      navigate("/preplandashboard");
    } else {
      // Start Digital Planner → go to planner dashboard (it handles onboarding)
      navigate("/preplandashboard");
    }
  };

  // Show loading state when resuming
  if (isResuming) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Resuming where you left off...</p>
        </div>
      </div>
    );
  }

  // Show printable form confirmation after download
  if (showPrintableConfirmation) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
        <PublicHeader />
        <main className="container mx-auto px-4 py-12 md:py-20">
          <div className="max-w-lg mx-auto text-center space-y-8">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
              <CheckCircle className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-3xl md:text-4xl font-serif font-bold">
              Your Printable Form Is Ready
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              You can print this form as many times as you wish and fill it out by hand.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button 
                onClick={() => setShowPrintableConfirmation(false)}
                size="lg"
                className="min-h-[48px]"
              >
                Return to Plan Ahead
              </Button>
              <Button 
                onClick={() => navigate("/products/binder")}
                variant="outline"
                size="lg"
                className="min-h-[48px]"
              >
                Learn About the Binder
              </Button>
            </div>
            <p className="text-sm text-muted-foreground pt-4">
              Want a physical binder to store your printed form?{" "}
              <Link to="/products/binder" className="underline hover:text-primary transition-colors">
                Order the Planning Binder
              </Link>
            </p>
          </div>
        </main>
        <AppFooter />
      </div>
    );
  }

  const handleUseStepByStepPlanner = async () => {
    if (isStoreIAP) {
      setShowIAPModal(true);
      return;
    }
    const successUrl = `${window.location.origin}/purchase-success?type=planner`;

    if (!isLoggedIn) {
      queueCheckoutAndLogin("EFAPREMIUM", successUrl);
      return;
    }

    if (hasPaidAccess) {
      // Route to unified planner start
      navigate("/planner/start");
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("stripe-create-checkout", {
        body: { lookupKey: "EFAPREMIUM", successUrl, cancelUrl: window.location.href },
      });
      if (error) throw error;
      if (data?.url) window.location.href = data.url;
    } catch (error) {
      console.error("Error:", error);
      toast({ title: "Error", description: "Unable to start checkout.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGetPrintableForm = async () => {
    // Admin bypass - always allow access and download
    if (isAdmin) {
      const link = document.createElement("a");
      link.href = "/templates/My-Final-Wishes-Blank-Form-2025-11-17.pdf";
      link.download = "My-Final-Wishes-Blank-Form.pdf";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setShowPrintableConfirmation(true);
      return;
    }

    if (isStoreIAP) {
      setShowIAPModal(true);
      return;
    }
    const successUrl = `${window.location.origin}/purchase-success?type=printable`;

    if (!isLoggedIn) {
      queueCheckoutAndLogin("EFABASIC", successUrl);
      return;
    }

    if (hasPrintableAccess) {
      // Directly download the PDF - no navigation or planner state changes
      const link = document.createElement("a");
      link.href = "/templates/My-Final-Wishes-Blank-Form-2025-11-17.pdf";
      link.download = "My-Final-Wishes-Blank-Form.pdf";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setShowPrintableConfirmation(true);
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("stripe-create-checkout", {
        body: { lookupKey: "EFABASIC", successUrl, cancelUrl: window.location.href },
      });
      if (error) throw error;
      if (data?.url) window.location.href = data.url;
    } catch (error) {
      console.error("Error:", error);
      toast({ title: "Error", description: "Unable to start checkout.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLearnAboutCARE = () => {
    navigate("/care-support");
  };

  const handleDoItForYou = () => {
    navigate("/do-it-for-you");
  };

  /**
   * Access Digital Planner button handler:
   * - Not signed in → prompt sign-in
   * - Signed in, not purchased → open Preview Mode
   * - Signed in + purchased → open full planner
   */
  const handleAccessDigitalPlanner = () => {
    if (!isLoggedIn) {
      // Not signed in - redirect to login with return URL
      saveLastVisitedRoute(location.pathname);
      navigate("/login?return=/preplandashboard");
      return;
    }
    
    // Signed in - navigate to planner (Preview Mode or Full access handled by context)
    navigate("/preplandashboard");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      <PublicHeader />

      <main className="container mx-auto px-4 py-8 md:py-12">
        <Breadcrumbs className="mb-6" />

        {/* Senior-Friendly Hero Section */}
        <section className="max-w-2xl mx-auto text-center space-y-6 mb-12">
          <div className="flex justify-center mb-6">
            <img 
              src={mascotFamilyPlanning} 
              alt="Planning together" 
              className="w-full max-w-xs rounded-xl shadow-lg"
            />
          </div>
          <h1 className="text-3xl md:text-4xl font-serif font-bold">
            Plan Ahead
          </h1>
          <p className="text-xl text-muted-foreground leading-relaxed">
            Review your plan, print it, or go back to continue planning.
          </p>
          
          {/* Primary Action Button */}
          <div className="flex flex-col gap-4 pt-6 max-w-md mx-auto">
            <Button 
              onClick={handleAccessDigitalPlanner}
              size="lg"
              className="w-full min-h-[60px] text-lg font-semibold"
            >
              Access Digital Planner
            </Button>
          </div>
        </section>

        {/* Section 2: Choose How You Want to Plan */}
        <section className="max-w-3xl mx-auto mb-16">
          <h2 className="text-2xl md:text-3xl font-serif font-semibold text-center mb-2">
            Recommended for You
          </h2>
          <p className="text-muted-foreground text-center mb-8">
            Start here. You can always change later.
          </p>

          <div className="space-y-6">
            {/* Option 1: Step-by-Step Digital Planner */}
            <Card className="border-2 hover:border-primary/50 transition-colors relative overflow-hidden">
              <Badge className="absolute top-4 right-4 bg-primary text-primary-foreground">
                Most people choose this
              </Badge>
              <CardContent className="p-6 pt-12 md:pt-6 space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <FileText className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold">Step-by-Step Digital Planner</h3>
                    <p className="text-muted-foreground mb-4">
                      You are guided through simple questions, one step at a time.
                    </p>
                    <p className="text-sm font-medium mb-2">What this includes:</p>
                    <ul className="text-sm text-muted-foreground space-y-1 mb-4">
                      <li>• Guided planning steps</li>
                      <li>• Ability to save and return</li>
                      <li>• Clear organization of your wishes</li>
                    </ul>
                    <Button 
                      onClick={handleUseStepByStepPlanner}
                      disabled={isLoading}
                      className="w-full sm:w-auto min-h-[48px]"
                    >
                      {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                      Use Step-by-Step Planner
                    </Button>
                    <p className="text-xs text-muted-foreground mt-2">
                      Requires a one-time purchase to save your plan.
                    </p>
                    <p className="text-sm text-muted-foreground mt-3">
                      Prefer to write by hand? You can use our <Link to="/printable-form" className="underline hover:text-primary transition-colors">Printable Planning Form (EFABASIC)</Link>.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Free Preview Note */}
            <div className="flex items-center justify-center gap-2 py-4 text-muted-foreground">
              <Eye className="h-4 w-4" />
              <span>You can <button onClick={handlePreviewPlanner} className="underline hover:text-primary transition-colors">preview the planner for free</button> before deciding.</span>
            </div>

            {/* Printable Planning Form - Visible Card */}
            <Card className="border-2 hover:border-primary/30 transition-colors">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                    <Printer className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold">Printable Planning Form (Fill by Hand)</h3>
                    <p className="text-muted-foreground mb-4">
                      Prefer pen and paper? Download and print a blank form to write in by hand. No computer required after printing.
                    </p>
                    <Button 
                      onClick={handleGetPrintableForm}
                      disabled={isLoading}
                      variant="outline"
                      className="w-full sm:w-auto min-h-[48px]"
                    >
                      {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                      Get Printable Form
                    </Button>
                    <p className="text-sm text-muted-foreground mt-3">
                      Want a physical binder to store your form?{" "}
                      <Link to="/products/binder" className="underline hover:text-primary transition-colors">
                        Order the Planning Binder
                      </Link>
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>


        {/* Section 4: Reassurance */}
        <section className="max-w-3xl mx-auto mb-16">
          <h2 className="text-2xl font-serif font-semibold text-center mb-6">
            A few things to know
          </h2>
          <Card className="border-none bg-muted/30">
            <CardContent className="p-6 md:p-8">
              <ul className="space-y-3 max-w-md mx-auto">
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <span>You are not required to buy anything</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <span>You can preview before deciding</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <span>You stay in control the entire time</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <span>You can stop and return later</span>
                </li>
              </ul>
              <p className="text-center text-muted-foreground mt-6 font-medium">
                This is about clarity, not pressure.
              </p>
            </CardContent>
          </Card>
        </section>

        {/* Learn First (Collapsed) */}
        <section className="max-w-3xl mx-auto mb-16">
          <Collapsible open={learnOpen} onOpenChange={setLearnOpen}>
            <CollapsibleTrigger asChild>
              <button className="w-full flex items-center justify-between p-4 rounded-lg border-2 border-dashed hover:border-primary/30 transition-colors">
                <span className="text-lg font-medium">Learn first</span>
                {learnOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
              </button>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-4 space-y-4">
              <Card className="border">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between gap-4 flex-wrap">
                    <div>
                      <h3 className="font-medium">Pre-Planning Guide</h3>
                      <p className="text-sm text-muted-foreground">Learn how funeral pre-planning works.</p>
                    </div>
                    <Button variant="outline" onClick={() => navigate('/plan-ahead/guide')}>
                      View Guide
                    </Button>
                  </div>
                </CardContent>
              </Card>
              <Card className="border">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between gap-4 flex-wrap">
                    <div>
                      <h3 className="font-medium">Pre-Planning Checklist</h3>
                      <p className="text-sm text-muted-foreground">A quick reference of what you'll document.</p>
                    </div>
                    <a href="/checklists/Pre-Planning-Checklist-2.png" download="Pre-Planning-Checklist.png">
                      <Button variant="outline" className="gap-2">
                        <Download className="h-4 w-4" />
                        Download
                      </Button>
                    </a>
                  </div>
                </CardContent>
              </Card>
            </CollapsibleContent>
          </Collapsible>
        </section>

        {/* Final CTA */}
        <section className="max-w-2xl mx-auto text-center mb-12">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={handleStartPlanning}
              size="lg"
              className="min-h-[56px] text-lg px-8"
            >
              Access Digital Planner
            </Button>
            <Button 
              variant="outline"
              size="lg"
              onClick={handlePreviewPlanner}
              className="min-h-[56px] text-lg"
            >
              Preview First
            </Button>
          </div>
        </section>
      </main>

      {/* Footer Note */}
      <div className="bg-muted/20 py-4">
        <p className="text-center text-sm text-muted-foreground px-4">
          Planning tools are for organizing wishes and preferences. They do not replace legal, medical, or financial advice.
        </p>
      </div>

      <AppFooter />

      {/* Sticky Help Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="lg" className="rounded-full shadow-lg min-h-[56px] gap-2">
              <HelpCircle className="h-5 w-5" />
              Need help?
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem onClick={() => navigate("/contact")}>
              <Phone className="h-4 w-4 mr-2" />
              Contact Us
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate("/care-support")}>
              <MessageCircle className="h-4 w-4 mr-2" />
              CARE Support
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate("/do-it-for-you")}>
              <HandHelping className="h-4 w-4 mr-2" />
              Do-It-For-You Planning
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <StoreIAPModal open={showIAPModal} onOpenChange={setShowIAPModal} />
    </div>
  );
}
