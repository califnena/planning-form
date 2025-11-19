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

const Signup = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleClearFields = () => {
    setEmail("");
    setPassword("");
    setConfirmPassword("");
  };

  useEffect(() => {
    // Check if user is already logged in
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate("/dashboard");
      }
    };
    checkUser();
  }, [navigate]);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast({
        title: t('auth.passwordsNoMatch'),
        description: t('auth.passwordsNoMatchDesc'),
        variant: "destructive",
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: t('auth.passwordTooShort'),
        description: t('auth.passwordTooShortDesc'),
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}`,
      },
    });

      if (error) throw error;

      if (data.user) {
        await createOrgForUser(data.user.id, email);
        
        // Check if a plan was selected from pricing page
        const selectedPlan = localStorage.getItem("selected_plan");
        
        if (selectedPlan) {
          // Clear the selected plan from localStorage
          localStorage.removeItem("selected_plan");
          
          // For paid plans, you would redirect to checkout here
          // For now, just show a message
          if (selectedPlan !== "free") {
            toast({
              title: t('auth.accountCreated'),
              description: t('auth.planSelected', { plan: selectedPlan }),
            });
          } else {
            toast({
              title: t('auth.accountCreated'),
              description: t('auth.welcomeToPlanner'),
            });
          }
        } else {
          toast({
            title: t('auth.accountCreated'),
            description: t('auth.welcomeToPlanner'),
          });
        }
        
        navigate("/dashboard");
      }
    } catch (error: any) {
      toast({
        title: t('auth.signupFailed'),
        description: error.message || t('auth.couldNotCreateAccount'),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createOrgForUser = async (userId: string, email: string) => {
    // Create org and assign user as owner
    const { data: orgData, error: orgError } = await supabase
      .from("orgs")
      .insert({ name: `${email}'s Organization` })
      .select()
      .single();

    if (orgError) throw orgError;

    // Add user to org as owner
    const { error: memberError } = await supabase
      .from("org_members")
      .insert({
        org_id: orgData.id,
        user_id: userId,
        role: "owner",
      });

    if (memberError) throw memberError;
  };

  const handleGoogleSignup = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
          queryParams: { 
            access_type: 'offline',
            prompt: 'consent'
          },
        },
      });

      if (error) throw error;

      // The browser will redirect to Google's OAuth page
      // After authorization, Google redirects back to Supabase
      // Supabase then redirects to our redirectTo URL
    } catch (error: any) {
      let errorMessage = "Could not sign up with Google. Please try again later.";
      
      // Handle specific OAuth errors
      if (error.message?.includes("redirect_uri_mismatch")) {
        errorMessage = t('auth.googleConfigError');
        console.error("OAuth redirect_uri_mismatch error. Ensure these URLs are whitelisted in Google Cloud Console:", {
          supabaseCallback: "https://bhhmizhxxpckibxudbrq.supabase.co/auth/v1/callback",
          appRedirect: `${window.location.origin}/dashboard`
        });
      } else if (error.message?.includes("provider")) {
        errorMessage = t('auth.googleProviderError');
      }

      toast({
        title: t('auth.googleSignUpFailed'),
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <div className="absolute top-4 left-4">
        <BackToHomeButton />
      </div>
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">{t('auth.createAccount')}</CardTitle>
          <CardDescription className="text-center">
            {t('auth.createAccountDesc')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignup} className="space-y-4">
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
                placeholder={t('auth.passwordPlaceholder')}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">{t('auth.confirmPassword')}</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder={t('auth.confirmPasswordPlaceholder')}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit" className="flex-1" disabled={loading}>
                {loading ? t('auth.creatingAccount') : t('auth.createAccount')}
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
              <span className="bg-card px-2 text-muted-foreground">{t('auth.orContinueWith')}</span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={handleGoogleSignup}
          >
...
            {t('auth.continueWithGoogle')}
          </Button>

          <div className="mt-4 text-center text-sm">
            {t('auth.alreadyHaveAccount')}{" "}
            <Link to="/login" className="text-primary hover:underline font-medium">
              {t('auth.signIn')}
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Signup;
