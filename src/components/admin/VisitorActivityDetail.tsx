import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft, Eye, MousePointer, FileDown, ShoppingCart, CheckCircle, XCircle, MessageSquare } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

interface Props {
  visitorId: string;
  onBack: () => void;
}

interface Row {
  id: string;
  created_at: string;
  event_type: string;
  page_path: string | null;
  section: string | null;
  label: string | null;
  value: Record<string, unknown> | null;
}

export function VisitorActivityDetail({ visitorId, onBack }: Props) {
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<Row[]>([]);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("activity_events" as any)
        .select("id,created_at,event_type,page_path,section,label,value")
        .eq("visitor_id", visitorId)
        .order("created_at", { ascending: false })
        .limit(50);
      setEvents((data as unknown as Row[]) || []);
      setLoading(false);
    })();
  }, [visitorId]);

  const iconFor = (t: string) => {
    if (t.includes("page_view")) return <Eye className="h-3 w-3" />;
    if (t.includes("mode_select")) return <MousePointer className="h-3 w-3" />;
    if (t.includes("download")) return <FileDown className="h-3 w-3" />;
    if (t.includes("checkout_start")) return <ShoppingCart className="h-3 w-3" />;
    if (t.includes("checkout_success")) return <CheckCircle className="h-3 w-3 text-green-600" />;
    if (t.includes("checkout_fail")) return <XCircle className="h-3 w-3 text-destructive" />;
    if (t.includes("chat")) return <MessageSquare className="h-3 w-3" />;
    return <MousePointer className="h-3 w-3" />;
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
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <CardTitle className="text-base">
              Visitor {visitorId.slice(0, 8)}… Timeline
            </CardTitle>
            <CardDescription>Last 50 events</CardDescription>
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
                <TableHead>Section</TableHead>
                <TableHead>Label</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {events.map((e) => (
                <TableRow key={e.id}>
                  <TableCell className="text-xs whitespace-nowrap">
                    {format(new Date(e.created_at), "MMM d, HH:mm:ss")}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="font-mono text-xs gap-1">
                      {iconFor(e.event_type)} {e.event_type}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs font-mono max-w-[160px] truncate">
                    {e.page_path || "—"}
                  </TableCell>
                  <TableCell className="text-xs">{e.section || "—"}</TableCell>
                  <TableCell className="text-xs max-w-[120px] truncate">{e.label || "—"}</TableCell>
                </TableRow>
              ))}
              {events.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    No events for this visitor
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
