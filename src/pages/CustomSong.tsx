import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Music, Clock, Sparkles, Heart } from "lucide-react";
import { AuthenticatedLayout } from "@/components/AuthenticatedLayout";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

export default function CustomSong() {
  const { toast } = useToast();
  const [loading, setLoading] = useState<string | null>(null);

  const handlePurchase = async (packageType: 'standard' | 'premium') => {
    setLoading(packageType);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setLoading(null);
        toast({
          title: "Authentication required",
          description: "Please sign in to continue",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Processing...",
        description: "Redirecting to secure checkout",
      });

      const { data, error } = await supabase.functions.invoke('stripe-song-checkout', {
        body: { packageType, userId: user.id },
      });

      if (error) {
        console.error('Stripe function error:', error);
        throw error;
      }
      
      if (data?.url) {
        console.log('Redirecting to Stripe:', data.url);
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (error: any) {
      console.error('Checkout error:', error);
      setLoading(null);
      toast({
        title: "Checkout failed",
        description: error.message || "Unable to start checkout. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <AuthenticatedLayout>
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="space-y-8">
          {/* Header */}
          <div className="text-center">
            <Music className="h-16 w-16 mx-auto text-primary mb-4" />
            <h1 className="text-4xl font-bold mb-2">Custom Tribute Song</h1>
            <p className="text-xl text-muted-foreground">
              A personalized musical tribute to honor and remember your loved one
            </p>
          </div>

          {/* How It Works */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                How It Works
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-xl font-bold text-primary">1</span>
                  </div>
                  <h3 className="font-semibold mb-2">Choose Your Package</h3>
                  <p className="text-sm text-muted-foreground">
                    Select Standard or Premium based on your needs
                  </p>
                </div>
                <div className="text-center">
                  <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-xl font-bold text-primary">2</span>
                  </div>
                  <h3 className="font-semibold mb-2">Share Your Story</h3>
                  <p className="text-sm text-muted-foreground">
                    Tell us about your loved one's life and memories
                  </p>
                </div>
                <div className="text-center">
                  <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-xl font-bold text-primary">3</span>
                  </div>
                  <h3 className="font-semibold mb-2">Receive Your Song</h3>
                  <p className="text-sm text-muted-foreground">
                    Get a professionally produced tribute song in 1-2 days
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Packages */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Standard Package */}
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Standard Package</span>
                  <Heart className="h-5 w-5 text-primary" />
                </CardTitle>
                <CardDescription>Perfect for a heartfelt tribute</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-3xl font-bold">$49</div>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">✓</span>
                    <span>Custom lyrics based on life story</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">✓</span>
                    <span>Professional AI-generated vocals</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">✓</span>
                    <span>Choice of genre and mood</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">✓</span>
                    <span>2-3 minute song length</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">✓</span>
                    <span>MP3 delivery via email</span>
                  </li>
                </ul>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>Delivered in 1-2 days</span>
                </div>
                <Button 
                  className="w-full" 
                  size="lg"
                  onClick={() => handlePurchase('standard')}
                  disabled={loading !== null}
                >
                  {loading === 'standard' ? 'Processing...' : 'Order Standard – $49'}
                </Button>
              </CardContent>
            </Card>

            {/* Premium Package */}
            <Card className="border-2 border-primary">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Premium Package</span>
                  <Sparkles className="h-5 w-5 text-primary" />
                </CardTitle>
                <CardDescription>Enhanced tribute with extra features</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-3xl font-bold">$99</div>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">✓</span>
                    <span>Everything in Standard, plus:</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">✓</span>
                    <span>Extended 3-5 minute song</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">✓</span>
                    <span>Enhanced vocal quality</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">✓</span>
                    <span>Full instrumental arrangement</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">✓</span>
                    <span>1 revision included</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">✓</span>
                    <span>High-quality WAV + MP3</span>
                  </li>
                </ul>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>Delivered in 1-2 days</span>
                </div>
                <Button 
                  className="w-full" 
                  size="lg" 
                  variant="default"
                  onClick={() => handlePurchase('premium')}
                  disabled={loading !== null}
                >
                  {loading === 'premium' ? 'Processing...' : 'Order Premium – $99'}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Info Box */}
          <Card className="bg-muted/50">
            <CardContent className="pt-6">
              <p className="text-sm text-center text-muted-foreground">
                After completing your purchase, you'll be directed to provide details about your loved one 
                to help us create a meaningful and personalized tribute song.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
