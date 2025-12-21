import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Download, Eye, FileText, ExternalLink, Scale, BookOpen, CheckSquare, Maximize2 } from "lucide-react";
import { useState } from "react";

interface Guide {
  id: string;
  title: string;
  description: string;
  filename: string;
  path: string;
}

const guides: Guide[] = [
  {
    id: "funeral-planning",
    title: "Pre-Planning Your Funeral: A Gift of Peace and Clarity",
    description: "A comprehensive guide to help you understand the importance of pre-planning your funeral arrangements. Learn about different burial options, service types, and how to communicate your wishes to loved ones.",
    filename: "Pre-Planning-Your-Funeral-A-Gift-of-Peace-and-Clarity.pdf",
    path: "/Pre-Planning-Your-Funeral-A-Gift-of-Peace-and-Clarity.pdf"
  },
  {
    id: "end-of-life-decisions",
    title: "My End-of-Life Decisions Guide",
    description: "Essential information about making informed end-of-life decisions, including healthcare directives, living wills, and advance care planning. This guide helps you document your medical preferences and ensure your wishes are honored.",
    filename: "My-End-of-Life-Decisions-Guide.pdf",
    path: "/guides/My-End-of-Life-Decisions-Guide.pdf"
  },
  {
    id: "discussing-death",
    title: "Discussing Death",
    description: "How to chronicle and celebrate the lives of your loved ones. Learn strategies for starting meaningful conversations about death, funeral planning, and end-of-life wishes with family members.",
    filename: "Discussing-Death-Guide.pdf",
    path: "/guides/Discussing-Death-Guide.pdf"
  }
];

export const SectionGuide = () => {
  const [viewingGuide, setViewingGuide] = useState<Guide | null>(null);
  const [activeEmbed, setActiveEmbed] = useState<'guide' | 'checklist' | null>(null);

  const handleDownload = (guide: Guide) => {
    const link = document.createElement('a');
    link.href = guide.path;
    link.download = guide.filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleView = (guide: Guide) => {
    setViewingGuide(guide);
  };

  const handleCloseViewer = () => {
    setViewingGuide(null);
  };

  const handleFullScreen = (url: string) => {
    window.open(url, "_blank");
  };

  // Interactive Guide/Checklist Viewer
  if (activeEmbed) {
    const isGuide = activeEmbed === 'guide';
    const embedUrl = isGuide 
      ? "https://gamma.app/embed/om4wcs6irh1s18e"
      : "https://gamma.app/embed/plsn9a9j7cvzdh5";
    const title = isGuide ? "Pre-Planning Guide" : "Pre-Planning Checklist";
    
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
              {isGuide ? <BookOpen className="h-6 w-6 text-blue-600" /> : <CheckSquare className="h-6 w-6 text-green-600" />}
            </div>
            <div>
              <h2 className="text-2xl font-bold">{title}</h2>
              <p className="text-muted-foreground">
                {isGuide 
                  ? "Learn how funeral pre-planning works and what decisions matter most"
                  : "See what you'll be documenting in your plan"
                }
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => handleFullScreen(embedUrl)} variant="outline" size="sm" className="gap-2">
              <Maximize2 className="h-4 w-4" />
              Full Screen
            </Button>
            <Button onClick={() => setActiveEmbed(null)} variant="default">
              Back to Guides
            </Button>
          </div>
        </div>

        <div className="border border-border rounded-lg overflow-hidden bg-muted/30">
          <iframe
            src={embedUrl}
            style={{ width: '100%', height: 'calc(100vh - 300px)', minHeight: '500px' }}
            allow="fullscreen"
            title={title}
            className="border-0"
          />
        </div>
      </div>
    );
  }

  if (viewingGuide) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold mb-2">📚 {viewingGuide.title}</h2>
            <p className="text-muted-foreground">
              {viewingGuide.description}
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => handleDownload(viewingGuide)} variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Download
            </Button>
            <Button onClick={handleCloseViewer} variant="default">
              Back to Guides
            </Button>
          </div>
        </div>

        <div className="border border-border rounded-lg overflow-hidden" style={{ height: '800px' }}>
          <iframe
            src={viewingGuide.path}
            className="w-full h-full"
            title={viewingGuide.title}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">📚 Guides & Resources</h2>
        <p className="text-muted-foreground">
          Comprehensive guidance and resources for end-of-life planning. View or download these helpful guides.
        </p>
      </div>

      {/* Interactive Pre-Planning Guide & Checklist */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="border-2 border-blue-200 bg-blue-50/50 hover:border-blue-300 transition-colors cursor-pointer group" onClick={() => setActiveEmbed('guide')}>
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-200 transition-colors">
                <BookOpen className="h-7 w-7 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-2 group-hover:text-blue-700 transition-colors">
                  Interactive Pre-Planning Guide
                </h3>
                <p className="text-sm text-muted-foreground mb-3">
                  A walk-through explaining the sections, choices, and how families typically use this information.
                </p>
                <Button variant="outline" size="sm" className="gap-2">
                  <Eye className="h-4 w-4" />
                  View Guide
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-green-200 bg-green-50/50 hover:border-green-300 transition-colors cursor-pointer group" onClick={() => setActiveEmbed('checklist')}>
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 group-hover:bg-green-200 transition-colors">
                <CheckSquare className="h-7 w-7 text-green-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-2 group-hover:text-green-700 transition-colors">
                  Pre-Planning Checklist
                </h3>
                <p className="text-sm text-muted-foreground mb-3">
                  See what you'll be documenting—helpful to review before you begin planning.
                </p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="gap-2">
                    <Eye className="h-4 w-4" />
                    View Checklist
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Downloadable Checklist */}
      <div className="flex justify-center">
        <a 
          href="/checklists/Pre-Planning-Checklist-2.png" 
          download="Pre-Planning-Checklist.png"
          className="inline-flex items-center gap-2 px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors font-medium"
        >
          <Download className="h-4 w-4" />
          Download Checklist as Image
        </a>
      </div>

      {/* PDF Guides Section */}
      <div className="pt-4">
        <h3 className="text-lg font-semibold mb-4">Downloadable PDF Guides</h3>
        <div className="grid md:grid-cols-2 gap-6">
          {guides.map((guide) => (
            <Card key={guide.id} className="flex flex-col">
              <CardHeader>
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <FileText className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-2">{guide.title}</CardTitle>
                    <CardDescription className="text-sm">
                      {guide.description}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-1 flex items-end">
                <div className="flex gap-2 w-full">
                  <Button 
                    onClick={() => handleView(guide)} 
                    className="flex-1 gap-2"
                    variant="default"
                  >
                    <Eye className="h-4 w-4" />
                    View Guide
                  </Button>
                  <Button 
                    onClick={() => handleDownload(guide)} 
                    className="flex-1 gap-2"
                    variant="outline"
                  >
                    <Download className="h-4 w-4" />
                    Download
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Legal Documents & State-Specific Forms Section */}
      <Card className="border-2">
        <CardHeader>
          <div className="flex items-start gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Scale className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <CardTitle className="text-xl mb-2">Legal Documents & State-Specific Forms</CardTitle>
              <CardDescription>
                Understanding advance directives and accessing the right forms for your state
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* State-Specific Resources */}
          <div>
            <h4 className="font-semibold mb-3">Get State-Specific Forms</h4>
            <p className="text-sm text-muted-foreground mb-4">
              Each state has specific laws that define how advance directive forms must be written, signed, and witnessed. 
              Use these trusted resources to find the official forms for your state:
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              <a 
                href="https://www.aarp.org/caregiving/financial-legal/free-printable-advance-directives/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-4 border rounded-lg hover:bg-accent transition-colors group"
              >
                <div className="flex-1">
                  <h5 className="font-semibold mb-1 group-hover:text-primary transition-colors">AARP Advance Directives</h5>
                  <p className="text-xs text-muted-foreground">
                    Free state-specific advance directive forms and healthcare power of attorney documents
                  </p>
                </div>
                <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </a>
              <a 
                href="https://www.caringinfo.org/planning/advance-directives/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-4 border rounded-lg hover:bg-accent transition-colors group"
              >
                <div className="flex-1">
                  <h5 className="font-semibold mb-1 group-hover:text-primary transition-colors">CaringInfo</h5>
                  <p className="text-xs text-muted-foreground">
                    State-by-state advance directive forms from the National Hospice and Palliative Care Organization
                  </p>
                </div>
                <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </a>
            </div>
          </div>

          {/* Advance Directive FAQs */}
          <div>
            <h4 className="font-semibold mb-3">Frequently Asked Questions</h4>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="what-is">
                <AccordionTrigger>What is an advance directive form, and how does it work?</AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground space-y-3">
                  <p>
                    An advance directive is a legal document that lets you record your wishes about medical treatment 
                    if you become unable to speak or make decisions for yourself. It can include two main parts:
                  </p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>
                      <strong>Living Will:</strong> States your preferences for medical care, such as life support or resuscitation.
                    </li>
                    <li>
                      <strong>Healthcare Power of Attorney (or Healthcare Proxy):</strong> Names someone you trust to make 
                      medical decisions on your behalf.
                    </li>
                  </ul>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="when-used">
                <AccordionTrigger>When is an advance directive used?</AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground">
                  <p>
                    It is used only if you become seriously ill, injured, or unconscious and cannot communicate your 
                    healthcare choices. Until that time, you continue to make your own decisions.
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="who-for">
                <AccordionTrigger>Who is it for?</AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground">
                  <p>
                    Every adult can and should have one. It ensures your medical care reflects your values and relieves 
                    loved ones from making difficult decisions without guidance.
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="state-specific">
                <AccordionTrigger>Does every state have its own version?</AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground">
                  <p>
                    Yes. Each state has specific laws that define how the form must be written, signed, and witnessed. 
                    A directive from one state may not meet another state's legal requirements, so always use the correct 
                    form for your location.
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="where-to-get">
                <AccordionTrigger>Where can I get a form for my state?</AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground space-y-3">
                  <p>
                    You can usually find the official form through your state's Department of Health, Attorney General's 
                    office, or state bar association. Reliable nonprofit sources, hospitals, and senior services agencies 
                    also provide free, state-specific forms.
                  </p>
                  <p>
                    <strong>Tip:</strong> Use the version for the state where you live or receive most of your medical care. 
                    If you move, complete a new one to meet your new state's rules.
                  </p>
                  <div className="pt-2">
                    <p className="font-semibold mb-2">Recommended Resources:</p>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>
                        <a 
                          href="https://www.aarp.org/caregiving/financial-legal/free-printable-advance-directives/" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-primary hover:underline inline-flex items-center gap-1"
                        >
                          AARP State-Specific Forms
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </li>
                      <li>
                        <a 
                          href="https://www.caringinfo.org/planning/advance-directives/" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-primary hover:underline inline-flex items-center gap-1"
                        >
                          CaringInfo Advance Directives
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </li>
                    </ul>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </CardContent>
      </Card>

      <div className="p-6 bg-muted/50 rounded-lg border border-border">
        <h3 className="font-semibold text-lg mb-2">Need More Resources?</h3>
        <p className="text-sm text-muted-foreground mb-4">
          These guides are provided to help you make informed decisions about your end-of-life planning. 
          For personalized assistance, contact Everlasting Funeral Advisors.
        </p>
        <Button asChild variant="outline">
          <a href="https://everlastingfuneraladvisors.com" target="_blank" rel="noopener noreferrer">
            Contact Us for Help
          </a>
        </Button>
      </div>
    </div>
  );
};
