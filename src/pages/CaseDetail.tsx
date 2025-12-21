import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { GlobalHeader } from "@/components/GlobalHeader";
import { AppFooter } from "@/components/AppFooter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, ArrowRight, Home, Download, CheckCircle2, Menu, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";

// Step Components
import { Step0Overview } from "@/components/nextsteps/steps/Step0Overview";
import { Step1ImmediateNeeds } from "@/components/nextsteps/steps/Step1ImmediateNeeds";
import { Step2OfficialNotifications } from "@/components/nextsteps/steps/Step2OfficialNotifications";
import { Step3KeyDocuments } from "@/components/nextsteps/steps/Step3KeyDocuments";
import { Step4DeathCertificates } from "@/components/nextsteps/steps/Step4DeathCertificates";
import { Step5Obituary } from "@/components/nextsteps/steps/Step5Obituary";
import { Step6ServiceDetails } from "@/components/nextsteps/steps/Step6ServiceDetails";
import { Step7FinancesEstate } from "@/components/nextsteps/steps/Step7FinancesEstate";
import { Step8DigitalAccounts } from "@/components/nextsteps/steps/Step8DigitalAccounts";
import { Step9RealEstateUtilities } from "@/components/nextsteps/steps/Step9RealEstateUtilities";
import { Step10Subscriptions } from "@/components/nextsteps/steps/Step10Subscriptions";
import { Step11OtherProperty } from "@/components/nextsteps/steps/Step11OtherProperty";
import { Step12Business } from "@/components/nextsteps/steps/Step12Business";
import { PdfGenerationDialog } from "@/components/nextsteps/PdfGenerationDialog";

const STEP_KEYS = [
  { id: 0, titleKey: "afterDeathSteps.overview.title", subtitleKey: "afterDeathSteps.overview.subtitle" },
  { id: 1, titleKey: "afterDeathSteps.immediate.title", subtitleKey: "afterDeathSteps.immediate.subtitle" },
  { id: 2, titleKey: "afterDeathSteps.notifications.title", subtitleKey: "afterDeathSteps.notifications.subtitle" },
  { id: 3, titleKey: "afterDeathSteps.documents.title", subtitleKey: "afterDeathSteps.documents.subtitle" },
  { id: 4, titleKey: "afterDeathSteps.certificates.title", subtitleKey: "afterDeathSteps.certificates.subtitle" },
  { id: 5, titleKey: "afterDeathSteps.obituary.title", subtitleKey: "afterDeathSteps.obituary.subtitle" },
  { id: 6, titleKey: "afterDeathSteps.service.title", subtitleKey: "afterDeathSteps.service.subtitle" },
  { id: 7, titleKey: "afterDeathSteps.finances.title", subtitleKey: "afterDeathSteps.finances.subtitle" },
  { id: 8, titleKey: "afterDeathSteps.digital.title", subtitleKey: "afterDeathSteps.digital.subtitle" },
  { id: 9, titleKey: "afterDeathSteps.realestate.title", subtitleKey: "afterDeathSteps.realestate.subtitle" },
  { id: 10, titleKey: "afterDeathSteps.subscriptions.title", subtitleKey: "afterDeathSteps.subscriptions.subtitle" },
  { id: 11, titleKey: "afterDeathSteps.property.title", subtitleKey: "afterDeathSteps.property.subtitle" },
  { id: 12, titleKey: "afterDeathSteps.business.title", subtitleKey: "afterDeathSteps.business.subtitle" },
];

export default function CaseDetail() {
  const { caseId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useTranslation();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [caseData, setCaseData] = useState<any>(null);
  const [formData, setFormData] = useState<any>({});
  const [isSaving, setIsSaving] = useState(false);
  const [pdfDialogOpen, setPdfDialogOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [planPreparedFor, setPlanPreparedFor] = useState<string>("");

  useEffect(() => {
    if (caseId) {
      fetchCaseData();
      fetchPlanData();
    }
  }, [caseId]);

  const fetchPlanData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("plans")
        .select("prepared_for")
        .eq("owner_user_id", user.id)
        .maybeSingle();

      if (error) throw error;
      if (data?.prepared_for) {
        setPlanPreparedFor(data.prepared_for);
      }
    } catch (error) {
      console.error("Error fetching plan data:", error);
    }
  };

  const fetchCaseData = async () => {
    try {
      const { data, error } = await supabase
        .from("cases")
        .select(`
          *,
          decedent:decedents!cases_decedent_id_fkey(*)
        `)
        .eq("id", caseId)
        .single();

      if (error) throw error;
      setCaseData(data);
      
      // Load saved form data if exists
      if (data.form_data) {
        setFormData(data.form_data);
      }
    } catch (error) {
      console.error("Error fetching plan:", error);
      toast({
        title: t("common.error"),
        description: t("afterDeathSteps.errorLoadingPlanDetails"),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const saveProgress = async (data: any) => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("cases")
        .update({ 
          form_data: { ...formData, ...data },
          updated_at: new Date().toISOString()
        })
        .eq("id", caseId);

      if (error) throw error;
      
      setFormData((prev: any) => ({ ...prev, ...data }));
    } catch (error) {
      console.error("Error saving progress:", error);
      toast({
        title: t("afterDeathSteps.saveFailed"),
        description: t("afterDeathSteps.couldNotSaveChanges"),
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleNext = () => {
    if (currentStep < STEP_KEYS.length - 1) {
      setCurrentStep(currentStep + 1);
      window.scrollTo(0, 0);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      window.scrollTo(0, 0);
    }
  };

  const handleGeneratePDF = () => {
    setPdfDialogOpen(true);
  };


  const renderStep = () => {
    const stepProps = {
      formData,
      onSave: saveProgress,
      caseId: caseId!,
    };

    switch (currentStep) {
      case 0:
        return <Step0Overview {...stepProps} planPreparedFor={planPreparedFor} />;
      case 1:
        return <Step1ImmediateNeeds {...stepProps} />;
      case 2:
        return <Step2OfficialNotifications {...stepProps} />;
      case 3:
        return <Step3KeyDocuments {...stepProps} />;
      case 4:
        return <Step4DeathCertificates {...stepProps} />;
      case 5:
        return <Step5Obituary {...stepProps} />;
      case 6:
        return <Step6ServiceDetails {...stepProps} />;
      case 7:
        return <Step7FinancesEstate {...stepProps} />;
      case 8:
        return <Step8DigitalAccounts {...stepProps} />;
      case 9:
        return <Step9RealEstateUtilities {...stepProps} />;
      case 10:
        return <Step10Subscriptions {...stepProps} />;
      case 11:
        return <Step11OtherProperty {...stepProps} />;
      case 12:
        return <Step12Business {...stepProps} />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">{t("afterDeathSteps.loadingPlan")}</p>
      </div>
    );
  }

  if (!caseData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">{t("afterDeathSteps.planNotFound")}</p>
          <Button onClick={() => navigate("/next-steps")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t("afterDeathSteps.backToPlans")}
          </Button>
        </div>
      </div>
    );
  }

  const progress = (currentStep / (STEP_KEYS.length - 1)) * 100;
  const currentStepInfo = STEP_KEYS[currentStep];

  const sidebarContent = (
    <>
      <div className="mb-6">
        <h2 className="font-semibold text-sidebar-foreground mb-4">{t("afterDeathSteps.steps")}</h2>
        <nav className="space-y-1">
          {STEP_KEYS.map((step) => (
            <button
              key={step.id}
              onClick={() => {
                setCurrentStep(step.id);
                setMobileMenuOpen(false);
                window.scrollTo(0, 0);
              }}
              className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                currentStep === step.id
                  ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/50"
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-semibold"
                  style={{
                    borderColor: currentStep === step.id ? "currentColor" : "rgba(128, 128, 128, 0.3)",
                    backgroundColor: currentStep === step.id ? "currentColor" : "transparent",
                    color: currentStep === step.id ? "var(--sidebar-accent)" : "inherit"
                  }}
                >
                  {step.id}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{t(step.titleKey)}</div>
                  <div className="text-xs text-muted-foreground truncate">{t(step.subtitleKey)}</div>
                </div>
              </div>
            </button>
          ))}
        </nav>
      </div>

      {/* Actions */}
      <div className="mt-8 pt-4 border-t border-sidebar-border">
        <h3 className="text-sm font-semibold text-sidebar-foreground mb-3">{t("afterDeathSteps.actions")}</h3>
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full justify-start text-xs"
          onClick={handleGeneratePDF}
        >
          <Download className="mr-2 h-4 w-4 flex-shrink-0" />
          <span className="text-left">{t("afterDeathSteps.generatePDF")}</span>
        </Button>
      </div>
    </>
  );

  return (
    <>
      <GlobalHeader />
      <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-4">
              {/* Mobile Menu Button */}
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="md:hidden">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-80 overflow-y-auto p-4 bg-sidebar">
                  {sidebarContent}
                </SheetContent>
              </Sheet>
              
              <Button variant="ghost" size="sm" onClick={() => navigate("/preplansteps")} className="hidden sm:flex">
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <h1 className="text-lg sm:text-xl font-semibold">
                  {caseData.decedent?.legal_name || t("dashboard.afterDeathPlanner")}
                </h1>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {currentStep === 0 ? t("afterDeathSteps.overview.title") : t("wizard.stepOf", { current: currentStep, total: STEP_KEYS.length - 1 })}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => navigate("/dashboard")} className="hidden sm:flex">
                <Home className="mr-2 h-4 w-4" />
                {t("header.dashboard")}
              </Button>
              <Button variant="outline" size="sm" onClick={() => navigate("/preplansteps")} className="hidden sm:flex">
                <FileText className="mr-2 h-4 w-4" />
                {t("afterDeathSteps.prePlanner")}
              </Button>
              <Button variant="outline" size="sm" onClick={() => navigate("/after-death-planner")} className="hidden sm:flex">
                <ArrowLeft className="mr-2 h-4 w-4" />
                {t("dashboard.afterDeathPlanner")}
              </Button>
              <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")} className="sm:hidden" title={t("header.dashboard")}>
                <Home className="h-4 w-4" />
              </Button>
              {isSaving && (
                <span className="text-xs text-muted-foreground self-center hidden sm:inline">{t("common.saving")}</span>
              )}
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-4">
            <Progress value={progress} className="h-2" />
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Desktop Sidebar Navigation */}
        <aside className="w-64 border-r border-border bg-sidebar p-4 overflow-y-auto hidden md:block">
          {sidebarContent}
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="container mx-auto px-4 py-8 max-w-4xl">
            {/* Step Header */}
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-foreground mb-1">
                {t(currentStepInfo.titleKey)}
              </h2>
              <p className="text-muted-foreground">{t(currentStepInfo.subtitleKey)}</p>
            </div>

            {/* Step Content */}
            <Card className="p-6 mb-6">
              {renderStep()}
            </Card>

            {/* Navigation */}
            <div className="flex justify-between items-center gap-2">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 0}
              size="sm"
              className="sm:size-default"
            >
              <ArrowLeft className="mr-0 sm:mr-2 h-4 w-4" />
              <span className="hidden sm:inline">{t("common.previous")}</span>
            </Button>

            {currentStep < STEP_KEYS.length - 1 ? (
              <Button onClick={handleNext} size="sm" className="sm:size-default">
                <span className="hidden sm:inline">{t("common.next")}</span>
                <ArrowRight className="ml-0 sm:ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button onClick={handleGeneratePDF} className="bg-green-600 hover:bg-green-700 text-xs sm:text-sm">
                <CheckCircle2 className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">{t("afterDeathSteps.generatePlan")}</span>
                <span className="sm:hidden">{t("afterDeathSteps.generate")}</span>
              </Button>
            )}
            </div>
          </div>
        </main>
      </div>

      <PdfGenerationDialog
        open={pdfDialogOpen}
        onOpenChange={setPdfDialogOpen}
        formData={formData}
        decedentName={caseData?.decedent?.legal_name || ""}
      />
      </div>
      <AppFooter />
    </>
  );
}
