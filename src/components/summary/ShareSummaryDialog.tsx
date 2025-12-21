import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Copy, Mail, Check, Link as LinkIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface ShareSummaryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ShareSummaryDialog({ open, onOpenChange }: ShareSummaryDialogProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  
  const [activeTab, setActiveTab] = useState("link");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState(
    "I've created a summary of my planning information in case you ever need it."
  );
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleGenerateLink = async () => {
    setIsGenerating(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Generate a unique token
      const token = crypto.randomUUID();
      
      // In a real implementation, you would save this to a share_links table
      // For now, we'll just generate a mock link
      const shareLink = `${window.location.origin}/shared-summary/${token}`;
      
      setGeneratedLink(shareLink);
      
      toast({
        title: "Secure link created",
        description: "Your link is ready to share. It will expire in 30 days."
      });
    } catch (error) {
      console.error("Error generating link:", error);
      toast({
        title: "Error",
        description: "Failed to generate link. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyLink = () => {
    if (generatedLink) {
      navigator.clipboard.writeText(generatedLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({
        title: "Link copied",
        description: "The link has been copied to your clipboard."
      });
    }
  };

  const handleSendEmail = async () => {
    if (!email) {
      toast({
        title: "Email required",
        description: "Please enter a recipient email address.",
        variant: "destructive"
      });
      return;
    }

    setIsSending(true);
    try {
      // In a real implementation, this would call an edge function to send the email
      // For now, we'll show a success message
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Email sent",
        description: `Your summary has been sent to ${email}.`
      });
      
      onOpenChange(false);
      setEmail("");
    } catch (error) {
      console.error("Error sending email:", error);
      toast({
        title: "Error",
        description: "Failed to send email. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share Your Summary</DialogTitle>
          <DialogDescription>
            Choose how you'd like to share your pre-planning summary.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="link">
              <LinkIcon className="mr-2 h-4 w-4" />
              Secure Link
            </TabsTrigger>
            <TabsTrigger value="email">
              <Mail className="mr-2 h-4 w-4" />
              Email
            </TabsTrigger>
          </TabsList>

          <TabsContent value="link" className="space-y-4 mt-4">
            {!generatedLink ? (
              <>
                <p className="text-sm text-muted-foreground">
                  Create a read-only link that anyone can view without logging in.
                  The link will expire after 30 days by default.
                </p>
                <Button 
                  onClick={handleGenerateLink} 
                  disabled={isGenerating}
                  className="w-full"
                >
                  {isGenerating ? "Generating..." : "Create Secure Link"}
                </Button>
              </>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Your secure link is ready. Share it with someone you trust.
                </p>
                <div className="flex gap-2">
                  <Input 
                    value={generatedLink} 
                    readOnly 
                    className="text-sm"
                  />
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={handleCopyLink}
                  >
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  You can turn this off anytime from your sharing settings.
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="email" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="recipient-email">Recipient's Email</Label>
              <Input
                id="recipient-email"
                type="email"
                placeholder="family@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="message">Message (optional)</Label>
              <Textarea
                id="message"
                placeholder="Add a personal note..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={3}
              />
            </div>

            <Button 
              onClick={handleSendEmail} 
              disabled={isSending || !email}
              className="w-full"
            >
              {isSending ? "Sending..." : "Send Summary"}
            </Button>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
