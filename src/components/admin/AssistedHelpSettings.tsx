import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { HelpCircle, Save } from "lucide-react";

interface AssistedHelpConfig {
  enabled: boolean;
  timeoutMinutes: number;
}

/**
 * Admin settings panel for the assisted help trigger feature
 * 
 * Allows admins to:
 * - Toggle the feature on/off
 * - Adjust the inactivity timeout (1-10 minutes)
 */
export function AssistedHelpSettings() {
  const [config, setConfig] = useState<AssistedHelpConfig>({
    enabled: true,
    timeoutMinutes: 4,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [originalConfig, setOriginalConfig] = useState<AssistedHelpConfig | null>(null);

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const { data, error } = await supabase
        .from("app_config")
        .select("key, value")
        .in("key", ["assisted_help_trigger_enabled", "assisted_help_trigger_minutes"]);

      if (error) throw error;

      const newConfig: AssistedHelpConfig = {
        enabled: true,
        timeoutMinutes: 4,
      };

      data?.forEach((row) => {
        if (row.key === "assisted_help_trigger_enabled") {
          newConfig.enabled = row.value === true || row.value === "true";
        }
        if (row.key === "assisted_help_trigger_minutes") {
          const minutes = typeof row.value === "number" 
            ? row.value 
            : parseInt(String(row.value), 10);
          if (!isNaN(minutes)) {
            newConfig.timeoutMinutes = minutes;
          }
        }
      });

      setConfig(newConfig);
      setOriginalConfig(newConfig);
    } catch (err) {
      console.error("Error fetching config:", err);
      toast.error("Failed to load settings");
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (enabled: boolean) => {
    setConfig((prev) => ({ ...prev, enabled }));
    setHasChanges(true);
  };

  const handleTimeoutChange = (value: number[]) => {
    setConfig((prev) => ({ ...prev, timeoutMinutes: value[0] }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    setSaving(true);

    try {
      // Update enabled setting
      const { error: enabledError } = await supabase
        .from("app_config")
        .update({ value: config.enabled })
        .eq("key", "assisted_help_trigger_enabled");

      if (enabledError) throw enabledError;

      // Update timeout setting
      const { error: timeoutError } = await supabase
        .from("app_config")
        .update({ value: config.timeoutMinutes })
        .eq("key", "assisted_help_trigger_minutes");

      if (timeoutError) throw timeoutError;

      setOriginalConfig(config);
      setHasChanges(false);
      toast.success("Settings saved successfully");
    } catch (err) {
      console.error("Error saving config:", err);
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (originalConfig) {
      setConfig(originalConfig);
      setHasChanges(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5" />
            Assisted Help Trigger
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Loading settings...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <HelpCircle className="h-5 w-5" />
          Assisted Help Trigger
        </CardTitle>
        <CardDescription>
          Configure the non-intrusive help prompt shown to users who appear stuck on planning pages.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Enable/Disable toggle */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label htmlFor="assisted-help-enabled" className="text-base">
              Enable Help Trigger
            </Label>
            <p className="text-sm text-muted-foreground">
              Show a gentle help prompt when users appear stuck
            </p>
          </div>
          <Switch
            id="assisted-help-enabled"
            checked={config.enabled}
            onCheckedChange={handleToggle}
          />
        </div>

        {/* Timeout slider */}
        <div className="space-y-4">
          <div className="space-y-1">
            <Label className="text-base">
              Inactivity Timeout
            </Label>
            <p className="text-sm text-muted-foreground">
              Minutes of inactivity before showing the help prompt
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <Slider
              value={[config.timeoutMinutes]}
              onValueChange={handleTimeoutChange}
              min={1}
              max={10}
              step={1}
              disabled={!config.enabled}
              className="flex-1"
            />
            <span className="min-w-[4rem] text-right font-medium">
              {config.timeoutMinutes} min
            </span>
          </div>
          
          <p className="text-xs text-muted-foreground">
            Recommended: 3-5 minutes. Too short may feel intrusive; too long may miss users who need help.
          </p>
        </div>

        {/* Save/Reset buttons */}
        {hasChanges && (
          <div className="flex gap-3 pt-2">
            <Button onClick={handleSave} disabled={saving}>
              <Save className="h-4 w-4 mr-2" />
              {saving ? "Saving..." : "Save Changes"}
            </Button>
            <Button variant="outline" onClick={handleReset} disabled={saving}>
              Reset
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default AssistedHelpSettings;
