import { useState, ReactNode } from "react";
import { SidebarNav } from "./SidebarNav";
import { Button } from "@/components/ui/button";
import { Download, Mail, MessageSquare, Facebook, FileText, Eye, Printer, Save, Sparkles } from "lucide-react";
import { ContactSuggestionDialog } from "@/components/ContactSuggestionDialog";
import { LanguageSelector } from "@/components/LanguageSelector";
import { ProfileDropdown } from "@/components/ProfileDropdown";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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
}: PlannerShellProps) => {
  const [showContactDialog, setShowContactDialog] = useState(false);
  const { t } = useTranslation();

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
            <img src={everlastingLogo} alt="Everlasting Funeral Advisors" className="h-12 w-12" />
            <div>
              <h1 className="text-lg font-semibold text-primary">{t("header.title")}</h1>
              <p className="text-xs text-muted-foreground">{t("header.providedBy")}</p>
              <a 
                href="/about-us"
                className="text-xs text-primary hover:underline"
              >
                About Us
              </a>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <LanguageSelector />
            <ProfileDropdown />
          </div>
        </div>
      </header>

      <div className="flex-1 flex">
        {/* Sidebar */}
        <aside className="w-64 border-r border-border bg-sidebar p-4 overflow-y-auto hidden md:block">
          <div className="mb-6">
            <h2 className="font-semibold text-sidebar-foreground mb-4">Sections</h2>
            <SidebarNav
              items={sectionItems}
              activeSection={activeSection}
              onSectionChange={onSectionChange}
            />
          </div>

          {/* Actions */}
          <div className="mt-8 space-y-2">
            <h3 className="text-sm font-semibold text-sidebar-foreground mb-3">Actions</h3>
            <div className="text-xs text-muted-foreground mb-3 p-2 bg-muted/30 rounded">
              ✓ All fields auto-save
            </div>
            {onSave && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="default"
                      size="sm"
                      className="w-full justify-start"
                      onClick={onSave}
                    >
                      <Save className="mr-2 h-4 w-4" />
                      Save Now
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="bg-popover text-popover-foreground border">
                    <p>Manual save (auto-save is already enabled)</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
            
            {/* Everlasting Wishes - Pre-Planning Mode */}
            <div className="mt-4 pt-4 border-t border-sidebar-border">
              <h3 className="text-xs font-semibold text-sidebar-foreground mb-2 text-muted-foreground uppercase tracking-wider">
                Everlasting Wishes
              </h3>
              <p className="text-xs text-muted-foreground mb-3 italic">(Pre-Planning Mode)</p>
              <div className="space-y-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full justify-start"
                        onClick={onPreviewPDF}
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        Preview My Document
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="right" className="bg-popover text-popover-foreground border">
                      <p>Preview before downloading (PDF Format)</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full justify-start"
                        onClick={onDownloadPDF}
                      >
                        <Download className="mr-2 h-4 w-4" />
                        Generate My Document
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="right" className="bg-popover text-popover-foreground border">
                      <p>Download your plan (PDF Format)</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full justify-start"
                        onClick={onDownloadPDF}
                      >
                        <Download className="mr-2 h-4 w-4" />
                        Generate My Document
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="right" className="bg-popover text-popover-foreground border">
                      <p>Download your plan (PDF Format)</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full justify-start"
                        onClick={onDownloadManualForm}
                      >
                        <Printer className="mr-2 h-4 w-4" />
                        Blank Form
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="right" className="bg-popover text-popover-foreground border">
                      <p>Printable blank form for handwriting</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>

            {/* Everlasting Next Steps - After-Life Action Plan */}
            <div className="mt-4 pt-4 border-t border-sidebar-border">
              <h3 className="text-xs font-semibold text-sidebar-foreground mb-2 text-muted-foreground uppercase tracking-wider">
                Everlasting Next Steps
              </h3>
              <p className="text-xs text-muted-foreground mb-3 italic">(After-Life Action Plan)</p>
              <div className="space-y-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                  asChild
                >
                  <Link to="/next-steps">
                    <FileText className="mr-2 h-4 w-4" />
                    After Life Plan
                  </Link>
                </Button>
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t border-sidebar-border">
              <Button
                size="sm"
                className="w-full justify-start bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-500 hover:to-amber-600 text-black shadow-lg hover:shadow-xl transition-all duration-300 font-semibold"
                asChild
              >
                <a href="https://everlastingfuneraladvisors.com" target="_blank" rel="noopener noreferrer">
                  <FileText className="mr-2 h-4 w-4" />
                  Request a Quote
                </a>
              </Button>
              
              <Button
                size="sm"
                className="w-full justify-start mt-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 font-semibold"
                asChild
              >
                <Link to="/vip-coach">
                  <Sparkles className="mr-2 h-4 w-4" />
                  VIP Coach Assistant
                </Link>
              </Button>
            </div>
          </div>

          {/* Contact Info */}
          <div className="mt-8 pt-4 border-t border-sidebar-border">
            <h3 className="text-sm font-semibold text-sidebar-foreground mb-2">Provided by</h3>
            <div className="text-xs text-sidebar-foreground/80 space-y-1">
              <p className="font-medium">Everlasting Funeral Advisors</p>
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
            <div className="mt-4 pt-4 border-t border-sidebar-border">
              <h3 className="text-sm font-semibold text-sidebar-foreground mb-2">Follow Us</h3>
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
            <div className="mt-4 pt-4 border-t border-sidebar-border">
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
