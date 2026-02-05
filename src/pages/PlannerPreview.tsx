import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Eye, 
  Lock, 
  FileText, 
  Heart, 
  Home, 
  Users, 
  DollarSign, 
  ScrollText,
  Sparkles,
  ArrowRight
} from "lucide-react";
import { PublicHeader } from "@/components/PublicHeader";
import { AppFooter } from "@/components/AppFooter";

// Sample preview sections (read-only)
const PREVIEW_SECTIONS = [
  {
    icon: FileText,
    title: "About Me",
    description: "Personal details, family history, and important dates",
    sampleFields: ["Full legal name", "Date of birth", "Place of birth", "Religion/faith"]
  },
  {
    icon: Heart,
    title: "Funeral Wishes",
    description: "How you want your service to be remembered",
    sampleFields: ["Service type preference", "Music selections", "Readings or poems", "Special requests"]
  },
  {
    icon: Users,
    title: "People to Notify",
    description: "Family and friends who should be contacted",
    sampleFields: ["Family members", "Attorney", "Financial advisor", "Executor"]
  },
  {
    icon: DollarSign,
    title: "Financial Information",
    description: "Accounts, policies, and important numbers",
    sampleFields: ["Bank accounts", "Insurance policies", "Retirement accounts", "Property"]
  },
  {
    icon: ScrollText,
    title: "Legal Documents",
    description: "Where to find your important papers",
    sampleFields: ["Will location", "Power of Attorney", "Healthcare directive", "Trust documents"]
  },
  {
    icon: Home,
    title: "Property & Assets",
    description: "Real estate, vehicles, and valuables",
    sampleFields: ["Primary residence", "Other properties", "Vehicles", "Valuables"]
  }
];

export default function PlannerPreview() {
  const navigate = useNavigate();

  // Safety net: authenticated users should never be in preview mode.
  // Redirect them to the single planner entry route.
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) navigate("/planner/start", { replace: true });
    });
  }, [navigate]);

  const handleSignIn = () => {
    navigate("/login?redirect=/planner/start");
  };

  const handleViewPricing = () => {
    navigate("/pricing");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      <PublicHeader />

      <main className="container mx-auto px-4 py-8 md:py-12">
        {/* Preview Mode Banner */}
        <Alert className="max-w-4xl mx-auto mb-8 border-primary/50 bg-primary/5">
          <Eye className="h-4 w-4" />
          <AlertDescription className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <span className="font-medium">Preview Mode</span>{" "}
              <span className="text-muted-foreground">
                Explore freely — fields are view-only and nothing is saved.
              </span>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <Button size="sm" onClick={handleSignIn}>
                Sign In to Unlock
              </Button>
              <Button size="sm" variant="outline" onClick={handleViewPricing}>
                View Options
              </Button>
            </div>
          </AlertDescription>
        </Alert>

        {/* Header */}
        <section className="max-w-4xl mx-auto text-center space-y-4 mb-12">
          <Badge variant="outline" className="mb-4">
            <Eye className="h-3 w-3 mr-1" />
            Preview Mode
          </Badge>
          <h1 className="text-3xl md:text-4xl font-serif font-bold">
            Explore the Digital Planner
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Browse the sections below to see what you'll be able to record. In preview mode, all fields are view-only and nothing is saved.
          </p>
        </section>

        {/* Preview Sections */}
        <section className="max-w-4xl mx-auto mb-12">
          <div className="grid md:grid-cols-2 gap-6">
            {PREVIEW_SECTIONS.map((section) => (
              <Card key={section.title} className="border hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <section.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{section.title}</CardTitle>
                      <p className="text-sm text-muted-foreground">{section.description}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-xs font-medium text-muted-foreground mb-2">Sample fields:</p>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    {section.sampleFields.map((field) => (
                      <li key={field} className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary/50" />
                        {field}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* How It Works in Full Version */}
        <section className="max-w-3xl mx-auto mb-12">
          <Card className="border-2 border-dashed">
            <CardContent className="p-6 md:p-8 space-y-6">
              <div className="text-center space-y-2">
                <Sparkles className="h-8 w-8 text-primary mx-auto" />
                <h2 className="text-2xl font-serif font-semibold">
                  Ready for Full Access?
                </h2>
                <p className="text-muted-foreground">
                  Full Access lets you:
                </p>
              </div>

              <ul className="space-y-3 max-w-md mx-auto">
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-primary">1</span>
                  </div>
                  <span>Fill in your information at your own pace</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-primary">2</span>
                  </div>
                  <span>Save and return anytime — nothing is lost</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-primary">3</span>
                  </div>
                  <span>Download or print your completed plan</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-primary">4</span>
                  </div>
                  <span>Update it whenever your wishes change</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </section>

        {/* CTA Section */}
        <section className="max-w-2xl mx-auto text-center space-y-6 mb-12">
          <h2 className="text-2xl font-serif font-semibold">
            Ready to start your plan?
          </h2>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={handleSignIn}
              size="lg"
              className="min-h-[56px] text-lg px-8"
            >
              Sign In to Start
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
            <Button 
              variant="outline"
              size="lg"
              onClick={handleViewPricing}
              className="min-h-[56px] text-lg"
            >
              View Planning Options
            </Button>
          </div>

          <p className="text-sm text-muted-foreground">
            Don't have an account?{" "}
            <button 
              onClick={() => navigate("/signup")}
              className="text-primary hover:underline"
            >
              Create a free account
            </button>
          </p>
        </section>

        {/* Back to Plan Ahead */}
        <section className="max-w-2xl mx-auto text-center">
          <Button 
            variant="ghost"
            onClick={() => navigate("/plan-ahead")}
          >
            ← Back to Plan Ahead
          </Button>
        </section>
      </main>

      <AppFooter />
    </div>
  );
}
