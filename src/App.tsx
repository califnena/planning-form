import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { I18nextProvider } from "react-i18next";
import i18n from "./i18n/config";
import { TextSizeProvider } from "./contexts/TextSizeContext";
import { AccessibilityProvider } from "./contexts/AccessibilityContext";
import { PreviewModeProvider } from "./contexts/PreviewModeContext";
import { ScrollToTop } from "./components/ScrollToTop";
import { BackToTopButton } from "./components/BackToTopButton";
import { VisitorTracker } from "./components/VisitorTracker";
import { LockedFeatureModal } from "./components/LockedFeatureModal";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ResetPassword from "./pages/ResetPassword";
import Dashboard from "./pages/Dashboard";
import PlannerApp from "./pages/PlannerApp";
import Profile from "./pages/Profile";
import Subscription from "./pages/Subscription";
import Plans from "./pages/Plans";
import Products from "./pages/Products";
import ProductBinder from "./pages/ProductBinder";
import Pricing from "./pages/Pricing";
import AboutUs from "./pages/AboutUs";
import LegalForms from "./pages/LegalForms";
import CareSupport from "./pages/CareSupport";
import NextSteps from "./pages/NextSteps";
import CaseDetail from "./pages/CaseDetail";
import PrePlanningWizard from "./pages/PrePlanningWizard";
import AfterDeathWizard from "./pages/AfterDeathWizard";
import Vendors from "./pages/Vendors";
import Forms from "./pages/Forms";
import Contact from "./pages/Contact";
import Resources from "./pages/Resources";
import FAQ from "./pages/FAQ";
import LegalDocuments from "./pages/LegalDocuments";
import PreviewPrePlanning from "./pages/PreviewPrePlanning";
import PreviewAfterDeath from "./pages/PreviewAfterDeath";
import PreviewLegal from "./pages/PreviewLegal";
import PreviewPDF from "./pages/PreviewPDF";
import NotFound from "./pages/NotFound";
import CustomSong from "./pages/CustomSong";
import SongInfo from "./pages/SongInfo";
import PrePlanningGuide from "./pages/PrePlanningGuide";
import PlanAheadGuideViewer from "./pages/PlanAheadGuideViewer";
import SongConfirmation from "./pages/SongConfirmation";
import PurchaseSuccess from "./pages/PurchaseSuccess";
import AdminPanel from "./pages/AdminPanel";
import AdminEvents from "./pages/AdminEvents";
import Events from "./pages/Events";
import Billing from "./pages/Billing";
import Unsubscribe from "./pages/Unsubscribe";
import TravelProtection from "./pages/TravelProtection";
import LandingAlt from "./pages/LandingAlt";
import AfterDeathLanding from "./pages/AfterDeathLanding";
import PlanAheadLanding from "./pages/PlanAheadLanding";
import DashboardPreview from "./pages/DashboardPreview";
import Settings from "./pages/Settings";
import DoItForYou from "./pages/DoItForYou";
import DoItForYouConfirmation from "./pages/DoItForYouConfirmation";
import DoItForYouIntake from "./pages/DoItForYouIntake";
import DoItForYouIntakeSubmitted from "./pages/DoItForYouIntakeSubmitted";
import PaymentHelp from "./pages/PaymentHelp";
import ClaireFAQ from "./pages/ClaireFAQ";
import PlannerPreview from "./pages/PlannerPreview";
import PrePlanSummary from "./pages/PrePlanSummary";
import SharedView from "./pages/SharedView";
const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <I18nextProvider i18n={i18n}>
      <TextSizeProvider>
        <AccessibilityProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <PreviewModeProvider>
                <ScrollToTop />
                <BackToTopButton />
                <VisitorTracker />
                <LockedFeatureModal />
                <div className="flex flex-col min-h-screen">
                  <div className="flex-1">
                    <Routes>
                      <Route path="/" element={<Landing />} />
                      <Route path="/unsubscribe" element={<Unsubscribe />} />
                      <Route path="/pricing" element={<Pricing />} />
                      <Route path="/dashboard" element={<Dashboard />} />
                      <Route path="/dashboard-preview" element={<DashboardPreview />} />
                      <Route path="/about-us" element={<AboutUs />} />
                      <Route path="/legal-forms" element={<LegalForms />} />
                      <Route path="/login" element={<Login />} />
                      <Route path="/signup" element={<Signup />} />
                      <Route path="/reset-password" element={<ResetPassword />} />
                      <Route path="/preplansteps" element={<PlannerApp />} />
                      <Route path="/preplandashboard" element={<PlannerApp />} />
                      <Route path="/preplansteps/profile" element={<Profile />} />
                      <Route path="/preplansteps/profile/subscription" element={<Subscription />} />
                      <Route path="/plans" element={<Plans />} />
                      <Route path="/products" element={<Products />} />
                      <Route path="/products/binder" element={<ProductBinder />} />
                      <Route path="/products/custom-song" element={<CustomSong />} />
                      <Route path="/song-info" element={<SongInfo />} />
                      <Route path="/song-confirmation" element={<SongConfirmation />} />
                      <Route path="/purchase-success" element={<PurchaseSuccess />} />
                      <Route path="/admin" element={<AdminPanel />} />
                      <Route path="/admin/events" element={<AdminEvents />} />
                      <Route path="/events" element={<Events />} />
                      <Route path="/billing" element={<Billing />} />
                      <Route path="/care-support" element={<CareSupport />} />
                      <Route path="/claire-faq" element={<ClaireFAQ />} />
                      {/* Redirects from old routes */}
                      <Route path="/vip-coach" element={<CareSupport />} />
                      <Route path="/vip" element={<CareSupport />} />
                      <Route path="/vip-planning-support" element={<CareSupport />} />
                      <Route path="/planning-coach" element={<CareSupport />} />
                      <Route path="/support-coach" element={<CareSupport />} />
                      <Route path="/coach-assistant" element={<CareSupport />} />
                      <Route path="/after-death-planner" element={<NextSteps />} />
                      <Route path="/next-steps" element={<NextSteps />} />
                      <Route path="/next-steps/case/:caseId" element={<CaseDetail />} />
                      <Route path="/wizard/preplanning" element={<PrePlanningWizard />} />
                      <Route path="/wizard/afterdeath" element={<AfterDeathWizard />} />
                      <Route path="/vendors" element={<Vendors />} />
                      <Route path="/guide" element={<PrePlanningGuide />} />
                      <Route path="/forms" element={<Forms />} />
                      <Route path="/contact" element={<Contact />} />
                      <Route path="/resources" element={<Resources />} />
                      <Route path="/faq" element={<FAQ />} />
                      <Route path="/legal-documents" element={<LegalDocuments />} />
                      <Route path="/preview/preplanning" element={<PreviewPrePlanning />} />
                      <Route path="/preview/afterdeath" element={<PreviewAfterDeath />} />
                      <Route path="/preview/legal" element={<PreviewLegal />} />
                      <Route path="/preview/pdf" element={<PreviewPDF />} />
                      <Route path="/travel-protection" element={<TravelProtection />} />
                      <Route path="/preview-landing" element={<LandingAlt />} />
                      <Route path="/after-death" element={<AfterDeathLanding />} />
                      <Route path="/plan-ahead" element={<PlanAheadLanding />} />
                      <Route path="/planner-preview" element={<PlannerPreview />} />
                      <Route path="/preplan-summary" element={<PrePlanSummary />} />
                      <Route path="/plan-ahead/guide" element={<PlanAheadGuideViewer />} />
                      <Route path="/preferences" element={<Settings />} />
                      <Route path="/settings" element={<Settings />} />
                      <Route path="/do-it-for-you" element={<DoItForYou />} />
                      <Route path="/do-it-for-you/confirmation" element={<DoItForYouConfirmation />} />
                      <Route path="/do-it-for-you/intake" element={<DoItForYouIntake />} />
                      <Route path="/do-it-for-you/intake-submitted" element={<DoItForYouIntakeSubmitted />} />
                      <Route path="/payment-help" element={<PaymentHelp />} />
                      <Route path="/shared/:token" element={<SharedView />} />
                      {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </div>
                </div>
              </PreviewModeProvider>
            </BrowserRouter>
          </TooltipProvider>
        </AccessibilityProvider>
      </TextSizeProvider>
    </I18nextProvider>
  </QueryClientProvider>
);

export default App;
