import { User, LogOut, Sparkles, Receipt, Shield, Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useAdminStatus } from "@/hooks/useAdminStatus";

export const ProfileDropdown = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<{ full_name?: string; avatar_url?: string } | null>(null);
  const [userEmail, setUserEmail] = useState<string>("");
  const [isVIP, setIsVIP] = useState(false);
  
  // Use the dedicated admin status hook
  const { isAdmin } = useAdminStatus();

  useEffect(() => {
    let isMounted = true;
    
    const loadProfile = async () => {
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError || !user) {
          return;
        }

        if (isMounted) {
          setUserEmail(user.email || "");
        }
        
        // Load profile data
        const { data: profileData } = await supabase
          .from("profiles")
          .select("full_name, avatar_url")
          .eq("id", user.id)
          .single();
        
        if (profileData && isMounted) {
          setProfile(profileData);
        }

        // Check VIP access via role-based system
        const { data: hasVIPAccess } = await supabase
          .rpc('has_vip_access', { _user_id: user.id });
        
        if (hasVIPAccess && isMounted) {
          setIsVIP(true);
        } else if (isMounted) {
          const { data: subscriptionData } = await supabase
            .from("subscriptions")
            .select("plan_type")
            .eq("user_id", user.id)
            .eq("status", "active")
            .maybeSingle();
          
          setIsVIP(subscriptionData?.plan_type === "vip_annual" || subscriptionData?.plan_type === "vip_monthly");
        }
      } catch (error) {
        console.error('Error in loadProfile:', error);
      }
    };

    loadProfile();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        loadProfile();
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const getInitials = () => {
    if (profile?.full_name) {
      return profile.full_name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    return userEmail.charAt(0).toUpperCase();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-9 w-9 rounded-full">
          <Avatar className="h-9 w-9">
            <AvatarImage src={profile?.avatar_url} alt={profile?.full_name || userEmail} />
            <AvatarFallback className="bg-primary text-primary-foreground">
              {getInitials()}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{profile?.full_name || "User"}</p>
            <p className="text-xs leading-none text-muted-foreground">{userEmail}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => navigate("/preplansteps/profile")}>
          <User className="mr-2 h-4 w-4" />
          <span>Account</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate("/settings")}>
          <Settings className="mr-2 h-4 w-4" />
          <span>Preferences</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate("/pricing")}>
          <Receipt className="mr-2 h-4 w-4" />
          <span>Subscription & Billing</span>
        </DropdownMenuItem>
        {isAdmin && (
          <DropdownMenuItem onClick={() => navigate("/admin")}>
            <Shield className="mr-2 h-4 w-4" />
            <span>{t("header.adminPanel")}</span>
          </DropdownMenuItem>
        )}
        {isVIP && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate("/vip-coach")} className="text-primary">
              <Sparkles className="mr-2 h-4 w-4" />
              <span>{t("header.vipCoachAssistant")}</span>
            </DropdownMenuItem>
          </>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>{t("header.signOut")}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
