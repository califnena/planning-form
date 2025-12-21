import { useState, useEffect } from "react";
import { format, formatDistanceToNow } from "date-fns";
import { 
  Link2, Plus, Copy, Trash2, RefreshCw, Eye, EyeOff, 
  Mail, MessageSquare, Archive, MoreVertical, Smartphone, Monitor
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { 
  ShareLink, 
  ShareLinkAccessLog,
  COMMON_LABELS,
  fetchShareLinks,
  createShareLink,
  updateShareLink,
  regenerateShareLinkToken,
  deleteShareLink,
  fetchAccessLog,
  clearAccessLog,
  getShareLinkUrl,
  generateTextMessage,
  generateEmailMessage
} from "@/lib/shareLinks";
import { ShareConfirmationModal } from "./ShareConfirmationModal";

interface ShareLinksManagerProps {
  userId: string;
  ownerName?: string;
}

export const ShareLinksManager = ({ userId, ownerName }: ShareLinksManagerProps) => {
  const { toast } = useToast();
  const [links, setLinks] = useState<ShareLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newLabel, setNewLabel] = useState("");
  const [shareArchives, setShareArchives] = useState(false);
  const [selectedLink, setSelectedLink] = useState<ShareLink | null>(null);
  const [accessLogs, setAccessLogs] = useState<Record<string, ShareLinkAccessLog[]>>({});
  const [showActivityFor, setShowActivityFor] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState<ShareLink | null>(null);
  const [showConfirmation, setShowConfirmation] = useState<{
    link: ShareLink;
    action: 'copy' | 'text' | 'email';
  } | null>(null);

  useEffect(() => {
    loadLinks();
  }, [userId]);

  const loadLinks = async () => {
    try {
      const data = await fetchShareLinks(userId);
      setLinks(data);
    } catch (error) {
      console.error("Error loading share links:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!newLabel.trim()) return;
    
    try {
      const link = await createShareLink(userId, newLabel.trim(), shareArchives);
      setLinks([link, ...links]);
      setShowCreateDialog(false);
      setNewLabel("");
      setShareArchives(false);
      toast({
        title: "Link created",
        description: `Share link for "${newLabel}" is ready.`
      });
    } catch (error) {
      console.error("Error creating share link:", error);
      toast({
        title: "Error",
        description: "Failed to create share link.",
        variant: "destructive"
      });
    }
  };

  const handleToggleEnabled = async (link: ShareLink) => {
    try {
      await updateShareLink(link.id, { is_enabled: !link.is_enabled });
      setLinks(links.map(l => 
        l.id === link.id ? { ...l, is_enabled: !l.is_enabled } : l
      ));
    } catch (error) {
      console.error("Error updating link:", error);
    }
  };

  const handleRegenerate = async (link: ShareLink) => {
    try {
      const newToken = await regenerateShareLinkToken(link.id);
      setLinks(links.map(l => 
        l.id === link.id ? { ...l, token: newToken } : l
      ));
      toast({
        title: "Link regenerated",
        description: "The old link is now invalid."
      });
    } catch (error) {
      console.error("Error regenerating link:", error);
    }
  };

  const handleDelete = async () => {
    if (!showDeleteDialog) return;
    
    try {
      await deleteShareLink(showDeleteDialog.id);
      setLinks(links.filter(l => l.id !== showDeleteDialog.id));
      toast({
        title: "Link deleted",
        description: "Access has been removed."
      });
    } catch (error) {
      console.error("Error deleting link:", error);
    }
    setShowDeleteDialog(null);
  };

  const handleViewActivity = async (link: ShareLink) => {
    if (showActivityFor === link.id) {
      setShowActivityFor(null);
      return;
    }
    
    try {
      const logs = await fetchAccessLog(link.id);
      setAccessLogs({ ...accessLogs, [link.id]: logs });
      setShowActivityFor(link.id);
    } catch (error) {
      console.error("Error fetching access log:", error);
    }
  };

  const handleClearActivity = async (linkId: string) => {
    try {
      await clearAccessLog(linkId);
      setAccessLogs({ ...accessLogs, [linkId]: [] });
      setLinks(links.map(l => 
        l.id === linkId ? { ...l, total_views: 0, last_accessed_at: null } : l
      ));
      toast({
        title: "Activity cleared",
        description: "Access log has been reset."
      });
    } catch (error) {
      console.error("Error clearing activity:", error);
    }
  };

  const handleShareAction = (link: ShareLink, action: 'copy' | 'text' | 'email') => {
    setShowConfirmation({ link, action });
  };

  const executeShareAction = async (action: 'copy' | 'text' | 'email', link: ShareLink) => {
    const url = getShareLinkUrl(link.token);
    
    if (action === 'copy') {
      await navigator.clipboard.writeText(url);
      toast({ title: "Link copied" });
    } else if (action === 'text') {
      const message = generateTextMessage(link.label, url);
      await navigator.clipboard.writeText(message);
      toast({ title: "Text message copied" });
    } else if (action === 'email') {
      const { subject, body } = generateEmailMessage(link.label, url, ownerName);
      await navigator.clipboard.writeText(`Subject: ${subject}\n\n${body}`);
      toast({ title: "Email message copied" });
    }
    
    setShowConfirmation(null);
  };

  if (loading) {
    return <div className="text-muted-foreground">Loading share links...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Share Links</h3>
          <p className="text-sm text-muted-foreground">
            Create read-only links for family members or advisors
          </p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Create Link
        </Button>
      </div>

      {links.length === 0 ? (
        <Card className="p-8 text-center">
          <Link2 className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
          <p className="text-muted-foreground mb-4">No share links yet</p>
          <Button onClick={() => setShowCreateDialog(true)}>
            Create your first link
          </Button>
        </Card>
      ) : (
        <div className="space-y-4">
          {links.map((link) => (
            <Card key={link.id} className={!link.is_enabled ? "opacity-60" : ""}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{link.label}</span>
                      {!link.is_enabled && (
                        <span className="text-xs bg-muted px-2 py-0.5 rounded">Disabled</span>
                      )}
                      {link.share_archives && (
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded flex items-center gap-1">
                          <Archive className="h-3 w-3" />
                          Archives
                        </span>
                      )}
                    </div>
                    
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p>
                        {link.last_accessed_at 
                          ? `Last accessed ${formatDistanceToNow(new Date(link.last_accessed_at), { addSuffix: true })}`
                          : "Not yet accessed"
                        }
                      </p>
                      <p>{link.total_views} total views</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleShareAction(link, 'copy')}
                      disabled={!link.is_enabled}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleShareAction(link, 'text')}
                      disabled={!link.is_enabled}
                    >
                      <MessageSquare className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleShareAction(link, 'email')}
                      disabled={!link.is_enabled}
                    >
                      <Mail className="h-4 w-4" />
                    </Button>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleToggleEnabled(link)}>
                          {link.is_enabled ? (
                            <>
                              <EyeOff className="h-4 w-4 mr-2" />
                              Disable link
                            </>
                          ) : (
                            <>
                              <Eye className="h-4 w-4 mr-2" />
                              Enable link
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleRegenerate(link)}>
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Regenerate link
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleViewActivity(link)}>
                          <Eye className="h-4 w-4 mr-2" />
                          View activity
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => setShowDeleteDialog(link)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete link
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                {/* Activity log expansion */}
                {showActivityFor === link.id && (
                  <div className="mt-4 pt-4 border-t">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-medium">Access Activity</h4>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleClearActivity(link.id)}
                      >
                        Clear log
                      </Button>
                    </div>
                    {accessLogs[link.id]?.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No activity yet</p>
                    ) : (
                      <div className="space-y-2 text-sm">
                        {accessLogs[link.id]?.map((log) => (
                          <div key={log.id} className="flex items-center gap-3">
                            <span className="text-muted-foreground w-40">
                              {format(new Date(log.accessed_at), "MMM d, h:mm a")}
                            </span>
                            <span className="flex items-center gap-1">
                              {log.device_type === 'mobile' ? (
                                <Smartphone className="h-3.5 w-3.5" />
                              ) : (
                                <Monitor className="h-3.5 w-3.5" />
                              )}
                              {log.device_type}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Share Link</DialogTitle>
            <DialogDescription>
              Create a read-only link to share with a specific person
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="label">Recipient Label</Label>
              <Input
                id="label"
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                placeholder="e.g., Mom, Attorney, Executor"
              />
              <div className="flex flex-wrap gap-2 mt-2">
                {COMMON_LABELS.map((label) => (
                  <Button
                    key={label}
                    variant="outline"
                    size="sm"
                    onClick={() => setNewLabel(label)}
                    className="text-xs"
                  >
                    {label}
                  </Button>
                ))}
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Switch
                id="share-archives"
                checked={shareArchives}
                onCheckedChange={setShareArchives}
              />
              <Label htmlFor="share-archives" className="text-sm">
                Share archived versions
              </Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={!newLabel.trim()}>
              Create Link
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!showDeleteDialog} onOpenChange={() => setShowDeleteDialog(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete share link?</AlertDialogTitle>
            <AlertDialogDescription>
              "{showDeleteDialog?.label}" will no longer be able to access your plan. 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Link
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Share Confirmation Modal */}
      {showConfirmation && (
        <ShareConfirmationModal
          open={true}
          onOpenChange={() => setShowConfirmation(null)}
          link={showConfirmation.link}
          action={showConfirmation.action}
          onConfirm={() => executeShareAction(showConfirmation.action, showConfirmation.link)}
        />
      )}
    </div>
  );
};
