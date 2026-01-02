import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { AuthenticatedLayout } from "@/components/AuthenticatedLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { 
  Download, 
  ChevronDown,
  ChevronUp,
  Edit,
  Users,
  Heart,
  FileText,
  Check,
  Circle,
  Loader2,
  Play,
  Phone
} from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ShareSummaryDialog } from "@/components/summary/ShareSummaryDialog";
// SETTINGS_DEFAULT removed - we now show a fixed list of required sections
import { useActivePlan, fetchPlanData } from "@/hooks/useActivePlan";
import { buildPlanDataForPdf, normalizePlanDataForPdf } from "@/lib/buildPlanDataForPdf";
import { getSectionCompletion } from "@/lib/sectionCompletion";
import { getCompletableSections, type SectionDefinition } from "@/lib/sectionRegistry";
import { getOrCreateGuestId } from "@/lib/identityUtils";

interface SectionData {
  id: string;
  label: string;
  icon: React.ReactNode;
  status: "completed" | "started" | "not_started";
  editRoute: string;
}

export default function PrePlanSummary() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  
  const { loading: planLoading, planId, orgId, plan: activePlan, error: planError } = useActivePlan();
  
  const [dataLoading, setDataLoading] = useState(true);
  const [planData, setPlanData] = useState<any>(null);
  const [sections, setSections] = useState<SectionData[]>([]);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [userEmail, setUserEmail] = useState<string>("");
  const [userId, setUserId] = useState<string>("");
  const [selectedSections, setSelectedSections] = useState<string[]>(["personal", "contacts", "healthcare", "funeral", "insurance", "property", "pets", "messages"]);
  const [generatingPdf, setGeneratingPdf] = useState(false);
  
  // Simplified UI state
  const [sectionsExpanded, setSectionsExpanded] = useState(false);
  const [personalNotes, setPersonalNotes] = useState("");
  
  // PDF fallback handling
  const [lastPdfUrl, setLastPdfUrl] = useState<string | null>(null);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [pdfWindow, setPdfWindow] = useState<Window | null>(null);
  
  const loading = planLoading || dataLoading;

  // Load personal notes from localStorage
  useEffect(() => {
    const savedNotes = localStorage.getItem("plan_personal_notes");
    if (savedNotes) {
      setPersonalNotes(savedNotes);
    }
  }, []);

  // Auto-save personal notes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (personalNotes) {
        localStorage.setItem("plan_personal_notes", personalNotes);
      }
    }, 1000);
    return () => clearTimeout(timeoutId);
  }, [personalNotes]);

  // Check for print param
  useEffect(() => {
    if (searchParams.get("print") === "1" && planData) {
      setTimeout(() => window.print(), 500);
    }
  }, [searchParams, planData]);

  // Load data when planId is available
  useEffect(() => {
    if (!planLoading && planId) {
      loadPlanData(planId);
    } else if (!planLoading && !planId) {
      setDataLoading(false);
    }
  }, [planLoading, planId]);

  const loadPlanData = async (activePlanId: string) => {
    try {
      setDataLoading(true);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/login");
        return;
      }

      setUserEmail(user.email || "");
      setUserId(user.id);
      
      const { data: settings } = await supabase
        .from("user_settings")
        .select("selected_sections")
        .eq("user_id", user.id)
        .maybeSingle();
      
      if (settings?.selected_sections?.length) {
        setSelectedSections(settings.selected_sections);
      }

      // Single source of truth: buildPlanDataForPdf
      const pdfPlanData = await buildPlanDataForPdf(user.id);

      const mergedPlanData: any = {
        ...(pdfPlanData || {}),
        id: activePlanId,
        org_id: orgId,
      };

      setPlanData(mergedPlanData);

      // Compute completion using unified logic - pass userId for localStorage key lookup
      const completion = getSectionCompletion(mergedPlanData, user.id);

      if (import.meta.env.DEV) {
        console.log("[PrePlanSummary] completion map:", completion);
        console.log("[PrePlanSummary] userId:", user.id);
      }

      // Build sections list from UNIFIED REGISTRY
      // Show the REQUIRED sections for "View or edit sections" per specification
      const REQUIRED_SECTION_IDS = [
        "personal",    // About You
        "contacts",    // Important Contacts
        "healthcare",  // Medical & Care Preferences
        "funeral",     // Funeral Wishes
        "insurance",   // Insurance
        "property",    // Property & Valuables
        "pets",        // Pets
        "messages",    // Messages to Loved Ones
      ];

      const registrySections = getCompletableSections();
      const sectionList: SectionData[] = registrySections
        .filter((s) => REQUIRED_SECTION_IDS.includes(s.id))
        .map((s) => {
          const Icon = s.icon;
          const status: "completed" | "not_started" = completion[s.id] ? "completed" : "not_started";
          return {
            id: s.id,
            label: s.label,
            icon: <Icon className="h-5 w-5" />,
            status,
            editRoute: s.route,
          };
        })
        // Sort by REQUIRED_SECTION_IDS order
        .sort((a, b) => REQUIRED_SECTION_IDS.indexOf(a.id) - REQUIRED_SECTION_IDS.indexOf(b.id));

      setSections(sectionList);
    } catch (error) {
      console.error("Error loading plan data:", error);
      toast({
        title: "Error loading data",
        description: "Please try again or call us for help.",
        variant: "destructive"
      });
    } finally {
      setDataLoading(false);
    }
  };

  /**
   * PDF Generation with proper popup handling:
   * 1. Open blank tab immediately on user gesture
   * 2. Generate PDF
   * 3. Load blob URL into the tab
   * 4. Provide download fallback
   */
  const handleDownloadPDF = async () => {
    setGeneratingPdf(true);
    setPdfError(null);

    // CRITICAL: Open blank tab IMMEDIATELY on user gesture (before async work)
    const newWindow = window.open("about:blank", "_blank");
    
    if (!newWindow) {
      // Popup blocked - we'll show fallback buttons after generation
      console.warn("[PDF] Popup was blocked");
    } else {
      // Show loading message in the new tab
      newWindow.document.write(`
        <html>
          <head><title>Loading Your Printable Copy...</title></head>
          <body style="font-family: system-ui, sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0;">
            <div style="text-align: center;">
              <p style="font-size: 18px;">Loading your printable copy...</p>
              <p style="color: #666;">Please wait a moment.</p>
            </div>
          </body>
        </html>
      `);
      setPdfWindow(newWindow);
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      // Support both authenticated users and guests
      let identityType: "user" | "guest" = "guest";
      let identityId: string = getOrCreateGuestId();
      let planDataForPdf: any;

      if (session?.user) {
        identityType = "user";
        identityId = session.user.id;
        console.log("[PDF] Building plan data for user:", identityId);
        planDataForPdf = await buildPlanDataForPdf(identityId);
      } else {
        console.log("[PDF] Building plan data for guest:", identityId);
        // For guests, we use data from planData state if available
        planDataForPdf = planData || {};
      }

      const normalizedPlanData = normalizePlanDataForPdf(planDataForPdf);

      console.log("[PDF] Plan data built, invoking edge function");

      const { data: pdfData, error } = await supabase.functions.invoke("generate-planner-pdf", {
        body: {
          planData: normalizedPlanData,
          selectedSections,
          piiData: {},
          docType: "planner",
          isDraft: false,
          identityType,
          identityId,
        },
      });

      if (error) {
        console.error("[PDF] Edge function error:", error);
        console.error("[PDF] Error details:", JSON.stringify(error));
        throw error;
      }
      
      console.log("[PDF] Response received:", pdfData);

      // Edge function returns EITHER { url, filename } (signed URL) OR { pdfBase64, filename } (fallback)
      let pdfUrl: string;
      let filename = pdfData?.filename || "My-Planning-Document.pdf";

      if (pdfData?.url) {
        // Signed URL from Supabase Storage - use directly
        pdfUrl = pdfData.url;
        console.log("[PDF] Using signed URL:", pdfUrl);
      } else if (pdfData?.pdfBase64) {
        // Fallback: base64 encoded PDF
        console.log("[PDF] Using base64 fallback, creating blob");
        const byteCharacters = atob(pdfData.pdfBase64);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: "application/pdf" });
        pdfUrl = URL.createObjectURL(blob);
      } else {
        console.error("[PDF] No URL or pdfBase64 in response:", pdfData);
        throw new Error("No PDF data returned from server");
      }

      setLastPdfUrl(pdfUrl);

      if (newWindow && !newWindow.closed) {
        // Navigate the already-open window to the PDF
        newWindow.location.href = pdfUrl;
        toast({
          title: "Your printable copy is ready",
          description: "It opened in a new tab.",
        });
      } else {
        // Popup was blocked - show fallback
        setPdfError("popup_blocked");
        toast({
          title: "Your printable copy is ready",
          description: "Use the buttons below to open or download.",
        });
      }
    } catch (error: any) {
      console.error("[PDF] Error generating document:", error);
      console.error("[PDF] Error message:", error?.message);
      console.error("[PDF] Error context:", error?.context);
      console.error("[PDF] Error details:", error?.details);
      if (newWindow && !newWindow.closed) newWindow.close();
      setPdfError("generation_failed");
      toast({
        title: "Printable copy could not be created",
        description: error?.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setGeneratingPdf(false);
    }
  };

  const handleDownloadDirectly = () => {
    if (lastPdfUrl) {
      const link = document.createElement('a');
      link.href = lastPdfUrl;
      link.download = 'My-Planning-Document.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleOpenPdf = () => {
    if (lastPdfUrl) {
      window.open(lastPdfUrl, "_blank", "noopener,noreferrer");
    }
  };

  const StatusIcon = ({ status }: { status: "completed" | "started" | "not_started" }) => {
    switch (status) {
      case "completed":
        return <Check className="h-5 w-5 text-green-600" />;
      case "started":
        return <Circle className="h-5 w-5 text-amber-500 fill-amber-200" />;
      default:
        return <Circle className="h-5 w-5 text-muted-foreground/40" />;
    }
  };

  if (loading) {
    return (
      <AuthenticatedLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground text-lg">Loading your summary...</p>
          </div>
        </div>
      </AuthenticatedLayout>
    );
  }

  const noSectionsSelected = selectedSections.length === 0;
  
  if (noSectionsSelected) {
    return (
      <AuthenticatedLayout>
        <div className="container mx-auto px-4 py-8 max-w-lg">
          <Card className="p-8 text-center">
            <h2 className="text-xl font-semibold mb-4">Your Plan Summary</h2>
            <p className="text-muted-foreground mb-6 text-lg">
              You haven't chosen any sections yet. Start by selecting what you'd like to include.
            </p>
            <Button onClick={() => navigate("/preplandashboard/preferences")} size="lg" className="w-full">
              Choose Your Sections
            </Button>
          </Card>
        </div>
      </AuthenticatedLayout>
    );
  }

  const completedCount = sections.filter(s => s.status === "completed").length;
  const startedCount = sections.filter(s => s.status === "started").length;

  return (
    <AuthenticatedLayout>
      <div className="container mx-auto px-4 py-6 max-w-lg print:p-0">
        {/* Top Navigation */}
        <div className="mb-6 space-y-2">
          <Button 
            variant="ghost" 
            onClick={() => navigate("/home-senior")}
            className="text-muted-foreground h-12 px-4 text-base"
          >
            ← Back to Home
          </Button>
          <Button 
            variant="ghost" 
            onClick={() => navigate("/preplandashboard")}
            className="text-muted-foreground h-12 px-4 text-base"
          >
            ← Back to My Planner
          </Button>
        </div>

        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl sm:text-3xl font-semibold text-foreground">
            Your Plan Summary
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">
            Everything you've planned, in one place.
          </p>
        </div>

        {/* Primary Action + Share with Family */}
        <div className="mb-8 space-y-3">
          <Button 
            onClick={handleDownloadPDF}
            disabled={generatingPdf}
            size="lg"
            className="w-full h-14 text-lg font-medium gap-3"
          >
            {generatingPdf ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Creating Your Printable Copy...
              </>
            ) : (
              <>
                <Download className="h-5 w-5" />
                Printable Copy
              </>
            )}
          </Button>
          <p className="text-sm text-muted-foreground text-center">
            You can print or save your plan anytime.
          </p>
          
          {/* Fallback buttons when popup blocked */}
          {pdfError === "popup_blocked" && lastPdfUrl && (
            <Card className="p-4 bg-amber-50 border-amber-200">
              <p className="text-foreground font-medium mb-3">
                Your printable copy is ready.
              </p>
              <p className="text-sm text-muted-foreground mb-4">
                We could not open it automatically. Use the buttons below.
              </p>
              <div className="space-y-2">
                <Button 
                  onClick={handleOpenPdf}
                  className="w-full h-12"
                >
                  Open Printable Copy
                </Button>
                <Button 
                  variant="outline"
                  onClick={handleDownloadDirectly}
                  className="w-full h-12"
                >
                  Download Printable Copy
                </Button>
              </div>
            </Card>
          )}

          {/* Error state with call for help */}
          {pdfError === "generation_failed" && (
            <Card className="p-4 bg-destructive/10 border-destructive/30">
              <p className="text-foreground font-medium mb-2">
                Something didn't work. Please try again.
              </p>
              <p className="text-sm text-muted-foreground mb-4">
                If the problem continues, we're here to help.
              </p>
              <div className="space-y-2">
                <Button 
                  onClick={handleDownloadPDF}
                  className="w-full h-12"
                >
                  Try Again
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => window.location.href = "tel:+18005551234"}
                  className="w-full h-12 gap-2"
                >
                  <Phone className="h-4 w-4" />
                  Call Us for Help
                </Button>
              </div>
            </Card>
          )}

          {/* Most Recent Printable Copy link */}
          {lastPdfUrl && !pdfError && (
            <div className="text-center">
              <Button 
                variant="link" 
                onClick={handleOpenPdf}
                className="text-primary underline"
              >
                Open Most Recent Printable Copy
              </Button>
            </div>
          )}
          
          {/* Share with Family - ONLY placement */}
          <Button 
            variant="outline"
            size="lg"
            onClick={() => setShowShareDialog(true)}
            className="w-full h-12 text-base font-medium gap-2"
          >
            <Users className="h-5 w-5" />
            Share with Family
          </Button>
        </div>

        {/* Expandable Section Summary */}
        <Card className="mb-6">
          <Collapsible open={sectionsExpanded} onOpenChange={setSectionsExpanded}>
            <CollapsibleTrigger asChild>
              <button className="w-full p-5 flex items-center justify-between text-left hover:bg-muted/50 transition-colors rounded-t-lg">
                <div>
                  <p className="font-medium text-foreground text-lg">
                    View or edit sections
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Tap any section to review or change it. You can do this anytime.
                  </p>
                  {sectionsExpanded && (
                    <p className="text-sm text-primary mt-2">
                      Tap a section to open it.
                    </p>
                  )}
                </div>
                {sectionsExpanded ? (
                  <ChevronUp className="h-6 w-6 text-muted-foreground flex-shrink-0" />
                ) : (
                  <ChevronDown className="h-6 w-6 text-muted-foreground flex-shrink-0" />
                )}
              </button>
            </CollapsibleTrigger>
            
            {/* Summary stats when collapsed */}
            {!sectionsExpanded && (
              <div className="px-5 pb-4 flex gap-4 text-sm text-muted-foreground">
                {completedCount > 0 && (
                  <span className="flex items-center gap-1">
                    <Check className="h-4 w-4 text-green-600" />
                    {completedCount} completed
                  </span>
                )}
                {startedCount > 0 && (
                  <span className="flex items-center gap-1">
                    <Circle className="h-4 w-4 text-amber-500 fill-amber-200" />
                    {startedCount} started
                  </span>
                )}
              </div>
            )}
            
            <CollapsibleContent>
              <div className="border-t divide-y">
                {sections.map((section) => (
                  <div 
                    key={section.id}
                    className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <StatusIcon status={section.status} />
                      <span className="text-foreground truncate">{section.label}</span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(section.editRoute)}
                      className="flex-shrink-0 h-10 px-4"
                    >
                      {section.status === "not_started" ? (
                        <>
                          <Play className="h-4 w-4 mr-1" />
                          Start
                        </>
                      ) : (
                        <>
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </>
                      )}
                    </Button>
                  </div>
                ))}
              </div>
            </CollapsibleContent>
          </Collapsible>
        </Card>

        {/* Personal Notes Section */}
        <Card className="mb-6">
          <CardContent className="p-5">
            <h2 className="font-semibold text-foreground text-lg mb-2">
              Notes or Reminders for Yourself
            </h2>
            <p className="text-muted-foreground text-sm mb-4">
              Use this space to write things you still want to do, questions you have, or anything you want your family to know.
            </p>
            <Textarea
              value={personalNotes}
              onChange={(e) => setPersonalNotes(e.target.value)}
              placeholder="For example: 'Need to talk to my daughter about this.' or 'Still deciding on burial.'"
              className="min-h-[120px] text-base resize-none"
            />
            <p className="text-xs text-muted-foreground mt-2">
              Your notes are saved automatically.
            </p>
          </CardContent>
        </Card>

        {/* Optional Extras Section */}
        <div className="bg-primary/5 border border-primary/20 rounded-xl p-5 mb-6">
          <h2 className="font-semibold text-foreground mb-1">
            Optional extras
          </h2>
          <p className="text-base text-muted-foreground mb-4">
            Only if helpful — these do not affect your plan.
          </p>
          
          <div className="space-y-3">
            <Button 
              variant="outline" 
              className="w-full justify-start h-auto py-3 px-4"
              onClick={() => navigate("/product-binder")}
            >
              <FileText className="h-5 w-5 mr-3 text-primary" />
              <div className="text-left">
                <p className="font-medium">Purchase a Printed Binder</p>
                <p className="text-base text-muted-foreground">A physical copy for your home</p>
              </div>
            </Button>
            
            <Button 
              variant="outline" 
              className="w-full justify-start h-auto py-3 px-4"
              onClick={() => navigate("/custom-song")}
            >
              <Heart className="h-5 w-5 mr-3 text-primary" />
              <div className="text-left">
                <p className="font-medium">Create a Memorial Song</p>
                <p className="text-base text-muted-foreground">A personalized song for loved ones</p>
              </div>
            </Button>
          </div>
        </div>

        {/* Dialogs */}
        <ShareSummaryDialog
          open={showShareDialog}
          onOpenChange={setShowShareDialog}
        />

        {/* Hidden print footer */}
        <div className="hidden print:block mt-8 pt-4 border-t text-sm text-muted-foreground text-center">
          <p>Generated from Your Plan Summary</p>
          <p>For personal use only — not a legal document</p>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
