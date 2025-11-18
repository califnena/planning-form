import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import { 
  FileText, 
  CheckCircle, 
  FileOutput, 
  Star,
  Store,
  BookOpen, 
  HelpCircle,
  Scale,
  Phone,
  Download,
  Music,
  Calendar
} from "lucide-react";
import { GlobalHeader } from "@/components/GlobalHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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

  useEffect(() => {
    const loadUserData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

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

  const handleStartNew = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Check if user has preferences set
    const { data: settings } = await supabase
      .from("user_settings")
      .select("selected_sections")
      .eq("user_id", user.id)
      .maybeSingle();

    // If no preferences, redirect to preferences page
    if (!settings?.selected_sections || settings.selected_sections.length === 0) {
      navigate("/preferences");
      return;
    }

    // Otherwise navigate to planner
    navigate("/app");
  };

  const handleAfterDeathPDF = async () => {
    try {
      await generateBlankAfterLifePlanPDF();
      toast({
        title: "PDF Generated",
        description: "Your After-Death Plan PDF is ready.",
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

  const handlePIISubmit = async (piiData: any) => {
    try {
      const mergedData = {
        ...pendingPIIData,
        ...piiData,
      };

      await generatePlanPDF(mergedData);
      toast({
        title: "PDF Generated",
        description: "Your Pre-Planning document is ready to download.",
      });

      setShowPIIDialog(false);
      setPendingPIIData(null);
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast({
        title: "Error",
        description: "Failed to generate PDF. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleBlankPrePlanningPDF = () => {
    try {
      generateManuallyFillablePDF({});
      toast({
        title: "Blank Form Downloaded",
        description: "Your blank Pre-Planning form is ready to print and fill out.",
      });
    } catch (error) {
      console.error("Error generating blank Pre-Planning PDF:", error);
      toast({
        title: "Error",
        description: "Failed to generate blank form. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Help & Support cards
  const helpSupportCards = [
    {
      title: t("dashboard.tiles.resources.title"),
      icon: BookOpen,
      href: "/resources",
    },
    {
      title: t("dashboard.tiles.legalDocuments.title"),
      icon: Scale,
      href: "/legal-documents",
    },
    {
      title: t("dashboard.tiles.questions.title"),
      icon: HelpCircle,
      href: "/faq",
    },
    {
      title: t("dashboard.tiles.vendors.title"),
      icon: Phone,
      href: "/vendors",
    },
  ];

  return (
    <>
      <GlobalHeader />
      <div className="min-h-screen bg-background">
        <div className="mx-auto max-w-6xl px-4 py-8 space-y-12">
          
          {/* Welcome Message */}
          <div className="text-center space-y-4">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground">
              Welcome to Your Planning Dashboard
            </h1>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Follow these simple steps to organize your wishes, important documents, and instructions. Everything saves automatically as you work.
            </p>

            {/* Progress Tracker */}
            <div className="flex justify-center gap-4 md:gap-8 mt-6 flex-wrap">
              {[
                { num: 1, label: "Plan Ahead" },
                { num: 2, label: "Get Support" },
                { num: 3, label: "Shop" },
                { num: 4, label: "Personal Touch" },
                { num: 5, label: "After-Death Guide" }
              ].map((step) => (
                <div key={step.num} className="flex flex-col items-center gap-1">
                  <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg shadow-md">
                    {step.num}
                  </div>
                  <span className="text-xs md:text-sm text-muted-foreground font-medium">{step.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* STEP 1 — Plan Ahead Planner (Start Here) */}
          <section>
            <div className="text-center mb-6">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-2 flex items-center justify-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg">1</div>
                Plan Ahead Planner
              </h2>
              <p className="text-lg text-muted-foreground">Start here — Choose how you want to create your plan</p>
            </div>

            <div className="space-y-4">
              {/* Option 1: Digital Planner */}
              <Card className="border-2 shadow-lg">
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0 shadow-md">
                      <FileText className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-foreground mb-1">Option 1: Digital Planner</h3>
                      <p className="text-sm text-muted-foreground">
                        Fill in your personal details, important documents, preferences, and instructions using the guided digital system.
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3 pl-0 sm:pl-16">
                    <Button 
                      size="lg" 
                      className="flex-1"
                      onClick={handleStartNew}
                    >
                      Open My Planner
                    </Button>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="lg"
                            className="flex-1"
                            onClick={() => setShowPIIDialog(true)}
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Get a Printable Version
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Download a PDF you can print, save, or email.</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <Button 
                      variant="outline" 
                      size="lg"
                      className="flex-1"
                      onClick={() => navigate("/products/binder")}
                    >
                      Purchase Physical Binder
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Option 2: Printable Version */}
              <Card className="border-2 shadow-sm">
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center flex-shrink-0 shadow-md">
                      <FileOutput className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-foreground mb-1">Option 2: Printable Version</h3>
                      <p className="text-sm text-muted-foreground">
                        Get our complete workbook as a downloadable PDF with blank forms you can print and fill out on paper.
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3 pl-0 sm:pl-16">
                    <Button 
                      variant="default" 
                      size="lg"
                      onClick={handleBlankPrePlanningPDF}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download Printable Workbook
                    </Button>
                    <Button 
                      variant="outline" 
                      size="lg"
                      onClick={() => navigate("/products/binder")}
                    >
                      Purchase Physical Binder
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Option 3: Do It for You */}
              <Card className="border-2 border-blue-500/50 shadow-sm bg-gradient-to-r from-blue-50/50 to-cyan-50/50 dark:from-blue-950/20 dark:to-cyan-950/20">
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center flex-shrink-0 shadow-md">
                      <Calendar className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-xl font-bold text-foreground">Option 3: Do It for You (One-Time Service)</h3>
                        <span className="text-xs font-bold bg-blue-500 text-white px-2 py-0.5 rounded-full">POPULAR</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        A planning specialist helps you complete every section of your planner in a guided live session.
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3 pl-0 sm:pl-16">
                    <Button 
                      size="lg"
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                      onClick={() => navigate("/contact")}
                    >
                      Book Appointment
                    </Button>
                    <Button 
                      variant="outline" 
                      size="lg"
                      onClick={() => navigate("/products/binder")}
                    >
                      Purchase Physical Binder
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* STEP 2 — VIP Coach Assistant */}
          <section className="border-t pt-10">
            <div className="text-center mb-6">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2 flex items-center justify-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg shadow-md">2</div>
                VIP Coach Assistant
              </h2>
              <p className="text-lg text-muted-foreground">Get personalized access to expert guidance and support throughout your planning journey.</p>
            </div>

            <Card className="border-2 border-yellow-500/50 shadow-lg bg-gradient-to-r from-yellow-50/50 to-amber-50/50 dark:from-yellow-950/20 dark:to-amber-950/20">
              <CardContent className="p-6">
                <div className="flex items-start gap-6 flex-col md:flex-row">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-500 to-amber-600 flex items-center justify-center shadow-md">
                        <Star className="h-6 w-6 text-white" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-foreground mb-2">VIP Coach Assistant (Optional)</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Unlimited access to expert guidance and personalized support throughout your planning journey.
                      </p>
                      <div className="space-y-2">
                        <div className="flex items-start gap-2">
                          <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                          <p className="text-sm text-foreground">Unlimited planning sessions via video, phone, or chat</p>
                        </div>
                        <div className="flex items-start gap-2">
                          <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                          <p className="text-sm text-foreground">Expert review of your completed plan</p>
                        </div>
                        <div className="flex items-start gap-2">
                          <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                          <p className="text-sm text-foreground">Priority support and faster response times</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    <Button 
                      className="bg-yellow-600 hover:bg-yellow-700 text-white"
                      size="lg"
                      onClick={() => navigate("/vip-coach")}
                    >
                      Upgrade to VIP
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>


          {/* STEP 3 — Shop Caskets & Urns */}
          <section className="border-t pt-10">
            <div className="text-center mb-6">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2 flex items-center justify-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg shadow-md">3</div>
                Shop
              </h2>
              <p className="text-lg text-muted-foreground">Browse and order quality memorial products.</p>
            </div>

            <Card className="border-2 border-blue-500 shadow-lg bg-gradient-to-br from-blue-50/30 to-indigo-50/30 dark:from-blue-950/20 dark:to-indigo-950/20 relative">
              <div className="absolute top-4 right-4">
                <span className="text-xs font-bold bg-red-500 text-white px-3 py-1 rounded-full shadow-md">High Demand</span>
              </div>
              <CardContent className="p-6">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0 shadow-md">
                    <Store className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-foreground">Shop Caskets & Urns</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Browse and order quality memorial products. Coming soon!
                    </p>
                  </div>
                </div>
                <Button 
                  variant="default"
                  size="lg"
                  onClick={() => navigate("/products")}
                >
                  Browse Products
                </Button>
              </CardContent>
            </Card>
          </section>

          {/* STEP 4 — Custom Memorial Song */}
          <section className="border-t pt-10">
            <div className="text-center mb-6">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2 flex items-center justify-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg shadow-md">4</div>
                Custom Memorial Song
              </h2>
              <p className="text-lg text-muted-foreground">Create a personalized memorial song that tells your story.</p>
            </div>

            <Card className="border-2 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center flex-shrink-0 shadow-md">
                    <Music className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-foreground">Custom Memorial Song (1–2 Day Delivery)</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Create a personalized memorial song (1–2 day delivery) based on your life story and preferences.
                    </p>
                  </div>
                </div>
                <Button 
                  variant="default"
                  size="lg"
                  onClick={() => navigate("/products/custom-song")}
                >
                  <Music className="mr-2 h-4 w-4" />
                  Create Song
                </Button>
              </CardContent>
            </Card>
          </section>

          {/* STEP 5 — After-Death Planner */}
          <section className="border-t pt-10">
            <div className="text-center mb-6">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2 flex items-center justify-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg shadow-md">5</div>
                After-Death Planner
              </h2>
              <p className="text-lg text-muted-foreground">A guided checklist your loved ones can follow after a passing.</p>
            </div>

            <Card className="border-2 shadow-sm">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0 shadow-md">
                    <CheckCircle className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-foreground mb-1">After-Death Planner</h3>
                    <p className="text-sm text-muted-foreground">
                      A guided checklist your loved ones can follow after a passing.
                    </p>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 pl-0 sm:pl-16">
                  <Button 
                    variant="default" 
                    size="lg"
                    className="flex-1"
                    onClick={() => navigate("/next-steps")}
                  >
                    Open After-Death Planner
                  </Button>
                  <Button 
                    variant="outline" 
                    size="lg"
                    className="flex-1"
                    onClick={handleAfterDeathPDF}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Get a Printable Document
                  </Button>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Help & Support */}
          <section className="border-t pt-10">
            <div className="text-center mb-6">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
                Help & Support
              </h2>
              <p className="text-muted-foreground">
                Additional resources to guide you through the process.
              </p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {helpSupportCards.map((card) => (
                <Card key={card.href} className="group hover:shadow-lg transition-all duration-200 border-2 hover:border-primary/50">
                  <Link to={card.href}>
                    <CardContent className="p-6 text-center space-y-4">
                      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-teal-500 to-green-600 mx-auto flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                        <card.icon className="h-7 w-7 text-white" />
                      </div>
                      <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">{card.title}</h3>
                    </CardContent>
                  </Link>
                </Card>
              ))}
            </div>
          </section>
        </div>
      </div>

      <PIICollectionDialog
        open={showPIIDialog}
        onOpenChange={setShowPIIDialog}
        onSubmit={handlePIISubmit}
      />
    </>
  );
}

