import { useState, ReactNode } from "react";
import { SidebarNav } from "./SidebarNav";
import { Button } from "@/components/ui/button";
import { Download, Mail } from "lucide-react";

interface PlannerShellProps {
  children: ReactNode;
  sectionItems: Array<{ id: string; label: string; completed: boolean }>;
  activeSection: string;
  onSectionChange: (section: string) => void;
  onDownloadPDF: () => void;
  onEmailPlan: () => void;
  onSignOut: () => void;
}

export const PlannerShell = ({
  children,
  sectionItems,
  activeSection,
  onSectionChange,
  onDownloadPDF,
  onEmailPlan,
  onSignOut,
}: PlannerShellProps) => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="border-b border-border sticky top-0 bg-background z-10">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div>
            <h1 className="text-lg font-semibold text-primary">My Final Wishes</h1>
            <p className="text-xs text-muted-foreground">Interactive Planning Guide</p>
          </div>
          <button
            onClick={onSignOut}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Sign Out
          </button>
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
            <h3 className="text-sm font-semibold text-sidebar-foreground mb-2">Actions</h3>
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start"
              onClick={onDownloadPDF}
            >
              <Download className="mr-2 h-4 w-4" />
              Download PDF
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start"
              onClick={onEmailPlan}
            >
              <Mail className="mr-2 h-4 w-4" />
              Email Plan
            </Button>
          </div>

          {/* Contact Info */}
          <div className="mt-8 pt-4 border-t border-sidebar-border">
            <h3 className="text-sm font-semibold text-sidebar-foreground mb-2">Contact Us</h3>
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
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="container mx-auto px-4 py-6 max-w-4xl">{children}</div>
        </main>
      </div>
    </div>
  );
};
