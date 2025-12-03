import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Mail, Calendar, Crown, Shield, CreditCard, MessageSquare, Ban, CheckCircle, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { 
  AdminUser, 
  UserAdminMeta, 
  getUserAdminMeta, 
  updateUserAdminMeta, 
  addUserRole, 
  removeUserRole,
  listRoles,
  AppRole,
  blockUser,
  unblockUser
} from "@/lib/adminApi";

interface UserDetailDrawerProps {
  user: AdminUser | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUserUpdated: () => void;
}

export function UserDetailDrawer({ user, open, onOpenChange, onUserUpdated }: UserDetailDrawerProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [allRoles, setAllRoles] = useState<AppRole[]>([]);
  const [userRoles, setUserRoles] = useState<string[]>([]);
  const [adminMeta, setAdminMeta] = useState<UserAdminMeta | null>(null);
  const [notes, setNotes] = useState("");
  const [tags, setTags] = useState("");
  const [isBlocked, setIsBlocked] = useState(false);

  useEffect(() => {
    if (user && open) {
      loadUserDetails();
      setIsBlocked(user.is_blocked);
    }
  }, [user, open]);

  const loadUserDetails = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [roles, meta] = await Promise.all([
        listRoles(),
        getUserAdminMeta(user.id)
      ]);
      setAllRoles(roles);
      setUserRoles(user.roles);
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

  const handleRoleChange = async (roleName: string, checked: boolean) => {
    if (!user) return;
    
    // Prevent removing admin from owner
    if (roleName === "admin" && !checked && user.is_owner) {
      toast({
        title: t("admin.users.cannotRemoveOwnerAdmin"),
        description: t("admin.users.ownerAdminProtected"),
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      if (checked) {
        await addUserRole(user.id, roleName);
        setUserRoles([...userRoles, roleName]);
      } else {
        await removeUserRole(user.id, roleName);
        setUserRoles(userRoles.filter(r => r !== roleName));
      }
      toast({
        title: t("admin.users.roleUpdated"),
        description: checked 
          ? t("admin.users.roleAdded", { role: roleName })
          : t("admin.users.roleRemoved", { role: roleName }),
      });
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

  const handleSaveNotes = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await updateUserAdminMeta(user.id, {
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
      await updateUserAdminMeta(user.id, {
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
    if (!user) return;
    
    // Prevent blocking owner
    if (user.is_owner) {
      toast({
        title: t("admin.users.cannotBlockOwner"),
        description: t("admin.users.ownerProtected"),
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      if (isBlocked) {
        await unblockUser(user.id);
        setIsBlocked(false);
        toast({ title: t("admin.users.userUnblocked") });
      } else {
        await blockUser(user.id);
        setIsBlocked(true);
        toast({ title: t("admin.users.userBlocked") });
      }
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

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            {user.is_owner && <Crown className="h-5 w-5 text-yellow-500" />}
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
                  <span className="font-mono text-xs">{user.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t("admin.users.created")}</span>
                  <span>{format(new Date(user.created_at), "MMM d, yyyy")}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t("admin.users.logins")}</span>
                  <span>{user.login_count}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t("admin.users.lastLogin")}</span>
                  <span>
                    {user.last_login_at 
                      ? format(new Date(user.last_login_at), "MMM d, yyyy HH:mm")
                      : "-"
                    }
                  </span>
                </div>
                <Separator className="my-2" />
                <Button variant="outline" size="sm" className="w-full" asChild>
                  <a href={`mailto:${user.email}`}>
                    <Mail className="mr-2 h-4 w-4" />
                    {t("admin.users.sendEmail")}
                  </a>
                </Button>
              </CardContent>
            </Card>

            {/* Roles */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  {t("admin.users.roles")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {allRoles.map((role) => (
                    <div key={role.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={role.id}
                        checked={userRoles.includes(role.name)}
                        onCheckedChange={(checked) => handleRoleChange(role.name, checked as boolean)}
                        disabled={saving || (role.name === "admin" && user.is_owner)}
                      />
                      <Label 
                        htmlFor={role.id} 
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <Badge variant={role.name === "admin" ? "destructive" : "secondary"}>
                          {role.name}
                        </Badge>
                        {role.name === "admin" && user.is_owner && (
                          <span className="text-xs text-muted-foreground">
                            ({t("admin.users.ownerProtected")})
                          </span>
                        )}
                      </Label>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Account Status */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  {isBlocked ? <Ban className="h-4 w-4 text-destructive" /> : <CheckCircle className="h-4 w-4 text-green-500" />}
                  {t("admin.users.accountStatus")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Badge variant={isBlocked ? "destructive" : "default"}>
                      {isBlocked ? t("admin.users.blocked") : t("admin.users.active")}
                    </Badge>
                  </div>
                </div>
                
                {user.is_owner ? (
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      {t("admin.users.ownerCannotBeBlocked")}
                    </AlertDescription>
                  </Alert>
                ) : (
                  <Button
                    variant={isBlocked ? "default" : "destructive"}
                    size="sm"
                    onClick={handleBlockToggle}
                    disabled={saving}
                    className="w-full"
                  >
                    {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isBlocked ? (
                      <>
                        <CheckCircle className="mr-2 h-4 w-4" />
                        {t("admin.users.unblockUser")}
                      </>
                    ) : (
                      <>
                        <Ban className="mr-2 h-4 w-4" />
                        {t("admin.users.blockUser")}
                      </>
                    )}
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Billing */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  {t("admin.users.billing")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t("admin.users.currentPlan")}</span>
                  <span>
                    {user.active_plan ? (
                      <Badge>{user.active_plan}</Badge>
                    ) : (
                      <span className="text-muted-foreground">Free</span>
                    )}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t("admin.users.status")}</span>
                  <span>{user.plan_status || "-"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t("admin.users.renewsAt")}</span>
                  <span>
                    {user.plan_renews_at 
                      ? format(new Date(user.plan_renews_at), "MMM d, yyyy")
                      : "-"
                    }
                  </span>
                </div>
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
