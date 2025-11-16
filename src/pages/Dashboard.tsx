import { Link } from "react-router-dom";
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

const tiles = [
  {
    key: "pre-planning",
    title: "Pre-Planning",
    description: "Fill in your wishes, personal details, and instructions.",
    icon: FileText,
    href: "/app",
  },
  {
    key: "after-death",
    title: "After-Death Steps",
    description: "A simple checklist for what to do after a death.",
    icon: CheckCircle,
    href: "/next-steps",
  },
  {
    key: "vendors",
    title: "Helpful Contacts & Vendors",
    description: "Find helpful professionals and services by category and state.",
    icon: Users,
    href: "/vendors",
  },
  {
    key: "blank-forms",
    title: "Blank / Fillable Forms",
    description: "Download or print blank forms and worksheets.",
    icon: FileOutput,
    href: "/forms",
  },
  {
    key: "vip-coach",
    title: "VIP Coach Assistant",
    description: "Request one-on-one guidance from our team.",
    icon: Star,
    href: "/vip-coach",
  },
  {
    key: "quote",
    title: "Request a Quote",
    description: "Ask for pricing on products and services.",
    icon: MessageCircle,
    href: "/contact",
  },
  {
    key: "trusted-contacts",
    title: "Trusted Contacts",
    description: "List the people who should receive your planner and updates.",
    icon: UserPlus,
    href: "/app",
  },
  {
    key: "resources",
    title: "Helpful Resources",
    description: "Articles, guides, and links to learn more.",
    icon: BookOpen,
    href: "/resources",
  },
  {
    key: "questions",
    title: "Common Questions",
    description: "Short answers to the questions we hear most.",
    icon: HelpCircle,
    href: "/faq",
  },
  {
    key: "legal-documents",
    title: "Legal Documents & Resources",
    description: "Essential legal forms, guides, and state-specific information.",
    icon: Scale,
    href: "/legal-documents",
  },
];

export default function Dashboard() {
  return (
    <>
      <GlobalHeader />
      <div className="min-h-screen bg-background">
        <div className="mx-auto max-w-7xl px-4 py-8 space-y-8">
          {/* Welcome Panel */}
          <WelcomePanel />

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
            <h2 className="text-2xl font-bold mb-6 text-foreground">What would you like to do?</h2>
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
