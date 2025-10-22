import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, ArrowRight, Home, Download, CheckCircle2, Menu } from "lucide-react";
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

const STEPS = [
  { id: 0, title: "Overview", subtitle: "What This Plan Does" },
  { id: 1, title: "Immediate Needs", subtitle: "First 48 Hours" },
  { id: 2, title: "Official Notifications", subtitle: "Government & Services" },
  { id: 3, title: "Find Key Documents", subtitle: "Legal Papers" },
  { id: 4, title: "Death Certificates", subtitle: "Orders & Distribution" },
  { id: 5, title: "Obituary & Announcements", subtitle: "Public Notices" },
  { id: 6, title: "Service & Memorial Details", subtitle: "Planning Ceremony" },
  { id: 7, title: "Finances & Estate", subtitle: "Money & Property" },
  { id: 8, title: "Digital Accounts", subtitle: "Online Presence" },
  { id: 9, title: "Real Estate & Utilities", subtitle: "Property Management" },
  { id: 10, title: "Subscriptions", subtitle: "Non-Digital Services" },
  { id: 11, title: "Other Property", subtitle: "Vehicles, Jewelry & More" },
  { id: 12, title: "Business", subtitle: "Business Ownership" },
];

export default function CaseDetail() {
  const { caseId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [caseData, setCaseData] = useState<any>(null);
  const [formData, setFormData] = useState<any>({});
  const [isSaving, setIsSaving] = useState(false);
  const [pdfDialogOpen, setPdfDialogOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (caseId) {
      fetchCaseData();
    }
  }, [caseId]);

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
        title: "Error",
        description: "Failed to load plan details",
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
        title: "Save Failed",
        description: "Could not save your changes",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
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
        return <Step0Overview {...stepProps} />;
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
        <p className="text-muted-foreground">Loading plan...</p>
      </div>
    );
  }

  if (!caseData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Plan not found</p>
          <Button onClick={() => navigate("/next-steps")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Plans
          </Button>
        </div>
      </div>
    );
  }

  const progress = (currentStep / (STEPS.length - 1)) * 100;
  const currentStepInfo = STEPS[currentStep];

  const sidebarContent = (
    <>
      <div className="mb-6">
        <h2 className="font-semibold text-sidebar-foreground mb-4">Steps</h2>
        <nav className="space-y-1">
          {STEPS.map((step) => (
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
                  <div className="font-medium truncate">{step.title}</div>
                  <div className="text-xs text-muted-foreground truncate">{step.subtitle}</div>
                </div>
              </div>
            </button>
          ))}
        </nav>
      </div>

      {/* Actions */}
      <div className="mt-8 pt-4 border-t border-sidebar-border">
        <h3 className="text-sm font-semibold text-sidebar-foreground mb-3">Actions</h3>
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full justify-start text-xs"
          onClick={handleGeneratePDF}
        >
          <Download className="mr-2 h-4 w-4 flex-shrink-0" />
          <span className="text-left">Generate After Life Action Plan</span>
        </Button>
      </div>
    </>
  );

  return (
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
              
              <Button variant="ghost" size="sm" onClick={() => navigate("/next-steps")} className="hidden sm:flex">
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <h1 className="text-lg sm:text-xl font-semibold">
                  {caseData.decedent?.legal_name || "After-Life Action Plan"}
                </h1>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {currentStep === 0 ? "Overview" : `Step ${currentStep} of ${STEPS.length - 1}`}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => navigate("/app")} className="hidden sm:flex">
                <Home className="mr-2 h-4 w-4" />
                Home
              </Button>
              <Button variant="ghost" size="icon" onClick={() => navigate("/app")} className="sm:hidden">
                <Home className="h-4 w-4" />
              </Button>
              {isSaving && (
                <span className="text-xs text-muted-foreground self-center hidden sm:inline">Saving...</span>
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
                {currentStepInfo.title}
              </h2>
              <p className="text-muted-foreground">{currentStepInfo.subtitle}</p>
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
              <span className="hidden sm:inline">Previous</span>
            </Button>

            {currentStep < STEPS.length - 1 ? (
              <Button onClick={handleNext} size="sm" className="sm:size-default">
                <span className="hidden sm:inline">Next</span>
                <ArrowRight className="ml-0 sm:ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button onClick={handleGeneratePDF} className="bg-green-600 hover:bg-green-700 text-xs sm:text-sm">
                <CheckCircle2 className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Generate Plan</span>
                <span className="sm:hidden">Generate</span>
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
  );
}
