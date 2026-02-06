/**
 * RESOURCES PAGE AUDIT - 2026-01-12
 * 
 * === ISSUES FOUND ===
 * 
 * 1. UNREACHABLE FUNCTION: renderPlanningGuides() (lines ~264-376)
 *    - This function is defined but never called in renderContent() switch statement
 *    - The 'planning-guides' case does not exist in the switch (line 72-88)
 *    - Contains duplicate content with renderChecklists() - both have Pre-Planning Guide
 *    - DUPLICATE: Pre-Planning Guide appears in both renderPlanningGuides() and renderEducation()
 * 
 * 2. MISSING SIDEBAR SECTION: 'planning-guides'
 *    - ResourcesSidebar defines sections but 'planning-guides' is NOT in the list
 *    - The switch default falls back to renderEducation() instead
 * 
 * 3. REDUNDANT/DUPLICATE CONTENT:
 *    - renderEducation() has standalone educational cards (Legal & Medical, Funeral Planning, etc.)
 *    - renderPlanningGuides() has PDF embeds for guides (but is never rendered)
 *    - Some PDF guides appear in multiple sections:
 *      * "Pre-Planning Guide" - appears in unreachable renderPlanningGuides()
 *      * "Everlasting-Funeral-Advisors-Guide.pdf" - appears in renderPlanningGuides() as "After-Death Planner"
 *      * "EFA-Pre-Planning-Checklist.pdf" - appears in both renderChecklists() AND renderFormsWorksheets()
 *      * "EFA-After-Death-Planner-and-Checklist.pdf" - appears in both renderChecklists() AND renderFormsWorksheets()
 * 
 * 4. COMING SOON ITEMS (no content):
 *    - "Personal Information Summary" form (line ~714) - isComingSoon: true
 *    - "Emergency Contacts Sheet" form (line ~720) - isComingSoon: true
 *    - "Decision Helper" tool (line ~579) - disabled button
 * 
 * 5. ROUTE POTENTIAL ISSUES:
 *    - Link to "/resources/cost-estimator" (line 59, 504) - verify this route exists in App.tsx
 *    - Link to "/forms" (line 554, 776) - verify this route exists
 *    - Link to "/guide" (line 45) - verify this route exists
 *    - Link to "/travel-protection" (line 250) - verify this route exists
 *    - Link to "/care-support" (line 1132) - verify this route exists
 * 
 * 6. SIDEBAR MISMATCH WITH CONTENT:
 *    - Sidebar has 'education' section but default content (line 86) returns renderEducation() 
 *      with 'planning-guides' defaulted to, causing confusion
 *    - Initial state (line 22) defaults to 'planning-guides' but that's not a valid section
 * 
 * 7. MISSING FAQs SECTION IN SWITCH:
 *    - renderFAQs() function exists (line ~790) but no case for it in switch statement
 *    - Sidebar does not have a 'faqs' section entry
 * 
 * === RECOMMENDATIONS ===
 * - Remove or integrate renderPlanningGuides() - it's dead code
 * - Add 'planning-guides' to sidebar OR change default state to valid section
 * - Deduplicate PDF references across sections
 * - Either complete "Coming Soon" items or remove them
 * - Verify all internal routes exist
 * - Add FAQs to sidebar or remove renderFAQs() function
 */

import { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { TextSizeToggle } from '@/components/TextSizeToggle';
import { 
  ExternalLink, FileText, Download, Home, Eye,
  ChevronRight, CheckSquare, BookOpen, Info, HelpCircle, Mail, Phone
} from 'lucide-react';
import { GlobalHeader } from '@/components/GlobalHeader';
import { AppFooter } from '@/components/AppFooter';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ResourcesDownloadSection } from '@/components/resources/ResourcesDownloadSection';
import { ResourcesSidebar } from '@/components/resources/ResourcesSidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ErrorPanel } from '@/components/ui/ErrorPanel';
import { LegalDisclaimer } from '@/components/ui/LegalDisclaimer';
import { cn } from '@/lib/utils';
import { generateAfterDeathChecklistPDF } from '@/lib/afterDeathChecklistPdfGenerator';
import { useToast } from '@/hooks/use-toast';
import { usePrintableAccess } from '@/hooks/usePrintableAccess';
import { CallbackRequestDialog } from '@/components/resources/CallbackRequestDialog';

// Senior-friendly 3-category organization per Prompt C1
// 'step-by-step', 'free-checklists', 'free-guides'
const VALID_SECTIONS = ['step-by-step', 'free-checklists', 'free-guides'];
const DEFAULT_SECTION = 'step-by-step';

const Resources = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const [isGeneratingAfterDeath, setIsGeneratingAfterDeath] = useState(false);
  const { hasAccess: hasPrintableAccess, isAdmin } = usePrintableAccess();
  // Fix: Default to 'education' instead of non-existent 'planning-guides'
  const initialSection = searchParams.get('section');
  const validInitialSection = initialSection && VALID_SECTIONS.includes(initialSection) ? initialSection : DEFAULT_SECTION;
  const [activeSection, setActiveSection] = useState(validInitialSection);
  const [activeSubItem, setActiveSubItem] = useState<string | undefined>(searchParams.get('sub') || undefined);
  const [isCallbackDialogOpen, setIsCallbackDialogOpen] = useState(false);

  /**
   * Printable form handler - serves PDF directly if user has access
   * Does NOT redirect to Digital Planner
   */
  const handleGetPrintableForm = () => {
    // Admin or purchased users get immediate download
    if (isAdmin || hasPrintableAccess) {
      const link = document.createElement("a");
      link.href = "/templates/My-Final-Wishes-Blank-Form-2025-11-17.pdf";
      link.download = "My-Final-Wishes-Blank-Form.pdf";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast({
        title: "Download Started",
        description: "Your printable form is downloading."
      });
      return;
    }
    
    // No access - go directly to one-page checkout
    navigate('/printable-form');
  };

  const handleDownloadAfterDeathChecklist = async () => {
    setIsGeneratingAfterDeath(true);
    try {
      await generateAfterDeathChecklistPDF();
      toast({
        title: "PDF Generated",
        description: "Your After-Death Checklist has been downloaded."
      });
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast({
        title: "Error",
        description: "Failed to generate PDF. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGeneratingAfterDeath(false);
    }
  };

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

  const renderContent = () => {
    // Handle new 3-category structure with sub-items per Prompt C1
    switch (activeSection) {
      case 'step-by-step':
        // In-app guidance content
        if (activeSubItem === 'legal-medical') {
          return renderEducation();
        }
        if (activeSubItem === 'funeral-planning') {
          return renderEducation();
        }
        if (activeSubItem === 'digital-organization') {
          return renderEducation();
        }
        if (activeSubItem === 'travel-protection') {
          return renderEducation();
        }
        return renderStepByStepOverview();
      case 'free-checklists':
        // Printable checklists
        if (activeSubItem === 'pre-planning') {
          return renderChecklists();
        }
        if (activeSubItem === 'after-death') {
          return renderChecklists();
        }
        return renderFreeChecklistsOverview();
      case 'free-guides':
        // Optional reading guides
        if (activeSubItem === 'planning-guide') {
          return renderFormsWorksheets();
        }
        if (activeSubItem === 'after-death-guide') {
          return renderFormsWorksheets();
        }
        if (activeSubItem === 'trusted-resources') {
          return renderTrustedResources();
        }
        if (activeSubItem === 'faqs') {
          return renderFAQs();
        }
        return renderFreeGuidesOverview();
      default:
        return renderStepByStepOverview();
    }
  };

  // New: Step-by-Step Planning overview section
  const renderStepByStepOverview = () => (
    <div className="space-y-8">
      {/* Choose Your Path Section - 3 clear options */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">Choose How You'd Like to Plan</h1>
        <p className="text-lg text-muted-foreground">
          Pick the option that feels right for you. There's no wrong choice.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
       {/* Option 1: Plan Online */}
        <Card className="hover:border-primary/50 transition-colors cursor-pointer border-2" onClick={() => navigate('/preplandashboard/landing')}>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-primary" />
              </div>
              <div>
               <CardTitle className="text-lg">Plan Online</CardTitle>
                <CardDescription>Fill out on screen</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Answer questions on your computer, tablet, or phone. Your answers are saved automatically.
            </p>
            <Button className="w-full min-h-[48px]">
             Plan Online
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </CardContent>
        </Card>

        {/* Option 2: Printable Planning Form */}
        <Card className="hover:border-primary/50 transition-colors cursor-pointer border-2" onClick={handleGetPrintableForm}>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-green-500/10 flex items-center justify-center">
                <Download className="h-6 w-6 text-green-700" />
              </div>
              <div>
                <CardTitle className="text-lg flex items-center gap-2">
                  Printable Planning Form
                  {isAdmin && (
                    <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded font-normal">
                      Admin preview
                    </span>
                  )}
                </CardTitle>
                <CardDescription>Fill out by hand</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Print the form and fill it out with a pen at your own pace. No computer needed after printing.
            </p>
            <Button variant="outline" className="w-full min-h-[48px]">
              Buy Printable Planning Form – $9.99
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </CardContent>
        </Card>

        {/* Option 3: Learn First */}
        <Card className="hover:border-primary/50 transition-colors cursor-pointer border-2 border-dashed" onClick={() => {
          const freeHelpSection = document.getElementById('free-help-section');
          if (freeHelpSection) {
            freeHelpSection.scrollIntoView({ behavior: 'smooth' });
          }
        }}>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <FileText className="h-6 w-6 text-amber-700" />
              </div>
              <div>
                <CardTitle className="text-lg">Learn First</CardTitle>
                <CardDescription>Not ready to plan yet</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Read guides and checklists first. No signup required. Come back when you're ready.
            </p>
            <Button variant="outline" className="w-full min-h-[48px]">
              See Free Resources Below
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </CardContent>
        </Card>

        {/* Option 4: Talk to a Human */}
        <Card className="hover:border-primary/50 transition-colors cursor-pointer border-2 border-dashed" onClick={() => setIsCallbackDialogOpen(true)}>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Phone className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">Talk to a Human (Optional)</CardTitle>
                <CardDescription>Get friendly guidance</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Have a quick question or want help deciding? You can speak with a real person. No pressure. No obligation.
            </p>
            <Button variant="outline" className="w-full min-h-[48px]">
              Request a Callback
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
            <p className="text-xs text-muted-foreground text-center mt-3">
              For guidance only. No sales or legal advice.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Free Help, No Signup Section */}
      <div id="free-help-section" className="pt-12 border-t border-border">
        <div className="mb-6">
          <h2 className="text-xl md:text-2xl font-bold text-foreground mb-2">Free Help, No Signup</h2>
          <p className="text-muted-foreground">
            Read and learn at your own pace. Everything below is free—no account needed.
          </p>
        </div>

        {/* Free Checklists */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <CheckSquare className="h-5 w-5 text-green-700" />
            Free Checklists (Printable)
          </h3>
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="hover:border-primary/50 transition-colors cursor-pointer" onClick={() => window.open('/guides/EFA-Pre-Planning-Checklist.pdf', '_blank')}>
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Pre-Planning Checklist</p>
                    <p className="text-sm text-muted-foreground">Steps to plan ahead</p>
                  </div>
                  <Button variant="outline" size="sm" className="min-h-[40px]">
                    <Eye className="h-4 w-4 mr-2" />
                    View
                  </Button>
                </div>
              </CardContent>
            </Card>
            <Card className="hover:border-primary/50 transition-colors cursor-pointer" onClick={handleDownloadAfterDeathChecklist}>
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">After-Death Checklist</p>
                    <p className="text-sm text-muted-foreground">What to do after a loss</p>
                  </div>
                  <Button variant="outline" size="sm" className="min-h-[40px]" disabled={isGeneratingAfterDeath}>
                    <Download className="h-4 w-4 mr-2" />
                    {isGeneratingAfterDeath ? '...' : 'Download'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Free Guides */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-700" />
            Free Guides (Optional Reading)
          </h3>
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="hover:border-primary/50 transition-colors cursor-pointer" onClick={() => window.open('/guides/Pre-Planning-Guide.pdf', '_blank')}>
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Pre-Planning Guide</p>
                    <p className="text-sm text-muted-foreground">How to plan ahead</p>
                  </div>
                  <Button variant="outline" size="sm" className="min-h-[40px]">
                    <Eye className="h-4 w-4 mr-2" />
                    View
                  </Button>
                </div>
              </CardContent>
            </Card>
            <Card className="hover:border-primary/50 transition-colors cursor-pointer" onClick={() => window.open('/guides/Everlasting-Funeral-Advisors-Guide.pdf', '_blank')}>
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">After-Death Planner</p>
                    <p className="text-sm text-muted-foreground">Guide for after a loss</p>
                  </div>
                  <Button variant="outline" size="sm" className="min-h-[40px]">
                    <Eye className="h-4 w-4 mr-2" />
                    View
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Common Questions & Resources */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-amber-700" />
            Common Questions & Resources
          </h3>
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="hover:border-primary/50 transition-colors cursor-pointer" onClick={() => navigate('/faq')}>
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Frequently Asked Questions</p>
                    <p className="text-sm text-muted-foreground">Answers to common questions</p>
                  </div>
                  <Button variant="outline" size="sm" className="min-h-[40px]">
                    View
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </CardContent>
            </Card>
            <Card className="hover:border-primary/50 transition-colors cursor-pointer" onClick={() => handleSectionChange('free-guides', 'trusted-resources')}>
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Trusted Resources</p>
                    <p className="text-sm text-muted-foreground">Government & consumer protection</p>
                  </div>
                  <Button variant="outline" size="sm" className="min-h-[40px]">
                    View
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Human Help */}
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Mail className="h-5 w-5 text-primary" />
            Want to Talk to Someone?
          </h3>
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="hover:border-primary/50 transition-colors">
              <CardContent className="pt-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <HelpCircle className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">Talk to Claire</p>
                    <p className="text-sm text-muted-foreground">
                      Claire is here to answer questions—look for the chat button in the corner.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="hover:border-primary/50 transition-colors">
              <CardContent className="pt-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0">
                    <Mail className="h-5 w-5 text-amber-700" />
                  </div>
                  <div>
                   <p className="font-medium">Send a Message</p>
                   <button 
                     onClick={() => setIsCallbackDialogOpen(true)}
                     className="text-sm text-primary hover:underline text-left"
                   >
                     Talk to a Human
                   </button>
                   <p className="text-sm text-muted-foreground">No pressure, just support.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );

  // New: Free Checklists overview section
  const renderFreeChecklistsOverview = () => (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">Free Checklists (Printable)</h1>
        <p className="text-lg text-muted-foreground">
          Printable checklists to help you stay organized.
        </p>
        <p className="text-base text-muted-foreground mt-2">
          Free to view, download, or print.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card 
          className="hover:border-primary/50 transition-colors cursor-pointer" 
          onClick={() => handleSectionChange('free-checklists', 'pre-planning')}
        >
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-green-500/10 flex items-center justify-center">
                <CheckSquare className="h-6 w-6 text-green-700" />
              </div>
              <div>
                <CardTitle className="text-lg">Pre-Planning Checklist</CardTitle>
                <CardDescription>Plan ahead step-by-step</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              A checklist to help you plan ahead for your family.
            </p>
            <Button className="w-full min-h-[48px]">
              View Checklist
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </CardContent>
        </Card>

        <Card 
          className="hover:border-primary/50 transition-colors cursor-pointer" 
          onClick={() => handleSectionChange('free-checklists', 'after-death')}
        >
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <CheckSquare className="h-6 w-6 text-blue-700" />
              </div>
              <div>
                <CardTitle className="text-lg">After-Death Checklist</CardTitle>
                <CardDescription>What to do after a loss</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              A checklist to guide you through the days after a loved one passes.
            </p>
            <Button variant="outline" className="w-full min-h-[48px]">
              View Checklist
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  // New: Free Guides overview section
  const renderFreeGuidesOverview = () => (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">Free Guides (Optional Reading)</h1>
        <p className="text-lg text-muted-foreground">
          Additional reading to help you understand your options.
        </p>
        <p className="text-base text-muted-foreground mt-2">
          These guides are different from the step-by-step planning inside the app. They are optional reading only.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card 
          className="hover:border-primary/50 transition-colors cursor-pointer" 
          onClick={() => handleSectionChange('free-guides', 'planning-guide')}
        >
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">Pre-Planning Guide</CardTitle>
                <CardDescription>Comprehensive planning guide</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              A detailed guide to help you understand all aspects of pre-planning.
            </p>
            <Button className="w-full min-h-[48px]">
              View Guide
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </CardContent>
        </Card>

        <Card 
          className="hover:border-primary/50 transition-colors cursor-pointer" 
          onClick={() => handleSectionChange('free-guides', 'after-death-guide')}
        >
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <FileText className="h-6 w-6 text-blue-700" />
              </div>
              <div>
                <CardTitle className="text-lg">After-Death Planner</CardTitle>
                <CardDescription>Guide for after a loss</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              A guide to help you navigate the days after a loved one passes.
            </p>
            <Button variant="outline" className="w-full min-h-[48px]">
              View Guide
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </CardContent>
        </Card>

        <Card 
          className="hover:border-primary/50 transition-colors cursor-pointer" 
          onClick={() => handleSectionChange('free-guides', 'trusted-resources')}
        >
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <ExternalLink className="h-6 w-6 text-purple-700" />
              </div>
              <div>
                <CardTitle className="text-lg">Trusted Resources</CardTitle>
                <CardDescription>External resources</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Verified external resources from official organizations.
            </p>
            <Button variant="outline" className="w-full min-h-[48px]">
              View Resources
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </CardContent>
        </Card>

        <Card 
          className="hover:border-primary/50 transition-colors cursor-pointer" 
          onClick={() => handleSectionChange('free-guides', 'faqs')}
        >
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <HelpCircle className="h-6 w-6 text-amber-700" />
              </div>
              <div>
                <CardTitle className="text-lg">FAQs</CardTitle>
                <CardDescription>Common questions</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Find answers to frequently asked questions.
            </p>
            <Button variant="outline" className="w-full min-h-[48px]">
              View FAQs
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
  const renderPlanningGuidesSection = () => (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">Planning Guides</h1>
        <p className="text-lg text-muted-foreground">
          Step-by-step resources to help you plan with confidence.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="hover:border-primary/50 transition-colors cursor-pointer" onClick={() => navigate('/guide')}>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">Step-by-Step Guide</CardTitle>
                <CardDescription>Learn before you fill out forms</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              A friendly walkthrough of the planning process, one step at a time.
            </p>
            <Button className="w-full min-h-[48px]">
              Start the Guide
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </CardContent>
        </Card>

      </div>
    </div>
  );

  // New: Combined Forms & Checklists overview
  const renderFormsChecklistsCombined = () => (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">Forms & Checklists</h1>
        <p className="text-lg text-muted-foreground">
          Printable documents to help you stay organized.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card 
          className="hover:border-primary/50 transition-colors cursor-pointer" 
          onClick={() => handleSectionChange('forms-checklists', 'checklists')}
        >
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-green-500/10 flex items-center justify-center">
                <CheckSquare className="h-6 w-6 text-green-700" />
              </div>
              <div>
                <CardTitle className="text-lg">Checklists</CardTitle>
                <CardDescription>Track what you've done</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Step-by-step checklists for pre-planning and after a loss.
            </p>
            <Button className="w-full min-h-[48px]">
              View Checklists
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </CardContent>
        </Card>

        <Card 
          className="hover:border-primary/50 transition-colors cursor-pointer" 
          onClick={() => handleSectionChange('forms-checklists', 'forms')}
        >
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <FileText className="h-6 w-6 text-blue-700" />
              </div>
              <div>
                <CardTitle className="text-lg">Printable Forms</CardTitle>
                <CardDescription>Download blank forms</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Forms and worksheets you can print and fill out by hand.
            </p>
            <Button variant="outline" className="w-full min-h-[48px]">
              View Forms
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  // New: Learn More overview section
  const renderLearnMoreOverview = () => (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">Learn More (Optional)</h1>
        <p className="text-lg text-muted-foreground">
          Additional resources and support when you need them.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card 
          className="hover:border-primary/50 transition-colors cursor-pointer" 
          onClick={() => handleSectionChange('learn-more', 'trusted-resources')}
        >
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <ExternalLink className="h-6 w-6 text-purple-700" />
              </div>
              <div>
                <CardTitle className="text-lg">Trusted Resources</CardTitle>
                <CardDescription>Government & consumer protection</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Verified external resources from official organizations.
            </p>
            <Button variant="outline" className="w-full min-h-[48px]">
              View Resources
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </CardContent>
        </Card>

        <Card 
          className="hover:border-primary/50 transition-colors cursor-pointer" 
          onClick={() => handleSectionChange('learn-more', 'support-help')}
        >
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Info className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">Support & Help</CardTitle>
                <CardDescription>Get help with the app</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Contact support or learn how to use the app.
            </p>
            <Button variant="outline" className="w-full min-h-[48px]">
              Get Help
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </CardContent>
        </Card>

        <Card 
          className="hover:border-primary/50 transition-colors cursor-pointer" 
          onClick={() => handleSectionChange('learn-more', 'faqs')}
        >
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <HelpCircle className="h-6 w-6 text-amber-700" />
              </div>
              <div>
                <CardTitle className="text-lg">FAQs</CardTitle>
                <CardDescription>Common questions answered</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Find answers to frequently asked questions.
            </p>
            <Button variant="outline" className="w-full min-h-[48px]">
              View FAQs
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  // Educational Resources Section - Read-only, no data collection
  const renderEducation = () => (
    <div className="space-y-8">
      {/* Top Disclaimer */}
      <LegalDisclaimer variant="compact" />
      
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">Educational Resources</h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          Learn about planning concepts and understand your options. This section is for reading only—no forms to fill out.
        </p>
      </div>

      {/* Legal & Medical Planning */}
      {(!activeSubItem || activeSubItem === 'legal-medical') && (
        <Card className="border-2 border-primary/20">
          <CardHeader>
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-block px-3 py-1 text-sm font-semibold bg-primary/10 text-primary rounded-full">
                ⚕️ Legal & Medical
              </span>
            </div>
            <CardTitle className="text-xl">Legal & Medical Planning</CardTitle>
            <CardDescription className="text-base leading-relaxed">
              Understanding your rights and medical documents.
            </CardDescription>
            <p className="text-sm font-medium text-muted-foreground mt-2">Common Questions & Answers</p>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full" defaultValue="advance-directive">
              <AccordionItem value="advance-directive" className="border-b-0">
                <AccordionTrigger className="text-left py-3 hover:no-underline">
                  <span className="font-semibold text-foreground">What is an Advance Directive?</span>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-base leading-relaxed pb-4">
                  An Advance Directive is a legal document that tells doctors what kind of medical treatment you want if you can't speak for yourself. It helps your family and doctors make decisions that match your wishes.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="dnr-polst" className="border-b-0">
                <AccordionTrigger className="text-left py-3 hover:no-underline">
                  <span className="font-semibold text-foreground">DNR vs POLST</span>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-base leading-relaxed pb-4">
                  A DNR (Do Not Resuscitate) order tells medical staff not to perform CPR. A POLST (Physician Orders for Life-Sustaining Treatment) is a broader form that covers more medical decisions and is signed by your doctor.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="healthcare-proxy" className="border-b-0">
                <AccordionTrigger className="text-left py-3 hover:no-underline">
                  <span className="font-semibold text-foreground">Why naming a Healthcare Proxy matters</span>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-base leading-relaxed pb-4">
                  A Healthcare Proxy (also called Healthcare Agent) is someone you choose to make medical decisions for you. Without one, your family may disagree about your care, or a court may have to decide.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>
      )}

      {/* Funeral Planning */}
      {(!activeSubItem || activeSubItem === 'funeral-planning') && (
        <Card className="border-2 border-amber-500/20">
          <CardHeader>
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-block px-3 py-1 text-sm font-semibold bg-amber-500/10 text-amber-700 rounded-full">
                🕊️ Funeral Planning
              </span>
            </div>
            <CardTitle className="text-xl">Funeral Planning Basics</CardTitle>
            <CardDescription className="text-base leading-relaxed">
              Understanding your options for final arrangements.
            </CardDescription>
            <p className="text-sm font-medium text-muted-foreground mt-2">Common Questions & Answers</p>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full" defaultValue="burial-cremation">
              <AccordionItem value="burial-cremation" className="border-b-0">
                <AccordionTrigger className="text-left py-3 hover:no-underline">
                  <span className="font-semibold text-foreground">Burial vs Cremation</span>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-base leading-relaxed pb-4">
                  Burial involves placing the body in a casket and burying it in a cemetery. Cremation uses heat to reduce the body to ashes, which can be kept in an urn, scattered, or buried. Both are respectful options.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="casket-urn" className="border-b-0">
                <AccordionTrigger className="text-left py-3 hover:no-underline">
                  <span className="font-semibold text-foreground">Casket and Urn Basics</span>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-base leading-relaxed pb-4">
                  Caskets range from simple wood to elaborate metal designs. Urns can be made of ceramic, wood, metal, or biodegradable materials. You are NOT required to buy from a funeral home—you can shop elsewhere.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="planning-ahead" className="border-b-0">
                <AccordionTrigger className="text-left py-3 hover:no-underline">
                  <span className="font-semibold text-foreground">Planning Ahead vs Last-Minute Decisions</span>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-base leading-relaxed pb-4">
                  Planning ahead gives you time to research options, compare prices, and make thoughtful decisions. Last-minute arrangements often cost more and add stress to grieving families.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>
      )}

      {/* Digital & Organization */}
      {(!activeSubItem || activeSubItem === 'digital-organization') && (
        <Card className="border-2 border-blue-500/20">
          <CardHeader>
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-block px-3 py-1 text-sm font-semibold bg-blue-500/10 text-blue-700 rounded-full">
                💻 Digital & Organization
              </span>
            </div>
            <CardTitle className="text-xl">Digital Assets & Organization</CardTitle>
            <CardDescription className="text-base leading-relaxed">
              Keeping important information organized.
            </CardDescription>
            <p className="text-sm font-medium text-muted-foreground mt-2">Common Questions & Answers</p>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full" defaultValue="document-lists">
              <AccordionItem value="document-lists" className="border-b-0">
                <AccordionTrigger className="text-left py-3 hover:no-underline">
                  <span className="font-semibold text-foreground">Why Document Lists Matter</span>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-base leading-relaxed pb-4">
                  When a loved one passes, families often spend weeks searching for important papers—wills, insurance policies, deeds. A simple list of where things are kept saves time and reduces stress.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="common-challenges" className="border-b-0">
                <AccordionTrigger className="text-left py-3 hover:no-underline">
                  <span className="font-semibold text-foreground">Common Challenges Families Face</span>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-base leading-relaxed pb-4">
                  Not knowing bank account numbers. Missing passwords. Unable to find the will. Not knowing who to notify. A little preparation prevents all of these problems.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>
      )}

      {/* Travel Protection */}
      {(!activeSubItem || activeSubItem === 'travel-protection') && (
        <Card className="border-2 border-green-500/20">
          <CardHeader>
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-block px-3 py-1 text-sm font-semibold bg-green-500/10 text-green-700 rounded-full">
                ✈️ Travel Protection
              </span>
            </div>
            <CardTitle className="text-xl">Travel Protection</CardTitle>
            <CardDescription className="text-base leading-relaxed">
              What happens if death occurs away from home.
            </CardDescription>
            <p className="text-sm font-medium text-muted-foreground mt-2">Common Questions & Answers</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <Accordion type="single" collapsible className="w-full" defaultValue="death-away">
              <AccordionItem value="death-away" className="border-b-0">
                <AccordionTrigger className="text-left py-3 hover:no-underline">
                  <span className="font-semibold text-foreground">What Happens If Death Occurs Away from Home</span>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-base leading-relaxed pb-4">
                  If someone dies while traveling—whether in another state or country—the family must arrange to have the body transported home. This can cost thousands of dollars and involves complex paperwork.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="transport-coverage" className="border-b-0">
                <AccordionTrigger className="text-left py-3 hover:no-underline">
                  <span className="font-semibold text-foreground">Transport Coverage Basics</span>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-base leading-relaxed pb-4">
                  Some travel insurance and memberships include repatriation coverage, which pays to transport remains back home. Always check what your policy covers before traveling.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="ask-providers" className="border-b-0">
                <AccordionTrigger className="text-left py-3 hover:no-underline">
                  <span className="font-semibold text-foreground">What to Ask Providers</span>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-base leading-relaxed pb-4">
                  Ask about: coverage limits, what countries are included, what documentation is needed, and whether cremation abroad is covered if you prefer it.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
            <div className="pt-4">
              <Link to="/travel-protection">
                <Button size="lg" variant="outline" className="min-h-[52px] gap-2">
                  Learn More About Travel Protection
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );

  // Planning Guides Section - Using PDF with fallback instead of Gamma embeds
  const renderPlanningGuides = () => (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">Planning Guides</h1>
        <p className="text-lg text-muted-foreground">
          Educational guides to help you understand the planning process.
        </p>
      </div>

      {/* Pre-Planning Guide - PDF-based for reliability */}
      <Card className="border-2 border-primary/20">
        <CardHeader>
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-block px-3 py-1 text-sm font-semibold bg-primary/10 text-primary rounded-full">
              📋 Pre-Planning
            </span>
          </div>
          <CardTitle className="text-xl">Pre-Planning Guide</CardTitle>
          <CardDescription className="text-base leading-relaxed">
            A comprehensive guide to help you plan ahead and give your family peace of mind. 
            You can read it online, download it, or print it.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* PDF Preview */}
          <div className="w-full rounded-lg border border-border overflow-hidden bg-muted/30">
            <iframe 
              src="/guides/Pre-Planning-Guide.pdf"
              style={{ width: '100%', height: '500px' }}
              title="Pre-Planning Guide" 
              className="w-full"
            />
          </div>
          
          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <a 
              href="/guides/Pre-Planning-Guide.pdf" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex-1"
            >
              <Button className="w-full min-h-[52px] text-base gap-2">
                <Eye className="h-5 w-5" />
                View or Print Guide
              </Button>
            </a>
            <a 
              href="/guides/Pre-Planning-Guide.pdf" 
              download="Pre-Planning-Guide.pdf"
              className="flex-1"
            >
              <Button variant="outline" className="w-full min-h-[52px] text-base gap-2">
                <Download className="h-5 w-5" />
                Download Printable Copy
              </Button>
            </a>
          </div>
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
          Step-by-step checklists to help you stay organized.
        </p>
      </div>

      {/* Pre-Planning Checklist - PDF-based for reliability */}
      {(!activeSubItem || activeSubItem === 'pre-planning') && (
        <Card className="border-2 border-primary/20">
          <CardHeader>
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-block px-3 py-1 text-sm font-semibold bg-primary/10 text-primary rounded-full">
                ✅ Pre-Planning
              </span>
            </div>
            <CardTitle className="text-xl">Pre-Planning Checklist</CardTitle>
            <CardDescription className="text-base leading-relaxed">
              Everything you need to prepare ahead of time for peace of mind. 
              You can read it online, download it, or print it.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Image Preview - only renders if image exists */}
            <div className="w-full rounded-lg border border-border overflow-hidden bg-muted/30">
              <img 
                src="/checklists/Pre-Planning-Checklist-4.png"
                alt="Pre-Planning Checklist Preview"
                className="w-full h-auto"
                onError={(e) => {
                  // Hide the entire preview container if image fails
                  const container = e.currentTarget.parentElement;
                  if (container) container.style.display = 'none';
                }}
              />
            </div>
            
            {/* Action Button */}
            <div className="flex flex-col sm:flex-row gap-4">
              <a 
                href="/guides/EFA-Pre-Planning-Checklist.pdf" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex-1"
              >
                <Button className="w-full min-h-[52px] text-base gap-2">
                  <Eye className="h-5 w-5" />
                  View or Download Checklist
                </Button>
              </a>
            </div>
          </CardContent>
        </Card>
      )}

      {/* After-Death Checklist - Uses PDF generator */}
      {(!activeSubItem || activeSubItem === 'after-death') && (
        <Card className="border-2 border-blue-500/20">
          <CardHeader>
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-block px-3 py-1 text-sm font-semibold bg-blue-500/10 text-blue-700 rounded-full">
                📋 After Death
              </span>
            </div>
            <CardTitle className="text-xl">After-Death Checklist</CardTitle>
            <CardDescription className="text-base leading-relaxed">
              A timeline-based checklist for loved ones, executors, or trusted contacts. 
              Organized by: first 24-48 hours, first week, first month, and 3-12 months.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Image Preview - only renders if image exists */}
            <div className="w-full rounded-lg border border-border overflow-hidden bg-muted/30">
              <img 
                src="/checklists/After-Death-Checklist-3.png"
                alt="After-Death Checklist Preview"
                className="w-full h-auto"
                onError={(e) => {
                  // Hide the entire preview container if image fails
                  const container = e.currentTarget.parentElement;
                  if (container) container.style.display = 'none';
                }}
              />
            </div>
            
            {/* Action Button - Uses PDF Generator */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                className="flex-1 min-h-[52px] text-base gap-2"
                onClick={handleDownloadAfterDeathChecklist}
                disabled={isGeneratingAfterDeath}
              >
                <Download className="h-5 w-5" />
                {isGeneratingAfterDeath ? 'Generating...' : 'Download After-Death Checklist'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

    </div>
  );

  // Forms & Worksheets Section - Senior-friendly card layout
  const renderFormsWorksheets = () => {
    // Document card component for consistent styling
    const DocumentCard = ({ 
      title, 
      description, 
      tags, 
      href, 
      isComingSoon = false 
    }: { 
      title: string; 
      description: string; 
      tags: string[]; 
      href: string;
      isComingSoon?: boolean;
    }) => (
      <Card className={cn("h-full", isComingSoon && "border-dashed opacity-75")}>
        <CardHeader className="pb-3">
          {!isComingSoon && (
            <div className="flex flex-wrap gap-2 mb-3">
              {tags.map((tag, idx) => (
                <span 
                  key={idx}
                  className={cn(
                    "inline-block px-3 py-1 text-xs font-semibold rounded-full",
                    tag === 'Fillable' && "bg-blue-500/10 text-blue-700",
                    tag === 'Printable' && "bg-green-500/10 text-green-700",
                    tag === 'Before Death' && "bg-primary/10 text-primary",
                    tag === 'After Death' && "bg-amber-500/10 text-amber-700",
                    tag === 'Reference' && "bg-purple-500/10 text-purple-700"
                  )}
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
          <div className="flex items-center gap-2">
            <CardTitle className={cn("text-lg", isComingSoon && "text-muted-foreground")}>{title}</CardTitle>
            {isComingSoon && <span className="text-xs text-muted-foreground font-normal">(Coming Soon)</span>}
          </div>
          {!isComingSoon && <CardDescription className="text-base">{description}</CardDescription>}
        </CardHeader>
        <CardContent>
          {isComingSoon ? (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                We're still working on this section. It will be available soon.
              </p>
              <Button variant="outline" className="w-full min-h-[48px]" disabled>
                Coming Soon
              </Button>
            </div>
          ) : (
            <>
              <a 
                href={href} 
                target="_blank" 
                rel="noopener noreferrer"
                className="block"
              >
                <Button className="w-full min-h-[48px] gap-2">
                  <ExternalLink className="h-4 w-4" />
                  Open or Download
                  <span className="text-xs opacity-75">(Opens in a new tab)</span>
                </Button>
              </a>
              <p className="text-sm text-muted-foreground text-center mt-2">
                You can print or save this document.
              </p>
            </>
          )}
        </CardContent>
      </Card>
    );

    return (
      <div className="space-y-10">
        {/* Page Header */}
        <div className="bg-muted/30 rounded-xl p-6 border border-border">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">Forms & Worksheets</h1>
          <p className="text-xl text-muted-foreground mb-3">
            Printable and fillable documents you can save, print, or share.
          </p>
          <p className="text-base text-muted-foreground">
            These forms help you write things down and keep them organized. You can fill them out online or print them and complete them by hand.
          </p>
        </div>

        {/* Essential Planning Forms */}
        <div>
          <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Essential Planning Forms
          </h2>
          <p className="text-muted-foreground mb-6">
            These are the main documents most people need.
          </p>
          
          <div className="grid gap-6 md:grid-cols-2">
            <DocumentCard
              title="My Final Wishes Form"
              description="Record your preferences for funeral arrangements and personal wishes."
              tags={['Fillable', 'Printable', 'Before Death']}
              href="/templates/My-Final-Wishes-Blank-Form-2025-11-17.pdf"
            />
            <DocumentCard
              title="Pre-Planning Worksheet"
              description="Organize all your important information in one place."
              tags={['Fillable', 'Printable', 'Before Death']}
              href="/guides/EFA-Pre-Planning-Checklist.pdf"
            />
            <DocumentCard
              title="My End-of-Life Decisions Guide"
              description="A comprehensive guide to help you think through important decisions."
              tags={['Reference', 'Before Death']}
              href="/guides/My-End-of-Life-Decisions-Guide.pdf"
            />
            <DocumentCard
              title="Personal Information Summary"
              description="Keep all your vital information together for your loved ones."
              tags={['Fillable', 'Printable', 'Before Death']}
              isComingSoon={true}
              href=""
            />
            <DocumentCard
              title="Emergency Contacts Sheet"
              description="A simple form to list important contacts in one place."
              tags={['Printable', 'Before Death']}
              isComingSoon={true}
              href=""
            />
          </div>
        </div>

        {/* Additional Worksheets */}
        <div>
          <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            Additional Worksheets
          </h2>
          <p className="text-muted-foreground mb-6">
            Helpful extras and optional planning tools.
          </p>
          
          <div className="grid gap-6 md:grid-cols-2">
            <DocumentCard
              title="Discussing Death Guide"
              description="Tips and conversation starters for talking with loved ones."
              tags={['Reference', 'Before Death']}
              href="/guides/Discussing-Death-Guide.pdf"
            />
            <DocumentCard
              title="Know Your Rights (FTC Funeral Rule)"
              description="Learn about consumer protections when arranging a funeral."
              tags={['Reference', 'Before Death', 'After Death']}
              href="/guides/Know-Your-Rights-When-Arranging-a-Funeral.pdf"
            />
            <DocumentCard
              title="Complying with the Funeral Rule"
              description="Detailed information about FTC regulations for funeral services."
              tags={['Reference']}
              href="/guides/Complying-with-the-Funeral-Rule.pdf"
            />
            <DocumentCard
              title="After-Death Planner & Checklist"
              description="A step-by-step checklist for families after a loss."
              tags={['Printable', 'After Death']}
              href="/guides/EFA-After-Death-Planner-and-Checklist.pdf"
            />
          </div>
        </div>

        {/* Quick link to fillable forms page */}
        <Card className="border-2 border-primary/20">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-foreground mb-1">Looking for More Forms?</h3>
                <p className="text-muted-foreground">
                  Visit our dedicated forms page for additional blank and guided walkthrough forms.
                </p>
              </div>
              <Link to="/forms">
                <Button variant="outline" className="min-h-[48px] gap-2">
                  <FileText className="h-4 w-4" />
                  View All Forms
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

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
                  <span className="text-xs text-muted-foreground font-normal">(Opens in a new tab)</span>
                </a>
                <p className="text-sm text-muted-foreground mt-1">Information for veterans and their families</p>
              </li>
              <li>
              <a href="https://www.ssa.gov/benefits/survivors/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-primary hover:underline">
                  <ExternalLink className="h-4 w-4 shrink-0" />
                  Social Security Survivor Benefits
                  <span className="text-xs text-muted-foreground font-normal">(Opens in a new tab)</span>
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
                  <span className="text-xs text-muted-foreground font-normal">(Opens in a new tab)</span>
                </a>
                <p className="text-sm text-muted-foreground mt-1">Official guidance on planning and your rights</p>
              </li>
              <li>
              <a href="https://funerals.org" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-primary hover:underline">
                  <ExternalLink className="h-4 w-4 shrink-0" />
                  Funeral Consumers Alliance
                  <span className="text-xs text-muted-foreground font-normal">(Opens in a new tab)</span>
                </a>
                <p className="text-sm text-muted-foreground mt-1">Non-profit consumer advocacy organization</p>
              </li>
              <li>
              <a href="https://reportfraud.ftc.gov" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-primary hover:underline">
                  <ExternalLink className="h-4 w-4 shrink-0" />
                  Report Fraud (FTC)
                  <span className="text-xs text-muted-foreground font-normal">(Opens in a new tab)</span>
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
              <Button size="lg" className="min-h-[48px]">Open Claire</Button>
            </Link>
            <Link to="/faq">
              <Button size="lg" variant="outline" className="min-h-[48px]">See FAQs & Guides</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <GlobalHeader minimal />
      
      {/* Page Header - Clean and focused */}
      <div className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-foreground">Resources & Help</h1>
              <p className="text-sm text-muted-foreground">
                Use the menu on the left to choose a topic, or open a section below to read common questions and answers.
              </p>
            </div>
            <TextSizeToggle />
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

      {/* FAQ Access Section */}
      <div className="bg-muted/30 border-t border-border py-8">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-xl font-semibold text-foreground mb-4">Looking for a specific question?</h2>
          <Link to="/faq">
            <Button size="lg" className="min-h-[52px] gap-2">
              <HelpCircle className="h-5 w-5" />
              View All Frequently Asked Questions
            </Button>
          </Link>
        </div>
      </div>
      
      <AppFooter />

      {/* Callback Request Dialog */}
      <CallbackRequestDialog 
        open={isCallbackDialogOpen} 
        onOpenChange={setIsCallbackDialogOpen} 
      />
    </div>
  );
};

export default Resources;
