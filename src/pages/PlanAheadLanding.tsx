import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, FileText, CheckCircle, Users, Laptop, BookOpen, Loader2, Printer, Star, HandHelping, Eye } from "lucide-react";
import { PublicHeader } from "@/components/PublicHeader";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { AppFooter } from "@/components/AppFooter";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export default function PlanAheadLanding() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleStartPlanning = async () => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate("/login?redirect=/app");
        return;
      }

      const { data: subscription } = await supabase
        .from('subscriptions')
        .select('plan_type, status')
        .eq('user_id', user.id)
        .single();

      if (subscription?.status === 'active' && ['premium', 'vip', 'do_it_for_you'].includes(subscription.plan_type)) {
        navigate("/app");
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
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/login?redirect=/plan-ahead");
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
  };

  const handlePurchaseBinder = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/login?redirect=/plan-ahead");
        return;
      }
      
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
  };

  const handlePurchaseDoItForYou = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/login?redirect=/plan-ahead");
        return;
      }
      
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
  };

  const handlePreviewDashboard = () => {
    navigate("/dashboard?preview=true");
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
          
          {/* Pre-Planning Guide Embed */}
          <Card className="border-2 overflow-hidden mb-6">
            <CardHeader className="text-center bg-blue-50 border-b">
              <CardTitle className="flex items-center justify-center gap-2 text-blue-900">
                <BookOpen className="h-5 w-5" />
                Preview the Pre-Planning Guide
              </CardTitle>
              <CardDescription>
                This walk-through explains the sections, the choices, and how families typically use this information later.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="flex justify-center bg-muted/30">
                <iframe 
                  src="https://gamma.app/embed/om4wcs6irh1s18e" 
                  style={{ width: '700px', maxWidth: '100%', height: '450px' }} 
                  allow="fullscreen" 
                  title="EFA Pre-Planning Guide" 
                  className="border-0" 
                />
              </div>
            </CardContent>
          </Card>

          {/* Checklist Preview */}
          <Card className="border-2 overflow-hidden">
            <CardHeader className="text-center bg-green-50 border-b">
              <CardTitle className="flex items-center justify-center gap-2 text-green-900">
                <FileText className="h-5 w-5" />
                Pre-Planning Checklist Preview
              </CardTitle>
              <CardDescription>
                See what you'll be documenting
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="flex justify-center bg-muted/30">
                <iframe 
                  src="https://gamma.app/embed/plsn9a9j7cvzdh5" 
                  style={{ width: '700px', maxWidth: '100%', height: '450px' }} 
                  allow="fullscreen" 
                  title="Pre-Planning Checklist" 
                  className="border-0" 
                />
              </div>
            </CardContent>
          </Card>
          
          <div className="flex justify-center mt-6">
            <a 
              href="/checklists/Pre-Planning-Checklist-2.png" 
              download="Pre-Planning-Checklist.png"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium min-h-[48px]"
            >
              <Download className="h-4 w-4" />
              Download Checklist Image
            </a>
          </div>
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
                    Preview Dashboard First
                  </Button>
                  <Button onClick={handleStartPlanning} disabled={isLoading} className="w-full min-h-[48px]">
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    Access Digital Planner
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
                    <CardTitle className="text-lg">Done-For-You Planning</CardTitle>
                    <span className="text-xs text-muted-foreground">One-time service</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  For those who do not want to manage the process themselves.
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
                  Get Started
                </Button>
              </CardContent>
            </Card>

            {/* Preview Card */}
            <Card className="border-2 border-dashed bg-muted/20">
              <CardContent className="py-8 text-center flex flex-col items-center justify-center h-full">
                <Eye className="h-8 w-8 text-muted-foreground mb-3" />
                <h3 className="font-semibold mb-2">Not Sure Yet?</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Explore the dashboard in preview mode. See the structure before committing.
                </p>
                <Button onClick={handlePreviewDashboard} variant="outline" className="min-h-[48px]">
                  Preview Dashboard
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
                    <CardTitle className="text-lg">Compassionate Guidance</CardTitle>
                    <span className="text-xs text-muted-foreground">Optional upgrade</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  One-on-one support with a planning guide. Calm explanations without sales pressure.
                </p>
                <p className="text-xs text-muted-foreground mb-4 italic">
                  Best for: Anyone who wants a human voice during a sensitive process.
                </p>
                <Link to="/vip-coach">
                  <Button variant="outline" className="w-full min-h-[48px]">
                    Talk With a Planning Guide
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
