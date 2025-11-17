import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import { usePreviewMode } from "@/pages/PlannerApp";
import { PreviewModeWrapper } from "@/components/planner/PreviewModeWrapper";

interface SectionLegacyProps {
  value?: string;
  onChange: (value: string) => void;
}

export const SectionLegacy = ({ value, onChange }: SectionLegacyProps) => {
  const { toast } = useToast();
  const { t } = useTranslation();
  const { isPreviewMode } = usePreviewMode();

  const handleSave = () => {
    if (isPreviewMode) {
      toast({
        title: "Preview Mode",
        description: "Editing is locked. Start a trial to unlock.",
        variant: "destructive",
      });
      return;
    }
    toast({
      title: t("common.saved"),
      description: "Life story saved successfully",
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-2">Life Story & Legacy</h2>
          <p className="text-muted-foreground">
            Share your memories, achievements, and ideas for your obituary
          </p>
        </div>
        <Button onClick={handleSave} size="sm" disabled={isPreviewMode}>
          <Save className="h-4 w-4 mr-2" />
          {t("common.save")}
        </Button>
      </div>

      <PreviewModeWrapper>
        <div className="space-y-2">
          <Label htmlFor="legacy">Your Life Story</Label>
          <p className="text-xs text-muted-foreground">
            Write about your life journey, what made you proud, and how you want to be remembered
          </p>
          <Textarea
            id="legacy"
            placeholder="Share your story, accomplishments, values, and the legacy you want to leave behind..."
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            rows={12}
            className="resize-none"
          />
        </div>
      </PreviewModeWrapper>

      <div className="mt-6 p-4 bg-muted/50 rounded-lg">
        <h3 className="font-semibold mb-2">💡 What to Include</h3>
        <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
          <li>Important milestones and achievements in your life</li>
          <li>Your hobbies, interests, and passions</li>
          <li>Career highlights and contributions to your community</li>
          <li>Family memories and stories you want passed down</li>
          <li>Values and lessons you hope to leave behind</li>
          <li>Ideas for your obituary or memorial tribute</li>
        </ul>
      </div>
    </div>
  );
};
