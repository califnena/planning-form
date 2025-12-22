import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Loader2, Check, X, ChevronDown, User } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { LanguageSelector } from "@/components/LanguageSelector";
import { Plus, Minus } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import mascotCouple from "@/assets/mascot-couple.png";
import { launchCheckout } from "@/lib/checkoutLauncher";
import { supabase } from "@/integrations/supabase/client";
import { AppFooter } from "@/components/AppFooter";
import { AssistantWidget } from "@/components/assistant/AssistantWidget";
import { PRICING_PAGE_LOOKUP_KEYS } from "@/lib/stripeLookupKeys";
import { StripeValidationAlert } from "@/components/admin/StripeValidationAlert";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

type StripePriceInfo = {
  lookupKey: string;
  currency: string;
  unitAmount: number | null;
  type: "one_time" | "recurring";
  interval?: "month" | "year" | null;
};

type StripePricesMap = Record<string, StripePriceInfo>;

const PRICING_LOOKUP_KEYS_LOCAL = ["EFAPREMIUM", "EFABASIC", "EFABINDER"];

// Map lookup keys to plan IDs
const LOOKUP_KEY_TO_PLAN_ID: Record<string, string> = {
  "EFAPREMIUM": "digital",
  "EFABASIC": "printable",
  "EFABINDER": "binder"
};

function formatMoney(unitAmount: number | null | undefined, currency?: string) {
  if (unitAmount == null) return "";
  const amount = unitAmount / 100;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: (currency || "usd").toUpperCase(),
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

function priceLabel(p?: StripePriceInfo) {
  if (!p) return "See price";
  const amt = formatMoney(p.unitAmount, p.currency);
  if (!amt) return "See price";
  return amt;
}

// Determine recommendation based on user preferences
function getRecommendedPlan(): string | null {
  const plannerMode = localStorage.getItem("planner_mode");
  const previewPath = localStorage.getItem("last_preview_path");
  
  // If user chose guided mode, recommend digital
  if (plannerMode === "guided") return "digital";
  
  // If user explored printable preview, recommend printable
  if (previewPath?.includes("printable")) return "printable";
  
  // If user explored digital preview, recommend digital
  if (previewPath?.includes("preplanning") || previewPath?.includes("digital")) return "digital";
  
  // No recommendation if no data
  return null;
}

const FAQS = [
  {
    question: "Do I have to fill out everything?",
    answer: "No. Fill out only what you want. You can skip sections and come back anytime."
  },
  {
    question: "Can I switch between guided and explore mode?",
    answer: "Yes. You can change your preference at any time in the planner settings."
  },
  {
    question: "Can I download my plan anytime?",
    answer: "Yes. You can download your completed plan as a PDF at any point."
  },
  {
    question: "Is this legal advice?",
    answer: "No. This is educational planning guidance only. For legal matters, consult an attorney."
  },
  {
    question: "Can my family access it later?",
    answer: "Yes. You control who can view your plan. You can share access with trusted contacts."
  }
];

const Pricing = () => {
  const navigate = useNavigate();
  const planCardsRef = useRef<HTMLDivElement>(null);
  const [textSize, setTextSize] = useState<number>(100);
  const [loadingCheckout, setLoadingCheckout] = useState(false);
  const [loadingPrices, setLoadingPrices] = useState(true);
  const [stripePrices, setStripePrices] = useState<StripePricesMap>({});
  const [recommendedPlan, setRecommendedPlan] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [currentPlanId, setCurrentPlanId] = useState<string | null>(null);
  const [currentPlanName, setCurrentPlanName] = useState<string | null>(null);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState<boolean>(true);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  // Core plans - simplified to 3
  const plans = [
    {
      id: "digital",
      title: "Digital Planner",
      whoItsFor: "For people who want guidance and flexibility online.",
      bullets: [
        "Interactive digital planner",
        "Step-by-step or explore-freely option",
        "Save progress automatically",
        "Download your plan as a PDF",
        "Access from any device"
      ],
      lookupKey: "EFAPREMIUM",
      successPath: "/purchase-success?type=premium",
      buttonLabel: "Start Digital Planner",
      featured: true
    },
    {
      id: "printable",
      title: "Printable Planner",
      whoItsFor: "For people who prefer paper or want something tangible.",
      bullets: [
        "Printable planning forms",
        "Fill only what you want",
        "Download and print anytime"
      ],
      lookupKey: "EFABASIC",
      successPath: "/purchase-success?type=printable",
      buttonLabel: "Download Printable Version",
      featured: false
    },
    {
      id: "binder",
      title: "Physical Binder",
      whoItsFor: "For families who want everything organized in one place.",
      bullets: [
        "Printed planner pages",
        "Organized binder",
        "Shipped to your home"
      ],
      lookupKey: "EFABINDER",
      successPath: "/purchase-success?type=binder",
      buttonLabel: "Purchase Binder",
      featured: false
    }
  ];

  // Load text size
  useEffect(() => {
    const savedSize = localStorage.getItem("landing_text_size");
    if (savedSize) {
      const size = parseInt(savedSize);
      setTextSize(size);
      document.documentElement.style.fontSize = `${size}%`;
    }
  }, []);

  // Check for recommendation
  useEffect(() => {
    setRecommendedPlan(getRecommendedPlan());
  }, []);

  // Check auth state and current plan
  useEffect(() => {
    const checkAuthAndPlan = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          setIsLoggedIn(true);
          
          // Check if user is admin
          const { data: adminRole } = await supabase
            .rpc('has_app_role', { _user_id: user.id, _role: 'admin' });
          setIsAdmin(!!adminRole);
          
          // Check for active purchases to determine current plan
          const { data: purchases } = await supabase
            .from('purchases')
            .select('product_lookup_key, status')
            .eq('user_id', user.id)
            .eq('status', 'completed')
            .order('purchased_at', { ascending: false })
            .limit(1);
          
          if (purchases && purchases.length > 0) {
            const lookupKey = purchases[0].product_lookup_key;
            const planId = LOOKUP_KEY_TO_PLAN_ID[lookupKey];
            if (planId) {
              setCurrentPlanId(planId);
              // Set display name
              const planNames: Record<string, string> = {
                digital: "Digital Planner",
                printable: "Printable Planner",
                binder: "Physical Binder"
              };
              setCurrentPlanName(planNames[planId] || null);
            }
          }
        } else {
          setIsLoggedIn(false);
        }
      } catch (error) {
        console.error('Error checking auth/plan:', error);
      } finally {
        setIsLoadingAuth(false);
      }
    };

    checkAuthAndPlan();
  }, []);

  // Load Stripe prices
  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoadingPrices(true);
      try {
        const { data, error } = await supabase.functions.invoke("stripe-list-prices", {
          body: { lookupKeys: PRICING_LOOKUP_KEYS_LOCAL },
        });
        if (error) throw error;
        if (!mounted) return;
        setStripePrices((data?.prices || {}) as StripePricesMap);
      } catch (err) {
        console.error("Failed to load Stripe prices:", err);
        if (!mounted) return;
        setStripePrices({});
      } finally {
        if (!mounted) return;
        setLoadingPrices(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const handleTextSizeChange = (direction: "increase" | "decrease") => {
    const newSize = direction === "increase" 
      ? Math.min(textSize + 10, 150) 
      : Math.max(textSize - 10, 80);
    setTextSize(newSize);
    document.documentElement.style.fontSize = `${newSize}%`;
    localStorage.setItem("landing_text_size", newSize.toString());
  };

  const handleSelectPlan = (planId: string) => {
    setSelectedPlanId(planId);
  };

  const handleContinueToCheckout = async () => {
    const plan = plans.find(p => p.id === selectedPlanId);
    if (!plan) return;
    
    const successUrl = `${window.location.origin}${plan.successPath}`;
    const cancelUrl = window.location.href;
    setLoadingCheckout(true);
    await launchCheckout({
      lookupKey: plan.lookupKey,
      successUrl,
      cancelUrl,
      navigate,
      onLoadingChange: (loading) => {
        if (!loading) setLoadingCheckout(false);
      },
    });
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
            {/* Auth-aware header button */}
            {!isLoadingAuth && (
              isLoggedIn ? (
                <Button variant="outline" size="lg" onClick={() => navigate("/dashboard")}>
                  <User className="h-4 w-4 mr-2" />
                  Account
                </Button>
              ) : (
                <Link to="/login">
                  <Button variant="outline" size="lg">Sign In</Button>
                </Link>
              )
            )}
          </div>
        </div>
      </header>

      {/* Navigation Links - Below Header */}
      <div className="border-b border-border bg-muted/30">
        <div className="container mx-auto px-4 py-2">
          <div className="flex justify-center gap-3 flex-wrap">
            <Button variant="ghost" size="sm" onClick={() => navigate("/")}>
              Home
            </Button>
            <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")}>
              Dashboard
            </Button>
            <Button variant="ghost" size="sm" onClick={() => navigate("/billing")}>
              View Subscription
            </Button>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-4 py-12 flex-1">
        {/* Current Plan Context Header - only for logged-in users with a plan */}
        {isLoggedIn && currentPlanName && (
          <div className="max-w-5xl mx-auto mb-8">
            <div className="flex items-center justify-between py-3 px-4 bg-muted/30 rounded-lg border border-border/50">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Your current plan</p>
                <p className="text-sm font-medium text-foreground">{currentPlanName}</p>
              </div>
              <div className="flex items-center gap-4">
                <p className="text-xs text-muted-foreground hidden sm:block">
                  You can review options without changing anything.
                </p>
                <button
                  onClick={() => planCardsRef.current?.scrollIntoView({ behavior: 'smooth' })}
                  className="text-sm text-primary hover:underline"
                >
                  Change plan
                </button>
              </div>
            </div>
          </div>
        )}
        <div className="max-w-5xl mx-auto space-y-12">
          
          {/* Hero - Simple */}
          <div className="text-center space-y-3">
            <div className="flex justify-center mb-4">
              <img 
                src={mascotCouple} 
                alt="Everlasting Advisors" 
                className="w-20 h-20 object-contain"
              />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground">
              Choose what works best for you.
            </h1>
            <p className="text-lg text-muted-foreground">
              Start simple. Add more only if you want.
            </p>
          </div>

          {/* Stripe Validation Alert - shows issues to admins */}
          <StripeValidationAlert 
            lookupKeys={PRICING_PAGE_LOOKUP_KEYS} 
            isAdmin={isAdmin} 
          />

          {/* Plans Grid - 3 Cards */}
          <div ref={planCardsRef} className="grid md:grid-cols-3 gap-6 scroll-mt-8">
            {plans.map((plan) => {
              const priceText = loadingPrices ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </span>
              ) : getDisplayedPrice(plan.lookupKey);
              const isRecommended = recommendedPlan === plan.id;
              const isCurrentPlan = currentPlanId === plan.id;
              const isSelected = selectedPlanId === plan.id;

              return (
                <Card 
                  key={plan.id} 
                  onClick={() => handleSelectPlan(plan.id)}
                  className={`relative flex flex-col cursor-pointer transition-all ${
                    isSelected ? "border-primary border-2 ring-2 ring-primary/30" : ""
                  } ${plan.featured && !isSelected ? "border-primary/50 border-2" : ""} ${
                    isCurrentPlan && !isSelected ? "ring-2 ring-primary/20" : ""
                  } hover:border-primary/70`}
                >
                  {/* Selected Indicator */}
                  {isSelected && (
                    <div className="absolute top-3 right-3">
                      <CheckCircle className="h-6 w-6 text-primary fill-primary/20" />
                    </div>
                  )}
                  {/* Current Plan Badge */}
                  {isCurrentPlan && (
                    <Badge 
                      className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary/10 text-primary border-primary/30"
                      variant="outline"
                    >
                      Current plan
                    </Badge>
                  )}
                  {/* Recommendation Badge - only if justified and not current plan */}
                  {isRecommended && !isCurrentPlan && (
                    <Badge 
                      className="absolute -top-3 left-1/2 -translate-x-1/2 bg-muted text-muted-foreground border"
                      variant="outline"
                    >
                      Recommended for you
                    </Badge>
                  )}
                  
                  <CardHeader className="text-center pb-2">
                    <CardTitle className="text-xl">{plan.title}</CardTitle>
                    <div className="mt-3">
                      <span className="text-3xl font-bold text-primary">{priceText}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                      {plan.whoItsFor}
                    </p>
                  </CardHeader>
                  
                  <CardContent className="flex-1 flex flex-col space-y-4">
                    <ul className="space-y-2 flex-1">
                      {plan.bullets.map((bullet, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                          <span className="text-sm">{bullet}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Continue to Checkout Button */}
          <div className="flex justify-center pt-4">
            <Button 
              size="lg"
              className="text-lg px-8 py-6"
              onClick={handleContinueToCheckout}
              disabled={!selectedPlanId || loadingCheckout || loadingPrices}
            >
              {loadingCheckout ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Loading...
                </>
              ) : (
                "👉 Continue to Secure Checkout"
              )}
            </Button>
          </div>

          {/* Comparison Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Feature</th>
                  <th className="text-center py-3 px-4 font-medium">Digital</th>
                  <th className="text-center py-3 px-4 font-medium">Printable</th>
                  <th className="text-center py-3 px-4 font-medium">Binder</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-border/50">
                  <td className="py-3 px-4">Online access</td>
                  <td className="text-center py-3 px-4"><Check className="h-4 w-4 text-primary mx-auto" /></td>
                  <td className="text-center py-3 px-4"><X className="h-4 w-4 text-muted-foreground/40 mx-auto" /></td>
                  <td className="text-center py-3 px-4"><X className="h-4 w-4 text-muted-foreground/40 mx-auto" /></td>
                </tr>
                <tr className="border-b border-border/50">
                  <td className="py-3 px-4">Step-by-step guidance</td>
                  <td className="text-center py-3 px-4"><Check className="h-4 w-4 text-primary mx-auto" /></td>
                  <td className="text-center py-3 px-4"><X className="h-4 w-4 text-muted-foreground/40 mx-auto" /></td>
                  <td className="text-center py-3 px-4"><X className="h-4 w-4 text-muted-foreground/40 mx-auto" /></td>
                </tr>
                <tr className="border-b border-border/50">
                  <td className="py-3 px-4">Printable</td>
                  <td className="text-center py-3 px-4"><Check className="h-4 w-4 text-primary mx-auto" /></td>
                  <td className="text-center py-3 px-4"><Check className="h-4 w-4 text-primary mx-auto" /></td>
                  <td className="text-center py-3 px-4"><Check className="h-4 w-4 text-primary mx-auto" /></td>
                </tr>
                <tr className="border-b border-border/50">
                  <td className="py-3 px-4">Physical copy shipped</td>
                  <td className="text-center py-3 px-4"><X className="h-4 w-4 text-muted-foreground/40 mx-auto" /></td>
                  <td className="text-center py-3 px-4"><X className="h-4 w-4 text-muted-foreground/40 mx-auto" /></td>
                  <td className="text-center py-3 px-4"><Check className="h-4 w-4 text-primary mx-auto" /></td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Reassurance Strip */}
          <div className="flex flex-wrap justify-center gap-6 py-6 text-sm text-muted-foreground border-y border-border">
            <span>Educational only.</span>
            <span>You're in control.</span>
            <span>No obligation to finish or share.</span>
          </div>

          {/* FAQ */}
          <div className="max-w-2xl mx-auto">
            <h2 className="text-xl font-semibold text-center mb-6">Common Questions</h2>
            <Accordion type="single" collapsible className="w-full">
              {FAQS.map((faq, index) => (
                <AccordionItem key={index} value={`faq-${index}`}>
                  <AccordionTrigger className="text-left text-sm">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>

          {/* Additional Services Note */}
          <Card className="bg-muted/30 border-dashed">
            <CardContent className="p-6 text-center">
              <p className="text-sm text-muted-foreground">
                Looking for more support? We also offer{" "}
                <Link to="/care-support" className="underline hover:text-foreground">CARE Support</Link>,{" "}
                <Link to="/do-it-for-you" className="underline hover:text-foreground">Do-It-For-You Planning</Link>, and{" "}
                <Link to="/custom-song" className="underline hover:text-foreground">Custom Memorial Songs</Link>.
              </p>
            </CardContent>
          </Card>

        </div>
      </main>

      <AppFooter />
      <AssistantWidget />
    </div>
  );
};

export default Pricing;