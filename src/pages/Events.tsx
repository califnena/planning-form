import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { format, parseISO, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday } from "date-fns";
import { Calendar as CalendarIcon, List, Search, MapPin, DollarSign, Users, ChevronLeft, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { GlobalHeader } from "@/components/GlobalHeader";
import { AppFooter } from "@/components/AppFooter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { EventLeadDialog } from "@/components/events/EventLeadDialog";

interface EfaEvent {
  id: string;
  name: string;
  category: string;
  event_date_start: string;
  event_date_end: string | null;
  time_text: string | null;
  venue: string | null;
  address: string | null;
  city: string | null;
  county: string | null;
  state: string | null;
  zip: string | null;
  description: string | null;
  cost_attendee: string | null;
  is_vendor_friendly: boolean;
  booth_fee: string | null;
  booth_deadline: string | null;
  exhibitor_link: string | null;
  event_link: string | null;
  organizer_name: string | null;
  organizer_email: string | null;
  organizer_phone: string | null;
  tags: string[] | null;
  list_summary: string | null;
}

const CATEGORIES = [
  "All",
  "Senior Expo",
  "Estate Planning",
  "Probate",
  "Grief Support",
  "Hospice",
  "Funeral Industry",
  "Caregiver",
  "Other"
];

const COUNTIES = [
  "All",
  "Hillsborough",
  "Pinellas",
  "Pasco",
  "Manatee",
  "Polk",
  "Sarasota"
];

const Events = () => {
  const { t } = useTranslation();
  const [events, setEvents] = useState<EfaEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"list" | "calendar">("list");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedCounty, setSelectedCounty] = useState("All");
  const [selectedState, setSelectedState] = useState("FL");
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState<EfaEvent | null>(null);
  const [leadDialogOpen, setLeadDialogOpen] = useState(false);
  const [leadType, setLeadType] = useState<"Planning Help" | "Vendor Interest" | "Reminders">("Planning Help");

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("efa_events")
      .select("*")
      .eq("is_published", true)
      .order("event_date_start", { ascending: true });

    if (!error && data) {
      setEvents(data as EfaEvent[]);
    }
    setLoading(false);
  };

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || event.category === selectedCategory;
    const matchesCounty = selectedCounty === "All" || event.county === selectedCounty;
    const matchesState = !selectedState || event.state === selectedState;
    return matchesSearch && matchesCategory && matchesCounty && matchesState;
  });

  const openLeadDialog = (event: EfaEvent, type: "Planning Help" | "Vendor Interest" | "Reminders") => {
    setSelectedEvent(event);
    setLeadType(type);
    setLeadDialogOpen(true);
  };

  const getDaysInMonth = () => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    return eachDayOfInterval({ start, end });
  };

  const getEventsForDay = (day: Date) => {
    return filteredEvents.filter(event => 
      isSameDay(parseISO(event.event_date_start), day)
    );
  };

  const renderEventCard = (event: EfaEvent) => (
    <Card key={event.id} className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start gap-2">
          <CardTitle className="text-lg">{event.name}</CardTitle>
          <div className="flex gap-1 flex-wrap">
            <Badge variant="secondary">{event.category}</Badge>
            {event.is_vendor_friendly && (
              <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                Vendor-friendly
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <CalendarIcon className="h-4 w-4" />
          <span>
            {format(parseISO(event.event_date_start), "MMMM d, yyyy")}
            {event.time_text && ` • ${event.time_text}`}
          </span>
        </div>
        
        {(event.city || event.county || event.state) && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span>
              {[event.city, event.county, event.state].filter(Boolean).join(", ")}
            </span>
          </div>
        )}

        {event.venue && (
          <p className="text-sm text-muted-foreground">{event.venue}</p>
        )}

        {event.cost_attendee && (
          <div className="flex items-center gap-2 text-sm">
            <DollarSign className="h-4 w-4" />
            <span>{event.cost_attendee}</span>
          </div>
        )}

        {(event.list_summary || event.description) && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {event.list_summary || (event.description?.substring(0, 120) + (event.description && event.description.length > 120 ? "..." : ""))}
          </p>
        )}

        <div className="flex flex-wrap gap-2 pt-2">
          <Button 
            size="sm" 
            onClick={() => openLeadDialog(event, "Planning Help")}
          >
            Get Planning Help
          </Button>
          {event.is_vendor_friendly && (
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => openLeadDialog(event, "Vendor Interest")}
            >
              <Users className="h-4 w-4 mr-1" />
              Vendor / Sponsor Inquiry
            </Button>
          )}
          <Button 
            size="sm" 
            variant="ghost"
            onClick={() => openLeadDialog(event, "Reminders")}
          >
            Remind Me
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const renderCalendarView = () => {
    const days = getDaysInMonth();
    const firstDayOfMonth = startOfMonth(currentMonth);
    const startingDayOfWeek = firstDayOfMonth.getDay();

    return (
      <div className="bg-card rounded-lg border p-4">
        <div className="flex justify-between items-center mb-4">
          <Button variant="ghost" size="sm" onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() - 1)))}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h3 className="font-semibold">{format(currentMonth, "MMMM yyyy")}</h3>
          <Button variant="ghost" size="sm" onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() + 1)))}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="grid grid-cols-7 gap-1 mb-2">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
            <div key={day} className="text-center text-sm font-medium text-muted-foreground p-2">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: startingDayOfWeek }).map((_, i) => (
            <div key={`empty-${i}`} className="p-2" />
          ))}
          {days.map(day => {
            const dayEvents = getEventsForDay(day);
            return (
              <div
                key={day.toISOString()}
                className={`min-h-[80px] p-1 border rounded ${
                  isToday(day) ? "bg-primary/10 border-primary" : ""
                } ${!isSameMonth(day, currentMonth) ? "bg-muted/50" : ""}`}
              >
                <div className="text-sm font-medium mb-1">{format(day, "d")}</div>
                <div className="space-y-1">
                  {dayEvents.slice(0, 2).map(event => (
                    <div
                      key={event.id}
                      className="text-xs p-1 bg-primary/20 rounded cursor-pointer hover:bg-primary/30 truncate"
                      onClick={() => setSelectedEvent(event)}
                    >
                      {event.name}
                    </div>
                  ))}
                  {dayEvents.length > 2 && (
                    <div className="text-xs text-muted-foreground">
                      +{dayEvents.length - 2} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <GlobalHeader />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Events</h1>
          <p className="text-muted-foreground">
            Discover senior expos, estate planning workshops, grief support groups, and more in your area.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex gap-2">
            <Button
              variant={viewMode === "list" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("list")}
            >
              <List className="h-4 w-4 mr-1" />
              List
            </Button>
            <Button
              variant={viewMode === "calendar" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("calendar")}
            >
              <CalendarIcon className="h-4 w-4 mr-1" />
              Calendar
            </Button>
          </div>

          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search events..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map(cat => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedCounty} onValueChange={setSelectedCounty}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="County" />
            </SelectTrigger>
            <SelectContent>
              {COUNTIES.map(county => (
                <SelectItem key={county} value={county}>{county}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Results */}
        {loading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map(i => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-3/4" />
                </CardHeader>
                <CardContent className="space-y-2">
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-4 w-1/3" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : viewMode === "list" ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredEvents.length > 0 ? (
              filteredEvents.map(renderEventCard)
            ) : (
              <div className="col-span-full text-center py-12 text-muted-foreground">
                No events found matching your criteria.
              </div>
            )}
          </div>
        ) : (
          renderCalendarView()
        )}

        {/* Event Detail Modal */}
        {selectedEvent && !leadDialogOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-2xl">{selectedEvent.name}</CardTitle>
                    <div className="flex gap-2 mt-2">
                      <Badge variant="secondary">{selectedEvent.category}</Badge>
                      {selectedEvent.is_vendor_friendly && (
                        <Badge className="bg-green-100 text-green-800">Vendor-friendly</Badge>
                      )}
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setSelectedEvent(null)}>
                    ✕
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <h4 className="font-semibold mb-1">Date & Time</h4>
                    <p className="text-muted-foreground">
                      {format(parseISO(selectedEvent.event_date_start), "EEEE, MMMM d, yyyy")}
                      {selectedEvent.time_text && <><br />{selectedEvent.time_text}</>}
                    </p>
                  </div>
                  
                  {selectedEvent.venue && (
                    <div>
                      <h4 className="font-semibold mb-1">Venue</h4>
                      <p className="text-muted-foreground">{selectedEvent.venue}</p>
                    </div>
                  )}

                  {(selectedEvent.address || selectedEvent.city) && (
                    <div>
                      <h4 className="font-semibold mb-1">Location</h4>
                      <p className="text-muted-foreground">
                        {selectedEvent.address && <>{selectedEvent.address}<br /></>}
                        {[selectedEvent.city, selectedEvent.county, selectedEvent.state, selectedEvent.zip]
                          .filter(Boolean)
                          .join(", ")}
                      </p>
                    </div>
                  )}

                  {selectedEvent.cost_attendee && (
                    <div>
                      <h4 className="font-semibold mb-1">Cost</h4>
                      <p className="text-muted-foreground">{selectedEvent.cost_attendee}</p>
                    </div>
                  )}
                </div>

                {selectedEvent.description && (
                  <div>
                    <h4 className="font-semibold mb-1">Description</h4>
                    <p className="text-muted-foreground">{selectedEvent.description}</p>
                  </div>
                )}

                {selectedEvent.is_vendor_friendly && selectedEvent.booth_fee && (
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <h4 className="font-semibold mb-2 text-green-800 dark:text-green-200">Vendor Information</h4>
                    <p className="text-sm text-green-700 dark:text-green-300">
                      Booth Fee: {selectedEvent.booth_fee}
                      {selectedEvent.booth_deadline && (
                        <><br />Deadline: {format(parseISO(selectedEvent.booth_deadline), "MMMM d, yyyy")}</>
                      )}
                    </p>
                  </div>
                )}

                <div className="flex flex-wrap gap-3 pt-4 border-t">
                  <Button onClick={() => openLeadDialog(selectedEvent, "Planning Help")}>
                    Get Planning Help
                  </Button>
                  {selectedEvent.is_vendor_friendly && (
                    <Button variant="outline" onClick={() => openLeadDialog(selectedEvent, "Vendor Interest")}>
                      <Users className="h-4 w-4 mr-1" />
                      Vendor / Sponsor Inquiry
                    </Button>
                  )}
                  <Button variant="ghost" onClick={() => openLeadDialog(selectedEvent, "Reminders")}>
                    Remind Me of Similar Events
                  </Button>
                  {selectedEvent.event_link && (
                    <Button variant="link" asChild>
                      <a href={selectedEvent.event_link} target="_blank" rel="noopener noreferrer">
                        Event Website →
                      </a>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>

      <EventLeadDialog
        open={leadDialogOpen}
        onOpenChange={setLeadDialogOpen}
        event={selectedEvent}
        leadType={leadType}
      />

      <AppFooter />
    </div>
  );
};

export default Events;
