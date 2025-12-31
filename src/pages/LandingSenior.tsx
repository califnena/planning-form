import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link, useNavigate } from "react-router-dom";
import { LanguageSelector } from "@/components/LanguageSelector";
import { CheckCircle, Phone, HelpCircle, FileText, Heart, Shield, Clock, Users, ShoppingBag, BookOpen, MessageCircle } from "lucide-react";
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

        {/* SECTION: Why Families Choose Everlasting */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold text-foreground mb-6 text-center">
            Why Families Choose Everlasting
          </h2>
          
          <div className="grid md:grid-cols-2 gap-4">
            <Card className="border border-border">
              <CardContent className="p-5">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-medium text-foreground mb-1">Clear and Simple</h3>
                    <p className="text-sm text-muted-foreground">
                      Plain language. No confusing terms. Just straightforward guidance.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border border-border">
              <CardContent className="p-5">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-medium text-foreground mb-1">A Gift to Your Family</h3>
                    <p className="text-sm text-muted-foreground">
                      Spare your loved ones from guessing. Give them peace of mind.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border border-border">
              <CardContent className="p-5">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-medium text-foreground mb-1">Update Anytime</h3>
                    <p className="text-sm text-muted-foreground">
                      Your wishes may change. Come back and update whenever you need.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border border-border">
              <CardContent className="p-5">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-medium text-foreground mb-1">Help When You Need It</h3>
                    <p className="text-sm text-muted-foreground">
                      Reach a real person if you get stuck or want guidance.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* SECTION: What Families Are Saying (Testimonials) */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold text-foreground mb-6 text-center">
            What Families Are Saying
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="border-2 border-muted bg-muted/20">
              <CardContent className="p-6">
                <p className="text-foreground text-lg leading-relaxed mb-4">
                  "I finally feel at peace knowing my children won't have to guess what I wanted. This was so much easier than I expected."
                </p>
                <p className="text-muted-foreground font-medium">— Margaret, 72</p>
              </CardContent>
            </Card>
            
            <Card className="border-2 border-muted bg-muted/20">
              <CardContent className="p-6">
                <p className="text-foreground text-lg leading-relaxed mb-4">
                  "My husband and I filled this out together one evening. It brought us closer and gave us both comfort."
                </p>
                <p className="text-muted-foreground font-medium">— Robert & Helen, 68</p>
              </CardContent>
            </Card>
            
            <Card className="border-2 border-muted bg-muted/20 md:col-span-2">
              <CardContent className="p-6">
                <p className="text-foreground text-lg leading-relaxed mb-4">
                  "When my mother passed, we had no idea what she wanted. I don't want my family to go through that. This tool helped me put everything in one place."
                </p>
                <p className="text-muted-foreground font-medium">— David, 58</p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* SECTION: Our Mission */}
        <section className="mb-12">
          <Card className="border border-primary/30 bg-primary/5">
            <CardContent className="p-6 md:p-8 text-center">
              <h2 className="text-xl font-semibold text-foreground mb-4">
                Our Mission
              </h2>
              <p className="text-foreground text-lg leading-relaxed max-w-2xl mx-auto mb-3">
                Our mission is to help families plan ahead with clarity, compassion, and confidence—so no one is left guessing during a difficult time.
              </p>
              <p className="text-muted-foreground">
                We believe planning ahead is a gift of love, not a burden.
              </p>
            </CardContent>
          </Card>
        </section>

        {/* SECTION: How We Can Help You (Services Overview) */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold text-foreground mb-6 text-center">
            How We Can Help You
          </h2>
          
          <div className="space-y-3">
            <Link 
              to="/plan-ahead" 
              className="flex items-center gap-4 p-4 rounded-lg border border-border hover:border-primary/50 hover:bg-muted/30 transition-colors"
            >
              <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
              <span className="text-foreground">Write down your wishes step by step</span>
            </Link>
            
            <Link 
              to="/preplan-summary" 
              className="flex items-center gap-4 p-4 rounded-lg border border-border hover:border-primary/50 hover:bg-muted/30 transition-colors"
            >
              <FileText className="h-5 w-5 text-primary flex-shrink-0" />
              <span className="text-foreground">Save or print your plan anytime</span>
            </Link>
            
            <Link 
              to="/products" 
              className="flex items-center gap-4 p-4 rounded-lg border border-border hover:border-primary/50 hover:bg-muted/30 transition-colors"
            >
              <ShoppingBag className="h-5 w-5 text-primary flex-shrink-0" />
              <span className="text-foreground">Affordable caskets, urns, and flowers</span>
            </Link>
            
            <Link 
              to="/after-death" 
              className="flex items-center gap-4 p-4 rounded-lg border border-border hover:border-primary/50 hover:bg-muted/30 transition-colors"
            >
              <BookOpen className="h-5 w-5 text-primary flex-shrink-0" />
              <span className="text-foreground">After-death guidance for your family</span>
            </Link>
            
            <Link 
              to="/care-support" 
              className="flex items-center gap-4 p-4 rounded-lg border border-border hover:border-primary/50 hover:bg-muted/30 transition-colors"
            >
              <Users className="h-5 w-5 text-primary flex-shrink-0" />
              <span className="text-foreground">Optional help from a real person</span>
            </Link>
          </div>
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

        {/* SECTION: What Happens After I Start? (Process Clarity) */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold text-foreground mb-6 text-center">
            What Happens After I Start?
          </h2>
          
          <div className="space-y-4 max-w-2xl mx-auto">
            <div className="flex items-start gap-4 p-4 bg-muted/30 rounded-lg">
              <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold flex-shrink-0">
                1
              </div>
              <div>
                <h3 className="font-medium text-foreground">Choose what you want to include</h3>
                <p className="text-sm text-muted-foreground">
                  Pick the topics that matter to you. Skip what doesn't apply.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-4 p-4 bg-muted/30 rounded-lg">
              <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold flex-shrink-0">
                2
              </div>
              <div>
                <h3 className="font-medium text-foreground">Answer questions at your own pace</h3>
                <p className="text-sm text-muted-foreground">
                  Take as much time as you need. Your progress is saved automatically.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-4 p-4 bg-muted/30 rounded-lg">
              <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold flex-shrink-0">
                3
              </div>
              <div>
                <h3 className="font-medium text-foreground">Review or change anything anytime</h3>
                <p className="text-sm text-muted-foreground">
                  Come back whenever you want to update your wishes.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-4 p-4 bg-muted/30 rounded-lg">
              <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold flex-shrink-0">
                4
              </div>
              <div>
                <h3 className="font-medium text-foreground">Print or save when you're ready</h3>
                <p className="text-sm text-muted-foreground">
                  Get a printable document to share with your family.
                </p>
              </div>
            </div>
          </div>
          
          <p className="text-center text-muted-foreground mt-6 max-w-lg mx-auto">
            You never have to finish everything at once.
          </p>
        </section>

        {/* SECTION: Need Help Along the Way? */}
        <section className="mb-12">
          <Card className="border border-border">
            <CardContent className="p-6 md:p-8">
              <h2 className="text-xl font-semibold text-foreground mb-6 text-center">
                Need Help Along the Way?
              </h2>
              
              <div className="grid md:grid-cols-3 gap-4">
                <Link 
                  to="/care-support" 
                  className="flex flex-col items-center text-center p-4 rounded-lg border border-border hover:border-primary/50 hover:bg-muted/30 transition-colors"
                >
                  <MessageCircle className="h-8 w-8 text-primary mb-3" />
                  <span className="font-medium text-foreground">Talk to CARE Support</span>
                  <p className="text-sm text-muted-foreground mt-1">Get guidance from a real person</p>
                </Link>
                
                <Link 
                  to="/do-it-for-you" 
                  className="flex flex-col items-center text-center p-4 rounded-lg border border-border hover:border-primary/50 hover:bg-muted/30 transition-colors"
                >
                  <Users className="h-8 w-8 text-primary mb-3" />
                  <span className="font-medium text-foreground">Request Help Filling Out Your Plan</span>
                  <p className="text-sm text-muted-foreground mt-1">We can do it together</p>
                </Link>
                
                <Link 
                  to="/faq" 
                  className="flex flex-col items-center text-center p-4 rounded-lg border border-border hover:border-primary/50 hover:bg-muted/30 transition-colors"
                >
                  <HelpCircle className="h-8 w-8 text-primary mb-3" />
                  <span className="font-medium text-foreground">View Common Questions</span>
                  <p className="text-sm text-muted-foreground mt-1">Find quick answers</p>
                </Link>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* FINAL CALL TO ACTION */}
        <section className="mb-12 text-center">
          <Card className="border-2 border-primary/30 bg-primary/5">
            <CardContent className="p-8 md:p-10">
              <h2 className="text-xl font-semibold text-foreground mb-4">
                Ready to give your family peace of mind?
              </h2>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-4">
                <Button 
                  size="lg" 
                  onClick={handlePrimaryCTA} 
                  className="min-h-[56px] text-lg px-10"
                >
                  Start My Plan
                </Button>
                
                <Button 
                  variant="outline" 
                  size="lg" 
                  asChild
                  className="min-h-[56px] text-lg px-10"
                >
                  <Link to="/resources">Learn More First</Link>
                </Button>
              </div>
              
              <p className="text-muted-foreground text-sm">
                You can stop anytime. Nothing is shared unless you choose.
              </p>
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
