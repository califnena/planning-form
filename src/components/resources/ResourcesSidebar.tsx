import { useState } from 'react';
import { 
  BookOpen, FileText, HelpCircle, 
  Calculator, Headphones, ChevronDown, ChevronRight,
  Menu, CheckSquare, Link2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useIsMobile } from '@/hooks/use-mobile';

export interface ResourceSection {
  id: string;
  label: string;
  icon: React.ElementType;
  subItems?: { id: string; label: string }[];
}

export const resourceSections: ResourceSection[] = [
  {
    id: 'planning-guides',
    label: 'Planning Guides',
    icon: BookOpen,
    subItems: [
      { id: 'pre-planning-guide', label: 'Pre-Planning Guide' },
      { id: 'when-death-happens', label: 'When Death Happens Guide' },
    ],
  },
  {
    id: 'checklists',
    label: 'Checklists',
    icon: CheckSquare,
    subItems: [
      { id: 'pre-planning-checklist', label: 'Pre-Planning Checklist' },
      { id: 'after-death-checklist', label: 'After-Death Checklist' },
    ],
  },
  {
    id: 'forms-worksheets',
    label: 'Forms & Worksheets',
    icon: FileText,
  },
  {
    id: 'tools-calculators',
    label: 'Tools & Calculators',
    icon: Calculator,
    subItems: [
      { id: 'cost-estimator', label: 'Cost Estimator' },
      { id: 'progress-tracker', label: 'Planning Progress' },
      { id: 'document-checklist', label: 'Document Checklist' },
    ],
  },
  {
    id: 'faqs',
    label: 'FAQs',
    icon: HelpCircle,
    subItems: [
      { id: 'general', label: 'General Questions' },
      { id: 'legal-financial', label: 'Legal & Financial' },
      { id: 'travel-protection', label: 'Travel Protection' },
      { id: 'funeral-process', label: 'Funeral Process' },
      { id: 'app-account', label: 'App & Account' },
    ],
  },
  {
    id: 'trusted-resources',
    label: 'Trusted Resources',
    icon: Link2,
    subItems: [
      { id: 'government', label: 'Government Resources' },
      { id: 'consumer-protection', label: 'Consumer Protection' },
    ],
  },
  {
    id: 'support-help',
    label: 'Support & Help',
    icon: Headphones,
    subItems: [
      { id: 'contact', label: 'Contact Support' },
      { id: 'how-to-get-help', label: 'How to Get Help' },
    ],
  },
];

interface ResourcesSidebarProps {
  activeSection: string;
  activeSubItem?: string;
  onSectionChange: (sectionId: string, subItemId?: string) => void;
}

function SidebarContent({ 
  activeSection, 
  activeSubItem, 
  onSectionChange,
  onClose 
}: ResourcesSidebarProps & { onClose?: () => void }) {
  const [expandedSections, setExpandedSections] = useState<string[]>([activeSection]);

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => 
      prev.includes(sectionId) 
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const handleItemClick = (sectionId: string, subItemId?: string) => {
    onSectionChange(sectionId, subItemId);
    onClose?.();
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-border">
        <h2 className="font-semibold text-foreground text-lg">Resources</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Guides, checklists, and tools
        </p>
      </div>
      
      <ScrollArea className="flex-1">
        <nav className="p-2">
          {resourceSections.map((section) => {
            const Icon = section.icon;
            const isExpanded = expandedSections.includes(section.id);
            const isActive = activeSection === section.id;
            
            return (
              <div key={section.id} className="mb-1">
                <button
                  onClick={() => {
                    toggleSection(section.id);
                    if (!section.subItems?.length) {
                      handleItemClick(section.id);
                    }
                  }}
                  className={cn(
                    "w-full flex items-center justify-between px-3 py-3 rounded-lg text-sm font-medium transition-colors",
                    isActive 
                      ? "bg-primary/10 text-primary" 
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <span className="flex items-center gap-2">
                    <Icon className="h-5 w-5" />
                    {section.label}
                  </span>
                  {section.subItems && section.subItems.length > 0 && (
                    isExpanded 
                      ? <ChevronDown className="h-4 w-4" />
                      : <ChevronRight className="h-4 w-4" />
                  )}
                </button>
                
                {section.subItems && isExpanded && (
                  <div className="ml-6 mt-1 space-y-0.5">
                    {section.subItems.map((subItem) => (
                      <button
                        key={subItem.id}
                        onClick={() => handleItemClick(section.id, subItem.id)}
                        className={cn(
                          "w-full text-left px-3 py-2 rounded-md text-sm transition-colors",
                          activeSection === section.id && activeSubItem === subItem.id
                            ? "bg-primary/10 text-primary font-medium"
                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                        )}
                      >
                        {subItem.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </ScrollArea>
    </div>
  );
}

export function ResourcesSidebar({ activeSection, activeSubItem, onSectionChange }: ResourcesSidebarProps) {
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button 
            variant="outline" 
            size="lg" 
            className="fixed bottom-4 left-4 z-50 shadow-lg min-h-[48px]"
          >
            <Menu className="h-5 w-5 mr-2" />
            Resources Menu
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-72 p-0">
          <SidebarContent 
            activeSection={activeSection}
            activeSubItem={activeSubItem}
            onSectionChange={onSectionChange}
            onClose={() => setOpen(false)}
          />
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <aside className="w-64 shrink-0 sticky top-20 h-[calc(100vh-5rem)] border-r border-border bg-card">
      <SidebarContent 
        activeSection={activeSection}
        activeSubItem={activeSubItem}
        onSectionChange={onSectionChange}
      />
    </aside>
  );
}
