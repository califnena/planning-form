import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import { 
  FileText, 
  CheckCircle, 
  Users, 
  FileOutput, 
  Star,
  Receipt,
  Store,
  MessageCircle, 
  UserPlus, 
  BookOpen, 
  HelpCircle,
  Scale,
  Play,
  PlusCircle,
  Info,
  Phone,
  Mail,
  ChevronRight,
  Download,
  Music
} from "lucide-react";
import { GlobalHeader } from "@/components/GlobalHeader";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { PIICollectionDialog } from "@/components/planner/PIICollectionDialog";
import { generatePlanPDF } from "@/lib/pdfGenerator";
import { generateManuallyFillablePDF } from "@/lib/manuallyFillablePdfGenerator";
import { generateBlankAfterLifePlanPDF } from "@/lib/blankAfterLifePlanPdfGenerator";
import mascotCouple from "@/assets/mascot-couple.png";

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

  const handleContinue = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Check if user has preferences set
    const { data: settings } = await supabase
      .from("user_settings")
      .select("selected_sections")
      .eq("user_id", user.id)
      .maybeSingle();

    const selectedSections = settings?.selected_sections || [];

    // If no preferences, redirect to preferences page
    if (selectedSections.length === 0) {
      navigate("/preferences");
      return;
    }

    // Check last visited section from localStorage
    const lastSection = localStorage.getItem("efa-last-section");
    if (lastSection) {
      navigate(lastSection);
    } else {
      // Navigate to first active section in their preferences
      const sectionRouteMap: Record<string, string> = {
        'instructions': '/my-instructions',
        'personal': '/personal-details',
        'legacy': '/about-me',
        'contacts': '/contacts-notify',
        'providers': '/vendors',
        'checklist': '/checklist',
        'funeral': '/funeral-wishes',
        'financial': '/financial-life',
        'insurance': '/insurance-benefits',
        'property': '/property-valuables',
        'pets': '/pet-care',
        'digital': '/digital-accounts',
        'legal': '/legal-documents',
        'messages': '/personal-messages'
      };

      const firstSection = selectedSections[0];
      const route = sectionRouteMap[firstSection] || "/app";
      navigate(route);
    }
  };

  const handleStartNew = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/app");
      return;
    }

    // Check if user has preferences
    const { data: settings } = await supabase
      .from("user_settings")
      .select("selected_sections")
      .eq("user_id", user.id)
      .maybeSingle();

    const selectedSections = settings?.selected_sections || [];

    // If no preferences, redirect to preferences
    if (selectedSections.length === 0) {
      navigate("/preferences");
    } else {
      navigate("/app");
    }
  };

  const handlePrePlanningPDF = () => {
    setShowPIIDialog(true);
  };

  const handleAfterDeathPDF = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Check if user has any cases
      const { data: cases } = await supabase
        .from("cases")
        .select("id, form_data")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1);

      if (!cases || cases.length === 0) {
        toast({
          title: "No After-Death Plan",
          description: "Start an After-Death Plan first to generate a PDF.",
        });
        navigate("/next-steps");
        return;
      }

      // Get the most recent case
      const latestCase = cases[0];
      
      // Get decedent name
      const { data: decedent } = await supabase
        .from("decedents")
        .select("legal_name")
        .eq("case_id", latestCase.id)
        .maybeSingle();

      const decedentName = decedent?.legal_name || "the deceased";
      const formData = (latestCase.form_data || {}) as Record<string, any>;
      
      // Import the PDF generation function dynamically
      const { generateAfterLifePlanPDF } = await import("@/lib/afterLifePlanPdfGenerator");
      await generateAfterLifePlanPDF(formData, decedentName);
      
      toast({
        title: "PDF Downloaded",
        description: "Your After-Death Plan has been generated.",
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
    setPendingPIIData(piiData);
    setShowPIIDialog(false);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get user's org
      const { data: orgMember } = await supabase
        .from("org_members")
        .select("org_id")
        .eq("user_id", user.id)
        .eq("role", "owner")
        .maybeSingle();

      if (!orgMember) return;

      // Get plan data
      const { data: plan } = await supabase
        .from("plans")
        .select("*")
        .eq("org_id", orgMember.org_id)
        .eq("owner_user_id", user.id)
        .maybeSingle();

      if (plan) {
        // Merge PII data into plan data
        const planWithPII = { ...plan, ...piiData };
        const pdf = generatePlanPDF(planWithPII);
        pdf.save(`My-Final-Wishes-${new Date().toISOString().split('T')[0]}.pdf`);
        toast({
          title: "PDF Downloaded",
          description: "Your Pre-Planning document has been generated.",
        });
      }
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

  const handleBlankAfterDeathPDF = async () => {
    try {
      await generateBlankAfterLifePlanPDF();
      toast({
        title: "Blank Form Downloaded",
        description: "Your blank After-Death Plan form is ready to print and fill out.",
      });
    } catch (error) {
      console.error("Error generating blank After-Death PDF:", error);
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
          <div className="text-center space-y-2">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground">
              {firstName ? t("dashboard.welcome", { name: firstName }) : t("dashboard.welcomeGeneric")}
            </h1>
            <p className="text-lg text-muted-foreground">
              {t("dashboard.subtitle")}
            </p>
          </div>

          {/* Accessibility Banner */}
          <div className="bg-muted/50 border border-border rounded-lg p-4 text-center">
            <p className="text-sm text-muted-foreground">
              Need larger text or clearer colors? Open <strong>"Settings"</strong> at the top right to adjust readability.
            </p>
          </div>

          {/* ▬▬ SECTION 1: YOUR TWO PLANNING TOOLS ▬▬ */}
          <section>
            <div className="space-y-4">
              <div className="text-center">
                <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
                  Your Two Planning Tools
                </h2>
                <p className="text-muted-foreground">
                  Each planner serves a different purpose at a different time. Click on either one to get started or continue your work.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Plan Ahead Planner Card */}
                <Card className="border-2 shadow-sm relative">
                  <div className="absolute top-4 right-4">
                    <span className="inline-flex items-center gap-1 text-xs font-semibold bg-primary/10 text-primary px-3 py-1 rounded-full">
                      <Star className="h-3 w-3" />
                      Recommended — Start here
                    </span>
                  </div>
                  <CardContent className="pt-16 pb-6 space-y-4">
                    <div className="flex items-start gap-3">
                      <FileText className="h-8 w-8 text-primary flex-shrink-0" />
                      <div>
                        <h3 className="text-xl font-bold text-foreground">Plan Ahead Planner</h3>
                        <p className="text-sm text-muted-foreground">My Wishes & Information Organizer</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <p className="text-sm">
                        <strong className="text-foreground">Use this NOW to plan ahead.</strong>{" "}
                        Record your funeral preferences, store important documents, and organize all the information that will be needed someday.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <p className="text-sm font-semibold text-foreground">What's Inside:</p>
                      <ul className="space-y-1 text-sm text-muted-foreground">
                        <li className="flex items-start gap-2">
                          <ChevronRight className="h-4 w-4 mt-0.5 flex-shrink-0" />
                          Your funeral and burial preferences
                        </li>
                        <li className="flex items-start gap-2">
                          <ChevronRight className="h-4 w-4 mt-0.5 flex-shrink-0" />
                          Important documents (will, insurance, etc.)
                        </li>
                        <li className="flex items-start gap-2">
                          <ChevronRight className="h-4 w-4 mt-0.5 flex-shrink-0" />
                          Account information and passwords
                        </li>
                        <li className="flex items-start gap-2">
                          <ChevronRight className="h-4 w-4 mt-0.5 flex-shrink-0" />
                          Property and valuables details
                        </li>
                        <li className="flex items-start gap-2">
                          <ChevronRight className="h-4 w-4 mt-0.5 flex-shrink-0" />
                          Personal messages and instructions
                        </li>
                      </ul>
                    </div>

                    <div className="pt-4 space-y-3">
                      <Button 
                        className="w-full" 
                        size="lg"
                        onClick={handleContinue}
                      >
                        Open My Planner
                      </Button>
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={handlePrePlanningPDF}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Get a Printable Document
                      </Button>
                      <Link 
                        to="/wizard/preplanning" 
                        className="flex items-center justify-center gap-2 text-sm text-primary hover:underline pt-2"
                      >
                        Step-by-Step Guide <ChevronRight className="h-4 w-4" />
                      </Link>
                    </div>
                  </CardContent>
                </Card>

                {/* After-Death Planner Card */}
                <Card className="border-2 shadow-sm relative">
                  <div className="absolute top-4 right-4">
                    <span className="inline-flex items-center gap-1 text-xs font-semibold bg-muted text-muted-foreground px-3 py-1 rounded-full">
                      For Loved Ones
                    </span>
                  </div>
                  <CardContent className="pt-16 pb-6 space-y-4">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-8 w-8 text-primary flex-shrink-0" />
                      <div>
                        <h3 className="text-xl font-bold text-foreground">After-Death Planner</h3>
                        <p className="text-sm text-muted-foreground">Step-by-Step Action Guide</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <p className="text-sm">
                        <strong className="text-foreground">Use this AFTER someone passes away.</strong>{" "}
                        A step-by-step checklist that walks you through everything that needs to be done—from immediate tasks to long-term responsibilities.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <p className="text-sm font-semibold text-foreground">What's Inside:</p>
                      <ul className="space-y-1 text-sm text-muted-foreground">
                        <li className="flex items-start gap-2">
                          <ChevronRight className="h-4 w-4 mt-0.5 flex-shrink-0" />
                          First 48 hours: immediate actions
                        </li>
                        <li className="flex items-start gap-2">
                          <ChevronRight className="h-4 w-4 mt-0.5 flex-shrink-0" />
                          Obtaining death certificates
                        </li>
                        <li className="flex items-start gap-2">
                          <ChevronRight className="h-4 w-4 mt-0.5 flex-shrink-0" />
                          Funeral and memorial arrangements
                        </li>
                        <li className="flex items-start gap-2">
                          <ChevronRight className="h-4 w-4 mt-0.5 flex-shrink-0" />
                          Notifying government and companies
                        </li>
                        <li className="flex items-start gap-2">
                          <ChevronRight className="h-4 w-4 mt-0.5 flex-shrink-0" />
                          Managing property and finances
                        </li>
                        <li className="flex items-start gap-2">
                          <ChevronRight className="h-4 w-4 mt-0.5 flex-shrink-0" />
                          Closing accounts and subscriptions
                        </li>
                      </ul>
                    </div>

                    <div className="pt-4 space-y-3">
                      <Button 
                        variant="outline"
                        className="w-full" 
                        size="lg"
                        onClick={() => navigate("/next-steps")}
                      >
                        Open After-Death Planner
                      </Button>
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={handleAfterDeathPDF}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Get a Printable Document
                      </Button>
                      <Link 
                        to="/wizard/afterdeath" 
                        className="flex items-center justify-center gap-2 text-sm text-primary hover:underline pt-2"
                      >
                        Step-by-Step Guide <ChevronRight className="h-4 w-4" />
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </section>

          {/* ▬▬ SECTION 2: HOW TO GET STARTED ▬▬ */}
          <section className="border-t pt-10">
            <div className="space-y-4">
              <div className="text-center">
                <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
                  How to Get Started
                </h2>
                <p className="text-muted-foreground">
                  Choose how you'd like to work on your planning.
                </p>
              </div>

              <Card className="border-2 shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                        <Play className="h-6 w-6" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-foreground mb-2">
                        Step-by-Step Guided Planning
                      </h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Let us walk you through everything in order, one section at a time—perfect if you want guidance on what to do next.
                      </p>
                      <Button onClick={() => navigate("/wizard/preplanning")} size="lg">
                        <Play className="mr-2 h-4 w-4" />
                        Start Guided Tour
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* ▬▬ SECTION 3: PRODUCTS AVAILABLE FOR PURCHASE ▬▬ */}
          <section className="border-t pt-10">
            <div className="space-y-4">
              <div className="text-center">
                <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
                  Products Available for Purchase
                </h2>
                <p className="text-muted-foreground">
                  Optional printed materials and services you can order.
                </p>
              </div>

              {/* VIP Coach Assistant - Highlighted */}
              <Card className="border-2 border-yellow-500/50 shadow-sm bg-gradient-to-r from-yellow-50/50 to-amber-50/50 dark:from-yellow-950/20 dark:to-amber-950/20">
                <CardContent className="p-6">
                  <div className="flex items-start gap-6 flex-col md:flex-row">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 rounded-lg bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 flex items-center justify-center">
                          <Star className="h-6 w-6" />
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-xl font-bold text-foreground">VIP Coach Assistant</h3>
                          <span className="text-xs font-bold bg-yellow-500 text-white px-2 py-0.5 rounded-full">EXCLUSIVE VIP</span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-4">
                          Your personal AI companion for planning and emotional support. Available 24/7 to guide you through every step of your planning journey.
                        </p>
                        <div className="space-y-2">
                          <p className="text-sm font-semibold text-foreground">What You Get:</p>
                          <ul className="space-y-1 text-sm text-muted-foreground">
                            <li className="flex items-start gap-2">
                              <ChevronRight className="h-4 w-4 mt-0.5 flex-shrink-0 text-yellow-600" />
                              <strong>Planning Mode:</strong> Get guided through organizing your funeral wishes, legal documents, and final instructions
                            </li>
                            <li className="flex items-start gap-2">
                              <ChevronRight className="h-4 w-4 mt-0.5 flex-shrink-0 text-yellow-600" />
                              <strong>Companion Mode:</strong> Receive compassionate guidance when dealing with grief, anxiety, or difficult emotions
                            </li>
                            <li className="flex items-start gap-2">
                              <ChevronRight className="h-4 w-4 mt-0.5 flex-shrink-0 text-yellow-600" />
                              <strong>24/7 Availability:</strong> Your coach is always ready to help, anytime you need it
                            </li>
                            <li className="flex items-start gap-2">
                              <ChevronRight className="h-4 w-4 mt-0.5 flex-shrink-0 text-yellow-600" />
                              <strong>Private & Secure:</strong> All conversations are completely encrypted
                            </li>
                          </ul>
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

              {/* Other Products */}
              <div className="grid md:grid-cols-2 gap-4">
                {/* Printable Planning Workbook */}
                <Card className="border-2 shadow-sm">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-3 mb-4">
                      <FileOutput className="h-6 w-6 text-primary flex-shrink-0" />
                      <div>
                        <h3 className="text-lg font-semibold text-foreground">Printable Planning Workbook (Blank)</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          Prefer to write by hand? Get our complete planning workbook as a downloadable PDF format with blank forms you can print and fill out on paper.
                        </p>
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={handleBlankPrePlanningPDF}
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Purchase Workbook
                    </Button>
                  </CardContent>
                </Card>

                {/* Physical Planning Binder */}
                <Card className="border-2 shadow-sm">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-3 mb-4">
                      <BookOpen className="h-6 w-6 text-primary flex-shrink-0" />
                      <div>
                        <h3 className="text-lg font-semibold text-foreground">Physical Planning Binder</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          A professionally printed and bound binder with all your information that you can keep at home.
                        </p>
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => navigate("/products/binder")}
                    >
                      Order Binder
                    </Button>
                  </CardContent>
                </Card>

                {/* Custom Memorial Song */}
                <Card className="border-2 shadow-sm">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-3 mb-4">
                      <Music className="h-6 w-6 text-primary flex-shrink-0" />
                      <div>
                        <h3 className="text-lg font-semibold text-foreground">Custom Memorial Song (1–2 Day Delivery)</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          Create a personalized musical tribute (professionally produced, 1–2 day delivery).
                        </p>
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => navigate("/products/custom-song")}
                    >
                      <Music className="mr-2 h-4 w-4" />
                      Create Song
                    </Button>
                  </CardContent>
                </Card>

                {/* Shop Caskets & Urns */}
                <Card className="border-2 border-dashed shadow-sm">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-3 mb-4">
                      <Store className="h-6 w-6 text-muted-foreground flex-shrink-0" />
                      <div>
                        <h3 className="text-lg font-semibold text-foreground">Shop Caskets & Urns</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          Browse and order quality memorial products <strong>(Coming soon)</strong>
                        </p>
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      className="w-full" 
                      disabled
                    >
                      Coming Soon
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </section>

          {/* ▬▬ SECTION 4: HELP & SUPPORT ▬▬ */}
          <section className="border-t pt-10 pb-24">
            <div className="space-y-4">
              <div className="text-center">
                <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
                  Help & Support
                </h2>
                <p className="text-muted-foreground">
                  We're here if you have questions or need assistance.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                {helpSupportCards.map((item, index) => (
                  <Link
                    key={index}
                    to={item.href}
                    className="flex items-center gap-4 p-6 rounded-lg border-2 bg-card hover:bg-accent/50 hover:border-primary/50 transition-all group"
                  >
                    <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                      <item.icon className="h-6 w-6" />
                    </div>
                    <span className="flex-1 text-base font-semibold text-foreground group-hover:text-primary">
                      {item.title}
                    </span>
                    <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary" />
                  </Link>
                ))}
              </div>
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
