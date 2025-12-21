import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GlobalHeader } from "@/components/GlobalHeader";
import { AppFooter } from "@/components/AppFooter";
import { CheckCircle2, ArrowRight, MessageSquare, FileCheck, ClipboardCheck, Eye } from "lucide-react";

export default function DoItForYouConfirmation() {
  const navigate = useNavigate();

  const nextSteps = [
    { icon: ClipboardCheck, text: "We review your intake" },
    { icon: MessageSquare, text: "We contact you to confirm details and next steps" },
    { icon: FileCheck, text: "We help complete your plan with you" },
    { icon: Eye, text: "You review and approve everything" }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <GlobalHeader />
      
      <main className="flex-1 flex items-center justify-center py-16 px-4">
        <div className="max-w-2xl w-full">
          <Card className="text-center">
            <CardHeader className="pb-4">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <CardTitle className="text-3xl">You're All Set</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-muted-foreground text-lg">
                Your Do-It-For-You Planning service is active. The next step is quick: complete the intake form so we know what you want help with.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <Button 
                  size="lg" 
                  onClick={() => navigate('/do-it-for-you/intake')}
                  className="text-lg"
                >
                  Complete the Intake Form
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button 
                  size="lg" 
                  variant="outline"
                  onClick={() => navigate('/dashboard')}
                >
                  Go to Planning Menu
                </Button>
              </div>

              <div className="pt-8 border-t">
                <h3 className="font-semibold text-foreground mb-4">What happens after intake</h3>
                <div className="grid sm:grid-cols-2 gap-3 text-left">
                  {nextSteps.map((step, index) => (
                    <div key={index} className="flex items-center gap-3 text-muted-foreground">
                      <step.icon className="h-5 w-5 text-primary flex-shrink-0" />
                      <span className="text-sm">{step.text}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-6">
                <p className="text-sm text-muted-foreground">
                  Questions before you begin?{" "}
                  <Button 
                    variant="link" 
                    className="p-0 h-auto text-primary"
                    onClick={() => navigate('/contact')}
                  >
                    Contact us anytime
                  </Button>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <AppFooter />
    </div>
  );
}