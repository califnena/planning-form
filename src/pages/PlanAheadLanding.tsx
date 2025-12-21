import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, FileText, Heart, CheckCircle, Users, Laptop, BookOpen, Loader2, Printer, Star, HandHelping } from "lucide-react";
import { LanguageSelector } from "@/components/LanguageSelector";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import logo from "@/assets/everlasting-logo.png";

export default function PlanAheadLanding() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [textSize, setTextSize] = useState<number>(100);

  const handleTextSizeChange = (direction: "increase" | "decrease") => {
    const newSize = direction === "increase" ? Math.min(textSize + 10, 150) : Math.max(textSize - 10, 80);
    setTextSize(newSize);
    document.documentElement.style.fontSize = `${newSize}%`;
  };

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

  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-50 via-background to-background">
      {/* Header */}
      <header className="border-b border-border sticky top-0 z-50 bg-background/95 backdrop-blur">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <img src={logo} alt="Everlasting Funeral Advisors" className="h-10 w-10" />
            <div>
              <h1 className="text-lg font-semibold text-primary">Everlasting Funeral Advisors</h1>
              <p className="text-xs text-muted-foreground">Plan Ahead Planner</p>
            </div>
          </Link>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 border border-border rounded-md px-3 py-1.5">
              <span className="text-sm text-muted-foreground font-medium">Text Size</span>
              <Button variant="ghost" size="sm" onClick={() => handleTextSizeChange("decrease")} className="h-7 px-2 font-semibold">
                A-
              </Button>
              <Button variant="ghost" size="sm" className="h-7 px-2 font-semibold pointer-events-none">
                A
              </Button>
              <Button variant="ghost" size="sm" onClick={() => handleTextSizeChange("increase")} className="h-7 px-2 font-semibold">
                A+
              </Button>
            </div>
            <LanguageSelector />
            <Link to="/login">
              <Button variant="outline" size="sm">Sign In</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="max-w-4xl mx-auto text-center space-y-6 mb-16">
          <div className="inline-flex items-center gap-2 text-primary px-4 py-2 rounded-full text-sm font-medium bg-amber-400">
            <Heart className="h-4 w-4" />
            A Gift of Peace and Clarity
          </div>
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

        {/* How It Works */}
        <div className="max-w-5xl mx-auto mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          
          {/* Step 1: Learn Before You Decide */}
          <div className="mb-16">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-xl">
                1
              </div>
              <div>
                <h3 className="text-2xl font-semibold">Learn Before You Decide</h3>
                <p className="text-muted-foreground">Get a clear overview of what planning ahead actually involves and why it matters.</p>
              </div>
            </div>
            
            <Card className="border-2 overflow-hidden">
              <CardHeader className="text-center bg-primary/5 border-b">
                <CardTitle className="flex items-center justify-center gap-2">
                  <BookOpen className="h-5 w-5 text-primary" />
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
          </div>

          {/* Step 2: Choose How You Want to Plan */}
          <div>
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-xl">
                2
              </div>
              <div>
                <h3 className="text-2xl font-semibold">Choose How You Want to Plan</h3>
                <p className="text-muted-foreground">You decide the level of support. Each option is separate and clearly priced.</p>
              </div>
            </div>

            <div className="space-y-6">
              {/* Option 1: Printable Planning Form */}
              <Card className="border-2">
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-stone-400 to-stone-600 flex items-center justify-center flex-shrink-0">
                      <Printer className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <CardTitle className="text-xl">Option 1: Printable Planning Form</CardTitle>
                        <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded">One-time purchase</span>
                      </div>
                      <CardDescription className="text-base">
                        For those who prefer to write things down on paper at their own pace.
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 mb-4">
                    {[
                      "Clean, structured printable planning form",
                      "Fill it out by hand or digitally",
                      "No step-by-step guidance included",
                      "Keep it for your records or your binder"
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                  <p className="text-sm text-muted-foreground mb-4">
                    <strong>Best for:</strong> Independent planners who want a simple, physical document.
                  </p>
                  <Button onClick={handlePurchasePrintable} className="min-h-[48px]">
                    Purchase Printable Form
                  </Button>
                </CardContent>
              </Card>

              {/* Option 2: Step-by-Step Guided Planner */}
              <Card className="border-2 border-primary/30 bg-gradient-to-br from-primary/5 to-transparent">
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center flex-shrink-0">
                      <Laptop className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <CardTitle className="text-xl">Option 2: Step-by-Step Guided Planner</CardTitle>
                        <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded">Digital access</span>
                      </div>
                      <CardDescription className="text-base">
                        For those who want guidance without pressure.
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 mb-4">
                    {[
                      "Walk-through format, one section at a time",
                      "Plain-language explanations",
                      "Save progress as you go",
                      "Update anytime"
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                  <p className="text-sm text-muted-foreground mb-4">
                    <strong>Best for:</strong> People who want clarity and structure without feeling rushed.
                  </p>
                  <Button onClick={handleStartPlanning} disabled={isLoading} className="min-h-[48px]">
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    Access Digital Planner
                  </Button>
                </CardContent>
              </Card>

              {/* Option 3: Physical Planning Binder */}
              <Card className="border-2">
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center flex-shrink-0">
                      <BookOpen className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <CardTitle className="text-xl">Option 3: Physical Planning Binder</CardTitle>
                        <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded">Optional add-on</span>
                      </div>
                      <CardDescription className="text-base">
                        For those who want everything organized in one place.
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 mb-4">
                    {[
                      "Durable, professionally organized binder",
                      "Designed to hold your completed forms",
                      "Easy for family members to find when needed"
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                  <p className="text-sm text-muted-foreground mb-4">
                    <strong>Best for:</strong> Households that want a single, physical reference point.
                  </p>
                  <Button onClick={handlePurchaseBinder} variant="outline" className="min-h-[48px]">
                    Purchase Binder
                  </Button>
                </CardContent>
              </Card>

              {/* Option 4: VIP Planning Support */}
              <Card className="border-2">
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center flex-shrink-0">
                      <Star className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <CardTitle className="text-xl">Option 4: Compassionate Guidance</CardTitle>
                        <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded">Optional upgrade</span>
                      </div>
                      <CardDescription className="text-base">
                        For those who want reassurance and personal guidance.
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 mb-4">
                    {[
                      "One-on-one support with a planning guide",
                      "Help thinking through difficult choices",
                      "Calm explanations without sales pressure",
                      "Go at your own pace"
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                  <p className="text-sm text-muted-foreground mb-4">
                    <strong>Best for:</strong> Anyone who wants a human voice during a sensitive process.
                  </p>
                  <Link to="/vip-coach">
                    <Button variant="outline" className="min-h-[48px]">
                      Talk With a Planning Guide
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              {/* Option 5: Do-It-For-You Planning */}
              <Card className="border-2">
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center flex-shrink-0">
                      <HandHelping className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <CardTitle className="text-xl">Option 5: Done-For-You Planning</CardTitle>
                        <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded">One-time service</span>
                      </div>
                      <CardDescription className="text-base">
                        For those who do not want to manage the process themselves.
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 mb-4">
                    {[
                      "Guided consultation",
                      "We help organize your wishes and information",
                      "You review and approve everything"
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                  <p className="text-sm text-muted-foreground mb-4">
                    <strong>Best for:</strong> Busy individuals or families who want hands-on help.
                  </p>
                  <Button onClick={handlePurchaseDoItForYou} variant="outline" className="min-h-[48px]">
                    Get Started With Done-For-You
                  </Button>
                </CardContent>
              </Card>
            </div>
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

        {/* Pre-Planning Checklist Embed */}
        <div className="max-w-4xl mx-auto mb-16">
          <Card className="border-2 overflow-hidden">
            <CardHeader className="text-center bg-primary/5 border-b">
              <CardTitle className="flex items-center justify-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Pre-Planning Checklist
              </CardTitle>
              <CardDescription>
                A helpful overview of what to consider
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
        </div>

        {/* Download Checklist */}
        <div className="max-w-4xl mx-auto mb-16">
          <div className="flex justify-center">
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
      </main>

      {/* Footer */}
      <footer className="border-t bg-muted/30 py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Everlasting Funeral Advisors. All rights reserved.</p>
          <p className="mt-2">
            <Link to="/about-us" className="hover:text-primary">About Us</Link>
            {" • "}
            <Link to="/contact" className="hover:text-primary">Contact</Link>
            {" • "}
            <Link to="/faq" className="hover:text-primary">FAQ</Link>
          </p>
        </div>
      </footer>
    </div>
  );
}
