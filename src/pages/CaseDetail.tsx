import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, ArrowRight, Home, Download, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";

// Step Components
import { Step1ImmediateNeeds } from "@/components/nextsteps/steps/Step1ImmediateNeeds";
import { Step2OfficialNotifications } from "@/components/nextsteps/steps/Step2OfficialNotifications";
import { Step3KeyDocuments } from "@/components/nextsteps/steps/Step3KeyDocuments";
import { Step4DeathCertificates } from "@/components/nextsteps/steps/Step4DeathCertificates";
import { Step5Obituary } from "@/components/nextsteps/steps/Step5Obituary";
import { Step6ServiceDetails } from "@/components/nextsteps/steps/Step6ServiceDetails";
import { Step7FinancesEstate } from "@/components/nextsteps/steps/Step7FinancesEstate";
import { Step8DigitalAccounts } from "@/components/nextsteps/steps/Step8DigitalAccounts";

const STEPS = [
  { id: 1, title: "Immediate Needs", subtitle: "First 48 Hours" },
  { id: 2, title: "Official Notifications", subtitle: "Government & Services" },
  { id: 3, title: "Find Key Documents", subtitle: "Legal Papers" },
  { id: 4, title: "Death Certificates", subtitle: "Orders & Distribution" },
  { id: 5, title: "Obituary & Announcements", subtitle: "Public Notices" },
  { id: 6, title: "Service & Memorial Details", subtitle: "Planning Ceremony" },
  { id: 7, title: "Finances & Estate", subtitle: "Money & Property" },
  { id: 8, title: "Digital Accounts", subtitle: "Online Presence" },
];

export default function CaseDetail() {
  const { caseId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [caseData, setCaseData] = useState<any>(null);
  const [formData, setFormData] = useState<any>({});
  const [isSaving, setIsSaving] = useState(false);

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
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
      window.scrollTo(0, 0);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo(0, 0);
    }
  };

  const handleGeneratePDF = () => {
    toast({
      title: "Generating PDF",
      description: "Your After-Life Plan report is being prepared...",
    });
    // PDF generation will be implemented
  };

  const renderStep = () => {
    const stepProps = {
      formData,
      onSave: saveProgress,
      caseId: caseId!,
    };

    switch (currentStep) {
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

  const progress = (currentStep / STEPS.length) * 100;
  const currentStepInfo = STEPS[currentStep - 1];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={() => navigate("/next-steps")}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <h1 className="text-xl font-semibold">
                  {caseData.decedent?.legal_name || "After-Life Action Plan"}
                </h1>
                <p className="text-sm text-muted-foreground">
                  Step {currentStep} of {STEPS.length}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => navigate("/")}>
                <Home className="mr-2 h-4 w-4" />
                Home
              </Button>
              {isSaving && (
                <span className="text-xs text-muted-foreground self-center">Saving...</span>
              )}
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-4">
            <Progress value={progress} className="h-2" />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-4xl">
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
        <div className="flex justify-between items-center">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 1}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Previous
          </Button>

          {currentStep < STEPS.length ? (
            <Button onClick={handleNext}>
              Next
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={handleGeneratePDF} className="bg-green-600 hover:bg-green-700">
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Generate PDF Report
            </Button>
          )}
        </div>

        {/* Step Navigation Pills */}
        <div className="mt-8 flex flex-wrap gap-2 justify-center">
          {STEPS.map((step) => (
            <button
              key={step.id}
              onClick={() => setCurrentStep(step.id)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                currentStep === step.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {step.id}. {step.title}
            </button>
          ))}
        </div>
      </main>
    </div>
  );
}
