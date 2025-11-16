import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { GlobalHeader } from "@/components/GlobalHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Upload, ArrowLeft } from "lucide-react";
import { LanguageSelector } from "@/components/LanguageSelector";

export default function Profile() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userId, setUserId] = useState<string>("");
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/login");
        return;
      }
      setUserId(user.id);
      setEmail(user.email || "");
      
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (profile) {
        setFullName(profile.full_name || "");
        setAvatarUrl(profile.avatar_url || "");
      }
      setLoading(false);
    };

    checkAuth();
  }, [navigate]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .upsert({
          id: userId,
          full_name: fullName,
          avatar_url: avatarUrl,
        });

      if (error) throw error;

      toast({
        title: t("profile.profileUpdated"),
        description: t("profile.profileUpdatedDescription"),
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSaving(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${userId}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from("funeral-photos")
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: signedUrlData, error: urlError } = await supabase.storage
        .from("funeral-photos")
        .createSignedUrl(fileName, 3600); // 1 hour expiration

      if (urlError) throw urlError;
      
      setAvatarUrl(signedUrlData.signedUrl);
      
      toast({
        title: t("profile.avatarUploaded"),
        description: t("profile.avatarUploadedDescription"),
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <>
      <GlobalHeader />
      <div className="container max-w-2xl py-8">
      <Button 
        variant="ghost" 
        onClick={() => navigate("/app")}
        className="mb-6"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        {t("profile.returnHome")}
      </Button>
      
      <Card>
        <CardHeader>
          <CardTitle>{t("profile.title")}</CardTitle>
          <CardDescription>{t("profile.description")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={avatarUrl} alt={fullName} />
              <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                {fullName?.charAt(0)?.toUpperCase() || email.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <Label htmlFor="avatar-upload" className="cursor-pointer">
                <div className="flex items-center gap-2 text-sm text-primary hover:underline">
                  <Upload className="h-4 w-4" />
                  {t("profile.uploadPhoto")}
                </div>
              </Label>
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarUpload}
                disabled={saving}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">{t("profile.emailLabel")}</Label>
            <Input
              id="email"
              type="email"
              value={email}
              disabled
              className="bg-muted"
            />
            <p className="text-xs text-muted-foreground">
              {t("profile.emailDisabled")}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="fullName">{t("profile.fullNameLabel")}</Label>
            <Input
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder={t("profile.fullNamePlaceholder")}
            />
          </div>

          <div className="space-y-2">
            <Label>Language / Idioma</Label>
            <LanguageSelector />
          </div>

          <Button onClick={handleSave} disabled={saving}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {t("profile.saveChanges")}
          </Button>
        </CardContent>
      </Card>
    </div>
    </>
  );
}
