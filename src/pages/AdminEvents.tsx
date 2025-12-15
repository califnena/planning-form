import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { format, parseISO } from "date-fns";
import { Plus, Pencil, Trash2, Eye, EyeOff, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { GlobalHeader } from "@/components/GlobalHeader";
import { AdminBanner } from "@/components/AdminBanner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { EventFormDialog } from "@/components/events/EventFormDialog";
import { useAdminStatus } from "@/hooks/useAdminStatus";

interface EfaEvent {
  id: string;
  name: string;
  category: string;
  event_date_start: string;
  event_date_end: string | null;
  time_text: string | null;
  venue: string | null;
  city: string | null;
  county: string | null;
  state: string | null;
  is_vendor_friendly: boolean;
  booth_fee: string | null;
  booth_deadline: string | null;
  is_published: boolean;
  created_at: string;
}

const AdminEvents = () => {
  const navigate = useNavigate();
  const { isAdmin, isLoading: adminLoading } = useAdminStatus();
  const [events, setEvents] = useState<EfaEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<EfaEvent | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<EfaEvent | null>(null);

  useEffect(() => {
    if (!adminLoading && !isAdmin) {
      navigate("/dashboard");
    }
  }, [isAdmin, adminLoading, navigate]);

  useEffect(() => {
    if (isAdmin) {
      fetchEvents();
    }
  }, [isAdmin]);

  const fetchEvents = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("efa_events")
      .select("*")
      .order("event_date_start", { ascending: true });

    if (!error && data) {
      setEvents(data as EfaEvent[]);
    }
    setLoading(false);
  };

  const togglePublished = async (event: EfaEvent) => {
    const { error } = await supabase
      .from("efa_events")
      .update({ is_published: !event.is_published })
      .eq("id", event.id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update event status",
        variant: "destructive"
      });
    } else {
      setEvents(events.map(e => 
        e.id === event.id ? { ...e, is_published: !e.is_published } : e
      ));
      toast({
        title: "Success",
        description: `Event ${!event.is_published ? "published" : "unpublished"}`
      });
    }
  };

  const toggleVendorFriendly = async (event: EfaEvent) => {
    const { error } = await supabase
      .from("efa_events")
      .update({ is_vendor_friendly: !event.is_vendor_friendly })
      .eq("id", event.id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update vendor status",
        variant: "destructive"
      });
    } else {
      setEvents(events.map(e => 
        e.id === event.id ? { ...e, is_vendor_friendly: !e.is_vendor_friendly } : e
      ));
    }
  };

  const handleDelete = async () => {
    if (!eventToDelete) return;

    const { error } = await supabase
      .from("efa_events")
      .delete()
      .eq("id", eventToDelete.id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete event",
        variant: "destructive"
      });
    } else {
      setEvents(events.filter(e => e.id !== eventToDelete.id));
      toast({
        title: "Success",
        description: "Event deleted successfully"
      });
    }
    setDeleteDialogOpen(false);
    setEventToDelete(null);
  };

  const handleEdit = (event: EfaEvent) => {
    setEditingEvent(event);
    setFormDialogOpen(true);
  };

  const handleFormClose = () => {
    setFormDialogOpen(false);
    setEditingEvent(null);
    fetchEvents();
  };

  if (adminLoading || !isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <AdminBanner />
      <GlobalHeader />
      
      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Manage Events</h1>
            <p className="text-muted-foreground">Add, edit, and manage community events</p>
          </div>
          <Button onClick={() => setFormDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Event
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Events ({events.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">Loading events...</div>
            ) : events.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No events yet. Click "Add Event" to create one.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Event</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Published</TableHead>
                      <TableHead>Vendor-friendly</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {events.map((event) => (
                      <TableRow key={event.id}>
                        <TableCell>
                          <div className="font-medium">{event.name}</div>
                          {event.venue && (
                            <div className="text-sm text-muted-foreground">{event.venue}</div>
                          )}
                        </TableCell>
                        <TableCell>
                          {format(parseISO(event.event_date_start), "MMM d, yyyy")}
                          {event.time_text && (
                            <div className="text-sm text-muted-foreground">{event.time_text}</div>
                          )}
                        </TableCell>
                        <TableCell>
                          {[event.city, event.county, event.state].filter(Boolean).join(", ") || "-"}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{event.category}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={event.is_published}
                              onCheckedChange={() => togglePublished(event)}
                            />
                            {event.is_published ? (
                              <Eye className="h-4 w-4 text-green-600" />
                            ) : (
                              <EyeOff className="h-4 w-4 text-muted-foreground" />
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={event.is_vendor_friendly}
                              onCheckedChange={() => toggleVendorFriendly(event)}
                            />
                            {event.is_vendor_friendly && (
                              <Users className="h-4 w-4 text-green-600" />
                            )}
                          </div>
                          {event.is_vendor_friendly && event.booth_fee && (
                            <div className="text-xs text-muted-foreground mt-1">
                              {event.booth_fee}
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(event)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setEventToDelete(event);
                                setDeleteDialogOpen(true);
                              }}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      <EventFormDialog
        open={formDialogOpen}
        onOpenChange={handleFormClose}
        event={editingEvent as any}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Event</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{eventToDelete?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminEvents;
