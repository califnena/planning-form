import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { LanguageSelector } from "@/components/LanguageSelector";
import { ZoomIn, ZoomOut } from "lucide-react";
import { SectionVisibilitySettings } from "./SectionVisibilitySettings";
import { User } from "@supabase/supabase-js";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface SectionSettingsProps {
  user?: User;
  onVisibilityChange?: () => void;
}

export const SectionSettings = ({ user, onVisibilityChange }: SectionSettingsProps) => {
  const [fontSize, setFontSize] = useState<number>(() => {
    const saved = localStorage.getItem('appFontSize');
    return saved ? parseInt(saved) : 100;
  });

  useEffect(() => {
    document.documentElement.style.fontSize = `${fontSize}%`;
    localStorage.setItem('appFontSize', fontSize.toString());
  }, [fontSize]);

  const increaseFontSize = () => {
    if (fontSize < 150) {
      setFontSize(prev => prev + 10);
    }
  };

  const decreaseFontSize = () => {
    if (fontSize > 70) {
      setFontSize(prev => prev - 10);
    }
  };

  const resetFontSize = () => {
    setFontSize(100);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">⚙️ Settings</h2>
        <p className="text-muted-foreground">
          Customize your planner experience, section visibility, and preferences.
        </p>
      </div>

      <Tabs defaultValue="sections" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="sections">Sections</TabsTrigger>
          <TabsTrigger value="display">Display</TabsTrigger>
          <TabsTrigger value="language">Language</TabsTrigger>
        </TabsList>

        <TabsContent value="sections" className="mt-6">
          {user && (
            <SectionVisibilitySettings user={user} onSave={onVisibilityChange} />
          )}
        </TabsContent>

        <TabsContent value="display" className="mt-6">
          <Card>
        <CardHeader>
          <CardTitle>Display Settings</CardTitle>
          <CardDescription>
            Adjust the text size throughout the application to your preference.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Font Size</Label>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="icon"
                onClick={decreaseFontSize}
                disabled={fontSize <= 70}
                aria-label="Decrease font size"
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
              
              <div className="flex-1 text-center">
                <span className="text-lg font-medium">{fontSize}%</span>
                <p className="text-xs text-muted-foreground mt-1">
                  Current size
                </p>
              </div>
              
              <Button
                variant="outline"
                size="icon"
                onClick={increaseFontSize}
                disabled={fontSize >= 150}
                aria-label="Increase font size"
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
            </div>
            
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={resetFontSize}
              className="w-full"
            >
              Reset to default (100%)
            </Button>
          </div>
          
          <div className="p-4 bg-muted/50 rounded-lg">
            <p className="text-sm">
              This is a preview of how your text will appear at the current size setting.
              The font size will be applied across all sections of the planner.
            </p>
          </div>
        </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="language" className="mt-6">
          <Card>
        <CardHeader>
          <CardTitle>Language / Idioma</CardTitle>
          <CardDescription>
            Select your preferred language for the application interface.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label>Application Language</Label>
            <LanguageSelector />
          </div>
        </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
