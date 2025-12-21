import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link, useNavigate } from "react-router-dom";
import { LanguageSelector } from "@/components/LanguageSelector";
import { BookOpen, CheckCircle, Shield, Scale, FileText, ClipboardList, ShoppingBag, Users, Headphones, Music, HelpCircle, Phone, Download, Heart, Quote } from "lucide-react";
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
  const handleStartPlanner = async () => {
    const {
      data: {
        user
      }
    } = await supabase.auth.getUser();
    if (user) {
      navigate("/dashboard");
    } else {
      navigate("/login");
    }
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
          {userName}
          
          <div className="flex flex-col items-center gap-4 pt-4">
            
            <Button variant="outline" size="lg" onClick={() => {
            document.getElementById('how-we-help')?.scrollIntoView({
              behavior: 'smooth'
            });
          }}>
              {t('landing.seeHowItWorks')}
            </Button>
            
            {/* Trust note */}
            
            
            <div className="flex items-center gap-4 pt-2">
              <Link to="/login" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                {t('landing.alreadyHaveAccount')}
              </Link>
              <span className="text-muted-foreground">•</span>
              <Link to="/pricing" className="text-sm text-primary hover:underline font-medium">
                {t('landing.viewPricing')}
              </Link>
            </div>
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
            {/* CARD 1: Understanding Your Options */}
            <Card className="border-2 hover:border-primary/50 transition-colors group">
              <CardContent className="pt-8 pb-8 space-y-4">
                <div className="flex justify-center">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                    <BookOpen className="h-8 w-8 text-white" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-foreground text-center">
                  {t('landing.path1Title')}
                </h3>
                <p className="text-muted-foreground leading-relaxed text-center">
                  {t('landing.path1Desc')}
                </p>
                <ul className="text-sm text-muted-foreground space-y-2 pl-4">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary flex-shrink-0" />
                    {t('landing.path1Item1')}
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary flex-shrink-0" />
                    {t('landing.path1Item2')}
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary flex-shrink-0" />
                    {t('landing.path1Item3')}
                  </li>
                </ul>
                <div className="pt-4">
                  <Button variant="outline" onClick={() => navigate("/guide")} className="w-full">
                    {t('landing.learnTheBasics')}
                  </Button>
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


        {/* TRANSPARENCY & TRUST STRIP */}
        <div className="mt-16 max-w-4xl mx-auto">
          <div className="bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 rounded-xl px-8 py-6 border border-primary/20">
            <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-12 text-center">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-primary" />
                <span className="font-medium text-foreground">{t('landing.trustClearPricing')}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-primary" />
                <span className="font-medium text-foreground">{t('landing.trustNoPressure')}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-primary" />
                <span className="font-medium text-foreground">{t('landing.trustYouChoose')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* PAYMENT EXPECTATION - Subtle but honest */}
        <div className="mt-8 max-w-3xl mx-auto text-center">
          <p className="text-muted-foreground">
            {t('landing.paymentExpectation')}
          </p>
        </div>

        {/* OPTIONAL SUPPORT */}
        <div className="mt-24 max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-foreground mb-4">
            {t('landing.optionalSupportTitle')}
          </h2>
          <p className="text-lg text-muted-foreground text-center mb-4 max-w-2xl mx-auto">
            {t('landing.optionalSupportDesc')}
          </p>
          <p className="text-sm text-muted-foreground text-center mb-12 max-w-2xl mx-auto italic">
            {t('landing.optionalSupportReassurance')}
          </p>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* VIP Coach */}
            <Card className="border-2 hover:border-primary/50 transition-colors cursor-pointer" onClick={() => navigate("/pricing")}>
              <CardContent className="pt-8 pb-8 text-center space-y-4">
                <div className="flex justify-center">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center shadow-lg">
                    <Headphones className="h-8 w-8 text-white" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-foreground">
                  {t('landing.vipCoach')}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {t('landing.vipCoachDesc')}
                </p>
              </CardContent>
            </Card>

            {/* Do-It-For-You */}
            <Card className="border-2 hover:border-primary/50 transition-colors cursor-pointer" onClick={() => navigate("/contact")}>
              <CardContent className="pt-8 pb-8 text-center space-y-4">
                <div className="flex justify-center">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center shadow-lg">
                    <Users className="h-8 w-8 text-white" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-foreground">
                  {t('landing.doItForYou')}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {t('landing.doItForYouDesc')}
                </p>
              </CardContent>
            </Card>

            {/* Custom Song */}
            <Card className="border-2 hover:border-primary/50 transition-colors cursor-pointer" onClick={() => navigate("/products/custom-song")}>
              <CardContent className="pt-8 pb-8 text-center space-y-4">
                <div className="flex justify-center">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center shadow-lg">
                    <Music className="h-8 w-8 text-white" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-foreground">
                  {t('landing.customSong')}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {t('landing.customSongDesc')}
                </p>
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
                  "Having everything written down ahead of time gave us such peace of mind. We didn't realize how many small decisions there were until we started, and having clear guidance made all the difference. Our family knows exactly what we want, and that alone is priceless."
                </p>
                <p className="text-sm font-medium text-muted-foreground">
                  — Mr. and Mrs. Anne Miller
                </p>
              </CardContent>
            </Card>

            {/* Testimonial 2 */}
            <Card className="border-2 bg-background/80 backdrop-blur">
              <CardContent className="pt-8 pb-8 space-y-4">
                <Quote className="h-8 w-8 text-primary/30" />
                <p className="text-foreground leading-relaxed">
                  "I appreciated that nothing felt rushed or sales-driven. The education helped me understand my options, and I was able to move forward at my own pace. Knowing my wishes are organized and accessible gives me a deep sense of relief."
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
                  "When my wife passed, having a clear plan already in place removed so much stress. The step-by-step guidance helped me focus on honoring her instead of trying to figure everything out during a difficult time."
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

        {/* Helpful Guides & Resources Section - Now includes free downloads */}
        <div className="mt-24 max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-foreground mb-4">
            {t('landing.helpfulGuides')}
          </h2>
          <p className="text-lg text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
            Free educational resources to help you understand your options and plan with confidence.
          </p>
          
          {/* Free Downloads Row */}
          <div className="bg-card border border-border rounded-xl p-6 mb-8">
            <h3 className="text-lg font-semibold text-foreground mb-4 text-center">Free Downloadable Guides</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <a href="/guides/EFA-Pre-Planning-Checklist.pdf" download className="inline-flex items-center justify-center gap-2 px-5 py-4 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium text-sm">
                <Download className="h-4 w-4" />
                Pre-Planning Checklist
              </a>
              <a href="/guides/EFA-After-Death-Planner-and-Checklist.pdf" download className="inline-flex items-center justify-center gap-2 px-5 py-4 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 transition-colors font-medium text-sm">
                <Download className="h-4 w-4" />
                After-Death Checklist
              </a>
              <a href="/guides/Everlasting-Funeral-Advisors-Guide.pdf" download className="inline-flex items-center justify-center gap-2 px-5 py-4 border border-border text-foreground rounded-lg hover:bg-muted transition-colors font-medium text-sm">
                <Download className="h-4 w-4" />
                Education Guide
              </a>
            </div>
          </div>

          {/* Resource Cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="border-2 hover:border-primary/50 transition-colors cursor-pointer" onClick={() => navigate("/resources")}>
              <CardContent className="pt-8 pb-8 text-center space-y-4">
                <div className="flex justify-center">
                  <div className="w-16 h-16 rounded-full bg-secondary/10 flex items-center justify-center">
                    <BookOpen className="h-8 w-8 text-secondary-foreground" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-foreground">
                  {t('landing.helpfulArticles')}
                </h3>
                
              </CardContent>
            </Card>

            

            <Card className="border-2 hover:border-primary/50 transition-colors cursor-pointer" onClick={() => navigate("/faq")}>
              <CardContent className="pt-8 pb-8 text-center space-y-4">
                <div className="flex justify-center">
                  <div className="w-16 h-16 rounded-full bg-secondary/10 flex items-center justify-center">
                    <HelpCircle className="h-8 w-8 text-secondary-foreground" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-foreground">
                  {t('landing.commonQuestions')}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {t('landing.commonQuestionsDesc')}
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-primary/50 transition-colors cursor-pointer" onClick={() => navigate("/vendors")}>
              <CardContent className="pt-8 pb-8 text-center space-y-4">
                <div className="flex justify-center">
                  <div className="w-16 h-16 rounded-full bg-secondary/10 flex items-center justify-center">
                    <Phone className="h-8 w-8 text-secondary-foreground" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-foreground">
                  {t('landing.helpfulContacts')}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {t('landing.helpfulContactsDesc')}
                </p>
              </CardContent>
            </Card>
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

        {/* FINAL CTA */}
        <div className="mt-24 max-w-3xl mx-auto text-center space-y-6">
          <p className="text-xl text-muted-foreground">
            {t('landing.emotionalClose1')}
          </p>
          <p className="text-lg text-muted-foreground">
            {t('landing.emotionalClose2')}
          </p>
          <Button size="lg" className="text-lg px-10 py-7 mt-4" onClick={handleStartPlanner}>
            {t('landing.startWithFreeTools')}
          </Button>
        </div>
      </main>
    </div>;
};
export default Landing;