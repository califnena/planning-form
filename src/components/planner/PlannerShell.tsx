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

      {/* Actions Section */}
      <div className="border-t border-border pt-4 mt-4">
        <h3 className="text-sm font-semibold text-foreground mb-4 px-4">Quick Actions</h3>
        <ActionSidebar
          onPreviewPDF={onPreviewPDF}
          onDownloadPDF={onDownloadPDF}
          onDownloadManualForm={onDownloadManualForm}
          onAfterLifePlan={onAfterLifePlan}
          onSave={onSave}
        />
      </div>

      {/* Contact Info */}
      <div className="mt-6 pt-4 border-t border-border px-4">
        <h3 className="text-sm font-semibold text-foreground mb-3">Provided by</h3>
        <div className="text-xs text-muted-foreground space-y-1.5">
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
          <a
            href="/about-us"
            className="text-primary hover:underline block mt-1"
          >
            About Us
          </a>
        </div>

        {/* Social Media */}
        <div className="mt-4 pt-4 border-t border-border">
          <h3 className="text-sm font-semibold text-foreground mb-2">Follow Us</h3>
          <a
            href="https://www.facebook.com/profile.php?id=61580859545223"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center text-primary hover:underline text-xs"
          >
            <Facebook className="mr-1 h-4 w-4" />
            Facebook
          </a>
        </div>

        {/* Contact/Suggest */}
        <div className="mt-4 pt-4 border-t border-border">
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-start"
            onClick={() => setShowContactDialog(true)}
          >
            <MessageSquare className="mr-2 h-4 w-4" />
            {t("header.contact")}
          </Button>
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
      {/* Header */}
      <header className="border-b border-border sticky top-0 bg-background z-10">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-3">
            {/* Mobile Menu Button */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80 overflow-y-auto p-0 bg-[hsl(30,10%,98%)]">
                <div className="p-4">
                  {sidebarContent}
                </div>
              </SheetContent>
            </Sheet>
            
            <img src={everlastingLogo} alt="Everlasting Funeral Advisors" className="h-12 w-12" />
            <div>
              <h1 className="text-lg font-semibold text-primary">{t("header.title")}</h1>
              <p className="text-xs text-muted-foreground hidden sm:block">{t("header.providedBy")}</p>
              <a 
                href="/about-us"
                className="text-xs text-primary hover:underline hidden sm:block"
              >
                About Us
              </a>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <ProfileDropdown />
          </div>
        </div>
      </header>

      <div className="flex-1 flex">
        {/* Desktop Sidebar */}
        <aside className="w-72 border-r border-border bg-[hsl(30,10%,98%)] overflow-y-auto hidden md:flex md:flex-col">
          <div className="p-4 flex-1">
            {sidebarContent}
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="container mx-auto px-4 py-6 max-w-4xl">{children}</div>
        </main>
      </div>
      </div>
    </>
  );
};
