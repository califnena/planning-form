import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GlobalHeader } from "@/components/GlobalHeader";
import { AppFooter } from "@/components/AppFooter";
import { CheckCircle2, Mail } from "lucide-react";

export default function DoItForYouIntakeSubmitted() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <GlobalHeader />
      
      <main className="flex-1 flex items-center justify-center py-16 px-4">
        <Card className="max-w-lg w-full text-center">
          <CardHeader className="pb-4">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <CardTitle className="text-2xl">You're not alone in this</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-muted-foreground leading-relaxed">
              Thank you. We've received your request.<br />
              Someone will contact you to help continue your planning.
            </p>

            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground bg-muted/50 rounded-lg p-4">
              <Mail className="h-5 w-5" />
              <span>Check your inbox for confirmation</span>
            </div>

            <p className="text-sm text-muted-foreground">
              You can still access your Planning Menu and return anytime.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button 
                onClick={() => navigate('/dashboard')}
                className="flex-1 sm:flex-initial"
              >
                Go to Planning Menu
              </Button>
              <Button 
                variant="outline"
                onClick={() => navigate('/contact')}
                className="flex-1 sm:flex-initial"
              >
                Contact Us
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>

      <AppFooter />
    </div>
  );
}