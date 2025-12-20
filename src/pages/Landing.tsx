import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link, useNavigate } from "react-router-dom";
import { LanguageSelector } from "@/components/LanguageSelector";
import { FileText, CheckCircle, Shield, BookOpen, Scale, FileOutput, Plus, Minus, ClipboardList, CalendarCheck, ShoppingBag, Users, Headphones, Music, FileCheck, HelpCircle, Phone, Download } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from "react-i18next";
import mascotCouple from "@/assets/mascot-couple.png";

const Landing = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [textSize, setTextSize] = useState<number>(100);

  useEffect(() => {
    // Load text size from localStorage
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

  const handlePreviewClick = (path: string) => {
    // Set preview mode timestamp
    const expiryTime = Date.now() + (24 * 60 * 60 * 1000); // 24 hours
    localStorage.setItem("preview_mode_expiry", expiryTime.toString());
    navigate(path);
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

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-16 md:py-24">
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

          {/* How the Everlasting Funeral Advisors System Works */}
          <div className="mt-16 max-w-5xl mx-auto">
            <div className="bg-card border border-border rounded-2xl p-8 md:p-12 shadow-sm">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6">
                {t('landing.howSystemWorks')}
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed mb-8">
                {t('landing.howSystemWorksDesc')}
              </p>
              
              <div className="grid md:grid-cols-3 gap-6 mb-8">
                {/* Complete Reference Guide */}
                <div className="bg-secondary/5 rounded-xl p-6 text-left">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <BookOpen className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">{t('landing.referenceGuide')}</h3>
                  <p className="text-sm text-muted-foreground">{t('landing.referenceGuideDesc')}</p>
                </div>
                
                {/* Step-by-Step Checklists */}
                <div className="bg-secondary/5 rounded-xl p-6 text-left">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <CheckCircle className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">{t('landing.stepByStepChecklists')}</h3>
                  <p className="text-sm text-muted-foreground">{t('landing.stepByStepChecklistsDesc')}</p>
                </div>
                
                {/* Easy-to-Use App */}
                <div className="bg-secondary/5 rounded-xl p-6 text-left">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <Shield className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">{t('landing.easyToUseApp')}</h3>
                  <p className="text-sm text-muted-foreground">{t('landing.easyToUseAppDesc')}</p>
                </div>
              </div>

              {/* Download Section */}
              <div className="border-t border-border pt-6">
                <h3 className="font-semibold text-foreground mb-4 text-center">{t('landing.downloadFreeGuides')}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
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
                    {t('landing.downloadPrePlanningGuide')}
                  </a>
                  <a 
                    href="/guides/Protect-Your-Familys-Future-Today.pdf" 
                    download 
                    className="inline-flex items-center justify-center gap-2 px-5 py-3 border border-border text-foreground rounded-lg hover:bg-muted transition-colors font-medium text-sm"
                  >
                    <Download className="h-4 w-4" />
                    {t('landing.downloadAfterDeathGuide')}
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* What Is the Everlasting Planner Section */}
          <div className="mt-16 max-w-3xl mx-auto">
            <div className="bg-card border border-border rounded-2xl p-8 md:p-10 shadow-sm">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
                {t('landing.whatIsEverlasting')}
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                {t('landing.whatIsDesc')}
              </p>
            </div>
          </div>
        </div>

        {/* What You Can Do Section */}
        <div className="mt-24 max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-foreground mb-12">
            {t('landing.whatYouCanDo')}
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* 1. Record Your Funeral Preferences */}
            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardContent className="pt-8 pb-8 text-center space-y-4">
                <div className="flex justify-center">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
                    <FileText className="h-8 w-8 text-white" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-foreground">
                  {t('landing.recordPreferences')}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {t('landing.recordPreferencesDesc')}
                </p>
              </CardContent>
            </Card>

            {/* 2. Leave Clear Instructions for Loved Ones */}
            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardContent className="pt-8 pb-8 text-center space-y-4">
                <div className="flex justify-center">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg">
                    <ClipboardList className="h-8 w-8 text-white" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-foreground">
                  {t('landing.leaveInstructions')}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {t('landing.leaveInstructionsDesc')}
                </p>
              </CardContent>
            </Card>

            {/* 3. Use the After-Death Planner */}
            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardContent className="pt-8 pb-8 text-center space-y-4">
                <div className="flex justify-center">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-lg">
                    <CalendarCheck className="h-8 w-8 text-white" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-foreground">
                  {t('landing.organizeDocuments')}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {t('landing.organizeDocumentsDesc')}
                </p>
              </CardContent>
            </Card>

            {/* 4. Purchase Affordable Funeral Products */}
            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardContent className="pt-8 pb-8 text-center space-y-4">
                <div className="flex justify-center">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg">
                    <ShoppingBag className="h-8 w-8 text-white" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-foreground">
                  {t('landing.guideFamilySteps')}
                  <span className="ml-2 text-xs bg-muted text-muted-foreground px-2 py-1 rounded-full">{t('common.comingSoon', 'Coming Soon')}</span>
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {t('landing.guideFamilyStepsDesc')}
                </p>
              </CardContent>
            </Card>

            {/* 5. Do-It-For-You Planning Session */}
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

            {/* 6. VIP Coach Assistant (24/7 Support) */}
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

            {/* 7. Create a Custom Memorial Song */}
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

            {/* 8. Free Checklists */}
            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardContent className="pt-8 pb-8 text-center space-y-4">
                <div className="flex justify-center">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg">
                    <FileCheck className="h-8 w-8 text-white" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-foreground">
                  {t('landing.freeChecklists')}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {t('landing.freeChecklistsDesc')}
                </p>
                <div className="flex flex-col gap-2 pt-2">
                  <a 
                    href="/checklists/Pre-Planning-Checklist.png" 
                    download 
                    className="inline-flex items-center justify-center gap-2 text-sm text-primary hover:underline"
                  >
                    <Download className="h-4 w-4" />
                    {t('landing.downloadPrePlanning')}
                  </a>
                  <a 
                    href="/checklists/After-Death-Checklist.png" 
                    download 
                    className="inline-flex items-center justify-center gap-2 text-sm text-primary hover:underline"
                  >
                    <Download className="h-4 w-4" />
                    {t('landing.downloadAfterDeath')}
                  </a>
                </div>
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
            {/* 1. Helpful Articles & Guides */}
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

            {/* 2. Legal Documents & Planning Basics */}
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

            {/* 3. Common Questions */}
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

            {/* 4. Helpful Contacts & Vendors */}
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
            <Card className="border-2 bg-gradient-to-br from-yellow-50 to-amber-50">
              <CardContent className="pt-8 pb-8 space-y-4">
                <p className="text-muted-foreground leading-relaxed italic">
                  {t('landing.testimonial1')}
                </p>
                <p className="text-sm font-semibold text-foreground">
                  {t('landing.testimonial1Author')}
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 bg-gradient-to-br from-yellow-50 to-amber-50">
              <CardContent className="pt-8 pb-8 space-y-4">
                <p className="text-muted-foreground leading-relaxed italic">
                  {t('landing.testimonial2')}
                </p>
                <p className="text-sm font-semibold text-foreground">
                  {t('landing.testimonial2Author')}
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 bg-gradient-to-br from-yellow-50 to-amber-50">
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

        {/* About Everlasting Funeral Advisors Section - BEFORE Mission */}
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

            {/* Our Mission Section - AFTER About */}
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
      </main>
    </div>
  );
};

export default Landing;
