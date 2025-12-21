import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Coffee } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface SaveAndBreakButtonProps {
  onSave?: () => Promise<void> | void;
  variant?: "default" | "header";
  className?: string;
}

export const SaveAndBreakButton = ({ 
  onSave, 
  variant = "default",
  className = ""
}: SaveAndBreakButtonProps) => {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveAndBreak = async () => {
    setIsSaving(true);
    try {
      // Save current progress
      if (onSave) {
        await onSave();
      }
      
      // Update last activity timestamp
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Update user_settings with current timestamp
        const now = new Date().toISOString();
        await supabase
          .from("user_settings")
          .upsert({
            user_id: user.id,
            updated_at: now,
          } as any, {
            onConflict: "user_id"
          });
        
        // Update the last_planner_activity column directly
        await supabase
          .from("user_settings")
          .update({ last_planner_activity: now } as any)
          .eq("user_id", user.id);
      }

      // Show reassurance modal
      setShowModal(true);
    } catch (error) {
      console.error("Error saving progress:", error);
      toast.error("Could not save your progress. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleReturnToMenu = () => {
    setShowModal(false);
    navigate("/dashboard");
  };

  const handleKeepWorking = () => {
    setShowModal(false);
  };

  const handleLogout = async () => {
    setShowModal(false);
    await supabase.auth.signOut();
    navigate("/");
  };

  if (variant === "header") {
    return (
      <>
        <button
          onClick={handleSaveAndBreak}
          disabled={isSaving}
          className={`text-sm text-muted-foreground hover:text-foreground transition-colors ${className}`}
        >
          {isSaving ? "Saving..." : "Save & Take a Break"}
        </button>
        <ReassuranceModal 
          open={showModal}
          onOpenChange={setShowModal}
          onReturnToMenu={handleReturnToMenu}
          onKeepWorking={handleKeepWorking}
          onLogout={handleLogout}
        />
      </>
    );
  }

  return (
    <>
      <Button
        variant="ghost"
        onClick={handleSaveAndBreak}
        disabled={isSaving}
        className={`text-muted-foreground hover:text-foreground ${className}`}
      >
        <Coffee className="h-4 w-4 mr-2" />
        {isSaving ? "Saving..." : "Save & Take a Break"}
      </Button>
      <ReassuranceModal 
        open={showModal}
        onOpenChange={setShowModal}
        onReturnToMenu={handleReturnToMenu}
        onKeepWorking={handleKeepWorking}
        onLogout={handleLogout}
      />
    </>
  );
};

interface ReassuranceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onReturnToMenu: () => void;
  onKeepWorking: () => void;
  onLogout: () => void;
}

const ReassuranceModal = ({
  open,
  onOpenChange,
  onReturnToMenu,
  onKeepWorking,
  onLogout,
}: ReassuranceModalProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl text-center">
            You're all set for now
          </DialogTitle>
          <DialogDescription className="text-center pt-4 space-y-3">
            <p>Your information has been saved.</p>
            <p>
              You can come back anytime and continue where you left off.
            </p>
            <p className="text-muted-foreground/80">
              There's no deadline and nothing is final unless you choose to make it so.
            </p>
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col gap-3 mt-6">
          <Button onClick={onReturnToMenu} className="w-full">
            Return to Planning Menu
          </Button>
          <Button variant="outline" onClick={onKeepWorking} className="w-full">
            Stay and Keep Working
          </Button>
          <button
            onClick={onLogout}
            className="text-sm text-muted-foreground hover:text-foreground hover:underline transition-colors pt-2"
          >
            Log out and come back later
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
