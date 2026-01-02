import { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { TextSizeToggle } from '@/components/TextSizeToggle';
import { 
  ExternalLink, FileText, Download, Home, Eye, 
  Calculator, ChevronRight, CheckSquare, BookOpen, Info
} from 'lucide-react';
import { GlobalHeader } from '@/components/GlobalHeader';
import { AppFooter } from '@/components/AppFooter';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ResourcesDownloadSection } from '@/components/resources/ResourcesDownloadSection';
import { ResourcesSidebar } from '@/components/resources/ResourcesSidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

const Resources = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeSection, setActiveSection] = useState(searchParams.get('section') || 'planning-guides');
  const [activeSubItem, setActiveSubItem] = useState<string | undefined>(searchParams.get('sub') || undefined);

  useEffect(() => {
    const params = new URLSearchParams();
    params.set('section', activeSection);
    if (activeSubItem) {
      params.set('sub', activeSubItem);
    }
    setSearchParams(params, { replace: true });
  }, [activeSection, activeSubItem, setSearchParams]);

  const handleSectionChange = (sectionId: string, subItemId?: string) => {
    setActiveSection(sectionId);
    setActiveSubItem(subItemId);
  };

  // Quick access cards for top of page
  const quickAccessCards = [
    {
      title: "Pre-Planning Guide",
      description: "Step-by-step guide to plan ahead",
      icon: BookOpen,
      onClick: () => handleSectionChange('planning-guides', 'pre-planning-guide'),
      color: "bg-primary/10 text-primary"
    },
    {
      title: "Checklists",
      description: "Track what you've done",
      icon: CheckSquare,
      onClick: () => handleSectionChange('checklists'),
      color: "bg-green-500/10 text-green-700"
    },
    {
      title: "Cost Estimator",
      description: "Get a funeral cost estimate",
      icon: Calculator,
      onClick: () => navigate('/resources/cost-estimator'),
      color: "bg-amber-500/10 text-amber-700"
    },
    {
      title: "Printable Forms",
      description: "Download blank forms",
      icon: FileText,
      onClick: () => handleSectionChange('forms-worksheets', 'printable-forms'),
      color: "bg-blue-500/10 text-blue-700"
    },
  ];

  const renderContent = () => {
    switch (activeSection) {
      case 'planning-guides':
        return renderPlanningGuides();
      case 'checklists':
        return renderChecklists();
      case 'forms-worksheets':
        return renderFormsWorksheets();
      case 'faqs':
        return renderFAQs();
      case 'tools-calculators':
        return renderToolsCalculators();
      case 'trusted-resources':
        return renderTrustedResources();
      case 'support-help':
        return renderSupportHelp();
      default:
        return renderPlanningGuides();
    }
  };

  // Planning Guides Section
  const renderPlanningGuides = () => (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">Planning Guides</h1>
        <p className="text-lg text-muted-foreground">
          Educational guides to help you understand the planning process.
        </p>
      </div>

      {/* Pre-Planning Guide */}
      <Card className="border-2 border-primary/20">
        <CardHeader>
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-block px-3 py-1 text-xs font-semibold bg-primary/10 text-primary rounded-full">
              📋 Pre-Planning
            </span>
          </div>
          <CardTitle className="text-xl">Pre-Planning Guide</CardTitle>
          <CardDescription className="text-base">
            A comprehensive guide to help you plan ahead and give your family peace of mind.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center mb-4">
            <iframe 
              src="https://gamma.app/embed/om4wcs6irh1s18e" 
              style={{ width: '700px', maxWidth: '100%', height: '450px' }}
              allow="fullscreen" 
              title="Pre-Planning Guide" 
              className="rounded-lg border border-border" 
            />
          </div>
          <a 
            href="https://gamma.app/docs/om4wcs6irh1s18e" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-primary hover:underline text-base font-medium"
          >
            <ExternalLink className="h-4 w-4" />
            Open Full Guide in New Tab
          </a>
        </CardContent>
      </Card>

      {/* When Death Happens Guide */}
      <Card className="border-2 border-amber-500/20">
        <CardHeader>
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-block px-3 py-1 text-xs font-semibold bg-amber-500/10 text-amber-700 rounded-full">
              🕊️ After a Loss
            </span>
          </div>
          <CardTitle className="text-xl">When Death Happens: After-Death Planner Guide</CardTitle>
          <CardDescription className="text-base">
            Step-by-step guidance for families navigating the first days and weeks after losing a loved one.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center mb-4">
            <iframe 
              src="https://gamma.app/embed/13licam9flg6gcq" 
              style={{ width: '700px', maxWidth: '100%', height: '450px' }}
              allow="fullscreen" 
              title="After-Death Planner Guide" 
              className="rounded-lg border border-border" 
            />
          </div>
          <a 
            href="https://gamma.app/docs/13licam9flg6gcq" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-primary hover:underline text-base font-medium"
          >
            <ExternalLink className="h-4 w-4" />
            Open Full Guide in New Tab
          </a>
        </CardContent>
      </Card>
    </div>
  );

  // Checklists Section (SEPARATE from guides)
  const renderChecklists = () => (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">Checklists</h1>
        <p className="text-lg text-muted-foreground">
          Step-by-step checklists to help you track your progress and stay organized.
        </p>
      </div>

      {/* Pre-Planning Checklist */}
      <Card className="border-2 border-primary/20">
        <CardHeader>
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-block px-3 py-1 text-xs font-semibold bg-primary/10 text-primary rounded-full">
              ✅ Pre-Planning
            </span>
          </div>
          <CardTitle className="text-xl">Pre-Planning Checklist</CardTitle>
          <CardDescription className="text-base">
            Everything you need to prepare ahead of time for peace of mind.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center mb-4">
            <iframe 
              src="https://gamma.app/embed/plsn9a9j7cvzdh5" 
              style={{ width: '700px', maxWidth: '100%', height: '450px' }}
              allow="fullscreen" 
              title="Pre-Planning Checklist" 
              className="rounded-lg border border-border" 
            />
          </div>
          <a 
            href="https://gamma.app/docs/plsn9a9j7cvzdh5" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-primary hover:underline text-base font-medium"
          >
            <ExternalLink className="h-4 w-4" />
            Open Full Checklist in New Tab
          </a>
        </CardContent>
      </Card>

      {/* After-Death Checklist */}
      <Card className="border-2 border-amber-500/20">
        <CardHeader>
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-block px-3 py-1 text-xs font-semibold bg-amber-500/10 text-amber-700 rounded-full">
              📝 After a Loss
            </span>
          </div>
          <CardTitle className="text-xl">After-Death Checklist</CardTitle>
          <CardDescription className="text-base">
            Essential steps and tasks for families after the loss of a loved one.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center mb-4">
            <iframe 
              src="https://gamma.app/embed/h13wkygxlos50w9" 
              style={{ width: '700px', maxWidth: '100%', height: '450px' }}
              allow="fullscreen" 
              title="After-Death Checklist" 
              className="rounded-lg border border-border" 
            />
          </div>
          <a 
            href="https://gamma.app/docs/After-Death-Planner-Checklist-h13wkygxlos50w9" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-primary hover:underline text-base font-medium"
          >
            <ExternalLink className="h-4 w-4" />
            Open Full Checklist in New Tab
          </a>
        </CardContent>
      </Card>
    </div>
  );

  // Tools & Calculators Section
  const renderToolsCalculators = () => (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">Tools & Calculators</h1>
        <p className="text-lg text-muted-foreground">
          Practical tools to help with planning decisions.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Link to="/resources/cost-estimator" className="block">
          <Card className="h-full hover:border-primary/50 transition-colors cursor-pointer">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-amber-500/10 flex items-center justify-center">
                  <Calculator className="h-6 w-6 text-amber-700" />
                </div>
                <div>
                  <CardTitle className="text-lg">Cost Estimator</CardTitle>
                  <CardDescription>Get a general idea of funeral costs</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Enter your preferences to see estimated costs for different funeral options.
              </p>
              <Button className="w-full min-h-[48px]">
                Open Cost Estimator
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </Link>
        
        <Link to="/dashboard" className="block">
          <Card className="h-full hover:border-primary/50 transition-colors cursor-pointer">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Eye className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg">Planning Progress</CardTitle>
                  <CardDescription>Track what you've completed</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                See which sections you've completed and what still needs attention.
              </p>
              <Button variant="outline" className="w-full min-h-[48px]">
                View My Dashboard
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </Link>
        
        <Link to="/forms" className="block">
          <Card className="h-full hover:border-primary/50 transition-colors cursor-pointer">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-green-500/10 flex items-center justify-center">
                  <CheckSquare className="h-6 w-6 text-green-700" />
                </div>
                <div>
                  <CardTitle className="text-lg">Document Checklist</CardTitle>
                  <CardDescription>See what documents you need</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                A personalized list of documents and forms to gather.
              </p>
              <Button variant="outline" className="w-full min-h-[48px]">
                View Checklist
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </Link>

        <Card className="h-full border-dashed">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
                <Info className="h-6 w-6 text-muted-foreground" />
              </div>
              <div>
                <CardTitle className="text-lg text-muted-foreground">Decision Helper</CardTitle>
                <CardDescription>Guided questions for tough choices</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Coming soon: guided questions to help you make important decisions.
            </p>
            <Button variant="outline" className="w-full min-h-[48px]" disabled>
              Coming Soon
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  // Forms & Worksheets Section
  const renderFormsWorksheets = () => (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">Forms & Worksheets</h1>
        <p className="text-lg text-muted-foreground">
          Printable forms and downloadable resources to help you plan.
        </p>
      </div>

      <ResourcesDownloadSection />

      {/* Additional Forms */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Additional Downloads
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-4">
            <li>
              <Link to="/forms" className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors">
                <FileText className="h-5 w-5 text-primary shrink-0" />
                <div>
                  <p className="font-medium text-foreground">Blank Fillable Forms</p>
                  <p className="text-sm text-muted-foreground">Pre-Planning & After-Death Planner forms you can fill out</p>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground ml-auto" />
              </Link>
            </li>
            <li>
              <a href="/guides/Know-Your-Rights-When-Arranging-a-Funeral.pdf" download className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors">
                <Download className="h-5 w-5 text-primary shrink-0" />
                <div>
                  <p className="font-medium text-foreground">Know Your Rights (Print or Save as PDF)</p>
                  <p className="text-sm text-muted-foreground">FTC Funeral Rule consumer rights guide</p>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground ml-auto" />
              </a>
            </li>
            <li>
              <a href="/guides/Discussing-Death-Guide.pdf" download className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors">
                <Download className="h-5 w-5 text-primary shrink-0" />
                <div>
                  <p className="font-medium text-foreground">Discussing Death Guide (Print or Save as PDF)</p>
                  <p className="text-sm text-muted-foreground">Tips for having the conversation with loved ones</p>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground ml-auto" />
              </a>
            </li>
            <li>
              <a href="/guides/My-End-of-Life-Decisions-Guide.pdf" download className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors">
                <Download className="h-5 w-5 text-primary shrink-0" />
                <div>
                  <p className="font-medium text-foreground">My End-of-Life Decisions Guide (Print or Save as PDF)</p>
                  <p className="text-sm text-muted-foreground">Comprehensive planning decisions worksheet</p>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground ml-auto" />
              </a>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );

  // FAQs Section with Travel Protection
  const renderFAQs = () => (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">Frequently Asked Questions</h1>
        <p className="text-lg text-muted-foreground">
          Find answers to common questions about planning and using this app.
        </p>
      </div>

      {/* General Questions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">General Questions</CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="faq-1">
              <AccordionTrigger className="text-left text-base py-4">What is this app for?</AccordionTrigger>
              <AccordionContent className="text-base text-muted-foreground pb-4">
                This app helps you organize your end-of-life wishes and important information in one secure place.
                It's designed to make planning easier for you and to help your family when the time comes.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="faq-2">
              <AccordionTrigger className="text-left text-base py-4">Is my information secure?</AccordionTrigger>
              <AccordionContent className="text-base text-muted-foreground pb-4">
                Yes. Your data is encrypted and stored securely. Only you and people you choose to share with can access your information.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="faq-3">
              <AccordionTrigger className="text-left text-base py-4">Can I change my answers later?</AccordionTrigger>
              <AccordionContent className="text-base text-muted-foreground pb-4">
                Absolutely. You can update any section at any time. We recommend reviewing your plan at least once a year or after major life events.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>

      {/* Travel Protection FAQs */}
      <Card className="border-2 border-blue-500/20">
        <CardHeader className="bg-blue-500/5">
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-block px-3 py-1 text-xs font-semibold bg-blue-500/10 text-blue-700 rounded-full">
              ✈️ Travel Protection
            </span>
          </div>
          <CardTitle className="text-lg">Travel Protection FAQs</CardTitle>
          <CardDescription className="text-base">
            Understanding coverage when you travel away from home.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="travel-1">
              <AccordionTrigger className="text-left text-base py-4">What is travel protection?</AccordionTrigger>
              <AccordionContent className="text-base text-muted-foreground pb-4">
                Travel protection helps cover problems that happen during a trip. This can include canceled trips, medical care, or getting home during an emergency.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="travel-2">
              <AccordionTrigger className="text-left text-base py-4">What does travel protection usually cover?</AccordionTrigger>
              <AccordionContent className="text-base text-muted-foreground pb-4">
                <p className="mb-2">Most plans help with:</p>
                <ul className="list-disc ml-6 space-y-1">
                  <li>Trip cancellation or interruption</li>
                  <li>Emergency medical care while traveling</li>
                  <li>Medical evacuation to the nearest hospital</li>
                  <li>Lost or delayed luggage</li>
                </ul>
                <p className="mt-2 text-sm">Coverage depends on the plan you choose.</p>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="travel-3">
              <AccordionTrigger className="text-left text-base py-4">What does travel protection usually NOT cover?</AccordionTrigger>
              <AccordionContent className="text-base text-muted-foreground pb-4">
                <p className="mb-2">Most plans do not cover:</p>
                <ul className="list-disc ml-6 space-y-1">
                  <li>Pre-existing conditions without special coverage</li>
                  <li>Routine doctor visits</li>
                  <li>High-risk activities unless added</li>
                  <li>Canceling a trip just because you changed your mind</li>
                </ul>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="travel-4">
              <AccordionTrigger className="text-left text-base py-4">When should I buy travel protection?</AccordionTrigger>
              <AccordionContent className="text-base text-muted-foreground pb-4">
                Buy it soon after booking your trip. Early purchase gives you the most options and better coverage.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="travel-5">
              <AccordionTrigger className="text-left text-base py-4">How do I file a claim?</AccordionTrigger>
              <AccordionContent className="text-base text-muted-foreground pb-4">
                You contact the travel protection company directly. You will need receipts, documents, and proof of the problem. Claims are not handled by this app.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="travel-6">
              <AccordionTrigger className="text-left text-base py-4">Does Medicare or my health insurance cover me while traveling?</AccordionTrigger>
              <AccordionContent className="text-base text-muted-foreground pb-4">
                Often, no. Medicare usually does not cover care outside the United States. Many health plans have limited or no travel coverage.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="travel-7">
              <AccordionTrigger className="text-left text-base py-4">What is medical evacuation?</AccordionTrigger>
              <AccordionContent className="text-base text-muted-foreground pb-4">
                Medical evacuation pays to move you to the nearest hospital that can treat you, or back home if needed. This can be very expensive without coverage.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="travel-8">
              <AccordionTrigger className="text-left text-base py-4">What does "Cancel for Any Reason" mean?</AccordionTrigger>
              <AccordionContent className="text-base text-muted-foreground pb-4">
                Cancel for Any Reason (CFAR) lets you cancel a trip for almost any reason and get part of your money back. It must be purchased early and costs more.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="travel-9">
              <AccordionTrigger className="text-left text-base py-4">Is travel protection the same as life insurance?</AccordionTrigger>
              <AccordionContent className="text-base text-muted-foreground pb-4">
                No. Travel protection helps during a trip. Life insurance pays money to beneficiaries after death.
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          {/* Coverage Comparison Table */}
          <div className="mt-6 overflow-x-auto">
            <h4 className="font-semibold mb-3">Coverage Comparison</h4>
            <table className="w-full text-sm border border-border rounded-lg overflow-hidden">
              <thead className="bg-muted">
                <tr>
                  <th className="text-left p-3 font-medium">Coverage Type</th>
                  <th className="text-center p-3 font-medium">Medicare</th>
                  <th className="text-center p-3 font-medium">Health Insurance</th>
                  <th className="text-center p-3 font-medium">Travel Protection</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-border">
                  <td className="p-3">Care outside the U.S.</td>
                  <td className="text-center p-3">❌ Usually no</td>
                  <td className="text-center p-3">⚠️ Limited</td>
                  <td className="text-center p-3">✅ Yes</td>
                </tr>
                <tr className="border-t border-border bg-muted/30">
                  <td className="p-3">Emergency medical care</td>
                  <td className="text-center p-3">⚠️ Limited</td>
                  <td className="text-center p-3">⚠️ Limited</td>
                  <td className="text-center p-3">✅ Yes</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="p-3">Medical evacuation</td>
                  <td className="text-center p-3">❌ No</td>
                  <td className="text-center p-3">❌ No</td>
                  <td className="text-center p-3">✅ Yes</td>
                </tr>
                <tr className="border-t border-border bg-muted/30">
                  <td className="p-3">Trip cancellation</td>
                  <td className="text-center p-3">❌ No</td>
                  <td className="text-center p-3">❌ No</td>
                  <td className="text-center p-3">✅ Yes</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="p-3">Lost/delayed luggage</td>
                  <td className="text-center p-3">❌ No</td>
                  <td className="text-center p-3">❌ No</td>
                  <td className="text-center p-3">✅ Yes</td>
                </tr>
                <tr className="border-t border-border bg-muted/30">
                  <td className="p-3">Cancel for Any Reason</td>
                  <td className="text-center p-3">❌ No</td>
                  <td className="text-center p-3">❌ No</td>
                  <td className="text-center p-3">⚠️ Optional</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Disclaimer */}
          <div className="mt-6 p-4 bg-muted/50 rounded-lg border text-sm text-muted-foreground">
            <p className="font-medium text-foreground mb-1">Is this legal or insurance advice?</p>
            <p>No. This is general information only. Always read the policy details and talk to the provider before purchasing.</p>
          </div>
        </CardContent>
      </Card>

      {/* Legal & Financial */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Legal & Financial</CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="legal-1">
              <AccordionTrigger className="text-left text-base py-4">What is a Payable on Death (POD) beneficiary?</AccordionTrigger>
              <AccordionContent className="text-base text-muted-foreground pb-4">
                A POD beneficiary on a bank account receives the money directly when you die, bypassing probate. Ask your bank for a POD form to set one up. It's usually free.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="legal-2">
              <AccordionTrigger className="text-left text-base py-4">Should I have a will or a trust?</AccordionTrigger>
              <AccordionContent className="text-base text-muted-foreground pb-4">
                A will goes through probate court and becomes public. A living trust avoids probate, stays private, and takes effect if you become incapacitated. Consult an attorney to decide what's best for your situation.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>

      <div className="text-center py-4">
        <Link to="/faq">
          <Button size="lg" variant="outline" className="min-h-[48px]">
            View All FAQs
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        </Link>
      </div>
    </div>
  );

  // Trusted Resources Section
  const renderTrustedResources = () => (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">Trusted Resources</h1>
        <p className="text-lg text-muted-foreground">
          Verified external resources from government agencies and consumer protection organizations.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <span>🏛️</span> Government Resources
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              <li>
                <a href="https://www.va.gov/burials-memorials/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-primary hover:underline">
                  <ExternalLink className="h-4 w-4 shrink-0" />
                  VA Burial Benefits
                </a>
                <p className="text-sm text-muted-foreground mt-1">Information for veterans and their families</p>
              </li>
              <li>
                <a href="https://www.ssa.gov/benefits/survivors/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-primary hover:underline">
                  <ExternalLink className="h-4 w-4 shrink-0" />
                  Social Security Survivor Benefits
                </a>
                <p className="text-sm text-muted-foreground mt-1">Learn about benefits for surviving spouses and children</p>
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <span>⚖️</span> Consumer Protection
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              <li>
                <a href="https://consumer.ftc.gov/articles/planning-your-own-funeral" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-primary hover:underline">
                  <ExternalLink className="h-4 w-4 shrink-0" />
                  FTC Funeral Consumer Guide
                </a>
                <p className="text-sm text-muted-foreground mt-1">Official guidance on planning and your rights</p>
              </li>
              <li>
                <a href="https://funerals.org" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-primary hover:underline">
                  <ExternalLink className="h-4 w-4 shrink-0" />
                  Funeral Consumers Alliance
                </a>
                <p className="text-sm text-muted-foreground mt-1">Non-profit consumer advocacy organization</p>
              </li>
              <li>
                <a href="https://reportfraud.ftc.gov" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-primary hover:underline">
                  <ExternalLink className="h-4 w-4 shrink-0" />
                  Report Fraud (FTC)
                </a>
                <p className="text-sm text-muted-foreground mt-1">Report concerns about funeral home practices</p>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  // Support & Help Section
  const renderSupportHelp = () => (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">Support & Help</h1>
        <p className="text-lg text-muted-foreground">
          Get help with the app or connect with our support team.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Link to="/contact" className="block">
          <Card className="h-full hover:border-primary/50 transition-colors cursor-pointer">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <span>📧</span> Contact Support
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Send us a message and we'll get back to you as soon as possible.
              </p>
              <Button className="w-full min-h-[48px]">Contact Us</Button>
            </CardContent>
          </Card>
        </Link>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <span>💬</span> How to Get Help
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Click the Claire button in the corner anytime to ask questions or get guidance. Claire is our friendly assistant who can help you navigate the app.
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-muted/30">
        <CardHeader>
          <CardTitle className="text-lg">Need More Help?</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            Our team is here to support you through every step of the planning process.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link to="/care-support">
              <Button size="lg" className="min-h-[48px]">Learn About CARE Support</Button>
            </Link>
            <Link to="/faq">
              <Button size="lg" variant="outline" className="min-h-[48px]">View All FAQs</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <GlobalHeader />
      
      {/* Top Action Bar - Senior Friendly */}
      <div className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-xl font-bold text-foreground">Resources & Help</h1>
              <p className="text-sm text-muted-foreground">
                Guides, checklists, and tools to help you plan ahead.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link to="/preplan-summary">
                <Button size="lg" className="min-h-[48px] gap-2">
                  <Eye className="h-5 w-5" />
                  View My Plan
                </Button>
              </Link>
              <Link to="/dashboard">
                <Button size="lg" variant="outline" className="min-h-[48px] gap-2">
                  <Home className="h-5 w-5" />
                  Back to Dashboard
                </Button>
              </Link>
              <TextSizeToggle />
            </div>
          </div>
        </div>
      </div>

      {/* What is this page explanation */}
      <div className="bg-primary/5 border-b border-primary/10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-primary shrink-0 mt-0.5" />
            <p className="text-sm text-foreground">
              <strong>What is this page?</strong> This page has guides, checklists, and tools to help you plan ahead. 
              You can read a guide, print a checklist, or use the calculators.
            </p>
          </div>
        </div>
      </div>
      
      {/* Quick Access Cards */}
      <div className="bg-background border-b border-border py-6">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-lg font-semibold mb-4">Quick Access</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {quickAccessCards.map((card) => (
              <button
                key={card.title}
                onClick={card.onClick}
                className="flex flex-col items-center text-center p-4 rounded-xl bg-card border border-border hover:border-primary/50 transition-colors"
              >
                <div className={cn("w-12 h-12 rounded-lg flex items-center justify-center mb-3", card.color)}>
                  <card.icon className="h-6 w-6" />
                </div>
                <p className="font-medium text-foreground text-sm">{card.title}</p>
                <p className="text-xs text-muted-foreground mt-1">{card.description}</p>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 flex">
        <ResourcesSidebar 
          activeSection={activeSection}
          activeSubItem={activeSubItem}
          onSectionChange={handleSectionChange}
        />
        
        <main className="flex-1 max-w-4xl px-4 py-8 md:py-12">
          {renderContent()}
        </main>
      </div>
      
      <AppFooter />
    </div>
  );
};

export default Resources;
