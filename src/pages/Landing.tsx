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
            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardContent className="pt-8 pb-8 text-center space-y-4">
                <div className="flex justify-center">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <FileText className="h-8 w-8 text-primary" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-foreground">
                  Record Your Funeral Preferences
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  Document your wishes for services, burial or cremation, and memorial details.
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
                  Leave Clear Instructions for Loved Ones
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  Provide step-by-step guidance so your family knows exactly what to do.
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
                  Keep Everything Secure
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  Your personal information is protected with bank-level encryption and privacy.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardContent className="pt-8 pb-8 text-center space-y-4">
                <div className="flex justify-center">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <FileOutput className="h-8 w-8 text-primary" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-foreground">
                  Adjust Text Size & Display
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  Increase text size, turn on high contrast, or use Super-Senior Mode.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Testimonials Section */}
        <div className="mt-24 max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-foreground mb-12">
            Real Stories. Real Peace of Mind.
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-2">
              <CardContent className="pt-8 pb-8 space-y-4">
                <p className="text-muted-foreground leading-relaxed italic">
                  "When my father passed, we didn't know where anything was—no passwords, no documents, no instructions. We spent weeks searching. I wish we had something like this sooner."
                </p>
                <p className="text-sm font-semibold text-foreground">
                  — Sarah M., Daughter
                </p>
              </CardContent>
            </Card>

            <Card className="border-2">
              <CardContent className="pt-8 pb-8 space-y-4">
                <p className="text-muted-foreground leading-relaxed italic">
                  "My mother used this planner, and everything was organized for us. It made a painful time so much easier. We were able to focus on remembering her instead of searching for paperwork."
                </p>
                <p className="text-sm font-semibold text-foreground">
                  — Robert T., Son
                </p>
              </CardContent>
            </Card>

            <Card className="border-2">
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
