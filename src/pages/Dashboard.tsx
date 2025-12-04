import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import { FileText, Star, BookOpen, Scale, Phone, Music, Printer, Users, ListChecks, ShoppingBag, Lightbulb } from "lucide-react";
import { AuthenticatedLayout } from "@/components/AuthenticatedLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { PIICollectionDialog } from "@/components/planner/PIICollectionDialog";
import { generatePlanPDF } from "@/lib/pdfGenerator";
import { generateManuallyFillablePDF } from "@/lib/manuallyFillablePdfGenerator";
import { generateBlankAfterLifePlanPDF } from "@/lib/blankAfterLifePlanPdfGenerator";
import { checkPaidAccess as checkPaidAccessFn, checkVIPAccess as checkVIPAccessFn, checkPrintableAccess as checkPrintableAccessFn, checkIsFreePlan as checkIsFreePlanFn } from "@/lib/accessChecks";
export default function Dashboard() {
  const {
    t
  } = useTranslation();
  const navigate = useNavigate();
  const {
    toast
  } = useToast();
  const [firstName, setFirstName] = useState<string>("");
  const [progress, setProgress] = useState(0);
  const [showPIIDialog, setShowPIIDialog] = useState(false);
  const [pendingPIIData, setPendingPIIData] = useState<any>(null);
  const [isFreePlan, setIsFreePlan] = useState(true);
  const [hasVIPAccess, setHasVIPAccess] = useState(false);
  const [hasPrintableAccess, setHasPrintableAccess] = useState(false);
  useEffect(() => {
    const loadUserData = async () => {
      const {
        data: {
          user
        }
      } = await supabase.auth.getUser();
      if (!user) return;

      // Check if user is on free plan
      const freePlan = await checkIsFreePlan();
      setIsFreePlan(freePlan);

      // Check if user has VIP access
      const vipAccess = await checkVIPAccess();
      setHasVIPAccess(vipAccess);

      // Check if user has printable access (EFABASIC)
      const printableAccess = await checkPrintableAccess();
      setHasPrintableAccess(printableAccess);

      // Load user name
      const {
        data: profile
      } = await supabase.from("profiles").select("full_name").eq("id", user.id).single();
      if (profile?.full_name) {
        const name = profile.full_name.split(" ")[0];
        setFirstName(name);
      }

      // Load progress and calculate dynamically
      const {
        data: orgMember
      } = await supabase.from("org_members").select("org_id").eq("user_id", user.id).eq("role", "owner").maybeSingle();
      if (orgMember) {
        // Get user's selected sections from preferences
        const {
          data: settings
        } = await supabase.from("user_settings").select("selected_sections").eq("user_id", user.id).maybeSingle();
        const selectedSections = settings?.selected_sections || [];
        if (selectedSections.length > 0) {
          // Get plan data to check which sections have content
          const {
            data: plan
          } = await supabase.from("plans").select("*").eq("org_id", orgMember.org_id).eq("owner_user_id", user.id).maybeSingle();
          if (plan) {
            // Count sections with any data
            let sectionsWithData = 0;
            const noteFields = ['instructions_notes', 'about_me_notes', 'checklist_notes', 'funeral_wishes_notes', 'financial_notes', 'insurance_notes', 'property_notes', 'pets_notes', 'digital_notes', 'legal_notes', 'messages_notes', 'to_loved_ones_message'];
            noteFields.forEach(field => {
              if (plan[field] && plan[field].trim().length > 0) {
                sectionsWithData++;
              }
            });

            // Calculate percentage
            const calculatedProgress = Math.round(sectionsWithData / selectedSections.length * 100);
            setProgress(calculatedProgress);

            // Update the plan with new percentage
            await supabase.from("plans").update({
              percent_complete: calculatedProgress
            }).eq("id", plan.id);
          }
        }
      }
    };
    loadUserData();
  }, []);

  // Use imported access check functions (single source of truth)
  const checkPaidAccess = checkPaidAccessFn;
  const checkIsFreePlan = checkIsFreePlanFn;
  const checkVIPAccess = checkVIPAccessFn;
  const checkPrintableAccess = checkPrintableAccessFn;
  const handleContinuePlanner = async () => {
    const {
      data: {
        user
      }
    } = await supabase.auth.getUser();
    if (!user) return;

    // Check for paid access
    const hasPaidAccess = await checkPaidAccess();
    if (!hasPaidAccess) {
      navigate('/pricing');
      return;
    }
    const {
      data: settings
    } = await supabase.from("user_settings").select("selected_sections").eq("user_id", user.id).maybeSingle();
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
        description: "Your Pre-Planning document has been generated successfully."
      });
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast({
        title: "Error",
        description: "Failed to generate PDF. Please try again.",
        variant: "destructive"
      });
    }
  };
  const handleDownloadWorkbook = async () => {
    try {
      const successUrl = `${window.location.origin}/purchase-success?type=printable`;
      const cancelUrl = `${window.location.origin}/dashboard`;
      const {
        data,
        error
      } = await supabase.functions.invoke('stripe-create-checkout', {
        body: {
          lookupKey: 'EFABASIC',
          mode: 'payment',
          successUrl,
          cancelUrl,
          allowPromotionCodes: true
        }
      });
      if (error) {
        console.error('Stripe function error:', error);
        toast({
          title: "Checkout failed",
          description: "Unable to start checkout. Please try again.",
          variant: "destructive"
        });
        return;
      }
      if (data?.url) {
        window.location.href = data.url;
      } else {
        toast({
          title: "Error",
          description: "No checkout URL received. Please try again.",
          variant: "destructive"
        });
      }
    } catch (error: any) {
      console.error("Error starting checkout:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to start checkout. Please try again.",
        variant: "destructive"
      });
    }
  };
  const handlePurchaseBinder = async () => {
    try {
      const successUrl = `${window.location.origin}/purchase-success?type=binder`;
      const cancelUrl = `${window.location.origin}/dashboard`;
      const {
        data,
        error
      } = await supabase.functions.invoke('stripe-create-checkout', {
        body: {
          lookupKey: 'EFABINDER',
          mode: 'payment',
          successUrl,
          cancelUrl,
          allowPromotionCodes: true
        }
      });
      if (error) {
        console.error('Stripe function error:', error);
        toast({
          title: "Checkout failed",
          description: "Unable to start checkout. Please try again.",
          variant: "destructive"
        });
        return;
      }
      if (data?.url) {
        window.location.href = data.url;
      } else {
        toast({
          title: "Error",
          description: "No checkout URL received. Please try again.",
          variant: "destructive"
        });
      }
    } catch (error: any) {
      console.error("Error starting checkout:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to start checkout. Please try again.",
        variant: "destructive"
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
    try {
      await generateManuallyFillablePDF({});
      toast({
        title: "PDF Downloaded",
        description: "Your blank planner form has been downloaded successfully."
      });
    } catch (error) {
      console.error("Error generating blank PDF:", error);
      toast({
        title: "Error",
        description: "Failed to generate PDF. Please try again.",
        variant: "destructive"
      });
    }
  };
  const handleGenerateAfterDeathPDF = async () => {
    try {
      await generateBlankAfterLifePlanPDF();
      toast({
        title: "PDF Generated",
        description: "Your After-Death Planner document has been generated successfully."
      });
    } catch (error) {
      console.error("Error generating After-Death PDF:", error);
      toast({
        title: "Error",
        description: "Failed to generate PDF. Please try again.",
        variant: "destructive"
      });
    }
  };
  const handleVIPMonthly = async () => {
    try {
      const successUrl = `${window.location.origin}/purchase-success?type=vip-monthly`;
      const cancelUrl = `${window.location.origin}/dashboard`;
      const {
        data,
        error
      } = await supabase.functions.invoke("stripe-create-checkout", {
        body: {
          lookupKey: "EFAVIPMONTHLY",
          mode: "subscription",
          successUrl,
          cancelUrl,
          allowPromotionCodes: true
        }
      });
      if (error) {
        console.error("VIP Monthly checkout error:", error);
        toast({
          title: "Checkout failed",
          description: error.message || "Unable to start checkout. Please try again.",
          variant: "destructive"
        });
        return;
      }
      if (data?.url) {
        console.log("Redirecting to Stripe checkout:", data.url);
        window.location.href = data.url;
      } else {
        console.error("No checkout URL in response:", data);
        toast({
          title: "Error",
          description: "No checkout URL received. Please try again.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    }
  };
  const handleVIPYearly = async () => {
    try {
      const successUrl = `${window.location.origin}/purchase-success?type=vip-yearly`;
      const cancelUrl = `${window.location.origin}/dashboard`;
      const {
        data,
        error
      } = await supabase.functions.invoke("stripe-create-checkout", {
        body: {
          lookupKey: "EFAVIPYEAR",
          mode: "subscription",
          successUrl,
          cancelUrl,
          allowPromotionCodes: true
        }
      });
      if (error) {
        console.error("VIP Yearly checkout error:", error);
        toast({
          title: "Checkout failed",
          description: error.message || "Unable to start checkout. Please try again.",
          variant: "destructive"
        });
        return;
      }
      if (data?.url) {
        console.log("Redirecting to Stripe checkout:", data.url);
        window.location.href = data.url;
      } else {
        console.error("No checkout URL in response:", data);
        toast({
          title: "Error",
          description: "No checkout URL received. Please try again.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    }
  };
  const handlePremiumSubscription = async () => {
    try {
      const successUrl = `${window.location.origin}/purchase-success?type=premium`;
      const cancelUrl = `${window.location.origin}/dashboard`;
      const {
        data,
        error
      } = await supabase.functions.invoke("stripe-create-checkout", {
        body: {
          lookupKey: "EFAPREMIUM",
          mode: "subscription",
          successUrl,
          cancelUrl,
          allowPromotionCodes: true
        }
      });
      if (error) {
        console.error("Checkout error:", error);
        toast({
          title: "Checkout failed",
          description: error.message || "Unable to start checkout. Please try again.",
          variant: "destructive"
        });
        return;
      }
      if (data?.url) {
        console.log("Redirecting to Stripe checkout:", data.url);
        window.location.href = data.url;
      } else {
        console.error("No checkout URL in response:", data);
        toast({
          title: "Error",
          description: "No checkout URL received. Please try again.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    }
  };
  const handleBookDoItForYou = async () => {
    try {
      const successUrl = `${window.location.origin}/purchase-success`;
      const cancelUrl = `${window.location.origin}/dashboard`;
      const {
        data,
        error
      } = await supabase.functions.invoke("stripe-create-checkout", {
        body: {
          lookupKey: "EFADOFORU",
          mode: "payment",
          successUrl,
          cancelUrl,
          allowPromotionCodes: true
        }
      });
      if (error) {
        console.error('Stripe function error:', error);
        toast({
          title: "Checkout failed",
          description: "Unable to start checkout. Please try again.",
          variant: "destructive"
        });
        return;
      }
      if (data?.url) {
        window.location.href = data.url;
      } else {
        toast({
          title: "Error",
          description: "No checkout URL received. Please try again.",
          variant: "destructive"
        });
      }
    } catch (error: any) {
      console.error('Checkout error:', error);
      toast({
        title: "Checkout failed",
        description: error.message || "Unable to start checkout. Please try again.",
        variant: "destructive"
      });
    }
  };
  return <AuthenticatedLayout>
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Welcome Header - Centered */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-2">{t('dashboard.welcomeTitle')}</h1>
          <p className="text-muted-foreground max-w-4xl mx-auto mb-3">
            {t('dashboard.welcomeSubtitle')}
          </p>
          <p className="text-sm text-muted-foreground/80 max-w-3xl mx-auto italic">
            {t('dashboard.autoSaveNote')}
          </p>
          <div className="mt-4 p-4 bg-muted/30 rounded-lg max-w-3xl mx-auto">
            <p className="text-sm text-muted-foreground leading-relaxed">
              <strong>{t('dashboard.pdfInstructionsTitle')}</strong> {t('dashboard.pdfInstructionsText')}
            </p>
          </div>
        </div>

        {/* Progress Tracker - Centered with connecting lines */}
        <div className="mb-12">
          <div className="flex justify-between items-center gap-2 max-w-4xl mx-auto relative">
            {/* Connecting line behind circles */}
            <div className="absolute top-6 left-0 right-0 h-0.5 bg-[hsl(210,100%,45%)]/30 -z-10" style={{
            marginLeft: '2.5rem',
            marginRight: '2.5rem'
          }}></div>
            
            {[t('dashboard.steps.planAhead'), t('dashboard.steps.getSupport'), t('dashboard.steps.shop'), t('dashboard.steps.personalTouch'), t('dashboard.steps.afterDeathGuide')].map((step, idx) => <div key={idx} className="flex flex-col items-center flex-1">
                <div className="w-12 h-12 rounded-full bg-[hsl(210,100%,45%)] text-white flex items-center justify-center font-semibold text-base mb-2 shadow-md">
                  {idx + 1}
                </div>
                <span className="text-xs text-center text-muted-foreground">{step}</span>
              </div>)}
          </div>
        </div>

        {/* STEP 1 - Plan Ahead Planner */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-full bg-[hsl(210,100%,45%)] text-white flex items-center justify-center font-bold text-lg shadow-md">
              1
            </div>
            <h2 className="text-2xl font-bold">{t('dashboard.planAheadPlanner')}</h2>
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
                  <h3 className="font-semibold mb-2">{t('dashboard.option1Digital')}</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {t('dashboard.option1DigitalDesc')}
                  </p>
                  {isFreePlan ? <div className="space-y-4">
                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                        <p className="text-sm text-amber-900 mb-3">
                          <strong>{t('dashboard.upgradeRequired')}</strong> {t('dashboard.upgradeRequiredDesc')}
                        </p>
                        <Button onClick={handlePremiumSubscription} className="bg-[hsl(210,100%,35%)] hover:bg-[hsl(210,100%,30%)] text-white">
                          {t('dashboard.subscribeToPremium')}
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Button onClick={handlePurchaseBinder} variant="outline" className="flex-1 min-w-[140px] border-2 border-[hsl(210,100%,35%)] text-[hsl(210,100%,35%)] bg-white hover:bg-[hsl(210,100%,35%)]/10">
                          {t('dashboard.purchasePhysicalBinder')}
                        </Button>
                      </div>
                    </div> : <div className="flex flex-wrap gap-2">
                      <Button onClick={handleContinuePlanner} className="flex-1 min-w-[140px] bg-[hsl(210,100%,35%)] hover:bg-[hsl(210,100%,30%)]">
                        {t('dashboard.openMyPlanner')}
                      </Button>
                      <Button onClick={handleGeneratePDF} variant="outline" className="flex-1 min-w-[140px] border-2 border-[hsl(210,100%,35%)] text-[hsl(210,100%,35%)] bg-white hover:bg-[hsl(210,100%,35%)]/10">
                        {t('dashboard.printableVersion')}
                      </Button>
                      <Button onClick={handleStartWizard} variant="outline" className="flex-1 min-w-[140px] border-2 border-[hsl(210,100%,35%)] text-[hsl(210,100%,35%)] bg-white hover:bg-[hsl(210,100%,35%)]/10">
                        {t('dashboard.stepByStepGuide')}
                      </Button>
                      <Button onClick={handlePurchaseBinder} variant="outline" className="flex-1 min-w-[140px] border-2 border-[hsl(210,100%,35%)] text-[hsl(210,100%,35%)] bg-white hover:bg-[hsl(210,100%,35%)]/10">
                        {t('dashboard.purchasePhysicalBinder')}
                      </Button>
                    </div>}
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
                  <h3 className="font-semibold mb-2">{t('dashboard.option2Printable')}</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {t('dashboard.option2PrintableDesc')}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {hasPrintableAccess && <Button onClick={handleDownloadBlankPlanner} variant="outline" className="flex-1 min-w-[140px] border-2 border-[hsl(210,100%,35%)] bg-blue-800 hover:bg-blue-700 text-primary-foreground">
                        {t('dashboard.downloadBlankPlannerForm')}
                      </Button>}
                    {!hasPrintableAccess && <Button onClick={handleDownloadWorkbook} className="flex-1 min-w-[140px] bg-[hsl(210,100%,35%)] hover:bg-[hsl(210,100%,30%)]">
                        {t('dashboard.purchase')}
                      </Button>}
                    <Button onClick={handlePurchaseBinder} variant="outline" className="flex-1 min-w-[140px] border-2 border-[hsl(210,100%,35%)] text-[hsl(210,100%,35%)] bg-white hover:bg-[hsl(210,100%,35%)]/10">
                      {t('dashboard.purchasePhysicalBinder')}
                    </Button>
                  </div>
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
                    <h3 className="font-semibold">{t('dashboard.option3DoItForYou')}</h3>
                    <span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 text-xs font-medium rounded">{t('dashboard.popular')}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    {t('dashboard.option3Desc')}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Button onClick={handleBookDoItForYou} className="flex-1 min-w-[140px] bg-primary-foreground text-blue-700">
                      {t('dashboard.purchaseAndBookAppointment')}
                    </Button>
                    <Button onClick={handleDownloadWorkbook} variant="outline" className="flex-1 min-w-[140px] border-2 border-[hsl(210,100%,35%)] text-[hsl(210,100%,35%)] bg-white hover:bg-[hsl(210,100%,35%)]/10">
                      {t('dashboard.purchasePhysicalBinder')}
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
            <h2 className="text-2xl font-bold">{t('dashboard.vipCoach')}</h2>
          </div>
          
          <Card className="p-6 bg-yellow-50/50 border-yellow-200">
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 rounded-lg bg-yellow-500/10 flex items-center justify-center">
                  <Star className="h-4 w-4 text-yellow-600" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold mb-3">{t('dashboard.getPersonalizedSupport')}</h3>
                <ul className="space-y-2 mb-4 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-600 mt-1">✓</span>
                    <span>{t('dashboard.vipBenefit1')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-600 mt-1">✓</span>
                    <span>{t('dashboard.vipBenefit2')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-600 mt-1">✓</span>
                    <span>{t('dashboard.vipBenefit3')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-600 mt-1">✓</span>
                    <span>{t('dashboard.vipBenefit4')}</span>
                  </li>
                </ul>
                {hasVIPAccess ? <Button onClick={() => navigate('/coach')} className="bg-[hsl(210,100%,35%)] hover:bg-[hsl(210,100%,30%)]">
                    {t('dashboard.accessVipCoach')}
                  </Button> : <div className="flex flex-wrap gap-3">
                    <Button onClick={handleVIPMonthly} className="bg-[hsl(210,100%,35%)] hover:bg-[hsl(210,100%,30%)]">
                      {t('dashboard.upgradeVipMonthly')}
                    </Button>
                    <Button onClick={handleVIPYearly} variant="outline" className="border-2 border-[hsl(210,100%,35%)] text-[hsl(210,100%,35%)] bg-white hover:bg-[hsl(210,100%,35%)]/10">
                      {t('dashboard.upgradeVipYearly')}
                    </Button>
                  </div>}
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
            <h2 className="text-2xl font-bold">{t('dashboard.steps.shop')}</h2>
          </div>
          
          <Card className="p-6 border-2 border-blue-400 bg-gradient-to-br from-blue-50 to-blue-100/50 relative">
            <div className="absolute top-4 right-4">
              <span className="px-3 py-1 bg-red-500 text-white text-xs font-semibold rounded-full">{t('dashboard.highDemand')}</span>
            </div>
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <ShoppingBag className="h-4 w-4 text-blue-600" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold mb-2">{t('dashboard.casketsUrnsFlowers')}</h3>
                <p className="text-muted-foreground mb-4">
                  {t('dashboard.shopDesc')}
                </p>
                <div className="flex justify-start">
                  <Button onClick={() => window.open('https://everlastingfuneraladvisors.com/shop/', '_blank')} size="sm" className="bg-[hsl(210,100%,35%)] hover:bg-[hsl(210,100%,30%)]">
                    {t('dashboard.browseProducts')}
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
            <h2 className="text-2xl font-bold">{t('dashboard.customSong')}</h2>
          </div>
          
          <Card className="p-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Music className="h-4 w-4 text-primary" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold mb-2">{t('dashboard.createUniqueTributeSong')}</h3>
                <p className="text-muted-foreground mb-4">
                  {t('dashboard.customSongDesc')}
                </p>
                <div className="flex justify-start">
                  <Button onClick={() => navigate('/products/custom-song')} size="sm" className="bg-[hsl(210,100%,35%)] hover:bg-[hsl(210,100%,30%)]">
                    {t('dashboard.createSong')}
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
            <h2 className="text-2xl font-bold">{t('dashboard.afterDeathPlanner')}</h2>
          </div>
          
          <Card className="p-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <ListChecks className="h-4 w-4 text-primary" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold mb-2">{t('dashboard.guidedStepsAfterLoss')}</h3>
                <p className="text-muted-foreground mb-4">
                  {t('dashboard.afterDeathDesc')}
                </p>
                <div className="flex flex-wrap gap-2">
                  <Button onClick={() => navigate('/after-death-planner')} className="flex-1 min-w-[140px] bg-[hsl(210,100%,35%)] hover:bg-[hsl(210,100%,30%)]">
                    {t('dashboard.openAfterDeathPlanner')}
                  </Button>
                  <Button onClick={handleGenerateAfterDeathPDF} className="flex-1 min-w-[140px] bg-[hsl(210,100%,35%)] hover:bg-[hsl(210,100%,30%)]">
                    {t('dashboard.getPrintableDocument')}
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* STEP 6 - Help & Support */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">{t('dashboard.helpAndSupport')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/resources')}>
              <div className="flex flex-col items-center text-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                  <BookOpen className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-semibold">{t('dashboard.tiles.resources.title')}</h3>
              </div>
            </Card>
            
            <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/legal-documents')}>
              <div className="flex flex-col items-center text-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
                  <Scale className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-semibold">{t('dashboard.tiles.legalDocuments.title')}</h3>
              </div>
            </Card>
            
            <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/faq')}>
              <div className="flex flex-col items-center text-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
                  <Lightbulb className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-semibold">{t('dashboard.tiles.questions.title')}</h3>
              </div>
            </Card>
            
            <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/vendors')}>
              <div className="flex flex-col items-center text-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
                  <Phone className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-semibold">{t('dashboard.tiles.vendors.title')}</h3>
              </div>
            </Card>
          </div>
        </div>
      </div>

      <PIICollectionDialog open={showPIIDialog} onOpenChange={setShowPIIDialog} onSubmit={handlePIISubmit} />
    </AuthenticatedLayout>;
}