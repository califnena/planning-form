import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ALL_SECTIONS, REQUIRED_SECTIONS } from "@/lib/sections";
import { User } from "@supabase/supabase-js";
import { CheckCircle2, Circle } from "lucide-react";

interface SectionVisibilitySettingsProps {
  user: User;
  onSave?: () => void;
}

// Section metadata with clear labels and descriptions
const SECTION_METADATA: Record<string, { label: string; description: string }> = {
  overview: {
    label: "Planning Overview (Checklist)",
    description: "A simple checklist of the main things to review and complete."
  },
  instructions: {
    label: "My Instructions",
    description: "Special notes for your family about what you want and what you do not want."
  },
  personal: {
    label: "Personal and Family Details",
    description: "Basic information about you, your family, and key personal details."
  },
  contacts: {
    label: "People to Notify",
    description: "Family and friends who should be contacted."
  },
  legacy: {
    label: "Life Story and Legacy",
    description: "Memories, life story highlights, and ideas for your obituary or tribute."
  },
  providers: {
    label: "Service Providers and Arrangements",
    description: "Funeral homes, cemeteries, churches, and other providers you prefer."
  },
  funeral: {
    label: "Funeral and Ceremony Wishes",
    description: "Type of service, location, music, readings, and other ceremony details."
  },
  financial: {
    label: "Financial Life",
    description: "Bank accounts, retirement plans, debts, and where things are located."
  },
  insurance: {
    label: "Insurance and Benefits",
    description: "Life insurance, pensions, Social Security, and other benefits."
  },
  property: {
    label: "Property and Valuables",
    description: "Homes, vehicles, valuables, and how you want them handled."
  },
  pets: {
    label: "Pet Care Instructions",
    description: "Who will care for your pets and what they need."
  },
  digital: {
    label: "Digital World",
    description: "Passwords, online accounts, and how to manage your digital life."
  },
  legal: {
    label: "Legal (Will or Trust)",
    description: "Where your will, trust, and legal documents are kept."
  },
  messages: {
    label: "Letters and Personal Messages",
    description: "Letters or messages you want to leave for loved ones."
  },
  resources: {
    label: "Helpful Resources",
    description: "Always on for all users so you can quickly find guidance and answers."
  },
  faq: {
    label: "Common Questions",
    description: "Always on for all users so you can quickly find guidance and answers."
  }
};

type TextSize = "normal" | "large" | "xlarge";

const textSizeToClass: Record<TextSize, string> = {
  normal: "text-base",
  large: "text-lg",
  xlarge: "text-xl",
};

export const SectionVisibilitySettings = ({ user, onSave }: SectionVisibilitySettingsProps) => {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [textSize, setTextSize] = useState<TextSize>(() => {
    const saved = localStorage.getItem("efa-text-size");
    return (saved as TextSize) || "normal";
  });
  const { toast } = useToast();

  useEffect(() => {
    loadSettings();
  }, [user]);

  useEffect(() => {
    localStorage.setItem("efa-text-size", textSize);
  }, [textSize]);

  const loadSettings = async () => {
    try {
      const { data, error } = await supabase
        .from("user_settings")
        .select("selected_sections")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;

      const sections = data?.selected_sections || ["overview", "funeral", "personal", "messages"];
      setSelected(new Set(sections));
    } catch (error) {
      console.error("Error loading settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggle = (id: string) => {
    if (REQUIRED_SECTIONS.some(s => s.id === id)) return;
    
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const selectAll = () => {
    setSelected(new Set(ALL_SECTIONS.map(s => s.id)));
  };

  const clearAll = () => {
    setSelected(new Set());
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from("user_settings")
        .upsert(
          {
            user_id: user.id,
            selected_sections: Array.from(selected),
            updated_at: new Date().toISOString(),
          },
          { onConflict: "user_id" }
        );

      if (error) throw error;

      toast({
        title: "Settings saved successfully",
        description: "Your section preferences have been updated.",
      });

      onSave?.();
    } catch (error: any) {
      toast({
        title: "Failed to save settings",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center">Loading your settings...</div>;
  }

  const textSizeClass = textSizeToClass[textSize];

  return (
    <div className={`space-y-6 ${textSizeClass}`}>
      {/* Header with text size controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold mb-2">Choose which sections you want to use</h2>
          <p className="text-muted-foreground">
            Pick the sections that are useful to you. You can change these later at any time. 
            Only the sections you select will show on the left side and in your printed document.
          </p>
        </div>

        {/* Text size controls */}
        <div className="inline-flex items-center gap-2 rounded-full border bg-white px-3 py-2 shadow-sm flex-shrink-0">
          <span className="text-xs font-medium text-slate-600">Text size</span>
          <button
            type="button"
            onClick={() => setTextSize("normal")}
            className={`rounded-full px-2 py-1 text-xs font-semibold ${
              textSize === "normal"
                ? "bg-slate-900 text-white"
                : "text-slate-700 hover:bg-slate-100"
            }`}
            aria-label="Normal text size"
          >
            A
          </button>
          <button
            type="button"
            onClick={() => setTextSize("large")}
            className={`rounded-full px-2 py-1 text-sm font-semibold ${
              textSize === "large"
                ? "bg-slate-900 text-white"
                : "text-slate-700 hover:bg-slate-100"
            }`}
            aria-label="Large text size"
          >
            A
          </button>
          <button
            type="button"
            onClick={() => setTextSize("xlarge")}
            className={`rounded-full px-2 py-1 text-base font-semibold ${
              textSize === "xlarge"
                ? "bg-slate-900 text-white"
                : "text-slate-700 hover:bg-slate-100"
            }`}
            aria-label="Extra large text size"
          >
            A
          </button>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-3 flex-wrap">
        <Button onClick={selectAll} variant="outline" size="lg">
          Select all sections
        </Button>
        <Button onClick={clearAll} variant="outline" size="lg">
          Clear all selections
        </Button>
        <Button onClick={saveSettings} disabled={saving} className="ml-auto" size="lg">
          {saving ? "Saving..." : "Save my settings"}
        </Button>
      </div>

      {/* Section cards */}
      <div className="grid gap-4 md:grid-cols-2">
        {ALL_SECTIONS.map((section) => {
          const isRequired = REQUIRED_SECTIONS.some(s => s.id === section.id);
          const isSelected = selected.has(section.id);
          const metadata = SECTION_METADATA[section.id] || {
            label: section.title,
            description: section.description || ""
          };
          
          return (
            <Card
              key={section.id}
              className={`cursor-pointer transition-all hover:shadow-md ${
                isSelected ? "border-primary bg-primary/5" : ""
              }`}
              onClick={() => toggle(section.id)}
            >
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="mt-0.5">
                    {isSelected ? (
                      <CheckCircle2 className="h-6 w-6 text-primary" />
                    ) : (
                      <Circle className="h-6 w-6 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1 space-y-2">
                    <h3 className="font-semibold leading-tight">
                      {metadata.label}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {metadata.description}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {REQUIRED_SECTIONS.map((section) => {
          const metadata = SECTION_METADATA[section.id] || {
            label: section.title,
            description: section.description || ""
          };

          return (
            <Card
              key={section.id}
              className="border-primary/50 bg-primary/5 opacity-95"
            >
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="mt-0.5">
                    <CheckCircle2 className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold leading-tight">
                        {metadata.label}
                      </h3>
                      <Badge variant="secondary" className="text-xs">
                        Always Included
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {metadata.description}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
