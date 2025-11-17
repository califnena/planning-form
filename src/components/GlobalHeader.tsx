import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Home, LogOut, User, CreditCard, Settings as SettingsIcon, RotateCcw, Star, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TextSizeToggle } from "@/components/TextSizeToggle";
import { PrivacyModal, PrivacyLink } from "@/components/PrivacyModal";
import { LanguageSelector } from "@/components/LanguageSelector";
import { AccessibilityToggle } from "@/components/AccessibilityToggle";
import { GlobalSearch } from "@/components/GlobalSearch";
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import logo from "@/assets/everlasting-logo.png";

interface GlobalHeaderProps {
  onGenerateDocument?: () => void;
}

export const GlobalHeader = ({ onGenerateDocument }: GlobalHeaderProps = {}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  
  // Check if we're on the planner page
  const isPlannerPage = location.pathname === '/app';

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id || null);
    };
    getUser();
  }, []);

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

  const handleRestartTour = async () => {
    if (!userId) return;
    
    try {
      await supabase
        .from("user_settings")
        .update({
          wizard_completed: false,
          updated_at: new Date().toISOString()
        })
        .eq("user_id", userId);

      toast({
        title: "Tour Reset",
        description: "Refresh the page to see the guided tour again.",
      });

      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      console.error("Error resetting tour:", error);
      toast({
        title: "Error",
        description: "Failed to reset the tour. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-20 items-center justify-between px-4">
          {/* Left: Logo and Title */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Link to="/dashboard" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                  <div className="flex flex-col items-center gap-0.5">
                    <img src={logo} alt="Everlasting" className="h-12 w-12" />
                    <span className="text-xs text-muted-foreground">Dashboard Home</span>
                  </div>
                  <div className="hidden sm:block">
                    <h1 className="text-lg font-semibold text-foreground">Everlasting Planner</h1>
                    <p className="text-xs text-muted-foreground">Plan ahead. Guide your loved ones.</p>
                  </div>
                </Link>
              </TooltipTrigger>
              <TooltipContent>
                <p>Go to Dashboard</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          {/* Right: Controls and Menu */}
          <div className="flex items-center gap-2">
            <GlobalSearch />
            
            {/* Generate Document button - only on planner page */}
            {isPlannerPage && onGenerateDocument && (
              <Button 
                variant="default" 
                size="sm" 
                className="gap-2 hidden md:flex"
                onClick={onGenerateDocument}
              >
                <FileText className="h-4 w-4" />
                Generate My Document
              </Button>
            )}
            
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
                  <div className="pt-2 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleRestartTour}
                      className="w-full gap-2"
                    >
                      <RotateCcw className="h-4 w-4" />
                      Restart Guided Tour
                    </Button>
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
                <DropdownMenuItem asChild>
                  <Link to="/vip-coach" className="flex items-center gap-2 cursor-pointer">
                    <Star className="h-4 w-4 text-yellow-500" />
                    <span className="font-medium">VIP Coach Assistant</span>
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
