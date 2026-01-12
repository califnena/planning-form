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
  Calculator, ChevronRight, CheckSquare, BookOpen, Info
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
      title: "Step-by-Step Guide",
      description: "Learn before you fill",
      icon: BookOpen,
      onClick: () => navigate('/guide'),
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
      onClick: () => handleSectionChange('forms-worksheets'),
      color: "bg-blue-500/10 text-blue-700"
    },
  ];

  const renderContent = () => {
    switch (activeSection) {
      case 'education':
        return renderEducation();
      case 'checklists':
        return renderChecklists();
      case 'forms-worksheets':
        return renderFormsWorksheets();
      case 'tools-calculators':
        return renderToolsCalculators();
      case 'trusted-resources':
        return renderTrustedResources();
      case 'support-help':
        return renderSupportHelp();
      default:
        return renderEducation();
    }
  };

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
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4">
              <div className="p-4 bg-muted/30 rounded-lg">
                <h4 className="font-semibold text-foreground mb-2">What is an Advance Directive?</h4>
                <p className="text-muted-foreground text-base leading-relaxed">
                  An Advance Directive is a legal document that tells doctors what kind of medical treatment you want if you can't speak for yourself. It helps your family and doctors make decisions that match your wishes.
                </p>
              </div>
              <div className="p-4 bg-muted/30 rounded-lg">
                <h4 className="font-semibold text-foreground mb-2">DNR vs POLST</h4>
                <p className="text-muted-foreground text-base leading-relaxed">
                  A DNR (Do Not Resuscitate) order tells medical staff not to perform CPR. A POLST (Physician Orders for Life-Sustaining Treatment) is a broader form that covers more medical decisions and is signed by your doctor.
                </p>
              </div>
              <div className="p-4 bg-muted/30 rounded-lg">
                <h4 className="font-semibold text-foreground mb-2">Why naming a Healthcare Proxy matters</h4>
                <p className="text-muted-foreground text-base leading-relaxed">
                  A Healthcare Proxy (also called Healthcare Agent) is someone you choose to make medical decisions for you. Without one, your family may disagree about your care, or a court may have to decide.
                </p>
              </div>
            </div>
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
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4">
              <div className="p-4 bg-muted/30 rounded-lg">
                <h4 className="font-semibold text-foreground mb-2">Burial vs Cremation</h4>
                <p className="text-muted-foreground text-base leading-relaxed">
                  Burial involves placing the body in a casket and burying it in a cemetery. Cremation uses heat to reduce the body to ashes, which can be kept in an urn, scattered, or buried. Both are respectful options.
                </p>
              </div>
              <div className="p-4 bg-muted/30 rounded-lg">
                <h4 className="font-semibold text-foreground mb-2">Casket and Urn Basics</h4>
                <p className="text-muted-foreground text-base leading-relaxed">
                  Caskets range from simple wood to elaborate metal designs. Urns can be made of ceramic, wood, metal, or biodegradable materials. You are NOT required to buy from a funeral home—you can shop elsewhere.
                </p>
              </div>
              <div className="p-4 bg-muted/30 rounded-lg">
                <h4 className="font-semibold text-foreground mb-2">Planning Ahead vs Last-Minute Decisions</h4>
                <p className="text-muted-foreground text-base leading-relaxed">
                  Planning ahead gives you time to research options, compare prices, and make thoughtful decisions. Last-minute arrangements often cost more and add stress to grieving families.
                </p>
              </div>
            </div>
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
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4">
              <div className="p-4 bg-muted/30 rounded-lg">
                <h4 className="font-semibold text-foreground mb-2">Why Document Lists Matter</h4>
                <p className="text-muted-foreground text-base leading-relaxed">
                  When a loved one passes, families often spend weeks searching for important papers—wills, insurance policies, deeds. A simple list of where things are kept saves time and reduces stress.
                </p>
              </div>
              <div className="p-4 bg-muted/30 rounded-lg">
                <h4 className="font-semibold text-foreground mb-2">Common Challenges Families Face</h4>
                <p className="text-muted-foreground text-base leading-relaxed">
                  Not knowing bank account numbers. Missing passwords. Unable to find the will. Not knowing who to notify. A little preparation prevents all of these problems.
                </p>
              </div>
            </div>
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
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4">
              <div className="p-4 bg-muted/30 rounded-lg">
                <h4 className="font-semibold text-foreground mb-2">What Happens If Death Occurs Away from Home</h4>
                <p className="text-muted-foreground text-base leading-relaxed">
                  If someone dies while traveling—whether in another state or country—the family must arrange to have the body transported home. This can cost thousands of dollars and involves complex paperwork.
                </p>
              </div>
              <div className="p-4 bg-muted/30 rounded-lg">
                <h4 className="font-semibold text-foreground mb-2">Transport Coverage Basics</h4>
                <p className="text-muted-foreground text-base leading-relaxed">
                  Some travel insurance and memberships include repatriation coverage, which pays to transport remains back home. Always check what your policy covers before traveling.
                </p>
              </div>
              <div className="p-4 bg-muted/30 rounded-lg">
                <h4 className="font-semibold text-foreground mb-2">What to Ask Providers</h4>
                <p className="text-muted-foreground text-base leading-relaxed">
                  Ask about: coverage limits, what countries are included, what documentation is needed, and whether cremation abroad is covered if you prefer it.
                </p>
              </div>
            </div>
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

      {/* When Death Happens Guide - PDF-based for reliability */}
      <Card className="border-2 border-amber-500/20">
        <CardHeader>
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-block px-3 py-1 text-sm font-semibold bg-amber-500/10 text-amber-700 rounded-full">
              🕊️ After a Loss
            </span>
          </div>
          <CardTitle className="text-xl">When Death Happens: After-Death Planner Guide</CardTitle>
          <CardDescription className="text-base leading-relaxed">
            Step-by-step guidance for families navigating the first days and weeks after losing a loved one.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* PDF Preview */}
          <div className="w-full rounded-lg border border-border overflow-hidden bg-muted/30">
            <iframe 
              src="/guides/Everlasting-Funeral-Advisors-Guide.pdf"
              style={{ width: '100%', height: '500px' }}
              title="After-Death Planner Guide" 
              className="w-full"
            />
          </div>
          
          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <a 
              href="/guides/Everlasting-Funeral-Advisors-Guide.pdf" 
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
              href="/guides/Everlasting-Funeral-Advisors-Guide.pdf" 
              download="After-Death-Planner-Guide.pdf"
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
          Step-by-step checklists to help you track your progress and stay organized.
        </p>
      </div>

      {/* Pre-Planning Checklist - PDF-based for reliability */}
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
          {/* PDF Preview */}
          <div className="w-full rounded-lg border border-border overflow-hidden bg-muted/30">
            <iframe 
              src="/guides/EFA-Pre-Planning-Checklist.pdf"
              style={{ width: '100%', height: '500px' }}
              title="Pre-Planning Checklist" 
              className="w-full"
            />
          </div>
          
          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <a 
              href="/guides/EFA-Pre-Planning-Checklist.pdf" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex-1"
            >
              <Button className="w-full min-h-[52px] text-base gap-2">
                <Eye className="h-5 w-5" />
                View or Print Checklist
              </Button>
            </a>
            <a 
              href="/guides/EFA-Pre-Planning-Checklist.pdf" 
              download="Pre-Planning-Checklist.pdf"
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

      {/* After-Death Checklist - PDF-based for reliability */}
      <Card className="border-2 border-amber-500/20">
        <CardHeader>
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-block px-3 py-1 text-sm font-semibold bg-amber-500/10 text-amber-700 rounded-full">
              📝 After a Loss
            </span>
          </div>
          <CardTitle className="text-xl">After-Death Planner & Checklist</CardTitle>
          <CardDescription className="text-base leading-relaxed">
            This checklist guides loved ones step by step after a death. You can read it online, download it, or print it.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* PDF Preview */}
          <div className="w-full rounded-lg border border-border overflow-hidden bg-muted/30">
            <iframe 
              src="/guides/EFA-After-Death-Planner-and-Checklist.pdf"
              style={{ width: '100%', height: '500px' }}
              title="After-Death Planner & Checklist" 
              className="w-full"
            />
          </div>
          
          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <a 
              href="/guides/EFA-After-Death-Planner-and-Checklist.pdf" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex-1"
            >
              <Button className="w-full min-h-[52px] text-base gap-2">
                <Eye className="h-5 w-5" />
                View or Print Checklist
              </Button>
            </a>
            <a 
              href="/guides/EFA-After-Death-Planner-and-Checklist.pdf" 
              download="After-Death-Planner-and-Checklist.pdf"
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
          <CardTitle className="text-lg">{title}</CardTitle>
          <CardDescription className="text-base">{description}</CardDescription>
        </CardHeader>
        <CardContent>
          {isComingSoon ? (
            <Button variant="outline" className="w-full min-h-[48px]" disabled>
              Coming Soon
            </Button>
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
