import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { ArrowRight, ArrowLeft, CheckCircle2, User, Heart, HelpCircle } from 'lucide-react';
import { useTextSize } from '@/contexts/TextSizeContext';

const US_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
];

const FOCUS_AREAS = [
  { id: 'pre-planning', label: 'Pre-planning', description: 'Plan ahead for your funeral and wishes' },
  { id: 'after-death', label: 'After-death steps', description: 'Guidance for handling affairs after a loss' },
  { id: 'documents', label: 'Documents', description: 'Organize important legal and financial papers' },
  { id: 'vendors', label: 'Vendors', description: 'Find funeral homes, lawyers, and other services' },
  { id: 'resources', label: 'Resources', description: 'Helpful guides and information' },
  { id: 'contact-help', label: 'Contact help', description: 'Get personal assistance when you need it' },
];

export default function StartWizard() {
  const navigate = useNavigate();
  const { textSize, setTextSize } = useTextSize();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Step 1: Path selection
  const [userPath, setUserPath] = useState<string>('');

  // Step 2: Focus areas
  const [focusAreas, setFocusAreas] = useState<string[]>([]);

  // Step 3: Personalization
  const [preferredName, setPreferredName] = useState('');
  const [preferredState, setPreferredState] = useState('');

  useEffect(() => {
    // Check if user has already completed wizard
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
        navigate('/app');
      }
    };

    checkWizardStatus();
  }, [navigate]);

  const handleFocusAreaToggle = (areaId: string) => {
    setFocusAreas(prev =>
      prev.includes(areaId)
        ? prev.filter(id => id !== areaId)
        : [...prev, areaId]
    );
  };

  const handleComplete = async () => {
    if (!preferredName.trim()) {
      toast.error('Please enter your name');
      return;
    }

    if (!preferredState) {
      toast.error('Please select your state');
      return;
    }

    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Update or create user settings
      const { error } = await supabase
        .from('user_settings')
        .upsert({
          user_id: user.id,
          wizard_completed: true,
          user_path: userPath,
          focus_areas: focusAreas,
          preferred_state: preferredState,
          preferred_name: preferredName,
        });

      if (error) throw error;

      toast.success('Setup complete! Welcome to Everlasting Funeral Advisors.');
      navigate('/app');
    } catch (error) {
      console.error('Error completing wizard:', error);
      toast.error('Failed to save preferences. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const canProceedStep1 = userPath !== '';
  const canProceedStep2 = focusAreas.length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Progress indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`h-2 rounded-full transition-all ${
                  s <= step ? 'bg-primary w-12' : 'bg-slate-300 w-8'
                }`}
              />
            ))}
          </div>
          <p className="text-center text-sm text-slate-600">
            Step {step} of 3
          </p>
        </div>

        {/* Step 1: Choose your path */}
        {step === 1 && (
          <Card className="p-6 md:p-8">
            <div className="text-center mb-6">
              <h1 className="text-3xl md:text-4xl font-bold text-slate-800 mb-2">
                Welcome! Let's Get Started
              </h1>
              <p className="text-base md:text-lg text-slate-600">
                First, tell us about your situation so we can personalize your experience.
              </p>
            </div>

            <div className="space-y-4">
              <Label className="text-lg font-semibold text-slate-800 block mb-3">
                I am here because:
              </Label>

              <RadioGroup value={userPath} onValueChange={setUserPath}>
                <Card
                  className={`p-4 cursor-pointer transition-all hover:shadow-md ${
                    userPath === 'planning_ahead' ? 'border-primary border-2 bg-primary/5' : ''
                  }`}
                  onClick={() => setUserPath('planning_ahead')}
                >
                  <div className="flex items-start gap-3">
                    <RadioGroupItem value="planning_ahead" id="planning_ahead" className="mt-1" />
                    <div className="flex-1">
                      <Label
                        htmlFor="planning_ahead"
                        className="text-base md:text-lg font-semibold text-slate-800 cursor-pointer flex items-center gap-2"
                      >
                        <User className="h-5 w-5 text-primary" />
                        I am planning ahead for myself
                      </Label>
                      <p className="text-sm text-slate-600 mt-1">
                        Organize your wishes, documents, and plans for the future
                      </p>
                    </div>
                  </div>
                </Card>

                <Card
                  className={`p-4 cursor-pointer transition-all hover:shadow-md ${
                    userPath === 'helping_other' ? 'border-primary border-2 bg-primary/5' : ''
                  }`}
                  onClick={() => setUserPath('helping_other')}
                >
                  <div className="flex items-start gap-3">
                    <RadioGroupItem value="helping_other" id="helping_other" className="mt-1" />
                    <div className="flex-1">
                      <Label
                        htmlFor="helping_other"
                        className="text-base md:text-lg font-semibold text-slate-800 cursor-pointer flex items-center gap-2"
                      >
                        <Heart className="h-5 w-5 text-primary" />
                        I am helping someone else plan
                      </Label>
                      <p className="text-sm text-slate-600 mt-1">
                        Assist a family member, friend, or client with their planning
                      </p>
                    </div>
                  </div>
                </Card>

                <Card
                  className={`p-4 cursor-pointer transition-all hover:shadow-md ${
                    userPath === 'someone_passed' ? 'border-primary border-2 bg-primary/5' : ''
                  }`}
                  onClick={() => setUserPath('someone_passed')}
                >
                  <div className="flex items-start gap-3">
                    <RadioGroupItem value="someone_passed" id="someone_passed" className="mt-1" />
                    <div className="flex-1">
                      <Label
                        htmlFor="someone_passed"
                        className="text-base md:text-lg font-semibold text-slate-800 cursor-pointer flex items-center gap-2"
                      >
                        <HelpCircle className="h-5 w-5 text-primary" />
                        Someone has passed away and I need guidance now
                      </Label>
                      <p className="text-sm text-slate-600 mt-1">
                        Get immediate help with next steps and after-death tasks
                      </p>
                    </div>
                  </div>
                </Card>
              </RadioGroup>
            </div>

            <div className="flex justify-end mt-8">
              <Button
                size="lg"
                onClick={() => setStep(2)}
                disabled={!canProceedStep1}
                className="min-w-[140px]"
              >
                Continue
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </Card>
        )}

        {/* Step 2: Focus areas */}
        {step === 2 && (
          <Card className="p-6 md:p-8">
            <div className="text-center mb-6">
              <h1 className="text-3xl md:text-4xl font-bold text-slate-800 mb-2">
                What would you like to focus on?
              </h1>
              <p className="text-base md:text-lg text-slate-600">
                Select all that apply. You can always change this later.
              </p>
            </div>

            <div className="space-y-3">
              {FOCUS_AREAS.map((area) => (
                <Card
                  key={area.id}
                  className={`p-4 cursor-pointer transition-all hover:shadow-md ${
                    focusAreas.includes(area.id) ? 'border-primary border-2 bg-primary/5' : ''
                  }`}
                  onClick={() => handleFocusAreaToggle(area.id)}
                >
                  <div className="flex items-start gap-3">
                    <Checkbox
                      id={area.id}
                      checked={focusAreas.includes(area.id)}
                      onCheckedChange={() => handleFocusAreaToggle(area.id)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <Label
                        htmlFor={area.id}
                        className="text-base md:text-lg font-semibold text-slate-800 cursor-pointer"
                      >
                        {area.label}
                      </Label>
                      <p className="text-sm text-slate-600 mt-1">{area.description}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            <div className="flex justify-between mt-8">
              <Button
                variant="outline"
                size="lg"
                onClick={() => setStep(1)}
              >
                <ArrowLeft className="mr-2 h-5 w-5" />
                Back
              </Button>
              <Button
                size="lg"
                onClick={() => setStep(3)}
                disabled={!canProceedStep2}
                className="min-w-[140px]"
              >
                Continue
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </Card>
        )}

        {/* Step 3: Personalization */}
        {step === 3 && (
          <Card className="p-6 md:p-8">
            <div className="text-center mb-6">
              <h1 className="text-3xl md:text-4xl font-bold text-slate-800 mb-2">
                Let's personalize your experience
              </h1>
              <p className="text-base md:text-lg text-slate-600">
                Just a few more details to get you started.
              </p>
            </div>

            <div className="space-y-6">
              <div>
                <Label htmlFor="name" className="text-base font-semibold">
                  What should we call you? *
                </Label>
                <Input
                  id="name"
                  value={preferredName}
                  onChange={(e) => setPreferredName(e.target.value)}
                  placeholder="Enter your first name"
                  className="mt-2 text-base"
                />
              </div>

              <div>
                <Label htmlFor="state" className="text-base font-semibold">
                  What state do you live in? *
                </Label>
                <p className="text-sm text-slate-600 mb-2">
                  This helps us provide state-specific guidance and resources.
                </p>
                <Select value={preferredState} onValueChange={setPreferredState}>
                  <SelectTrigger id="state" className="mt-1">
                    <SelectValue placeholder="Select your state" />
                  </SelectTrigger>
                  <SelectContent>
                    {US_STATES.map((state) => (
                      <SelectItem key={state} value={state}>
                        {state}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-base font-semibold block mb-2">
                  Preferred text size
                </Label>
                <p className="text-sm text-slate-600 mb-3">
                  Choose the reading size that's most comfortable for you.
                </p>
                <div className="flex gap-3">
                  <Button
                    variant={textSize === 'small' ? 'default' : 'outline'}
                    onClick={() => setTextSize('small')}
                    className="flex-1"
                  >
                    A-
                  </Button>
                  <Button
                    variant={textSize === 'medium' ? 'default' : 'outline'}
                    onClick={() => setTextSize('medium')}
                    className="flex-1"
                  >
                    A
                  </Button>
                  <Button
                    variant={textSize === 'large' ? 'default' : 'outline'}
                    onClick={() => setTextSize('large')}
                    className="flex-1"
                  >
                    A+
                  </Button>
                </div>
              </div>

              <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-slate-700">
                    <p className="font-semibold mb-1">Your information is saved securely</p>
                    <p>
                      You're already logged in, so your preferences and planning information will be saved automatically. You can continue anytime.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-between mt-8">
              <Button
                variant="outline"
                size="lg"
                onClick={() => setStep(2)}
              >
                <ArrowLeft className="mr-2 h-5 w-5" />
                Back
              </Button>
              <Button
                size="lg"
                onClick={handleComplete}
                disabled={loading || !preferredName.trim() || !preferredState}
                className="min-w-[140px]"
              >
                {loading ? 'Setting up...' : 'Complete Setup'}
                <CheckCircle2 className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </Card>
        )}

        {/* Skip option */}
        <div className="text-center mt-6">
          <Button
            variant="ghost"
            onClick={() => navigate('/app')}
            className="text-slate-600"
          >
            Skip for now
          </Button>
        </div>
      </div>
    </div>
  );
}
