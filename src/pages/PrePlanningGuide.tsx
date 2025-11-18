import { AuthenticatedLayout } from "@/components/AuthenticatedLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, FileText } from "lucide-react";

export default function PrePlanningGuide() {
  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = '/guides/Pre-Planning-Guide.pdf';
    link.download = 'Pre-Planning-Your-Funeral-Guide.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <AuthenticatedLayout>
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileText className="h-8 w-8 text-primary" />
                <CardTitle className="text-2xl">Pre-Planning Your Funeral: A Gift of Peace and Clarity</CardTitle>
              </div>
              <Button onClick={handleDownload} variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="w-full" style={{ height: 'calc(100vh - 300px)', minHeight: '600px' }}>
              <iframe
                src="/guides/Pre-Planning-Guide.pdf"
                className="w-full h-full border rounded-md"
                title="Pre-Planning Guide"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </AuthenticatedLayout>
  );
}
