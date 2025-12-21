import { useState } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { BackToHomeButton } from "@/components/BackToHomeButton";
import { useTranslation } from "react-i18next";
import { getPendingCheckout, clearPendingCheckout, getProductName } from "@/lib/pendingCheckout";

const LAST_VISITED_KEY = "efa_last_visited_route";

const Login = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // Get redirect from URL params or localStorage
  const getRedirectUrl = () => {
    // First check URL params (e.g., /login?redirect=/app)
    const urlRedirect = searchParams.get("redirect");
    if (urlRedirect) return urlRedirect;
    
    // Then check localStorage for last visited route
    const lastVisited = localStorage.getItem(LAST_VISITED_KEY);
    if (lastVisited) {
      localStorage.removeItem(LAST_VISITED_KEY); // Clear after use
      return lastVisited;
    }
    
    // Default to dashboard
    return "/dashboard";
  };

  // Handle pending checkout after successful login
  const processPendingCheckout = async (): Promise<boolean> => {
    const pending = getPendingCheckout();
    if (!pending) return false;

    try {
      clearPendingCheckout();
      
      toast({
        title: "Continuing to checkout",
        description: `Redirecting to purchase ${getProductName(pending.lookupKey)}...`,
      });

      const { data, error } = await supabase.functions.invoke("stripe-create-checkout", {
        body: pending,
      });

      if (error) throw error;

      if (data?.url) {
        window.location.href = data.url;
        return true; // Indicate we're handling redirect
      }
    } catch (error) {
      console.error("Error processing pending checkout:", error);
      toast({
        title: "Checkout Error",
        description: "Unable to continue to checkout. Please try again.",
        variant: "destructive",
      });
    }
    return false;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.session) {
        // Check for pending checkout FIRST
        const handledCheckout = await processPendingCheckout();
        if (handledCheckout) {
          setLoading(false);
          return; // Stripe redirect is handling navigation
        }

        // Remove old selected_plan handling
        localStorage.removeItem("selected_plan");
        
        toast({
          title: t('auth.welcomeBack'),
          description: t('auth.loginSuccess'),
        });
        
        // Redirect to saved route or dashboard
        const redirectUrl = getRedirectUrl();
        navigate(redirectUrl);
      }
    } catch (error: any) {
      toast({
        title: t('auth.loginFailed'),
        description: error.message || t('auth.invalidCredentials'),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTestLogin = async () => {
    setLoading(true);
    const testEmail = "test@example.com";
    const testPassword = "test123456";

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: testEmail,
        password: testPassword,
      });

      if (error) {
        const { error: signUpError } = await supabase.auth.signUp({
          email: testEmail,
          password: testPassword,
        });

        if (signUpError) throw signUpError;

        const { error: loginError } = await supabase.auth.signInWithPassword({
          email: testEmail,
          password: testPassword,
        });

        if (loginError) throw loginError;
      }

      // Check for pending checkout after test login too
      const handledCheckout = await processPendingCheckout();
      if (handledCheckout) {
        setLoading(false);
        return;
      }

      toast({
        title: t('auth.testLoginSuccess'),
        description: t('auth.testLoginDesc'),
      });
      
      const redirectUrl = getRedirectUrl();
      navigate(redirectUrl);
    } catch (error: any) {
      toast({
        title: t('auth.testLoginFailed'),
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="min-h-screen w-full overflow-x-hidden flex items-center justify-center px-4 py-8 bg-muted/30">
      <div className="absolute top-4 left-4">
        <BackToHomeButton />
      </div>
      <div className="w-full max-w-sm">
        <Card className="w-full">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">{t('auth.signIn')}</CardTitle>
            <CardDescription className="text-center">
              {t('auth.signInDesc')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">{t('auth.email')}</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder={t('auth.emailPlaceholder')}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="text-base"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">{t('auth.password')}</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="text-base"
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? t('auth.signingIn') : t('auth.signIn')}
              </Button>
            </form>

          {import.meta.env.DEV && (
            <>
              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">{t('auth.or')}</span>
                </div>
              </div>

              <div className="space-y-2">
                <Button
                  type="button"
                  variant="secondary"
                  className="w-full"
                  onClick={handleTestLogin}
                  disabled={loading}
                >
                  {t('auth.testLogin')}
                </Button>
              </div>
            </>
          )}

          <div className="mt-4 text-center text-sm">
            <Link to="/reset-password" className="text-primary hover:underline">
              {t('auth.forgotPassword')}
            </Link>
          </div>
          <div className="mt-4 text-center text-sm">
            {t('auth.noAccount')}{" "}
            <Link to="/signup" className="text-primary hover:underline font-medium">
              {t('auth.signUp')}
            </Link>
          </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;