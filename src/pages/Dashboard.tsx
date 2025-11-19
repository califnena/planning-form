import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import { 
  FileText, 
  Star,
  BookOpen, 
  Scale,
  Phone,
  Music,
  Printer,
  Users,
  ListChecks,
  ShoppingBag,
  Lightbulb
} from "lucide-react";
import { AuthenticatedLayout } from "@/components/AuthenticatedLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { PIICollectionDialog } from "@/components/planner/PIICollectionDialog";
import { generatePlanPDF } from "@/lib/pdfGenerator";
import { generateManuallyFillablePDF } from "@/lib/manuallyFillablePdfGenerator";
import { generateBlankAfterLifePlanPDF } from "@/lib/blankAfterLifePlanPdfGenerator";

export default function Dashboard() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [firstName, setFirstName] = useState<string>("");
  const [progress, setProgress] = useState(0);
  const [showPIIDialog, setShowPIIDialog] = useState(false);
  const [pendingPIIData, setPendingPIIData] = useState<any>(null);
  const [isFreePlan, setIsFreePlan] = useState(true);

  useEffect(() => {
    const loadUserData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Check if user is on free plan
      const freePlan = await checkIsFreePlan();
      setIsFreePlan(freePlan);

      // Load user name
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .single();
      
      if (profile?.full_name) {
        const name = profile.full_name.split(" ")[0];
        setFirstName(name);
      }

      // Load progress and calculate dynamically
      const { data: orgMember } = await supabase
        .from("org_members")
        .select("org_id")
        .eq("user_id", user.id)
        .eq("role", "owner")
        .maybeSingle();

      if (orgMember) {
        // Get user's selected sections from preferences
        const { data: settings } = await supabase
          .from("user_settings")
          .select("selected_sections")
          .eq("user_id", user.id)
          .maybeSingle();

        const selectedSections = settings?.selected_sections || [];

        if (selectedSections.length > 0) {
          // Get plan data to check which sections have content
          const { data: plan } = await supabase
            .from("plans")
            .select("*")
            .eq("org_id", orgMember.org_id)
            .eq("owner_user_id", user.id)
            .maybeSingle();

          if (plan) {
            // Count sections with any data
            let sectionsWithData = 0;
            const noteFields = [
              'instructions_notes', 'about_me_notes', 'checklist_notes',
              'funeral_wishes_notes', 'financial_notes', 'insurance_notes',
              'property_notes', 'pets_notes', 'digital_notes', 'legal_notes',
              'messages_notes', 'to_loved_ones_message'
            ];

            noteFields.forEach(field => {
              if (plan[field] && plan[field].trim().length > 0) {
                sectionsWithData++;
              }
            });

            // Calculate percentage
            const calculatedProgress = Math.round((sectionsWithData / selectedSections.length) * 100);
            setProgress(calculatedProgress);

            // Update the plan with new percentage
            await supabase
              .from("plans")
              .update({ percent_complete: calculatedProgress })
              .eq("id", plan.id);
          }
        }
      }
    };

    loadUserData();
  }, []);

  const checkPaidAccess = async (): Promise<boolean> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    // Check for admin role
    const { data: adminRole } = await supabase
      .rpc('has_app_role', { _user_id: user.id, _role: 'admin' });
    
    if (adminRole) return true;

    // Check for required Stripe subscription lookup keys
    const requiredLookupKeys = ['EFAPREMIUM', 'EFAVIPMONTHLY', 'EFAVIPYEAR', 'EFADOFORU'];
    
    // Check subscriptions table for active subscriptions with these lookup keys
    const { data: subscription } = await supabase
      .from("subscriptions")
      .select("stripe_subscription_id, status")
      .eq("user_id", user.id)
      .eq("status", "active")
      .maybeSingle();

    if (subscription?.stripe_subscription_id) {
      // If they have an active subscription, assume it's one of the valid plans
      return true;
    }

    // Also check purchases table for one-time EFADOFORU purchase
    const { data: purchase } = await supabase
      .from('purchases')
      .select('id')
      .eq('user_id', user.id)
      .eq('product_lookup_key', 'EFADOFORU')
      .eq('status', 'completed')
      .maybeSingle();

    return !!purchase;
  };

  const checkIsFreePlan = async (): Promise<boolean> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return true; // Not logged in = free tier

    // Check for admin role
    const { data: adminRole } = await supabase
      .rpc('has_app_role', { _user_id: user.id, _role: 'admin' });
    
    if (adminRole) return false; // Admins have full access

    // Check if they have any paid subscription or purchase
    const hasPaid = await checkPaidAccess();
    return !hasPaid; // If no paid access, they're on free plan
  };

  const checkPrintableAccess = async (): Promise<boolean> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    // Check for admin role
    const { data: adminRole } = await supabase
      .rpc('has_app_role', { _user_id: user.id, _role: 'admin' });
    
    if (adminRole) return true;

    // Check if user has purchased EFABASIC (printable workbook)
    const { data: purchase } = await supabase
      .from('purchases')
      .select('id')
      .eq('user_id', user.id)
      .eq('product_lookup_key', 'EFABASIC')
      .eq('status', 'completed')
      .maybeSingle();

    return !!purchase;
  };

  const handleContinuePlanner = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Check for paid access
    const hasPaidAccess = await checkPaidAccess();
    if (!hasPaidAccess) {
      navigate('/pricing');
      return;
    }

    const { data: settings } = await supabase
      .from("user_settings")
      .select("selected_sections")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!settings || !settings.selected_sections || settings.selected_sections.length === 0) {
      navigate('/preferences');
      return;
    }

    navigate('/app');
  };

  const handleGeneratePDF = async () => {
    // Check for paid access (subscription required)
    const hasPaidAccess = await checkPaidAccess();
    if (!hasPaidAccess) {
      navigate('/pricing');
      return;
    }

    setShowPIIDialog(true);
  };

  const handlePIISubmit = async (piiData: any) => {
    try {
      await generatePlanPDF(piiData);
      toast({
        title: "PDF Generated",
        description: "Your Pre-Planning document has been generated successfully.",
      });
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast({
        title: "Error",
        description: "Failed to generate PDF. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDownloadWorkbook = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
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

      const successUrl = `${window.location.origin}/purchase-success?type=printable`;
      const cancelUrl = `${window.location.origin}/dashboard`;

      const { data, error } = await supabase.functions.invoke('stripe-create-checkout', {
        body: { 
          lookupKey: 'EFABASIC',
          mode: 'payment',
          successUrl,
          cancelUrl,
          allowPromotionCodes: true
        },
      });

      if (error) {
        console.error('Stripe function error:', error);
        throw error;
      }
      
      if (data?.url) {
        console.log('Opening Stripe checkout:', data.url);
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (error: any) {
      console.error("Error starting checkout:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to start checkout. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handlePurchaseBinder = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
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

      const successUrl = `${window.location.origin}/purchase-success?type=binder`;
      const cancelUrl = `${window.location.origin}/dashboard`;

      const { data, error } = await supabase.functions.invoke('stripe-create-checkout', {
        body: { 
          lookupKey: 'EFABINDER',
          mode: 'payment',
          successUrl,
          cancelUrl,
          allowPromotionCodes: true
        },
      });

      if (error) {
        console.error('Stripe function error:', error);
        throw error;
      }
      
      if (data?.url) {
        console.log('Opening Stripe checkout:', data.url);
        // Open in new window to avoid blank page issues
        const stripeWindow = window.open(data.url, '_blank');
        
        if (!stripeWindow) {
          // Fallback if popup blocked
          toast({
            title: "Pop-up blocked",
            description: "Please allow pop-ups and try again, or use the link below.",
            variant: "destructive",
          });
          // Try direct navigation as fallback
          setTimeout(() => {
            window.location.href = data.url;
          }, 1000);
        }
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (error: any) {
      console.error("Error starting checkout:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to start checkout. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleStartWizard = async () => {
    // Check for paid access
    const hasPaidAccess = await checkPaidAccess();
    if (!hasPaidAccess) {
      navigate('/pricing');
      return;
    }

    navigate('/wizard/preplanning');
  };

  const handleDownloadBlankPlanner = async () => {
    // Check for EFABASIC purchase access
    const hasPrintableAccess = await checkPrintableAccess();
    if (!hasPrintableAccess) {
      toast({
        title: "Purchase Required",
        description: "You need to purchase the printable workbook to download the blank planner form. Please purchase to continue.",
        variant: "destructive",
        action: (
          <Button variant="outline" size="sm" onClick={handleDownloadWorkbook}>
            Purchase Now
          </Button>
        ),
      });
      return;
    }

    try {
      await generateManuallyFillablePDF({});
      toast({
        title: "PDF Downloaded",
        description: "Your blank planner form has been downloaded successfully.",
      });
    } catch (error) {
      console.error("Error generating blank PDF:", error);
      toast({
        title: "Error",
        description: "Failed to generate PDF. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleGenerateAfterDeathPDF = async () => {
    try {
      await generateBlankAfterLifePlanPDF();
      toast({
        title: "PDF Generated",
        description: "Your After-Death Planner document has been generated successfully.",
      });
    } catch (error) {
      console.error("Error generating After-Death PDF:", error);
      toast({
        title: "Error",
        description: "Failed to generate PDF. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleBookDoItForYou = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Authentication required",
          description: "Please sign in to continue",
          variant: "destructive",
        });
        return;
      }

      const successUrl = `${window.location.origin}/purchase-success`;
      const cancelUrl = `${window.location.origin}/dashboard`;
      
      const { data, error } = await supabase.functions.invoke("stripe-create-checkout", {
        body: {
          lookupKey: "EFADOFORU",
          mode: "payment",
          successUrl,
          cancelUrl,
          allowPromotionCodes: true,
        },
      });
      
      if (error) {
        console.error('Stripe function error:', error);
        throw error;
      }
      
      if (data?.url) {
        console.log('Opening Stripe checkout:', data.url);
        // Open in new window to avoid blank page issues
        const stripeWindow = window.open(data.url, '_blank');
        
        if (!stripeWindow) {
          // Fallback if popup blocked
          toast({
            title: "Pop-up blocked",
            description: "Please allow pop-ups and try again, or use the link below.",
            variant: "destructive",
          });
          // Try direct navigation as fallback
          setTimeout(() => {
            window.location.href = data.url;
          }, 1000);
        }
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (error: any) {
      console.error('Checkout error:', error);
      toast({
        title: "Checkout failed",
        description: error.message || "Unable to start checkout. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <AuthenticatedLayout>
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Welcome Header - Centered */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-2">Welcome to the Planning Dashboard</h1>
          <p className="text-muted-foreground max-w-4xl mx-auto mb-3">
            Follow these simple steps to organize your wishes, important documents and instructions.
          </p>
          <p className="text-sm text-muted-foreground/80 max-w-3xl mx-auto italic">
            Note: all sections save automatically as you work and you are not required to enter information in all the sections only what is pertinent to you and what you are willing and able to share.
          </p>
          <div className="mt-4 p-4 bg-muted/30 rounded-lg max-w-3xl mx-auto">
            <p className="text-sm text-muted-foreground leading-relaxed">
              <strong>Instructions for the PDF:</strong> Enter any sensitive details about you or the person you are filling out this plan for that you want included in the document generated in PDF format. All fields are optional - leave blank any information you don't want to include. Download the PDF after filling out.
            </p>
          </div>
        </div>

        {/* Progress Tracker - Centered with connecting lines */}
        <div className="mb-12">
          <div className="flex justify-between items-center gap-2 max-w-4xl mx-auto relative">
            {/* Connecting line behind circles */}
            <div className="absolute top-6 left-0 right-0 h-0.5 bg-[hsl(210,100%,45%)]/30 -z-10" style={{ marginLeft: '2.5rem', marginRight: '2.5rem' }}></div>
            
            {['Plan Ahead', 'Get Support', 'Shop', 'Personal Touch', 'After-Death Guide'].map((step, idx) => (
              <div key={idx} className="flex flex-col items-center flex-1">
                <div className="w-12 h-12 rounded-full bg-[hsl(210,100%,45%)] text-white flex items-center justify-center font-semibold text-base mb-2 shadow-md">
                  {idx + 1}
                </div>
                <span className="text-xs text-center text-muted-foreground">{step}</span>
              </div>
            ))}
          </div>
        </div>

        {/* STEP 1 - Plan Ahead Planner */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-full bg-[hsl(210,100%,45%)] text-white flex items-center justify-center font-bold text-lg shadow-md">
              1
            </div>
            <h2 className="text-2xl font-bold">Plan Ahead Planner</h2>
          </div>
          
          <Card className="p-6">
            <div className="space-y-6">
              {/* Option 1: Digital Planner */}
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <FileText className="h-4 w-4 text-primary" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold mb-2">Option 1: Digital Planner</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Complete your planning online and save your progress as you go.
                  </p>
                  {isFreePlan ? (
                    <div className="space-y-4">
                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                        <p className="text-sm text-amber-900 mb-3">
                          <strong>Upgrade Required:</strong> Subscribe to Premium, VIP, or Do It For You to access the digital planner.
                        </p>
                        <Button onClick={() => navigate('/pricing')} className="bg-amber-600 hover:bg-amber-700 text-white">
                          View Plans & Upgrade
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Button onClick={handlePurchaseBinder} variant="outline" className="flex-1 min-w-[140px] border-2 border-[hsl(210,100%,35%)] text-[hsl(210,100%,35%)] bg-white hover:bg-[hsl(210,100%,35%)]/10">
                          Purchase Physical Binder
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      <Button onClick={handleContinuePlanner} className="flex-1 min-w-[140px] bg-[hsl(210,100%,35%)] hover:bg-[hsl(210,100%,30%)]">
                        Open My Planner
                      </Button>
                      <Button onClick={handleGeneratePDF} variant="outline" className="flex-1 min-w-[140px] border-2 border-[hsl(210,100%,35%)] text-[hsl(210,100%,35%)] bg-white hover:bg-[hsl(210,100%,35%)]/10">
                        Get a Printable Version
                      </Button>
                      <Button onClick={handleStartWizard} variant="outline" className="flex-1 min-w-[140px] border-2 border-[hsl(210,100%,35%)] text-[hsl(210,100%,35%)] bg-white hover:bg-[hsl(210,100%,35%)]/10">
                        Step-by-step Guide
                      </Button>
                      <Button onClick={handlePurchaseBinder} variant="outline" className="flex-1 min-w-[140px] border-2 border-[hsl(210,100%,35%)] text-[hsl(210,100%,35%)] bg-white hover:bg-[hsl(210,100%,35%)]/10">
                        Purchase Physical Binder
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              <div className="border-t pt-6" />

              {/* Option 2: Printable Version */}
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Printer className="h-4 w-4 text-primary" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold mb-2">Option 2: Printable Version</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Download a blank form to fill out by hand or purchase the printable workbook.
                  </p>
                  {isFreePlan ? (
                    <div className="space-y-4">
                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                        <p className="text-sm text-amber-900 mb-3">
                          <strong>Upgrade Required:</strong> Subscribe to access the printable workbook and blank planner downloads.
                        </p>
                        <Button onClick={() => navigate('/pricing')} className="bg-amber-600 hover:bg-amber-700 text-white">
                          View Plans & Upgrade
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Button onClick={handlePurchaseBinder} variant="outline" className="flex-1 min-w-[140px] border-2 border-[hsl(210,100%,35%)] text-[hsl(210,100%,35%)] bg-white hover:bg-[hsl(210,100%,35%)]/10">
                          Purchase Physical Binder
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      <Button onClick={handleDownloadBlankPlanner} variant="outline" className="flex-1 min-w-[140px] border-2 border-[hsl(210,100%,35%)] text-[hsl(210,100%,35%)] bg-white hover:bg-[hsl(210,100%,35%)]/10">
                        Download Blank Planner Form
                      </Button>
                      <Button onClick={handleDownloadWorkbook} className="flex-1 min-w-[140px] bg-[hsl(210,100%,35%)] hover:bg-[hsl(210,100%,30%)]">
                        Purchase
                      </Button>
                      <Button onClick={handlePurchaseBinder} variant="outline" className="flex-1 min-w-[140px] border-2 border-[hsl(210,100%,35%)] text-[hsl(210,100%,35%)] bg-white hover:bg-[hsl(210,100%,35%)]/10">
                        Purchase Physical Binder
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              <div className="border-t pt-6" />

              {/* Option 3: Do It For You Service */}
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Users className="h-4 w-4 text-primary" />
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold">Option 3: Do It For You (One-Time Service)</h3>
                    <span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 text-xs font-medium rounded">POPULAR</span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    Let our team guide you through the entire process with a personalized consultation.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Button onClick={handleBookDoItForYou} className="flex-1 min-w-[140px] bg-[hsl(210,100%,35%)] hover:bg-[hsl(210,100%,30%)]">
                      Purchase and Book an Appointment
                    </Button>
                    <Button onClick={handleDownloadWorkbook} variant="outline" className="flex-1 min-w-[140px] border-2 border-[hsl(210,100%,35%)] text-[hsl(210,100%,35%)] bg-white hover:bg-[hsl(210,100%,35%)]/10">
                      Purchase Physical Binder
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* STEP 2 - VIP Coach Assistant */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-full bg-[hsl(210,100%,45%)] text-white flex items-center justify-center font-bold text-lg shadow-md">
              2
            </div>
            <h2 className="text-2xl font-bold">VIP Coach Assistant</h2>
          </div>
          
          <Card className="p-6 bg-yellow-50/50 border-yellow-200">
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 rounded-lg bg-yellow-500/10 flex items-center justify-center">
                  <Star className="h-4 w-4 text-yellow-600" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold mb-3">Get Personalized Support</h3>
                <ul className="space-y-2 mb-4 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-600 mt-1">✓</span>
                    <span>One-on-one guidance from funeral planning experts</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-600 mt-1">✓</span>
                    <span>Help completing your planner step-by-step</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-600 mt-1">✓</span>
                    <span>Answers to all your questions about end-of-life planning</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-600 mt-1">✓</span>
                    <span>Compassionate support during difficult decisions</span>
                  </li>
                </ul>
                <Button onClick={() => navigate(isFreePlan ? '/pricing' : '/plans')} className="bg-[hsl(210,100%,35%)] hover:bg-[hsl(210,100%,30%)]">
                  Upgrade to VIP
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* STEP 3 - Shop */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-full bg-[hsl(210,100%,45%)] text-white flex items-center justify-center font-bold text-lg shadow-md">
              3
            </div>
            <h2 className="text-2xl font-bold">Shop</h2>
          </div>
          
          <Card className="p-6 border-2 border-blue-400 bg-gradient-to-br from-blue-50 to-blue-100/50 relative">
            <div className="absolute top-4 right-4">
              <span className="px-3 py-1 bg-red-500 text-white text-xs font-semibold rounded-full">High Demand</span>
            </div>
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <ShoppingBag className="h-4 w-4 text-blue-600" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold mb-2">Caskets, Urns & Flowers</h3>
                <p className="text-muted-foreground mb-4">
                  Browse our selection of affordable, high-quality caskets, urns, and funeral flowers.
                </p>
                <div className="flex justify-start">
                  <Button 
                    onClick={() => window.open('https://everlastingfuneraladvisors.com/shop/', '_blank')} 
                    size="sm" 
                    className="bg-[hsl(210,100%,35%)] hover:bg-[hsl(210,100%,30%)]"
                  >
                    Browse Products
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* STEP 4 - Custom Memorial Song */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-full bg-[hsl(210,100%,45%)] text-white flex items-center justify-center font-bold text-lg shadow-md">
              4
            </div>
            <h2 className="text-2xl font-bold">Custom Memorial Song</h2>
          </div>
          
          <Card className="p-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Music className="h-4 w-4 text-primary" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold mb-2">Create a Unique Tribute Song</h3>
                <p className="text-muted-foreground mb-4">
                  Honor your loved one with a personalized memorial song created just for them.
                </p>
                <div className="flex justify-start">
                  <Button onClick={() => navigate('/products/custom-song')} size="sm" className="bg-[hsl(210,100%,35%)] hover:bg-[hsl(210,100%,30%)]">
                    Create Song
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* STEP 5 - After-Death Planner */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-full bg-[hsl(210,100%,45%)] text-white flex items-center justify-center font-bold text-lg shadow-md">
              5
            </div>
            <h2 className="text-2xl font-bold">After-Death Planner</h2>
          </div>
          
          <Card className="p-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <ListChecks className="h-4 w-4 text-primary" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold mb-2">Guided Steps for After a Loss</h3>
                <p className="text-muted-foreground mb-4">
                  A 12-step guide to help your loved ones navigate the practical tasks following a death.
                </p>
                <div className="flex flex-wrap gap-2">
                  <Button onClick={() => navigate('/after-death-planner')} className="flex-1 min-w-[140px] bg-[hsl(210,100%,35%)] hover:bg-[hsl(210,100%,30%)]">
                    Open After-Death Planner
                  </Button>
                  <Button onClick={handleGenerateAfterDeathPDF} className="flex-1 min-w-[140px] bg-[hsl(210,100%,35%)] hover:bg-[hsl(210,100%,30%)]">
                    Get a Printable Document
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* STEP 6 - Help & Support */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Help & Support</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/resources')}>
              <div className="flex flex-col items-center text-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                  <BookOpen className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-semibold">Helpful Resources</h3>
              </div>
            </Card>
            
            <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/legal-documents')}>
              <div className="flex flex-col items-center text-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
                  <Scale className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-semibold">Legal Documents & Resources</h3>
              </div>
            </Card>
            
            <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/faq')}>
              <div className="flex flex-col items-center text-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
                  <Lightbulb className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-semibold">Common Questions</h3>
              </div>
            </Card>
            
            <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/vendors')}>
              <div className="flex flex-col items-center text-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
                  <Phone className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-semibold">Helpful Contacts & Vendors</h3>
              </div>
            </Card>
          </div>
        </div>
      </div>

      <PIICollectionDialog
        open={showPIIDialog}
        onOpenChange={setShowPIIDialog}
        onSubmit={handlePIISubmit}
      />
    </AuthenticatedLayout>
  );
}
