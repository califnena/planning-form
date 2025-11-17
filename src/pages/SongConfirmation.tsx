import { AuthenticatedLayout } from "@/components/AuthenticatedLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Music } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function SongConfirmation() {
  const navigate = useNavigate();

  return (
    <AuthenticatedLayout>
      <div className="container mx-auto px-4 py-16 max-w-2xl">
        <Card className="text-center">
          <CardHeader>
            <div className="mx-auto mb-4">
              <CheckCircle className="h-16 w-16 text-green-500" />
            </div>
            <CardTitle className="text-2xl">Request Submitted Successfully!</CardTitle>
            <CardDescription>
              Your custom tribute song order has been received
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-muted/50 p-6 rounded-lg text-left space-y-3">
              <div className="flex items-start gap-3">
                <Music className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold mb-1">What happens next?</h3>
                  <p className="text-sm text-muted-foreground">
                    Our team will begin crafting your personalized tribute song. You'll receive 
                    your completed song via email within 1-2 business days.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Music className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold mb-1">Check your email</h3>
                  <p className="text-sm text-muted-foreground">
                    We've sent a confirmation to the email address you provided. You'll receive 
                    another email when your song is ready.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Music className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold mb-1">Questions?</h3>
                  <p className="text-sm text-muted-foreground">
                    If you have any questions about your order, please contact us at 
                    efa.denisse@gmail.com
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-4 justify-center">
              <Button onClick={() => navigate('/dashboard')} variant="outline">
                Return to Dashboard
              </Button>
              <Button onClick={() => navigate('/products/custom-song')}>
                Order Another Song
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AuthenticatedLayout>
  );
}
