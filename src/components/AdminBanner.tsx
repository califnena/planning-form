import { Shield } from "lucide-react";
import { useAdminStatus } from "@/hooks/useAdminStatus";
import { Badge } from "@/components/ui/badge";

export const AdminBanner = () => {
  const { isAdmin, isLoading } = useAdminStatus();

  // Don't show anything while loading or if not admin
  if (isLoading || !isAdmin) {
    return null;
  }

  // Subtle admin badge instead of prominent banner
  return (
    <div className="fixed top-2 right-2 z-50">
      <Badge variant="outline" className="bg-muted/80 text-muted-foreground border-muted-foreground/30 text-xs font-medium gap-1 px-2 py-1">
        <Shield className="h-3 w-3" />
        Admin
      </Badge>
    </div>
  );
};
