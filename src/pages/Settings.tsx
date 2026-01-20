import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { TextSizeToggle } from '@/components/TextSizeToggle';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Globe, Volume2, Mic, ChevronRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { ShareLinksManager } from '@/components/sharing/ShareLinksManager';
import { LanguageSelector } from '@/components/LanguageSelector';
import { useTextSize, TextSizePreset } from '@/contexts/TextSizeContext';
import { useAccessibility } from '@/contexts/AccessibilityContext';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';

// Text size preset selector component
const TextSizePresetSelector = () => {
  const { preset, setPreset } = useTextSize();
  
  const presets: { value: TextSizePreset; label: string; description: string }[] = [
    { value: 'compact', label: 'Compact', description: 'Smaller text, tighter spacing' },
    { value: 'standard', label: 'Standard', description: 'Default size and spacing' },
    { value: 'senior', label: 'Senior', description: 'Larger text, more spacing' },
    { value: 'easy-view', label: 'Easy View', description: 'Largest text, maximum readability' },
  ];

  return (
    <RadioGroup value={preset} onValueChange={(value) => setPreset(value as TextSizePreset)}>
      <div className="grid gap-3">
        {presets.map((p) => (
          <div key={p.value} className="flex items-center space-x-3">
            <RadioGroupItem value={p.value} id={p.value} />
            <div className="flex-1">
              <Label htmlFor={p.value} className="text-base font-medium cursor-pointer">
                {p.label}
              </Label>
              <p className="text-sm text-muted-foreground">{p.description}</p>
            </div>
          </div>
        ))}
      </div>
    </RadioGroup>
  );
};

// Voice-Friendly Mode Toggle Component
const VoiceFriendlyToggle = () => {
  const { voiceFriendlyMode, toggleVoiceFriendlyMode } = useAccessibility();
  
  return (
    <Switch
      checked={voiceFriendlyMode}
      onCheckedChange={toggleVoiceFriendlyMode}
      className="data-[state=checked]:bg-primary"
    />
  );
};

const Settings = () => {
  const [user, setUser] = useState<any>(null);
  const [ownerName, setOwnerName] = useState<string>("");
  const [visibleSections, setVisibleSections] = useState<string[]>([
    'pre-planning',
    'after-life-plan',
    'vendors',
    'forms',
    'vip-coach',
    'contact'
  ]);

  useEffect(() => {
    const loadUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user);
      
      if (session?.user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("id", session.user.id)
          .maybeSingle();
        
        if (profile?.full_name) {
          setOwnerName(profile.full_name);
        }
      }
    };
    loadUser();
  }, []);

  const handleSectionToggle = (sectionId: string) => {
    setVisibleSections(prev => 
      prev.includes(sectionId)
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
    toast({
      title: "Settings updated",
      description: "Your section preferences have been saved.",
    });
  };

  const sections = [
    { id: 'pre-planning', label: 'Pre-Planning' },
    { id: 'after-death-planner', label: 'After-Death Planner' },
    { id: 'vendors', label: 'Vendors' },
    { id: 'forms', label: 'Blank / Fillable Forms' },
    { id: 'vip-coach', label: 'VIP Coach Assistant' },
    { id: 'contact', label: 'Request a Quote / Contact Us' }
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-8 md:py-12">
        <div className="flex justify-between items-start mb-8">
          <Link to="/">
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Planning Menu
            </Button>
          </Link>
          <TextSizeToggle />
        </div>
        
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-8">
          Settings
        </h1>

        <Tabs defaultValue="account" className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-8">
            <TabsTrigger value="account" className="text-sm">Account</TabsTrigger>
            <TabsTrigger value="subscription" className="text-sm">Subscription</TabsTrigger>
            <TabsTrigger value="sharing" className="text-sm">Sharing</TabsTrigger>
            <TabsTrigger value="accessibility" className="text-sm">Accessibility</TabsTrigger>
            <TabsTrigger value="sections" className="text-sm">Sections</TabsTrigger>
          </TabsList>

          <TabsContent value="account" className="space-y-4">
            <div className="bg-card border rounded-lg p-6 space-y-4">
              <div>
                <Label className="text-base font-semibold">Email</Label>
                <p className="mt-2 text-base text-muted-foreground">{user?.email || 'Loading...'}</p>
              </div>
              <div>
                <Label className="text-base font-semibold">Full Name</Label>
                <p className="mt-2 text-base text-muted-foreground">
                  {user?.user_metadata?.full_name || 'Not set'}
                </p>
              </div>
            </div>

            {/* Legal Section */}
            <div className="bg-card border rounded-lg p-6">
              <Label className="text-lg font-semibold mb-4 block">Legal</Label>
              <div className="space-y-2">
                <Link 
                  to="/privacy" 
                  className="flex items-center justify-between min-h-[52px] px-4 py-3 rounded-lg border bg-background hover:bg-muted/50 transition-colors"
                >
                  <span className="text-lg text-foreground">Privacy Policy</span>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </Link>
                <Link 
                  to="/terms" 
                  className="flex items-center justify-between min-h-[52px] px-4 py-3 rounded-lg border bg-background hover:bg-muted/50 transition-colors"
                >
                  <span className="text-lg text-foreground">Terms of Service</span>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </Link>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="subscription" className="space-y-4">
            <div className="bg-card border rounded-lg p-6 space-y-4">
              <div>
                <Label className="text-base font-semibold">Current Plan</Label>
                <p className="mt-2 text-base text-muted-foreground">Free Plan</p>
              </div>
              <div>
                <Label className="text-base font-semibold">Billing Details</Label>
                <p className="mt-2 text-base text-muted-foreground">Coming soon</p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="sharing" className="space-y-4">
            <div className="bg-card border rounded-lg p-6">
              {user ? (
                <ShareLinksManager userId={user.id} ownerName={ownerName} />
              ) : (
                <p className="text-muted-foreground">Loading...</p>
              )}
            </div>
          </TabsContent>

          <TabsContent value="accessibility" className="space-y-4">
            <div className="bg-card border rounded-lg p-6 space-y-6">
              {/* Voice-Friendly Mode - PROMINENT */}
              <div className="border-2 border-primary/20 rounded-lg p-4 bg-primary/5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Volume2 className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <Label className="text-base font-semibold cursor-pointer">
                        Voice-friendly mode
                      </Label>
                      <p className="text-sm text-muted-foreground mt-1">
                        Read instructions aloud and speak instead of typing. 
                        Reduces eye strain and makes planning easier.
                      </p>
                    </div>
                  </div>
                  <VoiceFriendlyToggle />
                </div>
              </div>

              {/* Language Section */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Globe className="h-5 w-5 text-muted-foreground" />
                  <Label className="text-base font-semibold">Language</Label>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Choose your preferred language. Applies across the app.
                </p>
                <LanguageSelector />
              </div>

              <div className="border-t pt-6">
                <Label className="text-base font-semibold">Text Size Preset</Label>
                <p className="text-sm text-muted-foreground mb-4">
                  Choose a text size preset for better readability across the application.
                </p>
                <TextSizePresetSelector />
              </div>
              
              <div className="border-t pt-6">
                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="high-contrast"
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <Label htmlFor="high-contrast" className="text-base font-semibold cursor-pointer">
                      High Contrast Mode
                    </Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      Increase contrast between text and background for improved visibility.
                    </p>
                  </div>
                </div>
              </div>

              <div className="border-t pt-6">
                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="reduced-motion"
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <Label htmlFor="reduced-motion" className="text-base font-semibold cursor-pointer">
                      Reduced Motion
                    </Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      Minimize animations and transitions throughout the application.
                    </p>
                  </div>
                </div>
              </div>

            </div>
          </TabsContent>

          <TabsContent value="sections" className="space-y-4">
            <div className="bg-card border rounded-lg p-6 space-y-4">
              <p className="text-base text-muted-foreground mb-4">
                You can turn sections on or off anytime. 'Helpful Resources' and 'Common Questions' are always available.
              </p>
              
              {sections.map(section => (
                <div key={section.id} className="flex items-center space-x-3 py-2">
                  <Checkbox
                    id={section.id}
                    checked={visibleSections.includes(section.id)}
                    onCheckedChange={() => handleSectionToggle(section.id)}
                  />
                  <Label htmlFor={section.id} className="text-base cursor-pointer flex-1">
                    {section.label}
                  </Label>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Settings;
