import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { GlobalHeader } from "@/components/GlobalHeader";
import { AppFooter } from "@/components/AppFooter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle, XCircle } from "lucide-react";

const Unsubscribe = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const token = searchParams.get("token");

  useEffect(() => {
    if (token) {
      handleUnsubscribe();
    } else {
      setStatus("error");
    }
  }, [token]);

  const handleUnsubscribe = async () => {
    if (!token) return;

    try {
      const { error } = await supabase
        .from("efa_event_subscribers")
        .update({ is_active: false })
        .eq("unsub_token", token);

      if (error) {
        console.error("Unsubscribe error:", error);
        setStatus("error");
      } else {
        setStatus("success");
      }
    } catch (err) {
      console.error("Unsubscribe error:", err);
      setStatus("error");
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <GlobalHeader />
      
      <main className="flex-1 container mx-auto px-4 py-16 flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="text-center">
              {status === "loading" && "Processing..."}
              {status === "success" && "Unsubscribed Successfully"}
              {status === "error" && "Unsubscribe Failed"}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            {status === "loading" && (
              <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
            )}
            
            {status === "success" && (
              <>
                <CheckCircle className="h-12 w-12 mx-auto text-green-600" />
                <p className="text-muted-foreground">
                  You have been unsubscribed from event reminders. You will no longer receive emails about upcoming events.
                </p>
                <p className="text-sm text-muted-foreground">
                  Changed your mind? You can always subscribe again on our Events page.
                </p>
              </>
            )}
            
            {status === "error" && (
              <>
                <XCircle className="h-12 w-12 mx-auto text-destructive" />
                <p className="text-muted-foreground">
                  We couldn't process your unsubscribe request. The link may be invalid or expired.
                </p>
                <p className="text-sm text-muted-foreground">
                  Please contact us if you continue to receive unwanted emails.
                </p>
              </>
            )}

            <Button onClick={() => navigate("/events")} variant="outline" className="mt-4">
              Back to Events
            </Button>
          </CardContent>
        </Card>
      </main>

      <AppFooter />
    </div>
  );
};

export default Unsubscribe;
