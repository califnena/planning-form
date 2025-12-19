import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Info, AlertTriangle, Lock, Eye, Shield, Heart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// ============================================
// TOAST MESSAGES
// ============================================

export const useEfaToasts = () => {
  const { toast } = useToast();

  return {
    // 5) Download started
    showDownloadStarted: () => {
      toast({
        description: "Download started.",
      });
    },

    // 8) Save success
    showSaveSuccess: () => {
      toast({
        description: "Saved.",
      });
    },

    // 10) Required fields missing
    showRequiredFieldsMissing: () => {
      toast({
        description: "Please complete the required fields.",
        variant: "destructive",
      });
    },
  };
};

// ============================================
// BANNER COMPONENTS
// ============================================

// 3) Read-only notice (Trusted Contact)
export const ReadOnlyBanner = () => (
  <Alert className="border-blue-200 bg-blue-50">
    <Eye className="h-4 w-4 text-blue-600" />
    <AlertTitle className="text-blue-800 font-medium">Read-only access</AlertTitle>
    <AlertDescription className="text-blue-700">
      You can view and download shared tools, but you can't edit the plan.
    </AlertDescription>
  </Alert>
);

// 4) Account holder privacy reminder
export const PrivacyProtectedBanner = () => (
  <Alert className="border-green-200 bg-green-50">
    <Shield className="h-4 w-4 text-green-600" />
    <AlertTitle className="text-green-800 font-medium">Your privacy is protected</AlertTitle>
    <AlertDescription className="text-green-700">
      Trusted contacts only see what you choose to share.
    </AlertDescription>
  </Alert>
);

// 11) Gentle reassurance (After-Death areas)
export const OneStepAtATimeBanner = () => (
  <Alert className="border-amber-200 bg-amber-50">
    <Heart className="h-4 w-4 text-amber-600" />
    <AlertTitle className="text-amber-800 font-medium">One step at a time</AlertTitle>
    <AlertDescription className="text-amber-700">
      This checklist is here to reduce guesswork. You don't have to do everything today.
    </AlertDescription>
  </Alert>
);

// 12) Professional help reminder (footer)
export const ProfessionalHelpFooter = () => (
  <p className="text-xs text-muted-foreground text-center py-4 border-t mt-8">
    EFA provides organization and guidance, not legal, financial, or medical advice.
  </p>
);

// ============================================
// DIALOG COMPONENTS
// ============================================

interface ErrorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// 1) Trusted contact access required
interface AccessNotAvailableDialogProps extends ErrorDialogProps {
  onBack: () => void;
  onRequestAccess: () => void;
}

export const AccessNotAvailableDialog = ({
  open,
  onOpenChange,
  onBack,
  onRequestAccess,
}: AccessNotAvailableDialogProps) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent>
      <DialogHeader>
        <Lock className="h-8 w-8 text-muted-foreground mb-2" />
        <DialogTitle>Access not available</DialogTitle>
        <DialogDescription>
          This section is only available to trusted contacts when the account holder shares it.
        </DialogDescription>
      </DialogHeader>
      <DialogFooter className="flex gap-2">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button onClick={onRequestAccess}>
          Request Access
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);

// 2) Not shared yet
interface NotSharedYetDialogProps extends ErrorDialogProps {
  onBack: () => void;
  onRequestAccess: () => void;
}

export const NotSharedYetDialog = ({
  open,
  onOpenChange,
  onBack,
  onRequestAccess,
}: NotSharedYetDialogProps) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent>
      <DialogHeader>
        <Info className="h-8 w-8 text-amber-500 mb-2" />
        <DialogTitle>Not shared yet</DialogTitle>
        <DialogDescription>
          The account holder hasn't shared this tool with you. If you need it now, tap "Request Access."
        </DialogDescription>
      </DialogHeader>
      <DialogFooter className="flex gap-2">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button onClick={onRequestAccess}>
          Request Access
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);

// 6) Download failed
interface DownloadFailedDialogProps extends ErrorDialogProps {
  onTryAgain: () => void;
  onDownloadWord: () => void;
}

export const DownloadFailedDialog = ({
  open,
  onOpenChange,
  onTryAgain,
  onDownloadWord,
}: DownloadFailedDialogProps) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent>
      <DialogHeader>
        <AlertTriangle className="h-8 w-8 text-destructive mb-2" />
        <DialogTitle>Download didn't work</DialogTitle>
        <DialogDescription>
          Please try again. If the issue continues, use the Word version or contact support.
        </DialogDescription>
      </DialogHeader>
      <DialogFooter className="flex gap-2">
        <Button variant="outline" onClick={onDownloadWord}>
          Download Word
        </Button>
        <Button onClick={onTryAgain}>
          Try Again
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);

// 7) File unavailable
interface FileUnavailableDialogProps extends ErrorDialogProps {
  onBack: () => void;
  onContactSupport: () => void;
}

export const FileUnavailableDialog = ({
  open,
  onOpenChange,
  onBack,
  onContactSupport,
}: FileUnavailableDialogProps) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent>
      <DialogHeader>
        <AlertTriangle className="h-8 w-8 text-amber-500 mb-2" />
        <DialogTitle>File temporarily unavailable</DialogTitle>
        <DialogDescription>
          This file is being updated. Please try again shortly.
        </DialogDescription>
      </DialogHeader>
      <DialogFooter className="flex gap-2">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button onClick={onContactSupport}>
          Contact Support
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);

// 9) Save failed
interface SaveFailedDialogProps extends ErrorDialogProps {
  onTryAgain: () => void;
  onCancel: () => void;
}

export const SaveFailedDialog = ({
  open,
  onOpenChange,
  onTryAgain,
  onCancel,
}: SaveFailedDialogProps) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent>
      <DialogHeader>
        <AlertTriangle className="h-8 w-8 text-destructive mb-2" />
        <DialogTitle>Changes not saved</DialogTitle>
        <DialogDescription>
          We couldn't save your updates. Check your connection and try again.
        </DialogDescription>
      </DialogHeader>
      <DialogFooter className="flex gap-2">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={onTryAgain}>
          Try Again
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);
