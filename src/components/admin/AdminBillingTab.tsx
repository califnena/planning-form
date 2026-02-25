import { useEffect, useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, CreditCard, TrendingUp, AlertTriangle, CheckCircle2, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format, subDays } from "date-fns";

interface CheckoutAttempt {
  id: string;
  created_at: string;
  user_id: string | null;
  user_email: string | null;
  anonymous_session_id: string | null;
  product_sku: string;
  amount: number | null;
  currency: string;
  stripe_session_id: string | null;
  stripe_payment_intent_id: string | null;
  status: string;
  last_event_type: string | null;
  page_url: string | null;
}

interface AnalyticsCheckout {
  id: string;
  created_at: string;
  event_name: string;
  label: string | null;
  visitor_id: string;
  user_email: string | null;
  metadata: Record<string, unknown> | null;
}

interface BillingStats {
  attempts: number;
  paid: number;
  failed: number;
  expired: number;
  conversionRate: number;
}

export function AdminBillingTab() {
  const [loading, setLoading] = useState(true);
  const [attempts, setAttempts] = useState<CheckoutAttempt[]>([]);
  const [analyticsCheckouts, setAnalyticsCheckouts] = useState<AnalyticsCheckout[]>([]);
  const [period, setPeriod] = useState<"7" | "30">("7");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);

    const [attemptsRes, analyticsRes] = await Promise.all([
      supabase
        .from("checkout_attempts" as any)
        .select("*")
        .order("created_at", { ascending: false })
        .limit(200),
      supabase
        .from("analytics_events" as any)
        .select("id,created_at,event_name,label,visitor_id,user_email,metadata")
        .in("event_name", ["checkout_clicked", "checkout_success", "checkout_fail"])
        .order("created_at", { ascending: false })
        .limit(200),
    ]);

    setAttempts((attemptsRes.data as unknown as CheckoutAttempt[]) || []);
    setAnalyticsCheckouts((analyticsRes.data as unknown as AnalyticsCheckout[]) || []);
    setLoading(false);
  };

  const stats = useMemo((): BillingStats => {
    const cutoff = subDays(new Date(), parseInt(period)).toISOString();
    const inPeriod = attempts.filter(a => a.created_at >= cutoff);
    const paid = inPeriod.filter(a => a.status === "paid").length;
    const failed = inPeriod.filter(a => a.status === "failed").length;
    const expired = inPeriod.filter(a => a.status === "expired").length;
    return {
      attempts: inPeriod.length,
      paid,
      failed,
      expired,
      conversionRate: inPeriod.length > 0 ? Math.round((paid / inPeriod.length) * 100) : 0,
    };
  }, [attempts, period]);

  const analyticsStats = useMemo(() => {
    const cutoff = subDays(new Date(), parseInt(period)).toISOString();
    const inPeriod = analyticsCheckouts.filter(a => a.created_at >= cutoff);
    return {
      clicks: inPeriod.filter(a => a.event_name === "checkout_clicked").length,
      successes: inPeriod.filter(a => a.event_name === "checkout_success").length,
      failures: inPeriod.filter(a => a.event_name === "checkout_fail").length,
    };
  }, [analyticsCheckouts, period]);

  const statusBadge = (status: string) => {
    switch (status) {
      case "paid": return <Badge className="bg-primary/15 text-primary border-primary/30">Paid</Badge>;
      case "failed": return <Badge variant="destructive">Failed</Badge>;
      case "expired": return <Badge variant="secondary">Expired</Badge>;
      case "created": return <Badge variant="outline"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
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
      {/* Period selector */}
      <div className="flex items-center gap-3">
        <span className="text-sm text-muted-foreground">Period:</span>
        <Select value={period} onValueChange={(v) => setPeriod(v as "7" | "30")}>
          <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Last 7 days</SelectItem>
            <SelectItem value="30">Last 30 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats cards – Stripe webhook data */}
      <div className="grid gap-4 md:grid-cols-5">
        <StatCard title="Attempts" value={stats.attempts} icon={<CreditCard className="h-4 w-4 text-muted-foreground" />} />
        <StatCard title="Paid" value={stats.paid} icon={<CheckCircle2 className="h-4 w-4 text-primary" />} />
        <StatCard title="Failed" value={stats.failed} icon={<AlertTriangle className="h-4 w-4 text-destructive" />} />
        <StatCard title="Expired" value={stats.expired} icon={<Clock className="h-4 w-4 text-muted-foreground" />} />
        <StatCard title="Conversion" value={`${stats.conversionRate}%`} icon={<TrendingUp className="h-4 w-4 text-muted-foreground" />} />
      </div>

      {/* Analytics-sourced checkout funnel */}
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard title="Checkout Clicks" value={analyticsStats.clicks} icon={<CreditCard className="h-4 w-4 text-muted-foreground" />} subtitle="From analytics" />
        <StatCard title="Successes" value={analyticsStats.successes} icon={<CheckCircle2 className="h-4 w-4 text-primary" />} subtitle="From analytics" />
        <StatCard title="Failures" value={analyticsStats.failures} icon={<AlertTriangle className="h-4 w-4 text-destructive" />} subtitle="From analytics" />
      </div>

      {/* Attempts table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Recent Checkout Attempts
          </CardTitle>
          <CardDescription>Last 50 checkout attempts (Stripe webhook data)</CardDescription>
        </CardHeader>
        <CardContent>
          <CheckoutTable attempts={attempts.slice(0, 50)} statusBadge={statusBadge} />
        </CardContent>
      </Card>
    </div>
  );
}

// ── Sub-components ──────────────────────────────────────────────────────────

function StatCard({ title, value, icon, subtitle }: { title: string; value: number | string; icon: React.ReactNode; subtitle?: string }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
      </CardContent>
    </Card>
  );
}

function CheckoutTable({ attempts, statusBadge }: { attempts: CheckoutAttempt[]; statusBadge: (s: string) => React.ReactNode }) {
  return (
    <div className="rounded-md border overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Product</TableHead>
            <TableHead>User / Session</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Stripe Session</TableHead>
            <TableHead>Last Event</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {attempts.map((a) => (
            <TableRow key={a.id}>
              <TableCell className="text-sm whitespace-nowrap">
                {format(new Date(a.created_at), "MMM d, HH:mm")}
              </TableCell>
              <TableCell>{statusBadge(a.status)}</TableCell>
              <TableCell>
                <Badge variant="outline" className="font-mono text-xs">{a.product_sku}</Badge>
              </TableCell>
              <TableCell className="text-sm">
                {a.user_email || (a.anonymous_session_id ? `anon:${a.anonymous_session_id.slice(0, 8)}` : "—")}
              </TableCell>
              <TableCell className="text-sm">
                {a.amount != null ? `$${(a.amount / 100).toFixed(2)}` : "—"}
              </TableCell>
              <TableCell className="font-mono text-xs max-w-[140px] truncate">
                {a.stripe_session_id ? a.stripe_session_id.slice(0, 20) + "…" : "—"}
              </TableCell>
              <TableCell className="text-xs text-muted-foreground">
                {a.last_event_type || "—"}
              </TableCell>
            </TableRow>
          ))}
          {attempts.length === 0 && (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                No checkout attempts recorded yet.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
