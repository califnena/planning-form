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
    <Card className="border-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Eye className="h-5 w-5" />
          Accessibility Settings
        </CardTitle>
        <CardDescription>
          Customize the app to make it easier to read and use
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Super Senior Mode */}
        <div className="space-y-3 p-4 bg-muted/30 rounded-lg border border-border">
          <div className="flex items-center justify-between">
            <Label htmlFor="super-senior-mode" className="text-base font-semibold cursor-pointer flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              Super-Senior Mode
            </Label>
            <Switch
              id="super-senior-mode"
              checked={superSeniorMode}
              onCheckedChange={toggleSuperSeniorMode}
              className="data-[state=checked]:bg-primary"
            />
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            <strong>All-in-one accessibility mode:</strong> Extra-large text (20px+), simplified
            layout with only essential buttons, high contrast colors, and reduced animations. Perfect
            for users with visual or cognitive challenges.
          </p>
          {superSeniorMode && (
            <div className="mt-2 p-2 bg-primary/10 rounded border border-primary/20">
              <p className="text-sm font-medium text-primary">✓ Super-Senior Mode is active</p>
            </div>
          )}
        </div>

        {/* Individual Settings */}
        <div className="space-y-4">
          <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Individual Settings
          </h4>

          {/* High Contrast */}
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <Label htmlFor="high-contrast" className="text-base font-medium cursor-pointer">
                High Contrast Colors
              </Label>
              <p className="text-sm text-muted-foreground">
                Darker text and stronger borders for better readability
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
              <Label htmlFor="reduced-motion" className="text-base font-medium cursor-pointer flex items-center gap-2">
                <Minimize2 className="h-4 w-4" />
                Reduced Motion
              </Label>
              <p className="text-sm text-muted-foreground">
                Minimize animations and transitions
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
          <div className="p-3 bg-muted/50 rounded-lg text-sm text-muted-foreground italic">
            Note: Individual settings are automatically enabled in Super-Senior Mode
          </div>
        )}
      </CardContent>
    </Card>
  );
};
