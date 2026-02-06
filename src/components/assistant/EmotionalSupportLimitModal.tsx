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
import { Mail, MessageCircle } from "lucide-react";
import { useState } from "react";
import { ContactSupportForm } from "./ContactSupportForm";

interface EmotionalSupportLimitModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  messagesUsed: number;
  messagesLimit: number;
}

export function EmotionalSupportLimitModal({ 
  open, 
  onOpenChange,
  messagesUsed,
  messagesLimit
}: EmotionalSupportLimitModalProps) {
  const navigate = useNavigate();
  const [showContactForm, setShowContactForm] = useState(false);

  const handleSeeOptions = () => {
    onOpenChange(false);
    navigate("/pricing");
  };

  if (showContactForm) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Contact Us for Support</DialogTitle>
            <DialogDescription>
              We're here to help. Tell us what you need.
            </DialogDescription>
          </DialogHeader>
          <ContactSupportForm 
            prefillMessage="I've reached my monthly emotional support limit and would like to discuss options for additional support."
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
          <DialogTitle className="text-xl flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-primary" />
            Monthly Support Limit Reached
          </DialogTitle>
          <DialogDescription className="text-base leading-relaxed pt-2">
            You've reached your monthly support limit ({messagesUsed} of {messagesLimit} messages used).
            <br /><br />
            You can continue next month, or contact us for extra support.
          </DialogDescription>
        </DialogHeader>
        
        <DialogFooter className="flex-col gap-3 sm:flex-col pt-4">
          <Button 
            onClick={() => setShowContactForm(true)}
            className="w-full"
            size="lg"
          >
            <Mail className="h-4 w-4 mr-2" />
            Contact us
          </Button>
          <Button 
            variant="outline" 
            onClick={handleSeeOptions}
            className="w-full"
            size="lg"
          >
            See options
          </Button>
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="w-full text-muted-foreground"
            size="sm"
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
