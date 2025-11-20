import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { BackToHomeButton } from "@/components/BackToHomeButton";
import { useTranslation } from "react-i18next";

const Login = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleClearFields = () => {
    setEmail("");
    setPassword("");
  };

  // Removed auto-redirect to allow users to manually enter credentials

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
        // Check if a plan was selected from pricing page
        const selectedPlan = localStorage.getItem("selected_plan");
        
        if (selectedPlan) {
          // Clear the selected plan from localStorage
          localStorage.removeItem("selected_plan");
          
          // For paid plans, you would redirect to checkout here
          // For now, just show a message and redirect to dashboard
          if (selectedPlan !== "free") {
            toast({
              title: t('auth.welcome'),
              description: t('auth.planSelected', { plan: selectedPlan }),
            });
          }
        } else {
          toast({
            title: t('auth.welcomeBack'),
            description: t('auth.loginSuccess'),
          });
        }
        
        navigate("/dashboard");
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
        // If test account doesn't exist, create it
        const { error: signUpError } = await supabase.auth.signUp({
          email: testEmail,
          password: testPassword,
        });

        if (signUpError) throw signUpError;

        // Try logging in again
        const { error: loginError } = await supabase.auth.signInWithPassword({
          email: testEmail,
          password: testPassword,
        });

        if (loginError) throw loginError;
      }

      toast({
        title: t('auth.testLoginSuccess'),
        description: t('auth.testLoginDesc'),
      });
      navigate("/dashboard");
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
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <div className="absolute top-4 left-4">
        <BackToHomeButton />
      </div>
      <Card className="w-full max-w-md">
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
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit" className="flex-1" disabled={loading}>
                {loading ? t('auth.signingIn') : t('auth.signIn')}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleClearFields}
                disabled={loading}
              >
                {t('common.clear')}
              </Button>
            </div>
          </form>

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
  );
};

export default Login;
