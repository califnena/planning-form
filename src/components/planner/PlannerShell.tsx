import { useState, ReactNode } from "react";
import { SidebarNav } from "./SidebarNav";
import { ActionSidebar } from "./ActionSidebar";
import { Button } from "@/components/ui/button";
import { Facebook, Menu, MessageSquare } from "lucide-react";
import { ContactSuggestionDialog } from "@/components/ContactSuggestionDialog";
import { ProfileDropdown } from "@/components/ProfileDropdown";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import everlastingLogo from "@/assets/everlasting-logo.png";

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
  const [showContactDialog, setShowContactDialog] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { t } = useTranslation();

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

      {/* Quick Actions Section */}
      <div className="border-t border-border pt-4 mt-4">
        <h3 className="text-sm font-semibold text-foreground mb-4 px-4">{t("sidebar.quickActions")}</h3>
        <ActionSidebar
          onPreviewPDF={onPreviewPDF}
          onDownloadPDF={onDownloadPDF}
          onDownloadManualForm={onDownloadManualForm}
          onAfterLifePlan={onAfterLifePlan}
          onSave={onSave}
        />
      </div>

      {/* Provided By Footer */}
      <div className="mt-auto pt-6">
        <div className="mx-4 p-4 rounded-lg bg-muted/30 border border-border">
          <h3 className="text-xs font-semibold text-foreground mb-2">{t("sidebar.providedBy")}</h3>
          <div className="text-xs text-muted-foreground space-y-1">
            <p className="font-medium text-foreground">Everlasting Funeral Advisors</p>
            <p>(323) 863-5804</p>
            <a
              href="mailto:info@everlastingfuneraladvisors.com"
              className="text-primary hover:underline block"
            >
              info@everlastingfuneraladvisors.com
            </a>
            <a
              href="https://everlastingfuneraladvisors.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline block"
            >
              everlastingfuneraladvisors.com
            </a>
          </div>
          
          <div className="mt-3 pt-3 border-t border-border/50">
            <a
              href="https://www.facebook.com/profile.php?id=61580859545223"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-primary hover:underline text-xs"
            >
              <Facebook className="mr-1 h-3.5 w-3.5" />
              {t("sidebar.followUs")}
            </a>
          </div>
          
          <div className="mt-3">
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start text-xs"
              onClick={() => setShowContactDialog(true)}
            >
              <MessageSquare className="mr-2 h-3.5 w-3.5" />
              {t("sidebar.contactSuggest")}
            </Button>
          </div>
          
          <div className="mt-2">
            <Link to="/about-us" target="_blank" rel="noopener noreferrer">
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start text-xs text-muted-foreground hover:text-foreground"
              >
                ℹ️ <span className="ml-2">{t("sidebar.aboutUs")}</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <ContactSuggestionDialog
        open={showContactDialog}
        onOpenChange={setShowContactDialog}
      />
      <div className="min-h-screen flex flex-col bg-background">
        <div className="flex-1 flex">
          {/* Mobile Menu Sheet */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetContent side="left" className="w-80 overflow-y-auto p-0 bg-[hsl(30,10%,98%)]">
              <div className="p-4">
                {sidebarContent}
              </div>
            </SheetContent>
          </Sheet>

          {/* Desktop Sidebar */}
          <aside className="w-72 border-r border-border bg-[hsl(30,10%,98%)] overflow-y-auto hidden md:flex md:flex-col">
            <div className="p-4 flex-1">
              {sidebarContent}
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 overflow-y-auto">
            {/* Mobile Menu Button - Fixed position */}
            <div className="md:hidden fixed bottom-4 left-4 z-50">
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button size="lg" className="rounded-full shadow-lg">
                    <Menu className="h-5 w-5 mr-2" />
                    Menu
                  </Button>
                </SheetTrigger>
              </Sheet>
            </div>
            
            <div className="container mx-auto px-4 py-8 max-w-4xl">{children}</div>
          </main>
        </div>
      </div>
    </>
  );
};
