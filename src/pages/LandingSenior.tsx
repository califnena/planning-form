import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link, useNavigate } from "react-router-dom";
import { LanguageSelector } from "@/components/LanguageSelector";
import { CheckCircle, Phone, HelpCircle, FileText, Heart, Shield, Clock, Users } from "lucide-react";
import { AppFooter } from "@/components/AppFooter";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import mascotHeroCouple from "@/assets/mascot-hero-couple.png";

/**
 * LandingSenior (Version B)
 * 
 * Senior-first landing page designed to answer these questions in order:
 * 1. What is this?
 * 2. Is this safe and simple?
 * 3. What do I do first?
 * 4. What happens after?
 * 5. Where can I get help?
 */
const LandingSenior = () => {
  const navigate = useNavigate();
  const [textSize, setTextSize] = useState<number>(100);
  const [userName, setUserName] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [hasPlannerProgress, setHasPlannerProgress] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const savedSize = localStorage.getItem("landing_text_size");
    if (savedSize) {
      const size = parseInt(savedSize);
      setTextSize(size);
      document.documentElement.style.fontSize = `${size}%`;
    }

    const checkUserState = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setIsLoggedIn(true);
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', user.id)
            .single();
          if (profile?.full_name) {
            setUserName(profile.full_name.split(' ')[0]);
          }
          const { data: settings } = await supabase
            .from('user_settings')
            .select('planner_mode, selected_sections')
            .eq('user_id', user.id)
            .maybeSingle();
          const hasProgress = !!(settings?.planner_mode || settings?.selected_sections);
          setHasPlannerProgress(hasProgress);
        } else {
          setIsLoggedIn(false);
          setUserName(null);
          setHasPlannerProgress(false);
        }
      } catch (error) {
        console.error('Error checking user state:', error);
      } finally {
        setIsLoading(false);
      }
    };
    checkUserState();
  }, []);

  const handleTextSizeChange = (direction: "increase" | "decrease") => {
    const newSize = direction === "increase" 
      ? Math.min(textSize + 10, 150) 
      : Math.max(textSize - 10, 80);
    setTextSize(newSize);
    document.documentElement.style.fontSize = `${newSize}%`;
    localStorage.setItem("landing_text_size", newSize.toString());
  };

  const handlePrimaryCTA = () => {
    if (isLoggedIn && hasPlannerProgress) {
      navigate("/preplandashboard");
    } else if (isLoggedIn) {
      navigate("/plan-ahead");
    } else {
      navigate("/plan-ahead");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Simple Header */}
      <header className="border-b border-border sticky top-0 z-50 bg-background/95 backdrop-blur">
        <div className="max-w-[900px] mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-lg font-semibold text-primary">Everlasting Funeral Advisors</h1>
          </div>
          <div className="flex items-center gap-3">
            {/* Text Size Controls */}
            <div className="hidden sm:flex items-center gap-1 border border-border rounded-lg px-2 py-1">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => handleTextSizeChange("decrease")} 
                className="h-8 px-2 font-semibold"
              >
                A-
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => handleTextSizeChange("increase")} 
                className="h-8 px-2 font-semibold"
              >
                A+
              </Button>
            </div>
            <LanguageSelector />
          </div>
        </div>
      </header>

      <main className="max-w-[900px] mx-auto px-4 py-8 md:py-12">
        
        {/* SECTION 1: What is this? */}
        <section className="text-center mb-12">
          <div className="max-w-md mx-auto mb-6">
            <img 
              src={mascotHeroCouple} 
              alt="A couple planning together" 
              className="w-full rounded-xl shadow-md"
            />
          </div>
          
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
            Write down your wishes—so your family knows what you want.
          </h1>
          
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            This is a simple, private tool to organize your funeral and end-of-life preferences. 
            You fill it out at your own pace. Your family can read it when they need to.
          </p>
        </section>

        {/* SECTION 2: Is this safe and simple? */}
        <section className="mb-12">
          <Card className="border-2 border-primary/20 bg-primary/5">
            <CardContent className="p-6 md:p-8">
              <h2 className="text-xl font-semibold text-foreground mb-6 text-center">
                You're in good hands.
              </h2>
              
              <div className="grid md:grid-cols-3 gap-6">
                <div className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                    <Shield className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-medium text-foreground mb-1">Private & Secure</h3>
                  <p className="text-sm text-muted-foreground">
                    Your information is protected and only shared with people you choose.
                  </p>
                </div>
                
                <div className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                    <Clock className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-medium text-foreground mb-1">Go at Your Own Pace</h3>
                  <p className="text-sm text-muted-foreground">
                    Take breaks anytime. Your progress is saved automatically.
                  </p>
                </div>
                
                <div className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                    <Heart className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-medium text-foreground mb-1">No Pressure, No Sales</h3>
                  <p className="text-sm text-muted-foreground">
                    We guide you—we don't sell funeral services or push products.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* SECTION 3: What do I do first? */}
        <section className="mb-12 text-center">
          <h2 className="text-xl font-semibold text-foreground mb-4">
            Ready to begin?
          </h2>
          
          <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
            Click the button below. We'll ask a few simple questions to help you choose 
            which topics to cover. You can skip anything that doesn't apply.
          </p>

          {/* Welcome back message for returning users */}
          {isLoggedIn && hasPlannerProgress && userName && (
            <div className="mb-6 p-4 bg-muted/50 rounded-lg inline-block">
              <p className="font-medium text-foreground">Welcome back, {userName}.</p>
              <p className="text-sm text-muted-foreground">Your plan is saved. Continue where you left off.</p>
            </div>
          )}
          
          <div className="flex flex-col items-center gap-4">
            <Button 
              size="lg" 
              onClick={handlePrimaryCTA} 
              className="min-h-[56px] text-lg px-10"
            >
              {isLoggedIn && hasPlannerProgress ? "Continue My Plan" : "Start My Plan"}
            </Button>
            
            {!isLoggedIn && !isLoading && (
              <Link to="/login" className="text-sm text-muted-foreground hover:text-primary underline">
                Already started? Sign in to continue.
              </Link>
            )}
          </div>
        </section>

        {/* SECTION 4: What happens after? */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold text-foreground mb-6 text-center">
            What happens next?
          </h2>
          
          <div className="space-y-4 max-w-2xl mx-auto">
            <div className="flex items-start gap-4 p-4 bg-muted/30 rounded-lg">
              <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold flex-shrink-0">
                1
              </div>
              <div>
                <h3 className="font-medium text-foreground">Answer questions about your preferences</h3>
                <p className="text-sm text-muted-foreground">
                  Topics include funeral wishes, important contacts, and messages for loved ones.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-4 p-4 bg-muted/30 rounded-lg">
              <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold flex-shrink-0">
                2
              </div>
              <div>
                <h3 className="font-medium text-foreground">Save your plan</h3>
                <p className="text-sm text-muted-foreground">
                  Create an account to save your progress. You can come back anytime to update it.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-4 p-4 bg-muted/30 rounded-lg">
              <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold flex-shrink-0">
                3
              </div>
              <div>
                <h3 className="font-medium text-foreground">Share with your family</h3>
                <p className="text-sm text-muted-foreground">
                  Print it, email it, or give a trusted person a secure link to view it.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 5: Where can I get help? */}
        <section className="mb-12">
          <Card className="border border-border">
            <CardContent className="p-6 md:p-8">
              <h2 className="text-xl font-semibold text-foreground mb-6 text-center">
                Need help along the way?
              </h2>
              
              <div className="grid md:grid-cols-2 gap-4">
                <Link 
                  to="/faq" 
                  className="flex items-start gap-3 p-4 rounded-lg border border-border hover:border-primary/50 hover:bg-muted/30 transition-colors"
                >
                  <HelpCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="font-medium text-foreground">Common Questions</span>
                    <p className="text-sm text-muted-foreground">Answers to frequently asked questions.</p>
                  </div>
                </Link>
                
                <Link 
                  to="/resources" 
                  className="flex items-start gap-3 p-4 rounded-lg border border-border hover:border-primary/50 hover:bg-muted/30 transition-colors"
                >
                  <FileText className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="font-medium text-foreground">Free Guides & Checklists</span>
                    <p className="text-sm text-muted-foreground">Downloadable resources to help you plan.</p>
                  </div>
                </Link>
                
                <Link 
                  to="/care-support" 
                  className="flex items-start gap-3 p-4 rounded-lg border border-border hover:border-primary/50 hover:bg-muted/30 transition-colors"
                >
                  <Users className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="font-medium text-foreground">Talk to Someone</span>
                    <p className="text-sm text-muted-foreground">Get guidance from a real person.</p>
                  </div>
                </Link>
                
                <Link 
                  to="/contact" 
                  className="flex items-start gap-3 p-4 rounded-lg border border-border hover:border-primary/50 hover:bg-muted/30 transition-colors"
                >
                  <Phone className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="font-medium text-foreground">Contact Us</span>
                    <p className="text-sm text-muted-foreground">Send us a message or request a call.</p>
                  </div>
                </Link>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Cross-link to Version A */}
        <section className="text-center py-6 border-t border-border">
          <Link 
            to="/" 
            className="text-sm text-muted-foreground hover:text-primary underline"
          >
            Back to standard home page
          </Link>
        </section>
      </main>

      <AppFooter />
    </div>
  );
};

export default LandingSenior;
