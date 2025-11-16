import { useAccessibility } from '@/contexts/AccessibilityContext';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Eye, Zap, Minimize2 } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export const AccessibilityToggle = () => {
  const {
    superSeniorMode,
    toggleSuperSeniorMode,
    highContrastMode,
    toggleHighContrastMode,
    reducedMotion,
    toggleReducedMotion,
  } = useAccessibility();

  return (
    <div className="space-y-4">
      {/* Super Senior Mode */}
      <div className="space-y-2 p-3 bg-muted/30 rounded-lg border">
        <div className="flex items-center justify-between">
          <Label htmlFor="super-senior-mode" className="text-sm font-semibold cursor-pointer flex items-center gap-2">
            <Zap className="h-4 w-4 text-primary" />
            Super-Senior Mode
          </Label>
          <Switch
            id="super-senior-mode"
            checked={superSeniorMode}
            onCheckedChange={toggleSuperSeniorMode}
            className="data-[state=checked]:bg-primary"
          />
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Extra-large text, simplified layout, high contrast, and reduced animations.
        </p>
        {superSeniorMode && (
          <div className="mt-2 p-2 bg-primary/10 rounded border border-primary/20">
            <p className="text-xs font-medium text-primary">✓ Super-Senior Mode is active</p>
          </div>
        )}
      </div>

      {/* Individual Settings */}
      <div className="space-y-3">
        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Individual Settings
        </h4>

        {/* High Contrast */}
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <Label htmlFor="high-contrast" className="text-sm font-medium cursor-pointer">
              High Contrast Colors
            </Label>
            <p className="text-xs text-muted-foreground">
              Darker text and stronger borders
            </p>
          </div>
          <Switch
            id="high-contrast"
            checked={highContrastMode}
            onCheckedChange={toggleHighContrastMode}
            disabled={superSeniorMode}
          />
        </div>

        {/* Reduced Motion */}
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <Label htmlFor="reduced-motion" className="text-sm font-medium cursor-pointer flex items-center gap-2">
              <Minimize2 className="h-3 w-3" />
              Reduced Motion
            </Label>
            <p className="text-xs text-muted-foreground">
              Minimize animations
            </p>
          </div>
          <Switch
            id="reduced-motion"
            checked={reducedMotion}
            onCheckedChange={toggleReducedMotion}
            disabled={superSeniorMode}
          />
        </div>
      </div>

      {superSeniorMode && (
        <p className="text-xs text-muted-foreground italic p-2 bg-muted/50 rounded">
          Note: Individual settings are automatically enabled in Super-Senior Mode
        </p>
      )}
    </div>
  );
};
