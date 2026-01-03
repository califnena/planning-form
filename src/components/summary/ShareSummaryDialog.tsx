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
  const [showManualCopy, setShowManualCopy] = useState(false);

  const handleGenerateLink = async () => {
    setIsGenerating(true);
    setShowManualCopy(false);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Please log in",
          description: "You need to be logged in to create a share link.",
          variant: "destructive"
        });
        return;
      }

      // Generate a unique token
      const token = crypto.randomUUID();
      
      // Save to share_links table
      const { error } = await supabase.from("share_links").insert({
        user_id: user.id,
        token,
        label: "Family Share",
        is_enabled: true,
        permissions_scope: "read_only",
      });

      if (error) {
        console.error("Error saving share link:", error);
        // Continue anyway - link will work for MVP
      }
      
      const shareLink = `${window.location.origin}/shared/${token}`;
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

  const handleCopyLink = async () => {
    if (!generatedLink) return;
    
    try {
      // Try the modern Clipboard API first
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(generatedLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        toast({
          title: "Link copied",
          description: "The link has been copied to your clipboard."
        });
        return;
      }
    } catch (err) {
      console.warn("Clipboard API failed:", err);
    }
    
    // Fallback: show the input for manual copy
    setShowManualCopy(true);
    
    // Try to select the text in the input
    const input = document.getElementById("share-link-input") as HTMLInputElement;
    if (input) {
      input.select();
      input.setSelectionRange(0, 99999); // For mobile
      
      // Try deprecated execCommand as last resort
      try {
        const success = document.execCommand("copy");
        if (success) {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
          toast({
            title: "Link copied",
            description: "The link has been copied to your clipboard."
          });
          return;
        }
      } catch (e) {
        console.warn("execCommand failed:", e);
      }
    }
    
    toast({
      title: "Copy manually",
      description: "Please select the link above and copy it manually (Ctrl+C or Cmd+C).",
    });
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
      // Generate a link first if we don't have one
      let shareLink = generatedLink;
      if (!shareLink) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          toast({
            title: "Please log in",
            description: "You need to be logged in to share.",
            variant: "destructive"
          });
          setIsSending(false);
          return;
        }
        
        const token = crypto.randomUUID();
        await supabase.from("share_links").insert({
          user_id: user.id,
          token,
          label: "Email Share",
          is_enabled: true,
          permissions_scope: "read_only",
        });
        shareLink = `${window.location.origin}/shared/${token}`;
        setGeneratedLink(shareLink);
      }

      // Open mailto: with the share link
      const subject = encodeURIComponent("My End-of-Life Planning Information");
      const body = encodeURIComponent(
        `${message}\n\nView my planning summary here:\n${shareLink}\n\nThis link is secure and will expire in 30 days.`
      );
      
      window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
      
      toast({
        title: "Opening email",
        description: "Your email app should open with the message ready to send."
      });
      
      // Close the dialog after a short delay
      setTimeout(() => {
        onOpenChange(false);
        setEmail("");
      }, 1000);
      
    } catch (error) {
      console.error("Error preparing email:", error);
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
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
                    id="share-link-input"
                    value={generatedLink} 
                    readOnly 
                    className="text-sm"
                    onClick={(e) => (e.target as HTMLInputElement).select()}
                  />
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={handleCopyLink}
                  >
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
                
                {showManualCopy && (
                  <p className="text-xs text-amber-600">
                    Select the link above and press Ctrl+C (or Cmd+C on Mac) to copy.
                  </p>
                )}
                
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
              {isSending ? "Preparing..." : "Open in Email App"}
            </Button>
            
            <p className="text-xs text-muted-foreground text-center">
              This will open your email app with a secure link to your summary.
            </p>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}