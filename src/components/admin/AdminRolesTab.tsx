import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Shield, Crown, UserCheck, Eye, Star, Check, X, Info } from "lucide-react";
import { OrgRole } from "@/lib/adminApi";

// Role definitions with capabilities
const ROLE_DEFINITIONS: Record<OrgRole, {
  icon: typeof Crown;
  color: string;
  capabilities: Record<string, boolean>;
}> = {
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
};

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

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          <div>
            <CardTitle>{t("admin.roles.title")}</CardTitle>
            <CardDescription>{t("admin.roles.description", "Organization roles are fixed. Use the Users tab to assign roles to members.")}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground mb-4">
            {t("admin.roles.orgRolesExplanation", "These are the available organization roles and their capabilities. Roles are assigned per-user in the Users tab.")}
          </p>
          
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {(Object.entries(ROLE_DEFINITIONS) as [OrgRole, typeof ROLE_DEFINITIONS[OrgRole]][]).map(([roleName, def]) => {
              const IconComponent = def.icon;
              return (
                <div key={roleName} className={`rounded-lg border p-4 ${def.color}`}>
                  <div className="flex items-center gap-2 mb-3">
                    <IconComponent className="h-5 w-5" />
                    <span className="font-semibold capitalize">{roleName}</span>
                  </div>
                  <ul className="space-y-1.5 text-sm">
                    {Object.entries(def.capabilities).map(([cap, hasAccess]) => (
                      <li key={cap} className="flex items-center gap-2">
                        {hasAccess ? (
                          <Check className="h-4 w-4 text-green-600 flex-shrink-0" />
                        ) : (
                          <X className="h-4 w-4 text-muted-foreground/50 flex-shrink-0" />
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
        </div>
      </CardContent>
    </Card>
  );
}
