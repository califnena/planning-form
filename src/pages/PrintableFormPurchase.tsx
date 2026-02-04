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
            Printable Planning Form
          </h1>
          <p className="text-lg text-muted-foreground">
            A professionally formatted form you can print and fill out by hand.
          </p>
        </div>

        <Card className="mb-8">
          <CardContent className="p-6 md:p-8">
            <div className="space-y-6">
              {/* Benefits */}
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Blank Printable Form</h3>
                    <p className="text-muted-foreground">
                      A comprehensive form with clear sections for all your important information.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Printer className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Print Unlimited Times</h3>
                    <p className="text-muted-foreground">
                      Download once and print as many copies as you need. Make copies for your family or keep a backup.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">No App Required</h3>
                    <p className="text-muted-foreground">
                      Fill it out by hand at your own pace. No computer skills needed—just pen and paper.
                    </p>
                  </div>
                </div>
              </div>

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
              "Purchase Printable Form"
            )}
          </Button>
          <p className="text-sm text-muted-foreground mt-3">
            Secure checkout powered by Stripe. No account required.
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
