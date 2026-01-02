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
  User,
  Users,
  Heart,
  FileText,
  Wallet,
  Shield,
  Home,
  Dog,
  Laptop,
  Scale,
  MessageSquare,
  BookHeart,
  Check,
  Circle,
  Loader2,
  Play
} from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
// PIICollectionDialog removed - PDF generates immediately without PII collection
import { ShareSummaryDialog } from "@/components/summary/ShareSummaryDialog";
import { SETTINGS_DEFAULT } from "@/lib/sections";
import { useActivePlan, fetchPlanData } from "@/hooks/useActivePlan";
import { SECTION_ROUTES } from "@/lib/sectionRoutes";
import { buildPlanDataForPdf, normalizePlanDataForPdf } from "@/lib/buildPlanDataForPdf";
import { getSectionCompletion } from "@/lib/sectionCompletion";

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
  // PII dialog removed - PDF generates immediately
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [userEmail, setUserEmail] = useState<string>("");
  const [userId, setUserId] = useState<string>("");
  const [profile, setProfile] = useState<any>(null);
  const [contacts, setContacts] = useState<any[]>([]);
  const [pets, setPets] = useState<any[]>([]);
  const [insurance, setInsurance] = useState<any[]>([]);
  const [properties, setProperties] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [bankAccounts, setBankAccounts] = useState<any[]>([]);
  const [investments, setInvestments] = useState<any[]>([]);
  const [professionalContacts, setProfessionalContacts] = useState<any[]>([]);
  const [funeralFunding, setFuneralFunding] = useState<any[]>([]);
  const [debts, setDebts] = useState<any[]>([]);
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [selectedSections, setSelectedSections] = useState<string[]>(SETTINGS_DEFAULT);
  const [generatingPdf, setGeneratingPdf] = useState(false);
  // exportKind removed - always opens in new tab
  
  // New state for simplified UI
  const [sectionsExpanded, setSectionsExpanded] = useState(false);
  const [personalNotes, setPersonalNotes] = useState("");
  const [notesSaving, setNotesSaving] = useState(false);
  
  // State for PDF fallback handling
  const [lastPdfUrl, setLastPdfUrl] = useState<string | null>(null);
  const [pdfError, setPdfError] = useState<string | null>(null);
  
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

      // We still fetch DB tables for the UI, but we compute completion + PDF payload
      // from the SAME object used by the PDF generator (buildPlanDataForPdf).
      const data = await fetchPlanData(activePlanId);

      // Single source of truth for completion + PDF payload
      const pdfPlanData = await buildPlanDataForPdf(user.id);

      // Also merge the currently resolved plan/org (defensive)
      const mergedPlanData: any = {
        ...(pdfPlanData || {}),
        id: activePlanId,
        org_id: orgId,
      };

      setPlanData(mergedPlanData);

      // Debug (dev-only): confirm we are seeing real persisted keys + completion map
      if (import.meta.env.DEV) {
        // eslint-disable-next-line no-console
        console.log("[PrePlanSummary] planData keys:", Object.keys(mergedPlanData || {}));
        // eslint-disable-next-line no-console
        console.log("[PrePlanSummary] completion map:", getSectionCompletion(mergedPlanData));
      }

      // Hydrate UI section data (DB-first where relevant)
      const displayProfile = mergedPlanData.personal_profile || data.personalProfile || null;
      const mergedContacts = (data.contacts?.length ? data.contacts : mergedPlanData.contacts_notify) || [];
      const mergedPets = (data.pets?.length ? data.pets : mergedPlanData.pets) || [];
      const mergedInsurance = (data.insurance?.length ? data.insurance : mergedPlanData.insurance_policies) || [];
      const mergedProperties = (data.properties?.length ? data.properties : mergedPlanData.properties) || [];
      const mergedMessages = (data.messages?.length ? data.messages : mergedPlanData.messages) || [];
      const mergedBankAccounts = (data.bankAccounts?.length ? data.bankAccounts : mergedPlanData.bank_accounts) || [];
      const mergedInvestments = (data.investments?.length ? data.investments : mergedPlanData.investments) || [];
      const mergedProfessionalContacts = (data.professionalContacts?.length ? data.professionalContacts : mergedPlanData.contacts_professional) || [];
      const mergedFuneralFunding = (data.funeralFunding?.length ? data.funeralFunding : mergedPlanData.funeral_funding) || [];
      const mergedDebts = (data.debts?.length ? data.debts : mergedPlanData.debts) || [];
      const mergedBusinesses = (data.businesses?.length ? data.businesses : mergedPlanData.businesses) || [];

      setProfile(displayProfile);
      setContacts(mergedContacts);
      setPets(mergedPets);
      setInsurance(mergedInsurance);
      setProperties(mergedProperties);
      setMessages(mergedMessages);
      setBankAccounts(mergedBankAccounts);
      setInvestments(mergedInvestments);
      setProfessionalContacts(mergedProfessionalContacts);
      setFuneralFunding(mergedFuneralFunding);
      setDebts(mergedDebts);
      setBusinesses(mergedBusinesses);

      const userSelectedSections = settings?.selected_sections?.length
        ? settings.selected_sections
        : SETTINGS_DEFAULT;
      const selectedSet = new Set(userSelectedSections);

      const completion = getSectionCompletion(mergedPlanData);
      const getSectionStatus = (sectionId: string): "completed" | "started" | "not_started" =>
        completion[sectionId] ? "completed" : "not_started";

      const allPossibleSections: SectionData[] = [
        {
          id: "personal",
          label: "About You",
          icon: <User className="h-5 w-5" />,
          status: getSectionStatus("personal"),
          editRoute: SECTION_ROUTES.personal,
        },
        {
          id: "contacts",
          label: "Important Contacts",
          icon: <Users className="h-5 w-5" />,
          status: getSectionStatus("contacts"),
          editRoute: SECTION_ROUTES.contacts,
        },
        {
          id: "healthcare",
          label: "Medical & Care Preferences",
          icon: <Heart className="h-5 w-5" />,
          status: getSectionStatus("healthcare"),
          editRoute: "/preplandashboard/health-care",
        },
        {
          id: "carepreferences",
          label: "Care Preferences",
          icon: <Heart className="h-5 w-5" />,
          status: getSectionStatus("carepreferences"),
          editRoute: "/preplandashboard/care-preferences",
        },
        {
          id: "funeral",
          label: "Funeral Wishes",
          icon: <Heart className="h-5 w-5" />,
          status: getSectionStatus("funeral"),
          editRoute: SECTION_ROUTES.funeral,
        },
        {
          id: "insurance",
          label: "Insurance",
          icon: <Shield className="h-5 w-5" />,
          status: getSectionStatus("insurance"),
          editRoute: SECTION_ROUTES.insurance,
        },
        {
          id: "property",
          label: "Property & Valuables",
          icon: <Home className="h-5 w-5" />,
          status: getSectionStatus("property"),
          editRoute: SECTION_ROUTES.property,
        },
        {
          id: "pets",
          label: "Pets",
          icon: <Dog className="h-5 w-5" />,
          status: getSectionStatus("pets"),
          editRoute: SECTION_ROUTES.pets,
        },
        {
          id: "messages",
          label: "Messages to Loved Ones",
          icon: <MessageSquare className="h-5 w-5" />,
          status: getSectionStatus("messages"),
          editRoute: SECTION_ROUTES.messages,
        },
      ];

      const filtered = allPossibleSections.filter((s) => selectedSet.has(s.id));
      setSections(filtered);
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

  const handleDownloadPDF = async () => {
    setGeneratingPdf(true);
    setPdfError(null);

    // Dev logging
    if (import.meta.env.DEV) {
      console.log("[PrePlanSummary] Starting printable copy generation...");
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: "Please sign in",
          description: "You need to be signed in to generate your document.",
          variant: "destructive",
        });
        return;
      }

      // Build the payload from the SAME source used by PDF generation everywhere.
      const planDataForPdf = await buildPlanDataForPdf(session.user.id);
      const normalizedPlanData = normalizePlanDataForPdf(planDataForPdf);

      const { data: pdfData, error } = await supabase.functions.invoke("generate-planner-pdf", {
        body: {
          planData: normalizedPlanData,
          selectedSections,
          piiData: {},
          docType: "planner",
          isDraft: false,
        },
      });

      if (error) {
        if (import.meta.env.DEV) {
          console.error("[PrePlanSummary] Edge function error:", error);
        }
        throw error;
      }

      if (!pdfData?.pdfBase64) {
        throw new Error("Printable copy generation returned no data");
      }

      if (import.meta.env.DEV) {
        console.log("[PrePlanSummary] Successfully received PDF data");
      }

      const byteCharacters = atob(pdfData.pdfBase64);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);

      // Store URL for fallback access
      setLastPdfUrl(url);

      // Try to open in new tab
      const newWindow = window.open(url, "_blank", "noopener,noreferrer");

      if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
        // Pop-up was blocked - show fallback UI
        setPdfError("popup_blocked");
        toast({
          title: "Your printable copy is ready",
          description: "Use the buttons below to open or download your document.",
        });
      } else {
        toast({
          title: "Your printable copy is ready",
          description: "It opened in a new tab. You can save or print from there.",
        });
      }
    } catch (error) {
      console.error("Error generating document:", error);
      setPdfError("generation_failed");
      toast({
        title: "Something didn't work",
        description: "Please try again. If the problem continues, call us for help.",
        variant: "destructive",
      });
    } finally {
      setGeneratingPdf(false);
    }
  };

  // Download PDF directly
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

  // Open PDF in new tab (for retry)
  const handleOpenPdf = () => {
    if (lastPdfUrl) {
      window.open(lastPdfUrl, "_blank", "noopener,noreferrer");
    }
  };

  // Render status icon
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
            <Button onClick={() => navigate(SECTION_ROUTES.preferences)} size="lg" className="w-full">
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

        {/* Page Title */}
        <div className="mb-6 text-center">
          <h1 className="text-2xl sm:text-3xl font-bold mb-3 text-foreground">Your Plan Summary</h1>
          <p className="text-muted-foreground text-base sm:text-lg leading-relaxed">
            You can review or change anything at any time. You do not need to finish everything at once.
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
          
          {/* Fallback buttons when popup blocked or PDF ready */}
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
              <Button 
                variant="outline"
                onClick={() => window.location.href = "tel:+18005551234"}
                className="w-full h-12"
              >
                Call Us for Help
              </Button>
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
          
          {/* Share with Family - secondary action, visually grouped */}
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
                    Your completed sections
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    This shows what you have already filled in. You can view or edit any section at any time.
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

        {/* Optional Extras Section - removed duplicate Share button */}
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


        {/* Dialogs - PII dialog removed */}
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
