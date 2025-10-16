import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, Eye, FileText } from "lucide-react";
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
        <h2 className="text-2xl font-bold mb-2">📚 Guides</h2>
        <p className="text-muted-foreground">
          Comprehensive guidance and resources for end-of-life planning. View or download these helpful guides.
        </p>
      </div>

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
