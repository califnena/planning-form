import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ALL_SECTIONS } from "@/lib/sections";
import { User } from "@supabase/supabase-js";
import { Switch } from "@/components/ui/switch";
import { TextSizeToggle } from "@/components/TextSizeToggle";
import { CheckCircle2, ChevronDown, ChevronUp, ClipboardList, FileText, User as UserIcon, BookHeart, Users, Building, Church, DollarSign, Shield, Home, PawPrint, Globe, FolderLock, Heart } from "lucide-react";
import { TourResetButton } from "@/components/planner/TourResetButton";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import mascotCouple from "@/assets/mascot-couple.png";

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
    label: "Essentials",
    icon: ClipboardList,
    sections: ["overview", "instructions", "personal"]
  },
  {
    id: "farewell",
    label: "Planning Your Farewell",
    icon: Church,
    sections: ["legacy", "funeral", "providers"]
  },
  {
    id: "finances",
    label: "Finances & Legal",
    icon: DollarSign,
    sections: ["financial", "insurance", "legal"]
  },
  {
    id: "digital-home",
    label: "Digital & Home",
    icon: Home,
    sections: ["digital", "property", "pets"]
  },
  {
    id: "messages",
    label: "Letters & Messages",
    icon: Heart,
    sections: ["messages", "contacts"]
  }
];

// Elder-friendly labels and descriptions
const FRIENDLY_LABELS: Record<string, { label: string; description: string; icon: any }> = {
  overview: {
    label: "Planning Overview",
    description: "A simple checklist of the most important items.",
    icon: ClipboardList
  },
  instructions: {
    label: "My Instructions",
    description: "Notes for your loved ones about what you want.",
    icon: FileText
  },
  personal: {
    label: "Personal and Family Details",
    description: "Basic information about you and the people in your life.",
    icon: UserIcon
  },
  legacy: {
    label: "Life Story & Legacy",
    description: "Your memories, achievements, and ideas for your obituary.",
    icon: BookHeart
  },
  contacts: {
    label: "Important People to Notify",
    description: "People who should be contacted during a difficult time.",
    icon: Users
  },
  providers: {
    label: "Service Providers & Arrangements",
    description: "Funeral homes, churches, and other service contacts.",
    icon: Building
  },
  funeral: {
    label: "Funeral & Ceremony Wishes",
    description: "The kind of service you want, music, readings, and more.",
    icon: Church
  },
  financial: {
    label: "Financial Life",
    description: "Where your accounts are, bills, debts, and important details.",
    icon: DollarSign
  },
  insurance: {
    label: "Insurance & Benefits",
    description: "Life insurance, pensions, Social Security, and other benefits.",
    icon: Shield
  },
  property: {
    label: "Property & Valuables",
    description: "Homes, vehicles, valuables, and how you want them handled.",
    icon: Home
  },
  pets: {
    label: "Pet Care Instructions",
    description: "Who will care for your pets and what they need.",
    icon: PawPrint
  },
  digital: {
    label: "Online Accounts",
    description: "Passwords, devices, and important digital information.",
    icon: Globe
  },
  legal: {
    label: "Legal Document Storage",
    description: "Keep track of where your will, trust, and legal documents are stored.",
    icon: FolderLock
  },
  messages: {
    label: "Letters & Personal Messages",
    description: "Messages you want to leave for loved ones.",
    icon: Heart
  }
};

export const SectionPreferences = ({ user, onSave, onContinue, showWelcome }: SectionPreferencesProps) => {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [openGroups, setOpenGroups] = useState<Set<string>>(new Set(SECTION_GROUPS.map(g => g.id)));
  const { toast } = useToast();

  useEffect(() => {
    loadSettings();
  }, [user]);

  const loadSettings = async () => {
    try {
      const { data, error } = await supabase
        .from("user_settings")
        .select("selected_sections")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error && error.code !== "PGRST116") {
        console.error("Error loading settings:", error);
      }

      const sections = data?.selected_sections || [];
      setSelected(new Set(sections));
    } catch (error) {
      console.error("Error loading preferences:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggle = (sectionId: string) => {
    const newSelected = new Set(selected);
    if (newSelected.has(sectionId)) {
      newSelected.delete(sectionId);
    } else {
      newSelected.add(sectionId);
    }
    setSelected(newSelected);
  };

  const toggleGroup = (groupId: string) => {
    const newOpenGroups = new Set(openGroups);
    if (newOpenGroups.has(groupId)) {
      newOpenGroups.delete(groupId);
    } else {
      newOpenGroups.add(groupId);
    }
    setOpenGroups(newOpenGroups);
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from("user_settings")
        .upsert({
          user_id: user.id,
          selected_sections: Array.from(selected),
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;

      toast({
        title: "Preferences Saved",
        description: "Your topic selections have been saved.",
      });

      onSave?.();
    } catch (error) {
      console.error("Error saving preferences:", error);
      toast({
        title: "Error",
        description: "Failed to save your preferences. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-muted-foreground">Loading preferences...</div>
      </div>
    );
  }

  return (
    <div className="pb-8">
      {/* Sticky Action Bar */}
      <div className="sticky top-0 z-20 bg-background/95 backdrop-blur-sm border-b border-border shadow-sm mb-6">
        <div className="flex items-center justify-between gap-4 px-6 py-4 flex-wrap">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-foreground">Preferences</h1>
            <TextSizeToggle />
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <Button onClick={saveSettings} disabled={saving} size="lg" className="shadow-sm">
              {saving ? "Saving..." : "Save Preferences"}
            </Button>
            {onContinue && (
              <Button onClick={onContinue} variant="secondary" size="lg" className="shadow-sm">
                Continue to My Planner
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="px-6 space-y-6">
        {/* Header Section with Mr. Everlasting */}
        <div className="flex items-start justify-between gap-6 flex-wrap">
          <div className="flex-1">
            <p className="text-lg text-muted-foreground max-w-3xl">
              Select which sections you want to see in your planner. You can always change these settings later.
            </p>
          </div>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex-shrink-0">
                  <Avatar className="h-20 w-20 border-2 border-primary/20 shadow-lg">
                    <AvatarImage src={mascotCouple} alt="Mr. Everlasting" className="object-cover" />
                    <AvatarFallback>EFA</AvatarFallback>
                  </Avatar>
                </div>
              </TooltipTrigger>
              <TooltipContent side="left" className="max-w-xs">
                <p className="text-sm">Need help choosing? I can explain what each section means.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        {/* Collapsible Section Groups */}
        <div className="space-y-4">
          {SECTION_GROUPS.map((group) => {
            const GroupIcon = group.icon;
            const isOpen = openGroups.has(group.id);
            const groupSections = group.sections.filter(sId => FRIENDLY_LABELS[sId]);
            const completedCount = groupSections.filter(sId => selected.has(sId)).length;
            
            return (
              <Collapsible
                key={group.id}
                open={isOpen}
                onOpenChange={() => toggleGroup(group.id)}
              >
                <Card className="shadow-sm hover:shadow-md transition-shadow">
                  <CollapsibleTrigger className="w-full">
                    <div className="flex items-center justify-between p-6 cursor-pointer group">
                      <div className="flex items-center gap-4">
                        <div className="p-3 rounded-lg bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors">
                          <GroupIcon className="h-6 w-6" />
                        </div>
                        <div className="text-left">
                          <h3 className="text-xl font-semibold text-foreground group-hover:text-primary transition-colors">
                            {group.label}
                          </h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            {completedCount} of {groupSections.length} selected
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {completedCount === groupSections.length && groupSections.length > 0 && (
                          <CheckCircle2 className="h-5 w-5 text-green-600" />
                        )}
                        {isOpen ? (
                          <ChevronUp className="h-5 w-5 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-muted-foreground" />
                        )}
                      </div>
                    </div>
                  </CollapsibleTrigger>
                  
                  <CollapsibleContent>
                    <div className="px-6 pb-6 pt-0 space-y-3">
                      {groupSections.map((sectionId) => {
                        const sectionInfo = FRIENDLY_LABELS[sectionId];
                        if (!sectionInfo) return null;
                        
                        const SectionIcon = sectionInfo.icon;
                        const isSelected = selected.has(sectionId);
                        
                        return (
                          <div
                            key={sectionId}
                            className={`flex items-center justify-between p-4 rounded-lg border-2 transition-all cursor-pointer ${
                              isSelected
                                ? "border-primary bg-primary/5 shadow-sm"
                                : "border-border hover:border-primary/50 hover:bg-accent/50"
                            }`}
                            onClick={() => toggle(sectionId)}
                          >
                            <div className="flex items-center gap-4 flex-1">
                              <SectionIcon className={`h-5 w-5 ${isSelected ? "text-primary" : "text-muted-foreground"}`} />
                              <div>
                                <h4 className="font-medium text-foreground">{sectionInfo.label}</h4>
                                <p className="text-sm text-muted-foreground mt-0.5">{sectionInfo.description}</p>
                              </div>
                            </div>
                            <Switch
                              checked={isSelected}
                              onCheckedChange={() => toggle(sectionId)}
                              className="ml-4"
                            />
                          </div>
                        );
                      })}
                    </div>
                  </CollapsibleContent>
                </Card>
              </Collapsible>
            );
          })}
        </div>

        {/* Bottom Action Buttons */}
        <div className="flex gap-3 pt-6 flex-wrap">
          <Button onClick={saveSettings} disabled={saving} size="lg" className="flex-1 shadow-sm">
            {saving ? "Saving..." : "Save Preferences"}
          </Button>
          {onContinue && (
            <Button onClick={onContinue} variant="secondary" size="lg" className="flex-1 shadow-sm">
              Continue to My Planner
            </Button>
          )}
        </div>

        <TourResetButton userId={user.id} />
      </div>
    </div>
  );
};
