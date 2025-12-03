import { Shield } from "lucide-react";
import { useAdminStatus } from "@/hooks/useAdminStatus";

export const AdminBanner = () => {
  const { isAdmin, isLoading } = useAdminStatus();

  // Don't show anything while loading or if not admin
  if (isLoading || !isAdmin) {
    return null;
  }

  return (
    <div className="bg-yellow-400 text-black py-2 px-4 text-center font-bold flex items-center justify-center gap-2 z-50">
      <Shield className="h-5 w-5" />
      <span>ADMIN</span>
      <Shield className="h-5 w-5" />
    </div>
  );
};
