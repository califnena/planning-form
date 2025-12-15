import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Loader2, Plus, Shield, Pencil, Trash2, AlertTriangle, Crown, UserCheck, Eye, Star, Check, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { listRoles, createRole, updateRole, deleteRole, AppRole, PROTECTED_ROLES } from "@/lib/adminApi";

// Role definitions with capabilities
const ROLE_DEFINITIONS = {
  owner: {
    icon: Crown,
    color: "text-yellow-600 bg-yellow-50 border-yellow-200",
    badgeVariant: "default" as const,
    capabilities: {
      manageMembers: true,
      manageRoles: true,
      accessAdmin: true,
      viewAllPlans: true,
      editOwnPlan: true,
      accessVIP: true,
      canBeRemoved: false,
    }
  },
  admin: {
    icon: Shield,
    color: "text-red-600 bg-red-50 border-red-200",
    badgeVariant: "destructive" as const,
    capabilities: {
      manageMembers: true,
      manageRoles: true,
      accessAdmin: true,
      viewAllPlans: true,
      editOwnPlan: true,
      accessVIP: true,
      canBeRemoved: true,
    }
  },
  vip: {
    icon: Star,
    color: "text-purple-600 bg-purple-50 border-purple-200",
    badgeVariant: "secondary" as const,
    capabilities: {
      manageMembers: false,
      manageRoles: false,
      accessAdmin: false,
      viewAllPlans: false,
      editOwnPlan: true,
      accessVIP: true,
      canBeRemoved: true,
    }
  },
  executor: {
    icon: Eye,
    color: "text-blue-600 bg-blue-50 border-blue-200",
    badgeVariant: "secondary" as const,
    capabilities: {
      manageMembers: false,
      manageRoles: false,
      accessAdmin: false,
      viewAllPlans: true,
      editOwnPlan: false,
      accessVIP: false,
      canBeRemoved: true,
    }
  },
  member: {
    icon: UserCheck,
    color: "text-green-600 bg-green-50 border-green-200",
    badgeVariant: "secondary" as const,
    capabilities: {
      manageMembers: false,
      manageRoles: false,
      accessAdmin: false,
      viewAllPlans: false,
      editOwnPlan: true,
      accessVIP: false,
      canBeRemoved: true,
    }
  },
} as const;

const CAPABILITY_LABELS = {
  manageMembers: "Add/remove workspace members",
  manageRoles: "Change member roles",
  accessAdmin: "Access Admin Panel",
  viewAllPlans: "View all plans in workspace",
  editOwnPlan: "Edit own plan",
  accessVIP: "Access VIP Coach features",
  canBeRemoved: "Can be removed from workspace",
};

export function AdminRolesTab() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [newRoleName, setNewRoleName] = useState("");
  const [newRoleDescription, setNewRoleDescription] = useState("");
  const [editingRole, setEditingRole] = useState<AppRole | null>(null);
  const [editDescription, setEditDescription] = useState("");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const loadRoles = async () => {
    setLoading(true);
    try {
      const data = await listRoles();
      setRoles(data);
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

  useEffect(() => {
    loadRoles();
  }, []);

  const handleCreateRole = async () => {
    if (!newRoleName.trim()) return;
    setSaving(true);
    try {
      await createRole(newRoleName.trim(), newRoleDescription.trim() || undefined);
      toast({
        title: t("admin.roles.roleCreated"),
        description: t("admin.roles.roleCreatedDescription", { name: newRoleName }),
      });
      setNewRoleName("");
      setNewRoleDescription("");
      setCreateDialogOpen(false);
      loadRoles();
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

  const handleEditRole = async () => {
    if (!editingRole) return;
    setSaving(true);
    try {
      await updateRole(editingRole.id, editDescription);
      toast({
        title: t("admin.roles.roleUpdated"),
      });
      setEditDialogOpen(false);
      setEditingRole(null);
      loadRoles();
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

  const handleDeleteRole = async (role: AppRole) => {
    if (PROTECTED_ROLES.includes(role.name)) {
      toast({
        title: t("admin.roles.cannotDelete"),
        description: t("admin.roles.protectedRole"),
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      await deleteRole(role.id);
      toast({
        title: t("admin.roles.roleDeleted"),
      });
      loadRoles();
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

  const openEditDialog = (role: AppRole) => {
    setEditingRole(role);
    setEditDescription(role.description || "");
    setEditDialogOpen(true);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              {t("admin.roles.title")}
            </CardTitle>
            <CardDescription>{t("admin.roles.description")}</CardDescription>
          </div>
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                {t("admin.roles.addRole")}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t("admin.roles.createRole")}</DialogTitle>
                <DialogDescription>{t("admin.roles.createRoleDescription")}</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="roleName">{t("admin.roles.name")}</Label>
                  <Input
                    id="roleName"
                    value={newRoleName}
                    onChange={(e) => setNewRoleName(e.target.value)}
                    placeholder={t("admin.roles.namePlaceholder")}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="roleDescription">{t("admin.roles.descriptionLabel")}</Label>
                  <Input
                    id="roleDescription"
                    value={newRoleDescription}
                    onChange={(e) => setNewRoleDescription(e.target.value)}
                    placeholder={t("admin.roles.descriptionPlaceholder")}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                  {t("common.cancel")}
                </Button>
                <Button onClick={handleCreateRole} disabled={saving || !newRoleName.trim()}>
                  {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {t("admin.roles.create")}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Role Definitions Section */}
        <div>
          <h3 className="text-lg font-semibold mb-4">{t("admin.roles.roleDefinitions")}</h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Object.entries(ROLE_DEFINITIONS).map(([roleName, def]) => {
              const IconComponent = def.icon;
              return (
                <div 
                  key={roleName} 
                  className={`rounded-lg border p-4 ${def.color}`}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <IconComponent className="h-5 w-5" />
                    <span className="font-semibold capitalize">{roleName}</span>
                  </div>
                  <ul className="space-y-1.5 text-sm">
                    {Object.entries(def.capabilities).map(([cap, hasAccess]) => (
                      <li key={cap} className="flex items-center gap-2">
                        {hasAccess ? (
                          <Check className="h-3.5 w-3.5 text-green-600 flex-shrink-0" />
                        ) : (
                          <X className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                        )}
                        <span className={hasAccess ? "" : "text-muted-foreground"}>
                          {CAPABILITY_LABELS[cap as keyof typeof CAPABILITY_LABELS]}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>

        {/* Existing Roles Table */}
        <div>
          <h3 className="text-lg font-semibold mb-4">{t("admin.roles.allRoles")}</h3>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("admin.roles.name")}</TableHead>
                  <TableHead>{t("admin.roles.descriptionLabel")}</TableHead>
                  <TableHead>{t("admin.roles.created")}</TableHead>
                  <TableHead>{t("admin.roles.protected")}</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {roles.map((role) => (
                  <TableRow key={role.id}>
                    <TableCell>
                      <Badge variant={role.name === "admin" ? "destructive" : "secondary"}>
                        {role.name}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {role.description || "-"}
                    </TableCell>
                    <TableCell>
                      {format(new Date(role.created_at), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell>
                      {PROTECTED_ROLES.includes(role.name) ? (
                        <Badge variant="outline" className="text-yellow-600">
                          <AlertTriangle className="mr-1 h-3 w-3" />
                          {t("admin.roles.builtIn")}
                        </Badge>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditDialog(role)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        {!PROTECTED_ROLES.includes(role.name) && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteRole(role)}
                            disabled={saving}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </CardContent>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("admin.roles.editRole")}</DialogTitle>
            <DialogDescription>
              {t("admin.roles.editRoleDescription", { name: editingRole?.name })}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="editDescription">{t("admin.roles.descriptionLabel")}</Label>
              <Input
                id="editDescription"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                placeholder={t("admin.roles.descriptionPlaceholder")}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              {t("common.cancel")}
            </Button>
            <Button onClick={handleEditRole} disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t("common.save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
