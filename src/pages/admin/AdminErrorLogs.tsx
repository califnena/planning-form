import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { GlobalHeader } from "@/components/GlobalHeader";
import { AdminBanner } from "@/components/AdminBanner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2, ArrowLeft, AlertTriangle, CheckCircle2, Search, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { checkIsOrgAdmin } from "@/lib/adminApi";
import { format } from "date-fns";

type ErrorLog = {
  id: string;
  created_at: string;
  user_id: string | null;
  user_email: string | null;
  ip_address: string | null;
  page_url: string | null;
  action: string;
  error_message: string;
  stack_trace: string | null;
  stripe_event_id: string | null;
  metadata: Record<string, unknown> | null;
  severity: string;
  resolved_at: string | null;
  resolved_by: string | null;
};

export default function AdminErrorLogs() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState<ErrorLog[]>([]);
  const [filterAction, setFilterAction] = useState<string>("all");
  const [filterSeverity, setFilterSeverity] = useState<string>("all");
  const [filterResolved, setFilterResolved] = useState<string>("unresolved");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedError, setSelectedError] = useState<ErrorLog | null>(null);
  const [resolving, setResolving] = useState<string | null>(null);

  useEffect(() => {
    const checkAccess = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { navigate("/login"); return; }
      const isAdmin = await checkIsOrgAdmin();
      if (!isAdmin) { navigate("/preplansteps"); return; }
      fetchErrors();
    };
    checkAccess();
  }, [navigate]);

  const fetchErrors = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("error_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(500);

    if (error) {
      toast({ title: "Failed to load error logs", variant: "destructive" });
    } else {
      setErrors((data as unknown as ErrorLog[]) || []);
    }
    setLoading(false);
  };

  const handleResolve = async (id: string) => {
    setResolving(id);
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase
      .from("error_logs")
      .update({ resolved_at: new Date().toISOString(), resolved_by: user?.id } as Record<string, unknown>)
      .eq("id", id);

    if (error) {
      toast({ title: "Failed to resolve error", variant: "destructive" });
    } else {
      setErrors(prev => prev.map(e => e.id === id ? { ...e, resolved_at: new Date().toISOString(), resolved_by: user?.id ?? null } : e));
      if (selectedError?.id === id) {
        setSelectedError(prev => prev ? { ...prev, resolved_at: new Date().toISOString() } : null);
      }
    }
    setResolving(null);
  };

  const actionTypes = useMemo(() => {
    const set = new Set(errors.map(e => e.action));
    return Array.from(set).sort();
  }, [errors]);

  const filtered = useMemo(() => {
    return errors.filter(e => {
      if (filterAction !== "all" && e.action !== filterAction) return false;
      if (filterSeverity !== "all" && e.severity !== filterSeverity) return false;
      if (filterResolved === "unresolved" && e.resolved_at) return false;
      if (filterResolved === "resolved" && !e.resolved_at) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return (
          e.error_message.toLowerCase().includes(q) ||
          (e.user_email?.toLowerCase().includes(q)) ||
          (e.page_url?.toLowerCase().includes(q)) ||
          e.action.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [errors, filterAction, filterSeverity, filterResolved, searchQuery]);

  const severityColor = (s: string) => {
    switch (s) {
      case "critical": return "destructive";
      case "error": return "destructive";
      case "warning": return "secondary";
      default: return "outline";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <>
      <AdminBanner />
      <GlobalHeader />
      <div className="container py-8 max-w-6xl">
        <Button variant="ghost" onClick={() => navigate("/admin")} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Admin
        </Button>

        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-7 w-7 text-destructive" />
              <CardTitle className="text-2xl">Error Logs</CardTitle>
              <Badge variant="outline" className="ml-auto">{filtered.length} shown</Badge>
            </div>
          </CardHeader>
        </Card>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-6">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search errors..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-9"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2">
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            )}
          </div>
          <Select value={filterAction} onValueChange={setFilterAction}>
            <SelectTrigger className="w-[180px]"><SelectValue placeholder="Action type" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All types</SelectItem>
              {actionTypes.map(a => <SelectItem key={a} value={a}>{a}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={filterSeverity} onValueChange={setFilterSeverity}>
            <SelectTrigger className="w-[140px]"><SelectValue placeholder="Severity" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All severity</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
              <SelectItem value="error">Error</SelectItem>
              <SelectItem value="warning">Warning</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterResolved} onValueChange={setFilterResolved}>
            <SelectTrigger className="w-[160px]"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="unresolved">Unresolved</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Error List */}
        <div className="space-y-3">
          {filtered.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                No errors match your filters.
              </CardContent>
            </Card>
          )}
          {filtered.map(err => (
            <Card
              key={err.id}
              className={`cursor-pointer hover:ring-1 hover:ring-primary/30 transition-all ${err.resolved_at ? "opacity-60" : ""}`}
              onClick={() => setSelectedError(err)}
            >
              <CardContent className="py-4">
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <Badge variant={severityColor(err.severity)} className="text-xs uppercase">
                        {err.severity}
                      </Badge>
                      <Badge variant="outline" className="text-xs font-mono">{err.action}</Badge>
                      {err.resolved_at && (
                        <Badge variant="secondary" className="text-xs">
                          <CheckCircle2 className="h-3 w-3 mr-1" /> Resolved
                        </Badge>
                      )}
                      <span className="text-xs text-muted-foreground ml-auto whitespace-nowrap">
                        {format(new Date(err.created_at), "MMM d, yyyy h:mm a")}
                      </span>
                    </div>
                    <p className="text-sm font-medium truncate">{err.error_message}</p>
                    <div className="flex gap-4 mt-1 text-xs text-muted-foreground">
                      {err.user_email && <span>{err.user_email}</span>}
                      {err.page_url && <span className="truncate max-w-[300px]">{err.page_url}</span>}
                    </div>
                  </div>
                  {!err.resolved_at && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={e => { e.stopPropagation(); handleResolve(err.id); }}
                      disabled={resolving === err.id}
                    >
                      {resolving === err.id ? <Loader2 className="h-3 w-3 animate-spin" /> : "Resolve"}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Detail Dialog */}
      <Dialog open={!!selectedError} onOpenChange={() => setSelectedError(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              Error Detail
              {selectedError && (
                <Badge variant={severityColor(selectedError.severity)} className="text-xs uppercase">
                  {selectedError.severity}
                </Badge>
              )}
            </DialogTitle>
          </DialogHeader>
          {selectedError && (
            <div className="space-y-4 text-sm">
              <div>
                <p className="text-muted-foreground text-xs mb-1">Error Message</p>
                <p className="font-medium">{selectedError.error_message}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-muted-foreground text-xs mb-1">Action</p>
                  <Badge variant="outline" className="font-mono">{selectedError.action}</Badge>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs mb-1">Date</p>
                  <p>{format(new Date(selectedError.created_at), "MMM d, yyyy h:mm:ss a")}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs mb-1">User Email</p>
                  <p>{selectedError.user_email || "—"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs mb-1">Page URL</p>
                  <p className="break-all">{selectedError.page_url || "—"}</p>
                </div>
                {selectedError.stripe_event_id && (
                  <div className="col-span-2">
                    <p className="text-muted-foreground text-xs mb-1">Stripe Event / Session ID</p>
                    <p className="font-mono text-xs break-all">{selectedError.stripe_event_id}</p>
                  </div>
                )}
              </div>
              {selectedError.metadata && (
                <div>
                  <p className="text-muted-foreground text-xs mb-1">Metadata</p>
                  <pre className="bg-muted rounded-md p-3 text-xs overflow-x-auto whitespace-pre-wrap">
                    {JSON.stringify(selectedError.metadata, null, 2)}
                  </pre>
                </div>
              )}
              {selectedError.stack_trace && (
                <div>
                  <p className="text-muted-foreground text-xs mb-1">Stack Trace</p>
                  <pre className="bg-muted rounded-md p-3 text-xs overflow-x-auto whitespace-pre-wrap max-h-[300px]">
                    {selectedError.stack_trace}
                  </pre>
                </div>
              )}
              <div className="flex items-center gap-3 pt-2 border-t">
                {selectedError.resolved_at ? (
                  <p className="text-muted-foreground text-xs">
                    <CheckCircle2 className="h-4 w-4 inline mr-1 text-primary" />
                    Resolved on {format(new Date(selectedError.resolved_at), "MMM d, yyyy h:mm a")}
                  </p>
                ) : (
                  <Button
                    onClick={() => handleResolve(selectedError.id)}
                    disabled={resolving === selectedError.id}
                  >
                    {resolving === selectedError.id ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    Mark as Resolved
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
