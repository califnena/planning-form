import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Sparkles, ChevronDown, Loader2 } from "lucide-react";

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
  is_published: boolean;
  org_id: string | null;
  list_summary?: string | null;
  email_subject?: string | null;
  email_preview?: string | null;
  email_body?: string | null;
}

interface EventContact {
  id: string;
  event_id: string;
  org_id: string | null;
  organizer_name: string | null;
  organizer_email: string | null;
  organizer_phone: string | null;
  contact_url: string | null;
}

interface EventFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event: EfaEvent | null;
}

const CATEGORIES = [
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
  "Hillsborough",
  "Pinellas",
  "Pasco",
  "Manatee",
  "Polk",
  "Sarasota"
];

const initialFormState = {
  name: "",
  category: "Senior Expo",
  event_date_start: "",
  event_date_end: "",
  time_text: "",
  venue: "",
  address: "",
  city: "",
  county: "",
  state: "FL",
  zip: "",
  description: "",
  cost_attendee: "",
  is_vendor_friendly: false,
  booth_fee: "",
  booth_deadline: "",
  exhibitor_link: "",
  event_link: "",
  organizer_name: "",
  is_published: true,
  list_summary: "",
  email_subject: "",
  email_preview: "",
  email_body: "",
  // Contact fields (stored separately in efa_event_contacts)
  organizer_email: "",
  organizer_phone: "",
  contact_url: ""
};

export const EventFormDialog = ({ open, onOpenChange, event }: EventFormDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState(initialFormState);
  const [generatingList, setGeneratingList] = useState(false);
  const [generatingDetail, setGeneratingDetail] = useState(false);
  const [generatingEmail, setGeneratingEmail] = useState(false);
  const [emailOpen, setEmailOpen] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      if (event) {
        // Load base event data
        const baseFormData = {
          name: event.name,
          category: event.category,
          event_date_start: event.event_date_start ? event.event_date_start.split("T")[0] : "",
          event_date_end: event.event_date_end ? event.event_date_end.split("T")[0] : "",
          time_text: event.time_text || "",
          venue: event.venue || "",
          address: event.address || "",
          city: event.city || "",
          county: event.county || "",
          state: event.state || "FL",
          zip: event.zip || "",
          description: event.description || "",
          cost_attendee: event.cost_attendee || "",
          is_vendor_friendly: event.is_vendor_friendly,
          booth_fee: event.booth_fee || "",
          booth_deadline: event.booth_deadline || "",
          exhibitor_link: event.exhibitor_link || "",
          event_link: event.event_link || "",
          organizer_name: event.organizer_name || "",
          is_published: event.is_published,
          list_summary: event.list_summary || "",
          email_subject: event.email_subject || "",
          email_preview: event.email_preview || "",
          email_body: event.email_body || "",
          organizer_email: "",
          organizer_phone: "",
          contact_url: ""
        };

        // Load contact data from efa_event_contacts (admin only)
        const { data: contactData } = await supabase
          .from("efa_event_contacts")
          .select("*")
          .eq("event_id", event.id)
          .maybeSingle();

        if (contactData) {
          baseFormData.organizer_email = contactData.organizer_email || "";
          baseFormData.organizer_phone = contactData.organizer_phone || "";
          baseFormData.contact_url = contactData.contact_url || "";
        }

        setFormData(baseFormData);
      } else {
        setFormData(initialFormState);
      }
    };
    
    if (open) {
      loadData();
    }
  }, [event, open]);

  const validateForAI = () => {
    const missing: string[] = [];
    if (!formData.name) missing.push("Event Name");
    if (!formData.category) missing.push("Category");
    if (!formData.event_date_start) missing.push("Start Date");
    if (!formData.city && !formData.state) missing.push("City or State");
    
    if (missing.length > 0) {
      toast({
        title: "Missing Required Fields",
        description: `Please fill in: ${missing.join(", ")}`,
        variant: "destructive"
      });
      return false;
    }
    return true;
  };

  const generateContent = async (type: "list" | "detail" | "email") => {
    if (!validateForAI()) return;

    const setLoading = type === "list" ? setGeneratingList : type === "detail" ? setGeneratingDetail : setGeneratingEmail;
    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("generate-event-content", {
        body: {
          type,
          event: {
            name: formData.name,
            category: formData.category,
            event_date_start: formData.event_date_start,
            event_date_end: formData.event_date_end || undefined,
            time_text: formData.time_text || undefined,
            venue: formData.venue || undefined,
            address: formData.address || undefined,
            city: formData.city || undefined,
            county: formData.county || undefined,
            state: formData.state || undefined,
            zip: formData.zip || undefined,
            cost_attendee: formData.cost_attendee || undefined,
            is_vendor_friendly: formData.is_vendor_friendly,
            booth_fee: formData.booth_fee || undefined,
            booth_deadline: formData.booth_deadline || undefined,
            exhibitor_link: formData.exhibitor_link || undefined,
            event_link: formData.event_link || undefined,
            organizer_name: formData.organizer_name || undefined,
            organizer_email: formData.organizer_email || undefined,
            organizer_phone: formData.organizer_phone || undefined
          }
        }
      });

      if (error) throw error;

      if (type === "list" && data?.content) {
        setFormData(prev => ({ ...prev, list_summary: data.content }));
        toast({ title: "List Summary Generated" });
      } else if (type === "detail" && data?.content) {
        if (formData.description && formData.description.trim()) {
          // Ask user if they want to replace or append
          const shouldReplace = window.confirm("Description already has content. Replace it? (Cancel to append)");
          if (shouldReplace) {
            setFormData(prev => ({ ...prev, description: data.content }));
          } else {
            setFormData(prev => ({ ...prev, description: prev.description + "\n\n" + data.content }));
          }
        } else {
          setFormData(prev => ({ ...prev, description: data.content }));
        }
        toast({ title: "Description Generated" });
      } else if (type === "email") {
        setFormData(prev => ({
          ...prev,
          email_subject: data.email_subject || "",
          email_preview: data.email_preview || "",
          email_body: data.email_body || ""
        }));
        setEmailOpen(true);
        toast({ title: "Email Reminder Generated" });
      }
    } catch (err: any) {
      console.error("Generation error:", err);
      toast({
        title: "Generation Failed",
        description: err.message || "Could not generate content",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const eventData = {
      name: formData.name,
      category: formData.category,
      event_date_start: formData.event_date_start ? new Date(formData.event_date_start).toISOString() : null,
      event_date_end: formData.event_date_end ? new Date(formData.event_date_end).toISOString() : null,
      time_text: formData.time_text || null,
      venue: formData.venue || null,
      address: formData.address || null,
      city: formData.city || null,
      county: formData.county || null,
      state: formData.state || null,
      zip: formData.zip || null,
      description: formData.description || null,
      cost_attendee: formData.cost_attendee || null,
      is_vendor_friendly: formData.is_vendor_friendly,
      booth_fee: formData.booth_fee || null,
      booth_deadline: formData.booth_deadline || null,
      exhibitor_link: formData.exhibitor_link || null,
      event_link: formData.event_link || null,
      organizer_name: formData.organizer_name || null,
      is_published: formData.is_published,
      list_summary: formData.list_summary || null,
      email_subject: formData.email_subject || null,
      email_preview: formData.email_preview || null,
      email_body: formData.email_body || null
    };

    let error;
    let eventId = event?.id;
    
    if (event) {
      const result = await supabase
        .from("efa_events")
        .update(eventData)
        .eq("id", event.id);
      error = result.error;
    } else {
      const result = await supabase
        .from("efa_events")
        .insert(eventData)
        .select("id")
        .single();
      error = result.error;
      if (result.data) {
        eventId = result.data.id;
      }
    }

    // Save contact data to efa_event_contacts (upsert)
    if (!error && eventId) {
      const contactData = {
        event_id: eventId,
        organizer_name: formData.organizer_name || null,
        organizer_email: formData.organizer_email || null,
        organizer_phone: formData.organizer_phone || null,
        contact_url: formData.contact_url || null
      };

      const { error: contactError } = await supabase
        .from("efa_event_contacts")
        .upsert(contactData, { onConflict: "event_id" });

      if (contactError) {
        console.error("Failed to save contact data:", contactError);
      }
    }

    setLoading(false);

    if (error) {
      toast({
        title: "Error",
        description: `Failed to ${event ? "update" : "create"} event: ${error.message}`,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Success",
        description: `Event ${event ? "updated" : "created"} successfully`
      });
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>{event ? "Edit Event" : "Add New Event"}</DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-100px)] pr-4">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Info */}
            <div className="space-y-4">
              <h3 className="font-semibold border-b pb-2">Basic Information</h3>
              
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="name">Event Name *</Label>
                  <Input
                    id="name"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Event name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map(cat => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cost_attendee">Cost for Attendees</Label>
                  <Input
                    id="cost_attendee"
                    value={formData.cost_attendee}
                    onChange={(e) => setFormData({ ...formData, cost_attendee: e.target.value })}
                    placeholder="e.g., Free, $10, Varies"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Event description..."
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="list_summary">List Summary <span className="text-muted-foreground text-xs">(for event cards)</span></Label>
                  <span className="text-xs text-muted-foreground">{formData.list_summary.length}/140</span>
                </div>
                <Input
                  id="list_summary"
                  value={formData.list_summary}
                  onChange={(e) => setFormData({ ...formData, list_summary: e.target.value.slice(0, 140) })}
                  placeholder="Short summary for event list cards..."
                  maxLength={140}
                />
              </div>
            </div>

            {/* AI Helpers */}
            <div className="space-y-4 p-4 bg-muted/50 rounded-lg border">
              <h3 className="font-semibold flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                AI Helpers
              </h3>
              <p className="text-sm text-muted-foreground">
                Generate content automatically based on event details. Fill in basic info first.
              </p>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => generateContent("list")}
                  disabled={generatingList}
                >
                  {generatingList ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Sparkles className="h-4 w-4 mr-1" />}
                  Generate List Summary
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => generateContent("detail")}
                  disabled={generatingDetail}
                >
                  {generatingDetail ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Sparkles className="h-4 w-4 mr-1" />}
                  Generate Description
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => generateContent("email")}
                  disabled={generatingEmail}
                >
                  {generatingEmail ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Sparkles className="h-4 w-4 mr-1" />}
                  Generate Email Reminder
                </Button>
              </div>
            </div>

            {/* Email Reminder Fields */}
            <Collapsible open={emailOpen} onOpenChange={setEmailOpen}>
              <CollapsibleTrigger asChild>
                <Button type="button" variant="ghost" className="w-full justify-between">
                  Email Reminder Content
                  <ChevronDown className={`h-4 w-4 transition-transform ${emailOpen ? "rotate-180" : ""}`} />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-4 pt-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="email_subject">Subject Line</Label>
                    <span className="text-xs text-muted-foreground">{formData.email_subject.length}/60</span>
                  </div>
                  <Input
                    id="email_subject"
                    value={formData.email_subject}
                    onChange={(e) => setFormData({ ...formData, email_subject: e.target.value.slice(0, 60) })}
                    placeholder="Email subject..."
                    maxLength={60}
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="email_preview">Preview Text</Label>
                    <span className="text-xs text-muted-foreground">{formData.email_preview.length}/90</span>
                  </div>
                  <Input
                    id="email_preview"
                    value={formData.email_preview}
                    onChange={(e) => setFormData({ ...formData, email_preview: e.target.value.slice(0, 90) })}
                    placeholder="Email preview text..."
                    maxLength={90}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email_body">Email Body</Label>
                  <Textarea
                    id="email_body"
                    value={formData.email_body}
                    onChange={(e) => setFormData({ ...formData, email_body: e.target.value })}
                    placeholder="Email body content..."
                    rows={6}
                  />
                </div>
              </CollapsibleContent>
            </Collapsible>

            {/* Date & Time */}
            <div className="space-y-4">
              <h3 className="font-semibold border-b pb-2">Date & Time</h3>
              
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="event_date_start">Start Date *</Label>
                  <Input
                    id="event_date_start"
                    type="date"
                    required
                    value={formData.event_date_start}
                    onChange={(e) => setFormData({ ...formData, event_date_start: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="event_date_end">End Date</Label>
                  <Input
                    id="event_date_end"
                    type="date"
                    value={formData.event_date_end}
                    onChange={(e) => setFormData({ ...formData, event_date_end: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="time_text">Time</Label>
                  <Input
                    id="time_text"
                    value={formData.time_text}
                    onChange={(e) => setFormData({ ...formData, time_text: e.target.value })}
                    placeholder="e.g., 10:00 AM – 2:00 PM"
                  />
                </div>
              </div>
            </div>

            {/* Location */}
            <div className="space-y-4">
              <h3 className="font-semibold border-b pb-2">Location</h3>
              
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="venue">Venue Name</Label>
                  <Input
                    id="venue"
                    value={formData.venue}
                    onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                    placeholder="Venue name"
                  />
                </div>

                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Street address"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="City"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="county">County</Label>
                  <Select value={formData.county} onValueChange={(v) => setFormData({ ...formData, county: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select county" />
                    </SelectTrigger>
                    <SelectContent>
                      {COUNTIES.map(county => (
                        <SelectItem key={county} value={county}>{county}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    placeholder="FL"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="zip">ZIP</Label>
                  <Input
                    id="zip"
                    value={formData.zip}
                    onChange={(e) => setFormData({ ...formData, zip: e.target.value })}
                    placeholder="ZIP code"
                  />
                </div>
              </div>
            </div>

            {/* Vendor Info */}
            <div className="space-y-4">
              <h3 className="font-semibold border-b pb-2">Vendor Information</h3>
              
              <div className="flex items-center gap-4">
                <Switch
                  checked={formData.is_vendor_friendly}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_vendor_friendly: checked })}
                />
                <Label>This event is vendor-friendly (allows exhibitors)</Label>
              </div>

              {formData.is_vendor_friendly && (
                <div className="grid gap-4 sm:grid-cols-2 pl-4 border-l-2">
                  <div className="space-y-2">
                    <Label htmlFor="booth_fee">Booth Fee</Label>
                    <Input
                      id="booth_fee"
                      value={formData.booth_fee}
                      onChange={(e) => setFormData({ ...formData, booth_fee: e.target.value })}
                      placeholder="e.g., $395 starting"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="booth_deadline">Booth Registration Deadline</Label>
                    <Input
                      id="booth_deadline"
                      type="date"
                      value={formData.booth_deadline}
                      onChange={(e) => setFormData({ ...formData, booth_deadline: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="exhibitor_link">Exhibitor Registration Link</Label>
                    <Input
                      id="exhibitor_link"
                      type="url"
                      value={formData.exhibitor_link}
                      onChange={(e) => setFormData({ ...formData, exhibitor_link: e.target.value })}
                      placeholder="https://..."
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Organizer & Links */}
            <div className="space-y-4">
              <h3 className="font-semibold border-b pb-2">Organizer & Links</h3>
              
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="organizer_name">Organizer Name</Label>
                  <Input
                    id="organizer_name"
                    value={formData.organizer_name}
                    onChange={(e) => setFormData({ ...formData, organizer_name: e.target.value })}
                    placeholder="Organizer name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="organizer_email">Organizer Email <span className="text-muted-foreground text-xs">(Admin only)</span></Label>
                  <Input
                    id="organizer_email"
                    type="email"
                    value={formData.organizer_email}
                    onChange={(e) => setFormData({ ...formData, organizer_email: e.target.value })}
                    placeholder="email@example.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="organizer_phone">Organizer Phone <span className="text-muted-foreground text-xs">(Admin only)</span></Label>
                  <Input
                    id="organizer_phone"
                    type="tel"
                    value={formData.organizer_phone}
                    onChange={(e) => setFormData({ ...formData, organizer_phone: e.target.value })}
                    placeholder="(555) 123-4567"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contact_url">Public Contact URL <span className="text-muted-foreground text-xs">(Shown to users)</span></Label>
                  <Input
                    id="contact_url"
                    type="url"
                    value={formData.contact_url}
                    onChange={(e) => setFormData({ ...formData, contact_url: e.target.value })}
                    placeholder="https://organizer-website.com/contact"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="event_link">Event Website</Label>
                  <Input
                    id="event_link"
                    type="url"
                    value={formData.event_link}
                    onChange={(e) => setFormData({ ...formData, event_link: e.target.value })}
                    placeholder="https://..."
                  />
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Note: Organizer email and phone are visible only to admins. Use "Public Contact URL" to provide a way for public users to contact the organizer.
              </p>
            </div>

            {/* Publishing */}
            <div className="space-y-4">
              <h3 className="font-semibold border-b pb-2">Publishing</h3>
              
              <div className="flex items-center gap-4">
                <Switch
                  checked={formData.is_published}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_published: checked })}
                />
                <Label>Published (visible to public)</Label>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Saving..." : (event ? "Update Event" : "Create Event")}
              </Button>
            </div>
          </form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
