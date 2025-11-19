import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AuthenticatedLayout } from "@/components/AuthenticatedLayout";
import { supabase } from "@/integrations/supabase/client";

export default function PurchaseSuccess() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [orderDetails, setOrderDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (sessionId) {
      fetchOrderDetails();
    } else {
      setLoading(false);
    }
  }, [sessionId]);

  const fetchOrderDetails = async () => {
    try {
      // Fetch session details from Stripe via edge function
      const { data, error } = await supabase.functions.invoke('get-stripe-session', {
        body: { sessionId },
      });

      if (error) throw error;
      setOrderDetails(data);
    } catch (error) {
      console.error("Error fetching order details:", error);
    } finally {
      setLoading(false);
    }
  };

  const getOrderType = () => {
    if (!orderDetails) return "Your Purchase";
    
    const metadata = orderDetails.metadata || {};
    if (metadata.type === "song") return "Custom Memorial Song";
    if (metadata.type === "binder") return "Physical Binder & Printable Workbook";
    if (metadata.type === "dfy") return "Do It For You Service";
    if (orderDetails.mode === "subscription") return "Subscription Plan";
    
    return "Your Purchase";
  };

  const getNextSteps = () => {
    if (!orderDetails) return null;
    
    const metadata = orderDetails.metadata || {};
    
    if (metadata.type === "song") {
      return (
        <div className="space-y-2">
          <p className="font-medium">What happens next?</p>
          <ul className="list-disc list-inside space-y-1 text-muted-foreground">
            <li>Complete your song request form to provide details</li>
            <li>Our team will create your custom memorial song</li>
            <li>You'll receive your finished song within 7-10 business days</li>
          </ul>
        </div>
      );
    }
    
    if (metadata.type === "binder") {
      return (
        <div className="space-y-2">
          <p className="font-medium">What happens next?</p>
          <ul className="list-disc list-inside space-y-1 text-muted-foreground">
            <li>Your physical binder will ship within 3-5 business days</li>
            <li>Download your printable workbook from the dashboard</li>
            <li>Track your shipping via the email confirmation</li>
          </ul>
        </div>
      );
    }
    
    if (metadata.type === "dfy") {
      return (
        <div className="space-y-2">
          <p className="font-medium">What happens next?</p>
          <ul className="list-disc list-inside space-y-1 text-muted-foreground">
            <li>Our team will contact you within 24 hours to schedule your session</li>
            <li>Complete your personalized planner with expert guidance</li>
            <li>Receive your finished planner and fireproof binder</li>
          </ul>
        </div>
      );
    }
    
    if (orderDetails.mode === "subscription") {
      return (
        <div className="space-y-2">
          <p className="font-medium">What's included:</p>
          <ul className="list-disc list-inside space-y-1 text-muted-foreground">
            <li>Full access to the digital planner</li>
            <li>After-Death Planner for your loved ones</li>
            <li>PDF generation and document downloads</li>
            <li>Unlimited updates and revisions</li>
          </ul>
        </div>
      );
    }
    
    return null;
  };

  if (loading) {
    return (
      <AuthenticatedLayout>
        <div className="container max-w-2xl mx-auto py-8 px-4">
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">Loading order details...</p>
            </CardContent>
          </Card>
        </div>
      </AuthenticatedLayout>
    );
  }

  return (
    <AuthenticatedLayout>
      <div className="container max-w-2xl mx-auto py-8 px-4">
        <Card>
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <CheckCircle2 className="h-16 w-16 text-green-600" />
            </div>
            <CardTitle className="text-2xl">Purchase Successful!</CardTitle>
            <CardDescription>
              Thank you for your purchase of {getOrderType()}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-muted/50 rounded-lg p-4">
              <p className="text-sm text-muted-foreground mb-2">Order confirmation has been sent to your email.</p>
              {orderDetails && (
                <p className="text-sm font-mono text-muted-foreground">
                  Order ID: {sessionId?.slice(0, 20)}...
                </p>
              )}
            </div>

            {getNextSteps()}

            <div className="space-y-2 pt-4">
              <p className="text-sm text-muted-foreground">
                <strong>Need help?</strong> Contact us at{" "}
                <a href="mailto:support@everlastingfuneraladvisors.com" className="text-primary hover:underline">
                  support@everlastingfuneraladvisors.com
                </a>
              </p>
            </div>

            <div className="flex gap-4 pt-4">
              <Button onClick={() => navigate("/dashboard")} className="flex-1">
                Return to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AuthenticatedLayout>
  );
}
