import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Loader2, ShieldPlus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface AssignAdminDialogProps {
  onAdminAssigned?: () => void;
}

export function AssignAdminDialog({ onAdminAssigned }: AssignAdminDialogProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAssignAdmin = async () => {
    if (!email.trim()) return;
    setLoading(true);

    try {
      // First, get user emails from edge function to find the user
      const { data: authData, error: authError } = await supabase.functions.invoke('admin-user-management', {
        body: { action: 'get_users' }
      });

      if (authError) throw authError;

      const targetUser = authData?.users?.find((u: any) => 
        u.email?.toLowerCase() === email.trim().toLowerCase()
      );

      if (!targetUser) {
        toast({
          title: t('admin.assignAdmin.userNotFound'),
          description: t('admin.assignAdmin.userNotFoundDesc', { email: email.trim() }),
          variant: "destructive",
        });
        return;
      }

      // Check if user already has admin role
      const { data: existingRoles } = await supabase
        .from('user_roles')
        .select('role_id, app_roles!inner(name)')
        .eq('user_id', targetUser.id);

      const hasAdmin = existingRoles?.some((r: any) => r.app_roles?.name === 'admin');
      
      if (hasAdmin) {
        toast({
          title: t('admin.assignAdmin.alreadyAdmin'),
          description: t('admin.assignAdmin.alreadyAdminDesc', { email: email.trim() }),
        });
        return;
      }

      // Get admin role ID
      const { data: adminRole } = await supabase
        .from('app_roles')
        .select('id')
        .eq('name', 'admin')
        .single();

      if (!adminRole) throw new Error('Admin role not found');

      // Assign admin role
      const { error: insertError } = await supabase
        .from('user_roles')
        .insert({
          user_id: targetUser.id,
          role_id: adminRole.id
        });

      if (insertError) throw insertError;

      toast({
        title: t('admin.assignAdmin.success'),
        description: t('admin.assignAdmin.successDesc', { email: email.trim() }),
      });

      setEmail("");
      setOpen(false);
      onAdminAssigned?.();
    } catch (error: any) {
      toast({
        title: t('admin.error'),
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <ShieldPlus className="mr-2 h-4 w-4" />
          {t('admin.assignAdmin.title')}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('admin.assignAdmin.title')}</DialogTitle>
          <DialogDescription>{t('admin.assignAdmin.description')}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="adminEmail">{t('admin.assignAdmin.emailLabel')}</Label>
            <Input
              id="adminEmail"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t('admin.assignAdmin.emailPlaceholder')}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            {t('common.cancel')}
          </Button>
          <Button onClick={handleAssignAdmin} disabled={loading || !email.trim()}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {loading ? t('admin.assignAdmin.assigning') : t('admin.assignAdmin.assignButton')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
