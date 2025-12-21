import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, ClipboardCheck, FileText, Heart, CheckCircle, Users, Laptop, BookOpen, Loader2, Eye } from "lucide-react";
import { LanguageSelector } from "@/components/LanguageSelector";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import logo from "@/assets/everlasting-logo.png";
import mascotImage from "@/assets/mascot-planning-ahead.png";

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
        // Not logged in - redirect to login
        navigate("/login?redirect=/app");
        return;
      }

      // Check subscription status
      const { data: subscription } = await supabase
        .from('subscriptions')
        .select('plan_type, status')
        .eq('user_id', user.id)
        .single();

      if (subscription?.status === 'active' && ['premium', 'vip', 'do_it_for_you'].includes(subscription.plan_type)) {
        // Has access
        navigate("/app");
      } else {
        // Needs to upgrade
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

  const handlePreview = () => {
    navigate("/preview/preplanning");
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
            {/* Text Size Controls */}
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

      <main className="container mx-auto px-4 py-12 text-sidebar-foreground bg-transparent">
        {/* Hero Section */}
        <div className="max-w-4xl mx-auto text-center space-y-6 mb-16">
          <div className="inline-flex items-center gap-2 text-primary px-4 py-2 rounded-full text-sm font-medium bg-amber-400">
            <Heart className="h-4 w-4" />
            A Gift of Peace and Clarity
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground leading-tight">
            Make Your Wishes Clear.<br />
            Spare Your Family the Guesswork.
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Plan ahead so the people you love don't have to make difficult decisions during an already hard time.
          </p>
        </div>

        {/* Who It's For */}
        <div className="max-w-5xl mx-auto mb-16">
          <h2 className="text-2xl font-bold text-center mb-8">Who This Is For</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { title: "Parents", desc: "Give your children clarity instead of confusion" },
              { title: "Retirees", desc: "Document your wishes while you can share your reasoning" },
              { title: "Caregivers", desc: "Help someone you love put their plans in order" },
              { title: "Anyone", desc: "Who doesn't want their family guessing" }
            ].map((item, i) => (
              <Card key={i} className="text-center">
                <CardContent className="pt-6">
                  <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* What It Covers */}
        <div className="max-w-5xl mx-auto mb-16">
          <h2 className="text-2xl font-bold text-center mb-8">What You'll Document</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg text-secondary-foreground">Final Wishes</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {[
                    "Funeral and memorial preferences",
                    "Burial, cremation, or other arrangements",
                    "Service style and location wishes",
                    "Music, readings, and personal touches"
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg text-secondary-foreground">Practical Details</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {[
                    "Important contacts and relationships",
                    "Account and financial information",
                    "Insurance policies and documents",
                    "Instructions for digital accounts"
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg text-secondary-foreground">Personal Messages</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {[
                    "Letters to loved ones",
                    "Explanations for your choices",
                    "Legacy stories and memories",
                    "What matters most to you"
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg text-secondary-foreground">Legal Readiness</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {[
                    "Document locations (will, POA, etc.)",
                    "Attorney and advisor contacts",
                    "Safe deposit box information",
                    "Property and asset notes"
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
          <p className="text-center text-muted-foreground mt-6 italic">
            You can change this anytime. Start with what feels comfortable.
          </p>
        </div>

        {/* Embedded Guide */}
        <div className="max-w-4xl mx-auto mb-16">
          <Card className="border-2 overflow-hidden">
            <CardHeader className="text-center bg-primary/5 border-b">
              <CardTitle className="flex items-center justify-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                A Guided Walk-Through Before You Start
              </CardTitle>
              <CardDescription>
                Watch this short overview to understand what you'll be doing
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="flex justify-center bg-muted/30">
                <iframe 
                  src="https://gamma.app/embed/rwk4xlwaixs6gbj" 
                  style={{ width: '700px', maxWidth: '100%', height: '450px' }} 
                  allow="fullscreen" 
                  title="Planning Your Funeral: A Gift of Peace & Clarity" 
                  className="border-0" 
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Clear Paths */}
        <div className="max-w-4xl mx-auto mb-16">
          <h2 className="text-2xl font-bold text-center mb-8">Choose How You'd Like to Begin</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {/* Digital */}
            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center mb-2">
                  <Laptop className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-lg">Start Digitally</CardTitle>
                <CardDescription>
                  Fill out your plan online. Save as you go. Come back anytime.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={handleStartPlanning} disabled={isLoading} className="w-full min-h-[48px]">
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Start Planning
                </Button>
              </CardContent>
            </Card>

            {/* Printable */}
            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-stone-400 to-stone-600 flex items-center justify-center mb-2">
                  <Download className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-lg">Download Blank Version</CardTitle>
                <CardDescription>
                  Prefer pen and paper? Download a printable form you can fill by hand.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <a href="/guides/My-End-of-Life-Decisions-Guide.pdf" download>
                  <Button variant="outline" className="w-full min-h-[48px]">
                    Download PDF
                  </Button>
                </a>
              </CardContent>
            </Card>

            {/* Assistance */}
            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center mb-2">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-lg">Have Someone Help You</CardTitle>
                <CardDescription>
                  Work with a compassionate guide who will walk you through every step.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link to="/vip-coach">
                  <Button variant="outline" className="w-full min-h-[48px]">
                    Talk With a Guide
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Preview Section */}
        <div className="max-w-4xl mx-auto mb-16">
          <Card className="border-2 border-dashed">
            <CardContent className="py-8 text-center">
              <Eye className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Want to Look Around First?</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Explore the planner in preview mode. See the structure and decide if it's right for you. No account needed.
              </p>
              <Button onClick={handlePreview} variant="outline" size="lg" className="min-h-[48px]">
                <Eye className="h-4 w-4 mr-2" />
                Preview the Planner
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Free Checklist Download */}
        <div className="max-w-4xl mx-auto mb-16">
          <Card className="border-2">
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2">
                <ClipboardCheck className="h-5 w-5 text-primary" />
                Free Pre-Planning Checklist
              </CardTitle>
              <CardDescription>
                Not ready to start? Download a simple checklist to help you think through the basics.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              <a href="/checklists/Pre-Planning-Checklist.png" download>
                <Button variant="outline" className="gap-2 min-h-[48px]">
                  <Download className="h-4 w-4" />
                  Download Checklist
                </Button>
              </a>
            </CardContent>
          </Card>
        </div>

        {/* Soft CTA */}
        <div className="max-w-3xl mx-auto text-center py-12 border-t">
          <p className="text-lg text-muted-foreground mb-6">
            Start when you're ready. Save as you go.<br />
            There's no rush—this is about doing it right, not doing it fast.
          </p>
          <Button onClick={handleStartPlanning} disabled={isLoading} size="lg" className="min-h-[48px]">
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Begin Your Plan
          </Button>
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
