import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Download, Eye, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { generatePlanPDF } from "@/lib/pdfGenerator";
import { useToast } from "@/hooks/use-toast";

interface MyPlanningDocumentCardProps {
  hasData?: boolean;
}

export const MyPlanningDocumentCard = ({ hasData = true }: MyPlanningDocumentCardProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownloadPDF = async () => {
    setIsDownloading(true);
    try {
      // Get user and their plan data
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Please sign in",
          description: "You need to be signed in to download your planning document.",
          variant: "destructive"
        });
        navigate("/login");
        return;
      }

      // Get org
      const { data: orgMember } = await supabase
        .from("org_members")
        .select("org_id")
        .eq("user_id", user.id)
        .eq("role", "owner")
        .maybeSingle();

      if (!orgMember) {
        toast({
          title: "No planning data",
          description: "Start planning to create your document.",
        });
        navigate("/preplandashboard");
        return;
      }

      // Get plan
      const { data: plan } = await supabase
        .from("plans")
        .select("*")
        .eq("org_id", orgMember.org_id)
        .eq("owner_user_id", user.id)
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!plan) {
        toast({
          title: "No planning data",
          description: "Start planning to create your document.",
        });
        navigate("/preplandashboard");
        return;
      }

      // Get profile
      const { data: profile } = await supabase
        .from("personal_profiles")
        .select("*")
        .eq("plan_id", plan.id)
        .maybeSingle();

      // Generate and download PDF
      const pdf = generatePlanPDF({ ...plan, personal_profile: profile });
      pdf.save(`Planning-Summary-For-Review-Only_${new Date().toISOString().split('T')[0]}.pdf`);
      
      toast({
        title: "PDF Downloaded",
        description: "Your planning document has been downloaded."
      });
    } catch (error) {
      console.error("Error downloading PDF:", error);
      toast({
        title: "Download failed",
        description: "We couldn't download your document. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsDownloading(false);
    }
  };

  if (!hasData) {
    return (
      <Card className="border-2 border-dashed">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            My Planning Document
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            Your planning document will appear here once you start.
          </p>
          <Button onClick={() => navigate("/plan-ahead")}>
            Start Planning
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          My Planning Document
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          View, print, or share everything you've written so far.
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        <Button 
          onClick={() => navigate("/preplan-summary")} 
          className="w-full gap-2"
        >
          <Eye className="h-4 w-4" />
          View My Planning Document
        </Button>
        <Button 
          variant="outline" 
          onClick={handleDownloadPDF}
          disabled={isDownloading}
          className="w-full gap-2"
        >
          {isDownloading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Download className="h-4 w-4" />
          )}
          {isDownloading ? "Downloading..." : "Download PDF"}
        </Button>
      </CardContent>
    </Card>
  );
};
