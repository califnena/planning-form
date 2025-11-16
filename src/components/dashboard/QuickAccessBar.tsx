import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Save, Eye, CheckCircle, Headset } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export const QuickAccessBar = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSave = () => {
    // Trigger save - this would normally save current plan state
    toast({
      title: t("common.saved"),
      description: t("common.saveSuccess"),
    });
  };

  const handlePreview = () => {
    navigate("/app");
  };

  const handleChecklist = () => {
    navigate("/next-steps");
  };

  const handleVIPCoach = () => {
    navigate("/vip-coach");
  };

  return (
    <div className="flex flex-wrap gap-3 p-4 bg-muted/30 rounded-lg border">
      <div className="flex-1 min-w-[200px]">
        <p className="text-sm font-medium text-muted-foreground mb-3">{t("dashboard.quickActions")}</p>
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={handleSave}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <Save className="h-4 w-4" />
            {t("common.save")}
          </Button>
          <Button
            onClick={handlePreview}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <Eye className="h-4 w-4" />
            {t("header.previewPlan")}
          </Button>
          <Button
            onClick={handleChecklist}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <CheckCircle className="h-4 w-4" />
            {t("dashboard.tiles.afterDeath.title")}
          </Button>
          <Button
            onClick={handleVIPCoach}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <Headset className="h-4 w-4" />
            {t("dashboard.tiles.vipCoach.title")}
          </Button>
        </div>
      </div>
    </div>
  );
};
