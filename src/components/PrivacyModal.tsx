import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Shield } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PrivacyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const PrivacyModal = ({ open, onOpenChange }: PrivacyModalProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <Shield className="h-5 w-5 text-primary" />
            <DialogTitle>Your Privacy is Protected</DialogTitle>
          </div>
          <DialogDescription className="text-left space-y-3 pt-2">
            <p className="text-foreground">
              <strong>We do NOT save sensitive personal information (PII)</strong> such as Social Security Numbers, 
              financial account numbers, insurance policy details, or other sensitive data.
            </p>
            <p className="text-muted-foreground">
              You can safely enter this information to generate your PDF, but you'll need to re-enter it each time. 
              This information is <strong>only used for printing</strong> and is never stored in our database.
            </p>
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-end pt-4">
          <Button onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export const PrivacyLink = ({ onClick }: { onClick: () => void }) => {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors underline"
    >
      <Shield className="h-3 w-3" />
      Privacy & Data
    </button>
  );
};
