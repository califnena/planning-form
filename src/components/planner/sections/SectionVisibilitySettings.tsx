import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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

export const SectionVisibilitySettings = ({ user, onSave }: SectionVisibilitySettingsProps) => {
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
        title: "Settings saved",
        description: "Your section preferences have been updated.",
      });

      onSave?.();
    } catch (error: any) {
      toast({
        title: "Error saving settings",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center">Loading settings...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Section Visibility</h2>
        <p className="text-muted-foreground">
          Choose which sections appear in your planner and PDF. Some sections are always included.
        </p>
      </div>

      <div className="flex gap-3">
        <Button onClick={selectAll} variant="outline" size="sm">
          Select All
        </Button>
        <Button onClick={clearAll} variant="outline" size="sm">
          Clear All
        </Button>
        <Button onClick={saveSettings} disabled={saving} className="ml-auto">
          {saving ? "Saving..." : "Save Settings"}
        </Button>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {ALL_SECTIONS.map((section) => {
          const isSelected = selected.has(section.id);
          
          return (
            <Card
              key={section.id}
              className={`cursor-pointer transition-all hover:shadow-md ${
                isSelected ? "border-primary bg-primary/5" : ""
              }`}
              onClick={() => toggle(section.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">
                    {isSelected ? (
                      <CheckCircle2 className="h-5 w-5 text-primary" />
                    ) : (
                      <Circle className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1 space-y-1">
                    <h3 className="font-semibold text-sm leading-tight">
                      {section.title}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {section.description}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {REQUIRED_SECTIONS.map((section) => (
          <Card
            key={section.id}
            className="border-primary/50 bg-primary/5 opacity-90"
          >
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="mt-0.5">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-sm leading-tight">
                      {section.title}
                    </h3>
                    <Badge variant="secondary" className="text-xs">
                      Always included
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {section.description}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
