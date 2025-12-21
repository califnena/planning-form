import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, BookOpen, ShoppingBag, Heart, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import fireproofBinder from "@/assets/fireproof-binder.png";
import preplanningChecklist from "@/assets/after-death-checklist.png";

interface SectionOverviewProps {
  onNavigateToChecklist?: () => void;
}

export const SectionOverview = ({ onNavigateToChecklist }: SectionOverviewProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loadingBinder, setLoadingBinder] = useState(false);
  const [loadingGuidance, setLoadingGuidance] = useState(false);

  const handleDownloadChecklist = () => {
    window.open("/guides/EFA-Pre-Planning-Checklist.pdf", "_blank");
  };

  const handlePurchaseBinder = async () => {
    setLoadingBinder(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Please log in",
          description: "You need to be logged in to make a purchase.",
          variant: "destructive",
        });
        navigate("/login");
        return;
      }

      const successUrl = `${window.location.origin}/purchase-success?product=binder`;
      const { data, error } = await supabase.functions.invoke('stripe-create-checkout', {
        body: {
          lookupKey: 'EFABINDER',
          mode: 'payment',
          successUrl,
          cancelUrl: window.location.href,
        },
      });

      if (error) throw error;
      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error("Error purchasing binder:", error);
      toast({
        title: "Error",
        description: "Failed to start checkout. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoadingBinder(false);
    }
  };

  const handlePurchaseGuidance = async () => {
    setLoadingGuidance(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Please log in",
          description: "You need to be logged in to make a purchase.",
          variant: "destructive",
        });
        navigate("/login");
        return;
      }

      const successUrl = `${window.location.origin}/purchase-success?product=guidance`;
      const { data, error } = await supabase.functions.invoke('stripe-create-checkout', {
        body: {
          lookupKey: 'EFADOFORU',
          mode: 'payment',
          successUrl,
          cancelUrl: window.location.href,
        },
      });

      if (error) throw error;
      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error("Error purchasing guidance:", error);
      toast({
        title: "Error",
        description: "Failed to start checkout. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoadingGuidance(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold mb-2">📖 Pre-Planning Overview</h2>
        <p className="text-muted-foreground">
          Welcome to your pre-planning journey. Use this guide to understand the process and get started with your personalized plan.
        </p>
      </div>

      {/* Embedded Pre-Planning Guide */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Pre-Planning Guide
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="aspect-video w-full rounded-lg overflow-hidden border">
            <iframe 
              src="https://gamma.app/embed/om4wcs6irh1s18e" 
              style={{ width: '100%', height: '100%' }}
              allow="fullscreen" 
              title="Pre-Planning Guide"
            />
          </div>
          <p className="text-sm text-muted-foreground mt-3">
            This interactive guide walks you through the key decisions and information you'll want to document in your pre-plan.
          </p>
        </CardContent>
      </Card>

      {/* Pre-Planning Checklist Download */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Pre-Planning Checklist
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-6 items-start">
            <img 
              src={preplanningChecklist} 
              alt="Pre-Planning Checklist Preview" 
              className="w-full md:w-48 h-auto rounded-lg border shadow-sm"
            />
            <div className="flex-1 space-y-4">
              <p className="text-muted-foreground">
                Download our comprehensive pre-planning checklist to help guide your decisions. Use it as a companion to your digital plan or to share with family members.
              </p>
              <Button onClick={handleDownloadChecklist} variant="outline" className="gap-2">
                <Download className="h-4 w-4" />
                Download Checklist PDF
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Purchase Options */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Fireproof Binder */}
        <Card className="border-2 hover:border-primary/50 transition-colors">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingBag className="h-5 w-5 text-primary" />
              Fireproof Binder
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <img 
              src={fireproofBinder} 
              alt="Fireproof Binder" 
              className="w-full h-40 object-contain rounded-lg"
            />
            <p className="text-sm text-muted-foreground">
              Keep your printed plan safe with our fireproof and waterproof binder. Includes tabbed sections for easy organization.
            </p>
            <div className="flex items-center justify-between">
              <span className="font-semibold text-lg">$69.99</span>
              <Button 
                onClick={handlePurchaseBinder} 
                disabled={loadingBinder}
                className="gap-2"
              >
                {loadingBinder ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <ShoppingBag className="h-4 w-4" />
                )}
                Purchase Binder
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Compassionate Guidance */}
        <Card className="border-2 border-primary/30 bg-primary/5 hover:border-primary/50 transition-colors">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-primary" />
              Compassionate Guidance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="w-full h-40 flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg">
              <Heart className="h-16 w-16 text-primary/50" />
            </div>
            <p className="text-sm text-muted-foreground">
              Let our compassionate advisors guide you through the entire planning process. We handle the details so you can focus on what matters.
            </p>
            <div className="flex items-center justify-between">
              <span className="font-semibold text-lg">$249</span>
              <Button 
                onClick={handlePurchaseGuidance} 
                disabled={loadingGuidance}
                variant="default"
                className="gap-2"
              >
                {loadingGuidance ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Heart className="h-4 w-4" />
                )}
                Get Guidance
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Navigate to Checklist */}
      {onNavigateToChecklist && (
        <div className="text-center pt-4">
          <Button onClick={onNavigateToChecklist} size="lg" className="gap-2">
            Continue to Checklist
          </Button>
        </div>
      )}
    </div>
  );
};
