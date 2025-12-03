import { ReactNode } from "react";
import { AppFooter } from "@/components/AppFooter";
import { AssistantWidget } from "@/components/assistant/AssistantWidget";
import { GlobalHeader } from "@/components/GlobalHeader";
import { AdminBanner } from "@/components/AdminBanner";

interface AuthenticatedLayoutProps {
  children: ReactNode;
}

export const AuthenticatedLayout = ({ children }: AuthenticatedLayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Admin Banner - Shows only for admin users */}
      <AdminBanner />
      
      {/* Header - Same as Pre-Planner */}
      <GlobalHeader />

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer - Same as Landing Page */}
      <AppFooter />
      
      {/* Chat Assistant Widget */}
      <AssistantWidget />
    </div>
  );
};
