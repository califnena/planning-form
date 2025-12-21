import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { AuthenticatedLayout } from "@/components/AuthenticatedLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { 
  Download, 
  Printer, 
  Share2, 
  Edit, 
  Link as LinkIcon, 
  Mail,
  CheckCircle2,
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
  MessageSquare
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { generatePlanPDF } from "@/lib/pdfGenerator";
import { PIICollectionDialog } from "@/components/planner/PIICollectionDialog";
import { ShareSummaryDialog } from "@/components/summary/ShareSummaryDialog";
import { SharingControls } from "@/components/summary/SharingControls";

interface SectionData {
  id: string;
  label: string;
  icon: React.ReactNode;
  preview: string;
  hasContent: boolean;
}

export default function PrePlanSummary() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [planData, setPlanData] = useState<any>(null);
  const [sections, setSections] = useState<SectionData[]>([]);
  const [showPIIDialog, setShowPIIDialog] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

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
        const { data: profile } = await supabase
          .from("personal_profiles")
          .select("*")
          .eq("plan_id", plan.id)
          .maybeSingle();

        // Get contacts
        const { data: contacts } = await supabase
          .from("contacts_notify")
          .select("*")
          .eq("plan_id", plan.id);

        // Get professional contacts
        const { data: professionals } = await supabase
          .from("contacts_professional")
          .select("*")
          .eq("plan_id", plan.id);

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

        // Build sections with content previews
        const sectionsList: SectionData[] = [
          {
            id: "personal",
            label: "About Me",
            icon: <User className="h-5 w-5" />,
            preview: profile?.full_name ? `Name: ${profile.full_name}` : "No personal information entered yet.",
            hasContent: !!profile?.full_name
          },
          {
            id: "contacts",
            label: "Key Contacts",
            icon: <Users className="h-5 w-5" />,
            preview: contacts && contacts.length > 0 
              ? `${contacts.length} contact(s) to notify`
              : "No contacts added yet.",
            hasContent: contacts && contacts.length > 0
          },
          {
            id: "funeral",
            label: "My Wishes",
            icon: <Heart className="h-5 w-5" />,
            preview: plan.funeral_wishes_notes?.substring(0, 100) || "No wishes recorded yet.",
            hasContent: !!plan.funeral_wishes_notes
          },
          {
            id: "instructions",
            label: "Important Information",
            icon: <FileText className="h-5 w-5" />,
            preview: plan.instructions_notes?.substring(0, 100) || "No instructions entered yet.",
            hasContent: !!plan.instructions_notes
          },
          {
            id: "financial",
            label: "Financial Information",
            icon: <Wallet className="h-5 w-5" />,
            preview: plan.financial_notes?.substring(0, 100) || "No financial information entered.",
            hasContent: !!plan.financial_notes
          },
          {
            id: "insurance",
            label: "Insurance Policies",
            icon: <Shield className="h-5 w-5" />,
            preview: insurance && insurance.length > 0 
              ? `${insurance.length} insurance policy(ies)`
              : "No insurance policies added.",
            hasContent: insurance && insurance.length > 0
          },
          {
            id: "property",
            label: "Property",
            icon: <Home className="h-5 w-5" />,
            preview: properties && properties.length > 0 
              ? `${properties.length} property(ies) listed`
              : "No properties listed.",
            hasContent: properties && properties.length > 0
          },
          {
            id: "pets",
            label: "Pets",
            icon: <Dog className="h-5 w-5" />,
            preview: pets && pets.length > 0 
              ? `${pets.length} pet(s) with care instructions`
              : "No pet information added.",
            hasContent: pets && pets.length > 0
          },
          {
            id: "digital",
            label: "Digital Accounts",
            icon: <Laptop className="h-5 w-5" />,
            preview: plan.digital_notes?.substring(0, 100) || "No digital account information.",
            hasContent: !!plan.digital_notes
          },
          {
            id: "legal",
            label: "Legal Documents",
            icon: <Scale className="h-5 w-5" />,
            preview: plan.legal_notes?.substring(0, 100) || "No legal document information.",
            hasContent: !!plan.legal_notes
          },
          {
            id: "messages",
            label: "Messages & Notes",
            icon: <MessageSquare className="h-5 w-5" />,
            preview: messages && messages.length > 0 
              ? `${messages.length} message(s) for loved ones`
              : plan.to_loved_ones_message?.substring(0, 100) || "No messages written.",
            hasContent: (messages && messages.length > 0) || !!plan.to_loved_ones_message
          }
        ];

        setSections(sectionsList);
      }
    } catch (error) {
      console.error("Error loading plan data:", error);
      toast({
        title: "Error",
        description: "Failed to load your pre-planning summary.",
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
      await generatePlanPDF(piiData);
      toast({
        title: "PDF Downloaded",
        description: "Your pre-planning summary has been downloaded."
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

  const handleEditSection = (sectionId: string) => {
    navigate(`/preplansteps?section=${sectionId}`);
  };

  const sectionsWithContent = sections.filter(s => s.hasContent).length;

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
            <h2 className="text-xl font-semibold mb-4">No Pre-Planning Information Found</h2>
            <p className="text-muted-foreground mb-6">
              You haven't started your pre-planning yet. Would you like to begin?
            </p>
            <Button onClick={() => navigate("/preferences")}>
              Start Planning
            </Button>
          </Card>
        </div>
      </AuthenticatedLayout>
    );
  }

  return (
    <AuthenticatedLayout>
      <div className="container mx-auto px-4 py-8 max-w-4xl print:p-0">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Your Pre-Planning Summary</h1>
          <p className="text-muted-foreground">
            This is a clear summary of the wishes you've entered so far.
            You can update this anytime.
          </p>
          {lastUpdated && (
            <p className="text-sm text-muted-foreground mt-2">
              Last updated: {new Date(lastUpdated).toLocaleDateString()}
            </p>
          )}
        </div>

        {/* Completion Badge */}
        <div className="mb-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 dark:bg-green-950/20 rounded-full">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            <span className="text-sm font-medium text-green-700 dark:text-green-400">
              Pre-Planning Summary Saved • {sectionsWithContent} sections with information
            </span>
          </div>
        </div>

        {/* Section Accordion */}
        <Card className="mb-8 print:shadow-none print:border-0">
          <Accordion type="multiple" className="w-full">
            {sections.map((section) => (
              <AccordionItem key={section.id} value={section.id}>
                <AccordionTrigger className="px-6 hover:no-underline">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${section.hasContent ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                      {section.icon}
                    </div>
                    <div className="text-left">
                      <div className="font-medium">{section.label}</div>
                      <div className="text-sm text-muted-foreground truncate max-w-md">
                        {section.preview.length > 60 ? section.preview.substring(0, 60) + '...' : section.preview}
                      </div>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-4">
                  <div className="pl-12">
                    <p className="text-muted-foreground mb-4">{section.preview}</p>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleEditSection(section.id)}
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      Edit this section
                    </Button>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Card>

        {/* Download Section */}
        <Card className="p-6 mb-8 print:hidden">
          <h2 className="text-lg font-semibold mb-4">Download your summary</h2>
          <p className="text-sm text-muted-foreground mb-4">
            You can download this as many times as you like.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button onClick={handleDownloadPDF}>
              <Download className="mr-2 h-4 w-4" />
              Download PDF
            </Button>
            <Button variant="outline" onClick={handlePrint}>
              <Printer className="mr-2 h-4 w-4" />
              Print a Copy
            </Button>
          </div>
        </Card>

        {/* Share Section */}
        <Card className="p-6 mb-8 print:hidden">
          <h2 className="text-lg font-semibold mb-4">Share with someone you trust</h2>
          <div className="space-y-4">
            {/* Create Secure Link */}
            <div className="flex items-start gap-4 p-4 bg-muted/50 rounded-lg">
              <LinkIcon className="h-5 w-5 text-primary mt-1" />
              <div className="flex-1">
                <h3 className="font-medium mb-1">Create a Secure Link</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Generate a read-only link that anyone can view. You can turn this off anytime.
                </p>
                <Button variant="secondary" size="sm" onClick={() => setShowShareDialog(true)}>
                  Create a Secure Link
                </Button>
              </div>
            </div>

            {/* Email a Copy */}
            <div className="flex items-start gap-4 p-4 bg-muted/50 rounded-lg">
              <Mail className="h-5 w-5 text-primary mt-1" />
              <div className="flex-1">
                <h3 className="font-medium mb-1">Email a Copy</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Send your summary directly to someone's email.
                </p>
                <Button variant="secondary" size="sm" onClick={() => setShowShareDialog(true)}>
                  Email This Summary
                </Button>
              </div>
            </div>

            {/* Download & Share Yourself */}
            <p className="text-sm text-muted-foreground">
              You can also download the PDF and share it however you prefer.
            </p>
          </div>
        </Card>

        {/* Sharing Controls */}
        <SharingControls />

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
