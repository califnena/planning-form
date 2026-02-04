import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle2, Loader2, Download } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PublicHeader } from "@/components/PublicHeader";
import { AppFooter } from "@/components/AppFooter";
import { supabase } from "@/integrations/supabase/client";
import { useAdminStatus } from "@/hooks/useAdminStatus";

type VerifiedItem = {
  lookupKey: string;
  name: string;
  type: "one_time" | "recurring";
  interval?: "month" | "year" | null;
};

// Map lookupKeys to next destination routes with highlights
const ROUTE_BY_LOOKUP: Record<string, string> = {
  EFABASIC: "/forms", // Printable-only users go directly to download page
  EFAPREMIUM: "/preplansteps?highlight=guided",
  EFAVIPMONTHLY: "/care-support?highlight=vip",
  EFAVIPYEAR: "/care-support?highlight=vip",
  EFABINDER: "/dashboard?highlight=binder",
  EFADOFORU: "/do-it-for-you/confirmation",
  STANDARDSONG: "/custom-song?highlight=song",
};

// Fallback names for type param (backwards compatibility)
const TYPE_NAMES: Record<string, string> = {
  printable: "Printable Planning Form",
  binder: "Physical Planning Binder",
  premium: "Step-by-Step Guided Planner",
  vip: "CARE Support",
  "vip-monthly": "CARE Support (Monthly)",
  "vip-yearly": "CARE Support (Yearly)",
  done_for_you: "Do-It-For-You Planning",
  dfy: "Do-It-For-You Planning",
  song: "Custom Memorial Song",
};

const TYPE_ROUTES: Record<string, string> = {
  printable: "/dashboard?highlight=printable",
  binder: "/dashboard?highlight=binder",
  premium: "/preplansteps?highlight=guided",
  vip: "/care-support?highlight=vip",
  "vip-monthly": "/care-support?highlight=vip",
  "vip-yearly": "/care-support?highlight=vip",
  done_for_you: "/do-it-for-you/confirmation",
  dfy: "/do-it-for-you/confirmation",
  song: "/custom-song?highlight=song",
};

export default function PurchaseSuccess() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isAdmin } = useAdminStatus();
  
  const sessionId = searchParams.get("session_id");
  const typeParam = searchParams.get("type");

  const [loading, setLoading] = useState(true);
  const [paid, setPaid] = useState<boolean | null>(null);
  const [items, setItems] = useState<VerifiedItem[]>([]);

  const planningMenuRoute = "/dashboard";

  // Check if this is an EFABASIC/printable purchase OR admin has view/download access
  const isPrintablePurchase = useMemo(() => {
    // Check verified items for EFABASIC
    const hasEFABASIC = items.some((it) => it.lookupKey === "EFABASIC");
    if (hasEFABASIC) return true;
    // Fallback to type param
    return typeParam === "printable";
  }, [items, typeParam]);

  // Admin override: show download button without being marked as purchaser
  const showPrintableDownload = isPrintablePurchase || isAdmin;

  // Handle download of printable planner PDF
  const handleDownloadPrintablePlanner = () => {
    try {
      const link = document.createElement('a');
      link.href = '/templates/My-Final-Wishes-Blank-Form-2025-11-17.pdf';
      link.download = 'My-Final-Wishes-Blank-Form-2025-11-17.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('Printable Planner downloaded successfully');
    } catch (error) {
      console.error('Error downloading printable planner:', error);
      toast.error('Failed to download. Please try again.');
    }
  };

  // Compute best route based on verified items or fallback to type param
  const bestNextRoute = useMemo(() => {
    // First try verified items
    for (const it of items) {
      const route = ROUTE_BY_LOOKUP[it.lookupKey];
      if (route) return route;
    }
    // Fallback to type param
    if (typeParam && TYPE_ROUTES[typeParam]) {
      return TYPE_ROUTES[typeParam];
    }
    return planningMenuRoute;
  }, [items, typeParam]);

  const lastVisitedRoute = useMemo(() => {
    return localStorage.getItem("efa_last_visited_route") || "";
  }, []);

  useEffect(() => {
    let mounted = true;

    (async () => {
      setLoading(true);

      // If no session_id, try to use type param for display
      if (!sessionId) {
        if (!mounted) return;
        setPaid(typeParam ? true : null); // Assume paid if type param exists
        setItems([]);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase.functions.invoke("stripe-verify-checkout", {
          body: { sessionId },
        });

        if (error) throw error;

        if (!mounted) return;
        setPaid(!!data?.paid);
        setItems((data?.items || []) as VerifiedItem[]);
      } catch (err) {
        console.error("Error verifying checkout:", err);
        if (!mounted) return;
        // Fall back to type param if verification fails
        setPaid(typeParam ? true : null);
        setItems([]);
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [sessionId, typeParam]);

  // Build purchased lines for display
  const purchasedLines = useMemo(() => {
    if (items.length > 0) {
      return items.map((i) => i.name);
    }
    // Fallback to type param
    if (typeParam && TYPE_NAMES[typeParam]) {
      return [TYPE_NAMES[typeParam]];
    }
    return ["Your purchase was recorded"];
  }, [items, typeParam]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <PublicHeader />

      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-xl mx-auto">
          <Card className="border-2">
            <CardContent className="pt-8 pb-8 space-y-8">
              {/* Success Icon */}
              <div className="flex justify-center">
                <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle2 className="h-12 w-12 text-green-600" />
                </div>
              </div>

              {/* Title */}
              <h1 className="text-3xl font-bold text-center">Payment Complete</h1>

              {/* Status Message */}
              {loading ? (
                <div className="flex items-center justify-center gap-3 text-muted-foreground">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Confirming your payment…</span>
                </div>
              ) : paid === false ? (
                <p className="text-center text-muted-foreground">
                  We could not confirm payment yet. If you completed payment, sign in and check your Planning Menu.
                </p>
              ) : paid === null && !typeParam ? (
                <p className="text-center text-muted-foreground">
                  We could not confirm the payment details on this page. If you completed payment, your access should still be available in your Planning Menu.
                </p>
              ) : (
                <p className="text-center text-muted-foreground text-lg">
                  Thank you. Your payment was successful.<br />
                  Your access is now available in your Planning Menu.
                </p>
              )}

              {/* What You Purchased Box */}
              <div className="border-2 rounded-xl p-6 bg-muted/30">
                <h2 className="font-semibold text-lg mb-4 text-center">You purchased</h2>
                <ul className="space-y-2">
                  {purchasedLines.map((line, idx) => (
                    <li key={idx} className="flex items-center gap-3 text-lg">
                      <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                      <span>{line}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                {/* Download Printable Planner - for EFABASIC/printable purchases OR admin view access */}
                {showPrintableDownload && (
                  <Button 
                    onClick={handleDownloadPrintablePlanner}
                    size="lg"
                    className="w-full min-h-[56px] text-lg"
                  >
                    <Download className="mr-2 h-5 w-5" />
                    Download Printable Planner
                  </Button>
                )}

                {/* Primary CTA - show appropriate destination based on purchase type */}
                {isPrintablePurchase ? (
                  <Button 
                    onClick={() => navigate('/forms')} 
                    size="lg"
                    variant="outline"
                    className="w-full min-h-[56px] text-lg"
                  >
                    Go to Download Page
                  </Button>
                ) : (
                  <Button 
                    onClick={() => navigate(planningMenuRoute)} 
                    size="lg"
                    className="w-full min-h-[56px] text-lg"
                  >
                    Go to My Planning Menu
                  </Button>
                )}

                {/* Secondary buttons - hide for printable-only purchases */}
                {!isPrintablePurchase && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Button 
                      variant="outline" 
                      onClick={() => navigate(bestNextRoute)}
                      className="min-h-[48px]"
                    >
                      Continue
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => navigate(lastVisitedRoute || planningMenuRoute)}
                      className="min-h-[48px]"
                    >
                      Continue where I left off
                    </Button>
                  </div>
                )}

                <Button 
                  variant="ghost" 
                  onClick={() => navigate("/contact")}
                  className="w-full"
                >
                  Need help? Contact us
                </Button>
              </div>

              {/* Help Note */}
              <p className="text-sm text-muted-foreground text-center">
                If you do not see access right away, refresh the page or sign out and sign back in.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>

      <AppFooter />
    </div>
  );
}
