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
  X
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { generatePlanPDF } from "@/lib/pdfGenerator";
import { PIICollectionDialog } from "@/components/planner/PIICollectionDialog";
import { ShareSummaryDialog } from "@/components/summary/ShareSummaryDialog";
import { WhatsMissingIndicator } from "@/components/summary/WhatsMissingIndicator";
import { ReminderEmailOptIn } from "@/components/summary/ReminderEmailOptIn";

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
  
  const [loading, setLoading] = useState(true);
  const [planData, setPlanData] = useState<any>(null);
  const [sections, setSections] = useState<SectionData[]>([]);
  const [showPIIDialog, setShowPIIDialog] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string>("");
  const [profile, setProfile] = useState<any>(null);
  const [contacts, setContacts] = useState<any[]>([]);
  const [showFirstTimeHelper, setShowFirstTimeHelper] = useState(false);
  
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

  useEffect(() => {
    loadPlanData();
  }, []);

  const loadPlanData = async () => {
    try {
      setLoading(true);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/login");
        return;
      }

      setUserEmail(user.email || "");

      // 0) Load locally-saved planner data (the planner auto-saves here)
      let localPlan: any | null = null;
      try {
        const raw = localStorage.getItem(`plan_${user.id}`);
        if (raw) localPlan = JSON.parse(raw);
      } catch (e) {
        console.warn("[PrePlanSummary] Failed to parse local plan", e);
      }

      // 1) Try to resolve active plan from the backend (best-effort)
      const { data: orgMember, error: orgError } = await supabase
        .from("org_members")
        .select("org_id")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      let orgId = orgMember?.org_id || null;
      let activePlan: any | null = null;

      if (orgId) {
        const { data: plan } = await supabase
          .from("plans")
          .select("*")
          .eq("org_id", orgId)
          .eq("owner_user_id", user.id)
          .order("updated_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        activePlan = plan || null;
      }

      if (!activePlan) {
        const { data: fallbackPlan } = await supabase
          .from("plans")
          .select("*")
          .eq("owner_user_id", user.id)
          .order("updated_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (fallbackPlan) {
          activePlan = fallbackPlan;
          orgId = fallbackPlan.org_id || orgId;
        }
      }

      // 2) Merge: local data holds most section fields; DB plan holds note fields + metadata
      const mergedPlan: any = {
        ...(localPlan || {}),
        ...(activePlan || {}),
        // Ensure we don't lose identifiers if only one side has them
        id: activePlan?.id || localPlan?.id,
        org_id: activePlan?.org_id || localPlan?.org_id,
      };

      // 3) If we have neither local data nor a resolved plan, we truly have nothing to show
      const hasLocal = !!localPlan;
      const hasResolvedPlan = !!mergedPlan?.id;

      if (!hasLocal && !hasResolvedPlan) {
        // Keep structure consistent with existing empty-state behavior
        setPlanData(null);
        setSections([]);
        setProfile(null);
        setContacts([]);
        setLastUpdated(null);
        return;
      }

      setPlanData(mergedPlan);
      setLastUpdated(mergedPlan.updated_at || null);

      // Planner sections are stored in the local plan shape
      const mergedProfile = mergedPlan.personal_profile || null;
      const mergedContacts = Array.isArray(mergedPlan.contacts) ? mergedPlan.contacts : [];
      const mergedMessages = Array.isArray(mergedPlan.messages) ? mergedPlan.messages : [];
      const mergedPropertyItems = Array.isArray(mergedPlan.property?.items) ? mergedPlan.property.items : [];

      setProfile(mergedProfile);
      setContacts(mergedContacts);

      // Build sections with content (no "selected/completed" gating)
      const sectionsList: SectionData[] = [
        {
          id: "personal",
          label: "Personal & Family Details",
          icon: <User className="h-5 w-5" />,
          content: mergedProfile ? (
            <div className="space-y-2 text-sm">
              {mergedProfile.full_name && (
                <p>
                  <strong>Name:</strong> {mergedProfile.full_name}
                </p>
              )}
              {mergedProfile.address && (
                <p>
                  <strong>Address:</strong> {mergedProfile.address}
                </p>
              )}
              {mergedProfile.marital_status && (
                <p>
                  <strong>Marital Status:</strong> {mergedProfile.marital_status}
                </p>
              )}
              {mergedProfile.partner_name && (
                <p>
                  <strong>Spouse/Partner:</strong> {mergedProfile.partner_name}
                </p>
              )}
              {Array.isArray(mergedProfile.child_names) && mergedProfile.child_names.filter(Boolean).length > 0 && (
                <p>
                  <strong>Children:</strong> {mergedProfile.child_names.filter(Boolean).join(", ")}
                </p>
              )}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground italic">No information added yet</p>
          ),
          hasContent: !!mergedProfile?.full_name,
          editRoute: "/preplandashboard?section=personal",
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
          ) : (
            <p className="text-sm text-muted-foreground italic">No information added yet</p>
          ),
          hasContent: mergedContacts.length > 0,
          editRoute: "/preplandashboard?section=contacts",
        },
        {
          id: "legacy",
          label: "Life Story & Legacy",
          icon: <BookHeart className="h-5 w-5" />,
          content: mergedPlan.about_me_notes ? (
            <p className="text-sm">{mergedPlan.about_me_notes}</p>
          ) : (
            <p className="text-sm text-muted-foreground italic">No information added yet</p>
          ),
          hasContent: !!mergedPlan.about_me_notes,
          editRoute: "/preplandashboard?section=legacy",
        },
        {
          id: "funeral",
          label: "Funeral Wishes",
          icon: <Heart className="h-5 w-5" />,
          content: mergedPlan.funeral_wishes_notes ? (
            <p className="text-sm">{mergedPlan.funeral_wishes_notes}</p>
          ) : (
            <p className="text-sm text-muted-foreground italic">No information added yet</p>
          ),
          hasContent: !!mergedPlan.funeral_wishes_notes,
          editRoute: "/preplandashboard?section=funeral",
        },
        {
          id: "financial",
          label: "Financial Life (Summary)",
          icon: <Wallet className="h-5 w-5" />,
          content: mergedPlan.financial_notes ? (
            <p className="text-sm">{mergedPlan.financial_notes}</p>
          ) : (
            <p className="text-sm text-muted-foreground italic">No information added yet</p>
          ),
          hasContent: !!mergedPlan.financial_notes,
          editRoute: "/preplandashboard?section=financial",
        },
        {
          id: "insurance",
          label: "Insurance (Summary)",
          icon: <Shield className="h-5 w-5" />,
          content: mergedPlan.insurance?.policies?.length ? (
            <p className="text-sm">
              <strong>Policies:</strong> {mergedPlan.insurance.policies.length} saved
            </p>
          ) : mergedPlan.insurance_notes ? (
            <p className="text-sm">{mergedPlan.insurance_notes}</p>
          ) : (
            <p className="text-sm text-muted-foreground italic">No information added yet</p>
          ),
          hasContent: !!mergedPlan.insurance_notes || !!mergedPlan.insurance?.policies?.length,
          editRoute: "/preplandashboard?section=insurance",
        },
        {
          id: "property",
          label: "Property & Valuables",
          icon: <Home className="h-5 w-5" />,
          content: mergedPropertyItems.length > 0 || mergedPlan.property_notes ? (
            <div className="space-y-2 text-sm">
              {mergedPropertyItems.length > 0 && (
                <p>
                  <strong>Items:</strong> {mergedPropertyItems.length} listed
                </p>
              )}
              {mergedPlan.property_notes && <p>{mergedPlan.property_notes}</p>}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground italic">No information added yet</p>
          ),
          hasContent: mergedPropertyItems.length > 0 || !!mergedPlan.property_notes,
          editRoute: "/preplandashboard?section=property",
        },
        {
          id: "legal",
          label: "Legal & Planning Notes",
          icon: <Scale className="h-5 w-5" />,
          content: mergedPlan.legal_notes ? (
            <p className="text-sm">{mergedPlan.legal_notes}</p>
          ) : (
            <p className="text-sm text-muted-foreground italic">No information added yet</p>
          ),
          hasContent: !!mergedPlan.legal_notes,
          editRoute: "/preplandashboard?section=legal",
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
          ) : (
            <p className="text-sm text-muted-foreground italic">No information added yet</p>
          ),
          hasContent: mergedMessages.length > 0 || !!mergedPlan.messages_notes || !!mergedPlan.to_loved_ones_message,
          editRoute: "/preplandashboard?section=messages",
        },
      ];

      setSections(sectionsList);

      // Helpful console diagnostics (admin debug panel already exists)
      if (orgError?.message) {
        console.log("[PrePlanSummary] org_members lookup error:", orgError.message);
      }
      console.log("[PrePlanSummary] Plan resolution:", {
        userId: user.id,
        hasLocalPlan: !!localPlan,
        resolvedOrgId: orgId,
        resolvedPlanId: mergedPlan?.id || null,
      });
    } catch (error) {
      console.error("Error loading plan data:", error);
      toast({
        title: "Error",
        description: "Failed to load your planning summary.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = () => {
    setShowPIIDialog(true);
  };

  const handlePIISubmit = async (piiData: any) => {
    try {
      const pdf = generatePlanPDF({ ...planData, ...piiData, personal_profile: profile });
      pdf.save(`Planning-Summary-For-Review-Only_${new Date().toISOString().split('T')[0]}.pdf`);
      toast({
        title: "PDF Downloaded",
        description: "Your planning summary has been downloaded."
      });
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast({
        title: "Error",
        description: "Failed to generate PDF. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handlePrint = () => {
    window.print();
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

  // Calculate missing sections
  const getMissingSections = () => {
    const missing = [];
    
    if (!profile?.full_name) {
      missing.push({
        id: "personal",
        name: "Personal & Family Details",
        status: "No information added yet",
        actionLabel: "Add now"
      });
    }
    
    if (!planData?.about_me_notes) {
      missing.push({
        id: "legacy",
        name: "Life Story & Legacy",
        status: "No information added yet",
        actionLabel: "Add now"
      });
    }
    
    if (!planData?.funeral_wishes_notes) {
      missing.push({
        id: "funeral",
        name: "Funeral Wishes",
        status: "Not recorded",
        actionLabel: "Add now"
      });
    }
    
    const hasExecutor = contacts?.some((c: any) => 
      c.relationship?.toLowerCase().includes('executor')
    );
    if (!hasExecutor) {
      missing.push({
        id: "contacts",
        name: "Executor Preferences",
        status: "Not selected",
        actionLabel: "Add now"
      });
    }
    
    if (!planData?.property_notes) {
      missing.push({
        id: "property",
        name: "Property & Valuables",
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

  // Only show empty state if:
  // 1. No plan exists AND
  // 2. Shared hook confirms no data exists (checks all related tables)
  const showEmptyState = !planData;
  
  if (showEmptyState) {
    return (
      <AuthenticatedLayout>
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <Card className="p-8 text-center">
            <h2 className="text-xl font-semibold mb-4">Your Planning Document</h2>
            <p className="text-muted-foreground mb-6">
              Your planning document will appear here once you start adding information.
            </p>
            <Button onClick={() => navigate("/preplandashboard")}>
              Start Planning
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
            This is your complete planning document.
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
                {section.hasContent ? (
                  section.content
                ) : (
                  <div className="text-sm text-muted-foreground">
                    <p>No information added yet</p>
                    <Button
                      variant="link"
                      size="sm"
                      onClick={() => navigate(section.editRoute)}
                      className="px-0 text-primary print:hidden"
                    >
                      Add information →
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
      </div>
    </AuthenticatedLayout>
  );
}
