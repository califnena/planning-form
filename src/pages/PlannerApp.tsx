import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { PlannerShell } from "@/components/planner/PlannerShell";
import { usePlanData } from "@/hooks/usePlanData";
import { useToast } from "@/hooks/use-toast";
import { RevisionPromptDialog } from "@/components/planner/RevisionPromptDialog";
import { EmailPlanDialog } from "@/components/EmailPlanDialog";
import { generatePlanPDF } from "@/lib/pdfGenerator";
import { useTranslation } from "react-i18next";

// Section components
import { SectionInstructions } from "@/components/planner/sections/SectionInstructions";
import { SectionPersonal } from "@/components/planner/sections/SectionPersonal";
import { SectionContacts } from "@/components/planner/sections/SectionContacts";
import { SectionAbout } from "@/components/planner/sections/SectionAbout";
import { SectionChecklist } from "@/components/planner/sections/SectionChecklist";
import { SectionFuneral } from "@/components/planner/sections/SectionFuneral";
import { SectionFinancial } from "@/components/planner/sections/SectionFinancial";
import { SectionInsurance } from "@/components/planner/sections/SectionInsurance";
import { SectionProperty } from "@/components/planner/sections/SectionProperty";
import { SectionPets } from "@/components/planner/sections/SectionPets";
import { SectionDigital } from "@/components/planner/sections/SectionDigital";
import { SectionLegal } from "@/components/planner/sections/SectionLegal";
import { SectionMessages } from "@/components/planner/sections/SectionMessages";
import { SectionVendors } from "@/components/planner/sections/SectionVendors";
import { SectionRevisions } from "@/components/planner/sections/SectionRevisions";
import { SectionGuide } from "@/components/planner/sections/SectionGuide";
import { SectionFAQ } from "@/components/planner/sections/SectionFAQ";

const PlannerApp = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useTranslation();
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [activeSection, setActiveSection] = useState("instructions");
  const [showRevisionDialog, setShowRevisionDialog] = useState(false);
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const [pendingAction, setPendingAction] = useState<"download" | "email" | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        navigate("/login");
        return;
      }

      setUser(session.user);
      await ensureUserHasOrg(session.user.id, session.user.email || "User");
      setAuthLoading(false);
    };

    checkAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        navigate("/login");
      } else {
        setUser(session.user);
        if (event === "SIGNED_IN") {
          setTimeout(() => {
            ensureUserHasOrg(session.user.id, session.user.email || "User");
          }, 0);
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const ensureUserHasOrg = async (userId: string, email: string) => {
    try {
      const { data: existingMembership } = await supabase
        .from("org_members")
        .select("id")
        .eq("user_id", userId)
        .limit(1)
        .maybeSingle();

      if (existingMembership) return;

      const { data: orgData, error: orgError } = await supabase
        .from("orgs")
        .insert({ name: `${email}'s Organization` })
        .select()
        .single();

      if (orgError || !orgData) return;

      await supabase.from("org_members").insert({
        org_id: orgData.id,
        user_id: userId,
        role: "owner",
      });
    } catch (e) {
      console.warn("ensureUserHasOrg warning", e);
    }
  };

  const { plan, loading: planLoading, updatePlan } = usePlanData(user?.id || "");

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const handlePreviewPDF = () => {
    try {
      const pdf = generatePlanPDF(plan);
      const pdfBlob = pdf.output('blob');
      const pdfUrl = URL.createObjectURL(pdfBlob);
      window.open(pdfUrl, '_blank');
      toast({
        title: "Preview opened",
        description: "PDF opened in new tab",
      });
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast({
        title: "Error",
        description: "Failed to generate PDF preview. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDownloadPDF = () => {
    setPendingAction("download");
    setShowRevisionDialog(true);
  };

  const handleEmailPlan = () => {
    setPendingAction("email");
    setShowRevisionDialog(true);
  };

  const handleRevisionConfirm = async (revision: {
    revision_date: string;
    signature_png: string;
    prepared_by: string;
  }) => {
    // Add the revision to the plan
    const currentRevisions = plan.revisions || [];
    await updatePlan({
      revisions: [...currentRevisions, revision],
      prepared_by: revision.prepared_by,
    });

    // Proceed with the pending action
    if (pendingAction === "download") {
      try {
        const pdf = generatePlanPDF(plan);
        pdf.save(`My-Final-Wishes-${new Date().toISOString().split('T')[0]}.pdf`);
        toast({
          title: "Revision Saved",
          description: "PDF downloaded successfully!",
        });
      } catch (error) {
        console.error("Error generating PDF:", error);
        toast({
          title: "Error",
          description: "Failed to generate PDF. Please try again.",
          variant: "destructive",
        });
      }
    } else if (pendingAction === "email") {
      setShowEmailDialog(true);
    }

    setPendingAction(null);
  };

  const sectionItems = [
    {
      id: "instructions",
      label: t("navigation.instructions"),
      completed: !!plan.instructions_notes,
    },
    { id: "personal", label: t("navigation.personal"), completed: false },
    { id: "about", label: t("navigation.about"), completed: !!plan.about_me_notes },
    { id: "contacts", label: t("navigation.contacts"), completed: false },
    { id: "vendors", label: t("navigation.vendors"), completed: false },
    { id: "checklist", label: t("navigation.checklist"), completed: !!plan.checklist_notes },
    {
      id: "funeral",
      label: t("navigation.funeral"),
      completed: !!plan.funeral_wishes_notes,
    },
    {
      id: "financial",
      label: t("navigation.financial"),
      completed: !!plan.financial_notes,
    },
    { id: "insurance", label: t("navigation.insurance"), completed: !!plan.insurance_notes },
    { id: "property", label: t("navigation.property"), completed: !!plan.property_notes },
    { id: "pets", label: t("navigation.pets"), completed: !!plan.pets_notes },
    { id: "digital", label: t("navigation.digital"), completed: !!plan.digital_notes },
    { id: "legal", label: t("navigation.legal"), completed: !!plan.legal_notes },
    { id: "messages", label: t("navigation.messages"), completed: !!plan.messages_notes },
    { id: "guide", label: t("navigation.guide"), completed: false },
    { id: "faq", label: t("navigation.faq"), completed: false },
    { id: "revisions", label: t("navigation.revisions"), completed: false },
  ];

  if (authLoading || planLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading your planner...</p>
        </div>
      </div>
    );
  }

  const renderSection = () => {
    switch (activeSection) {
      case "instructions":
        return (
          <SectionInstructions
            value={plan.instructions_notes}
            onChange={(value) => updatePlan({ instructions_notes: value })}
          />
        );
      case "about":
        return (
          <SectionAbout
            value={plan.about_me_notes}
            onChange={(value) => updatePlan({ about_me_notes: value })}
          />
        );
      case "checklist":
        return (
          <SectionChecklist
            data={plan}
            onChange={(data) => updatePlan(data)}
          />
        );
      case "funeral":
        return (
          <SectionFuneral
            data={plan}
            onChange={(data) => updatePlan(data)}
          />
        );
      case "financial":
        return (
          <SectionFinancial
            data={plan}
            onChange={(data) => updatePlan(data)}
          />
        );
      case "insurance":
        return (
          <SectionInsurance
            data={plan}
            onChange={(data) => updatePlan(data)}
          />
        );
      case "property":
        return (
          <SectionProperty
            data={plan}
            onChange={(data) => updatePlan(data)}
          />
        );
      case "pets":
        return (
          <SectionPets
            value={plan.pets_notes}
            onChange={(value) => updatePlan({ pets_notes: value })}
          />
        );
      case "digital":
        return (
          <SectionDigital
            data={plan}
            onChange={(data) => updatePlan(data)}
          />
        );
      case "legal":
        return (
          <SectionLegal
            data={plan}
            onChange={(data) => updatePlan(data)}
          />
        );
      case "messages":
        return (
          <SectionMessages
            data={plan}
            onChange={(data) => updatePlan(data)}
          />
        );
      case "personal":
        return <SectionPersonal data={plan} onChange={updatePlan} />;
      case "contacts":
        return <SectionContacts data={plan} onChange={updatePlan} />;
      case "vendors":
        return <SectionVendors data={plan} onChange={updatePlan} />;
      case "revisions":
        return <SectionRevisions data={plan} onChange={updatePlan} />;
      case "guide":
        return <SectionGuide />;
      case "faq":
        return <SectionFAQ />;
      default:
        return (
          <div className="text-center text-muted-foreground py-12">
            This section is coming soon...
          </div>
        );
    }
  };

  return (
    <>
      <PlannerShell
        sectionItems={sectionItems}
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        onPreviewPDF={handlePreviewPDF}
        onDownloadPDF={handleDownloadPDF}
        onEmailPlan={handleEmailPlan}
        onSignOut={handleSignOut}
      >
        {renderSection()}
      </PlannerShell>

      <RevisionPromptDialog
        open={showRevisionDialog}
        onOpenChange={setShowRevisionDialog}
        onConfirm={handleRevisionConfirm}
        preparedBy={plan.prepared_by || ""}
      />

      <EmailPlanDialog
        open={showEmailDialog}
        onOpenChange={setShowEmailDialog}
        planData={plan}
        preparedBy={plan.prepared_by || ""}
      />
    </>
  );
};

export default PlannerApp;
