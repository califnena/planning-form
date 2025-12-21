import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { TextSizeToggle } from '@/components/TextSizeToggle';
import { ArrowLeft, Download, FileText } from 'lucide-react';
import { generateManuallyFillablePDF } from '@/lib/manuallyFillablePdfGenerator';
import { generateBlankAfterLifePlanPDF } from '@/lib/blankAfterLifePlanPdfGenerator';
import { toast } from 'sonner';

const Forms = () => {
  const handleDownloadPrePlanningForm = () => {
    try {
      const pdf = generateManuallyFillablePDF({});
      pdf.save(`My-Final-Wishes-Blank-Form-${new Date().toISOString().split('T')[0]}.pdf`);
      toast.success('Blank Pre-Planning Form downloaded successfully');
    } catch (error) {
      console.error('Error generating pre-planning form:', error);
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
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-4 py-8 md:py-12">
        <div className="flex justify-between items-start mb-8">
          <Link to="/">
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Planning Menu
            </Button>
          </Link>
          <TextSizeToggle />
        </div>
        
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
          Blank / Fillable Forms
        </h1>
        <p className="text-lg text-muted-foreground mb-8">
          Download printable PDF forms you can fill in by hand or on your computer.
        </p>
        
        <div className="space-y-6">
          {/* Pre-Planning Form */}
          <Card className="p-6 md:p-8">
            <div className="flex items-start gap-4">
              <div className="bg-primary/10 p-3 rounded-lg">
                <FileText className="h-8 w-8 text-primary" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl md:text-2xl font-semibold text-foreground mb-2">
                  My Final Wishes Pre-Planning Form
                </h2>
                <p className="text-base text-muted-foreground mb-4">
                  A comprehensive blank form for documenting your funeral wishes, personal information, contacts, 
                  financial accounts, insurance policies, digital accounts, and final messages. 
                  Perfect for organizing your end-of-life plans in a physical binder.
                </p>
                <p className="text-sm text-muted-foreground mb-4">
                  <strong>What's included:</strong> Personal profile, funeral preferences, financial accounts, 
                  insurance policies, property information, pet care, digital accounts, legal documents, and messages to loved ones.
                </p>
                <Button onClick={handleDownloadPrePlanningForm} size="lg">
                  <Download className="mr-2 h-5 w-5" />
                  Download Pre-Planning Form
                </Button>
              </div>
            </div>
          </Card>

          {/* After-Death Planner */}
          <Card className="p-6 md:p-8">
            <div className="flex items-start gap-4">
              <div className="bg-primary/10 p-3 rounded-lg">
                <FileText className="h-8 w-8 text-primary" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl md:text-2xl font-semibold text-foreground mb-2">
                  After-Death Planner Checklist
                </h2>
                <p className="text-base text-muted-foreground mb-4">
                  A blank checklist form to guide families through the necessary steps after a loved one passes away. 
                  Covers immediate actions, official notifications, funeral arrangements, financial matters, 
                  and long-term tasks. Essential for executors and family members managing estate affairs.
                </p>
                <p className="text-sm text-muted-foreground mb-4">
                  <strong>What's included:</strong> Immediate needs checklist, official notifications, 
                  document location tracker, death certificate requests, obituary planning, service details, 
                  financial account closures, digital account management, and estate settlement steps.
                </p>
                <Button onClick={handleDownloadAfterLifeForm} size="lg">
                  <Download className="mr-2 h-5 w-5" />
                  Download After-Death Planner
                </Button>
              </div>
            </div>
          </Card>

          {/* Info box */}
          <Card className="bg-primary/5 border-primary/20 p-6">
            <div className="flex items-start gap-3">
              <FileText className="h-6 w-6 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-foreground mb-2">How to use these forms:</h3>
                <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                  <li>Print the PDF and fill it out by hand, or</li>
                  <li>Fill it out digitally using a PDF editor (Adobe Acrobat, Preview on Mac, etc.)</li>
                  <li>Store completed forms in a fireproof safe or binder</li>
                  <li>Share copies with your executor, trusted family member, or attorney</li>
                  <li>Review and update your information annually</li>
                </ul>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Forms;
