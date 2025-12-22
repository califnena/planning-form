import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetDescription,
  SheetFooter
} from "@/components/ui/sheet";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Loader2, Sparkles, Copy, Check, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export type WritingAction = "help" | "rewrite" | "shorter" | "warmer" | "spelling";
export type ToneOption = "calm" | "warm" | "simple";
export type LengthOption = "short" | "medium" | "detailed";

interface WritingHelperPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fieldLabel: string;
  fieldContext?: string; // e.g., "funeral_wishes" or "life_story"
  currentText: string;
  action: WritingAction;
  onInsert: (text: string) => void;
  userName?: string;
}

const actionLabels: Record<WritingAction, string> = {
  help: "Help me write",
  rewrite: "Rewrite",
  shorter: "Make shorter",
  warmer: "Make warmer",
  spelling: "Fix spelling"
};

export function WritingHelperPanel({
  open,
  onOpenChange,
  fieldLabel,
  fieldContext = "general",
  currentText,
  action,
  onInsert,
  userName
}: WritingHelperPanelProps) {
  const { toast } = useToast();
  const [editableText, setEditableText] = useState(currentText);
  const [guidance, setGuidance] = useState("");
  const [tone, setTone] = useState<ToneOption>("warm");
  const [length, setLength] = useState<LengthOption>("medium");
  const [generatedText, setGeneratedText] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  // Reset state when panel opens
  const handleOpenChange = (isOpen: boolean) => {
    if (isOpen) {
      setEditableText(currentText);
      setGeneratedText("");
      setGuidance("");
    }
    onOpenChange(isOpen);
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    setGeneratedText("");

    try {
      const { data, error } = await supabase.functions.invoke("writing-helper", {
        body: {
          action,
          currentText: editableText,
          guidance,
          tone,
          length,
          fieldLabel,
          fieldContext,
          userName
        }
      });

      if (error) throw error;

      if (data?.generatedText) {
        setGeneratedText(data.generatedText);
      } else {
        throw new Error("No text generated");
      }
    } catch (error) {
      console.error("Error generating text:", error);
      toast({
        title: "Generation failed",
        description: "Unable to generate text. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleInsert = () => {
    onInsert(generatedText);
    onOpenChange(false);
    toast({
      title: "Text inserted",
      description: "Your text has been added to the field."
    });
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(generatedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({
      title: "Copied",
      description: "Text copied to clipboard."
    });
  };

  const showGuidanceAndControls = action === "help" || action === "rewrite";

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Writing Help
          </SheetTitle>
          <SheetDescription>
            Tell us what you want to say. We'll help you put it into words.
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 py-6">
          {/* Field being edited */}
          <div className="p-3 bg-muted/50 rounded-lg">
            <p className="text-sm font-medium text-muted-foreground">Editing:</p>
            <p className="font-semibold">{fieldLabel}</p>
            <p className="text-xs text-primary mt-1">{actionLabels[action]}</p>
          </div>

          {/* Current text (editable) */}
          <div className="space-y-2">
            <Label>Your current text</Label>
            <Textarea
              value={editableText}
              onChange={(e) => setEditableText(e.target.value)}
              placeholder={action === "help" ? "Start typing or leave blank for a fresh draft..." : "Your current text will be used as the starting point..."}
              rows={4}
              className="resize-none"
            />
          </div>

          {/* Guidance (for help/rewrite) */}
          {showGuidanceAndControls && (
            <div className="space-y-2">
              <Label htmlFor="guidance">What should it include? (optional)</Label>
              <Textarea
                id="guidance"
                value={guidance}
                onChange={(e) => setGuidance(e.target.value)}
                placeholder="E.g., 'Mention my love of gardening and my three grandchildren...'"
                rows={2}
                className="resize-none"
              />
            </div>
          )}

          {/* Tone selector */}
          {showGuidanceAndControls && (
            <div className="space-y-2">
              <Label>Tone</Label>
              <ToggleGroup
                type="single"
                value={tone}
                onValueChange={(v) => v && setTone(v as ToneOption)}
                className="justify-start"
              >
                <ToggleGroupItem value="calm" className="text-sm">
                  Calm
                </ToggleGroupItem>
                <ToggleGroupItem value="warm" className="text-sm">
                  Warm
                </ToggleGroupItem>
                <ToggleGroupItem value="simple" className="text-sm">
                  Very simple
                </ToggleGroupItem>
              </ToggleGroup>
            </div>
          )}

          {/* Length selector */}
          {showGuidanceAndControls && (
            <div className="space-y-2">
              <Label>Length</Label>
              <ToggleGroup
                type="single"
                value={length}
                onValueChange={(v) => v && setLength(v as LengthOption)}
                className="justify-start"
              >
                <ToggleGroupItem value="short" className="text-sm">
                  Short
                </ToggleGroupItem>
                <ToggleGroupItem value="medium" className="text-sm">
                  Medium
                </ToggleGroupItem>
                <ToggleGroupItem value="detailed" className="text-sm">
                  Detailed
                </ToggleGroupItem>
              </ToggleGroup>
            </div>
          )}

          {/* Generate button */}
          <Button
            onClick={handleGenerate}
            disabled={isGenerating || (action !== "help" && !editableText.trim())}
            className="w-full"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Generate
              </>
            )}
          </Button>

          {/* Generated result */}
          {generatedText && (
            <div className="space-y-3">
              <Label>Generated text</Label>
              <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
                <p className="text-sm whitespace-pre-wrap">{generatedText}</p>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button onClick={handleInsert} className="flex-1">
                  <Check className="h-4 w-4 mr-2" />
                  Insert into field
                </Button>
                <Button variant="outline" onClick={handleCopy}>
                  {copied ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
                <Button variant="outline" onClick={handleGenerate} disabled={isGenerating}>
                  <RefreshCw className={`h-4 w-4 ${isGenerating ? "animate-spin" : ""}`} />
                </Button>
              </div>
            </div>
          )}

          {/* Disclaimer */}
          <p className="text-xs text-muted-foreground text-center pt-2 border-t">
            Writing help only. Not legal advice.
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
}
