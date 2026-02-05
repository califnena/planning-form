import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, ShoppingCart, Loader2, ArrowLeft } from "lucide-react";
import { launchCheckout } from "@/lib/checkoutLauncher";
import { TextSizeToggle } from "@/components/TextSizeToggle";
import binderImage from "@/assets/fireproof-binder.png";

export default function ProductBinder() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handlePurchaseBinder = async () => {
    await launchCheckout({
      lookupKey: 'EFABINDER',
      successUrl: `${window.location.origin}/purchase-success?product=binder`,
      cancelUrl: window.location.href,
      navigate,
      onLoadingChange: setIsLoading,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Navigation */}
        <div className="flex justify-between items-start mb-8">
          <Link to="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          </Link>
          <TextSizeToggle />
        </div>

        <div className="space-y-8">
          {/* Header */}
          <div className="text-center">
            <BookOpen className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h1 className="text-3xl font-bold text-foreground">Fireproof Document Binder</h1>
            <p className="text-muted-foreground mt-2">A secure, organized way to keep your important documents in one place</p>
          </div>

          {/* Product Card */}
          <Card className="border-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                Fireproof Planning Binder
              </CardTitle>
              <CardDescription>
                Keep your planner, documents, and important papers safe and organized
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-8 items-center">
                <div className="w-full md:w-1/2">
                  <img 
                    src={binderImage} 
                    alt="Fireproof Planning Binder" 
                    className="w-full rounded-lg shadow-md"
                  />
                </div>
                <div className="w-full md:w-1/2 space-y-4">
                  <ul className="space-y-2 text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <span className="text-primary">✓</span>
                      Fireproof and waterproof protection
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary">✓</span>
                      Organized sections for all your documents
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary">✓</span>
                      Includes printed planner worksheets
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary">✓</span>
                      Secure locking mechanism
                    </li>
                  </ul>
                  <Button 
                    onClick={handlePurchaseBinder} 
                    disabled={isLoading}
                    size="lg"
                    className="w-full gap-2"
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <ShoppingCart className="h-4 w-4" />
                    )}
                    {isLoading ? "Loading..." : "Purchase Binder"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}