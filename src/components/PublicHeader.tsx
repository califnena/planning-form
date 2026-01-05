import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home, LayoutDashboard, HelpCircle, User, LogOut } from "lucide-react";
import { TextSizeToggle } from "@/components/TextSizeToggle";
import { usePreviewModeContext } from "@/contexts/PreviewModeContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import logo from "@/assets/everlasting-logo.png";

/**
 * Public header with persistent navigation for Home, Dashboard, and Resources.
 * Shows Sign In when logged out, Account when logged in.
 */
export const PublicHeader = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isLoggedIn, isLoading } = usePreviewModeContext();
  
  const isActive = (path: string) => location.pathname === path;

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Signed out",
        description: "You have been signed out successfully."
      });
      navigate("/");
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  return (
    <header className="border-b border-border sticky top-0 z-50 bg-background/95 backdrop-blur">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        {/* Left: Logo */}
        <Link to="/home-senior" className="flex items-center gap-2 md:gap-3 hover:opacity-80 transition-opacity">
          <img src={logo} alt="Everlasting Funeral Advisors" className="h-8 w-8 md:h-10 md:w-10" />
          <div className="hidden sm:block">
            <h1 className="text-base md:text-lg font-semibold text-primary">Everlasting Funeral Advisors</h1>
            <p className="text-xs text-muted-foreground">Education, Clarity, Compassion</p>
          </div>
        </Link>

        {/* Center: Navigation (visible on larger screens) */}
        <nav className="hidden md:flex items-center gap-1">
          <Link to="/home-senior">
            <Button 
              variant={isActive("/home-senior") || isActive("/") ? "secondary" : "ghost"} 
              size="sm" 
              className="gap-2"
            >
              <Home className="h-4 w-4" />
              Home
            </Button>
          </Link>
          <Link to="/dashboard">
            <Button 
              variant={isActive("/dashboard") ? "secondary" : "ghost"} 
              size="sm" 
              className="gap-2"
            >
              <LayoutDashboard className="h-4 w-4" />
              Planning Menu
            </Button>
          </Link>
          <Link to="/resources">
            <Button 
              variant={isActive("/resources") ? "secondary" : "ghost"} 
              size="sm" 
              className="gap-2"
            >
              <HelpCircle className="h-4 w-4" />
              Help
            </Button>
          </Link>
        </nav>

        {/* Right: Controls */}
        <div className="flex items-center gap-2">
          {/* Text Size - compact on mobile */}
          <div className="hidden sm:flex items-center gap-1 border border-border rounded-md px-2 py-1">
            <span className="text-xs text-muted-foreground font-medium">Text Size</span>
            <TextSizeToggle compact />
          </div>
          <div className="flex sm:hidden">
            <TextSizeToggle compact />
          </div>
          
          {/* Conditional: Sign In or Account */}
          {!isLoading && (
            isLoggedIn ? (
              <div className="flex items-center gap-2">
                <Link to="/profile">
                  <Button variant="ghost" size="sm" className="gap-2">
                    <User className="h-4 w-4" />
                    <span className="hidden sm:inline">Account</span>
                  </Button>
                </Link>
                <Button variant="outline" size="sm" onClick={handleSignOut} className="gap-2">
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline">Sign Out</span>
                </Button>
              </div>
            ) : (
              <Link to="/login">
                <Button variant="outline" size="sm">Sign In</Button>
              </Link>
            )
          )}
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden border-t border-border px-4 py-2 flex justify-center gap-4 bg-muted/30">
        <Link to="/home-senior" className={`text-sm ${isActive("/home-senior") || isActive("/") ? "text-primary font-medium" : "text-muted-foreground"}`}>
          Home
        </Link>
        <Link to="/dashboard" className={`text-sm ${isActive("/dashboard") ? "text-primary font-medium" : "text-muted-foreground"}`}>
          Planning Menu
        </Link>
        <Link to="/resources" className={`text-sm ${isActive("/resources") ? "text-primary font-medium" : "text-muted-foreground"}`}>
          Help
        </Link>
      </div>
    </header>
  );
};
