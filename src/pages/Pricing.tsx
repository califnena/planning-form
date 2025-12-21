import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Star } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { LanguageSelector } from "@/components/LanguageSelector";
import { Plus, Minus } from "lucide-react";
import { useState, useEffect } from "react";
import mascotCouple from "@/assets/mascot-couple.png";

const Pricing = () => {
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

  const handleChoosePlan = (planType: string) => {
    // Store selected plan in localStorage
    localStorage.setItem("selected_plan", planType);
    // Redirect to signup/login
    navigate("/login");
  };

  const handlePreview = (path: string) => {
    // Set preview mode timestamp
    const expiryTime = Date.now() + (24 * 60 * 60 * 1000); // 24 hours
    localStorage.setItem("preview_mode_expiry", expiryTime.toString());
    navigate(path);
  };

  const plans = [
    {
      id: "basic",
      name: "Basic Plan",
      price: "$9.99",
      period: "per month",
      description: "Complete planning tools for peace of mind",
      features: [
        "Everything in Free",
        "Unlimited PDF document generation",
        "Legal document resources",
        "Priority email support",
        "Advanced form templates",
        "Document revision tracking"
      ],
      badge: "Popular"
    },
    {
      id: "premium",
      name: "Premium Plan",
      price: "$19.99",
      period: "per month",
      description: "Comprehensive planning with premium features",
      features: [
        "Everything in Basic",
        "Vendor directory access",
        "Trusted contacts management",
        "Detailed financial planning tools",
        "Property & asset tracking",
        "Pet care planning",
        "Digital legacy management"
      ],
      badge: null
    },
    {
      id: "vip",
      name: "VIP Coach Add-On",
      price: "$49.99",
      period: "per month",
      description: "Personal guidance from end-of-life planning experts",
      features: [
        "One-on-one coaching sessions",
        "Personalized planning advice",
        "Priority phone & video support",
        "Custom document review",
        "Family consultation assistance",
        "Grief support resources"
      ],
      badge: "Premium"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border sticky top-0 z-50 bg-background/95 backdrop-blur">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link to="/" className="hover:opacity-80 transition-opacity">
            <div>
              <h1 className="text-xl font-semibold text-primary">Everlasting Funeral Advisors</h1>
              <p className="text-xs text-muted-foreground">Peace of Mind Starts with a Plan</p>
            </div>
          </Link>
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

      <main className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto space-y-12">
          {/* Hero Section */}
          <div className="text-center space-y-4">
            <div className="flex justify-center mb-4">
              <img 
                src={mascotCouple} 
                alt="Everlasting Advisors" 
                className="w-24 h-24 object-contain"
              />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground">
              Choose Your Plan
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Start with a free account and upgrade anytime for premium features and expert support
            </p>
          </div>

          {/* Plans Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-6">
            {plans.map((plan) => (
              <Card 
                key={plan.id} 
                className={`relative ${plan.badge === "Popular" ? "border-primary border-2" : ""}`}
              >
                {plan.badge && (
                  <Badge 
                    className="absolute -top-3 left-1/2 -translate-x-1/2"
                    variant={plan.badge === "Premium" ? "default" : "secondary"}
                  >
                    {plan.badge === "Premium" ? <Star className="h-3 w-3 mr-1" /> : null}
                    {plan.badge}
                  </Badge>
                )}
                <CardHeader className="text-center pb-4">
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <div className="mt-4">
                    <span className="text-4xl font-bold text-primary">{plan.price}</span>
                    <span className="text-muted-foreground ml-2">/ {plan.period}</span>
                  </div>
                  <CardDescription className="mt-2">{plan.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <ul className="space-y-3">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <div className="space-y-2 pt-4">
                    <Button 
                      className="w-full" 
                      size="lg"
                      onClick={() => handleChoosePlan(plan.id)}
                    >
                      Choose {plan.name}
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => handlePreview("/preview/preplanning")}
                    >
                      Preview Features
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Additional Info */}
          <Card className="bg-muted/50">
            <CardContent className="p-8 text-center space-y-4">
              <h3 className="text-xl font-semibold">Not sure which plan is right for you?</h3>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Try our 1-day free preview to explore all features without creating an account. 
                No credit card required.
              </p>
              <div className="flex gap-4 justify-center flex-wrap">
                <Button 
                  variant="outline" 
                  size="lg"
                  onClick={() => handlePreview("/preview/preplanning")}
                >
                  Start Free Preview
                </Button>
                <Link to="/contact">
                  <Button variant="outline" size="lg">
                    Contact Us
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Pricing;
