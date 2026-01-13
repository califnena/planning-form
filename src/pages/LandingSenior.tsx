import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link, useNavigate } from "react-router-dom";
import { LanguageSelector } from "@/components/LanguageSelector";
import { CheckCircle, Shield, Clock, HelpCircle, FileText, Heart, Users, ShoppingBag, BookOpen, MessageCircle, ChevronDown, ChevronUp, Quote, Bot, LogIn, LogOut, User } from "lucide-react";
import { AppFooter } from "@/components/AppFooter";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import mascotHeroCouple from "@/assets/mascot-hero-couple.png";
import mascotFamiliesChoose from "@/assets/mascot-families-choose.png";

/**
 * LandingSenior (Version B)
 * 
 * Senior-first landing page designed for clarity, warmth, and trust.
 * Visual design: Calm, warm, safe, easy to understand, not rushed.
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
    <div className="min-h-screen bg-[hsl(var(--senior-cream))] text-[1.1rem] leading-relaxed">
      {/* Simple Header - warm and calm */}
      <header className="border-b border-border/50 sticky top-0 z-50 bg-[hsl(var(--senior-cream))]/95 backdrop-blur">
        <div className="max-w-[900px] mx-auto px-5 py-5 flex justify-between items-center">
          <div>
            <h1 className="text-lg font-semibold text-primary">Everlasting Funeral Advisors</h1>
          </div>
          <div className="flex items-center gap-3">
            {/* Text Size Controls */}
            <div className="hidden sm:flex items-center gap-1 border border-border/60 rounded-lg px-2 py-1 bg-white/60">
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
            
            {/* Account Button - clearly visible */}
            {isLoggedIn ? (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={async () => {
                  await supabase.auth.signOut();
                  setIsLoggedIn(false);
                  setUserName(null);
                }}
                className="h-9 px-4 gap-2 bg-white border-primary/30 text-[hsl(var(--senior-text))] hover:bg-primary/5 font-medium"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Sign Out</span>
              </Button>
            ) : (
              <Button 
                variant="outline" 
                size="sm" 
                asChild
                className="h-9 px-4 gap-2 bg-white border-primary/30 text-[hsl(var(--senior-text))] hover:bg-primary/5 font-medium"
              >
                <Link to="/login">
                  <User className="h-4 w-4" />
                  <span className="hidden sm:inline">Account</span>
                </Link>
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-[900px] mx-auto px-5 py-12 md:py-16 space-y-0">
        
        {/* 1) HERO - Warm, inviting, generous breathing room */}
        <section className="bg-white rounded-3xl shadow-sm border border-border/30 p-8 md:p-12 mb-16">
          <div className="text-center">
            <div className="max-w-sm mx-auto mb-10">
              <img 
                src={mascotHeroCouple} 
                alt="A couple planning together" 
                className="w-full rounded-2xl shadow-md"
              />
            </div>
            
            <h1 className="text-2xl md:text-[1.85rem] font-bold text-[hsl(var(--senior-text))] mb-5 leading-snug">
              Write down your wishes so your family<br className="hidden md:block" /> knows what you want.
            </h1>
            
            <p className="text-lg text-[hsl(var(--senior-text-soft))] max-w-xl mx-auto mb-4 leading-relaxed">
              Whether you're planning ahead or dealing with a recent loss, we're here to help.
            </p>
            
            <p className="text-lg text-[hsl(var(--senior-text-soft))] max-w-xl mx-auto mb-10 leading-relaxed">
              Safe, private, and simple. Go at your own pace.
            </p>
            
            <div className="flex flex-col items-center gap-4">
              <Button 
                size="lg" 
                onClick={handlePrimaryCTA} 
                className="min-h-[60px] text-lg px-14 rounded-xl shadow-md hover:shadow-lg transition-shadow"
              >
                Continue My Plan
              </Button>
              
              <p className="text-sm text-[hsl(var(--senior-text-soft))] mt-1">
                You can skip anything and come back later.
              </p>

              {!isLoggedIn && !isLoading && (
                <Link to="/login" className="text-sm text-[hsl(var(--senior-text-soft))] hover:text-primary underline mt-2">
                  Already started? Sign in to continue.
                </Link>
              )}
            </div>
          </div>
        </section>

        {/* 2) "IS THIS SAFE?" REASSURANCE BAND - Soft sage background */}
        <section className="bg-[hsl(var(--senior-sage))] rounded-3xl p-8 md:p-12 mb-16">
          <div className="grid md:grid-cols-3 gap-10">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-2xl bg-white shadow-sm flex items-center justify-center mb-5">
                <Shield className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold text-[hsl(var(--senior-text))] mb-3 text-lg">Clear & In Your Control</h3>
              <p className="text-[hsl(var(--senior-text-soft))] leading-relaxed">
                Your wishes stay yours. Share or print only if and when you choose.
              </p>
            </div>
            
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-2xl bg-white shadow-sm flex items-center justify-center mb-5">
                <Clock className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold text-[hsl(var(--senior-text))] mb-3 text-lg">Free 30-Minute Consultation</h3>
              <p className="text-[hsl(var(--senior-text-soft))] leading-relaxed">
                No pressure. Clear options.
              </p>
            </div>
            
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-2xl bg-white shadow-sm flex items-center justify-center mb-5">
                <Heart className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold text-[hsl(var(--senior-text))] mb-3 text-lg">Guided Help</h3>
              <p className="text-[hsl(var(--senior-text-soft))] leading-relaxed">
                Emotional support and guidance.
              </p>
            </div>
          </div>
        </section>

        {/* 3) "WHY DO THIS?" BAND - Clean white section */}
        <section className="bg-white rounded-3xl shadow-sm border border-border/30 p-8 md:p-12 mb-16">
          <h2 className="text-xl md:text-2xl font-semibold text-[hsl(var(--senior-text))] mb-10 text-center">
            Why having a plan helps
          </h2>
          
          <div className="max-w-lg mx-auto space-y-6">
            <div className="flex items-start gap-5">
              <div className="w-10 h-10 rounded-xl bg-[hsl(var(--senior-sage))] flex items-center justify-center flex-shrink-0">
                <CheckCircle className="h-5 w-5 text-primary" />
              </div>
              <p className="text-[hsl(var(--senior-text))] text-lg pt-1.5">It reduces stress for your family.</p>
            </div>
            <div className="flex items-start gap-5">
              <div className="w-10 h-10 rounded-xl bg-[hsl(var(--senior-sage))] flex items-center justify-center flex-shrink-0">
                <CheckCircle className="h-5 w-5 text-primary" />
              </div>
              <p className="text-[hsl(var(--senior-text))] text-lg pt-1.5">It helps prevent confusion and disagreements.</p>
            </div>
            <div className="flex items-start gap-5">
              <div className="w-10 h-10 rounded-xl bg-[hsl(var(--senior-sage))] flex items-center justify-center flex-shrink-0">
                <CheckCircle className="h-5 w-5 text-primary" />
              </div>
              <p className="text-[hsl(var(--senior-text))] text-lg pt-1.5">It keeps important details in one place.</p>
            </div>
          </div>
        </section>

        {/* 4) TESTIMONIALS - Warm, elevated, important with higher contrast */}
        <section className="bg-[hsl(40,35%,88%)] rounded-3xl p-8 md:p-12 mb-16 border-2 border-primary/20">
          <h2 className="text-xl md:text-2xl font-semibold text-[hsl(var(--senior-text))] mb-10 text-center">
            What Families Are Saying
          </h2>
          
          <div className="space-y-8 max-w-2xl mx-auto">
            {/* Testimonial 1 */}
            <div className="bg-white rounded-2xl shadow-md border border-primary/15 p-8 relative">
              <Quote className="absolute top-6 left-6 h-8 w-8 text-primary/30" />
              <div className="pl-8">
                <p className="text-[hsl(var(--senior-text))] text-lg leading-relaxed mb-5 italic">
                  "I finally feel at peace knowing my children won't have to guess what I wanted. This was so much easier than I expected."
                </p>
                <p className="text-primary font-bold text-base">— Margaret, 72</p>
              </div>
            </div>
            
            {/* Testimonial 2 */}
            <div className="bg-white rounded-2xl shadow-md border border-primary/15 p-8 relative">
              <Quote className="absolute top-6 left-6 h-8 w-8 text-primary/30" />
              <div className="pl-8">
                <p className="text-[hsl(var(--senior-text))] text-lg leading-relaxed mb-5 italic">
                  "My husband and I filled this out together one evening. It brought us closer and gave us both comfort."
                </p>
                <p className="text-primary font-bold text-base">— Robert & Helen, 68</p>
              </div>
            </div>

            {/* Additional testimonial (collapsible) */}
            {showMoreTestimonials && (
              <div className="bg-white rounded-2xl shadow-md border border-primary/15 p-8 relative">
                <Quote className="absolute top-6 left-6 h-8 w-8 text-primary/30" />
                <div className="pl-8">
                  <p className="text-[hsl(var(--senior-text))] text-lg leading-relaxed mb-5 italic">
                    "When my mother passed, we had no idea what she wanted. I don't want my family to go through that. This tool helped me put everything in one place."
                  </p>
                  <p className="text-primary font-bold text-base">— David, 58</p>
                </div>
              </div>
            )}

            <button 
              onClick={() => setShowMoreTestimonials(!showMoreTestimonials)}
              className="flex items-center gap-2 mx-auto text-sm text-[hsl(var(--senior-text))] font-medium hover:text-primary transition-colors py-2"
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

        {/* 5) OUR MISSION - Calm letter/note style with trust image */}
        <section className="mb-16">
          <div className="bg-[hsl(var(--senior-mission))] rounded-3xl border-2 border-primary/15 p-8 md:p-12">
            <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
              <div className="text-center md:text-left flex-1">
                <h2 className="text-xl font-semibold text-[hsl(var(--senior-text))] mb-6">
                  Our Mission
                </h2>
                <p className="text-[hsl(var(--senior-text))] text-lg leading-relaxed mb-4">
                  Our mission is to help families plan ahead with clarity, compassion, and confidence—so no one is left guessing during a difficult time.
                </p>
                <p className="text-[hsl(var(--senior-text-soft))] text-base">
                  We believe planning ahead is a gift of love, not a burden.
                </p>
              </div>
              <div className="flex-shrink-0 w-full md:w-64">
                <img 
                  src={mascotFamiliesChoose} 
                  alt="Why Families Choose Everlasting" 
                  className="w-full rounded-2xl shadow-md"
                />
              </div>
            </div>
          </div>
        </section>

        {/* 6) "WHAT WE OFFER" (Services) - Soft, no pressure */}
        <section className="bg-white rounded-3xl shadow-sm border border-border/30 p-8 md:p-12 mb-16">
          <h2 className="text-xl md:text-2xl font-semibold text-[hsl(var(--senior-text))] mb-2 text-center">
            What we offer
          </h2>
          <p className="text-[hsl(var(--senior-text-soft))] text-center mb-10">(when you are ready)</p>
          
          <div className="grid sm:grid-cols-2 gap-5">
            <Link 
              to="/plan-ahead" 
              className="flex items-center gap-5 p-6 rounded-2xl bg-[hsl(var(--senior-warm-gray))] hover:bg-[hsl(var(--senior-sage))] transition-colors"
            >
              <div className="w-14 h-14 rounded-xl bg-white shadow-sm flex items-center justify-center flex-shrink-0">
                <FileText className="h-7 w-7 text-primary" />
              </div>
              <span className="text-[hsl(var(--senior-text))] font-medium text-lg">Planning tools</span>
            </Link>
            
            <a 
              href="https://everlastingfuneraladvisors.com/shop/"
              className="flex items-center gap-5 p-6 rounded-2xl bg-[hsl(var(--senior-warm-gray))] hover:bg-[hsl(var(--senior-sage))] transition-colors cursor-pointer"
            >
              <div className="w-14 h-14 rounded-xl bg-white shadow-sm flex items-center justify-center flex-shrink-0">
                <ShoppingBag className="h-7 w-7 text-primary" />
              </div>
              <span className="text-[hsl(var(--senior-text))] font-medium text-lg">Affordable funeral products</span>
            </a>
            
            <Link 
              to="/after-death" 
              className="flex items-center gap-5 p-6 rounded-2xl bg-[hsl(var(--senior-warm-gray))] hover:bg-[hsl(var(--senior-sage))] transition-colors"
            >
              <div className="w-14 h-14 rounded-xl bg-white shadow-sm flex items-center justify-center flex-shrink-0">
                <BookOpen className="h-7 w-7 text-primary" />
              </div>
              <span className="text-[hsl(var(--senior-text))] font-medium text-lg">After-death guide for families</span>
            </Link>
            
            <Link 
              to="/resources" 
              className="flex items-center gap-5 p-6 rounded-2xl bg-[hsl(var(--senior-warm-gray))] hover:bg-[hsl(var(--senior-sage))] transition-colors"
            >
              <div className="w-14 h-14 rounded-xl bg-white shadow-sm flex items-center justify-center flex-shrink-0">
                <BookOpen className="h-7 w-7 text-primary" />
              </div>
              <div>
                <span className="text-[hsl(var(--senior-text))] font-medium text-lg block">Free Guides & Resources</span>
                <span className="text-[hsl(var(--senior-text-soft))] text-sm">Interactive planning guide to help you get started</span>
              </div>
            </Link>
          </div>
        </section>

        {/* 7) "WHAT HAPPENS NEXT" - Simple vertical flow */}
        <section className="bg-[hsl(var(--senior-sage))] rounded-3xl p-8 md:p-12 mb-16">
          <h2 className="text-xl md:text-2xl font-semibold text-[hsl(var(--senior-text))] mb-10 text-center">
            What happens after you start
          </h2>
          
          <div className="space-y-5 max-w-2xl mx-auto">
            <div className="flex items-start gap-5 p-6 bg-white rounded-2xl shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-primary text-primary-foreground flex items-center justify-center font-bold flex-shrink-0 text-xl shadow-sm">
                1
              </div>
              <div className="pt-2">
                <p className="text-[hsl(var(--senior-text))] text-lg">Choose what you want to include.</p>
              </div>
            </div>
            
            <div className="flex items-start gap-5 p-6 bg-white rounded-2xl shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-primary text-primary-foreground flex items-center justify-center font-bold flex-shrink-0 text-xl shadow-sm">
                2
              </div>
              <div className="pt-2">
                <p className="text-[hsl(var(--senior-text))] text-lg">Fill out only what applies.</p>
              </div>
            </div>
            
            <div className="flex items-start gap-5 p-6 bg-white rounded-2xl shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-primary text-primary-foreground flex items-center justify-center font-bold flex-shrink-0 text-xl shadow-sm">
                3
              </div>
              <div className="pt-2">
                <p className="text-[hsl(var(--senior-text))] text-lg">Save anytime and come back later.</p>
              </div>
            </div>
            
            <div className="flex items-start gap-5 p-6 bg-white rounded-2xl shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-primary text-primary-foreground flex items-center justify-center font-bold flex-shrink-0 text-xl shadow-sm">
                4
              </div>
              <div className="pt-2">
                <p className="text-[hsl(var(--senior-text))] text-lg">Print or share with your family when you are ready.</p>
              </div>
            </div>
          </div>
        </section>

        {/* NEED HELP SECTION */}
        <section className="bg-white rounded-3xl shadow-sm border border-border/30 p-8 md:p-10 mb-16">
          <h2 className="text-xl font-semibold text-[hsl(var(--senior-text))] mb-8 text-center">
            Need Help Along the Way?
          </h2>
          
          <div className="grid md:grid-cols-3 gap-5 mb-6">
            <Link 
              to="/resources" 
              className="flex flex-col items-center text-center p-6 rounded-2xl bg-[hsl(var(--senior-warm-gray))] hover:bg-[hsl(var(--senior-sage))] transition-colors"
            >
              <div className="w-14 h-14 rounded-xl bg-white shadow-sm flex items-center justify-center mb-4">
                <BookOpen className="h-7 w-7 text-primary" />
              </div>
              <span className="font-medium text-[hsl(var(--senior-text))]">Free Guides & Resources</span>
              <span className="text-sm text-[hsl(var(--senior-text-soft))] mt-1">Interactive planning guide</span>
            </Link>
            
            <Link 
              to="/do-it-for-you" 
              className="flex flex-col items-center text-center p-6 rounded-2xl bg-[hsl(var(--senior-warm-gray))] hover:bg-[hsl(var(--senior-sage))] transition-colors"
            >
              <div className="w-14 h-14 rounded-xl bg-white shadow-sm flex items-center justify-center mb-4">
                <Users className="h-7 w-7 text-primary" />
              </div>
              <span className="font-medium text-[hsl(var(--senior-text))]">Request help filling out your plan</span>
            </Link>
            
            <Link 
              to="/faq" 
              className="flex flex-col items-center text-center p-6 rounded-2xl bg-[hsl(var(--senior-warm-gray))] hover:bg-[hsl(var(--senior-sage))] transition-colors"
            >
              <div className="w-14 h-14 rounded-xl bg-white shadow-sm flex items-center justify-center mb-4">
                <HelpCircle className="h-7 w-7 text-primary" />
              </div>
              <span className="font-medium text-[hsl(var(--senior-text))]">View common questions</span>
            </Link>
          </div>
          
          {/* Compliance disclaimer */}
          <p className="text-center text-sm text-[hsl(var(--senior-text-soft))] max-w-lg mx-auto">
            Always available guidance to help you think through your wishes.<br />
            This support is automated, not a live person.
          </p>
        </section>

        {/* 8) FINAL CTA - Calming container with reassurance */}
        <section className="text-center mb-10">
          <div className="bg-[hsl(var(--senior-sage-deep))] rounded-3xl p-10 md:p-14">
            <div className="flex flex-col items-center gap-5 mb-8">
              <Button 
                size="lg" 
                onClick={handlePrimaryCTA} 
                className="min-h-[60px] text-lg px-14 rounded-xl shadow-md hover:shadow-lg transition-shadow"
              >
                Continue My Plan
              </Button>
              
              <Button 
                variant="outline" 
                size="lg" 
                asChild
                className="min-h-[56px] text-lg px-10 rounded-xl bg-white/80 hover:bg-white"
              >
                <Link to="/resources">Learn More First</Link>
              </Button>
            </div>
            
            <p className="text-[hsl(var(--senior-text-soft))]">
              You can skip anything and come back later. Nothing is shared unless you choose.
            </p>
          </div>
        </section>

        {/* Cross-link to Version A */}
        <section className="text-center py-8 border-t border-border/40">
          <Link 
            to="/" 
            className="text-sm text-[hsl(var(--senior-text-soft))] hover:text-primary underline"
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
