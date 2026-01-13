import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link, useNavigate } from "react-router-dom";
import { LanguageSelector } from "@/components/LanguageSelector";
import { BookOpen, CheckCircle, ClipboardList, ShoppingBag, Users, Headphones, Music, HelpCircle, Phone, Download, Heart, Quote, FileText, Calendar, Calculator, User } from "lucide-react";
import { AppFooter } from "@/components/AppFooter";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from "react-i18next";
import mascotPlanningAhead from "@/assets/mascot-planning-ahead.png";
import mascotFamiliesChoose from "@/assets/mascot-families-choose.png";
import mascotHeroCouple from "@/assets/mascot-hero-couple.png";
const Landing = () => {
  const {
    t
  } = useTranslation();
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

    // Check auth state and planner progress
    const checkUserState = async () => {
      try {
        const {
          data: {
            user
          }
        } = await supabase.auth.getUser();
        if (user) {
          setIsLoggedIn(true);

          // Get profile name
          const {
            data: profile
          } = await supabase.from('profiles').select('full_name').eq('id', user.id).single();
          if (profile?.full_name) {
            setUserName(profile.full_name.split(' ')[0]);
          }

          // Check for planner progress in user_settings
          const {
            data: settings
          } = await supabase.from('user_settings').select('planner_mode, selected_sections').eq('user_id', user.id).maybeSingle();

          // User has progress if they have a planner_mode set or selected_sections
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
    const newSize = direction === "increase" ? Math.min(textSize + 10, 150) : Math.max(textSize - 10, 80);
    setTextSize(newSize);
    document.documentElement.style.fontSize = `${newSize}%`;
    localStorage.setItem("landing_text_size", newSize.toString());
  };
  const handlePrimaryCTA = () => {
    if (isLoggedIn && hasPlannerProgress) {
      // Continue Planning → go to planner dashboard
      navigate("/preplandashboard");
    } else if (isLoggedIn) {
      // Start Digital Planner → go to plan-ahead entry
      navigate("/plan-ahead");
    } else {
      // Public path - go to plan-ahead landing
      navigate("/plan-ahead");
    }
  };
  return <div className="min-h-screen bg-gradient-to-b from-amber-50/40 via-background to-background">
      {/* Header */}
      <header className="border-b border-border sticky top-0 z-50 bg-background/95 backdrop-blur">
        <div className="max-w-[1200px] mx-auto px-4 md:px-6 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-semibold text-primary">{t('landing.companyName')}</h1>
            <p className="text-xs text-muted-foreground">{t('landing.companyTagline')}</p>
          </div>
          <div className="flex items-center gap-3">
            {/* Text Size Controls */}
            <div className="hidden sm:flex items-center gap-2 border border-border rounded-lg px-3 py-1.5">
              <span className="text-sm text-muted-foreground font-medium">{t('header.textSize')}</span>
              <Button variant="ghost" size="sm" onClick={() => handleTextSizeChange("decrease")} className="h-7 px-2 font-semibold" title="Decrease text size">
                A-
              </Button>
              <Button variant="ghost" size="sm" className="h-7 px-2 font-semibold pointer-events-none">
                A
              </Button>
              <Button variant="ghost" size="sm" onClick={() => handleTextSizeChange("increase")} className="h-7 px-2 font-semibold" title="Increase text size">
                A+
              </Button>
            </div>
            <LanguageSelector />
            {/* Auth-aware header button */}
            {!isLoading && (isLoggedIn ? <Button variant="outline" size="lg" onClick={() => navigate("/dashboard")}>
                  <User className="h-4 w-4 mr-2" />
                  Account
                </Button> : <Link to="/login">
                  <Button variant="outline" size="lg">{t('auth.signIn')}</Button>
                </Link>)}
          </div>
        </div>
      </header>

      <main className="max-w-[1200px] mx-auto px-4 md:px-6 py-10 md:py-16 bg-secondary">
        {/* HERO SECTION - Clean hierarchy with proper spacing */}
        <section className="max-w-4xl mx-auto text-center">
          {/* Hero Image */}
          <div className="relative mx-auto max-w-2xl mb-8">
            <img src={mascotHeroCouple} alt="Planning Ahead is a Gift of Love" className="w-full rounded-xl shadow-lg" />
          </div>
          
          {/* H1 - Primary Headline - stands alone with breathing room */}
          <h1 className="text-3xl md:text-[42px] font-bold text-foreground leading-tight max-w-3xl mx-auto">
            Plan ahead. Reduce stress. Protect your family.
          </h1>
          
          {/* Supporting sentence - single paragraph, clear spacing */}
          <p className="text-lg text-muted-foreground mt-4 mb-8 max-w-2xl mx-auto">
            Whether you're planning ahead or dealing with a recent loss, we're here to help.
          </p>


          {/* Benefits row - horizontal, structured, tight */}
          <div className="flex flex-col md:flex-row justify-center items-center gap-3 md:gap-8 text-muted-foreground text-sm mb-10">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-primary flex-shrink-0 bg-accent" />
              <span className="bg-[sidebar-accent-foreground] bg-slate-300">Create a clear plan before it's needed</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-primary flex-shrink-0" />
              <span className="bg-slate-300">Understand funeral and cremation options</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-primary flex-shrink-0" />
              <span className="bg-slate-300">Give your family direction and peace of mind</span>
            </div>
          </div>

          {/* Welcome-back reassurance - separate subtle zone */}
          {isLoggedIn && hasPlannerProgress && userName && <div className="text-center mb-6">
              <p className="font-normal text-slate-950 text-xl">Welcome back, {userName}.</p>
              <p className="text-sm text-muted-foreground/80">Your plan is saved. Continue anytime.</p>
            </div>}
          
          {/* Primary actions - clean and obvious */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-4">
            <Button size="lg" onClick={handlePrimaryCTA} className="min-h-[48px] text-lg px-8">
              {isLoggedIn && hasPlannerProgress ? "Continue Planning" : "Start Digital Planner"}
            </Button>
            <Link to="/after-death">
              <Button size="lg" variant="outline" className="min-h-[48px] text-lg px-8">
                Get Help After a Loss
              </Button>
            </Link>
          </div>
          
          {/* Sign In link for logged out users */}
          {!isLoggedIn && !isLoading && <p className="mb-6">
              <Link to="/login" className="text-sm text-muted-foreground hover:text-primary underline">
                Already have an account? Sign In
              </Link>
            </p>}

          {/* Footer reassurance - reduced visual weight */}
          
        </section>

        {/* WHAT WE DO - Single Simple Explanation */}
        <section className="mt-10 md:mt-16 max-w-4xl mx-auto" id="how-we-help">
          <div className="bg-card border border-border rounded-xl p-6 md:p-10 shadow-sm">
            <h2 className="text-2xl md:text-[28px] font-bold text-foreground mb-4 text-center">
              {t('landing.howWeHelpHeading')}
            </h2>
            <p className="text-base md:text-lg text-muted-foreground leading-relaxed text-center max-w-3xl mx-auto">
              {t('landing.howWeHelpBody')}
            </p>
          </div>
        </section>

        {/* FOUR PATHS - Core Navigation */}
        <section className="mt-10 md:mt-16">
          <h2 className="text-2xl md:text-[28px] font-bold text-center text-foreground mb-4">
            {t('landing.choosePathTitle')}
          </h2>
          <p className="text-base md:text-lg text-muted-foreground text-center mb-8 max-w-2xl mx-auto">
            {t('landing.choosePathDesc')}
          </p>
          
          <div className="grid md:grid-cols-2 gap-6 items-stretch">
            {/* CARD 1: Understand the Process */}
            <Card className="border-2 rounded-xl hover:border-primary/50 hover:shadow-lg transition-all duration-200 group cursor-pointer flex flex-col">
              <CardContent className="p-6 flex flex-col flex-1">
                <div className="flex justify-center">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                    <BookOpen className="h-7 w-7 text-white" />
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-foreground text-center mt-4">
                  Understand the Process
                </h3>
                <p className="text-muted-foreground leading-relaxed text-center mt-3 text-base">
                  Before making any decisions, take time to understand how planning works, what choices matter, and what your rights are.
                </p>
                
                {/* Education Links */}
                <div className="space-y-2 mt-4">
                  
                  
                  <Link to="/faq" className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors group/link">
                    <HelpCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="font-medium text-foreground group-hover/link:text-primary transition-colors text-base">Guides & FAQs</span>
                      <p className="text-sm text-muted-foreground">Step-by-step articles and answers to common questions.</p>
                    </div>
                  </Link>
                  
                  <a href="https://consumer.ftc.gov/articles/ftc-funeral-rule" target="_blank" rel="noopener noreferrer" className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors group/link">
                    <FileText className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="font-medium text-foreground group-hover/link:text-primary transition-colors text-base">FTC Funeral Consumer Information</span>
                      <p className="text-sm text-muted-foreground">Federal law gives you specific rights when arranging funeral services.</p>
                    </div>
                  </a>
                </div>
                
                <div className="flex-1" />
                
                <div className="pt-4 space-y-2 mt-4">
                  <Button onClick={() => navigate("/dashboard")} className="w-full min-h-[48px]">
                    View Planning Menu
                  </Button>
                  <p className="text-sm text-center text-muted-foreground">
                    Preview your planning steps. Sign in only when you're ready to save or personalize.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* CARD 2: Plan Ahead */}
            <Card className="border-2 rounded-xl hover:border-primary/50 hover:shadow-lg transition-all duration-200 group cursor-pointer flex flex-col">
              <CardContent className="p-6 flex flex-col flex-1">
                <div className="flex justify-center">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                    <ClipboardList className="h-7 w-7 text-white" />
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-foreground text-center mt-4">
                  {t('landing.path2Title')}
                </h3>
                <p className="text-muted-foreground leading-relaxed text-center mt-3 text-base">
                  {t('landing.path2Desc')}
                </p>
                
                {/* Education Links */}
                <div className="space-y-2 mt-4">
                  <Link to="/plan-ahead" className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors group/link">
                    <ClipboardList className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="font-medium text-foreground group-hover/link:text-primary transition-colors text-base">{t('landing.path2Item1')}</span>
                      <p className="text-sm text-muted-foreground">Step-by-step guidance for documenting your wishes.</p>
                    </div>
                  </Link>
                  
                  <Link to="/preplan-summary" className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors group/link">
                    <FileText className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="font-medium text-foreground group-hover/link:text-primary transition-colors text-base">{t('landing.path2Item2')}</span>
                      <p className="text-sm text-muted-foreground">Download or share your summary with loved ones.</p>
                    </div>
                  </Link>
                  
                  <Link to="/forms" className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors group/link">
                    <Download className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="font-medium text-foreground group-hover/link:text-primary transition-colors text-base">{t('landing.path2Item3')}</span>
                      <p className="text-sm text-muted-foreground">Printable worksheets and checklists for offline use.</p>
                    </div>
                  </Link>
                </div>
                
                <div className="flex-1" />
                
                <div className="pt-4 space-y-2 mt-4">
                  <Button onClick={handlePrimaryCTA} className="w-full min-h-[48px]">
                    {t('landing.startPrePlanning')}
                  </Button>
                  <p className="text-sm text-center text-muted-foreground">
                    Preview your planning steps. Sign in only when you're ready to save.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* CARD 3: Affordable Products */}
            <Card className="border-2 rounded-xl hover:border-primary/50 hover:shadow-lg transition-all duration-200 group cursor-pointer flex flex-col">
              <CardContent className="p-6 flex flex-col flex-1">
                <div className="flex justify-center">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                    <ShoppingBag className="h-7 w-7 text-white" />
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-foreground text-center mt-4">
                  {t('landing.path3Title')}
                </h3>
                <p className="text-muted-foreground leading-relaxed text-center mt-3 text-base">
                  {t('landing.path3Desc')}
                </p>
                <ul className="text-sm text-muted-foreground space-y-2 mt-4">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary flex-shrink-0" />
                    {t('landing.path3Item1')}
                  </li>
                </ul>
                
                <div className="flex-1" />
                
                <div className="pt-4 mt-4">
                  <a href="https://everlastingfuneraladvisors.com/shop/" target="_blank" rel="noopener noreferrer" className="w-full">
                    <Button variant="outline" className="w-full min-h-[48px]">
                      {t('landing.viewProducts')}
                    </Button>
                  </a>
                </div>
              </CardContent>
            </Card>

            {/* CARD 4: After a Death */}
            <Card className="border-2 rounded-xl hover:border-primary/50 hover:shadow-lg transition-all duration-200 group cursor-pointer flex flex-col">
              <CardContent className="p-6 flex flex-col flex-1">
                <div className="flex justify-center">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                    <Heart className="h-7 w-7 text-white" />
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-foreground text-center mt-4">
                  {t('landing.path4Title')}
                </h3>
                <p className="text-muted-foreground leading-relaxed text-center mt-3 text-base">
                  {t('landing.path4Desc')}
                </p>
                <ul className="text-sm text-muted-foreground space-y-2 mt-4">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary flex-shrink-0" />
                    {t('landing.path4Item1')}
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary flex-shrink-0" />
                    {t('landing.path4Item2')}
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary flex-shrink-0" />
                    {t('landing.path4Item3')}
                  </li>
                </ul>
                
                <div className="flex-1" />
                
                <div className="pt-4 mt-4">
                  <Button onClick={() => navigate("/after-death")} className="w-full min-h-[48px]">
                    {t('landing.getGuidanceNow')}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>


        {/* CLEAR, TRANSPARENT PRICING SECTION */}
        <section className="mt-10 md:mt-16 max-w-4xl mx-auto">
          <div className="bg-card border border-border rounded-xl p-6 md:p-10 shadow-sm text-center">
            <h2 className="text-2xl md:text-[28px] font-bold text-foreground mb-4">
              Clear, Transparent Pricing
            </h2>
            <p className="text-base md:text-lg text-muted-foreground leading-relaxed max-w-3xl mx-auto mb-6">
              You can explore education and preview planning tools before deciding to continue. Some advanced features and services require payment, but you will always see pricing clearly before committing. There are no hidden fees, no pressure, and no obligation to upgrade.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/pricing">
                <Button size="lg" className="min-h-[48px]">View Pricing & Plans</Button>
              </Link>
              <Link to="/pricing">
                
              </Link>
            </div>
          </div>
        </section>

        {/* COMPASSIONATE GUIDANCE & SUPPORT */}
        <section className="mt-10 md:mt-16">
          <h2 className="text-2xl md:text-[28px] font-bold text-center text-foreground mb-4">
            Compassionate Guidance & Support
          </h2>
          <p className="text-base md:text-lg text-muted-foreground text-center mb-8 max-w-2xl mx-auto">
            For individuals and families who want personal guidance, emotional reassurance, and help navigating difficult conversations. Always optional. Never rushed.
          </p>
          
          <div className="grid md:grid-cols-3 gap-6">
            {/* Compassionate Guidance */}
            <Card className="border-2 rounded-xl hover:border-primary/50 hover:shadow-lg transition-all duration-200 cursor-pointer flex flex-col" onClick={() => navigate("/vip-coach")}>
              <CardContent className="p-6 text-center flex flex-col flex-1">
                <div className="flex justify-center">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center shadow-lg">
                    <Headphones className="h-7 w-7 text-white" />
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-foreground mt-4">
                  Compassionate Guidance
                </h3>
                <p className="text-muted-foreground leading-relaxed text-sm mt-3 flex-1">
                  One-on-one support for navigating difficult decisions, emotional reassurance during stressful moments, and calm guidance before or after a loss.
                </p>
                <Button variant="outline" className="mt-4 min-h-[48px] w-full">
                  Learn More
                </Button>
              </CardContent>
            </Card>

            {/* Done-For-You Coordination */}
            <Card className="border-2 rounded-xl hover:border-primary/50 hover:shadow-lg transition-all duration-200 cursor-pointer flex flex-col" onClick={() => navigate("/do-it-for-you")}>
              <CardContent className="p-6 text-center flex flex-col flex-1">
                <div className="flex justify-center">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center shadow-lg">
                    <Users className="h-7 w-7 text-white" />
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-foreground mt-4">
                  Done-For-You Coordination
                </h3>
                <p className="text-muted-foreground leading-relaxed text-sm mt-3 flex-1">
                  {t('landing.doItForYouDesc')}
                </p>
                <Button variant="outline" className="mt-4 min-h-[48px] w-full">
                  Learn More
                </Button>
              </CardContent>
            </Card>

            {/* Custom Memorial Song */}
            <Card className="border-2 rounded-xl hover:border-primary/50 hover:shadow-lg transition-all duration-200 cursor-pointer flex flex-col" onClick={() => navigate("/products/custom-song")}>
              <CardContent className="p-6 text-center flex flex-col flex-1">
                <div className="flex justify-center">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center shadow-lg">
                    <Music className="h-7 w-7 text-white" />
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-foreground mt-4">
                  Custom Memorial Song
                </h3>
                <p className="text-muted-foreground leading-relaxed text-sm mt-3 flex-1">
                  {t('landing.customSongDesc')}
                </p>
                <Button variant="outline" className="mt-4 min-h-[48px] w-full">
                  Learn More
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* TESTIMONIALS */}
        <section className="mt-10 md:mt-16 bg-gradient-to-br from-stone-50/50 to-amber-50/30 dark:from-stone-900/20 dark:to-amber-900/10 rounded-xl p-6 md:p-10">
          <h2 className="text-2xl md:text-[28px] font-bold text-center text-foreground mb-8">
            What Families Are Saying
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {/* Testimonial 1 */}
            <Card className="border-2 rounded-xl bg-background/80 backdrop-blur flex flex-col">
              <CardContent className="p-6 flex flex-col flex-1 bg-amber-100">
                <Quote className="h-7 w-7 text-primary/30" />
                <p className="text-foreground leading-relaxed text-base mt-3 flex-1">
                  "Having everything written down gave us peace of mind we didn't realize we were missing. The process was calm, respectful, and never pressured."
                </p>
                <p className="text-sm font-medium text-muted-foreground mt-4">
                  — Mr. & Mrs. Anne Miller
                </p>
              </CardContent>
            </Card>

            {/* Testimonial 2 */}
            <Card className="border-2 rounded-xl bg-background/80 backdrop-blur flex flex-col">
              <CardContent className="p-6 flex flex-col flex-1 bg-amber-100">
                <Quote className="h-7 w-7 text-primary/30" />
                <p className="text-foreground leading-relaxed text-base mt-3 flex-1">
                  "I appreciated being able to move at my own pace. The guidance was clear and compassionate, and I never felt rushed or overwhelmed."
                </p>
                <p className="text-sm font-medium text-muted-foreground mt-4">
                  — Joanne Barrington
                </p>
              </CardContent>
            </Card>

            {/* Testimonial 3 */}
            <Card className="border-2 rounded-xl bg-background/80 backdrop-blur flex flex-col">
              <CardContent className="p-6 flex flex-col flex-1 bg-amber-100">
                <Quote className="h-7 w-7 text-primary/30" />
                <p className="text-foreground leading-relaxed text-base mt-3 flex-1">
                  "When the time came, having a plan made an incredibly difficult moment manageable. The support was thoughtful, and the tools were easy to follow."
                </p>
                <p className="text-sm font-medium text-muted-foreground mt-4">
                  — James Blake
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* WHY FAMILIES CHOOSE US - With Mascot */}
        <section className="mt-10 md:mt-16">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <img src={mascotFamiliesChoose} alt="Why families choose Everlasting" className="w-full max-w-md mx-auto rounded-xl shadow-lg" />
            </div>
            <div className="space-y-4">
              <h2 className="text-2xl md:text-[28px] font-bold text-foreground">
                {t('landing.whyFamiliesChoose')}
              </h2>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-base text-muted-foreground">{t('landing.whyReason1')}</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-base text-muted-foreground">{t('landing.whyReason2')}</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-base text-muted-foreground">{t('landing.whyReason3')}</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-base text-muted-foreground">{t('landing.whyReason4')}</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* GUIDES & RESOURCES */}
        <section className="mt-10 md:mt-16 rounded-xl p-6 md:p-10 bg-secondary/30">
          <h2 className="text-2xl md:text-[28px] font-bold text-center text-foreground mb-4">
            Guides & Resources
          </h2>
          <p className="text-base md:text-lg text-muted-foreground text-center mb-8 max-w-2xl mx-auto">
            Free educational resources to help you understand your options and plan with confidence.
          </p>
          
          <div className="grid md:grid-cols-2 gap-6">
            {/* LEARN ABOUT FUNERAL PLANNING */}
            <div className="bg-card border border-border rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <BookOpen className="h-5 w-5 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">Learn About Funeral Planning</h3>
              </div>
              <div className="space-y-2">
                <button onClick={() => navigate("/resources?section=planning-guides")} className="w-full text-left px-4 py-3 rounded-lg hover:bg-muted transition-colors flex items-center gap-3">
                  <BookOpen className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <span className="text-foreground block text-base">Guides & FAQs</span>
                    <span className="text-sm text-muted-foreground">Plain-language planning guides and answers.</span>
                  </div>
                </button>
                <button onClick={() => navigate("/resources?section=forms-worksheets")} className="w-full text-left px-4 py-3 rounded-lg hover:bg-muted transition-colors flex items-center gap-3">
                  <Download className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <span className="text-foreground block text-base">Forms & Checklists</span>
                    <span className="text-sm text-muted-foreground">Printable worksheets and planning tools.</span>
                  </div>
                </button>
                <button onClick={() => navigate("/resources?section=events-workshops")} className="w-full text-left px-4 py-3 rounded-lg hover:bg-muted transition-colors flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <span className="text-foreground block text-base">Events & Workshops</span>
                    <span className="text-sm text-muted-foreground">Find local and virtual planning events.</span>
                  </div>
                </button>
                <button onClick={() => navigate("/resources?section=learn-library")} className="w-full text-left px-4 py-3 rounded-lg hover:bg-muted transition-colors flex items-center gap-3">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <span className="text-foreground block text-base">Learn Library</span>
                    <span className="text-sm text-muted-foreground">Articles, videos, and trusted resources.</span>
                  </div>
                </button>
                <button onClick={() => navigate("/resources?section=tools-calculators")} className="w-full text-left px-4 py-3 rounded-lg hover:bg-muted transition-colors flex items-center gap-3">
                  <Calculator className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <span className="text-foreground block text-base">Tools & Calculators</span>
                    <span className="text-sm text-muted-foreground">Cost estimators and decision helpers.</span>
                  </div>
                </button>
              </div>
            </div>

            {/* USE PLANNING TOOLS */}
            <div className="bg-card border border-border rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <ClipboardList className="h-5 w-5 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">Use Planning Tools</h3>
              </div>
              <div className="space-y-2">
                <a href="/guides/EFA-Pre-Planning-Checklist.pdf" download className="w-full text-left px-4 py-3 rounded-lg hover:bg-muted transition-colors flex items-center gap-3">
                  <Download className="h-5 w-5 text-muted-foreground" />
                  <span className="text-foreground text-base">Pre-Planning Checklist</span>
                </a>
                <a href="/guides/EFA-After-Death-Planner-and-Checklist.pdf" download className="w-full text-left px-4 py-3 rounded-lg hover:bg-muted transition-colors flex items-center gap-3">
                  <Download className="h-5 w-5 text-muted-foreground" />
                  <span className="text-foreground text-base">After-Death Checklist</span>
                </a>
                <a href="/guides/Everlasting-Funeral-Advisors-Guide.pdf" download className="w-full text-left px-4 py-3 rounded-lg hover:bg-muted transition-colors flex items-center gap-3">
                  <Download className="h-5 w-5 text-muted-foreground" />
                  <span className="text-foreground text-base">Education & Planning Guide</span>
                </a>
              </div>
            </div>
          </div>

          {/* Events Teaser Strip */}
          <div className="mt-6 bg-card border border-primary/20 rounded-xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Calendar className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground text-base">Events & Workshops</h3>
                <p className="text-sm text-muted-foreground">Live and virtual sessions on planning, costs, and next steps.</p>
              </div>
            </div>
            <Button onClick={() => navigate("/events")} variant="outline" className="min-h-[48px]">
              View Events
            </Button>
          </div>
        </section>

        {/* MISSION STATEMENT */}
        <section className="mt-10 md:mt-16 max-w-4xl mx-auto">
          <div className="bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20 rounded-xl p-6 md:p-10">
            <div className="flex flex-col md:flex-row gap-6 items-center">
              <div className="flex-shrink-0">
                <img src={mascotPlanningAhead} alt="Planning ahead is a gift of love" className="w-40 h-40 object-contain rounded-xl" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-foreground mb-3">
                  Our Mission
                </h3>
                <p className="text-base text-muted-foreground leading-relaxed">
                  Our mission is to help individuals and families organize their wishes clearly and thoughtfully—so their loved ones are not left guessing during life's most difficult moments. We believe planning ahead is an act of love, clarity, and care.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Cross-link to Version B (Senior-friendly) */}
        <section className="text-center py-6 border-t border-border mt-8">
          <Link 
            to="/home-senior" 
            className="text-sm text-muted-foreground hover:text-primary underline"
          >
            Try the simpler home page
          </Link>
        </section>
      </main>
      
      <AppFooter />
    </div>;
};
export default Landing;