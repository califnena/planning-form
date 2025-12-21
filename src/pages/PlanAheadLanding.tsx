import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, FileText, CheckCircle, Users, Laptop, BookOpen, Loader2, Printer, Star, HandHelping, Eye } from "lucide-react";
import { PublicHeader } from "@/components/PublicHeader";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { AppFooter } from "@/components/AppFooter";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { usePreviewModeContext } from "@/contexts/PreviewModeContext";

export default function PlanAheadLanding() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const { isLoggedIn, hasPaidAccess, hasPrintableAccess, hasVIPAccess, openLockedModal, saveLastVisitedRoute } = usePreviewModeContext();

  // Helper to require login before action
  const requireLogin = (action: () => void) => {
    if (!isLoggedIn) {
      saveLastVisitedRoute(location.pathname);
      openLockedModal("Sign in to continue with your purchase.");
      return;
    }
    action();
  };

  const handleStartPlanning = async () => {
    if (!isLoggedIn) {
      saveLastVisitedRoute(location.pathname);
      openLockedModal("Sign in to access the digital planner.");
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

  const handlePurchasePrintable = async () => {
    requireLogin(async () => {
      try {
        // If user already has printable access, download directly
        if (hasPrintableAccess) {
          navigate("/dashboard");
          toast({
            title: "Access Granted",
            description: "You already have printable access. Visit your dashboard to download."
          });
          return;
        }
        
        const { data, error } = await supabase.functions.invoke('stripe-create-checkout', {
          body: {
            lookupKey: 'EFABASIC',
            mode: 'payment',
            successUrl: `${window.location.origin}/purchase-success?type=printable`,
            cancelUrl: window.location.href
          }
        });
        if (error) throw error;
        if (data?.url) window.location.href = data.url;
      } catch (error) {
        console.error("Error:", error);
        toast({ title: "Error", description: "Unable to start checkout.", variant: "destructive" });
      }
    });
  };

  const handlePurchaseBinder = async () => {
    requireLogin(async () => {
      try {
        const { data, error } = await supabase.functions.invoke('stripe-create-checkout', {
          body: {
            lookupKey: 'EFABINDER',
            mode: 'payment',
            successUrl: `${window.location.origin}/purchase-success?type=binder`,
            cancelUrl: window.location.href
          }
        });
        if (error) throw error;
        if (data?.url) window.location.href = data.url;
      } catch (error) {
        console.error("Error:", error);
        toast({ title: "Error", description: "Unable to start checkout.", variant: "destructive" });
      }
    });
  };

  const handlePurchaseDoItForYou = async () => {
    requireLogin(async () => {
      try {
        const { data, error } = await supabase.functions.invoke('stripe-create-checkout', {
          body: {
            lookupKey: 'EFADOFORU',
            mode: 'payment',
            successUrl: `${window.location.origin}/purchase-success`,
            cancelUrl: window.location.href
          }
        });
        if (error) throw error;
        if (data?.url) window.location.href = data.url;
      } catch (error) {
        console.error("Error:", error);
        toast({ title: "Error", description: "Unable to start checkout.", variant: "destructive" });
      }
    });
  };

  const handleVIPSupport = () => {
    if (!isLoggedIn) {
      saveLastVisitedRoute(location.pathname);
      openLockedModal("Sign in to access VIP support.");
      return;
    }
    
    if (hasVIPAccess) {
      navigate("/vip-coach");
    } else {
      // Redirect to VIP checkout
      navigate("/pricing");
    }
  };

  const handlePreviewDashboard = () => {
    navigate("/dashboard-preview");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-50 via-background to-background">
      <PublicHeader />

      <main className="container mx-auto px-4 py-8">
        {/* Breadcrumbs */}
        <Breadcrumbs className="mb-6" />

        {/* Hero Section */}
        <div className="max-w-4xl mx-auto text-center space-y-6 mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground leading-tight">
            Plan Ahead. On Your Terms.
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Planning ahead means your family does not have to guess, argue, or scramble later.
            This guide helps you clearly document your wishes in a way that is practical, organized, and easy to update.
          </p>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            You can start slowly. Nothing is required upfront.<br />
            You only pay when you choose how much help you want.
          </p>
        </div>

        {/* What This Planner Helps You Do */}
        <div className="max-w-4xl mx-auto mb-16">
          <Card className="border-2">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">What This Planner Helps You Do</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 gap-4">
                {[
                  "Write down your funeral and memorial wishes",
                  "Choose burial or cremation preferences",
                  "Organize key instructions and contacts",
                  "Leave personal notes for your loved ones",
                  "Reduce stress, confusion, and rushed decisions later"
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">{item}</span>
                  </div>
                ))}
              </div>
              <div className="mt-6 pt-6 border-t text-center">
                <p className="text-muted-foreground italic">
                  This is not about making final decisions today.<br />
                  It is about making sure your voice is known.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ============ SECTION 1: LEARN ============ */}
        <div className="max-w-5xl mx-auto mb-20">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xl border-2 border-blue-200">
              1
            </div>
            <div>
              <span className="text-xs font-medium text-blue-600 uppercase tracking-wide">Step 1</span>
              <h2 className="text-2xl font-bold">Learn Before You Decide</h2>
              <p className="text-muted-foreground">Get a clear overview of what planning ahead actually involves and why it matters.</p>
            </div>
          </div>
          
          {/* Pre-Planning Guide Preview Tile */}
          <Card className="border-2 hover:border-primary/30 transition-colors cursor-pointer group" onClick={() => navigate('/plan-ahead/guide')}>
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-200 transition-colors">
                  <BookOpen className="h-7 w-7 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors">
                    Pre-Planning Guide
                  </h3>
                  <ul className="space-y-1.5 text-sm text-muted-foreground mb-4">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      Learn how funeral pre-planning works
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      Understand what decisions matter most
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      See how families use this information
                    </li>
                  </ul>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Eye className="h-4 w-4" />
                    View Guide
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Checklist Preview Tile */}
          <Card className="border-2 mt-6">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                  <FileText className="h-7 w-7 text-green-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-2">
                    Pre-Planning Checklist
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    A quick reference of what you'll be documenting—helpful to review before you begin.
                  </p>
                  <a 
                    href="/checklists/Pre-Planning-Checklist-2.png" 
                    download="Pre-Planning-Checklist.png"
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors font-medium"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Download className="h-4 w-4" />
                    Download Checklist
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>
          
        </div>

        {/* ============ SECTION 2: CHOOSE YOUR PATH ============ */}
        <div className="max-w-5xl mx-auto mb-20">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 rounded-full bg-green-100 text-green-600 flex items-center justify-center font-bold text-xl border-2 border-green-200">
              2
            </div>
            <div>
              <span className="text-xs font-medium text-green-600 uppercase tracking-wide">Step 2</span>
              <h2 className="text-2xl font-bold">Choose Your Path</h2>
              <p className="text-muted-foreground">You decide the level of support. Each option is separate and clearly priced.</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Option 1: Printable */}
            <Card className="border-2">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-stone-400 to-stone-600 flex items-center justify-center">
                    <Printer className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Printable Planning Form</CardTitle>
                    <span className="text-xs text-muted-foreground">One-time purchase</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  For those who prefer to write things down on paper at their own pace.
                </p>
                <ul className="space-y-2 mb-4 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    Clean, structured printable form
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    Fill out by hand or digitally
                  </li>
                </ul>
                <p className="text-xs text-muted-foreground mb-4 italic">
                  Best for: Independent planners who want a simple document.
                </p>
                <Button onClick={handlePurchasePrintable} className="w-full min-h-[48px]">
                  Purchase Printable Form
                </Button>
                <p className="text-xs text-center text-muted-foreground mt-2">
                  You can come back later. Nothing is lost.
                </p>
              </CardContent>
            </Card>

            {/* Option 2: Digital Step-by-Step */}
            <Card className="border-2 border-primary/30 bg-gradient-to-br from-primary/5 to-transparent">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                    <Laptop className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Step-by-Step Digital Planner</CardTitle>
                    <span className="text-xs text-primary font-medium">Digital access</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  For those who want guidance without pressure.
                </p>
                <ul className="space-y-2 mb-4 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    Walk-through format, one section at a time
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    Save progress as you go
                  </li>
                </ul>
                <p className="text-xs text-muted-foreground mb-4 italic">
                  Best for: People who want clarity and structure.
                </p>
                <div className="space-y-2">
                  <Button onClick={handlePreviewDashboard} variant="outline" className="w-full min-h-[48px] gap-2">
                    <Eye className="h-4 w-4" />
                    Preview Planning Menu First
                  </Button>
                  <Button onClick={handleStartPlanning} disabled={isLoading} className="w-full min-h-[48px]">
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    Begin Planning
                  </Button>
                </div>
                <p className="text-xs text-center text-muted-foreground mt-2">
                  Requires login to save progress
                </p>
              </CardContent>
            </Card>

            {/* Option 3: Do-It-For-You */}
            <Card className="border-2">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center">
                    <HandHelping className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Do-It-For-You Planning</CardTitle>
                    <span className="text-xs text-muted-foreground">One-time service</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  We help organize your wishes and complete the planning with you.
                </p>
                <ul className="space-y-2 mb-4 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    Guided consultation
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    We help organize your wishes
                  </li>
                </ul>
                <p className="text-xs text-muted-foreground mb-4 italic">
                  Best for: Busy individuals who want hands-on help.
                </p>
                <Button onClick={handlePurchaseDoItForYou} variant="outline" className="w-full min-h-[48px]">
                  Request Do-It-For-You Planning
                </Button>
              </CardContent>
            </Card>

            {/* Preview Card */}
            <Card className="border-2 border-dashed bg-muted/20">
              <CardContent className="py-8 text-center flex flex-col items-center justify-center h-full">
                <Eye className="h-8 w-8 text-muted-foreground mb-3" />
                <h3 className="font-semibold mb-2">Not Sure Yet?</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Explore the planning menu in preview mode. See the structure before committing.
                </p>
                <Button onClick={handlePreviewDashboard} variant="outline" className="min-h-[48px]">
                  Preview Planning Menu
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* ============ SECTION 3: ADD SUPPORT (Optional) ============ */}
        <div className="max-w-5xl mx-auto mb-16">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center font-bold text-xl border-2 border-amber-200">
              3
            </div>
            <div>
              <span className="text-xs font-medium text-amber-600 uppercase tracking-wide">Optional</span>
              <h2 className="text-2xl font-bold">Add Support</h2>
              <p className="text-muted-foreground">Additional tools and personal guidance—only if you want it.</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Binder */}
            <Card className="border-2">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
                    <BookOpen className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Physical Planning Binder</CardTitle>
                    <span className="text-xs text-muted-foreground">Optional add-on</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Durable, professionally organized binder. Easy for family members to find when needed.
                </p>
                <p className="text-xs text-muted-foreground mb-4 italic">
                  Best for: Households that want a single, physical reference point.
                </p>
                <Button onClick={handlePurchaseBinder} variant="outline" className="w-full min-h-[48px]">
                  Purchase Binder
                </Button>
              </CardContent>
            </Card>

            {/* Compassionate Guidance */}
            <Card className="border-2">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center">
                    <Star className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">VIP Planning Support</CardTitle>
                    <span className="text-xs text-muted-foreground">Optional upgrade</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  One-on-one guidance through your planning process.
                </p>
                <p className="text-xs text-muted-foreground mb-4 italic">
                  Best for: Anyone who wants a human voice during a sensitive process.
                </p>
                <Link to="/vip-coach">
                  <Button variant="outline" className="w-full min-h-[48px]">
                    Add VIP Planning Support
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Important to Know */}
        <div className="max-w-4xl mx-auto mb-16">
          <Card className="border-2 bg-muted/30">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Important to Know</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 gap-4 mb-6">
                {[
                  "You can start with education only. No payment required to preview.",
                  "You only pay for the tools or support you choose.",
                  "Your information stays private.",
                  "You can update your plans anytime."
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">{item}</span>
                  </div>
                ))}
              </div>
              <div className="text-center pt-4 border-t">
                <p className="text-muted-foreground italic text-lg">
                  Planning ahead is not about being finished.<br />
                  It is about being prepared.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <AppFooter />
    </div>
  );
}
