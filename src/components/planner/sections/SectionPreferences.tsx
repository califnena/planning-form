import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ALL_SECTIONS } from "@/lib/sections";
import { User } from "@supabase/supabase-js";
import { Switch } from "@/components/ui/switch";
import { CheckCircle2, ChevronRight, Edit2, Info } from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

// Map section IDs to their planner routes
const SECTION_ROUTES: Record<string, string> = {
  personal: "/preplandashboard/personal-family",
  funeral: "/preplandashboard/funeral-wishes",
  financial: "/preplandashboard/financial-life",
  property: "/preplandashboard/property-valuables",
  legal: "/preplandashboard/legal-docs",
  messages: "/preplandashboard/messages",
  contacts: "/preplandashboard/contacts",
  insurance: "/preplandashboard/insurance",
  digital: "/preplandashboard/digital",
  pets: "/preplandashboard/pets",
};

interface SectionPreferencesProps {
  user: User;
  onSave?: () => void;
  onContinue?: () => void;
  showWelcome?: boolean;
}

// Simplified section list with friendly labels
const FRIENDLY_SECTIONS = [
  {
    id: "personal",
    label: "Personal & Family Details",
    description: "Who you are and who matters to you"
  },
  {
    id: "funeral",
    label: "Funeral Wishes",
    description: "How you would like to be remembered"
  },
  {
    id: "financial",
    label: "Financial Life",
    description: "Important money and account information"
  },
  {
    id: "property",
    label: "Property & Valuables",
    description: "Homes, land, and meaningful items"
  },
  {
    id: "legal",
    label: "Legal Documents & Resources",
    description: "Wills, powers of attorney, and important papers"
  },
  {
    id: "messages",
    label: "Letters & Messages",
    description: "Notes or messages for loved ones"
  },
  {
    id: "contacts",
    label: "Important Contacts",
    description: "Family, friends, professionals, and service providers"
  },
  {
    id: "insurance",
    label: "Insurance Information",
    description: "Life insurance and other policies"
  },
  {
    id: "digital",
    label: "Online Accounts",
    description: "Email, social media, and digital services"
  },
  {
    id: "pets",
    label: "Pet Care",
    description: "Plans for your animal companions"
  }
];

// Always include these in the background
const ALWAYS_INCLUDED = ["overview", "instructions"];

export const SectionPreferences = ({ 
  user, 
  onSave, 
  onContinue, 
  showWelcome = false 
}: SectionPreferencesProps) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [selectedSections, setSelectedSections] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showAllSections, setShowAllSections] = useState(false);

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
        // Default recommended sections
        setSelectedSections([...ALWAYS_INCLUDED, "personal", "funeral", "financial", "legal", "contacts"]);
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

  const saveSettings = async (options?: { invokeOnSave?: boolean }) => {
    const invokeOnSave = options?.invokeOnSave ?? true;

    try {
      setSaving(true);
      // Always include required sections
      const sectionsToSave = [...new Set([...ALWAYS_INCLUDED, ...selectedSections])];

      const { error } = await supabase
        .from("user_settings")
        .upsert(
          {
            user_id: user.id,
            selected_sections: sectionsToSave,
            updated_at: new Date().toISOString(),
          },
          {
            onConflict: "user_id",
          }
        );

      if (error) throw error;

      toast({
        title: t('common.success'),
        description: t('preferences.preferencesSaved'),
      });

      // IMPORTANT: only invoke external onSave callbacks when explicitly desired.
      // (PreferencesPage currently reloads the window onSave; that would cancel navigation.)
      if (invokeOnSave && onSave) onSave();
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

  // Navigate to first selected section in DISPLAY ORDER (not selection order)
  const handleContinueToPlanner = async () => {
    console.info("[SectionPreferences] Continue clicked", {
      selectedSections,
      userSelectedCount,
    });

    // Save selections but DO NOT trigger external onSave callbacks (they may reload the page)
    await saveSettings({ invokeOnSave: false });

    // Find the first section in DISPLAY ORDER that the user has selected
    // This ensures consistent navigation regardless of selection order
    const firstSelectedSection = FRIENDLY_SECTIONS.find((section) =>
      selectedSections.includes(section.id)
    );

    const nextRoute = firstSelectedSection
      ? SECTION_ROUTES[firstSelectedSection.id]
      : "/preplandashboard/overview";

    console.info("[SectionPreferences] Navigating to", {
      firstSelectedSection: firstSelectedSection?.id,
      nextRoute,
    });

    if (nextRoute) {
      navigate(nextRoute);
    }
  };

  // Get sections that have data (placeholder - would check real data)
  const getSectionStatus = (sectionId: string) => {
    // This would check real data in production
    return selectedSections.includes(sectionId) ? "selected" : "not-selected";
  };

  const userSelectedCount = selectedSections.filter(s => !ALWAYS_INCLUDED.includes(s)).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-3"></div>
          <p className="text-muted-foreground">Loading your preferences...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Header - Simple and Clear */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-semibold text-foreground mb-3">
          Choose What You'd Like to Include
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          These are the areas you may want to include in your plan.<br />
          You can take this one step at a time. Nothing is required.
        </p>
      </div>

      {/* Main Content Area */}
      <div className="grid lg:grid-cols-[1fr,320px] gap-8">
        {/* Left Column - Topic Selection */}
        <div className="space-y-4">
          {FRIENDLY_SECTIONS.map((section) => {
            const isSelected = selectedSections.includes(section.id);
            
            return (
              <Card
                key={section.id}
                className={cn(
                  "p-5 cursor-pointer transition-all border-2",
                  isSelected
                    ? "border-primary bg-primary/5 shadow-sm"
                    : "border-border hover:border-primary/40 hover:bg-muted/30"
                )}
                onClick={() => toggle(section.id)}
              >
                <div className="flex items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-medium text-foreground mb-1">
                      {section.label}
                    </h3>
                    <p className="text-muted-foreground">
                      {section.description}
                    </p>
                  </div>
                  <Switch
                    checked={isSelected}
                    onCheckedChange={() => toggle(section.id)}
                    onClick={(e) => e.stopPropagation()}
                    className="flex-shrink-0 scale-110"
                  />
                </div>
              </Card>
            );
          })}

          {/* Reassurance Box */}
          <Card className="p-5 bg-accent/30 border-accent/50 mt-6">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-foreground mb-1">You're in control</h4>
                <p className="text-muted-foreground">
                  You can skip anything, come back later, or change your answers at any time.
                </p>
              </div>
            </div>
          </Card>

          {/* Primary Continue Button - Routes to first selected section */}
          <div className="pt-6 space-y-4">
            {/* Helper text to set expectation */}
            {userSelectedCount > 0 && (
              <p className="text-center text-sm text-muted-foreground">
                We'll take you to the first section you chose.
              </p>
            )}
            <Button
              onClick={handleContinueToPlanner}
              disabled={saving || userSelectedCount === 0}
              size="lg"
              className="w-full py-6 text-lg font-medium"
            >
              {saving ? "Saving..." : "Continue"}
              <ChevronRight className="ml-2 h-5 w-5" />
            </Button>

            {userSelectedCount === 0 && (
              <p className="text-center text-sm text-muted-foreground">
                Select at least one topic above to continue.
              </p>
            )}

            {/* Secondary Link */}
            <p className="text-center text-sm text-muted-foreground">
              Prefer to browse all sections instead?{" "}
              <button
                onClick={() => setShowAllSections(!showAllSections)}
                className="text-primary hover:underline font-medium"
              >
                View all planning sections
              </button>
            </p>
          </div>
        </div>

        {/* Right Column - Your Plan So Far (Preview Panel) */}
        <div className="lg:sticky lg:top-6 h-fit">
          <Card className="p-5 border-2 border-muted">
            <h3 className="font-semibold text-foreground mb-4 text-lg">
              Your Plan So Far
            </h3>
            
            <div className="space-y-3 mb-6">
              {FRIENDLY_SECTIONS.filter(s => selectedSections.includes(s.id)).map((section) => (
                <div key={section.id} className="flex items-center justify-between py-2 border-b border-muted last:border-0">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />
                    <span className="text-sm text-foreground">{section.label}</span>
                  </div>
                  <button className="text-xs text-primary hover:underline flex items-center gap-1">
                    <Edit2 className="h-3 w-3" />
                    Edit
                  </button>
                </div>
              ))}
              
              {userSelectedCount === 0 && (
                <p className="text-sm text-muted-foreground italic py-2">
                  Select topics above to add them to your plan
                </p>
              )}
            </div>

            {/* Always-visible actions */}
            <div className="space-y-3 pt-4 border-t border-muted">
              <Button
                variant="outline"
                className="w-full justify-center py-5"
                onClick={handleSaveAndContinue}
                disabled={saving}
              >
                Review My Plan
              </Button>
              <Button
                variant="outline"
                className="w-full justify-center py-5"
                onClick={handleSaveAndContinue}
                disabled={saving}
              >
                Print or Save My Wishes
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
