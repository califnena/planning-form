import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PreviewModeBanner } from "@/components/PreviewModeBanner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FileText, Scale, Heart, ShieldCheck, Building2, ScrollText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const PreviewLegal = () => {
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

  const legalResources = [
    {
      icon: FileText,
      title: "Living Will",
      description: "Document your wishes for medical treatment if you're unable to communicate.",
      details: "State-specific forms available through CaringInfo.org and your state's health department.",
    },
    {
      icon: Scale,
      title: "Power of Attorney",
      description: "Designate someone to make financial and legal decisions on your behalf.",
      details: "Durable POA remains in effect if you become incapacitated. Forms vary by state.",
    },
    {
      icon: Heart,
      title: "Healthcare Proxy",
      description: "Appoint someone to make medical decisions for you if you're unable.",
      details: "Also called Healthcare Power of Attorney or Medical Power of Attorney.",
    },
    {
      icon: ShieldCheck,
      title: "DNR Order",
      description: "Do Not Resuscitate order specifies your wishes for life-saving measures.",
      details: "Must be signed by your physician and kept accessible in medical emergencies.",
    },
    {
      icon: Building2,
      title: "Last Will & Testament",
      description: "Specify how your assets should be distributed after your passing.",
      details: "Requires witnesses and notarization. Consider consulting an estate attorney.",
    },
    {
      icon: ScrollText,
      title: "Trust Documents",
      description: "Establish trusts to manage assets and minimize estate taxes.",
      details: "Living trusts avoid probate. Consult with an estate planning attorney.",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-semibold text-primary">Preview Mode</h1>
            <p className="text-xs text-muted-foreground">Sample Legal Resources</p>
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
            Legal Documents & Resources
          </h1>
          <p className="text-lg text-muted-foreground">
            Explore essential legal documents and state-specific resources.
          </p>
        </div>

        <div className="mb-8 bg-amber-50 dark:bg-amber-950/20 border-2 border-amber-500 rounded-lg p-6">
          <h3 className="font-semibold text-amber-900 dark:text-amber-200 mb-2">
            Important Legal Disclaimer
          </h3>
          <p className="text-sm text-amber-800 dark:text-amber-300">
            This information is for educational purposes only and does not constitute legal advice. 
            Legal documents have specific requirements that vary by state. We strongly recommend 
            consulting with a qualified attorney to ensure your documents meet all legal requirements.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {legalResources.map((resource, index) => {
            const Icon = resource.icon;
            return (
              <Card key={index} className="border-2">
                <CardContent className="pt-6 pb-6">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-foreground mb-2">
                        {resource.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        {resource.description}
                      </p>
                    </div>
                  </div>
                  <div className="bg-muted/30 rounded-lg p-4 border border-border">
                    <p className="text-sm text-muted-foreground">
                      {resource.details}
                    </p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="mt-8 text-center space-y-4">
          <p className="text-muted-foreground">
            This is read-only preview mode. To access full legal resources and save your documents, sign up for an account.
          </p>
          <Button size="lg" onClick={() => navigate("/signup")}>
            Create Your Account
          </Button>
        </div>
      </main>
    </div>
  );
};

export default PreviewLegal;
