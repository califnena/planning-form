import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Mail, Link2, Copy, Check, Send, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  generateWillSummaryPDF, 
  generateWillOutlinePDF, 
  generateAttorneyPrepPDF 
} from "@/lib/willPdfGenerator";

interface SendToAttorneyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  planData: any;
  missingItems: string[];
}

export const SendToAttorneyDialog = ({
  open,
  onOpenChange,
  planData,
  missingItems,
}: SendToAttorneyDialogProps) => {
  const { toast } = useToast();
  const [deliveryMethod, setDeliveryMethod] = useState<"email" | "link">("email");
  const [selectedDocs, setSelectedDocs] = useState({
    summary: false,
    outline: false,
    attorneyPrep: true, // Default selected
  });
  const [attorneyEmail, setAttorneyEmail] = useState("");
  const [customMessage, setCustomMessage] = useState(
    `Hello,

I've prepared the attached documents to help organize my information for will preparation. These are for review only.

Thank you.`
  );
  const [isSending, setIsSending] = useState(false);
  const [shareLink, setShareLink] = useState("");
  const [linkCopied, setLinkCopied] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleToggleDoc = (doc: keyof typeof selectedDocs) => {
    setSelectedDocs(prev => ({ ...prev, [doc]: !prev[doc] }));
  };

  const hasSelectedDocs = Object.values(selectedDocs).some(v => v);

  const handleSendEmail = async () => {
    if (!attorneyEmail) {
      toast({
        title: "Email Required",
        description: "Please enter your attorney's email address.",
        variant: "destructive",
      });
      return;
    }

    if (!hasSelectedDocs) {
      toast({
        title: "Select Documents",
        description: "Please select at least one document to send.",
        variant: "destructive",
      });
      return;
    }

    setIsSending(true);
    try {
      // Generate selected PDFs as base64
      const attachments: { name: string; data: string }[] = [];
      
      if (selectedDocs.summary) {
        const pdf = generateWillSummaryPDF(planData);
        attachments.push({
          name: "Will-Information-Summary_For-Review-Only.pdf",
          data: pdf.output('datauristring').split(',')[1]
        });
      }
      
      if (selectedDocs.outline) {
        const pdf = generateWillOutlinePDF(planData);
        attachments.push({
          name: "Sample-Will_Draft-For-Review-Only.pdf",
          data: pdf.output('datauristring').split(',')[1]
        });
      }
      
      if (selectedDocs.attorneyPrep) {
        const pdf = generateAttorneyPrepPDF(planData, missingItems);
        attachments.push({
          name: "Attorney-Preparation-Summary_Not-a-Legal-Document.pdf",
          data: pdf.output('datauristring').split(',')[1]
        });
      }

      // Call edge function to send email
      const { error } = await supabase.functions.invoke('send-plan-email', {
        body: {
          to: attorneyEmail,
          subject: "Will Preparation Documents - For Review Only",
          message: customMessage,
          attachments,
          type: 'attorney-will-prep'
        }
      });

      if (error) throw error;

      setShowSuccess(true);
      toast({
        title: "Documents Sent",
        description: "Your documents have been emailed to your attorney.",
      });
    } catch (error) {
      console.error("Error sending email:", error);
      toast({
        title: "Error",
        description: "Failed to send email. Please try again or download the documents manually.",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleGenerateLink = async () => {
    if (!hasSelectedDocs) {
      toast({
        title: "Select Documents",
        description: "Please select at least one document to share.",
        variant: "destructive",
      });
      return;
    }

    setIsSending(true);
    try {
      // For now, generate a local download package
      // In a full implementation, this would create a secure share link
      const timestamp = Date.now();
      const linkId = `will-prep-${timestamp}`;
      
      // Generate PDFs and trigger downloads
      if (selectedDocs.summary) {
        const pdf = generateWillSummaryPDF(planData);
        pdf.save(`Will-Information-Summary_For-Review-Only.pdf`);
      }
      
      if (selectedDocs.outline) {
        const pdf = generateWillOutlinePDF(planData);
        pdf.save(`Sample-Will_Draft-For-Review-Only.pdf`);
      }
      
      if (selectedDocs.attorneyPrep) {
        const pdf = generateAttorneyPrepPDF(planData, missingItems);
        pdf.save(`Attorney-Preparation-Summary_Not-a-Legal-Document.pdf`);
      }

      toast({
        title: "Documents Downloaded",
        description: "You can now share these files with your attorney.",
      });
      
      setShowSuccess(true);
    } catch (error) {
      console.error("Error generating documents:", error);
      toast({
        title: "Error",
        description: "Failed to generate documents. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareLink);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
    toast({
      title: "Link Copied",
      description: "Share link has been copied to clipboard.",
    });
  };

  const handleClose = () => {
    setShowSuccess(false);
    setShareLink("");
    onOpenChange(false);
  };

  if (showSuccess) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="max-w-md">
          <div className="text-center py-6 space-y-4">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-950/30 rounded-full flex items-center justify-center mx-auto">
              <Check className="h-8 w-8 text-green-600" />
            </div>
            <DialogTitle>Documents Prepared</DialogTitle>
            <DialogDescription>
              Your documents have been prepared for review.
              You can regenerate them anytime if information changes.
            </DialogDescription>
            <Button onClick={handleClose} className="mt-4">
              Done
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            Send to Attorney
          </DialogTitle>
          <DialogDescription>
            Choose which documents to share and how to deliver them.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Document Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Select Documents to Send</Label>
            <div className="space-y-2">
              <div className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                <Checkbox
                  id="doc-summary"
                  checked={selectedDocs.summary}
                  onCheckedChange={() => handleToggleDoc("summary")}
                />
                <label htmlFor="doc-summary" className="flex-1 cursor-pointer">
                  <p className="text-sm font-medium">Will Information Summary</p>
                  <p className="text-xs text-muted-foreground">Clean summary of planning data</p>
                </label>
              </div>
              
              <div className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                <Checkbox
                  id="doc-outline"
                  checked={selectedDocs.outline}
                  onCheckedChange={() => handleToggleDoc("outline")}
                />
                <label htmlFor="doc-outline" className="flex-1 cursor-pointer">
                  <p className="text-sm font-medium">Will Outline (Draft for Review)</p>
                  <p className="text-xs text-muted-foreground">Structured draft with placeholders</p>
                </label>
              </div>
              
              <div className="flex items-center space-x-3 p-3 rounded-lg border bg-primary/5 hover:bg-primary/10 transition-colors">
                <Checkbox
                  id="doc-attorney"
                  checked={selectedDocs.attorneyPrep}
                  onCheckedChange={() => handleToggleDoc("attorneyPrep")}
                />
                <label htmlFor="doc-attorney" className="flex-1 cursor-pointer">
                  <p className="text-sm font-medium flex items-center gap-2">
                    Attorney Preparation Summary
                    <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded">Recommended</span>
                  </p>
                  <p className="text-xs text-muted-foreground">Structured summary for attorney review</p>
                </label>
              </div>
            </div>
          </div>

          {/* Delivery Method */}
          <Tabs value={deliveryMethod} onValueChange={(v) => setDeliveryMethod(v as "email" | "link")}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="email" className="gap-2">
                <Mail className="h-4 w-4" />
                Email
              </TabsTrigger>
              <TabsTrigger value="link" className="gap-2">
                <Link2 className="h-4 w-4" />
                Download
              </TabsTrigger>
            </TabsList>

            <TabsContent value="email" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="attorney-email">Attorney Email</Label>
                <Input
                  id="attorney-email"
                  type="email"
                  placeholder="attorney@lawfirm.com"
                  value={attorneyEmail}
                  onChange={(e) => setAttorneyEmail(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="custom-message">Message (Optional)</Label>
                <Textarea
                  id="custom-message"
                  rows={4}
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  className="text-sm"
                />
              </div>

              <Button 
                onClick={handleSendEmail} 
                className="w-full gap-2"
                disabled={isSending || !hasSelectedDocs || !attorneyEmail}
              >
                <Send className="h-4 w-4" />
                {isSending ? "Sending..." : "Send Documents"}
              </Button>
            </TabsContent>

            <TabsContent value="link" className="space-y-4 mt-4">
              <Card className="bg-muted/30">
                <CardContent className="pt-4">
                  <p className="text-sm text-muted-foreground">
                    Download your selected documents to share manually with your attorney.
                  </p>
                </CardContent>
              </Card>

              <Button 
                onClick={handleGenerateLink} 
                className="w-full gap-2"
                disabled={isSending || !hasSelectedDocs}
              >
                <FileText className="h-4 w-4" />
                {isSending ? "Generating..." : "Download Documents"}
              </Button>
            </TabsContent>
          </Tabs>

          {/* Disclaimer */}
          <p className="text-xs text-muted-foreground text-center">
            These documents are for preparation only and are not legal wills.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
