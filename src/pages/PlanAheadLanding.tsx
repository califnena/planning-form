import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Download, FileText, CheckCircle, Loader2, Printer, HandHelping, ChevronDown, ChevronUp, HelpCircle, Phone, MessageCircle } from "lucide-react";
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

  // Queue checkout and prompt login
  const queueCheckoutAndLogin = (lookupKey: string, successUrl: string) => {
    setPendingCheckout({
      lookupKey,
      successUrl,
      cancelUrl: window.location.href,
      postSuccessRedirect: "/dashboard",
    });
    saveLastVisitedRoute(location.pathname);
    openLockedModal("Sign in to continue with your purchase.");
  };

  const handleTryGuidedPlanning = () => {
    navigate("/preplansteps");
  };

  const handleContinueAndSave = async () => {
    if (!isLoggedIn) {
      saveLastVisitedRoute(location.pathname);
      openLockedModal("Sign in to save your progress.");
      return;
    }
    
    setIsLoading(true);
    try {
      if (hasPaidAccess) {
        navigate("/preplansteps");
      } else {
        navigate("/pricing");
      }
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadPrintable = async () => {
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

  const handleTalkToGuide = () => {
    navigate("/do-it-for-you");
  };

  const handlePurchaseBinder = async () => {
    const successUrl = `${window.location.origin}/purchase-success?type=binder`;

    if (!isLoggedIn) {
      queueCheckoutAndLogin("EFABINDER", successUrl);
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("stripe-create-checkout", {
        body: { lookupKey: "EFABINDER", successUrl, cancelUrl: window.location.href },
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-50 via-background to-background">
      <PublicHeader />

      <main className="container mx-auto px-4 py-8">
        <Breadcrumbs className="mb-6" />

        {/* Hero Section - Simplified with Mascot */}
        <div className="max-w-3xl mx-auto text-center space-y-4 mb-10">
          <div className="flex justify-center mb-4">
            <img 
              src={mascotFamilyPlanning} 
              alt="Planning together" 
              className="w-full max-w-md rounded-xl shadow-lg"
            />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground leading-tight">
            Plan Ahead. On Your Terms.
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Write down your wishes so your family doesn't have to guess.
          </p>
        </div>

        {/* How This Works Box */}
        <div className="max-w-2xl mx-auto mb-12">
          <Card className="border-2 bg-primary/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl text-center">How this works</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row justify-center gap-6 text-center">
                <div className="flex flex-col items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg">1</div>
                  <span className="text-sm text-muted-foreground">Pick a path</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg">2</div>
                  <span className="text-sm text-muted-foreground">Write down your wishes</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg">3</div>
                  <span className="text-sm text-muted-foreground">Save or print when ready</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ============ MAIN CHOOSER: 3 Big Buttons ============ */}
        <div className="max-w-2xl mx-auto mb-16">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold mb-2">Choose how you want to plan</h2>
            <p className="text-muted-foreground">Start with the easiest option. You can switch later.</p>
          </div>

          <div className="space-y-4">
            {/* Button 1: Guided Planning - RECOMMENDED */}
            <button
              onClick={handleTryGuidedPlanning}
              className="w-full text-left p-6 rounded-xl border-2 border-primary bg-primary/5 hover:bg-primary/10 transition-colors group relative"
            >
              <Badge className="absolute -top-3 left-4 bg-primary text-primary-foreground">
                Recommended
              </Badge>
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/30 transition-colors">
                  <FileText className="h-7 w-7 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-1">Start with Guided Planning</h3>
                  <p className="text-muted-foreground">We walk you through it step by step.</p>
                  <p className="text-sm text-primary mt-2">Best if you want help without pressure.</p>
                </div>
              </div>
            </button>

            {/* Button 2: Printable Form */}
            <button
              onClick={handleDownloadPrintable}
              disabled={isLoading}
              className="w-full text-left p-6 rounded-xl border-2 border-border hover:border-primary/50 bg-background hover:bg-muted/30 transition-colors group"
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center flex-shrink-0 group-hover:bg-muted/80 transition-colors">
                  <Printer className="h-7 w-7 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-1">Download Printable Form</h3>
                  <p className="text-muted-foreground">Write it down on paper.</p>
                </div>
                {isLoading && <Loader2 className="h-5 w-5 animate-spin" />}
              </div>
            </button>

            {/* Button 3: Talk to a Guide */}
            <button
              onClick={handleTalkToGuide}
              className="w-full text-left p-6 rounded-xl border-2 border-border hover:border-primary/50 bg-background hover:bg-muted/30 transition-colors group"
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center flex-shrink-0 group-hover:bg-muted/80 transition-colors">
                  <HandHelping className="h-7 w-7 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-1">Talk to a Planning Guide</h3>
                  <p className="text-muted-foreground">We help you complete it.</p>
                </div>
              </div>
            </button>
          </div>

          {/* Continue and Save */}
          <div className="mt-8 text-center space-y-3">
            <Button 
              onClick={handleContinueAndSave} 
              disabled={isLoading}
              size="lg"
              className="min-h-[56px] text-lg px-8"
            >
              {isLoading ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : null}
              Continue and Save
            </Button>
            <p className="text-sm text-muted-foreground">
              Sign in is only needed to save your progress.
            </p>
          </div>

          {/* Not sure yet link */}
          <div className="mt-6 text-center">
            <button
              onClick={() => navigate("/preplansteps")}
              className="text-sm text-muted-foreground hover:text-foreground underline"
            >
              Not sure yet? Preview the planner first
            </button>
          </div>
        </div>

        {/* ============ LEARN FIRST (Collapsed by default) ============ */}
        <div className="max-w-2xl mx-auto mb-16">
          <Collapsible open={learnOpen} onOpenChange={setLearnOpen}>
            <CollapsibleTrigger asChild>
              <button className="w-full flex items-center justify-between p-4 rounded-lg border-2 border-dashed hover:border-primary/30 transition-colors">
                <span className="text-lg font-medium">Learn first (optional)</span>
                {learnOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
              </button>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-4 space-y-4">
              {/* Pre-Planning Guide */}
              <Card className="border">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between gap-4">
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

              {/* Checklist */}
              <Card className="border">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <h3 className="font-medium">Pre-Planning Checklist</h3>
                      <p className="text-sm text-muted-foreground">A quick reference of what you'll document.</p>
                    </div>
                    <a 
                      href="/checklists/Pre-Planning-Checklist-2.png" 
                      download="Pre-Planning-Checklist.png"
                    >
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
        </div>

        {/* ============ OPTIONAL ADD-ONS (Lower priority) ============ */}
        <div className="max-w-2xl mx-auto mb-16">
          <h3 className="text-lg font-medium text-center mb-4 text-muted-foreground">
            Optional add-ons (only if you want them)
          </h3>
          
          <div className="grid sm:grid-cols-2 gap-4">
            {/* Binder */}
            <Card className="border">
              <CardContent className="p-4">
                <h4 className="font-medium mb-1">Planning Binder</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  A printed binder to keep everything in one place.
                </p>
                <Button variant="outline" size="sm" onClick={handlePurchaseBinder} className="w-full">
                  Add Binder
                </Button>
              </CardContent>
            </Card>

            {/* VIP Support */}
            <Card className="border">
              <CardContent className="p-4">
                <h4 className="font-medium mb-1">VIP Planning Support</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Extra help from a real person when you need it.
                </p>
                <Link to="/coach-assistant">
                  <Button variant="outline" size="sm" className="w-full">
                    Learn More
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Good to Know */}
        <div className="max-w-2xl mx-auto mb-16">
          <Card className="border bg-muted/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg text-center">Good to know</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground">No payment required to read the guide</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground">You only pay for tools you choose</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground">You can change your plan anytime</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </main>

      <AppFooter />

      {/* Sticky Help Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              size="lg" 
              className="rounded-full shadow-lg min-h-[56px] gap-2"
            >
              <HelpCircle className="h-5 w-5" />
              Need help?
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem onClick={() => navigate("/contact")}>
              <Phone className="h-4 w-4 mr-2" />
              Contact Us
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate("/coach-assistant")}>
              <MessageCircle className="h-4 w-4 mr-2" />
              VIP Planning Support
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
