import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { format, parseISO } from "date-fns";
import { Calendar, MapPin, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

interface EfaEvent {
  id: string;
  name: string;
  category: string;
  event_date_start: string;
  time_text: string | null;
  city: string | null;
  county: string | null;
  state: string | null;
  is_vendor_friendly: boolean;
}

export const UpcomingEventsWidget = () => {
  const [events, setEvents] = useState<EfaEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUpcomingEvents();
  }, []);

  const fetchUpcomingEvents = async () => {
    const now = new Date().toISOString();
    const { data, error } = await supabase
      .from("efa_events")
      .select("id, name, category, event_date_start, time_text, city, county, state, is_vendor_friendly")
      .eq("is_published", true)
      .gte("event_date_start", now)
      .order("event_date_start", { ascending: true })
      .limit(3);

    if (!error && data) {
      setEvents(data as EfaEvent[]);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Upcoming Events
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (events.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Upcoming Events
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">No upcoming events at this time.</p>
          <Button variant="link" asChild className="px-0 mt-2">
            <Link to="/events">Browse all events →</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          Upcoming Events
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {events.map(event => (
          <div key={event.id} className="border-b pb-3 last:border-0 last:pb-0">
            <div className="flex justify-between items-start gap-2">
              <h4 className="font-medium text-sm">{event.name}</h4>
              {event.is_vendor_friendly && (
                <Badge variant="secondary" className="text-xs">Vendor</Badge>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
              <Calendar className="h-3 w-3" />
              <span>
                {format(parseISO(event.event_date_start), "MMM d, yyyy")}
                {event.time_text && ` • ${event.time_text}`}
              </span>
            </div>
            {(event.city || event.county) && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                <MapPin className="h-3 w-3" />
                <span>{[event.city, event.county, event.state].filter(Boolean).join(", ")}</span>
              </div>
            )}
          </div>
        ))}
        
        <Button variant="outline" asChild className="w-full mt-2">
          <Link to="/events">
            View All Events
            <ArrowRight className="h-4 w-4 ml-2" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
};
