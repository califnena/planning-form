import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PreviewModeBanner } from "@/components/PreviewModeBanner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, Phone, FileText, Scroll, Newspaper, Home, CreditCard, Laptop } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const PreviewAfterDeath = () => {
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

  const sampleSteps = [
    {
      icon: Phone,
      step: "Step 1",
      title: "Immediate Needs",
      description: "Contact funeral home, notify close family, secure the home.",
      tasks: ["Call funeral home", "Notify immediate family", "Secure residence and valuables"],
    },
    {
      icon: FileText,
      step: "Step 2",
      title: "Official Notifications",
      description: "Notify Social Security, employer, and government agencies.",
      tasks: ["Contact Social Security Administration", "Notify employer or former employer", "Contact Department of Veterans Affairs if applicable"],
    },
    {
      icon: Scroll,
      step: "Step 3",
      title: "Key Documents",
      description: "Locate will, death certificate, insurance policies, and legal documents.",
      tasks: ["Find original will and trust documents", "Locate life insurance policies", "Gather financial account information"],
    },
    {
      icon: Newspaper,
      step: "Step 4",
      title: "Obituary",
      description: "Write and submit obituary to newspapers and online.",
      tasks: ["Draft obituary text", "Submit to local newspapers", "Post to funeral home website"],
    },
    {
      icon: Home,
      step: "Step 5",
      title: "Real Estate & Utilities",
      description: "Manage property, utilities, and ongoing bills.",
      tasks: ["Contact utility companies", "Change or cancel subscriptions", "Secure property and change locks if needed"],
    },
    {
      icon: CreditCard,
      step: "Step 6",
      title: "Finances & Estate",
      description: "Contact banks, close accounts, and begin estate settlement.",
      tasks: ["Notify banks and financial institutions", "Cancel credit cards", "Begin probate process with attorney"],
    },
    {
      icon: Laptop,
      step: "Step 7",
      title: "Digital Accounts",
      description: "Close or memorialize social media and online accounts.",
      tasks: ["Request account memorialization or deletion", "Cancel email and cloud storage", "Transfer domain names if applicable"],
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-semibold text-primary">Preview Mode</h1>
            <p className="text-xs text-muted-foreground">Sample After-Death Steps</p>
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
            After-Death Planner - 12 Step Guide
          </h1>
          <p className="text-lg text-muted-foreground">
            This is a preview of the step-by-step guide for families after a loss.
          </p>
        </div>

        <div className="space-y-4">
          {sampleSteps.map((step, index) => {
            const Icon = step.icon;
            return (
              <Card key={index} className="border-2">
                <CardContent className="pt-6 pb-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-medium text-primary">{step.step}</span>
                        <span className="text-gray-300">•</span>
                        <h3 className="text-lg font-semibold text-foreground">
                          {step.title}
                        </h3>
                      </div>
                      <p className="text-sm text-muted-foreground mb-4">
                        {step.description}
                      </p>
                      <div className="bg-muted/30 rounded-lg p-4 border border-border space-y-2">
                        <p className="text-sm font-medium text-foreground mb-2">Sample Tasks:</p>
                        {step.tasks.map((task, taskIndex) => (
                          <div key={taskIndex} className="flex items-start gap-2">
                            <CheckCircle className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                            <span className="text-sm text-muted-foreground">{task}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="mt-8 text-center space-y-4">
          <p className="text-muted-foreground">
            This is read-only preview mode. To create your own After-Death Plan, sign up for an account.
          </p>
          <Button size="lg" onClick={() => navigate("/signup")}>
            Create Your Account
          </Button>
        </div>
      </main>
    </div>
  );
};

export default PreviewAfterDeath;
