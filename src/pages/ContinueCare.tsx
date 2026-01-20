import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { STRIPE_LOOKUP_KEYS } from "@/lib/stripeLookupKeys";
import { Check } from "lucide-react";

interface StripePriceInfo {
  lookupKey: string;
  priceId: string;
  unitAmount: number;
  currency: string;
  interval: string | null;
  productName: string | null;
}

type StripePricesMap = Record<string, StripePriceInfo>;

const formatPrice = (cents: number, currency: string): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(cents / 100);
};

export default function ContinueCare() {
  const navigate = useNavigate();
  const [prices, setPrices] = useState<StripePricesMap>({});
  const [loadingPrices, setLoadingPrices] = useState(true);

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const lookupKeys = [
          STRIPE_LOOKUP_KEYS.BASIC,
          STRIPE_LOOKUP_KEYS.VIP_MONTHLY,
        ];

        const { data, error } = await supabase.functions.invoke("stripe-list-prices", {
          body: { lookupKeys },
        });

        if (error) throw error;
        setPrices((data?.prices || {}) as StripePricesMap);
      } catch (err) {
        console.error("Failed to load prices:", err);
      } finally {
        setLoadingPrices(false);
      }
    };

    fetchPrices();
  }, []);

  const handleSelectPlan = (lookupKey: string) => {
    // Navigate to checkout with the selected plan
    navigate(`/pricing?plan=${lookupKey}`);
  };

  const basicPrice = prices[STRIPE_LOOKUP_KEYS.BASIC];
  const monthlyPrice = prices[STRIPE_LOOKUP_KEYS.VIP_MONTHLY];

  const benefits = [
    "Save and update your plan",
    "Keep everything organized in one place",
    "Share with family when you're ready",
  ];

  return (
    <div className="min-h-screen bg-background px-4 py-12">
      <div className="max-w-xl mx-auto space-y-8">
        <h1 className="text-2xl md:text-3xl font-semibold text-foreground text-center leading-tight">
          Would you like to keep everything together?
        </h1>

        <p className="text-lg text-muted-foreground text-center">
          You've started something meaningful. This helps you keep it organized and return to it over time.
        </p>

        <ul className="space-y-3">
          {benefits.map((benefit, index) => (
            <li key={index} className="flex items-center gap-3 text-lg text-muted-foreground">
              <Check className="h-5 w-5 text-primary flex-shrink-0" />
              {benefit}
            </li>
          ))}
        </ul>

        <div className="space-y-4 pt-4">
          {loadingPrices ? (
            <div className="space-y-4">
              <div className="h-14 bg-muted animate-pulse rounded-lg" />
              <div className="h-14 bg-muted animate-pulse rounded-lg" />
            </div>
          ) : (
            <>
              <Button
                size="lg"
                className="min-h-[52px] text-lg w-full"
                onClick={() => handleSelectPlan(STRIPE_LOOKUP_KEYS.BASIC)}
              >
                One-time plan access
                {basicPrice && (
                  <span className="ml-2 opacity-90">
                    ({formatPrice(basicPrice.unitAmount, basicPrice.currency)})
                  </span>
                )}
              </Button>

              <Button
                size="lg"
                variant="outline"
                className="min-h-[52px] text-lg w-full"
                onClick={() => handleSelectPlan(STRIPE_LOOKUP_KEYS.VIP_MONTHLY)}
              >
                Monthly care support
                {monthlyPrice && (
                  <span className="ml-2 opacity-90">
                    ({formatPrice(monthlyPrice.unitAmount, monthlyPrice.currency)}/month)
                  </span>
                )}
              </Button>
            </>
          )}
        </div>

        <div className="pt-4 text-center">
          <button
            type="button"
            onClick={() => navigate("/guided-action")}
            className="text-muted-foreground hover:text-foreground underline transition-colors text-base"
          >
            Not right now
          </button>
        </div>
      </div>
    </div>
  );
}
