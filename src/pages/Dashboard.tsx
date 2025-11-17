import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import { 
  FileText, 
  CheckCircle, 
  Users, 
  FileOutput, 
  Star, 
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
  Store,
  ChevronRight
} from "lucide-react";
import { GlobalHeader } from "@/components/GlobalHeader";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import mascotCouple from "@/assets/mascot-couple.png";

export default function Dashboard() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState<string>("");
  const [progress, setProgress] = useState(0);

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

  // Planning Tools
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
      title: t("dashboard.tiles.blankForms.title"),
      icon: FileOutput,
      href: "/forms",
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
        <div className="mx-auto max-w-6xl px-4 py-8 space-y-10">
          
          {/* ========== HERO ZONE ========== */}
          <Card className="border-2">
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

                  {/* Progress Bar */}
                  <div className="bg-muted/30 rounded-lg p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xl font-bold text-primary">{progress}%</span>
                      <span className="text-sm font-medium text-muted-foreground">{t("common.complete")}</span>
                    </div>
                    <Progress value={progress} className="h-3" />
                  </div>

                  {/* Primary Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3 pt-2">
                    <Button 
                      onClick={handleContinue}
                      size="lg"
                      className="flex-1 gap-2 h-14 text-base font-semibold"
                    >
                      <Play className="h-5 w-5" />
                      {t("dashboard.continueButton")}
                    </Button>
                    <Button 
                      onClick={handleStartNew}
                      variant="outline"
                      size="lg"
                      className="sm:w-auto gap-2 h-14 text-base font-medium"
                    >
                      <PlusCircle className="h-5 w-5" />
                      {t("dashboard.startNewButton")}
                    </Button>
                  </div>

                  <p className="text-xs text-muted-foreground text-center pt-1">
                    {t("dashboard.autoSaveNote", "Your entries are saved automatically as you type.")}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* ========== SUPPORT ZONE ========== */}
          <div className="space-y-8">
            
            {/* A. Planning Tools */}
            <section>
              <h2 className="text-xl font-semibold text-foreground mb-4">
                {t("dashboard.planningToolsTitle", "Planning Tools")}
              </h2>
              <div className="space-y-2">
                {planningTools.map((tool) => {
                  const Icon = tool.icon;
                  return (
                    <Link
                      key={tool.href}
                      to={tool.href}
                      className="flex items-center gap-4 p-4 rounded-lg border bg-card hover:bg-accent/50 hover:border-primary/50 transition-all group"
                    >
                      <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                        <Icon className="h-5 w-5" />
                      </div>
                      <span className="flex-1 text-base font-medium text-foreground/90 group-hover:text-primary">
                        {tool.title}
                      </span>
                      <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary" />
                    </Link>
                  );
                })}
              </div>
            </section>

            {/* B. Resources & Vendors */}
            <section>
              <h2 className="text-xl font-semibold text-foreground mb-4">
                {t("dashboard.resourcesTitle", "Resources & Vendors")}
              </h2>
              <div className="space-y-2">
                {resourcesVendors.map((resource) => {
                  const Icon = resource.icon;
                  return (
                    <Link
                      key={resource.href}
                      to={resource.href}
                      className="flex items-center gap-4 p-4 rounded-lg border bg-card hover:bg-accent/50 hover:border-primary/50 transition-all group"
                    >
                      <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                        <Icon className="h-5 w-5" />
                      </div>
                      <span className="flex-1 text-base font-medium text-foreground/90 group-hover:text-primary">
                        {resource.title}
                      </span>
                      <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary" />
                    </Link>
                  );
                })}
              </div>
            </section>

            {/* C. Assistance & Support */}
            <section>
              <h2 className="text-xl font-semibold text-foreground mb-4">
                {t("dashboard.assistanceTitle", "Need Support?")}
              </h2>
              <div className="space-y-2">
                {assistanceSupport.map((support) => {
                  const Icon = support.icon;
                  const isVIP = support.isVIP;
                  return (
                    <Link
                      key={support.href}
                      to={support.href}
                      className={cn(
                        "flex items-center gap-4 p-4 rounded-lg border transition-all group",
                        isVIP
                          ? "bg-gradient-to-r from-yellow-50/50 to-amber-50/50 dark:from-yellow-950/20 dark:to-amber-950/20 border-yellow-500/50 hover:border-yellow-500"
                          : "bg-card hover:bg-accent/50 hover:border-primary/50"
                      )}
                    >
                      <div className={cn(
                        "flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center",
                        isVIP 
                          ? "bg-yellow-500/20 text-yellow-600 dark:text-yellow-400" 
                          : "bg-primary/10 text-primary"
                      )}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <span className={cn(
                        "flex-1 text-base font-medium",
                        isVIP 
                          ? "text-yellow-900 dark:text-yellow-100 group-hover:text-yellow-700 dark:group-hover:text-yellow-300" 
                          : "text-foreground group-hover:text-primary"
                      )}>
                        {support.title}
                        {isVIP && <span className="ml-2 text-xs font-bold bg-yellow-500 text-white px-2 py-0.5 rounded-full">PREMIUM</span>}
                      </span>
                      <ChevronRight className={cn(
                        "h-5 w-5",
                        isVIP 
                          ? "text-yellow-600 dark:text-yellow-400" 
                          : "text-muted-foreground group-hover:text-primary"
                      )} />
                    </Link>
                  );
                })}
              </div>
            </section>
          </div>

          {/* ========== OPTIONAL ZONE: Step by Step Sections ========== */}
          <section className="border-t pt-6 pb-24">
            <h3 className="text-base font-semibold text-foreground mb-3">
              {t("dashboard.stepByStepTitle", "Step by Step Sections")}
            </h3>
            <div className="space-y-2">
              <button
                onClick={() => navigate("/wizard/preplanning")}
                className="w-full text-left p-4 rounded-lg border bg-card hover:bg-accent/30 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">📋</span>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">
                      {t("wizard.preplanning.title", "Start Pre-Planning Step-by-Step Guide")}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {t("wizard.preplanning.description", "Complete your final wishes one section at a time with guided steps")}
                    </p>
                  </div>
                </div>
              </button>
              
              <button
                onClick={() => navigate("/wizard/afterdeath")}
                className="w-full text-left p-4 rounded-lg border bg-card hover:bg-accent/30 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">🤝</span>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">
                      {t("wizard.afterdeath.title", "Start After-Death Step-by-Step Guide")}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {t("wizard.afterdeath.description", "Complete essential tasks after a death with our guided 12-step checklist")}
                    </p>
                  </div>
                </div>
              </button>
            </div>
          </section>

        </div>
      </div>
    </>
  );
}
