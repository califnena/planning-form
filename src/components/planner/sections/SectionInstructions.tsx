import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { usePreviewMode } from "@/pages/PlannerApp";
import { PreviewModeTooltip } from "@/components/planner/PreviewModeTooltip";

interface SectionInstructionsProps {
  value?: string;
  onChange: (value: string) => void;
}

export const SectionInstructions = ({ value, onChange }: SectionInstructionsProps) => {
  const { t } = useTranslation();
  const { isPreviewMode } = usePreviewMode();
  
  return (
    <div className="space-y-6">
      {/* Instructions & Settings Header */}
      <div>
        <h2 className="text-2xl font-bold mb-2">📋 Instructions & Settings</h2>
        <p className="text-muted-foreground">
          Welcome to your life planning guide. Here's what you need to know before you begin.
        </p>
      </div>

      {/* Auto-Save Notice */}
      <div className="px-4 py-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg">
        <p className="text-sm text-blue-900 dark:text-blue-100 flex items-center gap-2">
          <span className="text-base">💾</span>
          <span>Your entries are saved automatically as you type.</span>
        </p>
      </div>

      {/* Important Notice About Filling Out Fields */}
      <div className="p-6 bg-primary/10 border-2 border-primary/30 rounded-lg space-y-4">
        <h3 className="text-xl font-semibold text-foreground flex items-center gap-2">
          <span className="text-2xl">ℹ️</span>
          You Don't Have to Fill Out Everything
        </h3>
        <div className="space-y-3 text-sm text-foreground leading-relaxed">
          <p>
            <strong>This planner is designed to be flexible.</strong> You are not required to complete every section 
            or fill in every field. Only provide the information you believe is necessary or helpful for those who 
            will be handling your affairs after you're gone.
          </p>
          <p>
            Think about what matters most to you:
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li>What do your loved ones need to know to carry out your wishes?</li>
            <li>What information will make their responsibilities easier?</li>
            <li>What details about your belongings, accounts, or preferences should be documented?</li>
          </ul>
          <p>
            <strong>Your goal:</strong> Share what you want to relay to those taking care of you, your belongings, 
            and your legacy after you're gone. Nothing more, nothing less.
          </p>
        </div>
      </div>

      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-2">📝 My Instructions</h2>
          <p className="text-muted-foreground mb-6">
            {t("instructions.description")}
          </p>
        </div>
        {value && !isPreviewMode && (
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => onChange("")}
            className="flex-shrink-0"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Clear All
          </Button>
        )}
      </div>
      <div className="p-4 bg-muted/50 rounded-lg">
        <h3 className="font-semibold mb-2">💡 Important Tip:</h3>
        <p className="text-sm text-muted-foreground">
          If you make any handwritten changes on the printed version of this document, it is recommended to initial and date those changes for the record.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="instructions">My General Instructions</Label>
        <p className="text-xs text-muted-foreground">Document locations, time-sensitive actions, key contacts, and access codes</p>
        <PreviewModeTooltip enabled={isPreviewMode}>
          <Textarea
            id="instructions"
            placeholder="Add any instructions or important notes here..."
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            rows={8}
            className="resize-none w-full"
            disabled={isPreviewMode}
          />
        </PreviewModeTooltip>
      </div>

      <div className="mt-6 p-4 bg-muted/50 rounded-lg">
        <h3 className="font-semibold mb-2">💡 {t("instructions.tips")}:</h3>
        <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
          <li>{t("instructions.tip1")}</li>
          <li>{t("instructions.tip2")}</li>
          <li>{t("instructions.tip3")}</li>
          <li>Include where important documents are stored</li>
          <li>Note any time-sensitive actions that should be taken</li>
          <li>Mention key people who should be contacted first</li>
          <li>Add passwords or access codes for critical accounts</li>
        </ul>
      </div>

      <div className="mt-6 p-4 bg-primary/5 border border-primary/20 rounded-lg">
        <h3 className="font-semibold mb-3">{t("instructions.suggestedText")}</h3>
        <p className="text-sm text-foreground leading-relaxed italic">
          "If you are reading this, it means you have the difficult task of carrying out my final wishes. 
          I want you to know that everything written here was prepared with love, to make this time a little 
          easier for you. My hope is that these pages will guide you — not only with the practical details, 
          but also with the memories and words I've left behind. Please trust that what I've recorded is meant 
          to lighten your burden and honor the life we shared. I am deeply grateful for your care and your love. 
          Thank you, with all my heart and soul."
        </p>
      </div>
    </div>
  );
};
