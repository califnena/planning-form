import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Home, LogOut, User, CreditCard, Settings as SettingsIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TextSizeToggle } from "@/components/TextSizeToggle";
import { PrivacyModal, PrivacyLink } from "@/components/PrivacyModal";
import { LanguageSelector } from "@/components/LanguageSelector";
import { AccessibilityToggle } from "@/components/AccessibilityToggle";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import logo from "@/assets/everlasting-logo.png";

export const GlobalHeader = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      navigate("/");
      toast({
        title: "Signed out successfully",
        description: "You have been signed out of your account.",
      });
    } catch (error) {
      console.error("Error signing out:", error);
      toast({
        title: "Error signing out",
        description: "There was a problem signing out. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-20 items-center justify-between px-4">
          {/* Left: Logo and Title */}
          <Link to="/dashboard" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <img src={logo} alt="Everlasting" className="h-12 w-12" />
            <div className="hidden sm:block">
              <h1 className="text-lg font-semibold text-foreground">Everlasting Planner</h1>
              <p className="text-xs text-muted-foreground">Plan ahead. Guide your loved ones.</p>
            </div>
          </Link>
          
          {/* Right: Controls and Menu */}
          <div className="flex items-center gap-2">
            <LanguageSelector />
            
            {/* Accessibility Panel */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <SettingsIcon className="h-4 w-4" />
                  <span className="hidden md:inline">Accessibility</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80" align="end">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">Display Settings</h3>
                    <TextSizeToggle />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Easy View Mode</h3>
                    <AccessibilityToggle />
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            {/* Account Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <User className="h-4 w-4" />
                  <span className="hidden md:inline">Account</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem asChild>
                  <Link to="/app/profile" className="flex items-center gap-2 cursor-pointer">
                    <User className="h-4 w-4" />
                    My Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/app/profile/subscription" className="flex items-center gap-2 cursor-pointer">
                    <CreditCard className="h-4 w-4" />
                    Subscription
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="flex items-center gap-2 cursor-pointer">
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>
      
      <PrivacyModal open={showPrivacyModal} onOpenChange={setShowPrivacyModal} />
    </>
  );
};
