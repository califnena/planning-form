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
  ArrowRight
} from "lucide-react";
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
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/login");
        return;
      }
      setUserEmail(user.email || "");

      // Get user's org
      const { data: orgMember } = await supabase
        .from("org_members")
        .select("org_id")
        .eq("user_id", user.id)
        .eq("role", "owner")
        .maybeSingle();

      if (!orgMember) {
        setLoading(false);
        return;
      }

      // Get plan data
      const { data: plan, error } = await supabase
        .from("plans")
        .select("*")
        .eq("org_id", orgMember.org_id)
        .eq("owner_user_id", user.id)
        .maybeSingle();

      if (error) throw error;
      
      if (plan) {
        setPlanData(plan);
        setLastUpdated(plan.updated_at);
        
        // Get personal profile
        const { data: profileData } = await supabase
          .from("personal_profiles")
          .select("*")
          .eq("plan_id", plan.id)
          .maybeSingle();
        setProfile(profileData);

        // Get contacts
        const { data: contactsData } = await supabase
          .from("contacts_notify")
          .select("*")
          .eq("plan_id", plan.id);
        setContacts(contactsData || []);

        // Get pets
        const { data: pets } = await supabase
          .from("pets")
          .select("*")
          .eq("plan_id", plan.id);

        // Get insurance policies
        const { data: insurance } = await supabase
          .from("insurance_policies")
          .select("*")
          .eq("plan_id", plan.id);

        // Get properties
        const { data: properties } = await supabase
          .from("properties")
          .select("*")
          .eq("plan_id", plan.id);

        // Get messages
        const { data: messages } = await supabase
          .from("messages")
          .select("*")
          .eq("plan_id", plan.id);

        // Build sections with content
        const sectionsList: SectionData[] = [
          {
            id: "personal",
            label: "Personal & Family Details",
            icon: <User className="h-5 w-5" />,
            content: profileData ? (
              <div className="space-y-2 text-sm">
                {profileData.full_name && <p><strong>Name:</strong> {profileData.full_name}</p>}
                {profileData.address && <p><strong>Address:</strong> {profileData.address}</p>}
                {profileData.marital_status && <p><strong>Marital Status:</strong> {profileData.marital_status}</p>}
                {profileData.partner_name && <p><strong>Spouse/Partner:</strong> {profileData.partner_name}</p>}
                {profileData.child_names?.length > 0 && (
                  <p><strong>Children:</strong> {profileData.child_names.filter(Boolean).join(", ")}</p>
                )}
              </div>
            ) : null,
            hasContent: !!profileData?.full_name,
            editRoute: "/preplandashboard?section=personal"
          },
          {
            id: "legacy",
            label: "Life Story & Legacy",
            icon: <BookHeart className="h-5 w-5" />,
            content: plan.about_me_notes ? (
              <p className="text-sm">{plan.about_me_notes}</p>
            ) : null,
            hasContent: !!plan.about_me_notes,
            editRoute: "/preplandashboard?section=legacy"
          },
          {
            id: "funeral",
            label: "Funeral Wishes",
            icon: <Heart className="h-5 w-5" />,
            content: plan.funeral_wishes_notes ? (
              <p className="text-sm">{plan.funeral_wishes_notes}</p>
            ) : null,
            hasContent: !!plan.funeral_wishes_notes,
            editRoute: "/preplandashboard?section=funeral"
          },
          {
            id: "financial",
            label: "Financial Life (Summary)",
            icon: <Wallet className="h-5 w-5" />,
            content: plan.financial_notes ? (
              <p className="text-sm">{plan.financial_notes}</p>
            ) : null,
            hasContent: !!plan.financial_notes,
            editRoute: "/preplandashboard?section=financial"
          },
          {
            id: "property",
            label: "Property & Valuables",
            icon: <Home className="h-5 w-5" />,
            content: (properties && properties.length > 0) || plan.property_notes ? (
              <div className="space-y-2 text-sm">
                {properties && properties.length > 0 && (
                  <p><strong>Properties:</strong> {properties.length} listed</p>
                )}
                {plan.property_notes && <p>{plan.property_notes}</p>}
              </div>
            ) : null,
            hasContent: (properties && properties.length > 0) || !!plan.property_notes,
            editRoute: "/preplandashboard?section=property"
          },
          {
            id: "legal",
            label: "Legal & Planning Notes",
            icon: <Scale className="h-5 w-5" />,
            content: plan.legal_notes || contactsData?.some((c: any) => 
              c.relationship?.toLowerCase().includes('executor') || 
              c.relationship?.toLowerCase().includes('guardian')
            ) ? (
              <div className="space-y-2 text-sm">
                {contactsData?.filter((c: any) => 
                  c.relationship?.toLowerCase().includes('executor')
                ).map((c: any, i: number) => (
                  <p key={i}><strong>Executor:</strong> {c.name}</p>
                ))}
                {contactsData?.filter((c: any) => 
                  c.relationship?.toLowerCase().includes('guardian')
                ).map((c: any, i: number) => (
                  <p key={i}><strong>Guardian:</strong> {c.name}</p>
                ))}
                {plan.legal_notes && <p>{plan.legal_notes}</p>}
              </div>
            ) : null,
            hasContent: !!plan.legal_notes || contactsData?.some((c: any) => 
              c.relationship?.toLowerCase().includes('executor') || 
              c.relationship?.toLowerCase().includes('guardian')
            ),
            editRoute: "/preplandashboard?section=legal"
          },
          {
            id: "messages",
            label: "Notes for Family & Professionals",
            icon: <MessageSquare className="h-5 w-5" />,
            content: (messages && messages.length > 0) || plan.messages_notes || plan.to_loved_ones_message ? (
              <div className="space-y-2 text-sm">
                {messages && messages.length > 0 && (
                  <p><strong>Messages:</strong> {messages.length} written</p>
                )}
                {plan.to_loved_ones_message && <p>{plan.to_loved_ones_message}</p>}
                {plan.messages_notes && <p>{plan.messages_notes}</p>}
              </div>
            ) : null,
            hasContent: (messages && messages.length > 0) || !!plan.messages_notes || !!plan.to_loved_ones_message,
            editRoute: "/preplandashboard?section=messages"
          }
        ];

        setSections(sectionsList);
      }
    } catch (error) {
      console.error("Error loading plan data:", error);
      toast({
        title: "Error",
        description: "Failed to load your planning summary.",
        variant: "destructive"
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

  if (!planData) {
    return (
      <AuthenticatedLayout>
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <Card className="p-8 text-center">
            <h2 className="text-xl font-semibold mb-4">No Planning Information Found</h2>
            <p className="text-muted-foreground mb-6">
              Complete at least one section in your planner to generate a summary.
            </p>
            <Button onClick={() => navigate("/preplandashboard")}>
              Go to Planner
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
          <div className="flex flex-wrap gap-2 justify-center">
            <Button onClick={handleDownloadPDF} className="gap-2">
              <Download className="h-4 w-4" />
              Download PDF
            </Button>
            <Button variant="outline" onClick={handlePrint} className="gap-2">
              <Printer className="h-4 w-4" />
              Print
            </Button>
            <Button variant="outline" onClick={() => setShowShareDialog(true)} className="gap-2">
              <Mail className="h-4 w-4" />
              Email a Copy
            </Button>
            <Button variant="outline" onClick={handleSaveConfirmation} className="gap-2">
              <Save className="h-4 w-4" />
              Save for Later
            </Button>
          </div>
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
