// Emotional flow pages: do not add pricing, progress bars, or extra choices here. Keep calm and simple.
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { getActivePlanId } from "@/lib/getActivePlanId";
import { createShareLink, getShareLinkUrl } from "@/lib/shareLinks";
import { toast } from "sonner";
import { Share2, Download, Clock, Mail, Copy, Check } from "lucide-react";

interface SectionPermission {
  id: string;
  label: string;
  enabled: boolean;
}

export default function SharingAndContinuity() {
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string | null>(null);
  const [planId, setPlanId] = useState<string | null>(null);
  const [isPreviewMode, setIsPreviewMode] = useState(true);
  const [email, setEmail] = useState("");
  const [isCreatingLink, setIsCreatingLink] = useState(false);
  const [generatedLink, setGeneratedLink] = useState("");
  const [copied, setCopied] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const [permissions, setPermissions] = useState<SectionPermission[]>([
    { id: "personal", label: "Personal Information", enabled: true },
    { id: "funeral", label: "Funeral Wishes", enabled: true },
    { id: "contacts", label: "People to Notify", enabled: true },
    { id: "messages", label: "Messages to Loved Ones", enabled: false },
    { id: "financial", label: "Financial Information", enabled: false },
  ]);

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        const result = await getActivePlanId(user.id);
        setPlanId(result.planId);

        // Check subscription status for preview mode
        const { data: sub } = await supabase
          .from("subscriptions")
          .select("status, plan_type")
          .eq("user_id", user.id)
          .eq("status", "active")
          .maybeSingle();

        setIsPreviewMode(!sub || sub.plan_type === "free");
      }
    };
    init();
  }, []);

  const togglePermission = (id: string) => {
    setPermissions(prev =>
      prev.map(p => (p.id === id ? { ...p, enabled: !p.enabled } : p))
    );
  };

  const handleCreateShareLink = async () => {
    if (!userId) {
      toast.error("Please sign in to share your plan");
      return;
    }

    setIsCreatingLink(true);
    try {
      const link = await createShareLink(userId, email || "Family", false);
      const url = getShareLinkUrl(link.token);
      setGeneratedLink(url);
      toast.success("Share link created");
    } catch (error) {
      console.error("Error creating share link:", error);
      toast.error("Could not create share link");
    } finally {
      setIsCreatingLink(false);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(generatedLink);
      setCopied(true);
      toast.success("Link copied");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Could not copy link");
    }
  };

  const handleEmailShare = () => {
    if (!generatedLink) {
      toast.error("Please create a share link first");
      return;
    }

    const subject = encodeURIComponent("My Planning Information");
    const body = encodeURIComponent(
      `I wanted to share my planning information with you.\n\nView it here:\n${generatedLink}\n\nThis link is secure and read-only.`
    );
    window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
  };

  const handleDownloadPdf = async () => {
    if (!planId) {
      toast.error("No plan found");
      return;
    }

    setIsGeneratingPdf(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-planner-pdf", {
        body: { planId, includeWatermark: isPreviewMode },
      });

      if (error) throw error;

      if (data?.pdfBase64) {
        const byteCharacters = atob(data.pdfBase64);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: "application/pdf" });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement("a");
        link.href = url;
        link.download = isPreviewMode ? "my-plan-preview.pdf" : "my-plan.pdf";
        link.click();
        
        URL.revokeObjectURL(url);
        toast.success("Download started");
      }
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("Could not generate PDF");
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <div className="min-h-screen bg-background px-4 py-12">
      <div className="max-w-2xl mx-auto space-y-8">
        <h1 className="text-2xl md:text-3xl font-semibold text-foreground text-center leading-tight">
          Keep Your Plan Safe
        </h1>

        {/* Share with Family */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Share2 className="h-5 w-5" />
              Share with family
            </CardTitle>
            <CardDescription>
              Invite family members if and when you're ready. You decide what they can see.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="email">Email address (optional)</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="family@example.com"
                className="mt-1"
              />
            </div>

            <div className="space-y-3">
              <Label className="text-sm text-muted-foreground">
                Choose what to share
              </Label>
              {permissions.map((perm) => (
                <div key={perm.id} className="flex items-center justify-between py-2">
                  <Label htmlFor={perm.id} className="text-base cursor-pointer">
                    {perm.label}
                  </Label>
                  <Switch
                    id={perm.id}
                    checked={perm.enabled}
                    onCheckedChange={() => togglePermission(perm.id)}
                  />
                </div>
              ))}
            </div>

            {generatedLink ? (
              <div className="space-y-3">
                <div className="flex gap-2">
                  <Input value={generatedLink} readOnly className="text-sm" />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleCopyLink}
                  >
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleEmailShare}
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Send via email
                </Button>
              </div>
            ) : (
              <Button
                onClick={handleCreateShareLink}
                disabled={isCreatingLink}
                className="w-full"
              >
                {isCreatingLink ? "Creating..." : "Create share link"}
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Download a Copy */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Download className="h-5 w-5" />
              Download a copy
            </CardTitle>
            <CardDescription>
              Download a copy of what you've completed so far.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={handleDownloadPdf}
              disabled={isGeneratingPdf || !planId}
              className="w-full"
            >
              {isGeneratingPdf ? "Generating..." : "Download PDF"}
            </Button>
          </CardContent>
        </Card>

        {/* Save for Later */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Clock className="h-5 w-5" />
              Save for later
            </CardTitle>
            <CardDescription>
              You can return and update this anytime.
            </CardDescription>
          </CardHeader>
        </Card>

        <div className="pt-4">
          <Button
            size="lg"
            className="min-h-[52px] text-lg w-full"
            onClick={() => navigate("/dashboard")}
          >
            Continue to dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}
