import {
  ClipboardList,
  FileText,
  User,
  BookHeart,
  Users,
  Building,
  Church,
  DollarSign,
  Shield,
  Home,
  PawPrint,
  Globe,
  FolderLock,
  Heart,
  Settings,
  Scale,
  BookOpen,
  HelpCircle,
  type LucideIcon,
} from "lucide-react";

// Color gradients for each section
export const SECTION_COLORS: Record<string, string> = {
  overview: "from-blue-500 to-blue-600",
  instructions: "from-purple-500 to-purple-600",
  personal: "from-green-500 to-green-600",
  legacy: "from-pink-500 to-pink-600",
  contacts: "from-orange-500 to-orange-600",
  providers: "from-teal-500 to-teal-600",
  funeral: "from-indigo-500 to-indigo-600",
  financial: "from-emerald-500 to-emerald-600",
  insurance: "from-cyan-500 to-cyan-600",
  property: "from-amber-500 to-amber-600",
  pets: "from-rose-500 to-rose-600",
  digital: "from-sky-500 to-sky-600",
  legal: "from-violet-500 to-violet-600",
  messages: "from-red-500 to-red-600",
  preferences: "from-slate-500 to-slate-600",
  legalresources: "from-purple-500 to-purple-600",
  resources: "from-blue-500 to-blue-600",
  faq: "from-green-500 to-green-600",
};

export const SECTION_ICONS: Record<string, LucideIcon> = {
  overview: ClipboardList,
  instructions: FileText,
  personal: User,
  legacy: BookHeart,
  contacts: Users,
  providers: Building,
  funeral: Church,
  financial: DollarSign,
  insurance: Shield,
  property: Home,
  pets: PawPrint,
  digital: Globe,
  legal: FolderLock,
  messages: Heart,
  preferences: Settings,
  legalresources: Scale,
  resources: BookOpen,
  faq: HelpCircle,
};

export function getSectionIcon(sectionId: string): LucideIcon {
  return SECTION_ICONS[sectionId] || FileText;
}

export function getSectionColor(sectionId: string): string {
  return SECTION_COLORS[sectionId] || "from-gray-500 to-gray-600";
}
