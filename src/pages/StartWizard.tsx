import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { ArrowRight, ArrowLeft, User, Heart, HelpCircle, Church, FileText, ClipboardList, CheckCircle2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';

export default function StartWizard() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [planningFor, setPlanningFor] = useState<string>('');
  const [focusChoice, setFocusChoice] = useState<string>('');

  useEffect(() => {
    const checkWizardStatus = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/login');
        return;
      }

      const { data: settings } = await supabase
        .from('user_settings')
        .select('wizard_completed')
        .eq('user_id', user.id)
        .single();

      if (settings?.wizard_completed) {
        navigate('/preplansteps');
      }
    };

    checkWizardStatus();
  }, [navigate]);

  const handleComplete = async () => {
    if (!planningFor || !focusChoice) {
      toast.error('Please complete all steps');
      return;
    }

    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      let selectedSections: string[] = [];
      
      switch (focusChoice) {
        case 'funeral':
          selectedSections = ['overview', 'funeral', 'providers', 'legacy', 'messages', 'contacts'];
          break;
        case 'documents':
          selectedSections = ['overview', 'legal', 'financial', 'insurance', 'property', 'digital'];
          break;
        case 'afterDeath':
          selectedSections = ['overview', 'instructions', 'contacts', 'financial', 'legal'];
          break;
        case 'everything':
          selectedSections = ['overview', 'instructions', 'personal', 'legacy', 'funeral', 'providers', 'contacts', 'financial', 'insurance', 'property', 'pets', 'digital', 'legal', 'messages'];
          break;
        default:
          selectedSections = ['overview', 'funeral', 'personal', 'legacy', 'contacts', 'financial'];
      }

      const { error } = await supabase
        .from('user_settings')
        .upsert({
          user_id: user.id,
          wizard_completed: true,
          user_path: planningFor,
          selected_sections: selectedSections,
        });

      if (error) throw error;

      toast.success('Setup complete! Welcome to your planner.');
      navigate('/preplansteps');
    } catch (error) {
      console.error('Error completing wizard:', error);
      toast.error('Failed to save. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            {[1, 2].map((s) => (
              <div
                key={s}
                className={cn(
                  "h-2 rounded-full transition-all",
                  s <= step ? 'bg-primary w-16' : 'bg-muted-foreground/30 w-12'
                )}
              />
            ))}
          </div>
          <p className="text-center text-sm text-muted-foreground">
            {t('startWizard.step', { current: step, total: 2 })}
          </p>
        </div>

        {step === 1 && (
          <Card className="p-6 md:p-8 border-2">
            <div className="text-center mb-6">
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                {t('startWizard.step1.title')}
              </h1>
              <p className="text-base md:text-lg text-muted-foreground">
                {t('startWizard.step1.subtitle')}
              </p>
            </div>

            <RadioGroup value={planningFor} onValueChange={setPlanningFor} className="space-y-4">
              <Card
                className={cn(
                  "p-4 cursor-pointer transition-all hover:shadow-md border-2",
                  planningFor === 'myself' ? 'border-primary bg-primary/5' : 'border-border'
                )}
                onClick={() => setPlanningFor('myself')}
              >
                <div className="flex items-start gap-3">
                  <RadioGroupItem value="myself" id="myself" className="mt-1" />
                  <div className="flex-1">
                    <Label htmlFor="myself" className="text-lg font-semibold text-foreground cursor-pointer flex items-center gap-2">
                      <User className="h-5 w-5 text-primary" />
                      {t('startWizard.step1.myself')}
                    </Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      {t('startWizard.step1.myselfDesc')}
                    </p>
                  </div>
                </div>
              </Card>

              <Card
                className={cn(
                  "p-4 cursor-pointer transition-all hover:shadow-md border-2",
                  planningFor === 'other' ? 'border-primary bg-primary/5' : 'border-border'
                )}
                onClick={() => setPlanningFor('other')}
              >
                <div className="flex items-start gap-3">
                  <RadioGroupItem value="other" id="other" className="mt-1" />
                  <div className="flex-1">
                    <Label htmlFor="other" className="text-lg font-semibold text-foreground cursor-pointer flex items-center gap-2">
                      <Heart className="h-5 w-5 text-primary" />
                      {t('startWizard.step1.other')}
                    </Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      {t('startWizard.step1.otherDesc')}
                    </p>
                  </div>
                </div>
              </Card>

              <Card
                className={cn(
                  "p-4 cursor-pointer transition-all hover:shadow-md border-2",
                  planningFor === 'exploring' ? 'border-primary bg-primary/5' : 'border-border'
                )}
                onClick={() => setPlanningFor('exploring')}
              >
                <div className="flex items-start gap-3">
                  <RadioGroupItem value="exploring" id="exploring" className="mt-1" />
                  <div className="flex-1">
                    <Label htmlFor="exploring" className="text-lg font-semibold text-foreground cursor-pointer flex items-center gap-2">
                      <HelpCircle className="h-5 w-5 text-primary" />
                      {t('startWizard.step1.exploring')}
                    </Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      {t('startWizard.step1.exploringDesc')}
                    </p>
                  </div>
                </div>
              </Card>
            </RadioGroup>

            <div className="flex justify-end mt-6">
              <Button
                size="lg"
                onClick={() => setStep(2)}
                disabled={!planningFor}
              >
                {t('startWizard.next')}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </Card>
        )}

        {step === 2 && (
          <Card className="p-6 md:p-8 border-2">
            <div className="text-center mb-6">
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                {t('startWizard.step2.title')}
              </h1>
              <p className="text-base md:text-lg text-muted-foreground">
                {t('startWizard.step2.subtitle')}
              </p>
            </div>

            <RadioGroup value={focusChoice} onValueChange={setFocusChoice} className="space-y-4">
              <Card
                className={cn(
                  "p-4 cursor-pointer transition-all hover:shadow-md border-2",
                  focusChoice === 'funeral' ? 'border-primary bg-primary/5' : 'border-border'
                )}
                onClick={() => setFocusChoice('funeral')}
              >
                <div className="flex items-start gap-3">
                  <RadioGroupItem value="funeral" id="funeral" className="mt-1" />
                  <div className="flex-1">
                    <Label htmlFor="funeral" className="text-lg font-semibold text-foreground cursor-pointer flex items-center gap-2">
                      <Church className="h-5 w-5 text-primary" />
                      {t('startWizard.step2.funeral')}
                    </Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      {t('startWizard.step2.funeralDesc')}
                    </p>
                  </div>
                </div>
              </Card>

              <Card
                className={cn(
                  "p-4 cursor-pointer transition-all hover:shadow-md border-2",
                  focusChoice === 'documents' ? 'border-primary bg-primary/5' : 'border-border'
                )}
                onClick={() => setFocusChoice('documents')}
              >
                <div className="flex items-start gap-3">
                  <RadioGroupItem value="documents" id="documents" className="mt-1" />
                  <div className="flex-1">
                    <Label htmlFor="documents" className="text-lg font-semibold text-foreground cursor-pointer flex items-center gap-2">
                      <FileText className="h-5 w-5 text-primary" />
                      {t('startWizard.step2.documents')}
                    </Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      {t('startWizard.step2.documentsDesc')}
                    </p>
                  </div>
                </div>
              </Card>

              <Card
                className={cn(
                  "p-4 cursor-pointer transition-all hover:shadow-md border-2",
                  focusChoice === 'afterDeath' ? 'border-primary bg-primary/5' : 'border-border'
                )}
                onClick={() => setFocusChoice('afterDeath')}
              >
                <div className="flex items-start gap-3">
                  <RadioGroupItem value="afterDeath" id="afterDeath" className="mt-1" />
                  <div className="flex-1">
                    <Label htmlFor="afterDeath" className="text-lg font-semibold text-foreground cursor-pointer flex items-center gap-2">
                      <ClipboardList className="h-5 w-5 text-primary" />
                      {t('startWizard.step2.afterDeath')}
                    </Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      {t('startWizard.step2.afterDeathDesc')}
                    </p>
                  </div>
                </div>
              </Card>

              <Card
                className={cn(
                  "p-4 cursor-pointer transition-all hover:shadow-md border-2",
                  focusChoice === 'everything' ? 'border-primary bg-primary/5' : 'border-border'
                )}
                onClick={() => setFocusChoice('everything')}
              >
                <div className="flex items-start gap-3">
                  <RadioGroupItem value="everything" id="everything" className="mt-1" />
                  <div className="flex-1">
                    <Label htmlFor="everything" className="text-lg font-semibold text-foreground cursor-pointer flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-primary" />
                      {t('startWizard.step2.everything')}
                    </Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      {t('startWizard.step2.everythingDesc')}
                    </p>
                  </div>
                </div>
              </Card>
            </RadioGroup>

            <div className="flex justify-between mt-6">
              <Button variant="outline" size="lg" onClick={() => setStep(1)}>
                <ArrowLeft className="mr-2 h-5 w-5" />
                {t('startWizard.back')}
              </Button>
              <Button
                size="lg"
                onClick={handleComplete}
                disabled={!focusChoice || loading}
              >
                {loading ? t('common.loading') : t('startWizard.finish')}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
