import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link, useNavigate } from "react-router-dom";
import { LanguageSelector } from "@/components/LanguageSelector";
import { CheckCircle, Shield, Clock, HelpCircle, FileText, Heart, Users, ShoppingBag, BookOpen, MessageCircle, ChevronDown, ChevronUp } from "lucide-react";
import { AppFooter } from "@/components/AppFooter";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import mascotHeroCouple from "@/assets/mascot-hero-couple.png";

/**
 * LandingSenior (Version B)
 * 
 * Senior-first landing page designed for clarity and trust.
 * Structure: Hero → Safety → Why → Testimonials → Mission → Services → Steps → CTA
 */
const LandingSenior = () => {
  const navigate = useNavigate();
  const [textSize, setTextSize] = useState<number>(100);
  const [userName, setUserName] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [hasPlannerProgress, setHasPlannerProgress] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [showMoreTestimonials, setShowMoreTestimonials] = useState<boolean>(false);

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
    <div className="min-h-screen bg-background text-[1.05rem] leading-relaxed">
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

      <main className="max-w-[900px] mx-auto px-4 py-10 md:py-14 space-y-16">
        
        {/* 1) HERO */}
        <section className="text-center">
          <div className="max-w-md mx-auto mb-8">
            <img 
              src={mascotHeroCouple} 
              alt="A couple planning together" 
              className="w-full rounded-xl shadow-lg"
            />
          </div>
          
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-4 leading-tight">
            Write down your wishes so your family knows what you want.
          </h1>
          
          <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-8">
            Safe, private, and simple. Go at your own pace.
          </p>

          {/* Welcome back message for returning users */}
          {isLoggedIn && hasPlannerProgress && userName && (
            <div className="mb-6 p-4 bg-muted/50 rounded-lg inline-block">
              <p className="font-medium text-foreground">Welcome back, {userName}.</p>
              <p className="text-sm text-muted-foreground">Your plan is saved. Continue where you left off.</p>
            </div>
          )}
          
          <div className="flex flex-col items-center gap-3">
            <Button 
              size="lg" 
              onClick={handlePrimaryCTA} 
              className="min-h-[56px] text-lg px-12"
            >
              Continue My Plan
            </Button>
            
            <p className="text-sm text-muted-foreground">
              You can skip anything and come back later.
            </p>

            {!isLoggedIn && !isLoading && (
              <Link to="/login" className="text-sm text-muted-foreground hover:text-primary underline mt-2">
                Already started? Sign in to continue.
              </Link>
            )}
          </div>
        </section>

        {/* 2) "IS THIS SAFE?" REASSURANCE BAND */}
        <section className="bg-muted/30 rounded-2xl p-6 md:p-10">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center text-center">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Shield className="h-7 w-7 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Private & Secure</h3>
              <p className="text-muted-foreground">
                Your information stays private unless you choose to print or share.
              </p>
            </div>
            
            <div className="flex flex-col items-center text-center">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Clock className="h-7 w-7 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">No Rush</h3>
              <p className="text-muted-foreground">
                Fill out only what applies. Leave anything blank.
              </p>
            </div>
            
            <div className="flex flex-col items-center text-center">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Heart className="h-7 w-7 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Help When You Need It</h3>
              <p className="text-muted-foreground">
                Get support if you want it. No pressure.
              </p>
            </div>
          </div>
        </section>

        {/* 3) "WHY DO THIS?" BAND */}
        <section className="text-center">
          <h2 className="text-xl md:text-2xl font-semibold text-foreground mb-8">
            Why having a plan helps
          </h2>
          
          <div className="max-w-lg mx-auto space-y-4">
            <div className="flex items-start gap-4 text-left">
              <CheckCircle className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
              <p className="text-foreground text-lg">It reduces stress for your family.</p>
            </div>
            <div className="flex items-start gap-4 text-left">
              <CheckCircle className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
              <p className="text-foreground text-lg">It helps prevent confusion and disagreements.</p>
            </div>
            <div className="flex items-start gap-4 text-left">
              <CheckCircle className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
              <p className="text-foreground text-lg">It keeps important details in one place.</p>
            </div>
          </div>
        </section>

        {/* 4) TESTIMONIALS */}
        <section>
          <h2 className="text-xl md:text-2xl font-semibold text-foreground mb-8 text-center">
            What Families Are Saying
          </h2>
          
          <div className="space-y-6 max-w-2xl mx-auto">
            {/* First 2 testimonials always visible */}
            <Card className="border-2 border-muted bg-muted/20">
              <CardContent className="p-6 md:p-8">
                <p className="text-foreground text-lg leading-relaxed mb-4">
                  "I finally feel at peace knowing my children won't have to guess what I wanted. This was so much easier than I expected."
                </p>
                <p className="text-muted-foreground font-medium">— Margaret, 72</p>
              </CardContent>
            </Card>
            
            <Card className="border-2 border-muted bg-muted/20">
              <CardContent className="p-6 md:p-8">
                <p className="text-foreground text-lg leading-relaxed mb-4">
                  "My husband and I filled this out together one evening. It brought us closer and gave us both comfort."
                </p>
                <p className="text-muted-foreground font-medium">— Robert & Helen, 68</p>
              </CardContent>
            </Card>

            {/* Additional testimonial (collapsible) */}
            {showMoreTestimonials && (
              <Card className="border-2 border-muted bg-muted/20">
                <CardContent className="p-6 md:p-8">
                  <p className="text-foreground text-lg leading-relaxed mb-4">
                    "When my mother passed, we had no idea what she wanted. I don't want my family to go through that. This tool helped me put everything in one place."
                  </p>
                  <p className="text-muted-foreground font-medium">— David, 58</p>
                </CardContent>
              </Card>
            )}

            <button 
              onClick={() => setShowMoreTestimonials(!showMoreTestimonials)}
              className="flex items-center gap-2 mx-auto text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              {showMoreTestimonials ? (
                <>
                  <ChevronUp className="h-4 w-4" />
                  Show fewer stories
                </>
              ) : (
                <>
                  <ChevronDown className="h-4 w-4" />
                  Read more stories
                </>
              )}
            </button>
          </div>
        </section>

        {/* 5) OUR MISSION */}
        <section>
          <Card className="border-2 border-primary/20 bg-primary/5">
            <CardContent className="p-6 md:p-10 text-center">
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

        {/* 6) "WHAT WE OFFER" (Services) */}
        <section>
          <h2 className="text-xl md:text-2xl font-semibold text-foreground mb-2 text-center">
            What we offer
          </h2>
          <p className="text-muted-foreground text-center mb-8">(when you are ready)</p>
          
          <div className="grid sm:grid-cols-2 gap-4">
            <Link 
              to="/plan-ahead" 
              className="flex items-center gap-4 p-5 rounded-xl border-2 border-border hover:border-primary/50 hover:bg-muted/30 transition-all"
            >
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <span className="text-foreground font-medium">Planning tools</span>
            </Link>
            
            <Link 
              to="/products" 
              className="flex items-center gap-4 p-5 rounded-xl border-2 border-border hover:border-primary/50 hover:bg-muted/30 transition-all"
            >
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <ShoppingBag className="h-6 w-6 text-primary" />
              </div>
              <span className="text-foreground font-medium">Affordable funeral products</span>
            </Link>
            
            <Link 
              to="/after-death" 
              className="flex items-center gap-4 p-5 rounded-xl border-2 border-border hover:border-primary/50 hover:bg-muted/30 transition-all"
            >
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <BookOpen className="h-6 w-6 text-primary" />
              </div>
              <span className="text-foreground font-medium">After-death guide for families</span>
            </Link>
            
            <Link 
              to="/care-support" 
              className="flex items-center gap-4 p-5 rounded-xl border-2 border-border hover:border-primary/50 hover:bg-muted/30 transition-all"
            >
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <span className="text-foreground font-medium">Optional help from a real person</span>
            </Link>
          </div>
        </section>

        {/* 7) "WHAT HAPPENS NEXT" */}
        <section>
          <h2 className="text-xl md:text-2xl font-semibold text-foreground mb-8 text-center">
            What happens after you start
          </h2>
          
          <div className="space-y-4 max-w-2xl mx-auto">
            <div className="flex items-start gap-4 p-5 bg-muted/30 rounded-xl">
              <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold flex-shrink-0 text-lg">
                1
              </div>
              <p className="text-foreground text-lg pt-1">Choose what you want to include.</p>
            </div>
            
            <div className="flex items-start gap-4 p-5 bg-muted/30 rounded-xl">
              <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold flex-shrink-0 text-lg">
                2
              </div>
              <p className="text-foreground text-lg pt-1">Fill out only what applies.</p>
            </div>
            
            <div className="flex items-start gap-4 p-5 bg-muted/30 rounded-xl">
              <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold flex-shrink-0 text-lg">
                3
              </div>
              <p className="text-foreground text-lg pt-1">Save anytime and come back later.</p>
            </div>
            
            <div className="flex items-start gap-4 p-5 bg-muted/30 rounded-xl">
              <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold flex-shrink-0 text-lg">
                4
              </div>
              <p className="text-foreground text-lg pt-1">Print or share with your family when you are ready.</p>
            </div>
          </div>
        </section>

        {/* NEED HELP SECTION */}
        <section>
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
                </Link>
                
                <Link 
                  to="/do-it-for-you" 
                  className="flex flex-col items-center text-center p-4 rounded-lg border border-border hover:border-primary/50 hover:bg-muted/30 transition-colors"
                >
                  <Users className="h-8 w-8 text-primary mb-3" />
                  <span className="font-medium text-foreground">Request help filling out your plan</span>
                </Link>
                
                <Link 
                  to="/faq" 
                  className="flex flex-col items-center text-center p-4 rounded-lg border border-border hover:border-primary/50 hover:bg-muted/30 transition-colors"
                >
                  <HelpCircle className="h-8 w-8 text-primary mb-3" />
                  <span className="font-medium text-foreground">View common questions</span>
                </Link>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* 8) FINAL CTA */}
        <section className="text-center">
          <Card className="border-2 border-primary/30 bg-primary/5">
            <CardContent className="p-8 md:p-12">
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
                <Button 
                  size="lg" 
                  onClick={handlePrimaryCTA} 
                  className="min-h-[56px] text-lg px-12"
                >
                  Continue My Plan
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
              
              <p className="text-muted-foreground">
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
