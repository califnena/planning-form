import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { TextSizeToggle } from '@/components/TextSizeToggle';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';

const Index = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDocType, setSelectedDocType] = useState<string>('pre-planning');
  const [generateDialogOpen, setGenerateDialogOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Test mode bypass: append ?test=1 once to enable preview without auth
    const params = new URLSearchParams(window.location.search);
    if (params.get('test') === '1') {
      localStorage.setItem('test-mode', '1');
    }
    if (params.get('test') === '0') {
      localStorage.removeItem('test-mode');
    }
    const isTestMode = localStorage.getItem('test-mode') === '1';

    if (isTestMode) {
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate('/login');
      } else {
        setUser(session.user);
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        navigate('/login');
      } else {
        setUser(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleGenerateDocument = () => {
    toast({
      title: "Coming soon",
      description: `${selectedDocType === 'pre-planning' ? 'Pre-Planning Summary' : 'After-Life Plan Checklist'} PDF generation will be available soon.`,
    });
    setGenerateDialogOpen(false);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-xl text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  const firstName = user?.user_metadata?.full_name?.split(' ')[0] || '';

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-4 py-8 md:py-12">
        {/* Header with text size control */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-3">
              {firstName ? `Welcome back, ${firstName}` : 'Welcome to Everlasting Funeral Advisors'}
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground">
              Choose what you want to work on today.
            </p>
          </div>
          <TextSizeToggle />
        </div>

        {/* Primary Actions - Row 1 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mb-10">
          <ActionCard
            emoji="📋"
            title="Pre-Planning"
            description="Start or continue filling out your pre-planning guide."
            to="/app"
          />
          <ActionCard
            emoji="🕊️"
            title="After-Life Plan"
            description="Review key steps your family will need after a loss."
            to="/after-life-plan"
          />
          <ActionCard
            emoji="🏢"
            title="Vendors"
            description="See helpful funeral homes, cemeteries, and service providers."
            to="/vendors"
          />
          <ActionCard
            emoji="📄"
            title="Blank / Fillable Forms"
            description="Download or fill in standalone forms and checklists."
            to="/forms"
          />
          <ActionCard
            emoji="🤝"
            title="VIP Coach Assistant"
            description="Work with a coach or request guidance."
            to="/vip-coach"
          />
          <ActionCard
            emoji="☎️"
            title="Request a Quote / Contact Us"
            description="Ask for help, pricing, or a custom plan."
            to="/contact"
          />
        </div>

        {/* Secondary Actions - Row 2 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          <Dialog open={generateDialogOpen} onOpenChange={setGenerateDialogOpen}>
            <DialogTrigger asChild>
              <Card className="rounded-xl border bg-card shadow-sm hover:shadow-lg transition-all cursor-pointer p-6 md:p-8 hover:border-primary/20">
                <div className="flex items-start gap-4 md:gap-6">
                  <div className="text-4xl md:text-5xl flex-shrink-0">🧾</div>
                  <div className="flex-1">
                    <h3 className="text-xl md:text-2xl font-semibold text-card-foreground mb-2">
                      Generate My Document
                    </h3>
                    <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
                      Create a PDF from your information.
                    </p>
                  </div>
                </div>
              </Card>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle className="text-2xl md:text-3xl mb-2">What would you like to generate?</DialogTitle>
              </DialogHeader>
              <RadioGroup value={selectedDocType} onValueChange={setSelectedDocType} className="gap-4 py-6">
                <div className="flex items-start space-x-4 p-5 border-2 rounded-lg hover:bg-accent/50 hover:border-primary/30 cursor-pointer transition-all">
                  <RadioGroupItem value="pre-planning" id="pre-planning" className="mt-1.5 h-5 w-5" />
                  <Label htmlFor="pre-planning" className="flex-1 cursor-pointer">
                    <div className="font-semibold text-lg md:text-xl mb-1.5">Pre-Planning Summary PDF</div>
                    <div className="text-base text-muted-foreground leading-relaxed">A complete summary of your pre-planning information</div>
                  </Label>
                </div>
                <div className="flex items-start space-x-4 p-5 border-2 rounded-lg hover:bg-accent/50 hover:border-primary/30 cursor-pointer transition-all">
                  <RadioGroupItem value="after-life" id="after-life" className="mt-1.5 h-5 w-5" />
                  <Label htmlFor="after-life" className="flex-1 cursor-pointer">
                    <div className="font-semibold text-lg md:text-xl mb-1.5">After-Life Plan Checklist PDF</div>
                    <div className="text-base text-muted-foreground leading-relaxed">A checklist for your family to follow</div>
                  </Label>
                </div>
              </RadioGroup>
              <Button size="lg" onClick={handleGenerateDocument} className="w-full text-lg py-6">
                Generate Document
              </Button>
            </DialogContent>
          </Dialog>

          <ActionCard
            emoji="⚙️"
            title="Settings"
            description="Account, subscription, and which sections you see."
            to="/settings"
          />
          <ActionCard
            emoji="📚"
            title="Helpful Resources"
            description="Short guides and links to help you understand your options."
            to="/resources"
          />
          <ActionCard
            emoji="❓"
            title="Common Questions"
            description="Answers to the questions families ask most often."
            to="/faq"
          />
        </div>
      </div>
    </div>
  );
};

const ActionCard = ({ emoji, title, description, to }: { emoji: string; title: string; description: string; to: string }) => {
  return (
    <Link to={to}>
      <Card className="rounded-xl border bg-card shadow-sm hover:shadow-lg transition-all cursor-pointer p-6 md:p-8 h-full hover:border-primary/20">
        <div className="flex items-start gap-4 md:gap-6">
          <div className="text-4xl md:text-5xl flex-shrink-0">{emoji}</div>
          <div className="flex-1">
            <h3 className="text-xl md:text-2xl font-semibold text-card-foreground mb-2">
              {title}
            </h3>
            <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
              {description}
            </p>
          </div>
        </div>
      </Card>
    </Link>
  );
};

export default Index;
