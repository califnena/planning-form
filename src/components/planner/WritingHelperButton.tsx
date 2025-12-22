import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sparkles, Pencil, ArrowDownWideNarrow, Heart, SpellCheck } from "lucide-react";
import { WritingHelperPanel, WritingAction } from "./WritingHelperPanel";

interface WritingHelperButtonProps {
  fieldLabel: string;
  fieldContext?: string;
  currentText: string;
  onInsert: (text: string) => void;
  userName?: string;
  disabled?: boolean;
}

export function WritingHelperButton({
  fieldLabel,
  fieldContext,
  currentText,
  onInsert,
  userName,
  disabled = false
}: WritingHelperButtonProps) {
  const [panelOpen, setPanelOpen] = useState(false);
  const [selectedAction, setSelectedAction] = useState<WritingAction>("help");

  const handleActionSelect = (action: WritingAction) => {
    setSelectedAction(action);
    setPanelOpen(true);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs gap-1.5"
            disabled={disabled}
          >
            <Sparkles className="h-3.5 w-3.5" />
            Writing Help
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-44">
          <DropdownMenuItem onClick={() => handleActionSelect("help")}>
            <Sparkles className="h-4 w-4 mr-2" />
            Help me write
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleActionSelect("rewrite")}>
            <Pencil className="h-4 w-4 mr-2" />
            Rewrite
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleActionSelect("shorter")}>
            <ArrowDownWideNarrow className="h-4 w-4 mr-2" />
            Make shorter
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleActionSelect("warmer")}>
            <Heart className="h-4 w-4 mr-2" />
            Make warmer
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleActionSelect("spelling")}>
            <SpellCheck className="h-4 w-4 mr-2" />
            Fix spelling
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <WritingHelperPanel
        open={panelOpen}
        onOpenChange={setPanelOpen}
        fieldLabel={fieldLabel}
        fieldContext={fieldContext}
        currentText={currentText}
        action={selectedAction}
        onInsert={onInsert}
        userName={userName}
      />
    </>
  );
}
