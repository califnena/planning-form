import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Label } from "@/components/ui/label";
import { Loader2, Search, User, Crown, UserPlus, Shield, ShieldCheck, Info, Star, Eye, UserCheck, Check, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { 
  adminListOrgUsers, 
  adminSetOrgRole, 
  adminAddExistingUserToOrg,
  getCurrentUserOrg,
  AdminUser,
  OrgRole
} from "@/lib/adminApi";
import { UserDetailDrawer } from "./UserDetailDrawer";
import { format } from "date-fns";

const ORG_ROLES: OrgRole[] = ['owner', 'admin', 'member', 'executor', 'vip'];

// Role definitions with capabilities
const ROLE_DEFINITIONS = {
  owner: {
    icon: Crown,
    color: "text-yellow-600 bg-yellow-50 border-yellow-200",
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

function RoleDefinitionsPopover() {
  const { t } = useTranslation();
  
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="h-5 w-5 ml-1">
          <Info className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[380px] p-0 z-50 bg-popover" align="start">
        <ScrollArea className="h-[420px]">
          <div className="p-4 space-y-3">
            <h4 className="font-semibold text-sm border-b pb-2">{t("admin.roles.roleDefinitions", "Role Definitions & Capabilities")}</h4>
            {Object.entries(ROLE_DEFINITIONS).map(([roleName, def]) => {
              const IconComponent = def.icon;
              return (
                <div key={roleName} className={`rounded-lg border p-3 ${def.color}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <IconComponent className="h-4 w-4" />
                    <span className="font-medium capitalize text-sm">{roleName}</span>
                  </div>
                  <ul className="space-y-1 text-xs">
                    {Object.entries(def.capabilities).map(([cap, hasAccess]) => (
                      <li key={cap} className="flex items-center gap-1.5">
                        {hasAccess ? (
                          <Check className="h-3 w-3 text-green-600 flex-shrink-0" />
                        ) : (
                          <X className="h-3 w-3 text-muted-foreground/50 flex-shrink-0" />
                        )}
                        <span className={hasAccess ? "" : "text-muted-foreground/60"}>
                          {CAPABILITY_LABELS[cap as keyof typeof CAPABILITY_LABELS]}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}

export function AdminUsersTab() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [orgId, setOrgId] = useState<string | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<AdminUser[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [addEmail, setAddEmail] = useState("");
  const [addRole, setAddRole] = useState<OrgRole>("member");
  const [adding, setAdding] = useState(false);
  const [updatingRoleFor, setUpdatingRoleFor] = useState<string | null>(null);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const org = await getCurrentUserOrg();
      if (!org) {
        throw new Error("Not a member of any organization");
      }
      setOrgId(org.orgId);
      
      const data = await adminListOrgUsers(org.orgId);
      setUsers(data);
      setFilteredUsers(data);
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
    loadUsers();
  }, []);

  useEffect(() => {
    let filtered = users;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(u => 
        u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.userId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.displayName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Role filter
    if (roleFilter !== "all") {
      filtered = filtered.filter(u => u.orgRole === roleFilter);
    }

    setFilteredUsers(filtered);
  }, [searchTerm, roleFilter, users]);

  const handleUserClick = (user: AdminUser) => {
    setSelectedUser(user);
    setDrawerOpen(true);
  };

  const handleRoleChange = async (userId: string, newRole: OrgRole, currentRole: OrgRole | null | undefined) => {
    if (!orgId) return;
    
    // Prevent changing owner's role (unless there are other owners)
    if (currentRole === "owner") {
      const ownerCount = users.filter(u => u.orgRole === "owner").length;
      if (ownerCount === 1) {
        toast({
          title: t("admin.error"),
          description: "Cannot change role of the only owner",
          variant: "destructive",
        });
        return;
      }
    }

    setUpdatingRoleFor(userId);
    try {
      await adminSetOrgRole({ orgId, userId, role: newRole });
      
      // Update local state
      setUsers(prev => prev.map(u => 
        u.userId === userId ? { ...u, orgRole: newRole } : u
      ));
      
      toast({
        title: t("admin.users.roleUpdated"),
        description: t("admin.users.roleUpdatedDescription", { role: newRole }),
      });
    } catch (error: any) {
      toast({
        title: t("admin.error"),
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUpdatingRoleFor(null);
    }
  };

  const handleAddUser = async () => {
    if (!addEmail.trim() || !orgId) return;
    setAdding(true);
    try {
      await adminAddExistingUserToOrg({
        orgId,
        email: addEmail.trim(),
        role: addRole,
      });
      
      toast({
        title: t("admin.users.memberAdded"),
        description: t("admin.users.existingUserAdded", { email: addEmail }),
      });
      
      setAddEmail("");
      setAddRole("member");
      setAddDialogOpen(false);
      loadUsers();
    } catch (error: any) {
      toast({
        title: t("admin.error"),
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setAdding(false);
    }
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
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              {t("admin.users.title")} ({filteredUsers.length})
            </CardTitle>
            <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <UserPlus className="mr-2 h-4 w-4" />
                  {t("admin.users.addMember")}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{t("admin.users.addMember")}</DialogTitle>
                  <DialogDescription>{t("admin.users.addMemberDescription")}</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="addEmail">{t("admin.users.email")}</Label>
                    <Input
                      id="addEmail"
                      type="email"
                      value={addEmail}
                      onChange={(e) => setAddEmail(e.target.value)}
                      placeholder={t("admin.users.emailPlaceholder")}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="addRole">{t("admin.users.role")}</Label>
                    <Select value={addRole} onValueChange={(v) => setAddRole(v as OrgRole)}>
                      <SelectTrigger>
                        <SelectValue placeholder={t("admin.users.selectRole")} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="member">Member</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="executor">Executor</SelectItem>
                        <SelectItem value="vip">VIP</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setAddDialogOpen(false)}>
                    {t("common.cancel")}
                  </Button>
                  <Button onClick={handleAddUser} disabled={adding || !addEmail.trim()}>
                    {adding && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {t("admin.users.addMember")}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-wrap gap-4 mb-6">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t("admin.users.searchPlaceholder")}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder={t("admin.users.filterByRole")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("admin.users.allRoles")}</SelectItem>
                <SelectItem value="owner">Owner</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="member">Member</SelectItem>
                <SelectItem value="executor">Executor</SelectItem>
                <SelectItem value="vip">VIP</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Users Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("admin.users.email")}</TableHead>
                  <TableHead>{t("admin.users.name")}</TableHead>
                  <TableHead>{t("admin.users.created")}</TableHead>
                  <TableHead>{t("admin.users.lastLogin")}</TableHead>
                  <TableHead>
                    <div className="flex items-center">
                      {t("admin.users.role")}
                      <RoleDefinitionsPopover />
                    </div>
                  </TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.userId} className="cursor-pointer hover:bg-muted/50">
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {user.orgRole === "owner" && <Crown className="h-4 w-4 text-yellow-500" />}
                        <span className="font-medium">{user.email || "Unknown"}</span>
                      </div>
                    </TableCell>
                    <TableCell>{user.displayName || "-"}</TableCell>
                    <TableCell>
                      {user.createdAt ? format(new Date(user.createdAt), "MMM d, yyyy") : "-"}
                    </TableCell>
                    <TableCell>
                      {user.lastSignInAt 
                        ? format(new Date(user.lastSignInAt), "MMM d, yyyy HH:mm")
                        : "-"
                      }
                    </TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center gap-2">
                        {updatingRoleFor === user.userId ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : user.orgRole === "owner" && users.filter(u => u.orgRole === "owner").length === 1 ? (
                          <div className="flex items-center gap-1">
                            <ShieldCheck className="h-4 w-4 text-yellow-500" />
                            <Badge variant="default" className="bg-yellow-500 hover:bg-yellow-600">
                              owner
                            </Badge>
                          </div>
                        ) : (
                          <Select 
                            value={user.orgRole || 'member'} 
                            onValueChange={(value) => handleRoleChange(user.userId, value as OrgRole, user.orgRole)}
                          >
                            <SelectTrigger className="w-[120px] h-8">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {ORG_ROLES.map(role => (
                                <SelectItem key={role} value={role}>
                                  {role}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleUserClick(user)}
                      >
                        {t("admin.users.details")}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredUsers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      {t("admin.users.noUsers")}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <UserDetailDrawer
        user={selectedUser}
        orgId={orgId}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        onUserUpdated={loadUsers}
      />
    </>
  );
}
