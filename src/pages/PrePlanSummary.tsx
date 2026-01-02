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
import { PIICollectionDialog } from "@/components/planner/PIICollectionDialog";
import { ShareSummaryDialog } from "@/components/summary/ShareSummaryDialog";
import { SETTINGS_DEFAULT } from "@/lib/sections";
import { useActivePlan, fetchPlanData } from "@/hooks/useActivePlan";
import { SECTION_ROUTES } from "@/lib/sectionRoutes";
import { buildPlanDataForPdf, normalizePlanDataForPdf } from "@/lib/buildPlanDataForPdf";

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
  const [showPIIDialog, setShowPIIDialog] = useState(false);
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
  const [exportKind, setExportKind] = useState<"download" | "print" | "email">("download");
  
  // New state for simplified UI
  const [sectionsExpanded, setSectionsExpanded] = useState(false);
  const [personalNotes, setPersonalNotes] = useState("");
  const [notesSaving, setNotesSaving] = useState(false);
  
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

      const data = await fetchPlanData(activePlanId);
      
      let localPlan: any | null = null;
      try {
        const raw = localStorage.getItem(`plan_${user.id}`);
        if (raw) localPlan = JSON.parse(raw);
      } catch (e) {
        console.warn("[PrePlanSummary] Failed to parse local plan", e);
      }

      const mergedPlan: any = {
        ...(localPlan || {}),
        ...(data.plan || {}),
        id: activePlanId,
        org_id: orgId,
      };

      setPlanData(mergedPlan);

      const dbProfile = data.personalProfile;
      const localProfile = localPlan?.personal_profile;
      const mergedProfile = {
        ...(dbProfile || {}),
        ...(localProfile || {}),
      };
      
      const dbContacts = data.contacts || [];
      const dbMessages = data.messages || [];
      const dbProperties = data.properties || [];
      const dbPets = data.pets || [];
      const dbInsurance = data.insurance || [];
      const dbBankAccounts = data.bankAccounts || [];
      const dbInvestments = data.investments || [];
      const dbProfessionalContacts = data.professionalContacts || [];
      const dbFuneralFunding = data.funeralFunding || [];
      const dbDebts = data.debts || [];
      const dbBusinesses = data.businesses || [];
      
      const localContacts = localPlan?.contacts_notify || localPlan?.contacts || [];
      const localPets = localPlan?.pets || [];
      const localInsurance = localPlan?.insurance_policies || localPlan?.insurance || [];
      const localProperties = localPlan?.properties || [];
      const localMessages = localPlan?.messages || [];
      const localBankAccounts = localPlan?.bank_accounts || [];
      const localInvestments = localPlan?.investments || [];
      const localProfessionalContacts = localPlan?.contacts_professional || [];
      const localFuneralFunding = localPlan?.funeral_funding || [];
      const localDebts = localPlan?.debts || [];
      const localBusinesses = localPlan?.businesses || [];
      
      const mergedContacts = dbContacts.length > 0 ? dbContacts : localContacts;
      const mergedPets = dbPets.length > 0 ? dbPets : localPets;
      const mergedInsurance = dbInsurance.length > 0 ? dbInsurance : localInsurance;
      const mergedProperties = dbProperties.length > 0 ? dbProperties : localProperties;
      const mergedMessages = dbMessages.length > 0 ? dbMessages : localMessages;
      const mergedBankAccounts = dbBankAccounts.length > 0 ? dbBankAccounts : localBankAccounts;
      const mergedInvestments = dbInvestments.length > 0 ? dbInvestments : localInvestments;
      const mergedProfessionalContacts = dbProfessionalContacts.length > 0 ? dbProfessionalContacts : localProfessionalContacts;
      const mergedFuneralFunding = dbFuneralFunding.length > 0 ? dbFuneralFunding : localFuneralFunding;
      const mergedDebts = dbDebts.length > 0 ? dbDebts : localDebts;
      const mergedBusinesses = dbBusinesses.length > 0 ? dbBusinesses : localBusinesses;

      setProfile(Object.keys(mergedProfile).length > 0 ? mergedProfile : null);
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

      // Determine status for each section
      const getSectionStatus = (hasContent: boolean, hasPartialContent: boolean): "completed" | "started" | "not_started" => {
        if (hasContent) return "completed";
        if (hasPartialContent) return "started";
        return "not_started";
      };

      const displayProfile = Object.keys(mergedProfile).length > 0 ? mergedProfile : null;
      
      // Load health care and care preferences from localStorage to determine status
      let healthCareData: any = {};
      let carePreferencesData: any = {};
      try {
        const healthRaw = localStorage.getItem(`healthcare_${user.id}`);
        if (healthRaw) healthCareData = JSON.parse(healthRaw);
        const careRaw = localStorage.getItem(`care_preferences_${user.id}`);
        if (careRaw) carePreferencesData = JSON.parse(careRaw);
      } catch (e) {
        console.warn("[PrePlanSummary] Failed to parse health/care data", e);
      }

      const hasHealthCareData = !!(
        (healthCareData.conditions?.length > 0) ||
        (healthCareData.allergies?.length > 0) ||
        (healthCareData.medications?.length > 0) ||
        healthCareData.doctorPharmacy?.primaryDoctorName ||
        healthCareData.advanceDirectiveStatus ||
        healthCareData.dnrPolstStatus
      );

      const hasCarePreferencesData = !!(
        (carePreferencesData.comfortPainCare?.length > 0) ||
        (carePreferencesData.careSetting?.length > 0) ||
        (carePreferencesData.visitorsCompanionship?.length > 0) ||
        (carePreferencesData.spiritualCultural?.length > 0) ||
        (carePreferencesData.communicationPreferences?.length > 0) ||
        (carePreferencesData.personalComfortItems?.length > 0) ||
        carePreferencesData.additionalNotes
      );

      const allPossibleSections: SectionData[] = [
        {
          id: "personal",
          label: "Personal & Family Details",
          icon: <User className="h-5 w-5" />,
          status: getSectionStatus(
            !!(displayProfile?.full_name && displayProfile?.address),
            !!(displayProfile?.full_name || displayProfile?.address || mergedPlan?.prepared_for)
          ),
          editRoute: SECTION_ROUTES.personal,
        },
        {
          id: "contacts",
          label: "Key Contacts to Notify",
          icon: <Users className="h-5 w-5" />,
          status: getSectionStatus(mergedContacts.length >= 2, mergedContacts.length > 0),
          editRoute: SECTION_ROUTES.contacts,
        },
        {
          id: "healthcare",
          label: "Medical Information",
          icon: <Heart className="h-5 w-5" />,
          status: getSectionStatus(hasHealthCareData, false),
          editRoute: "/preplandashboard/health-care",
        },
        {
          id: "carepreferences",
          label: "Care Preferences",
          icon: <Heart className="h-5 w-5" />,
          status: getSectionStatus(hasCarePreferencesData, false),
          editRoute: "/preplandashboard/care-preferences",
        },
        {
          id: "funeral",
          label: "Funeral Wishes",
          icon: <Heart className="h-5 w-5" />,
          status: getSectionStatus(!!mergedPlan.funeral_wishes_notes, false),
          editRoute: SECTION_ROUTES.funeral,
        },
        {
          id: "insurance",
          label: "Insurance Overview",
          icon: <Shield className="h-5 w-5" />,
          status: getSectionStatus(
            mergedInsurance.length > 0 || !!mergedPlan.insurance_notes,
            false
          ),
          editRoute: SECTION_ROUTES.insurance,
        },
        {
          id: "property",
          label: "Property & Valuables",
          icon: <Home className="h-5 w-5" />,
          status: getSectionStatus(
            mergedProperties.length > 0 || !!mergedPlan.property_notes,
            false
          ),
          editRoute: SECTION_ROUTES.property,
        },
        {
          id: "pets",
          label: "Pet Care",
          icon: <Dog className="h-5 w-5" />,
          status: getSectionStatus(
            mergedPets.length > 0 || !!mergedPlan.pets_notes,
            false
          ),
          editRoute: SECTION_ROUTES.pets,
        },
        {
          id: "messages",
          label: "Messages to Loved Ones",
          icon: <MessageSquare className="h-5 w-5" />,
          status: getSectionStatus(
            mergedMessages.length > 0 || !!mergedPlan.messages_notes || !!mergedPlan.to_loved_ones_message,
            false
          ),
          editRoute: SECTION_ROUTES.messages,
        },
      ];

      const filtered = allPossibleSections.filter(s => selectedSet.has(s.id));
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
    setExportKind("download");
    setShowPIIDialog(true);
  };

  const handlePIISubmit = async (piiData: any) => {
    setShowPIIDialog(false);
    setGeneratingPdf(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: "Please sign in",
          description: "You need to be signed in to generate your document.",
          variant: "destructive"
        });
        return;
      }

      // Build the PDF payload using the already-loaded data
      const pdfPayload = {
        id: planId,
        org_id: orgId,
        prepared_for: profile?.full_name || planData?.prepared_for || "",
        personal_profile: profile || {},
        contacts_notify: contacts || [],
        pets: pets || [],
        insurance_policies: insurance || [],
        properties: properties || [],
        messages: messages || [],
        investments: investments || [],
        debts: debts || [],
        bank_accounts: bankAccounts || [],
        businesses: businesses || [],
        funeral_funding: funeralFunding || [],
        contacts_professional: professionalContacts || [],
        about_me_notes: planData?.about_me_notes || "",
        funeral_wishes_notes: planData?.funeral_wishes_notes || "",
        financial_notes: planData?.financial_notes || "",
        insurance_notes: planData?.insurance_notes || "",
        property_notes: planData?.property_notes || "",
        pets_notes: planData?.pets_notes || "",
        digital_notes: planData?.digital_notes || "",
        legal_notes: planData?.legal_notes || "",
        messages_notes: planData?.messages_notes || "",
        to_loved_ones_message: planData?.to_loved_ones_message || "",
      };

      const normalizedPayload = normalizePlanDataForPdf(pdfPayload);

      const payload = {
        ...normalizedPayload,
        pii: piiData,
        userId: userId,
        planId: planId,
        orgId: orgId,
        selectedSections,
      };

      const { data: pdfData, error } = await supabase.functions.invoke("generate-planner-pdf", {
        body: payload,
      });

      if (error) throw error;

      if (pdfData?.pdfBase64) {
        const byteCharacters = atob(pdfData.pdfBase64);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        const filename = pdfData.filename || `My-Planning-Document-${new Date().toISOString().split('T')[0]}.pdf`;
        link.download = filename;
        link.click();
        URL.revokeObjectURL(url);
      }

      toast({
        title: "Document Created",
        description: "Your planning document has been generated successfully."
      });
    } catch (error) {
      console.error("Error generating document:", error);
      toast({
        title: "Error",
        description: "Failed to create your document. Please try again.",
        variant: "destructive"
      });
    } finally {
      setGeneratingPdf(false);
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
                Creating Document...
              </>
            ) : (
              <>
                <Download className="h-5 w-5" />
                View or Print My Planning Document
              </>
            )}
          </Button>
          
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
                    View what you've already filled in
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    You can update any section at any time.
                  </p>
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

        {/* Return to Planner */}
        <div className="text-center">
          <Button 
            variant="ghost" 
            onClick={() => navigate("/preplandashboard")}
            className="text-muted-foreground"
          >
            ← Return to My Planner
          </Button>
        </div>

        {/* Dialogs */}
        <PIICollectionDialog
          open={showPIIDialog}
          onOpenChange={setShowPIIDialog}
          onSubmit={handlePIISubmit}
        />

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
