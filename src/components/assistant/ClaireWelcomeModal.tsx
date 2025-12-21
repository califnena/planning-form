import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Heart, HelpCircle } from "lucide-react";
import { useState } from "react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface ClaireWelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ClaireWelcomeModal({ isOpen, onClose }: ClaireWelcomeModalProps) {
  const [showHelp, setShowHelp] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Heart className="h-8 w-8 text-primary" />
            </div>
          </div>
          <DialogTitle className="text-2xl font-serif">Meet Claire</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Main message */}
          <div className="text-center space-y-3">
            <p className="text-lg">
              Hi, I'm Claire.
            </p>
            <p className="text-muted-foreground">
              I'm here to help you with planning, one step at a time.
            </p>
            <p className="text-muted-foreground">
              You can ask questions, think through decisions, or just take things slowly.
              There's no rush and no pressure.
            </p>
          </div>

          {/* Clarifying line */}
          <div className="bg-muted/50 p-4 rounded-lg text-center">
            <p className="text-sm text-muted-foreground">
              <strong>CARE Support</strong> is the service you're using.<br />
              I'm <strong>Claire</strong>, your planning assistant.
            </p>
          </div>

          {/* Gentle reassurance */}
          <p className="text-center text-sm text-muted-foreground italic">
            You can stop anytime and come back later.
          </p>

          {/* What can Claire help with - expandable */}
          <Collapsible open={showHelp} onOpenChange={setShowHelp}>
            <CollapsibleTrigger asChild>
              <button className="w-full flex items-center justify-center gap-2 text-sm text-primary hover:underline">
                <HelpCircle className="h-4 w-4" />
                What can Claire help with?
              </button>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-3">
              <div className="bg-muted/30 p-4 rounded-lg text-sm text-muted-foreground space-y-2">
                <p>Claire can help explain planning steps, review options, and guide you through decisions.</p>
                <p className="text-xs">She does not give legal or medical advice.</p>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>

        {/* Primary button */}
        <Button 
          onClick={onClose} 
          size="lg" 
          className="w-full min-h-[56px] text-lg"
        >
          Start with Claire
        </Button>
      </DialogContent>
    </Dialog>
  );
}
