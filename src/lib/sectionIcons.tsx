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
