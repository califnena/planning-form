import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FileText, Printer, CheckCircle2, ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PublicHeader } from "@/components/PublicHeader";
import { AppFooter } from "@/components/AppFooter";

// Direct Stripe Payment Link for EFABASIC (no account required)
const EFABASIC_PAYMENT_LINK = "https://buy.stripe.com/6oU28r2x75OrbLxg6q7bW00";

const PrintableFormPurchase = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handlePurchase = () => {
    setIsLoading(true);
    // Use Stripe Payment Link for guest checkout - no account required
    // After purchase, Stripe will redirect to the success URL configured in the Payment Link
    window.location.href = `${EFABASIC_PAYMENT_LINK}?success_url=${encodeURIComponent(window.location.origin + "/forms")}`;
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <PublicHeader />
      
      <main className="flex-1 max-w-3xl mx-auto px-4 py-8 md:py-12 w-full">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => navigate(-1)}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <FileText className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
            Printable End-of-Life Planning Form
          </h1>
          <p className="text-lg text-muted-foreground">
            A professionally formatted form you can print and fill out by hand.
          </p>
        </div>

        <Card className="mb-8">
          <CardContent className="p-6 md:p-8">
            <div className="space-y-6">
              {/* Key Benefits */}
              <ul className="space-y-3">
                <li className="flex items-center gap-3 text-foreground">
                  <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                  <span>Print at home</span>
                </li>
                <li className="flex items-center gap-3 text-foreground">
                  <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                  <span>Fill in by hand</span>
                </li>
                <li className="flex items-center gap-3 text-foreground">
                  <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                  <span>No account required</span>
                </li>
                <li className="flex items-center gap-3 text-foreground">
                  <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                  <span>Immediate download after payment</span>
                </li>
              </ul>

              {/* Divider */}
              <div className="border-t border-border" />

              {/* What's included */}
              <div>
                <h3 className="font-semibold text-foreground mb-3">What's Included:</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />
                    Personal information & contacts
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />
                    Funeral & memorial wishes
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />
                    Financial accounts & insurance
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />
                    Property & digital accounts
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />
                    Messages to loved ones
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Purchase Button */}
        <div className="text-center">
          <Button 
            onClick={handlePurchase}
            size="lg"
            className="w-full sm:w-auto min-w-[280px] min-h-[56px] text-lg"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Opening Secure Checkout...
              </>
            ) : (
              "Buy Printable Planning Form – $9.99"
            )}
          </Button>
          <p className="text-sm text-muted-foreground mt-3">
            Secure checkout powered by Stripe. No account required.
          </p>
          <p className="text-sm text-muted-foreground mt-4 italic">
            This is the same form many families use when planning with Everlasting Funeral Advisors.
          </p>
        </div>

        {/* Already purchased? */}
        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground">
            Already purchased?{" "}
            <Button 
              variant="link" 
              className="p-0 h-auto text-primary"
              onClick={() => navigate("/forms")}
            >
              Go to Downloads
            </Button>
          </p>
        </div>
      </main>

      <AppFooter />
    </div>
  );
};

export default PrintableFormPurchase;
