import { useEffect, useState, useMemo, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Loader2, Eye, Users, MousePointer, FileDown, ShoppingCart, CheckCircle, XCircle,
  ArrowLeft, Clock, ChevronRight, Globe, UserCheck, UserX,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format, subDays } from "date-fns";

// ── Types ───────────────────────────────────────────────────────────────────

interface AnalyticsRow {
  id: string;
  created_at: string;
  event_name: string;
  page_path: string | null;
  referrer: string | null;
  mode: string | null;
  label: string | null;
  visitor_id: string;
  session_id: string;
  user_id: string | null;
  user_email: string | null;
  duration_ms: number | null;
  metadata: Record<string, unknown> | null;
  country: string | null;
  region: string | null;
  city: string | null;
}

type Range = "7" | "30";
type AudienceFilter = "all" | "logged_in" | "anonymous";

// ── Admin user IDs cache (to exclude from display) ──────────────────────────

async function fetchAdminUserIds(): Promise<Set<string>> {
  try {
    const { data } = await supabase
      .from("user_roles" as any)
      .select("user_id, role:role_id(name)")
      .in("role_id", (
        await supabase.from("app_roles").select("id").in("name", ["admin", "staff", "owner"])
      ).data?.map((r: any) => r.id) || []);
    return new Set((data || []).map((r: any) => r.user_id));
  } catch {
    return new Set();
  }
}

// ── Main component ──────────────────────────────────────────────────────────

export function AnalyticsDashboard() {
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<AnalyticsRow[]>([]);
  const [range, setRange] = useState<Range>("7");
  const [audience, setAudience] = useState<AudienceFilter>("all");
  const [selectedVisitor, setSelectedVisitor] = useState<string | null>(null);
  const [adminIds, setAdminIds] = useState<Set<string>>(new Set());

  const loadData = useCallback(async () => {
    setLoading(true);
    const [ids] = await Promise.all([fetchAdminUserIds()]);
    setAdminIds(ids);
    const since = subDays(new Date(), parseInt(range)).toISOString();
    const { data } = await supabase
      .from("analytics_events" as any)
      .select("*")
      .gte("created_at", since)
      .order("created_at", { ascending: false })
      .limit(5000);
    setRows((data as unknown as AnalyticsRow[]) || []);
    setLoading(false);
  }, [range]);

  useEffect(() => { loadData(); }, [loadData]);

  // ── Filter out admin users from all data ──────────────────────────────────

  const nonAdminRows = useMemo(() => {
    return rows.filter(r => !r.user_id || !adminIds.has(r.user_id));
  }, [rows, adminIds]);

  const filtered = useMemo(() => {
    if (audience === "all") return nonAdminRows;
    if (audience === "logged_in") return nonAdminRows.filter(r => r.user_id);
    return nonAdminRows.filter(r => !r.user_id);
  }, [nonAdminRows, audience]);

  // ── KPI stats ─────────────────────────────────────────────────────────────

  const count = (name: string) => filtered.filter(r => r.event_name === name).length;
  const totalSessions = useMemo(() => new Set(filtered.map(r => r.session_id)).size, [filtered]);
  const uniqueVisitors = useMemo(() => new Set(filtered.map(r => r.visitor_id)).size, [filtered]);
  const loggedInVisitors = useMemo(() => new Set(filtered.filter(r => r.user_id).map(r => r.user_id)).size, [filtered]);
  const anonymousVisitors = useMemo(() => {
    const loggedInVids = new Set(filtered.filter(r => r.user_id).map(r => r.visitor_id));
    return new Set(filtered.filter(r => !r.user_id && !loggedInVids.has(r.visitor_id)).map(r => r.visitor_id)).size;
  }, [filtered]);

  // ── Visitors with location ("Who visited and from where") ─────────────────

  const visitors = useMemo(() => {
    const map = new Map<string, {
      email: string | null;
      firstSeen: string;
      lastSeen: string;
      total: number;
      sessions: Set<string>;
      country: string | null;
      region: string | null;
      city: string | null;
      totalDuration: number;
    }>();
    filtered.forEach(r => {
      const existing = map.get(r.visitor_id);
      if (!existing) {
        map.set(r.visitor_id, {
          email: r.user_email,
          firstSeen: r.created_at,
          lastSeen: r.created_at,
          total: 1,
          sessions: new Set([r.session_id]),
          country: r.country,
          region: r.region,
          city: r.city,
          totalDuration: r.duration_ms || 0,
        });
      } else {
        existing.total++;
        existing.sessions.add(r.session_id);
        if (r.user_email) existing.email = r.user_email;
        if (r.created_at < existing.firstSeen) existing.firstSeen = r.created_at;
        if (r.created_at > existing.lastSeen) existing.lastSeen = r.created_at;
        if (r.country && !existing.country) existing.country = r.country;
        if (r.region && !existing.region) existing.region = r.region;
        if (r.city && !existing.city) existing.city = r.city;
        if (r.duration_ms) existing.totalDuration += r.duration_ms;
      }
    });
    return Array.from(map.entries())
      .map(([vid, v]) => ({
        visitorId: vid,
        email: v.email,
        firstSeen: v.firstSeen,
        lastSeen: v.lastSeen,
        total: v.total,
        sessionCount: v.sessions.size,
        country: v.country,
        region: v.region,
        city: v.city,
        totalTime: v.totalDuration,
      }))
      .sort((a, b) => new Date(b.lastSeen).getTime() - new Date(a.lastSeen).getTime())
      .slice(0, 50);
  }, [filtered]);

  // ── Top pages ─────────────────────────────────────────────────────────────

  const topPages = useMemo(() => {
    const map = new Map<string, { views: number; visitors: Set<string>; totalDuration: number; durCount: number }>();
    filtered.filter(r => r.event_name === "page_view").forEach(r => {
      const p = r.page_path || "/";
      const e = map.get(p) || { views: 0, visitors: new Set<string>(), totalDuration: 0, durCount: 0 };
      e.views++;
      e.visitors.add(r.visitor_id);
      if (r.duration_ms) { e.totalDuration += r.duration_ms; e.durCount++; }
      map.set(p, e);
    });
    return Array.from(map.entries())
      .map(([path, e]) => ({ path, views: e.views, unique: e.visitors.size, avgDuration: e.durCount ? Math.round(e.totalDuration / e.durCount / 1000) : null }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 20);
  }, [filtered]);

  // ── Events breakdown ──────────────────────────────────────────────────────

  const eventsBreakdown = useMemo(() => {
    const map = new Map<string, number>();
    filtered.forEach(r => {
      const key = r.label ? `${r.event_name} · ${r.label}` : r.event_name;
      map.set(key, (map.get(key) || 0) + 1);
    });
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1]).slice(0, 20);
  }, [filtered]);

  // ── Visitor timeline ──────────────────────────────────────────────────────

  const visitorTimeline = useMemo(() => {
    if (!selectedVisitor) return [];
    return filtered
      .filter(r => r.visitor_id === selectedVisitor)
      .slice(0, 50);
  }, [filtered, selectedVisitor]);

  // ── Icon helper ───────────────────────────────────────────────────────────

  const iconFor = (name: string) => {
    if (name.includes("page_view")) return <Eye className="h-3.5 w-3.5" />;
    if (name.includes("mode")) return <MousePointer className="h-3.5 w-3.5" />;
    if (name.includes("download")) return <FileDown className="h-3.5 w-3.5" />;
    if (name.includes("checkout_clicked") || name.includes("checkout_start")) return <ShoppingCart className="h-3.5 w-3.5" />;
    if (name.includes("checkout_success") || name.includes("paid")) return <CheckCircle className="h-3.5 w-3.5 text-primary" />;
    if (name.includes("checkout_fail") || name.includes("failed")) return <XCircle className="h-3.5 w-3.5 text-destructive" />;
    if (name.includes("faq")) return <Eye className="h-3.5 w-3.5" />;
    return <MousePointer className="h-3.5 w-3.5" />;
  };

  const formatDuration = (ms: number) => {
    const s = Math.round(ms / 1000);
    if (s < 60) return `${s}s`;
    const m = Math.floor(s / 60);
    return `${m}m ${s % 60}s`;
  };

  const formatLocation = (country: string | null, region: string | null, city: string | null) => {
    const parts = [city, region, country].filter(Boolean);
    return parts.length > 0 ? parts.join(", ") : "—";
  };

  if (loading) {
    return <Card><CardContent className="flex items-center justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></CardContent></Card>;
  }

  // ── Visitor detail view ───────────────────────────────────────────────────

  if (selectedVisitor) {
    const info = visitors.find(v => v.visitorId === selectedVisitor);
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => setSelectedVisitor(null)}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <CardTitle className="text-base">
                {info?.email || `Visitor ${selectedVisitor.slice(0, 8)}…`}
              </CardTitle>
              <CardDescription>
                {formatLocation(info?.country ?? null, info?.region ?? null, info?.city ?? null)}
                {" · "}{info?.sessionCount ?? 0} sessions · {info?.total ?? 0} events
              </CardDescription>
            </div>
          </div>
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
                  <TableHead>Duration</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visitorTimeline.map(e => (
                  <TableRow key={e.id}>
                    <TableCell className="text-xs whitespace-nowrap">{format(new Date(e.created_at), "MMM d, HH:mm:ss")}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-mono text-xs gap-1">
                        {iconFor(e.event_name)} {e.event_name}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs font-mono max-w-[160px] truncate">{e.page_path || "—"}</TableCell>
                    <TableCell className="text-xs max-w-[120px] truncate">{e.label || "—"}</TableCell>
                    <TableCell className="text-xs">{e.duration_ms ? `${Math.round(e.duration_ms / 1000)}s` : "—"}</TableCell>
                  </TableRow>
                ))}
                {visitorTimeline.length === 0 && (
                  <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No events</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    );
  }

  // ── Main dashboard ────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="flex gap-2">
          <Button size="sm" variant={range === "7" ? "default" : "outline"} onClick={() => setRange("7")}>Last 7 days</Button>
          <Button size="sm" variant={range === "30" ? "default" : "outline"} onClick={() => setRange("30")}>Last 30 days</Button>
        </div>
        <Select value={audience} onValueChange={(v) => setAudience(v as AudienceFilter)}>
          <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All visitors</SelectItem>
            <SelectItem value="logged_in">Logged-in only</SelectItem>
            <SelectItem value="anonymous">Anonymous only</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Visitor summary cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard title="Total Sessions" value={totalSessions} icon={<Eye className="h-4 w-4 text-muted-foreground" />} />
        <KpiCard title="Unique Visitors" value={uniqueVisitors} icon={<Users className="h-4 w-4 text-muted-foreground" />} />
        <KpiCard title="Logged-in Visitors" value={loggedInVisitors} icon={<UserCheck className="h-4 w-4 text-muted-foreground" />} />
        <KpiCard title="Anonymous Visitors" value={anonymousVisitors} icon={<UserX className="h-4 w-4 text-muted-foreground" />} />
      </div>

      {/* KPI cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <KpiCard title="Mode Selects" value={count("mode_selected")} icon={<MousePointer className="h-4 w-4 text-muted-foreground" />} />
        <KpiCard title="Downloads" value={count("download_clicked")} icon={<FileDown className="h-4 w-4 text-muted-foreground" />} />
        <KpiCard title="Checkout Clicks" value={count("checkout_clicked")} icon={<ShoppingCart className="h-4 w-4 text-muted-foreground" />} />
        <KpiCard title="FAQ Opens" value={count("faq_opened")} icon={<Eye className="h-4 w-4 text-muted-foreground" />} />
        <KpiCard title="Page Views" value={count("page_view")} icon={<Clock className="h-4 w-4 text-muted-foreground" />} />
      </div>

      {/* Who visited and from where */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2"><Globe className="h-4 w-4" /> Who Visited &amp; From Where</CardTitle>
          <CardDescription>Click a visitor to see their full timeline. Admin/staff/owner accounts are excluded.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Person</TableHead>
                  <TableHead>Visitor ID</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>First Seen</TableHead>
                  <TableHead>Last Seen</TableHead>
                  <TableHead className="text-right">Sessions</TableHead>
                  <TableHead className="text-right">Total Time</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {visitors.map(v => (
                  <TableRow key={v.visitorId} className="cursor-pointer hover:bg-muted/50" onClick={() => setSelectedVisitor(v.visitorId)}>
                    <TableCell className="text-sm">
                      {v.email || <span className="text-muted-foreground italic">Anonymous</span>}
                    </TableCell>
                    <TableCell className="text-xs font-mono text-muted-foreground">
                      {v.email ? "—" : v.visitorId.slice(0, 12) + "…"}
                    </TableCell>
                    <TableCell className="text-xs whitespace-nowrap">{formatLocation(v.country, v.region, v.city)}</TableCell>
                    <TableCell className="text-xs whitespace-nowrap">{format(new Date(v.firstSeen), "MMM d, HH:mm")}</TableCell>
                    <TableCell className="text-xs whitespace-nowrap">{format(new Date(v.lastSeen), "MMM d, HH:mm")}</TableCell>
                    <TableCell className="text-right"><Badge variant="secondary">{v.sessionCount}</Badge></TableCell>
                    <TableCell className="text-right text-xs">{v.totalTime > 0 ? formatDuration(v.totalTime) : "—"}</TableCell>
                    <TableCell><ChevronRight className="h-4 w-4 text-muted-foreground" /></TableCell>
                  </TableRow>
                ))}
                {visitors.length === 0 && (
                  <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">No visitors yet</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Top pages */}
        <Card>
          <CardHeader><CardTitle className="text-base">Top Pages</CardTitle></CardHeader>
          <CardContent>
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Page</TableHead>
                    <TableHead className="text-right">Views</TableHead>
                    <TableHead className="text-right">Unique</TableHead>
                    <TableHead className="text-right">Avg Time</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topPages.map(p => (
                    <TableRow key={p.path}>
                      <TableCell className="font-mono text-xs max-w-[200px] truncate">{p.path}</TableCell>
                      <TableCell className="text-right"><Badge variant="secondary">{p.views}</Badge></TableCell>
                      <TableCell className="text-right"><Badge variant="outline">{p.unique}</Badge></TableCell>
                      <TableCell className="text-right text-xs">{p.avgDuration != null ? `${p.avgDuration}s` : "—"}</TableCell>
                    </TableRow>
                  ))}
                  {topPages.length === 0 && (
                    <TableRow><TableCell colSpan={4} className="text-center py-6 text-muted-foreground">No page views yet</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Events breakdown */}
        <Card>
          <CardHeader><CardTitle className="text-base">Events Breakdown</CardTitle></CardHeader>
          <CardContent>
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Event</TableHead>
                    <TableHead className="text-right">Count</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {eventsBreakdown.map(([action, cnt]) => (
                    <TableRow key={action}>
                      <TableCell>
                        <span className="flex items-center gap-2 font-mono text-xs">{iconFor(action)} {action}</span>
                      </TableCell>
                      <TableCell className="text-right"><Badge variant="secondary">{cnt}</Badge></TableCell>
                    </TableRow>
                  ))}
                  {eventsBreakdown.length === 0 && (
                    <TableRow><TableCell colSpan={2} className="text-center py-6 text-muted-foreground">No events yet</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function KpiCard({ title, value, icon }: { title: string; value: number; icon: React.ReactNode }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent><div className="text-2xl font-bold">{value}</div></CardContent>
    </Card>
  );
}
