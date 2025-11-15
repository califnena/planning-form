import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { I18nextProvider } from "react-i18next";
import i18n from "./i18n/config";
import { TextSizeProvider } from "./contexts/TextSizeContext";
import Index from "./pages/Index";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ResetPassword from "./pages/ResetPassword";
import PlannerApp from "./pages/PlannerApp";
import Profile from "./pages/Profile";
import Subscription from "./pages/Subscription";
import AboutUs from "./pages/AboutUs";
import LegalForms from "./pages/LegalForms";
import CoachAssistant from "./pages/CoachAssistant";
import NextSteps from "./pages/NextSteps";
import CaseDetail from "./pages/CaseDetail";
import NotFound from "./pages/NotFound";
import AfterLifePlan from "./pages/AfterLifePlan";
import Vendors from "./pages/Vendors";
import Forms from "./pages/Forms";
import Contact from "./pages/Contact";
import Settings from "./pages/Settings";
import Resources from "./pages/Resources";
import FAQ from "./pages/FAQ";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <I18nextProvider i18n={i18n}>
      <TextSizeProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/landing" element={<Landing />} />
              <Route path="/about-us" element={<AboutUs />} />
              <Route path="/legal-forms" element={<LegalForms />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/app" element={<PlannerApp />} />
              <Route path="/app/profile" element={<Profile />} />
              <Route path="/app/profile/subscription" element={<Subscription />} />
              <Route path="/vip-coach" element={<CoachAssistant />} />
              <Route path="/next-steps" element={<NextSteps />} />
              <Route path="/next-steps/case/:caseId" element={<CaseDetail />} />
              <Route path="/after-life-plan" element={<AfterLifePlan />} />
              <Route path="/vendors" element={<Vendors />} />
              <Route path="/forms" element={<Forms />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/resources" element={<Resources />} />
              <Route path="/faq" element={<FAQ />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </TextSizeProvider>
    </I18nextProvider>
  </QueryClientProvider>
);

export default App;
