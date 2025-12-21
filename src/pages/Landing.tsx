import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link, useNavigate } from "react-router-dom";
import { LanguageSelector } from "@/components/LanguageSelector";
import { BookOpen, CheckCircle, ClipboardList, ShoppingBag, Users, Headphones, Music, HelpCircle, Phone, Download, Heart, Quote, FileText } from "lucide-react";
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
  useEffect(() => {
    const savedSize = localStorage.getItem("landing_text_size");
    if (savedSize) {
      const size = parseInt(savedSize);
      setTextSize(size);
      document.documentElement.style.fontSize = `${size}%`;
    }

    // Check if user is logged in for personalized greeting
    const checkUser = async () => {
      const {
        data: {
          user
        }
      } = await supabase.auth.getUser();
      if (user) {
        const {
          data: profile
        } = await supabase.from('profiles').select('full_name').eq('id', user.id).single();
        if (profile?.full_name) {
          setUserName(profile.full_name.split(' ')[0]);
        }
      }
    };
    checkUser();
  }, []);
  const handleTextSizeChange = (direction: "increase" | "decrease") => {
    const newSize = direction === "increase" ? Math.min(textSize + 10, 150) : Math.max(textSize - 10, 80);
    setTextSize(newSize);
    document.documentElement.style.fontSize = `${newSize}%`;
    localStorage.setItem("landing_text_size", newSize.toString());
  };
  const handleStartPlanner = () => {
    // Go directly to Plan Ahead landing page (public) - no login required
    navigate("/plan-ahead");
  };
  return <div className="min-h-screen bg-gradient-to-b from-amber-50/40 via-background to-background">
      {/* Header */}
      <header className="border-b border-border sticky top-0 z-50 bg-background/95 backdrop-blur">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-semibold text-primary">{t('landing.companyName')}</h1>
            <p className="text-xs text-muted-foreground">{t('landing.companyTagline')}</p>
          </div>
          <div className="flex items-center gap-3">
            {/* Text Size Controls */}
            <div className="hidden sm:flex items-center gap-2 border border-border rounded-md px-3 py-1.5">
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
            <Link to="/login">
              <Button variant="outline" size="lg">{t('auth.signIn')}</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 md:py-20 bg-secondary">
        {/* HERO SECTION */}
        <div className="max-w-5xl mx-auto text-center space-y-8">
          {/* Hero Image */}
          <div className="relative mx-auto max-w-2xl">
            <img src={mascotHeroCouple} alt="Planning Ahead is a Gift of Love" className="w-full rounded-2xl shadow-lg" />
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
            {t('landing.heroTitle')}
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed max-w-3xl mx-auto">
            {t('landing.heroSubtitle')}
          </p>

          {/* Returning User Welcome - only shown when authenticated */}
          {userName && <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 max-w-md mx-auto">
              <p className="text-foreground font-medium">Welcome back, {userName}!</p>
              <Button onClick={() => navigate("/dashboard")} className="mt-2">
                Continue to Your Planning Menu →
              </Button>
            </div>}
          
          <div className="flex flex-col items-center gap-4 pt-4">
            <Button size="lg" onClick={handleStartPlanner} className="min-h-[48px] text-lg px-8">
              See How It Works
            </Button>
            <p className="text-sm text-muted-foreground">
              Preview tools and education first. Upgrade only if and when it makes sense for you.
            </p>
            <Link to="/pricing" className="text-sm text-primary hover:underline">
              View Pricing & Plans
            </Link>
          </div>
        </div>

        {/* WHAT WE DO - Single Simple Explanation */}
        <div className="mt-24 max-w-4xl mx-auto" id="how-we-help">
          <div className="bg-card border border-border rounded-2xl p-8 md:p-12 shadow-sm">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6 text-center">
              {t('landing.howWeHelpHeading')}
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed text-center max-w-3xl mx-auto">
              {t('landing.howWeHelpBody')}
            </p>
          </div>
        </div>

        {/* FOUR PATHS - Core Navigation */}
        <div className="mt-24 max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-foreground mb-4">
            {t('landing.choosePathTitle')}
          </h2>
          <p className="text-lg text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
            {t('landing.choosePathDesc')}
          </p>
          
          <div className="grid md:grid-cols-2 gap-8">
            {/* CARD 1: Understand the Process */}
            <Card className="border-2 hover:border-primary/50 transition-colors group">
              <CardContent className="pt-8 pb-8 space-y-4">
                <div className="flex justify-center">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                    <BookOpen className="h-8 w-8 text-white" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-foreground text-center">
                  Understand the Process
                </h3>
                <p className="text-muted-foreground leading-relaxed text-center">
                  Before making any decisions, take time to understand how planning works, what choices matter, and what your rights are.
                </p>
                
                {/* Education Links - Not Buttons */}
                <div className="space-y-3 pt-2">
                  <Link to="/guide" className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors group/link">
                    <BookOpen className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="font-medium text-foreground group-hover/link:text-primary transition-colors">Education & Planning Basics</span>
                      <p className="text-sm text-muted-foreground">Plain-language explanations of funeral planning, terminology, and common decisions.</p>
                    </div>
                  </Link>
                  
                  <Link to="/faq" className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors group/link">
                    <HelpCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="font-medium text-foreground group-hover/link:text-primary transition-colors">Guides & FAQs</span>
                      <p className="text-sm text-muted-foreground">Step-by-step articles and answers to common questions.</p>
                    </div>
                  </Link>
                  
                  <a 
                    href="https://consumer.ftc.gov/articles/ftc-funeral-rule" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors group/link"
                  >
                    <FileText className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="font-medium text-foreground group-hover/link:text-primary transition-colors">FTC Funeral Consumer Information</span>
                      <p className="text-sm text-muted-foreground">Federal law gives you specific rights when arranging funeral services. This information is provided directly from the Federal Trade Commission.</p>
                    </div>
                  </a>
                </div>
                
                <div className="pt-4 space-y-2">
                  <Button onClick={() => navigate("/dashboard")} className="w-full">
                    View Planning Menu
                  </Button>
                  <p className="text-xs text-center text-muted-foreground">
                    Preview your planning steps. Sign in only when you're ready to save or personalize.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* CARD 2: Plan Ahead */}
            <Card className="border-2 hover:border-primary/50 transition-colors group">
              <CardContent className="pt-8 pb-8 space-y-4">
                <div className="flex justify-center">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                    <ClipboardList className="h-8 w-8 text-white" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-foreground text-center">
                  {t('landing.path2Title')}
                </h3>
                <p className="text-muted-foreground leading-relaxed text-center">
                  {t('landing.path2Desc')}
                </p>
                <ul className="text-sm text-muted-foreground space-y-2 pl-4">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary flex-shrink-0" />
                    {t('landing.path2Item1')}
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary flex-shrink-0" />
                    {t('landing.path2Item2')}
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary flex-shrink-0" />
                    {t('landing.path2Item3')}
                  </li>
                </ul>
                <div className="pt-4">
                  <Button onClick={handleStartPlanner} className="w-full">
                    {t('landing.startPrePlanning')}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* CARD 3: Affordable Products */}
            <Card className="border-2 hover:border-primary/50 transition-colors group">
              <CardContent className="pt-8 pb-8 space-y-4">
                <div className="flex justify-center">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                    <ShoppingBag className="h-8 w-8 text-white" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-foreground text-center">
                  {t('landing.path3Title')}
                </h3>
                <p className="text-muted-foreground leading-relaxed text-center">
                  {t('landing.path3Desc')}
                </p>
                <ul className="text-sm text-muted-foreground space-y-2 pl-4">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary flex-shrink-0" />
                    {t('landing.path3Item1')}
                  </li>
                </ul>
                <div className="pt-4">
                  <a href="https://everlastingfuneraladvisors.com/shop/" target="_blank" rel="noopener noreferrer" className="w-full">
                    <Button variant="outline" className="w-full">
                      {t('landing.viewProducts')}
                    </Button>
                  </a>
                </div>
              </CardContent>
            </Card>

            {/* CARD 4: After a Death */}
            <Card className="border-2 hover:border-primary/50 transition-colors group">
              <CardContent className="pt-8 pb-8 space-y-4">
                <div className="flex justify-center">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                    <Heart className="h-8 w-8 text-white" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-foreground text-center">
                  {t('landing.path4Title')}
                </h3>
                <p className="text-muted-foreground leading-relaxed text-center">
                  {t('landing.path4Desc')}
                </p>
                <ul className="text-sm text-muted-foreground space-y-2 pl-4">
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
                <div className="pt-4">
                  <Button onClick={() => navigate("/after-death")} className="w-full">
                    {t('landing.getGuidanceNow')}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>


        {/* CLEAR, TRANSPARENT PRICING SECTION */}
        <div className="mt-24 max-w-4xl mx-auto">
          <div className="bg-card border border-border rounded-2xl p-8 md:p-12 shadow-sm text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6">
              Clear, Transparent Pricing
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed max-w-3xl mx-auto mb-8">
              You can explore education and preview planning tools before deciding to continue. Some advanced features and services require payment, but you will always see pricing clearly before committing. There are no hidden fees, no pressure, and no obligation to upgrade.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/pricing">
                <Button size="lg">View Pricing & Plans</Button>
              </Link>
              <Link to="/pricing">
                <Button variant="outline" size="lg">See What's Included</Button>
              </Link>
            </div>
          </div>
        </div>

        {/* COMPASSIONATE GUIDANCE & SUPPORT */}
        <div className="mt-24 max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-foreground mb-4">
            Compassionate Guidance & Support
          </h2>
          <p className="text-lg text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
            For individuals and families who want personal guidance, emotional reassurance, and help navigating difficult conversations. This support goes beyond planning — offering compassionate check-ins, help during moments of distress, and steady guidance before or after a loss. Always optional. Never rushed.
          </p>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Compassionate Guidance */}
            <Card className="border-2 hover:border-primary/50 transition-colors cursor-pointer" onClick={() => navigate("/vip-coach")}>
              <CardContent className="pt-8 pb-8 text-center space-y-4">
                <div className="flex justify-center">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center shadow-lg">
                    <Headphones className="h-8 w-8 text-white" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-foreground">
                  Compassionate Guidance
                </h3>
                <p className="text-muted-foreground leading-relaxed text-sm">
                  One-on-one support for navigating difficult decisions, emotional reassurance during stressful moments, and calm guidance before or after a loss.
                </p>
                <Button variant="outline" className="mt-2 min-h-[48px]">
                  Learn More
                </Button>
              </CardContent>
            </Card>

            {/* Done-For-You Coordination */}
            <Card className="border-2 hover:border-primary/50 transition-colors cursor-pointer" onClick={() => navigate("/do-it-for-you")}>
              <CardContent className="pt-8 pb-8 text-center space-y-4">
                <div className="flex justify-center">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center shadow-lg">
                    <Users className="h-8 w-8 text-white" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-foreground">
                  Done-For-You Coordination
                </h3>
                <p className="text-muted-foreground leading-relaxed text-sm">
                  {t('landing.doItForYouDesc')}
                </p>
                <Button variant="outline" className="mt-2 min-h-[48px]">
                  Learn More
                </Button>
              </CardContent>
            </Card>

            {/* Custom Memorial Song */}
            <Card className="border-2 hover:border-primary/50 transition-colors cursor-pointer" onClick={() => navigate("/products/custom-song")}>
              <CardContent className="pt-8 pb-8 text-center space-y-4">
                <div className="flex justify-center">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center shadow-lg">
                    <Music className="h-8 w-8 text-white" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-foreground">
                  Custom Memorial Song
                </h3>
                <p className="text-muted-foreground leading-relaxed text-sm">
                  {t('landing.customSongDesc')}
                </p>
                <Button variant="outline" className="mt-2 min-h-[48px]">
                  Learn More
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* TESTIMONIALS */}
        <div className="mt-24 max-w-5xl mx-auto bg-gradient-to-br from-stone-50/50 to-amber-50/30 dark:from-stone-900/20 dark:to-amber-900/10 rounded-2xl p-8 md:p-12">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-foreground mb-12">
            What Families Are Saying
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {/* Testimonial 1 */}
            <Card className="border-2 bg-background/80 backdrop-blur">
              <CardContent className="pt-8 pb-8 space-y-4">
                <Quote className="h-8 w-8 text-primary/30" />
                <p className="text-foreground leading-relaxed">
                  "Having everything written down gave us peace of mind we didn't realize we were missing. The process was calm, respectful, and never pressured. Our family knows exactly what we want, and that clarity means everything."
                </p>
                <p className="text-sm font-medium text-muted-foreground">
                  — Mr. & Mrs. Anne Miller
                </p>
              </CardContent>
            </Card>

            {/* Testimonial 2 */}
            <Card className="border-2 bg-background/80 backdrop-blur">
              <CardContent className="pt-8 pb-8 space-y-4">
                <Quote className="h-8 w-8 text-primary/30" />
                <p className="text-foreground leading-relaxed">
                  "I appreciated being able to move at my own pace. The guidance was clear and compassionate, and I never felt rushed or overwhelmed. It helped me make decisions I had been putting off for years."
                </p>
                <p className="text-sm font-medium text-muted-foreground">
                  — Joanne Barrington
                </p>
              </CardContent>
            </Card>

            {/* Testimonial 3 */}
            <Card className="border-2 bg-background/80 backdrop-blur">
              <CardContent className="pt-8 pb-8 space-y-4">
                <Quote className="h-8 w-8 text-primary/30" />
                <p className="text-foreground leading-relaxed">
                  "When the time came, having a plan made an incredibly difficult moment manageable. The support was thoughtful, and the tools were easy to follow when it mattered most."
                </p>
                <p className="text-sm font-medium text-muted-foreground">
                  — James Blake
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* WHY FAMILIES CHOOSE US - With Mascot */}
        <div className="mt-24 max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <img src={mascotFamiliesChoose} alt="Why families choose Everlasting" className="w-full max-w-md mx-auto rounded-2xl shadow-lg" />
            </div>
            <div className="space-y-6">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                {t('landing.whyFamiliesChoose')}
              </h2>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-6 w-6 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-lg text-muted-foreground">{t('landing.whyReason1')}</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-6 w-6 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-lg text-muted-foreground">{t('landing.whyReason2')}</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-6 w-6 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-lg text-muted-foreground">{t('landing.whyReason3')}</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-6 w-6 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-lg text-muted-foreground">{t('landing.whyReason4')}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* GUIDES & RESOURCES - Restructured into Learn / Use */}
        <div className="mt-24 max-w-6xl mx-auto rounded-2xl p-8 md:p-12 bg-secondary/30">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-foreground mb-4">
            Guides & Resources
          </h2>
          <p className="text-lg text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
            Free educational resources to help you understand your options and plan with confidence.
          </p>
          
          <div className="grid md:grid-cols-2 gap-8">
            {/* LEARN ABOUT FUNERAL PLANNING */}
            <div className="bg-card border border-border rounded-xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <BookOpen className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">Learn About Funeral Planning</h3>
              </div>
              <div className="space-y-3">
                <button onClick={() => navigate("/resources")} className="w-full text-left px-4 py-3 rounded-lg hover:bg-muted transition-colors flex items-center gap-3">
                  <BookOpen className="h-5 w-5 text-muted-foreground" />
                  <span className="text-foreground">Helpful Articles</span>
                </button>
                <button onClick={() => navigate("/faq")} className="w-full text-left px-4 py-3 rounded-lg hover:bg-muted transition-colors flex items-center gap-3">
                  <HelpCircle className="h-5 w-5 text-muted-foreground" />
                  <span className="text-foreground">Common Questions & Answers</span>
                </button>
                <button onClick={() => navigate("/legal-documents")} className="w-full text-left px-4 py-3 rounded-lg hover:bg-muted transition-colors flex items-center gap-3">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                  <span className="text-foreground">Legal Documents & State Resources</span>
                </button>
              </div>
            </div>

            {/* USE PLANNING TOOLS */}
            <div className="bg-card border border-border rounded-xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <ClipboardList className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">Use Planning Tools</h3>
              </div>
              <div className="space-y-3">
                <a href="/guides/EFA-Pre-Planning-Checklist.pdf" download className="w-full text-left px-4 py-3 rounded-lg hover:bg-muted transition-colors flex items-center gap-3">
                  <Download className="h-5 w-5 text-muted-foreground" />
                  <span className="text-foreground">Pre-Planning Checklist</span>
                </a>
                <a href="/guides/EFA-After-Death-Planner-and-Checklist.pdf" download className="w-full text-left px-4 py-3 rounded-lg hover:bg-muted transition-colors flex items-center gap-3">
                  <Download className="h-5 w-5 text-muted-foreground" />
                  <span className="text-foreground">After-Death Checklist</span>
                </a>
                <a href="/guides/Everlasting-Funeral-Advisors-Guide.pdf" download className="w-full text-left px-4 py-3 rounded-lg hover:bg-muted transition-colors flex items-center gap-3">
                  <Download className="h-5 w-5 text-muted-foreground" />
                  <span className="text-foreground">Education & Planning Guide</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* MISSION STATEMENT */}
        <div className="mt-24 max-w-4xl mx-auto">
          <div className="bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20 rounded-2xl p-8 md:p-12">
            <div className="flex flex-col md:flex-row gap-8 items-center">
              <div className="flex-shrink-0">
                <img src={mascotPlanningAhead} alt="Planning ahead is a gift of love" className="w-48 h-48 object-contain rounded-xl" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-foreground mb-4">
                  Our Mission
                </h3>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  Our mission is to help individuals and families organize their wishes clearly and thoughtfully—so their loved ones are not left guessing during life's most difficult moments. We believe planning ahead is an act of love, clarity, and care.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <AppFooter />
    </div>;
};
export default Landing;