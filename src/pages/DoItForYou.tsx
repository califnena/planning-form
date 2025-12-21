import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { GlobalHeader } from "@/components/GlobalHeader";
import { AppFooter } from "@/components/AppFooter";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useState } from "react";
import { setPendingCheckout } from "@/lib/pendingCheckout";
import { 
  ClipboardList, 
  MessageSquare, 
  FileCheck, 
  CheckCircle2,
  Users,
  Clock,
  Heart,
  ShieldCheck
} from "lucide-react";

export default function DoItForYou() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handlePurchase = async () => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setPendingCheckout({
          lookupKey: 'EFADOFORU',
          successUrl: `${window.location.origin}/do-it-for-you/confirmation`,
          cancelUrl: window.location.href
        });
        navigate('/login');
        return;
      }

      const { data, error } = await supabase.functions.invoke('stripe-create-checkout', {
        body: {
          lookupKey: 'EFADOFORU',
          successUrl: `${window.location.origin}/do-it-for-you/confirmation`,
          cancelUrl: window.location.href
        }
      });

      if (error) throw error;
      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (error: any) {
      console.error('Checkout error:', error);
      toast.error("Unable to start checkout. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const steps = [
    {
      icon: ClipboardList,
      title: "Purchase the Service",
      description: "Once purchased, you will receive instructions for the next step and how to schedule."
    },
    {
      icon: MessageSquare,
      title: "We Gather Your Information",
      description: "You provide details through a simple intake form and/or guided conversation."
    },
    {
      icon: FileCheck,
      title: "We Help Complete Your Plan",
      description: "We help you fill out the planning steps so your wishes are clearly documented."
    },
    {
      icon: CheckCircle2,
      title: "Review and Save",
      description: "You review everything and confirm it matches what you want."
    }
  ];

  const whoIsThisFor = [
    { icon: Users, text: "People who feel stuck and do not know where to begin" },
    { icon: Clock, text: "Busy families who want the planning completed correctly" },
    { icon: Heart, text: "Adult children helping a parent plan ahead" },
    { icon: ShieldCheck, text: "Anyone who wants support without pressure" }
  ];

  const whatThisIsNot = [
    "This is not legal advice",
    "This is not estate planning or a will",
    "This does not replace a funeral home or cemetery arrangement",
    "We do not make decisions for you"
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <GlobalHeader />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-primary/5 to-background py-16 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Do-It-For-You Planning
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-4 max-w-3xl mx-auto">
              Planning can feel heavy. If you do not want to fill everything out alone, we can help you organize your wishes and complete the planning steps with you.
            </p>
            <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
              This service is designed to reduce overwhelm and help you leave a clear plan your family can actually use.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                onClick={handlePurchase}
                disabled={isLoading}
                className="text-lg px-8"
              >
                {isLoading ? "Loading..." : "Purchase Do-It-For-You Planning"}
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                onClick={() => navigate('/contact')}
                className="text-lg px-8"
              >
                Contact Us
              </Button>
            </div>
          </div>
        </section>

        {/* What This Is Section */}
        <section className="py-16 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12">
              <div>
                <h2 className="text-3xl font-bold text-foreground mb-6">What This Is</h2>
                <p className="text-muted-foreground mb-4">
                  Do-It-For-You Planning is a guided support service where we help you:
                </p>
                <ul className="space-y-3 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span>Organize your wishes and key information</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span>Walk through the planning sections step by step</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span>Fill out the planning details based on what you tell us</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span>Make sure your plan is clear, complete, and easy to share</span>
                  </li>
                </ul>
                <p className="text-foreground font-medium mt-6">
                  You stay in control. We help you move forward.
                </p>
              </div>
              
              <div>
                <h2 className="text-3xl font-bold text-foreground mb-6">What You Get</h2>
                <ul className="space-y-4 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span>A structured planning session (or sessions) to gather your details</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span>Help completing the planning sections inside the app</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span>A clear next-steps checklist if anything is missing</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span>A final review so you feel confident your plan is understandable</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-16 px-4 bg-muted/30">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-foreground text-center mb-12">How It Works</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {steps.map((step, index) => (
                <Card key={index} className="text-center">
                  <CardContent className="pt-6">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <step.icon className="h-6 w-6 text-primary" />
                    </div>
                    <div className="text-sm font-medium text-primary mb-2">Step {index + 1}</div>
                    <h3 className="font-semibold text-foreground mb-2">{step.title}</h3>
                    <p className="text-sm text-muted-foreground">{step.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Who Is This For Section */}
        <section className="py-16 px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-foreground text-center mb-12">Who This Is For</h2>
            <div className="grid sm:grid-cols-2 gap-6">
              {whoIsThisFor.map((item, index) => (
                <div key={index} className="flex items-start gap-4 p-4 rounded-lg bg-muted/30">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <item.icon className="h-5 w-5 text-primary" />
                  </div>
                  <span className="text-muted-foreground">{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* What This Is Not Section */}
        <section className="py-16 px-4 bg-muted/30">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-foreground text-center mb-8">What This Is Not</h2>
            <div className="grid sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
              {whatThisIsNot.map((item, index) => (
                <div key={index} className="flex items-center gap-3 text-muted-foreground">
                  <span className="text-muted-foreground/50">•</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
            <p className="text-center text-foreground font-medium mt-8">
              We help you document your choices clearly.
            </p>
          </div>
        </section>

        {/* Bottom CTA Section */}
        <section className="py-16 px-4 bg-primary/5">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-foreground mb-6">Ready to Start?</h2>
            <p className="text-muted-foreground mb-8">
              If you have questions, reach out first. If you're ready, purchase now and begin the intake process.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                onClick={handlePurchase}
                disabled={isLoading}
                className="text-lg px-8"
              >
                {isLoading ? "Loading..." : "Purchase Do-It-For-You Planning"}
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                onClick={() => navigate('/contact')}
                className="text-lg px-8"
              >
                Contact Us
              </Button>
            </div>
          </div>
        </section>

        {/* Privacy Note */}
        <section className="py-8 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <p className="text-sm text-muted-foreground">
              <strong>Privacy Note:</strong> Your information is handled privately and used only to support your planning request.
            </p>
          </div>
        </section>
      </main>

      <AppFooter />
    </div>
  );
}