import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { TextSizeToggle } from '@/components/TextSizeToggle';
import { ArrowLeft, CheckCircle2, FileText, Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const AfterLifePlan = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [existingCases, setExistingCases] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const loadData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/login');
        return;
      }
      setUser(user);

      // Load existing cases
      const { data: cases } = await supabase
        .from('cases')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (cases) {
        setExistingCases(cases);
      }
    };
    
    loadData();
  }, [navigate]);

  const handleCreateNewCase = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data: newCase, error } = await supabase
        .from('cases')
        .insert({ user_id: user.id })
        .select()
        .single();

      if (error) throw error;

      toast.success('After-Life Plan created successfully');
      navigate(`/next-steps/case/${newCase.id}`);
    } catch (error) {
      console.error('Error creating case:', error);
      toast.error('Failed to create After-Life Plan. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-4 py-8 md:py-12">
        <div className="flex justify-between items-start mb-8">
          <Link to="/">
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>
          <TextSizeToggle />
        </div>
        
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
          After-Life Action Plan
        </h1>
        <p className="text-lg text-muted-foreground mb-8">
          A comprehensive checklist to guide your loved ones through the necessary steps after a loss. 
          Each plan walks you through immediate needs, official notifications, funeral arrangements, 
          financial matters, and long-term tasks.
        </p>
        
        {/* Create New Case Button */}
        <Card className="p-6 md:p-8 mb-8 border-2 border-primary/20 bg-primary/5">
          <div className="flex items-start gap-4">
            <div className="bg-primary/10 p-3 rounded-lg">
              <Plus className="h-8 w-8 text-primary" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl md:text-2xl font-semibold text-foreground mb-2">
                Start a New After-Life Plan
              </h2>
              <p className="text-base text-muted-foreground mb-4">
                Create a new comprehensive checklist to help organize and track all the tasks 
                that need to be completed after a loved one passes away. This includes immediate 
                actions, notifications, funeral planning, financial matters, and estate settlement.
              </p>
              <Button 
                onClick={handleCreateNewCase} 
                disabled={loading}
                size="lg"
              >
                {loading ? 'Creating...' : 'Create New Plan'}
              </Button>
            </div>
          </div>
        </Card>

        {/* Existing Cases */}
        {existingCases.length > 0 && (
          <div>
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              Your Existing Plans ({existingCases.length})
            </h2>
            <div className="grid gap-4">
              {existingCases.map((caseItem) => (
                <Card 
                  key={caseItem.id}
                  className="p-5 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => navigate(`/next-steps/case/${caseItem.id}`)}
                >
                  <div className="flex items-start gap-4">
                    <div className="bg-muted p-2 rounded-lg">
                      <FileText className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-semibold text-foreground">
                          Case #{caseItem.id.slice(0, 8)}
                        </h3>
                        <span className={`text-sm px-2 py-1 rounded-full ${
                          caseItem.case_status === 'open' 
                            ? 'bg-blue-100 text-blue-700' 
                            : 'bg-green-100 text-green-700'
                        }`}>
                          {caseItem.case_status}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Created {new Date(caseItem.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Info Section */}
        <Card className="mt-8 p-6 bg-muted/30">
          <h3 className="text-lg font-semibold text-foreground mb-3">
            What's included in an After-Life Plan?
          </h3>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>✓ Immediate needs (first 24-72 hours)</p>
            <p>✓ Official notifications (Social Security, banks, insurance)</p>
            <p>✓ Death certificate requests and distribution</p>
            <p>✓ Obituary writing and publication</p>
            <p>✓ Funeral and service planning</p>
            <p>✓ Financial account management</p>
            <p>✓ Digital account access and closure</p>
            <p>✓ Property and utilities management</p>
            <p>✓ Subscription cancellations</p>
            <p>✓ Estate settlement and legal filings</p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AfterLifePlan;
