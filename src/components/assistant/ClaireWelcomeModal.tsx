import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Heart, HelpCircle, Mic } from "lucide-react";
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
              I help with planning ahead and guide families after a death has occurred.
              I explain next steps, answer questions, and provide calm support.
            </p>
            <p className="text-muted-foreground">
              I'm available 24/7, wherever you are. No rush. No pressure.
            </p>
          </div>

          {/* Voice tip */}
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Mic className="h-4 w-4 text-primary" />
              <p className="text-sm font-medium text-foreground">
                You can talk to Claire
              </p>
            </div>
            <p className="text-xs text-muted-foreground">
              Click the mic to speak. You can also type if you prefer.
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

          {/* Privacy disclosure */}
          <p className="text-center text-xs text-muted-foreground/70">
            Privacy: Claire can save a short planning summary only if you ask. She does not store personal details.
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
                <p><strong>Planning ahead:</strong> Walks you through decisions, one section at a time.</p>
                <p><strong>After a loss:</strong> Guides you on next steps and how to avoid common mistakes.</p>
                <p className="text-xs">Claire does not give legal, medical, or financial advice.</p>
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
