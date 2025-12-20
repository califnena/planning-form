import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { LogOut, User, CreditCard, Settings as SettingsIcon, RotateCcw, Star, FileText, Shield } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { TextSizeToggle } from "@/components/TextSizeToggle";
import { PrivacyModal } from "@/components/PrivacyModal";
import { LanguageSelector } from "@/components/LanguageSelector";
import { AccessibilityToggle } from "@/components/AccessibilityToggle";
import { GlobalSearch } from "@/components/GlobalSearch";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAdminStatus } from "@/hooks/useAdminStatus";
import { useAccessibility } from "@/contexts/AccessibilityContext";
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

interface GlobalHeaderProps {
  onGenerateDocument?: () => void;
}

export const GlobalHeader = ({ onGenerateDocument }: GlobalHeaderProps = {}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const { isAdmin } = useAdminStatus();
  const { superSeniorMode } = useAccessibility();
  
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
        title: t("header.signedOut"),
        description: t("header.signedOutDesc"),
      });
    } catch (error) {
      console.error("Error signing out:", error);
      toast({
        title: t("header.signOutError"),
        description: t("header.signOutErrorDesc"),
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
        title: t("header.tourReset"),
        description: t("header.tourResetDesc"),
      });

      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      console.error("Error resetting tour:", error);
      toast({
        title: t("common.error"),
        description: t("header.tourResetError"),
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 md:h-20 items-center justify-between px-2 md:px-4">
          {/* Left: Logo */}
          <Link to="/dashboard" className="flex items-center gap-2 md:gap-3 hover:opacity-80 transition-opacity shrink-0">
            <img src={logo} alt="Everlasting Funeral Advisors" className="h-8 w-8 md:h-12 md:w-12" />
            <div className="hidden sm:block">
              <h1 className="text-lg font-semibold text-foreground">{t("header.plannerTitle")}</h1>
              <p className="text-xs text-muted-foreground">{t("header.plannerSubtitle")}</p>
            </div>
          </Link>

          {/* Right: Controls */}
          <div className="flex items-center gap-1 md:gap-2">
            <GlobalSearch />
            
            {/* Mobile: A-/A+ buttons */}
            <div className="flex items-center md:hidden">
              <TextSizeToggle compact />
            </div>
            
            {/* Generate Document button - only on planner page, desktop only */}
            {isPlannerPage && onGenerateDocument && (
              <Button 
                variant="default" 
                size="sm" 
                className="gap-2 hidden md:flex"
                onClick={onGenerateDocument}
              >
                <FileText className="h-4 w-4" />
                {t("header.generateDocument")}
              </Button>
            )}
            
            {/* Text Size Controls - Prominent */}
            <div className="hidden sm:flex items-center gap-1 border border-border rounded-md px-2 py-1">
              <span className="text-xs text-muted-foreground font-medium">{t("header.textSize")}</span>
              <TextSizeToggle compact />
            </div>
            
            {/* Settings Panel */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 md:h-9 md:w-auto md:px-3 md:gap-2">
                  <SettingsIcon className="h-4 w-4" />
                  <span className="hidden md:inline">{t("header.settings")}</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80" align="end">
                <div className="space-y-4">
                  {/* Language Selection */}
                  <div>
                    <h3 className="font-semibold mb-2">{t("header.language")}</h3>
                    <LanguageSelector />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">{t("header.displaySettings")}</h3>
                    <TextSizeToggle />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">{t("header.easyViewMode")}</h3>
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
                      {t("header.restartTour")}
                    </Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            {/* Account Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 md:h-9 md:w-auto md:px-3 md:gap-2">
                  <User className="h-4 w-4" />
                  <span className="hidden md:inline">{t("header.account")}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem asChild>
                  <Link to="/app/profile" className="flex items-center gap-2 cursor-pointer">
                    <User className="h-4 w-4" />
                    {t("header.myProfile")}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/plans" className="flex items-center gap-2 cursor-pointer">
                    <CreditCard className="h-4 w-4" />
                    {t("header.planBilling")}
                  </Link>
                </DropdownMenuItem>
                {isAdmin && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to="/admin" className="flex items-center gap-2 cursor-pointer">
                        <Shield className="h-4 w-4 text-primary" />
                        <span className="font-medium">{t("header.adminPanel")}</span>
                      </Link>
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/vip-coach" className="flex items-center gap-2 cursor-pointer">
                    <Star className="h-4 w-4 text-yellow-500" />
                    <span className="font-medium">{t("header.vipCoachAssistant")}</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="flex items-center gap-2 cursor-pointer">
                  <LogOut className="h-4 w-4" />
                  {t("header.signOut")}
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
