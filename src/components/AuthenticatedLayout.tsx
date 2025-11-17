import { ReactNode } from "react";
import { Link } from "react-router-dom";
import { LanguageSelector } from "@/components/LanguageSelector";
import { Plus, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AppFooter } from "@/components/AppFooter";
import { ProfileDropdown } from "@/components/ProfileDropdown";
import { useState, useEffect } from "react";

interface AuthenticatedLayoutProps {
  children: ReactNode;
}

export const AuthenticatedLayout = ({ children }: AuthenticatedLayoutProps) => {
  const [textSize, setTextSize] = useState<number>(100);

  useEffect(() => {
    const savedSize = localStorage.getItem("landing_text_size");
    if (savedSize) {
      const size = parseInt(savedSize);
      setTextSize(size);
      document.documentElement.style.fontSize = `${size}%`;
    }
  }, []);

  const handleTextSizeChange = (direction: "increase" | "decrease") => {
    const newSize = direction === "increase" 
      ? Math.min(textSize + 10, 150) 
      : Math.max(textSize - 10, 80);
    
    setTextSize(newSize);
    document.documentElement.style.fontSize = `${newSize}%`;
    localStorage.setItem("landing_text_size", newSize.toString());
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header - Same as Landing Page */}
      <header className="border-b border-border sticky top-0 z-50 bg-background/95 backdrop-blur">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link to="/dashboard" className="hover:opacity-80 transition-opacity">
            <div>
              <h1 className="text-xl font-semibold text-primary">Everlasting Funeral Advisors</h1>
              <p className="text-xs text-muted-foreground">Peace of Mind Starts with a Plan</p>
            </div>
          </Link>
          <div className="flex items-center gap-3">
            {/* Text Size Controls */}
            <div className="flex items-center gap-1 border border-border rounded-md p-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleTextSizeChange("decrease")}
                className="h-8 w-8 p-0"
                title="Decrease text size"
              >
                <Minus className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleTextSizeChange("increase")}
                className="h-8 w-8 p-0"
                title="Increase text size"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <LanguageSelector />
            <ProfileDropdown />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer - Same as Landing Page */}
      <AppFooter />
    </div>
  );
};
