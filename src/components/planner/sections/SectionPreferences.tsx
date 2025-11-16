import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ALL_SECTIONS } from "@/lib/sections";
import { User } from "@supabase/supabase-js";
import { Switch } from "@/components/ui/switch";
import { useTextSize } from "@/contexts/TextSizeContext";
import { TextSizeToggle } from "@/components/TextSizeToggle";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";
import { TourResetButton } from "@/components/planner/TourResetButton";

interface SectionPreferencesProps {
  user: User;
  onSave?: () => void;
  onContinue?: () => void;
  showWelcome?: boolean;
}

// Elder-friendly labels and descriptions
const FRIENDLY_LABELS: Record<string, { label: string; description: string }> = {
  overview: {
    label: "Planning Overview",
    description: "A simple checklist of the most important items."
  },
  instructions: {
    label: "My Instructions",
    description: "Notes for your loved ones about what you want."
  },
  personal: {
    label: "Personal and Family Details",
    description: "Basic information about you and the people in your life."
  },
  legacy: {
    label: "Life Story & Legacy",
    description: "Your memories, achievements, and ideas for your obituary."
  },
  contacts: {
    label: "Important People to Notify",
    description: "People who should be contacted during a difficult time."
  },
  providers: {
    label: "Service Providers & Arrangements",
    description: "Funeral homes, churches, and other service contacts."
  },
  funeral: {
    label: "Funeral & Ceremony Wishes",
    description: "The kind of service you want, music, readings, and more."
  },
  financial: {
    label: "Financial Life",
    description: "Where your accounts are, bills, debts, and important details."
  },
  insurance: {
    label: "Insurance & Benefits",
    description: "Life insurance, pensions, Social Security, and other benefits."
  },
  property: {
    label: "Property & Valuables",
    description: "Homes, vehicles, valuables, and how you want them handled."
  },
  pets: {
    label: "Pet Care Instructions",
    description: "Who will care for your pets and what they need."
  },
  digital: {
    label: "Online Accounts",
    description: "Passwords, devices, and important digital information."
  },
  legal: {
    label: "Legal Document Storage",
    description: "Keep track of where your will, trust, and legal documents are stored."
  },
  messages: {
    label: "Letters & Personal Messages",
    description: "Messages you want to leave for loved ones."
  }
};

export const SectionPreferences = ({ user, onSave, onContinue, showWelcome }: SectionPreferencesProps) => {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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

  const saveSettings = async () => {
    setSaving(true);
    try {
      const selectedArray = Array.from(selected);

      const { error } = await supabase
        .from("user_settings")
        .upsert({
          user_id: user.id,
          selected_sections: selectedArray,
          updated_at: new Date().toISOString()
        }, {
          onConflict: "user_id"
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
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-sm text-muted-foreground">Loading your preferences...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div className="space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <h1 className="text-3xl font-bold">⚙️ Preferences</h1>
          <div className="flex items-center gap-3">
            <TourResetButton userId={user.id} />
            <TextSizeToggle />
          </div>
        </div>
        <p className="text-lg text-muted-foreground">
          Choose which parts of the planner you want to use. You can turn things on or off at any time.
        </p>
      </div>

      {/* Welcome message for first-time users */}
      {showWelcome && (
        <Alert className="border-primary/50 bg-primary/5">
          <Info className="h-5 w-5 text-primary" />
          <AlertDescription className="text-base ml-2">
            <strong>Let's personalize this.</strong> Choose the topics that apply to you.
          </AlertDescription>
        </Alert>
      )}

      {/* Section Cards */}
      <div className="space-y-4">
        {ALL_SECTIONS.map((section) => {
          const metadata = FRIENDLY_LABELS[section.id];
          const isSelected = selected.has(section.id);

          return (
            <Card
              key={section.id}
              className={`transition-all cursor-pointer hover:shadow-md ${
                isSelected
                  ? "border-primary bg-primary/5"
                  : "border-border bg-card hover:bg-accent/50"
              }`}
              onClick={() => toggle(section.id)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <CardTitle className="text-xl font-semibold leading-tight">
                      {metadata?.label || section.title}
                    </CardTitle>
                    <CardDescription className="text-base leading-relaxed">
                      {metadata?.description || section.description}
                    </CardDescription>
                  </div>
                  <Switch
                    checked={isSelected}
                    onCheckedChange={() => toggle(section.id)}
                    className="mt-1 scale-125"
                    aria-label={`Toggle ${metadata?.label || section.title}`}
                  />
                </div>
              </CardHeader>
            </Card>
          );
        })}
      </div>

      {/* Always visible sections note */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription className="ml-2">
          <strong>Helpful Resources</strong> and <strong>Common Questions</strong> are always available to guide you.
        </AlertDescription>
      </Alert>

      {/* Action buttons */}
      <div className="flex items-center gap-4 pt-4">
        <Button
          size="lg"
          onClick={saveSettings}
          disabled={saving}
          className="text-lg px-8 py-6"
        >
          {saving ? "Saving..." : "Save Preferences"}
        </Button>
        {onContinue && (
          <Button
            size="lg"
            variant="outline"
            onClick={onContinue}
            className="text-lg px-8 py-6"
          >
            Continue to My Planner
          </Button>
        )}
      </div>
    </div>
  );
};
