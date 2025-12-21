import { useState, useEffect } from "react";
import { Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface AutosaveIndicatorProps {
  saving?: boolean;
  lastSaved?: Date | null;
  error?: boolean;
}

export const AutosaveIndicator = ({ 
  saving = false, 
  lastSaved = null,
  error = false 
}: AutosaveIndicatorProps) => {
  const [visible, setVisible] = useState(false);
  const [showSaved, setShowSaved] = useState(false);

  useEffect(() => {
    if (saving) {
      setVisible(true);
      setShowSaved(false);
    } else if (lastSaved) {
      setShowSaved(true);
      setVisible(true);
      // Fade out after 3 seconds
      const timer = setTimeout(() => {
        setVisible(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [saving, lastSaved]);

  if (!visible && !error) return null;

  if (error) {
    return (
      <div className="flex items-center gap-2 text-sm text-destructive">
        <span>Not saved. Check your connection.</span>
      </div>
    );
  }

  return (
    <div 
      className={cn(
        "flex items-center gap-2 text-sm text-muted-foreground transition-opacity duration-300",
        visible ? "opacity-100" : "opacity-0"
      )}
    >
      {saving ? (
        <>
          <Loader2 className="h-3 w-3 animate-spin" />
          <span>Saving…</span>
        </>
      ) : showSaved ? (
        <>
          <Check className="h-3 w-3 text-green-600" />
          <span className="text-green-700">Saved</span>
        </>
      ) : null}
    </div>
  );
};
