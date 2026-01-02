import { useState, ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { SidebarNav } from "./SidebarNav";
import { Button } from "@/components/ui/button";
import { Menu, FileText } from "lucide-react";
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

export const PlannerShell = ({
  children,
  sectionItems,
  activeSection,
  onSectionChange,
}: PlannerShellProps) => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const sidebarContent = (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto">
        <SidebarNav
          items={sectionItems}
          activeSection={activeSection}
          onSectionChange={(section) => {
            onSectionChange(section);
            setMobileMenuOpen(false);
          }}
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
              {sidebarContent}
            </div>
          </SheetContent>
        </Sheet>

        {/* Desktop Sidebar - Full navigation with labels (senior-friendly) */}
        <aside className="hidden md:flex md:flex-col border-r border-border bg-[hsl(30,10%,98%)] overflow-y-auto flex-shrink-0 md:w-64 lg:w-72">
          <div className="p-4">
            {sidebarContent}
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          {/* Mobile Menu Button */}
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
          
          {/* Persistent View Document Button */}
          <div className="fixed bottom-4 right-4 z-50">
            <Button
              size="lg"
              variant="default"
              className="rounded-full shadow-lg gap-2"
              onClick={() => navigate("/plan-summary")}
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
