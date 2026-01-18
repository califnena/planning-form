import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, ClipboardCheck, FileText, Star, BookOpen, Music, Lock, CheckCircle, Heart, Loader2 } from "lucide-react";
import { PublicHeader } from "@/components/PublicHeader";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { AppFooter } from "@/components/AppFooter";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export default function AfterDeathLanding() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handlePremiumAccess = async () => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/login?redirect=/after-death-planner");
        return;
      }

      const { data: subscription } = await supabase
        .from('subscriptions')
        .select('plan_type, status')
        .eq('user_id', user.id)
        .single();

      if (subscription?.status === 'active' && ['premium', 'vip', 'do_it_for_you'].includes(subscription.plan_type)) {
        navigate("/after-death-planner");
      } else {
        const { data, error } = await supabase.functions.invoke('stripe-create-checkout', {
          body: {
            lookupKey: 'EFAPREMIUM',
            successUrl: `${window.location.origin}/after-death-planner`,
            cancelUrl: window.location.href
          }
        });
        if (error) throw error;
        if (data?.url) {
          window.location.href = data.url;
        }
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-50 via-background to-background">
      <PublicHeader />

      <main className="container mx-auto px-4 py-8">
        {/* Breadcrumbs */}
        <Breadcrumbs className="mb-6" />
        
        {/* Hero Section */}
        <div className="max-w-4xl mx-auto text-center space-y-6 mb-16">
          <div className="inline-flex items-center gap-2 text-primary px-4 py-2 rounded-full text-sm font-medium bg-amber-400">
            <Heart className="h-4 w-4" />
            Compassionate Guidance During Difficult Times
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground leading-tight">
            After-Death Planner & Checklist
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Step-by-step guidance for loved ones after a death. Take it one step at a time.
          </p>
        </div>

        {/* Checklist Details */}
        <div className="max-w-5xl mx-auto mb-16">
          <h2 className="text-2xl font-bold text-center mb-8">What to Do & When</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {/* First 24-48 Hours */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg text-secondary-foreground">First 24–48 Hours</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {["Figure out who the decision-maker is", "Locate Everlasting Funeral Advisors app or binder", 'Read "My Instructions"', "Notify immediate family", "Secure home, pets, valuables", "Contact service provider", "If no plan exists, contact Everlasting Funeral Advisors for guidance"].map((item, i) => <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      {item}
                    </li>)}
                </ul>
              </CardContent>
            </Card>

            {/* First Week */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg text-secondary-foreground">First Week</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {["Coordinate services", "Order death certificates", "Notify employer (if applicable)", "Begin insurance notifications"].map((item, i) => <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      {item}
                    </li>)}
                </ul>
              </CardContent>
            </Card>

            {/* First Month */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg text-secondary-foreground">First Month</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {["Notify financial institutions", "Manage urgent bills & utilities", "Forward mail", "Meet executor/attorney if needed"].map((item, i) => <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      {item}
                    </li>)}
                </ul>
              </CardContent>
            </Card>

            {/* 3-12 Months */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg text-secondary-foreground">3–12 Months</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {["Close or transfer accounts", "Complete tax & administrative tasks", "Archive important documents"].map((item, i) => <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      {item}
                    </li>)}
                </ul>
              </CardContent>
            </Card>
          </div>
          <p className="text-center text-muted-foreground mt-6 italic">
            You do not need to do everything at once. One step at a time.
          </p>
          
          {/* Download Checklist Button */}
          <div className="flex justify-center mt-8">
            <a href="/checklists/After-Death-Checklist.png" download="After-Death-Checklist.png" className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium">
              <Download className="h-4 w-4" />
              Download Checklist Image
            </a>
          </div>
        </div>


        {/* Free Downloads Section */}
        <div className="max-w-4xl mx-auto mb-16">
          <Card className="border-2">
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2">
                <Download className="h-5 w-5 text-primary" />
                Free Printable Resources
              </CardTitle>
              <CardDescription>
                Download these resources to help guide you through the process
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 gap-4">
                <a href="/guides/EFA-After-Death-Planner-and-Checklist.pdf" download className="flex items-center gap-3 p-4 border rounded-lg hover:bg-muted transition-colors">
                  <FileText className="h-8 w-8 text-primary" />
                  <div>
                    <p className="font-medium">After-Death Planner PDF</p>
                    <p className="text-sm text-muted-foreground">Complete printable guide</p>
                  </div>
                </a>
                <a href="/checklists/After-Death-Checklist.png" download className="flex items-center gap-3 p-4 border rounded-lg hover:bg-muted transition-colors">
                  <ClipboardCheck className="h-8 w-8 text-primary" />
                  <div>
                    <p className="font-medium">Quick Reference Checklist</p>
                    <p className="text-sm text-muted-foreground">One-page visual guide</p>
                  </div>
                </a>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Premium Step-by-Step Planner */}
        <div className="max-w-4xl mx-auto mb-16">
          <Card className="border-2 border-primary/30 bg-gradient-to-br from-primary/5 to-transparent">
            <CardHeader className="text-center">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium mx-auto mb-2 bg-yellow-500 text-secondary-foreground">
                <Lock className="h-3 w-3" />
                Premium Feature
              </div>
              <CardTitle className="text-2xl">Step-by-Step Digital After-Death Planner</CardTitle>
              <CardDescription className="text-base">
                An interactive 12-step guide that walks you through everything—from immediate needs to long-term tasks
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid sm:grid-cols-2 gap-4">
                {["Track progress across 12 organized steps", "Save and continue anytime", "Document storage locations", "Contact management tools", "Printable summaries", "Expert guidance at each step"].map((feature, i) => <div key={i} className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-primary flex-shrink-0" />
                    {feature}
                  </div>)}
              </div>
              <div className="text-center pt-4">
                <Button size="lg" onClick={handlePremiumAccess} disabled={isLoading} className="gap-2 bg-blue-600 hover:bg-blue-500">
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
                  {isLoading ? "Loading..." : "Access Step-by-Step Planner"}
                </Button>
                <p className="text-xs text-muted-foreground mt-2">
                  Requires Premium subscription • Sign in or upgrade to access
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Additional Services */}
        <div className="max-w-5xl mx-auto mb-16">
          <h2 className="text-2xl font-bold text-center mb-8">Additional Support & Products</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {/* Planning Support */}
            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-amber-500 flex items-center justify-center mb-2">
                  <Star className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-lg">Compassionate Guidance</CardTitle>
                <CardDescription>
                  For those who want reassurance, not just forms. A real person who walks at your pace.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link to="/vip-coach">
                  <Button variant="outline" className="w-full min-h-[48px]">
                    Talk With a Planning Guide
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Binder */}
            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-stone-400 to-stone-600 flex items-center justify-center mb-2">
                  <BookOpen className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-lg">Fireproof Planning Binder</CardTitle>
                <CardDescription>
                  Keep all your important documents organized and protected
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link to="/products/binder">
                  <Button variant="outline" className="w-full">
                    Purchase Binder
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Custom Song */}
            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center mb-2">
                  <Music className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-lg">Custom Memorial Song</CardTitle>
                <CardDescription>
                  Honor your loved one with a personalized tribute song
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link to="/products/custom-song">
                  <Button variant="outline" className="w-full">
                    Create a Song
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Final CTA */}
        <div className="max-w-3xl mx-auto text-center py-12 border-t">
          <p className="text-lg text-muted-foreground mb-6">
            We're here to help you through this difficult time. Take things one step at a time.
          </p>
        </div>
      </main>

      <AppFooter />
    </div>
  );
}