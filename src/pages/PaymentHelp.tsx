import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink, Shield, Wifi, Monitor, RefreshCw, Mail, Copy, Check, Apple, Smartphone, Globe, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { PublicHeader } from "@/components/PublicHeader";
import { AppFooter } from "@/components/AppFooter";
import { isStoreIAP } from "@/lib/billingMode";

export default function PaymentHelp() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Check URL param first, then localStorage
    const urlParam = searchParams.get("checkout_url");
    if (urlParam) {
      setCheckoutUrl(urlParam);
    } else {
      const stored = localStorage.getItem("efa_last_checkout_url");
      if (stored) {
        setCheckoutUrl(stored);
      }
    }
  }, [searchParams]);

  const handleOpenInNewTab = () => {
    if (checkoutUrl) {
      window.open(checkoutUrl, "_blank", "noopener,noreferrer");
    }
  };

  const handleCopyLink = async () => {
    if (checkoutUrl) {
      try {
        await navigator.clipboard.writeText(checkoutUrl);
        setCopied(true);
        toast({ title: "Link copied", description: "Paste it in a new browser tab." });
        setTimeout(() => setCopied(false), 2000);
      } catch {
        toast({ title: "Could not copy", description: "Please try again.", variant: "destructive" });
      }
    }
  };

  const handleTryAgain = () => {
    const lastRoute = localStorage.getItem("efa_checkout_return_url");
    navigate(lastRoute || "/pricing");
  };

  // Show subscription management content for Store IAP mode
  if (isStoreIAP) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <PublicHeader />
        
        <main className="flex-1 container max-w-2xl mx-auto px-4 py-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate(-1)} 
            className="mb-6"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>

          <h1 className="text-3xl font-semibold text-foreground mb-2">
            Manage Your Subscription
          </h1>
          <p className="text-muted-foreground mb-8">
            Here's how to view or update your subscription, depending on where you signed up.
          </p>

          {/* iPhone/iPad Section */}
          <Card className="mb-4">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Apple className="h-5 w-5" />
                iPhone or iPad
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-muted-foreground">
              <ol className="list-decimal list-inside space-y-2">
                <li>Open the <strong>Settings</strong> app on your device.</li>
                <li>Tap your name at the top.</li>
                <li>Tap <strong>Subscriptions</strong>.</li>
                <li>Find and tap your subscription to manage it.</li>
              </ol>
            </CardContent>
          </Card>

          {/* Android Section */}
          <Card className="mb-4">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Smartphone className="h-5 w-5" />
                Android
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-muted-foreground">
              <ol className="list-decimal list-inside space-y-2">
                <li>Open the <strong>Google Play Store</strong> app.</li>
                <li>Tap your profile icon in the top right.</li>
                <li>Tap <strong>Payments & subscriptions</strong>.</li>
                <li>Tap <strong>Subscriptions</strong> and find your subscription.</li>
              </ol>
            </CardContent>
          </Card>

          {/* Web Section */}
          <Card className="mb-4">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Globe className="h-5 w-5" />
                Web
              </CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground">
              <p>
                If you purchased on the web, you can manage your billing from the{" "}
                <Button 
                  variant="link" 
                  className="p-0 h-auto text-primary"
                  onClick={() => navigate("/billing")}
                >
                  Billing page
                </Button>.
              </p>
            </CardContent>
          </Card>

          <p className="text-sm text-muted-foreground mt-6">
            Questions? Feel free to reach out through our{" "}
            <Button 
              variant="link" 
              className="p-0 h-auto text-sm text-primary"
              onClick={() => navigate("/contact")}
            >
              Contact page
            </Button>.
          </p>
        </main>

        <AppFooter />
      </div>
    );
  }

  // Original payment troubleshooting content for web Stripe mode
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <PublicHeader />
      
      <main className="flex-1 container max-w-3xl py-12 space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold">Payment Help</h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            If the payment page looks blank or never finishes loading, it is usually caused by an ad blocker, a privacy extension, or a restricted network. The steps below fix most cases.
          </p>
        </div>

        {/* Quick Fixes */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Fixes</CardTitle>
            <CardDescription>Do these first</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Fix 1: New Tab */}
            <div className="space-y-2">
              <div className="flex items-start gap-3">
                <div className="bg-primary/10 p-2 rounded-full">
                  <ExternalLink className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">1. Open the payment page in a new tab</h3>
                  <p className="text-sm text-muted-foreground">
                    Some browsers block payment pages inside preview windows or restricted environments.
                  </p>
                  {checkoutUrl && (
                    <div className="flex gap-2 mt-3">
                      <Button onClick={handleOpenInNewTab}>
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Open Payment in New Tab
                      </Button>
                      <Button variant="outline" onClick={handleCopyLink}>
                        {copied ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
                        {copied ? "Copied" : "Copy Link"}
                      </Button>
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground mt-2">
                    If nothing opens, your browser may be blocking popups.
                  </p>
                </div>
              </div>
            </div>

            {/* Fix 2: Ad Blockers */}
            <div className="space-y-2">
              <div className="flex items-start gap-3">
                <div className="bg-primary/10 p-2 rounded-full">
                  <Shield className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">2. Disable ad blockers or privacy extensions</h3>
                  <p className="text-sm text-muted-foreground">
                    Extensions like ad blockers and privacy tools can block Stripe from loading.
                  </p>
                  <ul className="text-sm text-muted-foreground mt-2 space-y-1 list-disc list-inside">
                    <li>Turn off your ad blocker for this site</li>
                    <li>Temporarily pause privacy extensions</li>
                    <li>Then try the purchase again</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Fix 3: Different Browser */}
            <div className="space-y-2">
              <div className="flex items-start gap-3">
                <div className="bg-primary/10 p-2 rounded-full">
                  <Monitor className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">3. Try a different browser</h3>
                  <p className="text-sm text-muted-foreground">
                    Chrome and Safari work best for payment pages.
                  </p>
                </div>
              </div>
            </div>

            {/* Fix 4: Network */}
            <div className="space-y-2">
              <div className="flex items-start gap-3">
                <div className="bg-primary/10 p-2 rounded-full">
                  <Wifi className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">4. Switch networks if you are on work Wi-Fi</h3>
                  <p className="text-sm text-muted-foreground">
                    Some workplaces block payment providers. Try using your phone hotspot or home Wi-Fi.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Common Problems */}
        <Card>
          <CardHeader>
            <CardTitle>Common Problems</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium">"The page is blank" or "I only see grey boxes"</h4>
              <p className="text-sm text-muted-foreground">
                Stripe did not load. This is almost always an extension or network block.
              </p>
            </div>
            <div>
              <h4 className="font-medium">"Nothing happens when I click purchase"</h4>
              <p className="text-sm text-muted-foreground">
                Your browser likely blocked a popup tab. Allow popups and try again.
              </p>
            </div>
            <div>
              <h4 className="font-medium">"It works on my phone but not my computer"</h4>
              <p className="text-sm text-muted-foreground">
                Your computer browser has an extension or security setting blocking checkout.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Try Again */}
        <Card>
          <CardHeader>
            <CardTitle>Try Again</CardTitle>
            <CardDescription>
              When you are ready, try starting checkout again. If it still fails, contact us and we will help you quickly.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col sm:flex-row gap-3">
            <Button onClick={handleTryAgain}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Checkout Again
            </Button>
            <Button variant="outline" onClick={() => navigate("/contact")}>
              <Mail className="mr-2 h-4 w-4" />
              Contact Support
            </Button>
          </CardContent>
        </Card>

        {/* Footer Note */}
        <p className="text-xs text-center text-muted-foreground">
          Payments are processed securely by Stripe. Everlasting Funeral Advisors does not store your full card number.
        </p>
      </main>

      <AppFooter />
    </div>
  );
}
