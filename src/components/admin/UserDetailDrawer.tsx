import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Mail, Calendar, Crown, Shield, MessageSquare, Ban, CheckCircle, AlertTriangle, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { 
  AdminUser, 
  UserAdminMeta, 
  getUserAdminMeta, 
  updateUserAdminMeta, 
  blockUser,
  unblockUser,
  removeUserFromOrg
} from "@/lib/adminApi";

interface UserDetailDrawerProps {
  user: AdminUser | null;
  orgId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUserUpdated: () => void;
}

export function UserDetailDrawer({ user, orgId, open, onOpenChange, onUserUpdated }: UserDetailDrawerProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [adminMeta, setAdminMeta] = useState<UserAdminMeta | null>(null);
  const [notes, setNotes] = useState("");
  const [tags, setTags] = useState("");

  useEffect(() => {
    if (user && open) {
      loadUserDetails();
    }
  }, [user, open]);

  const loadUserDetails = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const meta = await getUserAdminMeta(user.userId);
      setAdminMeta(meta);
      setNotes(meta?.notes || "");
      setTags(meta?.tags?.join(", ") || "");
    } catch (error: any) {
      toast({
        title: t("admin.error"),
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveNotes = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await updateUserAdminMeta(user.userId, {
        notes,
        tags: tags.split(",").map(t => t.trim()).filter(Boolean),
      });
      toast({
        title: t("admin.users.notesSaved"),
      });
    } catch (error: any) {
      toast({
        title: t("admin.error"),
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSetContactedToday = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await updateUserAdminMeta(user.userId, {
        last_contacted_at: new Date().toISOString(),
      });
      setAdminMeta(prev => prev ? { ...prev, last_contacted_at: new Date().toISOString() } : null);
      toast({
        title: t("admin.users.contactedUpdated"),
      });
    } catch (error: any) {
      toast({
        title: t("admin.error"),
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleBlockToggle = async () => {
    if (!user || !orgId) return;
    
    // Prevent blocking owner
    if (user.orgRole === "owner") {
      toast({
        title: t("admin.users.cannotBlockOwner"),
        description: t("admin.users.ownerProtected"),
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      // We'll need to track blocked state differently since it's not in AdminUser anymore
      // For now, we'll just call the functions
      await blockUser(orgId, user.userId);
      toast({ title: t("admin.users.userBlocked") });
      onUserUpdated();
    } catch (error: any) {
      toast({
        title: t("admin.error"),
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleUnblock = async () => {
    if (!user || !orgId) return;
    setSaving(true);
    try {
      await unblockUser(orgId, user.userId);
      toast({ title: t("admin.users.userUnblocked") });
      onUserUpdated();
    } catch (error: any) {
      toast({
        title: t("admin.error"),
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveFromOrg = async () => {
    if (!user || !orgId) return;
    
    if (user.orgRole === "owner") {
      toast({
        title: t("admin.users.cannotRemoveOwner"),
        description: t("admin.users.ownerProtected"),
        variant: "destructive",
      });
      return;
    }

    if (!confirm(t("admin.users.confirmRemove", { email: user.email }))) {
      return;
    }

    setSaving(true);
    try {
      await removeUserFromOrg(orgId, user.userId);
      toast({ title: t("admin.users.userRemoved") });
      onOpenChange(false);
      onUserUpdated();
    } catch (error: any) {
      toast({
        title: t("admin.error"),
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (!user) return null;

  const isOwner = user.orgRole === "owner";

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            {isOwner && <Crown className="h-5 w-5 text-yellow-500" />}
            {t("admin.users.userDetails")}
          </SheetTitle>
          <SheetDescription>{user.email}</SheetDescription>
        </SheetHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <div className="space-y-6 mt-6">
            {/* Basic Info */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  {t("admin.users.basicInfo")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t("admin.users.userId")}</span>
                  <span className="font-mono text-xs">{user.userId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t("admin.users.name")}</span>
                  <span>{user.displayName || "-"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t("admin.users.created")}</span>
                  <span>{user.createdAt ? format(new Date(user.createdAt), "MMM d, yyyy") : "-"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t("admin.users.lastLogin")}</span>
                  <span>
                    {user.lastSignInAt 
                      ? format(new Date(user.lastSignInAt), "MMM d, yyyy HH:mm")
                      : "-"
                    }
                  </span>
                </div>
                <Separator className="my-2" />
               <div className="text-sm text-muted-foreground text-center py-2">
                 User contact: internal records only
               </div>
              </CardContent>
            </Card>

            {/* Role */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  {t("admin.users.role")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Badge 
                  variant={user.orgRole === "owner" ? "default" : user.orgRole === "admin" ? "destructive" : "secondary"}
                  className={user.orgRole === "owner" ? "bg-yellow-500" : ""}
                >
                  {user.orgRole || "member"}
                </Badge>
                <p className="text-xs text-muted-foreground mt-2">
                  {t("admin.users.roleChangeHint")}
                </p>
              </CardContent>
            </Card>

            {/* Account Actions */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Ban className="h-4 w-4" />
                  {t("admin.users.accountActions")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {isOwner ? (
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      {t("admin.users.ownerCannotBeBlocked")}
                    </AlertDescription>
                  </Alert>
                ) : (
                  <>
                    <div className="flex gap-2">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={handleBlockToggle}
                        disabled={saving}
                        className="flex-1"
                      >
                        {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        <Ban className="mr-2 h-4 w-4" />
                        {t("admin.users.blockUser")}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleUnblock}
                        disabled={saving}
                        className="flex-1"
                      >
                        <CheckCircle className="mr-2 h-4 w-4" />
                        {t("admin.users.unblockUser")}
                      </Button>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleRemoveFromOrg}
                      disabled={saving}
                      className="w-full text-destructive hover:text-destructive"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      {t("admin.users.removeFromOrg")}
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Admin Notes */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  {t("admin.users.adminNotes")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="tags">{t("admin.users.tags")}</Label>
                  <Input
                    id="tags"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    placeholder={t("admin.users.tagsPlaceholder")}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">{t("admin.users.notes")}</Label>
                  <Textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder={t("admin.users.notesPlaceholder")}
                    rows={4}
                  />
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    {t("admin.users.lastContacted")}: {" "}
                    {adminMeta?.last_contacted_at 
                      ? format(new Date(adminMeta.last_contacted_at), "MMM d, yyyy")
                      : t("admin.users.never")
                    }
                  </span>
                  <Button variant="outline" size="sm" onClick={handleSetContactedToday} disabled={saving}>
                    {t("admin.users.setToday")}
                  </Button>
                </div>
                <Button onClick={handleSaveNotes} disabled={saving} className="w-full">
                  {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {t("admin.users.saveNotes")}
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
