import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PreviewModeBanner } from "@/components/PreviewModeBanner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FileText, Heart, Landmark, Home, Shield, MessageCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const PreviewPrePlanning = () => {
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

  const sampleSections = [
    {
      icon: FileText,
      title: "My Instructions",
      description: "Document your final wishes and important instructions for loved ones.",
      preview: "Sample content: 'I would like a simple memorial service with close family and friends...'",
    },
    {
      icon: Heart,
      title: "About Me",
      description: "Share your life story, accomplishments, and how you'd like to be remembered.",
      preview: "Sample content: 'Born in Chicago, I spent my career as a teacher and loved gardening...'",
    },
    {
      icon: Landmark,
      title: "Financial Accounts",
      description: "List bank accounts, investments, and financial information.",
      preview: "Sample entries: Checking account at First National Bank, Retirement account at Fidelity...",
    },
    {
      icon: Shield,
      title: "Insurance Policies",
      description: "Record life insurance, health insurance, and other policies.",
      preview: "Sample: Life insurance policy #123456 with State Farm, contact: 555-0100...",
    },
    {
      icon: Home,
      title: "Property & Assets",
      description: "Document real estate, vehicles, and valuable possessions.",
      preview: "Sample: Primary residence at 123 Main St, 2015 Honda Civic, family jewelry...",
    },
    {
      icon: MessageCircle,
      title: "Personal Messages",
      description: "Write heartfelt messages to family and friends.",
      preview: "Sample: 'To my children: I am so proud of the people you have become...'",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-semibold text-primary">Preview Mode</h1>
            <p className="text-xs text-muted-foreground">Sample Pre-Planning Sections</p>
          </div>
          <Button variant="outline" onClick={() => navigate("/")}>
            Back to Home
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <PreviewModeBanner />

        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-foreground mb-4">
            My Final Wishes - Pre-Planning
          </h1>
          <p className="text-lg text-muted-foreground">
            This is a preview of how you can organize your final wishes and important information.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {sampleSections.map((section, index) => {
            const Icon = section.icon;
            return (
              <Card key={index} className="border-2">
                <CardContent className="pt-6 pb-6">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-foreground mb-2">
                        {section.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        {section.description}
                      </p>
                    </div>
                  </div>
                  <div className="bg-muted/30 rounded-lg p-4 border border-border">
                    <p className="text-sm text-muted-foreground italic">
                      {section.preview}
                    </p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="mt-8 text-center space-y-4">
          <p className="text-muted-foreground">
            This is read-only preview mode. To create your own plan, sign up for an account.
          </p>
          <Button size="lg" onClick={() => navigate("/signup")}>
            Create Your Account
          </Button>
        </div>
      </main>
    </div>
  );
};

export default PreviewPrePlanning;
