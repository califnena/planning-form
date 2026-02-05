import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Loader2, Check, X, ChevronDown, User, ExternalLink, RefreshCw, AlertTriangle } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { LanguageSelector } from "@/components/LanguageSelector";
import { Plus, Minus } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import mascotCouple from "@/assets/mascot-couple.png";
import { launchCheckout } from "@/lib/checkoutLauncher";
import { isStoreIAP } from "@/lib/billingMode";
import { StoreIAPModal } from "@/components/StoreIAPModal";
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
import NotAdviceNote from "@/components/NotAdviceNote";
import { PRODUCT_DESCRIPTIONS } from "@/lib/productDescriptions";

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

// Stripe Payment Link fallbacks (external URLs that always work)
const STRIPE_PAYMENT_LINKS: Record<string, { url: string; label: string }> = {
  "EFAPREMIUM": { url: "https://buy.stripe.com/14A5kD6Nn3Gjg1NdYi7bW02", label: "Premium Plan" },
  "EFABASIC": { url: "https://buy.stripe.com/6oU28r2x75OrbLxg6q7bW00", label: "Basic Plan" },
  "EFABINDER": { url: "https://buy.stripe.com/eVqcN5dbLfp1aHt8DY7bW01", label: "Physical Binder" },
  "EFAVIPMONTHLY": { url: "https://buy.stripe.com/28E8wP4Ff5OrbLx5rM7bW05", label: "VIP Monthly" },
  "EFAVIPYEAR": { url: "https://buy.stripe.com/5kQ9ATfjT0u78zl1bw7bW04", label: "VIP Yearly" },
  "EFADOFORU": { url: "https://buy.stripe.com/4gM6oHgnXfp18zl2fA7bW03", label: "Do-It-For-You" },
};

// Fallback timeout in milliseconds
const STRIPE_FALLBACK_TIMEOUT_MS = 8000;

type FallbackReason = "timeout" | "stripe_script_missing" | "init_error" | "price_load_error" | null;

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
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [loadingPrices, setLoadingPrices] = useState(true);
  const [stripePrices, setStripePrices] = useState<StripePricesMap>({});
  const [recommendedPlan, setRecommendedPlan] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [currentPlanId, setCurrentPlanId] = useState<string | null>(null);
  const [currentPlanName, setCurrentPlanName] = useState<string | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState<boolean>(true);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  
  // Fallback mode state
  const [fallbackMode, setFallbackMode] = useState<boolean>(false);
  const [fallbackReason, setFallbackReason] = useState<FallbackReason>(null);
  const [showIAPModal, setShowIAPModal] = useState(false);
  const pageLoadTime = useRef<number>(Date.now());

  // Core plans - simplified to 3
  const plans = [
    {
      id: "digital",
      title: "Digital Planner",
      whoItsFor: PRODUCT_DESCRIPTIONS.EFAPREMIUM.shortDescription,
      bullets: PRODUCT_DESCRIPTIONS.EFAPREMIUM.benefits,
      lookupKey: "EFAPREMIUM",
      successPath: "/purchase-success?type=premium",
      buttonLabel: "Access Digital Planner",
      featured: true
    },
    {
      id: "printable",
      title: "Printable Planner",
      whoItsFor: PRODUCT_DESCRIPTIONS.EFABASIC.shortDescription,
      bullets: PRODUCT_DESCRIPTIONS.EFABASIC.benefits,
      lookupKey: "EFABASIC",
      successPath: "/purchase-success?type=printable",
      buttonLabel: "Download Printable Version",
      featured: false
    },
    {
      id: "binder",
      title: "Physical Binder",
      whoItsFor: PRODUCT_DESCRIPTIONS.EFABINDER.shortDescription,
      bullets: PRODUCT_DESCRIPTIONS.EFABINDER.benefits,
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

  // Load Stripe prices with fallback detection
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
        // If prices fail to load after timeout, trigger fallback
        const elapsed = Date.now() - pageLoadTime.current;
        if (elapsed >= STRIPE_FALLBACK_TIMEOUT_MS) {
          console.warn("[Pricing Fallback] Price load error after timeout");
          setFallbackReason("price_load_error");
          setFallbackMode(true);
        }
      } finally {
        if (!mounted) return;
        setLoadingPrices(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  // 8-second timeout to detect Stripe loading issues
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      // Check if Stripe script is available
      if (typeof (window as any).Stripe === 'undefined') {
        console.warn("[Pricing Fallback] Stripe script not loaded after 8s - window.Stripe is undefined");
        setFallbackReason("stripe_script_missing");
        setFallbackMode(true);
        return;
      }
      
      // Check if prices are still loading after timeout
      if (loadingPrices) {
        console.warn("[Pricing Fallback] Prices still loading after 8s timeout");
        setFallbackReason("timeout");
        setFallbackMode(true);
      }
    }, STRIPE_FALLBACK_TIMEOUT_MS);

    return () => clearTimeout(timeoutId);
  }, [loadingPrices]);

  // Handler for opening Stripe Payment Links
  const handleOpenPaymentLink = (lookupKey: string) => {
    const link = STRIPE_PAYMENT_LINKS[lookupKey];
    if (link) {
      window.open(link.url, "_blank", "noopener,noreferrer");
    }
  };

  const handleReloadPage = () => {
    window.location.reload();
  };


  const handleTextSizeChange = (direction: "increase" | "decrease") => {
    const newSize = direction === "increase" 
      ? Math.min(textSize + 10, 150) 
      : Math.max(textSize - 10, 80);
    setTextSize(newSize);
    document.documentElement.style.fontSize = `${newSize}%`;
    localStorage.setItem("landing_text_size", newSize.toString());
  };

  const handleChoosePlan = async (plan: typeof plans[0]) => {
    if (isStoreIAP) {
      setShowIAPModal(true);
      return;
    }
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
        <NotAdviceNote />
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

          {/* Fallback Mode UI - shown when Stripe fails to load */}
          {fallbackMode && (
            <Card className="border-amber-300 bg-amber-50/50 dark:bg-amber-950/20 max-w-2xl mx-auto">
              <CardHeader className="text-center">
                <div className="mx-auto mb-2">
                  <AlertTriangle className="h-10 w-10 text-amber-600" />
                </div>
                <CardTitle className="text-amber-800 dark:text-amber-200">
                  Secure checkout did not load
                </CardTitle>
                <p className="text-amber-700 dark:text-amber-300 text-sm mt-2">
                  Your browser or network blocked the secure checkout screen. Use the buttons below to continue.
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-3">
                  {/* Core plans first */}
                  <Button 
                    onClick={() => handleOpenPaymentLink("EFAPREMIUM")} 
                    className="w-full justify-between"
                    variant="default"
                  >
                    <span>Digital Planner (Premium)</span>
                    <ExternalLink className="h-4 w-4 ml-2" />
                  </Button>
                  <Button 
                    onClick={() => handleOpenPaymentLink("EFABASIC")} 
                    className="w-full justify-between"
                    variant="outline"
                  >
                    <span>Printable Planner (Basic)</span>
                    <ExternalLink className="h-4 w-4 ml-2" />
                  </Button>
                  <Button 
                    onClick={() => handleOpenPaymentLink("EFABINDER")} 
                    className="w-full justify-between"
                    variant="outline"
                  >
                    <span>Physical Binder</span>
                    <ExternalLink className="h-4 w-4 ml-2" />
                  </Button>
                  
                  {/* Additional plans */}
                  <div className="border-t border-amber-200 dark:border-amber-800 pt-3 mt-2">
                    <p className="text-xs text-amber-600 dark:text-amber-400 mb-2">Additional options:</p>
                    <div className="grid grid-cols-2 gap-2">
                      <Button 
                        onClick={() => handleOpenPaymentLink("EFAVIPMONTHLY")} 
                        variant="ghost"
                        size="sm"
                        className="justify-between text-xs"
                      >
                        <span>VIP Monthly</span>
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                      <Button 
                        onClick={() => handleOpenPaymentLink("EFAVIPYEAR")} 
                        variant="ghost"
                        size="sm"
                        className="justify-between text-xs"
                      >
                        <span>VIP Yearly</span>
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                      <Button 
                        onClick={() => handleOpenPaymentLink("EFADOFORU")} 
                        variant="ghost"
                        size="sm"
                        className="justify-between text-xs col-span-2"
                      >
                        <span>Do-It-For-You Service</span>
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="flex justify-center pt-2">
                  <Button onClick={handleReloadPage} variant="outline" size="sm">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Reload Page
                  </Button>
                </div>

                <p className="text-xs text-center text-muted-foreground">
                  Try disabling ad blockers, VPN, or iCloud Private Relay. Or open in Chrome if using Safari.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Plans Grid - 3 Cards */}
          <div ref={planCardsRef} className="grid md:grid-cols-3 gap-6 scroll-mt-8">
            {plans.map((plan) => {
              const priceText = loadingPrices ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </span>
              ) : getDisplayedPrice(plan.lookupKey);
              const isBuying = loadingPlan === plan.id;
              const isRecommended = recommendedPlan === plan.id;
              const isCurrentPlan = currentPlanId === plan.id;

              return (
                <Card 
                  key={plan.id} 
                  className={`relative flex flex-col ${plan.featured ? "border-primary border-2" : ""} ${isCurrentPlan ? "ring-2 ring-primary/20" : ""}`}
                >
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
                    
                   {/* Admin Access Label */}
                   {isLoggedIn && isAdmin ? (
                     <div className="w-full py-3 px-4 bg-muted/50 border border-border rounded-md text-center">
                       <span className="text-sm font-medium text-muted-foreground">Admin Access Enabled</span>
                     </div>
                   ) : (
                     <Button 
                       className="w-full" 
                       size="lg"
                       variant={plan.featured ? "default" : "outline"}
                       onClick={() => handleChoosePlan(plan)}
                       disabled={isBuying || loadingPrices}
                     >
                       {isBuying ? (
                         <>
                           <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                           Loading...
                         </>
                       ) : (
                         plan.buttonLabel
                       )}
                     </Button>
                   )}
                  </CardContent>
                </Card>
              );
            })}
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
      <StoreIAPModal open={showIAPModal} onOpenChange={setShowIAPModal} />
    </div>
  );
};

export default Pricing;