import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { GlobalHeader } from "@/components/GlobalHeader";
import { AdminBanner } from "@/components/AdminBanner";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, ArrowLeft, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { checkIsAdmin } from "@/lib/adminApi";
import { AdminUsersTab } from "@/components/admin/AdminUsersTab";
import { AdminRolesTab } from "@/components/admin/AdminRolesTab";
import { AdminBillingTab } from "@/components/admin/AdminBillingTab";

export default function AdminPanel() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAccess = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/login");
        return;
      }

      const adminStatus = await checkIsAdmin();
      if (!adminStatus) {
        toast({
          title: t("admin.accessDenied"),
          description: t("admin.accessDeniedDescription"),
          variant: "destructive",
        });
        navigate("/app");
        return;
      }

      setIsAdmin(true);
      setLoading(false);
    };

    checkAccess();
  }, [navigate, toast, t]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <>
      <AdminBanner />
      <GlobalHeader />
      <div className="container py-8">
        <Button 
          variant="ghost" 
          onClick={() => navigate("/app/profile")}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t("admin.backToProfile")}
        </Button>

        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Shield className="h-8 w-8 text-primary" />
              <div>
                <CardTitle className="text-2xl">{t("admin.title")}</CardTitle>
                <CardDescription>{t("admin.description")}</CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>

        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 max-w-md">
            <TabsTrigger value="users">{t("admin.tabs.users")}</TabsTrigger>
            <TabsTrigger value="roles">{t("admin.tabs.roles")}</TabsTrigger>
            <TabsTrigger value="billing">{t("admin.tabs.billing")}</TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <AdminUsersTab />
          </TabsContent>

          <TabsContent value="roles">
            <AdminRolesTab />
          </TabsContent>

          <TabsContent value="billing">
            <AdminBillingTab />
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
