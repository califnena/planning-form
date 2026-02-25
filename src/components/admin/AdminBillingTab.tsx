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
  const [period, setPeriod] = useState<"7" | "30">("7");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("checkout_attempts" as any)
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200);

    setAttempts((data as unknown as CheckoutAttempt[]) || []);
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

      {/* Stats cards */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Attempts</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{stats.attempts}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Paid</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold text-primary">{stats.paid}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold text-destructive">{stats.failed}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expired</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{stats.expired}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{stats.conversionRate}%</div></CardContent>
        </Card>
      </div>

      {/* Attempts table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Recent Checkout Attempts
          </CardTitle>
          <CardDescription>Last 50 checkout attempts</CardDescription>
        </CardHeader>
        <CardContent>
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
                {attempts.slice(0, 50).map((a) => (
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
        </CardContent>
      </Card>
    </div>
  );
}
