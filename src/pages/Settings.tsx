import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { TextSizeToggle } from '@/components/TextSizeToggle';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ArrowLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

const Settings = () => {
  const [user, setUser] = useState<any>(null);
  const [visibleSections, setVisibleSections] = useState<string[]>([
    'pre-planning',
    'after-life-plan',
    'vendors',
    'forms',
    'vip-coach',
    'contact'
  ]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user);
      // TODO: Load visible_sections from user settings in database
    });
  }, []);

  const handleSectionToggle = (sectionId: string) => {
    setVisibleSections(prev => 
      prev.includes(sectionId)
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
    // TODO: Save to database
    toast({
      title: "Settings updated",
      description: "Your section preferences have been saved.",
    });
  };

  const sections = [
    { id: 'pre-planning', label: 'Pre-Planning' },
    { id: 'after-life-plan', label: 'After-Life Plan' },
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
              Back to Dashboard
            </Button>
          </Link>
          <TextSizeToggle />
        </div>
        
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-8">
          Settings
        </h1>

        <Tabs defaultValue="account" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="account" className="text-base">Account</TabsTrigger>
            <TabsTrigger value="subscription" className="text-base">Subscription</TabsTrigger>
            <TabsTrigger value="sections" className="text-base">Planning Sections</TabsTrigger>
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
