import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useNavigate } from "react-router-dom";
import { Mail, Phone } from "lucide-react";
import { useState } from "react";
import { ContactSupportForm } from "./ContactSupportForm";

interface PersonalSupportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onContinueFree: () => void;
  featureAttempted?: string;
}

export function PersonalSupportModal({ 
  open, 
  onOpenChange,
  onContinueFree,
  featureAttempted 
}: PersonalSupportModalProps) {
  const navigate = useNavigate();
  const [showContactForm, setShowContactForm] = useState(false);

  const handleUnlock = () => {
    onOpenChange(false);
    navigate("/pricing");
  };

  const handleContinueFree = () => {
    onOpenChange(false);
    onContinueFree();
  };

  if (showContactForm) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Contact Us</DialogTitle>
            <DialogDescription>
              We're here to help. Tell us what you need.
            </DialogDescription>
          </DialogHeader>
          <ContactSupportForm 
            onSuccess={() => {
              setShowContactForm(false);
              onOpenChange(false);
            }}
            onCancel={() => setShowContactForm(false)}
          />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl">Personal Support</DialogTitle>
          <DialogDescription className="text-base leading-relaxed pt-2">
            You can explore guides for free.
            <br /><br />
            Personal Support lets Claire save your progress and guide you step by step.
          </DialogDescription>
        </DialogHeader>
        
        <DialogFooter className="flex-col gap-3 sm:flex-col pt-4">
          <Button 
            onClick={handleUnlock}
            className="w-full"
            size="lg"
          >
            Unlock Personal Support
          </Button>
          <Button 
            variant="outline" 
            onClick={handleContinueFree}
            className="w-full"
            size="lg"
          >
            Continue free
          </Button>
          <Button
            variant="ghost"
            onClick={() => setShowContactForm(true)}
            className="w-full text-muted-foreground"
            size="sm"
          >
            <Mail className="h-4 w-4 mr-2" />
            Contact us
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
