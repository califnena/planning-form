import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Users } from 'lucide-react';
import { TextSizeToggle } from '@/components/TextSizeToggle';
import { VendorDirectory } from '@/components/vendors/VendorDirectory';
import NotAdviceNote from '@/components/NotAdviceNote';

/**
 * Trusted Providers Page
 * 
 * Purpose: Optional resources - not required for planning
 * Navigation: Under Help & Support
 * 
 * Rules:
 * - Do NOT display vendors inside planning forms
 * - Do NOT interrupt planning flow
 * - Only link from summary, checklist, or support pages
 */
const TrustedProviders = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-4 py-8 md:py-10">
        {/* Header Navigation */}
        <div className="flex justify-between items-start mb-6">
          <Link to="/resources">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Resources
            </Button>
          </Link>
          <TextSizeToggle />
        </div>
        
        {/* Page Header */}
        <div className="flex items-start gap-4 mb-6">
          <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Users className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
              Trusted Providers
            </h1>
            <p className="text-base md:text-lg text-muted-foreground">
              Optional resources if you need help finding professionals.
            </p>
          </div>
        </div>

        {/* Important Disclaimer */}
        <div className="mb-8 rounded-xl border border-border bg-muted/30 px-5 py-4 text-base text-foreground">
          <p className="mb-2 font-medium">This is optional.</p>
          <p className="text-muted-foreground">
            Listings are provided for convenience. You are not required to use any provider listed. 
            We encourage you to ask questions, compare options, and make your own decision.
          </p>
        </div>

        {/* Not Advice Note */}
        <NotAdviceNote />

        {/* Vendor Directory */}
        <div className="mt-8">
          <VendorDirectory />
        </div>

        {/* Footer Note */}
        <div className="mt-12 pt-6 border-t border-border">
          <p className="text-sm text-muted-foreground text-center">
            Some providers may have business relationships with us. Any such relationship will be disclosed when applicable.
          </p>
        </div>
      </div>
    </div>
  );
};

export default TrustedProviders;
