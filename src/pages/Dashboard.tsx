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

  // Planning Tools (excluding Blank Forms - now integrated into action panels)
  const planningTools = [
    {
      title: t("dashboard.tiles.prePlanning.title"),
      icon: FileText,
      href: "/app",
    },
    {
      title: "After-Death Planner",
      icon: CheckCircle,
      href: "/next-steps",
    },
    {
      title: t("dashboard.tiles.trustedContacts.title"),
      icon: UserPlus,
      href: "/app",
    },
  ];

  // Resources & Vendors
  const resourcesVendors = [
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
      icon: Store,
      href: "/vendors",
    },
  ];

  // Assistance & Support
  const assistanceSupport = [
    {
      title: t("dashboard.tiles.vipCoach.title"),
      icon: Star,
      href: "/vip-coach",
      isVIP: true,
    },
    {
      title: t("dashboard.tiles.quote.title"),
      icon: MessageCircle,
      href: "/contact",
    },
    {
      title: t("header.contact"),
      icon: Phone,
      href: "/contact",
    },
    {
      title: "About Us",
      icon: Info,
      href: "/about-us",
    },
  ];

  return (
    <>
      <GlobalHeader />
      <div className="min-h-screen bg-background">
        <div className="mx-auto max-w-6xl px-4 py-8 space-y-12">
          
          {/* ▬▬ BLOCK 1: WELCOME + PROGRESS + CONTINUE ▬▬ */}
          <section>
            <Card className="border-2 shadow-sm">
              <CardContent className="pt-6">
                <div className="space-y-6">
                  {/* Mascot and Slogan */}
                  <div className="flex flex-col sm:flex-row items-center gap-4 pb-6 border-b">
                    <img 
                      src={mascotCouple} 
                      alt="Everlasting Advisors" 
                      className="w-24 h-24 object-contain flex-shrink-0"
                    />
                    <div className="flex-1 text-center sm:text-left">
                      <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
                        {t("dashboard.slogan")}
                      </h1>
                      <p className="text-base text-muted-foreground">
                        {t("dashboard.heroMessage")}
                      </p>
                    </div>
                  </div>

                  {/* Welcome and Progress */}
                  <div className="space-y-4">
                    <div>
                      <h2 className="text-2xl font-bold text-foreground mb-1">
                        {firstName ? t("dashboard.welcome", { name: firstName }) : t("dashboard.welcomeGeneric")}
                      </h2>
                      <p className="text-base text-muted-foreground">
                        {t("dashboard.subtitle")}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* ▬▬ BLOCK 2: PRE-PLANNING ▬▬ */}
          <section className="border-t pt-10">
            <div className="mb-6">
              <h2 className="text-3xl font-bold text-foreground">Pre-Planning</h2>
              <p className="text-base text-muted-foreground mt-2">Organize your wishes and prepare your plan</p>
            </div>
            
            <Card className="border-2 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-start gap-6">
                  {/* Left: Title and Description */}
                  <div className="flex items-start gap-4 flex-[2]">
                    <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                      <FileText className="h-6 w-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-foreground mb-2">
                        {t("dashboard.tiles.prePlanning.title")}
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {t("dashboard.tiles.prePlanning.description")}
                      </p>
                    </div>
                  </div>
                  
                  {/* Right: Actions Panel */}
                  <div className="flex-1 flex flex-col gap-3 min-w-[280px]">
                    {/* Primary Action */}
                    <Button
                      onClick={handleContinue}
                      className="w-full h-11 text-base font-semibold"
                      size="lg"
                    >
                      <Play className="mr-2 h-4 w-4" />
                      {t("dashboard.continueButton")}
                    </Button>
                    
                    {/* Secondary Actions - Horizontal Grid */}
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        onClick={handlePrePlanningPDF}
                        variant="outline"
                        className="text-xs h-9"
                        size="sm"
                      >
                        <Download className="mr-1.5 h-3.5 w-3.5" />
                        Generate PDF
                      </Button>
                      
                      <Button
                        onClick={handleBlankPrePlanningPDF}
                        variant="outline"
                        className="text-xs h-9"
                        size="sm"
                      >
                        <FileOutput className="mr-1.5 h-3.5 w-3.5" />
                        Blank
                      </Button>
                    </div>
                    
                    {/* Tertiary Actions */}
                    <div className="flex gap-2 text-xs">
                      <button
                        onClick={() => navigate("/wizard/preplanning")}
                        className="flex-1 text-muted-foreground hover:text-foreground underline decoration-dotted underline-offset-4"
                      >
                        Step-by-Step Guide
                      </button>
                      <span className="text-muted-foreground">•</span>
                      <Link
                        to="/products/binder"
                        className="flex-1 text-muted-foreground hover:text-foreground underline decoration-dotted underline-offset-4"
                      >
                        Order Binder
                      </Link>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* ▬▬ BLOCK 3: AFTER-DEATH PLANNER ▬▬ */}
          <section className="border-t pt-10">
            <div className="mb-6">
              <h2 className="text-3xl font-bold text-foreground">After-Death Planner</h2>
              <p className="text-base text-muted-foreground mt-2">Guide loved ones with a step-by-step checklist</p>
            </div>
            
            <Card className="border-2 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-start gap-6">
                  {/* Left: Title and Description */}
                  <div className="flex items-start gap-4 flex-[2]">
                    <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                      <CheckCircle className="h-6 w-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-foreground mb-2">
                        {t("dashboard.tiles.afterDeath.title")}
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {t("dashboard.tiles.afterDeath.description")}
                      </p>
                    </div>
                  </div>
                  
                  {/* Right: Actions Panel */}
                  <div className="flex-1 flex flex-col gap-3 min-w-[280px]">
                    {/* Primary Action */}
                    <Button
                      onClick={() => navigate("/next-steps")}
                      className="w-full h-11 text-base font-semibold"
                      size="lg"
                    >
                      <Play className="mr-2 h-4 w-4" />
                      {t("dashboard.continueButton")}
                    </Button>
                    
                    {/* Secondary Actions - Horizontal Grid */}
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        onClick={handleAfterDeathPDF}
                        variant="outline"
                        className="text-xs h-9"
                        size="sm"
                      >
                        <Download className="mr-1.5 h-3.5 w-3.5" />
                        Generate PDF
                      </Button>
                      
                      <Button
                        onClick={handleBlankAfterDeathPDF}
                        variant="outline"
                        className="text-xs h-9"
                        size="sm"
                      >
                        <FileOutput className="mr-1.5 h-3.5 w-3.5" />
                        Blank
                      </Button>
                    </div>
                    
                    {/* Tertiary Actions */}
                    <div className="flex gap-2 text-xs justify-center">
                      <button
                        onClick={() => navigate("/wizard/afterdeath")}
                        className="text-muted-foreground hover:text-foreground underline decoration-dotted underline-offset-4"
                      >
                        Step-by-Step Guide
                      </button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* ▬▬ BLOCK 4: MY PLAN & BILLING ▬▬ */}
          <section className="border-t pt-10">
            <div className="mb-6">
              <h2 className="text-3xl font-bold text-foreground">My Plan & Billing</h2>
              <p className="text-base text-muted-foreground mt-2">Manage your subscription and billing settings</p>
            </div>
            <Card className="border-2 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Receipt className="h-6 w-6 text-primary" />
                      </div>
                      <h3 className="text-xl font-semibold">View Plans & Billing</h3>
                    </div>
                    <p className="text-muted-foreground">
                      View your current subscription, manage billing, and explore upgrade options
                    </p>
                  </div>
                  <Button onClick={() => navigate("/plans")} size="lg">
                    Manage Plan
                  </Button>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* ▬▬ BLOCK 5: PRODUCTS & ORDERS ▬▬ */}
          <section className="border-t pt-10">
            <div className="mb-6">
              <h2 className="text-3xl font-bold text-foreground">Products & Orders</h2>
              <p className="text-base text-muted-foreground mt-2">Browse and order physical products and services</p>
            </div>
            <div className="space-y-3">
              <Card className="border-2 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 rounded-lg bg-muted">
                          <BookOpen className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <h3 className="text-xl font-semibold">Binder & Printed Planner Materials</h3>
                      </div>
                      <p className="text-muted-foreground">
                        Order a physical binder to store your planner and documents
                      </p>
                    </div>
                    <Button onClick={() => navigate("/products/binder")} variant="outline" size="lg">
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-2 shadow-sm hover:shadow-md transition-shadow border-primary/30">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <Music className="h-6 w-6 text-primary" />
                        </div>
                        <h3 className="text-xl font-semibold">Custom Tribute Song</h3>
                      </div>
                      <p className="text-muted-foreground">
                        Create a personalized musical memorial (1-2 day delivery)
                      </p>
                    </div>
                    <Button onClick={() => navigate("/products/custom-song")} size="lg">
                      Create Song
                    </Button>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-2 border-dashed shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 rounded-lg bg-muted">
                          <Store className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <h3 className="text-xl font-semibold">Shop Caskets & Urns</h3>
                      </div>
                      <p className="text-muted-foreground">
                        Browse and order quality memorial products (Coming soon)
                      </p>
                    </div>
                    <Button onClick={() => navigate("/products")} variant="outline" size="lg" disabled>
                      Coming Soon
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* ▬▬ BLOCK 6: HELP & SUPPORT ▬▬ */}
          <section className="border-t pt-10 pb-24">
            <div className="mb-6">
              <h2 className="text-3xl font-bold text-foreground">Help & Support</h2>
              <p className="text-base text-muted-foreground mt-2">Resources, guidance, and assistance when you need it</p>
            </div>
            <div className="grid gap-2">
              {/* VIP Coach */}
              <Link
                to="/vip-coach"
                className="flex items-center gap-4 p-4 rounded-lg border transition-all group bg-gradient-to-r from-yellow-50/50 to-amber-50/50 dark:from-yellow-950/20 dark:to-amber-950/20 border-yellow-500/50 hover:border-yellow-500 shadow-sm"
              >
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 flex items-center justify-center">
                  <Star className="h-5 w-5" />
                </div>
                <span className="flex-1 text-base font-medium text-yellow-900 dark:text-yellow-100 group-hover:text-yellow-700 dark:group-hover:text-yellow-300">
                  {t("dashboard.tiles.vipCoach.title")}
                  <span className="ml-2 text-xs font-bold bg-yellow-500 text-white px-2 py-0.5 rounded-full">PREMIUM</span>
                </span>
                <ChevronRight className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
              </Link>

              {/* Other Help Items */}
              <Link to="/resources" className="flex items-center gap-4 p-4 rounded-lg border bg-card hover:bg-accent/50 hover:border-primary/50 transition-all group">
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                  <BookOpen className="h-5 w-5" />
                </div>
                <span className="flex-1 text-base font-medium text-foreground group-hover:text-primary">
                  {t("dashboard.tiles.resources.title")}
                </span>
                <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary" />
              </Link>

              <Link to="/legal-documents" className="flex items-center gap-4 p-4 rounded-lg border bg-card hover:bg-accent/50 hover:border-primary/50 transition-all group">
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                  <Scale className="h-5 w-5" />
                </div>
                <span className="flex-1 text-base font-medium text-foreground group-hover:text-primary">
                  {t("dashboard.tiles.legalDocuments.title")}
                </span>
                <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary" />
              </Link>

              <Link to="/faq" className="flex items-center gap-4 p-4 rounded-lg border bg-card hover:bg-accent/50 hover:border-primary/50 transition-all group">
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                  <HelpCircle className="h-5 w-5" />
                </div>
                <span className="flex-1 text-base font-medium text-foreground group-hover:text-primary">
                  {t("dashboard.tiles.questions.title")}
                </span>
                <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary" />
              </Link>

              <Link to="/vendors" className="flex items-center gap-4 p-4 rounded-lg border bg-card hover:bg-accent/50 hover:border-primary/50 transition-all group">
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                  <Store className="h-5 w-5" />
                </div>
                <span className="flex-1 text-base font-medium text-foreground group-hover:text-primary">
                  {t("dashboard.tiles.vendors.title")}
                </span>
                <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary" />
              </Link>

              <Link to="/contact" className="flex items-center gap-4 p-4 rounded-lg border bg-card hover:bg-accent/50 hover:border-primary/50 transition-all group">
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                  <MessageCircle className="h-5 w-5" />
                </div>
                <span className="flex-1 text-base font-medium text-foreground group-hover:text-primary">
                  {t("dashboard.tiles.quote.title")}
                </span>
                <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary" />
              </Link>

              <Link to="/about-us" className="flex items-center gap-4 p-4 rounded-lg border bg-card hover:bg-accent/50 hover:border-primary/50 transition-all group">
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                  <Info className="h-5 w-5" />
                </div>
                <span className="flex-1 text-base font-medium text-foreground group-hover:text-primary">
                  About Us
                </span>
                <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary" />
              </Link>
            </div>
          </section>

        </div>
      </div>

      {/* PII Collection Dialog for Pre-Planning PDF */}
      <PIICollectionDialog
        open={showPIIDialog}
        onOpenChange={setShowPIIDialog}
        onSubmit={handlePIISubmit}
      />
    </>
  );
}
