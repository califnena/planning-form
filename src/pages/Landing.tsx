import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link, useNavigate } from "react-router-dom";
import { LanguageSelector } from "@/components/LanguageSelector";
import { FileText, CheckCircle, Shield, BookOpen, Scale, FileOutput, Plus, Minus, ClipboardList, CalendarCheck, ShoppingBag, Users, Headphones, Music, Type, HelpCircle, Phone, Download } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import mascotCouple from "@/assets/mascot-couple.png";

const Landing = () => {
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
            <h1 className="text-xl font-semibold text-primary">Everlasting Funeral Advisors</h1>
            <p className="text-xs text-muted-foreground">Simple End-of-Life Planning & Document Organization</p>
          </div>
          <div className="flex items-center gap-3">
            {/* Text Size Controls */}
            <div className="flex items-center gap-2 border border-border rounded-md px-3 py-1.5">
              <span className="text-sm text-muted-foreground font-medium">Text Size:</span>
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
              <Button variant="outline" size="lg">Sign In</Button>
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
            End-of-Life Planning Made Simple
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed max-w-3xl mx-auto">
            Document your wishes, follow step-by-step guidance, and access affordable products—All in one place.
          </p>
          
          <div className="flex flex-col items-center gap-4 pt-6">
            <Button 
              size="lg" 
              className="text-lg px-12 py-7"
              onClick={handleStartPlanner}
            >
              Start Your Planner
            </Button>
            <Link to="/login" className="text-sm text-muted-foreground hover:text-primary transition-colors">
              Already have an account? Sign In
            </Link>
            <Link to="/pricing" className="text-sm text-primary hover:underline font-medium">
              View Pricing & Plans →
            </Link>
          </div>

          {/* What Is the Everlasting Planner Section */}
          <div className="mt-16 max-w-3xl mx-auto">
            <div className="bg-card border border-border rounded-2xl p-8 md:p-10 shadow-sm">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
                What Is the Everlasting Planner?
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                A simple online tool that guides you through planning your funeral wishes, storing important documents, and leaving clear instructions for the people who will need them. Everything is private, secure, and easy to update anytime.
              </p>
            </div>
          </div>
        </div>

        {/* What You Can Do Section */}
        <div className="mt-24 max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-foreground mb-12">
            What You Can Do
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
                  Record Your Funeral Preferences
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  Document your wishes for services, burial or cremation, and memorial details so nothing is left to guesswork.
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
                  Leave Memorable Messages for Loved Ones
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  Leave heartfelt messages for your loved ones—written, video, or audio recordings of yourself with your special words they'll treasure forever.
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
                  Use the After-Death Planner
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  Give your family a simple checklist they can follow after a loss, from first-48-hour tasks to longer-term steps.
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
                  Purchase Affordable Funeral Products
                  <span className="ml-2 text-xs bg-muted text-muted-foreground px-2 py-1 rounded-full">Coming Soon</span>
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  Access competitively priced caskets, urns, flowers, and other funeral items in one place.
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
                  Do-It-For-You Planning Session
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  Book a one-time session where a specialist helps you fill out your planner together and get everything ready.
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
                  VIP Coach Assistant (24/7 Support)
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  Get ongoing support for planning questions, hard decisions, and emotional moments. A VIP coach is available when you need help.
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
                  Create a Custom Memorial Song
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  Order a personalized song to honor a loved one, based on their story, hobbies, and personality.
                </p>
              </CardContent>
            </Card>

            {/* 8. Adjust Text Size, Colors, and Language */}
            <Card className="border-2 hover:border-primary/50 transition-colors cursor-pointer">
              <CardContent className="pt-8 pb-8 text-center space-y-4">
                <div className="flex justify-center">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-slate-500 to-slate-600 flex items-center justify-center shadow-lg">
                    <Type className="h-8 w-8 text-white" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-foreground">
                  Adjust Text Size, Colors, and Language
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  Increase text size, turn on high-contrast colors, reduce motion, and switch languages for an easier, senior-friendly experience.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Helpful Guides & Resources Section */}
        <div className="mt-24 max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-foreground mb-12">
            Helpful Guides & Resources
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
                  Helpful Articles & Guides
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  Read simple guides on planning ahead, talking with family, and understanding funeral options.
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
                  Legal Documents & Planning Basics
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  Learn about common legal documents (like wills, powers of attorney, and trusts) and where they fit into your plan.
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
                  Common Questions
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  See answers to the questions families ask most often about planning, payment, and how the tool works.
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
                  Helpful Contacts & Vendors
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  Find useful contacts, local providers, and services that can help with funeral planning and after-death tasks.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Testimonials Section */}
        <div className="mt-24 max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-foreground mb-12">
            Real Stories - Testimonials
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-2 bg-gradient-to-br from-yellow-50 to-amber-50">
              <CardContent className="pt-8 pb-8 space-y-4">
                <p className="text-muted-foreground leading-relaxed italic">
                  "When my father passed, we didn't know where anything was—no passwords, no documents, no instructions. We spent weeks searching. I wish we had something like this sooner."
                </p>
                <p className="text-sm font-semibold text-foreground">
                  — Sarah M., Daughter
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 bg-gradient-to-br from-yellow-50 to-amber-50">
              <CardContent className="pt-8 pb-8 space-y-4">
                <p className="text-muted-foreground leading-relaxed italic">
                  "My mother used this planner, and everything was organized for us. It made a painful time so much easier. We were able to focus on remembering her instead of searching for paperwork."
                </p>
                <p className="text-sm font-semibold text-foreground">
                  — Robert T., Son
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 bg-gradient-to-br from-yellow-50 to-amber-50">
              <CardContent className="pt-8 pb-8 space-y-4">
                <p className="text-muted-foreground leading-relaxed italic">
                  "I live alone, and I wanted to make sure someone could handle things smoothly when my time comes. This gave me comfort knowing everything is documented clearly."
                </p>
                <p className="text-sm font-semibold text-foreground">
                  — Elaine K., Retired Teacher
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* About Everlasting Funeral Advisors Section - BEFORE Mission */}
        <div className="max-w-4xl mx-auto mt-24">
          <div className="bg-card border border-border rounded-2xl p-8 md:p-12 shadow-sm">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Everlasting Funeral Advisors
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Your trusted partner in compassionate, affordable funeral planning 🏺
            </p>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Affordable Products */}
              <div>
                <h4 className="text-xl font-semibold text-foreground mb-4">
                  Affordable Products
                </h4>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">Premium and budget-friendly caskets</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">Beautiful cremation urns in various styles</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">Fresh flower arrangements and memorial tributes</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">Complete funeral packages tailored to your budget</span>
                  </li>
                </ul>
              </div>

              {/* Professional Services */}
              <div>
                <h4 className="text-xl font-semibold text-foreground mb-4">
                  Professional Services
                </h4>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">Expert funeral planning advisors</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">Legacy Planner (physical binder & digital platform)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">Customized eulogy writing and song selection</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">Guidance and coaching to document your funeral plans and last wishes</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Our Mission Section - AFTER About */}
            <div className="mt-12 pt-8 border-t border-border">
              <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
                Our Mission
              </h3>
              <p className="text-lg text-muted-foreground leading-relaxed mb-8">
                Are you prepared for one of life's most difficult moments? Our mission is to guide families through the process of planning an affordable funeral with care, compassion, and expertise. From understanding your options to making thoughtful decisions, we're here to support you every step of the way. With our resources and guidance, you can create a meaningful farewell that honors your loved one's life while easing the burden on your family during a challenging time. Let us help you navigate this journey with sensitivity and understanding.
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
                      Pre-Planning Your Funeral: A Gift of Peace and Clarity
                    </h4>
                    <p className="text-base text-muted-foreground leading-relaxed">
                      A comprehensive guide to help you understand the importance of pre-planning your funeral arrangements. Learn about different burial options, service types, and how to communicate your wishes to loved ones.
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    <Button asChild size="lg" className="whitespace-nowrap">
                      <a href="/guides/Pre-Planning-Guide.pdf" download>
                        <Download className="mr-2 h-4 w-4" />
                        Download Guide
                      </a>
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
