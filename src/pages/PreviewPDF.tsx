import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PreviewModeBanner } from "@/components/PreviewModeBanner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FileOutput, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const PreviewPDF = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check if preview mode has expired
    const expiryTime = localStorage.getItem("preview_mode_expiry");
    if (!expiryTime || Date.now() > parseInt(expiryTime)) {
      toast({
        title: "Preview expired",
        description: "Create an account to continue.",
        variant: "destructive",
      });
      navigate("/");
      return;
    }
  }, [navigate, toast]);

  const handlePreviewPDFClick = () => {
    toast({
      title: "Preview Mode",
      description: "PDF downloads are disabled in preview mode. Create an account to generate your own documents.",
      variant: "destructive",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-semibold text-primary">Preview Mode</h1>
            <p className="text-xs text-muted-foreground">Sample PDF Documents</p>
          </div>
          <Button variant="outline" onClick={() => navigate("/")}>
            Back to Home
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <PreviewModeBanner />

        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-foreground mb-4">
            PDF Document Samples
          </h1>
          <p className="text-lg text-muted-foreground">
            See examples of the professional documents you can generate.
          </p>
        </div>

        <div className="space-y-6">
          <Card className="border-2">
            <CardContent className="pt-6 pb-6">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-16 h-16 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <FileOutput className="h-8 w-8 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    My Final Wishes Document
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    A comprehensive document containing all your pre-planning information, formatted 
                    for easy printing and sharing with family.
                  </p>
                  <div className="bg-muted/30 rounded-lg p-6 border border-border mb-4">
                    <div className="text-center space-y-4">
                      <div className="text-6xl text-muted-foreground opacity-50">📄</div>
                      <div className="space-y-2">
                        <p className="font-semibold text-foreground">Sample PDF Preview</p>
                        <p className="text-sm text-muted-foreground">
                          • Professional formatting with your organization's logo
                        </p>
                        <p className="text-sm text-muted-foreground">
                          • Table of contents for easy navigation
                        </p>
                        <p className="text-sm text-muted-foreground">
                          • All sections organized by category
                        </p>
                        <p className="text-sm text-muted-foreground">
                          • Print-ready for 3-ring binders
                        </p>
                      </div>
                      <div className="pt-4">
                        <p className="text-xs text-amber-600 dark:text-amber-500 font-medium bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded px-3 py-2 inline-block">
                          ⚠️ PREVIEW ONLY - NOT FOR OFFICIAL USE
                        </p>
                      </div>
                    </div>
                  </div>
                  <Button 
                    className="w-full" 
                    onClick={handlePreviewPDFClick}
                    disabled
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download Disabled in Preview Mode
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2">
            <CardContent className="pt-6 pb-6">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-16 h-16 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <FileOutput className="h-8 w-8 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    After-Death Action Plan
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    A step-by-step guide for your family with all 12 steps clearly outlined and 
                    personalized with the information you've provided.
                  </p>
                  <div className="bg-muted/30 rounded-lg p-6 border border-border mb-4">
                    <div className="text-center space-y-4">
                      <div className="text-6xl text-muted-foreground opacity-50">📋</div>
                      <div className="space-y-2">
                        <p className="font-semibold text-foreground">Sample Checklist Preview</p>
                        <p className="text-sm text-muted-foreground">
                          • 12 organized steps for families
                        </p>
                        <p className="text-sm text-muted-foreground">
                          • Checkboxes for tracking progress
                        </p>
                        <p className="text-sm text-muted-foreground">
                          • Contact information sections
                        </p>
                        <p className="text-sm text-muted-foreground">
                          • Clear, compassionate guidance
                        </p>
                      </div>
                      <div className="pt-4">
                        <p className="text-xs text-amber-600 dark:text-amber-500 font-medium bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded px-3 py-2 inline-block">
                          ⚠️ PREVIEW ONLY - NOT FOR OFFICIAL USE
                        </p>
                      </div>
                    </div>
                  </div>
                  <Button 
                    className="w-full" 
                    onClick={handlePreviewPDFClick}
                    disabled
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download Disabled in Preview Mode
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 text-center space-y-4">
          <p className="text-muted-foreground">
            Create an account to generate your own personalized PDF documents.
          </p>
          <Button size="lg" onClick={() => navigate("/signup")}>
            Create Your Account
          </Button>
        </div>
      </main>
    </div>
  );
};

export default PreviewPDF;
