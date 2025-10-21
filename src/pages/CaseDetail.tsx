import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Download, Mail, Share2, FileText, Home } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { CaseVitalStats } from "@/components/nextsteps/CaseVitalStats";
import { CaseChecklist } from "@/components/nextsteps/CaseChecklist";
import { CaseFilings } from "@/components/nextsteps/CaseFilings";
import { CaseServicePlan } from "@/components/nextsteps/CaseServicePlan";
import { CaseDocuments } from "@/components/nextsteps/CaseDocuments";

export default function CaseDetail() {
  const { caseId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [caseData, setCaseData] = useState<any>(null);

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
          decedent:decedents!cases_decedent_id_fkey(*),
          contacts(*),
          tasks(*),
          notices(*),
          death_cert_requests(*),
          obituary(*),
          service_plan(*),
          transport(*),
          documents(*)
        `)
        .eq("id", caseId)
        .single();

      if (error) throw error;
      setCaseData(data);
    } catch (error) {
      console.error("Error fetching case:", error);
      toast({
        title: "Error",
        description: "Failed to load plan details",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGeneratePDF = () => {
    toast({
      title: "PDF Generation",
      description: "PDF generator coming soon",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading plan...</p>
      </div>
    );
  }

  if (!caseData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
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

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={() => navigate("/next-steps")}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <h1 className="text-xl font-semibold">
                  {caseData.decedent?.legal_name || "Plan Details"}
                </h1>
                <p className="text-sm text-muted-foreground">
                  Status: {caseData.case_status}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => navigate("/")}>
                <Home className="mr-2 h-4 w-4" />
                Home
              </Button>
              <Button variant="outline" size="sm">
                <Share2 className="mr-2 h-4 w-4" />
                Share
              </Button>
              <Button variant="outline" size="sm">
                <Mail className="mr-2 h-4 w-4" />
                Email
              </Button>
              <Button size="sm" onClick={handleGeneratePDF}>
                <Download className="mr-2 h-4 w-4" />
                Generate PDF
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <Tabs defaultValue="vital-stats" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="vital-stats">Vital Stats</TabsTrigger>
            <TabsTrigger value="checklist">Checklist</TabsTrigger>
            <TabsTrigger value="filings">Filings & Notices</TabsTrigger>
            <TabsTrigger value="service">Service Plan</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
          </TabsList>

          <TabsContent value="vital-stats">
            <CaseVitalStats caseId={caseId!} decedent={caseData.decedent} onUpdate={fetchCaseData} />
          </TabsContent>

          <TabsContent value="checklist">
            <CaseChecklist caseId={caseId!} tasks={caseData.tasks || []} onUpdate={fetchCaseData} />
          </TabsContent>

          <TabsContent value="filings">
            <CaseFilings 
              caseId={caseId!} 
              notices={caseData.notices || []}
              deathCertRequests={caseData.death_cert_requests || []}
              obituary={caseData.obituary?.[0]}
              onUpdate={fetchCaseData}
            />
          </TabsContent>

          <TabsContent value="service">
            <CaseServicePlan 
              caseId={caseId!} 
              servicePlan={caseData.service_plan?.[0]}
              transport={caseData.transport?.[0]}
              onUpdate={fetchCaseData}
            />
          </TabsContent>

          <TabsContent value="documents">
            <CaseDocuments caseId={caseId!} documents={caseData.documents || []} onUpdate={fetchCaseData} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
