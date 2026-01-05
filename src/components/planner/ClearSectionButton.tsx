import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { ClearSectionDialog } from "./ClearSectionDialog";
import { getEmptySectionPayload, getSectionPayloadKey } from "@/lib/emptySectionPayload";
import { getSectionLabel } from "@/lib/sectionRegistry";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ClearSectionButtonProps {
  sectionId: string;
  planId: string;
  currentPayload: Record<string, any>;
  onCleared: () => void;
  disabled?: boolean;
}

export function ClearSectionButton({
  sectionId,
  planId,
  currentPayload,
  onCleared,
  disabled = false,
}: ClearSectionButtonProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [clearing, setClearing] = useState(false);
  const { toast } = useToast();

  const sectionName = getSectionLabel(sectionId);
  const payloadKey = getSectionPayloadKey(sectionId);

  const handleClear = async () => {
    if (!planId) {
      toast({
        title: "Error",
        description: "No active plan found.",
        variant: "destructive",
      });
      return;
    }

    setClearing(true);

    try {
      // Get the empty default for this section
      const emptyPayload = getEmptySectionPayload(payloadKey);

      // Build the new payload with only this section cleared
      const newPayload = {
        ...currentPayload,
        [payloadKey]: emptyPayload,
      };

      // Save to Supabase
      const { error } = await supabase
        .from("plans")
        .update({
          plan_payload: newPayload,
          updated_at: new Date().toISOString(),
        })
        .eq("id", planId);

      if (error) throw error;

      toast({
        title: "Section cleared",
        description: `${sectionName} has been reset.`,
      });

      // Notify parent to re-fetch
      onCleared();
    } catch (error: any) {
      console.error("[ClearSectionButton] Error clearing section:", error);
      toast({
        title: "Error",
        description: "Failed to clear section. Please try again.",
        variant: "destructive",
      });
    } finally {
      setClearing(false);
    }
  };

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setDialogOpen(true)}
        disabled={disabled || clearing}
        className="text-muted-foreground hover:text-destructive gap-1"
      >
        <Trash2 className="h-4 w-4" />
        Clear this section
      </Button>

      <ClearSectionDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        sectionName={sectionName}
        onConfirmClear={handleClear}
      />
    </>
  );
}
