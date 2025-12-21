import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
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
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [learnOpen, setLearnOpen] = useState(false);
  const { isLoggedIn, hasPaidAccess, hasPrintableAccess, openLockedModal, saveLastVisitedRoute } = usePreviewModeContext();

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
    navigate("/planner-preview");
  };

  const handleUseStepByStepPlanner = async () => {
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
    const successUrl = `${window.location.origin}/purchase-success?type=printable`;

    if (!isLoggedIn) {
      queueCheckoutAndLogin("EFABASIC", successUrl);
      return;
    }

    if (hasPrintableAccess) {
      navigate("/dashboard");
      toast({
        title: "Access Granted",
        description: "You already have printable access. Visit your Planning Menu to download.",
      });
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      <PublicHeader />

      <main className="container mx-auto px-4 py-8 md:py-12">
        <Breadcrumbs className="mb-6" />

        {/* Hero Section */}
        <section className="max-w-3xl mx-auto text-center space-y-6 mb-12">
          <div className="flex justify-center mb-6">
            <img 
              src={mascotFamilyPlanning} 
              alt="Planning together" 
              className="w-full max-w-sm rounded-xl shadow-lg"
            />
          </div>
          <h1 className="text-3xl md:text-4xl font-serif font-bold">
            Plan Ahead
          </h1>
          <p className="text-xl text-muted-foreground">
            Simple steps to record your wishes and give your family clarity
          </p>
          <p className="text-muted-foreground">
            You can start by learning and previewing.<br />
            You only pay when you're ready to save, download, or get guided help.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button 
              onClick={handleStartPlanning}
              size="lg"
              className="min-h-[56px] text-lg px-8"
            >
              Start Planning
            </Button>
            <Button 
              variant="outline"
              size="lg"
              onClick={handlePreviewPlanner}
              className="min-h-[56px] text-lg"
            >
              <Eye className="h-4 w-4 mr-2" />
              Preview how this works
            </Button>
          </div>
        </section>

        {/* Section 1: What This Is */}
        <section className="max-w-3xl mx-auto mb-16">
          <Card className="border-none shadow-sm bg-muted/30">
            <CardContent className="p-6 md:p-8 space-y-4">
              <h2 className="text-2xl font-serif font-semibold text-center">
                Planning ahead doesn't have to be overwhelming
              </h2>
              <p className="text-muted-foreground text-center">
                This tool helps you organize your wishes in one place so your family is not left guessing later.
              </p>
              
              <div className="pt-4 space-y-3">
                <p className="font-medium">You can:</p>
                <ul className="space-y-2">
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span>Take things one step at a time</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span>Stop and come back anytime</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span>Choose the level of help that feels right</span>
                  </li>
                </ul>
              </div>
              
              <p className="text-center text-muted-foreground pt-4 font-medium">
                Nothing is final unless you choose to save or download.
              </p>
            </CardContent>
          </Card>
        </section>

        {/* Section 2: Choose How You Want to Plan */}
        <section className="max-w-3xl mx-auto mb-16">
          <h2 className="text-2xl md:text-3xl font-serif font-semibold text-center mb-2">
            Choose the approach that fits you
          </h2>
          <p className="text-muted-foreground text-center mb-8">
            Pick one. You can always change later.
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
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Option 2: Printable Planning Form */}
            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                    <Printer className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold">Printable Planning Form</h3>
                    <p className="text-muted-foreground mb-4">
                      Prefer to write things down or fill out a form?
                    </p>
                    <p className="text-sm font-medium mb-2">What this includes:</p>
                    <ul className="text-sm text-muted-foreground space-y-1 mb-4">
                      <li>• A printable planning form</li>
                      <li>• Fill it out at your own pace</li>
                      <li>• Keep a copy for your records</li>
                    </ul>
                    <Button 
                      onClick={handleGetPrintableForm}
                      disabled={isLoading}
                      variant="outline"
                      className="w-full sm:w-auto min-h-[48px]"
                    >
                      {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                      Get Printable Form
                    </Button>
                    <p className="text-xs text-muted-foreground mt-2">
                      Requires purchase to download.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Option 3: Extra Help (CARE Support) */}
            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                    <Heart className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold">Extra Help (Optional)</h3>
                    <p className="text-muted-foreground mb-4">
                      If planning feels overwhelming, you can add extra support.<br />
                      CARE Support gives you access to Claire, your planning assistant.
                    </p>
                    <Button 
                      onClick={handleLearnAboutCARE}
                      variant="outline"
                      className="w-full sm:w-auto min-h-[48px]"
                    >
                      Learn About CARE Support
                    </Button>
                    <p className="text-xs text-muted-foreground mt-2">
                      Optional. Cancel anytime.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Option 4: Do-It-For-You */}
            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                    <HandHelping className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold">Do-It-For-You Planning</h3>
                    <p className="text-muted-foreground mb-4">
                      If you'd rather not do this yourself, we can help.
                    </p>
                    <Button 
                      onClick={handleDoItForYou}
                      variant="outline"
                      className="w-full sm:w-auto min-h-[48px]"
                    >
                      Have Us Help You
                    </Button>
                    <p className="text-xs text-muted-foreground mt-2">
                      Someone will contact you to get started.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Section 3: What You Can Do for Free */}
        <section className="max-w-3xl mx-auto mb-16">
          <Card className="border-2 border-dashed bg-background">
            <CardContent className="p-6 md:p-8 space-y-4 text-center">
              <h2 className="text-2xl font-serif font-semibold">
                You can start without paying
              </h2>
              <p className="text-muted-foreground">
                Before you purchase anything, you can:
              </p>
              <ul className="text-left max-w-md mx-auto space-y-2">
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <span>Preview the planner</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <span>Learn what questions are asked</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <span>Review the checklist</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <span>Read guides and FAQs</span>
                </li>
              </ul>
              <Button 
                onClick={handlePreviewPlanner}
                variant="outline"
                size="lg"
                className="mt-4 min-h-[48px]"
              >
                <Eye className="h-4 w-4 mr-2" />
                Preview the Planner
              </Button>
            </CardContent>
          </Card>
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
                <span className="text-lg font-medium">Learn first (optional)</span>
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
              Start Planning
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
    </div>
  );
}
