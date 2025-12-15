import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Loader2, Search, User, Crown, UserPlus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { listUsers, AdminUser, inviteUser } from "@/lib/adminApi";
import { UserDetailDrawer } from "./UserDetailDrawer";
import { format } from "date-fns";

export function AdminUsersTab() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<AdminUser[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviting, setInviting] = useState(false);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await listUsers();
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
        u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Role filter
    if (roleFilter !== "all") {
      filtered = filtered.filter(u => u.roles.includes(roleFilter));
    }

    // Status filter
    if (statusFilter !== "all") {
      if (statusFilter === "active") {
        filtered = filtered.filter(u => u.plan_status === "active");
      } else if (statusFilter === "none") {
        filtered = filtered.filter(u => !u.active_plan);
      } else {
        filtered = filtered.filter(u => u.plan_status === statusFilter);
      }
    }

    setFilteredUsers(filtered);
  }, [searchTerm, roleFilter, statusFilter, users]);

  const handleUserClick = (user: AdminUser) => {
    setSelectedUser(user);
    setDrawerOpen(true);
  };

  const handleInviteUser = async () => {
    if (!inviteEmail.trim()) return;
    setInviting(true);
    try {
      await inviteUser(inviteEmail.trim());
      toast({
        title: t("admin.users.inviteSent"),
        description: t("admin.users.inviteSentDescription", { email: inviteEmail }),
      });
      setInviteEmail("");
      setInviteDialogOpen(false);
      loadUsers();
    } catch (error: any) {
      // Check if user already exists
      if (error.message?.includes("already exists") || error.message?.includes("already been registered")) {
        toast({
          title: t("admin.users.userAlreadyExists"),
          description: t("admin.users.userAlreadyExistsDesc"),
          variant: "destructive",
        });
      } else {
        toast({
          title: t("admin.error"),
          description: error.message,
          variant: "destructive",
        });
      }
    } finally {
      setInviting(false);
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
            <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <UserPlus className="mr-2 h-4 w-4" />
                  {t("admin.users.inviteUser")}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{t("admin.users.inviteUser")}</DialogTitle>
                  <DialogDescription>{t("admin.users.inviteUserDescription")}</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="inviteEmail">{t("admin.users.email")}</Label>
                    <Input
                      id="inviteEmail"
                      type="email"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      placeholder={t("admin.users.emailPlaceholder")}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setInviteDialogOpen(false)}>
                    {t("common.cancel")}
                  </Button>
                  <Button onClick={handleInviteUser} disabled={inviting || !inviteEmail.trim()}>
                    {inviting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {t("admin.users.sendInvite")}
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
                <SelectItem value="basic">Basic</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder={t("admin.users.filterByStatus")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("admin.users.allStatuses")}</SelectItem>
                <SelectItem value="active">{t("admin.users.active")}</SelectItem>
                <SelectItem value="canceled">{t("admin.users.canceled")}</SelectItem>
                <SelectItem value="none">{t("admin.users.noSubscription")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Users Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                    <TableHead>{t("admin.users.email")}</TableHead>
                    <TableHead>{t("admin.users.created")}</TableHead>
                    <TableHead>{t("admin.users.status")}</TableHead>
                    <TableHead>{t("admin.users.logins")}</TableHead>
                    <TableHead>{t("admin.users.lastLogin")}</TableHead>
                    <TableHead>{t("admin.users.roles")}</TableHead>
                    <TableHead>{t("admin.users.plan")}</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id} className="cursor-pointer hover:bg-muted/50">
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {user.is_owner && <Crown className="h-4 w-4 text-yellow-500" />}
                          <span className="font-medium">{user.email}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {format(new Date(user.created_at), "MMM d, yyyy")}
                      </TableCell>
                      <TableCell>
                        <Badge variant={user.is_blocked ? "destructive" : "default"}>
                          {user.is_blocked ? t("admin.users.blocked") : t("admin.users.active")}
                        </Badge>
                      </TableCell>
                      <TableCell>{user.login_count}</TableCell>
                      <TableCell>
                        {user.last_login_at 
                          ? format(new Date(user.last_login_at), "MMM d, yyyy HH:mm")
                          : "-"
                        }
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {user.roles.length > 0 ? (
                            user.roles.map((role) => (
                              <Badge key={role} variant={role === "admin" ? "destructive" : "secondary"}>
                                {role}
                              </Badge>
                            ))
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {user.active_plan ? (
                          <Badge variant="default">{user.active_plan}</Badge>
                        ) : (
                          <span className="text-muted-foreground">{t("common.free")}</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleUserClick(user)}
                        >
                          {t("admin.users.view")}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredUsers.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
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
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        onUserUpdated={loadUsers}
      />
    </>
  );
}
