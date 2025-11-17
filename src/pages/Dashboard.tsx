import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
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
  Scale
} from "lucide-react";
import { GlobalHeader } from "@/components/GlobalHeader";
import { WelcomePanel } from "@/components/dashboard/WelcomePanel";
import { ProgressOverview } from "@/components/dashboard/ProgressOverview";
import { QuickAccessBar } from "@/components/dashboard/QuickAccessBar";

export default function Dashboard() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const tiles = [
    {
      key: "pre-planning",
      title: t("dashboard.tiles.prePlanning.title"),
      description: t("dashboard.tiles.prePlanning.description"),
      icon: FileText,
      href: "/app",
    },
    {
      key: "after-death",
      title: t("dashboard.tiles.afterDeath.title"),
      description: t("dashboard.tiles.afterDeath.description"),
      icon: CheckCircle,
      href: "/next-steps",
    },
    {
      key: "vendors",
      title: t("dashboard.tiles.vendors.title"),
      description: t("dashboard.tiles.vendors.description"),
      icon: Users,
      href: "/vendors",
    },
    {
      key: "blank-forms",
      title: t("dashboard.tiles.blankForms.title"),
      description: t("dashboard.tiles.blankForms.description"),
      icon: FileOutput,
      href: "/forms",
    },
    {
      key: "vip-coach",
      title: t("dashboard.tiles.vipCoach.title"),
      description: t("dashboard.tiles.vipCoach.description"),
      icon: Star,
      href: "/vip-coach",
    },
    {
      key: "quote",
      title: t("dashboard.tiles.quote.title"),
      description: t("dashboard.tiles.quote.description"),
      icon: MessageCircle,
      href: "/contact",
    },
    {
      key: "trusted-contacts",
      title: t("dashboard.tiles.trustedContacts.title"),
      description: t("dashboard.tiles.trustedContacts.description"),
      icon: UserPlus,
      href: "/app",
    },
    {
      key: "resources",
      title: t("dashboard.tiles.resources.title"),
      description: t("dashboard.tiles.resources.description"),
      icon: BookOpen,
      href: "/resources",
    },
    {
      key: "questions",
      title: t("dashboard.tiles.questions.title"),
      description: t("dashboard.tiles.questions.description"),
      icon: HelpCircle,
      href: "/faq",
    },
    {
      key: "legal-documents",
      title: t("dashboard.tiles.legalDocuments.title"),
      description: t("dashboard.tiles.legalDocuments.description"),
      icon: Scale,
      href: "/legal-documents",
    },
  ];

  return (
    <>
      <GlobalHeader />
      <div className="min-h-screen bg-background">
        <div className="mx-auto max-w-7xl px-4 py-8 space-y-8">
          {/* Welcome Panel */}
      <WelcomePanel />
      
      {/* Step-by-Step Wizard Buttons */}
      <div className="grid md:grid-cols-2 gap-4">
        <button
          onClick={() => navigate("/wizard/preplanning")}
          className="p-6 bg-card border rounded-lg hover:border-primary transition-colors text-left space-y-2"
        >
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <span className="text-2xl">📋</span>
            {t("wizard.preplanning.title", "Start Pre-Planning Step-by-Step Guide")}
          </h3>
          <p className="text-sm text-muted-foreground">
            {t("wizard.preplanning.description", "Complete your final wishes one section at a time with guided steps")}
          </p>
        </button>
        
        <button
          onClick={() => navigate("/wizard/afterdeath")}
          className="p-6 bg-card border border-orange-200 dark:border-orange-900 rounded-lg hover:border-orange-400 transition-colors text-left space-y-2"
        >
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <span className="text-2xl">🤝</span>
            {t("wizard.afterdeath.title", "Start After-Death Step-by-Step Guide")}
          </h3>
          <p className="text-sm text-muted-foreground">
            {t("wizard.afterdeath.description", "Complete essential tasks after a death with our guided 12-step checklist")}
          </p>
        </button>
      </div>

          {/* Progress and Quick Access Row */}
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-1">
              <ProgressOverview />
            </div>
            <div className="lg:col-span-2">
              <QuickAccessBar />
            </div>
          </div>

          {/* Main Action Tiles */}
          <section aria-label="Main actions">
            <h2 className="text-2xl font-bold mb-6 text-foreground">{t("dashboard.mainActionsTitle")}</h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {tiles.map((tile) => {
                const Icon = tile.icon;
                return (
                  <Link
                    key={tile.key}
                    to={tile.href}
                    className="group flex h-full flex-col rounded-xl border-2 border-border bg-card p-6 text-left shadow-sm transition-all hover:shadow-md hover:border-primary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  >
                    <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="mb-2 text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                      {tile.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed flex-1">
                      {tile.description}
                    </p>
                    <span className="mt-4 inline-flex items-center text-sm font-medium text-primary group-hover:underline">
                      Open
                      <span className="ml-1" aria-hidden="true">→</span>
                    </span>
                  </Link>
                );
              })}
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
