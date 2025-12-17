import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ALL_SECTIONS } from "@/lib/sections";
import { User } from "@supabase/supabase-js";
import { Switch } from "@/components/ui/switch";
import { CheckCircle2, ClipboardList, FileText, User as UserIcon, BookHeart, Users, Building, Church, DollarSign, Shield, Home, PawPrint, Globe, FolderLock, Heart, HelpCircle } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import mascotCouple from "@/assets/mascot-couple.png";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface SectionPreferencesProps {
  user: User;
  onSave?: () => void;
  onContinue?: () => void;
  showWelcome?: boolean;
}

// Section groups with icons
const SECTION_GROUPS = [
  {
    id: "essentials",
    icon: ClipboardList,
    sections: ["overview", "instructions", "personal"]
  },
  {
    id: "farewell",
    icon: Church,
    sections: ["legacy", "funeral", "providers"]
  },
  {
    id: "finances",
    icon: DollarSign,
    sections: ["financial", "insurance", "legal"]
  },
  {
    id: "digital-home",
    icon: Home,
    sections: ["digital", "property", "pets"]
  },
  {
    id: "messages",
    icon: Heart,
    sections: ["messages", "contacts"]
  }
];

// Section icons mapping
const SECTION_ICONS: Record<string, any> = {
  overview: ClipboardList,
  instructions: FileText,
  personal: UserIcon,
  legacy: BookHeart,
  contacts: Users,
  providers: Building,
  funeral: Church,
  financial: DollarSign,
  insurance: Shield,
  property: Home,
  pets: PawPrint,
  digital: Globe,
  legal: FolderLock,
  messages: Heart
};

export const SectionPreferences = ({ 
  user, 
  onSave, 
  onContinue, 
  showWelcome = false 
}: SectionPreferencesProps) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [selectedSections, setSelectedSections] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeGroup, setActiveGroup] = useState("essentials");

  useEffect(() => {
    loadSettings();
  }, [user.id]);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("user_settings")
        .select("selected_sections")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;

      if (data?.selected_sections) {
        setSelectedSections(data.selected_sections);
      } else {
        setSelectedSections(["overview", "funeral", "personal", "legacy", "contacts", "financial"]);
      }
    } catch (error) {
      console.error("Error loading settings:", error);
      toast({
        title: t('common.error'),
        description: "Could not load preferences",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const toggle = (sectionId: string) => {
    setSelectedSections(prev =>
      prev.includes(sectionId)
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const saveSettings = async () => {
    try {
      setSaving(true);
      const { error } = await supabase
        .from("user_settings")
        .upsert({
          user_id: user.id,
          selected_sections: selectedSections,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: "user_id"
        });

      if (error) throw error;

      toast({
        title: t('common.success'),
        description: t('preferences.preferencesSaved'),
      });

      if (onSave) onSave();
    } catch (error) {
      console.error("Error saving settings:", error);
      toast({
        title: t('common.error'),
        description: t('preferences.errorSaving'),
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAndContinue = async () => {
    await saveSettings();
    if (onContinue) onContinue();
  };

  const handleReset = async () => {
    const recommended = ["overview", "funeral", "personal", "legacy", "contacts", "financial"];
    setSelectedSections(recommended);
    await saveSettings();
  };

  const getGroupCount = (groupSections: string[]) => {
    return groupSections.filter(s => selectedSections.includes(s)).length;
  };

  const activeGroupSections = SECTION_GROUPS.find(g => g.id === activeGroup)?.sections || [];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-sm text-muted-foreground">{t('preferences.loadingPreferences')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b mb-6 px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex-1 min-w-0 flex items-center gap-2">
            <h1 className="text-2xl font-bold text-foreground">{t('preferences.title')}</h1>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-5 w-5 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p>{t('preferences.tooltip')}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              onClick={handleSaveAndContinue}
              disabled={saving}
              size="lg"
              className="bg-primary hidden sm:inline-flex"
            >
              {saving ? t('common.saving') : t('preferences.saveAndContinue')}
            </Button>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-[280px,1fr] gap-6">
        <div className="space-y-4">
          <Card className="p-4 border-primary/20 bg-primary/5">
            <div className="flex items-start gap-3 mb-3">
              <Avatar className="h-10 w-10 border-2 border-primary/20">
                <AvatarImage src={mascotCouple} alt="Mr. Everlasting" />
                <AvatarFallback>ME</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">{t('preferences.infoCard')}</p>
              </div>
            </div>
            <div className="text-lg font-semibold text-primary">
              {t('preferences.totalSelected', { count: selectedSections.length })}
            </div>
          </Card>

          <div className="space-y-2">
            {SECTION_GROUPS.map((group) => {
              const Icon = group.icon;
              const count = getGroupCount(group.sections);
              const isActive = activeGroup === group.id;
              
              return (
                <button
                  key={group.id}
                  onClick={() => setActiveGroup(group.id)}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-left",
                    isActive
                      ? "bg-primary/10 border-2 border-primary text-primary font-medium"
                      : "bg-card border-2 border-transparent hover:border-muted hover:bg-muted/50"
                  )}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  <span className="flex-1 text-sm">{t(`preferences.groups.${group.id}`)}</span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-background">
                    {count}/{group.sections.length}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-3">
          {activeGroupSections.map((sectionId) => {
            const section = ALL_SECTIONS.find(s => s.id === sectionId);
            if (!section) return null;

            const Icon = SECTION_ICONS[sectionId] || ClipboardList;
            const isSelected = selectedSections.includes(sectionId);

            return (
              <Card
                key={sectionId}
                className={cn(
                  "p-4 cursor-pointer transition-all hover:shadow-md",
                  isSelected
                    ? "border-2 border-primary bg-primary/5"
                    : "border-2 border-border hover:border-primary/50"
                )}
                onClick={() => toggle(sectionId)}
              >
                <div className="flex items-start gap-4">
                  <div className={cn(
                    "p-2 rounded-lg flex-shrink-0",
                    isSelected ? "bg-primary/20" : "bg-muted"
                  )}>
                    <Icon className={cn("h-5 w-5", isSelected ? "text-primary" : "text-muted-foreground")} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-foreground">
                        {t(`preferences.sections.${sectionId}.label`, section.title)}
                      </h3>
                      {isSelected && <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {t(`preferences.sections.${sectionId}.description`, section.description)}
                    </p>
                    {!isSelected && (
                      <p className="text-xs text-muted-foreground/80 mt-2 italic">
                        {t('preferences.hiddenFromSidebar')}
                      </p>
                    )}
                  </div>
                  <Switch
                    checked={isSelected}
                    onCheckedChange={() => toggle(sectionId)}
                    onClick={(e) => e.stopPropagation()}
                    className="flex-shrink-0"
                  />
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col items-center gap-4 mt-8 pt-6 border-t">
        <Button
          onClick={handleSaveAndContinue}
          disabled={saving}
          size="lg"
          className="bg-primary w-full sm:hidden"
        >
          {saving ? t('common.saving') : t('preferences.saveAndContinue')}
        </Button>
        <button 
          onClick={handleReset}
          className="text-sm text-muted-foreground hover:text-foreground underline transition-colors"
        >
          {t('preferences.resetLink')}
        </button>
      </div>
    </div>
  );
};
