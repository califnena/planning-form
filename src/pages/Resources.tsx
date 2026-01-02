import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { TextSizeToggle } from '@/components/TextSizeToggle';
import { ExternalLink, FileText, Download, Search } from 'lucide-react';
import { GlobalHeader } from '@/components/GlobalHeader';
import { AppFooter } from '@/components/AppFooter';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ResourcesDownloadSection } from '@/components/resources/ResourcesDownloadSection';
import { ResourcesSidebar, resourceSections } from '@/components/resources/ResourcesSidebar';
import { Input } from '@/components/ui/input';

const Resources = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeSection, setActiveSection] = useState(searchParams.get('section') || 'getting-started');
  const [activeSubItem, setActiveSubItem] = useState<string | undefined>(searchParams.get('sub') || undefined);
  const [faqSearch, setFaqSearch] = useState('');

  // Update URL when section changes
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

  // Legacy resource sections data
  const legacyResourceSections = [{
    title: "Funeral Planning Essentials",
    icon: "🕊️",
    description: "Basics for understanding funeral decisions, legal requirements, and consumer rights.",
    items: [{
      name: "Know Your Rights Under the Funeral Rule (FTC)",
      description: "The FTC Funeral Rule protects consumers when arranging funerals. You have the right to: receive a General Price List, choose only the services you want, buy caskets/urns from any seller, and decline embalming in most cases. Report concerns to the FTC at reportfraud.ftc.gov.",
      link: "/guides/Complying-with-the-Funeral-Rule.pdf",
      isDownload: true
    }, {
      name: "FTC Funeral Consumer Guide",
      description: "Official guidance on planning your own funeral, comparing prices, and avoiding scams.",
      link: "https://consumer.ftc.gov/articles/planning-your-own-funeral"
    }, {
      name: "General Price List (GPL) Guide",
      description: "Funeral homes must provide a GPL showing itemized prices. Use it to compare costs between providers. The GPL must include prices for basic services, caskets, urns, embalming, viewing, and ceremony options."
    }, {
      name: "Burial vs Cremation Summary",
      description: "Burial typically costs $7,000-$12,000+ (includes casket, plot, vault, service). Cremation typically costs $1,000-$3,000 (direct cremation) or $4,000-$7,000 (with service). Consider: religious requirements, family preferences, environmental factors, and geographic location."
    }, {
      name: "Casket & Urn Shopping Tips",
      description: "You have the right to buy a casket or urn anywhere (online, warehouse stores) and bring it to the funeral home. The funeral home cannot charge a handling fee. Compare prices carefully—markups can be 300-500%."
    }]
  }, {
    title: "Financial & Legal Resources",
    icon: "💰",
    description: "Straightforward tools for managing beneficiaries, estate basics, insurance, and probate.",
    items: [{
      name: "Payable-on-Death (POD) Overview",
      description: "A POD beneficiary on a bank account receives the money directly when you die, bypassing probate. To set up: ask your bank for a POD form, list the person's full name, and return it. Usually free and one of the simplest ways to help loved ones access cash quickly."
    }, {
      name: "Transfer-on-Death (TOD) for Investments",
      description: "TOD designations on brokerage accounts work like POD for bank accounts. Assets transfer directly to named beneficiaries without probate. Contact your brokerage to add TOD beneficiaries to stocks, bonds, and mutual funds."
    }, {
      name: "Starter Guide: Wills vs. Living Trusts",
      description: "A will goes through probate court and becomes public. A living trust avoids probate, stays private, and takes effect if you become incapacitated. Trusts cost more upfront but can save time and money later. Consult an attorney to decide what's best for your situation."
    }, {
      name: "Life Insurance 101",
      description: "Keep policy documents accessible. Beneficiaries need: policy number, insurer contact info, and death certificate. Most policies pay within 30-60 days of claim. Review beneficiaries annually—especially after marriage, divorce, births, or deaths."
    }, {
      name: "Safe Deposit Box Guide",
      description: "Safe deposit boxes are sealed upon death in some states. Don't store your will there—keep it with your attorney or in a home safe. Good for: jewelry, deeds, titles, bonds. Bad for: items needed immediately after death."
    }]
  }];

  // Render content based on active section
  const renderContent = () => {
    switch (activeSection) {
      case 'getting-started':
        return renderGettingStarted();
      case 'planning-guides':
        return renderPlanningGuides();
      case 'forms-worksheets':
        return renderFormsWorksheets();
      case 'faqs':
        return renderFAQs();
      case 'learn-library':
        return renderLearnLibrary();
      case 'events-workshops':
        return renderEventsWorkshops();
      case 'tools-calculators':
        return renderToolsCalculators();
      case 'support-help':
        return renderSupportHelp();
      default:
        return renderGettingStarted();
    }
  };

  const renderGettingStarted = () => (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">Getting Started</h1>
        <p className="text-muted-foreground">
          Welcome! This section helps you understand how this app works and where to begin.
        </p>
      </div>

      <div className="bg-card border border-border rounded-xl p-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <span>🎯</span> Overview
        </h2>
        <p className="text-muted-foreground mb-4">
          This app helps you organize your end-of-life plans in one place. Whether you're planning ahead
          or helping a family member after a loss, everything you need is here.
        </p>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="bg-muted/30 rounded-lg p-4">
            <h3 className="font-medium mb-2">Plan Ahead</h3>
            <p className="text-sm text-muted-foreground">
              Document your wishes, organize important contacts, and give your family peace of mind.
            </p>
          </div>
          <div className="bg-muted/30 rounded-lg p-4">
            <h3 className="font-medium mb-2">After a Death</h3>
            <p className="text-sm text-muted-foreground">
              Step-by-step guidance for what to do in the first days and weeks after losing someone.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl p-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <span>📖</span> How This App Works
        </h2>
        <ol className="space-y-3 text-muted-foreground">
          <li className="flex gap-3">
            <span className="bg-primary/10 text-primary font-medium rounded-full w-6 h-6 flex items-center justify-center text-sm shrink-0">1</span>
            <span>Create an account to save your progress securely</span>
          </li>
          <li className="flex gap-3">
            <span className="bg-primary/10 text-primary font-medium rounded-full w-6 h-6 flex items-center justify-center text-sm shrink-0">2</span>
            <span>Choose which sections you want to complete (you can skip any)</span>
          </li>
          <li className="flex gap-3">
            <span className="bg-primary/10 text-primary font-medium rounded-full w-6 h-6 flex items-center justify-center text-sm shrink-0">3</span>
            <span>Answer questions at your own pace — save and come back anytime</span>
          </li>
          <li className="flex gap-3">
            <span className="bg-primary/10 text-primary font-medium rounded-full w-6 h-6 flex items-center justify-center text-sm shrink-0">4</span>
            <span>Download or share your summary with loved ones</span>
          </li>
        </ol>
      </div>

      <div className="bg-card border border-border rounded-xl p-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <span>✅</span> What To Do First
        </h2>
        <ul className="space-y-2 text-muted-foreground">
          <li className="flex items-start gap-2">
            <span className="text-primary">•</span>
            Start with the sections that feel most important to you
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary">•</span>
            Don't worry about completing everything — progress is saved automatically
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary">•</span>
            If you need help, Claire (our assistant) is available anytime
          </li>
        </ul>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-amber-800">
          <span>⚠️</span> Common Mistakes to Avoid
        </h2>
        <ul className="space-y-2 text-amber-700">
          <li className="flex items-start gap-2">
            <span>•</span>
            <span><strong>Trying to do everything at once</strong> — take breaks, this isn't urgent</span>
          </li>
          <li className="flex items-start gap-2">
            <span>•</span>
            <span><strong>Not telling anyone</strong> — make sure at least one person knows this exists</span>
          </li>
          <li className="flex items-start gap-2">
            <span>•</span>
            <span><strong>Skipping the basics</strong> — start with contacts and simple wishes first</span>
          </li>
        </ul>
      </div>
    </div>
  );

  const renderPlanningGuides = () => (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">Planning Guides</h1>
        <p className="text-muted-foreground">
          Educational content to help you make informed decisions.
        </p>
      </div>

      {/* Featured Guide */}
      <div className="bg-card border-2 border-primary/20 rounded-lg p-6 shadow-lg">
        <div className="mb-4">
          <span className="inline-block px-3 py-1 text-xs font-semibold bg-primary/10 text-primary rounded-full mb-2">
            📖 Featured Guide
          </span>
          <h2 className="text-xl font-bold text-foreground">
            Planning Your Funeral: A Gift of Peace & Clarity
          </h2>
        </div>
        <div className="flex justify-center">
          <iframe 
            src="https://gamma.app/embed/rwk4xlwaixs6gbj" 
            style={{ width: '700px', maxWidth: '100%', height: '450px' }}
            allow="fullscreen" 
            title="Planning Your Funeral: A Gift of Peace & Clarity" 
            className="rounded-lg border border-border" 
          />
        </div>
      </div>

      {legacyResourceSections.map((section, idx) => (
        <div key={idx} className="bg-card border border-border rounded-xl shadow-sm p-5 md:p-6">
          <h2 className="text-lg md:text-xl font-semibold text-foreground mb-2 flex items-center gap-3">
            <span className="text-2xl" aria-hidden="true">{section.icon}</span>
            {section.title}
          </h2>
          <p className="text-sm md:text-base text-muted-foreground mb-4">{section.description}</p>
          
          <Accordion type="single" collapsible className="w-full">
            {section.items.map((item, itemIndex) => (
              <AccordionItem key={itemIndex} value={`section-${idx}-item-${itemIndex}`} className="border-b last:border-b-0">
                <AccordionTrigger className="text-left text-sm md:text-base font-semibold text-foreground py-3 hover:no-underline">
                  {item.name}
                </AccordionTrigger>
                <AccordionContent className="text-sm md:text-base text-muted-foreground pb-3">
                  <div className="space-y-2">
                    <p>{item.description}</p>
                    {item.link && (item.isDownload ? 
                      <a href={item.link} download className="text-primary hover:underline inline-flex items-center gap-1 font-medium">
                        Download PDF <Download className="h-3 w-3" />
                      </a> : 
                      <a href={item.link} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-1 font-medium">
                        Visit resource <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      ))}
    </div>
  );

  const renderFormsWorksheets = () => (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">Forms & Worksheets</h1>
        <p className="text-muted-foreground">
          Printable forms, checklists, and downloadable resources.
        </p>
      </div>

      <ResourcesDownloadSection />

      {/* Checklists Section */}
      <div className="bg-card border-2 border-primary/20 rounded-xl p-6 shadow-lg">
        <div className="mb-6">
          <span className="inline-block px-3 py-1 text-xs font-semibold bg-primary/10 text-primary rounded-full mb-2">
            ✅ Interactive Checklists
          </span>
          <h2 className="text-xl font-bold text-foreground">
            Planning Checklists
          </h2>
          <p className="text-muted-foreground mt-2">
            Step-by-step checklists to guide you through the planning process.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Pre-Planning Checklist */}
          <div className="bg-muted/30 rounded-lg p-4">
            <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <span>📋</span> Pre-Planning Checklist
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Everything you need to prepare ahead of time for peace of mind.
            </p>
            <div className="flex justify-center mb-4">
              <iframe 
                src="https://gamma.app/embed/plsn9a9j7cvzdh5" 
                style={{ width: '100%', maxWidth: '700px', height: '400px' }}
                allow="fullscreen" 
                title="Pre-Planning Checklist" 
                className="rounded-lg border border-border" 
              />
            </div>
            <a 
              href="https://gamma.app/docs/plsn9a9j7cvzdh5" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-primary hover:underline text-sm font-medium"
            >
              <ExternalLink className="h-4 w-4" />
              Open Full Checklist
            </a>
          </div>

          {/* After-Death Checklist */}
          <div className="bg-muted/30 rounded-lg p-4">
            <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <span>📝</span> After-Death Checklist
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Essential steps and tasks for families after the loss of a loved one.
            </p>
            <div className="flex justify-center mb-4">
              <iframe 
                src="https://gamma.app/embed/h13wkygxlos50w9" 
                style={{ width: '100%', maxWidth: '700px', height: '400px' }}
                allow="fullscreen" 
                title="After-Death Planner & Checklist" 
                className="rounded-lg border border-border" 
              />
            </div>
            <a 
              href="https://gamma.app/docs/After-Death-Planner-Checklist-h13wkygxlos50w9" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-primary hover:underline text-sm font-medium"
            >
              <ExternalLink className="h-4 w-4" />
              Open Full Checklist
            </a>
          </div>
        </div>
      </div>

      {/* Know Your Rights Card */}
      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 md:p-8">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">⚖️</span>
            <h2 className="text-xl md:text-2xl font-bold text-foreground">
              Know Your Rights Under the Funeral Rule
            </h2>
          </div>
          <p className="text-muted-foreground mb-6">
            The Federal Trade Commission's Funeral Rule protects consumers when arranging funeral services.
          </p>
          <img 
            src="/images/Know-Your-Rights-When-Arranging-a-Funeral.png" 
            alt="Know Your Rights When Arranging a Funeral" 
            className="w-full rounded-lg border border-border shadow-sm mb-6" 
          />
          <div className="flex flex-wrap gap-3">
            <a href="/guides/Know-Your-Rights-When-Arranging-a-Funeral.pdf" download className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium text-sm">
              <Download className="h-4 w-4" />
              Download PDF
            </a>
            <a href="https://reportfraud.ftc.gov" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 border border-border text-foreground rounded-lg hover:bg-muted transition-colors font-medium text-sm">
              <ExternalLink className="h-4 w-4" />
              Report a Concern (FTC)
            </a>
          </div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl p-6">
        <h2 className="text-lg font-semibold mb-4">Additional Forms</h2>
        <ul className="space-y-3">
          <li>
            <Link to="/forms" className="text-primary hover:underline flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Blank Fillable Forms (Pre-Planning & After-Death Planner)
            </Link>
          </li>
          <li>
            <a href="/Pre-Planning-Your-Funeral-A-Gift-of-Peace-and-Clarity.pdf" download className="text-primary hover:underline flex items-center gap-2">
              <Download className="h-4 w-4" />
              Pre-Planning Your Funeral Guide (PDF)
            </a>
          </li>
          <li>
            <a href="/guides/Discussing-Death-Guide.pdf" download className="text-primary hover:underline flex items-center gap-2">
              <Download className="h-4 w-4" />
              Discussing Death Guide (PDF)
            </a>
          </li>
          <li>
            <a href="/guides/My-End-of-Life-Decisions-Guide.pdf" download className="text-primary hover:underline flex items-center gap-2">
              <Download className="h-4 w-4" />
              My End-of-Life Decisions Guide (PDF)
            </a>
          </li>
        </ul>
      </div>
    </div>
  );

  const renderFAQs = () => (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">Frequently Asked Questions</h1>
        <p className="text-muted-foreground mb-4">
          Find answers to common questions about planning and using this app.
        </p>
        
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search FAQs..."
            value={faqSearch}
            onChange={(e) => setFaqSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl p-6">
        <h2 className="text-lg font-semibold mb-4">General Questions</h2>
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="faq-1">
            <AccordionTrigger className="text-left">What is this app for?</AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
              This app helps you organize your end-of-life wishes and important information in one secure place.
              It's designed to make planning easier for you and to help your family when the time comes.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="faq-2">
            <AccordionTrigger className="text-left">Is my information secure?</AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
              Yes. Your data is encrypted and stored securely. Only you and people you choose to share with can access your information.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="faq-3">
            <AccordionTrigger className="text-left">Can I change my answers later?</AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
              Absolutely. You can update any section at any time. We recommend reviewing your plan at least once a year or after major life events.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      <div className="text-center py-4">
        <Link to="/faq">
          <Button variant="outline">
            View All FAQs
          </Button>
        </Link>
      </div>
    </div>
  );

  const renderLearnLibrary = () => (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">Learn Library</h1>
        <p className="text-muted-foreground">
          Articles, videos, and trusted resources for deeper learning.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="bg-card border border-border rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <span>📄</span> Articles
          </h2>
          <ul className="space-y-2 text-muted-foreground">
            <li>
              <a href="https://consumer.ftc.gov/articles/planning-your-own-funeral" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                Planning Your Own Funeral (FTC)
              </a>
            </li>
            <li>
              <a href="https://funerals.org" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                Funeral Consumers Alliance
              </a>
            </li>
          </ul>
        </div>

        <div className="bg-card border border-border rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <span>🎥</span> Videos
          </h2>
          <p className="text-muted-foreground text-sm">
            Video content coming soon. Check back for educational videos on planning topics.
          </p>
        </div>

        <div className="bg-card border border-border rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <span>🔗</span> Trusted Resources
          </h2>
          <ul className="space-y-2 text-muted-foreground">
            <li>
              <a href="https://www.va.gov/burials-memorials/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                VA Burial Benefits
              </a>
            </li>
            <li>
              <a href="https://www.ssa.gov/benefits/survivors/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                Social Security Survivor Benefits
              </a>
            </li>
          </ul>
        </div>

        <div className="bg-card border border-border rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <span>📖</span> Glossary
          </h2>
          <p className="text-muted-foreground text-sm">
            Plain-language definitions for common terms. Coming soon.
          </p>
        </div>
      </div>
    </div>
  );

  const renderEventsWorkshops = () => (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">Events & Workshops</h1>
        <p className="text-muted-foreground">
          Upcoming events, seminars, and virtual workshops.
        </p>
      </div>

      <div className="bg-card border border-border rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Upcoming Events</h2>
          <Link to="/events">
            <Button variant="outline" size="sm">View All Events</Button>
          </Link>
        </div>
        <p className="text-muted-foreground">
          Visit our events page to see upcoming educational seminars and workshops in your area.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="font-semibold mb-2">Local Seminars</h3>
          <p className="text-sm text-muted-foreground">
            In-person educational sessions held at community centers, libraries, and partner locations.
          </p>
        </div>
        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="font-semibold mb-2">Virtual Workshops</h3>
          <p className="text-sm text-muted-foreground">
            Online sessions you can attend from home. Great for those with mobility concerns.
          </p>
        </div>
      </div>
    </div>
  );

  const renderToolsCalculators = () => (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">Tools & Calculators</h1>
        <p className="text-muted-foreground">
          Practical tools to help with planning decisions.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Link to="/resources/cost-estimator" className="bg-card border border-border rounded-xl p-6 hover:border-primary/50 transition-colors block">
          <h3 className="font-semibold mb-2 flex items-center gap-2">
            <span>💰</span> Cost Estimator
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            Get a general idea of funeral costs based on your choices.
          </p>
          <Button variant="outline" size="sm">Open Calculator</Button>
        </Link>
        
        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="font-semibold mb-2 flex items-center gap-2">
            <span>📊</span> Planning Progress
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            Track which sections you've completed in your plan.
          </p>
          <Link to="/dashboard">
            <Button variant="outline" size="sm">View Dashboard</Button>
          </Link>
        </div>
        
        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="font-semibold mb-2 flex items-center gap-2">
            <span>🤔</span> Decision Helper
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            Guided questions to help you make important choices.
          </p>
          <Button variant="outline" size="sm" disabled>Coming Soon</Button>
        </div>
        
        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="font-semibold mb-2 flex items-center gap-2">
            <span>✅</span> Document Checklist
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            Generate a personalized list of documents you need.
          </p>
          <Link to="/forms">
            <Button variant="outline" size="sm">View Checklists</Button>
          </Link>
        </div>
      </div>
    </div>
  );

  const renderSupportHelp = () => (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">Support & Help</h1>
        <p className="text-muted-foreground">
          Get help with the app or connect with our support team.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Link to="/contact" className="bg-card border border-border rounded-xl p-6 hover:border-primary/50 transition-colors">
          <h3 className="font-semibold mb-2 flex items-center gap-2">
            <span>📧</span> Contact Support
          </h3>
          <p className="text-sm text-muted-foreground">
            Send us a message and we'll get back to you as soon as possible.
          </p>
        </Link>
        
        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="font-semibold mb-2 flex items-center gap-2">
            <span>💬</span> How to Get Help
          </h3>
          <p className="text-sm text-muted-foreground">
            Click the Claire button in the corner anytime to ask questions or get guidance.
          </p>
        </div>
        
        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="font-semibold mb-2 flex items-center gap-2">
            <span>🐛</span> Report an Issue
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            Found a bug or something not working right? Let us know.
          </p>
          <Link to="/contact">
            <Button variant="outline" size="sm">Report Issue</Button>
          </Link>
        </div>
        
        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="font-semibold mb-2 flex items-center gap-2">
            <span>💡</span> Feedback
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            Have ideas to improve the app? We'd love to hear from you.
          </p>
          <Link to="/contact">
            <Button variant="outline" size="sm">Share Feedback</Button>
          </Link>
        </div>
      </div>

      <div className="bg-muted/30 border border-border rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-3">Need More Help?</h3>
        <p className="text-muted-foreground mb-4">
          Our team is here to support you through every step of the planning process.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link to="/care-support">
            <Button>Learn About CARE Support</Button>
          </Link>
          <Link to="/faq">
            <Button variant="outline">View All FAQs</Button>
          </Link>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <GlobalHeader />
      
      <div className="flex-1 flex">
        <ResourcesSidebar 
          activeSection={activeSection}
          activeSubItem={activeSubItem}
          onSectionChange={handleSectionChange}
        />
        
        <main className="flex-1 max-w-4xl px-4 py-8 md:py-12">
          <div className="flex justify-end mb-4">
            <TextSizeToggle />
          </div>
          
          {renderContent()}
        </main>
      </div>
      
      <AppFooter />
    </div>
  );
};

export default Resources;
