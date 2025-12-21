import { useState, useEffect } from "react";
import { Check, X, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ShareLink, getShareLinkUrl } from "@/lib/shareLinks";
import { supabase } from "@/integrations/supabase/client";

interface ShareConfirmationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  link: ShareLink;
  action: 'copy' | 'text' | 'email';
  onConfirm: () => void;
}

export const ShareConfirmationModal = ({
  open,
  onOpenChange,
  link,
  action,
  onConfirm
}: ShareConfirmationModalProps) => {
  const [skipFuture, setSkipFuture] = useState(false);
  const [shouldShow, setShouldShow] = useState(true);

  useEffect(() => {
    const checkPreference = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      const { data } = await supabase
        .from("user_settings")
        .select("skip_share_confirmation")
        .eq("user_id", user.id)
        .maybeSingle();
      
      const settings = data as { skip_share_confirmation?: boolean } | null;
      if (settings?.skip_share_confirmation) {
        setShouldShow(false);
        onConfirm();
      }
    };
    
    if (open) {
      checkPreference();
    }
  }, [open]);

  const handleConfirm = async () => {
    if (skipFuture) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from("user_settings")
          .upsert({
            user_id: user.id,
            skip_share_confirmation: true
          }, { onConflict: 'user_id' });
      }
    }
    onConfirm();
  };

  const handlePreview = () => {
    const url = getShareLinkUrl(link.token);
    window.open(url, '_blank');
  };

  if (!shouldShow) return null;

  const canSee = [
    "Completed sections only",
    "Printable Summary download",
    "Progress Snapshot"
  ];
  
  if (link.share_archives) {
    canSee.push("Archived versions");
  }

  const cannotSee = [
    "Incomplete sections",
    "Billing & settings",
    "Any edit controls"
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>You're sharing a read-only link</DialogTitle>
          <DialogDescription>
            Recipient: <span className="font-medium text-foreground">{link.label}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div>
            <h4 className="text-sm font-medium mb-2 flex items-center gap-2 text-green-700">
              <Check className="h-4 w-4" />
              They can see
            </h4>
            <ul className="text-sm text-muted-foreground space-y-1 ml-6">
              {canSee.map((item) => (
                <li key={item}>• {item}</li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-medium mb-2 flex items-center gap-2 text-red-700">
              <X className="h-4 w-4" />
              They cannot see
            </h4>
            <ul className="text-sm text-muted-foreground space-y-1 ml-6">
              {cannotSee.map((item) => (
                <li key={item}>• {item}</li>
              ))}
            </ul>
          </div>

          <p className="text-xs text-muted-foreground">
            You can disable or regenerate this link anytime.
          </p>
        </div>

        <div className="flex items-center gap-2 py-2 border-t">
          <Checkbox
            id="skip-future"
            checked={skipFuture}
            onCheckedChange={(checked) => setSkipFuture(checked === true)}
          />
          <label 
            htmlFor="skip-future" 
            className="text-sm text-muted-foreground cursor-pointer"
          >
            Don't show this again
          </label>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={handlePreview}
            className="gap-2"
          >
            <ExternalLink className="h-4 w-4" />
            Preview as Recipient
          </Button>
          <div className="flex gap-2 flex-1 justify-end">
            <Button variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleConfirm}>
              Continue
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
