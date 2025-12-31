import { useState, ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { SidebarNav } from "./SidebarNav";
import { Button } from "@/components/ui/button";
import { Menu, Eye, FileText } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Switch } from "@/components/ui/switch";
import {
  Sheet,
  SheetContent,
} from "@/components/ui/sheet";

interface PlannerShellProps {
  children: ReactNode;
  sectionItems: Array<{ id: string; label: string; completed: boolean }>;
  activeSection: string;
  onSectionChange: (section: string) => void;
  onPreviewPDF: () => void;
  onDownloadPDF: () => void;
  onDownloadManualForm: () => void;
  onEmailPlan: () => void;
  onSignOut: () => void;
  onSave?: () => void;
  onAfterLifePlan?: () => void;
}

// Section groupings for Browse Mode
const SECTION_GROUPS = [
  {
    label: "About You",
    sections: ["personal", "contacts", "pets"]
  },
  {
    label: "Your Wishes",
    sections: ["funeral", "legacy", "messages"]
  },
  {
    label: "Important Records",
    sections: ["financial", "property", "legal", "insurance", "digital"]
  }
];

export const PlannerShell = ({
  children,
  sectionItems,
  activeSection,
  onSectionChange,
  onPreviewPDF,
  onDownloadPDF,
  onDownloadManualForm,
  onEmailPlan,
  onSignOut,
  onSave,
  onAfterLifePlan,
}: PlannerShellProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [browseMode, setBrowseMode] = useState(false);

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Main Navigation */}
      <div className="flex-1 overflow-y-auto">
        <SidebarNav
          items={sectionItems}
          activeSection={activeSection}
          onSectionChange={(section) => {
            onSectionChange(section);
            setMobileMenuOpen(false);
          }}
          browseMode={browseMode}
          sectionGroups={SECTION_GROUPS}
        />
      </div>
    </div>
  );

  return (
    <div className="flex-1 flex flex-col bg-background">
      <div className="flex-1 flex overflow-hidden">
        {/* Mobile Menu Sheet */}
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetContent side="left" className="w-80 overflow-y-auto p-0 bg-[hsl(30,10%,98%)]">
            <div className="p-4">
              {/* Mobile Browse Mode Toggle */}
              <div className="mb-4 p-3 rounded-lg bg-muted/30">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <span className="text-sm text-muted-foreground">
                      Browsing mode: {browseMode ? "On" : "Off"}
                    </span>
                  </div>
                  <Switch
                    checked={browseMode}
                    onCheckedChange={setBrowseMode}
                    className="flex-shrink-0"
                  />
                </div>
                {!browseMode && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Turn on to explore all sections
                  </p>
                )}
              </div>
              {sidebarContent}
            </div>
          </SheetContent>
        </Sheet>

        {/* Desktop Sidebar - Guided (collapsed) or Browse (full) */}
        <aside 
          className={`hidden md:flex md:flex-col border-r border-border bg-[hsl(30,10%,98%)] overflow-y-auto flex-shrink-0 transition-all duration-300 ${
            browseMode ? "md:w-64 lg:w-72" : "md:w-16 lg:w-20"
          }`}
        >
          <div className="p-4">
            {/* Desktop Browse Mode Toggle */}
            {browseMode ? (
              <div className="mb-4 p-3 rounded-lg bg-muted/30">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm text-muted-foreground">
                    Browsing mode
                  </span>
                  <Switch
                    checked={browseMode}
                    onCheckedChange={setBrowseMode}
                    className="flex-shrink-0"
                  />
                </div>
              </div>
            ) : (
              <button
                onClick={() => setBrowseMode(true)}
                className="w-full flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-accent/50 transition-colors mb-4"
                title="Turn on browsing mode"
              >
                <Eye className="h-5 w-5 text-muted-foreground" />
                <span className="text-[10px] text-muted-foreground text-center leading-tight">
                  Browse
                </span>
              </button>
            )}
            {sidebarContent}
          </div>
        </aside>

        {/* Main Content - single instance for both mobile and desktop */}
        <main className="flex-1 overflow-y-auto">
          {/* Mobile Menu Button - only visible on mobile */}
          <div className="fixed bottom-4 left-4 z-50 md:hidden">
            <Button 
              size="lg" 
              className="rounded-full shadow-lg"
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu className="h-5 w-5 mr-2" />
              Menu
            </Button>
          </div>
          
          {/* Persistent View Document Button - always accessible */}
          <div className="fixed bottom-4 right-4 z-50">
            <Button
              size="lg"
              variant="default"
              className="rounded-full shadow-lg gap-2"
              onClick={() => navigate("/preplan-summary")}
            >
              <FileText className="h-5 w-5" />
              <span className="hidden sm:inline">View My Document</span>
              <span className="sm:hidden">Document</span>
            </Button>
          </div>
          
          <div className="container mx-auto px-4 py-8 max-w-4xl">{children}</div>
        </main>
      </div>
    </div>
  );
};
