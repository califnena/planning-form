import { useEffect, useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  Eye,
  Users,
  MousePointer,
  FileDown,
  ShoppingCart,
  CheckCircle,
  XCircle,
  MessageSquare,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format, subDays } from "date-fns";

interface ActivityRow {
  id: string;
  created_at: string;
  user_id: string | null;
  visitor_id: string;
  session_id: string;
  event_type: string;
  page_path: string | null;
  section: string | null;
  label: string | null;
  value: Record<string, unknown> | null;
}

type Range = 7 | 30;

export function ActivityAnalytics() {
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<ActivityRow[]>([]);
  const [range, setRange] = useState<Range>(7);

  const loadData = async (days: Range) => {
    setLoading(true);
    const since = subDays(new Date(), days).toISOString();
    const { data } = await supabase
      .from("activity_events" as any)
      .select("*")
      .gte("created_at", since)
      .order("created_at", { ascending: false })
      .limit(2000);
    setRows((data as unknown as ActivityRow[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    loadData(range);
  }, [range]);

  // ── Derived stats ─────────────────────────────────────────────────────

  const count = (type: string) => rows.filter((r) => r.event_type === type).length;

  const totalSessions = useMemo(
    () => new Set(rows.map((r) => r.session_id)).size,
    [rows]
  );
  const uniqueVisitors = useMemo(
    () => new Set(rows.map((r) => r.visitor_id)).size,
    [rows]
  );

  const topPages = useMemo(() => {
    const map = new Map<string, { views: number; visitors: Set<string> }>();
    rows
      .filter((r) => r.event_type === "page_view")
      .forEach((r) => {
        const p = r.page_path || "/";
        const entry = map.get(p) || { views: 0, visitors: new Set<string>() };
        entry.views++;
        entry.visitors.add(r.visitor_id);
        map.set(p, entry);
      });
    return Array.from(map.entries())
      .map(([path, { views, visitors }]) => ({ path, views, unique: visitors.size }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 15);
  }, [rows]);

  const topActions = useMemo(() => {
    const map = new Map<string, number>();
    rows
      .filter((r) => r.event_type !== "page_view")
      .forEach((r) => {
        const key = r.label ? `${r.event_type} · ${r.label}` : r.event_type;
        map.set(key, (map.get(key) || 0) + 1);
      });
    return Array.from(map.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 15);
  }, [rows]);

  // ── Event icon helper ─────────────────────────────────────────────────

  const iconFor = (t: string) => {
    if (t.includes("page_view")) return <Eye className="h-3.5 w-3.5" />;
    if (t.includes("mode_select")) return <MousePointer className="h-3.5 w-3.5" />;
    if (t.includes("download")) return <FileDown className="h-3.5 w-3.5" />;
    if (t.includes("checkout_start")) return <ShoppingCart className="h-3.5 w-3.5" />;
    if (t.includes("checkout_success")) return <CheckCircle className="h-3.5 w-3.5 text-green-600" />;
    if (t.includes("checkout_fail")) return <XCircle className="h-3.5 w-3.5 text-destructive" />;
    if (t.includes("chat")) return <MessageSquare className="h-3.5 w-3.5" />;
    return <MousePointer className="h-3.5 w-3.5" />;
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
      {/* Range toggle */}
      <div className="flex gap-2">
        <Button
          size="sm"
          variant={range === 7 ? "default" : "outline"}
          onClick={() => setRange(7)}
        >
          Last 7 days
        </Button>
        <Button
          size="sm"
          variant={range === 30 ? "default" : "outline"}
          onClick={() => setRange(30)}
        >
          Last 30 days
        </Button>
      </div>

      {/* KPI cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
        <StatCard title="Sessions" value={totalSessions} icon={<Eye className="h-4 w-4 text-muted-foreground" />} />
        <StatCard title="Unique Visitors" value={uniqueVisitors} icon={<Users className="h-4 w-4 text-muted-foreground" />} />
        <StatCard title="Mode Selects" value={count("mode_select")} icon={<MousePointer className="h-4 w-4 text-muted-foreground" />} />
        <StatCard title="Downloads" value={count("download")} icon={<FileDown className="h-4 w-4 text-muted-foreground" />} />
        <StatCard title="Checkout Starts" value={count("checkout_start")} icon={<ShoppingCart className="h-4 w-4 text-muted-foreground" />} />
        <StatCard title="Paid" value={count("checkout_success")} icon={<CheckCircle className="h-4 w-4 text-green-600" />} />
        <StatCard title="Failed" value={count("checkout_fail")} icon={<XCircle className="h-4 w-4 text-destructive" />} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Most viewed pages */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Most Viewed Pages</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Page</TableHead>
                    <TableHead className="text-right">Views</TableHead>
                    <TableHead className="text-right">Unique</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topPages.map((p) => (
                    <TableRow key={p.path}>
                      <TableCell className="font-mono text-xs max-w-[220px] truncate">
                        {p.path}
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge variant="secondary">{p.views}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge variant="outline">{p.unique}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                  {topPages.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center py-6 text-muted-foreground">
                        No page views yet
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Top actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Top Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Action</TableHead>
                    <TableHead className="text-right">Count</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topActions.map(([action, cnt]) => (
                    <TableRow key={action}>
                      <TableCell>
                        <span className="flex items-center gap-2 font-mono text-xs">
                          {iconFor(action)} {action}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge variant="secondary">{cnt}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                  {topActions.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={2} className="text-center py-6 text-muted-foreground">
                        No actions yet
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent events timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent Events</CardTitle>
          <CardDescription>Last 50 events across all visitors</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Time</TableHead>
                  <TableHead>Event</TableHead>
                  <TableHead>Page</TableHead>
                  <TableHead>Label</TableHead>
                  <TableHead>Visitor</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.slice(0, 50).map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="text-xs whitespace-nowrap">
                      {format(new Date(r.created_at), "MMM d, HH:mm")}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-mono text-xs gap-1">
                        {iconFor(r.event_type)} {r.event_type}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs font-mono max-w-[140px] truncate">
                      {r.page_path || "—"}
                    </TableCell>
                    <TableCell className="text-xs max-w-[120px] truncate">
                      {r.label || "—"}
                    </TableCell>
                    <TableCell className="text-xs font-mono">
                      {r.user_id ? r.user_id.slice(0, 8) + "…" : r.visitor_id.slice(0, 8)}
                    </TableCell>
                  </TableRow>
                ))}
                {rows.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      No activity recorded yet
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

function StatCard({ title, value, icon }: { title: string; value: number; icon: React.ReactNode }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );
}
