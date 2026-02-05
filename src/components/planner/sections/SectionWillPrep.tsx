import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { 
  AlertTriangle, 
  FileText, 
  Download, 
  Send, 
  CheckCircle2, 
  User, 
  Users, 
  Scale, 
  Heart, 
  FileCheck,
  Sparkles
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { usePreviewMode } from "@/pages/PlannerApp";
import { PreviewModeWrapper } from "@/components/planner/PreviewModeWrapper";
import { SendToAttorneyDialog } from "@/components/planner/SendToAttorneyDialog";
import { 
  generateWillSummaryPDF, 
  generateWillOutlinePDF, 
  generateAttorneyPrepPDF 
} from "@/lib/willPdfGenerator";

interface SectionWillPrepProps {
  data: any;
}

export const SectionWillPrep = ({ data }: SectionWillPrepProps) => {
  const { toast } = useToast();
  const { isPreviewMode } = usePreviewMode();
  const [hasAcceptedDisclaimer, setHasAcceptedDisclaimer] = useState(false);
  const [activeTab, setActiveTab] = useState("summary");
  const [showAttorneyDialog, setShowAttorneyDialog] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // Extract data from plan
  const profile = data.personal_profile || {};
  const contacts = data.contacts_notify || [];
  const funeralWishes = data.funeral_wishes_notes || "";
  const instructionsNotes = data.instructions_notes || "";
  const legalNotes = data.legal_notes || "";
  const messagesNotes = data.messages_notes || "";
  const propertyNotes = data.property_notes || "";
  const financialNotes = data.financial_notes || "";
  const petNotes = data.pets_notes || "";

  // Check what data exists
  const hasPersonalInfo = !!(profile.full_name || profile.address);
  const hasFamilyInfo = !!(profile.partner_name || profile.children?.length > 0 || profile.father_name || profile.mother_name);
  const hasExecutorInfo = contacts.some((c: any) => c.relationship?.toLowerCase().includes('executor'));
  const hasGuardianInfo = contacts.some((c: any) => c.relationship?.toLowerCase().includes('guardian'));
  const hasAssetInfo = !!(propertyNotes || financialNotes);
  const hasSpecialInstructions = !!(instructionsNotes || funeralWishes);
  const hasAfterDeathWishes = !!(funeralWishes || messagesNotes);

  const dataCategories = [
    { name: "Personal Information", hasData: hasPersonalInfo, icon: User },
    { name: "Family & Relationships", hasData: hasFamilyInfo, icon: Users },
    { name: "Executor Preferences", hasData: hasExecutorInfo, icon: Scale },
    { name: "Guardianship Wishes", hasData: hasGuardianInfo, icon: Heart },
    { name: "Asset Overview", hasData: hasAssetInfo, icon: FileText },
    { name: "Special Instructions", hasData: hasSpecialInstructions, icon: FileCheck },
  ];

  const completedCount = dataCategories.filter(c => c.hasData).length;
  const hasMinimumData = completedCount >= 2;

  // Missing items for attorney checklist
  const missingItems = [];
  if (!hasExecutorInfo) missingItems.push("Alternate executor not selected");
  if (!hasGuardianInfo) missingItems.push("Guardianship backup not listed");
  if (!hasAssetInfo) missingItems.push("Asset details incomplete");
  if (!profile.marital_status) missingItems.push("Marital status not specified");

  const handleDownloadSummary = async () => {
    if (isPreviewMode) {
      return;
    }
    
    setIsGenerating(true);
    try {
      const pdf = generateWillSummaryPDF(data);
      pdf.save(`Will-Information-Summary_For-Review-Only.pdf`);
      toast({
        title: "Downloaded",
        description: "Will Information Summary has been downloaded.",
      });
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast({
        title: "Error",
        description: "Failed to generate PDF. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadOutline = async () => {
    if (isPreviewMode) {
      return;
    }
    
    setIsGenerating(true);
    try {
      const pdf = generateWillOutlinePDF(data);
      pdf.save(`Sample-Will_Draft-For-Review-Only.pdf`);
      toast({
        title: "Downloaded",
        description: "Will Outline Draft has been downloaded.",
      });
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast({
        title: "Error",
        description: "Failed to generate PDF. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadAttorneyPrep = async () => {
    if (isPreviewMode) {
      return;
    }
    
    setIsGenerating(true);
    try {
      const pdf = generateAttorneyPrepPDF(data, missingItems);
      pdf.save(`Attorney-Preparation-Summary_Not-a-Legal-Document.pdf`);
      toast({
        title: "Downloaded",
        description: "Attorney Preparation Summary has been downloaded.",
      });
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast({
        title: "Error",
        description: "Failed to generate PDF. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  if (!hasAcceptedDisclaimer) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold mb-2">Prepare Information for a Will</h2>
          <p className="text-muted-foreground">
            Organize your wishes and create a draft to review with an attorney.
          </p>
        </div>

        <Card className="border-amber-200 bg-amber-50/50 dark:bg-amber-950/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-800 dark:text-amber-200">
              <AlertTriangle className="h-5 w-5" />
              Important Notice
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-amber-900 dark:text-amber-100">
              This tool provides <strong>educational assistance only</strong>.
            </p>
            <ul className="list-disc list-inside space-y-2 text-amber-800 dark:text-amber-200 text-sm">
              <li>It does not provide legal advice</li>
              <li>It does not create a legally binding will</li>
              <li>Laws vary by state</li>
              <li>We recommend reviewing all documents with a licensed attorney</li>
            </ul>

            <p className="text-sm text-muted-foreground mt-4">
              This tool helps you gather and summarize the information commonly needed when preparing a will.
              It creates a draft and summary for review only, based on what you've entered.
            </p>

            <div className="flex items-center space-x-3 pt-4 border-t">
              <Checkbox 
                id="accept-disclaimer"
                checked={hasAcceptedDisclaimer}
                onCheckedChange={(checked) => setHasAcceptedDisclaimer(checked === true)}
              />
              <label 
                htmlFor="accept-disclaimer" 
                className="text-sm font-medium leading-none cursor-pointer"
              >
                I understand and wish to continue
              </label>
            </div>

            <Button 
              onClick={() => setHasAcceptedDisclaimer(true)}
              disabled={!hasAcceptedDisclaimer}
              className="w-full mt-4"
            >
              Continue to Will Preparation Tool
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-2">Prepare Information for a Will</h2>
          <p className="text-muted-foreground">
            Organize your wishes and create a draft to review with an attorney.
          </p>
        </div>
        <Button 
          variant="outline" 
          onClick={() => setShowAttorneyDialog(true)}
          disabled={isPreviewMode || !hasMinimumData}
        >
          <Send className="h-4 w-4 mr-2" />
          Send to Attorney
        </Button>
      </div>

      {/* Data Status Overview */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            Your Planning Data
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {dataCategories.map((category) => {
              const Icon = category.icon;
              return (
                <div 
                  key={category.name}
                  className={`flex items-center gap-2 p-2 rounded-lg ${
                    category.hasData 
                      ? 'bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-300' 
                      : 'bg-muted/50 text-muted-foreground'
                  }`}
                >
                  {category.hasData ? (
                    <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
                  ) : (
                    <Icon className="h-4 w-4 flex-shrink-0" />
                  )}
                  <span className="text-xs">{category.name}</span>
                </div>
              );
            })}
          </div>
          {!hasMinimumData && (
            <p className="text-xs text-muted-foreground mt-3">
              Complete at least 2 sections to generate documents.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Disclaimer Banner */}
      <Alert className="border-blue-200 bg-blue-50/50 dark:bg-blue-950/20">
        <AlertTriangle className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-xs text-blue-800 dark:text-blue-200">
          For Planning & Review Only — Not a Legal Document
        </AlertDescription>
      </Alert>

      <PreviewModeWrapper>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="summary">Summary</TabsTrigger>
            <TabsTrigger value="outline">Will Outline</TabsTrigger>
            <TabsTrigger value="attorney">Attorney-Ready</TabsTrigger>
          </TabsList>

          {/* Tab 1: Will Information Summary */}
          <TabsContent value="summary" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Will Information Summary</CardTitle>
                <p className="text-sm text-muted-foreground">
                  A clean, readable summary of all relevant planning data.
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Personal Details */}
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Personal Details
                  </h4>
                  <div className="bg-muted/30 p-3 rounded-lg text-sm space-y-1">
                    <p><strong>Name:</strong> {profile.full_name || "Not provided"}</p>
                    <p><strong>Address:</strong> {profile.address || "Not provided"}</p>
                    <p><strong>Marital Status:</strong> {profile.marital_status || "Not specified"}</p>
                    <p><strong>Citizenship:</strong> {profile.citizenship || "Not specified"}</p>
                  </div>
                </div>

                {/* Family & Relationships */}
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Family & Relationships
                  </h4>
                  <div className="bg-muted/30 p-3 rounded-lg text-sm space-y-1">
                    <p><strong>Spouse/Partner:</strong> {profile.partner_name || "Not listed"}</p>
                    <p><strong>Children:</strong> {
                      profile.children?.length > 0 
                        ? profile.children.map((c: any) => c.name).filter(Boolean).join(", ") || "Not listed"
                        : "Not listed"
                    }</p>
                    <p><strong>Father:</strong> {profile.father_name || "Not listed"}</p>
                    <p><strong>Mother:</strong> {profile.mother_name || "Not listed"}</p>
                  </div>
                </div>

                {/* Executor Preferences */}
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm flex items-center gap-2">
                    <Scale className="h-4 w-4" />
                    Executor Preferences
                  </h4>
                  <div className="bg-muted/30 p-3 rounded-lg text-sm">
                    {contacts.length > 0 ? (
                      <ul className="space-y-1">
                        {contacts.slice(0, 3).map((contact: any, i: number) => (
                          <li key={i}>
                            <strong>{contact.name}</strong>
                            {contact.relationship && ` (${contact.relationship})`}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-muted-foreground">No executor preferences recorded</p>
                    )}
                  </div>
                </div>

                {/* Asset Overview */}
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Asset Overview (High-Level)
                  </h4>
                  <div className="bg-muted/30 p-3 rounded-lg text-sm">
                    {hasAssetInfo ? (
                      <div className="space-y-2">
                        {propertyNotes && <p><strong>Property:</strong> {propertyNotes.slice(0, 150)}...</p>}
                        {financialNotes && <p><strong>Financial:</strong> {financialNotes.slice(0, 150)}...</p>}
                      </div>
                    ) : (
                      <p className="text-muted-foreground">No asset information recorded</p>
                    )}
                  </div>
                </div>

                {/* Special Instructions */}
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm flex items-center gap-2">
                    <Heart className="h-4 w-4" />
                    Special Instructions
                  </h4>
                  <div className="bg-muted/30 p-3 rounded-lg text-sm">
                    {hasSpecialInstructions ? (
                      <p>{instructionsNotes || funeralWishes}</p>
                    ) : (
                      <p className="text-muted-foreground">No special instructions recorded</p>
                    )}
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <p className="text-xs text-muted-foreground text-center italic">
                    For Planning & Review Only — Not a Legal Document
                  </p>
                </div>

                <Button 
                  onClick={handleDownloadSummary} 
                  className="w-full gap-2"
                  disabled={isGenerating || !hasMinimumData}
                >
                  <Download className="h-4 w-4" />
                  Download Summary (PDF)
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab 2: Will Outline */}
          <TabsContent value="outline" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <CardTitle className="text-lg">Sample Will — For Review Only</CardTitle>
                  <Badge variant="secondary">Draft</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Structured outline with plain-language placeholders. Not a legal document.
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Declaration */}
                <div className="space-y-2">
                  <h4 className="font-semibold">1. Declaration</h4>
                  <div className="bg-muted/30 p-3 rounded-lg text-sm italic">
                    "I, {profile.full_name || "[Full Legal Name]"}, of {profile.address || "[City, State]"}, 
                    being of sound mind and memory, do hereby declare this to be my Last Will and Testament..."
                  </div>
                </div>

                {/* Personal Information */}
                <div className="space-y-2">
                  <h4 className="font-semibold">2. Personal Information</h4>
                  <div className="bg-muted/30 p-3 rounded-lg text-sm">
                    <p>Name: {profile.full_name || "[To be completed]"}</p>
                    <p>Residence: {profile.address || "[To be completed]"}</p>
                  </div>
                </div>

                {/* Family & Relationships */}
                <div className="space-y-2">
                  <h4 className="font-semibold">3. Family & Relationships</h4>
                  <div className="bg-muted/30 p-3 rounded-lg text-sm italic">
                    "I am currently {profile.marital_status || "[marital status]"}. 
                    {profile.partner_name ? ` My spouse/partner is ${profile.partner_name}.` : ""} 
                    {profile.children?.length > 0 
                      ? ` I have ${profile.children.length} child(ren): ${profile.children.map((c: any) => c.name).filter(Boolean).join(", ")}.`
                      : ""}
                  </div>
                </div>

                {/* Appointment of Executor */}
                <div className="space-y-2">
                  <h4 className="font-semibold">4. Appointment of Executor</h4>
                  <div className="bg-muted/30 p-3 rounded-lg text-sm italic">
                    "I wish to appoint the following person as executor of my estate: 
                    {contacts.find((c: any) => c.relationship?.toLowerCase().includes('executor'))?.name || "[Executor Name to be designated]"}..."
                  </div>
                </div>

                {/* Guardianship */}
                <div className="space-y-2">
                  <h4 className="font-semibold">5. Guardianship Preferences</h4>
                  <div className="bg-muted/30 p-3 rounded-lg text-sm italic">
                    {hasGuardianInfo 
                      ? "Guardianship preferences have been recorded."
                      : "If I have minor children, I wish to designate [Guardian Name] as their guardian..."}
                  </div>
                </div>

                {/* Distribution */}
                <div className="space-y-2">
                  <h4 className="font-semibold">6. Distribution Overview</h4>
                  <div className="bg-muted/30 p-3 rounded-lg text-sm italic">
                    "It is my wish that my estate be distributed according to the following general intentions: 
                    [To be discussed with attorney based on asset information provided]..."
                  </div>
                </div>

                {/* Special Wishes */}
                <div className="space-y-2">
                  <h4 className="font-semibold">7. Special Wishes</h4>
                  <div className="bg-muted/30 p-3 rounded-lg text-sm">
                    {hasSpecialInstructions || hasAfterDeathWishes ? (
                      <p>{instructionsNotes || funeralWishes || messagesNotes}</p>
                    ) : (
                      <p className="italic">"[Special wishes to be added]..."</p>
                    )}
                  </div>
                </div>

                {/* Closing */}
                <div className="space-y-2">
                  <h4 className="font-semibold">8. Closing Statement</h4>
                  <div className="bg-muted/30 p-3 rounded-lg text-sm italic">
                    "In witness whereof, I have hereunto set my hand on this _____ day of __________, 20____."
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <p className="text-xs text-muted-foreground text-center italic">
                    Draft for Review Only — Not a Legal Will
                  </p>
                </div>

                <Button 
                  onClick={handleDownloadOutline} 
                  className="w-full gap-2"
                  disabled={isGenerating || !hasMinimumData}
                >
                  <Download className="h-4 w-4" />
                  Download Draft Outline (PDF)
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab 3: Attorney-Ready Export */}
          <TabsContent value="attorney" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Attorney Preparation Summary</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Structured summary designed for attorney review. Save time and reduce legal fees.
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Client Snapshot */}
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">Client Snapshot</h4>
                  <div className="bg-muted/30 p-3 rounded-lg text-sm grid grid-cols-2 gap-2">
                    <p><strong>Name:</strong> {profile.full_name || "—"}</p>
                    <p><strong>State:</strong> {profile.address?.split(",").pop()?.trim() || "—"}</p>
                    <p><strong>Marital Status:</strong> {profile.marital_status || "—"}</p>
                    <p><strong>Children/Dependents:</strong> {profile.children?.length || 0}</p>
                  </div>
                </div>

                {/* Decisions Made */}
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">Decisions Made</h4>
                  <div className="bg-green-50 dark:bg-green-950/20 p-3 rounded-lg">
                    <ul className="text-sm space-y-1">
                      {hasExecutorInfo && (
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                          Executor selected
                        </li>
                      )}
                      {hasGuardianInfo && (
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                          Guardianship preferences noted
                        </li>
                      )}
                      {hasAssetInfo && (
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                          General distribution intentions recorded
                        </li>
                      )}
                      {hasSpecialInstructions && (
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                          Special wishes documented
                        </li>
                      )}
                      {!hasExecutorInfo && !hasGuardianInfo && !hasAssetInfo && !hasSpecialInstructions && (
                        <li className="text-muted-foreground">Complete more sections to see decisions</li>
                      )}
                    </ul>
                  </div>
                </div>

                {/* Items to Confirm with Attorney */}
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">Items to Confirm with Attorney</h4>
                  <div className="bg-blue-50 dark:bg-blue-950/20 p-3 rounded-lg">
                    <ul className="text-sm space-y-1 list-disc list-inside text-blue-800 dark:text-blue-200">
                      <li>State-specific requirements</li>
                      <li>Witness / notarization rules</li>
                      <li>Asset titling and beneficiary alignment</li>
                      <li>Tax considerations</li>
                      <li>Trust considerations (if applicable)</li>
                    </ul>
                  </div>
                </div>

                {/* Open Questions */}
                {missingItems.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm">Open Questions</h4>
                    <div className="bg-amber-50 dark:bg-amber-950/20 p-3 rounded-lg">
                      <ul className="text-sm space-y-1 list-disc list-inside text-amber-800 dark:text-amber-200">
                        {missingItems.map((item, i) => (
                          <li key={i}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                <div className="pt-4 border-t">
                  <p className="text-xs text-muted-foreground text-center italic">
                    This document is a preparation summary only and is not a legal will.
                  </p>
                </div>

                <Button 
                  onClick={handleDownloadAttorneyPrep} 
                  className="w-full gap-2"
                  disabled={isGenerating || !hasMinimumData}
                >
                  <Download className="h-4 w-4" />
                  Download Attorney-Ready Template (PDF)
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </PreviewModeWrapper>

      <SendToAttorneyDialog
        open={showAttorneyDialog}
        onOpenChange={setShowAttorneyDialog}
        planData={data}
        missingItems={missingItems}
      />
    </div>
  );
};
