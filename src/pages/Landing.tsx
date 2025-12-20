import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link, useNavigate } from "react-router-dom";
import { LanguageSelector } from "@/components/LanguageSelector";
import { BookOpen, CheckCircle, Shield, Scale, FileText, ClipboardList, ShoppingBag, Users, Headphones, Music, HelpCircle, Phone, Download, Heart, ExternalLink } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from "react-i18next";
import mascotCouple from "@/assets/mascot-couple.png";

const Landing = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [textSize, setTextSize] = useState<number>(100);

  useEffect(() => {
    const savedSize = localStorage.getItem("landing_text_size");
    if (savedSize) {
      const size = parseInt(savedSize);
      setTextSize(size);
      document.documentElement.style.fontSize = `${size}%`;
    }
  }, []);

  const handleTextSizeChange = (direction: "increase" | "decrease") => {
    const newSize = direction === "increase" 
      ? Math.min(textSize + 10, 150) 
      : Math.max(textSize - 10, 80);
    
    setTextSize(newSize);
    document.documentElement.style.fontSize = `${newSize}%`;
    localStorage.setItem("landing_text_size", newSize.toString());
  };

  const handleStartPlanner = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      navigate("/dashboard");
    } else {
      navigate("/login");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border sticky top-0 z-50 bg-background/95 backdrop-blur">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-semibold text-primary">{t('landing.companyName')}</h1>
            <p className="text-xs text-muted-foreground">{t('landing.companyTagline')}</p>
          </div>
          <div className="flex items-center gap-3">
            {/* Text Size Controls */}
            <div className="flex items-center gap-2 border border-border rounded-md px-3 py-1.5">
              <span className="text-sm text-muted-foreground font-medium">{t('header.textSize')}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleTextSizeChange("decrease")}
                className="h-7 px-2 font-semibold"
                title="Decrease text size"
              >
                A-
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 font-semibold pointer-events-none"
              >
                A
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleTextSizeChange("increase")}
                className="h-7 px-2 font-semibold"
                title="Increase text size"
              >
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

      <main className="container mx-auto px-4 py-16 md:py-24">
        {/* SECTION 1: Hero */}
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="flex justify-center mb-8">
            <img 
              src={mascotCouple} 
              alt="Everlasting Advisors" 
              className="w-56 h-56 object-contain"
            />
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold text-foreground leading-tight">
            {t('landing.heroTitle')}
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed max-w-3xl mx-auto">
            {t('landing.heroSubtitle')}
          </p>
          
          <div className="flex flex-col items-center gap-4 pt-6">
            <Button 
              size="lg" 
              className="text-lg px-12 py-7"
              onClick={handleStartPlanner}
            >
              {t('landing.startYourPlanner')}
            </Button>
            <Link to="/login" className="text-sm text-muted-foreground hover:text-primary transition-colors">
              {t('landing.alreadyHaveAccount')}
            </Link>
            <Link to="/pricing" className="text-sm text-primary hover:underline font-medium">
              {t('landing.viewPricing')}
            </Link>
          </div>
        </div>

        {/* SECTION 2: A Simple, Compassionate Way to Protect Your Family */}
        <div className="mt-24 max-w-4xl mx-auto">
          <div className="bg-card border border-border rounded-2xl p-8 md:p-12 shadow-sm text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6">
              {t('landing.compassionateWayTitle')}
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed mb-6">
              {t('landing.compassionateWayDesc1')}
            </p>
            <p className="text-lg text-muted-foreground leading-relaxed mb-6">
              {t('landing.compassionateWayDesc2')}
            </p>
            <p className="text-lg text-foreground font-medium">
              {t('landing.compassionateWayDesc3')}
            </p>
          </div>
        </div>

        {/* SECTION 3: How We Help - 4 Clear Cards */}
        <div className="mt-24 max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-foreground mb-12">
            {t('landing.howWeHelpTitle')}
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            {/* CARD 1: Learn & Understand */}
            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardContent className="pt-8 pb-8 space-y-4">
                <div className="flex justify-center">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
                    <BookOpen className="h-8 w-8 text-white" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-foreground text-center">
                  {t('landing.card1Title')}
                </h3>
                <p className="text-muted-foreground leading-relaxed text-center">
                  {t('landing.card1Desc')}
                </p>
                <div className="flex flex-col gap-3 pt-4">
                  <Button variant="outline" onClick={() => navigate("/guide")} className="w-full">
                    <BookOpen className="h-4 w-4 mr-2" />
                    {t('landing.openReferenceGuide')}
                  </Button>
                  <a 
                    href="/guides/Know-Your-Rights-When-Arranging-a-Funeral.pdf" 
                    download 
                    className="inline-flex items-center justify-center gap-2 px-4 py-2 border border-border rounded-md hover:bg-muted transition-colors text-sm font-medium"
                  >
                    <Shield className="h-4 w-4" />
                    {t('landing.knowYourRights')}
                  </a>
                  <Button variant="ghost" onClick={() => navigate("/faq")} className="w-full">
                    <HelpCircle className="h-4 w-4 mr-2" />
                    {t('landing.viewFAQs')}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* CARD 2: Plan Ahead (Pre-Planning) */}
            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardContent className="pt-8 pb-8 space-y-4">
                <div className="flex justify-center">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg">
                    <ClipboardList className="h-8 w-8 text-white" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-foreground text-center">
                  {t('landing.card2Title')}
                </h3>
                <p className="text-muted-foreground leading-relaxed text-center">
                  {t('landing.card2Desc')}
                </p>
                <div className="flex flex-col gap-3 pt-4">
                  <a 
                    href="/guides/EFA-Pre-Planning-Checklist.pdf" 
                    download 
                    className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors text-sm font-medium"
                  >
                    <Download className="h-4 w-4" />
                    {t('landing.downloadPrePlanningChecklist')}
                  </a>
                  <Button variant="outline" onClick={handleStartPlanner} className="w-full">
                    <FileText className="h-4 w-4 mr-2" />
                    {t('landing.startPrePlanningApp')}
                  </Button>
                  <Button variant="ghost" onClick={() => navigate("/contact")} className="w-full">
                    <Users className="h-4 w-4 mr-2" />
                    {t('landing.getHelpCompletingPlan')}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* CARD 3: Affordable Funeral Products */}
            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardContent className="pt-8 pb-8 space-y-4">
                <div className="flex justify-center">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg">
                    <ShoppingBag className="h-8 w-8 text-white" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-foreground text-center">
                  {t('landing.card3Title')}
                </h3>
                <p className="text-muted-foreground leading-relaxed text-center">
                  {t('landing.card3Desc')}
                </p>
                <div className="flex flex-col gap-3 pt-4">
                  <Button variant="outline" onClick={() => navigate("/products")} className="w-full">
                    <ShoppingBag className="h-4 w-4 mr-2" />
                    {t('landing.browseCasketsUrns')}
                  </Button>
                  <Button variant="ghost" onClick={() => navigate("/products/binder")} className="w-full">
                    <FileText className="h-4 w-4 mr-2" />
                    {t('landing.viewPlanningBinder')}
                  </Button>
                  <Button variant="ghost" onClick={() => navigate("/products/custom-song")} className="w-full">
                    <Music className="h-4 w-4 mr-2" />
                    {t('landing.createMemorialSong')}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* CARD 4: When a Death Occurs */}
            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardContent className="pt-8 pb-8 space-y-4">
                <div className="flex justify-center">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-lg">
                    <Heart className="h-8 w-8 text-white" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-foreground text-center">
                  {t('landing.card4Title')}
                </h3>
                <p className="text-muted-foreground leading-relaxed text-center">
                  {t('landing.card4Desc')}
                </p>
                <div className="flex flex-col gap-3 pt-4">
                  <a 
                    href="/guides/EFA-After-Death-Planner-and-Checklist.pdf" 
                    download 
                    className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors text-sm font-medium"
                  >
                    <Download className="h-4 w-4" />
                    {t('landing.downloadAfterDeathChecklist')}
                  </a>
                  <Button variant="outline" onClick={() => navigate("/after-death-planner")} className="w-full">
                    <ClipboardList className="h-4 w-4 mr-2" />
                    {t('landing.startAfterDeathPlanner')}
                  </Button>
                  <Button variant="ghost" onClick={() => navigate("/vip-coach")} className="w-full">
                    <Headphones className="h-4 w-4 mr-2" />
                    {t('landing.speakWithCoach')}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* SECTION 4: Free Downloads */}
        <div className="mt-24 max-w-4xl mx-auto">
          <div className="bg-card border border-border rounded-2xl p-8 md:p-12 shadow-sm">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-8 text-center">
              {t('landing.freePlanningToolsTitle')}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <a 
                href="/guides/EFA-Pre-Planning-Checklist.pdf" 
                download 
                className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium text-sm"
              >
                <Download className="h-4 w-4" />
                {t('landing.downloadPrePlanningChecklist')}
              </a>
              <a 
                href="/guides/EFA-After-Death-Planner-and-Checklist.pdf" 
                download 
                className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 transition-colors font-medium text-sm"
              >
                <Download className="h-4 w-4" />
                {t('landing.downloadAfterDeathChecklist')}
              </a>
              <a 
                href="/guides/Everlasting-Funeral-Advisors-Guide.pdf" 
                download 
                className="inline-flex items-center justify-center gap-2 px-5 py-3 border border-border text-foreground rounded-lg hover:bg-muted transition-colors font-medium text-sm"
              >
                <Download className="h-4 w-4" />
                {t('landing.downloadReferenceGuide')}
              </a>
              <a 
                href="/guides/Know-Your-Rights-When-Arranging-a-Funeral.pdf" 
                download 
                className="inline-flex items-center justify-center gap-2 px-5 py-3 border border-border text-foreground rounded-lg hover:bg-muted transition-colors font-medium text-sm"
              >
                <Download className="h-4 w-4" />
                {t('landing.downloadFuneralRights')}
              </a>
            </div>
          </div>
        </div>

        {/* SECTION 5: Optional Support */}
        <div className="mt-24 max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-foreground mb-4">
            {t('landing.optionalSupportTitle')}
          </h2>
          <p className="text-lg text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
            {t('landing.optionalSupportDesc')}
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            {/* VIP Coach */}
            <Card 
              className="border-2 hover:border-primary/50 transition-colors cursor-pointer"
              onClick={() => navigate("/pricing")}
            >
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
            <Card 
              className="border-2 hover:border-primary/50 transition-colors cursor-pointer"
              onClick={() => navigate("/contact")}
            >
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
            <Card 
              className="border-2 hover:border-primary/50 transition-colors cursor-pointer"
              onClick={() => navigate("/products/custom-song")}
            >
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

        {/* Helpful Guides & Resources Section */}
        <div className="mt-24 max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-foreground mb-12">
            {t('landing.helpfulGuides')}
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card 
              className="border-2 hover:border-primary/50 transition-colors cursor-pointer"
              onClick={() => navigate("/resources")}
            >
              <CardContent className="pt-8 pb-8 text-center space-y-4">
                <div className="flex justify-center">
                  <div className="w-16 h-16 rounded-full bg-secondary/10 flex items-center justify-center">
                    <BookOpen className="h-8 w-8 text-secondary" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-foreground">
                  {t('landing.helpfulArticles')}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {t('landing.helpfulArticlesDesc')}
                </p>
              </CardContent>
            </Card>

            <Card 
              className="border-2 hover:border-primary/50 transition-colors cursor-pointer"
              onClick={() => navigate("/legal-documents")}
            >
              <CardContent className="pt-8 pb-8 text-center space-y-4">
                <div className="flex justify-center">
                  <div className="w-16 h-16 rounded-full bg-secondary/10 flex items-center justify-center">
                    <Scale className="h-8 w-8 text-secondary" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-foreground">
                  {t('landing.legalDocuments')}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {t('landing.legalDocumentsDesc')}
                </p>
              </CardContent>
            </Card>

            <Card 
              className="border-2 hover:border-primary/50 transition-colors cursor-pointer"
              onClick={() => navigate("/faq")}
            >
              <CardContent className="pt-8 pb-8 text-center space-y-4">
                <div className="flex justify-center">
                  <div className="w-16 h-16 rounded-full bg-secondary/10 flex items-center justify-center">
                    <HelpCircle className="h-8 w-8 text-secondary" />
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

            <Card 
              className="border-2 hover:border-primary/50 transition-colors cursor-pointer"
              onClick={() => navigate("/vendors")}
            >
              <CardContent className="pt-8 pb-8 text-center space-y-4">
                <div className="flex justify-center">
                  <div className="w-16 h-16 rounded-full bg-secondary/10 flex items-center justify-center">
                    <Phone className="h-8 w-8 text-secondary" />
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

        {/* Testimonials Section */}
        <div className="mt-24 max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-foreground mb-12">
            {t('landing.testimonials')}
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-2 bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-950/20 dark:to-amber-950/20">
              <CardContent className="pt-8 pb-8 space-y-4">
                <p className="text-muted-foreground leading-relaxed italic">
                  {t('landing.testimonial1')}
                </p>
                <p className="text-sm font-semibold text-foreground">
                  {t('landing.testimonial1Author')}
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-950/20 dark:to-amber-950/20">
              <CardContent className="pt-8 pb-8 space-y-4">
                <p className="text-muted-foreground leading-relaxed italic">
                  {t('landing.testimonial2')}
                </p>
                <p className="text-sm font-semibold text-foreground">
                  {t('landing.testimonial2Author')}
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-950/20 dark:to-amber-950/20">
              <CardContent className="pt-8 pb-8 space-y-4">
                <p className="text-muted-foreground leading-relaxed italic">
                  {t('landing.testimonial3')}
                </p>
                <p className="text-sm font-semibold text-foreground">
                  {t('landing.testimonial3Author')}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* About & Mission Section */}
        <div className="max-w-4xl mx-auto mt-24">
          <div className="bg-card border border-border rounded-2xl p-8 md:p-12 shadow-sm">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              {t('landing.aboutTitle')}
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              {t('landing.aboutTagline')}
            </p>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Affordable Products */}
              <div>
                <h4 className="text-xl font-semibold text-foreground mb-4">
                  {t('landing.affordableProducts')}
                </h4>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">{t('landing.product1')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">{t('landing.product2')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">{t('landing.product3')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">{t('landing.product4')}</span>
                  </li>
                </ul>
              </div>

              {/* Professional Services */}
              <div>
                <h4 className="text-xl font-semibold text-foreground mb-4">
                  {t('landing.professionalServices')}
                </h4>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">{t('landing.service1')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">{t('landing.service2')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">{t('landing.service3')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">{t('landing.service4')}</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Our Mission */}
            <div className="mt-12 pt-8 border-t border-border">
              <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
                {t('landing.ourMission')}
              </h3>
              <p className="text-lg text-muted-foreground leading-relaxed mb-8">
                {t('landing.missionStatement')}
              </p>

              {/* Pre-Planning Guide Download */}
              <div className="bg-gradient-to-br from-blue-50/50 to-indigo-50/50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-xl p-8 border-2 border-border shadow-sm">
                <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
                      <FileText className="h-8 w-8 text-white" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-xl md:text-2xl font-bold text-foreground mb-2">
                      {t('landing.guideTitle')}
                    </h4>
                    <p className="text-base text-muted-foreground leading-relaxed">
                      {t('landing.guideDescription')}
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    <Button 
                      size="lg" 
                      className="whitespace-nowrap"
                      onClick={() => window.location.href = '/guide'}
                    >
                      <FileText className="mr-2 h-4 w-4" />
                      {t('landing.viewGuide')}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Final Note */}
        <div className="mt-16 max-w-3xl mx-auto text-center">
          <p className="text-lg text-muted-foreground italic">
            {t('landing.finalNote')}
          </p>
        </div>
      </main>
    </div>
  );
};

export default Landing;
