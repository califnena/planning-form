import { useEffect, useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2, BarChart3, MousePointer, FileDown, DollarSign } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

interface ActivityRow {
  id: string;
  created_at: string;
  user_id: string | null;
  anonymous_session_id: string | null;
  event_name: string;
  page_url: string | null;
  section: string | null;
  metadata: Record<string, unknown> | null;
}

export function UserActivitySection() {
  const [loading, setLoading] = useState(true);
  const [activities, setActivities] = useState<ActivityRow[]>([]);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("user_activity" as any)
        .select("*")
        .order("created_at", { ascending: false })
        .limit(500);
      setActivities((data as unknown as ActivityRow[]) || []);
      setLoading(false);
    })();
  }, []);

  const topPages = useMemo(() => {
    const map = new Map<string, number>();
    activities.filter(a => a.event_name === "page_view").forEach(a => {
      const p = a.page_url || "/";
      map.set(p, (map.get(p) || 0) + 1);
    });
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1]).slice(0, 10);
  }, [activities]);

  const topEvents = useMemo(() => {
    const map = new Map<string, number>();
    activities.forEach(a => {
      map.set(a.event_name, (map.get(a.event_name) || 0) + 1);
    });
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1]);
  }, [activities]);

  const modeCounts = useMemo(() => {
    return activities.filter(a => a.event_name === "mode_selected").length;
  }, [activities]);

  const downloadCounts = useMemo(() => {
    return activities.filter(a => a.event_name === "download_clicked").length;
  }, [activities]);

  const eventIcon = (name: string) => {
    switch (name) {
      case "download_clicked": return <FileDown className="h-3 w-3" />;
      case "purchase_clicked":
      case "pricing_opened": return <DollarSign className="h-3 w-3" />;
      default: return <MousePointer className="h-3 w-3" />;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Events</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{activities.length}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mode Selections</CardTitle>
            <MousePointer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{modeCounts}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Downloads</CardTitle>
            <FileDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{downloadCounts}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unique Sessions</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Set(activities.map(a => a.anonymous_session_id || a.user_id)).size}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Top Pages */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Top Pages</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {topPages.map(([page, count]) => (
                <div key={page} className="flex items-center justify-between text-sm">
                  <span className="truncate max-w-[200px] font-mono text-xs">{page}</span>
                  <Badge variant="secondary">{count}</Badge>
                </div>
              ))}
              {topPages.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">No page views yet</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Top Features */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Event Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {topEvents.map(([event, count]) => (
                <div key={event} className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    {eventIcon(event)}
                    <span className="font-mono text-xs">{event}</span>
                  </span>
                  <Badge variant="secondary">{count}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent activity timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Recent Activity
          </CardTitle>
          <CardDescription>Last 50 tracked events</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Time</TableHead>
                  <TableHead>Event</TableHead>
                  <TableHead>Page</TableHead>
                  <TableHead>Section</TableHead>
                  <TableHead>User / Session</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activities.slice(0, 50).map((a) => (
                  <TableRow key={a.id}>
                    <TableCell className="text-xs whitespace-nowrap">
                      {format(new Date(a.created_at), "MMM d, HH:mm")}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-mono text-xs gap-1">
                        {eventIcon(a.event_name)} {a.event_name}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs font-mono max-w-[160px] truncate">
                      {a.page_url || "—"}
                    </TableCell>
                    <TableCell className="text-xs">
                      {a.section || "—"}
                    </TableCell>
                    <TableCell className="text-xs">
                      {a.user_id ? a.user_id.slice(0, 8) + "…" : `anon:${(a.anonymous_session_id || "").slice(0, 8)}`}
                    </TableCell>
                  </TableRow>
                ))}
                {activities.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      No activity recorded yet.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
