import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { FileText, Download, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { logShareLinkAccess, ShareLink } from "@/lib/shareLinks";
import { getSectionCompletion } from "@/lib/sectionCompletion";
import { AppFooter } from "@/components/AppFooter";

export default function SharedView() {
  const { token } = useParams<{ token: string }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [shareLink, setShareLink] = useState<ShareLink | null>(null);
  const [planData, setPlanData] = useState<any>(null);
  const [completedSections, setCompletedSections] = useState<string[]>([]);

  useEffect(() => {
    const loadSharedContent = async () => {
      if (!token) {
        setError("Invalid link");
        setLoading(false);
        return;
      }

      // Detect device type
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      const deviceType = isMobile ? 'mobile' : 'desktop';

      // Log access and get link data
      const link = await logShareLinkAccess(token, deviceType);
      
      if (!link) {
        setError("This link is no longer available");
        setLoading(false);
        return;
      }

      setShareLink(link);

      // Fetch the user's plan and completed sections
      try {
        // Get org membership for the share link owner
        const { data: orgMember } = await supabase
          .from("org_members")
          .select("org_id")
          .eq("user_id", link.user_id)
          .eq("role", "owner")
          .maybeSingle();

        let fetchedPlan: any = null;

        if (orgMember) {
          // Get plan data
          const { data: plan } = await supabase
            .from("plans")
            .select("*")
            .eq("org_id", orgMember.org_id)
            .eq("owner_user_id", link.user_id)
            .maybeSingle();

          fetchedPlan = plan;

          if (fetchedPlan) {
            setPlanData(fetchedPlan);
          }
        }

        // Compute completed sections using unified completion logic
        if (fetchedPlan) {
          const completion = getSectionCompletion(fetchedPlan);
          const computed: string[] = Object.entries(completion)
            .filter(([_, isComplete]) => isComplete)
            .map(([sectionId]) => sectionId);
          setCompletedSections(computed);
        } else {
          setCompletedSections([]);
        }

      } catch (err) {
        console.error("Error loading shared content:", err);
      }

      setLoading(false);
    };

    loadSharedContent();
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="max-w-md mx-4">
          <CardContent className="p-8 text-center">
            <Lock className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Link Not Available</h2>
            <p className="text-muted-foreground">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const progressPercent = completedSections.length > 0 
    ? Math.min(100, completedSections.length * 10) // Rough estimate
    : 0;

  // Section display names
  const sectionLabels: Record<string, string> = {
    personal: "About You & Family",
    legacy: "Life Story & Legacy",
    contacts: "People to Notify",
    healthcare: "Medical & Care",
    advancedirective: "Advance Directive",
    funeral: "Funeral Wishes",
    financial: "Financial Life",
    insurance: "Insurance",
    property: "Property & Valuables",
    pets: "Pets",
    digital: "Online Accounts",
    messages: "Messages to Loved Ones",
    travel: "Travel & Away-From-Home",
    notes: "Notes",
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <FileText className="h-6 w-6 text-primary" />
            <div>
              <h1 className="font-semibold">Shared Planning Document</h1>
              <p className="text-sm text-muted-foreground">
                Shared with: {shareLink?.label}
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8 max-w-4xl">
        {/* Notice */}
        <Card className="mb-6 bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <p className="text-sm text-blue-900">
              This is a read-only view of completed planning sections. 
              You can download a printable summary below.
            </p>
          </CardContent>
        </Card>

        {/* Progress */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Progress Snapshot</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>{completedSections.length} sections completed</span>
                <span>{progressPercent}%</span>
              </div>
              <Progress value={progressPercent} className="h-2" />
            </div>
          </CardContent>
        </Card>

        {/* Completed Sections */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Completed Sections</CardTitle>
          </CardHeader>
          <CardContent>
            {completedSections.length === 0 ? (
              <p className="text-muted-foreground">No sections completed yet.</p>
            ) : (
              <div className="space-y-3">
                {completedSections.map((sectionId) => (
                  <div 
                    key={sectionId}
                    className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg"
                  >
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    <span>{sectionLabels[sectionId] || sectionId}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Download Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Downloads</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <Button className="gap-2">
                <Download className="h-4 w-4" />
                Download Printable Summary
              </Button>
              <Button variant="outline" className="gap-2">
                <Download className="h-4 w-4" />
                Download Progress Snapshot
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>

      <AppFooter />
    </div>
  );
}
