import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link, useNavigate } from "react-router-dom";
import { LanguageSelector } from "@/components/LanguageSelector";
import { FileText, CheckCircle, Shield, BookOpen, Scale, FileOutput, Plus, Minus } from "lucide-react";
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
            <p className="text-xs text-muted-foreground">Peace of Mind Starts with a Plan</p>
          </div>
          <div className="flex items-center gap-3">
            {/* Text Size Controls */}
            <div className="flex items-center gap-1 border border-border rounded-md p-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleTextSizeChange("decrease")}
                className="h-8 w-8 p-0"
                title="Decrease text size"
              >
                <Minus className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleTextSizeChange("increase")}
                className="h-8 w-8 p-0"
                title="Increase text size"
              >
                <Plus className="h-4 w-4" />
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
          <div className="flex justify-center mb-6">
            <img 
              src={mascotCouple} 
              alt="Everlasting Advisors" 
              className="w-32 h-32 object-contain"
            />
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold text-foreground leading-tight">
            Plan with Confidence. Support Your Loved Ones.
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed max-w-3xl mx-auto">
            A simple guided planner for your final wishes, documents, and the steps your family will need after you pass away.
          </p>
          
          <div className="flex flex-col items-center gap-4 pt-6">
            <Button 
              size="lg" 
              className="text-lg px-12 py-7"
              onClick={handleStartPlanner}
            >
              Start Your Planner
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="text-lg px-12 py-7"
              onClick={() => handlePreviewClick("/preview/preplanning")}
            >
              1-Day Free Preview
            </Button>
            <Link to="/login" className="text-sm text-muted-foreground hover:text-primary transition-colors">
              Already have an account? Sign In
            </Link>
            <Link to="/pricing" className="text-sm text-primary hover:underline font-medium">
              View Pricing & Plans →
            </Link>
          </div>
        </div>

        {/* What You Can Do Section */}
        <div className="mt-24 max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-foreground mb-12">
            What You Can Do
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardContent className="pt-8 pb-8 text-center space-y-4">
                <div className="flex justify-center">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <FileText className="h-8 w-8 text-primary" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-foreground">
                  Organize Your Wishes
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  Personal details, instructions, documents, and preferences all in one place.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardContent className="pt-8 pb-8 text-center space-y-4">
                <div className="flex justify-center">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <CheckCircle className="h-8 w-8 text-primary" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-foreground">
                  Guide Your Family
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  Step-by-step guidance for loved ones after a loss.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardContent className="pt-8 pb-8 text-center space-y-4">
                <div className="flex justify-center">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <Shield className="h-8 w-8 text-primary" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-foreground">
                  Stay Secure
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  Your information protected with bank-level encryption.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Preview Mode Section */}
        <div className="mt-24 max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Preview the Planner — Free 1-Day Access
            </h2>
            <p className="text-lg text-muted-foreground">
              Explore sample plans and see how we help families organize and prepare.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Card 
              className="border-2 hover:border-primary/50 transition-all cursor-pointer group"
              onClick={() => handlePreviewClick("/preview/preplanning")}
            >
              <CardContent className="pt-6 pb-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <FileText className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                      Sample Pre-Planning
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      See how to organize your final wishes and important information.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card 
              className="border-2 hover:border-primary/50 transition-all cursor-pointer group"
              onClick={() => handlePreviewClick("/preview/afterdeath")}
            >
              <CardContent className="pt-6 pb-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                      Sample After-Death Steps
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Explore the step-by-step guide for families after a loss.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card 
              className="border-2 hover:border-primary/50 transition-all cursor-pointer group"
              onClick={() => handlePreviewClick("/preview/legal")}
            >
              <CardContent className="pt-6 pb-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Scale className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                      Sample Legal Resources
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Browse legal documents and state-specific resources.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card 
              className="border-2 hover:border-primary/50 transition-all cursor-pointer group"
              onClick={() => handlePreviewClick("/preview/pdf")}
            >
              <CardContent className="pt-6 pb-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <FileOutput className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                      Sample PDF Preview
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      View a sample document with preview watermark.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Preview access lasts 24 hours. Create an account to save your own plan.
          </p>
        </div>

        {/* About Section */}
        <div className="max-w-4xl mx-auto mt-24">
          <div className="bg-card border border-border rounded-2xl p-8 md:p-12 shadow-sm">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
              About Us
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
              We guide families through pre-planning, immediate steps after a passing, and organizing essential information. 
              Our goal is to make difficult moments easier with clear tools and trusted guidance. Whether you're preparing 
              in advance or helping a loved one through a loss, we're here to support you with compassion and practical resources.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Landing;
