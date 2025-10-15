import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

export const SectionGuide = () => {
  const pdfUrl = "/Pre-Planning-Your-Funeral-A-Gift-of-Peace-and-Clarity.pdf";

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = 'Pre-Planning-Your-Funeral-A-Gift-of-Peace-and-Clarity.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold mb-2">📚 Guide</h2>
          <p className="text-muted-foreground">
            Comprehensive guidance and resources for end-of-life planning.
          </p>
        </div>
        <Button onClick={handleDownload} variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          Download Guide
        </Button>
      </div>

      <div className="border border-border rounded-lg overflow-hidden" style={{ height: '800px' }}>
        <iframe
          src={pdfUrl}
          className="w-full h-full"
          title="Funeral Planning Guide"
        />
      </div>
    </div>
  );
};
