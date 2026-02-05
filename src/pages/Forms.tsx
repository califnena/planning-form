import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { TextSizeToggle } from '@/components/TextSizeToggle';
import { ArrowLeft, Download, FileText, BookOpen, Loader2, ShoppingCart } from 'lucide-react';
import { toast } from 'sonner';
import { usePrintableAccess } from '@/hooks/usePrintableAccess';

const Forms = () => {
  const navigate = useNavigate();
  const { hasAccess, isAdmin, isLoggedIn, isLoading } = usePrintableAccess();

  // Admin-only access verification (non-visible, testing only)
  useEffect(() => {
    if (isLoading) return;
    
    if (isAdmin) {
      console.info('[EFA Admin Access Check]', {
        page: '/forms',
        assetAccess: 'printable-planning-form',
        adminBypass: true,
        timestamp: new Date().toISOString(),
        status: 'GRANTED - Admin override active'
      });
    }
  }, [isAdmin, isLoading]);

  const handleDownloadPrePlanningForm = () => {
    try {
      const link = document.createElement('a');
      link.href = '/templates/My-Final-Wishes-Blank-Form-2025-11-17.pdf';
      link.download = 'My-Final-Wishes-Blank-Form-2025-11-17.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('Blank Pre-Planning Form downloaded successfully');
    } catch (error) {
      console.error('Error downloading pre-planning form:', error);
      toast.error('Failed to download form. Please try again.');
    }
  };

  const handlePurchase = () => {
    navigate('/printable-form');
  };

  // Show loading state while checking access
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Checking access...</p>
        </div>
      </div>
    );
  }

  // User has access (admin or purchased) - show download page
  if (hasAccess) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
        {/* Admin Debug Banner */}
        {isAdmin && (
          <div className="bg-amber-100 border-b border-amber-300 px-4 py-2 flex items-center justify-center gap-2 text-amber-800 text-sm">
            <span className="font-medium">🛡️ Admin detected: paywalls bypassed.</span>
          </div>
        )}
        <div className="max-w-2xl mx-auto px-4 py-12 md:py-20">
          <div className="flex justify-between items-start mb-8">
            <Link to="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
              </Button>
            </Link>
            <TextSizeToggle />
          </div>
          
          <div className="text-center space-y-8">
            <div className="space-y-4">
              <div className="bg-primary/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto">
                <FileText className="h-10 w-10 text-primary" />
              </div>
              <h1 className="text-3xl md:text-4xl font-serif font-bold text-foreground">
              Your printable form is ready.
              </h1>
            </div>

            {/* Intro sentence */}
            <p className="text-lg text-muted-foreground">
              Click below to download and print as many copies as you need.
            </p>

            {/* Main Download Button */}
            <div className="space-y-2">
              <Button 
                onClick={handleDownloadPrePlanningForm} 
                size="lg"
                className="min-h-[60px] text-lg px-10"
              >
                <Download className="mr-3 h-6 w-6" />
                Download Blank Printable Form
              </Button>
              <p className="text-sm text-muted-foreground">
                You can return to this page anytime to download again.
              </p>
              {isAdmin && (
                <p className="text-sm text-muted-foreground italic mt-1">
                  Admin access: You can download this form without purchase.
                </p>
              )}
            </div>

            {/* Explanation */}
            <Card className="bg-muted/30 border-none text-left p-6 md:p-8">
              <ul className="space-y-4 text-lg text-muted-foreground">
                <li className="flex items-start gap-3">
                  <FileText className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                  <span>Blank form (nothing is pre-filled)</span>
                </li>
                <li className="flex items-start gap-3">
                  <FileText className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                  <span>Print as many copies as you want</span>
                </li>
                <li className="flex items-start gap-3">
                  <FileText className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                  <span>No app or computer required</span>
                </li>
                <li className="flex items-start gap-3">
                  <FileText className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                  <span>Keep it with your important papers</span>
                </li>
              </ul>
            </Card>

            {/* Optional Binder Upsell */}
            <Card className="border border-dashed border-muted-foreground/30 text-left p-6 md:p-8">
              <div className="flex items-start gap-4">
                <div className="bg-muted w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0">
                  <BookOpen className="h-6 w-6 text-muted-foreground" />
                </div>
                <div className="flex-1 space-y-3">
                  <h2 className="text-lg font-semibold text-foreground">
                    Want a binder to store your printed form?
                  </h2>
                  <p className="text-muted-foreground">
                    A fireproof binder to store your printed wishes safely. Keep everything organized in one secure place.
                  </p>
                  <Link to="/products/binder">
                    <Button variant="outline" className="min-h-[48px]">
                      View Binder Option
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // User does NOT have access - show purchase prompt
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      <div className="max-w-2xl mx-auto px-4 py-12 md:py-20">
        <div className="flex justify-between items-start mb-8">
          <Link to="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          </Link>
          <TextSizeToggle />
        </div>
        
        <div className="text-center space-y-8">
          <div className="space-y-4">
            <div className="bg-primary/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto">
              <FileText className="h-10 w-10 text-primary" />
            </div>
            <h1 className="text-3xl md:text-4xl font-serif font-bold text-foreground">
              Printable Planning Form
            </h1>
          </div>

          {/* Description */}
          <p className="text-lg text-muted-foreground">
            Get a professionally formatted form you can print and fill out by hand.
          </p>

          {/* Purchase Required Card */}
          <Card className="bg-muted/30 border-2 border-primary/20 text-left p-6 md:p-8">
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-xl font-semibold text-foreground mb-2">
                  Purchase Required
                </h2>
                <p className="text-muted-foreground">
                  {isLoggedIn 
                    ? "You haven't purchased this form yet. Get instant access after purchase."
                    : "Sign in or purchase to download this form."}
                </p>
              </div>

              {/* Features */}
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex items-start gap-3">
                  <FileText className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <span>Comprehensive blank form for all your planning needs</span>
                </li>
                <li className="flex items-start gap-3">
                  <FileText className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <span>Print unlimited copies for yourself and family</span>
                </li>
                <li className="flex items-start gap-3">
                  <FileText className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <span>No app required — just print and fill in</span>
                </li>
              </ul>

              {/* Purchase Button */}
              <div className="text-center pt-2">
                <Button 
                  onClick={handlePurchase} 
                  size="lg"
                  className="min-h-[56px] text-lg px-10"
                >
                  <ShoppingCart className="mr-3 h-5 w-5" />
                  Get Printable Form
                </Button>
                <p className="text-sm text-muted-foreground mt-3">
                  Secure checkout. Instant download after purchase.
                </p>
              </div>

              {/* Binder Option for non-purchasers too */}
              <div className="pt-6 border-t border-border mt-6">
                <p className="text-muted-foreground mb-3">
                  Want a binder to store your printed form?
                </p>
                <Link to="/products/binder">
                  <Button variant="outline" className="min-h-[48px]">
                    <BookOpen className="mr-2 h-4 w-4" />
                    View Binder Option
                  </Button>
                </Link>
              </div>
            </div>
          </Card>

          {/* Already purchased? */}
          {!isLoggedIn && (
            <p className="text-sm text-muted-foreground">
              Already purchased?{" "}
              <Button 
                variant="link" 
                className="p-0 h-auto text-primary"
                onClick={() => navigate("/login?redirect=/forms")}
              >
                Sign in to download
              </Button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Forms;
