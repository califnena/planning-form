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

      // Use data from Supabase tables (source of truth)
      const dbProfile = data.personalProfile;
      const dbContacts = data.contacts || [];
      const dbMessages = data.messages || [];
      const dbProperties = data.properties || [];
      const dbPets = data.pets || [];
      const dbInsurance = data.insurance || [];

      setProfile(dbProfile);
      setContacts(dbContacts);

      // Get the user's selected sections from settings
      const userSelectedSections = settings?.selected_sections?.length 
        ? settings.selected_sections 
        : SETTINGS_DEFAULT;
      const selectedSet = new Set(userSelectedSections);

      // Build ALL possible sections with content from DB
      const allPossibleSections: SectionData[] = [
        {
          id: "personal",
          label: "Personal & Family Details",
          icon: <User className="h-5 w-5" />,
          content: dbProfile ? (
            <div className="space-y-2 text-sm">
              {dbProfile.full_name && (
                <p>
                  <strong>Name:</strong> {dbProfile.full_name}
                </p>
              )}
              {dbProfile.address && (
                <p>
                  <strong>Address:</strong> {dbProfile.address}
                </p>
              )}
              {dbProfile.marital_status && (
                <p>
                  <strong>Marital Status:</strong> {dbProfile.marital_status}
                </p>
              )}
              {dbProfile.partner_name && (
                <p>
                  <strong>Spouse/Partner:</strong> {dbProfile.partner_name}
                </p>
              )}
              {Array.isArray(dbProfile.child_names) && dbProfile.child_names.filter(Boolean).length > 0 && (
                <p>
                  <strong>Children:</strong> {dbProfile.child_names.filter(Boolean).join(", ")}
                </p>
              )}
            </div>
          ) : null,
          hasContent: !!dbProfile?.full_name,
          editRoute: "/preplandashboard?section=personal",
        },
        {
          id: "contacts",
          label: "Key Contacts to Notify",
          icon: <Users className="h-5 w-5" />,
          content: dbContacts.length > 0 ? (
            <div className="space-y-2 text-sm">
              <p>
                <strong>Contacts:</strong> {dbContacts.length} saved
              </p>
              <div className="space-y-1">
                {dbContacts.slice(0, 5).map((c: any, idx: number) => (
                  <p key={idx} className="text-muted-foreground">
                    {c?.name || "(Unnamed)"}
                    {c?.relationship ? ` — ${c.relationship}` : ""}
                  </p>
                ))}
                {dbContacts.length > 5 && (
                  <p className="text-muted-foreground">…and {dbContacts.length - 5} more</p>
                )}
              </div>
            </div>
          ) : null,
          hasContent: dbContacts.length > 0,
          editRoute: "/preplandashboard?section=contacts",
        },
        {
          id: "legacy",
          label: "Life Story & Legacy",
          icon: <BookHeart className="h-5 w-5" />,
          content: mergedPlan.about_me_notes ? (
            <p className="text-sm">{mergedPlan.about_me_notes}</p>
          ) : null,
          hasContent: !!mergedPlan.about_me_notes,
          editRoute: "/preplandashboard?section=legacy",
        },
        {
          id: "funeral",
          label: "Funeral Wishes",
          icon: <Heart className="h-5 w-5" />,
          content: mergedPlan.funeral_wishes_notes ? (
            <p className="text-sm">{mergedPlan.funeral_wishes_notes}</p>
          ) : null,
          hasContent: !!mergedPlan.funeral_wishes_notes,
          editRoute: "/preplandashboard?section=funeral",
        },
        {
          id: "financial",
          label: "Financial Life (Summary)",
          icon: <Wallet className="h-5 w-5" />,
          content: mergedPlan.financial_notes ? (
            <p className="text-sm">{mergedPlan.financial_notes}</p>
          ) : null,
          hasContent: !!mergedPlan.financial_notes,
          editRoute: "/preplandashboard?section=financial",
        },
        {
          id: "insurance",
          label: "Insurance (Summary)",
          icon: <Shield className="h-5 w-5" />,
          content: dbInsurance.length > 0 ? (
            <p className="text-sm">
              <strong>Policies:</strong> {dbInsurance.length} saved
            </p>
          ) : mergedPlan.insurance_notes ? (
            <p className="text-sm">{mergedPlan.insurance_notes}</p>
          ) : null,
          hasContent: !!mergedPlan.insurance_notes || dbInsurance.length > 0,
          editRoute: "/preplandashboard?section=insurance",
        },
        {
          id: "property",
          label: "Property & Valuables",
          icon: <Home className="h-5 w-5" />,
          content: dbProperties.length > 0 || mergedPlan.property_notes ? (
            <div className="space-y-2 text-sm">
              {dbProperties.length > 0 && (
                <p>
                  <strong>Items:</strong> {dbProperties.length} listed
                </p>
              )}
              {mergedPlan.property_notes && <p>{mergedPlan.property_notes}</p>}
            </div>
          ) : null,
          hasContent: dbProperties.length > 0 || !!mergedPlan.property_notes,
          editRoute: "/preplandashboard?section=property",
        },
        {
          id: "legal",
          label: "Legal & Planning Notes",
          icon: <Scale className="h-5 w-5" />,
          content: mergedPlan.legal_notes ? (
            <p className="text-sm">{mergedPlan.legal_notes}</p>
          ) : null,
          hasContent: !!mergedPlan.legal_notes,
          editRoute: "/preplandashboard?section=legal",
        },
        {
          id: "pets",
          label: "Pet Care",
          icon: <Dog className="h-5 w-5" />,
          content: dbPets.length > 0 || mergedPlan.pets_notes ? (
            <div className="space-y-2 text-sm">
              {dbPets.length > 0 && (
                <p><strong>Pets:</strong> {dbPets.length} listed</p>
              )}
              {mergedPlan.pets_notes && <p>{mergedPlan.pets_notes}</p>}
            </div>
          ) : null,
          hasContent: dbPets.length > 0 || !!mergedPlan.pets_notes,
          editRoute: "/preplandashboard?section=pets",
        },
        {
          id: "digital",
          label: "Online Accounts",
          icon: <Laptop className="h-5 w-5" />,
          content: mergedPlan.digital_notes ? (
            <p className="text-sm">{mergedPlan.digital_notes}</p>
          ) : null,
          hasContent: !!mergedPlan.digital_notes,
          editRoute: "/preplandashboard?section=digital",
        },
        {
          id: "messages",
          label: "Messages to Loved Ones",
          icon: <MessageSquare className="h-5 w-5" />,
          content: dbMessages.length > 0 || mergedPlan.to_loved_ones_message || mergedPlan.messages_notes ? (
            <div className="space-y-2 text-sm">
              {dbMessages.length > 0 && (
                <p>
                  <strong>Messages:</strong> {dbMessages.length} written
                </p>
              )}
              {mergedPlan.to_loved_ones_message && <p>{mergedPlan.to_loved_ones_message}</p>}
              {mergedPlan.messages_notes && <p>{mergedPlan.messages_notes}</p>}
            </div>
          ) : null,
          hasContent: dbMessages.length > 0 || !!mergedPlan.messages_notes || !!mergedPlan.to_loved_ones_message,
          editRoute: "/preplandashboard?section=messages",
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
        dbContactsCount: dbContacts.length,
        dbPropertiesCount: dbProperties.length,
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

  const handleDownloadPDF = () => {
    // Check validation first
    if (!validationResult.isValid) {
      setShowReadinessModal(true);
      return;
    }
    setShowPIIDialog(true);
  };

  const handlePIISubmit = async (piiData: any) => {
    try {
      setGeneratingPdf(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Call edge function to generate PDF
      const { data: pdfData, error: pdfError } = await supabase.functions.invoke('generate-pdf', {
        body: {
          planData: { ...planData, personal_profile: profile, contacts },
          selectedSections,
          piiData,
          docType: 'full'
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
        link.download = pdfData.filename || 'My-Final-Wishes.pdf';
        link.click();
        URL.revokeObjectURL(url);
      }

      toast({
        title: "PDF Generated",
        description: "Your planning document has been generated successfully."
      });
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast({
        title: "Error",
        description: "Failed to generate PDF. Please try again.",
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
            <Button onClick={() => navigate("/preplandashboard?section=preferences")}>
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
                    Download PDF
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Downloads your complete planning document</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" onClick={handlePrint} className="gap-2">
                    <Printer className="h-4 w-4" />
                    Print
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Prints the full planning summary</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" onClick={() => setShowShareDialog(true)} className="gap-2">
                    <Mail className="h-4 w-4" />
                    Email a Copy
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Sends the full planning summary</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" onClick={handleSaveConfirmation} className="gap-2">
                    <Save className="h-4 w-4" />
                    Save for Later
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Your summary is automatically saved</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="secondary" onClick={() => toast({ title: "Coming soon", description: "For My Family view is being prepared." })} className="gap-2">
                    <Heart className="h-4 w-4" />
                    For My Family
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Shares a simplified version for loved ones</TooltipContent>
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
          onFixItems={() => {}}
        />
      </div>
    </AuthenticatedLayout>
  );
}
