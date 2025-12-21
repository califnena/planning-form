import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Compass, BookOpen, FileText, HelpCircle, Library, 
  Calendar, Calculator, Headphones, ChevronDown, ChevronRight,
  Menu, X
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
    id: 'getting-started',
    label: 'Getting Started',
    icon: Compass,
    subItems: [
      { id: 'overview', label: 'Overview' },
      { id: 'how-it-works', label: 'How This App Works' },
      { id: 'what-to-do-first', label: 'What To Do First' },
      { id: 'common-mistakes', label: 'Common Mistakes to Avoid' },
    ],
  },
  {
    id: 'planning-guides',
    label: 'Planning Guides',
    icon: BookOpen,
    subItems: [
      { id: 'pre-planning-basics', label: 'Pre-Planning Basics' },
      { id: 'when-death-happens', label: 'When Death Happens' },
      { id: 'funeral-vs-cremation', label: 'Funeral vs Cremation' },
      { id: 'burial-options', label: 'Burial Options' },
      { id: 'costs-explained', label: 'Costs Explained' },
    ],
  },
  {
    id: 'forms-worksheets',
    label: 'Forms & Worksheets',
    icon: FileText,
    subItems: [
      { id: 'printable-forms', label: 'Printable Blank Forms' },
      { id: 'guided-forms', label: 'Guided Walkthrough Forms' },
      { id: 'checklists', label: 'Checklists' },
      { id: 'download-center', label: 'Download Center' },
    ],
  },
  {
    id: 'faqs',
    label: 'FAQs',
    icon: HelpCircle,
    subItems: [
      { id: 'general', label: 'General Questions' },
      { id: 'legal-financial', label: 'Legal & Financial' },
      { id: 'funeral-process', label: 'Funeral Process' },
      { id: 'app-account', label: 'App & Account' },
    ],
  },
  {
    id: 'learn-library',
    label: 'Learn Library',
    icon: Library,
    subItems: [
      { id: 'articles', label: 'Short Articles' },
      { id: 'videos', label: 'Videos' },
      { id: 'external-resources', label: 'Trusted Resources' },
      { id: 'glossary', label: 'Glossary' },
    ],
  },
  {
    id: 'events-workshops',
    label: 'Events & Workshops',
    icon: Calendar,
    subItems: [
      { id: 'upcoming', label: 'Upcoming Events' },
      { id: 'recordings', label: 'Past Recordings' },
      { id: 'local-seminars', label: 'Local Seminars' },
      { id: 'virtual-workshops', label: 'Virtual Workshops' },
    ],
  },
  {
    id: 'tools-calculators',
    label: 'Tools & Calculators',
    icon: Calculator,
    subItems: [
      { id: 'cost-estimator', label: 'Cost Estimator' },
      { id: 'progress-tracker', label: 'Planning Progress' },
      { id: 'decision-helper', label: 'Decision Helper' },
      { id: 'document-checklist', label: 'Document Checklist' },
    ],
  },
  {
    id: 'support-help',
    label: 'Support & Help',
    icon: Headphones,
    subItems: [
      { id: 'contact', label: 'Contact Support' },
      { id: 'how-to-get-help', label: 'How to Get Help' },
      { id: 'report-issue', label: 'Report an Issue' },
      { id: 'feedback', label: 'Feedback' },
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
        <h2 className="font-semibold text-foreground">Resources</h2>
        <p className="text-xs text-muted-foreground mt-1">
          Help, guides, and tools
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
                    "w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    isActive 
                      ? "bg-primary/10 text-primary" 
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <span className="flex items-center gap-2">
                    <Icon className="h-4 w-4" />
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
                          "w-full text-left px-3 py-1.5 rounded-md text-sm transition-colors",
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
            size="sm" 
            className="fixed bottom-4 left-4 z-50 shadow-lg"
          >
            <Menu className="h-4 w-4 mr-2" />
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
    <aside className="w-60 shrink-0 sticky top-20 h-[calc(100vh-5rem)] border-r border-border bg-card">
      <SidebarContent 
        activeSection={activeSection}
        activeSubItem={activeSubItem}
        onSectionChange={onSectionChange}
      />
    </aside>
  );
}
