import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { TextSizeToggle } from '@/components/TextSizeToggle';
import { ArrowLeft, Download, FileText, BookOpen } from 'lucide-react';

import { generateBlankAfterLifePlanPDF } from '@/lib/blankAfterLifePlanPdfGenerator';
import { toast } from 'sonner';

const Forms = () => {
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

  const handleDownloadAfterLifeForm = async () => {
    try {
      await generateBlankAfterLifePlanPDF();
      toast.success('Blank After-Death Planner downloaded successfully');
    } catch (error) {
      console.error('Error generating after-death planner form:', error);
      toast.error('Failed to download form. Please try again.');
    }
  };

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
              Your Printable Planning Form
            </h1>
          </div>

          {/* Main Download Button */}
          <Button 
            onClick={handleDownloadPrePlanningForm} 
            size="lg"
            className="min-h-[60px] text-lg px-10"
          >
            <Download className="mr-3 h-6 w-6" />
            Download PDF
          </Button>

          {/* Explanation */}
          <Card className="bg-muted/30 border-none text-left p-6 md:p-8">
            <ul className="space-y-4 text-lg text-muted-foreground">
              <li className="flex items-start gap-3">
                <FileText className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                <span>This is a blank form to fill out by hand.</span>
              </li>
              <li className="flex items-start gap-3">
                <FileText className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                <span>You may print as many copies as you like.</span>
              </li>
              <li className="flex items-start gap-3">
                <FileText className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                <span>Nothing is stored unless you later use the app.</span>
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
                  Order the EFABINDER (Optional)
                </h2>
                <p className="text-muted-foreground">
                  A fireproof binder to store your printed wishes safely. Keep everything organized in one secure place.
                </p>
                <a 
                  href="https://buy.stripe.com/6oE7sLgnX1Cb02P7sN7bW00" 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  <Button variant="outline" className="min-h-[48px]">
                    Learn More & Order
                  </Button>
                </a>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Forms;
