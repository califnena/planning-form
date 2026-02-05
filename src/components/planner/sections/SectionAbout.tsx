import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import { usePreviewMode } from "@/pages/PlannerApp";
import { PreviewModeWrapper } from "@/components/planner/PreviewModeWrapper";

interface SectionAboutProps {
  value?: string;
  onChange: (value: string) => void;
}

export const SectionAbout = ({ value, onChange }: SectionAboutProps) => {
  const { toast } = useToast();
  const { t } = useTranslation();
  const { isPreviewMode } = usePreviewMode();

  const handleSave = () => {
    if (isPreviewMode) {
      return;
    }
    toast({
      title: t("common.saved"),
      description: t("about.saved"),
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-2">{t("navigation.about")}</h2>
          <p className="text-muted-foreground">
            {t("about.description")}
          </p>
        </div>
        <Button onClick={handleSave} size="sm" disabled={isPreviewMode}>
          <Save className="h-4 w-4 mr-2" />
          {t("common.save")}
        </Button>
      </div>

      <PreviewModeWrapper>
        <div className="space-y-2">
          <Label htmlFor="about">{t("about.storyLegacy")}</Label>
          <p className="text-xs text-muted-foreground">{t("about.storyHelp")}</p>
          <Textarea
            id="about"
            placeholder={t("about.placeholder")}
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            rows={12}
            className="resize-none"
          />
        </div>
      </PreviewModeWrapper>

      <div className="mt-6 p-4 bg-muted/50 rounded-lg">
        <h3 className="font-semibold mb-2">💡 {t("about.whatToInclude")}</h3>
        <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
          <li>{t("about.include1")}</li>
          <li>{t("about.include2")}</li>
          <li>{t("about.include3")}</li>
          <li>{t("about.include4")}</li>
          <li>{t("about.include5")}</li>
        </ul>
      </div>
    </div>
  );
};
