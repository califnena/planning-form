import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Save, Music } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import { usePreviewMode } from "@/pages/PlannerApp";
import { PreviewModeWrapper } from "@/components/planner/PreviewModeWrapper";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { WritingHelperButton } from "@/components/planner/WritingHelperButton";

interface SectionLegacyProps {
  data?: any;
  onChange?: (data: any) => void;
}

/**
 * SectionLegacy
 * 
 * CANONICAL KEY: legacy (object in plan_payload)
 * Structure: { life_story: string }
 * 
 * SAVE: data.legacy.life_story → plan_payload.legacy.life_story
 * READ: data.legacy.life_story from plan_payload
 * COMPLETION: hasMeaningfulData(plan_payload.legacy)
 */
export const SectionLegacy = ({ data, onChange }: SectionLegacyProps) => {
  const { toast } = useToast();
  const { t } = useTranslation();
  const { isPreviewMode } = usePreviewMode();
  const navigate = useNavigate();

  // CANONICAL: Read from legacy object
  const legacy = data?.legacy || {};
  const lifeStory = legacy.life_story || "";

  const updateLegacy = (field: string, value: string) => {
    if (onChange) {
      // CANONICAL: Write to legacy object
      const updated = {
        ...data,
        legacy: { ...legacy, [field]: value }
      };
      
      if (import.meta.env.DEV) {
        console.log("[SectionLegacy] updateLegacy:", field, "→ legacy.life_story");
      }
      
      onChange(updated);
    }
  };

  const handleSave = () => {
    if (isPreviewMode) {
      toast({
        title: "Read-Only Mode",
        description: "Subscribe to edit and save your plan.",
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
          <div className="flex items-center justify-between">
            <Label htmlFor="legacy">Your Life Story</Label>
            <WritingHelperButton
              fieldLabel="Life Story & Obituary"
              fieldContext="life_story"
              currentText={lifeStory}
              onInsert={(value) => updateLegacy("life_story", value)}
              disabled={isPreviewMode}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Need help writing? Use the button above for obituary and tribute wording ideas.
          </p>
          <Textarea
            id="legacy"
            placeholder="Share your story, accomplishments, values, and the legacy you want to leave behind..."
            value={lifeStory}
            onChange={(e) => updateLegacy("life_story", e.target.value)}
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

      {/* Custom Tribute Song Card */}
      <Card className="mt-6 border-primary/20">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <Music className="h-8 w-8 text-primary flex-shrink-0 mt-1" />
            <div className="flex-1">
              <h3 className="font-semibold text-lg mb-2">Create a Custom Tribute Song</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Turn your life story into a beautiful personalized song. Our service uses your story 
                to create a meaningful musical tribute delivered in 1-2 days.
              </p>
              <Button onClick={() => navigate('/products/custom-song')} variant="default">
                <Music className="h-4 w-4 mr-2" />
                Learn More About Tribute Songs
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};