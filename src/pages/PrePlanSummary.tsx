import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { AuthenticatedLayout } from "@/components/AuthenticatedLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Download, 
  Printer, 
  Mail,
  Save,
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
  AlertTriangle,
  ArrowRight,
  X,
  Loader2,
  ExternalLink
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { PIICollectionDialog } from "@/components/planner/PIICollectionDialog";
import { ShareSummaryDialog } from "@/components/summary/ShareSummaryDialog";
import { WhatsMissingIndicator } from "@/components/summary/WhatsMissingIndicator";
import { ReminderEmailOptIn } from "@/components/summary/ReminderEmailOptIn";
import { PdfReadinessModal, PdfReadinessBadge } from "@/components/summary/PdfReadinessModal";
import { usePdfValidation } from "@/hooks/usePdfValidation";
import { SETTINGS_DEFAULT } from "@/lib/sections";
import { useActivePlan, fetchPlanData } from "@/hooks/useActivePlan";
import { SECTION_ROUTES } from "@/lib/sectionRoutes";
import { buildPlanDataForPdf, normalizePlanDataForPdf } from "@/lib/buildPlanDataForPdf";

interface SectionData {
  id: string;
  label: string;
  icon: React.ReactNode;
  content: React.ReactNode;
  hasContent: boolean;
  editRoute: string;
}

export default function PrePlanSummary() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  
  // Use the unified active plan hook - SINGLE SOURCE OF TRUTH
  const { loading: planLoading, planId, orgId, plan: activePlan, error: planError } = useActivePlan();
  
  const [dataLoading, setDataLoading] = useState(true);
  const [planData, setPlanData] = useState<any>(null);
  const [sections, setSections] = useState<SectionData[]>([]);
  const [showPIIDialog, setShowPIIDialog] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [showReadinessModal, setShowReadinessModal] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string>("");
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
  const [showFirstTimeHelper, setShowFirstTimeHelper] = useState(false);
  const [selectedSections, setSelectedSections] = useState<string[]>(SETTINGS_DEFAULT);
  
  // Combined loading state
  const loading = planLoading || dataLoading;
  
  // PDF Validation
  const validationResult = usePdfValidation(
    { ...planData, personal_profile: profile, contacts },
    selectedSections
  );
  
  // Check if first-time visitor to summary page
  useEffect(() => {
    const hasSeenHelper = localStorage.getItem("preplan_summary_helper_seen");
    if (!hasSeenHelper) {
      setShowFirstTimeHelper(true);
    }
  }, []);

  const dismissFirstTimeHelper = () => {
    localStorage.setItem("preplan_summary_helper_seen", "true");
    setShowFirstTimeHelper(false);
  };

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
      
      // Load selected sections from user settings
      const { data: settings } = await supabase
        .from("user_settings")
        .select("selected_sections")
        .eq("user_id", user.id)
        .maybeSingle();
      
      if (settings?.selected_sections?.length) {
        setSelectedSections(settings.selected_sections);
      }

      // Fetch all plan data using the unified function - SINGLE SOURCE OF TRUTH
      const data = await fetchPlanData(activePlanId);
      
      // Also load localStorage for any unsaved local changes
      let localPlan: any | null = null;
      try {
        const raw = localStorage.getItem(`plan_${user.id}`);
        if (raw) localPlan = JSON.parse(raw);
      } catch (e) {
        console.warn("[PrePlanSummary] Failed to parse local plan", e);
      }

      // Merge: DB is source of truth for structured data, localStorage for notes
      const mergedPlan: any = {
        ...(localPlan || {}),
        ...(data.plan || {}),
        id: activePlanId,
        org_id: orgId,
      };

      setPlanData(mergedPlan);
      setLastUpdated(mergedPlan.updated_at || null);

      // CRITICAL: Merge localStorage personal_profile with DB data
      // The form saves to localStorage, not the personal_profiles table
      const dbProfile = data.personalProfile;
      const localProfile = localPlan?.personal_profile;
      
      // Merge: prefer localStorage (where form saves) over DB
      const mergedProfile = {
        ...(dbProfile || {}),
        ...(localProfile || {}),
      };
      
      // CRITICAL: Merge DB arrays with localStorage arrays
      // The planner forms may save to localStorage, not the Supabase tables
      const dbContacts = data.contacts || [];
      const dbMessages = data.messages || [];
      const dbProperties = data.properties || [];
      const dbPets = data.pets || [];
      const dbInsurance = data.insurance || [];
      const dbBankAccounts = data.bankAccounts || [];
      const dbInvestments = data.investments || [];
      const dbProfessionalContacts = data.professionalContacts || [];
      const dbFuneralFunding = data.funeralFunding || [];
      
      // Prefer localStorage arrays if they exist and have data, otherwise use DB
      const localContacts = localPlan?.contacts_notify || localPlan?.contacts || [];
      const localPets = localPlan?.pets || [];
      const localInsurance = localPlan?.insurance_policies || localPlan?.insurance || [];
      const localProperties = localPlan?.properties || [];
      const localMessages = localPlan?.messages || [];
      const localBankAccounts = localPlan?.bank_accounts || [];
      const localInvestments = localPlan?.investments || [];
      const localProfessionalContacts = localPlan?.contacts_professional || [];
      const localFuneralFunding = localPlan?.funeral_funding || [];
      
      // Use DB if it has data, otherwise fall back to localStorage
      const mergedContacts = dbContacts.length > 0 ? dbContacts : localContacts;
      const mergedPets = dbPets.length > 0 ? dbPets : localPets;
      const mergedInsurance = dbInsurance.length > 0 ? dbInsurance : localInsurance;
      const mergedProperties = dbProperties.length > 0 ? dbProperties : localProperties;
      const mergedMessages = dbMessages.length > 0 ? dbMessages : localMessages;
      const mergedBankAccounts = dbBankAccounts.length > 0 ? dbBankAccounts : localBankAccounts;
      const mergedInvestments = dbInvestments.length > 0 ? dbInvestments : localInvestments;
      const mergedProfessionalContacts = dbProfessionalContacts.length > 0 ? dbProfessionalContacts : localProfessionalContacts;
      const mergedFuneralFunding = dbFuneralFunding.length > 0 ? dbFuneralFunding : localFuneralFunding;

      // Use merged profile that includes localStorage data
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
      
      // Debug log for validation troubleshooting
      console.log("[PrePlanSummary] Data resolution:", {
        dbProfile: !!dbProfile,
        localProfile: !!localProfile,
        mergedFullName: mergedProfile?.full_name,
        mergedAddress: mergedProfile?.address,
        preparedFor: mergedPlan?.prepared_for,
        dbContactsCount: dbContacts.length,
        localContactsCount: localContacts.length,
        mergedContactsCount: mergedContacts.length,
        dbPetsCount: dbPets.length,
        localPetsCount: localPets.length,
        mergedPetsCount: mergedPets.length,
        dbInsuranceCount: dbInsurance.length,
        localInsuranceCount: localInsurance.length,
        mergedInsuranceCount: mergedInsurance.length,
      });

      // Get the user's selected sections from settings
      const userSelectedSections = settings?.selected_sections?.length 
        ? settings.selected_sections 
        : SETTINGS_DEFAULT;
      const selectedSet = new Set(userSelectedSections);

      // Build ALL possible sections with content from merged data
      const displayProfile = Object.keys(mergedProfile).length > 0 ? mergedProfile : null;
      
      const allPossibleSections: SectionData[] = [
        {
          id: "personal",
          label: "Personal & Family Details",
          icon: <User className="h-5 w-5" />,
          content: displayProfile ? (
            <div className="space-y-2 text-sm">
              {displayProfile.full_name && (
                <p>
                  <strong>Name:</strong> {displayProfile.full_name}
                </p>
              )}
              {displayProfile.address && (
                <p>
                  <strong>Address:</strong> {displayProfile.address}
                </p>
              )}
              {displayProfile.marital_status && (
                <p>
                  <strong>Marital Status:</strong> {displayProfile.marital_status}
                </p>
              )}
              {displayProfile.partner_name && (
                <p>
                  <strong>Spouse/Partner:</strong> {displayProfile.partner_name}
                </p>
              )}
              {Array.isArray(displayProfile.child_names) && displayProfile.child_names.filter(Boolean).length > 0 && (
                <p>
                  <strong>Children:</strong> {displayProfile.child_names.filter(Boolean).join(", ")}
                </p>
              )}
            </div>
          ) : null,
          hasContent: !!(displayProfile?.full_name || mergedPlan?.prepared_for),
          editRoute: SECTION_ROUTES.personal,
        },
        {
          id: "contacts",
          label: "Key Contacts to Notify",
          icon: <Users className="h-5 w-5" />,
          content: mergedContacts.length > 0 ? (
            <div className="space-y-2 text-sm">
              <p>
                <strong>Contacts:</strong> {mergedContacts.length} saved
              </p>
              <div className="space-y-1">
                {mergedContacts.slice(0, 5).map((c: any, idx: number) => (
                  <p key={idx} className="text-muted-foreground">
                    {c?.name || "(Unnamed)"}
                    {c?.relationship ? ` — ${c.relationship}` : ""}
                  </p>
                ))}
                {mergedContacts.length > 5 && (
                  <p className="text-muted-foreground">…and {mergedContacts.length - 5} more</p>
                )}
              </div>
            </div>
          ) : null,
          hasContent: mergedContacts.length > 0,
          editRoute: SECTION_ROUTES.contacts,
        },
        {
          id: "legacy",
          label: "Life Story & Legacy",
          icon: <BookHeart className="h-5 w-5" />,
          content: mergedPlan.about_me_notes ? (
            <p className="text-sm">{mergedPlan.about_me_notes}</p>
          ) : null,
          hasContent: !!mergedPlan.about_me_notes,
          editRoute: SECTION_ROUTES.legacy,
        },
        {
          id: "funeral",
          label: "Funeral Wishes",
          icon: <Heart className="h-5 w-5" />,
          content: mergedPlan.funeral_wishes_notes ? (
            <p className="text-sm">{mergedPlan.funeral_wishes_notes}</p>
          ) : null,
          hasContent: !!mergedPlan.funeral_wishes_notes,
          editRoute: SECTION_ROUTES.funeral,
        },
        {
          id: "financial",
          label: "Financial Life (Summary)",
          icon: <Wallet className="h-5 w-5" />,
          content: mergedPlan.financial_notes ? (
            <p className="text-sm">{mergedPlan.financial_notes}</p>
          ) : null,
          hasContent: !!mergedPlan.financial_notes,
          editRoute: SECTION_ROUTES.financial,
        },
        {
          id: "insurance",
          label: "Insurance (Summary)",
          icon: <Shield className="h-5 w-5" />,
          content: mergedInsurance.length > 0 ? (
            <p className="text-sm">
              <strong>Policies:</strong> {mergedInsurance.length} saved
            </p>
          ) : mergedPlan.insurance_notes ? (
            <p className="text-sm">{mergedPlan.insurance_notes}</p>
          ) : null,
          hasContent: !!mergedPlan.insurance_notes || mergedInsurance.length > 0,
          editRoute: SECTION_ROUTES.insurance,
        },
        {
          id: "property",
          label: "Property & Valuables",
          icon: <Home className="h-5 w-5" />,
          content: mergedProperties.length > 0 || mergedPlan.property_notes ? (
            <div className="space-y-2 text-sm">
              {mergedProperties.length > 0 && (
                <p>
                  <strong>Items:</strong> {mergedProperties.length} listed
                </p>
              )}
              {mergedPlan.property_notes && <p>{mergedPlan.property_notes}</p>}
            </div>
          ) : null,
          hasContent: mergedProperties.length > 0 || !!mergedPlan.property_notes,
          editRoute: SECTION_ROUTES.property,
        },
        {
          id: "legal",
          label: "Legal & Planning Notes",
          icon: <Scale className="h-5 w-5" />,
          content: mergedPlan.legal_notes ? (
            <p className="text-sm">{mergedPlan.legal_notes}</p>
          ) : null,
          hasContent: !!mergedPlan.legal_notes,
          editRoute: SECTION_ROUTES.legal,
        },
        {
          id: "pets",
          label: "Pet Care",
          icon: <Dog className="h-5 w-5" />,
          content: mergedPets.length > 0 || mergedPlan.pets_notes ? (
            <div className="space-y-2 text-sm">
              {mergedPets.length > 0 && (
                <p><strong>Pets:</strong> {mergedPets.length} listed</p>
              )}
              {mergedPlan.pets_notes && <p>{mergedPlan.pets_notes}</p>}
            </div>
          ) : null,
          hasContent: mergedPets.length > 0 || !!mergedPlan.pets_notes,
          editRoute: SECTION_ROUTES.pets,
        },
        {
          id: "digital",
          label: "Online Accounts",
          icon: <Laptop className="h-5 w-5" />,
          content: mergedPlan.digital_notes ? (
            <p className="text-sm">{mergedPlan.digital_notes}</p>
          ) : null,
          hasContent: !!mergedPlan.digital_notes,
          editRoute: SECTION_ROUTES.digital,
        },
        {
          id: "messages",
          label: "Messages to Loved Ones",
          icon: <MessageSquare className="h-5 w-5" />,
          content: mergedMessages.length > 0 || mergedPlan.to_loved_ones_message || mergedPlan.messages_notes ? (
            <div className="space-y-2 text-sm">
              {mergedMessages.length > 0 && (
                <p>
                  <strong>Messages:</strong> {mergedMessages.length} written
                </p>
              )}
              {mergedPlan.to_loved_ones_message && <p>{mergedPlan.to_loved_ones_message}</p>}
              {mergedPlan.messages_notes && <p>{mergedPlan.messages_notes}</p>}
            </div>
          ) : null,
          hasContent: mergedMessages.length > 0 || !!mergedPlan.messages_notes || !!mergedPlan.to_loved_ones_message,
          editRoute: SECTION_ROUTES.messages,
        },
      ];

      // CRITICAL: Only include sections that user selected in Preferences
      // This is the single source of truth - section exists if selected, not if data exists
      const filteredSections = allPossibleSections.filter(s => selectedSet.has(s.id));

      setSections(filteredSections);

      console.log("[PrePlanSummary] Plan resolution:", {
        userId: user.id,
        planId: activePlanId,
        orgId,
        sectionsCount: filteredSections.length,
        mergedContactsCount: mergedContacts.length,
        mergedPropertiesCount: mergedProperties.length,
        mergedPetsCount: mergedPets.length,
        mergedInsuranceCount: mergedInsurance.length,
      });
    } catch (error) {
      console.error("Error loading plan data:", error);
      toast({
        title: "Error",
        description: "Failed to load your planning summary.",
        variant: "destructive",
      });
    } finally {
      setDataLoading(false);
    }
  };

  const [generatingPdf, setGeneratingPdf] = useState(false);
  const [isDraftMode, setIsDraftMode] = useState(false);

  const handleDownloadPDF = () => {
    // Check validation first
    if (!validationResult.isValid) {
      setShowReadinessModal(true);
      return;
    }
    setIsDraftMode(false);
    setShowPIIDialog(true);
  };

  const handleDownloadDraft = () => {
    setIsDraftMode(true);
    setShowPIIDialog(true);
  };

  const handlePrintDraft = () => {
    setIsDraftMode(true);
    // For now, trigger the same flow - the PDF will be marked as draft
    setShowPIIDialog(true);
  };

  const handleEmailDraft = () => {
    setIsDraftMode(true);
    // For now, we'll use the share dialog for email functionality
    toast({
      title: "Coming soon",
      description: "Email draft functionality will be available soon. Please use Download or Print for now.",
    });
  };

  const handlePIISubmit = async (piiData: any) => {
    try {
      setGeneratingPdf(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Build PDF payload using ALREADY LOADED state data
      // This ensures the PDF gets the exact same data shown on the summary page
      const pdfPlanData = {
        // Plan metadata
        id: planId,
        org_id: orgId,
        prepared_by: piiData.prepared_by || profile?.full_name || planData?.preparer_name,
        prepared_for: piiData.full_name || profile?.full_name || planData?.prepared_for,
        title: planData?.title,
        updated_at: planData?.updated_at,

        // Personal profile (merged from state + PII modal)
        personal_profile: {
          ...(profile || {}),
          full_name: piiData.full_name || profile?.full_name,
          address: piiData.address || profile?.address,
          ssn: piiData.ssn, // SSN only from PII modal, never stored
        },

        // Notes from planData state
        instructions_notes: planData?.instructions_notes || "",
        about_me_notes: planData?.about_me_notes || "",
        checklist_notes: planData?.checklist_notes || "",
        funeral_wishes_notes: planData?.funeral_wishes_notes || "",
        financial_notes: planData?.financial_notes || "",
        insurance_notes: planData?.insurance_notes || "",
        property_notes: planData?.property_notes || "",
        pets_notes: planData?.pets_notes || "",
        digital_notes: planData?.digital_notes || "",
        legal_notes: planData?.legal_notes || "",
        messages_notes: planData?.messages_notes || "",
        to_loved_ones_message: planData?.to_loved_ones_message || "",

        // Arrays from state (loaded from Supabase in loadPlanData)
        contacts_notify: contacts,
        pets: pets,
        insurance_policies: insurance,
        properties: properties,
        messages: messages,
        bank_accounts: bankAccounts,
        investments: investments,
        contacts_professional: professionalContacts,
        funeral_funding: funeralFunding,

        // Section visibility
        _visibleSections: selectedSections,
      };

      // CRITICAL DEBUG LOG - shows exactly what is sent to PDF
      console.log("[PrePlanSummary] PDF planData payload:", {
        planId: pdfPlanData.id,
        prepared_for: pdfPlanData.prepared_for,
        profile_full_name: pdfPlanData.personal_profile?.full_name,
        profile_address: pdfPlanData.personal_profile?.address,
        contacts_notify_count: pdfPlanData.contacts_notify?.length,
        pets_count: pdfPlanData.pets?.length,
        insurance_policies_count: pdfPlanData.insurance_policies?.length,
        properties_count: pdfPlanData.properties?.length,
        messages_count: pdfPlanData.messages?.length,
        bank_accounts_count: pdfPlanData.bank_accounts?.length,
        has_about_me: !!pdfPlanData.about_me_notes,
        has_funeral_notes: !!pdfPlanData.funeral_wishes_notes,
      });
      console.log("[PrePlanSummary] Full PDF payload:", pdfPlanData);

      // Call edge function to generate PDF with COMPLETE data
      const { data: pdfData, error: pdfError } = await supabase.functions.invoke('generate-pdf', {
        body: {
          planData: pdfPlanData,
          selectedSections,
          piiData,
          docType: 'full',
          isDraft: isDraftMode,
          outputAllPages: true, // Always output all 23 pages
        }
      });

      if (pdfError) throw pdfError;

      if (pdfData.url) {
        // Open PDF in new tab for download
        window.open(pdfData.url, '_blank');
      } else if (pdfData.pdfBase64) {
        // Fallback: download base64 PDF
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
        const filename = isDraftMode 
          ? `DRAFT-My-Life-and-Legacy-Planner-${new Date().toISOString().split('T')[0]}.pdf`
          : pdfData.filename || `My-Life-and-Legacy-Planner-${new Date().toISOString().split('T')[0]}.pdf`;
        link.download = filename;
        link.click();
        URL.revokeObjectURL(url);
      }

      toast({
        title: isDraftMode ? "Draft Document Created" : "Document Created",
        description: isDraftMode 
          ? "Your draft document has been generated. Some fields may be blank."
          : "Your planning document has been generated successfully."
      });
      
      // Reset draft mode after successful generation
      setIsDraftMode(false);
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

  const handlePrint = async () => {
    // Generate PDF and open in new tab for printing
    handleDownloadPDF();
  };

  const handleSaveConfirmation = () => {
    toast({
      title: "Summary saved",
      description: "Your summary is saved. You can return anytime."
    });
  };

  const handleNavigateToSection = (sectionId: string) => {
    navigate(`/preplandashboard?section=${sectionId}`);
  };

  // Calculate missing sections - ONLY check sections user has selected in Preferences
  const getMissingSections = () => {
    const missing: Array<{id: string; name: string; status: string; actionLabel: string}> = [];
    const selectedSet = new Set(selectedSections);
    
    // Only flag missing data for SELECTED sections
    if (selectedSet.has("personal") && !profile?.full_name) {
      missing.push({
        id: "personal",
        name: "Personal & Family Details",
        status: "Incomplete",
        actionLabel: "Add now"
      });
    }
    
    if (selectedSet.has("legacy") && !planData?.about_me_notes) {
      missing.push({
        id: "legacy",
        name: "Life Story & Legacy",
        status: "Incomplete",
        actionLabel: "Add now"
      });
    }
    
    if (selectedSet.has("funeral") && !planData?.funeral_wishes_notes) {
      missing.push({
        id: "funeral",
        name: "Funeral Wishes",
        status: "Incomplete",
        actionLabel: "Add now"
      });
    }
    
    if (selectedSet.has("contacts")) {
      const hasContacts = contacts?.length > 0;
      if (!hasContacts) {
        missing.push({
          id: "contacts",
          name: "Key Contacts to Notify",
          status: "Incomplete",
          actionLabel: "Add now"
        });
      }
    }
    
    if (selectedSet.has("legal") && !planData?.legal_notes) {
      missing.push({
        id: "legal",
        name: "Legal & Planning Notes",
        status: "Incomplete",
        actionLabel: "Review"
      });
    }
    
    return missing;
  };

  if (loading) {
    return (
      <AuthenticatedLayout>
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-muted-foreground">Loading your summary...</p>
        </div>
      </AuthenticatedLayout>
    );
  }

  // Show empty state only if NO sections are selected (user hasn't set preferences)
  const noSectionsSelected = selectedSections.length === 0;
  
  if (noSectionsSelected) {
    return (
      <AuthenticatedLayout>
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <Card className="p-8 text-center">
            <h2 className="text-xl font-semibold mb-4">Your Planning Document</h2>
            <p className="text-muted-foreground mb-6">
              You haven't chosen any sections yet. Start by selecting what you'd like to include in your plan.
            </p>
            <Button onClick={() => navigate(SECTION_ROUTES.preferences)}>
              Choose Your Sections
            </Button>
          </Card>
        </div>
      </AuthenticatedLayout>
    );
  }

  const missingSections = getMissingSections();

  return (
    <AuthenticatedLayout>
      <div className="container mx-auto px-4 py-8 max-w-4xl print:p-0">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Your Planning Summary</h1>
          <p className="text-muted-foreground font-medium">
            {missingSections.length > 0 
              ? "Some sections are still incomplete. You can finish them anytime."
              : "This is your complete planning document."
            }
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Showing {sections.length} section{sections.length !== 1 ? 's' : ''} based on your preferences
          </p>
          {lastUpdated && (
            <p className="text-sm text-muted-foreground mt-1">
              Last updated: {new Date(lastUpdated).toLocaleDateString()} at {new Date(lastUpdated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
          )}
        </div>

        {/* First-time helper */}
        {showFirstTimeHelper && (
          <Alert className="mb-6 border-primary/30 bg-primary/5 print:hidden">
            <AlertDescription className="flex items-center justify-between">
              <span>This page is where you can view, print, or share everything you've entered.</span>
              <Button variant="ghost" size="sm" onClick={dismissFirstTimeHelper} className="h-6 w-6 p-0">
                <X className="h-4 w-4" />
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Disclaimer */}
        <Alert className="mb-6 border-amber-200 bg-amber-50/50 dark:bg-amber-950/20 print:hidden">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-800 dark:text-amber-200">
            <strong>For Review Only</strong> — This summary is not a legal document and does not replace professional advice.
          </AlertDescription>
        </Alert>

        {/* PDF Readiness Badge */}
        <div className="mb-6 print:hidden">
          <PdfReadinessBadge
            isReady={validationResult.isValid}
            missingSectionCount={validationResult.missingSectionCount}
            onFixClick={() => setShowReadinessModal(true)}
          />
        </div>

        {/* What's Missing */}
        <div className="mb-6 print:hidden">
          <WhatsMissingIndicator
            missingSections={missingSections}
            onNavigateToSection={handleNavigateToSection}
          />
        </div>

        {/* Sticky Action Bar */}
        <div className="sticky top-14 z-40 bg-background/95 backdrop-blur border-b mb-6 -mx-4 px-4 py-3 print:hidden">
          <TooltipProvider>
            <div className="flex flex-wrap gap-2 justify-center">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button onClick={handleDownloadPDF} className="gap-2">
                    <Download className="h-4 w-4" />
                    Print or Save My Plan
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Creates a printable document you can save and share</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" onClick={handlePrint} className="gap-2">
                    <Printer className="h-4 w-4" />
                    Print Paper Copy
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Prints your planning document</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" onClick={() => setShowShareDialog(true)} className="gap-2">
                    <Mail className="h-4 w-4" />
                    Email to Family
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Sends your planning document by email</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" onClick={handleSaveConfirmation} className="gap-2">
                    <Save className="h-4 w-4" />
                    Save for Later
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Your document is automatically saved</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="secondary" onClick={() => toast({ title: "Coming soon", description: "Family Notice view is being prepared." })} className="gap-2">
                    <Heart className="h-4 w-4" />
                    Share One-Page Family Notice
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Shares a simplified one-page summary for loved ones</TooltipContent>
              </Tooltip>
            </div>
          </TooltipProvider>
        </div>

        {/* Content Sections */}
        <div className="space-y-6 mb-8">
          {sections.map((section) => (
            <Card key={section.id} className="print:shadow-none print:border">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <div className={`p-2 rounded-lg ${section.hasContent ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                      {section.icon}
                    </div>
                    {section.label}
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate(section.editRoute)}
                    className="gap-1 text-muted-foreground hover:text-primary print:hidden"
                  >
                    <Edit className="h-3 w-3" />
                    Edit
                    <ArrowRight className="h-3 w-3" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {section.hasContent && section.content ? (
                  section.content
                ) : (
                  <div className="text-sm text-muted-foreground bg-muted/30 rounded-lg p-4">
                    <p className="mb-2">This section is incomplete. Add your information to include it in your final document.</p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(section.editRoute)}
                      className="text-primary print:hidden"
                    >
                      Complete this section →
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Reminder Opt-In */}
        {missingSections.length > 0 && (
          <div className="mb-8 print:hidden">
            <ReminderEmailOptIn userEmail={userEmail} />
          </div>
        )}

        {/* Print Footer */}
        <div className="hidden print:block mt-8 pt-4 border-t text-center text-sm text-muted-foreground">
          <p>Planning Summary — For Review Only — Not a Legal Document</p>
          <p>Generated on {new Date().toLocaleDateString()}</p>
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

        <PdfReadinessModal
          open={showReadinessModal}
          onOpenChange={setShowReadinessModal}
          missing={validationResult.missing}
          hasHardRequired={validationResult.hasHardRequired}
          canBypass={validationResult.canBypass}
          onFixItems={() => {}}
          onDownloadDraft={handleDownloadDraft}
          onPrintDraft={handlePrintDraft}
          onEmailDraft={handleEmailDraft}
        />
      </div>
    </AuthenticatedLayout>
  );
}
