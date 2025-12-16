import { useState, ReactNode } from "react";
import { SidebarNav } from "./SidebarNav";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";

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
  onPreviewPDF,
  onDownloadPDF,
  onDownloadManualForm,
  onEmailPlan,
  onSignOut,
  onSave,
  onAfterLifePlan,
}: PlannerShellProps) => {
  const { t } = useTranslation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
        />
      </div>
    </div>
  );

  return (
    <div className="flex-1 flex flex-col bg-background">
      <div className="flex-1 flex overflow-hidden">
        {/* Single Sheet for Mobile Menu */}
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetContent side="left" className="w-80 overflow-y-auto p-0 bg-[hsl(30,10%,98%)]">
            <div className="p-4">
              {sidebarContent}
            </div>
          </SheetContent>
        </Sheet>

        {/* Desktop Resizable Layout */}
        <ResizablePanelGroup direction="horizontal" className="hidden md:flex flex-1">
          <ResizablePanel defaultSize={20} minSize={15} maxSize={35}>
            <aside className="h-full border-r border-border bg-[hsl(30,10%,98%)] overflow-y-auto">
              <div className="p-4">
                {sidebarContent}
              </div>
            </aside>
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize={80}>
            <main className="h-full overflow-y-auto">
              <div className="container mx-auto px-4 py-8 max-w-4xl">{children}</div>
            </main>
          </ResizablePanel>
        </ResizablePanelGroup>

        {/* Mobile Main Content */}
        <main className="flex-1 overflow-y-auto md:hidden">
          {/* Mobile Menu Button - Fixed position */}
          <div className="fixed bottom-4 left-4 z-50">
            <Button 
              size="lg" 
              className="rounded-full shadow-lg"
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu className="h-5 w-5 mr-2" />
              Menu
            </Button>
          </div>
          
          <div className="container mx-auto px-4 py-8 max-w-4xl">{children}</div>
        </main>
      </div>
    </div>
  );
};
