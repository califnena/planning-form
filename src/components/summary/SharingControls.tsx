import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Settings, RefreshCw, Trash2, Eye, Link as LinkIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SharedLink {
  id: string;
  token: string;
  createdAt: string;
  expiresAt: string;
  isActive: boolean;
  viewCount: number;
}

export function SharingControls() {
  const { toast } = useToast();
  const [sharedLinks, setSharedLinks] = useState<SharedLink[]>([]);
  const [loading, setLoading] = useState(false);

  // In a real implementation, this would fetch from the database
  useEffect(() => {
    // Mock data for demonstration
    const mockLinks: SharedLink[] = [];
    setSharedLinks(mockLinks);
  }, []);

  const handleToggleLink = (id: string, isActive: boolean) => {
    setSharedLinks(prev => 
      prev.map(link => 
        link.id === id ? { ...link, isActive } : link
      )
    );
    
    toast({
      title: isActive ? "Link activated" : "Link deactivated",
      description: isActive 
        ? "The link is now accessible."
        : "The link is no longer accessible."
    });
  };

  const handleRegenerateLink = (id: string) => {
    toast({
      title: "Link regenerated",
      description: "A new link has been created. The old link no longer works."
    });
  };

  const handleDeleteLink = (id: string) => {
    setSharedLinks(prev => prev.filter(link => link.id !== id));
    toast({
      title: "Link removed",
      description: "The shared link has been deleted."
    });
  };

  if (sharedLinks.length === 0) {
    return null;
  }

  return (
    <Card className="p-6 print:hidden">
      <div className="flex items-center gap-2 mb-4">
        <Settings className="h-5 w-5 text-muted-foreground" />
        <h2 className="text-lg font-semibold">Sharing Settings</h2>
      </div>
      
      <p className="text-sm text-muted-foreground mb-4">
        View and manage who has access to your summary.
      </p>

      <div className="space-y-4">
        {sharedLinks.map((link) => (
          <div 
            key={link.id} 
            className="flex items-center justify-between p-4 bg-muted/50 rounded-lg"
          >
            <div className="flex items-center gap-3">
              <LinkIcon className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium text-sm">
                  Secure Link
                </p>
                <p className="text-xs text-muted-foreground">
                  Created {new Date(link.createdAt).toLocaleDateString()} • 
                  Expires {new Date(link.expiresAt).toLocaleDateString()}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <Eye className="h-3 w-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">
                    {link.viewCount} view(s)
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Switch
                checked={link.isActive}
                onCheckedChange={(checked) => handleToggleLink(link.id, checked)}
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleRegenerateLink(link.id)}
                title="Regenerate link"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleDeleteLink(link.id)}
                title="Delete link"
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
