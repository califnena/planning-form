import { User, LogOut, Settings, CreditCard, Sparkles, Receipt, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";
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
import { useToast } from "@/hooks/use-toast";

export const ProfileDropdown = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profile, setProfile] = useState<{ full_name?: string; avatar_url?: string } | null>(null);
  const [userEmail, setUserEmail] = useState<string>("");
  const [isVIP, setIsVIP] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    
    const loadProfile = async () => {
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError || !user) {
          console.error('Error getting user:', userError);
          if (isMounted) setIsLoading(false);
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

        // Check admin status FIRST and log extensively
        console.log('Checking admin for user:', user.id, user.email);
        const { data: adminData, error: adminError } = await supabase
          .rpc('has_app_role', { _user_id: user.id, _role: 'admin' });
        
        console.log('Admin RPC response - data:', adminData, 'error:', adminError, 'type:', typeof adminData);
        
        if (isMounted) {
          const adminStatus = adminData === true;
          console.log('Setting isAdmin to:', adminStatus);
          setIsAdmin(adminStatus);
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
        
        if (isMounted) setIsLoading(false);
      } catch (error) {
        console.error('Error in loadProfile:', error);
        if (isMounted) setIsLoading(false);
      }
    };

    loadProfile();

    // Listen for auth state changes to re-check admin status
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event);
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

  // Debug log current state
  console.log('ProfileDropdown render - isAdmin:', isAdmin, 'isLoading:', isLoading);

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
          {/* Temporary debug badge - remove after confirming admin works */}
          {isAdmin && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[8px] px-1 rounded-full">
              ADM
            </span>
          )}
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
        <DropdownMenuItem onClick={() => navigate("/app/profile")}>
          <User className="mr-2 h-4 w-4" />
          <span>Account</span>
        </DropdownMenuItem>
        {isAdmin && (
          <DropdownMenuItem onClick={() => navigate("/admin")}>
            <Shield className="mr-2 h-4 w-4" />
            <span>Admin Panel</span>
          </DropdownMenuItem>
        )}
        <DropdownMenuItem onClick={() => navigate("/plans")}>
          <Receipt className="mr-2 h-4 w-4" />
          <span>Subscription & Billing</span>
        </DropdownMenuItem>
        {isVIP && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate("/vip-coach")} className="text-primary">
              <Sparkles className="mr-2 h-4 w-4" />
              <span>VIP Coach Assistant</span>
            </DropdownMenuItem>
          </>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Sign out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
