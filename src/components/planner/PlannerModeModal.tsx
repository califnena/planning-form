import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Compass, LayoutGrid, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface PlannerModeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onContinue: (mode: 'guided' | 'free') => void;
}

export function PlannerModeModal({ open, onOpenChange, onContinue }: PlannerModeModalProps) {
  const [selectedMode, setSelectedMode] = useState<'guided' | 'free'>('guided');
  const [isLoading, setIsLoading] = useState(false);

  const handleContinue = async () => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Save preference to user_settings
        const { error } = await supabase
          .from('user_settings')
          .upsert({
            user_id: user.id,
            planner_mode: selectedMode,
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'user_id'
          });
        
        if (error) {
          console.error('Error saving planner mode:', error);
        }
      }
      onContinue(selectedMode);
    } catch (error) {
      console.error('Error:', error);
      onContinue(selectedMode);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl">How would you like to go through this?</DialogTitle>
          <DialogDescription>
            Choose your preferred planning experience. You can change this later in Settings.
          </DialogDescription>
        </DialogHeader>

        <RadioGroup
          value={selectedMode}
          onValueChange={(value) => setSelectedMode(value as 'guided' | 'free')}
          className="mt-4 space-y-3"
        >
          {/* Step-by-Step Guidance Option */}
          <div
            className={`relative flex items-start gap-4 rounded-lg border-2 p-4 cursor-pointer transition-colors ${
              selectedMode === 'guided'
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-primary/50'
            }`}
            onClick={() => setSelectedMode('guided')}
          >
            <RadioGroupItem value="guided" id="guided" className="mt-1" />
            <div className="flex-1">
              <Label htmlFor="guided" className="flex items-center gap-2 cursor-pointer">
                <Compass className="h-5 w-5 text-primary" />
                <span className="font-semibold">Step-by-Step Guidance</span>
                <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">Recommended</span>
              </Label>
              <p className="text-sm text-muted-foreground mt-1">
                We'll guide you through each section with explanations and prompts.
              </p>
            </div>
            {selectedMode === 'guided' && (
              <CheckCircle className="h-5 w-5 text-primary absolute top-4 right-4" />
            )}
          </div>

          {/* Explore on Your Own Option */}
          <div
            className={`relative flex items-start gap-4 rounded-lg border-2 p-4 cursor-pointer transition-colors ${
              selectedMode === 'free'
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-primary/50'
            }`}
            onClick={() => setSelectedMode('free')}
          >
            <RadioGroupItem value="free" id="free" className="mt-1" />
            <div className="flex-1">
              <Label htmlFor="free" className="flex items-center gap-2 cursor-pointer">
                <LayoutGrid className="h-5 w-5 text-primary" />
                <span className="font-semibold">Explore on Your Own</span>
              </Label>
              <p className="text-sm text-muted-foreground mt-1">
                Jump freely between sections at your own pace.
              </p>
            </div>
            {selectedMode === 'free' && (
              <CheckCircle className="h-5 w-5 text-primary absolute top-4 right-4" />
            )}
          </div>
        </RadioGroup>

        <div className="mt-6">
          <Button 
            onClick={handleContinue} 
            className="w-full" 
            disabled={isLoading}
          >
            {isLoading ? 'Saving...' : 'Continue'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
