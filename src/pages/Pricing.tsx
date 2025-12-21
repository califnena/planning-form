import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Star, Loader2 } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { LanguageSelector } from "@/components/LanguageSelector";
import { Plus, Minus } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import mascotCouple from "@/assets/mascot-couple.png";
import { launchCheckout } from "@/lib/checkoutLauncher";
import { supabase } from "@/integrations/supabase/client";

type StripePriceInfo = {
  lookupKey: string;
  currency: string;
  unitAmount: number | null;
  type: "one_time" | "recurring";
  interval?: "month" | "year" | null;
  intervalCount?: number | null;
  productName?: string | null;
  productDescription?: string | null;
};

type StripePricesMap = Record<string, StripePriceInfo>;

type Plan = {
  id: string;
  title: string;
  subtitle: string;
  bullets: string[];
  lookupKey: string;
  successPath: string;
  badge?: string;
  category: "one_time" | "subscription" | "service";
};

const PRICING_LOOKUP_KEYS = [
  "EFABASIC",
  "EFAPREMIUM",
  "EFAVIPMONTHLY",
  "EFAVIPYEAR",
  "EFABINDER",
  "EFADOFORU",
  "STANDARDSONG",
];

function formatMoney(unitAmount: number | null | undefined, currency?: string) {
  if (unitAmount == null) return "";
  const amount = unitAmount / 100;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: (currency || "usd").toUpperCase(),
    maximumFractionDigits: 2,
  }).format(amount);
}

function priceLabel(p?: StripePriceInfo) {
  if (!p) return "See price at checkout";
  const amt = formatMoney(p.unitAmount, p.currency);
  if (!amt) return "See price at checkout";
  if (p.type === "recurring") {
    const interval = p.interval === "year" ? "/year" : "/month";
    return `${amt}${interval}`;
  }
  return amt;
}

const Pricing = () => {
  const navigate = useNavigate();
  const [textSize, setTextSize] = useState<number>(100);
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [loadingPrices, setLoadingPrices] = useState(true);
  const [stripePrices, setStripePrices] = useState<StripePricesMap>({});

  // Plans shown on the page
  const plans: Plan[] = useMemo(() => [
    {
      id: "printable",
      title: "Printable Planning Form",
      subtitle: "One-time purchase",
      bullets: [
        "Clean printable planning form",
        "Fill out by hand or digitally",
        "Keep for your records or binder",
      ],
      lookupKey: "EFABASIC",
      successPath: "/purchase-success?type=printable",
      category: "one_time",
    },
    {
      id: "guided",
      title: "Step-by-Step Guided Planner",
      subtitle: "One-time purchase",
      bullets: [
        "Guided walk-through, one section at a time",
        "Save progress and update anytime",
        "Plain-language explanations",
      ],
      lookupKey: "EFAPREMIUM",
      successPath: "/purchase-success?type=premium",
      badge: "Most Popular",
      category: "one_time",
    },
    {
      id: "vip-monthly",
      title: "CARE Support",
      subtitle: "Monthly subscription",
      bullets: [
        "Personal planning help from Claire",
        "Help organizing decisions and next steps",
        "Cancel anytime",
      ],
      lookupKey: "EFAVIPMONTHLY",
      successPath: "/purchase-success?type=vip",
      category: "subscription",
    },
    {
      id: "vip-yearly",
      title: "CARE Support",
      subtitle: "Yearly subscription",
      bullets: [
        "Same support as monthly",
        "Better value for ongoing help",
        "Cancel anytime",
      ],
      lookupKey: "EFAVIPYEAR",
      successPath: "/purchase-success?type=vip",
      category: "subscription",
    },
    {
      id: "do-for-you",
      title: "Do-It-For-You Planning",
      subtitle: "One-time service",
      bullets: [
        "We help organize your wishes and complete the planning with you",
        "You review and approve everything",
        "Next step is a short intake form",
      ],
      lookupKey: "EFADOFORU",
      successPath: "/do-it-for-you/confirmation",
      category: "service",
    },
    {
      id: "binder",
      title: "Planning Binder",
      subtitle: "One-time purchase",
      bullets: [
        "Physical binder to organize planning documents",
        "Easy for family members to find when needed",
      ],
      lookupKey: "EFABINDER",
      successPath: "/purchase-success?type=binder",
      category: "one_time",
    },
    {
      id: "song",
      title: "Custom Memorial Song",
      subtitle: "One-time purchase",
      bullets: [
        "Personalized tribute based on your answers",
        "Delivered as a digital audio file",
      ],
      lookupKey: "STANDARDSONG",
      successPath: "/purchase-success?type=song",
      category: "one_time",
    },
  ], []);

  // Load text size from localStorage
  useEffect(() => {
    const savedSize = localStorage.getItem("landing_text_size");
    if (savedSize) {
      const size = parseInt(savedSize);
      setTextSize(size);
      document.documentElement.style.fontSize = `${size}%`;
    }
  }, []);

  // Load live Stripe prices
  useEffect(() => {
    let mounted = true;

    (async () => {
      setLoadingPrices(true);
      try {
        const { data, error } = await supabase.functions.invoke("stripe-list-prices", {
          body: { lookupKeys: PRICING_LOOKUP_KEYS },
        });

        if (error) throw error;

        const prices = (data?.prices || {}) as StripePricesMap;
        if (!mounted) return;
        setStripePrices(prices);
      } catch (err) {
        console.error("Failed to load Stripe prices:", err);
        if (!mounted) return;
        setStripePrices({});
      } finally {
        if (!mounted) return;
        setLoadingPrices(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const handleTextSizeChange = (direction: "increase" | "decrease") => {
    const newSize = direction === "increase" 
      ? Math.min(textSize + 10, 150) 
      : Math.max(textSize - 10, 80);
    
    setTextSize(newSize);
    document.documentElement.style.fontSize = `${newSize}%`;
    localStorage.setItem("landing_text_size", newSize.toString());
  };

  const handleChoosePlan = async (plan: Plan) => {
    const successUrl = `${window.location.origin}${plan.successPath}`;
    const cancelUrl = window.location.href;

    setLoadingPlan(plan.id);
    
    await launchCheckout({
      lookupKey: plan.lookupKey,
      successUrl,
      cancelUrl,
      navigate,
      onLoadingChange: (loading) => {
        if (!loading) setLoadingPlan(null);
      },
    });
  };

  const handlePreview = (path: string) => {
    const expiryTime = Date.now() + (24 * 60 * 60 * 1000);
    localStorage.setItem("preview_mode_expiry", expiryTime.toString());
    navigate(path);
  };

  const getDisplayedPrice = (lookupKey: string) => priceLabel(stripePrices[lookupKey]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
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

      <main className="container mx-auto px-4 py-16 flex-1">
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
              Compare Pricing & Options
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Choose the level of support that feels right. You can review options before purchasing.
            </p>
          </div>

          {/* Navigation Links */}
          <div className="flex justify-center gap-4 flex-wrap">
            <Button 
              variant="outline" 
              onClick={() => navigate("/")}
            >
              Return to Home
            </Button>
            <Button 
              variant="outline" 
              onClick={() => navigate("/dashboard")}
            >
              Return to Dashboard
            </Button>
            <Button 
              variant="outline" 
              onClick={() => navigate("/subscription")}
            >
              View Current Subscription
            </Button>
          </div>

          {/* Plans Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {plans.map((plan) => {
              const priceText = loadingPrices ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading...
                </span>
              ) : getDisplayedPrice(plan.lookupKey);
              const isBuying = loadingPlan === plan.id;

              return (
                <Card 
                  key={plan.id} 
                  className={`relative flex flex-col ${plan.badge === "Most Popular" ? "border-primary border-2" : ""}`}
                >
                  {plan.badge && (
                    <Badge 
                      className="absolute -top-3 left-1/2 -translate-x-1/2"
                      variant="secondary"
                    >
                      {plan.badge === "Premium" ? <Star className="h-3 w-3 mr-1" /> : null}
                      {plan.badge}
                    </Badge>
                  )}
                  <CardHeader className="text-center pb-4">
                    <CardTitle className="text-xl">{plan.title}</CardTitle>
                    <div className="mt-4">
                      <span className="text-3xl font-bold text-primary">{priceText}</span>
                    </div>
                    <CardDescription className="mt-2">
                      {plan.category === "subscription"
                        ? "Renews automatically until canceled."
                        : "One-time purchase. No renewal."}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col space-y-6">
                    <ul className="space-y-3 flex-1">
                      {plan.bullets.map((bullet, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <CheckCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                          <span className="text-sm">{bullet}</span>
                        </li>
                      ))}
                    </ul>
                    
                    <div className="space-y-2 pt-4">
                      <Button 
                        className="w-full" 
                        size="lg"
                        onClick={() => handleChoosePlan(plan)}
                        disabled={isBuying || loadingPrices}
                      >
                        {isBuying ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Starting checkout...
                          </>
                        ) : (
                          "Purchase"
                        )}
                      </Button>

                      {/* Plan-specific learn more links */}
                      {plan.lookupKey === "EFADOFORU" && (
                        <Button 
                          variant="outline" 
                          className="w-full"
                          onClick={() => navigate("/do-it-for-you")}
                        >
                          Learn More
                        </Button>
                      )}

                      {(plan.lookupKey === "EFAVIPMONTHLY" || plan.lookupKey === "EFAVIPYEAR") && (
                        <>
                          <Button 
                            variant="outline" 
                            className="w-full"
                            onClick={() => navigate("/care-support")}
                          >
                            Learn About CARE Support
                          </Button>
                          <Button 
                            variant="ghost" 
                            className="w-full text-muted-foreground"
                            onClick={() => navigate("/subscription")}
                          >
                            Manage or Cancel Subscription
                          </Button>
                        </>
                      )}
                    </div>

                    <p className="text-xs text-muted-foreground text-center">
                      Trouble paying?{" "}
                      <button 
                        onClick={() => navigate("/payment-help")}
                        className="underline hover:text-foreground"
                      >
                        Payment Help
                      </button>
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Additional Info */}
          <Card className="bg-muted/50">
            <CardContent className="p-8 text-center space-y-4">
              <h3 className="text-xl font-semibold">Not sure which option is right for you?</h3>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Try our 1-day free preview to explore features without creating an account. 
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

          {/* Payment Help Note */}
          <p className="text-sm text-muted-foreground text-center">
            Note: If a payment page looks blank, it is usually caused by an ad blocker, privacy extension, or restricted network.{" "}
            <Link to="/payment-help" className="underline hover:text-foreground">
              Visit Payment Help
            </Link>{" "}
            for quick fixes.
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-muted/30">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">
                Home
              </Link>
              <Link to="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors">
                Dashboard
              </Link>
              <Link to="/subscription" className="text-muted-foreground hover:text-foreground transition-colors">
                View Subscription
              </Link>
              <Link to="/contact" className="text-muted-foreground hover:text-foreground transition-colors">
                Contact Us
              </Link>
              <Link to="/payment-help" className="text-muted-foreground hover:text-foreground transition-colors">
                Payment Help
              </Link>
            </div>
            <p className="text-xs text-muted-foreground">
              © {new Date().getFullYear()} Everlasting Funeral Advisors. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Pricing;
